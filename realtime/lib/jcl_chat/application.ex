# lib/jcl_chat/application.ex — Ponto de entrada do aplicativo Elixir
#
# O módulo Application define a árvore de supervisão: todos os processos
# que devem rodar junto com o servidor. Aqui são iniciados:
#   - O Endpoint (servidor HTTP + WebSocket do Phoenix)
#   - O supervisor de canais/topics
defmodule JclChat.Application do
  use Application

  @impl true
  def start(_type, _args) do
    children = [
      # PubSub distribuído (necessário para channels e presence)
      {Phoenix.PubSub, name: JclChat.PubSub},
      # Inicia o servidor HTTP/WebSocket
      JclChatWeb.Endpoint,
      # Presença (quem está online)
      JclChatWeb.Presence
    ]

    opts = [strategy: :one_for_one, name: JclChat.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Callback exigido pelo Phoenix para notificar mudanças de configuração
  @impl true
  def config_change(changed, _new, removed) do
    JclChatWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
