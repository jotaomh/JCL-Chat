"""Cria a tabela direct_messages (mensagens diretas entre amigos)

Revision ID: 0004
Revises: 0003
Create Date: 2026-08-30

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

# revision identifiers, used by Alembic.
revision: str = "0004"
down_revision: Union[str, None] = "0003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Cria a tabela direct_messages."""
    op.create_table(
        "direct_messages",
        sa.Column(
            "id",
            UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column(
            "sender_id",
            UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "recipient_id",
            UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )
    # Índices compostos para buscar rápido "todas as mensagens entre A e B"
    # (a conversa tem mensagens nos dois sentidos, por isso as duas combinações).
    op.create_index(
        "ix_direct_messages_sender_recipient",
        "direct_messages",
        ["sender_id", "recipient_id"],
        unique=False,
    )
    op.create_index(
        "ix_direct_messages_recipient_sender",
        "direct_messages",
        ["recipient_id", "sender_id"],
        unique=False,
    )


def downgrade() -> None:
    """Desfaz a migração (remove a tabela)."""
    op.drop_index(
        "ix_direct_messages_recipient_sender", table_name="direct_messages"
    )
    op.drop_index(
        "ix_direct_messages_sender_recipient", table_name="direct_messages"
    )
    op.drop_table("direct_messages")
