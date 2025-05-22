import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 2703,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [
    react(),
    {
      name: 'mock-tailwind-version',
      resolveId(id) {
        if (id === 'tailwindcss/version.js') {
          return id;
        }
      },
      load(id) {
        if (id === 'tailwindcss/version.js') {
          return 'export default "3.3.3"';
        }
      }
    }
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "../src/main/webapp"
  },
  optimizeDeps: {
    exclude: ['tailwindcss/version.js']
  },
}));