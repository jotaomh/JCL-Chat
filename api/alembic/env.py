# alembic/env.py — Ambiente de migração do Alembic
#
# Este arquivo conecta o Alembic ao banco e aos modelos SQLAlchemy.
# - A URL de conexão vem do settings.py (variáveis de ambiente), NÃO fica
#   hardcoded aqui.
# - Importamos os modelos (src.app.models) para que o Alembic conheça as
#   tabelas e gere/compare migrations.
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

from src.app.config.settings import settings
from src.app.db import Base
from src.app import models  # noqa: F401  (registra os modelos em Base.metadata)

# Importa o arquivo de configuração do alembic.ini
config = context.config

# Ajusta a URL de conexão a partir do settings (variáveis de ambiente).
# O "sqlalchemy.url" foi deixado vazio no alembic.ini de propósito.
config.set_main_option("sqlalchemy.url", settings.database_url)

# Configura o logging (lê a seção [loggers] do alembic.ini)
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Metadata dos modelos — é o que o Alembic usa para saber o schema desejado
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Modo offline: gera SQL sem conectar ao banco."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Modo online: aplica as migrations conetado ao banco."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
