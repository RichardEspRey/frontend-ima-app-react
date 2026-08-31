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

Incremento 4 — sesión y permisos (`src/shared/auth/`). Este **sí toca código existente**:
sustituye las ~57 comparaciones literales de `"admin"` repartidas por los componentes, y
`config/menuConfig.js`. Richard: avísame si estás en `menuConfig` o en `useAuthStore`.

Lo que ya cambió y puedes usar desde hoy:
- **`src/shared/api/`** — para código nuevo, `post(ENDPOINTS.x, 'op', {campos})` en vez de
  `fetch()` directo. Catálogo completo en `docs/API-ENDPOINTS.md`.
- **`src/shared/ui/`** — `DataTable` (columnas declarativas, orden y los tres estados),
  `PageHeader`, `ErrorBoundary`, `notify`. Ver `src/shared/ui/README.md`.
- Los 10 hooks `useFetchX` devuelven lo mismo de siempre, pero ahora cachean.
- Se eliminó **Redux** y 9 archivos huérfanos.

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
