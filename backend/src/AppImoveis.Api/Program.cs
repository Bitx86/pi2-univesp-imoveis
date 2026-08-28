using AppImoveis.Application.Services;
using AppImoveis.Domain.Entities;
using AppImoveis.Infrastructure.Persistence;
using AppImoveis.Infrastructure.Repositories;
using AppImoveis.Infrastructure.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using System.IO;

var builder = WebApplication.CreateBuilder(args);

// Auto-load .env file from root or backend directory
var candidateEnvPaths = new[]
{
    Path.Combine(Directory.GetCurrentDirectory(), ".env"),
    Path.Combine(Directory.GetCurrentDirectory(), "..", ".env"),
    Path.Combine(Directory.GetCurrentDirectory(), "..", "..", ".env"),
    Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", ".env"),
    @"f:\AppImóveis\.env"
};

foreach (var envPath in candidateEnvPaths)
{
    if (File.Exists(envPath))
    {
        foreach (var line in File.ReadAllLines(envPath))
        {
            var trimmed = line.Trim();
            if (string.IsNullOrEmpty(trimmed) || trimmed.StartsWith("#")) continue;
            var eqIdx = trimmed.IndexOf('=');
            if (eqIdx > 0)
            {
                var key = trimmed.Substring(0, eqIdx).Trim();
                var val = trimmed.Substring(eqIdx + 1).Trim().Trim('"', '\'');
                Environment.SetEnvironmentVariable(key, val);
                builder.Configuration[key] = val;
            }
        }
        break;
    }
}

var connectionString = new[]
{
    Environment.GetEnvironmentVariable("DATABASE_URL"),
    builder.Configuration["DATABASE_URL"],
    builder.Configuration.GetConnectionString("DefaultConnection")
}.FirstOrDefault(value => !string.IsNullOrWhiteSpace(value));

if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException(
        "A conexão do Neon não foi configurada. Defina DATABASE_URL via User Secrets ou variável de ambiente.");
}

var dataSourceBuilder = new NpgsqlDataSourceBuilder(connectionString);
dataSourceBuilder.MapEnum<TipoNegocio>("tipo_negocio");
var dataSource = dataSourceBuilder.Build();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(dataSource, o => o.MapEnum<TipoNegocio>("tipo_negocio")));

builder.Services.AddScoped<BairroRepository>();
builder.Services.AddScoped<ImovelRepository>();
builder.Services.AddHttpClient<GeckoApiIngestService>();

builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
{
    options.AddPolicy("LocalNext", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();



using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    dbContext.Database.EnsureCreated();
}

app.UseCors("LocalNext");

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapGet("/health", () => Results.Ok(new { status = "ok", time = DateTimeOffset.UtcNow }));

app.MapGet("/api/analise/bairro/{bairroId:guid}", async (Guid bairroId, [FromQuery] string tipoNegocio, AppDbContext dbContext, CancellationToken cancellationToken) =>
{
    if (string.IsNullOrWhiteSpace(tipoNegocio))
    {
        return Results.BadRequest(new { message = "tipo_negocio is required" });
    }

    if (!Enum.TryParse<TipoNegocio>(tipoNegocio, true, out var tipo))
    {
        return Results.BadRequest(new { message = "tipo_negocio must be Sale or Rent" });
    }

    var dados = await dbContext.Imoveis
        .AsNoTracking()
        .Where(x => x.BairroId == bairroId && x.TipoNegocio == tipo)
        .ToListAsync(cancellationToken);

    if (dados.Count < 5)
    {
        return Results.Ok(new { status = "insufficient_sample", required_min = 5, bairro_id = bairroId, tipo_negocio = tipo.ToString() });
    }

    var analise = AnaliseImoveisService.CalcularAnalise(dados, tipo);
    return Results.Ok(new
    {
        bairro_id = bairroId,
        tipo_negocio = tipo.ToString(),
        preco_medio = analise.PrecoMedio,
        preco_mediano = analise.PrecoMediano,
        preco_m2_medio = analise.PrecoM2Medio,
        desvio_padrao_amostral = analise.DesvioPadraoAmostral,
        amostra_count = analise.AmostraCount,
        atualizado_em = analise.AtualizadoEm
    });
});

app.MapPost("/api/analise/estimar", async (EstimarPrecoRequest request, AppDbContext dbContext, CancellationToken cancellationToken) =>
{
    if (request.Preco <= 0) return Results.BadRequest(new { message = "preco must be greater than 0" });
    if (request.AreaM2 < 0) return Results.BadRequest(new { message = "area_m2 cannot be negative" });
    if (request.BairroId == Guid.Empty) return Results.BadRequest(new { message = "bairro_id is required" });
    if (!Enum.TryParse<TipoNegocio>(request.TipoNegocio, true, out var tipo)) return Results.BadRequest(new { message = "tipo_negocio must be Sale or Rent" });

    var bairroExiste = await dbContext.Bairros.AsNoTracking().AnyAsync(x => x.Id == request.BairroId, cancellationToken);
    if (!bairroExiste) return Results.NotFound(new { message = "bairro_id not found" });

    var bairroDados = await dbContext.Imoveis
        .AsNoTracking()
        .Where(x => x.BairroId == request.BairroId && x.TipoNegocio == tipo)
        .ToListAsync(cancellationToken);

    if (!bairroDados.Any()) return Results.NotFound(new { message = "bairro_id not found" });

    var analise = AnaliseImoveisService.CalcularAnalise(bairroDados, tipo);
    var deltaPercent = analise.PrecoMedio > 0
        ? ((request.Preco - analise.PrecoMedio) / analise.PrecoMedio) * 100m
        : 0m;

    return Results.Ok(new
    {
        preco_medio = analise.PrecoMedio,
        preco_m2_medio = analise.PrecoM2Medio,
        delta_percent = deltaPercent,
        classificacao = AnaliseImoveisService.ClassificarPreco(request.Preco, analise.PrecoMedio)
    });
});

app.MapGet("/api/imoveis", async ([FromQuery] string? bairro, [FromQuery] string? cidade, [FromQuery] int? quartos, [FromQuery] string? tipoNegocio, [FromQuery] int page = 1, [FromQuery] int pageSize = 20, AppDbContext dbContext = null!) =>
{
    if (pageSize > 200) return Results.BadRequest(new { message = "pageSize must be <= 200" });
    if (page < 1) return Results.BadRequest(new { message = "page must be >= 1" });

    var query = dbContext.Imoveis
        .Include(x => x.Bairro)
        .AsNoTracking()
        .AsQueryable();

    if (!string.IsNullOrWhiteSpace(bairro))
        query = query.Where(x => x.Bairro != null && x.Bairro.Nome.Contains(bairro));

    if (!string.IsNullOrWhiteSpace(cidade))
        query = query.Where(x => x.Bairro != null && x.Bairro.Cidade.Contains(cidade));

    if (!string.IsNullOrWhiteSpace(tipoNegocio) && Enum.TryParse<TipoNegocio>(tipoNegocio, true, out var tipo))
        query = query.Where(x => x.TipoNegocio == tipo);

    if (quartos.HasValue)
        query = query.Where(x => x.Quartos >= quartos.Value);

    var total = await query.CountAsync();
    var items = await query
        .OrderByDescending(x => x.CapturadoEm)
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .ToListAsync();

    return Results.Ok(new { items, total });
});

app.MapGet("/api/imoveis/{id:guid}", async (Guid id, AppDbContext dbContext, CancellationToken cancellationToken) =>
{
    var imovel = await dbContext.Imoveis
        .Include(x => x.Bairro)
        .AsNoTracking()
        .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    if (imovel is null) return Results.NotFound(new { message = "imovel not found" });

    var historico = await dbContext.HistoricoPrecos
        .AsNoTracking()
        .Where(x => x.ImovelId == id)
        .OrderByDescending(x => x.CapturadoEm)
        .Take(10)
        .ToListAsync(cancellationToken);

    return Results.Ok(new
    {
        item = imovel,
        historico
    });
});

app.MapPost("/api/ingest/run", async (IngestRunRequest request, GeckoApiIngestService ingestService, CancellationToken cancellationToken) =>
{
    try
    {
        if (string.IsNullOrWhiteSpace(request.City)) return Results.BadRequest(new { message = "city is required" });
        if (string.IsNullOrWhiteSpace(request.State)) return Results.BadRequest(new { message = "state is required" });
        if (string.IsNullOrWhiteSpace(request.BusinessType)) return Results.BadRequest(new { message = "businessType is required" });

        if (!Enum.TryParse<TipoNegocio>(request.BusinessType, true, out var tipo))
            return Results.BadRequest(new { message = "businessType must be Sale or Rent" });

        var result = await ingestService.RunAsync(
            request.City,
            request.State,
            tipo,
            request.Pages > 0 ? request.Pages : 1,
            request.Keyword,
            cancellationToken);

        return Results.Ok(new
        {
            ingested = result.Ingrested,
            skipped_duplicates = result.SkippedDuplicates,
            errors = result.Errors,
            quota_exhausted = result.QuotaExhausted,
            credits_used = result.CreditsUsed
        });
    }
    catch (InvalidOperationException ex) when (ex.Message == "ingest in progress")
    {
        return Results.Conflict(new { message = "ingest in progress" });
    }
    catch (Exception ex)
    {
        return Results.Problem(statusCode: 500, title: "Ingest failed", detail: ex.Message);
    }
});

app.MapPost("/api/db/reset", async (AppDbContext dbContext, GeckoApiIngestService ingestService, CancellationToken cancellationToken) =>
{
    // Drop and recreate schema cleanly
    await dbContext.Database.EnsureDeletedAsync(cancellationToken);
    await dbContext.Database.EnsureCreatedAsync(cancellationToken);

    // Run fresh seed with PDP data
    var resultSale = await ingestService.RunAsync("Guarulhos", "SP", TipoNegocio.Sale, 1, null, cancellationToken);
    var resultRent = await ingestService.RunAsync("Guarulhos", "SP", TipoNegocio.Rent, 1, null, cancellationToken);

    return Results.Ok(new
    {
        message = "Banco Neon recriado e populado com sucesso!",
        venda_inseridos = resultSale.Ingrested,
        aluguel_inseridos = resultRent.Ingrested,
        total = resultSale.Ingrested + resultRent.Ingrested
    });
});

app.MapPost("/api/seed", async (GeckoApiIngestService ingestService, CancellationToken cancellationToken) =>
{
    var resultSale = await ingestService.RunAsync("Guarulhos", "SP", TipoNegocio.Sale, 2, null, cancellationToken);
    var resultRent = await ingestService.RunAsync("Guarulhos", "SP", TipoNegocio.Rent, 2, null, cancellationToken);

    return Results.Ok(new
    {
        message = "Banco de dados populado com sucesso!",
        venda_inseridos = resultSale.Ingrested,
        aluguel_inseridos = resultRent.Ingrested,
        duplicados = resultSale.SkippedDuplicates + resultRent.SkippedDuplicates,
        total_processados = resultSale.Ingrested + resultRent.Ingrested
    });
});

app.MapGet("/api/images/proxy", async ([FromQuery] string url, IHttpClientFactory httpClientFactory, CancellationToken cancellationToken) =>
{
    if (string.IsNullOrWhiteSpace(url) || !Uri.TryCreate(url, UriKind.Absolute, out var uri))
    {
        return Results.BadRequest("URL inválida.");
    }

    try
    {
        var client = httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
        client.DefaultRequestHeaders.Add("Referer", "https://www.zapimoveis.com.br/");

        var response = await client.GetAsync(uri, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            return Results.StatusCode((int)response.StatusCode);
        }

        var contentType = response.Content.Headers.ContentType?.ToString() ?? "image/webp";
        var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        return Results.Stream(stream, contentType);
    }
    catch (Exception ex)
    {
        return Results.Problem(statusCode: 500, detail: ex.Message);
    }
});

app.Run();

public record EstimarPrecoRequest(decimal Preco, decimal AreaM2, Guid BairroId, string TipoNegocio);
public record IngestRunRequest(string City, string State, string BusinessType, int Pages = 1, string? Keyword = null);
