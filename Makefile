# =============================================================================
# Makefile do AppImóveis
# AVISO DE PLATAFORMA: este Makefile é voltado para Linux/macOS (/WSL).
# Ele usa setsid, pgrep, pkill e ~/.dotnet — não funciona no Windows puro.
# No Windows, use os comandos equivalentes diretamente:
#   cd backend && dotnet run --project src/AppImoveis.Api ...
#   cd frontend && npm run dev
# Tudo roda dentro do contexto do make, SEM alterar o PATH/ambiente global.
# O SDK oficial do .NET (que tem o ASP.NET ref pack) fica em ~/.dotnet.
# =============================================================================

SHELL := /bin/bash

# --- Caminhos ---------------------------------------------------------------
ROOT       := $(shell pwd)
BACKEND    := $(ROOT)/backend
FRONTEND   := $(ROOT)/frontend
API_PROJ   := $(BACKEND)/src/AppImoveis.Api/AppImoveis.Api.csproj
API_DLL    := $(BACKEND)/src/AppImoveis.Api/bin/Debug/net10.0/AppImoveis.Api.dll

# --- Dotnet (instalado localmente em ~/.dotnet, opções primeiro no PATH) ----
DOTNET_HOME := $(HOME)/.dotnet
# PATH de execução da RECEITA: coloca ~/.dotnet na frente do /usr/bin/dotnet
export PATH := $(DOTNET_HOME):$(PATH)
export DOTNET_ROOT := $(DOTNET_HOME)

# --- Variáveis de ambiente do projeto (lidas do .env) ----------------------
# Carrega o .env da raiz SEM alterar o shell do usuário (só aqui no make).
# NB: o GNU Make NÃO remove aspas (como o shell faz) — por isso usamos
# $(subst ",,$(...)) para tirar as aspas dos valores e $(strip) para espaços.
-include $(ROOT)/.env

