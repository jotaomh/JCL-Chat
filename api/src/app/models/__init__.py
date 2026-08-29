# Inicializa o pacote de modelos (tabelas SQLAlchemy)
#
# Importamos os modelos aqui para que o Alembic e o SQLAlchemy
# os "enxerguem" ao criar/inspecionar as tabelas.
from src.app.models.user import User

__all__ = ["User"]
