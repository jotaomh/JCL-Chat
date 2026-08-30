# routers/auth.py — Autenticação (cadastro, login e recuperação de senha)
#
# Endpoints reais usando banco (SQLAlchemy), hash bcrypt e token JWT.
import logging
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.app.db import get_db
from src.app.models.user import User
from src.app.models.password_reset_token import PasswordResetToken
from src.app.schemas.auth import (
    ForgotPasswordRequest,
    LoginRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenOut,
    UserOut,
)
from src.app.services.email import send_password_reset_email
from src.app.services.security import (
    create_access_token,
    generate_reset_token,
    hash_password,
    hash_token,
    verify_password,
)

logger = logging.getLogger(__name__)

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

    # Cria o usuário com o hash da senha (nunca a senha em texto puro).
    # A data de nascimento já vem validada pelo schema (idade mínima 13 anos).
    user = User(
        username=data.username,
        email=data.email,
        password_hash=hash_password(data.password),
        birth_date=data.birth_date,
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


@router.post("/forgot-password", status_code=status.HTTP_200_OK)
def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Inicia a recuperação de senha gerando um token de expiração curta.

    IMPORTANTE (segurança): a resposta é SEMPRE a mesma, independente de o
    e-mail existir ou não cadastrado. Assim não revelamos se um e-mail está
    cadastrado no sistema.

    Envia o e-mail de recuperação via Resend em modo "best-effort": falhas de
    envio são apenas LOGADAS no servidor (também logamos o link em dev, pois o
    remetente de testes do Resend só entrega para o e-mail da própria conta).
    """
    user = db.query(User).filter(User.email == data.email).first()

    if user is not None:
        # Gera o token (valor em texto puro, para ir no link) e guarda só o
        # HASH dele no banco. Expira em 1 hora.
        raw_token = generate_reset_token()
        reset = PasswordResetToken(
            user_id=user.id,
            token_hash=hash_token(raw_token),
            expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
        )
        db.add(reset)
        db.commit()

        # Envia o e-mail de recuperação de verdade (via Resend). O envio é
        # feito de forma "best-effort": se falhar, apenas LOGAMOS no servidor
        # e seguimos — a resposta da API continua sendo a mensagem genérica,
        # sem revelar ao usuário se o e-mail existe ou se o envio funcionou.
        reset_link = f"/reset-password?token={raw_token}"
        # Log de desenvolvimento: como o remetente de testes do Resend só
        # entrega para o e-mail cadastrado na conta, deixamos o link visível
        # no log do servidor para facilitar os testes manuais.
        logger.info("[RECUPERAÇÃO DE SENHA] Link de recuperação: %s", reset_link)
        try:
            send_password_reset_email(user.email, reset_link)
        except Exception as exc:  # noqa: BLE001 — nunca vazar para a API
            # Garantia extra: qualquer erro inesperado no envio não quebra o
            # fluxo nem expõe detalhes técnicos ao usuário final.
            logger.error(
                "Erro inesperado ao enviar e-mail de recuperação para %s: %s",
                user.email,
                exc,
            )

    # Resposta genérica (não revela se o e-mail existe).
    return {
        "message": "Se este e-mail existir, um link de recuperação foi enviado."
    }


@router.post("/reset-password", status_code=status.HTTP_200_OK)
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Redefine a senha usando um token válido de recuperação.

    Valida que o token existe, não expirou e ainda não foi usado. Em seguida
    atualiza o hash da senha e invalida (marca como usado) o token.
    """
    reset = (
        db.query(PasswordResetToken)
        .filter(PasswordResetToken.token_hash == hash_token(data.token))
        .first()
    )

    # Token inválido, expirado ou já usado: mesma mensagem genérica.
    if reset is None or reset.is_used or reset.is_expired:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Link inválido ou expirado. Solicite um novo link de recuperação.",
        )

    user = db.query(User).filter(User.id == reset.user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Link inválido ou expirado. Solicite um novo link de recuperação.",
        )

    # Atualiza a senha e invalida o token (uso único).
    user.password_hash = hash_password(data.new_password)
    reset.used_at = datetime.now(timezone.utc)
    db.commit()

    return {"message": "Senha redefinida com sucesso."}
