# routers/groups.py — Endpoints de grupos/comunidades
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class CreateGroupRequest(BaseModel):
    name: str
    description: str | None = None


@router.get("")
def list_groups():
    """Lista grupos do usuário (esqueleto)."""
    return {"groups": []}


@router.post("")
def create_group(data: CreateGroupRequest):
    """Cria um novo grupo (esqueleto)."""
    return {"message": "grupo criado (esqueleto)", "name": data.name}
