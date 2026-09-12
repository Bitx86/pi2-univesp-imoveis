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
builder.Services.AddSingleton<GeckoApiKeyPoolManager>();
builder.Services.AddScoped<SmartSearchMatrixEngine>();
builder.Services.AddHttpClient<GeckoApiIngestService>();
builder.Services.AddHttpClient<SspSpCrimeService>();

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

app.MapGet("/api/bairros", async (AppDbContext dbContext, [FromQuery] string? tipoNegocio, CancellationToken cancellationToken) =>
{
    var bairros = await dbContext.Bairros.AsNoTracking().OrderBy(b => b.Nome).ToListAsync(cancellationToken);
    var analises = await dbContext.AnalisesRegiao.AsNoTracking().ToListAsync(cancellationToken);
    var counts = await dbContext.Imoveis
        .AsNoTracking()
        .GroupBy(i => new { i.BairroId, i.TipoNegocio })
        .Select(g => new { g.Key.BairroId, g.Key.TipoNegocio, Count = g.Count() })
        .ToListAsync(cancellationToken);

    var result = bairros.Select(b =>
    {
        var vendaCount = counts.FirstOrDefault(c => c.BairroId == b.Id && c.TipoNegocio == TipoNegocio.Sale)?.Count ?? 0;
        var aluguelCount = counts.FirstOrDefault(c => c.BairroId == b.Id && c.TipoNegocio == TipoNegocio.Rent)?.Count ?? 0;
        var analiseVenda = analises.FirstOrDefault(a => a.BairroId == b.Id && a.TipoNegocio == TipoNegocio.Sale);
        var analiseAluguel = analises.FirstOrDefault(a => a.BairroId == b.Id && a.TipoNegocio == TipoNegocio.Rent);

        return new
        {
            id = b.Id,
            nome = b.Nome,
            cidade = b.Cidade,
            estado = b.Estado,
            total_imoveis_venda = vendaCount,
            total_imoveis_aluguel = aluguelCount,
            total_geral = vendaCount + aluguelCount,
            analise_venda = analiseVenda != null ? new
            {
                preco_medio = analiseVenda.PrecoMedio,
                preco_mediano = analiseVenda.PrecoMediano,
                preco_m2_medio = analiseVenda.PrecoM2Medio,
                desvio_padrao = analiseVenda.DesvioPadraoAmostral,
                amostra_count = analiseVenda.AmostraCount,
                atualizado_em = analiseVenda.AtualizadoEm
            } : null,
            analise_aluguel = analiseAluguel != null ? new
            {
                preco_medio = analiseAluguel.PrecoMedio,
                preco_mediano = analiseAluguel.PrecoMediano,
                preco_m2_medio = analiseAluguel.PrecoM2Medio,
                desvio_padrao = analiseAluguel.DesvioPadraoAmostral,
                amostra_count = analiseAluguel.AmostraCount,
                atualizado_em = analiseAluguel.AtualizadoEm
            } : null
        };
    }).ToList();

    return Results.Ok(result);
});

app.MapGet("/api/analise/regioes", async (AppDbContext dbContext, [FromQuery] string? tipoNegocio, CancellationToken cancellationToken) =>
{
    var query = dbContext.AnalisesRegiao
        .Include(a => a.Bairro)
        .AsNoTracking()
        .AsQueryable();

    if (!string.IsNullOrWhiteSpace(tipoNegocio) && Enum.TryParse<TipoNegocio>(tipoNegocio, true, out var tipo))
    {
        query = query.Where(a => a.TipoNegocio == tipo);
    }

    var analises = await query
        .OrderByDescending(a => a.AmostraCount)
        .ToListAsync(cancellationToken);

    var result = analises.Select(a => new
    {
        bairro_id = a.BairroId,
        bairro_nome = a.Bairro?.Nome ?? "Desconhecido",
        cidade = a.Bairro?.Cidade ?? "Guarulhos",
        tipo_negocio = a.TipoNegocio.ToString(),
        preco_medio = a.PrecoMedio,
        preco_mediano = a.PrecoMediano,
        preco_m2_medio = a.PrecoM2Medio,
        desvio_padrao_amostral = a.DesvioPadraoAmostral,
        amostra_count = a.AmostraCount,
        atualizado_em = a.AtualizadoEm
    });

    return Results.Ok(result);
});

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

    // 1. Direct fetch from precalculated analise_regiao table
    var persisted = await dbContext.AnalisesRegiao
        .Include(a => a.Bairro)
        .AsNoTracking()
        .FirstOrDefaultAsync(a => a.BairroId == bairroId && a.TipoNegocio == tipo, cancellationToken);

    if (persisted != null)
    {
        return Results.Ok(new
        {
            bairro_id = bairroId,
            bairro_nome = persisted.Bairro?.Nome ?? "",
            tipo_negocio = tipo.ToString(),
            preco_medio = persisted.PrecoMedio,
            preco_mediano = persisted.PrecoMediano,
            preco_m2_medio = persisted.PrecoM2Medio,
            desvio_padrao_amostral = persisted.DesvioPadraoAmostral,
            amostra_count = persisted.AmostraCount,
            atualizado_em = persisted.AtualizadoEm,
            fonte = "analise_regiao"
        });
    }

    // 2. Fallback on-the-fly calculation
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
        atualizado_em = analise.AtualizadoEm,
        fonte = "amostral_dinamico"
    });
});

