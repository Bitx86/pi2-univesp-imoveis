"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import type { Map as LeafletMap, LayerGroup } from "leaflet";
import {
  MapPin,
  Search,
  Building,
  Bed,
  Bath,
  Car,
  Maximize,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Sparkles,
  Sliders,
  BarChart3,
  X,
  Layers,
} from "lucide-react";
import {
  NEIGHBORHOODS,
  NeighborhoodData,
  BusinessType,
  MapTileProvider,
  formatBRL,
  formatCompactPrice,
} from "@/data/imoveisData";

interface MapScreenProps {
  businessType: BusinessType;
  selectedNeighborhoodId?: string;
  neighborhoods?: NeighborhoodData[];
  onSelectNeighborhood?: (bairro: NeighborhoodData) => void;
  onNavigateToSimulator?: (bairroId: string, areaM2?: number) => void;
  onNavigateToStats?: (bairroId: string) => void;
  focusTarget?: { lat: number; lng: number; label: string } | null;
}

export function MapScreen({
  businessType,
  selectedNeighborhoodId,
  neighborhoods,
  onSelectNeighborhood,
  onNavigateToSimulator,
  onNavigateToStats,
  focusTarget,
}: MapScreenProps) {
  const effectiveNeighborhoods = useMemo(() => {
    return neighborhoods && neighborhoods.length > 0 ? neighborhoods : NEIGHBORHOODS;
  }, [neighborhoods]);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markersGroupRef = useRef<LayerGroup | null>(null);
  const polygonsGroupRef = useRef<LayerGroup | null>(null);

  const [activeBairroId, setActiveBairroId] = useState<string>(
    selectedNeighborhoodId || effectiveNeighborhoods[0]?.id || "jardim-maia"
  );
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("jma-1");
  // Default map layer: Google Streets (clear, crisp, standard)
  const [tileProvider, setTileProvider] = useState<MapTileProvider>("google-streets");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchingGeocode, setIsSearchingGeocode] = useState(false);
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState<number>(0);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(true);
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Sync active neighborhood when prop changes
  useEffect(() => {
    if (selectedNeighborhoodId) {
      setActiveBairroId(selectedNeighborhoodId);
    }
  }, [selectedNeighborhoodId]);

  const selectedNeighborhood = useMemo(() => {
    return (
      effectiveNeighborhoods.find((b) => b.id === (selectedNeighborhoodId || activeBairroId)) ||
      effectiveNeighborhoods[0]
    );
  }, [effectiveNeighborhoods, selectedNeighborhoodId, activeBairroId]);

  // Selected property object
  const activeProperty = useMemo(() => {
    let prop = selectedNeighborhood?.properties?.find(
      (p) => p.id === selectedPropertyId
    );
    if (!prop) {
      for (const b of effectiveNeighborhoods) {
        prop = b.properties?.find((p) => p.id === selectedPropertyId);
        if (prop) break;
      }
    }
    return prop || selectedNeighborhood?.properties?.[0];
  }, [effectiveNeighborhoods, selectedNeighborhood, selectedPropertyId]);

  // Initialize Leaflet Map with Google Streets and Google Satellite
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;

    async function initMap() {
      const L = await import("leaflet");

      if (!isMounted || !mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [selectedNeighborhood.lat, selectedNeighborhood.lng],
          zoom: selectedNeighborhood.zoom,
          zoomControl: false,
          attributionControl: false,
        });

        L.control.zoom({ position: "bottomright" }).addTo(map);

        mapInstanceRef.current = map;
        if (focusTarget) map.setView([focusTarget.lat, focusTarget.lng], 16);
        markersGroupRef.current = L.layerGroup().addTo(map);
        polygonsGroupRef.current = L.layerGroup().addTo(map);
      }

      const map = mapInstanceRef.current;

      // Update Tile Layer: Google Satellite or Google Streets
      map.eachLayer((layer) => {
        if (layer instanceof L.TileLayer) {
          map.removeLayer(layer);
        }
      });

      const tileUrl =
        tileProvider === "google-satellite"
          ? "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
          : "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}";

      L.tileLayer(tileUrl, {
        maxZoom: 20,
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
      }).addTo(map);

      // Render Neighborhood Boundary Polygons
      if (polygonsGroupRef.current) {
        polygonsGroupRef.current.clearLayers();

        effectiveNeighborhoods.forEach((bairro) => {
          const isSelected = bairro.id === selectedNeighborhood.id;
          const polygon = L.polygon(bairro.geoPolygon, {
            color: isSelected ? "#2563eb" : "#64748b",
            weight: isSelected ? 2.5 : 1,
            fillColor: isSelected ? "#3b82f6" : "#94a3b8",
            fillOpacity: isSelected ? 0.2 : 0.05,
            dashArray: isSelected ? undefined : "3, 6",
          });

          polygon.on("click", () => {
            setActiveBairroId(bairro.id);
            if (bairro.properties && bairro.properties.length > 0) {
              setSelectedPropertyId(bairro.properties[0].id);
            }
            if (onSelectNeighborhood) onSelectNeighborhood(bairro);
            map.flyTo([bairro.lat, bairro.lng], bairro.zoom, { duration: 0.8 });
          });

          polygonsGroupRef.current?.addLayer(polygon);

          // Add neighborhood center text marker
          const centerLat = bairro.lat;
          const centerLng = bairro.lng;
          const stats =
            businessType === "Sale" ? bairro.sale : bairro.rent;

          const labelIcon = L.divIcon({
            className: "neighborhood-map-label-wrapper",
            html: `
              <div class="neighborhood-map-label" style="${
              isSelected
                ? "border-color: #2563eb; background: var(--color-surface-container); font-weight: 700; color: var(--color-primary);"
                : ""
            }">
                <div style="font-size: 11px;">${bairro.name}</div>
                <div style="font-size: 9px; font-family: monospace; opacity: 0.85;">
                  ${formatCompactPrice(stats.medianPrice, businessType === "Rent")} • ${formatBRL(stats.avgM2Price)}/m²
                </div>
              </div>
            `,
            iconSize: [140, 36],
            iconAnchor: [70, 18],
          });

          const labelMarker = L.marker([centerLat, centerLng], {
            icon: labelIcon,
          });
          labelMarker.on("click", () => {
            setActiveBairroId(bairro.id);
            if (bairro.properties && bairro.properties.length > 0) {
              setSelectedPropertyId(bairro.properties[0].id);
            }
            if (onSelectNeighborhood) onSelectNeighborhood(bairro);
            map.flyTo([bairro.lat, bairro.lng], bairro.zoom, { duration: 0.8 });
          });

          polygonsGroupRef.current?.addLayer(labelMarker);
        });
      }

      // Render Property Price Pins
      if (markersGroupRef.current) {
        markersGroupRef.current.clearLayers();

        effectiveNeighborhoods.forEach((bairro) => {
          (bairro.properties || []).forEach((prop) => {
            const isSelected = prop.id === selectedPropertyId;
            const isRent = businessType === "Rent";
            const price = isRent ? prop.rentPrice : prop.price;
            const priceLabel = formatCompactPrice(price, isRent);

            const pinHtml = `
              <div class="price-pill-marker">
                <div class="price-pill-bubble ${isSelected ? "active" : ""} ${
              prop.isDeal ? "deal" : ""
            }">
                  ${
                    prop.isDeal
                      ? '<span class="deal-badge">★ OPORTUNIDADE</span>'
                      : ""
                  }
                  <span>${priceLabel}</span>
                </div>
              </div>
            `;

            const icon = L.divIcon({
              className: "leaflet-custom-pin",
              html: pinHtml,
              iconSize: [110, 34],
              iconAnchor: [55, 34],
            });

            const marker = L.marker([prop.lat, prop.lng], {
              icon,
              zIndexOffset: isSelected ? 1000 : prop.isDeal ? 500 : 100,
            });

            marker.on("click", () => {
              setSelectedPropertyId(prop.id);
              setActiveBairroId(bairro.id);
              setActivePhotoIdx(0);
              setDrawerOpen(true);
              map.flyTo([prop.lat, prop.lng], 16, { duration: 0.6 });
            });

            markersGroupRef.current?.addLayer(marker);
          });
        });
      }
    }

    initMap();

    return () => {
      isMounted = false;
    };
  }, [
    effectiveNeighborhoods,
    selectedNeighborhood,
    selectedPropertyId,
    tileProvider,
    businessType,
    onSelectNeighborhood,
    focusTarget,
  ]);

  useEffect(() => {
    if (focusTarget && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([focusTarget.lat, focusTarget.lng], 16, { duration: 0.8 });
    }
  }, [focusTarget]);

  // Geocoding Search handler
  const handleGeocodeSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !mapInstanceRef.current) return;

    setIsSearchingGeocode(true);
    setSearchFeedback(null);

    try {
      const matchedBairro = effectiveNeighborhoods.find((b) =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

      if (matchedBairro) {
        setActiveBairroId(matchedBairro.id);
        if (matchedBairro.properties.length > 0) {
          setSelectedPropertyId(matchedBairro.properties[0].id);
        }
        mapInstanceRef.current.flyTo(
          [matchedBairro.lat, matchedBairro.lng],
          matchedBairro.zoom,
          { duration: 1.0 }
        );
        setSearchFeedback(`Bairro ${matchedBairro.name} localizado no mapa.`);
        setIsSearchingGeocode(false);
        return;
      }

      const queryParam = encodeURIComponent(`${searchQuery}, Guarulhos, SP, Brasil`);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${queryParam}&limit=1`
      );

      if (res.ok) {
        const results = await res.json();
        if (results && results.length > 0) {
          const lat = parseFloat(results[0].lat);
          const lon = parseFloat(results[0].lon);
          mapInstanceRef.current.flyTo([lat, lon], 16, { duration: 1.2 });
          setSearchFeedback(`Localizado: ${results[0].display_name.split(",")[0]}`);
        } else {
          setSearchFeedback("Endereço não encontrado em Guarulhos.");
        }
      } else {
        setSearchFeedback("Serviço de busca temporariamente indisponível.");
      }
    } catch {
      setSearchFeedback("Erro ao consultar serviço de geolocalização.");
    } finally {
      setIsSearchingGeocode(false);
    }
  };

  const currentStats =
    businessType === "Sale" ? selectedNeighborhood.sale : selectedNeighborhood.rent;

  const priceDeltaPercent = useMemo(() => {
    if (!activeProperty) return 0;
    const currentPriceM2 = activeProperty.m2Price;
    const avgM2 = currentStats.avgM2Price;
    if (!avgM2) return 0;
    return Math.round(((currentPriceM2 - avgM2) / avgM2) * 100);
  }, [activeProperty, currentStats]);

  const handleCopyAddress = () => {
    if (activeProperty) {
      navigator.clipboard.writeText(activeProperty.address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  return (
    <div
      className="screen-fade-in"
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        display: "flex",
        overflow: "hidden",
        backgroundColor: "var(--color-surface)",
      }}
    >
      {/* Full-bleed Leaflet Map Container */}
      <div
        ref={mapContainerRef}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
        }}
      />

      {/* Floating Top Controls HUD */}
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          right: drawerOpen ? 390 : 16,
          zIndex: 20,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          pointerEvents: "none",
          transition: "right 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Search Bar & Google Tile Switcher Row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
            pointerEvents: "auto",
          }}
        >
          {/* Geocoding Search Form */}
          <form
            onSubmit={handleGeocodeSearch}
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "var(--color-surface-container)",
              border: "var(--border-technical)",
              borderRadius: "var(--radius-default)",
              padding: "4px 8px",
              boxShadow: "var(--shadow-panel)",
              maxWidth: 380,
              flex: "1 1 280px",
            }}
          >
            <Search
              size={16}
              style={{ color: "var(--color-outline)", marginRight: 8 }}
            />
            <input
              type="text"
              placeholder="Buscar bairro, CEP ou logradouro..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--color-on-surface)",
                fontSize: 12,
                fontFamily: "var(--font-sans)",
                outline: "none",
                width: "100%",
              }}
            />
            <button
              type="submit"
              disabled={isSearchingGeocode}
              className="btn-primary"
              style={{
                padding: "4px 10px",
                fontSize: 11,
                borderRadius: "var(--radius-default)",
              }}
            >
              {isSearchingGeocode ? "Buscando..." : "Localizar"}
            </button>
          </form>

          {/* Google Tile Switcher (Google Ruas [Padrão] & Google Satélite) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "var(--color-surface-container)",
              border: "var(--border-technical)",
              borderRadius: "var(--radius-default)",
              padding: 2,
              gap: 2,
              boxShadow: "var(--shadow-panel)",
            }}
          >
            <button
              onClick={() => setTileProvider("google-streets")}
              style={{
                background:
                  tileProvider === "google-streets"
                    ? "var(--color-primary)"
                    : "transparent",
                color:
                  tileProvider === "google-streets"
                    ? "#ffffff"
                    : "var(--color-on-surface-variant)",
                border: "none",
                borderRadius: "var(--radius-default)",
                padding: "4px 10px",
                fontSize: 11,
                fontFamily: "var(--font-sans)",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <Layers size={12} />
              <span>Google Ruas</span>
            </button>

            <button
              onClick={() => setTileProvider("google-satellite")}
              style={{
                background:
                  tileProvider === "google-satellite"
                    ? "var(--color-primary)"
                    : "transparent",
                color:
                  tileProvider === "google-satellite"
                    ? "#ffffff"
                    : "var(--color-on-surface-variant)",
                border: "none",
                borderRadius: "var(--radius-default)",
                padding: "4px 10px",
                fontSize: 11,
                fontFamily: "var(--font-sans)",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Google Satélite
            </button>
          </div>
        </div>

        {/* Neighborhood Filter Quick-Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            overflowX: "auto",
            paddingBottom: 4,
            pointerEvents: "auto",
            maxWidth: "100%",
          }}
        >
          {effectiveNeighborhoods.map((bairro) => {
            const isSelected = bairro.id === selectedNeighborhood.id;
            return (
              <button
                key={bairro.id}
                onClick={() => {
                  setActiveBairroId(bairro.id);
                  if (bairro.properties && bairro.properties.length > 0) {
                    setSelectedPropertyId(bairro.properties[0].id);
                  }
                  if (onSelectNeighborhood) onSelectNeighborhood(bairro);
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.flyTo(
                      [bairro.lat, bairro.lng],
                      bairro.zoom,
                      { duration: 0.8 }
                    );
                  }
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  backgroundColor: isSelected
                    ? "var(--color-primary)"
                    : "var(--color-surface-container)",
                  color: isSelected ? "#ffffff" : "var(--color-on-surface)",
                  border: isSelected
                    ? "1px solid var(--color-primary)"
                    : "var(--border-technical)",
                  borderRadius: "var(--radius-default)",
                  padding: "4px 10px",
                  fontSize: 11,
                  fontFamily: "var(--font-sans)",
                  fontWeight: isSelected ? 600 : 400,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  boxShadow: "var(--shadow-flat)",
                  transition: "all 0.15s ease",
                }}
              >
                <span>{bairro.name}</span>
                <span
                  style={{
                    fontSize: 9,
                    fontFamily: "var(--font-mono)",
                    color: isSelected
                      ? "rgba(255,255,255,0.9)"
                      : "var(--color-on-surface-variant)",
                  }}
                >
                  {formatBRL(
                    businessType === "Sale"
                      ? bairro.sale.avgM2Price
                      : bairro.rent.avgM2Price
                  )}
                  /m²
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Feedback Notice */}
        {searchFeedback && (
          <div
            style={{
              alignSelf: "flex-start",
              backgroundColor: "var(--color-surface-container-high)",
              border: "var(--border-technical)",
              color: "var(--color-on-surface)",
              padding: "4px 10px",
              borderRadius: "var(--radius-default)",
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              display: "flex",
              alignItems: "center",
              gap: 6,
              boxShadow: "var(--shadow-panel)",
              pointerEvents: "auto",
            }}
          >
            <Sparkles size={12} style={{ color: "var(--color-primary)" }} />
            <span>{searchFeedback}</span>
            <button
              onClick={() => setSearchFeedback(null)}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--color-outline)",
                cursor: "pointer",
                padding: 0,
                marginLeft: 4,
              }}
            >
              <X size={12} />
            </button>
          </div>
        )}
      </div>

      {/* Floating Property Detail Drawer (Right Side) */}
      {activeProperty && (
        <aside
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            bottom: 16,
            width: 370,
            maxWidth: "calc(100vw - 32px)",
            backgroundColor: "var(--color-surface-container)",
            border: "var(--border-technical)",
            borderRadius: "var(--radius-cards)",
            boxShadow: "var(--shadow-floating)",
            zIndex: 30,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
            transform: drawerOpen ? "translateX(0)" : "translateX(calc(100% + 24px))",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "12px 14px",
              borderBottom: "var(--border-technical)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "var(--color-surface-container-low)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span className="badge-tech">
                {activeProperty.type}
              </span>
              {activeProperty.isDeal && (
                <span className="badge-success">
                  ★ OPORTUNIDADE (-{activeProperty.dealDiscountPercent}%)
                </span>
              )}
            </div>

            <button
              onClick={() => setDrawerOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--color-outline)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Body Content (Scrollable) */}
          <div
            style={{
              padding: "14px",
              overflowY: "auto",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {/* Real API Image Carousel */}
            <div
              style={{
                position: "relative",
                borderRadius: "var(--radius-default)",
                overflow: "hidden",
                height: 180,
                backgroundColor: "var(--color-surface-container-lowest)",
                border: "var(--border-technical)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  activeProperty.images[activePhotoIdx] ||
                  activeProperty.imageUrl ||
                  activeProperty.images[0]
                }
                alt={activeProperty.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />

              {activeProperty.images.length > 1 && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 8,
                    right: 8,
                    display: "flex",
                    gap: 4,
                  }}
                >
                  <button
                    onClick={() =>
                      setActivePhotoIdx((prev) =>
                        prev === 0 ? activeProperty.images.length - 1 : prev - 1
                      )
                    }
                    style={{
                      background: "rgba(15, 23, 42, 0.75)",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: 2,
                      padding: "2px 6px",
                      cursor: "pointer",
                    }}
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() =>
                      setActivePhotoIdx((prev) =>
                        prev === activeProperty.images.length - 1 ? 0 : prev + 1
                      )
                    }
                    style={{
                      background: "rgba(15, 23, 42, 0.75)",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: 2,
                      padding: "2px 6px",
                      cursor: "pointer",
                    }}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Title & Address */}
            <div>
              <h2
                className="font-headline"
                style={{
                  fontSize: 16,
                  color: "var(--color-on-surface)",
                  lineHeight: 1.3,
                  marginBottom: 4,
                }}
              >
                {activeProperty.title}
              </h2>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 6,
                }}
              >
                <p
                  style={{
                    fontSize: 11,
                    color: "var(--color-on-surface-variant)",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <MapPin size={12} style={{ color: "var(--color-primary)" }} />
                  <span>{activeProperty.address}</span>
                </p>
                <button
                  onClick={handleCopyAddress}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: copiedAddress
                      ? "var(--color-success)"
                      : "var(--color-outline)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                    fontSize: 10,
                    fontFamily: "var(--font-mono)",
                  }}
                  title="Copiar Endereço"
                >
                  {copiedAddress ? <Check size={11} /> : <Copy size={11} />}
                  <span>{copiedAddress ? "Copiado" : "Copiar"}</span>
                </button>
              </div>
            </div>

            {/* Price & Stats Card */}
            <div
              style={{
                backgroundColor: "var(--color-surface-container-low)",
                border: "var(--border-technical)",
                borderRadius: "var(--radius-default)",
                padding: "10px 12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  marginBottom: 8,
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: 10,
                      color: "var(--color-outline)",
                      textTransform: "uppercase",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    Valor {businessType === "Sale" ? "de Venda" : "de Locação"}
                  </span>
                  <div
                    className="font-headline"
                    style={{
                      fontSize: 20,
                      color: "var(--color-on-surface)",
                    }}
                  >
                    {formatBRL(
                      businessType === "Sale"
                        ? activeProperty.price
                        : activeProperty.rentPrice
                    )}
                    {businessType === "Rent" && (
                      <span style={{ fontSize: 12, color: "var(--color-outline)" }}>
                        /mês
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <span
                    style={{
                      fontSize: 10,
                      color: "var(--color-outline)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    Metro Quadrado
                  </span>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--color-primary)",
                    }}
                  >
                    {formatBRL(activeProperty.m2Price)}/m²
                  </div>
                </div>
              </div>

              {/* Comparative Delta Tag */}
              <div
                style={{
                  borderTop: "var(--border-technical)",
                  paddingTop: 6,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                }}
              >
                <span style={{ color: "var(--color-on-surface-variant)" }}>
                  Comparado à média do bairro:
                </span>
                <span
                  style={{
                    color:
                      priceDeltaPercent <= 0
                        ? "var(--color-success)"
                        : "var(--color-error)",
                    fontWeight: 600,
                  }}
                >
                  {priceDeltaPercent > 0 ? `+${priceDeltaPercent}%` : `${priceDeltaPercent}%`}
                </span>
              </div>
            </div>

            {/* Spec Matrix */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 6,
              }}
            >
              <div
                style={{
                  backgroundColor: "var(--color-surface-container-low)",
                  border: "var(--border-technical)",
                  borderRadius: "var(--radius-default)",
                  padding: "6px 4px",
                  textAlign: "center",
                }}
              >
                <Maximize
                  size={14}
                  style={{ color: "var(--color-outline)", margin: "0 auto 2px" }}
                />
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-on-surface)" }}>
                  {activeProperty.areaM2} m²
                </div>
                <div style={{ fontSize: 9, color: "var(--color-outline)" }}>Área</div>
              </div>

              <div
                style={{
                  backgroundColor: "var(--color-surface-container-low)",
                  border: "var(--border-technical)",
                  borderRadius: "var(--radius-default)",
                  padding: "6px 4px",
                  textAlign: "center",
                }}
              >
                <Bed
                  size={14}
                  style={{ color: "var(--color-outline)", margin: "0 auto 2px" }}
                />
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-on-surface)" }}>
                  {activeProperty.bedrooms}
                </div>
                <div style={{ fontSize: 9, color: "var(--color-outline)" }}>Quartos</div>
              </div>

              <div
                style={{
                  backgroundColor: "var(--color-surface-container-low)",
                  border: "var(--border-technical)",
                  borderRadius: "var(--radius-default)",
                  padding: "6px 4px",
                  textAlign: "center",
                }}
              >
                <Bath
                  size={14}
                  style={{ color: "var(--color-outline)", margin: "0 auto 2px" }}
                />
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-on-surface)" }}>
                  {activeProperty.bathrooms}
                </div>
                <div style={{ fontSize: 9, color: "var(--color-outline)" }}>Banh.</div>
              </div>

              <div
                style={{
                  backgroundColor: "var(--color-surface-container-low)",
                  border: "var(--border-technical)",
                  borderRadius: "var(--radius-default)",
                  padding: "6px 4px",
                  textAlign: "center",
                }}
              >
                <Car
                  size={14}
                  style={{ color: "var(--color-outline)", margin: "0 auto 2px" }}
                />
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-on-surface)" }}>
                  {activeProperty.parking}
                </div>
                <div style={{ fontSize: 9, color: "var(--color-outline)" }}>Vagas</div>
              </div>
            </div>

            {/* Tags & Amenities Chips */}
            {activeProperty.amenities && activeProperty.amenities.length > 0 && (
              <div>
                <span
                  style={{
                    fontSize: 10,
                    color: "var(--color-outline)",
                    textTransform: "uppercase",
                    fontFamily: "var(--font-mono)",
                    marginBottom: 4,
                    display: "block",
                  }}
                >
                  Tags & Opcionais das APIs
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {activeProperty.tags?.map((tag, idx) => (
                    <span
                      key={`tag-${idx}`}
                      style={{
                        backgroundColor: "var(--color-primary-container)",
                        color: "var(--color-on-primary-container)",
                        fontSize: 10,
                        fontWeight: 600,
                        padding: "2px 6px",
                        borderRadius: "var(--radius-badges)",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                  {activeProperty.amenities.map((item, idx) => (
                    <span
                      key={`amenity-${idx}`}
                      style={{
                        backgroundColor: "var(--color-surface-container-low)",
                        border: "var(--border-technical)",
                        color: "var(--color-on-surface-variant)",
                        fontSize: 10,
                        padding: "2px 6px",
                        borderRadius: "var(--radius-badges)",
                      }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {activeProperty.description && (
              <p
                style={{
                  fontSize: 11,
                  color: "var(--color-on-surface-variant)",
                  lineHeight: 1.45,
                  backgroundColor: "var(--color-surface-container-low)",
                  padding: 8,
                  borderRadius: "var(--radius-default)",
                  border: "var(--border-technical)",
                }}
              >
                {activeProperty.description}
              </p>
            )}
          </div>

          {/* Actions Bottom Bar */}
          <div
            style={{
              padding: "10px 14px",
              borderTop: "var(--border-technical)",
              backgroundColor: "var(--color-surface-container-low)",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
            }}
          >
            <button
              onClick={() => {
                if (onNavigateToSimulator) {
                  onNavigateToSimulator(
                    selectedNeighborhood.id,
                    activeProperty.areaM2
                  );
                }
              }}
              className="btn-secondary"
              style={{ fontSize: 11, padding: "7px 6px" }}
            >
              <Sliders size={13} />
              <span>Simular Valor</span>
            </button>

            <button
              onClick={() => {
                if (onNavigateToStats) {
                  onNavigateToStats(selectedNeighborhood.id);
                }
              }}
              className="btn-primary"
              style={{ fontSize: 11, padding: "7px 6px" }}
            >
              <BarChart3 size={13} />
              <span>Ver Estatísticas</span>
            </button>
          </div>
        </aside>
      )}

      {/* Floating Toggle Button to Re-open Drawer */}
      {!drawerOpen && activeProperty && (
        <button
          onClick={() => setDrawerOpen(true)}
          style={{
            position: "absolute",
            bottom: 24,
            right: 24,
            zIndex: 25,
            backgroundColor: "var(--color-primary)",
            color: "#ffffff",
            border: "none",
            borderRadius: "var(--radius-default)",
            padding: "8px 14px",
            boxShadow: "var(--shadow-floating)",
            display: "flex",
            alignItems: "center",
            gap: 8,
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          <Building size={14} />
          <span>Ver Detalhes do Imóvel</span>
        </button>
      )}
    </div>
  );
}
