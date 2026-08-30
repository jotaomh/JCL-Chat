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
- Paleta base: preto/branco + **azul bebê** de destaque
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
│   ├── alembic.ini       # Configuração das migrações de banco
│   ├── alembic/          # Migrações (env.py + versions/)
│   ├── requirements.txt  # Dependências Python
│   └── src/
│       ├── main.py       # Ponto de entrada da API
│       └── app/
│           ├── routers/  # Conjuntos de endpoints (auth, users...)
│           ├── schemas/  # Validação de dados (Pydantic)
│           ├── models/   # Modelos de banco (SQLAlchemy)
│           ├── services/ # Lógica de negócio (senha/JWT em security.py)
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

### 🔐 Autenticação (cadastro + login + recuperação de senha)

A API tem autenticação real usando **JWT** e senhas com hash **bcrypt** (nunca salvas em texto puro). O cadastro coleta a **data de nascimento** (`birth_date`), validada no backend (idade mínima de 13 anos — a idade é calculada a partir da data, então nunca fica desatualizada). Fluxo ponta a ponta:

```bash
# 1) Cadastro — retorna os dados do usuário (sem token)
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"fulano","email":"fulano@email.com","password":"minhasenha","birth_date":"2000-01-15"}'

# 2) Login — retorna o token JWT (validade de 24h)
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"fulano@email.com","password":"minhasenha"}'

# 3) /me — endpoint protegido; envia o token no header Authorization
curl http://localhost:8000/api/users/me \
  -H "Authorization: Bearer <TOKEN_AQUI>"
```

- **`POST /api/auth/register`**: valida se `username`/`email` já existem (erro **409** se repetem), valida a data de nascimento (rejeita datas no futuro ou que resultem em menos de 13 anos — **422**), gera o hash bcrypt da senha e salva. NUNCA devolve o hash.
- **`POST /api/auth/login`**: valida as credenciais e devolve o JWT. Em caso de erro retorna **401** com mensagem genérica (não revela se errou o e-mail ou a senha).
- **`GET /api/users/me`**: protegido por token (requer header `Authorization: Bearer <token>`); devolve os dados do usuário logado.

#### Esqueci minha senha (recuperação)

Fluxo em duas etapas com **e-mail real via Resend** (o link também fica no log do servidor, o que ajuda nos testes locais — ver `api/src/app/routers/auth.py` e `api/src/app/services/email.py`):

```bash
# 1) Solicita recuperação — responde SEMPRE a mesma mensagem, existindo ou
#    não o e-mail (não revela se o endereço está cadastrado, por segurança).
curl -X POST http://localhost:8000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"fulano@email.com"}'
# -> {"message":"Se este e-mail existir, um link de recuperação foi enviado."}

# 2) Redefine a senha com o token recebido por e-mail (uso único, expira em 1h)
curl -X POST http://localhost:8000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"<TOKEN_DO_LINK>","new_password":"novasenha123"}'
```

- **`POST /api/auth/forgot-password`**: gera um token de recuperação com expiração curta (1 hora), guarda **só o hash** do token no banco e envia o e-mail de verdade via **Resend**. Se o envio falhar (chave ausente/erro na API), apenas logamos no servidor — a resposta continua sempre a mesma (não revela se o e-mail existe).
- **`POST /api/auth/reset-password`**: valida o token (existe, não expirou, ainda não usado), atualiza o hash da senha e **invalida** o token (uso único). Tokens inválidos, expirados ou já usados respondem **400** com a mesma mensagem genérica.

### 🗃️ Migrações (Alembic)

As tabelas do banco são gerenciadas pelo **Alembic**. Ao subir o container da API, o `alembic upgrade head` roda **automaticamente** antes do Uvicorn (veja o `CMD` do `api/Dockerfile`).

Para rodar manualmente (por exemplo, fora do Docker):

```bash
cd api
# O comando lê a DATABASE_URL das variáveis de ambiente (settings.py)
alembic upgrade head    # aplica as migrações pendentes
alembic downgrade base  # desfaz todas
alembic revision --autogenerate -m "descricao"   # gera nova migração a partir dos modelos
```

- A migration inicial (`alembic/versions/0001_...`) cria a tabela `users`.
- A migration `0002` adiciona a coluna `birth_date` em `users` (obrigatória) e cria a tabela `password_reset_tokens` (tokens de recuperação de senha). **Ao atualizar um banco já existente, rode `alembic upgrade head`** (ou suba a API, que o faz sozinha).

