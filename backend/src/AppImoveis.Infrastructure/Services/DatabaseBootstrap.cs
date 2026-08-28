using AppImoveis.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace AppImoveis.Infrastructure.Services;

public static class DatabaseBootstrap
{
    public static async Task EnsureDatabaseCreatedAsync(IHost host, CancellationToken cancellationToken = default)
    {
        using var scope = host.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await context.Database.EnsureCreatedAsync(cancellationToken);
    }
}
