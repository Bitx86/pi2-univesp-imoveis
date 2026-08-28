using AppImoveis.Domain.Entities;
using AppImoveis.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AppImoveis.Infrastructure.Repositories;

public class ImovelRepository
{
    private readonly AppDbContext _context;

    public ImovelRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Imovel>> GetByBairroAsync(Guid bairroId, TipoNegocio tipoNegocio, CancellationToken cancellationToken = default)
    {
        return await _context.Imoveis
            .Where(x => x.BairroId == bairroId && x.TipoNegocio == tipoNegocio)
            .OrderByDescending(x => x.CapturadoEm)
            .ToListAsync(cancellationToken);
    }

    public async Task<Imovel?> GetByExternalIdAsync(string fonte, string externalId, CancellationToken cancellationToken = default)
    {
        return await _context.Imoveis
            .FirstOrDefaultAsync(x => x.Fonte == fonte && x.ExternalId == externalId, cancellationToken);
    }

    public async Task AddAsync(Imovel imovel, CancellationToken cancellationToken = default)
    {
        await _context.Imoveis.AddAsync(imovel, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
