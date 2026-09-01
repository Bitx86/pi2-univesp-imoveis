"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  X,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  Terminal,
  Database,
  Key,
  Download,
  Layers,
  Loader2,
  Check,
} from "lucide-react";

type TipoNegocio = "Sale" | "Rent";

type Analise = {
  bairroId?: string;
  bairro_id?: string;
  tipoNegocio?: TipoNegocio;
  tipo_negocio?: string;
  precoMedio?: number;
  preco_medio?: number;
  precoMediano?: number;
  preco_mediano?: number;
  precoM2Medio?: number;
  preco_m2_medio?: number;
  desvioPadraoAmostral?: number;
  desvio_padrao_amostral?: number;
  amostraCount?: number;
  amostra_count?: number;
  atualizadoEm?: string;
  atualizado_em?: string;
};

type Imovel = {
  id: string;
  titulo: string;
  tipoNegocio?: TipoNegocio;
  tipo_negocio?: string;
  preco: number;
  areaM2?: number;
  area_m2?: number;
  quartos: number | null;
  bairroId?: string;
  bairro_id?: string;
  bairro?: {
    id: string;
    nome: string;
    cidade: string;
  };
};

type KeyPoolStats = {
  totalKeys: number;
  availableKeys: number;
  exhaustedKeys: number;
  totalCreditsUsed: number;
  activeKeyMasked: string;
};

type BairroCoverage = {
  nome: string;
  totalVenda: number;
  totalAluguel: number;
  totalGeral: number;
  quorumVendaAtingido: boolean;
  quorumAluguelAtingido: boolean;
};

export type SeedStepLog = {
  id: string;
  step: number;
  totalSteps: number;
  termo: string;
  tipoNegocio: string;
  pagina: number;
  novos: number;
  duplicados: number;
  apiKey: string;
  status: "running" | "success" | "error";
  message: string;
};

const DEFAULT_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5209";

interface DashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBairroId?: string;
  initialTipoNegocio?: TipoNegocio;
  onDataUpdated?: () => void;
}

