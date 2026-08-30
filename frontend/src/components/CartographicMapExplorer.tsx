"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Compass,
  Layers,
  MapPin,
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Filter,
  BarChart2,
  TrendingUp,
  Info,
  CheckCircle2,
  ArrowUpRight,
  Sparkles,
  DollarSign,
  Grid,
  ExternalLink,
  Navigation,
  Copy,
  Check,
  Building,
  Bed,
  Bath,
  Car,
  Maximize,
  ShieldCheck,
  Eye,
  ChevronLeft,
  ChevronRight,
  Camera,
  Image as ImageIcon,
  CheckCircle
} from "lucide-react";

export type MapTileProvider = "osm-streets" | "esri-satellite" | "osm-dark";
export type BusinessType = "Sale" | "Rent";

export interface PropertyData {
  id: string;
  title: string;
  address: string;
  cep: string;
  neighborhood: string;
  city: string;
  state: string;
  price: number;
  rentPrice: number;
  areaM2: number;
  bedrooms: number;
  bathrooms: number;
  suites?: number;
  parking: number;
  condoFee?: number;
  iptu?: number;
  m2Price: number;
  lat: number;
  lng: number;
  type: "Apartamento" | "Cobertura" | "Studio" | "Casa" | "Garden" | "Comercial";
  businessType?: BusinessType;
  isDeal?: boolean;
  dealDiscountPercent?: number;
  imageUrl?: string;
  images: string[];
  amenities?: string[];
  description?: string;
}

export interface NeighborhoodData {
  id: string;
  name: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  zoom: number;
  sale: {
    avgPrice: number;
    medianPrice: number;
    avgM2Price: number;
    stdDev: number;
    samples: number;
    trend: string;
  };
  rent: {
    avgPrice: number;
    medianPrice: number;
    avgM2Price: number;
    stdDev: number;
    samples: number;
    trend: string;
  };
  geoPolygon: [number, number][];
  properties: PropertyData[];
  // Backwards compatibility properties
  path?: string;
  center?: { x: number; y: number };
}