### Parar/limpar tudo

```bash
# Parar os containers (mas mantém os dados do banco)
docker compose down

# Parar E apagar os volumes (apaga os dados do banco) — cuidado!
docker compose down -v
```

---

## 🐘 Banco de Dados e Como Rodar do Zero (para iniciantes)

> Se você é novo em Docker/backend, esta seção explica com calma como subir
> o projeto do zero e como "espiar" dentro do banco de dados para ver os
> usuários que você cadastrar. Tudo é feito pelo terminal, sem precisar
> instalar nada além do **Docker**.

### Passo a passo para iniciar o projeto do zero

1. **Entre na pasta do projeto** (onde está o arquivo `docker-compose.yml`):

   ```bash
   cd JCL-Chat
   ```

2. **Crie o arquivo de ambiente** a partir do modelo. Isso "liga" as variáveis
   de configuração (banco, chaves, URLs) sem você precisar inventar valores:

   ```bash
   cp .env.example .env
   ```

3. **Suba todos os serviços** (frontend, api, realtime, mass-messaging e o
   PostgreSQL). O `--build` compila as imagens na primeira vez:

   ```bash
   docker compose up --build
   ```

   - Rode com `-d` para voltar a usar o terminal e deixar tudo rodando no
     "fundo": `docker compose up --build -d`.
   - **A primeira vez demora** (baixa imagens e compila). Nas próximas é rápido.

4. **Confira se subiu certo:**

   ```bash
   docker compose ps
   ```

   - Os serviços devem aparecer com status **`Up`** e, onde houver, **(healthy)**.
   - O serviço da **api** aplica as migrações do banco automaticamente ao subir
     (cria a tabela `users`) e só então inicia o servidor.
   - Se algo falhar, veja os logs com `docker compose logs -f`.

5. **Abra o projeto no navegador**: <http://localhost:3000> (frontend) e
   <http://localhost:8000/docs> (documentação interativa da API).

### Como ver os dados salvos no banco

Você pode olhar dentro do PostgreSQL de duas formas: pelo **terminal** ou por
uma **ferramenta gráfica**.

#### Opção A — Pelo terminal (psql)

O `psql` é o programa de terminal do PostgreSQL. Ele **já está dentro** do
container do banco, então não precisa instalar nada:

```bash
# "Entra" dentro do container do banco e abre o psql.
# -U jcl    → usuário do banco (veja POSTGRES_USER no seu .env)
# -d jcl_chat → nome do banco (veja POSTGRES_DB no seu .env)
docker compose exec db psql -U jcl -d jcl_chat
```

Dentro do psql, o prompt muda para `jcl_chat=#`. Comandos úteis:

```sql
\dt                 -- lista as tabelas do banco (deve aparecer "users")
SELECT * FROM users;  -- mostra todos os usuários cadastrados
\q                  -- sai do psql
```

> **Dica:** cadastre um usuário no site (ou via API) e rode o `SELECT * FROM users;`
> para vê-lo aparecer. A coluna `password_hash` guarda a senha **transformada
> em hash** (começa com `$2b$`), nunca a senha em texto puro — é assim que deve ser.

#### Opção B — Com uma ferramenta gráfica (opcional)

