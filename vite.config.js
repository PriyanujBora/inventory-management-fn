import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

// Used when VITE_API_URL is empty: requests to /api on the frontend's own address are forwarded to Express.
const apiProxy = { '/api': 'http://localhost:5000' };

export default defineConfig(({ mode }) => ({
  // `npm run dev:https` serves over HTTPS (self-signed) so phones on the same Wi-Fi can use their camera.
  plugins: [react(), mode === 'https' && basicSsl()],
  // A phone can't reach the PC's "localhost:5000" (and an HTTPS page can't call plain HTTP),
  // so in that mode the app calls /api on its own address and the proxy below forwards it.
  define: mode === 'https' ? { 'import.meta.env.VITE_API_URL': JSON.stringify('') } : {},
  server: { proxy: apiProxy },
  preview: { proxy: apiProxy },
}));
