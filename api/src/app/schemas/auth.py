# app/schemas/auth.py — Schemas Pydantic para autenticação
#
# Pydantic valida e serializa a entrada/saída das requisições.
from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    """Corpo da requisição de cadastro (POST /api/auth/register)."""

    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class LoginRequest(BaseModel):
    """Corpo da requisição de login (POST /api/auth/login)."""

    email: EmailStr
    password: str


class UserOut(BaseModel):
    """Usuário devolvido nas respostas (NUNCA contém password_hash)."""

    id: str
    username: str
    email: str
    created_at: str | None


class TokenOut(BaseModel):
    """Resposta do login — contém o token JWT e os dados do usuário."""

    access_token: str
    token_type: str = "bearer"
    user: UserOut
