# app/models/user.py — Modelo SQLAlchemy da tabela "users"
#
# Representa a tabela que armazena os usuários do JCL-Chat.
# ATENÇÃO: NUNCA armazenamos a senha em texto puro aqui — apenas o
# "password_hash" gerado com bcrypt (ver services/security.py).
import uuid
from datetime import date, datetime, timezone

from sqlalchemy import String, DateTime, Date, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.app.db import Base


class User(Base):
    """Um usuário cadastrado no JCL-Chat."""

    __tablename__ = "users"

    # ID em formato UUID (chave primária). Usa a função nativa do PostgreSQL
    # para gerar o UUID, mas também aceita um valor fornecido pelo Python.
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=func.gen_random_uuid(),
    )

    # Nome de usuário — único (não pode repetir)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)

    # E-mail — único (não pode repetir). Guarda apenas o endereço.
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)

    # Hash da senha gerado com bcrypt (nunca a senha em texto puro)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)

    # Data de nascimento (obrigatória). Guardamos a data (não a "idade")
    # porque a idade fica desatualizada com o tempo — a idade é calculada
    # na hora, a partir desta data, quando precisamos exibi-la/validá-la.
    birth_date: Mapped[date] = mapped_column(Date, nullable=False)

    # Data/hora de criação (gera o valor no banco ao inserir)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    @property
    def as_dict(self) -> dict:
        """Retorna o usuário como dict, SEM nunca expor o password_hash."""
        return {
            "id": str(self.id),
            "username": self.username,
            "email": self.email,
            "birth_date": self.birth_date.isoformat() if self.birth_date else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
