# lib/jcl_chat_web/user_socket.ex — Socket do usuário (WebSocket)
#
# É o "túnel" que conecta o frontend ao backend em tempo real.
# Cada cliente conecta no endpoint /socket e se inscreve em "topics".
#
# A conexão é autenticada: o frontend envia o token JWT (emitido pela API
# Python) como parâmetro de conexão. Aqui validamos esse token e, se for
# válido, guardamos o user_id (e username) no socket.assigns para uso nos
# channels. Conexões sem token ou com token inválido são rejeitadas.
defmodule JclChatWeb.UserSocket do
  use Phoenix.Socket

  @jwt_config Application.compile_env(:jcl_chat, :jwt)

  # Timeout em milissegundos para conexões fechadas sem handshake
  @impl true
  def connect(%{"token" => token} = params, socket, _connect_info) do
    with %{valid: true, claims: %{"sub" => user_id}} <- verify_token(token) do
      username = params_username(params)
      socket = Phoenix.Socket.assign(socket, user_id: user_id, username: username || user_id)
      {:ok, socket}
    else
      _ -> :error
    end
  end

  def connect(_params, _socket, _connect_info), do: :error

  # Identifica o socket (padrão: ID do socket)
  @impl true
  def id(_socket), do: "user_socket:#{inspect(self())}"

  # Canais permitidos neste socket
  channel "room:*", JclChatWeb.RoomChannel

  # Decodifica e valida o JWT com a mesma chave/algoritmo usados pela API
  # Python (SECRET_KEY / HS256). Os tokens têm claims: sub (user_id) e exp.
  defp verify_token(token) do
    signer = Joken.Signer.create(@jwt_config[:algorithm], @jwt_config[:secret_key])
    case Joken.verify(token, signer) do
      {:ok, claims} -> %{valid: true, claims: claims}
      {:error, _reason} -> %{valid: false, claims: %{}}
    end
  end

  defp params_username(%{"username" => username}) when is_binary(username), do: username
  defp params_username(_), do: nil
end
