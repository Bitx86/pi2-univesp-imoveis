using AppImoveis.Application.Services;
using AppImoveis.Domain.Entities;

namespace AppImoveis.Tests;

public class AnaliseImoveisServiceTests
{
    [Fact]
    public void CalcularAnalise_DeveRetornarMediaMedianaEDesvioPadraoCorretos()
    {
        var imoveis = new List<Imovel>
        {
            new() { Id = Guid.NewGuid(), BairroId = Guid.NewGuid(), TipoNegocio = TipoNegocio.Sale, Preco = 500000m, AreaM2 = 60m },
            new() { Id = Guid.NewGuid(), BairroId = Guid.NewGuid(), TipoNegocio = TipoNegocio.Sale, Preco = 600000m, AreaM2 = 70m },
            new() { Id = Guid.NewGuid(), BairroId = Guid.NewGuid(), TipoNegocio = TipoNegocio.Sale, Preco = 700000m, AreaM2 = 80m },
            new() { Id = Guid.NewGuid(), BairroId = Guid.NewGuid(), TipoNegocio = TipoNegocio.Sale, Preco = 800000m, AreaM2 = 90m },
            new() { Id = Guid.NewGuid(), BairroId = Guid.NewGuid(), TipoNegocio = TipoNegocio.Sale, Preco = 900000m, AreaM2 = 100m }
        };

        var result = AnaliseImoveisService.CalcularAnalise(imoveis, TipoNegocio.Sale);

        Assert.Equal(700000m, result.PrecoMedio);
        Assert.Equal(700000m, result.PrecoMediano);
        Assert.Equal(158113.883008419m, result.DesvioPadraoAmostral);
        Assert.Equal(5, result.AmostraCount);
    }

    [Fact]
    public void EstimarPreco_DeveClassificarComoBaratoJustoOuCaro()
    {
        var bairroId = Guid.NewGuid();
        var imoveis = new List<Imovel>
        {
            new() { Id = Guid.NewGuid(), BairroId = bairroId, TipoNegocio = TipoNegocio.Sale, Preco = 500000m, AreaM2 = 60m },
            new() { Id = Guid.NewGuid(), BairroId = bairroId, TipoNegocio = TipoNegocio.Sale, Preco = 550000m, AreaM2 = 60m },
            new() { Id = Guid.NewGuid(), BairroId = bairroId, TipoNegocio = TipoNegocio.Sale, Preco = 600000m, AreaM2 = 60m },
            new() { Id = Guid.NewGuid(), BairroId = bairroId, TipoNegocio = TipoNegocio.Sale, Preco = 650000m, AreaM2 = 60m },
            new() { Id = Guid.NewGuid(), BairroId = bairroId, TipoNegocio = TipoNegocio.Sale, Preco = 700000m, AreaM2 = 60m }
        };

        var analise = AnaliseImoveisService.CalcularAnalise(imoveis, TipoNegocio.Sale);

        var barato = AnaliseImoveisService.ClassificarPreco(500000m, analise.PrecoMedio);
        var justo = AnaliseImoveisService.ClassificarPreco(600000m, analise.PrecoMedio);
        var caro = AnaliseImoveisService.ClassificarPreco(850000m, analise.PrecoMedio);

        Assert.Equal("barato", barato);
        Assert.Equal("justo", justo);
        Assert.Equal("caro", caro);
    }
}
