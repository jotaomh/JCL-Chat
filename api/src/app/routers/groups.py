# routers/groups.py — Endpoints de grupos/comunidades
#
# Grupos são recursos do usuário logado, então exigem autenticação (JWT)
# mesmo sendo esqueleto por enquanto (mesmo padrão de friends/direct_messages).
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from src.app.models.user import User
from src.app.services.security import get_current_user

router = APIRouter()


class CreateGroupRequest(BaseModel):
    name: str
    description: str | None = None


@router.get("")
def list_groups(current_user: User = Depends(get_current_user)):
    """Lista grupos do usuário (esqueleto). Exige autenticação."""
    return {"groups": []}


@router.post("")
def create_group(
    data: CreateGroupRequest,
    current_user: User = Depends(get_current_user),
):
    """Cria um novo grupo (esqueleto). Exige autenticação."""
    return {"message": "grupo criado (esqueleto)", "name": data.name}
