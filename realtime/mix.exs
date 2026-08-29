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
      {:jason, "~> 1.4"}
    ]
  end
end
