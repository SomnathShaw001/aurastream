import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function downloadProxyPlugin() {
  return {
    name: 'download-proxy-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/download')) {
          try {
            const urlObj = new URL(req.url, 'http://localhost:5173');
            const targetUrl = urlObj.searchParams.get('url');
            const filename = urlObj.searchParams.get('filename') || 'Track.mp3';

            if (!targetUrl) {
              res.statusCode = 400;
              return res.end('Missing target audio URL');
            }

            const audioRes = await fetch(targetUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://www.jiosaavn.com/'
              }
            });

            if (!audioRes.ok) {
              res.statusCode = audioRes.status;
              return res.end(`Failed to fetch audio stream: ${audioRes.statusText}`);
            }

            res.setHeader('Content-Type', 'audio/mpeg');
            res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
            res.setHeader('Access-Control-Allow-Origin', '*');

            const buffer = Buffer.from(await audioRes.arrayBuffer());
            return res.end(buffer);
          } catch (err) {
            console.error('Local Download Proxy Error:', err);
            res.statusCode = 500;
            return res.end('Download Proxy Error: ' + err.message);
          }
        }
        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), downloadProxyPlugin()],
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
