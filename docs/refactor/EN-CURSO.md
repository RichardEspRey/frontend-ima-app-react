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

Incremento 8 — IMA Manager (documentos). Sigue el orden de frío a caliente.

**Richard, lo movido hasta ahora:**

| Antes | Ahora |
|---|---|
| `screens/Nomina/*` | `pages/nomina/*` |
| `screens/AccessManager.jsx` | `pages/accesos/AccesosPage.jsx` |
| `components/AccessDrawer.jsx` | `features/access-manager/ui/PermisosDrawer.jsx` |
| `screens/Reports.jsx` | `pages/reports/ReportsPage.jsx` |
| `screens/Welcome.jsx` | `pages/inicio/InicioPage.jsx` |

Todos con `git mv` limpio, así que si tu rama los toca el merge lo resuelve solo.
Borrados por no tener ruta: `ProfileAccessManager.jsx`, `components/TableUser.jsx`.

## Dos carpetas, una por rama

Desde el 2026-08-31 el repo tiene dos worktrees, para que nadie le cambie el código al
otro bajo los pies:

| Carpeta | Rama | De quién |
|---|---|---|
| `~/Desktop/Work/IMA/ima-emiliano` | `Emiliano` | Emiliano: features y demos |
| `~/Desktop/Work/IMA/frontend-ima-app-react` | `refactor-fase-1` | el refactor |

Cada una tiene su `node_modules` y su `.env`. Ojo con levantar dos `npm run dev` a la vez:
Vite toma el siguiente puerto libre, así que conviene mirar cuál es cuál antes de enseñar
algo. Si una pantalla no se ve como esperas, lo primero es comprobar desde qué carpeta
está corriendo el servidor.

Los worktrees se listan con `git worktree list` y se quitan con `git worktree remove`.

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
