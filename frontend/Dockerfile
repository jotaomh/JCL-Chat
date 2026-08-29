# Dockerfile — Frontend (React + Vite)
#
# Multi-stage build para produção:
#   1. Build: instala deps e cria os arquivos estáticos
#   2. Runtime: serve os arquivos (usa um servidor leve)
#
# NOTA: para desenvolvimento local, usamos o comando override
# no docker-compose (npm run dev) que roda o Vite em modo dev.
FROM node:22-alpine AS build

WORKDIR /app

# Copia os manifests primeiro (aproveitamento de cache)
COPY package.json ./
COPY tsconfig*.json ./

# Instala as dependências
RUN npm install

# Copia o código-fonte
COPY index.html ./
COPY vite.config.ts ./
COPY public ./public
COPY src ./src

# Compila para produção
RUN npm run build

# ---------- Runtime ----------
FROM nginx:alpine AS runtime

# Copia os arquivos buildados para o diretório servido pelo nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Configuração do nginx para SPA (redireciona tudo para o index.html)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
