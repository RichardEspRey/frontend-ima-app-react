# entities/user

Los usuarios del sistema y sus permisos por plataforma.

## Contenido

- `api/permisos.js` — `PLATAFORMA`, `obtenerPermisosUsuario`, `cambiarPermisoUsuario`, `usePermisosUsuario`, `useCambiarPermisoUsuario`
- `api/usuarios.js` — `obtenerUsuarios`, `crearUsuario`, `actualizarUsuario`, `useUsuarios`, `useCrearUsuario`, `useActualizarUsuario`
- `model/usuario.js` — `TIPO_USUARIO_API`, `esquemaUsuario`, `normalizarUsuarios`, `estaActivo`, `validarFormularioUsuario`

Pruebas: `usuario.test.js`.

## Endpoints que consume

| Endpoint | op | Función |
|---|---|---|
| `features.php` | `get_all_user_features` | `obtenerPermisosUsuario()` |
| `features.php` | `toggle_user_feature` | `cambiarPermisoUsuario()` |
| `features.php` | `get_users` | `obtenerUsuarios()` |
| `features.php` | `create_user` | `crearUsuario()` |
| `features.php` | `update_user` | `actualizarUsuario()` |

## Reglas de negocio

- La lista de usuarios se lee sin contraseñas.
- Cambiar un permiso usa actualización optimista: la casilla responde al instante y se revierte si la API falla.
- `type` solo admite los valores de `TIPO_USUARIO_API` al crear o editar.

## Quién lo usa

`features/access-manager`, `pages/accesos`
