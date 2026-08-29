# lib/jcl_chat_web/router.ex — Roteamento HTTP
#
# Define as rotas HTTP do serviço realtime.
# O "hello world" fica na rota GET / e o health check em /health.
defmodule JclChatWeb.Router do
  use JclChatWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
  end

  pipeline :browser do
    plug :accepts, ["html"]
  end

  # Rotas públicas para o "hello world"
  scope "/", JclChatWeb do
    pipe_through :browser
    get "/", PageController, :index
  end

  # Rotas de API + status de saúde
  scope "/api", JclChatWeb do
    pipe_through :api
    get "/health", HealthController, :health
  end

  # Rota do Socket de usuário
  scope "/socket" do
    get "/", JclChatWeb.UserSocket, :index
  end

  # Qualquer outra rota retorna 404 JSON
  match :*, "/*path", JclChatWeb.NotFoundController, :index
end
