import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Content-Security-Policy del build empaquetado. Electron avisa en consola cuando
// no hay ninguna, y con razón: sin CSP, cualquier inyección de contenido en el
// renderer puede cargar y ejecutar lo que quiera. Importa más de lo normal aquí
// porque la API viaja por HTTP en claro, así que un intermediario en la red puede
// alterar las respuestas.
//
// Solo se aplica al build. En `npm run dev`, Vite necesita eval y websockets para
// el HMR, y meter esto ahí rompería el desarrollo sin proteger a nadie.
//
// Cada origen de la lista está en el código; si agregas uno nuevo y la pantalla
// deja de cargar en la app empaquetada, es que falta aquí.
const CSP = [
  "default-src 'self'",
  // MUI y emotion inyectan estilos en línea; sin unsafe-inline la app se ve rota.
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self'",
  "worker-src 'self' blob:",
  "font-src 'self' data:",
  // blob: y data: los usan la generación de PDF y los mapas.
  "img-src 'self' data: blob: https://*.tile.openstreetmap.org",
  [
    "connect-src 'self'",
    "http://imaexpressllc.com https://imaexpressllc.com", // la API de IMA
    "https://api.frankfurter.dev https://mx.dolarapi.com", // tipo de cambio
    "https://nominatim.openstreetmap.org https://router.project-osrm.org", // mapas
  ].join(" "),
  "object-src 'none'",
  "base-uri 'self'",
  // frame-ancestors no aplica en un <meta>; el navegador lo ignora y avisa.
  "form-action 'none'",
].join("; ");

/**
 * Inserta la CSP en el `index.html` del build, no en el de desarrollo.
 *
 * @returns {object} El plugin de Vite.
 */
const cspEnProduccion = () => ({
  name: "csp-en-produccion",
  apply: "build",
  transformIndexHtml(html) {
    return html.replace(
      "</title>",
      `</title>\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />`,
    );
  },
});

export default defineConfig({
  plugins: [react(), cspEnProduccion()],
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
