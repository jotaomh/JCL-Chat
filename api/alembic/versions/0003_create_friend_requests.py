"""Cria a tabela friend_requests (sistema de amizades)

Revision ID: 0003
Revises: 0002
Create Date: 2026-08-30

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

# revision identifiers, used by Alembic.
revision: str = "0003"
down_revision: Union[str, None] = "0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# Estados possíveis de um pedido de amizade (mesmos valores do modelo)
_friend_request_status = sa.Enum(
    "pending",
    "accepted",
    "rejected",
    name="friend_request_status",
)


def upgrade() -> None:
    """Cria a tabela friend_requests."""
    _friend_request_status.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "friend_requests",
        sa.Column(
            "id",
            UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column(
            "requester_id",
            UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "addressee_id",
            UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "status",
            sa.Enum(
                "pending", "accepted", "rejected",
                name="friend_request_status",
                create_type=False,  # já criamos o tipo manualmente acima
            ),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        # Impede pedidos duplicados (mesmo par, mesma direção).
        sa.UniqueConstraint(
            "requester_id", "addressee_id", name="uq_friend_request_pair"
        ),
    )
    op.create_index(
        op.f("ix_friend_requests_requester_id"),
        "friend_requests",
        ["requester_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_friend_requests_addressee_id"),
        "friend_requests",
        ["addressee_id"],
        unique=False,
    )


def downgrade() -> None:
    """Desfaz a migração (remove a tabela)."""
    op.drop_index(
        op.f("ix_friend_requests_addressee_id"), table_name="friend_requests"
    )
    op.drop_index(
        op.f("ix_friend_requests_requester_id"), table_name="friend_requests"
    )
    op.drop_table("friend_requests")
    _friend_request_status.drop(op.get_bind(), checkfirst=True)
