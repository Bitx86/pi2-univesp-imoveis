"use client";

import React, { useState } from "react";
import { TopographicBackground } from "@/components/TopographicBackground";
import { TickerBar } from "@/components/TickerBar";
import { NavBar } from "@/components/NavBar";
import { HeroSection } from "@/components/HeroSection";
import { CartographicMapExplorer, NeighborhoodData } from "@/components/CartographicMapExplorer";
import { ClientProofRow } from "@/components/ClientProofRow";
import { FeatureSections } from "@/components/FeatureSections";
import { NeighborhoodMatrix } from "@/components/NeighborhoodMatrix";
import { ValuationEstimator } from "@/components/ValuationEstimator";
import { FeltCTASection } from "@/components/FeltCTASection";
import { CartographerFooter } from "@/components/CartographerFooter";
import { DashboardModal } from "@/components/DashboardModal";

export default function Home() {
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [dashboardBairroId, setDashboardBairroId] = useState("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
  const [dashboardTipo, setDashboardTipo] = useState<"Sale" | "Rent">("Sale");

  const handleOpenDashboard = (bairroId?: string, tipo?: "Sale" | "Rent") => {
    if (bairroId) {
      if (bairroId === "centro") setDashboardBairroId("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
      else if (bairroId === "vila-augusta") setDashboardBairroId("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
      else if (bairroId === "jardim-maia") setDashboardBairroId("cccccccc-cccc-cccc-cccc-cccccccccccc");
      else setDashboardBairroId(bairroId);
    }
    if (tipo) setDashboardTipo(tipo);
    setDashboardOpen(true);
  };

  const handleScrollTo = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      style={{
        backgroundColor: "var(--color-moss-canvas)",
        color: "var(--color-parchment)",
        minHeight: "100vh",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {/* Background Cartographic Topography Curves */}
      <TopographicBackground />

      {/* Live Announcement Ticker Banner */}
      <TickerBar />

      {/* Editorial Cartographer Navigation */}
      <NavBar
        onOpenDashboard={() => setDashboardOpen(true)}
        onScrollToSection={handleScrollTo}
      />

      {/* Main Editorial Content Stream */}
      <main style={{ position: "relative", zIndex: 10 }}>
        {/* Above-the-fold Hero Section */}
        <HeroSection
          onExploreMap={() => handleScrollTo("mapa-explorer")}
          onOpenDashboard={() => setDashboardOpen(true)}
        />

        {/* The Signature Fold-Out Atlas Spread (Embedded Product UI GIS Panel) */}
        <CartographicMapExplorer
          onSelectForDashboard={(id, tipo) => handleOpenDashboard(id, tipo)}
        />

        {/* Social Proof Partners & GIS Institutes */}
        <ClientProofRow />

        {/* Editorial Feature Spreads (Gaussian Dispersion, GIS Layers & Neon Engine) */}
        <FeatureSections />

        {/* Interactive Neighborhood Comparison Matrix */}
        <NeighborhoodMatrix
          onSelectNeighborhood={(bairro: NeighborhoodData) => {
            handleScrollTo("mapa-explorer");
          }}
        />

        {/* Real Estate Valuation Simulator */}
        <ValuationEstimator />

        {/* Final Conversion CTA Section */}
        <FeltCTASection
          onExploreMap={() => handleScrollTo("mapa-explorer")}
        />
      </main>

      {/* Cartographic Field Journal Footer */}
      <CartographerFooter onOpenDashboard={() => setDashboardOpen(true)} />

      {/* Live Neon API Dashboard Modal */}
      <DashboardModal
        isOpen={dashboardOpen}
        onClose={() => setDashboardOpen(false)}
        initialBairroId={dashboardBairroId}
        initialTipoNegocio={dashboardTipo}
      />
    </div>
  );
}
