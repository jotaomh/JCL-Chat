# lib/jcl_chat_web/controllers/page_controller.ex — Controller de página inicial
#
# Servidor o "hello world" HTML raiz.
# Um controller em Phoenix processa uma requisição HTTP e retorna
# uma resposta (HTML, JSON, etc.).
defmodule JclChatWeb.PageController do
  use JclChatWeb, :controller

  # Rota GET / — retorna uma página simples
  def index(conn, _params) do
    text(conn, "JCL-Chat realtime (Elixir/Phoenix) está rodando!")
  end
end
