# 🖥️ JCL-Chat

> Plataforma de chamadas de voz/vídeo e compartilhamento de tela, estilo Discord — construída como projeto de estudo.

**Status atual**: MVP (estrutura básica / "hello world" em cada serviço)

---

## 📖 Visão Geral

O **JCL-Chat** é um projeto de estudo que almeja replicar as funcionalidades principais de uma plataforma de comunicação estilo Discord:

- 📝 Chat de texto em tempo real
- 📹 Chamadas de voz/vídeo
- 🖥️ Compartilhamento de tela
- 👥 Sistema de amizades
- 🏘️ Grupos e comunidades

A escolha da stack foi pensada para **aprendizado** e para **custos baixos** (estudante): todas as tecnologias utilizadas são gratuitas, open-source e com documentação rica.

### Identidade visual
- Paleta base: preto, branco e vermelho de destaque (inspirado no escudo do Corinthians 🦅)
- Dois temas alternáveis nas configurações:
  - **Gamer**: dark mode "gamer" (padrão)
  - **Escritório**: tema claro/neutro

---

## 🧱 Stack Utilizada e Por Quê

| Camada | Tecnologia | Porquê |
|--------|------------|--------|
| **Front-end** | React + TypeScript (Vite) | Ecossistema enorme, fácil de achar docs, componentes reutilizáveis |
| **Tempo real** | Elixir / Phoenix + Channels | Excelente para milhões de conexões WebSocket simultâneas (BEAM VM) |
| **API REST** | Python / FastAPI | Rápido de desenvolver, ótimo para autenticação e (futuro) ML/analytics |
| **Broadcast em massa** | Rust (axum) | Máxima performance e controle de memória p/ mensagens em massa |
| **Realtime Web - cliente** | WebSocket (texto) + WebRTC (voz/vídeo/tela) | Padrões abertos, rodam no navegador sem custo |
| **Banco de dados** | PostgreSQL | Open-source, robusto, relacional (relacionamentos entre usuários/grupos) |
| **Infra dev** | Docker + Docker Compose | Um container por serviço, fácil de replicar em qualquer máquina |

### Por que essa arquitetura (vantagens):
- **Separação de responsabilidades**: cada serviço faz bem UMA coisa.
- **Escala individual**: o serviço que estiver sobrecarregado pode ser escalado sozinho.
- **Aprendizado**: você exercita 5 linguagens/frameworks diferentes no mesmo projeto.

### Sobre WebRTC vs WebSocket
- **WebSocket**: transporte para mensagens de texto e para o *signaling* (troca de "ofertas" de conexão) das chamadas.
- **WebRTC**: transporte real de áudio/vídeo/tela — P2P, direto entre navegadores, sem custo de servidor de mídia.

---

## 📁 Estrutura de Pastas

```text
JCL-Chat/
├── frontend/             # React + TypeScript (Vite)
│   ├── public/           # Arquivos estáticos
│   ├── src/
│   │   ├── components/   # Componentes reutilizáveis (botões, modais...)
│   │   ├── hooks/        # Hooks customizados (useAuth, useTheme...)
│   │   ├── pages/        # Páginas (Login, Canais, Chamadas)
│   │   ├── services/     # Chamadas HTTP à API (api.ts)
│   │   ├── styles/       # CSS dos componentes
│   │   ├── types/        # Tipos TypeScript (User, Group, etc.)
│   │   ├── utils/        # Funções auxiliares
│   │   ├── App.tsx       # Componente raiz + rotas
│   │   └── main.tsx      # Ponto de entrada (monta o React)
│   ├── Dockerfile        # Build de PRODUÇÃO (multi-stage + nginx)
│   ├── Dockerfile.dev    # Build de DESENVOLVIMENTO (Node + Vite, hot-reload)
│   ├── nginx.conf        # Config do servidor de produção
│   └── .env.example      # Variáveis de ambiente do frontend
│
├── realtime/             # Elixir / Phoenix (WebSocket + Channels)
│   ├── config/           # Configurações (dev, prod, etc.)
│   └── lib/
│       ├── jcl_chat/     # Lógica da aplicação (Application)
│       └── jcl_chat_web/ # Camada web (Endpoint, Socket, Channels)
│
├── api/                  # Python / FastAPI (REST)
│   └── src/
│       ├── main.py       # Ponto de entrada da API
│       └── app/
│           ├── routers/  # Conjuntos de endpoints (auth, users...)
│           ├── schemas/  # Validação de dados (Pydantic)
│           ├── models/   # Modelos de banco (SQLAlchemy)
│           ├── services/ # Lógica de negócio
│           └── config/   # Configurações
│
├── mass-messaging/       # Rust (axum) — broadcast em massa
│   └── src/main.rs       # Servidor HTTP + health check
│
├── docker-compose.yml    # Sobe todos os serviços de uma vez
├── install-docker.sh     # Instala Docker em Linux (Debian/Ubuntu/Arch)
├── .env.example          # Modelo de variáveis de ambiente
└── README.md
```

