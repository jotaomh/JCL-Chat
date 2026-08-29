# lib/jcl_chat_web/controllers/not_found_controller.ex — 404 JSON
#
# Qualquer rota inesperada retorna 404 em formato JSON.
defmodule JclChatWeb.NotFoundController do
  use JclChatWeb, :controller

  def index(conn, _params) do
    conn
    |> put_status(:not_found)
    |> json(%{error: "not_found", detail: "Rota não encontrada"})
  end
end
