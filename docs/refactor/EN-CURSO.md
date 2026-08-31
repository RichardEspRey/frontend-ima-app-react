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

Incremento 3 — `shared/ui`: DataTable, Modal, FormField, notify. Son **archivos
nuevos**; no se mueve nada de `screens/` ni de `components/`.

Ojo, Richard, lo que ya cambió:
- Se eliminó **Redux** (nadie lo usaba) y 9 archivos huérfanos.
- Los 10 hooks `useFetchX` de `src/hooks/` siguen ahí y devuelven **exactamente lo
  mismo**, pero por dentro ya usan TanStack Query: si dos pantallas piden el mismo
  catálogo, ahora se hace una sola petición. No tienes que cambiar nada.
- Hay una capa de API en `src/shared/api/`. Para código nuevo, úsala en vez de
  `fetch()` directo: `post(ENDPOINTS.x, 'op', {campos})`. Ver `docs/API-ENDPOINTS.md`.

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
