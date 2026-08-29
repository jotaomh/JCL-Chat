# Dockerfile — Serviço mass-messaging (Rust)
#
# Multi-stage build:
#   1. Build: baixa dependências e compila em release (otimizado)
#   2. Runtime: imagem mínima (scratch/alpine) apenas com o binário
#
# Base leve para compilar Rust
FROM rust:1.84.0-bookworm AS build

WORKDIR /app

# Copia os manifests primeiro (cache eficiente das dependências)
COPY Cargo.toml Cargo.lock* ./

# Baixa as dependências compilando um binário vazio
RUN mkdir -p src && echo "fn main(){}" > src/main.rs \
    && cargo build --release || true \
    && rm -rf src

# Copia o código real
COPY src ./src

# Compila em release (produz binário otimizado)
RUN cargo build --release

# ---------- Runtime ----------
FROM debian:bookworm-slim AS runtime

WORKDIR /app

# Copia o binário compilado
COPY --from=build /app/target/release/mass-messaging /usr/local/bin/mass-messaging

# Expoõe a porta
EXPOSE 8080

# Executa o binário
CMD ["mass-messaging"]
