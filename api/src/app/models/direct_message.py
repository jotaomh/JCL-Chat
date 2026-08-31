# app/models/direct_message.py — Modelo SQLAlchemy da tabela "direct_messages"
#
# Guarda as mensagens trocadas entre dois amigos (mensagem direta/DM).
# Diferente do chat em tempo real (que só retransmite pra quem está online),
# aqui persistimos o histórico para que, ao reabrir a conversa, as mensagens
# antigas continuem disponíveis.
import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Index, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.app.db import Base


class DirectMessage(Base):
    """Uma mensagem direta entre dois usuários (que são amigos)."""

    __tablename__ = "direct_messages"

    # Índices pensados para a busca rápida "todas as mensagens entre A e B",
    # já que a conversa tem mensagens nos dois sentidos (A->B e B->A). Como
    # o sender/recipient alternam, indexamos ambas as combinações.
    __table_args__ = (
        Index("ix_direct_messages_sender_recipient", "sender_id", "recipient_id"),
        Index("ix_direct_messages_recipient_sender", "recipient_id", "sender_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=func.gen_random_uuid(),
    )

    # Quem escreveu a mensagem.
    sender_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    # Quem recebeu a mensagem.
    recipient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    # Texto da mensagem.
    body: Mapped[str] = mapped_column(nullable=False)

    # Data/hora em que a mensagem foi criada.
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
