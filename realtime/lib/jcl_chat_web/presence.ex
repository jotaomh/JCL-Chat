# lib/jcl_chat_web/presence.ex — Módulo de presença (quem está online)
#
# Usado para rastrear quais usuários estão conectados em cada tópico.
# Isso permite mostrar "online/offline" no frontend.
defmodule JclChatWeb.Presence do
  use Phoenix.Presence,
    otp_app: :jcl_chat,
    pubsub_server: JclChat.PubSub

  # Função que define os metadados públicos de cada usuário
  @impl true
  def fetch(_topic, presences) do
    query =
      for {key, %{metas: metas}} <- presences, into: %{} do
        {key, %{metas: metas, user: "unknown"}}
      end

    {:ok, query}
  end
end
