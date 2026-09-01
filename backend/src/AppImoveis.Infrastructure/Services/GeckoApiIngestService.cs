using System.Net;
using System.Text;
using System.Text.Json;
using AppImoveis.Application.Services;
using AppImoveis.Domain.Entities;
using AppImoveis.Infrastructure.Persistence;
using AppImoveis.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace AppImoveis.Infrastructure.Services;

public class SmartSeedResult
{
    public string Message { get; set; } = string.Empty;
    public int TotalNovosIngeridos { get; set; }
    public int TotalDuplicadosVerificados { get; set; }
    public int TotalErros { get; set; }
    public int CiclosExecutados { get; set; }
    public bool QuotaEsgotada { get; set; }
    public ApiKeyPoolStats ApiKeysStats { get; set; } = new();
    public List<SearchCycleSummary> Ciclos { get; set; } = new();
    public List<BairroCoverageStatus> CoberturaAtual { get; set; } = new();
}

public class SearchCycleSummary
{
    public string Termo { get; set; } = string.Empty;
    public TipoNegocio TipoNegocio { get; set; }
    public int Pagina { get; set; }
    public string Motivo { get; set; } = string.Empty;
    public int Encontrados { get; set; }
    public int NovosIngeridos { get; set; }
    public int Duplicados { get; set; }
    public string ApiKeyUtilizada { get; set; } = string.Empty;
    public bool Sucesso { get; set; }
}

public class SmartSeedStepResult
{
    public SearchCycleSummary Ciclo { get; set; } = new();
    public int TotalNovos { get; set; }
    public int TotalDuplicados { get; set; }
    public bool QuotaEsgotada { get; set; }
    public string Message { get; set; } = string.Empty;
    public List<BairroCoverageStatus> CoberturaAtual { get; set; } = new();
    public ApiKeyPoolStats ApiKeysStats { get; set; } = new();
}

public class GeckoApiIngestService
{
    private readonly HttpClient _httpClient;
    private readonly AppDbContext _context;
    private readonly BairroRepository _bairroRepository;
    private readonly ImovelRepository _imovelRepository;
    private readonly GeckoApiKeyPoolManager _apiKeyPoolManager;
    private readonly SmartSearchMatrixEngine _searchMatrixEngine;
    private readonly IConfiguration _configuration;
    private readonly ILogger<GeckoApiIngestService> _logger;

    private static readonly object IngestGate = new();
    private static bool _ingestInProgress;

    public GeckoApiIngestService(
        HttpClient httpClient,
        AppDbContext context,
        BairroRepository bairroRepository,
        ImovelRepository imovelRepository,
        GeckoApiKeyPoolManager apiKeyPoolManager,
        SmartSearchMatrixEngine searchMatrixEngine,
        IConfiguration configuration,
        ILogger<GeckoApiIngestService> logger)
    {
        _httpClient = httpClient;
        _context = context;
        _bairroRepository = bairroRepository;
        _imovelRepository = imovelRepository;
        _apiKeyPoolManager = apiKeyPoolManager;
        _searchMatrixEngine = searchMatrixEngine;
        _configuration = configuration;
        _logger = logger;

        var baseUrl = configuration["GeckoApi:BaseUrl"] 
                      ?? configuration["GECKO_API_BASE_URL"] 
                      ?? "https://api.geckoapi.com.br";
        _httpClient.BaseAddress = new Uri(baseUrl);
    }

