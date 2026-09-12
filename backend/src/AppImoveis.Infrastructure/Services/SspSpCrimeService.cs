using System.Net.Http.Json;
using System.Text.Json.Serialization;

namespace AppImoveis.Infrastructure.Services;

public sealed class SspSpCrimeService
{
    private readonly HttpClient _httpClient;
    private static readonly SemaphoreSlim DistrictCacheLock = new(1, 1);
    private static readonly Dictionary<int, (IReadOnlyList<SspDistrictCrimeData> Data, DateTimeOffset ExpiresAt)> DistrictCache = new();
    private static readonly TimeSpan DistrictCacheDuration = TimeSpan.FromMinutes(15);

    public SspSpCrimeService(HttpClient httpClient)
    {
        _httpClient = httpClient;
        _httpClient.BaseAddress = new Uri("https://www.ssp.sp.gov.br/");
    }

    public async Task<SspMunicipioCrimeData> GetGuarulhosAsync(CancellationToken cancellationToken = default)
    {
        const int guarulhosId = 215;
        var ocorrencias = await _httpClient.GetFromJsonAsync<SspResponse<List<SspAnnualCrime>>>(
            $"v1/OcorrenciasAnuais/recuperaDadosMunicipio?idMunicipio={guarulhosId}", cancellationToken);
        var taxas = await _httpClient.GetFromJsonAsync<SspResponse<List<SspCrimeRate>>>(
            $"v1/TaxaDelito/RecuperaDadosMunicipio?idMunicipio={guarulhosId}", cancellationToken);

        var annual = ocorrencias?.Data?.OrderByDescending(x => x.Ano).FirstOrDefault()
            ?? throw new InvalidOperationException("A SSP-SP não retornou ocorrências anuais para Guarulhos.");
        var rate = taxas?.Data?.OrderByDescending(x => x.Ano).FirstOrDefault(x => x.Ano == annual.Ano.ToString())
            ?? throw new InvalidOperationException("A SSP-SP não retornou taxas para Guarulhos.");

        return new SspMunicipioCrimeData(annual, rate);
    }

    public async Task<IReadOnlyList<SspDistrictCrimeData>> GetNearbyDistrictsAsync(int year, bool forceRefresh = false, CancellationToken cancellationToken = default)
    {
        if (!forceRefresh && DistrictCache.TryGetValue(year, out var cached) && cached.ExpiresAt > DateTimeOffset.UtcNow) return cached.Data;
        await DistrictCacheLock.WaitAsync(cancellationToken);
        try
        {
            if (!forceRefresh && DistrictCache.TryGetValue(year, out cached) && cached.ExpiresAt > DateTimeOffset.UtcNow) return cached.Data;
            DistrictCache.Remove(year);
            var data = await LoadNearbyDistrictsAsync(year, cancellationToken);
            DistrictCache[year] = (data, DateTimeOffset.UtcNow.Add(DistrictCacheDuration));
            return data;
        }
        finally
        {
            DistrictCacheLock.Release();
        }
    }

    private async Task<IReadOnlyList<SspDistrictCrimeData>> LoadNearbyDistrictsAsync(int year, CancellationToken cancellationToken)
    {
        var response = await _httpClient.GetFromJsonAsync<SspResponse<List<SspDistrict>>>("v1/Distritos/RecuperaDistritos", cancellationToken);
        var districts = response?.Data?.Where(IsRelevantDistrict).ToList() ?? new List<SspDistrict>();
        var requests = districts.Select(async district =>
        {
            var endpoint = $"v1/OcorrenciasMensais/RecuperaDadosMensaisAgrupados?ano={year}&grupoDelito=6&tipoGrupo=DISTRITO&idGrupo={district.IdDistrito}";
            var crimeResponse = await _httpClient.GetFromJsonAsync<SspResponse<List<SspDistrictYear>>>(endpoint, cancellationToken);
            // The SSP endpoint may return the latest available year when the requested
            // year has no publication. Never silently relabel that response.
            var annualYear = crimeResponse?.Data?.FirstOrDefault(item => item.Ano == year);
            return annualYear?.ListaDados is { Count: > 0 }
                ? new SspDistrictCrimeData(district, annualYear.Ano, Summarize(annualYear.ListaDados), MunicipalityName(district.IdMunicipio))
                : null;
        });

        var results = await Task.WhenAll(requests);
        return results.Where(result => result is not null).Cast<SspDistrictCrimeData>().ToList();
    }

