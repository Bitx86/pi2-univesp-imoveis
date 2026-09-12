-- =====================================================
-- Schema real do banco PostgreSQL / Neon
-- =====================================================

DROP TABLE IF EXISTS historico_precos CASCADE;
DROP TABLE IF EXISTS ocorrencias_criminais CASCADE;
DROP TABLE IF EXISTS analise_regiao CASCADE;
DROP TABLE IF EXISTS imoveis CASCADE;
DROP TABLE IF EXISTS bairros CASCADE;
DROP TYPE IF EXISTS tipo_negocio CASCADE;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE tipo_negocio AS ENUM ('sale', 'rent');

CREATE TABLE bairros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    cidade TEXT NOT NULL,
    estado TEXT NOT NULL,
    populacao_estimada INTEGER NULL CHECK (populacao_estimada > 0),
    CONSTRAINT uq_bairros_nome_cidade_estado UNIQUE (nome, cidade, estado)
);

CREATE TABLE imoveis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id TEXT NOT NULL,
    fonte TEXT NOT NULL,
    titulo TEXT NOT NULL DEFAULT '',
    descricao TEXT NULL,
    tipo_negocio tipo_negocio NOT NULL,
    tipo_anuncio TEXT NULL,
    tipo_imovel TEXT NULL,
    preco NUMERIC(18,2) NOT NULL CHECK (preco >= 0),
    condominio NUMERIC(18,2) NULL CHECK (condominio >= 0),
    iptu NUMERIC(18,2) NULL CHECK (iptu >= 0),
    area_m2 NUMERIC(18,2) NULL CHECK (area_m2 >= 0),
    quartos INTEGER NULL CHECK (quartos >= 0),
    banheiros INTEGER NULL CHECK (banheiros >= 0),
    suites INTEGER NULL CHECK (suites >= 0),
    vagas INTEGER NULL CHECK (vagas >= 0),
    rua TEXT NULL,
    numero TEXT NULL,
    cep TEXT NULL,
    endereco_formatado TEXT NULL,
    cidade TEXT NULL,
    estado TEXT NULL,
    bairro_id UUID NOT NULL,
    latitude DOUBLE PRECISION NULL,
    longitude DOUBLE PRECISION NULL,
    url_original TEXT NULL,
    imagem_principal_url TEXT NULL,
    imagens_urls TEXT[] NULL,
    amenidades TEXT[] NULL,
    capturado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_imoveis_bairro
        FOREIGN KEY (bairro_id)
        REFERENCES bairros(id)
        ON DELETE RESTRICT,
    CONSTRAINT uq_imoveis_fonte_external_id UNIQUE (fonte, external_id)
);

CREATE TABLE historico_precos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    imovel_id UUID NOT NULL,
    preco NUMERIC(18,2) NOT NULL CHECK (preco >= 0),
    capturado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_historico_precos_imovel
        FOREIGN KEY (imovel_id)
        REFERENCES imoveis(id)
        ON DELETE CASCADE
);

CREATE TABLE analise_regiao (
    bairro_id UUID NOT NULL,
    tipo_negocio tipo_negocio NOT NULL,
    preco_medio NUMERIC(18,2) NOT NULL CHECK (preco_medio >= 0),
    preco_mediano NUMERIC(18,2) NOT NULL CHECK (preco_mediano >= 0),
    preco_m2_medio NUMERIC(18,2) NULL CHECK (preco_m2_medio >= 0),
    desvio_padrao_amostral NUMERIC(18,2) NOT NULL CHECK (desvio_padrao_amostral >= 0),
    amostra_count INTEGER NOT NULL CHECK (amostra_count >= 0),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT pk_analise_regiao PRIMARY KEY (bairro_id, tipo_negocio),
    CONSTRAINT fk_analise_regiao_bairro
        FOREIGN KEY (bairro_id)
        REFERENCES bairros(id)
        ON DELETE CASCADE
);

CREATE TABLE historico_varreduras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cidade TEXT NOT NULL,
    estado TEXT NOT NULL,
    bairro_termo TEXT NOT NULL,
    tipo_negocio tipo_negocio NOT NULL,
    pagina_consultada INTEGER NOT NULL,
    total_encontrados INTEGER NOT NULL DEFAULT 0,
    novos_ingeridos INTEGER NOT NULL DEFAULT 0,
    duplicados_ignorados INTEGER NOT NULL DEFAULT 0,
    api_key_utilizada_reduzida TEXT NULL,
    data_consulta TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ocorrencias_criminais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bairro_id UUID NOT NULL REFERENCES bairros(id) ON DELETE CASCADE,
    tipo_crime TEXT NOT NULL,
    data_ocorrencia DATE NOT NULL,
    latitude DOUBLE PRECISION NULL,
    longitude DOUBLE PRECISION NULL,
    fonte TEXT NOT NULL DEFAULT 'SSP-SP',
    identificador_externo TEXT NULL,
    CONSTRAINT uq_ocorrencia_fonte_id UNIQUE (fonte, identificador_externo)
);

-- Índices de Alta Performance
CREATE INDEX idx_bairros_nome_cidade_estado ON bairros (nome, cidade, estado);
CREATE INDEX idx_imoveis_bairro_id ON imoveis (bairro_id);
CREATE INDEX idx_imoveis_tipo_negocio ON imoveis (tipo_negocio);
CREATE INDEX idx_imoveis_capturado_em ON imoveis (capturado_em DESC);
CREATE INDEX idx_imoveis_preco ON imoveis (preco);
CREATE INDEX idx_imoveis_bairro_tipo_negocio ON imoveis (bairro_id, tipo_negocio);
CREATE INDEX idx_imoveis_fonte_external_id ON imoveis (fonte, external_id);
CREATE INDEX idx_historico_precos_imovel_id ON historico_precos (imovel_id);
CREATE INDEX idx_analise_regiao_bairro_id ON analise_regiao (bairro_id);
CREATE INDEX idx_historico_varreduras_termo ON historico_varreduras (cidade, bairro_termo, tipo_negocio);
CREATE INDEX idx_ocorrencias_bairro_data_tipo ON ocorrencias_criminais (bairro_id, data_ocorrencia, tipo_crime);
