# config/dev.exs — Configuração de desenvolvimento do realtime
import Config

config :jcl_chat, JclChatWeb.Endpoint,
  http: [port: System.get_env("PORT") || "4000"]

# Configuração do PostgreSQL para futura persistência (nesta fase não é obrigatória)
config :jcl_chat, JclChat.Repo,
  username: System.get_env("POSTGRES_USER", "jcl"),
  password: System.get_env("POSTGRES_PASSWORD", "jcl_dev_password"),
  hostname: System.get_env("POSTGRES_HOST", "db"),
  database: System.get_env("POSTGRES_DB", "jcl_chat_dev"),
  pool_size: 10
