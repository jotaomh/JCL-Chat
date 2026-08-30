# app/models/password_reset_token.py — Modelo SQLAlchemy da tabela "password_reset_tokens"
#
# Armazena os tokens de recuperação de senha (fluxo "esqueci minha senha").
# Cada token:
#   - pertence a um usuário (user_id -> users.id)
#   - tem uma expiração curta (expires_at, ex.: 1 hora)
#   - é de uso único (usado_at preencido quando é consumido no reset-password)
import uuid
from datetime import datetime, timezone

from sqlalchemy import String, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.app.db import Base


class PasswordResetToken(Base):
    """Um token de recuperação de senha (uso único e com expiração)."""

    __tablename__ = "password_reset_tokens"

    # ID em formato UUID (chave primária).
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=func.gen_random_uuid(),
    )

    # Usuário dono do token (relação com a tabela users).
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    # O token em si. Guardamos apenas o HASH dele (nunca o valor em texto
    # puro), para que vazar o banco não permita resetar senhas. O valor em
    # texto puro é enviado por e-mail/link e descartado.
    token_hash: Mapped[str] = mapped_column(String(128), unique=True, index=True, nullable=False)

    # Data/hora em que o token expira (padrão: 1 hora após a criação).
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    # Preenchido quando o token é usado (consumido). Tokens já usados não
    # podem ser reutilizados.
    used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Data/hora de criação.
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    @property
    def is_used(self) -> bool:
        """Se o token já foi consumido."""
        return self.used_at is not None

    @property
    def is_expired(self) -> bool:
        """Se o token já passou da data de expiração."""
        now = datetime.now(timezone.utc)
        # Garante comparação timezone-aware (expires_at vem do banco com tz).
        expires = self.expires_at
        if expires.tzinfo is None:
            expires = expires.replace(tzinfo=timezone.utc)
        return now >= expires
