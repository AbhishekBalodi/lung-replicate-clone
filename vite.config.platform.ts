import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Platform app Vite configuration
// Run with: npx vite --config vite.config.platform.ts (run from platform-frontend or root)
const PLATFORM_ROOT = path.resolve(__dirname, "platform-frontend");

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, PLATFORM_ROOT, "");
  // Keep the development proxy independent from the production browser API URL.
  // api.ts sends development requests to same-origin `/api`, so this must point
  // at the local Express server unless a different backend is explicitly needed.
  const apiProxyTarget = env.VITE_API_PROXY_TARGET || "http://localhost:5050";

  return {
  root: PLATFORM_ROOT,
  plugins: [
    {
      name: "platform-html",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Serve index.html for all routes (SPA routing)
          // Skip for assets, API calls, and file requests with extensions
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
    // Prevent "Invalid hook call" errors caused by multiple React copies
    dedupe: ["react", "react-dom"],
    alias: {
      "@": path.resolve(PLATFORM_ROOT, "src"),
    },
  },
  server: {
    port: 5174, // Different port from tenant app (5173)
    proxy: {
      "/api": {
        target: apiProxyTarget,
        changeOrigin: true,
        secure: true,
      },
    },
  },
  build: {
    outDir: path.resolve(PLATFORM_ROOT, "dist-platform"),
    rollupOptions: {
      input: path.resolve(PLATFORM_ROOT, "index.html"),
    },
  },
  };
});
