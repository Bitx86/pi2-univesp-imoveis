# AppImóveis — Frontend Design System & Architecture Reference

> **Single-page application** for real-estate price analytics in Guarulhos (SP).  
> **Subject**: A cartographic atlas that decodes hidden property-value geography through statistical rigor and GIS layers.  
> **Audience**: Investors, brokers, and homebuyers who need data-grade confidence before negotiating.  
> **Job**: Transform opaque listings into a navigable, statistically grounded map where every price is contextualized by neighborhood median, σ-dispersion, and urban-infrastructure layers.

---

## 1. Design Philosophy & Signature

**Core metaphor**: *A field cartographer's journal* — deep moss greens, bone-white ink, amber compass accents. The interface feels like an analog survey instrument digitized: tactile surfaces, monospaced data labels, editorial serif headlines.

**Signature element**: **The Embedded Product-UI Panel** (`.product-ui-panel`) — a light-surface "sheet" dropped into the dark atlas that renders live statistical visualizations (Gaussian curves, GIS layer toggles, SQL terminal) as if they were plates in a field notebook. This is the one memorable artifact; everything else supports it.

**Aesthetic risk**: Dark organic canvas (`#314218`) instead of the default light/cream or near-black. The palette is derived from forest floor / lichen / moss — specific to the Brazilian Atlantic Forest biome surrounding Guarulhos. No generic "dark mode" defaults.

---

## 2. Token System (CSS Custom Properties)

Defined in `src/app/globals.css:1-51`. All components consume these tokens; no hardcoded hex values in component code.

### 2.1 Color Palette (6 semantic roles + accents)

| Token | Hex | Role | Usage |
|-------|-----|------|-------|
| `--color-moss-canvas` | `#314218` | **Page background** | `html`, `body`, hero section wrapper |
| `--color-forest-floor` | `#212f0c` | **Elevated dark surface** | Cards, modals, dropdowns, nav backdrop |
| `--color-deep-bog` | `#18210c` | **Deepest surface** | Table headers, code blocks, terminal panes |
| `--color-fern` | `#3d521e` | **Interactive surface** | Primary card background (`.surface-fern`) |
| `--color-lichen` | `#64754b` | **Border / divider** | All card borders, input borders, HRs |
| `--color-limestone` | `#d8dcd2` | **Muted text / placeholder** | Captions, table headers, mono labels |
| `--color-parchment` | `#eeeeee` | **Body copy** | Primary reading text |
| `--color-bone-white` | `#ffffff` | **High-contrast headlines** | Serif display, button text, metrics |
| `--color-charcoal` | `#333333` | **Light-panel text** | Inside `.product-ui-panel` only |
| `--color-ink` | `#000000` | **Map base layer** | Leaflet container background |
| `--color-amber-compass` | `#dc8c46` | **Primary accent / CTA** | Buttons, highlights, active states, data emphasis |
| `--color-amber-hover` | `#e89953` | **Hover accent** | Button hover, link hover |
| `--color-amber-dim` | `rgba(220,140,70,0.18)` | **Subtle glow** | Badge backgrounds, focus rings |

> **Rule**: Never add new colors. Extend semantics via opacity or existing tokens.

### 2.2 Typography

| Role | Font Stack | Weight | Scale / Usage |
|------|------------|--------|---------------|
| **Display Serif** | `Fraunces`, `Georgia`, `serif` | 300 (light) | Hero title (80px/0.88), Section headings (48px/0.96) |
| **Body Sans** | `Plus Jakarta Sans`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `sans-serif` | 400/500/600 | All UI text, buttons, tables, forms |
| **Mono / Data** | `JetBrains Mono`, `monospace` | 400/500/600 | Metrics, code, CEP, UUIDs, prices, σ labels |

**Type Scale (responsive clamp via `@media` in components):**

