# entities/team

Los equipos de usuarios y sus miembros.

## Contenido

- `api/equipos.js` — `obtenerEquipos`, `obtenerMiembros`, `crearEquipo`, `editarEquipo`, `eliminarEquipo`, `guardarMiembros`… (12)

Sin pruebas: no tiene reglas propias, solo peticiones.

## Endpoints que consume

| Endpoint | op | Función |
|---|---|---|
| `teams.php` | `get_teams` | `obtenerEquipos()` |
| `teams.php` | `get_team_users` | `obtenerMiembros()` |
| `teams.php` | `create_team` | `crearEquipo()` |
| `teams.php` | `edit_team` | `editarEquipo()` |
| `teams.php` | `delete_team` | `eliminarEquipo()` |
| `teams.php` | `save_team_users` | `guardarMiembros()` |

## Reglas de negocio

- Guardar miembros reemplaza la lista completa: un id que falte queda fuera del equipo.
- Borrar un equipo no borra a sus miembros, solo la agrupación.

## Quién lo usa

`features/access-manager`, `pages/dispatch`
