"use client";

import { useEffect, useState } from "react";
import { CRIME_LABELS, CrimeType, ViolenceNeighborhood } from "@/data/violenciaData";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5209").replace(/\/$/, "");
const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

interface ApiDistrict { id: number; nome: string; municipio: string; ano: number; homicidios: number; roubos: number; furtos: number; roubos_veiculo: number; furtos_veiculo: number; estupros: number; total_ocorrencias: number; }

export function useViolenceData(year: number, refreshKey: number) {
  const [data, setData] = useState<ViolenceNeighborhood[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [completedRequest, setCompletedRequest] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setData([]);
    setLoading(true);
    setError(null);
    setIsLive(false);

    const load = async (forceRefresh: boolean) => {
      try {
        const response = await fetch(`${API_URL}/api/seguranca/distritos-proximos?ano=${year}&atualizar=${forceRefresh}`, { signal: controller.signal });
        if (!response.ok) throw new Error(`A consulta da SSP-SP falhou (${response.status}).`);
        const payload: { ano: number; dados: ApiDistrict[] } = await response.json();
        if (payload.ano !== year) throw new Error("A SSP-SP retornou um ano diferente do selecionado.");

        const maxTotal = Math.max(...payload.dados.map((district) => district.total_ocorrencias), 1);
        const nextData: ViolenceNeighborhood[] = payload.dados.map((district) => {
          const concentration = district.total_ocorrencias / maxTotal * 100;
          return {
            id: String(district.id),
            name: `${district.nome} (${district.ano})`,
            municipality: district.municipio,
            population: null,
            totalOccurrences: district.total_ocorrencias,
            safetyIndex: Number(Math.max(0, 100 - concentration).toFixed(1)),
            level: concentration <= 33 ? "menor concentração" : concentration <= 66 ? "concentração moderada" : "maior concentração",
            indicators: [
              { type: "Homicidio" as CrimeType, count: district.homicidios, ratePerThousand: null },
              { type: "Roubo" as CrimeType, count: district.roubos, ratePerThousand: null },
              { type: "Furto" as CrimeType, count: district.furtos, ratePerThousand: null },
              { type: "RouboVeiculo" as CrimeType, count: district.roubos_veiculo, ratePerThousand: null },
              { type: "FurtoVeiculo" as CrimeType, count: district.furtos_veiculo, ratePerThousand: null },
              { type: "Estupro" as CrimeType, count: district.estupros, ratePerThousand: null },
            ],
          };
        });

        setData(nextData);
        setIsLive(true);
      } catch (requestError) {
        if (!controller.signal.aborted) setError(requestError instanceof Error ? requestError.message : "Erro ao consultar a SSP-SP.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          setCompletedRequest((current) => current + 1);
        }
      }
    };

    void load(refreshKey > 0);
    const interval = window.setInterval(() => { void load(true); }, REFRESH_INTERVAL_MS);
    return () => {
      controller.abort();
      window.clearInterval(interval);
    };
  }, [year, refreshKey]);

  return { data, loading, error, isLive, completedRequest, labels: CRIME_LABELS };
}