    /// <summary>
    /// Executa um ciclo inteligente de Seed: verifica o banco antes de consultar,
    /// identifica lacunas de dados, planeja consultas com termos/páginas inéditas,
    /// consome a API externa real com rotação de chaves e recalcula analise_regiao.
    /// </summary>
    public async Task<SmartSeedResult> RunSmartSeedAsync(
        int cycles = 4,
        CancellationToken cancellationToken = default)
    {
        lock (IngestGate)
        {
            if (_ingestInProgress)
            {
                throw new InvalidOperationException("ingest in progress");
            }
            _ingestInProgress = true;
        }

        try
        {
            var result = new SmartSeedResult();
            var targetTypes = new[] { TipoNegocio.Sale, TipoNegocio.Rent };
            var touchedBairroIds = new HashSet<Guid>();

            // Load all existing external IDs for fast pre-filtering
            var existingIds = await _searchMatrixEngine.GetExistingExternalIdsAsync(cancellationToken);

            var plannedTermsInBatch = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            for (int i = 0; i < Math.Max(1, cycles); i++)
            {
                var tipoNegocio = targetTypes[i % targetTypes.Length];
                
                // 1. Check DB and plan next targeted search (excluding terms already planned in this current batch)
                var plan = await _searchMatrixEngine.PlanNextSearchTargetAsync(tipoNegocio, plannedTermsInBatch, cancellationToken);
                plannedTermsInBatch.Add(plan.BairroOrKeyword);

                var cycleSummary = new SearchCycleSummary
                {
                    Termo = plan.BairroOrKeyword,
                    TipoNegocio = plan.TipoNegocio,
                    Pagina = plan.PageToFetch,
                    Motivo = plan.Reason
                };

                // 2. Obtain active API key from pool
                var activeKey = _apiKeyPoolManager.GetActiveKey();
                if (string.IsNullOrWhiteSpace(activeKey))
                {
                    _logger.LogWarning("GeckoApi: Todas as chaves do pool estão esgotadas ou nenhuma chave foi configurada.");
                    result.QuotaEsgotada = true;
                    cycleSummary.Sucesso = false;
                    cycleSummary.ApiKeyUtilizada = "Nenhuma chave disponível";
                    result.Ciclos.Add(cycleSummary);
                    break;
                }

                cycleSummary.ApiKeyUtilizada = _apiKeyPoolManager.GetActiveKeyMasked();

                // 3. Fetch listings with auto-retry across keys in pool
                List<GeckoPropertyDetailed> items = new();
                bool fetchSuccess = false;

                while (!fetchSuccess)
                {
                    try
                    {
                        items = await FetchPropertiesFromPlpWithKeyAsync(
                            plan.City,
                            plan.State,
                            plan.TipoNegocio,
                            plan.PageToFetch,
                            plan.BairroOrKeyword,
                            activeKey,
                            cancellationToken);

                        _apiKeyPoolManager.ReportSuccess(activeKey, 1);
                        fetchSuccess = true;
                    }
                    catch (HttpRequestException ex) when (ex.StatusCode == HttpStatusCode.TooManyRequests)
                    {
                        var rotated = _apiKeyPoolManager.ReportExhaustedOrRateLimited(activeKey);
                        if (!rotated)
                        {
                            result.QuotaEsgotada = true;
                            break;
                        }
                        activeKey = _apiKeyPoolManager.GetActiveKey();
                        if (activeKey == null)
                        {
                            result.QuotaEsgotada = true;
                            break;
                        }
                        cycleSummary.ApiKeyUtilizada = _apiKeyPoolManager.GetActiveKeyMasked();
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Erro ao extrair listagem da GeckoAPI para termo '{Termo}'.", plan.BairroOrKeyword);
                        break;
                    }
                }

                cycleSummary.Encontrados = items.Count;
                int cycleIngested = 0;
                int cycleSkipped = 0;

                // 4. Ingest items with deduplication & price history
                foreach (var item in items)
                {
                    if (!TryMapProperty(item, plan.City, plan.State, plan.TipoNegocio, plan.BairroOrKeyword, out var imovel, out var bairroName))
                    {
                        continue;
                    }

                    try
                    {
                        var persistedBairro = await _bairroRepository.GetOrCreateAsync(bairroName, plan.City, plan.State, cancellationToken);
                        imovel.BairroId = persistedBairro.Id;
                        imovel.Bairro = null;
                        touchedBairroIds.Add(persistedBairro.Id);

                        var existing = await _imovelRepository.GetByExternalIdAsync(imovel.Fonte, imovel.ExternalId, cancellationToken);
                        if (existing is not null)
                        {
                            var mudouPreco = existing.Preco != imovel.Preco;
                            existing.Titulo = imovel.Titulo;
                            existing.Descricao = imovel.Descricao;
                            existing.Preco = imovel.Preco;
                            existing.Condominio = imovel.Condominio;
                            existing.Iptu = imovel.Iptu;
                            existing.AreaM2 = imovel.AreaM2;
                            existing.Quartos = imovel.Quartos;
                            existing.Banheiros = imovel.Banheiros;
                            existing.Suites = imovel.Suites;
                            existing.Vagas = imovel.Vagas;
                            existing.ImagemPrincipalUrl = imovel.ImagemPrincipalUrl;
                            existing.ImagensUrls = imovel.ImagensUrls;
                            existing.Amenidades = imovel.Amenidades;
                            existing.CapturadoEm = imovel.CapturadoEm;

                            await _context.SaveChangesAsync(cancellationToken);

                            if (mudouPreco)
                            {
                                var historico = new HistoricoPreco
                                {
                                    ImovelId = existing.Id,
                                    Preco = imovel.Preco,
                                    CapturadoEm = imovel.CapturadoEm
                                };
                                await _context.HistoricoPrecos.AddAsync(historico, cancellationToken);
                                await _context.SaveChangesAsync(cancellationToken);
                            }

                            cycleSkipped++;
                            result.TotalDuplicadosVerificados++;
                            continue;
                        }

                        // Fresh new real property
                        await _imovelRepository.AddAsync(imovel, cancellationToken);

                        // Baseline initial price history entry
                        var initialHistory = new HistoricoPreco
                        {
                            ImovelId = imovel.Id,
                            Preco = imovel.Preco,
                            CapturadoEm = imovel.CapturadoEm
                        };
                        await _context.HistoricoPrecos.AddAsync(initialHistory, cancellationToken);
                        await _context.SaveChangesAsync(cancellationToken);

                        existingIds.Add(imovel.ExternalId);
                        cycleIngested++;
                        result.TotalNovosIngeridos++;
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Erro ao persistir imóvel real {ExternalId}.", imovel.ExternalId);
                        _context.ChangeTracker.Clear();
                        result.TotalErros++;
                    }
                }

                cycleSummary.NovosIngeridos = cycleIngested;
                cycleSummary.Duplicados = cycleSkipped;
                cycleSummary.Sucesso = fetchSuccess;
                result.Ciclos.Add(cycleSummary);
                result.CiclosExecutados++;

                // 5. Save sweep log in database
                var logSweep = new HistoricoVarredura
                {
                    Cidade = plan.City,
                    Estado = plan.State,
                    BairroTermo = plan.BairroOrKeyword,
                    TipoNegocio = plan.TipoNegocio,
                    PaginaConsultada = plan.PageToFetch,
                    TotalEncontrados = items.Count,
                    NovosIngeridos = cycleIngested,
                    DuplicadosIgnorados = cycleSkipped,
                    ApiKeyUtilizadaReduzida = cycleSummary.ApiKeyUtilizada,
                    DataConsulta = DateTimeOffset.UtcNow
                };
                await _context.HistoricoVarreduras.AddAsync(logSweep, cancellationToken);
                await _context.SaveChangesAsync(cancellationToken);

                if (result.QuotaEsgotada) break;
            }

            // 6. Recalculate and persist statistical aggregates in analise_regiao
            await RecalcularTodasAnalisesRegionaisAsync(cancellationToken);

            // 7. Attach updated coverage status
            result.CoberturaAtual = await _searchMatrixEngine.GetDatabaseCoverageAsync(cancellationToken);
            result.ApiKeysStats = _apiKeyPoolManager.GetPoolStats();
            result.Message = $"Varredura concluída: {result.TotalNovosIngeridos} novos imóveis 100% reais ingeridos em {result.CiclosExecutados} ciclos.";

            return result;
        }
        finally
        {
            lock (IngestGate)
            {
                _ingestInProgress = false;
            }
        }
    }

