# routers/auth.py — Autenticação (cadastro e login)
#
# Endpoints reais usando banco (SQLAlchemy), hash bcrypt e token JWT.
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.app.db import get_db
from src.app.models.user import User
from src.app.schemas.auth import LoginRequest, RegisterRequest, TokenOut, UserOut
from src.app.services.security import create_access_token, hash_password, verify_password

router = APIRouter()


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    """Cadastra um novo usuário e retorna seus dados (sem o hash da senha)."""
    # Verifica se o e-mail já está em uso
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="E-mail já cadastrado",
        )

    # Verifica se o username já está em uso
    if db.query(User).filter(User.username == data.username).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Nome de usuário já em uso",
        )

    # Cria o usuário com o hash da senha (nunca a senha em texto puro)
    user = User(
        username=data.username,
        email=data.email,
        password_hash=hash_password(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return user.as_dict


@router.post("/login", response_model=TokenOut)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    """Autentica um usuário pelo e-mail/senha e retorna um token JWT.

    Por segurança, a mensagem de erro é genérica (não revela se errou
    o e-mail ou a senha).
    """
    user = db.query(User).filter(User.email == data.email).first()

    # Se o usuário não existe OU a senha está errada, responde o mesmo 401
    if user is None or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(str(user.id))
    return TokenOut(access_token=token, user=user.as_dict)