```css
/* Hero Title */
font-size: clamp(44px, 6vw, 80px);
line-height: 0.88;
letter-spacing: -3.44px;

/* Section Heading (serif-heading-lg) */
font-size: clamp(32px, 4vw, 48px);
line-height: 0.96;
letter-spacing: -1.65px;

/* Subheading (sans-subheading) */
font-size: 18px; line-height: 1.4;

/* Body (sans-body) */
font-size: 16px; line-height: 1.5; letter-spacing: 0.033em;

/* Caption / Label (sans-caption) */
font-size: 12px; line-height: 1.43;

/* Micro-label (mono, uppercase) */
font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase;
```

### 2.3 Spacing Scale (8px base)

```css
--spacing-4: 4px;   --spacing-8: 8px;   --spacing-12: 12px;
--spacing-16: 16px; --spacing-20: 20px; --spacing-24: 24px;
--spacing-32: 32px; --spacing-36: 36px; --spacing-48: 48px;
--spacing-64: 64px; --spacing-72: 72px; --spacing-80: 80px;
--spacing-120: 120px;
```

**Layout constants:**
- `--page-max-width: 1200px` — content column
- `--section-gap: 80px` — vertical rhythm between major sections

### 2.4 Border Radii

| Token | Value | Use |
|-------|-------|-----|
| `--radius-cards` | `6px` | Cards, panels, modals, inputs |
| `--radius-badges` | `6px` | Badges, chips, pills |
| `--radius-images` | `6px` | Image containers |
| `--radius-inputs` | `6px` | Form inputs, selects |
| `--radius-buttons` | `20px` | CTA buttons (pill shape) |

### 2.5 Shadows

| Token | Value |
|-------|-------|
| `--shadow-sm` | `rgba(0,0,0,0.2) 0 2px 5px` |
| `--shadow-panel` | `rgba(0,0,0,0.35) 0 10px 30px, rgba(0,0,0,0.2) 0 2px 5px` |

---

## 3. Component Inventory & Composition Map

```
page.tsx (root layout)
├── TopographicBackground          // Ambient SVG curves (z-index 0)
├── TickerBar                      // Live announcement marquee (sticky top)
├── NavBar                         // Sticky editorial nav (z-index 50)
├── main (z-index 10)
│   ├── HeroSection                // Above-fold thesis + metrics stamp
│   ├── CartographicMapExplorer    // SIGNATURE: Google Maps + price pins + photo carousel
│   ├── ClientProofRow             // Partner logos / trust badges
│   ├── FeatureSections            // Three editorial spreads (Stats, GIS, Neon)
│   ├── NeighborhoodMatrix         // Sortable, filterable comparison table
│   ├── ValuationEstimator         // Interactive price simulator
│   ├── FeltCTASection             // Final conversion panel
│   └── CartographerFooter         // Field-journal footer
└── DashboardModal                 // Neon SQL viewer (portal, z-index 100)
```

### 3.1 Component Responsibilities

| Component | File | Primary Job | Key Interactions |
|-----------|------|-------------|------------------|
| **HeroSection** | `HeroSection.tsx` | Thesis statement + dual CTA + 4-key-metric stamp | Scroll to map, open dashboard |
| **CartographicMapExplorer** | `CartographicMapExplorer.tsx` | **Core product UI** — Leaflet map, price-pill markers, property photo carousel, neighborhood filter chips, geocoding search | Click pin → expand card; filter by type; switch tile layers; search address/CEP |
| **NeighborhoodMatrix** | `NeighborhoodMatrix.tsx` | Comparative data table with sortable columns | Sort by any metric; toggle Sale/Rent; filter by name; "Ver no Mapa" scroll |
| **FeatureSections** | `FeatureSections.tsx` | Editorial spreads explaining *how it works* | Tab through GIS layers; confidence slider (Gaussian) |
| **ValuationEstimator** | `ValuationEstimator.tsx` | Price simulator (m² × area ± σ) | Input area, bedrooms, neighborhood → output range |
| **DashboardModal** | `DashboardModal.tsx` | Live Neon SQL viewer + seed trigger | Switch bairro/tipo; refresh; seed DB; copy API URL |
| **NavBar** | `NavBar.tsx` | Sticky navigation + mobile drawer | Smooth-scroll to sections; open dashboard |
| **TickerBar** | `TickerBar.tsx` | Live announcement marquee | Pause on hover |
| **TopographicBackground** | `TopographicBackground.tsx` | Ambient SVG topographic curves | Purely decorative, parallax-ready |
| **ClientProofRow** | `ClientProofRow.tsx` | Social proof logos | None |
| **FeltCTASection** | `FeltCTASection.tsx` | Final conversion panel | Scroll to map, open dashboard |
| **CartographerFooter** | `CartographerFooter.tsx` | Field-journal footer with links | Open dashboard |