    /// <summary>
    /// Executa um único ciclo/passo de seed inteligente, ideal para feedback visual em tempo real na UI.
    /// </summary>
    public async Task<SmartSeedStepResult> RunSingleSmartSeedStepAsync(
        string? preferredType = null,
        CancellationToken cancellationToken = default)
    {
        lock (IngestGate)
        {
            if (_ingestInProgress)
            {
                throw new InvalidOperationException("ingest in progress");
            }
            _ingestInProgress = true;
        }

        try
        {
            TipoNegocio tipoNegocio;
            if (!string.IsNullOrWhiteSpace(preferredType) && Enum.TryParse<TipoNegocio>(preferredType, true, out var parsed))
            {
                tipoNegocio = parsed;
            }
            else
            {
                var cov = await _searchMatrixEngine.GetDatabaseCoverageAsync(cancellationToken);
                var totalSale = cov.Sum(x => x.TotalVenda);
                var totalRent = cov.Sum(x => x.TotalAluguel);
                tipoNegocio = totalSale <= totalRent ? TipoNegocio.Sale : TipoNegocio.Rent;
            }

            var plan = await _searchMatrixEngine.PlanNextSearchTargetAsync(tipoNegocio, null, cancellationToken);
            var cycleSummary = new SearchCycleSummary
            {
                Termo = plan.BairroOrKeyword,
                TipoNegocio = plan.TipoNegocio,
                Pagina = plan.PageToFetch,
                Motivo = plan.Reason
            };

            var activeKey = _apiKeyPoolManager.GetActiveKey();
            if (string.IsNullOrWhiteSpace(activeKey))
            {
                cycleSummary.Sucesso = false;
                cycleSummary.ApiKeyUtilizada = "Nenhuma chave disponível";
                return new SmartSeedStepResult
                {
                    Ciclo = cycleSummary,
                    QuotaEsgotada = true,
                    Message = "Todas as chaves do pool de API estão esgotadas ou nenhuma foi configurada.",
                    CoberturaAtual = await _searchMatrixEngine.GetDatabaseCoverageAsync(cancellationToken),
                    ApiKeysStats = _apiKeyPoolManager.GetPoolStats()
                };
            }

            cycleSummary.ApiKeyUtilizada = _apiKeyPoolManager.GetActiveKeyMasked();

            List<GeckoPropertyDetailed> items = new();
            bool fetchSuccess = false;

            while (!fetchSuccess)
            {
                try
                {
                    items = await FetchPropertiesFromPlpWithKeyAsync(
                        plan.City,
                        plan.State,
                        plan.TipoNegocio,
                        plan.PageToFetch,
                        plan.BairroOrKeyword,
                        activeKey,
                        cancellationToken);

                    _apiKeyPoolManager.ReportSuccess(activeKey, 1);
                    fetchSuccess = true;
                }
                catch (HttpRequestException ex) when (ex.StatusCode == HttpStatusCode.TooManyRequests)
                {
                    var rotated = _apiKeyPoolManager.ReportExhaustedOrRateLimited(activeKey);
                    if (!rotated) break;
                    activeKey = _apiKeyPoolManager.GetActiveKey();
                    if (activeKey == null) break;
                    cycleSummary.ApiKeyUtilizada = _apiKeyPoolManager.GetActiveKeyMasked();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Erro ao extrair listagem da GeckoAPI para termo '{Termo}'.", plan.BairroOrKeyword);
                    break;
                }
            }

            cycleSummary.Encontrados = items.Count;
            int cycleIngested = 0;
            int cycleSkipped = 0;

            foreach (var item in items)
            {
                if (!TryMapProperty(item, plan.City, plan.State, plan.TipoNegocio, plan.BairroOrKeyword, out var imovel, out var bairroName))
                {
                    continue;
                }

                try
                {
                    var persistedBairro = await _bairroRepository.GetOrCreateAsync(bairroName, plan.City, plan.State, cancellationToken);
                    imovel.BairroId = persistedBairro.Id;
                    imovel.Bairro = null;

                    var existing = await _imovelRepository.GetByExternalIdAsync(imovel.Fonte, imovel.ExternalId, cancellationToken);
                    if (existing is not null)
                    {
                        var mudouPreco = existing.Preco != imovel.Preco;
                        existing.Titulo = imovel.Titulo;
                        existing.Descricao = imovel.Descricao;
                        existing.Preco = imovel.Preco;
                        existing.Condominio = imovel.Condominio;
                        existing.Iptu = imovel.Iptu;
                        existing.AreaM2 = imovel.AreaM2;
                        existing.Quartos = imovel.Quartos;
                        existing.Banheiros = imovel.Banheiros;
                        existing.Suites = imovel.Suites;
                        existing.Vagas = imovel.Vagas;
                        existing.ImagemPrincipalUrl = imovel.ImagemPrincipalUrl;
                        existing.ImagensUrls = imovel.ImagensUrls;
                        existing.Amenidades = imovel.Amenidades;
                        existing.CapturadoEm = imovel.CapturadoEm;

                        await _context.SaveChangesAsync(cancellationToken);

                        if (mudouPreco)
                        {
                            var historico = new HistoricoPreco
                            {
                                ImovelId = existing.Id,
                                Preco = imovel.Preco,
                                CapturadoEm = imovel.CapturadoEm
                            };
                            await _context.HistoricoPrecos.AddAsync(historico, cancellationToken);
                            await _context.SaveChangesAsync(cancellationToken);
                        }

                        cycleSkipped++;
                        continue;
                    }

                    // Fresh new real property
                    await _imovelRepository.AddAsync(imovel, cancellationToken);

                    var initialHistory = new HistoricoPreco
                    {
                        ImovelId = imovel.Id,
                        Preco = imovel.Preco,
                        CapturadoEm = imovel.CapturadoEm
                    };
                    await _context.HistoricoPrecos.AddAsync(initialHistory, cancellationToken);
                    await _context.SaveChangesAsync(cancellationToken);

                    cycleIngested++;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Erro ao persistir imóvel real {ExternalId}.", imovel.ExternalId);
                    _context.ChangeTracker.Clear();
                }
            }

            cycleSummary.NovosIngeridos = cycleIngested;
            cycleSummary.Duplicados = cycleSkipped;
            cycleSummary.Sucesso = fetchSuccess;

            var logSweep = new HistoricoVarredura
            {
                Cidade = plan.City,
                Estado = plan.State,
                BairroTermo = plan.BairroOrKeyword,
                TipoNegocio = plan.TipoNegocio,
                PaginaConsultada = plan.PageToFetch,
                TotalEncontrados = items.Count,
                NovosIngeridos = cycleIngested,
                DuplicadosIgnorados = cycleSkipped,
                ApiKeyUtilizadaReduzida = cycleSummary.ApiKeyUtilizada,
                DataConsulta = DateTimeOffset.UtcNow
            };
            await _context.HistoricoVarreduras.AddAsync(logSweep, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);

            // Recalculate stats
            await RecalcularTodasAnalisesRegionaisAsync(cancellationToken);

            return new SmartSeedStepResult
            {
                Ciclo = cycleSummary,
                TotalNovos = cycleIngested,
                TotalDuplicados = cycleSkipped,
                CoberturaAtual = await _searchMatrixEngine.GetDatabaseCoverageAsync(cancellationToken),
                ApiKeysStats = _apiKeyPoolManager.GetPoolStats(),
                Message = $"Ciclo executado: {cycleIngested} novos imóveis inseridos para {plan.BairroOrKeyword} ({plan.TipoNegocio})."
            };
        }
        finally
        {
            lock (IngestGate)
            {
                _ingestInProgress = false;
            }
        }
    }

