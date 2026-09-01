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
5. ~~Revalidar permisos al arrancar~~ **Ya se revalidan**: `DashboardLayout` llama a
   `fetchPermissions` cada 15 s con un `setInterval`. Yo había escrito que solo se pedían
   al hacer login y que quitar un permiso no surtía efecto hasta cerrar sesión; es falso.
   Lo que sí queda pendiente es sustituir ese `setInterval` por un `refetchInterval` de
   TanStack Query, que cancela solo al desmontar y no dispara si la ventana está oculta.
6. Caducidad local de sesión y logout que limpie zustand + caché de react-query + token push.
7. Escribir `docs/GLOSARIO.md` y documentar el modelo de roles y permisos resultante.

**Bloqueado por**: el esquema de `Users_credentials` y el `SELECT type, COUNT(*)`.
**Terminado cuando**: `grep -rn "tipo_usuario ===" src` da 0 y los permisos de cada usuario
real siguen siendo exactamente los de antes.

---

## Incremento 4b — Dependencias y vulnerabilidades

**Riesgo: medio.** No mueve arquitectura; actualiza dependencias.

GitHub reporta **136 vulnerabilidades** en el repo (3 críticas, 58 altas, 62 medias,
13 bajas) al 2026-08-31. No espera al final de la fase 1: tres críticas conviviendo
meses con una app que ya manda credenciales en claro es demasiado.

1. `npm audit` y separar lo que se arregla solo (`npm audit fix`) de lo que exige
   un salto de versión mayor.
2. Distinguir lo que corre en el **navegador del usuario** de lo que solo corre al
   **construir**: una vulnerabilidad en una dependencia de build no tiene el mismo
   radio que una en `pdfjs-dist` o `xlsx`, que procesan archivos que la gente sube.
3. `pdfjs-dist` está clavada en `4.4.168` — hay que ver por qué antes de moverla.
4. Los saltos mayores se hacen de uno en uno, con `npm test` entre cada uno.
5. Lo que no se pueda actualizar sin romper, se anota con su razón en
   `docs/DECISIONES/`, no se deja en silencio.

**Terminado cuando**: cero vulnerabilidades críticas y altas en dependencias que
lleguen al usuario, y las que queden estén justificadas por escrito.

---

## Incremento 5 — Nómina completo (el patrón de referencia)

**Riesgo: bajo.** `screens/Nomina/` tiene **0 toques** de Emiliano y de Richard en 4 meses:
es el único módulo donde el refactor puede trabajar sin competir con nadie.

Sale entero: `entities/payroll/` + `features/payroll-*/` + `pages/nomina/`.
Incluye `Nomina.jsx`, `PersonalAdmin.jsx` (401) y `DetallePago.jsx`.

Es representativo de lo que hay en el resto de la app —lista, detalle, formulario y
llamadas a la API— así que el patrón que salga de aquí sirve para todos los demás.

Ningún archivo del módulo pasa de 250 líneas al terminar.

**HECHO** el 2026-08-31. La receta que salió, para los diez módulos siguientes:

### La receta

**1. Leer el módulo entero antes de tocar nada.** Las tres pantallas, sus llamadas a la
API, qué campos usan. Salieron cinco bugs solo de leer con atención.

**2. La entidad primero, y solo agrega.** `entities/<x>/model` con los esquemas zod y los
cálculos que estaban inline en el JSX; `entities/<x>/api` con las queries. Con sus tests.
Nada de esto rompe nada porque todavía no lo usa nadie. **Commit.**

**3. Mover con `git mv`, en un commit aparte y sin editar.** Verificar con
`git diff --cached -M --stat` que git diga *rename* y no *delete + create*: si no, cada
línea que llegue de `Emiliano` sobre esos archivos será un conflicto manual. Actualizar el
router. **Commit.**

**4. Ahora sí, reescribir las pantallas.** Sin `fetch`, sin `Swal`, sin tabla a mano: la
entidad da los datos y `shared/ui` la presentación. Ojo con no cambiar el aspecto sin
querer — el `<Container maxWidth="xl">` que traen las pantallas no lo da el layout.

**5. Verificarlo en el navegador, no solo con `npm test`.** Los tests corren en jsdom y no
vieron ni el `Grid` roto ni el HTML inválido. Ambos salieron de abrir la pantalla y mirar
la consola.

**6. El estilo sale gratis si usas `shared/ui`.** `DataTable` y `PageHeader` ya traen los
tokens del sistema. No escribas colores ni tamaños a mano: si algo no está cubierto,
importa el token de `shared/ui/estilos`. Si el módulo traía un aspecto propio, se sustituye
por el del sistema — es el mismo del Expense Manager y el Administrador de viajes.

**7. Guarda una fixture de la respuesta real.** `curl` al endpoint, el JSON a
`__tests__/fixtures/`, y unos tests contra él. Los tests que simulan la respuesta
reproducen la suposición de quien los escribe: así se descubrió tarde que el campo era
`plataform` y no `app`. En Documentos ya evitó un error — `valores` llega como objeto
indexado, no como lista, y `postLista` habría devuelto vacío.

