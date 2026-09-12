using AppImoveis.Domain.Entities;

namespace AppImoveis.Application.Services;

public sealed record IndicadorViolencia(TipoCrime TipoCrime, int Ocorrencias, decimal TaxaPorMil, decimal Peso, decimal Contribuicao);

public sealed record AnaliseViolencia(
    Guid BairroId,
    string BairroNome,
    int? PopulacaoEstimada,
    int TotalOcorrencias,
    decimal IndiceSeguranca,
    string Nivel,
    IReadOnlyList<IndicadorViolencia> Indicadores,
    DateTimeOffset AtualizadoEm,
    string Fonte);

public static class MapaViolenciaService
{
    private static readonly IReadOnlyDictionary<TipoCrime, decimal> Pesos = new Dictionary<TipoCrime, decimal>
    {
        [TipoCrime.Homicidio] = 0.35m,
        [TipoCrime.Roubo] = 0.25m,
        [TipoCrime.Furto] = 0.15m,
        [TipoCrime.RouboVeiculo] = 0.10m,
        [TipoCrime.FurtoVeiculo] = 0.10m,
        [TipoCrime.Estupro] = 0.05m
    };

    public static IReadOnlyList<AnaliseViolencia> Calcular(
        IEnumerable<Bairro> bairros,
        IEnumerable<OcorrenciaCriminal> ocorrencias,
        DateOnly inicio,
        DateOnly fim)
    {
        var crimesPorBairro = ocorrencias
            .Where(o => o.DataOcorrencia >= inicio && o.DataOcorrencia <= fim)
            .GroupBy(o => o.BairroId)
            .ToDictionary(g => g.Key, g => g.ToList());

        var taxasMaximas = Pesos.Keys.ToDictionary(
            tipo => tipo,
            tipo => bairros.Select(b => Taxa(crimesPorBairro.GetValueOrDefault(b.Id)?.Count(o => o.TipoCrime == tipo) ?? 0, b.PopulacaoEstimada)).DefaultIfEmpty(0m).Max());

        return bairros.OrderBy(b => b.Nome).Select(b =>
        {
            var crimes = crimesPorBairro.GetValueOrDefault(b.Id) ?? new List<OcorrenciaCriminal>();
            var indicadores = Pesos.Keys.Select(tipo =>
            {
                var taxa = Taxa(crimes.Count(o => o.TipoCrime == tipo), b.PopulacaoEstimada);
                var intensidade = taxasMaximas[tipo] == 0 ? 0 : Math.Min(1m, taxa / taxasMaximas[tipo]);
                return new IndicadorViolencia(tipo, crimes.Count(o => o.TipoCrime == tipo), taxa, Pesos[tipo], intensidade * 100m);
            }).ToList();
            var risco = indicadores.Sum(i => i.Contribuicao * i.Peso);
            var indice = Math.Round(Math.Max(0m, 100m - risco), 1);

            return new AnaliseViolencia(b.Id, b.Nome, b.PopulacaoEstimada, crimes.Count, indice, Nivel(indice), indicadores, DateTimeOffset.UtcNow, "SSP-SP");
        }).ToList();
    }

    private static decimal Taxa(int ocorrencias, int? populacao) => populacao is > 0 ? Math.Round(ocorrencias / (decimal)populacao.Value * 1000m, 2) : 0m;

    private static string Nivel(decimal indice) => indice >= 80 ? "baixo" : indice >= 60 ? "moderado" : indice >= 40 ? "alto" : "muito alto";
}
