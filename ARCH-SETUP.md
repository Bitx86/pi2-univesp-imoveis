# Setup do AppImóveis no Arch Linux

Guia passo a passo para um Arch Linux rodar o projeto inteiro usando o `Makefile`
(que fica na raiz do repositório). Se você já tiver instalado partes disso,
pule o que não for necessário — o `make doctor` no final te diz o que falta.

> **Não precisa configurar nada no PATH global.** O `Makefile` exporta `PATH`
> e `DOTNET_ROOT` apenas dentro do próprio comando `make`.

---

## 1. Pré-requisitos do sistema

```bash
sudo pacman -S git make curl
```

O `bash`, `grep`, `sed`, `coreutils` já vêm por padrão no Arch.

## 2. Node.js + npm (frontend)

```bash
sudo pacman -S nodejs npm
```

Isso puxa também `node-gyp` e `nodejs-nopt` como dependências (normais).

## 3. SDK do .NET 10 oficial (NÃO use o pacote do Arch!)

⚠️ **Importante:** o pacote `dotnet-sdk-10.0` do Arch tem um problema — falta o
`Microsoft.AspNetCore.App.Ref` (ref pack do ASP.NET), o que causa o erro
`NETSDK1226` na hora de compilar. Use o instalador oficial da Microsoft, que
coloca tudo em `~/.dotnet` (sem tocar no sistema):

```bash
curl -fsSL https://dot.net/v1/dotnet-install.sh -o /tmp/dotnet-install.sh
chmod +x /tmp/dotnet-install.sh
/tmp/dotnet-install.sh --channel 10.0
```

Isso instala o SDK **com** o runtime do ASP.NET incluído. Depois confirme:

```bash
~/.dotnet/dotnet --version
# deve mostrar algo como: 10.0.4xx
```

> Se no futuro você não quiser mais o dotnet oficial, é só apagar a pasta
> `~/.dotnet`.

## 4. Credenciais do projeto (.env)

O repositório NÃO traz o `.env` (tem segredos). Crie a partir do template e
preencha com **suas** credenciais:

```bash
cp .env.example .env
nano .env
```

Campos que você precisa preencher com dados seus (Neon/GeckoAPI etc.):

- `DATABASE_URL` — string de conexão no formato Npgsql, ex.:
  `Host=<host-do-neon>; Database=<bd>; Username=<usuário>; Password=<senha>; SSL Mode=VerifyFull; Channel Binding=Require;`
- `GECKO_API_BASE_URL` — base da GeckoAPI
- `GECKO_API_KEY` — sua chave
- `NEXT_PUBLIC_API_URL=http://localhost:5209`

> O modelo `.env.example` na raiz mostra a lista completa de variáveis.

## 5. Instalar dependências e compilar

```bash
make install     # dotnet restore + npm install
make compile     # compila backend + typecheck do frontend
```

## 6. Checar se está tudo pronto

```bash
make doctor
```

Ele mostra: `dotnet`, `node`, `npm`, `aspnet-runtime` do `~/.dotnet`, SDK oficial
e se o `.env` está preenchido.

## 7. Rodar

```bash
make run         # sobe backend (:5209) + frontend (:3000) em segundo plano
```

Depois abra http://localhost:3000 . Os logs ficam em `.backend.log` e
`.frontend.log`.

Para carregar imóveis reais (ingestão via API):

```bash
make seed
```

Para parar tudo:

```bash
make stop
```

---

## Referência rápida dos comandos

| Comando             | O que faz                                    |
|---------------------|----------------------------------------------|
| `make doctor`       | Diagnóstico do ambiente (o que está faltando)|
| `make install`      | Baixa dependências (restore + npm install)   |
| `make compile`      | Compila backend + typecheck frontend         |
| `make run`          | Sobe backend e frontend em background        |
| `make run-backend`  | Sobe só o backend                            |
| `make run-frontend` | Sobe só o frontend                           |
| `make seed`         | Busca imóveis da API e grava no banco        |
| `make stop`         | Para backend e frontend                      |
| `make test`         | Roda os testes do backend                    |
| `make clean`        | Apaga builds (bin/obj e .next)               |

## Solução de problemas

- **`dotnet` não encontrado ao rodar `make`:**
  Rode o instalador oficial da Microsoft (passo 3). O `make` usa
  `~/.dotnet/dotnet` automaticamente.
- **`NETSDK1226` / ref pack ausente:**
  Certifique-se de que o SDK usado é o de `~/.dotnet`, não o pacote do Arch.
- **Frontend não acha o backend:**
  Confira se `NEXT_PUBLIC_API_URL=http://localhost:5209` está no `.env` e se o
  backend subiu (`curl -s http://localhost:5209/health`).
- **Mapa sem tiles:**
  O mapa usa OpenStreetMap/Esri (sem chave). Se não carregar, verifique acesso
  a `tile.openstreetmap.org` (pode precisar de proxy/HTTPS).