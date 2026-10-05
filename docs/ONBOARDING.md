# De cero a la app corriendo

> Para quien llega al proyecto. En media hora: la app abierta, las pruebas en verde y la
> idea de dónde está cada cosa. Después de esto, sigue con
> [`ARQUITECTURA.md`](ARQUITECTURA.md) y [`GLOSARIO.md`](GLOSARIO.md).

---

## 1 · Antes de empezar: tres cosas que no son obvias

1. **No hay ambiente de pruebas.** La app en tu máquina habla con la API y la base de
   **producción**. Leer es inofensivo; **guardar desde la pantalla escribe datos reales**.
   Para probar una captura, elige a propósito un registro que se pueda corregir después.
2. **La API no tiene HTTPS funcional ni autentica.** Todo viaja en claro y la identidad es
   un número que manda el cliente. No pongas credenciales reales en capturas de pantalla
   ni en issues.
3. **Una app móvil usa los mismos endpoints.** Si tocas un contrato del backend, la rompes
   sin que este repo se entere.

---

## 2 · Requisitos

| Herramienta | Versión | Para qué |
|---|---|---|
| Node.js | 20 o superior (el equipo usa 24) | Vite 6, Vitest 3 y Electron 44 |
| npm | el que trae Node | `npm ci` respeta `package-lock.json` |
| Git | cualquiera reciente | — |
| Acceso al repo | `RichardEspRey/frontend-ima-app-react` | Pídelo a quien administre el repositorio |

---

## 3 · Ponerla a andar

```bash
git clone git@github.com:RichardEspRey/frontend-ima-app-react.git
cd frontend-ima-app-react
git switch refactor-fase-1        # la estructura nueva; ver "Ramas" abajo

npm ci                            # instala exactamente lo del lock
cp .env.example .env              # y pon el host real de la API en VITE_API_HOST
npm run dev                       # http://localhost:5173
```

El host de la API te lo da alguien del equipo; no está en el repositorio. Si falta, la app
no arranca y lo dice: `Falta VITE_API_HOST. Copia .env.example a .env…`.

La app usa `HashRouter`: las rutas se ven como `http://localhost:5173/#/admin-trips`.

**Para entrar** necesitas un usuario dado de alta en el sistema. No hay usuarios de prueba
ni datos de semilla: pide uno a quien administre los accesos (pantalla *Gestor de Acceso*).

### Dentro de Electron

```bash
npm run build                     # compila a dist/
npm start                         # abre Electron sobre dist/
npm run humo:electron             # prueba de humo: arranca, pinta y está aislado
```

Electron carga `dist/index.html`, no el servidor de desarrollo: para ver un cambio en
Electron hay que volver a compilar. En el día a día se trabaja en el navegador.

---

## 4 · Comprobar que todo está bien

```bash
npm test                          # ~940 pruebas, unos 10 segundos
npm run lint                      # 0 errores; las advertencias son de la estructura vieja
npm run build                     # compila sin errores
```

Si las pruebas fallan con `Falta VITE_API_HOST`, falta el `.env`: algunas pruebas cargan
el cliente de API y este exige el host aunque no haga peticiones.

---

## 5 · Dónde está cada cosa

```
src/
  app/        arranque: providers, tema, errores globales
  pages/      una pantalla por ruta, agrupadas por módulo
  features/   casos de uso: la lógica y la interfaz de cada pantalla
  entities/   el dominio: viaje, caja, gasto, orden de servicio…
  shared/     sin negocio: cliente de API, UI base, sesión, utilidades

  components/, hooks/, store/, navigation/, layouts/   estructura vieja, se va vaciando
  no-usadas/                                           código congelado; no se toca

docs/         documentación; empieza por docs/README.md
scripts/      sincronización del refactor, documentación, medición, humo de Electron
electron.cjs  proceso principal de Electron
preload.js    el puente entre Electron y la página
```

Para encontrar el código de una pantalla, parte de su ruta:

1. Busca la ruta en `src/navigation/AppRouter.jsx` → te da la página.
2. La página importa su feature → ahí está el controlador (`model/use*.js`) y la interfaz.
3. La feature importa su entidad → ahí están las reglas y la llamada al endpoint.

---

## 6 · Ramas

```
main  →  Emiliano  →  refactor-fase-1
```

| Rama | Qué es |
|---|---|
| `main` | Lo aprobado. Se mergea aquí; no se trabaja aquí |
| `Emiliano`, `Richard` | Ramas personales donde nacen las features. `Emiliano` es además la referencia contra la que se compara que el refactor funcione igual |
| `refactor-fase-1` | La estructura nueva. Reemplaza a `Emiliano` de una vez cuando funcione al 100 % |

El flujo es de **una sola dirección**. Lo que nace en `Emiliano` se lleva al refactor
**reescribiéndolo** con la arquitectura nueva, en un commit normal; no se mergea, porque el
merge trae las pantallas viejas que el refactor ya reescribió. Detalle en
[`CONTRIBUYENDO.md`](CONTRIBUYENDO.md).

---

## 7 · Tu primera tarea

Lee una pantalla pequeña completa, de la ruta a la base:

1. `src/pages/viajes/EstatusCajasPage.jsx` — la composición.
2. `src/features/estatus-cajas/model/useTableroCajas.js` — el controlador.
3. `src/features/estatus-cajas/ui/TablaEstatusCajas.jsx` — la tabla.
4. `src/entities/trailer/model/estatusCaja.js` y su prueba — las reglas.
5. `src/entities/trailer/api/estatusCajas.js` — la llamada y la caché.
6. `docs/backend/cajas_estatus.php` — el endpoint del otro lado.

Después, [`CREAR-UNA-PANTALLA.md`](CREAR-UNA-PANTALLA.md) explica cómo se construye una
igual.

---

## 8 · Problemas conocidos

| Síntoma | Causa | Qué hacer |
|---|---|---|
| `Falta VITE_API_HOST` | No hay `.env` | `cp .env.example .env` y completar el host |
| El mapa tarda ~20 s en cargar | `Tracking.php` tarda eso de verdad | Nada; tiene su propio límite de espera |
| `git fetch` falla en ciertas redes | Algunas redes filtran el SSH aunque el puerto 22 responda | Cambiar de red o usar HTTPS |
| Un cambio no se ve en Electron | Electron carga `dist/`, no el servidor de desarrollo | `npm run build` y volver a abrir |
| Avisos de React en consola sobre `<div>` dentro de `<p>` | Un componente dentro de `Typography` | `component="div"`; ver `shared/ui/README.md` |