---

## 4. Layout & Visual Grammar

### 4.1 Page Architecture (Single-Page Scroll)

```
┌─────────────────────────────────────────────────────────────┐
│ TickerBar (fixed, full-width)                               │
├─────────────────────────────────────────────────────────────┤
│ NavBar (sticky, backdrop blur)                              │
├─────────────────────────────────────────────────────────────┤
│ HeroSection (80px pt, 64px pb, centered, max 1200px)        │
├─────────────────────────────────────────────────────────────┤
│ CartographicMapExplorer (780px tall viewport, 1280px max)   │
├─────────────────────────────────────────────────────────────┤
│ ClientProofRow (horizontal scroll logo strip)               │
├─────────────────────────────────────────────────────────────┤
│ FeatureSections (3 × editorial spreads, 80px gap each)      │
│   ├── Statistical Dispersion (Gaussian curve + cards)       │
│   ├── GIS Layers (tabbed layer visual + metrics)            │
│   └── Neon Architecture (SQL terminal + metrics bar)        │
├─────────────────────────────────────────────────────────────┤
│ NeighborhoodMatrix (fern-surface table, sortable)           │
├─────────────────────────────────────────────────────────────┤
│ ValuationEstimator (interactive calculator card)            │
├─────────────────────────────────────────────────────────────┤
│ FeltCTASection (amber CTA panel)                            │
├─────────────────────────────────────────────────────────────┤
│ CartographerFooter (deep-bog, mono links)                   │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Surface Hierarchy (Dark → Light)

| Layer | Background | Border | Purpose |
|-------|------------|--------|---------|
| **Canvas** | `moss-canvas` | — | Page base |
| **Elevated Dark** | `forest-floor` | `lichen` | Cards, modals, nav backdrop |
| **Deepest** | `deep-bog` | `lichen` | Table headers, code blocks |
| **Interactive** | `fern` | `lichen` | Primary data cards (`.surface-fern`) |
| **Product UI Panel** | `bone-white` | `rgba(lichen,0.3)` | **Light sheet** — embedded analytics, Gaussian viz, SQL |
| **Map Viewport** | `#e5e3df` (Leaflet default) | — | Google Maps / Satellite base |

> **Rule**: The light `.product-ui-panel` appears **only** inside FeatureSections and Hero metrics stamp. It signals "live product data" vs. editorial content.

### 4.3 Interactive States (Consistent Across Components)

| Element | Default | Hover | Active / Focus | Disabled |
|---------|---------|-------|----------------|----------|
| **Primary CTA (`.btn-amber`)** | `amber-compass` bg, white text | `amber-hover`, `translateY(-1px)`, shadow | `translateY(0)` | `opacity: 0.5`, cursor not-allowed |
| **Ghost Link (`.btn-ghost-link`)** | Transparent, white bottom-border | `amber-compass` text & border | — | — |
| **Secondary (`.btn-fern`)** | `fern` bg, `lichen` border | `lichen` bg | — | — |
| **Table Row** | Transparent | `rgba(moss-canvas, 0.6)` bg | — | — |
| **Neighborhood Chip** | White/94%, dark text | Scale 1.02, border `amber` | `moss-canvas` bg, white text | — |
| **Price Pill (map)** | White bubble, charcoal text | Scale 1.1, z-index 9999 | `amber` bg, white text, scale 1.08 | — |
| **Input / Select** | `forest-floor` bg, `lichen` border | Border `amber` | Border `amber`, ring `amber-dim` | `opacity: 0.5` |