# Pegar cada variável e limpar caracteres que o Npgsql não aceita.
TRIM_DB      := $(strip $(subst ",,$(DATABASE_URL)))
TRIM_DB_U    := $(strip $(subst ",,$(DATABASE_URL_UNPOOLED)))
TRIM_DB_P    := $(strip $(subst ",,$(DATABASE_URL_POOLED)))
TRIM_PG      := $(strip $(subst ",,$(POSTGRES_URL)))
TRIM_GK_BASE := $(strip $(subst ",,$(GECKO_API_BASE_URL)))
TRIM_GK_KEY  := $(strip $(subst ",,$(GECKO_API_KEY)))
TRIM_NEXT    := $(strip $(subst ",,$(NEXT_PUBLIC_API_URL)))

DATABASE_URL          := $(TRIM_DB)
DATABASE_URL_UNPOOLED := $(TRIM_DB_U)
DATABASE_URL_POOLED   := $(TRIM_DB_P)
POSTGRES_URL          := $(TRIM_PG)
GECKO_API_BASE_URL    := $(TRIM_GK_BASE)
GECKO_API_KEY         := $(TRIM_GK_KEY)
NEXT_PUBLIC_API_URL   := $(TRIM_NEXT)

export DATABASE_URL
export DATABASE_URL_UNPOOLED
export DATABASE_URL_POOLED
export POSTGRES_URL
export GECKO_API_BASE_URL
export GECKO_API_KEY
export NEXT_PUBLIC_API_URL

# URLs do backend/frontend
BACKEND_URL := http://localhost:5209
FRONTEND_URL := http://localhost:3000

# --- Utilitários ------------------------------------------------------------
define check_env
	@if [ -z "$$(grep -E '^DATABASE_URL=.*<NEON' $(ROOT)/.env 2>/dev/null)" ]; then \
		echo "OK: DATABASE_URL parece configurada."; \
	else \
		echo "ATENCAO: DATABASE_URL ainda tem placeholder (<NEON_HOST>). Edite $(ROOT)/.env"; \
	fi
	@if [ -z "$$(grep -E '^GECKO_API_KEY=.*<' $(ROOT)/.env 2>/dev/null)" ]; then \
		echo "OK: GECKO_API_KEY parece configurada."; \
	else \
		echo "ATENCAO: GECKO_API_KEY ainda tem placeholder (<YOUR...>). Edite $(ROOT)/.env"; \
	fi
endef

# =============================================================================
# Alvos
# =============================================================================

.PHONY: help env install compile build run run-backend run-frontend check-env seed test clean stop doctor

help:
	@echo ""
	@echo "AppImóveis — comandos disponíveis:"
	@echo "=================================="
	@echo "DIAGNÓSTICO E CONFIGURAÇÃO"
	@echo "----------------------------------"
	@echo "  make help           Mostra esta lista de comandos"
	@echo "  make doctor         Diagnostica o ambiente (dotnet, node, npm, .env)"
	@echo "  make env            Verifica se o .env está configurado"
	@echo ""
	@echo "DEPENDÊNCIAS E BUILD"
	@echo "----------------------------------"
	@echo "  make install        Baixa dependências (dotnet restore + npm install)"
	@echo "  make compile        Compila backend + typecheck do frontend"
	@echo "  make build          Alias de 'compile'"
	@echo ""
	@echo "EXECUÇÃO (SOBE OS SERVIDORES)"
	@echo "----------------------------------"
	@echo "  make run            Sobe backend (:5209) + frontend (:3000) em background"
	@echo "  make run-backend    Sobe somente o backend  (log: .backend.log)"
	@echo "  make run-frontend   Sobe somente o frontend (log: .frontend.log)"
	@echo "  make seed           Busca imóveis reais da GeckoAPI e grava no banco"
	@echo "  make test           Roda os testes do backend (dotnet test)"
	@echo ""
	@echo "LIMPEZA E ENCERRAMENTO"
	@echo "----------------------------------"
	@echo "  make stop           Para backend e frontend que estão em background"
	@echo "  make clean          Apaga builds (.NET bin/obj + frontend .next)"
	@echo ""
	@echo "INTERNOS (usados como dependências de outros alvos)"
	@echo "----------------------------------"
	@echo "  make check-env      Confere DATABASE_URL/GECKO_API_KEY (chamado por run/seed)"
	@echo ""

env:
	$(call check_env)

# ---- Dependências ----------------------------------------------------------
install:
	@echo "==> Restaurando dependências do backend (.NET)..."
	cd $(BACKEND) && dotnet restore $(API_PROJ)
	@echo "==> Instalando dependências do frontend (npm)..."
	cd $(FRONTEND) && npm install

# ---- Compilação ------------------------------------------------------------
compile: install
	@echo "==> Compilando backend..."
	cd $(BACKEND) && dotnet build $(API_PROJ) --no-restore
	@echo "==> Typecheck do frontend (TypeScript)..."
	cd $(FRONTEND) && npx tsc --noEmit
	@echo ""
	@echo "Compilação concluída sem erros."

build: compile

# ---- Execução --------------------------------------------------------------
# Sobe os dois servidores em segundo plano, desacoplados do make.
run: check-env
	@$(MAKE) run-backend
	@$(MAKE) run-frontend
	@echo ""
	@echo "Backend : $(BACKEND_URL)  (teste: curl $(BACKEND_URL)/health)"
	@echo "Frontend: $(FRONTEND_URL)"
	@echo "Vai demorar alguns segundos para o backend compilar na primeira vez."

run-backend: check-env
	@echo "==> Subindo backend em $(BACKEND_URL)..."
	@cd $(BACKEND) && setsid dotnet run --project $(API_PROJ) --urls "$(BACKEND_URL)" \
		> $(ROOT)/.backend.log 2>&1 < /dev/null &
	@sleep 2
	@echo "    Backend iniciado. Log: $(ROOT)/.backend.log"

run-frontend:
	@echo "==> Subindo frontend em $(FRONTEND_URL)..."
	@cd $(FRONTEND) && setsid npm run dev > $(ROOT)/.frontend.log 2>&1 < /dev/null &
	@sleep 2
	@echo "    Frontend iniciado. Log: $(ROOT)/.frontend.log"

check-env:
	$(call check_env)

# ---- Ingestão de dados -----------------------------------------------------
seed: check-env
	@echo "==> Disparando ingestão de imóveis (Guarulhos)..."
	@curl -s -X POST $(BACKEND_URL)/api/seed; echo ""
	@echo "==> Total de imóveis no banco:"
	@curl -s "$(BACKEND_URL)/api/imoveis?pageSize=1" | python3 -c "import sys,json;print(json.load(sys.stdin)['total'])" 2>/dev/null || echo "(api ainda subindo? rode make run primeiro)"

# ---- Testes -----------------------------------------------------------------
test:
	@echo "==> Rodando testes do backend..."
	cd $(BACKEND) && dotnet test tests/AppImoveis.Tests/AppImoveis.Tests.csproj

# ---- Limpeza ---------------------------------------------------------------
clean:
	@echo "==> Limpando builds do backend (.NET)..."
	@cd $(BACKEND) && find src tests -type d \( -name bin -o -name obj \) -prune -exec rm -rf {} + 2>/dev/null || true
	@echo "==> Limpando artefatos do frontend (.next)..."
	@rm -rf $(FRONTEND)/.next
	@rm -rf $(FRONTEND)/tsconfig.tsbuildinfo 2>/dev/null || true
	@echo "Limpo. (node_modules preservado; use 'make install' se quiser reinstalar)."

# ---- Parar processos -------------------------------------------------------
stop:
	@echo "==> Parando frontend (next dev / next-server)..."
	@-kill $$(pgrep -f "[n]ext dev") 2>/dev/null; echo "    next dev ok"
	@-kill $$(pgrep -f "[n]ext-server") 2>/dev/null; echo "    next-server ok"
	@echo "==> Parando backend (AppImoveis.Api)..."
	@-kill $$(pgrep -f "[A]ppImoveis.Api.dll") 2>/dev/null; echo "    Api.dll ok"
	@-kill $$(pgrep -f "[A]ppImoveis.Api") 2>/dev/null; echo "    Api ok"
	@echo "Processos encerrados."

# =============================================================================
# Detecta dependências ausentes e dá orientação (sem alterar o sistema)
# =============================================================================
.PHONY: doctor
doctor:
	@echo "==> Diagnóstico do ambiente =="
	@printf "dotnet (via make PATH): "; (dotnet --version 2>/dev/null || echo "FALTA — rode: curl -fsSL https://dot.net/v1/dotnet-install.sh -o /tmp/d.sh && chmod +x /tmp/d.sh && /tmp/d.sh --channel 10.0")
	@printf "node: "; (node --version 2>/dev/null || echo "FALTA")
	@printf "npm: "; (npm --version 2>/dev/null || echo "FALTA")
	@printf "aspnet-runtime (~/.dotnet): "; (test -d $(DOTNET_HOME)/shared/Microsoft.AspNetCore.App && echo "ok" || echo "FALTA no ~/.dotnet")
	@printf "SDK oficial ~/.dotnet: "; (test -d $(DOTNET_HOME)/sdk && echo "ok" || echo "FALTA — rode: curl -fsSL https://dot.net/v1/dotnet-install.sh -o /tmp/d.sh && chmod +x /tmp/d.sh && /tmp/d.sh --channel 10.0")
	@echo ""
	$(call check_env)
