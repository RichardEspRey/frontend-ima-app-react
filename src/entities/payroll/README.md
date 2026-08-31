# entities/payroll

La nómina administrativa: semanas de pago y su desglose por empleado. Los **empleados**
en sí son `entities/personal`; aquí vive lo que se les paga y cuándo.

## Contenido

- `model/nomina.js` — esquemas zod, estados y cálculos del periodo
- `api/nomina.js` — queries y mutations sobre `pagos_admin.php`

## Endpoints que consume

| Endpoint | op | Función |
|---|---|---|
| `pagos_admin.php` | `get_weeks` | `obtenerPeriodos()` / `usePeriodos()` |
| `pagos_admin.php` | `get_details` | `obtenerDetalle()` / `useDetallePeriodo()` |
| `pagos_admin.php` | `authorize` | `autorizarPeriodo()` / `useAutorizarPeriodo()` |

## Reglas de negocio

- Un periodo está `Pendiente` o `Autorizado`. Autorizar **cierra el corte** y ya no se le
  pueden agregar pagos: es irreversible desde la app, así que se pide confirmación.
- `fecha_corte` llega como `"2026-08-31 00:00:00"` y se recorta al día. El código anterior
  hacía `fecha_corte.split(' ')[0]` sin comprobar nada, y un corte nulo tumbaba la tabla.
- El desglose incluye a quien estuviera activo **antes de la fecha de corte**, no a la
  plantilla de hoy. Por eso una semana vieja puede listar empleados que ya no están.
- `tipo_nomina` se normaliza a `MX` o `US`, igual que en `entities/personal`.

## Por qué importa de `entities/personal`

`TIPO_NOMINA` es vocabulario del dominio de nómina y lo comparten las dos entidades.
Duplicarlo sería peor que el acoplamiento: dos verdades que se pueden desincronizar. El
linter permite `entities → entities` justo para esto.

## Quién lo usa

`pages/nomina`