export const NEIGHBORHOODS: NeighborhoodData[] = [
  {
    id: "jardim-maia",
    name: "Jardim Maia",
    city: "Guarulhos",
    state: "SP",
    lat: -23.4542,
    lng: -46.5283,
    zoom: 15,
    sale: {
      avgPrice: 1280000,
      medianPrice: 1180000,
      avgM2Price: 10450,
      stdDev: 1120,
      samples: 310,
      trend: "+4.2%",
    },
    rent: {
      avgPrice: 4800,
      medianPrice: 4400,
      avgM2Price: 48.5,
      stdDev: 6.2,
      samples: 105,
      trend: "+2.6%",
    },
    geoPolygon: [
      [-23.4475, -46.5330],
      [-23.4490, -46.5220],
      [-23.4580, -46.5245],
      [-23.4605, -46.5315],
      [-23.4540, -46.5365],
    ],
    center: { x: 380, y: 220 },
    path: "M 310,160 L 460,150 L 480,260 L 360,280 L 290,210 Z",
    properties: [
      {
        id: "jma-1",
        title: "Apartamento Alto Padrão c/ Vista Bosque Maia",
        address: "Av. Paulo Faccini, 1850 - Jardim Maia",
        cep: "07115-000",
        neighborhood: "Jardim Maia",
        city: "Guarulhos",
        state: "SP",
        price: 1350000,
        rentPrice: 5200,
        areaM2: 128,
        bedrooms: 3,
        suites: 2,
        bathrooms: 3,
        parking: 2,
        condoFee: 950,
        iptu: 280,
        m2Price: 10546,
        lat: -23.4532,
        lng: -46.5276,
        type: "Apartamento",
        isDeal: true,
        dealDiscountPercent: 8,
        imageUrl: "https://resizedimgs.vivareal.com/fit-in/800x600/vr.images.sp/e7d3cb8f500f42f4b95f316643e2b235.webp",
        images: [
          "https://resizedimgs.vivareal.com/fit-in/800x600/vr.images.sp/e7d3cb8f500f42f4b95f316643e2b235.webp",
          "https://resizedimgs.vivareal.com/fit-in/800x600/vr.images.sp/8b42fc069a4d4ea0b5ebefcf74cf8f2b.webp",
          "https://resizedimgs.vivareal.com/fit-in/800x600/vr.images.sp/9a58b2cd6f9e42e78d91a92e105e6b7f.webp",
          "https://resizedimgs.zapimoveis.com.br/fit-in/800x600/vr.images.sp/1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d.webp"
        ],
        amenities: ["Varanda Gourmet Envidraçada", "Piscina Aquecida", "Academia Equipada", "2 Vagas Cobertas", "Portaria Blindada 24h"],
        description: "Living integrado com varanda gourmet envidraçada, vista panorâmica permanente para a copa das árvores do Bosque Maia. Acabamento em porcelanato nobre e marcenaria planejada.",
      },
      {
        id: "jma-2",
        title: "Cobertura Duplex próx. Parque Shopping Maia",
        address: "Rua Darcy Vargas, 140 - Jardim Maia",
        cep: "07115-030",
        neighborhood: "Jardim Maia",
        city: "Guarulhos",
        state: "SP",
        price: 2450000,
        rentPrice: 9800,
        areaM2: 215,
        bedrooms: 4,
        suites: 3,
        bathrooms: 4,
        parking: 3,
        condoFee: 1650,
        iptu: 490,
        m2Price: 11395,
        lat: -23.4518,
        lng: -46.5295,
        type: "Cobertura",
        imageUrl: "https://resizedimgs.vivareal.com/fit-in/800x600/vr.images.sp/8b42fc069a4d4ea0b5ebefcf74cf8f2b.webp",
        images: [
          "https://resizedimgs.vivareal.com/fit-in/800x600/vr.images.sp/8b42fc069a4d4ea0b5ebefcf74cf8f2b.webp",
          "https://resizedimgs.zapimoveis.com.br/fit-in/800x600/vr.images.sp/1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d.webp",
          "https://resizedimgs.vivareal.com/fit-in/800x600/vr.images.sp/e7d3cb8f500f42f4b95f316643e2b235.webp"
        ],
        amenities: ["Piscina Privativa", "Deck Panorâmico", "Churrasqueira a Carvão", "Ar-Condicionado Inverter", "Elevador com Biometria"],
        description: "Cobertura exclusiva com piscina privativa aquecida, deck em madeira nobre e churrasqueira a carvão no piso superior.",
      },
      {
        id: "jma-3",
        title: "Studio Design Conceito Aberto Av. Paulo Faccini",
        address: "Av. Salgado Filho, 1450 - Jardim Maia",
        cep: "07115-000",
        neighborhood: "Jardim Maia",
        city: "Guarulhos",
        state: "SP",
        price: 460000,
        rentPrice: 2400,
        areaM2: 42,
        bedrooms: 1,
        suites: 1,
        bathrooms: 1,
        parking: 1,
        condoFee: 410,
        iptu: 110,
        m2Price: 10950,
        lat: -23.4561,
        lng: -46.5262,
        type: "Studio",
        isDeal: true,
        dealDiscountPercent: 12,
        imageUrl: "https://resizedimgs.vivareal.com/fit-in/800x600/vr.images.sp/9a58b2cd6f9e42e78d91a92e105e6b7f.webp",
        images: [
          "https://resizedimgs.vivareal.com/fit-in/800x600/vr.images.sp/9a58b2cd6f9e42e78d91a92e105e6b7f.webp",
          "https://resizedimgs.zapimoveis.com.br/fit-in/800x600/vr.images.sp/1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d.webp"
        ],
        amenities: ["Mobiliado e Decorado", "Coworking no Prédio", "Lavanderia OMO Compartilhada", "Rooftop Lounge"],
        description: "Ideal para investidores com rentabilidade acima de 0,65% ao mês no aluguel e localização com altíssima demanda gastronômica e corporativa.",
      },
    ],
  },
  {
    id: "vila-augusta",
    name: "Vila Augusta",
    city: "Guarulhos",
    state: "SP",
    lat: -23.4795,
    lng: -46.5412,
    zoom: 15,
    sale: {
      avgPrice: 780000,
      medianPrice: 720000,
      avgM2Price: 8920,
      stdDev: 890,
      samples: 425,
      trend: "+3.1%",
    },
    rent: {
      avgPrice: 3100,
      medianPrice: 2850,
      avgM2Price: 39.5,
      stdDev: 5.4,
      samples: 160,
      trend: "+2.2%",
    },
    geoPolygon: [
      [-23.4720, -46.5480],
      [-23.4740, -46.5340],
      [-23.4865, -46.5360],
      [-23.4870, -46.5460],
      [-23.4800, -46.5500],
    ],
    center: { x: 300, y: 390 },
    path: "M 220,330 L 370,320 L 390,460 L 250,480 L 190,400 Z",
    properties: [
      {
        id: "vau-1",
        title: "Apartamento Varanda Gourmet próx. Shopping Internacional",
        address: "Rua Cônego Valadão, 842 - Vila Augusta",
        cep: "07040-000",
        neighborhood: "Vila Augusta",
        city: "Guarulhos",
        state: "SP",
        price: 720000,
        rentPrice: 2900,
        areaM2: 82,
        bedrooms: 3,
        suites: 1,
        bathrooms: 2,
        parking: 2,
        condoFee: 620,
        iptu: 170,
        m2Price: 8780,
        lat: -23.4782,
        lng: -46.5398,
        type: "Apartamento",
        isDeal: true,
        dealDiscountPercent: 6,
        imageUrl: "https://resizedimgs.vivareal.com/fit-in/800x600/vr.images.sp/4e17f9b8c0a34493b80b7e28a55c91d4.webp",
        images: [
          "https://resizedimgs.vivareal.com/fit-in/800x600/vr.images.sp/4e17f9b8c0a34493b80b7e28a55c91d4.webp",
          "https://resizedimgs.vivareal.com/fit-in/800x600/vr.images.sp/29fdc387f3b841a1820579e00eb4d764.webp",
          "https://resizedimgs.zapimoveis.com.br/fit-in/800x600/vr.images.sp/c347b3ee28e64a69894e77dddafa40a7.webp"
        ],
        amenities: ["Próx. Rodovia Dutra", "Quadra Poliesportiva", "Piscina Climatizada", "Salão de Festas"],
        description: "Localização estratégica a 3 minutos da Rodovia Presidente Dutra e Marginal Tietê. Condomínio clube completo com quadra poliesportiva e piscina climatizada.",
      },
      {
        id: "vau-2",
        title: "Garden com Quintal Privativo Rua Cônego Valadão",
        address: "Rua Santa Izabel, 310 - Vila Augusta",
        cep: "07023-022",
        neighborhood: "Vila Augusta",
        city: "Guarulhos",
        state: "SP",
        price: 890000,
        rentPrice: 3600,
        areaM2: 105,
        bedrooms: 3,
        suites: 1,
        bathrooms: 2,
        parking: 2,
        condoFee: 780,
        iptu: 210,
        m2Price: 8476,
        lat: -23.4810,
        lng: -46.5425,
        type: "Garden",
        imageUrl: "https://resizedimgs.vivareal.com/fit-in/800x600/vr.images.sp/29fdc387f3b841a1820579e00eb4d764.webp",
        images: [
          "https://resizedimgs.vivareal.com/fit-in/800x600/vr.images.sp/29fdc387f3b841a1820579e00eb4d764.webp",
          "https://resizedimgs.zapimoveis.com.br/fit-in/800x600/vr.images.sp/c347b3ee28e64a69894e77dddafa40a7.webp"
        ],
        amenities: ["Quintal Privativo", "Espaço Gourmet", "Churrasqueira Externa", "Infraestrutura p/ Hidro"],
        description: "Espaço gourmet privativo com churrasqueira externa e infraestrutura pronta para banheira de hidromassagem.",
      },
    ],
  },
  {
    id: "centro",
    name: "Centro",
    city: "Guarulhos",
    state: "SP",
    lat: -23.4628,
    lng: -46.5333,
    zoom: 15,
    sale: {
      avgPrice: 520000,
      medianPrice: 480000,
      avgM2Price: 7150,
      stdDev: 780,
      samples: 580,
      trend: "+1.5%",
    },
    rent: {
      avgPrice: 2200,
      medianPrice: 1980,
      avgM2Price: 34.0,
      stdDev: 4.8,
      samples: 240,
      trend: "+1.2%",
    },
    geoPolygon: [
      [-23.4580, -46.5370],
      [-23.4590, -46.5260],
      [-23.4710, -46.5290],
      [-23.4700, -46.5410],
    ],
    center: { x: 420, y: 310 },
    path: "M 360,260 L 500,240 L 520,370 L 380,390 L 350,330 Z",
    properties: [
      {
        id: "cen-1",
        title: "Apartamento Reformado próx. Calçadão Dom Pedro",
        address: "Rua Felício Marcondes, 245 - Centro",
        cep: "07010-030",
        neighborhood: "Centro",
        city: "Guarulhos",
        state: "SP",
        price: 460000,
        rentPrice: 1950,
        areaM2: 66,
        bedrooms: 2,
        bathrooms: 1,
        parking: 1,
        condoFee: 460,
        iptu: 95,
        m2Price: 6969,
        lat: -23.4635,
        lng: -46.5320,
        type: "Apartamento",
        isDeal: true,
        dealDiscountPercent: 9,
        imageUrl: "https://resizedimgs.vivareal.com/fit-in/800x600/vr.images.sp/d99f2a48721c43148529e846175653b6.webp",
        images: [
          "https://resizedimgs.vivareal.com/fit-in/800x600/vr.images.sp/d99f2a48721c43148529e846175653b6.webp",
          "https://resizedimgs.zapimoveis.com.br/fit-in/800x600/vr.images.sp/5f72cf2697844005b81a1795c65f9038.webp"
        ],
        amenities: ["Hidráulica e Elétrica Novas", "Piso de Madeira Nobre", "Armários Embutidos", "Baixo Condomínio"],
        description: "Inteiramente reformado com fiação e hidráulica novas, piso em taco de madeira restaurado e armários embutidos.",
      },
    ],
  },
  {
    id: "gopouva",
    name: "Gopouva",
    city: "Guarulhos",
    state: "SP",
    lat: -23.4705,
    lng: -46.5458,
    zoom: 15,
    sale: {
      avgPrice: 620000,
      medianPrice: 580000,
      avgM2Price: 7800,
      stdDev: 820,
      samples: 340,
      trend: "+2.0%",
    },
    rent: {
      avgPrice: 2500,
      medianPrice: 2300,
      avgM2Price: 36.2,
      stdDev: 5.1,
      samples: 120,
      trend: "+1.7%",
    },
    geoPolygon: [
      [-23.4650, -46.5540],
      [-23.4640, -46.5410],
      [-23.4760, -46.5440],
      [-23.4750, -46.5560],
    ],
    center: { x: 230, y: 310 },
    path: "M 160,250 L 300,240 L 310,360 L 190,380 L 140,300 Z",
    properties: [
      {
        id: "gop-1",
        title: "Apartamento Completo Av. Emílio Ribas",
        address: "Av. Emílio Ribas, 980 - Gopouva",
        cep: "07051-000",
        neighborhood: "Gopouva",
        city: "Guarulhos",
        state: "SP",
        price: 570000,
        rentPrice: 2350,
        areaM2: 74,
        bedrooms: 2,
        suites: 1,
        bathrooms: 2,
        parking: 1,
        condoFee: 510,
        iptu: 130,
        m2Price: 7702,
        lat: -23.4695,
        lng: -46.5442,
        type: "Apartamento",
        isDeal: true,
        dealDiscountPercent: 5,
        imageUrl: "https://resizedimgs.vivareal.com/fit-in/800x600/vr.images.sp/0e1b123456789abcdef0123456789abc.webp",
        images: [
          "https://resizedimgs.vivareal.com/fit-in/800x600/vr.images.sp/0e1b123456789abcdef0123456789abc.webp",
          "https://resizedimgs.zapimoveis.com.br/fit-in/800x600/vr.images.sp/a1b2c3d4e5f60718293a4b5c6d7e8f90.webp"
        ],
        amenities: ["Face Norte", "Gerador de Energia", "Portaria 24h", "Sacada com Vista"],
        description: "Excelente ventilação cruzada, face norte, sol da manhã na sala e quartos, condomínio com gerador elétrico e portaria 24h blindada.",
      },
    ],
  },
  {
    id: "vila-galvao",
    name: "Vila Galvão",
    city: "Guarulhos",
    state: "SP",
    lat: -23.4562,
    lng: -46.5684,
    zoom: 15,
    sale: {
      avgPrice: 710000,
      medianPrice: 660000,
      avgM2Price: 8300,
      stdDev: 910,
      samples: 290,
      trend: "+2.8%",
    },
    rent: {
      avgPrice: 2800,
      medianPrice: 2600,
      avgM2Price: 38.0,
      stdDev: 5.0,
      samples: 95,
      trend: "+1.9%",
    },
    geoPolygon: [
      [-23.4480, -46.5750],
      [-23.4490, -46.5610],
      [-23.4630, -46.5630],
      [-23.4620, -46.5780],
    ],
    center: { x: 140, y: 220 },
    path: "M 80,150 L 220,140 L 230,270 L 110,290 L 60,210 Z",
    properties: [
      {
        id: "vgl-1",
        title: "Apartamento com Vista para o Lago dos Patos",
        address: "Rua Francisco Gonzaga Vasconcellos, 110 - Vila Galvão",
        cep: "07071-040",
        neighborhood: "Vila Galvão",
        city: "Guarulhos",
        state: "SP",
        price: 850000,
        rentPrice: 3400,
        areaM2: 112,
        bedrooms: 3,
        suites: 1,
        bathrooms: 2,
        parking: 2,
        condoFee: 790,
        iptu: 220,
        m2Price: 7589,
        lat: -23.4550,
        lng: -46.5670,
        type: "Apartamento",
        isDeal: true,
        dealDiscountPercent: 10,
        imageUrl: "https://resizedimgs.vivareal.com/fit-in/800x600/vr.images.sp/7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e.webp",
        images: [
          "https://resizedimgs.vivareal.com/fit-in/800x600/vr.images.sp/7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e.webp",
          "https://resizedimgs.zapimoveis.com.br/fit-in/800x600/vr.images.sp/3f4e5d6c7b8a90123456789abcdef012.webp"
        ],
        amenities: ["Vista Lago dos Patos", "Varanda Envidraçada", "2 Vagas", "Salão de Jogos"],
        description: "Localizado em frente ao Lago dos Patos, parque tradicional de lazer e esportes ao ar livre. Varanda gourmet envidraçada.",
      },
    ],
  },
  {
    id: "flor-da-montanha",
    name: "Flor da Montanha",
    city: "Guarulhos",
    state: "SP",
    lat: -23.4475,
    lng: -46.5360,
    zoom: 15,
    sale: {
      avgPrice: 1150000,
      medianPrice: 1080000,
      avgM2Price: 9800,
      stdDev: 980,
      samples: 210,
      trend: "+4.9%",
    },
    rent: {
      avgPrice: 4200,
      medianPrice: 3900,
      avgM2Price: 44.0,
      stdDev: 5.5,
      samples: 80,
      trend: "+3.2%",
    },
    geoPolygon: [
      [-23.4420, -46.5410],
      [-23.4430, -46.5300],
      [-23.4520, -46.5320],
      [-23.4510, -46.5430],
    ],
    center: { x: 320, y: 130 },
    path: "M 250,70 L 390,60 L 410,180 L 280,200 L 220,130 Z",
    properties: [
      {
        id: "flm-1",
        title: "Apartamento Alto Padrão em Frente ao Parque Shopping Maia",
        address: "Av. Bartolomeu de Carlos, 901 - Flor da Montanha",
        cep: "07097-420",
        neighborhood: "Flor da Montanha",
        city: "Guarulhos",
        state: "SP",
        price: 1150000,
        rentPrice: 4600,
        areaM2: 108,
        bedrooms: 3,
        suites: 1,
        bathrooms: 2,
        parking: 2,
        condoFee: 890,
        iptu: 260,
        m2Price: 10648,
        lat: -23.4468,
        lng: -46.5352,
        type: "Apartamento",
        isDeal: true,
        dealDiscountPercent: 7,
        imageUrl: "https://resizedimgs.vivareal.com/fit-in/800x600/vr.images.sp/b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7.webp",
        images: [
          "https://resizedimgs.vivareal.com/fit-in/800x600/vr.images.sp/b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7.webp",
          "https://resizedimgs.zapimoveis.com.br/fit-in/800x600/vr.images.sp/9876543210fedcba9876543210fedcba.webp"
        ],
        amenities: ["Em frente ao Shopping Maia", "Condomínio Resort", "Piscina com Raia", "Cinema Privativo"],
        description: "Empreendimento com infraestrutura resort, churrasqueira integrada ao living, fechamento em vidro e persianas automatizadas.",
      },
    ],
  },
  {
    id: "macedo",
    name: "Macedo",
    city: "Guarulhos",
    state: "SP",
    lat: -23.4510,
    lng: -46.5180,
    zoom: 15,
    sale: {
      avgPrice: 650000,
      medianPrice: 610000,
      avgM2Price: 7950,
      stdDev: 760,
      samples: 280,
      trend: "+2.4%",
    },
    rent: {
      avgPrice: 2650,
      medianPrice: 2450,
      avgM2Price: 35.8,
      stdDev: 4.6,
      samples: 110,
      trend: "+1.8%",
    },
    geoPolygon: [
      [-23.4450, -46.5230],
      [-23.4460, -46.5110],
      [-23.4570, -46.5130],
      [-23.4560, -46.5250],
    ],
    center: { x: 480, y: 180 },
    path: "M 420,110 L 560,100 L 580,220 L 450,240 L 390,170 Z",
    properties: [
      {
        id: "mac-1",
        title: "Apartamento Moderno Av. Monteiro Lobato",
        address: "Av. Monteiro Lobato, 1620 - Macedo",
        cep: "07112-000",
        neighborhood: "Macedo",
        city: "Guarulhos",
        state: "SP",
        price: 610000,
        rentPrice: 2500,
        areaM2: 76,
        bedrooms: 3,
        suites: 1,
        bathrooms: 2,
        parking: 1,
        condoFee: 570,
        iptu: 145,
        m2Price: 8026,
        lat: -23.4502,
        lng: -46.5165,
        type: "Apartamento",
        imageUrl: "https://resizedimgs.vivareal.com/fit-in/800x600/vr.images.sp/6e5d4c3b2a109876543210fedcba9876.webp",
        images: [
          "https://resizedimgs.vivareal.com/fit-in/800x600/vr.images.sp/6e5d4c3b2a109876543210fedcba9876.webp",
          "https://resizedimgs.zapimoveis.com.br/fit-in/800x600/vr.images.sp/1234567890abcdef1234567890abcdef.webp"
        ],
        amenities: ["Próx. Faculdades", "Piscina", "Salão Gourmet", "Portaria 24h"],
        description: "Localizado próximo à Prefeitura de Guarulhos e Faculdades Integradas, excelente perfil para moradia ou renda por locação.",
      },
    ],
  },
  {
    id: "cecap",
    name: "Cecap",
    city: "Guarulhos",
    state: "SP",
    lat: -23.4385,
    lng: -46.4950,
    zoom: 15,
    sale: {
      avgPrice: 390000,
      medianPrice: 370000,
      avgM2Price: 5850,
      stdDev: 480,
      samples: 410,
      trend: "+3.8%",
    },
    rent: {
      avgPrice: 1750,
      medianPrice: 1650,
      avgM2Price: 28.5,
      stdDev: 3.2,
      samples: 180,
      trend: "+2.9%",
    },
    geoPolygon: [
      [-23.4300, -46.5050],
      [-23.4310, -46.4850],
      [-23.4470, -46.4870],
      [-23.4460, -46.5070],
    ],
    center: { x: 620, y: 150 },
    path: "M 550,80 L 690,70 L 710,200 L 580,220 L 520,140 Z",
    properties: [
      {
        id: "cec-1",
        title: "Apartamento Próximo à Estação CPTM Cecap e Aeroporto",
        address: "Av. Monteiro Lobato, 3400 - Parque Cecap",
        cep: "07190-000",
        neighborhood: "Cecap",
        city: "Guarulhos",
        state: "SP",
        price: 380000,
        rentPrice: 1650,
        areaM2: 64,
        bedrooms: 2,
        bathrooms: 1,
        parking: 1,
        condoFee: 390,
        iptu: 75,
        m2Price: 5937,
        lat: -23.4372,
        lng: -46.4935,
        type: "Apartamento",
        isDeal: true,
        dealDiscountPercent: 6,
        imageUrl: "https://resizedimgs.zapimoveis.com.br/fit-in/800x600/vr.images.sp/1234567890abcdef1234567890abcdef.webp",
        images: [
          "https://resizedimgs.zapimoveis.com.br/fit-in/800x600/vr.images.sp/1234567890abcdef1234567890abcdef.webp"
        ],
        amenities: ["Próx. Linha 13-Jade CPTM", "Fácil Acesso ao Aeroporto", "Condomínio Fechado"],
        description: "Excelente conexão com a Linha 13-Jade da CPTM (Estação Aeroporto-Guarulhos / Cecap) e Hospital Geral de Guarulhos.",
      },
    ],
  },
  {
    id: "bonsucesso",
    name: "Bonsucesso",
    city: "Guarulhos",
    state: "SP",
    lat: -23.4125,
    lng: -46.4182,
    zoom: 14,
    sale: {
      avgPrice: 325000,
      medianPrice: 310000,
      avgM2Price: 5400,
      stdDev: 420,
      samples: 380,
      trend: "+4.1%",
    },
    rent: {
      avgPrice: 1500,
      medianPrice: 1400,
      avgM2Price: 26.0,
      stdDev: 2.8,
      samples: 140,
      trend: "+3.0%",
    },
    geoPolygon: [
      [-23.4000, -46.4300],
      [-23.4010, -46.4050],
      [-23.4240, -46.4080],
      [-23.4230, -46.4330],
    ],
    center: { x: 740, y: 100 },
    path: "M 670,40 L 800,30 L 820,150 L 700,170 L 640,90 Z",
    properties: [
      {
        id: "bon-1",
        title: "Apartamento Condomínio Fechado Próx. Shopping Bonsucesso",
        address: "Estrada Pres. Juscelino Kubitschek de Oliveira, 5308 - Bonsucesso",
        cep: "07252-000",
        neighborhood: "Bonsucesso",
        city: "Guarulhos",
        state: "SP",
        price: 320000,
        rentPrice: 1400,
        areaM2: 56,
        bedrooms: 2,
        bathrooms: 1,
        parking: 1,
        condoFee: 320,
        iptu: 60,
        m2Price: 5714,
        lat: -23.4110,
        lng: -46.4170,
        type: "Apartamento",
        imageUrl: "https://resizedimgs.vivareal.com/fit-in/800x600/vr.images.sp/6e5d4c3b2a109876543210fedcba9876.webp",
        images: [
          "https://resizedimgs.vivareal.com/fit-in/800x600/vr.images.sp/6e5d4c3b2a109876543210fedcba9876.webp"
        ],
        amenities: ["Próx. Shopping Bonsucesso", "Playground", "Churrasqueira", "Vaga de Garagem"],
        description: "Próximo à Rodovia Presidente Dutra e Polo Industrial de Bonsucesso, ótimo custo-benefício para primeiro imóvel.",
      },
    ],
  },
];

