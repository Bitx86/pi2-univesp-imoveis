"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart3,
} from "lucide-react";
import {
  NEIGHBORHOODS,
  NeighborhoodData,
  BusinessType,
  formatBRL,
  formatCompactPrice,
} from "@/data/imoveisData";

interface StatsScreenProps {
  businessType: BusinessType;
  selectedNeighborhoodId?: string;
  neighborhoods?: NeighborhoodData[];
  onSelectNeighborhood?: (bairro: NeighborhoodData) => void;
  onNavigateToMap?: (bairroId: string) => void;
}

export function StatsScreen({
  businessType,
  selectedNeighborhoodId,
  neighborhoods,
  onSelectNeighborhood,
}: StatsScreenProps) {
  const effectiveNeighborhoods = useMemo(() => {
    return neighborhoods && neighborhoods.length > 0 ? neighborhoods : NEIGHBORHOODS;
  }, [neighborhoods]);

  const [bairroId, setBairroId] = useState<string>(
    selectedNeighborhoodId || effectiveNeighborhoods[0]?.id || "jardim-maia"
  );
  const [selectedConfidence, setSelectedConfidence] = useState<number>(95);
  const [activeLayerTab, setActiveLayerTab] = useState<
    "transit" | "zoning" | "relief"
  >("transit");

  useEffect(() => {
    if (selectedNeighborhoodId) {
      setBairroId(selectedNeighborhoodId);
    }
  }, [selectedNeighborhoodId]);

  const currentBairro = useMemo(() => {
    return effectiveNeighborhoods.find((b) => b.id === bairroId) || effectiveNeighborhoods[0];
  }, [effectiveNeighborhoods, bairroId]);

  const stats = businessType === "Sale" ? currentBairro.sale : currentBairro.rent;

  const handleBairroChange = (newId: string) => {
    setBairroId(newId);
    const found = effectiveNeighborhoods.find((b) => b.id === newId);
    if (found && onSelectNeighborhood) {
      onSelectNeighborhood(found);
    }
  };

  // Gaussian Curve Calculations
  const zScore = useMemo(() => {
    if (selectedConfidence === 90) return 1.645;
    if (selectedConfidence === 99) return 2.576;
    return 1.96; // 95%
  }, [selectedConfidence]);

  const lowerBound = Math.max(0, stats.medianPrice - zScore * stats.stdDev * (businessType === "Sale" ? 100 : 1));
  const upperBound = stats.medianPrice + zScore * stats.stdDev * (businessType === "Sale" ? 100 : 1);

  // Mock property dispersion points for the chart
  const samplePoints = useMemo(() => {
    const points = [];
    const baseM2 = stats.avgM2Price;
    const count = 28;
    for (let i = 0; i < count; i++) {
      const area = 40 + (i % 7) * 22 + (i * 3) % 15;
      const noise = (Math.sin(i * 1.7) * 0.18 + Math.cos(i * 2.3) * 0.12);
      const isOutlier = i === 4 || i === 21;
      const outlierFactor = isOutlier ? (i === 4 ? 1.45 : 0.62) : 1.0;
      const m2Val = Math.round(baseM2 * (1 + noise) * outlierFactor);
      const totalPrice = area * m2Val;
      points.push({
        id: i,
        area,
        m2Val,
        totalPrice,
        isOutlier,
      });
    }
    return points;
  }, [stats.avgM2Price]);

  return (
    <div
      className="screen-fade-in"
      style={{
        padding: "32px var(--margin-desktop)",
        maxWidth: 1320,
        margin: "0 auto",
        width: "100%",
      }}
    >
      {/* Header & Bairro Switcher */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: "var(--spacing-6)",
          borderBottom: "var(--border-technical)",
          paddingBottom: "var(--spacing-5)",
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              color: "var(--color-primary)",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 4,
            }}
          >
            <BarChart3 size={14} />
            <span>Motor Estatístico & DataViz Geoespacial</span>
          </div>
          <h1
            className="font-display"
            style={{ fontSize: 28, color: "var(--color-on-surface)", marginBottom: 6 }}
          >
            Análise de Dispersão e Rigor Gaussiano
          </h1>
          <p
            className="font-body"
            style={{
              fontSize: 14,
              color: "var(--color-on-surface-variant)",
              maxWidth: 680,
            }}
          >
            Médias simples distorcem a realidade imobiliária ao misturar imóveis
            atípicos. Nosso motor utiliza a mediana, o desvio padrão amostral e
            intervalos de confiança para isolar distorções e evidenciar o valor real.
          </p>
        </div>

        {/* Bairro Selector Control */}
        <div
          style={{
            backgroundColor: "var(--color-surface-container)",
            border: "var(--border-technical)",
            borderRadius: "var(--radius-cards)",
            padding: "10px 14px",
            minWidth: 260,
          }}
        >
          <label
            style={{
              fontSize: 10,
              color: "var(--color-outline)",
              textTransform: "uppercase",
              fontFamily: "var(--font-mono)",
              display: "block",
              marginBottom: 6,
            }}
          >
            Bairro sob Análise
          </label>
          <select
            value={bairroId}
            onChange={(e) => handleBairroChange(e.target.value)}
            style={{
              width: "100%",
              backgroundColor: "var(--color-surface-container-low)",
              border: "var(--border-technical)",
              borderRadius: "var(--radius-default)",
              color: "var(--color-on-surface)",
              padding: "7px 10px",
              fontFamily: "var(--font-sans)",
              fontSize: 13,
              outline: "none",
              cursor: "pointer",
            }}
          >
            {effectiveNeighborhoods.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({formatBRL(businessType === "Sale" ? b.sale.avgM2Price : b.rent.avgM2Price)}/m²)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12,
          marginBottom: "var(--spacing-8)",
        }}
      >
        <div className="surface-card">
          <div
            style={{
              fontSize: 10,
              color: "var(--color-outline)",
              textTransform: "uppercase",
              fontFamily: "var(--font-mono)",
              marginBottom: 4,
            }}
          >
            Mediana Real ({businessType === "Sale" ? "Venda" : "Locação"})
          </div>
          <div
            className="font-headline"
            style={{ fontSize: 22, color: "var(--color-on-surface)", marginBottom: 2 }}
          >
            {formatCompactPrice(stats.medianPrice, businessType === "Rent")}
          </div>
          <div
            style={{
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              color: "var(--color-primary)",
            }}
          >
            {formatBRL(stats.avgM2Price)}/m²
          </div>
        </div>

        <div className="surface-card">
          <div
            style={{
              fontSize: 10,
              color: "var(--color-outline)",
              textTransform: "uppercase",
              fontFamily: "var(--font-mono)",
              marginBottom: 4,
            }}
          >
            Desvio Padrão Amostral (σ)
          </div>
          <div
            className="font-headline"
            style={{ fontSize: 22, color: "var(--color-on-surface)", marginBottom: 2 }}
          >
            ± {businessType === "Sale" ? formatBRL(stats.stdDev * 100) : formatBRL(stats.stdDev * 10)}
          </div>
          <div
            style={{
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              color: "var(--color-on-surface-variant)",
            }}
          >
            Dispersão Relativa: {( (stats.stdDev / (stats.avgM2Price || 1)) * 100 ).toFixed(1)}%
          </div>
        </div>

        <div className="surface-card">
          <div
            style={{
              fontSize: 10,
              color: "var(--color-outline)",
              textTransform: "uppercase",
              fontFamily: "var(--font-mono)",
              marginBottom: 4,
            }}
          >
            Amostras Georreferenciadas
          </div>
          <div
            className="font-headline"
            style={{ fontSize: 22, color: "var(--color-on-surface)", marginBottom: 2 }}
          >
            {stats.samples} Imóveis
          </div>
          <div
            style={{
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              color: "var(--color-success)",
            }}
          >
            {stats.trend} nos últimos 12 meses
          </div>
        </div>

        <div className="surface-card">
          <div
            style={{
              fontSize: 10,
              color: "var(--color-outline)",
              textTransform: "uppercase",
              fontFamily: "var(--font-mono)",
              marginBottom: 4,
            }}
          >
            Corte Algorítmico de Outliers
          </div>
          <div
            className="font-headline"
            style={{ fontSize: 22, color: "var(--color-on-surface)", marginBottom: 2 }}
          >
            ± {zScore} σ
          </div>
          <div
            style={{
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              color: "var(--color-on-surface-variant)",
            }}
          >
            Confiança: {selectedConfidence}%
          </div>
        </div>
      </div>

      {/* Main Visualizations Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))",
          gap: 20,
          marginBottom: "var(--spacing-8)",
        }}
      >
        {/* GAUSSIAN CURVE CARD */}
        <div className="surface-card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
              borderBottom: "var(--border-technical)",
              paddingBottom: 10,
            }}
          >
            <div>
              <h3 className="font-headline" style={{ fontSize: 16, color: "var(--color-on-surface)" }}>
                Curva de Densidade Gaussiana
              </h3>
              <p style={{ fontSize: 11, color: "var(--color-on-surface-variant)" }}>
                Distribuição normal de preços e corte estatístico
              </p>
            </div>

            {/* Confidence Toggle */}
            <div
              style={{
                display: "flex",
                backgroundColor: "var(--color-surface-container-low)",
                border: "var(--border-technical)",
                borderRadius: "var(--radius-default)",
                padding: 2,
              }}
            >
              {[90, 95, 99].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedConfidence(lvl)}
                  style={{
                    background:
                      selectedConfidence === lvl
                        ? "var(--color-primary)"
                        : "transparent",
                    color:
                      selectedConfidence === lvl
                        ? "#ffffff"
                        : "var(--color-on-surface-variant)",
                    border: "none",
                    borderRadius: "var(--radius-default)",
                    padding: "3px 8px",
                    fontSize: 11,
                    fontFamily: "var(--font-mono)",
                    cursor: "pointer",
                  }}
                >
                  {lvl}%
                </button>
              ))}
            </div>
          </div>

          {/* SVG Gaussian Curve */}
          <div
            style={{
              backgroundColor: "var(--color-surface-container-low)",
              border: "var(--border-technical)",
              borderRadius: "var(--radius-default)",
              padding: "16px 10px 6px 10px",
              position: "relative",
            }}
          >
            <svg
              viewBox="0 0 500 220"
              style={{ width: "100%", height: "auto", overflow: "visible" }}
            >
              <defs>
                <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="30" y1="180" x2="480" y2="180" stroke="currentColor" opacity="0.15" strokeWidth="1" />
              <line x1="250" y1="20" x2="250" y2="180" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="3 3" />

              {/* -1.96 sigma line */}
              <line x1="120" y1="50" x2="120" y2="180" stroke="#f87171" strokeWidth="1" strokeDasharray="2 2" />
              {/* +1.96 sigma line */}
              <line x1="380" y1="50" x2="380" y2="180" stroke="#f87171" strokeWidth="1" strokeDasharray="2 2" />

              {/* Confidence Shaded Region */}
              <path
                d="M 120,180 L 120,140 Q 185,110 250,30 Q 315,110 380,140 L 380,180 Z"
                fill="url(#curveGradient)"
              />

              {/* Bell Curve Stroke */}
              <path
                d="M 30,178 C 100,175 160,140 250,30 C 340,140 400,175 480,178"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2.5"
              />

              {/* Center Median Dot */}
              <circle cx="250" cy="30" r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="1.5" />

              {/* Outlier markers */}
              <circle cx="70" cy="174" r="4" fill="#f87171" />
              <circle cx="440" cy="174" r="4" fill="#f87171" />

              {/* Labels */}
              <text x="250" y="16" fill="currentColor" opacity="0.9" fontSize="11" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                MEDIANA: {formatCompactPrice(stats.medianPrice, businessType === "Rent")}
              </text>
              <text x="120" y="200" fill="#f87171" fontSize="9" fontFamily="monospace" textAnchor="middle">
                -{zScore}σ ({formatCompactPrice(lowerBound, businessType === "Rent")})
              </text>
              <text x="380" y="200" fill="#f87171" fontSize="9" fontFamily="monospace" textAnchor="middle">
                +{zScore}σ ({formatCompactPrice(upperBound, businessType === "Rent")})
              </text>
            </svg>

            {/* Legend */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 16,
                marginTop: 10,
                fontSize: 10,
                fontFamily: "var(--font-mono)",
                color: "var(--color-on-surface-variant)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#3b82f6" }} />
                <span>Mediana Amostral</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 8, height: 8, backgroundColor: "rgba(59, 130, 246, 0.3)" }} />
                <span>Banda de Confiança ({selectedConfidence}%)</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#f87171" }} />
                <span>Outliers Expurgados</span>
              </div>
            </div>
          </div>
        </div>

        {/* PRICE DISPERSION VS AREA (M2) */}
        <div className="surface-card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
              borderBottom: "var(--border-technical)",
              paddingBottom: 10,
            }}
          >
            <div>
              <h3 className="font-headline" style={{ fontSize: 16, color: "var(--color-on-surface)" }}>
                Dispersão Valor/m² vs. Área
              </h3>
              <p style={{ fontSize: 11, color: "var(--color-on-surface-variant)" }}>
                Detecção de distorções por tipologia e metragem
              </p>
            </div>

            <span className="badge-tech">SCATTER REGRESSÃO</span>
          </div>

          <div
            style={{
              backgroundColor: "var(--color-surface-container-low)",
              border: "var(--border-technical)",
              borderRadius: "var(--radius-default)",
              padding: "16px 10px 10px 10px",
            }}
          >
            <svg viewBox="0 0 500 220" style={{ width: "100%", height: "auto" }}>
              {/* Axes */}
              <line x1="40" y1="180" x2="480" y2="180" stroke="currentColor" opacity="0.2" strokeWidth="1" />
              <line x1="40" y1="20" x2="40" y2="180" stroke="currentColor" opacity="0.2" strokeWidth="1" />

              {/* Grid Lines */}
              <line x1="40" y1="100" x2="480" y2="100" stroke="currentColor" opacity="0.08" strokeDasharray="2 3" />
              <line x1="260" y1="20" x2="260" y2="180" stroke="currentColor" opacity="0.08" strokeDasharray="2 3" />

              {/* Regression Trend Line */}
              <line x1="40" y1="130" x2="480" y2="70" stroke="#3b82f6" strokeWidth="1.5" strokeOpacity="0.8" />

              {/* Scatter Points */}
              {samplePoints.map((pt) => {
                const cx = 40 + ((pt.area - 30) / 180) * 430;
                const cy = 180 - ((pt.m2Val - stats.avgM2Price * 0.5) / (stats.avgM2Price * 1.2)) * 150;
                return (
                  <circle
                    key={pt.id}
                    cx={cx}
                    cy={Math.max(25, Math.min(175, cy))}
                    r={pt.isOutlier ? 4.5 : 3.5}
                    fill={pt.isOutlier ? "#f87171" : "#10b981"}
                    stroke={pt.isOutlier ? "#450a0a" : "var(--color-surface)"}
                    strokeWidth="1"
                    opacity={pt.isOutlier ? 0.9 : 0.8}
                  />
                );
              })}

              {/* Labels */}
              <text x="260" y="205" fill="currentColor" opacity="0.6" fontSize="10" fontFamily="monospace" textAnchor="middle">
                Área Útil Privativa (40 m² → 220 m²)
              </text>
              <text x="15" y="100" fill="currentColor" opacity="0.6" fontSize="10" fontFamily="monospace" transform="rotate(-90 15,100)" textAnchor="middle">
                Valor/m²
              </text>
            </svg>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 8,
                fontSize: 10,
                fontFamily: "var(--font-mono)",
                color: "var(--color-on-surface-variant)",
                borderTop: "var(--border-technical)",
                paddingTop: 6,
              }}
            >
              <span>Linha de Regressão Tendencial: -0.18 R$/m² por área</span>
              <span style={{ color: "var(--color-success)", fontWeight: 600 }}>
                Correlação R² = 0.84 (Alta Consistência)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* URBAN INFRASTRUCTURE GIS LAYERS TABS */}
      <div className="surface-card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 16,
            borderBottom: "var(--border-technical)",
            paddingBottom: 10,
          }}
        >
          <div>
            <h3 className="font-headline" style={{ fontSize: 16, color: "var(--color-on-surface)" }}>
              Camadas de Infraestrutura & Zoneamento Urbano
            </h3>
            <p style={{ fontSize: 11, color: "var(--color-on-surface-variant)" }}>
              Fatores geoespaciais que influenciam o prêmio de valorização
            </p>
          </div>

          <div
            style={{
              display: "flex",
              backgroundColor: "var(--color-surface-container-low)",
              border: "var(--border-technical)",
              borderRadius: "var(--radius-default)",
              padding: 2,
              gap: 2,
            }}
          >
            <button
              onClick={() => setActiveLayerTab("transit")}
              style={{
                background:
                  activeLayerTab === "transit"
                    ? "var(--color-primary)"
                    : "transparent",
                color:
                  activeLayerTab === "transit"
                    ? "#ffffff"
                    : "var(--color-on-surface-variant)",
                border: "none",
                borderRadius: "var(--radius-default)",
                padding: "6px 12px",
                fontSize: 12,
                fontFamily: "var(--font-sans)",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Transporte & Vias
            </button>
            <button
              onClick={() => setActiveLayerTab("zoning")}
              style={{
                background:
                  activeLayerTab === "zoning"
                    ? "var(--color-primary)"
                    : "transparent",
                color:
                  activeLayerTab === "zoning"
                    ? "#ffffff"
                    : "var(--color-on-surface-variant)",
                border: "none",
                borderRadius: "var(--radius-default)",
                padding: "6px 12px",
                fontSize: 12,
                fontFamily: "var(--font-sans)",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Zoneamento PDU
            </button>
            <button
              onClick={() => setActiveLayerTab("relief")}
              style={{
                background:
                  activeLayerTab === "relief"
                    ? "var(--color-primary)"
                    : "transparent",
                color:
                  activeLayerTab === "relief"
                    ? "#ffffff"
                    : "var(--color-on-surface-variant)",
                border: "none",
                borderRadius: "var(--radius-default)",
                padding: "6px 12px",
                fontSize: 12,
                fontFamily: "var(--font-sans)",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Topografia & Relevo
            </button>
          </div>
        </div>

        {/* Active Tab Content */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 14,
          }}
        >
          {activeLayerTab === "transit" && (
            <>
              <div className="surface-card-lowest">
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "var(--color-primary)" }} />
                  <span style={{ fontWeight: 600, fontSize: 13, color: "var(--color-on-surface)" }}>Linha 13-Jade CPTM</span>
                </div>
                <p style={{ fontSize: 12, color: "var(--color-on-surface-variant)", lineHeight: 1.4 }}>
                  Conexão expressa com o Aeroporto Internacional e Estação Engenheiro Goulart (acesso à Linha 12-Safira e Brás).
                </p>
                <div style={{ marginTop: 8, fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--color-primary)", fontWeight: 600 }}>
                  Impacto: +18.4% na valorização do m²
                </div>
              </div>

              <div className="surface-card-lowest">
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "var(--color-primary)" }} />
                  <span style={{ fontWeight: 600, fontSize: 13, color: "var(--color-on-surface)" }}>Eixos Rodoviários (Dutra & Fernão Dias)</span>
                </div>
                <p style={{ fontSize: 12, color: "var(--color-on-surface-variant)", lineHeight: 1.4 }}>
                  Acesso em menos de 8 minutos para a Marginal Tietê e conexão direta com a Zona Norte de São Paulo.
                </p>
                <div style={{ marginTop: 8, fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--color-primary)", fontWeight: 600 }}>
                  Impacto: Alta liquidez comercial e residencial
                </div>
              </div>
            </>
          )}

          {activeLayerTab === "zoning" && (
            <>
              <div className="surface-card-lowest">
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "var(--color-success)" }} />
                  <span style={{ fontWeight: 600, fontSize: 13, color: "var(--color-on-surface)" }}>Zona ZM-2 (Mista Média Densidade)</span>
                </div>
                <p style={{ fontSize: 12, color: "var(--color-on-surface-variant)", lineHeight: 1.4 }}>
                  Coeficiente de aproveitamento básico 2.0, gabarito permitido para edifícios residenciais com comércio ativo no térreo.
                </p>
              </div>

              <div className="surface-card-lowest">
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "var(--color-success)" }} />
                  <span style={{ fontWeight: 600, fontSize: 13, color: "var(--color-on-surface)" }}>Eixo de Estruturação Urbana</span>
                </div>
                <p style={{ fontSize: 12, color: "var(--color-on-surface-variant)", lineHeight: 1.4 }}>
                  Incentivos para studios e apartamentos compactos próximos a corredores de transporte de massa.
                </p>
              </div>
            </>
          )}

          {activeLayerTab === "relief" && (
            <>
              <div className="surface-card-lowest">
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#eab308" }} />
                  <span style={{ fontWeight: 600, fontSize: 13, color: "var(--color-on-surface)" }}>Cota Altimétrica Média: 760m</span>
                </div>
                <p style={{ fontSize: 12, color: "var(--color-on-surface-variant)", lineHeight: 1.4 }}>
                  Platô do Bosque Maia e Vila Augusta com excelente drenagem pluvial e vista permanente para a Serra da Cantareira.
                </p>
              </div>

              <div className="surface-card-lowest">
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#eab308" }} />
                  <span style={{ fontWeight: 600, fontSize: 13, color: "var(--color-on-surface)" }}>Várzea do Tietê: 715m</span>
                </div>
                <p style={{ fontSize: 12, color: "var(--color-on-surface-variant)", lineHeight: 1.4 }}>
                  Topografia plana ideal para condomínios horizontais e logística comercial.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