Se preferir não usar terminal, instale um programa com interface gráfica, por
exemplo o **DBeaver** (grátis, <https://dbeaver.io>) ou o **TablePlus**
(<https://tableplus.com>). Os dados que ele pede para conectar são:

| Campo | Valor |
|-------|-------|
| Tipo/banco | PostgreSQL |
| Host | `localhost` |
| Porta | `5432` (ou o valor de `POSTGRES_PORT` no seu `.env`) |
| Banco de dados | o valor de `POSTGRES_DB` no seu `.env` (padrão `jcl_chat`) |
| Usuário | o valor de `POSTGRES_USER` no seu `.env` (padrão `jcl`) |
| Senha | o valor de `POSTGRES_PASSWORD` no seu `.env` |

> 🔒 **Segurança:** olhe a porta/usuário/senha **no seu próprio `.env`** (que não
> é versionado). Não escreva a senha real em lugar nenhum (nem aqui, nem em
> código, nem em comentários que vão para o Git).

### Como rodar a migração do banco manualmente

As migrações (criar/alterar tabelas) normalmente rodam sozinhas quando a `api`
sobe. Mas se precisar aplicá-las manualmente — por exemplo depois de recriar o
banco — rode:

```bash
docker compose exec api alembic upgrade head
```

Isso executa o Alembic **dentro do container da API**, criando/atualizando as
tabelas para a versão mais recente (`head`).

### Como resetar o banco de dados do zero

"Resetar" apaga **todos** os dados e recria o banco limpo. Útil quando você quer
começar do zero ou consertou algo que quebrou o schema.

```bash
# 1) Para os containers E apaga o volume do PostgreSQL (os dados somem!)
docker compose down -v

# 2) Sobe tudo de novo (a api recria as tabelas automaticamente via migração)
docker compose up --build
```

> ⚠️ **Atenção:** o `-v` apaga **todos** os dados armazenados (usuários, etc.).
> Só use quando realmente quiser recomeçar do zero.

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

> 🔒 **Importante — o realtime está fixo em Erlang/OTP 25.2.3** (ver `realtime/Dockerfile`) de
> propósito, por causa de um bug de certificado TLS do Erlang/OTP 27 com o hex.pm.
> **Ao adicionar qualquer dependência Elixir/Erlang nova ao `realtime`, confira antes se ela é
> compatível com OTP 25** — muitas libs recentes já assumem OTP 27+ como padrão e quebram o build.
>
> Exemplo concreto: a lib `jose` (que o `joken` usa por baixo para JWT) passou a usar o type
> `dynamic()` (só existe no OTP 27+) a partir da versão **1.11.11**, quebrando o build no OTP 25 com
> `type dynamic() undefined`. Por isso `realtime/mix.exs` trava a `jose` na **versão exata `1.11.10`**
> (a última que suporta OTP 25) com `override: true`. Se encontrar erro parecido ao atualizar deps,
> é sinal de que alguma dependência passou a exigir OTP 27 — não mude a versão do OTP, e sim a
> dependência (ou trave-a numa versão compatível).

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
| `SECRET_KEY` / `ALGORITHM` | api **e** realtime | Chave e algoritmo do JWT. **O `realtime` precisa da mesma `SECRET_KEY` da `api`** para validar o token emitido no login (HS256). Mantenha sempre iguais nos dois serviços. |
| `CORS_ORIGINS` | api | Origens permitidas para o frontend |
| `RESEND_API_KEY` | api | Chave de API do Resend (https://resend.com) para o fluxo de **recuperação de senha**. Necessária para o e-mail ser enviado de verdade. |
| `EMAIL_FROM` | api | Remetente dos e-mails (padrão `onboarding@resend.dev` — **remetente de TESTES**) |
| `VITE_API_URL` / `VITE_WS_URL` | frontend | URLs dos backends (usadas pelo navegador) |
| `VITE_API_PROXY_TARGET` / `VITE_SOCKET_PROXY_TARGET` | frontend | Alvos do proxy do Vite (Docker usa os nomes dos serviços `api`/`realtime`) |

> 🔑 **Sobre o Resend:** o fluxo de esqueci minha senha precisa de uma conta gratuita no
> [Resend](https://resend.com) com a chave de API no `api/.env` (`RESEND_API_KEY`). **Importante:**
> enquanto não houver um **domínio próprio verificado** no Resend, o remetente padrão
> (`EMAIL_FROM=onboarding@resend.dev`) é o de **testes** e **só entrega para o e-mail usado no
> cadastro da conta Resend** — com muitos usuários reais, será preciso verificar um domínio e
> trocar o `EMAIL_FROM`. A chave real vive **só no `.env`** (nunca no repo).

---

## 🗺️ Roadmap (próximas etapas)

- [x] **Etapa 1**: Estrutura do projeto + "hello world" em cada serviço + Docker Compose
- [x] **Etapa 2**: Banco de dados + autenticação real (JWT) + cadastro/login + endpoint `/me` — agora com **data de nascimento** validada (idade mín. 13), **telas de auth** em cartão centralizado (login, cadastro, esqueci minha senha, redefinir senha) e fluxo **esqueci minha senha** funcional (token com expiração curta + uso único; link logado no servidor, e-mail real fica como TODO)
- [ ] **Etapa 3**: Sistema de amizades + grupos/comunidades
- [ ] **Etapa 4**: Chat de texto em tempo real (Phoenix Channels) — socket autenticado com JWT e sala `lobby` funcionando; faltam grupos/canais múltiplos
- [ ] **Etapa 5**: Chamadas de voz/vídeo (WebRTC)
- [ ] **Etapa 6**: Compartilhamento de tela
- [ ] **Etapa 7**: Temas gamer/escritório funcionais nas configurações (destaque já trocado para azul bebê)

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