app.MapGet("/api/seguranca/bairros", async (
    [FromQuery] string? cidade,
    [FromQuery] DateOnly? inicio,
    [FromQuery] DateOnly? fim,
    AppDbContext dbContext,
    CancellationToken cancellationToken) =>
{
    var dataFim = fim ?? DateOnly.FromDateTime(DateTime.UtcNow);
    var dataInicio = inicio ?? dataFim.AddYears(-1);
    if (dataInicio > dataFim)
    {
        return Results.BadRequest(new { message = "inicio must be before or equal to fim" });
    }

    var bairrosQuery = dbContext.Bairros.AsNoTracking().AsQueryable();
    if (!string.IsNullOrWhiteSpace(cidade)) bairrosQuery = bairrosQuery.Where(b => b.Cidade == cidade);

    var bairros = await bairrosQuery.OrderBy(b => b.Nome).ToListAsync(cancellationToken);
    var bairroIds = bairros.Select(b => b.Id).ToList();
    var ocorrencias = await dbContext.OcorrenciasCriminais
        .AsNoTracking()
        .Where(o => bairroIds.Contains(o.BairroId) && o.DataOcorrencia >= dataInicio && o.DataOcorrencia <= dataFim)
        .ToListAsync(cancellationToken);
    var analises = MapaViolenciaService.Calcular(bairros, ocorrencias, dataInicio, dataFim);

    return Results.Ok(new
    {
        periodo = new { inicio = dataInicio, fim = dataFim },
        fonte = "SSP-SP",
        dados = analises.Select(a => new
        {
            bairro_id = a.BairroId,
            bairro_nome = a.BairroNome,
            populacao_estimada = a.PopulacaoEstimada,
            total_ocorrencias = a.TotalOcorrencias,
            indice_seguranca = a.IndiceSeguranca,
            nivel = a.Nivel,
            indicadores = a.Indicadores.Select(i => new
            {
                tipo_crime = i.TipoCrime.ToString(),
                ocorrencias = i.Ocorrencias,
                taxa_por_mil = i.TaxaPorMil,
                peso = i.Peso
            }),
            atualizado_em = a.AtualizadoEm
        })
    });
});

app.MapGet("/api/seguranca/guarulhos", async (SspSpCrimeService sspService, CancellationToken cancellationToken) =>
{
    try
    {
        var data = await sspService.GetGuarulhosAsync(cancellationToken);
        return Results.Ok(new
        {
            municipio = "Guarulhos",
            municipio_id_ssp = 215,
            ano = data.Ocorrencias.Ano,
            fonte = "SSP-SP",
            granularidade = "municipio",
            observacao = "Os dados oficiais consultados pela SSP-SP não são distribuídos por bairro nesta consulta.",
            total_ocorrencias_conhecidas = data.Ocorrencias.Homicidio + data.Ocorrencias.Furto + data.Ocorrencias.Roubo + data.Ocorrencias.FurtoERouboVeiculo,
            indicadores = new[]
            {
                new { tipo_crime = "Homicidio", ocorrencias = (int?)data.Ocorrencias.Homicidio, taxa_por_mil = ParseSspDecimal(data.Taxas.Homicidios) },
                new { tipo_crime = "Roubo", ocorrencias = (int?)data.Ocorrencias.Roubo, taxa_por_mil = ParseSspDecimal(data.Taxas.Roubos) },
                new { tipo_crime = "Furto", ocorrencias = (int?)data.Ocorrencias.Furto, taxa_por_mil = ParseSspDecimal(data.Taxas.Furtos) },
                new { tipo_crime = "FurtoVeiculo", ocorrencias = (int?)null, taxa_por_mil = ParseSspDecimal(data.Taxas.FurtosVeiculo) },
                new { tipo_crime = "RouboVeiculo", ocorrencias = (int?)null, taxa_por_mil = ParseSspDecimal(data.Taxas.RoubosVeiculo) }
            }
        });
    }
    catch (HttpRequestException ex)
    {
        return Results.Problem(statusCode: 502, title: "SSP-SP indisponível", detail: ex.Message);
    }
    catch (InvalidOperationException ex)
    {
        return Results.Problem(statusCode: 502, title: "Resposta inválida da SSP-SP", detail: ex.Message);
    }
});

