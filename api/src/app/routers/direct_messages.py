# routers/direct_messages.py — Mensagens diretas (DMs) entre amigos
#
# Persiste o histórico das conversas no banco e serve o histórico existente.
# A comunicação em tempo real fica por conta do Phoenix (realtime), mas a
# persistência (salvar/ler) é responsabilidade desta API.
#
# SEGURANÇA: todo endpoint exige autenticação (JWT) E confirma que os dois
# usuários são amigos antes de listar ou criar qualquer mensagem — senão
# qualquer usuário logado poderia ler a conversa de outra dupla só sabendo
# o ID do amigo.
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import or_
from sqlalchemy.orm import Session

from src.app.db import get_db
from src.app.models.direct_message import DirectMessage
from src.app.models.friend_request import FriendRequest, FriendRequestStatus
from src.app.models.user import User
from src.app.services.security import get_current_user

router = APIRouter()


class DirectMessageIn(BaseModel):
    """Corpo de POST /api/dms/{friend_id}/messages."""

    body: str


def _ensure_friends(db: Session, a: UUID, b: UUID) -> None:
    """Valida que a e b são amigos de verdade (pedido aceito).

    Duas pessoas são amigas quando existe um FriendRequest com status
    "accepted" entre elas (não importa quem enviou o pedido).
    Lança 403 se não forem amigos — impede ler/conversar com quem não é amigo.
    """
    req = (
        db.query(FriendRequest)
        .filter(
            or_(
                (FriendRequest.requester_id == a)
                & (FriendRequest.addressee_id == b),
                (FriendRequest.requester_id == b)
                & (FriendRequest.addressee_id == a),
            ),
            FriendRequest.status == FriendRequestStatus.accepted,
        )
        .first()
    )
    if req is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vocês não são amigos",
        )


def _direct_message_out(msg: DirectMessage) -> dict:
    """Serializa uma mensagem direta (sem dados sensíveis)."""
    return {
        "id": str(msg.id),
        "sender_id": str(msg.sender_id),
        "recipient_id": str(msg.recipient_id),
        "body": msg.body,
        "created_at": msg.created_at.isoformat() if msg.created_at else None,
    }


@router.get("/{friend_id}/messages")
def list_direct_messages(
    friend_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retorna o histórico de mensagens entre o usuário logado e friend_id.

    Ordenado por created_at crescente (mais antiga primeiro).
    """
    _ensure_friends(db, current_user.id, friend_id)

    rows = (
        db.query(DirectMessage)
        .filter(
            or_(
                (DirectMessage.sender_id == current_user.id)
                & (DirectMessage.recipient_id == friend_id),
                (DirectMessage.sender_id == friend_id)
                & (DirectMessage.recipient_id == current_user.id),
            )
        )
        .order_by(DirectMessage.created_at.asc())
        .all()
    )
    return {"messages": [_direct_message_out(m) for m in rows], "count": len(rows)}


@router.post("/{friend_id}/messages")
def send_direct_message(
    friend_id: UUID,
    data: DirectMessageIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Persiste uma mensagem direta (sender = usuário logado → recipient = friend)."""
    _ensure_friends(db, current_user.id, friend_id)

    body = data.body.strip() if data.body else ""
    if not body:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mensagem vazia",
        )

    msg = DirectMessage(
        sender_id=current_user.id,
        recipient_id=friend_id,
        body=body,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)

    return _direct_message_out(msg)
