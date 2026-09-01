# Módulo: Accesos

Gestión de usuarios, sus permisos por plataforma y los equipos de trabajo.
Ruta única: `/access-manager`, solo para roles totales.

## Pantalla y features

| Archivo | Qué hace |
|---|---|
| `pages/accesos/AccesosPage.jsx` | Compone: tabla de usuarios, pestañas y los tres diálogos |
| `features/access-manager/ui/PermisosDrawer.jsx` | Panel lateral: datos del usuario y permisos por plataforma |
| `features/access-manager/ui/NuevoUsuarioDialog.jsx` | Alta de usuario |
| `features/access-manager/ui/EquiposDialog.jsx` | Equipos y sus miembros |

## Entidades

- **`entities/user`** — usuarios (`features.php`) y sus permisos
- **`entities/team`** — equipos (`teams.php`)

## Reglas de negocio

- Los **conductores van en su propia pestaña**: son 16 de 31 y su acceso es a la app móvil,
  no a esta. Mezclarlos con el personal de oficina hace más difícil encontrar a cualquiera.
- Un usuario de tipo `Driver` **necesita un conductor asociado**; los demás tipos no.
- Al **editar**, la contraseña vacía significa "no cambiarla" y el campo no viaja. Al
  **crear** es obligatoria.
- Los permisos son **por plataforma**: escritorio y móvil tienen juegos distintos.
- Guardar miembros de un equipo **reemplaza la lista completa**: quien no esté, sale.
- Eliminar un equipo no borra usuarios, solo la agrupación.

## Cosas que sorprenden

- **El campo de plataforma se llama `plataform`**, sin la segunda "a". Está así en la API
  y en la base. No se corrige: la app móvil lee el mismo endpoint.
- **`toggle_user_feature` no recibe la plataforma.** El `feature_id` ya la identifica.
- **`teams.php` tiene su propio `get_users`**, distinto del de `features.php`.
- **`get_users` devuelve las contraseñas en claro** de todos los usuarios, sin
  autenticación. El esquema de `entities/user` **no incluye `pass`** para que no lleguen al
  estado ni se pinten por accidente. Eso corta la propagación, no arregla el endpoint: eso
  es fase 2.
- El interruptor de permisos es **optimista**: se mueve al instante y se revierte si la
  API falla. Son 55 permisos por usuario y esperar cada respuesta hacía la pantalla lenta.

## Historial

Migrado en el incremento 6 (2026-08-31). Corregidos de camino:

1. **La contraseña se precargaba en el formulario** y el botón del ojo la mostraba en
   claro: cualquier admin podía leer la de cualquiera con dos clics.
2. `ProfileAccessManager.jsx`, 189 líneas importadas en el router **sin ninguna ruta**.
3. Filtro por `f.app` en vez de `f.plataform`, que dejaba el drawer sin permisos.
4. `TableUser` duplicaba lo que hace `DataTable`; sus capacidades reales —paginación y
   pestañas— subieron al componente compartido y a la pantalla.
