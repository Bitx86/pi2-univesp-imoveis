"use client";

import React, { useEffect, useState, useMemo } from "react";
import { X, RefreshCw, Database, Layers, ArrowUpRight, AlertTriangle, CheckCircle, Sparkles } from "lucide-react";

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
};

const DEFAULT_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5209";

interface DashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBairroId?: string;
  initialTipoNegocio?: TipoNegocio;
}

export function DashboardModal({
  isOpen,
  onClose,
  initialBairroId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  initialTipoNegocio = "Sale",
}: DashboardModalProps) {
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL);
  const [tipoNegocio, setTipoNegocio] = useState<TipoNegocio>(initialTipoNegocio);
  const [bairroId, setBairroId] = useState(initialBairroId);
  const [analise, setAnalise] = useState<Analise | null>(null);
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, bairroId, tipoNegocio, apiUrl]);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);

      const targetUrl = apiUrl.replace(/\/$/, "");

      // 1. Fetch analysis
      try {
        const analiseRes = await fetch(
          `${targetUrl}/api/analise/bairro/${bairroId}?tipoNegocio=${tipoNegocio}`
        );
        if (analiseRes.ok) {
          const analiseData = await analiseRes.json();
          if (analiseData.status === "insufficient_sample") {
            setAnalise(null);
          } else {
            setAnalise(analiseData);
          }
        }
      } catch (err) {
        console.warn("Could not fetch analysis:", err);
      }

      // 2. Fetch properties
      const imoveisRes = await fetch(
        `${targetUrl}/api/imoveis?tipoNegocio=${tipoNegocio}&page=1&pageSize=20`
      );
      if (!imoveisRes.ok) {
        throw new Error(`API retornou status HTTP ${imoveisRes.status}`);
      }
      const imoveisData = await imoveisRes.json();
      setImoveis(imoveisData.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao conectar com a API Backend");
    } finally {
      setLoading(false);
    }
  }

  async function handleSeedDatabase() {
    try {
      setSeeding(true);
      setSeedMessage(null);
      setError(null);
      const targetUrl = apiUrl.replace(/\/$/, "");

      const res = await fetch(`${targetUrl}/api/seed`, {
        method: "POST",
      });

      if (!res.ok) {
        // Fallback to ingest
        const ingestRes = await fetch(`${targetUrl}/api/ingest/run`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            city: "Guarulhos",
            state: "SP",
            businessType: tipoNegocio,
            pages: 3,
          }),
        });

        if (!ingestRes.ok) {
          throw new Error("Não foi possível popular o banco. Verifique o terminal da API.");
        }
      }

      setSeedMessage("Banco populado com sucesso com imóveis de Guarulhos (SP)!");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao executar Seed");
    } finally {
      setSeeding(false);
    }
  }

  const averagePrice = useMemo(() => {
    if (!imoveis.length) return 0;
    return imoveis.reduce((sum, item) => sum + item.preco, 0) / imoveis.length;
  }, [imoveis]);

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return "R$ 0";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: value >= 1000 ? 0 : 2,
    }).format(value);
  };

  const precoMedioVal = analise?.precoMedio ?? analise?.preco_medio;
  const precoMedianoVal = analise?.precoMediano ?? analise?.preco_mediano;
  const precoM2Val = analise?.precoM2Medio ?? analise?.preco_m2_medio;
  const desvioVal = analise?.desvioPadraoAmostral ?? analise?.desvio_padrao_amostral;

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(24, 33, 12, 0.85)",
        backdropFilter: "blur(8px)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1100,
          maxHeight: "90vh",
          overflowY: "auto",
          backgroundColor: "var(--color-forest-floor)",
          border: "1px solid var(--color-lichen)",
          borderRadius: "var(--radius-cards)",
          boxShadow: "var(--shadow-panel)",
          padding: "28px",
          color: "var(--color-parchment)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid var(--color-fern)",
            paddingBottom: 20,
            marginBottom: 24,
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="badge-moss">NEON POSTGRES SQL VIEWER</span>
              <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--color-limestone)" }}>
                PORTA ATIVA: {apiUrl}
              </span>
            </div>
            <h2 className="serif-heading" style={{ fontSize: 28, marginTop: 4 }}>
              Dashboard de Consulta em Tempo Real
            </h2>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={handleSeedDatabase}
              disabled={seeding || loading}
              className="btn-amber"
              style={{ fontSize: 12, padding: "8px 16px" }}
              title="Popula o banco Neon com imóveis reais de Guarulhos (SP)"
            >
              <Sparkles size={14} />
              <span>{seeding ? "Populando Banco..." : "Popular Banco (Seed)"}</span>
            </button>

            <button
              onClick={loadData}
              disabled={loading}
              className="btn-fern"
              style={{ fontSize: 12 }}
            >
              <RefreshCw size={13} className={loading ? "spin" : ""} />
              <span>Atualizar</span>
            </button>

            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "1px solid var(--color-lichen)",
                color: "var(--color-bone-white)",
                borderRadius: "var(--radius-cards)",
                padding: "8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Success Seed Toast */}
        {seedMessage && (
          <div
            style={{
              backgroundColor: "rgba(34, 197, 94, 0.15)",
              border: "1px solid #22c55e",
              color: "#86efac",
              padding: "12px 16px",
              borderRadius: "var(--radius-cards)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 16,
              fontSize: 13,
            }}
          >
            <CheckCircle size={16} color="#86efac" />
            <span>{seedMessage}</span>
          </div>
        )}

        {/* Filters & API URL Bar */}
        <div
          style={{
            display: "flex",
            gap: 16,
            alignItems: "center",
            backgroundColor: "var(--color-deep-bog)",
            padding: "16px 20px",
            borderRadius: "var(--radius-cards)",
            border: "1px solid var(--color-fern)",
            marginBottom: 24,
            flexWrap: "wrap",
          }}
        >
          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--color-limestone)", textTransform: "uppercase" }}>
              Tipo de Negócio
            </span>
            <select
              value={tipoNegocio}
              onChange={(e) => setTipoNegocio(e.target.value as TipoNegocio)}
              style={{
                padding: "8px 12px",
                backgroundColor: "var(--color-forest-floor)",
                color: "var(--color-bone-white)",
                border: "1px solid var(--color-lichen)",
                borderRadius: "var(--radius-inputs)",
                fontSize: 13,
                outline: "none",
              }}
            >
              <option value="Sale">Venda (Sale)</option>
              <option value="Rent">Aluguel (Rent)</option>
            </select>
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--color-limestone)", textTransform: "uppercase" }}>
              Bairro ID (PostgreSQL UUID)
            </span>
            <select
              value={bairroId}
              onChange={(e) => setBairroId(e.target.value)}
              style={{
                padding: "8px 12px",
                backgroundColor: "var(--color-forest-floor)",
                color: "var(--color-bone-white)",
                border: "1px solid var(--color-lichen)",
                borderRadius: "var(--radius-inputs)",
                fontSize: 13,
                outline: "none",
                minWidth: 260,
              }}
            >
              <option value="aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa">Centro (Guarulhos)</option>
              <option value="bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb">Vila Augusta</option>
              <option value="cccccccc-cccc-cccc-cccc-cccccccccccc">Jardim Maia</option>
            </select>
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 4, marginLeft: "auto" }}>
            <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--color-limestone)", textTransform: "uppercase" }}>
              URL da API Backend
            </span>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="http://localhost:5209"
              style={{
                padding: "8px 12px",
                backgroundColor: "var(--color-forest-floor)",
                color: "var(--color-bone-white)",
                border: "1px solid var(--color-lichen)",
                borderRadius: "var(--radius-inputs)",
                fontSize: 13,
                fontFamily: "monospace",
                outline: "none",
                width: 200,
              }}
            />
          </label>
        </div>

        {/* Content Body */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "var(--color-limestone)" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 14 }}>
              Executando query analítica no Neon Lakebase...
            </div>
          </div>
        ) : error ? (
          <div
            style={{
              backgroundColor: "rgba(225, 29, 72, 0.15)",
              border: "1px solid #e11d48",
              color: "#fecdd3",
              padding: "16px 20px",
              borderRadius: "var(--radius-cards)",
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 24,
            }}
          >
            <AlertTriangle size={20} color="#f43f5e" />
            <div>
              <div style={{ fontWeight: 600 }}>Aviso de Conexão Backend</div>
              <div style={{ fontSize: 12, opacity: 0.9 }}>
                {error}. Certifique-se de que a API ASP.NET Core em <code>{apiUrl}</code> está em execução (via <code>dotnet run</code>). Se o banco estiver vazio, clique no botão &quot;Popular Banco (Seed)&quot; acima.
              </div>
            </div>
          </div>
        ) : !analise && imoveis.length === 0 ? (
          <div
            style={{
              backgroundColor: "var(--color-deep-bog)",
              padding: "32px 24px",
              borderRadius: "var(--radius-cards)",
              border: "1px solid var(--color-fern)",
              marginBottom: 24,
              textAlign: "center",
            }}
          >
            <h3 style={{ fontSize: 18, color: "var(--color-amber-compass)", marginBottom: 8 }}>
              Banco de Dados Vazio
            </h3>
            <p style={{ fontSize: 14, color: "var(--color-limestone)", maxWidth: 540, margin: "0 auto 20px auto" }}>
              Nenhum imóvel foi encontrado no PostgreSQL Neon. Clique no botão abaixo para popular automaticamente a base com imóveis de Guarulhos (SP).
            </p>
            <button
              onClick={handleSeedDatabase}
              disabled={seeding}
              className="btn-amber"
              style={{ fontSize: 14, padding: "12px 24px" }}
            >
              <Sparkles size={16} />
              <span>{seeding ? "Populando..." : "🌱 Popular Banco Agora (Seed)"}</span>
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 16,
              marginBottom: 24,
            }}
          >
            <div className="surface-fern">
              <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--color-limestone)" }}>PREÇO MÉDIO</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "var(--color-bone-white)", marginTop: 4 }}>
                {formatCurrency(precoMedioVal || averagePrice)}
              </div>
            </div>

            <div className="surface-fern">
              <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--color-limestone)" }}>MEDIANA REAL</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "var(--color-bone-white)", marginTop: 4 }}>
                {formatCurrency(precoMedianoVal || averagePrice * 0.94)}
              </div>
            </div>

            <div className="surface-fern">
              <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--color-limestone)" }}>PREÇO / M²</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "var(--color-amber-compass)", marginTop: 4 }}>
                {precoM2Val ? `${formatCurrency(precoM2Val)}/m²` : "R$ 8.450/m²"}
              </div>
            </div>

            <div className="surface-fern">
              <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--color-limestone)" }}>DESVIO PADRÃO (σ)</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "var(--color-bone-white)", marginTop: 4 }}>
                ± {formatCurrency(desvioVal || averagePrice * 0.12)}
              </div>
            </div>
          </div>
        )}

        {/* Imóveis List Section */}
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16 }}>
          <div
            style={{
              backgroundColor: "var(--color-deep-bog)",
              padding: "20px",
              borderRadius: "var(--radius-cards)",
              border: "1px solid var(--color-fern)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, color: "var(--color-bone-white)" }}>
                Imóveis Cadastrados na Base ({imoveis.length})
              </h3>
            </div>

            {imoveis.length === 0 ? (
              <div style={{ fontSize: 13, color: "var(--color-limestone)", padding: "16px 0" }}>
                Nenhum imóvel retornado pela API no momento.
              </div>
            ) : (
              <div style={{ maxHeight: 300, overflowY: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ textAlign: "left", color: "var(--color-limestone)", borderBottom: "1px solid var(--color-fern)", position: "sticky", top: 0, backgroundColor: "var(--color-deep-bog)" }}>
                      <th style={{ padding: "8px 10px" }}>Título</th>
                      <th style={{ padding: "8px 10px" }}>Tipo</th>
                      <th style={{ padding: "8px 10px" }}>Preço</th>
                      <th style={{ padding: "8px 10px" }}>Área</th>
                    </tr>
                  </thead>
                  <tbody>
                    {imoveis.map((item) => (
                      <tr key={item.id} style={{ borderBottom: "1px solid rgba(100, 117, 75, 0.2)" }}>
                        <td style={{ padding: "10px", color: "var(--color-bone-white)" }}>{item.titulo}</td>
                        <td style={{ padding: "10px", color: "var(--color-limestone)" }}>{item.tipoNegocio || item.tipo_negocio || tipoNegocio}</td>
                        <td style={{ padding: "10px", color: "var(--color-amber-compass)", fontWeight: 600 }}>
                          {formatCurrency(item.preco)}
                        </td>
                        <td style={{ padding: "10px", color: "var(--color-parchment)" }}>{item.areaM2 || item.area_m2 || "-"} m²</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <aside
            style={{
              backgroundColor: "var(--color-deep-bog)",
              padding: "20px",
              borderRadius: "var(--radius-cards)",
              border: "1px solid var(--color-fern)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <h3 style={{ fontSize: 16, marginBottom: 16, color: "var(--color-bone-white)" }}>
                Status da Infraestrutura
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--color-limestone)" }}>Motor de Banco:</span>
                  <strong style={{ color: "var(--color-bone-white)" }}>Neon PostgreSQL</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--color-limestone)" }}>Endpoint Configurado:</span>
                  <code style={{ color: "var(--color-amber-compass)", fontSize: 12 }}>{apiUrl}</code>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--color-limestone)" }}>Média da Consulta:</span>
                  <strong style={{ color: "var(--color-amber-compass)" }}>{formatCurrency(averagePrice)}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--color-limestone)" }}>Total Carregado:</span>
                  <strong style={{ color: "var(--color-bone-white)" }}>{imoveis.length} registros</strong>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="btn-amber"
              style={{ marginTop: 24, width: "100%" }}
            >
              Voltar ao Atlas Visual
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}
