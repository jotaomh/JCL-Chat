# config/runtime.exs — Configuração em tempo de execução
import Config

# Chave/algoritmo do JWT emitido pela API (Python/FastAPI).
# Usado no UserSocket para autenticar conexões. Deve ser igual ao SECRET_KEY da API.
# Lido aqui (tempo de execução) e não em config.exs para que o valor real das
# variáveis de ambiente do container seja usado — e não o valor do build.
config :jcl_chat, :jwt,
  secret_key: System.get_env("SECRET_KEY") || "dev_secret_change_me",
  algorithm: System.get_env("ALGORITHM") || "HS256"
