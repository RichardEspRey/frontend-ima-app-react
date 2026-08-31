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

Incremento 1 — limpieza de código muerto: los 9 archivos huérfanos,
`src/auth/AuthContext.jsx` y `src/redux/`. Solo se **borra**, no se mueve nada.

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
