"use client";

import React, { useState, useMemo } from "react";
import { NEIGHBORHOODS, NeighborhoodData } from "./CartographicMapExplorer";
import { ArrowUpDown, Search, Compass, MapPin, ArrowUpRight, TrendingUp } from "lucide-react";

type SortField = "name" | "avgPrice" | "medianPrice" | "avgM2Price" | "stdDev" | "samples";
type SortDirection = "asc" | "desc";

interface NeighborhoodMatrixProps {
  onSelectNeighborhood?: (bairro: NeighborhoodData) => void;
}

export function NeighborhoodMatrix({ onSelectNeighborhood }: NeighborhoodMatrixProps) {
  const [businessType, setBusinessType] = useState<"Sale" | "Rent">("Sale");
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("avgM2Price");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedNeighborhoods = useMemo(() => {
    const list = NEIGHBORHOODS.filter((n) =>
      n.name.toLowerCase().includes(search.toLowerCase())
    );

    return list.sort((a, b) => {
      const statsA = businessType === "Sale" ? a.sale : a.rent;
      const statsB = businessType === "Sale" ? b.sale : b.rent;

      let valA: any = statsA[sortField as keyof typeof statsA] ?? a.name;
      let valB: any = statsB[sortField as keyof typeof statsB] ?? b.name;

      if (sortField === "name") {
        valA = a.name;
        valB = b.name;
        return sortDirection === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      return sortDirection === "asc" ? valA - valB : valB - valA;
    });
  }, [businessType, search, sortField, sortDirection]);

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: val >= 1000 ? 0 : 2,
    }).format(val);
  };

  return (
    <section
      id="bairros-matrix"
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
          <Compass size={14} />
          <span>MATRIZ TERRITORIAL • COMPARATIVO DE MICRO-REGIÕES</span>
        </div>
        <h2 className="serif-heading-lg" style={{ marginBottom: 16 }}>
          Índice Comparativo de Bairros
        </h2>
        <p className="sans-body" style={{ maxWidth: 700, margin: "0 auto", color: "var(--color-parchment)" }}>
          Classificação estatística completa com médias ponderadas, medianas de fechamento e dispersão de risco por região.
        </p>
      </div>

      {/* Control Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 16,
        }}
      >
        {/* Search */}
        <div style={{ position: "relative", minWidth: 260 }}>
          <Search size={15} color="var(--color-lichen)" style={{ position: "absolute", left: 12, top: 11 }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrar por nome do bairro..."
            style={{
              padding: "8px 12px 8px 36px",
              backgroundColor: "var(--color-forest-floor)",
              border: "1px solid var(--color-lichen)",
              borderRadius: "var(--radius-inputs)",
              color: "var(--color-bone-white)",
              fontFamily: "var(--font-sans)",
              fontSize: 13,
              outline: "none",
              minWidth: 260,
            }}
          />
        </div>

        {/* Business Type Toggle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "var(--color-forest-floor)",
            border: "1px solid var(--color-lichen)",
            borderRadius: "var(--radius-buttons)",
            padding: 3,
          }}
        >
          <button
            onClick={() => setBusinessType("Sale")}
            style={{
              padding: "6px 16px",
              borderRadius: 16,
              border: "none",
              backgroundColor: businessType === "Sale" ? "var(--color-amber-compass)" : "transparent",
              color: "var(--color-bone-white)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            Venda (R$)
          </button>
          <button
            onClick={() => setBusinessType("Rent")}
            style={{
              padding: "6px 16px",
              borderRadius: 16,
              border: "none",
              backgroundColor: businessType === "Rent" ? "var(--color-amber-compass)" : "transparent",
              color: "var(--color-bone-white)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            Locação (R$/mês)
          </button>
        </div>
      </div>

      {/* Matrix Table in Fern Surface */}
      <div
        className="surface-fern"
        style={{
          padding: 0,
          overflowX: "auto",
          boxShadow: "var(--shadow-panel)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr
              style={{
                backgroundColor: "var(--color-deep-bog)",
                borderBottom: "1px solid var(--color-lichen)",
                color: "var(--color-limestone)",
                fontSize: 11,
                fontFamily: "var(--font-mono)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              <th
                onClick={() => handleSort("name")}
                style={{ padding: "16px 20px", cursor: "pointer" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span>Bairro & Localização</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>

              <th
                onClick={() => handleSort("avgM2Price")}
                style={{ padding: "16px 20px", cursor: "pointer" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span>Valor / m²</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>

              <th
                onClick={() => handleSort("medianPrice")}
                style={{ padding: "16px 20px", cursor: "pointer" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span>Preço Mediano</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>

              <th
                onClick={() => handleSort("avgPrice")}
                style={{ padding: "16px 20px", cursor: "pointer" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span>Preço Médio</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>

              <th
                onClick={() => handleSort("stdDev")}
                style={{ padding: "16px 20px", cursor: "pointer" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span>Desvio Padrão (σ)</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>

              <th
                onClick={() => handleSort("samples")}
                style={{ padding: "16px 20px", cursor: "pointer" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span>Amostras (N)</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>

              <th style={{ padding: "16px 20px", textAlign: "right" }}>Ação</th>
            </tr>
          </thead>
          <tbody>
            {sortedNeighborhoods.map((bairro, index) => {
              const stats = businessType === "Sale" ? bairro.sale : bairro.rent;
              return (
                <tr
                  key={bairro.id}
                  style={{
                    borderBottom: "1px solid rgba(100, 117, 75, 0.25)",
                    transition: "background-color 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "rgba(49, 66, 24, 0.6)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <td style={{ padding: "16px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "var(--radius-cards)",
                          backgroundColor: "var(--color-forest-floor)",
                          border: "1px solid var(--color-lichen)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--color-amber-compass)",
                        }}
                      >
                        <MapPin size={14} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: "var(--color-bone-white)", fontSize: 14 }}>
                          {bairro.name}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--color-limestone)", fontFamily: "var(--font-mono)" }}>
                          {bairro.city}, {bairro.state}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: "16px 20px" }}>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontWeight: 700,
                        color: "var(--color-amber-compass)",
                        fontSize: 14,
                      }}
                    >
                      {businessType === "Sale"
                        ? `R$ ${stats.avgM2Price.toLocaleString("pt-BR")}/m²`
                        : `R$ ${stats.avgM2Price.toFixed(1)}/m²`}
                    </span>
                  </td>

                  <td style={{ padding: "16px 20px", color: "var(--color-bone-white)", fontSize: 14, fontWeight: 500 }}>
                    {formatPrice(stats.medianPrice)}
                  </td>

                  <td style={{ padding: "16px 20px", color: "var(--color-parchment)", fontSize: 14 }}>
                    {formatPrice(stats.avgPrice)}
                  </td>

                  <td style={{ padding: "16px 20px" }}>
                    <span
                      style={{
                        fontSize: 12,
                        fontFamily: "var(--font-mono)",
                        color: "var(--color-limestone)",
                        backgroundColor: "var(--color-forest-floor)",
                        padding: "3px 8px",
                        borderRadius: 4,
                        border: "1px solid rgba(100, 117, 75, 0.4)",
                      }}
                    >
                      ± {formatPrice(stats.stdDev)}
                    </span>
                  </td>

                  <td style={{ padding: "16px 20px" }}>
                    <span style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: "var(--color-bone-white)" }}>
                      {stats.samples} imov.
                    </span>
                  </td>

                  <td style={{ padding: "16px 20px", textAlign: "right" }}>
                    <button
                      onClick={() => {
                        if (onSelectNeighborhood) onSelectNeighborhood(bairro);
                        const el = document.getElementById("mapa-explorer");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      }}
                      style={{
                        background: "none",
                        border: "1px solid var(--color-lichen)",
                        borderRadius: "var(--radius-cards)",
                        color: "var(--color-bone-white)",
                        padding: "6px 12px",
                        fontSize: 12,
                        fontFamily: "var(--font-sans)",
                        fontWeight: 500,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "var(--color-amber-compass)";
                        e.currentTarget.style.color = "var(--color-amber-compass)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--color-lichen)";
                        e.currentTarget.style.color = "var(--color-bone-white)";
                      }}
                    >
                      <span>Ver no Mapa</span>
                      <ArrowUpRight size={13} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
