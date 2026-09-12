using System.Text.RegularExpressions;
using AppImoveis.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AppImoveis.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Bairro> Bairros => Set<Bairro>();
    public DbSet<Imovel> Imoveis => Set<Imovel>();
    public DbSet<HistoricoPreco> HistoricoPrecos => Set<HistoricoPreco>();
    public DbSet<AnaliseRegiao> AnalisesRegiao => Set<AnaliseRegiao>();
    public DbSet<HistoricoVarredura> HistoricoVarreduras => Set<HistoricoVarredura>();
    public DbSet<OcorrenciaCriminal> OcorrenciasCriminais => Set<OcorrenciaCriminal>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasPostgresEnum<TipoNegocio>("tipo_negocio");

        modelBuilder.Entity<HistoricoVarredura>(entity =>
        {
            entity.ToTable("historico_varreduras");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasColumnName("id");
            entity.Property(x => x.Cidade).HasColumnName("cidade").HasMaxLength(120).IsRequired();
            entity.Property(x => x.Estado).HasColumnName("estado").HasMaxLength(80).IsRequired();
            entity.Property(x => x.BairroTermo).HasColumnName("bairro_termo").HasMaxLength(200).IsRequired();
            entity.Property(x => x.TipoNegocio).HasColumnName("tipo_negocio");
            entity.Property(x => x.PaginaConsultada).HasColumnName("pagina_consultada");
            entity.Property(x => x.TotalEncontrados).HasColumnName("total_encontrados");
            entity.Property(x => x.NovosIngeridos).HasColumnName("novos_ingeridos");
            entity.Property(x => x.DuplicadosIgnorados).HasColumnName("duplicados_ignorados");
            entity.Property(x => x.ApiKeyUtilizadaReduzida).HasColumnName("api_key_utilizada_reduzida").HasMaxLength(50);
            entity.Property(x => x.DataConsulta).HasColumnName("data_consulta");

            entity.HasIndex(x => new { x.Cidade, x.BairroTermo, x.TipoNegocio });
        });

        modelBuilder.Entity<Bairro>(entity =>
        {
            entity.ToTable("bairros");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasColumnName("id");
            entity.Property(x => x.Nome).HasColumnName("nome").HasMaxLength(200).IsRequired();
            entity.Property(x => x.Cidade).HasColumnName("cidade").HasMaxLength(120).IsRequired();
            entity.Property(x => x.Estado).HasColumnName("estado").HasMaxLength(80).IsRequired();
            entity.Property(x => x.PopulacaoEstimada).HasColumnName("populacao_estimada");
            entity.HasIndex(x => new { x.Nome, x.Cidade, x.Estado }).IsUnique();
        });

        modelBuilder.Entity<OcorrenciaCriminal>(entity =>
        {
            entity.ToTable("ocorrencias_criminais");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasColumnName("id");
            entity.Property(x => x.BairroId).HasColumnName("bairro_id");
            entity.Property(x => x.TipoCrime).HasColumnName("tipo_crime").HasConversion<string>();
            entity.Property(x => x.DataOcorrencia).HasColumnName("data_ocorrencia");
            entity.Property(x => x.Latitude).HasColumnName("latitude");
            entity.Property(x => x.Longitude).HasColumnName("longitude");
            entity.Property(x => x.Fonte).HasColumnName("fonte").HasMaxLength(80).IsRequired();
            entity.Property(x => x.IdentificadorExterno).HasColumnName("identificador_externo").HasMaxLength(200);
            entity.HasIndex(x => new { x.BairroId, x.DataOcorrencia, x.TipoCrime });
            entity.HasIndex(x => new { x.Fonte, x.IdentificadorExterno }).IsUnique();
            entity.HasOne(x => x.Bairro).WithMany().HasForeignKey(x => x.BairroId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Imovel>(entity =>
        {
            entity.ToTable("imoveis");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasColumnName("id");
            entity.Property(x => x.ExternalId).HasColumnName("external_id").HasMaxLength(200).IsRequired();
            entity.Property(x => x.Fonte).HasColumnName("fonte").HasMaxLength(100).IsRequired();
            entity.Property(x => x.Titulo).HasColumnName("titulo").HasMaxLength(400);
            entity.Property(x => x.Descricao).HasColumnName("descricao");
            entity.Property(x => x.TipoNegocio)
                .HasColumnName("tipo_negocio");

            entity.Property(x => x.TipoAnuncio).HasColumnName("tipo_anuncio").HasMaxLength(120);
            entity.Property(x => x.TipoImovel).HasColumnName("tipo_imovel").HasMaxLength(80);
            entity.Property(x => x.Preco).HasColumnName("preco").HasPrecision(18, 2);
            entity.Property(x => x.Condominio).HasColumnName("condominio").HasPrecision(18, 2);
            entity.Property(x => x.Iptu).HasColumnName("iptu").HasPrecision(18, 2);
            entity.Property(x => x.AreaM2).HasColumnName("area_m2").HasPrecision(18, 2);
            entity.Property(x => x.Quartos).HasColumnName("quartos");
            entity.Property(x => x.Banheiros).HasColumnName("banheiros");
            entity.Property(x => x.Suites).HasColumnName("suites");
            entity.Property(x => x.Vagas).HasColumnName("vagas");
            entity.Property(x => x.Rua).HasColumnName("rua").HasMaxLength(255);
            entity.Property(x => x.Numero).HasColumnName("numero").HasMaxLength(50);
            entity.Property(x => x.Cep).HasColumnName("cep").HasMaxLength(20);
            entity.Property(x => x.EnderecoFormatado).HasColumnName("endereco_formatado");
            entity.Property(x => x.Cidade).HasColumnName("cidade").HasMaxLength(120);
            entity.Property(x => x.Estado).HasColumnName("estado").HasMaxLength(80);
            entity.Property(x => x.BairroId).HasColumnName("bairro_id");
            entity.Property(x => x.Latitude).HasColumnName("latitude");
            entity.Property(x => x.Longitude).HasColumnName("longitude");
            entity.Property(x => x.UrlOriginal).HasColumnName("url_original").HasMaxLength(1000);
            entity.Property(x => x.ImagemPrincipalUrl).HasColumnName("imagem_principal_url").HasMaxLength(1000);
            entity.Property(x => x.ImagensUrls).HasColumnName("imagens_urls");
            entity.Property(x => x.Amenidades).HasColumnName("amenidades");
            entity.Property(x => x.CapturadoEm).HasColumnName("capturado_em");

            entity.HasIndex(x => new { x.Fonte, x.ExternalId }).IsUnique();
            entity.HasIndex(x => x.BairroId);
            entity.HasIndex(x => x.TipoNegocio);
            entity.HasOne(x => x.Bairro)
                .WithMany()
                .HasForeignKey(x => x.BairroId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<HistoricoPreco>(entity =>
        {
            entity.ToTable("historico_precos");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasColumnName("id");
            entity.Property(x => x.ImovelId).HasColumnName("imovel_id");
            entity.Property(x => x.Preco).HasColumnName("preco").HasPrecision(18, 2);
            entity.Property(x => x.CapturadoEm).HasColumnName("capturado_em");

            entity.HasIndex(x => x.ImovelId);
            entity.HasOne(x => x.Imovel)
                .WithMany()
                .HasForeignKey(x => x.ImovelId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<AnaliseRegiao>(entity =>
        {
            entity.ToTable("analise_regiao");
            entity.HasKey(x => new { x.BairroId, x.TipoNegocio });
            entity.Property(x => x.BairroId).HasColumnName("bairro_id");
            entity.Property(x => x.TipoNegocio)
                .HasColumnName("tipo_negocio");
            entity.Property(x => x.PrecoMedio).HasColumnName("preco_medio").HasPrecision(18, 2);
            entity.Property(x => x.PrecoMediano).HasColumnName("preco_mediano").HasPrecision(18, 2);
            entity.Property(x => x.PrecoM2Medio).HasColumnName("preco_m2_medio").HasPrecision(18, 2);
            entity.Property(x => x.DesvioPadraoAmostral).HasColumnName("desvio_padrao_amostral").HasPrecision(18, 2);
            entity.Property(x => x.AmostraCount).HasColumnName("amostra_count");
            entity.Property(x => x.AtualizadoEm).HasColumnName("atualizado_em");

            entity.HasOne(x => x.Bairro)
                .WithMany()
                .HasForeignKey(x => x.BairroId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Universal snake_case fallback for any entity or shadow property
        foreach (var entity in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var property in entity.GetProperties())
            {
                var currentColumnName = property.GetColumnName();
                if (string.IsNullOrEmpty(currentColumnName) || currentColumnName == property.Name)
                {
                    property.SetColumnName(ToSnakeCase(property.Name));
                }
            }
        }

        base.OnModelCreating(modelBuilder);
    }

    private static string ToSnakeCase(string input)
    {
        if (string.IsNullOrEmpty(input)) return input;
        return Regex.Replace(input, @"([a-z0-9])([A-Z])", "$1_$2").ToLowerInvariant();
    }
}
