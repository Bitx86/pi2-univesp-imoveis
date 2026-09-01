"use client";

import React, { useState, useMemo } from "react";
import {
  Layers,
  ArrowUpDown,
  Search,
  MapPin,
  Sliders,
} from "lucide-react";
import {
  NEIGHBORHOODS,
  NeighborhoodData,
  BusinessType,
  formatBRL,
  formatCompactPrice,
} from "@/data/imoveisData";

interface NeighborhoodScreenProps {
  businessType: BusinessType;
  selectedNeighborhoodId?: string;
  neighborhoods?: NeighborhoodData[];
  onSelectNeighborhood?: (bairro: NeighborhoodData) => void;
  onNavigateToMap?: (bairroId: string) => void;
  onNavigateToSimulator?: (bairroId: string) => void;
}

type SortField = "name" | "avgM2Price" | "medianPrice" | "stdDev" | "samples";

export function NeighborhoodScreen({
  businessType,
  neighborhoods,
  onSelectNeighborhood,
  onNavigateToMap,
  onNavigateToSimulator,
}: NeighborhoodScreenProps) {
  const effectiveNeighborhoods = useMemo(() => {
    return neighborhoods && neighborhoods.length > 0 ? neighborhoods : NEIGHBORHOODS;
  }, [neighborhoods]);

  const [searchFilter, setSearchFilter] = useState("");
  const [sortField, setSortField] = useState<SortField>("avgM2Price");
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const filteredBairros = useMemo(() => {
    const list = effectiveNeighborhoods.filter((b) =>
      b.name.toLowerCase().includes(searchFilter.toLowerCase())
    );

    return list.sort((a, b) => {
      const statsA = businessType === "Sale" ? a.sale : a.rent;
      const statsB = businessType === "Sale" ? b.sale : b.rent;

      let valA: string | number;
      let valB: string | number;

      if (sortField === "name") {
        valA = a.name;
        valB = b.name;
      } else {
        valA = statsA[sortField];
        valB = statsB[sortField];
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [searchFilter, sortField, sortAsc, businessType]);

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
      {/* Header & Search */}
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
            <Layers size={14} />
            <span>Matriz Regional de Inteligência Geoespacial</span>
          </div>
          <h1
            className="font-display"
            style={{ fontSize: 28, color: "var(--color-on-surface)", marginBottom: 6 }}
          >
            Índice Comparativo de Bairros de Guarulhos
          </h1>
          <p
            className="font-body"
            style={{
              fontSize: 14,
              color: "var(--color-on-surface-variant)",
              maxWidth: 680,
            }}
          >
            Tabela de alta precisão com dados amostrais consolidados, mediana
            imobiliária, desvio padrão e tendência de valorização para o mercado de{" "}
            <strong style={{ color: "var(--color-primary)" }}>
              {businessType === "Sale" ? "Venda" : "Locação"}
            </strong>
            .
          </p>
        </div>

        {/* Search Input Filter */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "var(--color-surface-container)",
            border: "var(--border-technical)",
            borderRadius: "var(--radius-default)",
            padding: "6px 12px",
            minWidth: 260,
          }}
        >
          <Search
            size={16}
            style={{ color: "var(--color-outline)", marginRight: 8 }}
          />
          <input
            type="text"
            placeholder="Filtrar por nome do bairro..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--color-on-surface)",
              fontSize: 13,
              fontFamily: "var(--font-sans)",
              outline: "none",
              width: "100%",
            }}
          />
        </div>
      </div>

      {/* High-density Soft Table Container */}
      <div
        className="surface-card"
        style={{
          padding: 0,
          overflowX: "auto",
          backgroundColor: "var(--color-surface-container)",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
            fontSize: 13,
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: "var(--color-surface-container-low)",
                borderBottom: "var(--border-technical)",
              }}
            >
              <th
                onClick={() => handleSort("name")}
                style={{
                  padding: "12px 16px",
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                  color: "var(--color-on-surface-variant)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span>Bairro / Região</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>

              <th
                onClick={() => handleSort("avgM2Price")}
                style={{
                  padding: "12px 16px",
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                  color: "var(--color-on-surface-variant)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span>Preço Médio / m²</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>

              <th
                onClick={() => handleSort("medianPrice")}
                style={{
                  padding: "12px 16px",
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                  color: "var(--color-on-surface-variant)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span>Mediana Real</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>

              <th
                onClick={() => handleSort("stdDev")}
                style={{
                  padding: "12px 16px",
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                  color: "var(--color-on-surface-variant)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span>Desvio Padrão (σ)</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>

              <th
                onClick={() => handleSort("samples")}
                style={{
                  padding: "12px 16px",
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                  color: "var(--color-on-surface-variant)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span>Amostras</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>

              <th
                style={{
                  padding: "12px 16px",
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                  color: "var(--color-on-surface-variant)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Tendência 12m
              </th>

              <th
                style={{
                  padding: "12px 16px",
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                  color: "var(--color-on-surface-variant)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  textAlign: "right",
                }}
              >
                Ações
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredBairros.map((bairro, idx) => {
              const stats = businessType === "Sale" ? bairro.sale : bairro.rent;
              return (
                <tr
                  key={bairro.id}
                  style={{
                    borderBottom: "var(--border-technical)",
                    backgroundColor:
                      idx % 2 === 0
                        ? "transparent"
                        : "var(--color-surface-container-low)",
                    transition: "background-color 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "var(--color-surface-container-high)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      idx % 2 === 0 ? "transparent" : "var(--color-surface-container-low)";
                  }}
                >
                  {/* Bairro Name */}
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontWeight: 600, color: "var(--color-on-surface)" }}>
                      {bairro.name}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: "var(--color-outline)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      Lat: {bairro.lat.toFixed(3)}, Lng: {bairro.lng.toFixed(3)}
                    </div>
                  </td>

                  {/* Avg M2 Price */}
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontWeight: 700,
                        color: "var(--color-primary)",
                      }}
                    >
                      {formatBRL(stats.avgM2Price)}/m²
                    </span>
                  </td>

                  {/* Median Price */}
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-on-surface)" }}>
                      {formatCompactPrice(stats.medianPrice, businessType === "Rent")}
                    </span>
                  </td>

                  {/* Std Dev */}
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      className="badge-tech"
                      style={{ color: "var(--color-on-surface-variant)" }}
                    >
                      ± {formatBRL(stats.stdDev)}
                    </span>
                  </td>

                  {/* Samples */}
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ fontFamily: "var(--font-mono)" }}>
                      {stats.samples} imóveis
                    </span>
                  </td>

                  {/* Trend */}
                  <td style={{ padding: "12px 16px" }}>
                    <span className="badge-success">{stats.trend}</span>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <div
                      style={{
                        display: "inline-flex",
                        gap: 6,
                        justifyContent: "flex-end",
                      }}
                    >
                      <button
                        onClick={() => {
                          if (onNavigateToSimulator) {
                            onNavigateToSimulator(bairro.id);
                          }
                        }}
                        className="btn-secondary"
                        style={{ padding: "4px 8px", fontSize: 11 }}
                        title="Simular Avaliação neste Bairro"
                      >
                        <Sliders size={12} />
                        <span>Simular</span>
                      </button>

                      <button
                        onClick={() => {
                          if (onSelectNeighborhood) onSelectNeighborhood(bairro);
                          if (onNavigateToMap) onNavigateToMap(bairro.id);
                        }}
                        className="btn-primary"
                        style={{ padding: "4px 8px", fontSize: 11 }}
                        title="Ver no Mapa Interativo"
                      >
                        <MapPin size={12} />
                        <span>Ver no Mapa</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
