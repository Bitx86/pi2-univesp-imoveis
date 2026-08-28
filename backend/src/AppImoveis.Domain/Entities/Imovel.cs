namespace AppImoveis.Domain.Entities;

public enum TipoNegocio
{
    Sale,
    Rent
}

public class Imovel
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string ExternalId { get; set; } = string.Empty;
    public string Fonte { get; set; } = string.Empty;
    public string Titulo { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public TipoNegocio TipoNegocio { get; set; }
    public string? TipoAnuncio { get; set; }
    public string? TipoImovel { get; set; }
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
    public string? Cidade { get; set; }
    public string? Estado { get; set; }
    public Guid BairroId { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string? UrlOriginal { get; set; }
    public string? ImagemPrincipalUrl { get; set; }
    public List<string> ImagensUrls { get; set; } = new();
    public List<string> Amenidades { get; set; } = new();
    public DateTimeOffset CapturadoEm { get; set; } = DateTimeOffset.UtcNow;

    public Bairro? Bairro { get; set; }
}
