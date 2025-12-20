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
          // Serve index.platform.html for all routes (SPA routing)
          // Skip for assets, API calls, and file requests with extensions
          if (
            req.url &&
            !req.url.startsWith("/api") &&
            !req.url.startsWith("/src") &&
            !req.url.startsWith("/node_modules") &&
            !req.url.startsWith("/@") &&
            !req.url.includes(".")
          ) {
            req.url = "/index.platform.html";
          }
          next();
        });
      },
    },
    react(),
  ],
  resolve: {
    // Prevent "Invalid hook call" errors caused by multiple React copies
    dedupe: ["react", "react-dom"],
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
