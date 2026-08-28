"use client";

import { Compass, Database, ArrowUpRight, MapPin, Terminal } from "lucide-react";

interface CartographerFooterProps {
  onOpenDashboard: () => void;
}

export function CartographerFooter({ onOpenDashboard }: CartographerFooterProps) {
  return (
    <footer
      style={{
        backgroundColor: "var(--color-deep-bog)",
        borderTop: "1px solid var(--color-fern)",
        paddingTop: "var(--spacing-64)",
        paddingBottom: "var(--spacing-48)",
        color: "var(--color-parchment)",
        position: "relative",
        zIndex: 10,
      }}
    >
      <div
        style={{
          maxWidth: "var(--page-max-width)",
          margin: "0 auto",
          padding: "0 24px",
        }}
      >
        {/* Top Field Journal Strip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(100, 117, 75, 0.3)",
            paddingBottom: "var(--spacing-24)",
            marginBottom: "var(--spacing-48)",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          {/* Coordinates Tag */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--color-limestone)",
              letterSpacing: "0.06em",
            }}
          >
            <MapPin size={15} color="var(--color-amber-compass)" />
            <span>DATUM: 23°27&apos;49&quot;S 46°31&apos;59&quot;W • GUARULHOS, SÃO PAULO</span>
          </div>

          {/* Database Live Status Indicator */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              backgroundColor: "var(--color-forest-floor)",
              border: "1px solid var(--color-lichen)",
              padding: "4px 12px",
              borderRadius: "var(--radius-badges)",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                backgroundColor: "#86efac",
                boxShadow: "0 0 8px #86efac",
              }}
            />
            <span style={{ color: "var(--color-bone-white)" }}>NEON POSTGRES: SYNCED</span>
          </div>
        </div>

        {/* 4-Column Directory Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 40,
            marginBottom: "var(--spacing-64)",
          }}
        >
          {/* Col 1: Brand info */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "var(--radius-cards)",
                  backgroundColor: "var(--color-forest-floor)",
                  border: "1px solid var(--color-lichen)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--color-amber-compass)",
                }}
              >
                <Compass size={18} />
              </div>
              <span
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 20,
                  fontWeight: 600,
                  color: "var(--color-bone-white)",
                }}
              >
                AppImóveis
              </span>
            </div>
            <p style={{ fontSize: 13, color: "var(--color-limestone)", lineHeight: 1.5, marginBottom: 16 }}>
              Plataforma de inteligência cartográfica e precificação territorial alimentada por dados geoespaciais em tempo real.
            </p>
            <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--color-lichen)" }}>
              CARTOGRAPHY & SPATIAL ECONOMETRICS
            </div>
          </div>

          {/* Col 2: Map & Atlas */}
          <div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "var(--color-bone-white)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 16,
              }}
            >
              Atlas Cartográfico
            </div>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
              <li>
                <a href="#mapa-explorer" style={{ color: "var(--color-limestone)", transition: "color 0.2s" }}>
                  Mapa Vetorial Interativo
                </a>
              </li>
              <li>
                <a href="#mapa-explorer" style={{ color: "var(--color-limestone)", transition: "color 0.2s" }}>
                  Mancha de Calor R$/m²
                </a>
              </li>
              <li>
                <a href="#mapa-explorer" style={{ color: "var(--color-limestone)", transition: "color 0.2s" }}>
                  Topografia & Relevo
                </a>
              </li>
              <li>
                <a href="#bairros-matrix" style={{ color: "var(--color-limestone)", transition: "color 0.2s" }}>
                  Índice de Bairros de Guarulhos
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Intelligence & Method */}
          <div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "var(--color-bone-white)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 16,
              }}
            >
              Metodologia & Dados
            </div>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
              <li>
                <a href="#metodologia-stats" style={{ color: "var(--color-limestone)", transition: "color 0.2s" }}>
                  Curvas Gaussianas de Sigma
                </a>
              </li>
              <li>
                <a href="#metodologia-stats" style={{ color: "var(--color-limestone)", transition: "color 0.2s" }}>
                  Corte Algorítmico de Outliers
                </a>
              </li>
              <li>
                <a href="#calculadora-regiao" style={{ color: "var(--color-limestone)", transition: "color 0.2s" }}>
                  Simulador de Avaliação
                </a>
              </li>
              <li>
                <button
                  onClick={onOpenDashboard}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--color-amber-compass)",
                    padding: 0,
                    cursor: "pointer",
                    fontSize: 13,
                    fontFamily: "var(--font-sans)",
                    textAlign: "left",
                  }}
                >
                  Consulta Direta à API Backend →
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Tech Stack */}
          <div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "var(--color-bone-white)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 16,
              }}
            >
              Tecnologia & Infraestrutura
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13, color: "var(--color-limestone)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Database size={14} color="var(--color-amber-compass)" />
                <span>Neon Serverless Postgres</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Terminal size={14} color="var(--color-amber-compass)" />
                <span>ASP.NET Core 10 Web API</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Compass size={14} color="var(--color-amber-compass)" />
                <span>Next.js 16 + React 19 App</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Disclaimer */}
        <div
          style={{
            borderTop: "1px solid rgba(100, 117, 75, 0.25)",
            paddingTop: "var(--spacing-24)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
            fontSize: 12,
            color: "var(--color-lichen)",
          }}
        >
          <div>
            © {new Date().getFullYear()} AppImóveis GIS Atlas. Todos os direitos reservados.
          </div>
          <div>
            Inspirado na estética Felt Cartographic Atlas — Moss Canvas, Serif Headlines & Amber Needle.
          </div>
        </div>
      </div>
    </footer>
  );
}
