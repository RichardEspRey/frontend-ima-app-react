import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["htmldocs"],
  },
  base: "./", // ✅ ¡Esto es clave en Electron!
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.js",
    // Cada archivo de prueba monta pantallas que arrastran medio árbol de MUI;
    // sin este margen, el primer render se pasa del tiempo por omisión.
    testTimeout: 15000,
    exclude: ["node_modules", "dist", "release", "build"],
  },
});
