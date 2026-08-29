# api/src/main.py — Ponto de entrada da API FastAPI
#
# FastAPI é um framework web Python moderno e rápido.
# Endpoints são definidos como funções Python com decoradores.
# A documentação interativa (Swagger) fica em /docs quando o servidor roda.
#
# Para rodar localmente: uvicorn src.main:app --reload
import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.app.routers import auth, users, friends, groups, health

# Diretório-base do projeto (para facilitar imports)
BASE_DIR = Path(__file__).resolve().parent.parent

# Cria a instância da aplicação FastAPI
app = FastAPI(
    title="JCL-Chat API",
    description="API REST do JCL-Chat (autenticação, amigos, grupos etc.)",
    version="0.1.0",
)

# Configura CORS: permite que o frontend (Vite) consuma a API no dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",      # frontend dev
        "http://localhost:5173",      # Vite padrão
        "http://localhost:8000",      # a própria API
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclui os "routers" (conjuntos de endpoints) na aplicação
app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(friends.router, prefix="/api/friends", tags=["friends"])
app.include_router(groups.router, prefix="/api/groups", tags=["groups"])


# Endpoint raiz: "hello world"
@app.get("/")
def root():
    return {"message": "JCL-Chat API (FastAPI) está rodando!", "docs": "/docs"}
