# app/config/settings.py — Configurações da aplicação
#
# Utiliza pydantic-settings para ler variáveis de ambiente
# automaticamente. Valores de exemplo ficam no .env.example.
import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Configurações da aplicação lidas de variáveis de ambiente."""

    # Chaves/segredos
    secret_key: str = os.getenv("SECRET_KEY", "dev_secret_change_me")
    algorithm: str = os.getenv("ALGORITHM", "HS256")

    # Conexão com o PostgreSQL
    postgres_host: str = os.getenv("POSTGRES_HOST", "db")
    postgres_port: int = int(os.getenv("POSTGRES_PORT", "5432"))
    postgres_db: str = os.getenv("POSTGRES_DB", "jcl_chat")
    postgres_user: str = os.getenv("POSTGRES_USER", "jcl")
    postgres_password: str = os.getenv("POSTGRES_PASSWORD", "jcl_dev_password")

    # CORS
    cors_origins: str = os.getenv("CORS_ORIGINS", '["http://localhost:3000"]')

    # E-mail (Resend) — usado no fluxo de recuperação de senha
    # A chave é um segredo; vive apenas no .env (fora do Git). Sem ela, o
    # envio de e-mail falha, mas o endpoint de recuperação continua seguro
    # (responde sempre a mensagem genérica).
    resend_api_key: str = os.getenv("RESEND_API_KEY", "")
    # Remetente padrão (testes). Em produção deve virar um domínio próprio
    # verificado no Resend (o onboarding@resend.dev só entrega para o e-mail
    # usado no cadastro da conta Resend).
    email_from: str = os.getenv("EMAIL_FROM", "onboarding@resend.dev")

    # URL de conexão completa (para SQLAlchemy)
    @property
    def database_url(self) -> str:
        return (
            f"postgresql://{self.postgres_user}:{self.postgres_password}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        # Ignora variáveis de ambiente que não correspondem a campos do
        # Settings (ex.: API_PORT, que o .env define mas não usamos aqui).
        extra = "ignore"


# Instância única compartilhada por toda a aplicação
settings = Settings()
