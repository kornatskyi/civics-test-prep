import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "static", // match api path on which server serves static files
  server: {
    // dev server configuration
    // You can set your host/port here if needed
    port: 5173,
    // Proxy API calls to FastAPI if you want them on the same origin
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});