app.MapGet("/api/seguranca/distritos-proximos", async ([FromQuery] int ano, [FromQuery] bool atualizar, SspSpCrimeService sspService, CancellationToken cancellationToken) =>
{
    var currentYear = DateTime.UtcNow.Year;
    if (ano < 2001 || ano > currentYear)
        return Results.BadRequest(new { message = $"ano must be between 2001 and {currentYear}" });

    try
    {
        var districts = await sspService.GetNearbyDistrictsAsync(ano, atualizar, cancellationToken);
        var ranked = districts
            .Select(d => new
            {
                id = d.District.IdDistrito,
                nome = d.District.Sigla,
                municipio = d.Municipality,
                municipio_id_ssp = d.District.IdMunicipio,
                ano = d.Year,
                homicidios = d.Summary.Homicidios,
                roubos = d.Summary.Roubos,
                furtos = d.Summary.Furtos,
                roubos_veiculo = d.Summary.RoubosVeiculo,
                furtos_veiculo = d.Summary.FurtosVeiculo,
                estupros = d.Summary.Estupros,
                total_ocorrencias = d.Summary.Homicidios + d.Summary.Roubos + d.Summary.Furtos + d.Summary.RoubosVeiculo + d.Summary.FurtosVeiculo + d.Summary.Estupros
            })
            .OrderByDescending(d => d.total_ocorrencias)
            .ToList();

        return Results.Ok(new
        {
            fonte = "SSP-SP",
            ano,
            granularidade = "distrito policial",
            observacao = "Inclui todos os distritos policiais de Guarulhos e municípios do entorno selecionados, além de distritos nominais da zona norte/leste de São Paulo. Não inclui delegacias especializadas. A SSP-SP não fornece coordenadas dos distritos nesta consulta.",
            dados = ranked
        });
    }
    catch (HttpRequestException ex)
    {
        return Results.Problem(statusCode: 502, title: "SSP-SP indisponível", detail: ex.Message);
    }
});

