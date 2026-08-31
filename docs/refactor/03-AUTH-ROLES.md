# Usuarios, sesiones, roles y permisos

> **Este archivo ya no es la referencia.** El modelo quedó implementado en el incremento 4
> y vive en **[`../ROLES-Y-PERMISOS.md`](../ROLES-Y-PERMISOS.md)**: catálogo, matriz de
> permisos, cómo se usa en el código y las decisiones abiertas.
>
> Aquí queda solo lo que corresponde al **plan del refactor**: qué falta y en qué fase.

## Qué se hizo (incremento 4)

Lo escrito originalmente en este documento partía de una suposición: que había siete roles
por área y que `Admin`/`Administrador` eran el mismo mal escrito. Los datos lo desmintieron
—`Admin` 3, `Administrativo` 12, `Driver` 16, y `Administrador` nunca existió— así que el
diseño se rehízo sobre lo que hay. El resultado está en `../ROLES-Y-PERMISOS.md`.

## Los tres problemas, y en qué fase se arregla cada uno

Conviene no mezclarlos:

| Problema | Qué es | Fase |
|---|---|---|
| **Autenticación** | Probar *quién eres*. Hoy no existe: mandas un entero. | 2 (backend) |
| **Autorización** | Qué puedes hacer una vez identificado. | **1 · hecho** + 3 (BD) |
| **Nomenclatura** | `Admin` / `Administrativo` / `Driver` sin criterio común. | **1 · hecho** + 3 (BD) |

## Fase 2 — backend

1. `Auth.php` emite un token de sesión propio (JWT firmado, o token opaco en una tabla
   `sessions`). Ver `../DECISIONES/0001-sin-idp-externo.md` para por qué no un IdP externo.
2. Los 36 endpoints lo verifican en vez de confiar en el `id_usuario` que manda el cliente.
3. Coordinar con la app móvil **antes**: consume los mismos endpoints y su código no está
   en este repo.
4. De paso: `features.php` · `get_users` deja de devolver las contraseñas en claro, y las
   contraseñas se hashean.

En el frontend, el único archivo que cambia es `src/shared/auth/authService` — la costura
se dejó puesta a propósito en el incremento 4.

## Fase 3 — base de datos

El SQL ya está escrito y verificado: `../sql/001-roles-y-permisos.sql`. No toca producción.

Orden: crear las tablas → llenarlas → **verificar que los permisos efectivos calculados
coincidan con los de hoy para todos los usuarios** → recién entonces cambiar el backend
para que lea de ahí → borrar `normalizarRol` cuando ya no aplique a nadie.

Sin ventana de corte: mientras nada lea las tablas nuevas, borrarlas no rompe nada.
