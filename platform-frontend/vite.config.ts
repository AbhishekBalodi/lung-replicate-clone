import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Platform frontend Vite configuration
export default defineConfig({
  plugins: [
    {
      name: "spa-html-fallback",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          /**
           * Serve index.html for all SPA routes
           * Exclude:
           * - API calls
           * - Vite internal files
           * - Static assets
           */
          if (
            req.url &&
            !req.url.startsWith("/api") &&
            !req.url.startsWith("/src") &&
            !req.url.startsWith("/node_modules") &&
            !req.url.startsWith("/@") &&
            !req.url.includes(".")
          ) {
            req.url = "/index.html";
          }
          next();
        });
      },
    },
    react(),
  ],

  resolve: {
    // Prevent multiple React copies (important in monorepo-like setups)
    dedupe: ["react", "react-dom"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    port: 5174, // Platform frontend
    proxy: {
      "/api": {
        target: "http://localhost:5053",
        changeOrigin: true,
      },
    },
  },

  build: {
    outDir: "dist",
    rollupOptions: {
      input: path.resolve(__dirname, "index.html"),
    },
  },
});
