# Estado del refactor — leer esto primero

> Este archivo es el punto de entrada. Si abres una terminal nueva o pierdes el contexto,
> lee este archivo y sigue por el que corresponda.

| Documento | Qué contiene |
|---|---|
| `00-ESTADO.md` | Dónde vamos ahora mismo (este archivo) |
| `01-DIAGNOSTICO.md` | Medición real del código antes de tocar nada |
| `02-ARQUITECTURA.md` | Estructura destino, reglas y patrones |
| `03-AUTH-ROLES.md` | Usuarios, sesiones, roles y permisos |
| `04-SINCRONIZACION.md` | Cómo convivir con la rama de Richard sin morir en merges |
| `05-INCREMENTOS.md` | La lista de trabajo, en orden, con criterio de "terminado" |
| `06-DOCUMENTACION.md` | Estándar de JSDoc y plan de documentación del proyecto |
| `07-VERIFICACION-FASE-1.md` | Qué se comprobó antes de plantear el merge, con resultados |
| `08-DIAGNOSTICO-BD.md` | La base de datos medida sobre el dump: qué hay que arreglar en las fases 2 y 3 |

## Dónde vamos

**Fase 1 (frontend) — incrementos 0 a 8 terminados.**
Todo vive en la rama larga **`refactor-fase-1`**, con un tag por incremento
(`incremento-0`, `incremento-1`). No se mergea a `main` hasta estar probada al 100 %.

- Fase 1 · Frontend — EN CURSO
- Fase 2 · Backend PHP — no empezada
- Fase 3 · Base de datos — no empezada

| # | Incremento | Estado | Rama |
|---|---|---|---|
| 0 | Red de seguridad + Electron + fronteras ESLint + base de documentación | **hecho** | tag `incremento-0` |
| 1 | Limpieza sin riesgo (huérfanos, redux, AuthContext) | **hecho** | tag `incremento-1` |
| 2 | Capa de API (`shared/api` + TanStack Query) | **hecho** | tag `incremento-2` |
| 3 | Biblioteca de UI compartida (`shared/ui`) | **hecho** | tag `incremento-3` |
| 4 | Sesión y permisos (`shared/auth`) | **hecho** | tag `incremento-4` |
| 4b | Dependencias y vulnerabilidades | **hecho** — 0 vulnerabilidades | tag `incremento-4b` |
| 5 | **Nómina** completo (patrón de referencia) | **hecho** | tag `incremento-5` |
| 6 | AccessManager / Usuarios | **hecho** | tag `incremento-6` |
| 7 | Reports / Inicio | **hecho** | tag `incremento-7` |
| 8 | IMA Manager (documentos) | **hecho** | tag `incremento-8` |
| 9a | Órdenes de servicio + Inventario | **hecho** | tag `incremento-9a` |
| 9b | Afinaciones + Autonomía | **hecho** | tag `incremento-9b` |
| 9c | Reparaciones en ruta + Inspecciones | **hecho** | tag `incremento-9c` |
| 10 | Finanzas | **hecho** | tag `incremento-10` |
| 11 | Safety / IFTA | **hecho** | tag `incremento-11` |
| 12 | Dispatch (crear y editar viaje) | **hecho** | tag `incremento-12` |
| 13 | Mapas / Tracking | **hecho** | tag `incremento-13` |
| 14 | Unidades (camiones, cajas, conductores) | **hecho** | tag `incremento-14` |
| 15 | Viajes (admin, cotizador, editores, resumen) | **hecho** | tag `incremento-15` |
| 16 | Gastos (Expense Manager, gastos de viaje, diesel) | **hecho** | tag `incremento-16` |
| 6+ | Resto de módulos, uno por uno | pendiente | — |
| — | Deduplicar: **cada par en el incremento de su módulo**, no al final | ver `05-INCREMENTOS.md` | — |

Detalle de cada uno en `05-INCREMENTOS.md`.

## Publicación

`origin/refactor-fase-1` está **al día** desde el 2026-09-01, con los tags
`incremento-0` a `incremento-14`.

```bash
git push origin refactor-fase-1 && git push origin --tags
```

Si alguna red vuelve a filtrar SSH, el remoto por HTTPS suele pasar:
`git remote set-url origin https://github.com/RichardEspRey/frontend-ima-app-react.git`

