# Módulo: Nómina

Nómina administrativa del personal de oficina y taller. **No incluye a los conductores**,
que se pagan por viaje desde Finanzas.

> Es el **módulo de referencia** del refactor: fue el primero migrado entero a la
> estructura nueva. La receta paso a paso está en `docs/refactor/05-INCREMENTOS.md`.

## Pantallas

| Ruta | Archivo | Qué hace |
|---|---|---|
| `/nomina` | `pages/nomina/NominaPage.jsx` | Lista de semanas y autorización de cortes |
| `/detalle-pago/:period_id` | `pages/nomina/DetallePagoPage.jsx` | Desglose por empleado de una semana |
| `/personal` | `pages/nomina/PersonalPage.jsx` | Catálogo de empleados: alta, edición y baja |

## Entidades

- **`entities/payroll`** — semanas de nómina y su desglose (`pagos_admin.php`)
- **`entities/personal`** — los empleados (`personal_admin.php`)

Están separadas porque son sustantivos distintos: una persona existe independientemente de
lo que se le pague una semana concreta. `payroll` importa `TIPO_NOMINA` de `personal`
porque es vocabulario compartido del dominio.

## Reglas de negocio

- Una semana está **`Pendiente`** o **`Autorizado`**. Autorizar **cierra el corte** y ya no
  se le pueden agregar pagos. **Es irreversible desde la app**, por eso se confirma antes.
- El desglose lista a quien estuviera activo **antes de la fecha de corte**, no a la
  plantilla de hoy. Una semana vieja puede mostrar empleados que ya no están, y eso es
  correcto: refleja a quién se le pagó entonces.
- Eliminar un empleado **conserva** su historial de pagos previos.
- `sueldo` y `nombre` son obligatorios; el sueldo tiene que ser mayor que 0.
- `tipo_nomina` es `MX` (pesos) o `US` (dólares). Toda la app decide con `=== 'MX'` y trata
  cualquier otro valor como dólares, así que se normaliza a esos dos y nada más.
- `fecha_corte` llega de la API como `"2026-08-31 00:00:00"` y se recorta al día.

## Cosas que sorprenden

- **Los montos llegan como cadena.** MySQL devuelve los `DECIMAL` como texto (`"18800.00"`),
  así que los esquemas los coaccionan. Antes se hacía `Number(...)` en el JSX y un campo
  ausente pintaba `NaN`.
- **`period_id` no es un número.** Es una cadena tipo `2026-W36`. No asumir que es entero.
- **La lista de semanas se comparte entre las dos pantallas.** `DetallePagoPage` saca su
  periodo de esa caché en vez de recibirlo por el router; por eso el enlace directo
  funciona y no cuesta una petición extra.

## Historial

Migrado en el incremento 5 del refactor (2026-08-31). Bugs corregidos de camino:

1. El enlace directo a `/detalle-pago/:id` estaba roto: la pantalla dependía de
   `useLocation().state`, así que recargar mostraba "Falta contexto de la semana".
2. Autorizar una semana no comprobaba la respuesta: decía "Autorizado" aunque la API
   fallara, sobre una operación irreversible.
3. Ocho `<Grid item xs>` que MUI v7 ignora: las tarjetas de resumen no maquetaban.
4. Un `<Chip>` dentro de un `<Typography variant="body2">`, o sea un `div` dentro de un `p`.
5. El estado de carga y el vacío eran el mismo mensaje.
