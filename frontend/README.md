# 🧭 AppImóveis — Frontend (Next.js 16 + TypeScript + Leaflet)

> Para a documentação completa do projeto, diagramas de arquitetura, fluxo de dados, diagramas de classes e análise de dores para o Projeto Integrador, consulte o **[README Principal na Raiz do Repositório](../README.md)** e a especificação de design em **[design.md](./design.md)**.

---

## 🚀 Execução do Frontend

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor de desenvolvimento
npm run dev
```

Acesse em: [http://localhost:3000](http://localhost:3000)

## 🧩 Principais Componentes

- **`CartographicMapExplorer.tsx`**: Atlas interativo com Leaflet, pins de preços, carrossel de fotos e busca por CEP/endereço.
- **`ValuationEstimator.tsx`**: Simulador preditivo de valor de metro quadrado e intervalo de desvio padrão ($\pm 1\sigma$).
- **`NeighborhoodMatrix.tsx`**: Matriz comparativa de bairros com ordenação multi-coluna.
- **`DashboardModal.tsx`**: Console interativo SQL com consultas diretas ao banco Neon Serverless.
- **`FeatureSections.tsx`**: Painel editorial explicando fundamentos estatísticos (Gaussiana) e camadas GIS.
