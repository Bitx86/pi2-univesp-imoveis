"use client";

import React, { useState, useEffect } from "react";
import { SidebarNav, ScreenType } from "@/components/SidebarNav";
import { MapScreen } from "@/components/screens/MapScreen";
import { StatsScreen } from "@/components/screens/StatsScreen";
import { ValuationScreen } from "@/components/screens/ValuationScreen";
import { NeighborhoodScreen } from "@/components/screens/NeighborhoodScreen";
import { ViolenceScreen } from "@/components/screens/ViolenceScreen";
import { DashboardModal } from "@/components/DashboardModal";
import { TopographicBackground } from "@/components/TopographicBackground";
import { BusinessType, NeighborhoodData, NEIGHBORHOODS } from "@/data/imoveisData";
import { useRealEstateData } from "@/hooks/useRealEstateData";

export default function Home() {
  const [activeScreen, setActiveScreen] = useState<ScreenType>("map");
  const [businessType, setBusinessType] = useState<BusinessType>("Sale");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [simulatorInitialArea, setSimulatorInitialArea] = useState<number>(85);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [mapFocusTarget, setMapFocusTarget] = useState<{ lat: number; lng: number; label: string } | null>(null);

  // Connect frontend state to real Neon Postgres database
  const {
    neighborhoods,
    allProperties,
    loading: loadingDb,
    isBackendConnected,
    totalDbCount,
    refreshData,
  } = useRealEstateData(businessType);

  const [selectedNeighborhoodId, setSelectedNeighborhoodId] = useState<string>(
    neighborhoods[0]?.id || NEIGHBORHOODS[0].id
  );

  // Keep selected neighborhood valid if neighborhoods change
  useEffect(() => {
    if (neighborhoods.length > 0) {
      const exists = neighborhoods.some((n) => n.id === selectedNeighborhoodId);
      if (!exists) {
        setSelectedNeighborhoodId(neighborhoods[0].id);
      }
    }
  }, [neighborhoods, selectedNeighborhoodId]);

  // Sync theme with localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("appimoveis_theme") as "dark" | "light" | null;
    if (savedTheme) {
      const timeoutId = setTimeout(() => {
        setTheme(savedTheme);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const handleToggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("appimoveis_theme", nextTheme);
  };

  const handleSelectNeighborhood = (bairro: NeighborhoodData) => {
    setSelectedNeighborhoodId(bairro.id);
  };

  const handleNavigateToMap = (bairroId: string) => {
    setSelectedNeighborhoodId(bairroId);
    setActiveScreen("map");
  };

  const handleNavigateToSimulator = (bairroId: string, areaM2?: number) => {
    setSelectedNeighborhoodId(bairroId);
    if (areaM2) setSimulatorInitialArea(areaM2);
    setActiveScreen("simulator");
  };

  const handleNavigateToStats = (bairroId: string) => {
    setSelectedNeighborhoodId(bairroId);
    setActiveScreen("stats");
  };

  return (
    <div className="spa-container">
      {/* Ambient Topographic Lines */}
      <TopographicBackground />

      {/* Fixed Hierarchical Sidebar */}
      <SidebarNav
        activeScreen={activeScreen}
        onSelectScreen={setActiveScreen}
        businessType={businessType}
        onChangeBusinessType={setBusinessType}
        onOpenDashboard={() => setDashboardOpen(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Screen Viewport */}
      <main className="spa-main-content">
        {activeScreen === "map" && (
          <MapScreen
            businessType={businessType}
            selectedNeighborhoodId={selectedNeighborhoodId}
            neighborhoods={neighborhoods}
            onSelectNeighborhood={handleSelectNeighborhood}
            onNavigateToSimulator={handleNavigateToSimulator}
            onNavigateToStats={handleNavigateToStats}
            focusTarget={mapFocusTarget}
          />
        )}

        {activeScreen === "stats" && (
          <StatsScreen
            businessType={businessType}
            selectedNeighborhoodId={selectedNeighborhoodId}
            neighborhoods={neighborhoods}
            onSelectNeighborhood={handleSelectNeighborhood}
            onNavigateToMap={handleNavigateToMap}
          />
        )}

        {activeScreen === "simulator" && (
          <ValuationScreen
            businessType={businessType}
            selectedNeighborhoodId={selectedNeighborhoodId}
            neighborhoods={neighborhoods}
            initialAreaM2={simulatorInitialArea}
            onSelectNeighborhood={handleSelectNeighborhood}
            onNavigateToMap={handleNavigateToMap}
          />
        )}

        {activeScreen === "bairros" && (
          <NeighborhoodScreen
            businessType={businessType}
            selectedNeighborhoodId={selectedNeighborhoodId}
            neighborhoods={neighborhoods}
            onSelectNeighborhood={handleSelectNeighborhood}
            onNavigateToMap={handleNavigateToMap}
            onNavigateToSimulator={handleNavigateToSimulator}
          />
        )}

        {activeScreen === "violencia" && <ViolenceScreen onOpenMap={(target) => { setMapFocusTarget(target); setActiveScreen("map"); }} />}
      </main>

      {/* Database Telemetry / Seed Diagnostics Modal */}
      <DashboardModal
        isOpen={dashboardOpen}
        onClose={() => setDashboardOpen(false)}
        initialBairroId="todos"
        initialTipoNegocio={businessType}
        onDataUpdated={refreshData}
      />
    </div>
  );
}
