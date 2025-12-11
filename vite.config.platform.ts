import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Platform app Vite configuration
// Run with: npx vite --config vite.config.platform.ts
export default defineConfig({
  plugins: [
    {
      name: "platform-html",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === "/") {
            req.url = "/index.platform.html";
          }
          next();
        });
      },
    },
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5174, // Different port from tenant app (5173)
    proxy: {
      "/api": {
        target: "http://localhost:5050",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist-platform",
    rollupOptions: {
      input: path.resolve(__dirname, "index.platform.html"),
    },
  },
});
