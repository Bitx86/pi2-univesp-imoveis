"use client";

import React from "react";
import { ArrowRight, Layers, Compass, BarChart3, ShieldCheck } from "lucide-react";

interface HeroSectionProps {
  onExploreMap: () => void;
  onOpenDashboard: () => void;
}

export function HeroSection({ onExploreMap, onOpenDashboard }: HeroSectionProps) {
  return (
    <section
      style={{
        position: "relative",
        paddingTop: "var(--spacing-80)",
        paddingBottom: "var(--spacing-64)",
        textAlign: "center",
        zIndex: 10,
      }}
    >
      <div
        style={{
          maxWidth: "var(--page-max-width)",
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Editorial Eyebrow Tag */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            backgroundColor: "var(--color-fern)",
            border: "1px solid var(--color-lichen)",
            padding: "6px 14px",
            borderRadius: "var(--radius-badges)",
            marginBottom: "var(--spacing-32)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: "var(--color-amber-compass)",
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: "0.08em",
              color: "var(--color-bone-white)",
              textTransform: "uppercase",
            }}
          >
            ATLAS GEOESPACIAL DE PRECIFICAÇÃO IMOBILIÁRIA • GUARULHOS & REGIÃO
          </span>
        </div>

        {/* Signature Editorial Serif Display Headline */}
        <h1
          className="serif-display hero-title"
          style={{
            maxWidth: 1040,
            marginBottom: "var(--spacing-24)",
            color: "var(--color-bone-white)",
          }}
        >
          A geografia oculta do valor imobiliário em Guarulhos.
        </h1>

        {/* Subtitle in Atlas Grotesk */}
        <p
          className="sans-subheading hero-subtitle"
          style={{
            maxWidth: 760,
            color: "var(--color-parchment)",
            marginBottom: "var(--spacing-48)",
            opacity: 0.95,
          }}
        >
          Decodifique o mercado imobiliário de Guarulhos com rigor cartográfico e precisão estatística. 
          Cálculo contínuo de mediana, dispersão sigma e valor por metro quadrado do Jardim Maia a Bonsucesso, alimentado por um banco geoespacial de alta performance.
        </p>

        {/* Two CTAs Side-by-Side */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 24,
            flexWrap: "wrap",
            marginBottom: "var(--spacing-64)",
          }}
        >
          <button
            onClick={onExploreMap}
            className="btn-amber"
            style={{
              padding: "16px 32px",
              fontSize: 16,
              gap: 10,
            }}
          >
            <span>Explorar Atlas de Guarulhos</span>
            <ArrowRight size={18} />
          </button>

          <button
            onClick={onOpenDashboard}
            className="btn-ghost-link"
            style={{
              fontSize: 16,
              padding: "8px 0",
            }}
          >
            Acessar API & Dashboard de Amostras
          </button>
        </div>

        {/* Key Metrics Strip / Field Journal Stamp */}
        <div
          style={{
            width: "100%",
            maxWidth: 1020,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
            backgroundColor: "var(--color-forest-floor)",
            border: "1px solid var(--color-lichen)",
            borderRadius: "var(--radius-cards)",
            padding: "20px 24px",
            boxShadow: "var(--shadow-sm)",
            textAlign: "left",
          }}
        >
          <div style={{ borderRight: "1px solid rgba(100, 117, 75, 0.4)", paddingRight: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--color-amber-compass)", marginBottom: 4 }}>
              <Layers size={15} />
              <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>Base Cadastral</span>
            </div>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 26, color: "var(--color-bone-white)", fontWeight: 400 }}>
              14.280+
            </div>
            <div style={{ fontSize: 12, color: "var(--color-limestone)", marginTop: 2 }}>
              Imóveis georreferenciados em Guarulhos
            </div>
          </div>

          <div style={{ borderRight: "1px solid rgba(100, 117, 75, 0.4)", paddingRight: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--color-amber-compass)", marginBottom: 4 }}>
              <BarChart3 size={15} />
              <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>Fórmula Estatística</span>
            </div>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 26, color: "var(--color-bone-white)", fontWeight: 400 }}>
              ± 1.2 σ
            </div>
            <div style={{ fontSize: 12, color: "var(--color-limestone)", marginTop: 2 }}>
              Corte algorítmico de outliers
            </div>
          </div>

          <div style={{ borderRight: "1px solid rgba(100, 117, 75, 0.4)", paddingRight: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--color-amber-compass)", marginBottom: 4 }}>
              <Compass size={15} />
              <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>Resolução Urbana</span>
            </div>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 26, color: "var(--color-bone-white)", fontWeight: 400 }}>
              47 Bairros
            </div>
            <div style={{ fontSize: 12, color: "var(--color-limestone)", marginTop: 2 }}>
              Polígonos e eixos Dutra/Ayrton Senna
            </div>
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--color-amber-compass)", marginBottom: 4 }}>
              <ShieldCheck size={15} />
              <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>Sincronização</span>
            </div>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 26, color: "var(--color-bone-white)", fontWeight: 400 }}>
              0.04s
            </div>
            <div style={{ fontSize: 12, color: "var(--color-limestone)", marginTop: 2 }}>
              Latência Neon Lakebase
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .hero-title {
            font-size: 44px !important;
            letter-spacing: -1.8px !important;
            line-height: 0.95 !important;
          }
          .hero-subtitle {
            font-size: 16px !important;
          }
        }
        @media (min-width: 769px) {
          .hero-title {
            font-size: 80px !important;
            letter-spacing: -3.44px !important;
            line-height: 0.88 !important;
          }
        }
      `}</style>
    </section>
  );
}
