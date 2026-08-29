import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Em desenvolvimento, o Vite faz "proxy" das rotas /api e /socket para os
// backends. O endereço de cada backend depende de onde o Vite roda:
//   - na máquina local: localhost
//   - dentro do Docker: nome do serviço (api / realtime)
// Por isso o alvo é configurável via variável de ambiente, com um padrão
// que funciona na máquina local.
const API_PROXY_TARGET = process.env.VITE_API_PROXY_TARGET || 'http://localhost:8000';
const SOCKET_PROXY_TARGET = process.env.VITE_SOCKET_PROXY_TARGET || 'http://localhost:4000';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
    // Proxy para as rotas da API FastAPI em desenvolvimento
    proxy: {
      '/api': {
        target: API_PROXY_TARGET,
        changeOrigin: true,
      },
      // Socket WebSocket do Phoenix (channels) em desenvolvimento
      '/socket': {
        target: SOCKET_PROXY_TARGET,
        ws: true,
        changeOrigin: true,
      },
    },
  },
});
