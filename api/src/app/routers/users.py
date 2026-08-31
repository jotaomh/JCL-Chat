# routers/users.py — Endpoints de usuários
#
# Lista e consulta de usuários (esqueleto) + endpoint protegido /me.
# Todos exigem autenticação (JWT): expor a lista de usuários (ou um usuário
# por ID) sem login permitiria a qualquer pessoa enumerar cadastros.
from fastapi import APIRouter, Depends

from src.app.models.user import User
from src.app.services.security import get_current_user

router = APIRouter()


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    """Retorna os dados do usuário autenticado (via token JWT).

    Uso: GET /api/users/me com header 'Authorization: Bearer <token>'.
    """
    return current_user.as_dict


@router.get("")
def list_users(current_user: User = Depends(get_current_user)):
    """Lista todos os usuários (esqueleto). Exige autenticação."""
    # TODO: buscar do banco
    return {"users": [], "total": 0}


@router.get("/{user_id}")
def get_user(user_id: str, current_user: User = Depends(get_current_user)):
    """Retorna um usuário pelo ID (esqueleto). Exige autenticação."""
    # TODO: buscar do banco por ID
    return {"user_id": user_id, "info": "implementação pendente"}
