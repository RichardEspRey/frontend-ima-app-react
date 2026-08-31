# Incrementos

Cada uno: una rama, de 1 a 5 días, mergeado a `main` antes de empezar el siguiente.

**Criterio de terminado común a todos** (detalle en `06-DOCUMENTACION.md`):

1. `npm test` verde
2. `npm run build` verde
3. `npm run lint` sin errores de `jsdoc/*` en las zonas migradas
4. Todo lo exportado que se tocó tiene JSDoc completo
5. Las carpetas nuevas tienen su `README.md`
6. `docs/MODULOS/<modulo>.md` escrito o actualizado
7. `npm run docs:api` corrido y commiteado
8. `00-ESTADO.md` actualizado
9. Mergeado a `main`

---

## Incremento 0 — Cimientos y seguridad inmediata

**Riesgo de conflicto: nulo** (configuración y archivos nuevos).

1. Mergear `refactor-01-red-de-seguridad` (vitest + smoke tests) a `main`. Ya está hecho,
   solo falta integrarlo.
2. ~~`.env` a `https://`~~ **No se puede: el servidor no tiene HTTPS funcional** (443
   acepta TCP, el handshake TLS se corta). Verificado el 2026-08-31. Queda como
   **bloqueante externo**, no como tarea de front: hay que reparar el certificado en el
   hosting de GoDaddy. En cuanto exista TLS, el cambio en `.env` es de una línea y
   `shared/api/endpoints.js` ya lo tendrá centralizado en un solo lugar.
3. Explicitar `webPreferences` en `electron.cjs`: `contextIsolation: true`,
   `nodeIntegration: false`, `sandbox: true`. Agregar `setWindowOpenHandler` que niegue
   ventanas nuevas y guarda de `will-navigate` a dominios ajenos.
4. Instalar y configurar `eslint-plugin-boundaries` con las capas de `02-ARQUITECTURA.md`.
   Arranca en `warn` (nada existe todavía en la estructura nueva); pasa a `error` en el
   incremento 2.
5. Reglas de lint: prohibir `dangerouslySetInnerHTML` y `eval` (hoy hay 0 usos — se trata
   de que siga siendo verdad).
6. Crear `docs/refactor/EN-CURSO.md` y avisarle a Richard.
7. **Base de documentación**: instalar `eslint-plugin-jsdoc` (reglas en `warn` para
   `src/**`, `error` para `src/{shared,entities,features}/**`) y `jsdoc-to-markdown` con
   el script `docs:api`.
8. Escribir `docs/README.md`, `docs/CONTRIBUYENDO.md` y los 4 ADR de las decisiones ya
   tomadas: sin IdP externo, TanStack Query, sin TypeScript en fase 1, roles normalizados
   en el front.

**Terminado cuando**: los tests corren en `main`, Electron está endurecido, el linter
conoce las fronteras y exige JSDoc en las zonas nuevas, y `docs/` tiene índice y
convenciones. El HTTPS queda anotado como bloqueante de infraestructura.

---

## Incremento 1 — Limpieza sin riesgo

**Riesgo: bajo** (solo se borra código muerto).

1. Borrar los 9 archivos huérfanos ya identificados.
2. Borrar `src/auth/AuthContext.jsx` — nadie lo importa.
3. Borrar `src/core/` (vacía) y el `.DS_Store` de dentro.
4. Sacar Redux: `menuSlice` y `store.jsx` mueren; `AppRouter` deja de envolver en
   `<Provider>`. Desinstalar `@reduxjs/toolkit` y `react-redux`.
5. Antes de borrar cada archivo: `grep -rn "NombreArchivo" src` debe dar 0.

**Terminado cuando**: dos dependencias menos en `package.json`, cero referencias rotas.

---

## Incremento 2 — Capa de API

**Riesgo: nulo al crear, medio al migrar el piloto.** Es el incremento de mayor retorno.

1. Crear `shared/api/`: `client.js`, `endpoints.js`, `errors.js`, `queryClient.js`.
   `client.js` centraliza FormData, `op`, identidad, timeout con `AbortController`,
   y normaliza `{status:'error'}` a excepción.
2. Instalar `@tanstack/react-query` y `zod`. Montar el `QueryClientProvider` en `app/`.
3. Crear `entities/` para los catálogos: `driver`, `truck`, `trailer`, `warehouse`,
   `company`. Los 14 hooks `useFetchX` se vuelven una línea de `useQuery` cada uno y los
   viejos quedan como puentes de re-export.
4. **Piloto**: migrar una sola pantalla completa a la capa nueva.
   `screens/Nomina/PersonalAdmin.jsx` (401 líneas) — módulo con **0 toques** de ambos
   desarrolladores en 4 meses, así que el piloto no va a chocar con nada.
5. Documentar el patrón resultante en este archivo para que los demás módulos lo copien.
5b. Llenar `docs/API-ENDPOINTS.md` con los 36 endpoints y sus `op` mientras se inventarían
   las llamadas — incluida la columna que marca cuáles usa la app móvil.
6. Subir `eslint-plugin-boundaries` a `error`.

**Terminado cuando**: una pantalla real corre sobre la capa nueva sin un solo `fetch()`
propio, y los catálogos se piden una vez en toda la app en lugar de una por pantalla.

---

## Incremento 3 — Biblioteca de UI compartida

**Riesgo: bajo** (archivos nuevos, extraídos de lo que ya se repite).

`shared/ui/`: `DataTable` (columnas declarativas, orden, paginación, estados vacío/carga/error),
`FormField`, `Modal`, `ConfirmDialog`, `PageHeader`, `FilterBar`, `ExportButton`,
`EmptyState`, `ErrorBoundary`, `notify`.

