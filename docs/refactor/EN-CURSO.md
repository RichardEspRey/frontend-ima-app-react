# Qué se está tocando ahora mismo

> Richard: lee esto antes de empezar un módulo. Emiliano: actualízalo antes de abrir rama.

## Semana del 2026-08-31

**Refactor tocando:**
- `eslint.config.js`, `package.json`, `electron.cjs` — configuración
- `docs/` — documentación (archivos nuevos)
- `src/test/` — red de seguridad (archivos nuevos)

**Ningún archivo de `src/screens/`, `src/components/` ni `src/store/` se mueve todavía.**

**Richard trabajando en:** _(llenar)_

**Ya integrado:** `origin/main` hasta `db0cf47`. Las notificaciones push quedaron fuera,
por decisión confirmada.

## Próximo módulo a mover

Incremento 4b — dependencias y vulnerabilidades. Toca `package.json` y
`package-lock.json`, no código de pantallas.

**Richard, lo que cambió en el incremento 4 y sí te afecta:**
- `config/menuConfig.js` ya **no tiene `rolesPermitidos`**. Contenía nombres de
  personas que nunca coincidían con ningún valor real de `type`, así que no hacían
  nada. Los permisos se resuelven en `src/shared/auth`.
- `useAuthStore.checkAccess` **se eliminó** (no lo llamaba nadie).
- Para comprobar permisos, ahora:
  ```js
  import { usePermisos, PERMISOS } from "../shared/auth";
  const { can } = usePermisos();
  if (can(PERMISOS.VIAJES_INVOICES)) { ... }
  ```
  o `const { esTotal } = useSesion();` para el equivalente del viejo `isAdmin`.
- `docs/sql/001-roles-y-permisos.sql` es la propuesta de tablas para la junta.
  **No toca nada de producción**; nadie lo ha corrido.

## Cómo leer esto

- Si tu módulo no aparece aquí, trabaja normal.
- Si aparece, avísale a Emiliano antes de empezar; probablemente se puede reordenar.
- Al mover archivos, el refactor deja puentes (`export { default } from '...'`) para que
  tu rama en vuelo siga compilando aunque el archivo ya no esté donde lo dejaste.

## Pendiente que no es del refactor

- **No hay HTTPS.** El hosting acepta TCP en 443 pero el handshake TLS se corta; las
  credenciales viajan en claro. Es de infraestructura, no de este repo.
- **`features.php` · `op=get_users` devuelve las contraseñas en claro de todos los
  usuarios, sin autenticación.**
