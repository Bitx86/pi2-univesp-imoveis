export type CrimeType = "Homicidio" | "Roubo" | "Furto" | "RouboVeiculo" | "FurtoVeiculo" | "Estupro";

export interface ViolenceIndicator {
  type: CrimeType;
  count: number | null;
  ratePerThousand: number | null;
}

export interface ViolenceNeighborhood {
  id: string;
  name: string;
  municipality: string;
  population: number | null;
  totalOccurrences: number;
  safetyIndex: number;
  level: string;
  indicators: ViolenceIndicator[];
}

export const CRIME_LABELS: Record<CrimeType, string> = {
  Homicidio: "Homicídios",
  Roubo: "Roubos",
  Furto: "Furtos",
  RouboVeiculo: "Roubo de veículo",
  FurtoVeiculo: "Furto de veículo",
  Estupro: "Estupros",
};
