# Inicializa o pacote de modelos (tabelas SQLAlchemy)
#
# Importamos os modelos aqui para que o Alembic e o SQLAlchemy
# os "enxerguem" ao criar/inspecionar as tabelas.
from src.app.models.user import User
from src.app.models.password_reset_token import PasswordResetToken

__all__ = ["User", "PasswordResetToken"]
