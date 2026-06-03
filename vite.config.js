import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Zde říkáme: cokoliv začíná na /rest.php, pošli na localhost:80
      '/rest.php': {
        target: 'http://localhost',
        changeOrigin: true,
      }
    }
  }
});