    private static bool IsRelevantDistrict(SspDistrict district)
    {
        if (!district.Sigla.Contains("DP", StringComparison.OrdinalIgnoreCase)) return false;

        var nearbyMunicipalities = new[] { 45, 102, 183, 190, 215, 267, 323, 447, 526, 588 };
        if (nearbyMunicipalities.Contains(district.IdMunicipio) && district.IdMunicipio != 565) return true;

        if (district.IdMunicipio != 565) return false;
        var nearbySaoPauloDistricts = new[] { "Penha", "Vila Maria", "Agua Fria", "Sao Miguel Paulista", "Ponte Rasa", "Vila Matilde", "Vila Diva", "Vila Gustavo", "Vila Amelia", "Vila Santa Maria", "Ermelino Matarazzo", "Vila Jacui", "Jardim Robru", "Jacomana", "Jardim Noemia", "Parque Novo Mundo", "Jacana" };
        return nearbySaoPauloDistricts.Any(name => Normalize(district.Sigla).Contains(Normalize(name)));
    }

    private static SspDistrictCrimeSummary Summarize(IEnumerable<SspDistrictCrimeRow> rows)
    {
        var rowList = rows.ToList();
        return new SspDistrictCrimeSummary(
            Total(rowList, 38),
            Total(rowList, 30) + Total(rowList, 37) + Total(rowList, 46),
            Total(rowList, 21) + Total(rowList, 22),
            Total(rowList, 37),
            Total(rowList, 22),
            Total(rowList, 36));
    }

    private static int Total(IEnumerable<SspDistrictCrimeRow> rows, int crimeId) => rows.FirstOrDefault(row => row.IdDelito == crimeId)?.Total ?? 0;
    private static string MunicipalityName(int id) => id switch
    {
        45 => "Aruja",
        102 => "Caieiras",
        183 => "Ferraz de Vasconcelos",
        190 => "Franco da Rocha",
        215 => "Guarulhos",
        267 => "Itaquaquecetuba",
        323 => "Mairipora",
        447 => "Poá",
        526 => "Santa Isabel",
        565 => "Sao Paulo",
        588 => "Suzano",
        _ => "Entorno de Guarulhos"
    };

    private static string Normalize(string value) => value.Normalize(System.Text.NormalizationForm.FormD).Where(c => System.Globalization.CharUnicodeInfo.GetUnicodeCategory(c) != System.Globalization.UnicodeCategory.NonSpacingMark).Aggregate(string.Empty, (current, c) => current + c).ToLowerInvariant();
}

public sealed record SspMunicipioCrimeData(SspAnnualCrime Ocorrencias, SspCrimeRate Taxas);
public sealed record SspDistrictCrimeData(SspDistrict District, int Year, SspDistrictCrimeSummary Summary, string Municipality);
public sealed record SspDistrictCrimeSummary(int Homicidios, int Roubos, int Furtos, int RoubosVeiculo, int FurtosVeiculo, int Estupros);

public sealed class SspResponse<T>
{
    [JsonPropertyName("data")]
    public T? Data { get; set; }
}

public sealed class SspAnnualCrime
{
    [JsonPropertyName("ano")] public int Ano { get; set; }
    [JsonPropertyName("homicidio")] public int Homicidio { get; set; }
    [JsonPropertyName("furto")] public int Furto { get; set; }
    [JsonPropertyName("roubo")] public int Roubo { get; set; }
    [JsonPropertyName("frv")] public int FurtoERouboVeiculo { get; set; }
}

public sealed class SspCrimeRate
{
    [JsonPropertyName("ano")] public string Ano { get; set; } = string.Empty;
    [JsonPropertyName("homicidios")] public string Homicidios { get; set; } = string.Empty;
    [JsonPropertyName("furtos")] public string Furtos { get; set; } = string.Empty;
    [JsonPropertyName("roubos")] public string Roubos { get; set; } = string.Empty;
    [JsonPropertyName("furtoVeiculo")] public string FurtosVeiculo { get; set; } = string.Empty;
    [JsonPropertyName("rouboVeiculo")] public string RoubosVeiculo { get; set; } = string.Empty;
    [JsonPropertyName("frvHabitantes")] public string FurtosERouboVeiculoPorHabitantes { get; set; } = string.Empty;
}

public sealed class SspDistrict
{
    [JsonPropertyName("idDistrito")] public int IdDistrito { get; set; }
    [JsonPropertyName("idMunicipio")] public int IdMunicipio { get; set; }
    [JsonPropertyName("sigla")] public string Sigla { get; set; } = string.Empty;
}

public sealed class SspDistrictYear
{
    [JsonPropertyName("ano")] public int Ano { get; set; }
    [JsonPropertyName("listaDados")] public List<SspDistrictCrimeRow> ListaDados { get; set; } = new();
}

public sealed class SspDistrictCrimeRow
{
    [JsonPropertyName("idDelito")] public int IdDelito { get; set; }
    [JsonPropertyName("total")] public int Total { get; set; }
}
