"use client";

import React, { useState, useMemo } from "react";
import { NEIGHBORHOODS } from "./CartographicMapExplorer";
import { Calculator, Sparkles, Compass, CheckCircle2, ArrowRight } from "lucide-react";

export function ValuationEstimator() {
  const [selectedBairroId, setSelectedBairroId] = useState(NEIGHBORHOODS[0].id);
  const [businessType, setBusinessType] = useState<"Sale" | "Rent">("Sale");
  const [propertyType, setPropertyType] = useState<string>("Apartamento");
  const [areaM2, setAreaM2] = useState<number>(85);
  const [bedrooms, setBedrooms] = useState<number>(2);
  const [parking, setParking] = useState<number>(1);

  const currentBairro = NEIGHBORHOODS.find((b) => b.id === selectedBairroId) || NEIGHBORHOODS[0];
  const stats = businessType === "Sale" ? currentBairro.sale : currentBairro.rent;

  const estimation = useMemo(() => {
    // Multipliers for property type and features
    let typeFactor = 1.0;
    if (propertyType === "Cobertura") typeFactor = 1.28;
    if (propertyType === "Studio") typeFactor = 1.08;
    if (propertyType === "Comercial") typeFactor = 0.95;
    if (propertyType === "Casa") typeFactor = 0.92;

    const parkingBonus = parking * (businessType === "Sale" ? 35000 : 150);
    const bedroomBonus = bedrooms * (businessType === "Sale" ? 15000 : 100);

    const baseValuation = areaM2 * stats.avgM2Price * typeFactor + parkingBonus + bedroomBonus;
    const stdDevSpread = baseValuation * (stats.stdDev / stats.avgPrice);

    return {
      estimatedPrice: Math.round(baseValuation),
      minPrice: Math.round(baseValuation - stdDevSpread * 0.8),
      maxPrice: Math.round(baseValuation + stdDevSpread * 0.8),
      m2Estimate: Math.round(baseValuation / Math.max(areaM2, 1)),
    };
  }, [areaM2, bedrooms, parking, propertyType, stats, businessType]);

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: val >= 1000 ? 0 : 2,
    }).format(val);
  };

  return (
    <section
      id="calculadora-regiao"
      style={{
        maxWidth: "var(--page-max-width)",
        margin: "0 auto",
        padding: "0 24px",
        marginBottom: "var(--spacing-80)",
        position: "relative",
        zIndex: 10,
      }}
    >
      {/* Section Header */}
      <div style={{ textAlign: "center", marginBottom: "var(--spacing-36)" }}>
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
          <Calculator size={14} />
          <span>SIMULADOR CARTOGRÁFICO • AVALIAÇÃO TERRITORIAL</span>
        </div>
        <h2 className="serif-heading-lg" style={{ marginBottom: 16 }}>
          Calcule a Precificação de Mercado Instantânea
        </h2>
        <p className="sans-body" style={{ maxWidth: 700, margin: "0 auto", color: "var(--color-parchment)" }}>
          Simule o valor de venda ou locação com base nos coeficientes de valor por metro quadrado e na dispersão estatística da sua micro-região.
        </p>
      </div>

      {/* Simulator 2-Column Spread (Felt Panel) */}
      <div
        className="product-ui-panel"
        style={{
          backgroundColor: "#ffffff",
          padding: "32px",
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr",
          gap: 36,
          boxShadow: "var(--shadow-panel)",
        }}
      >
        {/* Left Inputs Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#18210c" }}>
              Parâmetros do Imóvel
            </h3>
            {/* Sale / Rent Switch */}
            <div
              style={{
                display: "flex",
                backgroundColor: "#f4f6f0",
                borderRadius: "var(--radius-buttons)",
                border: "1px solid #d8dcd2",
                padding: 2,
              }}
            >
              <button
                onClick={() => setBusinessType("Sale")}
                style={{
                  padding: "4px 12px",
                  borderRadius: 16,
                  border: "none",
                  backgroundColor: businessType === "Sale" ? "var(--color-moss-canvas)" : "transparent",
                  color: businessType === "Sale" ? "#ffffff" : "#444444",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Venda
              </button>
              <button
                onClick={() => setBusinessType("Rent")}
                style={{
                  padding: "4px 12px",
                  borderRadius: 16,
                  border: "none",
                  backgroundColor: businessType === "Rent" ? "var(--color-moss-canvas)" : "transparent",
                  color: businessType === "Rent" ? "#ffffff" : "#444444",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Aluguel
              </button>
            </div>
          </div>

          {/* Form Controls */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Neighborhood */}
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#444444" }}>Bairro de Guarulhos (SP)</span>
              <select
                value={selectedBairroId}
                onChange={(e) => setSelectedBairroId(e.target.value)}
                style={{
                  padding: "10px 12px",
                  borderRadius: "var(--radius-inputs)",
                  border: "1px solid #d8dcd2",
                  fontSize: 13,
                  fontFamily: "var(--font-sans)",
                  backgroundColor: "#f9fbf7",
                  color: "#18210c",
                  outline: "none",
                }}
              >
                {NEIGHBORHOODS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </label>

            {/* Property Type */}
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#444444" }}>Tipo de Imóvel</span>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                style={{
                  padding: "10px 12px",
                  borderRadius: "var(--radius-inputs)",
                  border: "1px solid #d8dcd2",
                  fontSize: 13,
                  fontFamily: "var(--font-sans)",
                  backgroundColor: "#f9fbf7",
                  color: "#18210c",
                  outline: "none",
                }}
              >
                <option value="Apartamento">Apartamento Padrão</option>
                <option value="Cobertura">Cobertura / Penthouse</option>
                <option value="Studio">Studio / Loft</option>
                <option value="Casa">Casa Residencial</option>
                <option value="Comercial">Conjunto Comercial</option>
              </select>
            </label>
          </div>

          {/* Area Slider */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#444444" }}>Área Privativa (m²)</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: "var(--color-amber-compass)", fontFamily: "monospace" }}>
                {areaM2} m²
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="450"
              step="5"
              value={areaM2}
              onChange={(e) => setAreaM2(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--color-amber-compass)", cursor: "pointer" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#888", fontFamily: "monospace" }}>
              <span>20 m² (Compacto)</span>
              <span>200 m²</span>
              <span>450 m² (Mansão)</span>
            </div>
          </div>

          {/* Bedrooms & Parking Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#444444", display: "block", marginBottom: 6 }}>
                Quartos / Suítes
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    onClick={() => setBedrooms(num)}
                    style={{
                      flex: 1,
                      padding: "8px 0",
                      borderRadius: "var(--radius-cards)",
                      border: bedrooms === num ? "1px solid var(--color-moss-canvas)" : "1px solid #d8dcd2",
                      backgroundColor: bedrooms === num ? "var(--color-moss-canvas)" : "#f4f6f0",
                      color: bedrooms === num ? "#ffffff" : "#444444",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#444444", display: "block", marginBottom: 6 }}>
                Vagas de Garagem
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                {[0, 1, 2, 3].map((num) => (
                  <button
                    key={num}
                    onClick={() => setParking(num)}
                    style={{
                      flex: 1,
                      padding: "8px 0",
                      borderRadius: "var(--radius-cards)",
                      border: parking === num ? "1px solid var(--color-moss-canvas)" : "1px solid #d8dcd2",
                      backgroundColor: parking === num ? "var(--color-moss-canvas)" : "#f4f6f0",
                      color: parking === num ? "#ffffff" : "#444444",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Output Estimate Card */}
        <div
          style={{
            backgroundColor: "#212f0c",
            borderRadius: "var(--radius-cards)",
            border: "1px solid var(--color-lichen)",
            padding: "28px",
            color: "#ffffff",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span className="badge-moss">AVALIAÇÃO ESTIMADA</span>
              <span style={{ fontSize: 11, color: "var(--color-limestone)", fontFamily: "monospace" }}>
                SIGMA 95%
              </span>
            </div>

            <div style={{ fontSize: 12, color: "var(--color-limestone)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Valor Justo de Mercado
            </div>

            <div
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 38,
                fontWeight: 600,
                color: "var(--color-bone-white)",
                lineHeight: 1.1,
                marginTop: 4,
                marginBottom: 8,
              }}
            >
              {formatPrice(estimation.estimatedPrice)}
            </div>

            <div style={{ fontSize: 13, color: "var(--color-amber-compass)", fontFamily: "monospace", fontWeight: 600 }}>
              ≈ R$ {estimation.m2Estimate.toLocaleString("pt-BR")}/m²
            </div>

            {/* Range Strip */}
            <div
              style={{
                marginTop: 24,
                padding: "14px",
                backgroundColor: "rgba(0,0,0,0.25)",
                borderRadius: "var(--radius-cards)",
                border: "1px solid rgba(100, 117, 75, 0.4)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--color-limestone)", marginBottom: 6 }}>
                <span>Faixa Sugerida (-1σ a +1σ)</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600 }}>
                <span style={{ color: "#86efac" }}>{formatPrice(estimation.minPrice)}</span>
                <span style={{ color: "var(--color-bone-white)" }}>a</span>
                <span style={{ color: "#fca5a5" }}>{formatPrice(estimation.maxPrice)}</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--color-fern)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--color-limestone)" }}>
              <CheckCircle2 size={15} color="var(--color-amber-compass)" />
              <span>Baseado em {stats.samples} transações mapeadas em {currentBairro.name}.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