---

## 🚀 Pré-requisitos

Para rodar o projeto de forma mais simples, **Docker + Docker Compose** (recomendado). Você também pode rodar cada serviço isoladamente (ver seção [Debug](#-rodando-cada-serviço-isoladamente)).

### ✅ Instalar Docker via script (Linux — Ubuntu/Debian/Pop!_OS e Arch)

```bash
# Torne o script executável
chmod +x install-docker.sh

# Execute (o terminal pedirá sua senha para o sudo, interativamente)
./install-docker.sh
```

> 🔒 **Segurança**: o script usa apenas `sudo` interativo — ele **nunca** pede, recebe ou armazena sua senha em lugar nenhum. O próprio terminal solicita a senha no momento. Ao final ele adiciona você ao grupo `docker`, então depois de reiniciar a sessão você não precisará mais de `sudo` para Docker.

---

## 🛠️ Instalação para Desenvolvedores

### Linux (Ubuntu / Debian / Pop!_OS)

**Docker (via script ou manual):**

```bash
# Opção 1 — script automático
./install-docker.sh

# Opção 2 — manual
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
sudo apt-get install -y docker.io docker-compose-v2
sudo systemctl enable --now docker
sudo usermod -aG docker $USER   # sair e entrar de novo
```

### Linux (Arch Linux e derivados)

**Docker:**

```bash
sudo pacman -Syu
sudo pacman -S docker docker-compose
sudo systemctl enable --now docker
sudo usermod -aG docker $USER   # sair e entrar de novo
```

### Windows

1. Baixe o **Docker Desktop** em: <https://www.docker.com/products/docker-desktop/>
2. Rode o instalador e siga as instruções (necessário WSL2 e Hyper-V).
3. Após instalar, abra o **Docker Desktop** e aguarde ele iniciar.

> **Dica**: para um terminal estilo Linux no Windows, use o **WSL2** e instale o Docker dentro dele, ou use o PowerShell.

### macOS

1. Baixe o **Docker Desktop** em: <https://www.docker.com/products/docker-desktop/>
2. Abra o `.dmg` e arraste o app para a pasta `Aplicativos`.
3. Abra o **Docker Desktop** (primeira execução pede permissão e talvez reiniciar).

---

## ▶️ Como Subir o Projeto (Docker Compose)

```bash
# 1. (Recomendado) Criar o arquivo de ambiente a partir do modelo
cp .env.example .env

# 2. (Opcional, mas recomendado em produção) Preencha senhas/chaves reais no .env
#    Use: openssl rand -hex 32  para chaves secretas

# 3. Subir todos os serviços
docker compose up --build

# Para rodar em segundo plano (detached)
docker compose up --build -d

# Ver os logs de todos os serviços
docker compose logs -f

# Ver o status dos serviços
docker compose ps
```

### Portas expostas

| Serviço | Porta | URL |
|---------|-------|-----|
| Frontend (Vite dev) | 3000 | <http://localhost:3000> |
| Realtime (Phoenix) | 4000 | <http://localhost:4000> |
| API (FastAPI + Swagger) | 8000 | <http://localhost:8000> / <http://localhost:8000/docs> |
| Mass-messaging (Rust) | 8080 | <http://localhost:8080> |
| PostgreSQL | 5432 | (interno, via containers) |

> 📌 **Desenvolvimento vs Produção (Docker):**
> - O `docker-compose.yml` usa, por padrão, os **Dockerfiles de desenvolvimento** para rodar o projeto localmente (frontend rodeia o **Vite** com hot-reload na porta 3000; o realtime é uma imagem de estágio único que compila e sobe com `mix phx.server`).
> - Para construir a versão de **produção**, altere no `docker-compose.yml` o campo `dockerfile:` do serviço `frontend` de `Dockerfile.dev` para `Dockerfile` (gera estáticos servidos por **nginx** na porta **80** interna).
> - As portas **3000 (frontend), 4000 (realtime), 8000 (api) e 8080 (mass-messaging)** são mantidas consistentes entre `EXPOSE`, o `docker-compose.yml` e o servidor real em cada container.

### Testando o "hello world" de cada serviço

```bash
# Frontend
curl http://localhost:3000

# Realtime (Elixir)
curl http://localhost:4000
curl http://localhost:4000/api/health

# API (Python) — a documentação interativa fica em /docs
curl http://localhost:8000/
curl http://localhost:8000/api/health

# Rust
curl http://localhost:8080/
curl http://localhost:8080/api/health
```

### Parar/limpar tudo

```bash
# Parar os containers (mas mantém os dados do banco)
docker compose down

# Parar E apagar os volumes (apaga os dados do banco) — cuidado!
docker compose down -v
```

---

## 🧪 Rodando Cada Serviço Isoladamente (para Debug)

Cada serviço pode rodar fora do Docker, ideal para desenvolver e debugar com recarga automática.

### Frontend (React + Vite)

```bash
cd frontend
npm install           # instala dependências (na primeira vez)
npm run dev           # sobe em http://localhost:3000
```

Comandos úteis:
- `npm run build` — gera a versão de produção em `dist/`
- `npm run lint` — verifica estilo/erros de código

### Realtime (Elixir/Phoenix)

```bash
cd realtime
# Instale Elixir: https://elixir-lang.org/install.html
mix local.hex --force
mix deps.get          # baixa as dependências
iex -S mix phx.server # sobe em http://localhost:4000 (com console interativo)
```

### API (Python/FastAPI)

```bash
cd api
python3 -m venv .venv              # cria ambiente virtual (isolado)
source .venv/bin/activate          # ativa o ambiente (Linux/macOS)
pip install -r requirements.txt    # instala dependências
uvicorn src.main:app --reload      # sobe em http://localhost:8000
```

Dica: Navegue até `http://localhost:8000/docs` para a documentação interativa (Swagger).

### Mass-messaging (Rust)

```bash
cd mass-messaging
# Instale Rust: https://rustup.rs/
cargo run   # sobe em http://localhost:8080
```

---

## 🗝️ Variáveis de Ambiente

Todas as variáveis estão documentadas no arquivo **`.env.example`** (na raiz e em cada serviço).

**Regras de segurança importantes:**

1. **Nunca** coloque senhas/chaves reais no código ou nos arquivos versionados.
2. Copie `.env.example` para `.env` e preencha ali (`.env` está no `.gitignore`).
3. Os `.env` **não** são enviados ao Git — verifique sempre com `git status`.
4. Para chaves secretas, use: `openssl rand -hex 32`.

| Variável | Serviço | Descrição |
|----------|---------|-----------|
| `POSTGRES_DB` / `POSTGRES_USER` / `POSTGRES_PASSWORD` | db | Credenciais do banco |
| `SECRET_KEY_BASE` | realtime | Chave secreta do Phoenix |
| `SECRET_KEY` / `ALGORITHM` | api | Chave e algoritmo do JWT |
| `CORS_ORIGINS` | api | Origens permitidas para o frontend |
| `VITE_API_URL` / `VITE_WS_URL` | frontend | URLs dos backends |

---

## 🗺️ Roadmap (próximas etapas)

- [x] **Etapa 1 (atual)**: Estrutura do projeto + "hello world" em cada serviço + Docker Compose
- [ ] **Etapa 2**: Banco de dados + autenticação real (JWT) + cadastro/login
- [ ] **Etapa 3**: Sistema de amizades + grupos/comunidades
- [ ] **Etapa 4**: Chat de texto em tempo real (Phoenix Channels)
- [ ] **Etapa 5**: Chamadas de voz/vídeo (WebRTC)
- [ ] **Etapa 6**: Compartilhamento de tela
- [ ] **Etapa 7**: Temas gamer/escritório funcionais nas configurações

---

## 🧰 Ferramentas e Referências

- **React**: <https://react.dev>
- **Vite**: <https://vitejs.dev>
- **Elixir / Phoenix**: <https://elixir-lang.org> / <https://www.phoenixframework.org>
- **FastAPI**: <https://fastapi.tiangolo.com>
- **Rust / axum**: <https://www.rust-lang.org> / <https://docs.rs/axum>
- **WebRTC**: <https://webrtc.org> / <https://developer.mozilla.org/pt-BR/docs/Web/API/WebRTC_API>
- **PostgreSQL**: <https://www.postgresql.org>
- **Docker**: <https://docs.docker.com>

---

## 📄 Licença

Ver arquivo [LICENSE](./LICENSE) na raiz do repositório.
