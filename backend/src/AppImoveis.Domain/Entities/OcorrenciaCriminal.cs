namespace AppImoveis.Domain.Entities;

public enum TipoCrime
{
    Homicidio,
    Roubo,
    Furto,
    RouboVeiculo,
    FurtoVeiculo,
    Estupro
}

public class OcorrenciaCriminal
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid BairroId { get; set; }
    public Bairro? Bairro { get; set; }
    public TipoCrime TipoCrime { get; set; }
    public DateOnly DataOcorrencia { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string Fonte { get; set; } = "SSP-SP";
    public string? IdentificadorExterno { get; set; }
}
