# AppImóveis — Frontend Design System & Architecture Reference
## Design System: Azure Geomatics

> **Plataforma Modular de Inteligência Imobiliária e Cartografia Geoespacial (SPA)**  
> **Tema / Visual Identity**: *Azure Geomatics* — Azul tecnológico profundo, precisão cartográfica, tipografia editorial híbrida e superfícies planas estruturadas.  
> **Público-Alvo**: Investidores, analistas imobiliários, corretores e compradores que demandam rigor estatístico e clareza espacial sem ruído cognitivo.  
> **Missão**: Transformar listagens imobiliárias dispersas em uma plataforma modular de inteligência analítica com exploração espacial em tela cheia, visualizações estatísticas de alta resolução e simulação preditiva.

---

## 1. Filosofia de Design & Identidade Visual

### 1.1 Metáfora Central
**Atlas Geodésico Digital de Precisão**: Uma fusão entre a autoridade cartográfica de um atlas físico de alta precisão e a sofisticação de uma estação de trabalho SIG (Sistemas de Informação Geográfica). Tons de azul abissal (`#07122a`, `#14213d`) transmitem estabilidade, autoridade técnica e excelente contraste cromático para renderização de mapas vetoriais e noturnos. Acentos em azul elétrico (`#0066ff`) e esmeralda analítica (`#22c55e`) guiam a atenção do usuário com precisão cirúrgica.

### 1.2 Elemento Assinatura (*Signature Element*)
**O HUD Cartográfico & Viewport Imersivo**: O mapa espacial e as ferramentas analíticas não são meros blocos empilhados numa rolagem sem fim; são viewports dedicados em uma arquitetura de aplicação com barra lateral hierárquica fixa (`Sidebar`). Controles flutuantes em vidro escuro e contornos técnicos (`outline-variant`) garantem máxima área útil de visualização.

### 1.3 Decisão Estética e Quebra de Padrões
- **Superfícies Planas com Bordas Técnicas (`ROUND_FOUR` + Flat Elevation)**: Abandono de sombras difusas pesadas ou cantos excessivamente arredondados em favor de um raio controlado de 4px (`ROUND_FOUR`) e contornos sutis de 1px (`#44474f` / `#1c2d4e`).
- **Transição de Long-Scroll para SPA Modular**: Substituição da rolagem vertical infinita por navegação por telas dedicadas com preservação de estado e transições fluidas de opacidade/transformação.
- **Eliminação de Débito Visual**: Supressão de blocos brutos de código SQL da visualização primária. A complexidade do backend (PostgreSQL/Neon) atua "sob o capô", refletindo-se diretamente em métricas claras e interfaces de visualização limpas.

---

## 2. Sistema de Tokens (Design Tokens)

### 2.1 Paleta de Cores (Azure Geomatics)

| Token CSS | Hex | Papel Semântico | Aplicação no Sistema |
|---|---|---|---|
| `--color-surface` | `#07122a` | **Superfície Principal** | Fundo da aplicação, fundo base de telas |
| `--color-surface-dim` | `#07122a` | **Superfície Atenuada** | Fundo de transição e áreas de baixa ênfase |
| `--color-surface-bright` | `#2f3952` | **Superfície Realçada** | Destaques de superfície, bordas de foco |
| `--color-surface-container-lowest` | `#030d25` | **Superfície Abissal** | Fundo da sidebar fixa, inputs recolhidos, code blocks |
| `--color-surface-container-low` | `#101b33` | **Container Nível 1** | Headers de tabelas, cartões secundários |
| `--color-surface-container` | `#14213d` | **Container Nível 2 (Padrão)** | Painéis, cards principais, drawers flutuantes |
| `--color-surface-container-high` | `#1c2d4e` | **Container Nível 3** | Modais, tooltips, cards em foco/hover |
| `--color-surface-container-highest` | `#263a5d` | **Container Nível 4** | Chips ativos, barras de status, tags selecionadas |
| `--color-on-surface` | `#e2e2e6` | **Texto Primário** | Títulos, valores de métricas, texto de leitura principal |
| `--color-on-surface-variant` | `#c4c6d0` | **Texto Secundário** | Subtítulos, rótulos de eixos, descrições secundárias |
| `--color-outline` | `#8e9099` | **Contorno Neutro** | Bordas ativas, divisores destacados |
| `--color-outline-variant` | `#44474f` | **Contorno Sutil** | Bordas padrão de cards (1px solid), grades de tabelas |
| `--color-primary` | `#0066ff` | **Ação Primária / Destaque** | Botões primários, marcadores ativos, links de ação |
| `--color-on-primary` | `#ffffff` | **Texto sobre Primário** | Texto em botões primários e marcadores ativos |
| `--color-primary-container` | `#0044bb` | **Container Primário** | Badges de destaque, estado ativo de navegação |
| `--color-on-primary-container` | `#d8e2ff` | **Texto sobre Container Prim.**| Rótulos destacados em badges primários |
| `--color-secondary` | `#565e71` | **Ação Secundária** | Botões secundários, ícones neutros |
| `--color-on-secondary` | `#ffffff` | **Texto sobre Secundário** | Texto em botões secundários |
| `--color-secondary-container` | `#dae2f9` | **Container Secundário** | Badges de suporte |
| `--color-on-secondary-container` | `#131c2c` | **Texto sobre Container Sec.** | Texto sobre badges de suporte |
| `--color-error` | `#ffb4ab` | **Alerta / Outlier Negativo** | Identificação de dispersão extrema e erros |
| `--color-on-error` | `#690005` | **Texto sobre Erro** | Texto e ícones de erro |
| `--color-success` | `#22c55e` | **Sucesso / Oportunidade** | Indicador de bom negócio, métricas positivas |
| `--color-on-success` | `#ffffff` | **Texto sobre Sucesso** | Texto sobre indicadores de sucesso |

