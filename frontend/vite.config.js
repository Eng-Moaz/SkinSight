import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In dev, requests to /api/* are forwarded to the prediction service
// (FastAPI on port 8000), with the /api prefix removed.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