`notify` envuelve **una sola** de las tres librerías de notificación que hay hoy
(`sweetalert2`, `react-toastify`, `@pablotheblink/flashyjs`). Se elige una, se envuelve, y
las otras dos se van saliendo módulo por módulo.

`DataTable` se extrae de la tabla de gastos, que es la más completa, y se generaliza.

**Terminado cuando**: el piloto del incremento 2 usa `DataTable` y `notify`, y ninguna
pieza de `shared/ui` importa nada de `entities/` o `features/`.

---

## Incremento 4 — Sesión y permisos

**Riesgo: medio-alto.** Toca 57 comparaciones repartidas por toda la app. Ver `03-AUTH-ROLES.md`.

1. `shared/auth/`: `roles.js`, `permissions.js`, `normalizeRole.js`, `authService.js`,
   `SessionProvider.jsx`, `useSession.js`, `usePermissions.js`, `<Can>`, `<RequirePermission>`.
2. Sustituir las 57 comparaciones `=== 'admin'` por `can('modulo.accion')`. Mecánico pero
   hay que revisar caso por caso qué permiso corresponde.
3. `menuConfig` deja de tener `rolesPermitidos` con nombres propios; el menú se deriva de
   los permisos.
4. Retirar `useAuthStore.checkAccess`.
5. Revalidar permisos al arrancar la app, no solo al hacer login (arregla el bug de que
   quitar un permiso no surte efecto hasta cerrar sesión).
6. Caducidad local de sesión y logout que limpie zustand + caché de react-query + token push.
7. Escribir `docs/GLOSARIO.md` y documentar el modelo de roles y permisos resultante.

**Bloqueado por**: el esquema de `Users_credentials` y el `SELECT type, COUNT(*)`.
**Terminado cuando**: `grep -rn "tipo_usuario ===" src` da 0 y los permisos de cada usuario
real siguen siendo exactamente los de antes.

---

## Incremento 5 — Nómina completo (el patrón de referencia)

**Riesgo: bajo.** `screens/Nomina/` tiene **0 toques** de Emiliano y de Richard en 4 meses:
es el único módulo donde el refactor puede trabajar sin competir con nadie.

Sale entero: `entities/payroll/` + `features/payroll-*/` + `pages/nomina/`.
Incluye `Nomina.jsx`, `PersonalAdmin.jsx` (401) y `DetallePago.jsx`.

Es representativo de lo que hay en el resto de la app —lista, detalle, formulario y
llamadas a la API— así que el patrón que salga de aquí sirve para todos los demás.

Ningún archivo del módulo pasa de 250 líneas al terminar.

**Terminado cuando**: el módulo entero está en la estructura nueva y este documento tiene
la receta paso a paso que los demás módulos van a seguir, con su `README.md`,
`docs/MODULOS/nomina.md` y JSDoc completo.

> **Por qué no Gastos, que era el plan original.** Gastos es el módulo **más caliente de
> los dos desarrolladores** (40 toques en 4 meses). Con una rama de refactor de vida larga,
> refactorizarlo temprano garantiza conflictos en cada merge entrante durante meses. Se va
> al final, cuando ya no queda nada más que hacer y la ventana de exposición es mínima.

---

## Incrementos 6 a N — Resto de módulos, de frío a caliente

Uno por rama, en este orden — **de frío a caliente según el mapa de calor combinado** de
`01-DIAGNOSTICO.md`. El principio: cuanto más caliente el módulo, más tarde se toca, para
reducir la ventana en que un merge entrante puede chocar con él.

| # | Módulo | Toques combinados |
|---|---|---:|
| 6 | AccessManager / Usuarios | 0 |
| 7 | Reports / Welcome | 0 |
| 8 | IMA Manager (documentos) | 0 |
| 9 | Mantenimientos / Órdenes de servicio | 1 |
| 10 | Safety / IFTA | 1 |
| 11 | Finanzas | 4 |
| 12 | Dispatch | 6 |
| 13 | Mapas / Tracking (916 líneas) | 11 |
| 14 | Drivers / Trucks / Trailers | 15 |
| 15 | **Viajes** + `TripRow` + `trip-form` | 44 |
| 16 | **Gastos** — el más caliente de todos | 40 |

Viajes y Gastos van al final a propósito: juntos concentran el 60 % de la actividad de
features de los últimos 4 meses.

Cada uno: mover con `git mv` limpio, extraer el controller, partir en piezas, migrar a la
capa de API, dejar puentes, borrar los puentes del incremento anterior.

---

## Incremento final — Deduplicación

Con todo ya en la estructura nueva se pueden fusionar los duplicados sin pelearse con la
organización de archivos:

- `BorderCrossingForm` (987) + `BorderCrossingFormNew` (1016) + `BorderCrossingFormNew2` (358)
- `TripForm` (1008) + `TripFormNew` (749)

≈ 4 100 líneas → un componente configurable por variante. Es el último porque necesita que
Viajes ya esté migrado y porque es el cambio con más riesgo de regresión de negocio: hay
que comparar los tres formularios campo por campo antes de fusionar.

---

## Después de la fase 1

**Fase 2 — backend PHP**: tokens de sesión reales en `Auth.php`, verificación de identidad
en los 36 endpoints, sentencias preparadas, versionado o compatibilidad hacia atrás por la
app móvil. Nada de esto se puede hacer sin coordinar con quien mantiene la móvil.

**Fase 3 — base de datos**: tablas `roles` / `permissions` / `role_permissions` /
`user_roles`, migración de `Users_credentials.type`, y retiro del normalizador de roles.