export function DashboardModal({
  isOpen,
  onClose,
  initialBairroId = "todos",
  initialTipoNegocio = "Sale",
  onDataUpdated,
}: DashboardModalProps) {
  const [apiUrl] = useState(DEFAULT_API_URL);
  const [tipoNegocio, setTipoNegocio] = useState<TipoNegocio>(initialTipoNegocio);
  const [bairroFilter, setBairroFilter] = useState(initialBairroId);
  const [analise, setAnalise] = useState<Analise | null>(null);
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [keyStats, setKeyStats] = useState<KeyPoolStats | null>(null);
  const [coverage, setCoverage] = useState<BairroCoverage[]>([]);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Live Seed Execution State
  const [seedLogs, setSeedLogs] = useState<SeedStepLog[]>([]);
  const [currentCycleIndex, setCurrentCycleIndex] = useState<number>(0);
  const totalCyclesToRun = 4;

  const executeFetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    const targetUrl = apiUrl.replace(/\/$/, "");

    try {
      // 1. Fetch properties from database via API
      const imoveisRes = await fetch(
        `${targetUrl}/api/imoveis?tipoNegocio=${tipoNegocio}&page=1&pageSize=100`
      );
      
      if (!imoveisRes.ok) {
        throw new Error(`API retornou status HTTP ${imoveisRes.status}`);
      }
      
      const imoveisData = await imoveisRes.json();
      const items: Imovel[] = imoveisData.items ?? [];
      setImoveis(items);

      // 2. Fetch seed status & key pool telemetry
      try {
        const statusRes = await fetch(`${targetUrl}/api/seed/status`);
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          if (statusData.keys_status) setKeyStats(statusData.keys_status);
          if (statusData.cobertura) setCoverage(statusData.cobertura);
        }
      } catch (err) {
        console.warn("Could not fetch seed status:", err);
      }

      // 3. Fetch specific analysis endpoint if a valid GUID is selected
      if (bairroFilter !== "todos" && bairroFilter.includes("-")) {
        try {
          const analiseRes = await fetch(
            `${targetUrl}/api/analise/bairro/${bairroFilter}?tipoNegocio=${tipoNegocio}`
          );
          if (analiseRes.ok) {
            const analiseData = await analiseRes.json();
            if (analiseData.status !== "insufficient_sample") {
              setAnalise(analiseData);
            } else {
              setAnalise(null);
            }
          }
        } catch (err) {
          console.warn("Could not fetch analysis:", err);
          setAnalise(null);
        }
      } else {
        setAnalise(null);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Falha ao conectar com a API Backend (.NET Core / Neon)"
      );
    } finally {
      setLoading(false);
    }
  }, [apiUrl, bairroFilter, tipoNegocio]);

  async function handleSeedDatabase() {
    setSeeding(true);
    setSeedMessage(null);
    setError(null);
    setSeedLogs([]);

    const targetUrl = apiUrl.replace(/\/$/, "");
    let totalNewProperties = 0;
    let totalDuplicates = 0;
    let useDirectSeed = false;

    try {
      for (let step = 1; step <= totalCyclesToRun; step++) {
        setCurrentCycleIndex(step);
        const logId = `step-${step}-${Date.now()}`;
        const tipoParam = step % 2 === 1 ? "Sale" : "Rent";

        setSeedLogs((prev) => [
          ...prev,
          {
            id: logId,
            step,
            totalSteps: totalCyclesToRun,
            termo: "Consultando imóveis reais...",
            tipoNegocio: tipoParam === "Sale" ? "Venda" : "Locação",
            pagina: 1,
            novos: 0,
            duplicados: 0,
            apiKey: "Consultando...",
            status: "running",
            message: `Executando extração real ${step} de ${totalCyclesToRun} na GeckoAPI (Zap/VivaReal)...`,
          },
        ]);

        let res: Response;
        if (!useDirectSeed) {
          res = await fetch(`${targetUrl}/api/seed/step?tipo=${tipoParam}`, {
            method: "POST",
          });
          if (res.status === 404) {
            useDirectSeed = true;
            res = await fetch(`${targetUrl}/api/seed?cycles=1`, {
              method: "POST",
            });
          }
        } else {
          res = await fetch(`${targetUrl}/api/seed?cycles=1`, {
            method: "POST",
          });
        }

        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          const errMsg =
            res.status === 404
              ? "Endpoint não encontrado (404). Reinicie o backend .NET (`dotnet run`) no terminal para carregar as novas rotas."
              : errJson.detail || errJson.message || `Erro HTTP ${res.status} retornado pelo backend.`;

          setSeedLogs((prev) =>
            prev.map((log) =>
              log.id === logId
                ? {
                    ...log,
                    status: "error",
                    message: errMsg,
                  }
                : log
            )
          );
          continue;
        }

        const stepData = await res.json();
        const ciclo = stepData.ciclo || (stepData.ciclos && stepData.ciclos[0]) || {};
        const novos = stepData.totalNovos ?? stepData.totalNovosIngeridos ?? ciclo.novosIngeridos ?? 0;
        const duplicados = stepData.totalDuplicados ?? stepData.totalDuplicadosVerificados ?? ciclo.duplicados ?? 0;
        totalNewProperties += novos;
        totalDuplicates += duplicados;

        if (stepData.coberturaAtual) setCoverage(stepData.coberturaAtual);
        if (stepData.apiKeysStats) setKeyStats(stepData.apiKeysStats);

        setSeedLogs((prev) =>
          prev.map((log) =>
            log.id === logId
              ? {
                  ...log,
                  termo: ciclo.termo || "Guarulhos",
                  tipoNegocio: (ciclo.tipoNegocio === 0 || ciclo.tipoNegocio === "Sale") ? "Venda" : "Locação",
                  pagina: ciclo.pagina || 1,
                  novos,
                  duplicados,
                  apiKey: ciclo.apiKeyUtilizada || "API Key",
                  status: ciclo.sucesso !== false ? "success" : "error",
                  message: ciclo.motivo || `Varredura concluída com sucesso.`,
                }
              : log
          )
        );

        if (stepData.quotaEsgotada) {
          setSeedMessage(`Cota do pool de chaves atingida após ${step} requisições.`);
          break;
        }
      }

      setSeedMessage(
        `Varredura concluída: ${totalNewProperties} novos imóveis 100% reais adicionados ao banco (${totalDuplicates} duplicados verificados).`
      );
      await executeFetch();
      if (onDataUpdated) {
        onDataUpdated();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao executar Seed");
    } finally {
      setSeeding(false);
      setCurrentCycleIndex(0);
    }
  }

  async function handleExportSql() {
    try {
      setExporting(true);
      const targetUrl = apiUrl.replace(/\/$/, "");
      const res = await fetch(`${targetUrl}/api/seed/export-sql`, { method: "POST" });
      if (!res.ok) throw new Error("Erro ao gerar snapshot SQL");
      const data = await res.json();
      setSeedMessage(`Snapshot SQL gerado com sucesso em scripts/02_seed_neon.sql (${data.linhas ?? 0} linhas de dados reais)!`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao exportar SQL");
    } finally {
      setExporting(false);
    }
  }

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (isOpen) {
      timeoutId = setTimeout(() => {
        executeFetch();
      }, 0);
    }
    return () => {
      clearTimeout(timeoutId);
    };
  }, [isOpen, executeFetch]);

  // Extract unique neighborhoods from loaded properties
  const availableBairros = useMemo(() => {
    const map = new Map<string, string>();
    imoveis.forEach((item) => {
      if (item.bairro && item.bairro.id && item.bairro.nome) {
        map.set(item.bairro.id, item.bairro.nome);
      } else if (item.bairroId) {
        map.set(item.bairroId, "Bairro " + item.bairroId.slice(0, 6));
      }
    });
    return Array.from(map.entries()).map(([id, nome]) => ({ id, nome }));
  }, [imoveis]);

  // Filtered properties based on selected bairro dropdown
  const filteredImoveis = useMemo(() => {
    if (bairroFilter === "todos") return imoveis;
    return imoveis.filter(
      (item) => item.bairro?.id === bairroFilter || item.bairroId === bairroFilter
    );
  }, [imoveis, bairroFilter]);

  // Dynamic client-side statistical calculation over the database items
  const computedStats = useMemo(() => {
    if (filteredImoveis.length === 0) {
      return {
        medianPrice: 0,
        avgPrice: 0,
        avgM2Price: 0,
        stdDev: 0,
        count: 0,
      };
    }

    const prices = filteredImoveis.map((x) => x.preco).sort((a, b) => a - b);
    const count = prices.length;
    const mid = Math.floor(count / 2);
    const medianPrice =
      count % 2 !== 0 ? prices[mid] : (prices[mid - 1] + prices[mid]) / 2;

    const sumPrice = prices.reduce((acc, p) => acc + p, 0);
    const avgPrice = sumPrice / count;

    // m2 prices
    const validM2Items = filteredImoveis.filter(
      (x) => (x.areaM2 ?? x.area_m2 ?? 0) > 0
    );
    const sumM2Prices = validM2Items.reduce((acc, x) => {
      const area = x.areaM2 ?? x.area_m2 ?? 1;
      return acc + x.preco / area;
    }, 0);
    const avgM2Price =
      validM2Items.length > 0 ? Math.round(sumM2Prices / validM2Items.length) : 0;

    // Standard deviation
    const variance =
      prices.reduce((acc, p) => acc + Math.pow(p - avgPrice, 2), 0) /
      Math.max(1, count - 1);
    const stdDev = Math.round(Math.sqrt(variance));

    return {
      medianPrice,
      avgPrice,
      avgM2Price,
      stdDev,
      count,
    };
  }, [filteredImoveis]);

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null || isNaN(value)) return "R$ 0";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: value >= 1000 ? 0 : 2,
    }).format(value);
  };

  // Use backend analysis if available, otherwise computed stats from loaded properties
  const precoMedianoVal =
    analise?.precoMediano ?? analise?.preco_mediano ?? computedStats.medianPrice;
  const precoMedioVal =
    analise?.precoMedio ?? analise?.preco_medio ?? computedStats.avgPrice;
  const precoM2Val =
    analise?.precoM2Medio ?? analise?.preco_m2_medio ?? computedStats.avgM2Price;
  const desvioVal =
    analise?.desvioPadraoAmostral ?? analise?.desvio_padrao_amostral ?? computedStats.stdDev;

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(8px)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        className="surface-card"
        style={{
          width: "100%",
          maxWidth: 1060,
          maxHeight: "90vh",
          overflowY: "auto",
          backgroundColor: "var(--color-surface-container)",
          border: "var(--border-technical)",
          borderRadius: "var(--radius-cards)",
          boxShadow: "var(--shadow-floating)",
          padding: "24px",
          color: "var(--color-on-surface)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "var(--border-technical)",
            paddingBottom: 16,
            marginBottom: 20,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="badge-tech">NEON POSTGRES LAKEBASE</span>
              {keyStats && (
                <span className="badge-tech" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Key size={11} />
                  <span>Pool: {keyStats.availableKeys}/{keyStats.totalKeys} chaves ativas</span>
                </span>
              )}
              <span
                style={{
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                  color: "var(--color-on-surface-variant)",
                }}
              >
                API: {apiUrl}
              </span>
            </div>
            <h2 className="font-headline" style={{ fontSize: 22, marginTop: 4, color: "var(--color-on-surface)" }}>
              Telemetria & Diagnóstico de Banco de Dados
            </h2>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={handleSeedDatabase}
              disabled={seeding || loading}
              className="btn-primary"
              style={{ fontSize: 12, padding: "6px 12px" }}
              title="Executa varredura inteligente para ingerir novos imóveis 100% reais de Guarulhos"
            >
              <Sparkles size={14} />
              <span>{seeding ? "Varrendo API..." : "Varredura Seed Real"}</span>
            </button>

            <button
              onClick={handleExportSql}
              disabled={exporting || loading}
              className="btn-secondary"
              style={{ fontSize: 12, padding: "6px 12px" }}
              title="Gera o arquivo SQL com todos os dados reais já ingeridos"
            >
              <Download size={13} />
              <span>{exporting ? "Gerando..." : "Exportar SQL"}</span>
            </button>

            <button
              onClick={executeFetch}
              disabled={loading}
              className="btn-secondary"
              style={{ fontSize: 12, padding: "6px 12px" }}
            >
              <RefreshCw size={13} className={loading ? "spin" : ""} />
              <span>Atualizar</span>
            </button>

            <button
              onClick={onClose}
              style={{
                background: "transparent",
                border: "var(--border-technical)",
                color: "var(--color-outline)",
                borderRadius: "var(--radius-default)",
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Filter Controls Bar (Modalidade & Bairro Selecionado) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 16,
            flexWrap: "wrap",
            backgroundColor: "var(--color-surface-container-low)",
            padding: "8px 12px",
            borderRadius: "var(--radius-default)",
            border: "var(--border-technical)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--color-outline)", textTransform: "uppercase" }}>
              Modalidade:
            </span>
            <div style={{ display: "flex", gap: 4 }}>
              <button
                onClick={() => setTipoNegocio("Sale")}
                style={{
                  background: tipoNegocio === "Sale" ? "var(--color-primary)" : "transparent",
                  color: tipoNegocio === "Sale" ? "#ffffff" : "var(--color-on-surface-variant)",
                  border: "none",
                  borderRadius: 3,
                  padding: "3px 8px",
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Venda
              </button>
              <button
                onClick={() => setTipoNegocio("Rent")}
                style={{
                  background: tipoNegocio === "Rent" ? "var(--color-primary)" : "transparent",
                  color: tipoNegocio === "Rent" ? "#ffffff" : "var(--color-on-surface-variant)",
                  border: "none",
                  borderRadius: 3,
                  padding: "3px 8px",
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Locação
              </button>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--color-outline)", textTransform: "uppercase" }}>
              Filtro por Bairro:
            </span>
            <select
              value={bairroFilter}
              onChange={(e) => setBairroFilter(e.target.value)}
              style={{
                backgroundColor: "var(--color-surface-container)",
                color: "var(--color-on-surface)",
                border: "var(--border-technical)",
                borderRadius: 4,
                padding: "3px 8px",
                fontSize: 12,
                outline: "none",
              }}
            >
              <option value="todos">Todos os Bairros ({imoveis.length} imóveis)</option>
              {availableBairros.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Coverage Pills (Gap Analysis Status) */}
        {coverage.length > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              overflowX: "auto",
              paddingBottom: 8,
              marginBottom: 12,
              scrollbarWidth: "none",
            }}
          >
            <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--color-outline)", whiteSpace: "nowrap" }}>
              COBERTURA:
            </span>
            {coverage.slice(0, 8).map((c) => (
              <span
                key={c.nome}
                style={{
                  fontSize: 10,
                  padding: "2px 6px",
                  borderRadius: 3,
                  backgroundColor: c.totalGeral >= 15 ? "rgba(16, 185, 129, 0.12)" : "rgba(245, 158, 11, 0.12)",
                  color: c.totalGeral >= 15 ? "var(--color-success)" : "#f59e0b",
                  border: `1px solid ${c.totalGeral >= 15 ? "rgba(16, 185, 129, 0.3)" : "rgba(245, 158, 11, 0.3)"}`,
                  whiteSpace: "nowrap",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {c.nome}: {c.totalVenda}V / {c.totalAluguel}A
              </span>
            ))}
          </div>
        )}

        {/* Live Seed Execution Progress & Realtime Feed */}
        {(seeding || seedLogs.length > 0) && (
          <div
            style={{
              padding: "16px",
              borderRadius: "var(--radius-default)",
              border: seeding ? "1px solid var(--color-primary)" : "var(--border-technical)",
              marginBottom: "16px",
              backgroundColor: "var(--color-surface-container-low)",
              boxShadow: seeding ? "0 0 20px rgba(56, 189, 248, 0.15)" : "none",
              transition: "all 0.3s ease",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {seeding ? (
                  <Loader2 size={16} className="spin" style={{ color: "var(--color-primary)" }} />
                ) : (
                  <CheckCircle size={16} style={{ color: "var(--color-success)" }} />
                )}
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-on-surface)" }}>
                  {seeding
                    ? `Executando Varredura Real: Requisição ${currentCycleIndex} de ${totalCyclesToRun}...`
                    : "Varredura Concluída — Relatório de Requisições"}
                </span>
              </div>

              <div style={{ display: "flex", gap: 6, fontSize: 11, fontFamily: "var(--font-mono)" }}>
                <span className="badge-tech" style={{ color: "var(--color-success)", backgroundColor: "rgba(16, 185, 129, 0.15)" }}>
                  +{seedLogs.reduce((acc, l) => acc + l.novos, 0)} Novos
                </span>
                <span className="badge-tech" style={{ color: "var(--color-outline)" }}>
                  {seedLogs.reduce((acc, l) => acc + l.duplicados, 0)} Verificados
                </span>
              </div>
            </div>

            {/* Visual Progress Bar */}
            {seeding && (
              <div
                style={{
                  width: "100%",
                  height: 6,
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                  borderRadius: 3,
                  overflow: "hidden",
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${(currentCycleIndex / totalCyclesToRun) * 100}%`,
                    background: "linear-gradient(90deg, var(--color-primary), var(--color-success))",
                    transition: "width 0.4s ease",
                  }}
                />
              </div>
            )}

            {/* Realtime Request Feed */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 180, overflowY: "auto" }}>
              {seedLogs.map((log) => (
                <div
                  key={log.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "7px 10px",
                    borderRadius: 4,
                    backgroundColor: "var(--color-surface-container)",
                    border: "var(--border-technical)",
                    fontSize: 12,
                    gap: 12,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, overflow: "hidden" }}>
                    {log.status === "running" ? (
                      <Loader2 size={13} className="spin" style={{ color: "var(--color-primary)", flexShrink: 0 }} />
                    ) : log.status === "success" ? (
                      <Check size={13} style={{ color: "var(--color-success)", flexShrink: 0 }} />
                    ) : (
                      <AlertTriangle size={13} style={{ color: "var(--color-error)", flexShrink: 0 }} />
                    )}
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 600, color: "var(--color-on-surface)", fontSize: 12 }}>
                          Req #{log.step}: {log.termo}
                        </span>
                        <span className="badge-tech" style={{ fontSize: 9, padding: "1px 5px" }}>
                          {log.tipoNegocio} • Pág {log.pagina}
                        </span>
                        <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "var(--color-outline)" }}>
                          [{log.apiKey}]
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: "var(--color-on-surface-variant)", marginTop: 2 }}>
                        {log.message}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                    {log.status !== "running" && (
                      <>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            padding: "2px 6px",
                            borderRadius: 3,
                            backgroundColor: log.novos > 0 ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0.05)",
                            color: log.novos > 0 ? "var(--color-success)" : "var(--color-outline)",
                          }}
                        >
                          +{log.novos} novos
                        </span>
                        {log.duplicados > 0 && (
                          <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--color-outline)" }}>
                            ({log.duplicados} exist.)
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notices */}
        {seedMessage && (
          <div
            style={{
              padding: "10px 14px",
              backgroundColor: "rgba(16, 185, 129, 0.12)",
              border: "1px solid var(--color-success)",
              borderRadius: "var(--radius-default)",
              color: "var(--color-success)",
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
            }}
          >
            <CheckCircle size={16} />
            <span>{seedMessage}</span>
          </div>
        )}

        {error && (
          <div
            style={{
              padding: "10px 14px",
              backgroundColor: "rgba(239, 68, 68, 0.12)",
              border: "1px solid var(--color-error)",
              borderRadius: "var(--radius-default)",
              color: "var(--color-error)",
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
            }}
          >
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Live Metrics Grid (Dynamic Sample Diagnostics) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <div className="surface-card-lowest">
            <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--color-outline)", textTransform: "uppercase" }}>
              Mediana Calculada ({filteredImoveis.length} amostras)
            </div>
            <div className="font-headline" style={{ fontSize: 20, color: "var(--color-on-surface)", marginTop: 2 }}>
              {formatCurrency(precoMedianoVal)}
            </div>
          </div>

          <div className="surface-card-lowest">
            <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--color-outline)", textTransform: "uppercase" }}>
              Média Aritmética
            </div>
            <div className="font-headline" style={{ fontSize: 20, color: "var(--color-on-surface)", marginTop: 2 }}>
              {formatCurrency(precoMedioVal)}
            </div>
          </div>

          <div className="surface-card-lowest">
            <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--color-outline)", textTransform: "uppercase" }}>
              Preço Médio / m²
            </div>
            <div className="font-headline" style={{ fontSize: 20, color: "var(--color-primary)", marginTop: 2 }}>
              {formatCurrency(precoM2Val)}/m²
            </div>
          </div>

          <div className="surface-card-lowest">
            <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--color-outline)", textTransform: "uppercase" }}>
              Desvio Padrão (σ)
            </div>
            <div className="font-headline" style={{ fontSize: 20, color: "var(--color-on-surface)", marginTop: 2 }}>
              {formatCurrency(desvioVal)}
            </div>
          </div>
        </div>

        {/* Ingested Table Preview */}
        <div className="surface-card-lowest" style={{ padding: 0, overflow: "hidden" }}>
          <div
            style={{
              padding: "10px 14px",
              borderBottom: "var(--border-technical)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "var(--color-surface-container-low)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600 }}>
              <Terminal size={14} style={{ color: "var(--color-primary)" }} />
              <span>Registros no Banco Neon ({filteredImoveis.length} exibidos)</span>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <span className="badge-tech">POSTGRES LIVE</span>
            </div>
          </div>

          <div style={{ maxHeight: 260, overflowY: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "var(--border-technical)", color: "var(--color-outline)" }}>
                  <th style={{ padding: "8px 12px", fontFamily: "var(--font-mono)" }}>Bairro</th>
                  <th style={{ padding: "8px 12px" }}>Título do Anúncio</th>
                  <th style={{ padding: "8px 12px", fontFamily: "var(--font-mono)" }}>Área</th>
                  <th style={{ padding: "8px 12px", fontFamily: "var(--font-mono)" }}>Quartos</th>
                  <th style={{ padding: "8px 12px", fontFamily: "var(--font-mono)", textAlign: "right" }}>Preço</th>
                </tr>
              </thead>
              <tbody>
                {filteredImoveis.map((imovel) => (
                  <tr key={imovel.id} style={{ borderBottom: "var(--border-technical)" }}>
                    <td style={{ padding: "8px 12px", fontFamily: "var(--font-mono)", color: "var(--color-outline)", fontSize: 11 }}>
                      {imovel.bairro?.nome ?? "Guarulhos"}
                    </td>
                    <td style={{ padding: "8px 12px", color: "var(--color-on-surface)" }}>{imovel.titulo}</td>
                    <td style={{ padding: "8px 12px", fontFamily: "var(--font-mono)" }}>
                      {imovel.areaM2 ?? imovel.area_m2 ?? "—"} m²
                    </td>
                    <td style={{ padding: "8px 12px", fontFamily: "var(--font-mono)" }}>
                      {imovel.quartos ?? "—"}
                    </td>
                    <td style={{ padding: "8px 12px", fontFamily: "var(--font-mono)", textAlign: "right", color: "var(--color-primary)", fontWeight: 600 }}>
                      {formatCurrency(imovel.preco)}
                    </td>
                  </tr>
                ))}
                {filteredImoveis.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: 24, textAlign: "center", color: "var(--color-outline)" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                        <Database size={24} style={{ opacity: 0.5 }} />
                        <span>Nenhum registro encontrado no banco de dados para os filtros selecionados.</span>
                        <span style={{ fontSize: 11 }}>Clique em <strong>Popular Banco (Seed)</strong> para ingerir imóveis reais de Guarulhos.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
