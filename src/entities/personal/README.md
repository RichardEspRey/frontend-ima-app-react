# entities/personal

El personal de nómina de IMA: empleados con puesto, sueldo, frecuencia de pago y
tipo de nómina (MX o USA). No incluye conductores, que son `entities/driver`.

## Contenido

- `model/personal.js` — esquemas zod, normalizador y validación del formulario
- `api/personal.js` — queries y mutations sobre `personal_admin.php`

## Endpoints que consume

| Endpoint | op | Función |
|---|---|---|
| `personal_admin.php` | `getAll` | `obtenerPersonal()` / `usePersonal()` |
| `personal_admin.php` | `add` | `guardarEmpleado()` sin `id` |
| `personal_admin.php` | `update` | `guardarEmpleado()` con `id` |
| `personal_admin.php` | `delete` | `eliminarEmpleado()` |

## Reglas de negocio

- `nombre` y `sueldo` son obligatorios; el sueldo tiene que ser mayor que 0.
- Eliminar un empleado **conserva** su historial de pagos previos.
- MySQL devuelve los `DECIMAL` como cadena (`"1500.00"`), por eso `sueldo` se
  coacciona a número en vez de exigirlo.
- Un registro que no cumple el esquema se descarta de la lista y se registra en
  consola, en vez de tumbar la pantalla entera.

## Quién lo usa

`pages/nomina` (piloto del incremento 2 del refactor).
