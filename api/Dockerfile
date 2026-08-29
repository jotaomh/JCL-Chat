# Dockerfile — Serviço API (Python/FastAPI)
#
# Multi-stage build:
#   1. Estágio de dependências: instala as libs Python
#   2. Estágio de runtime: copia o código e as deps (leve, slim)
FROM python:3.12-slim AS build

WORKDIR /app

# Instala as dependências
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# ---------- Runtime ----------
FROM python:3.12-slim AS runtime

WORKDIR /app

# curl é usado pelo healthcheck do docker-compose
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Copia as dependências instaladas do estágio de build
COPY --from=build /install /usr/local

# Copia o código-fonte
COPY src ./src

# Variável de ambiente (a real será injetada pelo docker-compose)
ENV PYTHONUNBUFFERED=1

# Expoõe a porta da API
EXPOSE 8000

# Comando para iniciar o servidor Uvicorn
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
