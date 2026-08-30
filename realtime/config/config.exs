# config/config.exs — Configuração central do serviço realtime
import Config

# A configuração do JWT (secret_key/algorithm) está em config/runtime.exs,
# para ser lida em tempo de execução com as variáveis de ambiente reais do
# container (evita mismatch entre valor de compilação e de runtime).

# Configuração do servidor (porta do transporte)
config :jcl_chat, JclChatWeb.Endpoint,
  url: [host: "localhost"],
  http: [port: String.to_integer(System.get_env("PORT") || "4000")],
  secret_key_base: System.get_env("SECRET_KEY_BASE") || "dev_secret_key_change_me",
  # Nome do servidor PubSub usado pelos channels e pelo Presence
  pubsub_server: JclChat.PubSub,
  server: true

if config_env() == :prod do
  # Em produção, a chave secreta NUNCA deve vir de um valor fixo.
  # Use System.get_env("SECRET_KEY_BASE") — veja .env / .env.example
  config :jcl_chat, JclChatWeb.Endpoint,
    server: true,
    secret_key_base: System.fetch_env!("SECRET_KEY_BASE")
end

import_config "#{config_env()}.exs"
