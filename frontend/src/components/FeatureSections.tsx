"use client";

import React, { useState } from "react";
import {
  BarChart3,
  TrendingDown,
  Layers,
  Database,
  CheckCircle,
  Activity,
  Zap,
  ShieldAlert,
  Code2,
  Sliders,
} from "lucide-react";

export function FeatureSections() {
  const [selectedConfidence, setSelectedConfidence] = useState<number>(95);
  const [activeLayerTab, setActiveLayerTab] = useState<"zoning" | "transit" | "relief" | "density">("transit");

  return (
    <div id="metodologia-stats" style={{ position: "relative", zIndex: 10 }}>
      {/* ========================================================================= */}
      {/* FEATURE 1: STATISTICAL DISPERSION */}
      {/* ========================================================================= */}
      <section
        style={{
          maxWidth: "var(--page-max-width)",
          margin: "0 auto",
          padding: "0 24px",
          marginBottom: "var(--spacing-80)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "var(--color-amber-compass)",
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 8,
          }}
        >
          <BarChart3 size={14} />
          <span>MOTOR ESTATÍSTICO • CURVAS DE DENSIDADE GAUSSIANA</span>
        </div>
        <h2 className="serif-heading-lg" style={{ marginBottom: 16 }}>
          Mediana, desvio padrão e dispersão real.
        </h2>
        <p
          className="sans-body"
          style={{ maxWidth: 740, margin: "0 auto var(--spacing-48) auto", color: "var(--color-parchment)" }}
        >
          Médias simples distorcem a realidade de um bairro ao somar coberturas de luxo a imóveis populares.
          Nosso algoritmo calcula a mediana e o desvio padrão amostral com intervalos de corte para expor oportunidades reais.
        </p>

        {/* Embedded UI Visual for Feature 1 (Light surface Felt panel) */}
        <div
          className="product-ui-panel"
          style={{
            backgroundColor: "#ffffff",
            padding: "32px",
            textAlign: "left",
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr",
            gap: 32,
            alignItems: "center",
          }}
        >
          {/* Gaussian Bell Curve Visualizer */}
          <div
            style={{
              backgroundColor: "#f9fbf7",
              border: "1px solid #d8dcd2",
              borderRadius: "var(--radius-cards)",
              padding: "24px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <span className="badge-limestone">DISTRIBUIÇÃO AMOSTRAL JARDIM MAIA (GUARULHOS)</span>
                <h4 style={{ fontSize: 16, fontWeight: 700, color: "#18210c", marginTop: 4 }}>
                  Curva de Densidade de Preço/m²
                </h4>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: 11, color: "#666", fontFamily: "var(--font-mono)" }}>Corte de Outliers:</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-amber-compass)", marginLeft: 6 }}>
                  ± 1.96 σ
                </span>
              </div>
            </div>

            {/* SVG Gaussian Curve */}
            <svg viewBox="0 0 500 200" style={{ width: "100%", height: "auto", overflow: "visible" }}>
              <defs>
                <linearGradient id="bell-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3d521e" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#3d521e" stopOpacity="0.05" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="50" y1="160" x2="450" y2="160" stroke="#d8dcd2" strokeWidth="1.5" />
              <line x1="250" y1="30" x2="250" y2="160" stroke="var(--color-amber-compass)" strokeWidth="2" strokeDasharray="4 2" />

              {/* Confidence Band Shading */}
              <path
                d="M 120,160 L 120,135 C 170,110 210,35 250,35 C 290,35 330,110 380,135 L 380,160 Z"
                fill="url(#bell-grad)"
              />

              {/* Bell Curve Stroke */}
              <path
                d="M 50,158 C 100,156 160,130 200,80 C 230,40 240,35 250,35 C 260,35 270,40 300,80 C 340,130 400,156 450,158"
                fill="none"
                stroke="var(--color-moss-canvas)"
                strokeWidth="3"
              />

              {/* Outlier Data Points (Scatter Dots) */}
              <circle cx="90" cy="155" r="4" fill="#e11d48">
                <title>Outlier Subavaliado</title>
              </circle>
              <circle cx="430" cy="155" r="4" fill="#e11d48">
                <title>Outlier Sobreavaliado</title>
              </circle>

              {/* Normal Data Points inside the curve */}
              <circle cx="160" cy="120" r="4" fill="var(--color-amber-compass)" />
              <circle cx="210" cy="70" r="4" fill="var(--color-amber-compass)" />
              <circle cx="250" cy="35" r="5" fill="var(--color-amber-compass)" />
              <circle cx="290" cy="70" r="4" fill="var(--color-amber-compass)" />
              <circle cx="340" cy="120" r="4" fill="var(--color-amber-compass)" />

              {/* Labels */}
              <text x="120" y="180" fontSize="10" fontFamily="monospace" fill="#666" textAnchor="middle">-1.96σ (R$ 8.2k)</text>
              <text x="250" y="180" fontSize="11" fontFamily="monospace" fill="#18210c" fontWeight="bold" textAnchor="middle">MEDIANA (R$ 10.4k)</text>
              <text x="380" y="180" fontSize="10" fontFamily="monospace" fill="#666" textAnchor="middle">+1.96σ (R$ 12.6k)</text>
            </svg>

            {/* Gaussian Legend */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18, fontSize: 11, color: "#666" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "var(--color-amber-compass)" }} />
                <span>Amostras Validadas no Cluster</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#e11d48" }} />
                <span>Outliers Eliminados pelo Sigma</span>
              </div>
            </div>
          </div>

          {/* Explanation Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                backgroundColor: "#f4f6f0",
                padding: "16px 20px",
                borderRadius: "var(--radius-cards)",
                border: "1px solid #d8dcd2",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--color-moss-canvas)", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
                <CheckCircle size={16} color="var(--color-amber-compass)" />
                <span>Eliminação Robusta de Distorções</span>
              </div>
              <p style={{ fontSize: 13, color: "#444444", lineHeight: 1.4 }}>
                Ao contrário de portais convencionais que exibem médias inflacionadas por anúncios duplicados, o AppImóveis cruza desvio padrão e mediana para definir o valor real de liquidez.
              </p>
            </div>

            <div
              style={{
                backgroundColor: "#f4f6f0",
                padding: "16px 20px",
                borderRadius: "var(--radius-cards)",
                border: "1px solid #d8dcd2",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--color-moss-canvas)", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
                <Zap size={16} color="var(--color-amber-compass)" />
                <span>Radar de Oportunidades Subavaliadas</span>
              </div>
              <p style={{ fontSize: 13, color: "#444444", lineHeight: 1.4 }}>
                Identifica imediatamente imóveis cadastrados que estejam abaixo de $-1\sigma$ da média regional, permitindo a investidores fechar negócios com margem de segurança.
              </p>
            </div>

            <div
              style={{
                backgroundColor: "#f4f6f0",
                padding: "16px 20px",
                borderRadius: "var(--radius-cards)",
                border: "1px solid #d8dcd2",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--color-moss-canvas)", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
                <Activity size={16} color="var(--color-amber-compass)" />
                <span>Amostragem Mínima Parametrizada</span>
              </div>
              <p style={{ fontSize: 13, color: "#444444", lineHeight: 1.4 }}>
                Regiões com menos de 30 amostras ativas recebem a flag <code>insufficient_sample</code>, garantindo que nenhum relatório seja emitido sem solidez estatística.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FEATURE 2: GIS LAYERS & URBAN TOPOGRAPHY */}
      {/* ========================================================================= */}
      <section
        style={{
          maxWidth: "var(--page-max-width)",
          margin: "0 auto",
          padding: "0 24px",
          marginBottom: "var(--spacing-80)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "var(--color-amber-compass)",
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 8,
          }}
        >
          <Layers size={14} />
          <span>CAMADAS TERRITORIAIS • TOPOGRAFIA E INFRAESTRUTURA</span>
        </div>
        <h2 className="serif-heading-lg" style={{ marginBottom: 16 }}>
          Visão em camadas sobre o tecido da cidade.
        </h2>
        <p
          className="sans-body"
          style={{ maxWidth: 740, margin: "0 auto var(--spacing-48) auto", color: "var(--color-parchment)" }}
        >
          O valor de um imóvel não existe no vácuo: ele é produto de eixos viários, zoneamento estrutural, declividade do terreno e serviços no entorno.
        </p>

        {/* Embedded UI Visual for Feature 2 */}
        <div
          className="product-ui-panel"
          style={{
            backgroundColor: "#ffffff",
            padding: "28px",
            textAlign: "left",
          }}
        >
          {/* Layer Selector buttons */}
          <div
            style={{
              display: "flex",
              gap: 12,
              marginBottom: 20,
              flexWrap: "wrap",
              borderBottom: "1px solid #d8dcd2",
              paddingBottom: 16,
            }}
          >
            {[
              { id: "transit", label: "🚆 Eixos Estruturais & BRT", desc: "Corredores de transporte coletivo e canaletas expressas" },
              { id: "zoning", label: "🏛️ Zoneamento Municipal (ZR3/ZR4)", desc: "Potencial construtivo e coeficientes de aproveitamento" },
              { id: "relief", label: "⛰️ Relevo & Curvas de Nível", desc: "Declividade, bacias hidrográficas e insolação face norte" },
              { id: "density", label: "📊 Densidade Demográfica", desc: "Concentração populacional por km² e serviços 15 minutos" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveLayerTab(tab.id as any)}
                style={{
                  padding: "10px 16px",
                  borderRadius: "var(--radius-cards)",
                  border: activeLayerTab === tab.id ? "1px solid var(--color-moss-canvas)" : "1px solid #d8dcd2",
                  backgroundColor: activeLayerTab === tab.id ? "var(--color-moss-canvas)" : "#f4f6f0",
                  color: activeLayerTab === tab.id ? "#ffffff" : "#333333",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Interactive Layer Visual */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr",
              gap: 24,
              backgroundColor: "#f9fbf7",
              padding: "20px",
              borderRadius: "var(--radius-cards)",
              border: "1px solid #d8dcd2",
            }}
          >
            {/* Visual Canvas Diagram */}
            <div
              style={{
                backgroundColor: "#212f0c",
                borderRadius: "var(--radius-cards)",
                padding: "20px",
                color: "#ffffff",
                minHeight: 240,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="badge-moss">CAMADA ATIVA: {activeLayerTab.toUpperCase()}</span>
                <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--color-limestone)" }}>
                  POSTGIS POLYGONS
                </span>
              </div>

              {/* Decorative Vector lines inside map layer preview */}
              <div style={{ margin: "24px 0" }}>
                {activeLayerTab === "transit" && (
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-amber-compass)", marginBottom: 6 }}>
                      Eixos Rodovia Dutra, Ayrton Senna & Linha 13-Jade CPTM
                    </div>
                    <p style={{ fontSize: 12, color: "var(--color-limestone)", lineHeight: 1.4 }}>
                      Imóveis com acesso rápido ao Anel Viário, Rodovia Dutra e estações da CPTM (Cecap / Aeroporto) apresentam valorização de +24.8% e giro de locação ágil.
                    </p>
                  </div>
                )}
                {activeLayerTab === "zoning" && (
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-amber-compass)", marginBottom: 6 }}>
                      Zoneamento Urbano Guarulhos (ZUD & ZEU)
                    </div>
                    <p style={{ fontSize: 12, color: "var(--color-limestone)", lineHeight: 1.4 }}>
                      Mapeamento de eixos de centralidade, polos logísticos aeroportuários e coeficientes de aproveitamento para empreendimentos residenciais.
                    </p>
                  </div>
                )}
                {activeLayerTab === "relief" && (
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-amber-compass)", marginBottom: 6 }}>
                      Cotas Altimétricas (720m a 840m)
                    </div>
                    <p style={{ fontSize: 12, color: "var(--color-limestone)", lineHeight: 1.4 }}>
                      Bairros elevados com vista para a Serra da Cantareira (Jardim Maia / Vila Galvão) mantêm prêmio de valorização sobre áreas de várzea.
                    </p>
                  </div>
                )}
                {activeLayerTab === "density" && (
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-amber-compass)", marginBottom: 6 }}>
                      Hubs de Conveniência e Caminhabilidade
                    </div>
                    <p style={{ fontSize: 12, color: "var(--color-limestone)", lineHeight: 1.4 }}>
                      Índice de caminhabilidade (Walk Score) calculado a partir de densidade de supermercados, farmácias, escolas e parques num raio de 10 min.
                    </p>
                  </div>
                )}
              </div>

              <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--color-lichen)" }}>
                INTERSECÇÃO COM TABELA: `imoveis` x `bairros` (ST_Contains, ST_DWithin)
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 12 }}>
              <div style={{ backgroundColor: "#ffffff", padding: "12px 16px", borderRadius: "var(--radius-cards)", border: "1px solid #d8dcd2" }}>
                <div style={{ fontSize: 11, color: "#666", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>
                  Impacto Médio no Preço/m²
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "var(--color-moss-canvas)", marginTop: 2 }}>
                  + 18.5%
                </div>
                <div style={{ fontSize: 11, color: "#777", marginTop: 2 }}>
                  Em raio de 500m de infraestrutura chave
                </div>
              </div>

              <div style={{ backgroundColor: "#ffffff", padding: "12px 16px", borderRadius: "var(--radius-cards)", border: "1px solid #d8dcd2" }}>
                <div style={{ fontSize: 11, color: "#666", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>
                  Precisão Espacial
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "var(--color-amber-compass)", marginTop: 2 }}>
                  Sub-métrica (GPS Real)
                </div>
                <div style={{ fontSize: 11, color: "#777", marginTop: 2 }}>
                  Latitude / Longitude indexadas no PostgreSQL
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FEATURE 3: NEON POSTGRES ENGINE ARCHITECTURE */}
      {/* ========================================================================= */}
      <section
        style={{
          maxWidth: "var(--page-max-width)",
          margin: "0 auto",
          padding: "0 24px",
          marginBottom: "var(--spacing-80)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "var(--color-amber-compass)",
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 8,
          }}
        >
          <Database size={14} />
          <span>MOTOR SERVERLESS • NEON LAKEBASE POSTGRESQL</span>
        </div>
        <h2 className="serif-heading-lg" style={{ marginBottom: 16 }}>
          Consultas espaciais instantâneas com Neon Postgres.
        </h2>
        <p
          className="sans-body"
          style={{ maxWidth: 740, margin: "0 auto var(--spacing-48) auto", color: "var(--color-parchment)" }}
        >
          A infraestrutura do AppImóveis se apoia em tabelas relacionais com chaves UUID criptográficas, índices GiST e cálculo assíncrono de agregados estatísticos.
        </p>

        {/* Code / Architecture Terminal Surface (Deep Bog Surface in Felt palette) */}
        <div
          style={{
            backgroundColor: "var(--color-deep-bog)",
            border: "1px solid var(--color-lichen)",
            borderRadius: "var(--radius-cards)",
            padding: "24px",
            textAlign: "left",
            boxShadow: "var(--shadow-panel)",
          }}
        >
          {/* Terminal Window Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid var(--color-forest-floor)",
              paddingBottom: 12,
              marginBottom: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#ef4444" }} />
              <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#f59e0b" }} />
              <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#10b981" }} />
              <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--color-limestone)", marginLeft: 12 }}>
                neon-database // analise_regiao_query.sql
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontFamily: "var(--font-mono)", color: "#86efac" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#86efac" }} />
              BRANCH: main (ep-restless-pond) • AUTO-SCALE
            </div>
          </div>

          {/* SQL Query Preview with Cartographic Color Syntax */}
          <pre
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              lineHeight: 1.6,
              color: "var(--color-parchment)",
              overflowX: "auto",
              padding: "8px 0",
            }}
          >
            <code>
{`-- Consulta contínua de consolidação estatística por micro-região
SELECT 
    b.nome AS bairro,
    i.tipo_negocio,
    COUNT(i.id) AS amostra_count,
    ROUND(AVG(i.preco), 2) AS preco_medio,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY i.preco) AS preco_mediano,
    ROUND(AVG(i.preco / NULLIF(i.area_m2, 0)), 2) AS preco_m2_medio,
    ROUND(STDDEV_SAMP(i.preco), 2) AS desvio_padrao_amostral
FROM imoveis i
JOIN bairros b ON b.id = i.bairro_id
WHERE i.capturado_em >= NOW() - INTERVAL '60 days'
GROUP BY b.id, b.nome, i.tipo_negocio
HAVING COUNT(i.id) >= 30;`}
            </code>
          </pre>

          {/* Quick Metrics Bar below code */}
          <div
            style={{
              marginTop: 16,
              paddingTop: 14,
              borderTop: "1px solid var(--color-forest-floor)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              color: "var(--color-lichen)",
            }}
          >
            <div>ESTATÍSTICA: <span style={{ color: "var(--color-bone-white)" }}>STDDEV_SAMP & PERCENTILE_CONT</span></div>
            <div>EXECUÇÃO NEON: <span style={{ color: "var(--color-amber-compass)" }}>42ms</span></div>
            <div>INDEXAÇÃO: <span style={{ color: "#86efac" }}>idx_imoveis_bairro_tipo_negocio</span></div>
          </div>
        </div>
      </section>
    </div>
  );
}
