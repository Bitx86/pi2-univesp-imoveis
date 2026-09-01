using System.Collections.Concurrent;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace AppImoveis.Infrastructure.Services;

public class ApiKeyStatus
{
    public string Key { get; set; } = string.Empty;
    public string MaskedKey { get; set; } = string.Empty;
    public bool IsExhausted { get; set; }
    public int CreditsUsed { get; set; }
    public int ConsecutiveErrors { get; set; }
    public DateTimeOffset? LastUsedAt { get; set; }
}

public class ApiKeyPoolStats
{
    public int TotalKeys { get; set; }
    public int AvailableKeys { get; set; }
    public int ExhaustedKeys { get; set; }
    public int TotalCreditsUsed { get; set; }
    public string ActiveKeyMasked { get; set; } = "Nenhuma";
    public List<ApiKeyStatusSummary> KeysSummary { get; set; } = new();
}

public class ApiKeyStatusSummary
{
    public string MaskedKey { get; set; } = string.Empty;
    public bool IsExhausted { get; set; }
    public int CreditsUsed { get; set; }
    public DateTimeOffset? LastUsedAt { get; set; }
}

public class GeckoApiKeyPoolManager
{
    private readonly List<ApiKeyStatus> _keys = new();
    private readonly object _lock = new();
    private int _currentIndex;
    private readonly ILogger<GeckoApiKeyPoolManager> _logger;

    public GeckoApiKeyPoolManager(IConfiguration configuration, ILogger<GeckoApiKeyPoolManager> logger)
    {
        _logger = logger;
        LoadKeys(configuration);
    }

    private void LoadKeys(IConfiguration configuration)
    {
        var rawKeySet = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        // 1. Check array in appsettings (GeckoApi:ApiKeys)
        var configArray = configuration.GetSection("GeckoApi:ApiKeys").Get<string[]>();
        if (configArray != null)
        {
            foreach (var k in configArray)
            {
                if (!string.IsNullOrWhiteSpace(k)) rawKeySet.Add(k.Trim());
            }
        }

        // 2. Check comma-separated string GECKO_API_KEYS
        var commaKeys = configuration["GECKO_API_KEYS"] 
                        ?? configuration["GeckoApi:ApiKeysString"]
                        ?? Environment.GetEnvironmentVariable("GECKO_API_KEYS");

        if (!string.IsNullOrWhiteSpace(commaKeys))
        {
            foreach (var k in commaKeys.Split(new[] { ',', ';', '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries))
            {
                if (!string.IsNullOrWhiteSpace(k)) rawKeySet.Add(k.Trim());
            }
        }

        // 3. Check single key fallback (GeckoApi:ApiKey or GECKO_API_KEY)
        var singleKey = configuration["GeckoApi:ApiKey"]
                        ?? configuration["GECKO_API_KEY"]
                        ?? configuration["GeckoApiKey"]
                        ?? Environment.GetEnvironmentVariable("GECKO_API_KEY");

        if (!string.IsNullOrWhiteSpace(singleKey))
        {
            rawKeySet.Add(singleKey.Trim());
        }

        lock (_lock)
        {
            _keys.Clear();
            foreach (var key in rawKeySet)
            {
                _keys.Add(new ApiKeyStatus
                {
                    Key = key,
                    MaskedKey = MaskKey(key),
                    IsExhausted = false,
                    CreditsUsed = 0,
                    ConsecutiveErrors = 0
                });
            }

            _currentIndex = 0;
        }

        _logger.LogInformation("GeckoApiKeyPoolManager: {Count} chaves de API carregadas no pool.", _keys.Count);
    }

    public string? GetActiveKey()
    {
        lock (_lock)
        {
            if (_keys.Count == 0) return null;

            for (int i = 0; i < _keys.Count; i++)
            {
                var idx = (_currentIndex + i) % _keys.Count;
                var candidate = _keys[idx];
                if (!candidate.IsExhausted)
                {
                    _currentIndex = idx;
                    candidate.LastUsedAt = DateTimeOffset.UtcNow;
                    return candidate.Key;
                }
            }

            return null; // All exhausted
        }
    }

    public string GetActiveKeyMasked()
    {
        lock (_lock)
        {
            if (_keys.Count == 0) return "Nenhuma chave configurada";
            var active = _keys.ElementAtOrDefault(_currentIndex);
            return active != null ? active.MaskedKey : "Nenhuma ativa";
        }
    }

    public void ReportSuccess(string key, int credits = 1)
    {
        lock (_lock)
        {
            var item = _keys.FirstOrDefault(x => x.Key == key);
            if (item != null)
            {
                item.CreditsUsed += credits;
                item.ConsecutiveErrors = 0;
            }
        }
    }

    public bool ReportExhaustedOrRateLimited(string key)
    {
        lock (_lock)
        {
            var item = _keys.FirstOrDefault(x => x.Key == key);
            if (item != null)
            {
                item.IsExhausted = true;
                _logger.LogWarning("GeckoApiKeyPoolManager: Chave {MaskedKey} marcada como ESGOTADA / RATE LIMITED.", item.MaskedKey);
            }

            // Find next available
            for (int i = 0; i < _keys.Count; i++)
            {
                var idx = (_currentIndex + 1 + i) % _keys.Count;
                if (!_keys[idx].IsExhausted)
                {
                    _currentIndex = idx;
                    _logger.LogInformation("GeckoApiKeyPoolManager: Rotação para nova chave ativa: {MaskedKey}", _keys[idx].MaskedKey);
                    return true;
                }
            }

            _logger.LogError("GeckoApiKeyPoolManager: TODAS as chaves de API ({Count}) no pool foram esgotadas.", _keys.Count);
            return false;
        }
    }

    public void ResetExhaustedKeys()
    {
        lock (_lock)
        {
            foreach (var k in _keys)
            {
                k.IsExhausted = false;
                k.ConsecutiveErrors = 0;
            }
            _logger.LogInformation("GeckoApiKeyPoolManager: Estado das chaves de API resetado.");
        }
    }

    public ApiKeyPoolStats GetPoolStats()
    {
        lock (_lock)
        {
            var total = _keys.Count;
            var available = _keys.Count(x => !x.IsExhausted);
            var exhausted = _keys.Count(x => x.IsExhausted);
            var credits = _keys.Sum(x => x.CreditsUsed);
            var activeMasked = GetActiveKeyMasked();

            return new ApiKeyPoolStats
            {
                TotalKeys = total,
                AvailableKeys = available,
                ExhaustedKeys = exhausted,
                TotalCreditsUsed = credits,
                ActiveKeyMasked = activeMasked,
                KeysSummary = _keys.Select(k => new ApiKeyStatusSummary
                {
                    MaskedKey = k.MaskedKey,
                    IsExhausted = k.IsExhausted,
                    CreditsUsed = k.CreditsUsed,
                    LastUsedAt = k.LastUsedAt
                }).ToList()
            };
        }
    }

    private static string MaskKey(string key)
    {
        if (string.IsNullOrWhiteSpace(key)) return string.Empty;
        if (key.Length <= 8) return "***" + key;
        return key.Substring(0, 7) + "..." + key.Substring(key.Length - 4);
    }
}
