import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'house-of-taaga-api',
      configureServer(server) {
        import('./server/index.js').then(({ app }) => {
          server.middlewares.use(app);
          console.log('✅ [Vite] House of Taaga API mounted in-process into Vite server');
        }).catch(err => {
          console.warn('[Vite] Could not mount in-process API:', err.message);
        });
      }
    }
  ],
  server: {
    port: 5173,
    host: true
  }
});
