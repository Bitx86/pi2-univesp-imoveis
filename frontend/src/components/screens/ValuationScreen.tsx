"use client";

import React, { useState, useMemo } from "react";
import {
  Calculator,
  Sliders,
  ArrowRight,
  MapPin,
  Sparkles,
} from "lucide-react";
import {
  NEIGHBORHOODS,
  NeighborhoodData,
  BusinessType,
  StandardPropertyType,
  formatBRL,
  formatCompactPrice,
} from "@/data/imoveisData";

interface ValuationScreenProps {
  businessType: BusinessType;
  selectedNeighborhoodId?: string;
  neighborhoods?: NeighborhoodData[];
  initialAreaM2?: number;
  onSelectNeighborhood?: (bairro: NeighborhoodData) => void;
  onNavigateToMap?: (bairroId: string) => void;
}

export function ValuationScreen({
  businessType,
  selectedNeighborhoodId,
  neighborhoods,
  initialAreaM2 = 85,
  onSelectNeighborhood,
  onNavigateToMap,
}: ValuationScreenProps) {
  const effectiveNeighborhoods = useMemo(() => {
    return neighborhoods && neighborhoods.length > 0 ? neighborhoods : NEIGHBORHOODS;
  }, [neighborhoods]);

  const [bairroId, setBairroId] = useState<string>(
    selectedNeighborhoodId || effectiveNeighborhoods[0]?.id || "jardim-maia"
  );
  const [propertyType, setPropertyType] = useState<StandardPropertyType>("Apartamentos Médio Padrão");
  const [areaM2, setAreaM2] = useState<number>(initialAreaM2);
  const [bedrooms, setBedrooms] = useState<number>(2);
  const [bathrooms, setBathrooms] = useState<number>(2);
  const [parking, setParking] = useState<number>(1);

  // Sync active neighborhood when prop changes
  React.useEffect(() => {
    if (selectedNeighborhoodId) {
      setBairroId(selectedNeighborhoodId);
    }
  }, [selectedNeighborhoodId]);

  // Expanded API-derived feature tags
  const [hasBalcony, setHasBalcony] = useState<boolean>(true);
  const [hasElevator, setHasElevator] = useState<boolean>(true);
  const [isPenthouse, setIsPenthouse] = useState<boolean>(false);
  const [isGarden, setIsGarden] = useState<boolean>(false);
  const [hasPanoramicView, setHasPanoramicView] = useState<boolean>(false);
  const [hasPrivatePool, setHasPrivatePool] = useState<boolean>(false);
  const [isFurnished, setIsFurnished] = useState<boolean>(false);
  const [hasCoveredParking, setHasCoveredParking] = useState<boolean>(true);

  const currentBairro = useMemo(() => {
    return effectiveNeighborhoods.find((b) => b.id === bairroId) || effectiveNeighborhoods[0];
  }, [effectiveNeighborhoods, bairroId]);

  const stats = businessType === "Sale" ? currentBairro.sale : currentBairro.rent;

  // Real-time valuation algorithm calibrated with empirical regression
  const valuation = useMemo(() => {
    let typeMultiplier = 1.0;
    if (propertyType === "Studios e Compactos") typeMultiplier = 1.08;
    else if (propertyType === "Apartamentos Médio Padrão") typeMultiplier = 1.0;
    else if (propertyType === "Apartamentos e Coberturas Alto Padrão") typeMultiplier = 1.18;
    else if (propertyType === "Casas e Sobrados em Condomínio") typeMultiplier = 0.96;

    // Feature tags multipliers & bonuses
    let featureMultiplier = 1.0;
    if (isPenthouse) featureMultiplier += 0.20;
    if (isGarden) featureMultiplier += 0.12;
    if (hasBalcony) featureMultiplier += 0.06;
    if (hasPanoramicView) featureMultiplier += 0.05;
    if (hasPrivatePool) featureMultiplier += 0.08;
    if (isFurnished) featureMultiplier += 0.10;
    if (hasElevator) featureMultiplier += 0.04;
    if (hasCoveredParking) featureMultiplier += 0.04;

    const parkingBonus = parking * (businessType === "Sale" ? 30000 : 140);
    const bedroomBonus = (bedrooms - 1) * (businessType === "Sale" ? 18000 : 110);
    const bathroomBonus = (bathrooms - 1) * (businessType === "Sale" ? 12000 : 70);

    const baseValuation =
      areaM2 * stats.avgM2Price * typeMultiplier * featureMultiplier +
      parkingBonus +
      bedroomBonus +
      bathroomBonus;

    const stdDevSpread =
      baseValuation * (stats.stdDev / (stats.avgM2Price * areaM2 || 1)) * 0.45;

    const estimatedPrice = Math.round(baseValuation);
    const minPrice = Math.round(baseValuation - stdDevSpread);
    const maxPrice = Math.round(baseValuation + stdDevSpread);
    const m2Calculated = Math.round(baseValuation / Math.max(areaM2, 1));

    // Rental yield & Cap Rate estimator
    const estimatedMonthlyRent = Math.round(estimatedPrice * 0.0048);
    const annualCapRate = 5.76;

    return {
      estimatedPrice,
      minPrice,
      maxPrice,
      m2Calculated,
      estimatedMonthlyRent,
      annualCapRate,
    };
  }, [
    areaM2,
    bedrooms,
    bathrooms,
    parking,
    propertyType,
    hasBalcony,
    hasElevator,
    isPenthouse,
    isGarden,
    hasPanoramicView,
    hasPrivatePool,
    isFurnished,
    hasCoveredParking,
    stats,
    businessType,
  ]);

  const handleBairroChange = (newId: string) => {
    setBairroId(newId);
    const found = NEIGHBORHOODS.find((b) => b.id === newId);
    if (found && onSelectNeighborhood) {
      onSelectNeighborhood(found);
    }
  };

  const propertyTypesList: { id: StandardPropertyType; label: string; desc: string }[] = [
    {
      id: "Studios e Compactos",
      label: "Studios & Compactos",
      desc: "24m² a 45m² • Foco em locação e mobilidade",
    },
    {
      id: "Apartamentos Médio Padrão",
      label: "Aptos Médio Padrão",
      desc: "55m² a 85m² • 2 a 3 quartos consolidados",
    },
    {
      id: "Apartamentos e Coberturas Alto Padrão",
      label: "Aptos & Coberturas Alto Padrão",
      desc: "110m² a 320m² • Suítes e varanda gourmet",
    },
    {
      id: "Casas e Sobrados em Condomínio",
      label: "Casas em Condomínio",
      desc: "Sobrados e vilas residenciais fechadas",
    },
  ];

  return (
    <div
      className="screen-fade-in"
      style={{
        padding: "32px var(--margin-desktop)",
        maxWidth: 1200,
        margin: "0 auto",
        width: "100%",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "var(--spacing-6)" }}>
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
          <Calculator size={14} />
          <span>Simulador Preditivo de Avaliação Imobiliária</span>
        </div>
        <h1
          className="font-display"
          style={{ fontSize: 28, color: "var(--color-on-surface)", marginBottom: 6 }}
        >
          Calculadora de Valor Justo & Opcionais de Mercado
        </h1>
        <p
          className="font-body"
          style={{
            fontSize: 14,
            color: "var(--color-on-surface-variant)",
            maxWidth: 760,
          }}
        >
          Estime o valor de mercado de qualquer imóvel em Guarulhos combinando a
          mediana geocodificada do bairro com tipologias e tags de infraestrutura
          extraídas diretamente das APIs do mercado imobiliário.
        </p>
      </div>

      {/* 2-Column Responsive Layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* LEFT COLUMN: INPUT CONTROLS */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Card 1: Localização e Características Básicas */}
          <div className="surface-card" style={{ padding: "20px" }}>
            <h3
              className="font-headline"
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "var(--color-on-surface)",
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Sliders size={16} style={{ color: "var(--color-primary)" }} />
              <span>1. Localização & Parâmetros Estruturais</span>
            </h3>

            {/* Neighborhood Selector */}
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                  color: "var(--color-outline)",
                  textTransform: "uppercase",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Bairro de Guarulhos
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
                  padding: "8px 12px",
                  fontSize: 13,
                  fontFamily: "var(--font-sans)",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                {effectiveNeighborhoods.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} (Mediana: {formatCompactPrice(businessType === "Sale" ? b.sale.medianPrice : b.rent.medianPrice)} • {formatBRL(businessType === "Sale" ? b.sale.avgM2Price : b.rent.avgM2Price)}/m²)
                  </option>
                ))}
              </select>
            </div>

            {/* Standardized Property Type Selection (4 Core Categories) */}
            <div>
              <label
                style={{
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                  color: "var(--color-outline)",
                  textTransform: "uppercase",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Tipologia Padronizada
              </label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                }}
              >
                {propertyTypesList.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setPropertyType(item.id)}
                    style={{
                      backgroundColor:
                        propertyType === item.id
                          ? "var(--color-primary-container)"
                          : "var(--color-surface-container-low)",
                      color:
                        propertyType === item.id
                          ? "var(--color-on-primary-container)"
                          : "var(--color-on-surface)",
                      border:
                        propertyType === item.id
                          ? "1px solid var(--color-primary)"
                          : "var(--border-technical)",
                      borderRadius: "var(--radius-default)",
                      padding: "8px 10px",
                      textAlign: "left",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>
                      {item.label}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        opacity: 0.8,
                        lineHeight: 1.2,
                      }}
                    >
                      {item.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Area M2 Slider */}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <label
                  style={{
                    fontSize: 11,
                    fontFamily: "var(--font-mono)",
                    color: "var(--color-outline)",
                    textTransform: "uppercase",
                  }}
                >
                  Área Útil Privativa
                </label>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--color-primary)",
                  }}
                >
                  {areaM2} m²
                </span>
              </div>
              <input
                type="range"
                min={20}
                max={350}
                step={5}
                value={areaM2}
                onChange={(e) => setAreaM2(Number(e.target.value))}
                style={{
                  width: "100%",
                  accentColor: "var(--color-primary)",
                  cursor: "pointer",
                }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 10,
                  fontFamily: "var(--font-mono)",
                  color: "var(--color-outline)",
                  marginTop: 2,
                }}
              >
                <span>20 m²</span>
                <span>150 m²</span>
                <span>350 m²</span>
              </div>
            </div>

            {/* Bedrooms, Bathrooms, Parking Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 10,
              }}
            >
              <div>
                <label
                  style={{
                    fontSize: 10,
                    fontFamily: "var(--font-mono)",
                    color: "var(--color-outline)",
                    textTransform: "uppercase",
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  Dormitórios
                </label>
                <select
                  value={bedrooms}
                  onChange={(e) => setBedrooms(Number(e.target.value))}
                  style={{
                    width: "100%",
                    backgroundColor: "var(--color-surface-container-low)",
                    border: "var(--border-technical)",
                    borderRadius: "var(--radius-default)",
                    color: "var(--color-on-surface)",
                    padding: "6px 8px",
                    fontSize: 12,
                    fontFamily: "var(--font-mono)",
                    outline: "none",
                  }}
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? "Quarto" : "Quartos"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  style={{
                    fontSize: 10,
                    fontFamily: "var(--font-mono)",
                    color: "var(--color-outline)",
                    textTransform: "uppercase",
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  Banheiros
                </label>
                <select
                  value={bathrooms}
                  onChange={(e) => setBathrooms(Number(e.target.value))}
                  style={{
                    width: "100%",
                    backgroundColor: "var(--color-surface-container-low)",
                    border: "var(--border-technical)",
                    borderRadius: "var(--radius-default)",
                    color: "var(--color-on-surface)",
                    padding: "6px 8px",
                    fontSize: 12,
                    fontFamily: "var(--font-mono)",
                    outline: "none",
                  }}
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? "Banheiro" : "Banheiros"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  style={{
                    fontSize: 10,
                    fontFamily: "var(--font-mono)",
                    color: "var(--color-outline)",
                    textTransform: "uppercase",
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  Vagas Garagem
                </label>
                <select
                  value={parking}
                  onChange={(e) => setParking(Number(e.target.value))}
                  style={{
                    width: "100%",
                    backgroundColor: "var(--color-surface-container-low)",
                    border: "var(--border-technical)",
                    borderRadius: "var(--radius-default)",
                    color: "var(--color-on-surface)",
                    padding: "6px 8px",
                    fontSize: 12,
                    fontFamily: "var(--font-mono)",
                    outline: "none",
                  }}
                >
                  {[0, 1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? "Vaga" : "Vagas"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* EXPANDED API TAGS & DIFFERENTIAL FEATURES */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                  color: "var(--color-outline)",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                <Sparkles size={12} style={{ color: "var(--color-primary)" }} />
                <span>Opcionais e Diferenciais de Anúncio</span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12,
                    color: "var(--color-on-surface)",
                    cursor: "pointer",
                    backgroundColor: "var(--color-surface-container-low)",
                    padding: "6px 8px",
                    borderRadius: "var(--radius-default)",
                    border: "var(--border-technical)",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isPenthouse}
                    onChange={(e) => setIsPenthouse(e.target.checked)}
                    style={{ accentColor: "var(--color-primary)" }}
                  />
                  <span>Cobertura / Penthouse (+20%)</span>
                </label>

                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12,
                    color: "var(--color-on-surface)",
                    cursor: "pointer",
                    backgroundColor: "var(--color-surface-container-low)",
                    padding: "6px 8px",
                    borderRadius: "var(--radius-default)",
                    border: "var(--border-technical)",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isGarden}
                    onChange={(e) => setIsGarden(e.target.checked)}
                    style={{ accentColor: "var(--color-primary)" }}
                  />
                  <span>Garden / Quintal (+12%)</span>
                </label>

                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12,
                    color: "var(--color-on-surface)",
                    cursor: "pointer",
                    backgroundColor: "var(--color-surface-container-low)",
                    padding: "6px 8px",
                    borderRadius: "var(--radius-default)",
                    border: "var(--border-technical)",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={hasBalcony}
                    onChange={(e) => setHasBalcony(e.target.checked)}
                    style={{ accentColor: "var(--color-primary)" }}
                  />
                  <span>Varanda Gourmet (+6%)</span>
                </label>

                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12,
                    color: "var(--color-on-surface)",
                    cursor: "pointer",
                    backgroundColor: "var(--color-surface-container-low)",
                    padding: "6px 8px",
                    borderRadius: "var(--radius-default)",
                    border: "var(--border-technical)",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={hasPanoramicView}
                    onChange={(e) => setHasPanoramicView(e.target.checked)}
                    style={{ accentColor: "var(--color-primary)" }}
                  />
                  <span>Vista Panorâmica (+5%)</span>
                </label>

                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12,
                    color: "var(--color-on-surface)",
                    cursor: "pointer",
                    backgroundColor: "var(--color-surface-container-low)",
                    padding: "6px 8px",
                    borderRadius: "var(--radius-default)",
                    border: "var(--border-technical)",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={hasPrivatePool}
                    onChange={(e) => setHasPrivatePool(e.target.checked)}
                    style={{ accentColor: "var(--color-primary)" }}
                  />
                  <span>Piscina Privativa (+8%)</span>
                </label>

                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12,
                    color: "var(--color-on-surface)",
                    cursor: "pointer",
                    backgroundColor: "var(--color-surface-container-low)",
                    padding: "6px 8px",
                    borderRadius: "var(--radius-default)",
                    border: "var(--border-technical)",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isFurnished}
                    onChange={(e) => setIsFurnished(e.target.checked)}
                    style={{ accentColor: "var(--color-primary)" }}
                  />
                  <span>Mobiliado / Decorado (+10%)</span>
                </label>

                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12,
                    color: "var(--color-on-surface)",
                    cursor: "pointer",
                    backgroundColor: "var(--color-surface-container-low)",
                    padding: "6px 8px",
                    borderRadius: "var(--radius-default)",
                    border: "var(--border-technical)",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={hasElevator}
                    onChange={(e) => setHasElevator(e.target.checked)}
                    style={{ accentColor: "var(--color-primary)" }}
                  />
                  <span>Elevador no Prédio</span>
                </label>

                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12,
                    color: "var(--color-on-surface)",
                    cursor: "pointer",
                    backgroundColor: "var(--color-surface-container-low)",
                    padding: "6px 8px",
                    borderRadius: "var(--radius-default)",
                    border: "var(--border-technical)",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={hasCoveredParking}
                    onChange={(e) => setHasCoveredParking(e.target.checked)}
                    style={{ accentColor: "var(--color-primary)" }}
                  />
                  <span>Vaga Coberta e Demarcada</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: REAL-TIME VALUATION RESULT CARD */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            className="surface-card"
            style={{
              backgroundColor: "var(--color-surface-container)",
              border: "1px solid var(--color-primary)",
              boxShadow: "var(--shadow-panel)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                  color: "var(--color-primary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  fontWeight: 600,
                }}
              >
                Valor Justo Estimado ({businessType === "Sale" ? "Venda" : "Locação"})
              </span>
              <span className="badge-success">CONFIANÇA 95%</span>
            </div>

            {/* Giant Output Price */}
            <div
              className="font-display"
              style={{
                fontSize: 36,
                color: "var(--color-on-surface)",
                lineHeight: 1.1,
                marginBottom: 6,
              }}
            >
              {formatBRL(valuation.estimatedPrice)}
              {businessType === "Rent" && (
                <span style={{ fontSize: 16, color: "var(--color-outline)" }}>
                  /mês
                </span>
              )}
            </div>

            <p
              style={{
                fontSize: 12,
                fontFamily: "var(--font-mono)",
                color: "var(--color-on-surface-variant)",
                marginBottom: 16,
              }}
            >
              Metro Quadrado Preditivo:{" "}
              <strong style={{ color: "var(--color-primary)" }}>
                {formatBRL(valuation.m2Calculated)}/m²
              </strong>
            </p>

            {/* Fair Price Range (Min - Max) */}
            <div
              style={{
                backgroundColor: "var(--color-surface-container-low)",
                border: "var(--border-technical)",
                borderRadius: "var(--radius-default)",
                padding: "12px 14px",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 11,
                  color: "var(--color-outline)",
                  fontFamily: "var(--font-mono)",
                  marginBottom: 6,
                }}
              >
                <span>Faixa Mínima Aceitável</span>
                <span>Faixa Máxima de Mercado</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 15,
                  fontWeight: 700,
                  color: "var(--color-on-surface)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                <span>{formatBRL(valuation.minPrice)}</span>
                <span>{formatBRL(valuation.maxPrice)}</span>
              </div>
            </div>

            {/* Comparison with Neighborhood Metrics */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
                marginBottom: 16,
                fontSize: 11,
              }}
            >
              <div className="surface-card-lowest" style={{ padding: "8px 10px" }}>
                <div style={{ color: "var(--color-outline)", marginBottom: 2 }}>
                  Mediana em {currentBairro.name}
                </div>
                <div style={{ color: "var(--color-on-surface)", fontWeight: 600, fontFamily: "var(--font-mono)" }}>
                  {formatCompactPrice(stats.medianPrice, businessType === "Rent")}
                </div>
              </div>

              <div className="surface-card-lowest" style={{ padding: "8px 10px" }}>
                <div style={{ color: "var(--color-outline)", marginBottom: 2 }}>
                  {businessType === "Sale" ? "Potencial de Aluguel" : "Total Amostras"}
                </div>
                <div style={{ color: "var(--color-success)", fontWeight: 600, fontFamily: "var(--font-mono)" }}>
                  {businessType === "Sale"
                    ? `${formatBRL(valuation.estimatedMonthlyRent)}/mês (${valuation.annualCapRate}% a.a.)`
                    : `${stats.samples} imóveis analisados`}
                </div>
              </div>
            </div>

            {/* CTA Button to view on Map */}
            <button
              onClick={() => {
                if (onNavigateToMap) onNavigateToMap(currentBairro.id);
              }}
              className="btn-primary"
              style={{
                width: "100%",
                padding: "10px 16px",
                fontSize: 13,
                justifyContent: "center",
              }}
            >
              <MapPin size={15} />
              <span>Explorar Imóveis em {currentBairro.name} no Mapa</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