> **Ojo con las 136 vulnerabilidades.** GitHub las sigue avisando en cada push porque las
> cuenta sobre `main`, que es la rama por omisión. En `refactor-fase-1` están en cero desde
> el incremento 4b; el aviso se apagará cuando el refactor llegue a `main`.

## Al retomar

El incremento 9 está partido en **9a, 9b y 9c** (ver `05-INCREMENTOS.md`).
**Los dieciséis incrementos de la fase 1 están hechos.** En `src/screens/` solo queda
`Login/` y la carpeta `css/` que varias pantallas todavía comparten.

**Los cuatro cierres también están hechos:**

1. Login migrado; `src/screens/` y `src/styles/` ya no existen.
2. Los nueve puentes `@deprecated` retirados; la cuarentena quedó autocontenida.
3. Lint en **0 errores** (de 112).
4. Fase 1 verificada de punta a punta: ver `07-VERIFICACION-FASE-1.md`.

**La fase 1 está lista para plantear el merge a `main`.** Antes conviene:

- Que Emiliano y Richard la usen unos días contra producción.
- Decidir lo que quedó a la vista y es de negocio, no del refactor: la columna de déficit,
  los permisos por nombre en `TripAdmin`, y las ocho pantallas en cuarentena.
- Repasar `07-VERIFICACION-FASE-1.md`, que lista lo que la fase 1 **no** arregla: HTTPS,
  autenticación de la API y las contraseñas en claro son fase 2.

Las **ocho pantallas sin uso** (~2 150 líneas) están en cuarentena en `src/no-usadas/`,
fuera del router y fuera del paquete compilado. No se borran todavía: se revisa dentro de
unos meses. Ver `src/no-usadas/README.md`.

Lo primero al volver, sobre todo si pasaron días: `npm run refactor:sync`. Si la red no
deja hacer fetch, el script sigue con lo local y lo avisa.

## Salud del refactor (revisar cada semana)

```bash
npm run refactor:estado -- -w
```

| Fecha | Sin integrar | Días | Commits propios |
|---|---:|---:|---:|

**Tripwire: 15 commits de `Emiliano` sin integrar, o 14 días sin sincronizar.**

Ojo con qué mide: **no** los commits propios del refactor. Que el refactor acumule
trabajo propio es su función, no un síntoma. Lo que lo mata es quedarse **atrás** de lo
que se sigue desarrollando en `Emiliano` — así murió la rama de abril, con 116 commits de
divergencia porque nadie la sincronizaba, no porque hubiera hecho demasiado.

## Decisiones ya tomadas

- **El refactor no se mergea a `main` hasta estar probado al 100 %** (decisión de Emiliano,
  2026-08-31). Es una rama de vida larga y eso es un riesgo conocido: así murió la rama
  `refactor` de abril, con 116 commits de divergencia. Se compensa con integración diaria
  desde `Emiliano`, con el orden de módulos de frío a caliente, y midiendo la divergencia.
- **Los incrementos siguen siendo cortos** aunque no se mergeen: cada uno se cierra,
  se prueba y se anota antes de empezar el siguiente.
- **No se toca ningún endpoint en la fase 1.** Hay una app móvil consumiendo la misma
  API PHP; cambiar un contrato la rompe en silencio.
- **No se contrata un servicio de identidad (Auth0/Clerk/Firebase Auth).** Razones en
  `03-AUTH-ROLES.md`.
- **No se migra a TypeScript en la fase 1.** Razones en `02-ARQUITECTURA.md`.
- **JSDoc obligatorio en todo lo exportado, cero comentarios dentro del cuerpo.** El
  estándar y las plantillas están en `06-DOCUMENTACION.md`; la documentación se produce
  incremento por incremento, nunca al final.

## Bloqueantes fuera del frontend

- **No hay HTTPS.** El hosting acepta TCP en 443 pero el handshake TLS se corta.
  Todas las credenciales viajan en claro. Hay que reparar el certificado en GoDaddy;
  no se arregla desde este repo. **Es el pendiente de seguridad más grande que queda**:
  además de exponer las contraseñas, permite alterar lo que llega al renderer.
- **`features.php` · `op=get_users` devuelve las contraseñas en claro de todos los
  usuarios, sin autenticación.** Verificado el 2026-08-31.
- **Son 43 contraseñas en claro, no 31: hay dos tablas.** `users` duplica a 10 personas que
  ya están en `Users_credentials`, cada una con su propia copia. Medido sobre el dump del
  2026-09-02; ver [`08-DIAGNOSTICO-BD.md`](08-DIAGNOSTICO-BD.md).
