# lib/jcl_chat_web/controllers/health_controller.ex — Health check
#
# Rota GET /api/health — usada pelo docker-compose como healthcheck
# e por ferramentas de orquestração para saber se o serviço está vivo.
defmodule JclChatWeb.HealthController do
  use JclChatWeb, :controller

  def health(conn, _params) do
    # Retorna status HTTP 200 com JSON indicando que está saudável
    json(conn, %{status: "ok", service: "realtime", version: "0.1.0"})
  end
end