---

## 5. Motion & Animation

**Principle**: Orchestrated, purposeful, respectful of `prefers-reduced-motion`.

| Animation | Trigger | Duration / Easing | Purpose |
|-----------|---------|-------------------|---------|
| **Ticker marquee** | Auto (35s linear infinite) | `35s linear` | Live data pulse; pauses on hover |
| **Pin pulse** | Map load / selection | `2.5s infinite` (scale + box-shadow) | Draw eye to active property |
| **Card expand/collapse** | Property click | `0.25s cubic-bezier(0.16, 1, 0.3, 1)` | Smooth panel transition |
| **Map flyTo** | Neighborhood chip / search | `0.8–1.4s` (Leaflet `flyTo`) | Spatial orientation |
| **Button micro-interactions** | Hover/active | `0.2s ease` / `0.1s` | Tactile feedback |
| **Modal backdrop** | Open/close | `0.2s` fade + `blur(8px)` | Focus trapping |
| **Scroll-behavior** | Anchor links | `smooth` (CSS) | Section navigation |

**Reduced motion**: All `@keyframes` wrapped in `@media (prefers-reduced-motion: reduce)` → `animation: none; transition: none;`

---

## 6. Data Visualization Language

### 6.1 Gaussian Curve (Statistical Dispersion)

- **Canvas**: SVG `viewBox="0 0 500 200"` inside `.product-ui-panel`
- **Curve**: Cubic Bézier approximating normal distribution
- **Confidence band**: Gradient fill (`--color-fern` 40% → 5%) between `±1.96σ`
- **Median line**: Vertical dashed `amber-compass` at center
- **Data points**: Amber circles (validated), Red circles (outliers `±1.96σ`)
- **Labels**: Mono, `±1.96σ (R$ X.k)`, `MEDIANA (R$ Y.k)`

### 6.2 Price Pills (Map Markers)

- **Format**: `R$ 1.35 M` (sale ≥ 1M) or `R$ 450 mil` (sale < 1M) or `R$ 3.200/mês` (rent)
- **States**: Default (white), Active (amber + white text + scale), Deal (dark green + ★ TOP badge)
- **Anatomy**: Rounded pill (20px radius) + triangular tip (CSS `::after`)
- **Hover**: Scale 1.1, z-index 9999, shadow elevation

### 6.3 Neighborhood Chips (Map Filter Bar)

- **Content**: `Bairro Name  R$ 10.450/m²` (live m² price for selected business type)
- **Selected**: `moss-canvas` bg, white text, amber price
- **Unselected**: White/94% bg, dark text, muted price

### 6.4 Comparison Table (NeighborhoodMatrix)

- **Header**: `deep-bog` bg, `limestone` mono uppercase labels, sortable (`ArrowUpDown`)
- **Rows**: `fern` surface, `lichen` dividers, hover `moss-canvas/60`
- **Key columns**: Valor/m² (amber mono 700), Mediano (bone-white 500), σ (mono badge on `forest-floor`), Amostras (mono)
- **Action**: Ghost button "Ver no Mapa" → scrolls to map + selects neighborhood

---

## 7. Accessibility (WCAG AA)

| Requirement | Implementation |
|-------------|----------------|
| **Color contrast** | All text ≥ 4.5:1 (parchment on moss-canvas = 7.2:1; amber on white = 4.6:1) |
| **Focus visible** | Custom `:focus-visible` rings using `amber-dim` (see globals.css) |
| **Keyboard nav** | All interactive elements reachable; modal traps focus; map markers focusable via `tabindex=0` |
| **ARIA labels** | Icon-only buttons have `aria-label`; live regions for ticker/search feedback |
| **Semantic HTML** | `<nav>`, `<main>`, `<section>`, `<table>`, `<thead>`, `<tbody>`, `<button>`, `<form>` |
| **Reduced motion** | `@media (prefers-reduced-motion: reduce)` disables all non-essential animation |
| **Alt text** | All property images have descriptive `alt` (title + neighborhood) |
| **Language** | `lang="pt-BR"` on `<html>` |

