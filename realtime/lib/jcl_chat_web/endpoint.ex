# lib/jcl_chat_web/endpoint.ex — Endpoint principal do Phoenix
#
# É o "portão de entrada" HTTP/WebSocket do serviço realtime.
# O live_reload habilita recarga automática no desenvolvimento.
defmodule JclChatWeb.Endpoint do
  use Phoenix.Endpoint, otp_app: :jcl_chat

  # Configure session encryption and storage.
  @session_options [
    store: :cookie,
    key: "_jcl_chat_key",
    signing_salt: "jcl_chat_session_salt"
  ]

  socket "/socket", JclChatWeb.UserSocket,
    websocket: [check_origin: false],
    longpoll: false

  # Plug de servidor estático (para assets, opcional nesta fase)
  plug Plug.Static,
    at: "/",
    from: :jcl_chat,
    gzip: false,
    only: JclChatWeb.static_paths()

  # Plug de compressão de resposta
  plug Plug.RequestId

  plug Plug.Logger

  plug Plug.Head

  plug Plug.Session, @session_options

  plug JclChatWeb.Router
end
