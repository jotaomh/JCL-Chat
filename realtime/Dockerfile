# Dockerfile — Serviço realtime (Elixir/Phoenix)
#
# Multi-stage build:
#   1. Imagem de build: compila as dependências e o aplicativo
#   2. Imagem de runtime: apenas o aplicativo (mais leve)

# ---------- Estágio 1: Build ----------
FROM hexpm/elixir:1.18.5-erlang-27.1.3-alpine-3.22.5 AS build

# Instala dependências do sistema
RUN apk add --no-cache build-base git curl ca-certificates

# Define o working directory
WORKDIR /app

# Copia os arquivos de dependências primeiro (aproveitamento de cache)
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
FROM hexpm/elixir:1.18.5-erlang-27.1.3-alpine-3.22.5 AS runtime

RUN apk add --no-cache libstdc++ ncurses-libs openssl

WORKDIR /app

# Copia o build do estágio anterior
COPY _build ./_build
COPY mix.exs ./
COPY mix.lock* ./

# Copia as configurações
COPY config ./config
COPY lib ./lib

EXPOSE 4000

# Comando padrão para iniciar o servidor
CMD ["elixir", "--name", "jcl_realtime", "-S", "mix", "phx.server"]