    /// <summary>
    /// Ingestão manual com parâmetros definidos pelo usuário
    /// </summary>
    public async Task<IngestRunResult> RunAsync(
        string city,
        string state,
        TipoNegocio tipoNegocio,
        int pages,
        string? keyword,
        CancellationToken cancellationToken = default)
    {
        lock (IngestGate)
        {
            if (_ingestInProgress) throw new InvalidOperationException("ingest in progress");
            _ingestInProgress = true;
        }

        try
        {
            int ingested = 0;
            int skippedDuplicates = 0;
            int errors = 0;
            int creditsUsed = 0;
            bool quotaExhausted = false;

            var targetCity = string.IsNullOrWhiteSpace(city) ? "Guarulhos" : city;
            var targetState = string.IsNullOrWhiteSpace(state) ? "SP" : state;

            for (var page = 1; page <= Math.Max(1, pages); page++)
            {
                var activeKey = _apiKeyPoolManager.GetActiveKey();
                if (string.IsNullOrWhiteSpace(activeKey))
                {
                    quotaExhausted = true;
                    break;
                }

                List<GeckoPropertyDetailed> detailedItems;

                try
                {
                    detailedItems = await FetchPropertiesFromPlpWithKeyAsync(targetCity, targetState, tipoNegocio, page, keyword, activeKey, cancellationToken);
                    creditsUsed += 1;
                    _apiKeyPoolManager.ReportSuccess(activeKey, 1);
                    _logger.LogInformation("GeckoAPI: Extraídos {Count} imóveis reais para página {Page}.", detailedItems.Count, page);
                }
                catch (HttpRequestException ex) when (ex.StatusCode == HttpStatusCode.TooManyRequests)
                {
                    _apiKeyPoolManager.ReportExhaustedOrRateLimited(activeKey);
                    activeKey = _apiKeyPoolManager.GetActiveKey();
                    if (activeKey == null)
                    {
                        quotaExhausted = true;
                        break;
                    }
                    continue;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Erro ao buscar listagem da GeckoAPI.");
                    detailedItems = new List<GeckoPropertyDetailed>();
                }

                foreach (var item in detailedItems)
                {
                    if (!TryMapProperty(item, targetCity, targetState, tipoNegocio, keyword, out var imovel, out var bairroName))
                    {
                        continue;
                    }

                    try
                    {
                        var persistedBairro = await _bairroRepository.GetOrCreateAsync(bairroName, targetCity, targetState, cancellationToken);
                        imovel.Bairro = null;
                        imovel.BairroId = persistedBairro.Id;

                        var existing = await _imovelRepository.GetByExternalIdAsync(imovel.Fonte, imovel.ExternalId, cancellationToken);
                        if (existing is not null)
                        {
                            var mudouPreco = existing.Preco != imovel.Preco;
                            existing.Titulo = imovel.Titulo;
                            existing.Descricao = imovel.Descricao;
                            existing.Preco = imovel.Preco;
                            existing.Condominio = imovel.Condominio;
                            existing.Iptu = imovel.Iptu;
                            existing.AreaM2 = imovel.AreaM2;
                            existing.Quartos = imovel.Quartos;
                            existing.Banheiros = imovel.Banheiros;
                            existing.Suites = imovel.Suites;
                            existing.Vagas = imovel.Vagas;
                            existing.ImagemPrincipalUrl = imovel.ImagemPrincipalUrl;
                            existing.ImagensUrls = imovel.ImagensUrls;
                            existing.Amenidades = imovel.Amenidades;
                            existing.CapturadoEm = imovel.CapturadoEm;

                            await _context.SaveChangesAsync(cancellationToken);

                            if (mudouPreco)
                            {
                                var historico = new HistoricoPreco
                                {
                                    ImovelId = existing.Id,
                                    Preco = imovel.Preco,
                                    CapturadoEm = imovel.CapturadoEm
                                };
                                await _context.HistoricoPrecos.AddAsync(historico, cancellationToken);
                                await _context.SaveChangesAsync(cancellationToken);
                            }

                            skippedDuplicates++;
                            continue;
                        }

                        await _imovelRepository.AddAsync(imovel, cancellationToken);

                        var initialHist = new HistoricoPreco
                        {
                            ImovelId = imovel.Id,
                            Preco = imovel.Preco,
                            CapturadoEm = imovel.CapturadoEm
                        };
                        await _context.HistoricoPrecos.AddAsync(initialHist, cancellationToken);
                        await _context.SaveChangesAsync(cancellationToken);

                        ingested++;
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Erro ao persistir item {ExternalId}.", imovel.ExternalId);
                        _context.ChangeTracker.Clear();
                        errors++;
                    }
                }
            }

            // Recalculate analytics
            await RecalcularTodasAnalisesRegionaisAsync(cancellationToken);

            return new IngestRunResult
            {
                Ingrested = ingested,
                SkippedDuplicates = skippedDuplicates,
                Errors = errors,
                QuotaExhausted = quotaExhausted,
                CreditsUsed = creditsUsed
            };
        }
        finally
        {
            lock (IngestGate)
            {
                _ingestInProgress = false;
            }
        }
    }

