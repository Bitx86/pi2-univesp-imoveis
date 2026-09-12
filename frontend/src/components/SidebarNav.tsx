"use client";

import React, { useState } from "react";
import {
  Map,
  BarChart3,
  Calculator,
  Layers,
  Database,
  Menu,
  X,
  ChevronRight,
  Sun,
  Moon,
  ShieldAlert,
} from "lucide-react";

export type ScreenType = "map" | "stats" | "simulator" | "bairros" | "violencia";

interface SidebarNavProps {
  activeScreen: ScreenType;
  onSelectScreen: (screen: ScreenType) => void;
  businessType: "Sale" | "Rent";
  onChangeBusinessType: (type: "Sale" | "Rent") => void;
  onOpenDashboard: () => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

export function SidebarNav({
  activeScreen,
  onSelectScreen,
  businessType,
  onChangeBusinessType,
  onOpenDashboard,
  theme,
  onToggleTheme,
}: SidebarNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    {
      id: "map" as ScreenType,
      label: "Mapa Interativo",
      subtitle: "GIS Explorer (Google Ruas/Satélite)",
      icon: Map,
      badge: "Google",
    },
    {
      id: "stats" as ScreenType,
      label: "Análise Estatística",
      subtitle: "DataViz & Curva Gaussiana",
      icon: BarChart3,
      badge: "±1.96σ",
    },
    {
      id: "simulator" as ScreenType,
      label: "Simulador de Valor",
      subtitle: "Avaliação Preditiva",
      icon: Calculator,
      badge: "Interativo",
    },
    {
      id: "bairros" as ScreenType,
      label: "Índice de Bairros",
      subtitle: "Matriz Regional Comparativa",
      icon: Layers,
      badge: "Guarulhos",
    },
    {
      id: "violencia" as ScreenType,
      label: "Mapa da Violência",
      subtitle: "Indicadores criminais SSP-SP",
      icon: ShieldAlert,
      badge: "SSP-SP",
    },
  ];

