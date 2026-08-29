# lib/jcl_chat_web.ex — Módulo central do Phoenix Web
#
# Define as macros :controller, :router, :channel e :socket usadas
# em todo o projeto web (importa plugs e helpers padrão).
defmodule JclChatWeb do
  def controller do
    quote do
      use Phoenix.Controller, namespace: JclChatWeb
      import Plug.Conn
      import JclChatWeb.Router.Helpers
    end
  end

  def router do
    quote do
      use Phoenix.Router
      import Plug.Conn
      import Phoenix.Controller
    end
  end

  def channel do
    quote do
      use Phoenix.Channel
    end
  end

  def socket do
    quote do
      use Phoenix.Socket
    end
  end

  def static_paths, do: []

  defmacro __using__(which) when which in [:controller, :router, :channel, :socket] do
    apply(__MODULE__, which, [])
  end
end
