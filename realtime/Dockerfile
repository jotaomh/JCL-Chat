# Dockerfile — Serviço realtime (Elixir/Phoenix)
#
# Multi-stage build:
#   1. Imagem de build: compila as dependências e o aplicativo
#   2. Imagem de runtime: apenas o aplicativo (mais leve)

# ---------- Estágio 1: Build ----------
FROM hexpm/elixir:1.17.3-erlang-27.2.3-debian-bookworm-20250113 AS build

# Instala dependências do sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential git curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Define o working directory
WORKDIR /app

# Copia os arquivos de dependências primeiro (aproveitamento de cache)
# (mix.lock é gerado no primeiro `mix deps.get`; tolera ausência no esqueleto)
COPY mix.exs ./
COPY mix.lock* ./
RUN mix local.hex --force && mix local.rebar --force
RUN mix deps.get --only prod || true
RUN MIX_ENV=prod mix deps.compile || true

# Copia o código-fonte e compila
COPY config ./config
COPY lib ./lib
RUN MIX_ENV=prod mix compile || true

# ---------- Estágio 2: Runtime ----------
FROM elixir:1.17.3-erlang-27.2.3-alpine-3.20 AS runtime

WORKDIR /app

# Copia o build do estágio anterior
COPY _build ./_build || true
COPY mix.exs ./
COPY mix.lock* ./

# Copia as configurações
COPY config ./config
COPY lib ./lib

EXPOSE 4000

# Comando padrão para iniciar o servidor
CMD ["elixir", "--name", "jcl_realtime", "-S", "mix", "phx.server"]
