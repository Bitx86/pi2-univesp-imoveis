namespace AppImoveis.Domain.Entities;

public class HistoricoVarredura
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Cidade { get; set; } = "Guarulhos";
    public string Estado { get; set; } = "SP";
    public string BairroTermo { get; set; } = string.Empty;
    public TipoNegocio TipoNegocio { get; set; }
    public int PaginaConsultada { get; set; }
    public int TotalEncontrados { get; set; }
    public int NovosIngeridos { get; set; }
    public int DuplicadosIgnorados { get; set; }
    public string? ApiKeyUtilizadaReduzida { get; set; }
    public DateTimeOffset DataConsulta { get; set; } = DateTimeOffset.UtcNow;
}
