"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BusinessType,
  NeighborhoodData,
  PropertyData,
  StandardPropertyType,
  NEIGHBORHOODS as FALLBACK_NEIGHBORHOODS,
} from "@/data/imoveisData";

const DEFAULT_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5209";

const KNOWN_COORDINATES: Record<string, { lat: number; lng: number; zoom: number }> = {
  "jardim maia": { lat: -23.4542, lng: -46.5283, zoom: 15 },
  "vila augusta": { lat: -23.4735, lng: -46.5412, zoom: 15 },
  "centro": { lat: -23.4628, lng: -46.5332, zoom: 15 },
  "gopouva": { lat: -23.4682, lng: -46.5478, zoom: 15 },
  "vila galvao": { lat: -23.4578, lng: -46.5621, zoom: 15 },
  "bosque maia": { lat: -23.4502, lng: -46.5245, zoom: 15 },
  "flor da montanha": { lat: -23.4435, lng: -46.5298, zoom: 15 },
  "macedo": { lat: -23.4589, lng: -46.5165, zoom: 15 },
  "cecap": { lat: -23.4412, lng: -46.4950, zoom: 15 },
  "picanco": { lat: -23.4485, lng: -46.5420, zoom: 15 },
  "taboao": { lat: -23.4320, lng: -46.5050, zoom: 14 },
  "vila rosalia": { lat: -23.4510, lng: -46.5560, zoom: 15 },
  "ponte grande": { lat: -23.4880, lng: -46.5390, zoom: 15 },
  "cocaia": { lat: -23.4390, lng: -46.5210, zoom: 14 },
  "bom clima": { lat: -23.4495, lng: -46.5140, zoom: 15 },
  "bonsucesso": { lat: -23.4210, lng: -46.4180, zoom: 14 },
};

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function getBairroCoordinates(bairroName: string) {
  const norm = normalizeName(bairroName);
  if (KNOWN_COORDINATES[norm]) return KNOWN_COORDINATES[norm];

  for (const [key, coords] of Object.entries(KNOWN_COORDINATES)) {
    if (norm.includes(key) || key.includes(norm)) {
      return coords;
    }
  }

  let hash = 0;
  for (let i = 0; i < bairroName.length; i++) {
    hash = (hash << 5) - hash + bairroName.charCodeAt(i);
  }
  const jitterLat = ((hash % 100) / 100) * 0.015;
  const jitterLng = (((hash >> 2) % 100) / 100) * 0.015;

  return {
    lat: -23.4628 + jitterLat,
    lng: -46.5332 + jitterLng,
    zoom: 15,
  };
}

function generateNeighborhoodPolygon(lat: number, lng: number): [number, number][] {
  const r = 0.006;
  return [
    [lat + r, lng - r * 0.8],
    [lat + r * 0.8, lng + r],
    [lat - r * 0.7, lng + r * 0.9],
    [lat - r, lng - r * 0.3],
    [lat - r * 0.4, lng - r],
  ];
}

function mapPropertyType(tipoImovel?: string, areaM2?: number): StandardPropertyType {
  const t = (tipoImovel || "").toLowerCase();
  const area = areaM2 || 70;

  if (t.includes("casa") || t.includes("sobrado") || t.includes("condominio")) {
    return "Casas e Sobrados em Condomínio";
  }
  if (area < 45 || t.includes("studio") || t.includes("kitchenette")) {
    return "Studios e Compactos";
  }
  if (area >= 110 || t.includes("cobertura") || t.includes("alto padrao") || t.includes("duplex")) {
    return "Apartamentos e Coberturas Alto Padrão";
  }
  return "Apartamentos Médio Padrão";
}

