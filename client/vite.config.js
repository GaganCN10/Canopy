import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const rootEnv = loadEnv(mode, path.resolve(__dirname, '..'), '');
  const apiUrl = rootEnv.VITE_API_URL || 'http://localhost:5001/api';
  const clientPort = parseInt(rootEnv.VITE_CLIENT_PORT, 10) || 5173;

  return {
    envDir: path.resolve(__dirname, '..'),
    plugins: [react()],
    server: {
      port: clientPort,
      proxy: {
        '/api': {
          target: apiUrl.replace(/\/api$/, ''),
          changeOrigin: true,
        },
        '/socket.io': {
          target: apiUrl.replace(/\/api$/, ''),
          ws: true,
        },
      },
    },
  };
});
