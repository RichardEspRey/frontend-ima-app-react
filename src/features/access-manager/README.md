# features/access-manager

La administración de accesos: alta de usuarios, sus permisos y los equipos.

## Contenido

- `ui/EquiposDialog.jsx` — `EquiposDialog`
- `ui/NuevoUsuarioDialog.jsx` — `NuevoUsuarioDialog`
- `ui/PermisosDrawer.jsx`

## Cómo funciona

- `PermisosDrawer` muestra los permisos de un usuario por plataforma y los cambia uno por uno.
- `EquiposDialog` crea, renombra y borra equipos y asigna sus miembros.
- `NuevoUsuarioDialog` da de alta un usuario.
- Con `soloDrivers` (quien tiene `gestor_accesos_drivers` sin ser administrador), `PermisosDrawer` y `NuevoUsuarioDialog` dejan el tipo fijo en Driver. La página solo le enseña la pestaña de Conductores y esconde los equipos. Los administradores conceden el permiso desde la pestaña Desktop (`GESTOR_ACCESOS_DRIVERS` en `config/menuConfig.js`).

## Pendiente

- No tiene `index.js`: la página importa los componentes por su ruta.
- `PermisosDrawer.jsx` pasa de 500 líneas.

## Quién lo usa

`pages/accesos`