---

## 8. Responsive Breakpoints

| Breakpoint | Width | Key Changes |
|------------|-------|-------------|
| **Mobile** | `< 640px` | Hero title 44px; nav → drawer; map 400px tall; table horizontal scroll; grid → 1col |
| **Tablet** | `640–1024px` | Hero title 56px; map 600px; feature grids 2→1 col; matrix table scroll |
| **Desktop** | `> 1024px` | Full layout; hero 80px; map 780px; 3-col feature grids; side-by-side panels |

**Container query pattern**: Components use `max-width: var(--page-max-width); margin: 0 auto; padding: 0 24px;` — no global container component.

---

## 9. Content & Copy Principles

- **Voice**: Technical but accessible. "Mediana real", "Corte algorítmico de outliers", "Prêmio de valorização".
- **Active verbs**: "Explorar Atlas", "Popular Banco", "Ver no Mapa", "Localizar".
- **Specificity over cleverness**: "14.280+ Imóveis georreferenciados" not "Milhares de imóveis".
- **Units always visible**: `R$ 10.450/m²`, `± 1.2 σ`, `47 Bairros`, `0.04s`.
- **Error states**: Directional, not apologetic. "API retornou status HTTP 500. Verifique se `dotnet run` está ativo."
- **Empty states**: Invitation to act. "Banco vazio → Clique em Popular Banco (Seed)".

---

## 10. Integration Contracts (Frontend ↔ Backend)

### 10.1 Environment

```env
NEXT_PUBLIC_API_URL=http://localhost:5209   # ASP.NET Core Web API
```

### 10.2 API Endpoints Consumed

| Endpoint | Method | Params | Response | Used By |
|----------|--------|--------|----------|---------|
| `/api/imoveis` | GET | `tipoNegocio`, `page`, `pageSize` | `{ items: Imovel[], totalCount }` | MapExplorer, DashboardModal |
| `/api/analise/bairro/{id}` | GET | `tipoNegocio` | `AnaliseRegiao` | DashboardModal |
| `/api/seed` | POST | — | `{ success: boolean }` | DashboardModal (seed button) |
| `/api/ingest/run` | POST | `{ city, state, businessType, pages }` | `{ ingested: number }` | DashboardModal (fallback seed) |

### 10.3 TypeScript Contracts (Shared with Backend via OpenAPI ideal)

```typescript
// CartographicMapExplorer.tsx:42-69
interface PropertyData {
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
  isDeal?: boolean;
  dealDiscountPercent?: number;
  imageUrl?: string;
  images: string[];
  amenities?: string[];
  description?: string;
}

// DashboardModal.tsx:8-25
type Analise = {
  bairroId?: string;
  tipoNegocio?: "Sale" | "Rent";
  precoMedio?: number;
  precoMediano?: number;
  precoM2Medio?: number;
  desvioPadraoAmostral?: number;
  amostraCount?: number;
  atualizadoEm?: string;
};
```

> **Note**: Backend uses snake_case (`preco_medio`), frontend handles both via `??` fallback.

---

## 11. Performance & Quality Checklist

- [ ] **Next.js 15 (Turbopack)** — `next dev` for development
- [ ] **TypeScript strict** — `tsconfig.json` strict mode, no `any` in components
- [ ] **ESLint 9 + Next config** — `npm run lint` passes
- [ ] **Bundle analysis** — Leaflet loaded dynamically via `import("leaflet")` (code-split)
- [ ] **Fonts** — `next/font` for Fraunces, Plus Jakarta Sans, JetBrains Mono (preload)
- [ ] **Images** — External CDN (VivaReal/ZAP), `next/image` not used (external domains)
- [ ] **Hydration** — All interactive components marked `"use client"`; SSR-safe guards (`typeof window`)
- [ ] **Scroll restoration** — Manual `scrollIntoView` for section links

