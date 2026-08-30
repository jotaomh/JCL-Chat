"""Adiciona birth_date em users e cria password_reset_tokens

Revision ID: 0002
Revises: 0001
Create Date: 2026-08-30

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

# revision identifiers, used by Alembic.
revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Aplica as mudanças:
      1. adiciona a coluna birth_date na tabela users (obrigatória)
      2. cria a tabela password_reset_tokens
    """
    # 1) birth_date — adicionamos primeiro como NULL, preenchemos registros
    #    pré-existentes com uma data de exemplo (para não quebrar o NOT NULL)
    #    e depois restringimos a NOT NULL.
    op.add_column("users", sa.Column("birth_date", sa.Date(), nullable=True))

    # Data de exemplo para registros que já existiam antes desta migration
    # (qualquer data maior que 13 anos atrás). Em produção isso exigiria
    # uma estratégia de backfill adequada com os dados reais.
    op.execute(
        "UPDATE users SET birth_date = '2000-01-01' WHERE birth_date IS NULL"
    )

    op.alter_column("users", "birth_date", nullable=False)

    # 2) Tabela de tokens de recuperação de senha
    op.create_table(
        "password_reset_tokens",
        sa.Column(
            "id",
            UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column(
            "user_id",
            UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("token_hash", sa.String(length=128), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("used_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )
    op.create_index(
        op.f("ix_password_reset_tokens_user_id"),
        "password_reset_tokens",
        ["user_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_password_reset_tokens_token_hash"),
        "password_reset_tokens",
        ["token_hash"],
        unique=True,
    )


def downgrade() -> None:
    """Desfaz as mudanças (remove a tabela e a coluna adicionada)."""
    op.drop_index(op.f("ix_password_reset_tokens_token_hash"), table_name="password_reset_tokens")
    op.drop_index(op.f("ix_password_reset_tokens_user_id"), table_name="password_reset_tokens")
    op.drop_table("password_reset_tokens")
    op.drop_column("users", "birth_date")