---

### 2.2 Tipografia Híbrida

A combinação tipográfica alia a herança acadêmica da **Source Serif 4** para títulos editoriais e a legibilidade da **Inter** para dados quantitativos e controles operacionais. A fonte monospaçada **JetBrains Mono** é mantida para coordenadas, CEPs, valores monetários e notações estatísticas ($\sigma$).

| Papel Tipográfico | Família Tipográfica | Peso | Altura de Linha | Transformação / Estilo | Uso Principal |
|---|---|---|---|---|---|
| **Display** | `Source Serif 4`, serif | 700 (Bold) | 1.2 | Nenhuma | Títulos de grande impacto, cabeçalhos de módulo |
| **Headline** | `Source Serif 4`, serif | 600 (Semi-bold) | 1.3 | Nenhuma | Títulos de seções, modais e cards analíticos |
| **Body** | `Inter`, sans-serif | 400 (Regular) / 500 | 1.5 | Nenhuma | Textos de leitura, descrições, parágrafos |
| **Label** | `Inter`, sans-serif | 500 (Medium) | 1.2 | `uppercase`, letter-spacing 0.06em | Rótulos de campo, abas, botões, headers de tabela |
| **Mono / Data** | `JetBrains Mono`, monospace | 400 / 500 | 1.4 | Nenhuma | Valores em R$, desvios $\sigma$, coordenadas geográficas |

#### Escala Tipográfica (CSS Classes):
```css
/* Display & Headlines */
.font-display {
  font-family: var(--font-display-serif), "Source Serif 4", Georgia, serif;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.font-headline {
  font-family: var(--font-display-serif), "Source Serif 4", Georgia, serif;
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: -0.01em;
}

/* Body & Labels */
.font-body {
  font-family: var(--font-body-sans), "Inter", sans-serif;
  font-weight: 400;
  line-height: 1.5;
}

.font-label {
  font-family: var(--font-body-sans), "Inter", sans-serif;
  font-weight: 500;
  line-height: 1.2;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.font-mono {
  font-family: var(--font-code-mono), "JetBrains Mono", monospace;
}
```

---

### 2.3 Espaçamento & Grid

- **Base Unit**: `8px` (`--space-unit: 8px`)
- **Margin Desktop**: `40px` (`--margin-desktop: 40px`)
- **Margin Mobile**: `16px` (`--margin-mobile: 16px`)
- **Section Gap**: `80px` (`--section-gap: 80px`)
- **Gutter**: `24px` (`--gutter: 24px`)

```css
:root {
  --spacing-1: 4px;
  --spacing-2: 8px;
  --spacing-3: 12px;
  --spacing-4: 16px;
  --spacing-5: 20px;
  --spacing-6: 24px;
  --spacing-8: 32px;
  --spacing-10: 40px;
  --spacing-12: 48px;
  --spacing-16: 64px;
  --spacing-20: 80px;
}
```

---

### 2.4 Componentes & Superfícies (Roundness & Elevation)

- **Arredondamento Padrão**: `ROUND_FOUR` (4px).  
  - Botões, inputs, cards, modais e abas usam `border-radius: 4px;`  
  - Badges compactos usam `border-radius: 4px;` ou `border-radius: 2px;`  
  - Marcadores de mapa (*price pills*) mantêm formato funcional de pílula retangular arredondada compacta (4px com ponta discreta).
- **Elevação**: `Flat`.  
  - Eliminação de sombras difusas exageradas.
  - Separação entre camadas feita por cores de containers (`surface-container-low` → `surface-container` → `surface-container-high`) e bordas técnicas finas (`1px solid var(--color-outline-variant)`).

---

## 3. Arquitetura Modular da Aplicação (SPA)

