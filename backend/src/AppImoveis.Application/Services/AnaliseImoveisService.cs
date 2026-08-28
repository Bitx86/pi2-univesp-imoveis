using AppImoveis.Domain.Entities;

namespace AppImoveis.Application.Services;

public static class AnaliseImoveisService
{
    public static AnaliseRegiao CalcularAnalise(IEnumerable<Imovel> imoveis, TipoNegocio tipoNegocio)
    {
        var lista = imoveis.Where(i => i.TipoNegocio == tipoNegocio && i.Preco > 0).ToList();
        if (!lista.Any())
        {
            return new AnaliseRegiao
            {
                TipoNegocio = tipoNegocio,
                PrecoMedio = 0,
                PrecoMediano = 0,
                PrecoM2Medio = 0,
                DesvioPadraoAmostral = 0,
                AmostraCount = 0,
                AtualizadoEm = DateTimeOffset.UtcNow
            };
        }

        var precos = lista.Select(x => x.Preco).OrderBy(x => x).ToList();
        var precoMedio = precos.Average();
        var precoMediano = CalcularMediana(precos);
        var precoM2 = lista
            .Where(x => x.AreaM2.HasValue && x.AreaM2 > 0)
            .Select(x => x.Preco / x.AreaM2.Value)
            .ToList();
        var precoM2Medio = precoM2.Any() ? precoM2.Average() : 0m;
        var desvioPadrao = CalcularDesvioPadraoAmostral(precos, precoMedio);

        return new AnaliseRegiao
        {
            BairroId = lista.First().BairroId,
            TipoNegocio = tipoNegocio,
            PrecoMedio = precoMedio,
            PrecoMediano = precoMediano,
            PrecoM2Medio = precoM2Medio,
            DesvioPadraoAmostral = desvioPadrao,
            AmostraCount = lista.Count,
            AtualizadoEm = DateTimeOffset.UtcNow
        };
    }

    public static decimal CalcularMediana(IList<decimal> valores)
    {
        if (valores.Count == 0) return 0m;

        var ordenados = valores.OrderBy(v => v).ToList();
        var meio = ordenados.Count / 2;

        if (ordenados.Count % 2 == 0)
        {
            return (ordenados[meio - 1] + ordenados[meio]) / 2m;
        }

        return ordenados[meio];
    }

    public static decimal CalcularDesvioPadraoAmostral(IList<decimal> valores, decimal media)
    {
        if (valores.Count < 2) return 0m;

        var variancia = valores.Select(v => (v - media) * (v - media)).Sum() / (valores.Count - 1);
        return Convert.ToDecimal(Math.Sqrt(Convert.ToDouble(variancia)));
    }

    public static string ClassificarPreco(decimal precoAnuncio, decimal precoMedio)
    {
        if (precoMedio <= 0) return "justo";

        var deltaPercent = ((precoAnuncio - precoMedio) / precoMedio) * 100m;

        if (deltaPercent <= -10m) return "barato";
        if (deltaPercent >= 10m) return "caro";
        return "justo";
    }
}
