# Dockerfile — Serviço mass-messaging (Rust)
#
# Multi-stage build:
#   1. Build: compila o binário em modo release (otimizado)
#   2. Runtime: imagem mínima (debian slim) apenas com o binário
#
# Base leve para compilar Rust (imagem oficial do ecossistema Rust).
FROM rust:1.84.0-bookworm AS build

WORKDIR /app

# Copia os manifests e o código-fonte
COPY Cargo.toml Cargo.lock* ./
COPY src ./src

# Compila em release (produz binário otimizado).
# Na primeira build as dependências também são baixadas/compiladas.
RUN cargo build --release

# ---------- Runtime ----------
FROM debian:bookworm-slim AS runtime

WORKDIR /app

# curl é usado pelo healthcheck do docker-compose
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Copia o binário compilado do estágio de build
COPY --from=build /app/target/release/mass-messaging /usr/local/bin/mass-messaging

# Expoõe a porta
EXPOSE 8080

# Executa o binário
CMD ["mass-messaging"]
