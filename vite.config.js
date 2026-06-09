import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  // impact-ui ships as a CommonJS bundle; pre-bundle it so named
  // exports (Header, Sidebar, ...) resolve cleanly under Vite/esbuild.
  optimizeDeps: {
    include: ["impact-ui"],
  },
});
