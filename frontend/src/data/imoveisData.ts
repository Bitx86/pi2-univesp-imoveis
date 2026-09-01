export type MapTileProvider = "google-streets" | "google-satellite";
export type BusinessType = "Sale" | "Rent";

export type StandardPropertyType =
  | "Studios e Compactos"
  | "Apartamentos Médio Padrão"
  | "Apartamentos e Coberturas Alto Padrão"
  | "Casas e Sobrados em Condomínio";

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
  type: StandardPropertyType;
  tags?: string[];
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
        type: "Apartamentos e Coberturas Alto Padrão",
        tags: ["Vista Panorâmica", "Varanda Gourmet", "Andar Alto"],
        isDeal: true,
        dealDiscountPercent: 8,
        imageUrl: "https://resizedimgs.vivareal.com/fit-in/800x600/vr.images.sp/e7d3cb8f500f42f4b95f316643e2b235.webp",
        images: [
          "https://resizedimgs.vivareal.com/fit-in/800x600/vr.images.sp/e7d3cb8f500f42f4b95f316643e2b235.webp",
          "https://resizedimgs.vivareal.com/fit-in/800x600/vr.images.sp/8b42fc069a4d4ea0b5ebefcf74cf8f2b.webp",
          "https://resizedimgs.vivareal.com/fit-in/800x600/vr.images.sp/9a58b2cd6f9e42e78d91a92e105e6b7f.webp",
        ],
        amenities: ["Varanda Gourmet Envidraçada", "Piscina Aquecida", "Academia Equipada", "2 Vagas Cobertas", "Portaria Blindada 24h"],
        description: "Living integrado com varanda gourmet envidraçada, vista panorâmica permanente para o Bosque Maia. Acabamento em porcelanato nobre e marcenaria planejada.",
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
        type: "Apartamentos e Coberturas Alto Padrão",
        tags: ["Cobertura", "Piscina Privativa", "Deck Panorâmico"],
        imageUrl: "https://resizedimgs.vivareal.com/fit-in/800x600/vr.images.sp/8b42fc069a4d4ea0b5ebefcf74cf8f2b.webp",
        images: [
          "https://resizedimgs.vivareal.com/fit-in/800x600/vr.images.sp/8b42fc069a4d4ea0b5ebefcf74cf8f2b.webp",
          "https://resizedimgs.vivareal.com/fit-in/800x600/vr.images.sp/e7d3cb8f500f42f4b95f316643e2b235.webp",
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
        type: "Studios e Compactos",
        tags: ["Mobiliado", "Coworking", "Rooftop"],
        isDeal: true,
        dealDiscountPercent: 12,
        imageUrl: "https://resizedimgs.vivareal.com/fit-in/800x600/vr.images.sp/9a58b2cd6f9e42e78d91a92e105e6b7f.webp",
        images: [
          "https://resizedimgs.vivareal.com/fit-in/800x600/vr.images.sp/9a58b2cd6f9e42e78d91a92e105e6b7f.webp",
          "https://resizedimgs.vivareal.com/fit-in/800x600/vr.images.sp/e7d3cb8f500f42f4b95f316643e2b235.webp",
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
        type: "Apartamentos Médio Padrão",
        tags: ["Varanda Gourmet", "Próx. Dutra", "Condomínio Clube"],
        isDeal: true,
        dealDiscountPercent: 6,
        imageUrl: "https://resizedimgs.vivareal.com/fit-in/800x600/vr.images.sp/4e17f9b8c0a34493b80b7e28a55c91d4.webp",
        images: [
          "https://resizedimgs.vivareal.com/fit-in/800x600/vr.images.sp/4e17f9b8c0a34493b80b7e28a55c91d4.webp",
          "https://resizedimgs.vivareal.com/fit-in/800x600/vr.images.sp/29fdc387f3b841a1820579e00eb4d764.webp",
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
        type: "Apartamentos e Coberturas Alto Padrão",
        tags: ["Garden", "Quintal Privativo", "Espaço Gourmet"],
        imageUrl: "https://resizedimgs.vivareal.com/fit-in/800x600/vr.images.sp/29fdc387f3b841a1820579e00eb4d764.webp",
        images: [
          "https://resizedimgs.vivareal.com/fit-in/800x600/vr.images.sp/29fdc387f3b841a1820579e00eb4d764.webp",
          "https://resizedimgs.vivareal.com/fit-in/800x600/vr.images.sp/4e17f9b8c0a34493b80b7e28a55c91d4.webp",
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
        type: "Apartamentos Médio Padrão",
        tags: ["Reformado", "Centro Comercial", "Baixo Condomínio"],
        isDeal: true,
        dealDiscountPercent: 9,
        imageUrl: "https://resizedimgs.vivareal.com/fit-in/800x600/vr.images.sp/d99f2a48721c43148529e846175653b6.webp",
        images: [
          "https://resizedimgs.vivareal.com/fit-in/800x600/vr.images.sp/d99f2a48721c43148529e846175653b6.webp",
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
        type: "Apartamentos Médio Padrão",
        tags: ["Face Norte", "Gerador", "Portaria 24h"],
        isDeal: true,
        dealDiscountPercent: 5,
        imageUrl: "https://resizedimgs.vivareal.com/fit-in/800x600/vr.images.sp/4e17f9b8c0a34493b80b7e28a55c91d4.webp",
        images: [
          "https://resizedimgs.vivareal.com/fit-in/800x600/vr.images.sp/4e17f9b8c0a34493b80b7e28a55c91d4.webp",
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
        type: "Apartamentos e Coberturas Alto Padrão",
        tags: ["Vista Lago", "Varanda Gourmet", "2 Vagas"],
        isDeal: true,
        dealDiscountPercent: 10,
        imageUrl: "https://resizedimgs.vivareal.com/fit-in/800x600/vr.images.sp/e7d3cb8f500f42f4b95f316643e2b235.webp",
        images: [
          "https://resizedimgs.vivareal.com/fit-in/800x600/vr.images.sp/e7d3cb8f500f42f4b95f316643e2b235.webp",
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
        type: "Apartamentos e Coberturas Alto Padrão",
        tags: ["Shopping Maia", "Resort", "Piscina com Raia"],
        isDeal: true,
        dealDiscountPercent: 7,
        imageUrl: "https://resizedimgs.vivareal.com/fit-in/800x600/vr.images.sp/8b42fc069a4d4ea0b5ebefcf74cf8f2b.webp",
        images: [
          "https://resizedimgs.vivareal.com/fit-in/800x600/vr.images.sp/8b42fc069a4d4ea0b5ebefcf74cf8f2b.webp",
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
        title: "Casa em Condomínio Fechado Av. Monteiro Lobato",
        address: "Av. Monteiro Lobato, 1620 - Macedo",
        cep: "07112-000",
        neighborhood: "Macedo",
        city: "Guarulhos",
        state: "SP",
        price: 820000,
        rentPrice: 3500,
        areaM2: 120,
        bedrooms: 3,
        suites: 1,
        bathrooms: 3,
        parking: 2,
        condoFee: 480,
        iptu: 145,
        m2Price: 6833,
        lat: -23.4502,
        lng: -46.5165,
        type: "Casas e Sobrados em Condomínio",
        tags: ["Sobrado", "Condomínio Fechado", "Quintal"],
        imageUrl: "https://resizedimgs.vivareal.com/fit-in/800x600/vr.images.sp/4e17f9b8c0a34493b80b7e28a55c91d4.webp",
        images: [
          "https://resizedimgs.vivareal.com/fit-in/800x600/vr.images.sp/4e17f9b8c0a34493b80b7e28a55c91d4.webp",
        ],
        amenities: ["Condomínio Fechado", "Piscina", "Salão Gourmet", "Portaria 24h"],
        description: "Sobrado moderno em condomínio fechado próximo à Prefeitura de Guarulhos e Faculdades Integradas, excelente para família.",
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
        title: "Apartamento Compacto Próximo à Estação CPTM Cecap",
        address: "Av. Monteiro Lobato, 3400 - Parque Cecap",
        cep: "07190-000",
        neighborhood: "Cecap",
        city: "Guarulhos",
        state: "SP",
        price: 380000,
        rentPrice: 1650,
        areaM2: 44,
        bedrooms: 1,
        bathrooms: 1,
        parking: 1,
        condoFee: 390,
        iptu: 75,
        m2Price: 8636,
        lat: -23.4372,
        lng: -46.4935,
        type: "Studios e Compactos",
        tags: ["CPTM Linha 13", "Próx. Aeroporto", "Alta Liquidez"],
        isDeal: true,
        dealDiscountPercent: 6,
        imageUrl: "https://resizedimgs.vivareal.com/fit-in/800x600/vr.images.sp/9a58b2cd6f9e42e78d91a92e105e6b7f.webp",
        images: [
          "https://resizedimgs.vivareal.com/fit-in/800x600/vr.images.sp/9a58b2cd6f9e42e78d91a92e105e6b7f.webp",
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
        title: "Casa Sobrado Condomínio Fechado Próx. Shopping Bonsucesso",
        address: "Estrada Pres. Juscelino Kubitschek de Oliveira, 5308 - Bonsucesso",
        cep: "07252-000",
        neighborhood: "Bonsucesso",
        city: "Guarulhos",
        state: "SP",
        price: 360000,
        rentPrice: 1600,
        areaM2: 78,
        bedrooms: 2,
        bathrooms: 2,
        parking: 1,
        condoFee: 320,
        iptu: 60,
        m2Price: 4615,
        lat: -23.4110,
        lng: -46.4170,
        type: "Casas e Sobrados em Condomínio",
        tags: ["Sobrado", "Condomínio Fechado", "Shopping Bonsucesso"],
        imageUrl: "https://resizedimgs.vivareal.com/fit-in/800x600/vr.images.sp/4e17f9b8c0a34493b80b7e28a55c91d4.webp",
        images: [
          "https://resizedimgs.vivareal.com/fit-in/800x600/vr.images.sp/4e17f9b8c0a34493b80b7e28a55c91d4.webp",
        ],
        amenities: ["Próx. Shopping Bonsucesso", "Playground", "Churrasqueira", "Vaga de Garagem"],
        description: "Próximo à Rodovia Presidente Dutra e Polo Industrial de Bonsucesso, ótimo custo-benefício para primeiro imóvel.",
      },
    ],
  },
];

export function formatBRL(val: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: val >= 1000 ? 0 : 2,
  }).format(val);
}

export function formatCompactPrice(price: number, isRent: boolean = false): string {
  if (isRent) {
    return `${formatBRL(price)}/mês`;
  }
  if (price >= 1000000) {
    const millions = (price / 1000000).toFixed(2).replace(".00", "").replace(".", ",");
    return `R$ ${millions} M`;
  }
  if (price >= 1000) {
    const thousands = Math.round(price / 1000);
    return `R$ ${thousands} mil`;
  }
  return formatBRL(price);
}
