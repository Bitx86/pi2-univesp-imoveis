namespace AppImoveis.Domain.Entities;

public class AnaliseRegiao
{
    public Guid BairroId { get; set; }
    public TipoNegocio TipoNegocio { get; set; }
    public decimal PrecoMedio { get; set; }
    public decimal PrecoMediano { get; set; }
    public decimal? PrecoM2Medio { get; set; }
    public decimal DesvioPadraoAmostral { get; set; }
    public int AmostraCount { get; set; }
    public DateTimeOffset AtualizadoEm { get; set; } = DateTimeOffset.UtcNow;
}
