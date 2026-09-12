"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, Database, MapPinned, ShieldCheck } from "lucide-react";
import { useViolenceData } from "@/hooks/useViolenceData";

const tone = (index: number) => index >= 80 ? "#38b27f" : index >= 60 ? "#e7b65a" : "#e66b5d";
const locationCache = new Map<string, { address: string; lat: number; lng: number }>();

interface ViolenceScreenProps {
  onOpenMap?: (target: { lat: number; lng: number; label: string }) => void;
}

export function ViolenceScreen({ onOpenMap }: ViolenceScreenProps) {
  const currentYear = new Date().getFullYear();
  const availableYears = Array.from({ length: currentYear - 2000 }, (_, index) => currentYear - index);
  const [selectedYear, setSelectedYear] = useState(2026);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isChangingYear, setIsChangingYear] = useState(false);
  const { data, isLive, labels, loading, error, completedRequest } = useViolenceData(selectedYear, refreshKey);
  const [onlyGuarulhos, setOnlyGuarulhos] = useState(true);
  const [selectedId, setSelectedId] = useState("");
  useEffect(() => {
    if (completedRequest > 0) setIsChangingYear(false);
  }, [completedRequest]);
  const displayedData = isChangingYear ? [] : data;
  const visibleData = useMemo(
    () => onlyGuarulhos ? displayedData.filter((item) => item.municipality === "Guarulhos") : displayedData,
    [displayedData, onlyGuarulhos]
  );
  const ranked = useMemo(() => [...visibleData].sort((a, b) => b.safetyIndex - a.safetyIndex), [visibleData]);
  const selected = visibleData.find((item) => item.id === selectedId) ?? ranked[0];
  const [location, setLocation] = useState<{ address: string; lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    if (!selected) return;
    const controller = new AbortController();
    const lookup = async () => {
      const cachedLocation = locationCache.get(selected.id);
      if (cachedLocation) {
        setLocation(cachedLocation);
        setLocationLoading(false);
        return;
      }
      setLocation(null);
      setLocationLoading(true);
      try {
        const districtName = selected.name.replace(/\s*\(\d{4}\)$/, "").trim();
        const queries = [
          `${districtName}, ${selected.municipality}, Sao Paulo, Brasil`,
          `Delegacia ${districtName}, ${selected.municipality}, Sao Paulo, Brasil`,
          `Distrito Policial ${districtName}, ${selected.municipality}, Sao Paulo, Brasil`,
        ];
        for (const rawQuery of queries) {
          const query = encodeURIComponent(rawQuery);
          const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${query}`, {
            signal: controller.signal,
            headers: { Accept: "application/json" },
          });
          if (!response.ok) continue;
          const results: Array<{ display_name: string; lat: string; lon: string }> = await response.json();
          const result = results[0];
          if (!result) continue;
          const nextLocation = { address: result.display_name, lat: Number(result.lat), lng: Number(result.lon) };
          locationCache.set(selected.id, nextLocation);
          setLocation(nextLocation);
          break;
        }
      } catch {
        if (!controller.signal.aborted) setLocation(null);
      } finally {
        if (!controller.signal.aborted) setLocationLoading(false);
      }
    };
    void lookup();
    return () => controller.abort();
  }, [selected]);

  return (
    <div className="screen-fade-in" style={{ maxWidth: 1320, width: "100%", margin: "0 auto", padding: "32px var(--margin-desktop) 64px" }}>
      <header style={{ borderBottom: "var(--border-technical)", paddingBottom: 24, marginBottom: 24 }}>
        <div style={{ color: "#e66b5d", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.09em", textTransform: "uppercase", display: "flex", gap: 8, alignItems: "center" }}>
          <Activity size={14} /> Observatório territorial • SSP-SP
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 24, alignItems: "end", flexWrap: "wrap", marginTop: 6 }}>
          <div>
            <h1 className="font-display" style={{ fontSize: 34 }}>Mapa da Violência</h1>
            <p className="font-body" style={{ color: "var(--color-on-surface-variant)", maxWidth: 680, marginTop: 8 }}>Compare distritos policiais de Guarulhos e do entorno imediato usando ocorrências oficiais da SSP-SP. A classificação mede concentração de registros, não risco individual.</p>
          </div>
          <span className="badge-tech" style={{ color: isLive ? "var(--color-success)" : "var(--color-on-surface-variant)" }}><Database size={12} /> {isLive ? "SSP-SP • DADOS REAIS" : "AGUARDANDO DADOS SSP-SP"}</span>
        </div>
        <label htmlFor="violence-year" className="font-label" style={{ display: "inline-flex", alignItems: "center", gap: 9, marginTop: 18, color: "var(--color-on-surface-variant)" }}>
          Ano da consulta
          <select id="violence-year" value={selectedYear} onChange={(event) => { setSelectedYear(Number(event.target.value)); setSelectedId(""); setIsChangingYear(true); setRefreshKey((current) => current + 1); }} style={{ padding: "7px 30px 7px 9px", background: "var(--color-surface-container)", border: "var(--border-technical)", borderRadius: "var(--radius-inputs)", color: "var(--color-on-surface)", fontFamily: "var(--font-mono)" }}>
            {availableYears.map((year) => <option key={year} value={year}>{year}</option>)}
          </select>
        </label>
      </header>

      {displayedData.length === 0 ? (
        <section className="surface-card" style={{ padding: "40px 24px", textAlign: "center" }}>
          <Database size={28} style={{ color: "var(--color-outline)", marginBottom: 12 }} />
          <h2 className="font-headline" style={{ fontSize: 22 }}>{loading || isChangingYear ? "Aguardando carregamento..." : error ? "Erro na consulta" : "Nenhum dado disponível"}</h2>
          <p style={{ color: "var(--color-on-surface-variant)", maxWidth: 580, margin: "8px auto 0", fontSize: 13 }}>{loading || isChangingYear ? `Consultando a SSP-SP para ${selectedYear}.` : error ?? `A SSP-SP não retornou dados para ${selectedYear}.`}</p>
        </section>
      ) : (
        <>
          <section className="violence-summary-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12, marginBottom: 16 }}>
            <div className="surface-card"><div className="font-label" style={{ color: "var(--color-on-surface-variant)" }}>Distritos exibidos</div><strong className="font-display" style={{ display: "block", fontSize: 28, marginTop: 8 }}>{ranked.length}</strong><span style={{ fontSize: 12, color: "var(--color-on-surface-variant)" }}>{onlyGuarulhos ? "somente Guarulhos" : "Guarulhos e entorno"}</span></div>
            <div className="surface-card"><div className="font-label" style={{ color: "var(--color-on-surface-variant)" }}>Menor concentração</div><strong className="font-display" style={{ display: "block", fontSize: 28, marginTop: 8, color: tone(ranked[ranked.length - 1]?.safetyIndex ?? 0) }}>{ranked[ranked.length - 1]?.safetyIndex ?? "--"}<small style={{ fontFamily: "var(--font-sans)", fontSize: 14 }}> / 100</small></strong><span style={{ fontSize: 12, color: "var(--color-on-surface-variant)" }}>{ranked[ranked.length - 1]?.name ?? "Sem dados"}</span></div>
            <div className="surface-card"><div className="font-label" style={{ color: "var(--color-on-surface-variant)" }}>Fonte</div><strong className="font-display" style={{ display: "block", fontSize: 28, marginTop: 8 }}>SSP-SP</strong><span style={{ fontSize: 12, color: "var(--color-on-surface-variant)" }}>ocorrências do ano consultado</span></div>
          </section>

          <div className="surface-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
              <input type="checkbox" checked={onlyGuarulhos} onChange={(event) => setOnlyGuarulhos(event.target.checked)} style={{ width: 17, height: 17, accentColor: "var(--color-primary)" }} />
              Mostrar apenas distritos de Guarulhos
            </label>
            <span style={{ color: "var(--color-on-surface-variant)", fontSize: 11 }}>A SSP-SP não fornece coordenadas dos distritos nesta consulta</span>
          </div>

          <div className="violence-content-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.1fr) minmax(320px, .9fr)", gap: 16 }}>
            <section className="surface-card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "18px 20px", borderBottom: "var(--border-technical)", display: "flex", gap: 10, alignItems: "center" }}><MapPinned size={17} style={{ color: "#e66b5d" }} /><strong>Quadro comparativo por distrito policial</strong></div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead><tr style={{ background: "var(--color-surface-container-low)" }}>{["Distrito policial", "Município", "Índice relativo", "Ocorrências", "Leitura"].map((title) => <th key={title} style={{ padding: "11px 16px", textAlign: "left", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--color-on-surface-variant)", textTransform: "uppercase" }}>{title}</th>)}</tr></thead>
                  <tbody>{ranked.map((item) => <tr key={item.id} onClick={() => setSelectedId(item.id)} style={{ borderTop: "var(--border-technical)", cursor: "pointer", background: selected?.id === item.id ? "var(--color-surface-container-high)" : "transparent" }}><td style={{ padding: 16, fontWeight: 600 }}>{item.name}</td><td style={{ padding: 16, color: "var(--color-on-surface-variant)" }}>{item.municipality}</td><td style={{ padding: 16, color: tone(item.safetyIndex), fontFamily: "var(--font-mono)", fontWeight: 700 }}>{item.safetyIndex}</td><td style={{ padding: 16, fontFamily: "var(--font-mono)" }}>{item.totalOccurrences}</td><td style={{ padding: 16 }}><span style={{ color: tone(item.safetyIndex), textTransform: "capitalize" }}>{item.level}</span></td></tr>)}</tbody>
                </table>
              </div>
            </section>

            {selected && <section key={selected.id} className="surface-card" style={{ borderTop: `3px solid ${tone(selected.safetyIndex)}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "start" }}><div><div className="font-label" style={{ color: "var(--color-on-surface-variant)" }}>Leitura do distrito</div><h2 className="font-display" style={{ fontSize: 27, marginTop: 5 }}>{selected.name}</h2><div style={{ color: "var(--color-on-surface-variant)", fontSize: 11, marginTop: 4 }}>{selected.municipality}</div></div><div style={{ textAlign: "right" }}><strong style={{ color: tone(selected.safetyIndex), fontFamily: "var(--font-mono)", fontSize: 31 }}>{selected.safetyIndex}</strong><div style={{ fontSize: 10, color: "var(--color-on-surface-variant)" }}>ÍNDICE RELATIVO / 100</div></div></div>
              <div style={{ display: "flex", gap: 16, margin: "22px 0", color: "var(--color-on-surface-variant)", fontSize: 12 }}><span><AlertTriangle size={14} style={{ verticalAlign: "-3px", marginRight: 5 }} />{selected.totalOccurrences} registros conhecidos</span></div>
              <div style={{ border: "var(--border-technical)", padding: 10, marginBottom: 14, fontSize: 11, color: "var(--color-on-surface-variant)" }}><div className="font-label" style={{ marginBottom: 5 }}>Endereço do distrito</div>{locationLoading ? "Consultando localização..." : location ? <><div style={{ lineHeight: 1.4 }}>{location.address}</div><div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 7 }}><button type="button" className="btn-ghost" style={{ padding: "4px 0", color: "var(--color-primary)" }} onClick={() => onOpenMap?.({ lat: location.lat, lng: location.lng, label: selected.name })} disabled={!onOpenMap}>Ver ponto no mapa</button><a className="btn-ghost" style={{ padding: "4px 0", color: "var(--color-primary)" }} href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selected.name.replace(/\s*\(\d{4}\)$/, "")}, ${selected.municipality}, SP`)}`} target="_blank" rel="noreferrer">Abrir no Google Maps</a></div></> : <><div>A SSP-SP não fornece endereço no retorno deste distrito.</div><a className="btn-ghost" style={{ display: "inline-flex", marginTop: 7, padding: "4px 0", color: "var(--color-primary)" }} href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selected.name.replace(/\s*\(\d{4}\)$/, "")}, ${selected.municipality}, SP`)}`} target="_blank" rel="noreferrer">Buscar este distrito no Google Maps</a></>}</div>
              <div className="violence-histogram" aria-label="Ocorrências por tipo de crime" style={{ display: "flex", alignItems: "end", justifyContent: "space-around", gap: 8, height: 160, padding: "12px 4px 0", borderTop: "var(--border-technical)", borderBottom: "var(--border-technical)" }}>{selected.indicators.map((indicator) => { const max = Math.max(...selected.indicators.map((entry) => entry.count ?? 0), 1); const height = (indicator.count ?? 0) / max * 100; return <div key={`${selected.id}-${indicator.type}`} style={{ flex: 1, height: "100%", display: "flex", flexDirection: "column", justifyContent: "end", alignItems: "center", gap: 5 }}><span style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}>{indicator.count ?? "--"}</span><div style={{ width: "100%", maxWidth: 28, height: `${height}%`, minHeight: indicator.count ? 4 : 0, background: tone(selected.safetyIndex) }} title={labels[indicator.type]} /><span style={{ color: "var(--color-on-surface-variant)", fontSize: 9, textAlign: "center", lineHeight: 1.1 }}>{labels[indicator.type].replace(" de veículo", "").replace("s", "")}</span></div>; })}</div>
              <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>{selected.indicators.map((indicator) => <div key={`${selected.id}-detail-${indicator.type}`} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}><span>{labels[indicator.type]}</span><span style={{ fontFamily: "var(--font-mono)", color: "var(--color-on-surface-variant)" }}>{indicator.count ?? "--"} ocorrências</span></div>)}</div>
              <div style={{ marginTop: 24, paddingTop: 14, borderTop: "var(--border-technical)", color: "var(--color-on-surface-variant)", fontSize: 11, display: "flex", gap: 7, alignItems: "start" }}><ShieldCheck size={14} style={{ color: tone(selected.safetyIndex), flexShrink: 0 }} />Dados oficiais SSP-SP. O índice é relativo ao conjunto filtrado e não representa taxa populacional ou risco individual.</div>
            </section>}
          </div>
        </>
      )}
      <p style={{ marginTop: 18, fontSize: 11, color: "var(--color-outline)", fontFamily: "var(--font-mono)" }}>Fonte: Secretaria da Segurança Pública do Estado de São Paulo (SSP-SP) • Ano consultado: {selectedYear} • Distrito policial não equivale a bairro • Sem coordenadas oficiais de distrito na fonte consultada.</p>
    </div>
  );
}
