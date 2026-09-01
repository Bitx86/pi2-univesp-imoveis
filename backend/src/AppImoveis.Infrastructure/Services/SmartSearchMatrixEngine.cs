using AppImoveis.Domain.Entities;
using AppImoveis.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AppImoveis.Infrastructure.Services;

public class BairroCoverageStatus
{
    public string Nome { get; set; } = string.Empty;
    public int TotalVenda { get; set; }
    public int TotalAluguel { get; set; }
    public int TotalGeral => TotalVenda + TotalAluguel;
    public bool QuorumVendaAtingido => TotalVenda >= 15;
    public bool QuorumAluguelAtingido => TotalAluguel >= 15;
}

public class SearchPlanTarget
{
    public string City { get; set; } = "Guarulhos";
    public string State { get; set; } = "SP";
    public string BairroOrKeyword { get; set; } = string.Empty;
    public TipoNegocio TipoNegocio { get; set; }
    public int PageToFetch { get; set; } = 1;
    public string Reason { get; set; } = string.Empty;
}

public class SmartSearchMatrixEngine
{
    private readonly AppDbContext _context;
    private readonly ILogger<SmartSearchMatrixEngine> _logger;

    public static readonly string[] MasterNeighborhoods = new[]
    {
        "Jardim Maia",
        "Vila Augusta",
        "Centro",
        "Gopouva",
        "Vila Galvão",
        "Bosque Maia",
        "Flor da Montanha",
        "Macedo",
        "Cecap",
        "Picanço",
        "Taboão",
        "Vila Rosália",
        "Ponte Grande",
        "Cocaia",
        "Bom Clima",
        "Bonsucesso"
    };

    public static readonly string[] ComplementaryAvenues = new[]
    {
        "Avenida Paulo Faccini",
        "Avenida Timóteo Penteado",
        "Avenida Emílio Ribas",
        "Avenida Monteiro Lobato",
        "Avenida Salgado Filho",
        "Avenida Tiradentes",
        "Rua Cônego Valadão",
        "Parque Shopping Maia",
        "Shopping Internacional"
    };

