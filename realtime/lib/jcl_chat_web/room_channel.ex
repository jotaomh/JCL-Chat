# lib/jcl_chat_web/room_channel.ex — Canal de sala (tempo real)
#
# Um "channel" é a unidade de comunicação em tempo real no Phoenix.
# Quando um cliente faz join num topic (ex: "room:geral"), este módulo
# gerencia a troca de mensagens (join, handle_in, handle_info).
#
# Isso é o núcleo que usaremos para:
#   - Chat de texto em tempo real
#   - Sinais (signaling) de WebRTC para chamadas de voz/vídeo
#   - Broadcast de presença
defmodule JclChatWeb.RoomChannel do
  use Phoenix.Channel

  # Chamado quando um cliente pede para entrar no tópico "room:exemplo"
  @impl true
  def join("room:lobby", _payload, socket) do
    # TODO: implementar limite de tópicos por socket como medida de segurança
    # (isso exige rastrear os joins do socket em um nível acima do channel,
    # já que cada processo de channel cuida de um único tópico)
    send(self(), :after_join)
    {:ok, %{message: "Bem-vindo a sala!"}, socket}
  end

  # Sala de DM: o tópico é "room:dm:<menor_id>_<maior_id>", um nome canônico
  # determinístico (os dois participantes sempre calculam o mesmo tópico).
  # Só quem é um dos dois usuários do par pode entrar.
  def join("room:dm:" <> pair_id, _payload, socket) do
    user_id = socket.assigns[:user_id]

    case String.split(pair_id, "_") do
      [id_a, id_b] when id_a != "" and id_b != "" ->
        if user_id in [id_a, id_b] do
          send(self(), :after_join)
          {:ok, socket}
        else
          {:error, %{reason: "unauthorized"}}
        end

      _ ->
        {:error, %{reason: "unauthorized"}}
    end
  end

  # Qualquer outro tópico "room:*" é aceito
  def join("room:" <> _room_id, _payload, socket) do
    send(self(), :after_join)
    {:ok, socket}
  end

  # Fallback: rejeita tópicos desconhecidos
  def join(_topic, _payload, _socket) do
    {:error, %{reason: "unauthorized"}}
  end

  # Executa depois do join
  @impl true
  def handle_info(:after_join, socket) do
    # Informa todos na sala que o usuário entrou (presença)
    push(socket, "user_joined", %{user: "anônimo"})
    {:noreply, socket}
  end

  # Recebe uma mensagem de texto do cliente
  @impl true
  def handle_in("new_message", %{"body" => body}, socket) do
    user_id = socket.assigns[:user_id]
    username = socket.assigns[:username]

    # Broadcast para todos na sala, identificando o autor
    broadcast!(socket, "new_message", %{
      body: body,
      user_id: user_id,
      username: username,
      timestamp: DateTime.utc_now() |> DateTime.to_iso8601()
    })
    {:reply, {:ok, %{received: true}}, socket}
  end

  # Recebe sinais WebRTC (para chamadas)
  @impl true
  def handle_in("webrtc_signal", payload, socket) do
    # Encaminha o sinal (offer/answer/candidate) para os outros participantes
    broadcast!(socket, "webrtc_signal", payload)
    {:reply, {:ok, %{received: true}}, socket}
  end

  # Fallback para eventos desconhecidos
  @impl true
  def handle_in(event, _payload, socket) do
    {:reply, {:error, %{reason: "evento desconhecido: #{inspect(event)}"}}, socket}
  end
end
