# routers/auth.py — Autenticação (cadastro e login)
#
# Nesta fase, esqueleto dos endpoints de autenticação.
# A lógica real de JWT + banco será adicionada na próxima etapa.
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr

router = APIRouter()


# Schema de dados para o corpo da requisição de registro
# Pydantic valida os tipos automaticamente
class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


@router.post("/register")
def register(data: RegisterRequest):
    """Cadastra um novo usuário (esqueleto)."""
    # TODO: salvar usuário no banco e gerar token JWT
    return {
        "message": "Cadastro em implementação",
        "email": data.email,
        "username": data.username,
    }


@router.post("/login")
def login(data: LoginRequest):
    """Autentica um usuário e retorna token (esqueleto)."""
    # TODO: validar credenciais no banco e gerar token JWT
    raise HTTPException(status_code=501, detail="Login ainda não implementado")
