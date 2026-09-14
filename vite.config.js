import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api/saavn': {
        target: 'https://www.jiosaavn.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/saavn/, '/api.php'),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://www.jiosaavn.com/'
        }
      }
    }
  }
});
