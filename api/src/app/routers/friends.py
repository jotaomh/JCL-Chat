# routers/friends.py — Endpoints de amizades
from fastapi import APIRouter

router = APIRouter()


@router.get("")
def list_friends():
    """Lista amizades do usuário (esqueleto)."""
    return {"friends": []}


@router.post("/request")
def send_friend_request(friend_id: str):
    """Envia solicitação de amizade (esqueleto)."""
    return {"status": "pendente", "friend_id": friend_id}
