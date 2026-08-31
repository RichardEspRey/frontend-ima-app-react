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

**Fase 1 (frontend) — incremento 0 terminado e integrado con `origin/main`.**
La rama `refactor-00-cimientos` está lista para mergear a `main` (sin push todavía).

- Fase 1 · Frontend — EN CURSO
- Fase 2 · Backend PHP — no empezada
- Fase 3 · Base de datos — no empezada

| # | Incremento | Estado | Rama |
|---|---|---|---|
| 0 | Red de seguridad + Electron + fronteras ESLint + base de documentación | **hecho**, listo para mergear | `refactor-00-cimientos` |
| 1 | Limpieza sin riesgo (huérfanos, redux, AuthContext) | pendiente | — |
| 2 | Capa de API (`shared/api` + TanStack Query) | pendiente | — |
| 3 | Biblioteca de UI compartida (`shared/ui`) | pendiente | — |
| 4 | Sesión y permisos (`shared/auth`) | pendiente | — |
| 5 | Módulo Gastos → `features/gastos` (patrón de referencia) | pendiente | — |
| 6+ | Resto de módulos, uno por uno | pendiente | — |
| N | Deduplicar formularios (~4 000 líneas) | pendiente | — |

Detalle de cada uno en `05-INCREMENTOS.md`.

## Divergencia (revisar cada semana)

```bash
git rev-list --left-right --count Emiliano...refactor-00-cimientos
```

| Fecha | Commits de divergencia | Semanas sin integrar |
|---|---:|---:|
| 2026-08-31 | 5 | 0 |

**Tripwire: 40 commits o 6 semanas.** Al llegar a cualquiera de los dos, se para de agregar
incrementos y se consolida. La rama `refactor` de abril llegó a 116 sin que nadie mirara
el número.

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
  no se arregla desde este repo.
- **`features.php` · `op=get_users` devuelve las contraseñas en claro de todos los
  usuarios, sin autenticación.** Verificado el 2026-08-31.

## Notificaciones push — resuelto

Richard las eliminó en `db0cf47` (v1.5.1) y Emiliano confirmó el 2026-08-31 que fue
intencional. Ya están fuera de la rama del refactor, incluidos los tres residuos que el
auto-merge dejó vivos: la dependencia en `package.json`, el `package-lock.json` y la ruta
`/notifications-admin` en el smoke test.

Se integró con **merge, no rebase**: los 18 commits de la rama `Emiliano` ya están en
`origin/Emiliano` y rebasarlos crearía duplicados con hash nuevo. La regla de "rebase
diario" del `04-SINCRONIZACION.md` aplica a los commits propios del refactor, no a
reescribir historia ya publicada de otra rama.

## Pendiente de Emiliano

- Pasar el esquema de `Users_credentials` (y cualquier tabla de roles/permisos) para
  cerrar el catálogo canónico de roles en `03-AUTH-ROLES.md`.
- Confirmar los nombres de los roles definitivos.