app.MapPost("/api/seguranca/ocorrencias", async (
    ImportarOcorrenciaRequest request,
    BairroRepository bairroRepository,
    AppDbContext dbContext,
    CancellationToken cancellationToken) =>
{
    if (string.IsNullOrWhiteSpace(request.Bairro) || string.IsNullOrWhiteSpace(request.Cidade) || string.IsNullOrWhiteSpace(request.Estado))
        return Results.BadRequest(new { message = "bairro, cidade and estado are required" });
    if (!Enum.TryParse<TipoCrime>(request.TipoCrime, true, out var tipoCrime))
        return Results.BadRequest(new { message = "tipo_crime is invalid" });
    if (request.DataOcorrencia > DateOnly.FromDateTime(DateTime.UtcNow))
        return Results.BadRequest(new { message = "data_ocorrencia cannot be in the future" });

    var bairro = await bairroRepository.GetOrCreateAsync(request.Bairro, request.Cidade, request.Estado, cancellationToken);
    if (request.PopulacaoEstimada is > 0) bairro.PopulacaoEstimada = request.PopulacaoEstimada;
    var ocorrencia = new OcorrenciaCriminal
    {
        BairroId = bairro.Id,
        TipoCrime = tipoCrime,
        DataOcorrencia = request.DataOcorrencia,
        Latitude = request.Latitude,
        Longitude = request.Longitude,
        Fonte = string.IsNullOrWhiteSpace(request.Fonte) ? "SSP-SP" : request.Fonte,
        IdentificadorExterno = request.IdentificadorExterno
    };

    dbContext.OcorrenciasCriminais.Add(ocorrencia);
    await dbContext.SaveChangesAsync(cancellationToken);
    return Results.Created($"/api/seguranca/ocorrencias/{ocorrencia.Id}", new { id = ocorrencia.Id, bairro_id = bairro.Id });
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

app.MapGet("/api/seed/status", async (SmartSearchMatrixEngine searchEngine, GeckoApiKeyPoolManager keyPool, CancellationToken cancellationToken) =>
{
    var coverage = await searchEngine.GetDatabaseCoverageAsync(cancellationToken);
    var keys = keyPool.GetPoolStats();

    return Results.Ok(new
    {
        cobertura = coverage,
        keys_status = keys
    });
});

app.MapPost("/api/seed/step", async ([FromQuery] string? tipo, GeckoApiIngestService ingestService, CancellationToken cancellationToken) =>
{
    try
    {
        var stepResult = await ingestService.RunSingleSmartSeedStepAsync(tipo, cancellationToken);
        return Results.Ok(stepResult);
    }
    catch (InvalidOperationException ex) when (ex.Message == "ingest in progress")
    {
        return Results.Conflict(new { message = "Um processo de seed/ingestão já está em andamento." });
    }
    catch (Exception ex)
    {
        return Results.Problem(statusCode: 500, title: "Falha na execução do ciclo", detail: ex.Message);
    }
});

app.MapPost("/api/seed", async ([FromQuery] int? cycles, GeckoApiIngestService ingestService, CancellationToken cancellationToken) =>
{
    try
    {
        var smartResult = await ingestService.RunSmartSeedAsync(cycles ?? 4, cancellationToken);
        return Results.Ok(smartResult);
    }
    catch (InvalidOperationException ex) when (ex.Message == "ingest in progress")
    {
        return Results.Conflict(new { message = "Um processo de seed/ingestão já está em andamento." });
    }
    catch (Exception ex)
    {
        return Results.Problem(statusCode: 500, title: "Falha na execução do Seed", detail: ex.Message);
    }
});

app.MapPost("/api/seed/recalculate", async (GeckoApiIngestService ingestService, CancellationToken cancellationToken) =>
{
    try
    {
        await ingestService.RecalcularTodasAnalisesRegionaisAsync(cancellationToken);
        return Results.Ok(new { message = "Tabela analise_regiao recalculada com sucesso para todos os bairros!" });
    }
    catch (Exception ex)
    {
        return Results.Problem(statusCode: 500, detail: ex.Message);
    }
});

app.MapPost("/api/seed/export-sql", async (GeckoApiIngestService ingestService, CancellationToken cancellationToken) =>
{
    try
    {
        var sql = await ingestService.ExportSqlSnapshotAsync(cancellationToken);
        var scriptPath = Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "scripts", "02_seed_neon.sql");
        var resolvedPath = Path.GetFullPath(scriptPath);
        
        var dir = Path.GetDirectoryName(resolvedPath);
        if (dir != null && Directory.Exists(dir))
        {
            await File.WriteAllTextAsync(resolvedPath, sql, cancellationToken);
        }

        return Results.Ok(new
        {
            message = "Snapshot SQL gerado com sucesso com dados 100% reais!",
            caminho_arquivo = resolvedPath,
            tamanho_bytes = sql.Length,
            linhas = sql.Split('\n').Length
        });
    }
    catch (Exception ex)
    {
        return Results.Problem(statusCode: 500, detail: ex.Message);
    }
});

app.MapPost("/api/db/reset", async (AppDbContext dbContext, GeckoApiIngestService ingestService, CancellationToken cancellationToken) =>
{
    // Drop and recreate schema cleanly
    await dbContext.Database.EnsureDeletedAsync(cancellationToken);
    await dbContext.Database.EnsureCreatedAsync(cancellationToken);

    // Run smart seed with initial cycles
    var smartResult = await ingestService.RunSmartSeedAsync(4, cancellationToken);

    return Results.Ok(new
    {
        message = "Banco Neon recriado e populado com sucesso com dados 100% reais!",
        novos_ingeridos = smartResult.TotalNovosIngeridos,
        ciclos = smartResult.CiclosExecutados,
        cobertura = smartResult.CoberturaAtual
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

static decimal? ParseSspDecimal(string value)
{
    return decimal.TryParse(value.Replace(".", "").Replace(',', '.'), System.Globalization.NumberStyles.Number, System.Globalization.CultureInfo.InvariantCulture, out var parsed) ? parsed : null;
}

public record EstimarPrecoRequest(decimal Preco, decimal AreaM2, Guid BairroId, string TipoNegocio);
public record IngestRunRequest(string City, string State, string BusinessType, int Pages = 1, string? Keyword = null);
public record ImportarOcorrenciaRequest(
    string Bairro,
    string Cidade,
    string Estado,
    string TipoCrime,
    DateOnly DataOcorrencia,
    int? PopulacaoEstimada = null,
    double? Latitude = null,
    double? Longitude = null,
    string? Fonte = "SSP-SP",
    string? IdentificadorExterno = null);
