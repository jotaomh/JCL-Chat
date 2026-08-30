# routers/friends.py — Sistema de amizades (pedidos + lista de amigos)
#
# Uma amizade NÃO tem tabela própria: duas pessoas são amigas quando existe
# um FriendRequest com status = accepted entre elas (não importa quem mandou
# o pedido). Todos os endpoints exigem autenticação (JWT) e operam sobre o
# usuário logado (get_current_user).
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import or_
from sqlalchemy.orm import Session

from src.app.db import get_db
from src.app.models.friend_request import FriendRequest, FriendRequestStatus
from src.app.models.user import User
from src.app.services.security import get_current_user

router = APIRouter()


class FriendRequestIn(BaseModel):
    """Corpo de POST /api/friends/request — busca pelo username exato."""

    username: str


def _get_user_by_username(db: Session, username: str) -> User | None:
    return db.query(User).filter(User.username == username).first()


def _get_pair_request(db: Session, a: UUID, b: UUID) -> FriendRequest | None:
    """Busca qualquer pedido entre os dois usuários (nos dois sentidos)."""
    return (
        db.query(FriendRequest)
        .filter(
            or_(
                # (a enviou para b) OU (b enviou para a)
                (FriendRequest.requester_id == a)
                & (FriendRequest.addressee_id == b),
                (FriendRequest.requester_id == b)
                & (FriendRequest.addressee_id == a),
            )
        )
        .first()
    )


def _friend_request_out(req: FriendRequest) -> dict:
    """Serializa um pedido (sem dados sensíveis)."""
    return {
        "id": str(req.id),
        "requester_id": str(req.requester_id),
        "addressee_id": str(req.addressee_id),
        "status": req.status.value,
        "created_at": req.created_at.isoformat() if req.created_at else None,
    }


@router.post("/request")
def send_friend_request(
    data: FriendRequestIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Envia um pedido de amizade para o usuário com o username exato.

    Erros amigáveis (HTTP 4xx):
      - usuario não existe
      - tentou se adicionar a si mesmo
      - já são amigos
      - já existe pedido pendente (em qualquer sentido)
    """
    username = data.username.strip() if data.username else ""

    # 1) buscando pelo username exato (@fulano ou fulano)
    lookup = username[1:] if username.startswith("@") else username
    target = _get_user_by_username(db, lookup)
    if target is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado",
        )

    # 2) não pode se adicionar a si mesmo
    if target.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Você não pode adicionar a si mesmo",
        )

    # 3) já existe pedido entre os dois (qualquer sentido/estado)?
    existing = _get_pair_request(db, current_user.id, target.id)
    if existing is not None:
        if existing.status == FriendRequestStatus.accepted:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Vocês já são amigos",
            )
        if existing.status == FriendRequestStatus.pending:
            # Se o pedido foi enviado por ele para nós, dá para aceitar;
            # se foi enviado por nós, está "aguardando resposta".
            if existing.requester_id == target.id:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Este usuário já enviou um pedido para você. "
                    "Aceite-o na lista de pedidos.",
                )
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Você já enviou um pedido para este usuário. "
                "Aguardando resposta.",
            )
        # rejected: permitir reenviar (cria um novo pedido)

    req = FriendRequest(
        requester_id=current_user.id,
        addressee_id=target.id,
        status=FriendRequestStatus.pending,
    )
    db.add(req)
    db.commit()
    db.refresh(req)

    return {
        "message": "Pedido enviado!",
        "request": _friend_request_out(req),
    }


def _list_with_usernames(requests: list) -> list[dict]:
    """Acrescenta o username do "outro" usuário a cada pedido.

    requests: lista de tuples (FriendRequest, User) em que o segundo item é o
    usuário a exibir como contraparte (quem enviou, para pedidos recebidos;
    quem recebeu, para pedidos enviados).
    """
    result = []
    for req, other in requests:
        item = _friend_request_out(req)
        item["username"] = other.username if other else None
        result.append(item)
    return result


@router.get("/requests")
def list_incoming_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Lista pedidos pendentes RECEBIDOS pelo usuário logado."""
    rows = (
        db.query(FriendRequest, User)
        .join(User, User.id == FriendRequest.requester_id)
        .filter(
            FriendRequest.addressee_id == current_user.id,
            FriendRequest.status == FriendRequestStatus.pending,
        )
        .order_by(FriendRequest.created_at.desc())
        .all()
    )
    requests = _list_with_usernames(rows)
    return {"requests": requests, "count": len(requests)}


@router.get("/requests/sent")
def list_sent_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Lista pedidos pendentes ENVIADOS pelo usuário logado ("aguardando")."""
    rows = (
        db.query(FriendRequest, User)
        .join(User, User.id == FriendRequest.addressee_id)
        .filter(
            FriendRequest.requester_id == current_user.id,
            FriendRequest.status == FriendRequestStatus.pending,
        )
        .order_by(FriendRequest.created_at.desc())
        .all()
    )
    requests = _list_with_usernames(rows)
    return {"requests": requests, "count": len(requests)}


def _get_request_for_addressee(
    db: Session, request_id: UUID, current_user: User
) -> FriendRequest:
    """Busca um pedido pendente que o usuário logado RECEBEU (addressee)."""
    req = db.query(FriendRequest).filter(FriendRequest.id == request_id).first()
    if req is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pedido não encontrado",
        )
    if req.addressee_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não pode responder a este pedido",
        )
    if req.status != FriendRequestStatus.pending:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este pedido já foi respondido",
        )
    return req


@router.post("/requests/{request_id}/accept")
def accept_friend_request(
    request_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Aceita um pedido recebido (só o addressee). Vira amizade."""
    req = _get_request_for_addressee(db, request_id, current_user)
    req.status = FriendRequestStatus.accepted
    db.commit()
    db.refresh(req)
    return {"message": "Pedido aceito!", "request": _friend_request_out(req)}


@router.post("/requests/{request_id}/reject")
def reject_friend_request(
    request_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Recusa um pedido recebido (só o addressee). Remove o registro."""
    req = _get_request_for_addressee(db, request_id, current_user)
    db.delete(req)
    db.commit()
    return {"message": "Pedido recusado."}


@router.get("")
def list_friends(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Lista os amigos de verdade (pedidos aceitos, dos dois lados)."""
    rows = (
        db.query(FriendRequest, User)
        .join(User, User.id == FriendRequest.requester_id)
        .filter(
            FriendRequest.status == FriendRequestStatus.accepted,
            FriendRequest.addressee_id == current_user.id,
        )
        .all()
    )
    rows += (
        db.query(FriendRequest, User)
        .join(User, User.id == FriendRequest.addressee_id)
        .filter(
            FriendRequest.status == FriendRequestStatus.accepted,
            FriendRequest.requester_id == current_user.id,
        )
        .all()
    )
    friends = []
    for req, friend in rows:
        friends.append(
            {
                "id": str(friend.id),
                "username": friend.username,
            }
        )
    return {"friends": friends, "count": len(friends)}


@router.delete("/{friend_id}")
def remove_friend(
    friend_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Remove a amizade (apaga o FriendRequest aceito entre os dois)."""
    req = _get_pair_request(db, current_user.id, friend_id)
    if req is None or req.status != FriendRequestStatus.accepted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Amizade não encontrada",
        )
    db.delete(req)
    db.commit()
    return {"message": "Amizade removida."}
