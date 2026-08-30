#!/usr/bin/env bash
# =============================================================================
#  install-docker.sh — Instala o Docker Engine + Docker Compose no Linux
# =============================================================================
#  Distribuições suportadas (detecção automática):
#    - Ubuntu, Debian, Pop!_OS (família apt)
#    - Arch Linux e derivados (família pacman)
#
#  SEGURANÇA:
#    Este script NUNCA contém, pede, solicita ou armazena a senha do sistema.
#    Ele usa apenas `sudo` de forma interativa, ou seja, o próprio terminal
#    pedirá a senha ao usuário no momento da execução. Nenhuma senha é
#    passada como parâmetro, nem salva em variáveis ou arquivos.
#
#  Uso:
#    chmod +x install-docker.sh
#    ./install-docker.sh
# =============================================================================
set -euo pipefail

# ----------------------------------------------------------------------------
#  Cores para melhor leitura no terminal (opcional, não afeta a funcionamento)
# ----------------------------------------------------------------------------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn()  { echo -e "${YELLOW}[AVISO]${NC} $1"; }
log_error() { echo -e "${RED}[ERRO]${NC} $1"; }

# ----------------------------------------------------------------------------
#  Detecção da distribuição Linux
# ----------------------------------------------------------------------------
detect_distro() {
  if [ -f /etc/os-release ]; then
    # shellcheck disable=SC1091
    . /etc/os-release
    echo "$ID"
  else
    echo "unknown"
  fi
}

# ----------------------------------------------------------------------------
#  Instalação via apt (Debian / Ubuntu / Pop!_OS)
# ----------------------------------------------------------------------------
install_apt() {
  log_info "Distribuição baseada em apt detectada. Atualizando pacotes..."
  # O sudo abaixo pede a senha interativamente no terminal.
  # Nenhuma senha é armazenada ou passada como argumento.
  sudo apt-get update

  log_info "Instalando pré-requisitos (curl, ca-certificates)..."
  sudo apt-get install -y ca-certificates curl gnupg lsb-release

  # Adiciona o repositório oficial do Docker (para versões recentes)
  log_info "Configurando o repositório oficial do Docker..."
  sudo install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/$(. /etc/os-release && echo "$ID")/gpg \
    | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  sudo chmod a+r /etc/apt/keyrings/docker.gpg

  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
    https://download.docker.com/linux/$(. /etc/os-release && echo "$ID") \
    $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
    | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

  sudo apt-get update

  log_info "Instalando Docker Engine, CLI e o plugin Compose..."
  sudo apt-get install -y \
    docker-ce \
    docker-ce-cli \
    containerd.io \
    docker-buildx-plugin \
    docker-compose-plugin
}

# ----------------------------------------------------------------------------
#  Instalação via pacman (Arch Linux e derivados)
# ----------------------------------------------------------------------------
install_pacman() {
  log_info "Distribuição baseada em Arch detectada."

  # Verifica se temos o yay ou paru (AUR helper) — opcional, tentamos pacman
  log_info "Instalando docker e docker-compose via pacman..."
  # O sudo abaixo pede a senha interativamente no terminal.
  sudo pacman -Syu --noconfirm docker docker-compose

  log_info "Habilitando o serviço do Docker para iniciar com o sistema..."
  sudo systemctl enable docker
}

# ----------------------------------------------------------------------------
#  Função principal
# ----------------------------------------------------------------------------
main() {
  local distro
  distro="$(detect_distro)"

  log_info "Distribuição detectada: ${distro}"

  case "$distro" in
    ubuntu|debian|pop)
      install_apt
      ;;
    arch|manjaro|endeavouros)
      install_pacman
      ;;
    *)
      log_error "Distribuição não suportada automaticamente: '${distro}'"
      log_error "Suportadas: Ubuntu, Debian, Pop!_OS, Arch e derivados."
      log_warn "Consulte https://docs.docker.com/engine/install/ e instale manualmente."
      exit 1
      ;;
  esac

  # -------------------------------------------------------------------------
  #  Inicia o serviço do Docker (systemd)
  # -------------------------------------------------------------------------
  log_info "Iniciando o serviço do Docker..."
  sudo systemctl start docker || log_warn "Não foi possível iniciar via systemd. Verifique manualmente."
  sudo systemctl enable docker || true

  # -------------------------------------------------------------------------
  #  Adiciona o usuário atual ao grupo "docker"
  #  Assim o usuário não precisa de sudo para rodar comandos docker/compose.
  # -------------------------------------------------------------------------
  log_info "Adicionando o usuário '${USER}' ao grupo 'docker' (para usar sem sudo)..."
  sudo usermod -aG docker "${USER}"
  log_warn "Reinicie a sessão (logout/login) para o grupo 'docker' entrar em vigor."

  # -------------------------------------------------------------------------
  #  Verificação final
  # -------------------------------------------------------------------------
  docker --version || log_warn "Reinicie a sessão e rode 'docker --version' novamente."
  docker compose version || log_warn "Reinicie a sessão e rode 'docker compose version' novamente."

  log_info "Instalação concluída!"
  log_info "Agora, para usar o projeto:"
  log_info "  1. Reinicie o terminal (logout/login)."
  log_info "  2. cp .env.example .env   (preencha as senhas/chaves)."
  log_info "  3. docker compose up --build"
}

# Executa o script
main
