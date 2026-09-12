using AppImoveis.Application.Services;
using AppImoveis.Domain.Entities;

namespace AppImoveis.Tests;

public class MapaViolenciaServiceTests
{
    [Fact]
    public void Calcular_DeveNormalizarTaxasPorMilEOrdenarBairros()
    {
        var primeiro = new Bairro { Id = Guid.NewGuid(), Nome = "Centro", Cidade = "Guarulhos", Estado = "SP", PopulacaoEstimada = 1_000 };
        var segundo = new Bairro { Id = Guid.NewGuid(), Nome = "Vila Maia", Cidade = "Guarulhos", Estado = "SP", PopulacaoEstimada = 2_000 };
        var ocorrencias = new List<OcorrenciaCriminal>
        {
            new() { BairroId = primeiro.Id, TipoCrime = TipoCrime.Roubo, DataOcorrencia = new DateOnly(2026, 1, 10) },
            new() { BairroId = segundo.Id, TipoCrime = TipoCrime.Roubo, DataOcorrencia = new DateOnly(2026, 1, 10) }
        };

        var result = MapaViolenciaService.Calcular(
            new[] { segundo, primeiro },
            ocorrencias,
            new DateOnly(2026, 1, 1),
            new DateOnly(2026, 12, 31));

        Assert.Equal("Centro", result[0].BairroNome);
        Assert.Equal(1m, result[0].Indicadores.Single(i => i.TipoCrime == TipoCrime.Roubo).TaxaPorMil);
        Assert.Equal(0.5m, result[1].Indicadores.Single(i => i.TipoCrime == TipoCrime.Roubo).TaxaPorMil);
        Assert.True(result[1].IndiceSeguranca > result[0].IndiceSeguranca);
    }

    [Fact]
    public void Calcular_DeveIgnorarOcorrenciasForaDoPeriodo()
    {
        var bairro = new Bairro { Id = Guid.NewGuid(), Nome = "Centro", Cidade = "Guarulhos", Estado = "SP", PopulacaoEstimada = 1_000 };
        var ocorrencia = new OcorrenciaCriminal { BairroId = bairro.Id, TipoCrime = TipoCrime.Homicidio, DataOcorrencia = new DateOnly(2025, 12, 31) };

        var result = MapaViolenciaService.Calcular(new[] { bairro }, new[] { ocorrencia }, new DateOnly(2026, 1, 1), new DateOnly(2026, 12, 31));

        Assert.Equal(0, result[0].TotalOcorrencias);
        Assert.Equal(100m, result[0].IndiceSeguranca);
    }
}