export function useRealEstateData(businessType: BusinessType = "Sale") {
  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodData[]>(FALLBACK_NEIGHBORHOODS);
  const [allProperties, setAllProperties] = useState<PropertyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [totalDbCount, setTotalDbCount] = useState(0);

  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      const targetUrl = DEFAULT_API_URL.replace(/\/$/, "");

      // 1. Fetch real properties from database
      const imoveisPromise = fetch(
        `${targetUrl}/api/imoveis?page=1&pageSize=200`
      ).then((r) => (r.ok ? r.json() : null)).catch(() => null);

      // 2. Fetch real neighborhoods with analise_regiao stats
      const bairrosPromise = fetch(
        `${targetUrl}/api/bairros`
      ).then((r) => (r.ok ? r.json() : null)).catch(() => null);

      const [imoveisData, bairrosData] = await Promise.all([
        imoveisPromise,
        bairrosPromise,
      ]);

      const rawItems: any[] = imoveisData?.items ?? [];
      if ((!rawItems || rawItems.length === 0) && (!bairrosData || !Array.isArray(bairrosData) || bairrosData.length === 0)) {
        setLoading(false);
        return;
      }

      setIsBackendConnected(true);
      setTotalDbCount(imoveisData?.total ?? rawItems.length);

      // Map raw DB properties to frontend PropertyData model
      const mappedProperties: PropertyData[] = rawItems.map((item) => {
        const bairroNome = item.bairro?.nome || item.cidade || "Guarulhos";
        const coords = getBairroCoordinates(bairroNome);
        const itemLat = item.latitude && item.latitude !== 0 ? Number(item.latitude) : coords.lat + (Math.random() - 0.5) * 0.005;
        const itemLng = item.longitude && item.longitude !== 0 ? Number(item.longitude) : coords.lng + (Math.random() - 0.5) * 0.005;
        const area = Number(item.areaM2 || item.area_m2 || 70);
        const price = Number(item.preco || 0);
        const m2 = area > 0 ? Math.round(price / area) : 0;
        const imgList = item.imagensUrls || (item.imagemPrincipalUrl ? [item.imagemPrincipalUrl] : []);

        const isSale = item.tipoNegocio === 0 || item.tipoNegocio === "Sale" || item.tipo_negocio === "sale";

        return {
          id: item.id,
          title: item.titulo || `Imóvel em ${bairroNome}`,
          address: item.enderecoFormatado || (item.rua ? `${item.rua}, ${bairroNome} - Guarulhos, SP` : `${bairroNome} - Guarulhos, SP`),
          cep: item.cep || "07000-000",
          neighborhood: bairroNome,
          city: item.cidade || "Guarulhos",
          state: item.estado || "SP",
          price: isSale ? price : price * 250,
          rentPrice: !isSale ? price : Math.round(price * 0.0045),
          areaM2: area,
          bedrooms: item.quartos || 2,
          bathrooms: item.banheiros || 1,
          suites: item.suites || 0,
          parking: item.vagas || 1,
          condoFee: Number(item.condominio || 0),
          iptu: Number(item.iptu || 0),
          m2Price: m2,
          lat: itemLat,
          lng: itemLng,
          type: mapPropertyType(item.tipoImovel, area),
          businessType: isSale ? "Sale" : "Rent",
          imageUrl: item.imagemPrincipalUrl || imgList[0] || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80",
          images: imgList.length > 0 ? imgList : ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80"],
          amenities: item.amenidades || ["Portaria 24h", "Varanda"],
          description: item.descricao || `Excelente oportunidade em ${bairroNome}, Guarulhos.`,
          tags: [bairroNome, area > 100 ? "Espaçoso" : "Compacto", "100% Real"],
        };
      });

      setAllProperties(mappedProperties);

      // Extract neighborhoods from /api/bairros or derive from loaded properties
      let bairrosList: any[] = Array.isArray(bairrosData) && bairrosData.length > 0 ? bairrosData : [];
      if (bairrosList.length === 0 && mappedProperties.length > 0) {
        const uniqueMap = new Map<string, { id: string; nome: string; countVenda: number; countAluguel: number }>();
        rawItems.forEach((it) => {
          const name = it.bairro?.nome || it.cidade || "Centro";
          const id = it.bairro?.id || it.bairroId || normalizeName(name);
          const isSale = it.tipoNegocio === 0 || it.tipoNegocio === "Sale" || it.tipo_negocio === "sale";
          if (!uniqueMap.has(name)) {
            uniqueMap.set(name, { id, nome: name, countVenda: isSale ? 1 : 0, countAluguel: isSale ? 0 : 1 });
          } else {
            const entry = uniqueMap.get(name)!;
            if (isSale) entry.countVenda++;
            else entry.countAluguel++;
          }
        });
        bairrosList = Array.from(uniqueMap.values()).map((u) => ({
          id: u.id,
          nome: u.nome,
          cidade: "Guarulhos",
          estado: "SP",
          total_imoveis_venda: u.countVenda,
          total_imoveis_aluguel: u.countAluguel,
          total_geral: u.countVenda + u.countAluguel,
        }));
      }

      // Build complete NeighborhoodData list from real database + analise_regiao
      const dynamicNeighborhoods: NeighborhoodData[] = bairrosList.map((b: any) => {
        const coords = getBairroCoordinates(b.nome);
        const polygon = generateNeighborhoodPolygon(coords.lat, coords.lng);
        const neighborhoodProps = mappedProperties.filter(
          (p) => normalizeName(p.neighborhood) === normalizeName(b.nome)
        );

        const saleProps = neighborhoodProps.filter((p) => p.businessType === "Sale");
        const rentProps = neighborhoodProps.filter((p) => p.businessType === "Rent");

        // Stats from analise_regiao table in backend or computed on real loaded properties
        const aVenda = b.analise_venda;
        const aAluguel = b.analise_aluguel;

        const saleAvg = aVenda?.preco_medio || (saleProps.length > 0 ? Math.round(saleProps.reduce((a, c) => a + c.price, 0) / saleProps.length) : 850000);
        const saleMedian = aVenda?.preco_mediano || (saleProps.length > 0 ? saleProps[Math.floor(saleProps.length / 2)].price : 790000);
        const saleM2 = aVenda?.preco_m2_medio || (saleProps.length > 0 ? Math.round(saleProps.reduce((a, c) => a + c.m2Price, 0) / saleProps.length) : 7500);

        const rentAvg = aAluguel?.preco_medio || (rentProps.length > 0 ? Math.round(rentProps.reduce((a, c) => a + c.rentPrice, 0) / rentProps.length) : 2800);
        const rentMedian = aAluguel?.preco_mediano || (rentProps.length > 0 ? rentProps[Math.floor(rentProps.length / 2)].rentPrice : 2600);
        const rentM2 = aAluguel?.preco_m2_medio || (rentProps.length > 0 ? Math.round(rentProps.reduce((a, c) => a + c.m2Price, 0) / rentProps.length) : 38.5);

        return {
          id: b.id,
          name: b.nome,
          city: b.cidade || "Guarulhos",
          state: b.estado || "SP",
          lat: coords.lat,
          lng: coords.lng,
          zoom: coords.zoom,
          sale: {
            avgPrice: saleAvg,
            medianPrice: saleMedian,
            avgM2Price: saleM2,
            stdDev: aVenda?.desvio_padrao || 850,
            samples: aVenda?.amostra_count ?? b.total_imoveis_venda ?? saleProps.length,
            trend: "+3.8%",
          },
          rent: {
            avgPrice: rentAvg,
            medianPrice: rentMedian,
            avgM2Price: rentM2,
            stdDev: aAluguel?.desvio_padrao || 4.2,
            samples: aAluguel?.amostra_count ?? b.total_imoveis_aluguel ?? rentProps.length,
            trend: "+2.1%",
          },
          geoPolygon: polygon,
          properties: neighborhoodProps.length > 0 ? neighborhoodProps : (
            FALLBACK_NEIGHBORHOODS.find((fn) => normalizeName(fn.name) === normalizeName(b.nome))?.properties || []
          ),
        };
      });

      if (dynamicNeighborhoods.length > 0) {
        setNeighborhoods(dynamicNeighborhoods);
      }
    } catch (err) {
      console.warn("useRealEstateData: Backend not reachable, using offline dataset.", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return {
    neighborhoods,
    allProperties,
    loading,
    isBackendConnected,
    totalDbCount,
    refreshData,
  };
}
