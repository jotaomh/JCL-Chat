# app/schemas/auth.py — Schemas Pydantic para autenticação
#
# Pydantic valida e serializa a entrada/saída das requisições.
from datetime import date

from pydantic import BaseModel, EmailStr, Field, field_validator


def _date_to_age(birth: date) -> int:
    """Calcula a idade (em anos completos) a partir de uma data de nascimento.

    Fizemos assim (em vez de guardar "idade") para a idade ficar sempre
    atualizada no futuro, mesmo que o usuário não volte a editar o cadastro.
    """
    today = date.today()
    return today.year - birth.year - ((today.month, today.day) < (birth.month, birth.day))


class RegisterRequest(BaseModel):
    """Corpo da requisição de cadastro (POST /api/auth/register)."""

    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    # Data de nascimento, obrigatória. A idade mínima (13 anos) é validada
    # aqui no backend; o frontend também valida antes de chamar a API.
    birth_date: date

    @field_validator("birth_date")
    @classmethod
    def validate_birth_date(cls, v: date) -> date:
        # Data de nascimento no futuro é inválida.
        if v > date.today():
            raise ValueError("Data de nascimento não pode estar no futuro")

        # Idade mínima razoável: 13 anos completos.
        if _date_to_age(v) < 13:
            raise ValueError("Você precisa ter pelo menos 13 anos para se cadastrar")

        return v


class LoginRequest(BaseModel):
    """Corpo da requisição de login (POST /api/auth/login)."""

    email: EmailStr
    password: str


class ForgotPasswordRequest(BaseModel):
    """Corpo da requisição de recuperação de senha (POST /api/auth/forgot-password)."""

    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """Corpo da requisição de redefinir senha (POST /api/auth/reset-password).

    - token: o token recebido por e-mail/link (gerado pelo forgot-password).
    - new_password: a nova senha escolhida pelo usuário.
    """

    token: str = Field(min_length=1)
    new_password: str = Field(min_length=6, max_length=128)


class UserOut(BaseModel):
    """Usuário devolvido nas respostas (NUNCA contém password_hash)."""

    id: str
    username: str
    email: str
    birth_date: str | None
    created_at: str | None


class TokenOut(BaseModel):
    """Resposta do login — contém o token JWT e os dados do usuário."""

    access_token: str
    token_type: str = "bearer"
    user: UserOut
