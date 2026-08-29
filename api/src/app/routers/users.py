# routers/users.py — Endpoints de usuários
#
# Lista e consulta de usuários (esqueleto).
from fastapi import APIRouter

router = APIRouter()


@router.get("")
def list_users():
    """Lista todos os usuários (esqueleto)."""
    # TODO: buscar do banco
    return {"users": [], "total": 0}


@router.get("/{user_id}")
def get_user(user_id: str):
    """Retorna um usuário pelo ID (esqueleto)."""
    # TODO: buscar do banco por ID
    return {"user_id": user_id, "info": "implementação pendente"}
