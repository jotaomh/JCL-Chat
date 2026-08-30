# app/models/friend_request.py — Modelo SQLAlchemy da tabela "friend_requests"
#
# Armazena os pedidos de amizade entre usuários. Dois usuários são AMIGOS
# quando existe um registro aqui com status = "accepted" entre eles (não
# importa quem enviou o pedido originalmente).
import uuid
from datetime import datetime
from enum import Enum

from sqlalchemy import DateTime, Enum as SqlEnum, ForeignKey, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.app.db import Base


class FriendRequestStatus(str, Enum):
    """Estados possíveis de um pedido de amizade."""

    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"


class FriendRequest(Base):
    """Um pedido de amizade entre dois usuários."""

    __tablename__ = "friend_requests"
    # Dois sentidos: não pode existir mais de um pedido entre o mesmo par de
    # usuários (na mesma direção). As validações no router também impedem
    # pedidos em sentidos opostos, mas esta constraint garante a unicidade.
    __table_args__ = (
        UniqueConstraint("requester_id", "addressee_id", name="uq_friend_request_pair"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=func.gen_random_uuid(),
    )

    # Quem enviou o pedido.
    requester_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Quem recebeu o pedido.
    addressee_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Estado atual do pedido (pending -> accepted | rejected).
    status: Mapped[FriendRequestStatus] = mapped_column(
        SqlEnum(FriendRequestStatus, name="friend_request_status", values_callable=lambda e: [m.value for m in e]),
        nullable=False,
        default=FriendRequestStatus.pending,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