interface CartographicMapExplorerProps {
  onSelectForDashboard?: (bairroId: string, tipo: BusinessType) => void;
}

export function CartographicMapExplorer({ onSelectForDashboard }: CartographicMapExplorerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);
  const polygonsGroupRef = useRef<any>(null);

  const [selectedNeighborhood, setSelectedNeighborhood] = useState<NeighborhoodData>(NEIGHBORHOODS[0]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("jma-1");
  const [tileProvider, setTileProvider] = useState<MapTileProvider>("osm-streets");
  const [businessType, setBusinessType] = useState<BusinessType>("Sale");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [isSearchingGeocode, setIsSearchingGeocode] = useState(false);
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState<number>(0);
  const [isCardExpanded, setIsCardExpanded] = useState<boolean>(true);
  const [mapReady, setMapReady] = useState(false);
  const [dbProperties, setDbProperties] = useState<PropertyData[]>([]);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  // Fetch real ingested properties from backend database
  useEffect(() => {
    async function loadProperties() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5209";
        const res = await fetch(`${apiUrl}/api/imoveis?pageSize=100`);
        if (res.ok) {
          const data = await res.json();
          if (data?.items && Array.isArray(data.items) && data.items.length > 0) {
            const mapped: PropertyData[] = data.items.map((item: any) => {
              const isRent = item.tipoNegocio === 1 || item.tipoNegocio === "Rent";
              const rawPrice = item.preco || 0;
              const salePrice = isRent ? Math.round(rawPrice * 250) : rawPrice;
              const rentPrice = isRent ? rawPrice : Math.round(rawPrice * 0.004);
              const m2Price = item.areaM2 ? Math.round(rawPrice / item.areaM2) : 8000;

              return {
                id: item.id || item.externalId,
                title: item.titulo || (isRent ? "Imóvel para Alugar" : "Imóvel à Venda"),
                address: item.enderecoFormatado || item.rua || "Guarulhos",
                cep: item.cep || "07115-000",
                neighborhood: item.bairro?.nome || item.cidade || "Guarulhos",
                city: item.bairro?.cidade || item.cidade || "Guarulhos",
                state: item.bairro?.estado || item.estado || "SP",
                businessType: isRent ? "Rent" : "Sale",
                price: salePrice,
                rentPrice: rentPrice,
                areaM2: item.areaM2 || 70,
                bedrooms: item.quartos || 2,
                bathrooms: item.banheiros || 1,
                suites: item.suites || 0,
                parking: item.vagas || 1,
                condoFee: item.condominio || 0,
                iptu: item.iptu || 0,
                m2Price: m2Price,
                lat: item.latitude || -23.4542,
                lng: item.longitude || -46.5283,
                type: (item.tipoImovel as any) || "Apartamento",
                imageUrl: item.imagemPrincipalUrl || (item.imagensUrls && item.imagensUrls.length > 0 ? item.imagensUrls[0] : ""),
                images: item.imagensUrls && item.imagensUrls.length > 0 ? item.imagensUrls : (item.imagemPrincipalUrl ? [item.imagemPrincipalUrl] : []),
                amenities: item.amenidades || [],
                description: item.descricao || "",
              };
            });
            setDbProperties(mapped);
          }
        }
      } catch {
        // Fallback gracefully
      }
    }
    loadProperties();
  }, []);

  // Flatten all properties from all neighborhoods or use live database items
  const allProperties = useMemo(() => {
    if (dbProperties.length > 0) {
      return dbProperties;
    }
    return NEIGHBORHOODS.flatMap((n) => n.properties);
  }, [dbProperties]);

  // Filtered properties based on current filters (and active businessType)
  const displayedProperties = useMemo(() => {
    return allProperties.filter((p) => {
      if (p.businessType && p.businessType !== businessType) {
        return false;
      }
      if (propertyTypeFilter !== "all" && p.type !== propertyTypeFilter) {
        return false;
      }
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchAddress = p.address.toLowerCase().includes(q);
        const matchNeigh = p.neighborhood.toLowerCase().includes(q);
        const matchCep = p.cep.replace("-", "").includes(q.replace("-", ""));
        return matchTitle || matchAddress || matchNeigh || matchCep;
      }
      return true;
    });
  }, [allProperties, businessType, propertyTypeFilter, searchQuery]);

  const selectedProperty = useMemo(() => {
    return allProperties.find((p) => p.id === selectedPropertyId) || displayedProperties[0] || allProperties[0];
  }, [allProperties, displayedProperties, selectedPropertyId]);

  // Extract all available photos for current selected property (excluding 404s)
  const propertyImages = useMemo(() => {
    if (!selectedProperty) return [];
    const rawList = (selectedProperty.images && selectedProperty.images.length > 0)
      ? selectedProperty.images
      : (selectedProperty.imageUrl ? [selectedProperty.imageUrl] : []);
    return rawList.filter((url) => !failedImages.has(url));
  }, [selectedProperty, failedImages]);

  const nextPhoto = () => {
    if (propertyImages.length > 0) {
      setActivePhotoIdx((prev) => (prev + 1) % propertyImages.length);
    }
  };

  const prevPhoto = () => {
    if (propertyImages.length > 0) {
      setActivePhotoIdx((prev) => (prev - 1 + propertyImages.length) % propertyImages.length);
    }
  };

  // Reset photo index when property changes
  useEffect(() => {
    setActivePhotoIdx(0);
  }, [selectedPropertyId]);

  const currentStats = businessType === "Sale" ? selectedNeighborhood.sale : selectedNeighborhood.rent;

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: val >= 1000 ? 0 : 2,
    }).format(val);
  };

  const formatPricePill = (price: number, rent: number, isSale: boolean) => {
    if (isSale) {
      if (price >= 1000000) {
        return `R$ ${(price / 1000000).toFixed(2).replace(".", ",")} M`;
      }
      return `R$ ${Math.round(price / 1000)} mil`;
    } else {
      return `R$ ${rent.toLocaleString("pt-BR")}/mês`;
    }
  };

  // Initialize Leaflet Map
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (typeof window === "undefined" || !mapContainerRef.current) return;
      const L = await import("leaflet");

      if (!isMounted) return;

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [selectedNeighborhood.lat, selectedNeighborhood.lng],
          zoom: selectedNeighborhood.zoom,
          zoomControl: false,
          attributionControl: false,
        });

        // Add custom zoom control at bottom-right
        L.control.zoom({ position: "bottomright" }).addTo(map);

        mapInstanceRef.current = map;
        markersGroupRef.current = L.layerGroup().addTo(map);
        polygonsGroupRef.current = L.layerGroup().addTo(map);
        setMapReady(true);
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer
  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady) return;
    const map = mapInstanceRef.current;

    let tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    let tileOptions: any = {
      maxZoom: 19,
      subdomains: "abc",
    };

    if (tileProvider === "esri-satellite") {
      // Esri World Imagery — free satellite tiles, no API key required
      tileUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
      tileOptions = { maxZoom: 20 };
    } else if (tileProvider === "osm-dark") {
      // OpenStreetMap tiles with a dark CSS filter (no API key required)
      tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
      tileOptions = { maxZoom: 19, subdomains: "abc" };
    }

    import("leaflet").then((L) => {
      map.eachLayer((layer: any) => {
        if (layer instanceof L.TileLayer) {
          map.removeLayer(layer);
        }
      });

      const tileLayer = L.tileLayer(tileUrl, tileOptions);
      tileLayer.addTo(map);

      // Fallback: if tiles fail to load, automatically switch to OpenStreetMap.
      tileLayer.on("tileerror", () => {
        if (tileProvider !== "osm-streets") {
          setTileProvider("osm-streets");
        }
      });
    });
  }, [tileProvider, mapReady]);

  // Update Neighborhood Polygons and Markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    import("leaflet").then((L) => {
      const map = mapInstanceRef.current;
      const polyGroup = polygonsGroupRef.current;
      const markGroup = markersGroupRef.current;

      if (!polyGroup || !markGroup) return;

      polyGroup.clearLayers();
      markGroup.clearLayers();

      // Draw Property Price Markers (Polygons removed for a clean Google Maps aesthetic)
      displayedProperties.forEach((prop) => {
        const isSelected = prop.id === selectedPropertyId;
        const pillText = formatPricePill(prop.price, prop.rentPrice, businessType === "Sale");

        const markerHtml = `
          <div class="price-pill-marker">
            <div class="price-pill-bubble ${isSelected ? "active" : ""} ${prop.isDeal && !isSelected ? "deal" : ""}">
              ${prop.isDeal ? '<span class="deal-badge">★ TOP</span>' : ""}
              <span>${pillText}</span>
            </div>
          </div>
        `;

        const customIcon = L.divIcon({
          className: "custom-price-pin",
          html: markerHtml,
          iconSize: [110, 36],
          iconAnchor: [55, 36],
        });

        const marker = L.marker([prop.lat, prop.lng], { icon: customIcon, zIndexOffset: isSelected ? 1000 : 100 });

        marker.on("click", () => {
          setSelectedPropertyId(prop.id);
          setIsCardExpanded(true);
          const parentNeigh = NEIGHBORHOODS.find((n) => n.name.toLowerCase() === prop.neighborhood.toLowerCase());
          if (parentNeigh && parentNeigh.id !== selectedNeighborhood.id) {
            setSelectedNeighborhood(parentNeigh);
          }
          map.flyTo([prop.lat, prop.lng], Math.max(map.getZoom(), 16), { duration: 0.8 });
        });

        marker.addTo(markGroup);
      });
    });
  }, [displayedProperties, selectedNeighborhood, selectedPropertyId, businessType, tileProvider]);

  // Handle Geocoding Search
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // 1. Local Neighborhoods
    const foundNeigh = NEIGHBORHOODS.find((n) =>
      n.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (foundNeigh) {
      setSelectedNeighborhood(foundNeigh);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([foundNeigh.lat, foundNeigh.lng], foundNeigh.zoom, { duration: 1.2 });
      }
      setSearchFeedback(`Navegando para o bairro ${foundNeigh.name}`);
      setTimeout(() => setSearchFeedback(null), 3000);
      return;
    }

    // 2. Local Properties
    const foundProp = allProperties.find(
      (p) =>
        p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.cep.includes(searchQuery)
    );

    if (foundProp) {
      setSelectedPropertyId(foundProp.id);
      setIsCardExpanded(true);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([foundProp.lat, foundProp.lng], 17, { duration: 1.2 });
      }
      setSearchFeedback(`Localizado: ${foundProp.address}`);
      setTimeout(() => setSearchFeedback(null), 3000);
      return;
    }

    // 3. Fallback: OSM Nominatim Geocoding
    try {
      setIsSearchingGeocode(true);
      setSearchFeedback("Buscando endereço exato no mapa...");
      const cleanQuery = `${searchQuery}, Guarulhos, SP, Brasil`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanQuery)}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const item = data[0];
        const lat = parseFloat(item.lat);
        const lon = parseFloat(item.lon);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lon], 17, { duration: 1.4 });
        }
        setSearchFeedback(`Endereço encontrado: ${item.display_name.split(",")[0]}`);
      } else {
        setSearchFeedback("Endereço não localizado com precisão em Guarulhos.");
      }
    } catch (err) {
      setSearchFeedback("Erro na geocodificação.");
    } finally {
      setIsSearchingGeocode(false);
      setTimeout(() => setSearchFeedback(null), 4000);
    }
  };

  const copyAddressToClipboard = () => {
    if (selectedProperty?.address) {
      navigator.clipboard.writeText(`${selectedProperty.address}, ${selectedProperty.city} - ${selectedProperty.state}, CEP: ${selectedProperty.cep}`);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2500);
    }
  };

  const fullAddressText = selectedProperty
    ? `${selectedProperty.address}, ${selectedProperty.neighborhood}, ${selectedProperty.city} - ${selectedProperty.state}, CEP ${selectedProperty.cep}, Brasil`
    : "";

  const googleMapsUrl = fullAddressText
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddressText)}`
    : "#";

  const googleStreetViewUrl = fullAddressText
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddressText)}`
    : "#";

  const priceDeltaPercent = selectedProperty
    ? Math.round(((selectedProperty.m2Price - selectedNeighborhood.sale.avgM2Price) / selectedNeighborhood.sale.avgM2Price) * 100)
    : 0;

  return (
    <section
      id="mapa-explorer"
      style={{
        maxWidth: "100%",
        width: "100%",
        padding: "0 24px",
        margin: "0 auto",
        marginBottom: "var(--spacing-80)",
        position: "relative",
        zIndex: 20,
      }}
    >
      {/* Section Editorial Header */}
      <div style={{ textAlign: "center", marginBottom: "var(--spacing-24)" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "var(--color-amber-compass)",
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 8,
          }}
        >
          <Compass size={14} />
          <span>PAINEL GEOESPACIAL • GOOGLE MAPS & FOTOS REAIS DOS APARTAMENTOS</span>
        </div>
        <h2 className="serif-heading-lg" style={{ marginBottom: 8 }}>
          Navegue pelas micro-regiões e fotos reais em Guarulhos.
        </h2>
        <p className="sans-body" style={{ maxWidth: 740, margin: "0 auto", color: "var(--color-parchment)", fontSize: 14 }}>
          Mapa interativo georreferenciado. Clique nos pins de preço no mapa para navegar pelo carrossel de fotos reais de cada apartamento, conferir o endereço exato e abrir a localização no Google Maps e Street View.
        </p>
      </div>

      {/* Main Google Maps Style Canvas Viewport */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "1280px",
          margin: "0 auto",
          height: "780px",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(100, 117, 75, 0.3)",
          backgroundColor: "#e5e3df",
        }}
      >
        {/* Real Leaflet Map Background Canvas */}
        <div
          ref={mapContainerRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 1,
            filter: tileProvider === "osm-dark"
              ? "invert(1) hue-rotate(180deg) brightness(0.85)"
              : "none",
          }}
        />

        {/* Floating Top Header Island: Search & Filter HUD (Google Maps Style) */}
        <div
          style={{
            position: "absolute",
            top: 16,
            left: 16,
            right: 16,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            pointerEvents: "none",
          }}
        >
          {/* Left Search Bar Container */}
          <div
            style={{
              pointerEvents: "auto",
              display: "flex",
              alignItems: "center",
              gap: 8,
              backgroundColor: "rgba(255, 255, 255, 0.96)",
              backdropFilter: "blur(12px)",
              padding: "6px 12px",
              borderRadius: "28px",
              boxShadow: "0 8px 30px rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(0,0,0,0.06)",
              minWidth: "340px",
              maxWidth: "520px",
              flex: 1,
            }}
          >
            <Search size={18} color="#314218" style={{ flexShrink: 0, marginLeft: 4 }} />
            <form onSubmit={handleSearchSubmit} style={{ flex: 1, display: "flex", alignItems: "center" }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por endereço, rua, CEP ou bairro..."
                style={{
                  width: "100%",
                  border: "none",
                  outline: "none",
                  backgroundColor: "transparent",
                  fontSize: 13,
                  fontFamily: "var(--font-sans)",
                  color: "#222222",
                  padding: "6px 8px",
                }}
              />
              <button
                type="submit"
                disabled={isSearchingGeocode}
                style={{
                  backgroundColor: "#314218",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "20px",
                  padding: "6px 14px",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s ease",
                }}
              >
                {isSearchingGeocode ? "..." : "Localizar"}
              </button>
            </form>
          </div>

          {/* Right Floating Map Layer & Filter Switchers */}
          <div
            style={{
              pointerEvents: "auto",
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            {/* Sale / Rent Toggle */}
            <div
              style={{
                display: "flex",
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
                padding: "3px",
                borderRadius: "20px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
              }}
            >
              <button
                type="button"
                onClick={() => setBusinessType("Sale")}
                style={{
                  padding: "5px 12px",
                  fontSize: 12,
                  fontWeight: 700,
                  border: "none",
                  borderRadius: "16px",
                  cursor: "pointer",
                  backgroundColor: businessType === "Sale" ? "#314218" : "transparent",
                  color: businessType === "Sale" ? "#ffffff" : "#444444",
                }}
              >
                Venda
              </button>
              <button
                type="button"
                onClick={() => setBusinessType("Rent")}
                style={{
                  padding: "5px 12px",
                  fontSize: 12,
                  fontWeight: 700,
                  border: "none",
                  borderRadius: "16px",
                  cursor: "pointer",
                  backgroundColor: businessType === "Rent" ? "#314218" : "transparent",
                  color: businessType === "Rent" ? "#ffffff" : "#444444",
                }}
              >
                Aluguel
              </button>
            </div>

            {/* Tile Layer Switcher */}
            <div
              style={{
                display: "flex",
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
                padding: "3px",
                borderRadius: "20px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
              }}
            >
              <button
                type="button"
                onClick={() => setTileProvider("osm-streets")}
                style={{
                  padding: "5px 10px",
                  fontSize: 12,
                  fontWeight: 600,
                  border: "none",
                  borderRadius: "16px",
                  cursor: "pointer",
                  backgroundColor: tileProvider === "osm-streets" ? "#dc8c46" : "transparent",
                  color: tileProvider === "osm-streets" ? "#ffffff" : "#333333",
                }}
              >
                🗺️ Ruas
              </button>
              <button
                type="button"
                onClick={() => setTileProvider("esri-satellite")}
                style={{
                  padding: "5px 10px",
                  fontSize: 12,
                  fontWeight: 600,
                  border: "none",
                  borderRadius: "16px",
                  cursor: "pointer",
                  backgroundColor: tileProvider === "esri-satellite" ? "#dc8c46" : "transparent",
                  color: tileProvider === "esri-satellite" ? "#ffffff" : "#333333",
                }}
              >
                🛰️ Satélite
              </button>
              <button
                type="button"
                onClick={() => setTileProvider("osm-dark")}
                style={{
                  padding: "5px 10px",
                  fontSize: 12,
                  fontWeight: 600,
                  border: "none",
                  borderRadius: "16px",
                  cursor: "pointer",
                  backgroundColor: tileProvider === "osm-dark" ? "#dc8c46" : "transparent",
                  color: tileProvider === "osm-dark" ? "#ffffff" : "#333333",
                }}
              >
                🌙 Noite
              </button>
            </div>
          </div>
        </div>

        {/* Floating Neighborhood Filter Chips (Clean information badges, no geometric lines on map) */}
        <div
          style={{
            position: "absolute",
            top: 72,
            left: 16,
            right: 410,
            zIndex: 999,
            display: "flex",
            alignItems: "center",
            gap: 6,
            overflowX: "auto",
            padding: "4px 2px",
            scrollbarWidth: "none",
            pointerEvents: "auto",
          }}
        >
          {NEIGHBORHOODS.map((neigh) => {
            const isSelected = neigh.id === selectedNeighborhood.id;
            return (
              <button
                key={neigh.id}
                type="button"
                onClick={() => {
                  setSelectedNeighborhood(neigh);
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.flyTo([neigh.lat, neigh.lng], neigh.zoom, { duration: 1.2 });
                  }
                }}
                style={{
                  backgroundColor: isSelected ? "#314218" : "rgba(255, 255, 255, 0.94)",
                  color: isSelected ? "#ffffff" : "#222222",
                  border: isSelected ? "1px solid #314218" : "1px solid rgba(0,0,0,0.1)",
                  padding: "5px 12px",
                  borderRadius: "18px",
                  fontSize: "12px",
                  fontWeight: isSelected ? 700 : 500,
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                  backdropFilter: "blur(8px)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "all 0.15s ease",
                  flexShrink: 0,
                }}
              >
                <span>{neigh.name}</span>
                <span
                  style={{
                    fontSize: "10px",
                    opacity: isSelected ? 0.9 : 0.6,
                    color: isSelected ? "#dc8c46" : "#666666",
                    fontWeight: 600,
                  }}
                >
                  R$ {businessType === "Sale" ? neigh.sale.avgM2Price : neigh.rent.avgM2Price}/m²
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Feedback Floating Toast */}
        {searchFeedback && (
          <div
            style={{
              position: "absolute",
              top: 76,
              left: 24,
              zIndex: 1000,
              backgroundColor: "rgba(24, 33, 12, 0.95)",
              backdropFilter: "blur(8px)",
              color: "#ffffff",
              padding: "6px 14px",
              borderRadius: "16px",
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
              border: "1px solid rgba(220, 140, 70, 0.5)",
            }}
          >
            <Sparkles size={14} color="#dc8c46" />
            <span>{searchFeedback}</span>
          </div>
        )}

        {/* Floating Property Inspection Card (Google Maps / Airbnb Style) */}
        {selectedProperty && (
          <div
            style={{
              position: "absolute",
              top: isCardExpanded ? 76 : "auto",
              bottom: isCardExpanded ? 24 : 24,
              right: 16,
              width: "380px",
              maxHeight: "calc(100% - 100px)",
              zIndex: 1000,
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              boxShadow: "0 15px 40px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(0,0,0,0.06)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {/* Card Header & Photo Carousel */}
            <div style={{ position: "relative", width: "100%", height: "210px", backgroundColor: "#000000" }}>
              {propertyImages.length > 0 ? (
                <img
                  src={propertyImages[activePhotoIdx]}
                  alt={selectedProperty.title}
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "opacity 0.2s ease",
                  }}
                  onError={() => {
                    const currentUrl = propertyImages[activePhotoIdx];
                    if (currentUrl) {
                      setFailedImages((prev) => new Set(prev).add(currentUrl));
                      if (activePhotoIdx >= propertyImages.length - 1) {
                        setActivePhotoIdx(0);
                      }
                    }
                  }}
                />
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#aaaaaa" }}>
                  <ImageIcon size={32} />
                </div>
              )}

              {/* Photo Carousel Navigation Controls */}
              {propertyImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      prevPhoto();
                    }}
                    style={{
                      position: "absolute",
                      left: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      backgroundColor: "rgba(0, 0, 0, 0.55)",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "50%",
                      width: 32,
                      height: 32,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      backdropFilter: "blur(4px)",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      nextPhoto();
                    }}
                    style={{
                      position: "absolute",
                      right: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      backgroundColor: "rgba(0, 0, 0, 0.55)",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "50%",
                      width: 32,
                      height: 32,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      backdropFilter: "blur(4px)",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}

              {/* Top Badges */}
              <div
                style={{
                  position: "absolute",
                  top: 10,
                  left: 10,
                  display: "flex",
                  gap: 6,
                  zIndex: 2,
                }}
              >
                <span
                  style={{
                    backgroundColor: "rgba(24, 33, 12, 0.9)",
                    color: "#ffffff",
                    padding: "3px 8px",
                    borderRadius: 6,
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  {selectedProperty.type}
                </span>
                {selectedProperty.isDeal && (
                  <span
                    style={{
                      backgroundColor: "#dc8c46",
                      color: "#ffffff",
                      padding: "3px 8px",
                      borderRadius: 6,
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: "uppercase",
                    }}
                  >
                    ★ Oportunidade
                  </span>
                )}
              </div>

              {/* Photo Count Counter */}
              {propertyImages.length > 0 && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 10,
                    right: 10,
                    backgroundColor: "rgba(0, 0, 0, 0.65)",
                    color: "#ffffff",
                    padding: "3px 8px",
                    borderRadius: 12,
                    fontSize: 10,
                    fontFamily: "var(--font-mono)",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <Camera size={11} />
                  <span>{activePhotoIdx + 1} / {propertyImages.length} Fotos Reais</span>
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {propertyImages.length > 1 && (
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  padding: "8px 14px",
                  backgroundColor: "#f4f5f0",
                  overflowX: "auto",
                  borderBottom: "1px solid #e2e6dc",
                }}
              >
                {propertyImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActivePhotoIdx(idx)}
                    style={{
                      width: 44,
                      height: 32,
                      borderRadius: 4,
                      overflow: "hidden",
                      border: activePhotoIdx === idx ? "2px solid #dc8c46" : "1px solid #d0d4cb",
                      cursor: "pointer",
                      padding: 0,
                      flexShrink: 0,
                      opacity: activePhotoIdx === idx ? 1 : 0.65,
                      transition: "all 0.15s ease",
                    }}
                  >
                    <img
                      src={imgUrl}
                      alt=""
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={() => {
                        setFailedImages((prev) => new Set(prev).add(imgUrl));
                      }}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Card Body Specs & Exact Address */}
            <div style={{ padding: "16px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Title & Valuation Price */}
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1c280e", lineHeight: 1.3, marginBottom: 4 }}>
                  {selectedProperty.title}
                </h3>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontSize: 22, fontWeight: 800, color: "#314218" }}>
                    {formatPrice(businessType === "Sale" ? selectedProperty.price : selectedProperty.rentPrice)}
                  </span>
                  {businessType === "Rent" && <span style={{ fontSize: 12, color: "#666666" }}>/mês</span>}
                </div>
                <div style={{ fontSize: 12, color: "#777777", marginTop: 2 }}>
                  <span>Preço/m²: </span>
                  <strong style={{ color: "#1c280e" }}>R$ {selectedProperty.m2Price.toLocaleString("pt-BR")}/m²</strong>
                  <span
                    style={{
                      marginLeft: 8,
                      color: priceDeltaPercent <= 0 ? "#2e7d32" : "#c62828",
                      fontWeight: 600,
                    }}
                  >
                    ({priceDeltaPercent <= 0 ? `${priceDeltaPercent}% vs média` : `+${priceDeltaPercent}% vs média`})
                  </span>
                </div>
              </div>

              {/* Exact Address Box with Google Map Pin */}
              <div
                style={{
                  backgroundColor: "#f7f8f4",
                  border: "1px solid #e1e5dc",
                  borderRadius: 8,
                  padding: "10px 12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <MapPin size={16} color="#dc8c46" style={{ marginTop: 2, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#888888", textTransform: "uppercase" }}>
                        Endereço Exato
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#1c280e", marginTop: 2 }}>
                        {selectedProperty.address}
                      </div>
                      <div style={{ fontSize: 11, color: "#666666", marginTop: 2 }}>
                        {selectedProperty.neighborhood}, {selectedProperty.city} - {selectedProperty.state} • CEP {selectedProperty.cep}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={copyAddressToClipboard}
                    title="Copiar endereço"
                    style={{
                      background: "#ffffff",
                      border: "1px solid #d8dcd2",
                      borderRadius: 6,
                      padding: 6,
                      cursor: "pointer",
                      color: copiedAddress ? "#2e7d32" : "#555555",
                      flexShrink: 0,
                    }}
                  >
                    {copiedAddress ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              {/* Quick Spec Metrics Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, textAlign: "center" }}>
                <div style={{ backgroundColor: "#f9faf7", padding: "8px 2px", borderRadius: 6, border: "1px solid #edf0e9" }}>
                  <Maximize size={14} color="#64754b" style={{ margin: "0 auto 3px" }} />
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#1c280e" }}>{selectedProperty.areaM2} m²</div>
                  <div style={{ fontSize: 10, color: "#777777" }}>Área</div>
                </div>
                <div style={{ backgroundColor: "#f9faf7", padding: "8px 2px", borderRadius: 6, border: "1px solid #edf0e9" }}>
                  <Bed size={14} color="#64754b" style={{ margin: "0 auto 3px" }} />
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#1c280e" }}>{selectedProperty.bedrooms}</div>
                  <div style={{ fontSize: 10, color: "#777777" }}>Quartos</div>
                </div>
                <div style={{ backgroundColor: "#f9faf7", padding: "8px 2px", borderRadius: 6, border: "1px solid #edf0e9" }}>
                  <Bath size={14} color="#64754b" style={{ margin: "0 auto 3px" }} />
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#1c280e" }}>{selectedProperty.bathrooms}</div>
                  <div style={{ fontSize: 10, color: "#777777" }}>Banh.</div>
                </div>
                <div style={{ backgroundColor: "#f9faf7", padding: "8px 2px", borderRadius: 6, border: "1px solid #edf0e9" }}>
                  <Car size={14} color="#64754b" style={{ margin: "0 auto 3px" }} />
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#1c280e" }}>{selectedProperty.parking}</div>
                  <div style={{ fontSize: 10, color: "#777777" }}>Vagas</div>
                </div>
              </div>

              {/* Amenities Tags */}
              {selectedProperty.amenities && selectedProperty.amenities.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {selectedProperty.amenities.map((amenity, i) => (
                    <span
                      key={i}
                      style={{
                        backgroundColor: "#edf2e6",
                        color: "#2c3e17",
                        padding: "3px 8px",
                        borderRadius: 12,
                        fontSize: 10,
                        fontWeight: 600,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <CheckCircle size={10} color="#64754b" />
                      <span>{amenity}</span>
                    </span>
                  ))}
                </div>
              )}

              {/* Action Buttons: Google Maps, Street View & Dashboard */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: "auto" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-amber"
                    style={{
                      padding: "8px 10px",
                      fontSize: 12,
                      borderRadius: 6,
                      textAlign: "center",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    <ExternalLink size={13} />
                    <span>Google Maps</span>
                  </a>
                  <a
                    href={googleStreetViewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: "8px 10px",
                      fontSize: 12,
                      fontWeight: 600,
                      borderRadius: 6,
                      textAlign: "center",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      backgroundColor: "#314218",
                      color: "#ffffff",
                      textDecoration: "none",
                    }}
                  >
                    <Eye size={13} />
                    <span>Street View</span>
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectForDashboard?.(selectedNeighborhood.id, businessType)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    fontSize: 12,
                    fontWeight: 600,
                    borderRadius: 6,
                    backgroundColor: "#18210c",
                    color: "#dc8c46",
                    border: "1px solid #64754b",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    transition: "all 0.15s ease",
                  }}
                >
                  <BarChart2 size={14} />
                  <span>Ver Métricas Estatísticas Neon</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Left GPS Coordinates HUD */}
        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: 16,
            zIndex: 1000,
            backgroundColor: "rgba(24, 33, 12, 0.9)",
            backdropFilter: "blur(6px)",
            color: "#e8ece2",
            padding: "6px 12px",
            borderRadius: "16px",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            display: "flex",
            alignItems: "center",
            gap: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
            border: "1px solid rgba(100, 117, 75, 0.4)",
          }}
        >
          <span>📍 {selectedNeighborhood.name} ({displayedProperties.length} imóveis)</span>
          <span>•</span>
          <span>LAT: {selectedNeighborhood.lat.toFixed(4)} LNG: {selectedNeighborhood.lng.toFixed(4)}</span>
        </div>
      </div>
    </section>
  );
}
