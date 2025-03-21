import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'; // For telwind css

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // For telwind css
  ],
})
