"use client";

import React from "react";
import { Building2, Landmark, Compass, Hexagon, Shield, BarChart } from "lucide-react";

export function ClientProofRow() {
  const PARTNERS = [
    { name: "GEO-URBE RESEARCH", icon: Compass, type: "Cartografia & Dados" },
    { name: "CAPITAL REALTY ASSET", icon: Landmark, type: "Fundo Imobiliário" },
    { name: "VETOR URBANO INC", icon: Building2, type: "Incorporadora" },
    { name: "POSTGIS LABS BRASIL", icon: Hexagon, type: "Geoprocessamento" },
    { name: "AVALIA IMÓVEIS PRIME", icon: Shield, type: "Perícias Judiciais" },
  ];

  return (
    <section
      style={{
        maxWidth: "var(--page-max-width)",
        margin: "0 auto",
        padding: "var(--spacing-64) 24px",
        textAlign: "center",
        borderTop: "1px solid rgba(100, 117, 75, 0.3)",
        borderBottom: "1px solid rgba(100, 117, 75, 0.3)",
        marginBottom: "var(--spacing-80)",
      }}
    >
      <h3
        className="serif-heading"
        style={{
          color: "var(--color-bone-white)",
          fontSize: 32,
          fontWeight: 300,
          marginBottom: "var(--spacing-36)",
          maxWidth: 780,
          margin: "0 auto var(--spacing-36) auto",
        }}
      >
        Liderando o movimento de inteligência territorial no Brasil.
      </h3>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 40,
          flexWrap: "wrap",
        }}
      >
        {PARTNERS.map((partner, index) => {
          const Icon = partner.icon;
          return (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                color: "var(--color-parchment)",
                opacity: 0.85,
                transition: "opacity 0.2s, transform 0.2s",
                padding: "8px 14px",
                borderRadius: "var(--radius-cards)",
                backgroundColor: "rgba(33, 47, 12, 0.4)",
                border: "1px solid rgba(100, 117, 75, 0.25)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "1";
                e.currentTarget.style.borderColor = "var(--color-amber-compass)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "0.85";
                e.currentTarget.style.borderColor = "rgba(100, 117, 75, 0.25)";
              }}
            >
              <Icon size={20} color="var(--color-amber-compass)" strokeWidth={1.75} />
              <div style={{ textAlign: "left" }}>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    color: "var(--color-bone-white)",
                  }}
                >
                  {partner.name}
                </div>
                <div style={{ fontSize: 10, color: "var(--color-lichen)" }}>
                  {partner.type}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