**8. Documentar el módulo** en `docs/MODULOS/<x>.md`: reglas de negocio, lo que sorprende,
y los bugs que se corrigieron de camino.

### Lo que hay que buscar en cada módulo

Estos cinco aparecieron en Nómina y es probable que estén en los demás:

- **Pantallas de detalle que dependen de `useLocation().state`** — su enlace directo está
  roto y recargar la página las tumba. `grep -rn "useLocation" src`
- **Mutaciones que no miran la respuesta** — el `try/catch` solo atrapa fallos de red, así
  que un `{status:'error'}` muestra igual el mensaje de éxito.
- **`<Grid item xs={...}>`** — MUI v7 lo ignora. Quedan 265 en el proyecto.
- **Componentes que renderizan `div` dentro de `p`** — un `<Chip>` o un `<Box>` dentro de
  un `<Typography>`, que por omisión es `<p>`. Lo avisa la consola del navegador y **no lo
  ve ningún test**: jsdom no valida anidamiento. Salió dos veces en Nómina, una de ellas
  dentro del propio `DataTable`. Se arregla con `component="div"`.
- **"Cargando o no hay datos"** — el estado de carga y el vacío confundidos en un mensaje.
- **Nombres de campo que no son los que uno supondría.** En Accesos, la plataforma viaja
  en `plataform`, sin la segunda "a". Escribí el filtro contra `app` y el drawer se quedó
  sin permisos; **ningún test lo vio**, porque los tests simulan la respuesta y reproducían
  mi suposición. Antes de escribir un filtro, mirar la respuesta real con `curl`.

> **Por qué no Gastos, que era el plan original.** Gastos es el módulo **más caliente de
> los dos desarrolladores** (40 toques en 4 meses). Con una rama de refactor de vida larga,
> refactorizarlo temprano garantiza conflictos en cada merge entrante durante meses. Se va
> al final, cuando ya no queda nada más que hacer y la ventana de exposición es mínima.

---

## Incremento 9 — Mantenimientos, partido en tres

Es el módulo más grande: **11 pantallas, 2 777 líneas y 6 endpoints distintos**. No es un
módulo, son varios que comparten sección en el menú. Se parte para que cada trozo sea
verificable por su cuenta y el radio de un error sea menor.

Medido el 2026-09-01: **Richard no ha tocado ninguna de estas pantallas en 6 meses**.
Emiliano sí, y por eso lo que él tocó más reciente va al final.

### 9a — Órdenes de servicio e inventario

| Pantalla | Líneas | Endpoint |
|---|---:|---|
| `Mantenimientos/AdminOrdenesServicio.jsx` | 111 | — (contenedor de pestañas) |
| `ServiceOrderAdmin.jsx` | 357 | `service_order.php` |
| `StockAdmin.jsx` | 304 | `inventory.php` |
| `ServiceOrderScreen.jsx` | 413 | `service_order.php` |
| `ServiceOrderScreenEdit.jsx` | 435 | `service_order.php` |

`AdminOrdenesServicio` **ya está bien hecho** —usa el sistema de estilos, `useSesion` y
permisos declarativos, y es de agosto de 2026—. Se mueve y se le quitan los residuos
(`useAuthStore` para permisos, el import del puente de estilos), no se reescribe.

Ojo: `ServiceOrderScreen` y `ServiceOrderScreenEdit` son alta y edición de lo mismo;
comparar antes de migrar por si comparten más de lo que parece.

### 9b — Afinaciones y autonomía

| Pantalla | Líneas | Endpoint |
|---|---:|---|
| `Afinaciones.jsx` | 128 | `afinaciones.php` |
| `AfinacionesHistory.jsx` | 213 | `afinaciones.php` |
| `Autonomia.jsx` | 153 | `autonomia.php` |

### 9c — Reparaciones en ruta e inspecciones

| Pantalla | Líneas | Endpoint |
|---|---:|---|
| `RoadRepairsAdmin.jsx` | 185 | `roadside_repairs.php` |
| `InspectionsAdmin.jsx` | 197 | `inspecciones.php` |
| `Mantenimientos/Inspeccion_final.jsx` | 281 | `formularios.php` |

**Va al final a propósito**: son las que Emiliano tocó más recientemente —8 y 6 commits,
el último el 2026-08-30—, así que es donde más probable es que llegue trabajo nuevo desde
su rama mientras tanto.

Recordar de la fase de datos: `roadside_repairs` tiene la columna `fecha_suceso` que la
app móvil también escribe, y el UPDATE del backend solo la toca si llega en el POST.

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
| 9a | Órdenes de servicio + Inventario | 0 |
| 9b | Afinaciones + Autonomía | 0 |
| 9c | Reparaciones en ruta + Inspecciones | 0 |
| 10 | Finanzas | 4 |
| 11 | Safety / IFTA | 1 |
| 12 | Dispatch | 6 |
| 13 | Mapas / Tracking (916 líneas) | 11 |
| 14 | Drivers / Trucks / Trailers · Viajes sueltos | 15 |

### Qué contiene el 14, que es el que recoge lo que queda suelto