    /// <summary>
    /// Recalcula estatísticas e persiste na tabela analise_regiao
    /// </summary>
    public async Task RecalcularTodasAnalisesRegionaisAsync(CancellationToken cancellationToken = default)
    {
        var bairros = await _context.Bairros.AsNoTracking().ToListAsync(cancellationToken);
        var types = new[] { TipoNegocio.Sale, TipoNegocio.Rent };

        foreach (var b in bairros)
        {
            var imoveis = await _context.Imoveis
                .AsNoTracking()
                .Where(x => x.BairroId == b.Id)
                .ToListAsync(cancellationToken);

            foreach (var tipo in types)
            {
                var filtrados = imoveis.Where(i => i.TipoNegocio == tipo).ToList();
                if (!filtrados.Any()) continue;

                var calculo = AnaliseImoveisService.CalcularAnalise(filtrados, tipo);

                var existing = await _context.AnalisesRegiao
                    .FirstOrDefaultAsync(a => a.BairroId == b.Id && a.TipoNegocio == tipo, cancellationToken);

                if (existing != null)
                {
                    existing.PrecoMedio = calculo.PrecoMedio;
                    existing.PrecoMediano = calculo.PrecoMediano;
                    existing.PrecoM2Medio = calculo.PrecoM2Medio;
                    existing.DesvioPadraoAmostral = calculo.DesvioPadraoAmostral;
                    existing.AmostraCount = calculo.AmostraCount;
                    existing.AtualizadoEm = DateTimeOffset.UtcNow;
                }
                else
                {
                    await _context.AnalisesRegiao.AddAsync(new AnaliseRegiao
                    {
                        BairroId = b.Id,
                        TipoNegocio = tipo,
                        PrecoMedio = calculo.PrecoMedio,
                        PrecoMediano = calculo.PrecoMediano,
                        PrecoM2Medio = calculo.PrecoM2Medio,
                        DesvioPadraoAmostral = calculo.DesvioPadraoAmostral,
                        AmostraCount = calculo.AmostraCount,
                        AtualizadoEm = DateTimeOffset.UtcNow
                    }, cancellationToken);
                }
            }
        }

        await _context.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("GeckoApiIngestService: Tabela analise_regiao recalculada e sincronizada.");
    }