  const handleNavClick = (screen: ScreenType) => {
    onSelectScreen(screen);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 60,
          backgroundColor: "var(--color-surface-container-lowest)",
          borderBottom: "var(--border-technical)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          zIndex: 40,
        }}
        className="lg-hidden-mobile-header"
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              background: "transparent",
              border: "var(--border-technical)",
              color: "var(--color-on-surface)",
              borderRadius: "var(--radius-buttons)",
              padding: "6px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label="Abrir Menu Lateral"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "var(--color-primary)",
              }}
            />
            <span
              className="font-headline"
              style={{ fontSize: 16, color: "var(--color-on-surface)" }}
            >
              AppImóveis
            </span>
          </div>
        </div>

        {/* Mobile Controls: Theme Toggle & Business Type */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={onToggleTheme}
            style={{
              background: "var(--color-surface-container)",
              border: "var(--border-technical)",
              color: "var(--color-on-surface)",
              borderRadius: "var(--radius-buttons)",
              padding: "6px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label="Alternar Tema"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <div
            style={{
              display: "flex",
              backgroundColor: "var(--color-surface-container)",
              border: "var(--border-technical)",
              borderRadius: "var(--radius-buttons)",
              padding: 2,
            }}
          >
            <button
              onClick={() => onChangeBusinessType("Sale")}
              style={{
                background:
                  businessType === "Sale"
                    ? "var(--color-primary)"
                    : "transparent",
                color:
                  businessType === "Sale"
                    ? "var(--color-on-primary)"
                    : "var(--color-on-surface-variant)",
                border: "none",
                borderRadius: 3,
                padding: "3px 8px",
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Venda
            </button>
            <button
              onClick={() => onChangeBusinessType("Rent")}
              style={{
                background:
                  businessType === "Rent"
                    ? "var(--color-primary)"
                    : "transparent",
                color:
                  businessType === "Rent"
                    ? "var(--color-on-primary)"
                    : "var(--color-on-surface-variant)",
                border: "none",
                borderRadius: 3,
                padding: "3px 8px",
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Aluguel
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 45,
          }}
        />
      )}

      {/* Main Fixed Sidebar */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: 260,
          backgroundColor: "var(--color-surface-container-lowest)",
          borderRight: "var(--border-technical)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          zIndex: 50,
          transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          transform: mobileOpen ? "translateX(0)" : undefined,
        }}
        className={mobileOpen ? "sidebar-mobile-visible" : "sidebar-responsive"}
      >
        {/* Top Branding & Theme Switcher */}
        <div>
          <div
            style={{
              padding: "18px 18px",
              borderBottom: "var(--border-technical)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 4,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    backgroundColor: "var(--color-primary)",
                  }}
                />
                <h1
                  className="font-display"
                  style={{
                    fontSize: 20,
                    letterSpacing: "-0.01em",
                    color: "var(--color-on-surface)",
                  }}
                >
                  AppImóveis
                </h1>
              </div>

              {/* Theme Toggle Button (Light/Dark) */}
              <button
                onClick={onToggleTheme}
                style={{
                  background: "var(--color-surface-container)",
                  border: "var(--border-technical)",
                  color: "var(--color-on-surface)",
                  borderRadius: "var(--radius-default)",
                  padding: "5px 8px",
                  fontSize: 11,
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                title={
                  theme === "dark"
                    ? "Mudar para Modo Claro"
                    : "Mudar para Modo Escuro"
                }
              >
                {theme === "dark" ? (
                  <>
                    <Sun size={13} style={{ color: "#eab308" }} />
                    <span style={{ fontSize: 10, fontFamily: "var(--font-mono)" }}>Claro</span>
                  </>
                ) : (
                  <>
                    <Moon size={13} style={{ color: "var(--color-primary)" }} />
                    <span style={{ fontSize: 10, fontFamily: "var(--font-mono)" }}>Escuro</span>
                  </>
                )}
              </button>
            </div>
            <p
              className="font-label"
              style={{
                color: "var(--color-on-surface-variant)",
                fontSize: 10,
                letterSpacing: "0.06em",
              }}
            >
              Inteligência Geoespacial • Guarulhos
            </p>
          </div>

          {/* Business Type Selector (Sale vs Rent) */}
          <div style={{ padding: "12px 16px" }}>
            <div
              style={{
                fontSize: 10,
                color: "var(--color-on-surface-variant)",
                textTransform: "uppercase",
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.06em",
                marginBottom: 6,
              }}
            >
              Modalidade
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                backgroundColor: "var(--color-surface-container)",
                border: "var(--border-technical)",
                borderRadius: "var(--radius-default)",
                padding: 3,
                gap: 2,
              }}
            >
              <button
                onClick={() => onChangeBusinessType("Sale")}
                style={{
                  background:
                    businessType === "Sale"
                      ? "var(--color-primary)"
                      : "transparent",
                  color:
                    businessType === "Sale"
                      ? "var(--color-on-primary)"
                      : "var(--color-on-surface-variant)",
                  border: "none",
                  borderRadius: "var(--radius-default)",
                  padding: "6px 0",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  fontFamily: "var(--font-sans)",
                }}
              >
                Venda
              </button>
              <button
                onClick={() => onChangeBusinessType("Rent")}
                style={{
                  background:
                    businessType === "Rent"
                      ? "var(--color-primary)"
                      : "transparent",
                  color:
                    businessType === "Rent"
                      ? "var(--color-on-primary)"
                      : "var(--color-on-surface-variant)",
                  border: "none",
                  borderRadius: "var(--radius-default)",
                  padding: "6px 0",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  fontFamily: "var(--font-sans)",
                }}
              >
                Locação
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ padding: "6px 12px" }}>
            <div
              style={{
                fontSize: 10,
                color: "var(--color-outline)",
                textTransform: "uppercase",
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.08em",
                padding: "4px 8px 8px 8px",
              }}
            >
              Módulos
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeScreen === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "var(--radius-default)",
                      backgroundColor: isActive
                        ? "var(--color-surface-container-high)"
                        : "transparent",
                      border: isActive
                        ? "1px solid var(--color-primary)"
                        : "1px solid transparent",
                      color: isActive
                        ? "var(--color-on-surface)"
                        : "var(--color-on-surface-variant)",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor =
                          "var(--color-surface-container)";
                        e.currentTarget.style.color = "var(--color-on-surface)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color =
                          "var(--color-on-surface-variant)";
                      }
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <div
                        style={{
                          color: isActive
                            ? "var(--color-primary)"
                            : "var(--color-outline)",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Icon size={18} />
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: isActive ? 600 : 500,
                            fontFamily: "var(--font-sans)",
                            color: "var(--color-on-surface)",
                          }}
                        >
                          {item.label}
                        </div>
                        <div
                          style={{
                            fontSize: 10,
                            color: "var(--color-on-surface-variant)",
                            opacity: 0.85,
                          }}
                        >
                          {item.subtitle}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span
                        style={{
                          fontSize: 9,
                          fontFamily: "var(--font-mono)",
                          padding: "2px 5px",
                          borderRadius: 2,
                          backgroundColor: isActive
                            ? "var(--color-primary-container)"
                            : "var(--color-surface-container)",
                          color: isActive
                            ? "var(--color-on-primary-container)"
                            : "var(--color-on-surface-variant)",
                          border: "var(--border-technical)",
                        }}
                      >
                        {item.badge}
                      </span>
                      {isActive && (
                        <ChevronRight
                          size={14}
                          style={{ color: "var(--color-primary)" }}
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Bottom Telemetry & Status Panel */}
        <div
          style={{
            padding: "14px",
            borderTop: "var(--border-technical)",
            backgroundColor: "var(--color-surface-container-lowest)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
              fontSize: 11,
              fontFamily: "var(--font-mono)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  backgroundColor: "var(--color-success)",
                }}
              />
              <span style={{ color: "var(--color-on-surface-variant)" }}>
                Neon Lakebase
              </span>
            </div>
            <span className="badge-success">ONLINE</span>
          </div>

          <button
            onClick={onOpenDashboard}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              padding: "7px 10px",
              backgroundColor: "var(--color-surface-container)",
              border: "var(--border-technical)",
              borderRadius: "var(--radius-default)",
              color: "var(--color-on-surface)",
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                "var(--color-surface-container-high)";
              e.currentTarget.style.borderColor = "var(--color-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor =
                "var(--color-surface-container)";
              e.currentTarget.style.borderColor = "var(--color-outline-variant)";
            }}
          >
            <Database size={13} style={{ color: "var(--color-primary)" }} />
            <span>Telemetria & Diagnóstico DB</span>
          </button>
        </div>
      </aside>

      <style jsx global>{`
        @media (min-width: 1025px) {
          .lg-hidden-mobile-header {
            display: none !important;
          }
          .sidebar-responsive {
            transform: translateX(0) !important;
          }
        }
        @media (max-width: 1024px) {
          .sidebar-responsive {
            transform: translateX(-100%);
          }
          .sidebar-mobile-visible {
            transform: translateX(0) !important;
          }
        }
      `}</style>
    </>
  );
}
