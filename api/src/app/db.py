# app/db.py — Conexão com o banco de dados (SQLAlchemy)
#
# Cria a engine (conexão) e a sessão usadas pelos routers.
# Nesta fase não é usada ativamente, mas fica pronta para a próxima etapa.
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from src.app.config.settings import settings

# Cria o "engine" (motor de conexão com o banco)
engine = create_engine(settings.database_url, pool_pre_ping=True)

# Cria uma "session" para transações
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para definição de modelos (tabelas)
Base = declarative_base()


def get_db():
    """Dependência do FastAPI para obter uma sessão de banco."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