    public SmartSearchMatrixEngine(AppDbContext context, ILogger<SmartSearchMatrixEngine> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<List<BairroCoverageStatus>> GetDatabaseCoverageAsync(CancellationToken cancellationToken = default)
    {
        var dbBairros = await _context.Bairros.AsNoTracking().ToListAsync(cancellationToken);
        var dbCounts = await _context.Imoveis
            .AsNoTracking()
            .GroupBy(i => new { i.BairroId, i.TipoNegocio })
            .Select(g => new { g.Key.BairroId, g.Key.TipoNegocio, Count = g.Count() })
            .ToListAsync(cancellationToken);

        var result = new List<BairroCoverageStatus>();

        // Include master neighborhoods first
        var allNames = MasterNeighborhoods.Union(dbBairros.Select(b => b.Nome), StringComparer.OrdinalIgnoreCase);

        foreach (var name in allNames)
        {
            var matchedBairro = dbBairros.FirstOrDefault(b => string.Equals(b.Nome, name, StringComparison.OrdinalIgnoreCase));
            var vendaCount = 0;
            var aluguelCount = 0;

            if (matchedBairro != null)
            {
                vendaCount = dbCounts.FirstOrDefault(x => x.BairroId == matchedBairro.Id && x.TipoNegocio == TipoNegocio.Sale)?.Count ?? 0;
                aluguelCount = dbCounts.FirstOrDefault(x => x.BairroId == matchedBairro.Id && x.TipoNegocio == TipoNegocio.Rent)?.Count ?? 0;
            }

            result.Add(new BairroCoverageStatus
            {
                Nome = name,
                TotalVenda = vendaCount,
                TotalAluguel = aluguelCount
            });
        }

        return result.OrderBy(x => x.TotalGeral).ToList();
    }

    public async Task<HashSet<string>> GetExistingExternalIdsAsync(CancellationToken cancellationToken = default)
    {
        var ids = await _context.Imoveis
            .AsNoTracking()
            .Select(i => i.ExternalId)
            .ToListAsync(cancellationToken);

        return new HashSet<string>(ids, StringComparer.OrdinalIgnoreCase);
    }

    public async Task<SearchPlanTarget> PlanNextSearchTargetAsync(
        TipoNegocio tipoNegocio,
        IEnumerable<string>? excludeTerms = null,
        CancellationToken cancellationToken = default)
    {
        var coverage = await GetDatabaseCoverageAsync(cancellationToken);
        var excludedSet = new HashSet<string>(excludeTerms ?? Enumerable.Empty<string>(), StringComparer.OrdinalIgnoreCase);

        // 1. Identify which neighborhood is most in need of samples for this business type
        var sortedByNeed = coverage
            .Where(c => !excludedSet.Contains(c.Nome))
            .OrderBy(c => tipoNegocio == TipoNegocio.Sale ? c.TotalVenda : c.TotalAluguel)
            .ToList();

        if (sortedByNeed.Count == 0)
        {
            sortedByNeed = coverage.OrderBy(c => tipoNegocio == TipoNegocio.Sale ? c.TotalVenda : c.TotalAluguel).ToList();
        }

        var chosenTargetName = sortedByNeed.FirstOrDefault()?.Nome ?? MasterNeighborhoods[0];
        var reason = "Cobertura inicial padrão";

        foreach (var candidate in sortedByNeed)
        {
            var currentCount = tipoNegocio == TipoNegocio.Sale ? candidate.TotalVenda : candidate.TotalAluguel;
            
            // Check past sweeps for this term
            var lastSweep = await _context.HistoricoVarreduras
                .AsNoTracking()
                .Where(h => h.Cidade == "Guarulhos" && 
                            h.BairroTermo.ToLower() == candidate.Nome.ToLower() && 
                            h.TipoNegocio == tipoNegocio)
                .OrderByDescending(h => h.PaginaConsultada)
                .FirstOrDefaultAsync(cancellationToken);

            var nextPossiblePage = (lastSweep?.PaginaConsultada ?? 0) + 1;

            if (nextPossiblePage <= 6 || currentCount < 15)
            {
                chosenTargetName = candidate.Nome;
                reason = currentCount < 15
                    ? $"Bairro '{candidate.Nome}' possui apenas {currentCount} imóveis de {(tipoNegocio == TipoNegocio.Sale ? "Venda" : "Aluguel")} no banco."
                    : $"Bairro '{candidate.Nome}' com varredura para página {nextPossiblePage}.";
                break;
            }
        }

        // Check the next page to fetch for this chosen target
        var targetLastSweep = await _context.HistoricoVarreduras
            .AsNoTracking()
            .Where(h => h.Cidade == "Guarulhos" && 
                        h.BairroTermo.ToLower() == chosenTargetName.ToLower() && 
                        h.TipoNegocio == tipoNegocio)
            .OrderByDescending(h => h.PaginaConsultada)
            .FirstOrDefaultAsync(cancellationToken);

        var pageToFetch = 1;
        if (targetLastSweep != null)
        {
            pageToFetch = targetLastSweep.PaginaConsultada + 1;
            if (pageToFetch > 6)
            {
                // Cycle to complementary avenue or reset
                var avenueIdx = Math.Abs(chosenTargetName.GetHashCode()) % ComplementaryAvenues.Length;
                chosenTargetName = ComplementaryAvenues[avenueIdx];
                pageToFetch = 1;
                reason = $"Páginas de bairro saturadas. Explorando via estratégica '{chosenTargetName}'.";
            }
        }

        _logger.LogInformation("SmartSearchMatrixEngine: Planejada busca em '{Target}' (Página {Page}, Tipo: {Tipo}) - Motivo: {Reason}",
            chosenTargetName, pageToFetch, tipoNegocio, reason);

        return new SearchPlanTarget
        {
            City = "Guarulhos",
            State = "SP",
            BairroOrKeyword = chosenTargetName,
            TipoNegocio = tipoNegocio,
            PageToFetch = pageToFetch,
            Reason = reason
        };
    }

    public static string BuildZapImoveisPlpUrl(string city, string state, string? neighborhoodOrTerm, TipoNegocio tipoNegocio, int page)
    {
        var business = tipoNegocio == TipoNegocio.Sale ? "venda" : "aluguel";
        var citySlug = Slugify(city);
        var stateSlug = state.ToLowerInvariant().Trim();

        string locationPath;
        if (!string.IsNullOrWhiteSpace(neighborhoodOrTerm) && !neighborhoodOrTerm.Equals(city, StringComparison.OrdinalIgnoreCase))
        {
            var neighSlug = Slugify(neighborhoodOrTerm);
            locationPath = $"{stateSlug}+{citySlug}+{neighSlug}";
        }
        else
        {
            locationPath = $"{stateSlug}+{citySlug}";
        }

        return $"https://www.zapimoveis.com.br/{business}/imoveis/{locationPath}/?pagina={page}";
    }

    public static string Slugify(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return "";
        var normalized = text.Normalize(System.Text.NormalizationForm.FormD);
        var sb = new System.Text.StringBuilder();
        foreach (var c in normalized)
        {
            var unicodeCategory = System.Globalization.CharUnicodeInfo.GetUnicodeCategory(c);
            if (unicodeCategory != System.Globalization.UnicodeCategory.NonSpacingMark)
            {
                if (char.IsLetterOrDigit(c))
                {
                    sb.Append(char.ToLowerInvariant(c));
                }
                else if (c == ' ' || c == '-' || c == '_')
                {
                    sb.Append('-');
                }
            }
        }
        return System.Text.RegularExpressions.Regex.Replace(sb.ToString(), @"-+", "-").Trim('-');
    }
}
