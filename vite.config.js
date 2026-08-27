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
    // Los .jsx de test importan pantallas que arrastran medio árbol de MUI;
    // sin este timeout el primer render de cada archivo se pasa del default.
    testTimeout: 15000,
    exclude: ["node_modules", "dist", "release", "build"],
  },
});
