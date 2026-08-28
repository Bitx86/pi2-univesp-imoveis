using System.Collections.Concurrent;
using AppImoveis.Domain.Entities;
using AppImoveis.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AppImoveis.Infrastructure.Repositories;

public class BairroRepository
{
    private readonly AppDbContext _context;
    private static readonly ConcurrentDictionary<string, Guid> BairroCache = new(StringComparer.OrdinalIgnoreCase);

    public BairroRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Bairro?> GetByNomeCidadeEstadoAsync(string nome, string cidade, string estado, CancellationToken cancellationToken = default)
    {
        var normalizedNome = nome.Trim();
        var normalizedCidade = cidade.Trim();
        var normalizedEstado = estado.Trim();

        var local = _context.Bairros.Local.FirstOrDefault(x =>
            string.Equals(x.Nome, normalizedNome, StringComparison.OrdinalIgnoreCase) &&
            string.Equals(x.Cidade, normalizedCidade, StringComparison.OrdinalIgnoreCase) &&
            string.Equals(x.Estado, normalizedEstado, StringComparison.OrdinalIgnoreCase));

        if (local != null) return local;

        return await _context.Bairros
            .FirstOrDefaultAsync(x => x.Nome == normalizedNome && x.Cidade == normalizedCidade && x.Estado == normalizedEstado, cancellationToken);
    }

    public async Task<Bairro> GetOrCreateAsync(string nome, string cidade, string estado, CancellationToken cancellationToken = default)
    {
        var normalizedNome = nome.Trim();
        var normalizedCidade = cidade.Trim();
        var normalizedEstado = estado.Trim();
        var cacheKey = $"{normalizedNome}|{normalizedCidade}|{normalizedEstado}";

        // 1. Check local tracker
        var local = _context.Bairros.Local.FirstOrDefault(x =>
            string.Equals(x.Nome, normalizedNome, StringComparison.OrdinalIgnoreCase) &&
            string.Equals(x.Cidade, normalizedCidade, StringComparison.OrdinalIgnoreCase) &&
            string.Equals(x.Estado, normalizedEstado, StringComparison.OrdinalIgnoreCase));

        if (local != null)
        {
            BairroCache[cacheKey] = local.Id;
            return local;
        }

        // 2. Check cache and database
        if (BairroCache.TryGetValue(cacheKey, out var cachedId))
        {
            var cachedBairro = await _context.Bairros.FindAsync(new object[] { cachedId }, cancellationToken);
            if (cachedBairro != null) return cachedBairro;
        }

        var existing = await _context.Bairros
            .FirstOrDefaultAsync(x => x.Nome == normalizedNome && x.Cidade == normalizedCidade && x.Estado == normalizedEstado, cancellationToken);

        if (existing != null)
        {
            BairroCache[cacheKey] = existing.Id;
            return existing;
        }

        // 3. Create, save, and cache
        var newBairro = new Bairro
        {
            Id = Guid.NewGuid(),
            Nome = normalizedNome,
            Cidade = normalizedCidade,
            Estado = normalizedEstado
        };

        await _context.Bairros.AddAsync(newBairro, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        BairroCache[cacheKey] = newBairro.Id;
        return newBairro;
    }

    public async Task<Bairro> AddAsync(Bairro bairro, CancellationToken cancellationToken = default)
    {
        return await GetOrCreateAsync(bairro.Nome, bairro.Cidade, bairro.Estado, cancellationToken);
    }
}
