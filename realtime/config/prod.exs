# config/prod.exs — Configuração de produção do realtime
import Config

config :jcl_chat, JclChatWeb.Endpoint,
  http: [port: System.get_env("PORT") || "4000"],
  server: true,
  url: [host: System.get_env("PHX_HOST", "localhost")]

# Repo de produção usa variáveis de ambiente obrigatórias
config :jcl_chat, JclChat.Repo,
  username: System.fetch_env!("POSTGRES_USER"),
  password: System.fetch_env!("POSTGRES_PASSWORD"),
  hostname: System.fetch_env!("POSTGRES_HOST"),
  database: System.fetch_env!("POSTGRES_DB"),
  pool_size: 10
