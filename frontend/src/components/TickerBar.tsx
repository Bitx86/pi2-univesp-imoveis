"use client";

import React from "react";

const TICKER_ITEMS = [
  { label: "JARDIM MAIA", value: "R$ 10.450/m²", change: "+4.2%", positive: true },
  { label: "VILA AUGUSTA", value: "R$ 8.920/m²", change: "+3.1%", positive: true },
  { label: "CENTRO (GUARULHOS)", value: "R$ 7.150/m²", change: "+1.5%", positive: true },
  { label: "GOPOUVA", value: "R$ 7.800/m²", change: "+2.0%", positive: true },
  { label: "VILA GALVÃO", value: "R$ 7.950/m²", change: "+2.8%", positive: true },
  { label: "MACEDO", value: "R$ 7.600/m²", change: "+1.9%", positive: true },
  { label: "CECAP", value: "R$ 6.300/m²", change: "+1.1%", positive: true },
  { label: "BONSUCESSO", value: "R$ 5.400/m²", change: "+0.8%", positive: true },
  { label: "NEON POSTGRES ENGINE", value: "Sincronizado • 0.04s latência", isEngine: true },
  { label: "GUARULHOS CADASTRO", value: "14.280 IMÓVEIS ATIVOS", isEngine: true },
  { label: "ALGORITMO SIGMA-GAUSS", value: "Confiança 95%", isEngine: true },
];

export function TickerBar() {
  return (
    <div
      style={{
        width: "100%",
        backgroundColor: "var(--color-deep-bog)",
        borderBottom: "1px solid var(--color-fern)",
        overflow: "hidden",
        position: "relative",
        zIndex: 40,
        height: 36,
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* Static Label indicator */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          backgroundColor: "var(--color-forest-floor)",
          borderRight: "1px solid var(--color-lichen)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "0 16px",
          zIndex: 2,
          fontSize: 11,
          fontFamily: "var(--font-mono)",
          color: "var(--color-bone-white)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            backgroundColor: "var(--color-amber-compass)",
            display: "inline-block",
            boxShadow: "0 0 6px var(--color-amber-compass)",
          }}
        />
        GIS FEED GUARULHOS
      </div>

      {/* Animated track */}
      <div
        className="ticker-track"
        style={{
          paddingLeft: 190,
          display: "flex",
          alignItems: "center",
          gap: 32,
        }}
      >
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, index) => (
          <div
            key={index}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12,
              fontFamily: "var(--font-sans)",
              fontWeight: 500,
              letterSpacing: "0.033em",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ color: "var(--color-limestone)" }}>{item.label}</span>
            <span
              style={{
                color: item.isEngine ? "var(--color-amber-compass)" : "var(--color-bone-white)",
                fontWeight: 600,
              }}
            >
              {item.value}
            </span>
            {item.change && (
              <span
                style={{
                  color: item.positive ? "#86efac" : "#fca5a5",
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                }}
              >
                {item.change}
              </span>
            )}
            <span style={{ color: "var(--color-lichen)", margin: "0 8px" }}>•</span>
          </div>
        ))}
      </div>
    </div>
  );
}