- **No existe ninguna infraestructura de sesión** en las 97 tablas. La fase 2 no es migrar
  el login: es construirlo.
- **WordPress comparte la base de datos** con el sistema de operaciones: 13 tablas `wp_*`.

## Notificaciones push — resuelto

Richard las eliminó en `db0cf47` (v1.5.1) y Emiliano confirmó el 2026-08-31 que fue
intencional. Ya están fuera de la rama del refactor, incluidos los tres residuos que el
auto-merge dejó vivos: la dependencia en `package.json`, el `package-lock.json` y la ruta
`/notifications-admin` en el smoke test.

Se integró con **merge, no rebase**: los 18 commits de la rama `Emiliano` ya están en
`origin/Emiliano` y rebasarlos crearía duplicados con hash nuevo. La regla de "rebase
diario" del `04-SINCRONIZACION.md` aplica a los commits propios del refactor, no a
reescribir historia ya publicada de otra rama.

## Los roles — resuelto con el dump del 2026-09-02

Ya no hace falta la consulta que estaba pendiente aquí: el dump la responde, y el resultado
está en [`08-DIAGNOSTICO-BD.md`](08-DIAGNOSTICO-BD.md).

**El hallazgo cambia el plan.** Los 12 `Administrativo` **no se agrupan por área sino por
amplitud**: nadie es "solo Finanzas" —solo la tienen Osvaldo y Angelica, y ambos tienen
además casi todo lo demás—. El reparto en Operaciones / Finanzas / Mantenimiento / Safety
que proponía `03-AUTH-ROLES.md` no encaja con los datos. Los grupos reales son
Coordinación, Operación, Operación limitada y tres cuentas sin permisos.

**Bloquea una sola decisión:** Celso, Prueba y Max no tienen prácticamente permisos y
siguen con `active = 1`, así que pueden entrar. ¿Son cuentas vivas?

Mientras tanto **nadie pierde ni gana accesos**: sus flags individuales siguen mandando.

## Falta probar a mano (incremento 4b)

Electron pasó de 35 a 44 y jspdf de 3 a 4. `npm run humo:electron` comprueba que la app
arranque, pero no cubre estos flujos. **Antes de que esto llegue a `main`:**

- ~~Abrir el Mapa y ver que carguen los tiles~~ ✅ **verificado el 2026-08-31 en Chrome**:
  las unidades cargan con posición y velocidad, el geocoding resuelve direcciones, y la
  consola sale limpia. La CSP no bloquea nada.
- Exportar un PDF desde Resumen de viaje, Ticket de pago e IFTA (cambió jspdf).
- Abrir el modal de PC Miller, que lee PDFs (cambió pdfjs-dist).
- Empaquetar con `npm run dist` y probar el instalador en Windows.
- Probar el flujo de actualización automática (`electron-updater`).

Si alguna pantalla deja de cargar en la app empaquetada pero funciona en `npm run dev`,
lo más probable es que falte un origen en la CSP de `vite.config.js`.

## Los mapas — cerrado

`Tracking` pedía tiles a CartoDB, que ya exige API key, y sin atribución. Las cuatro
pantallas usan ahora `shared/config/mapa.js` con OpenStreetMap. Verificado en Chrome:
limpio, con atribución, cero errores en consola.

Se decidió **no cambiar de proveedor**: el aspecto actual es el que el equipo quiere.
El riesgo aceptado y las alternativas para el futuro están en
[`../DECISIONES/0005-proveedor-de-tiles-de-mapa.md`](../DECISIONES/0005-proveedor-de-tiles-de-mapa.md).

## Decisión pendiente

`src/screens/Viajes/TripAdmin.jsx:121` tiene el nombre de una persona cableado en una
comprobación de permisos:

```js
const isAdmin = user?.tipo_usuario?.toLowerCase() === 'admin' || user?.name === 'Blanca';
```

Se dejó intacto para no cambiarle el acceso a nadie sin avisar. Lo correcto es darle a
esa persona el permiso que necesita y borrar la línea.

## Pendiente de Emiliano

- Pasar el esquema de `Users_credentials` (y cualquier tabla de roles/permisos) para
  cerrar el catálogo canónico de roles en `03-AUTH-ROLES.md`.
- Confirmar los nombres de los roles definitivos.