Al terminar el 13 quedan **13 archivos sueltos en `screens/`**, y todos caen aquí o en el
15. Conviene tenerlos listados para que no parezca que se olvidaron:

**Unidades — incremento 14** (`DriverAdmin`, `DriverScreen`, `DriverEditor`,
`TruckAdmin`, `TruckScreen`, `TrucksEditor`, `TrailerAdmin`, `TrailerScreen`,
`TrailerEdit`, `EstatusUnidades`) · ~2 800 líneas. Son tres módulos con la misma forma
—admin, listado y editor por cada tipo de unidad—, así que probablemente comparten más
código del que parece; hay que medirlo con `diff` antes de migrarlos.

**Viajes — incremento 15** (`EditTripComplete`, `EditTripForm`, `ResumenTrip`) · ~1 200
líneas. Van con el resto de Viajes porque comparten el formulario de etapas.

> **Nota del 2026-09-01.** Finanzas se hizo antes que Safety por un descuido al numerar,
> no por una decisión. Se deja así: los dos tienen la misma actividad baja, y renumerar
> los tags publicados costaría más de lo que aclara.
| 15 | **Viajes** + `TripRow` + `trip-form` | 44 |
| 16 | **Gastos** — el más caliente de todos | 40 |

Viajes y Gastos van al final a propósito: juntos concentran el 60 % de la actividad de
features de los últimos 4 meses.

Cada uno: mover con `git mv` limpio, extraer el controller, partir en piezas, migrar a la
capa de API, dejar puentes, borrar los puentes del incremento anterior.

---

## Incremento final — Deduplicación

**Medido el 2026-09-01**, no estimado. Cada par se comparó con `diff`:

| Par | Líneas | Común | Dónde se paga |
|---|---:|---:|---|
| `TripFormMX` / `TripFormUSA` | 352 + 352 | **97 %** | incremento 15 · Viajes |
| `BorderCrossingForm` / `...New` | 987 + 1017 | **92 %** | incremento 15 · Viajes |
| `NuevaOrdenPage` / `EditarOrdenPage` | 419 + 441 | **61 %** | **incremento 9a** ✅ ya movidas |
| `TripForm` / `TripFormNew` | 1009 + 750 | **50 %** | incremento 15 · Viajes |
| `BorderCrossingFormNew` / `...New2` | 1017 + 359 | 11 % | — no son duplicados, pese al nombre |

**~4 000 líneas** de las que sobra más de la mitad.

### La regla: cada duplicado se paga en el incremento de su módulo

No hay un "incremento final de deduplicación" separado, y esto corrige el plan original.
Fusionar dos formularios de viajes **desde fuera** del incremento de Viajes obliga a
entender ese módulo dos veces, y a hacerlo sin la entidad ni los tests que ese mismo
incremento crea. Sale más barato al final del incremento que ya tocó esos archivos.

Así que:

- **Los cuatro pares de viajes** se fusionan al cerrar el **incremento 15**, cuando ya
  existan `entities/trip` y sus tests.
- **`NuevaOrdenPage` / `EditarOrdenPage`** se fusionan al cerrar **9a** (ver abajo).

### Cómo se fusiona sin romper nada

1. **Diff primero, campo por campo.** Un 97 % de coincidencia esconde diferencias que sí
   importan: en `TripFormMX` / `TripFormUSA` cambia el país por omisión y qué campos son
   obligatorios. Ese 3 % es el requisito de negocio.
2. **Lo que cambia se vuelve configuración**, no una copia. Un objeto por variante con sus
   campos, sus obligatorios y sus valores por omisión.
3. **Nunca fusionar sin tests del comportamiento actual.** Es el único cambio del refactor
   que puede alterar reglas de negocio sin que se note, porque las dos copias pudieron
   divergir a propósito.
4. **Verificar las dos variantes en el navegador**, no solo una.

### Pendiente de 9a

`NuevaOrdenPage` y `EditarOrdenPage` comparten el 61 %: los mismos selectores de camión,
de tipo de reparación, la misma captura de refacciones y mano de obra, y el mismo cálculo
de totales. Difieren en que una parte vacía y la otra carga con `getOrderById`, y en que
una llama a `AltaOrden` y la otra a `UpdateOrder`.

La forma que ya funcionó en Nómina: un `features/service-order/ui/FormularioOrden.jsx` con
la captura y el cálculo, y dos páginas delgadas que le pasan los valores iniciales y qué
hacer al guardar.

**No se hizo en 9a** porque el incremento ya movía cinco archivos y fusionar formularios
es donde más fácil se pierde una regla de negocio sin que ningún test lo note. Se hace
como paso propio antes de 9b, con su verificación en el navegador.

---

## Después de la fase 1

**Fase 2 — backend PHP**: tokens de sesión reales en `Auth.php`, verificación de identidad
en los 36 endpoints, sentencias preparadas, versionado o compatibilidad hacia atrás por la
app móvil. Nada de esto se puede hacer sin coordinar con quien mantiene la móvil.

**Fase 3 — base de datos**: tablas `roles` / `permissions` / `role_permissions` /
`user_roles`, migración de `Users_credentials.type`, y retiro del normalizador de roles.