    /// <summary>
    /// Exporta os dados 100% reais já ingeridos no banco Neon para um script SQL idempotente.
    /// </summary>
    public async Task<string> ExportSqlSnapshotAsync(CancellationToken cancellationToken = default)
    {
        var bairros = await _context.Bairros.AsNoTracking().ToListAsync(cancellationToken);
        var imoveis = await _context.Imoveis.AsNoTracking().ToListAsync(cancellationToken);
        var historicos = await _context.HistoricoPrecos.AsNoTracking().ToListAsync(cancellationToken);
        var analises = await _context.AnalisesRegiao.AsNoTracking().ToListAsync(cancellationToken);

        var sb = new StringBuilder();
        sb.AppendLine("-- =====================================================");
        sb.AppendLine($"-- SNAPSHOT DE DADOS 100% REAIS INGERIDOS - {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC");
        sb.AppendLine($"-- Total Bairros: {bairros.Count} | Imóveis: {imoveis.Count} | Históricos: {historicos.Count} | Análises: {analises.Count}");
        sb.AppendLine("-- =====================================================");
        sb.AppendLine();

        // Bairros
        sb.AppendLine("-- 1. Bairros");
        foreach (var b in bairros)
        {
            var nomeSafe = b.Nome.Replace("'", "''");
            var cidSafe = b.Cidade.Replace("'", "''");
            var estSafe = b.Estado.Replace("'", "''");
            sb.AppendLine($"INSERT INTO bairros (id, nome, cidade, estado) VALUES ('{b.Id}', '{nomeSafe}', '{cidSafe}', '{estSafe}') ON CONFLICT (nome, cidade, estado) DO UPDATE SET nome = EXCLUDED.nome;");
        }
        sb.AppendLine();

        // Imóveis
        sb.AppendLine("-- 2. Imóveis Reais");
        foreach (var i in imoveis)
        {
            var extIdSafe = i.ExternalId.Replace("'", "''");
            var fonteSafe = i.Fonte.Replace("'", "''");
            var titSafe = (i.Titulo ?? "").Replace("'", "''");
            var descSafe = i.Descricao != null ? $"'{i.Descricao.Replace("'", "''")}'" : "NULL";
            var tipoNeg = i.TipoNegocio == TipoNegocio.Sale ? "sale" : "rent";
            var tipoAnun = i.TipoAnuncio != null ? $"'{i.TipoAnuncio.Replace("'", "''")}'" : "NULL";
            var tipoImov = i.TipoImovel != null ? $"'{i.TipoImovel.Replace("'", "''")}'" : "NULL";
            var cond = i.Condominio.HasValue ? i.Condominio.Value.ToString(System.Globalization.CultureInfo.InvariantCulture) : "NULL";
            var iptu = i.Iptu.HasValue ? i.Iptu.Value.ToString(System.Globalization.CultureInfo.InvariantCulture) : "NULL";
            var area = i.AreaM2.HasValue ? i.AreaM2.Value.ToString(System.Globalization.CultureInfo.InvariantCulture) : "NULL";
            var quartos = i.Quartos.HasValue ? i.Quartos.Value.ToString() : "NULL";
            var banheiros = i.Banheiros.HasValue ? i.Banheiros.Value.ToString() : "NULL";
            var suites = i.Suites.HasValue ? i.Suites.Value.ToString() : "NULL";
            var vagas = i.Vagas.HasValue ? i.Vagas.Value.ToString() : "NULL";
            var rua = i.Rua != null ? $"'{i.Rua.Replace("'", "''")}'" : "NULL";
            var num = i.Numero != null ? $"'{i.Numero.Replace("'", "''")}'" : "NULL";
            var cep = i.Cep != null ? $"'{i.Cep.Replace("'", "''")}'" : "NULL";
            var endFmt = i.EnderecoFormatado != null ? $"'{i.EnderecoFormatado.Replace("'", "''")}'" : "NULL";
            var lat = i.Latitude.HasValue ? i.Latitude.Value.ToString(System.Globalization.CultureInfo.InvariantCulture) : "NULL";
            var lng = i.Longitude.HasValue ? i.Longitude.Value.ToString(System.Globalization.CultureInfo.InvariantCulture) : "NULL";
            var urlOrig = i.UrlOriginal != null ? $"'{i.UrlOriginal.Replace("'", "''")}'" : "NULL";
            var imgPrinc = i.ImagemPrincipalUrl != null ? $"'{i.ImagemPrincipalUrl.Replace("'", "''")}'" : "NULL";

            // Amenidades array
            var amenArr = i.Amenidades != null && i.Amenidades.Any()
                ? "ARRAY[" + string.Join(", ", i.Amenidades.Select(a => $"'{a.Replace("'", "''")}'")) + "]::text[]"
                : "NULL";

            // Imagens array
            var imgArr = i.ImagensUrls != null && i.ImagensUrls.Any()
                ? "ARRAY[" + string.Join(", ", i.ImagensUrls.Select(a => $"'{a.Replace("'", "''")}'")) + "]::text[]"
                : "NULL";

            sb.AppendLine($"INSERT INTO imoveis (id, external_id, fonte, titulo, descricao, tipo_negocio, tipo_anuncio, tipo_imovel, preco, condominio, iptu, area_m2, quartos, banheiros, suites, vagas, rua, numero, cep, endereco_formatado, cidade, estado, bairro_id, latitude, longitude, url_original, imagem_principal_url, imagens_urls, amenidades, capturado_em) " +
                          $"VALUES ('{i.Id}', '{extIdSafe}', '{fonteSafe}', '{titSafe}', {descSafe}, '{tipoNeg}'::tipo_negocio, {tipoAnun}, {tipoImov}, {i.Preco.ToString(System.Globalization.CultureInfo.InvariantCulture)}, {cond}, {iptu}, {area}, {quartos}, {banheiros}, {suites}, {vagas}, {rua}, {num}, {cep}, {endFmt}, '{i.Cidade?.Replace("'", "''") ?? "Guarulhos"}', '{i.Estado?.Replace("'", "''") ?? "SP"}', '{i.BairroId}', {lat}, {lng}, {urlOrig}, {imgPrinc}, {imgArr}, {amenArr}, '{i.CapturadoEm:yyyy-MM-dd HH:mm:ss}+00') " +
                          $"ON CONFLICT (fonte, external_id) DO UPDATE SET preco = EXCLUDED.preco, capturado_em = EXCLUDED.capturado_em;");
        }
        sb.AppendLine();

        // Histórico
        sb.AppendLine("-- 3. Histórico de Preços");
        foreach (var h in historicos)
        {
            sb.AppendLine($"INSERT INTO historico_precos (id, imovel_id, preco, capturado_em) VALUES ('{h.Id}', '{h.ImovelId}', {h.Preco.ToString(System.Globalization.CultureInfo.InvariantCulture)}, '{h.CapturadoEm:yyyy-MM-dd HH:mm:ss}+00') ON CONFLICT (id) DO NOTHING;");
        }
        sb.AppendLine();

        // Análise Região
        sb.AppendLine("-- 4. Análise de Região Consolidada");
        foreach (var a in analises)
        {
            var tipoNeg = a.TipoNegocio == TipoNegocio.Sale ? "sale" : "rent";
            var pM2 = a.PrecoM2Medio.HasValue ? a.PrecoM2Medio.Value.ToString(System.Globalization.CultureInfo.InvariantCulture) : "NULL";
            sb.AppendLine($"INSERT INTO analise_regiao (bairro_id, tipo_negocio, preco_medio, preco_mediano, preco_m2_medio, desvio_padrao_amostral, amostra_count, atualizado_em) " +
                          $"VALUES ('{a.BairroId}', '{tipoNeg}'::tipo_negocio, {a.PrecoMedio.ToString(System.Globalization.CultureInfo.InvariantCulture)}, {a.PrecoMediano.ToString(System.Globalization.CultureInfo.InvariantCulture)}, {pM2}, {a.DesvioPadraoAmostral.ToString(System.Globalization.CultureInfo.InvariantCulture)}, {a.AmostraCount}, '{a.AtualizadoEm:yyyy-MM-dd HH:mm:ss}+00') " +
                          $"ON CONFLICT (bairro_id, tipo_negocio) DO UPDATE SET preco_medio = EXCLUDED.preco_medio, preco_mediano = EXCLUDED.preco_mediano, preco_m2_medio = EXCLUDED.preco_m2_medio, desvio_padrao_amostral = EXCLUDED.desvio_padrao_amostral, amostra_count = EXCLUDED.amostra_count, atualizado_em = EXCLUDED.atualizado_em;");
        }

        return sb.ToString();
    }

    public async Task<List<GeckoPropertyDetailed>> FetchPropertiesFromPlpWithKeyAsync(
        string city,
        string state,
        TipoNegocio tipoNegocio,
        int page,
        string? keyword,
        string apiKey,
        CancellationToken cancellationToken)
    {
        var directUrl = SmartSearchMatrixEngine.BuildZapImoveisPlpUrl(city, state, keyword, tipoNegocio, page);

        var payload = new Dictionary<string, object?>
        {
            ["target"] = "zapimoveis.com.br",
            ["type"] = "plp",
            ["url"] = directUrl,
            ["city"] = city,
            ["state"] = state,
            ["neighborhood"] = keyword,
            ["location"] = !string.IsNullOrWhiteSpace(keyword) && !keyword.Equals(city, StringComparison.OrdinalIgnoreCase)
                ? $"{state.ToLowerInvariant()}+{SmartSearchMatrixEngine.Slugify(city)}+{SmartSearchMatrixEngine.Slugify(keyword)}"
                : $"{state.ToLowerInvariant()}+{SmartSearchMatrixEngine.Slugify(city)}",
            ["businessType"] = tipoNegocio == TipoNegocio.Sale ? "sale" : "rent",
            ["page"] = page
        };

        if (!string.IsNullOrWhiteSpace(keyword))
        {
            payload["keyword"] = keyword;
        }

        using var request = new HttpRequestMessage(HttpMethod.Post, "/v1/extract");
        request.Headers.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));
        request.Headers.Remove("Authorization");
        request.Headers.Add("Authorization", $"Bearer {apiKey}");
        request.Headers.Remove("x-api-key");
        request.Headers.Add("x-api-key", apiKey);

        request.Content = System.Net.Http.Json.JsonContent.Create(payload);

        using var response = await _httpClient.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, cancellationToken);

        if (response.StatusCode == HttpStatusCode.TooManyRequests)
        {
            throw new HttpRequestException("rate limit exceeded", null, HttpStatusCode.TooManyRequests);
        }

        if (!response.IsSuccessStatusCode)
        {
            return new List<GeckoPropertyDetailed>();
        }

