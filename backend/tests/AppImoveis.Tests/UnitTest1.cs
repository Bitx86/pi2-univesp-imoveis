using AppImoveis.Domain.Entities;
using AppImoveis.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace AppImoveis.Tests;

public class UnitTest1
{
    [Fact]
    public void AppDbContext_TipoNegocio_DeveMapearParaEnumPostgres()
    {
        var dataSourceBuilder = new NpgsqlDataSourceBuilder("Host=localhost;Database=test;Username=postgres;Password=postgres");
        dataSourceBuilder.MapEnum<TipoNegocio>("tipo_negocio");
        var dataSource = dataSourceBuilder.Build();

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(dataSource, o => o.MapEnum<TipoNegocio>("tipo_negocio"))
            .Options;

        using var context = new AppDbContext(options);
        var imovelEntityType = context.Model.FindEntityType(typeof(Imovel));
        var imovelProp = imovelEntityType!.FindProperty(nameof(Imovel.TipoNegocio));
        
        var imovelMapping = imovelProp!.FindRelationalTypeMapping();
        Assert.NotNull(imovelMapping);
        Assert.Equal("tipo_negocio", imovelMapping.StoreType);

        var analiseEntityType = context.Model.FindEntityType(typeof(AnaliseRegiao));
        var analiseProp = analiseEntityType!.FindProperty(nameof(AnaliseRegiao.TipoNegocio));
        
        var analiseMapping = analiseProp!.FindRelationalTypeMapping();
        Assert.NotNull(analiseMapping);
        Assert.Equal("tipo_negocio", analiseMapping.StoreType);
    }
}
