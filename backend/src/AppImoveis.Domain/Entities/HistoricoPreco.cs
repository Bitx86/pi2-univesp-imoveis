namespace AppImoveis.Domain.Entities;

public class HistoricoPreco
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ImovelId { get; set; }
    public decimal Preco { get; set; }
    public DateTimeOffset CapturadoEm { get; set; } = DateTimeOffset.UtcNow;

    public Imovel? Imovel { get; set; }
}