### 3.1 Estrutura de Layout SPA

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Barra Superior Global (TickerBar / Status de Conexão Neon)                  │
├──────────────┬──────────────────────────────────────────────────────────────┤
│ SIDEBAR      │ ÁREA PRINCIPAL DA TELA (Main Viewport)                       │
│ FIXA         │                                                              │
│ (260px)      │ [Tela Ativa: transição suave de opacidade e translação]      │
│              │                                                              │
│ • Logo       │ • Tela 1: Mapa Interativo (GIS Hero Viewport)               │
│ • Nav Grupo  │ • Tela 2: Análise Estatística (DataViz & Dispersão)          │
│   ├ Mapa GIS │ • Tela 3: Simulador de Avaliação (Calculadora de Valor)      │
│   ├ Análise  │ • Tela 4: Índice de Bairros (Matriz de Comparação Regional)  │
│   ├ Simulador│                                                              │
│   └ Bairros  │                                                              │
│ • Filtro     │                                                              │
│   Venda/Alug.│                                                              │
│ • Status DB  │                                                              │
└──────────────┴──────────────────────────────────────────────────────────────┘
```

### 3.2 Módulos e Telas do Sistema

#### Tela 1: Mapa Interativo (GIS Explorer)
- **Papel**: "Hero" imersivo de exploração espacial.
- **Estrutura**: Viewport de mapa ocupando 100% da área útil disponível.
- **Elementos Integrados**:
  - Controles flutuantes de camadas (Satélite, Dark GIS, Heatmap de Preço/m²).
  - Barra superior de busca por CEP/Endereço e filtro rápido por tipo de imóvel (Apartamento, Casa, etc.).
  - Marcadores interativos de preço com destaque para oportunidades calculadas estatisticamente (`dealBadge`).
  - Drawer lateral retrátil com detalhes do imóvel selecionado, galeria de fotos e métricas em relação à média do bairro.

#### Tela 2: Análise Estatística (DataViz & Dispersão)
- **Papel**: Central analítica de inteligência de mercado e visualização de dados.
- **Estrutura**: Dashboard em grid com foco em alta legibilidade.
- **Elementos Integrados**:
  - Gráfico de Curva Gaussiana (Distribuição Normal) com bandas de confiança ajustáveis (90%, 95%, 99%) e corte automático de outliers ($\pm 1.96\sigma$).
  - Gráfico de dispersão Preço vs. Área ($m^2$) para identificação de distorções de precificação.
  - Indicadores chave de performance (Mediana Real, Média Aritmética, Desvio Padrão Amostral, Número de Amostras Válidas).
  - Decomposição das camadas de infraestrutura urbana (Impacto de transporte, zoneamento e relevo).

#### Tela 3: Simulador de Valor (Valuation Calculator)
- **Papel**: Ferramenta interativa de avaliação instantânea de imóveis.
- **Estrutura**: Interface orientada a entradas de parâmetros (Sliders + Inputs numéricos).
- **Elementos Integrados**:
  - Sliders para Área Útil ($m^2$), Quartos, Vagas de Garagem e Bairro.
  - Cálculo instantâneo do valor estimado de venda e locação com base na mediana do m² e desvio padrão.
  - Faixa de valor justo (*fair value range*) com limites inferior e superior baseados no rigor estatístico.

#### Tela 4: Índice de Bairros (Matriz Regional)
- **Papel**: Tabela comparativa avançada e inteligência de micro-regiões.
- **Estrutura**: Tabela de alta densidade informativa com ordenação multi-coluna e busca textual.
- **Elementos Integrados**:
  - Métricas comparativas: Preço Médio/m², Mediana Real, Desvio Padrão ($\sigma$), Total de Amostras, Índice de Liquidez.
  - Filtro por modalidade (Venda / Aluguel).
  - Ação rápida "Explorar no Mapa" que transfere o contexto espacial diretamente para a Tela 1 com foco no bairro selecionado.

---

## 4. Transições de Navegação e Estados

- **Troca de Telas**: Suave transição através de `opacity` (0.2s) e sutil translação vertical (`translateY(4px) -> translateY(0)`), evitando recarregamentos bruscos e mantendo o contexto de dados na memória.
- **Preservação de Estado**: Filtros ativos (tipo de negócio Venda/Locação, bairro selecionado, faixa de preço) são mantidos compartilhados entre as telas através de estado unificado.
- **Acessibilidade**: Suporte a navegação por teclado (`Tab`, setas nos menus da Sidebar) com anéis de foco visíveis em `--color-primary`.

---

## 5. Eliminação de Débito Técnico & Integração com Backend

1. **Remoção de Código SQL da Interface do Usuário**: A consulta bruta SQL que poluía a tela de apresentação foi removida da visualização principal. Toda comunicação é tratada transparentemente pelos endpoints da API (`/api/imoveis`, `/api/analise/bairro/{id}`, `/api/seed`).
2. **Modal de Diagnóstico / Inspetor Opcional**: O acesso às consultas e diagnóstico do banco de dados Neon é mantido apenas como ferramenta técnica de depuração, acessível discretamente via rodapé da sidebar.
3. **Consistência de Tipos TypeScript**: Alinhamento estrito dos contratos entre frontend e backend (com suporte a fallback para dados mockados em caso de indisponibilidade da API local).

---

## 6. Histórico de Versões

| Versão | Data | Autor | Principais Alterações |
|---|---|---|---|
| **2.0** | 2026-08-31 | Frontend Lead / Architect | Transição completa para **Azure Geomatics**, adoção do modelo SPA com Sidebar fixa, tipografia Source Serif 4 + Inter, modularização das 4 telas e remoção de débito SQL. |
| **1.0** | 2026-08-26 | Dev Team | Versão inicial em Long Scroll (Tema Moss/Forest). |