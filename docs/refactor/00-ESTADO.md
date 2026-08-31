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

## Dónde vamos

**Fase 1 (frontend) — incremento 0 terminado en `refactor-00-cimientos`, pendiente de mergear.**
Bloqueado por decidir qué pasa con las notificaciones push (abajo).

- Fase 1 · Frontend — EN CURSO
- Fase 2 · Backend PHP — no empezada
- Fase 3 · Base de datos — no empezada

| # | Incremento | Estado | Rama |
|---|---|---|---|
| 0 | Red de seguridad + Electron + fronteras ESLint + base de documentación | **hecho, sin mergear** | `refactor-00-cimientos` |
| 1 | Limpieza sin riesgo (huérfanos, redux, AuthContext) | pendiente | — |
| 2 | Capa de API (`shared/api` + TanStack Query) | pendiente | — |
| 3 | Biblioteca de UI compartida (`shared/ui`) | pendiente | — |
| 4 | Sesión y permisos (`shared/auth`) | pendiente | — |
| 5 | Módulo Gastos → `features/gastos` (patrón de referencia) | pendiente | — |
| 6+ | Resto de módulos, uno por uno | pendiente | — |
| N | Deduplicar formularios (~4 000 líneas) | pendiente | — |

Detalle de cada uno en `05-INCREMENTOS.md`.

## Decisiones ya tomadas

- **Nada de ramas largas.** Ya hay una rama `refactor` muerta con 116 commits de
  divergencia contra `main` que probó que ese camino no se paga. Incrementos de días,
  mergeados antes de empezar el siguiente.
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
  no se arregla desde este repo.
- **`features.php` · `op=get_users` devuelve las contraseñas en claro de todos los
  usuarios, sin autenticación.** Verificado el 2026-08-31.

## Decisión pendiente antes de integrar con `main`

Richard, en `db0cf47` (2026-08-22, versión 1.5.1), **eliminó por completo la función de
notificaciones push**: la dependencia `@cuj1559/electron-push-receiver`, el setup en
`electron.cjs`, `useNotificationStore.js`, `NotificationsAdmin.jsx` y su entrada de menú.
La rama `Emiliano` conserva todo eso.

Es el único commit de `origin/main` que le falta a `Emiliano`. Hasta saber si esa
eliminación fue intencional o un accidente, **no se puede rebasar sobre `origin/main`**:
haría desaparecer las notificaciones del trabajo de Emiliano.

## Pendiente de Emiliano

- Pasar el esquema de `Users_credentials` (y cualquier tabla de roles/permisos) para
  cerrar el catálogo canónico de roles en `03-AUTH-ROLES.md`.
- Confirmar los nombres de los roles definitivos.
