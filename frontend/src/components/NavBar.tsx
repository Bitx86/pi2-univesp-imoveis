"use client";

import React, { useState } from "react";
import { Compass, Menu, X, ArrowUpRight, Database, MapPin } from "lucide-react";

interface NavBarProps {
  onOpenDashboard?: () => void;
  onScrollToSection?: (sectionId: string) => void;
}

export function NavBar({ onOpenDashboard, onScrollToSection }: NavBarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    if (onScrollToSection) {
      onScrollToSection(id);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backgroundColor: "rgba(49, 66, 24, 0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(100, 117, 75, 0.35)",
        width: "100%",
        transition: "all 0.3s ease",
      }}
    >
      <div
        style={{
          maxWidth: "var(--page-max-width)",
          margin: "0 auto",
          padding: "0 24px",
          height: 72,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
        }}
      >
        {/* Brand Monogram & Wordmark */}
        <a
          href="#"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "var(--radius-cards)",
              backgroundColor: "var(--color-forest-floor)",
              border: "1px solid var(--color-lichen)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-amber-compass)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            }}
          >
            <Compass size={22} strokeWidth={1.8} />
          </div>
          <div>
            <div
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 22,
                fontWeight: 600,
                letterSpacing: "-0.5px",
                color: "var(--color-bone-white)",
                lineHeight: 1.1,
              }}
            >
              AppImóveis
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "var(--color-lichen)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              GIS Atlas v2.4
            </div>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <div
          style={{
            display: "none",
            alignItems: "center",
            gap: 28,
          }}
          className="desktop-nav"
        >
          <button
            onClick={() => handleNavClick("mapa-explorer")}
            style={{
              background: "none",
              border: "none",
              fontFamily: "var(--font-sans)",
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "var(--color-bone-white)",
              cursor: "pointer",
              padding: "6px 0",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-amber-compass)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-bone-white)")}
          >
            Mapa Interativo
          </button>

          <button
            onClick={() => handleNavClick("bairros-matrix")}
            style={{
              background: "none",
              border: "none",
              fontFamily: "var(--font-sans)",
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "var(--color-bone-white)",
              cursor: "pointer",
              padding: "6px 0",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-amber-compass)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-bone-white)")}
          >
            Índice de Bairros
          </button>

          <button
            onClick={() => handleNavClick("metodologia-stats")}
            style={{
              background: "none",
              border: "none",
              fontFamily: "var(--font-sans)",
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "var(--color-bone-white)",
              cursor: "pointer",
              padding: "6px 0",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-amber-compass)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-bone-white)")}
          >
            Estatística & GIS
          </button>

          <button
            onClick={() => handleNavClick("calculadora-regiao")}
            style={{
              background: "none",
              border: "none",
              fontFamily: "var(--font-sans)",
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "var(--color-bone-white)",
              cursor: "pointer",
              padding: "6px 0",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-amber-compass)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-bone-white)")}
          >
            Simulador de Valor
          </button>
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Neon DB Indicator Badge */}
          <div
            style={{
              display: "none",
              alignItems: "center",
              gap: 6,
              padding: "4px 10px",
              backgroundColor: "var(--color-forest-floor)",
              borderRadius: "var(--radius-badges)",
              border: "1px solid var(--color-fern)",
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              color: "var(--color-limestone)",
            }}
            className="db-status-badge"
          >
            <Database size={12} color="#86efac" />
            <span>NEON POSTGRES</span>
          </div>

          <button
            onClick={onOpenDashboard}
            className="btn-ghost-link"
            style={{
              fontSize: 13,
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            Dashboard de Dados
          </button>

          <button
            onClick={() => handleNavClick("mapa-explorer")}
            className="btn-amber"
            style={{
              padding: "9px 18px",
              fontSize: 13,
              gap: 6,
            }}
          >
            <span>Explorar Mapa</span>
            <ArrowUpRight size={15} />
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "none",
              border: "none",
              color: "var(--color-bone-white)",
              cursor: "pointer",
              padding: 6,
            }}
            className="mobile-menu-btn"
            aria-label="Abrir Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: "var(--color-forest-floor)",
            borderBottom: "1px solid var(--color-lichen)",
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <button
            onClick={() => handleNavClick("mapa-explorer")}
            style={{
              textAlign: "left",
              background: "none",
              border: "none",
              color: "var(--color-bone-white)",
              fontSize: 15,
              fontWeight: 500,
              padding: "8px 0",
              cursor: "pointer",
            }}
          >
            🗺️ Mapa Interativo
          </button>
          <button
            onClick={() => handleNavClick("bairros-matrix")}
            style={{
              textAlign: "left",
              background: "none",
              border: "none",
              color: "var(--color-bone-white)",
              fontSize: 15,
              fontWeight: 500,
              padding: "8px 0",
              cursor: "pointer",
            }}
          >
            📊 Índice de Bairros
          </button>
          <button
            onClick={() => handleNavClick("metodologia-stats")}
            style={{
              textAlign: "left",
              background: "none",
              border: "none",
              color: "var(--color-bone-white)",
              fontSize: 15,
              fontWeight: 500,
              padding: "8px 0",
              cursor: "pointer",
            }}
          >
            📐 Estatística & GIS
          </button>
          <button
            onClick={() => handleNavClick("calculadora-regiao")}
            style={{
              textAlign: "left",
              background: "none",
              border: "none",
              color: "var(--color-bone-white)",
              fontSize: 15,
              fontWeight: 500,
              padding: "8px 0",
              cursor: "pointer",
            }}
          >
            🧮 Simulador de Valor
          </button>
        </div>
      )}

      <style jsx>{`
        @media (min-width: 860px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-menu-btn {
            display: none !important;
          }
          .db-status-badge {
            display: inline-flex !important;
          }
        }
      `}</style>
    </nav>
  );
}