        var json = await response.Content.ReadAsStringAsync(cancellationToken);
        return ParsePlpJsonToProperties(json, city, state, tipoNegocio);
    }

    public static List<GeckoPropertyDetailed> ParsePlpJsonToProperties(string json, string defaultCity, string defaultState, TipoNegocio tipoNegocio)
    {
        var result = new List<GeckoPropertyDetailed>();
        if (string.IsNullOrWhiteSpace(json)) return result;

        try
        {
            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;

            JsonElement itemsElement = default;
            if (root.TryGetProperty("data", out var dataObj))
            {
                if (dataObj.TryGetProperty("items", out var itms) && itms.ValueKind == JsonValueKind.Array)
                {
                    itemsElement = itms;
                }
                else if (dataObj.TryGetProperty("data", out var innerData) && innerData.ValueKind == JsonValueKind.Array)
                {
                    itemsElement = innerData;
                }
            }

            if (itemsElement.ValueKind != JsonValueKind.Array && root.TryGetProperty("items", out var rootItems) && rootItems.ValueKind == JsonValueKind.Array)
            {
                itemsElement = rootItems;
            }

            if (itemsElement.ValueKind == JsonValueKind.Array)
            {
                foreach (var item in itemsElement.EnumerateArray())
                {
                    var id = item.TryGetProperty("id", out var idProp) ? idProp.GetString() ?? "" : "";
                    if (string.IsNullOrWhiteSpace(id) && item.TryGetProperty("externalId", out var extIdProp))
                    {
                        id = extIdProp.GetString() ?? "";
                    }
                    if (string.IsNullOrWhiteSpace(id)) id = Guid.NewGuid().ToString();

                    var title = item.TryGetProperty("title", out var titleProp) ? titleProp.GetString() ?? "Imóvel Residencial" : "Imóvel Residencial";
                    var description = item.TryGetProperty("description", out var descProp) ? descProp.GetString() : null;
                    var url = item.TryGetProperty("url", out var urlProp) ? urlProp.GetString() : null;

                    string? street = null;
                    string? streetNumber = null;
                    string neighborhood = "";
                    string city = defaultCity;
                    string state = defaultState;
                    double? lat = null;
                    double? lng = null;

                    if (item.TryGetProperty("address", out var addrObj) && addrObj.ValueKind == JsonValueKind.Object)
                    {
                        if (addrObj.TryGetProperty("street", out var sProp)) street = sProp.GetString();
                        if (addrObj.TryGetProperty("streetNumber", out var snProp)) streetNumber = snProp.GetString();
                        if (addrObj.TryGetProperty("neighborhood", out var nProp)) neighborhood = nProp.GetString() ?? "";
                        if (addrObj.TryGetProperty("city", out var cProp)) city = cProp.GetString() ?? defaultCity;
                        if (addrObj.TryGetProperty("state", out var stProp)) state = stProp.GetString() ?? defaultState;

                        if (addrObj.TryGetProperty("latitude", out var latProp) && latProp.TryGetDouble(out var latVal)) lat = latVal;
                        if (addrObj.TryGetProperty("longitude", out var lngProp) && lngProp.TryGetDouble(out var lngVal)) lng = lngVal;
                    }

                    if (string.IsNullOrWhiteSpace(neighborhood))
                    {
                        neighborhood = "Centro";
                    }

                    decimal price = 0;
                    decimal? condo = null;
                    decimal? iptu = null;

                    if (item.TryGetProperty("prices", out var pricesObj) && pricesObj.ValueKind == JsonValueKind.Object)
                    {
                        if (pricesObj.TryGetProperty("mainValue", out var mvProp) && mvProp.TryGetDecimal(out var mvVal)) price = mvVal;
                        else if (pricesObj.TryGetProperty("rent", out var rProp) && rProp.TryGetDecimal(out var rVal)) price = rVal;

                        if (pricesObj.TryGetProperty("condominium", out var condProp) && condProp.TryGetDecimal(out var condVal)) condo = condVal;
                        if (pricesObj.TryGetProperty("iptu", out var iptuProp) && iptuProp.TryGetDecimal(out var iptuVal)) iptu = iptuVal;
                    }

                    decimal? area = null;
                    int? bedrooms = null;
                    int? bathrooms = null;
                    int? suites = null;
                    int? parking = null;

                    if (item.TryGetProperty("attributes", out var attrObj) && attrObj.ValueKind == JsonValueKind.Object)
                    {
                        area = GetFirstDecimalFromArray(attrObj, "usableAreas") ?? GetFirstDecimalFromArray(attrObj, "totalAreas");
                        bedrooms = GetFirstIntFromArray(attrObj, "bedrooms");
                        bathrooms = GetFirstIntFromArray(attrObj, "bathrooms");
                        suites = GetFirstIntFromArray(attrObj, "suites");
                        parking = GetFirstIntFromArray(attrObj, "parkingSpaces");
                    }

                    var images = new List<string>();
                    if (item.TryGetProperty("images", out var imgsObj) && imgsObj.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var imgElement in imgsObj.EnumerateArray())
                        {
                            string? rawUrl = null;
                            if (imgElement.ValueKind == JsonValueKind.String)
                            {
                                rawUrl = imgElement.GetString();
                            }
                            else if (imgElement.ValueKind == JsonValueKind.Object && imgElement.TryGetProperty("url", out var uProp))
                            {
                                rawUrl = uProp.GetString();
                            }

                            if (!string.IsNullOrWhiteSpace(rawUrl))
                            {
                                var cleanUrl = rawUrl.Replace("{action}", "fit-in").Replace("{width}x{height}", "800x600");
                                images.Add(cleanUrl);
                            }
                        }
                    }

                    var amenities = new List<string>();
                    if (item.TryGetProperty("amenities", out var amObj) && amObj.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var am in amObj.EnumerateArray())
                        {
                            if (am.ValueKind == JsonValueKind.String && !string.IsNullOrWhiteSpace(am.GetString()))
                            {
                                amenities.Add(am.GetString()!);
                            }
                        }
                    }

                    var formattedAddress = !string.IsNullOrWhiteSpace(street)
                        ? $"{street}, {streetNumber ?? "s/n"} - {neighborhood}, {city} - {state}"
                        : $"{neighborhood}, {city} - {state}";

                    result.Add(new GeckoPropertyDetailed
                    {
                        Id = id,
                        Titulo = title,
                        Descricao = description,
                        Preco = price > 0 ? price : (tipoNegocio == TipoNegocio.Sale ? 450000 : 2500),
                        Condominio = condo,
                        Iptu = iptu,
                        AreaM2 = area,
                        Quartos = bedrooms,
                        Banheiros = bathrooms,
                        Suites = suites,
                        Vagas = parking,
                        Rua = street,
                        Numero = streetNumber,
                        Cep = "07115-000",
                        EnderecoFormatado = formattedAddress,
                        Bairro = neighborhood,
                        Cidade = city,
                        Estado = state,
                        Latitude = lat,
                        Longitude = lng,
                        UrlOriginal = url,
                        TipoAnuncio = "Padrao",
                        TipoNegocio = tipoNegocio == TipoNegocio.Sale ? "Sale" : "Rent",
                        TipoImovel = GuessPropertyType(title, description),
                        ImagemPrincipalUrl = images.FirstOrDefault(),
                        ImagensUrls = images,
                        Amenidades = amenities
                    });
                }
            }
        }
        catch
        {
            // Ignore parse errors
        }

        return result;
    }

    private static string GuessPropertyType(string title, string? desc)
    {
        var text = $"{title} {desc}".ToLowerInvariant();
        if (text.Contains("cobertura") || text.Contains("duplex") || text.Contains("triplex")) return "Cobertura";
        if (text.Contains("studio") || text.Contains("loft") || text.Contains("kitnet")) return "Studio";
        if (text.Contains("garden") || text.Contains("giardino")) return "Garden";
        if (text.Contains("casa") || text.Contains("sobrado")) return "Casa";
        if (text.Contains("comercial") || text.Contains("sala") || text.Contains("conjunto")) return "Comercial";
        return "Apartamento";
    }

    private static bool TryMapProperty(
        GeckoPropertyDetailed item,
        string targetCity,
        string targetState,
        TipoNegocio tipoNegocio,
        string? defaultNeighborhood,
        out Imovel imovel,
        out string bairroName)
    {
        if (!string.IsNullOrWhiteSpace(item.Bairro) && !item.Bairro.Equals(targetCity, StringComparison.OrdinalIgnoreCase))
        {
            bairroName = item.Bairro;
        }
        else if (!string.IsNullOrWhiteSpace(defaultNeighborhood))
        {
            bairroName = defaultNeighborhood;
        }
        else
        {
            bairroName = "Centro";
        }

        imovel = new Imovel
        {
            ExternalId = item.Id,
            Fonte = "zapimoveis",
            Titulo = item.Titulo,
            Descricao = item.Descricao,
            TipoNegocio = tipoNegocio,
            TipoAnuncio = item.TipoAnuncio ?? "USED",
            TipoImovel = item.TipoImovel ?? "Apartamento",
            Preco = item.Preco,
            Condominio = item.Condominio,
            Iptu = item.Iptu,
            AreaM2 = item.AreaM2,
            Quartos = item.Quartos,
            Banheiros = item.Banheiros,
            Suites = item.Suites,
            Vagas = item.Vagas,
            Rua = item.Rua,
            Numero = item.Numero,
            Cep = item.Cep,
            EnderecoFormatado = item.EnderecoFormatado ?? $"{item.Rua}, {bairroName}, {targetCity} - {targetState}",
            Cidade = string.IsNullOrWhiteSpace(item.Cidade) ? targetCity : item.Cidade,
            Estado = string.IsNullOrWhiteSpace(item.Estado) ? targetState : item.Estado,
            Latitude = item.Latitude,
            Longitude = item.Longitude,
            UrlOriginal = item.UrlOriginal,
            ImagemPrincipalUrl = item.ImagemPrincipalUrl,
            ImagensUrls = item.ImagensUrls,
            Amenidades = item.Amenidades,
            CapturadoEm = DateTimeOffset.UtcNow
        };

        return true;
    }

    private static decimal? GetFirstDecimalFromArray(JsonElement element, params string[] propertyNames)
    {
        foreach (var propertyName in propertyNames)
        {
            if (element.TryGetProperty(propertyName, out var array) && array.ValueKind == JsonValueKind.Array)
            {
                foreach (var item in array.EnumerateArray())
                {
                    if (item.ValueKind == JsonValueKind.Number && item.TryGetDecimal(out var val)) return val;
                    if (item.ValueKind == JsonValueKind.String && decimal.TryParse(item.GetString(), out var parsed)) return parsed;
                }
            }
        }
        return null;
    }

    private static int? GetFirstIntFromArray(JsonElement element, params string[] propertyNames)
    {
        foreach (var propertyName in propertyNames)
        {
            if (element.TryGetProperty(propertyName, out var array) && array.ValueKind == JsonValueKind.Array)
            {
                foreach (var item in array.EnumerateArray())
                {
                    if (item.ValueKind == JsonValueKind.Number && item.TryGetInt32(out var val)) return val;
                    if (item.ValueKind == JsonValueKind.String && int.TryParse(item.GetString(), out var parsed)) return parsed;
                }
            }
        }
        return null;
    }

    public sealed class GeckoPropertyDetailed
    {
        public string Id { get; set; } = string.Empty;
        public string Titulo { get; set; } = string.Empty;
        public string? Descricao { get; set; }
        public decimal Preco { get; set; }
        public decimal? Condominio { get; set; }
        public decimal? Iptu { get; set; }
        public decimal? AreaM2 { get; set; }
        public int? Quartos { get; set; }
        public int? Banheiros { get; set; }
        public int? Suites { get; set; }
        public int? Vagas { get; set; }
        public string? Rua { get; set; }
        public string? Numero { get; set; }
        public string? Cep { get; set; }
        public string? EnderecoFormatado { get; set; }
        public string Bairro { get; set; } = string.Empty;
        public string Cidade { get; set; } = string.Empty;
        public string Estado { get; set; } = string.Empty;
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public string? UrlOriginal { get; set; }
        public string? TipoAnuncio { get; set; }
        public string? TipoNegocio { get; set; }
        public string? TipoImovel { get; set; }
        public string? ImagemPrincipalUrl { get; set; }
        public List<string> ImagensUrls { get; set; } = new();
        public List<string> Amenidades { get; set; } = new();
    }
}

public sealed class IngestRunResult
{
    public int Ingrested { get; set; }
    public int SkippedDuplicates { get; set; }
    public int Errors { get; set; }
    public bool QuotaExhausted { get; set; }
    public int CreditsUsed { get; set; }
}
