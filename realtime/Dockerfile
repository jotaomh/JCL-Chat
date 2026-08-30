# Dockerfile — Serviço realtime (Elixir/Phoenix)
#
# Versão simplificada de estágio único, para a fase inicial do projeto.
# Mais pra frente, quando o projeto estiver mais maduro, vale migrar
# para um build multi-estágio com "mix release" (imagem final menor).

FROM hexpm/elixir:1.18.5-erlang-25.2.3-alpine-3.22.5

# Instala dependências do sistema
RUN apk add --no-cache build-base git curl ca-certificates inotify-tools

# Instala Hex e Rebar (gerenciadores de pacotes do Elixir/Erlang)
RUN mix local.hex --force && mix local.rebar --force

ENV MIX_ENV=dev

WORKDIR /app

# Copia os arquivos de dependências primeiro (aproveitamento de cache)
COPY mix.exs ./
COPY mix.lock* ./
RUN mix deps.get

# Copia o restante do código-fonte
COPY config ./config
COPY lib ./lib

# Compila o projeto
RUN mix compile

EXPOSE 4000

# Comando padrão para iniciar o servidor
CMD ["mix", "phx.server"]