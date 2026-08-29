# app/services/security.py — Senha (bcrypt) e tokens JWT
#
# Centraliza a lógica de segurança:
#   - gerar/verificar hash de senha (passlib + bcrypt)
#   - criar/decodificar token JWT (PyJWT)
#
# O SECRET_KEY vem de variável de ambiente (settings), NUNCA hardcoded.
from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWTError, decode, encode
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from src.app.config.settings import settings
from src.app.db import get_db
from src.app.models.user import User

# Contexto de hashing — bcrypt é o algoritmo de hashing de senha recomendado.
# O "schemes=['bcrypt']" faz o passlib usar bcrypt; "deprecated='auto'"
# permite migrar futuramente para esquemas mais novos sem quebrar os antigos.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Esquema de segurança do FastAPI que lê o header "Authorization: Bearer <token>"
bearer_scheme = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    """Gera o hash bcrypt de uma senha em texto puro."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, password_hash: str) -> bool:
    """Verifica se a senha em texto puro bate com o hash armazenado."""
    return pwd_context.verify(plain_password, password_hash)


def create_access_token(user_id: str, expires_delta: timedelta | None = None) -> str:
    """Cria um token JWT assinado, com expiração (padrão: 24h).

    O campo "sub" (subject) carrega o ID do usuário autenticado.
    """
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(hours=24)
    )
    payload = {"sub": str(user_id), "exp": expire}
    return encode(payload, settings.secret_key, algorithm=settings.algorithm)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Dependência do FastAPI: valida o token JWT e retorna o usuário logado.

    Usado em endpoints protegidos (ex.: GET /api/users/me).
    Lança 401 se o token faltar, for inválido ou o usuário não existir.
    """
    if credentials is None:
        raise HTTPException(
            status_code=401,
            detail="Credenciais não fornecidas",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = decode(
            credentials.credentials,
            settings.secret_key,
            algorithms=[settings.algorithm],
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Token inválido")
    except PyJWTError:
        raise HTTPException(
            status_code=401,
            detail="Token inválido ou expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=401, detail="Usuário não encontrado")
    return user