---

## 12. Extending the Design System

### Adding a New Component

1. **Create** `src/components/NewComponent.tsx` with `"use client"` if interactive
2. **Consume tokens only** — `var(--color-*)`, `var(--font-*)`, `var(--spacing-*)`, `var(--radius-*)`
3. **Follow surface hierarchy** — choose correct background/border from Section 4.2
4. **Add utility classes** to `globals.css` if pattern repeats (buttons, badges, surfaces)
5. **Test** at all three breakpoints + reduced motion + keyboard only

### Adding a New Color Semantic

**Don't.** Extend via opacity: `rgba(var(--color-amber-compass-rgb), 0.15)` — but CSS vars don't support RGB decomposition. Instead, add a new token in `globals.css:1-51` with a clear semantic name (e.g., `--color-amber-subtle`).

### Adding a New Type Scale

Add to `globals.css:78-132` following the `.serif-*` / `.sans-*` naming. Use `clamp()` for fluid scaling.

---

## 13. Known Limitations & Technical Debt

| Area | Issue | Mitigation |
|------|-------|------------|
| **Leaflet SSR** | Dynamic import required; no SSR map | `useEffect` + `typeof window` guard |
| **Google Tiles** | Unofficial tile URLs (`mt1.google.com`) | Fallback to Carto Voyager/Dark; monitor TOS |
| **Nominatim Geocoding** | Rate-limited, no API key | Client-side only; debounce; graceful fallback |
| **Mock Neighborhood Data** | Hardcoded `NEIGHBORHOODS` array (8 bairros) | Replace with `/api/bairros` endpoint when backend ready |
| **Dashboard UUIDs** | Hardcoded UUID ↔ bairro mapping | Backend should return `bairroId` ↔ `nome` lookup |
| **Chart.js not yet used** | Gaussian curve is hand-coded SVG | Migrate to Chart.js when histograms needed |
| **No test suite** | Jest/Playwright not configured | Add `npm test` script + CI |

---

## 14. Quick Reference: Class & Token Cheatsheet

```css
/* Surfaces */
.surface-fern       /* fern bg + lichen border */
.surface-forest     /* forest-floor bg + lichen border */
.surface-deep-bog   /* deep-bog bg + lichen border */
.product-ui-panel   /* bone-white bg + charcoal text + shadow-panel */

/* Typography */
.serif-display      /* 80px/0.88, Fraunces 300 */
.serif-heading-lg   /* 48px/0.96, Fraunces 300 */
.serif-heading      /* 36px/1.0, Fraunces 300 */
.serif-heading-sm   /* 24px/1.11, Fraunces 300 */
.sans-body          /* 16px/1.5, Plus Jakarta Sans 400 */
.sans-subheading    /* 18px/1.4, Plus Jakarta Sans 400 */
.sans-caption       /* 12px/1.43, Plus Jakarta Sans 400 */

/* Buttons */
.btn-amber          /* Primary CTA */
.btn-ghost-link     /* Secondary text link */
.btn-fern           /* Tertiary action */

/* Badges */
.badge-limestone    /* limestone bg, deep-bog text, mono uppercase */
.badge-moss         /* forest-floor bg, amber text, mono uppercase */

/* Map Specific */
.price-pill-marker  /* Wrapper for pin positioning */
.price-pill-bubble  /* Price pill visual (white/amber/deal) */
.neighborhood-map-label /* Geo label on map */
```

---

## 15. Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2026-08-26 | 1.0 | Initial design system documentation from existing codebase |

---

**Maintained by**: Senior Full-Stack Engineer & Software Architect  
**Stack**: Next.js 15 + React 19 + TypeScript + Leaflet + Lucide Icons  
**Backend**: ASP.NET Core Web API + EF Core + Neon PostgreSQL