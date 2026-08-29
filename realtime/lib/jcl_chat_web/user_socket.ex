# lib/jcl_chat_web/user_socket.ex — Socket do usuário (WebSocket)
#
# É o "túnel" que conecta o frontend ao backend em tempo real.
# Cada cliente conecta no endpoint /socket e se inscreve em "topics".
defmodule JclChatWeb.UserSocket do
  use Phoenix.Socket

  # Timeout em milissegundos para conexões fechadas sem handshake
  @impl true
  def connect(_params, socket, _connect_info) do
    # Nesta fase aceitamos todas as conexões.
    # No futuro: autenticar via token JWT aqui.
    {:ok, socket}
  end

  # Identifica o socket (padrão: ID do socket)
  @impl true
  def id(_socket), do: "user_socket:#{inspect(self())}"

  # Canais permitidos neste socket
  channel "room:*", JclChatWeb.RoomChannel
end
