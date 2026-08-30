# routers/health.py — Endpoint de health check
#
# Usado pelo docker-compose para verificar se a API está saudável.
from fastapi import APIRouter

# Cria um "router" — agrupa endpoints relacionados
router = APIRouter()


@router.get("/health")
def health_check():
    """Retorna o status de saúde da API."""
    return {"status": "ok", "service": "api", "version": "0.1.0"}
