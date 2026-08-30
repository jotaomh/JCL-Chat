# mix.exs — Definição do projeto Elixir/Phoenix (serviço de tempo real)
#
# status: esqueleto "hello world". Para gerar um projeto Phoenix completo:
#   mix phx.new . --app jcl_chat
#
# Documentação: https://hexdocs.pm/phoenix

defmodule JclChat.MixProject do
  use Mix.Project

  def project do
    [
      app: :jcl_chat,
      version: "0.1.0",
      elixir: "~> 1.17",
      elixirc_paths: elixirc_paths(Mix.env()),
      start_permanent: Mix.env() == :prod,
      deps: deps()
    ]
  end

  def application do
    [
      mod: {JclChat.Application, []},
      extra_applications: [:logger]
    ]
  end

  defp elixirc_paths(:test), do: ["lib", "test/support"]
  defp elixirc_paths(_), do: ["lib"]

  defp deps do
    [
      # Framework web para tempo real
      {:phoenix, "~> 1.7.12"},
      # PubSub distribuído (usado pelo Phoenix.Presence e channels)
      {:phoenix_pubsub, "~> 2.1"},
      # Server HTTP
      {:plug_cowboy, "~> 2.0"},
      # JSON helpers
      {:jason, "~> 1.4"},
      # JWT (validar tokens emitidos pela API Python — HS256)
      {:joken, "~> 2.6"},
      # ⚠️ IMPORTANTE — Compatibilidade com Erlang/OTP 25:
      #
      # Este projeto está FIXO em Erlang/OTP 25.2.3 (ver Dockerfile) de
      # propósito, por causa de um bug de certificado TLS do Erlang/OTP 27
      # com o hex.pm. NÃO altere essa versão do Erlang/OTP.
      #
      # Por isso, a versão da jose (usada por baixo dos panos pelo joken) está
      # travada NA VERSÃO EXATA 1.11.10 — a ÚLTIMA versão que ainda suporta
      # OTP 25. A partir da 1.11.11, a jose passou a usar o type dynamic()
      # (que só existe no Erlang/OTP 27+) nos módulos de JSON e o build quebra
      # com "type dynamic() undefined" no OTP 25. VERIFICADO: 1.11.8, 1.11.9 e
      # 1.11.10 compilam; 1.11.11 e 1.11.12 NÃO compilam nesse OTP.
      #
      # O operador ">="/~> permitiria ao Mix escolher versões mais novas
      # (1.11.11+) que reintroduzem o bug; por isso usamos a versão exata,
      # sem "~>". Use override: true para garantir que o joken (que pede
      # "~> 1.11.12") não force uma versão nova quebrada.
      #
      # REGRA GARANTIDA: ao adicionar QUALQUER nova dependência Elixir/Erlang
      # ao realtime, confira antes se ela é compatível com Erlang/OTP 25.
      # Muitas libs recentes já assumem OTP 27+ como padrão e vão quebrar
      # o build nesse projeto.
      {:jose, "1.11.10", override: true}
    ]
  end
end
