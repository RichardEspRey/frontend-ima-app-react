# Módulo: Finanzas

Cobranza de viajes y pagos a conductores. Son dos flujos distintos que comparten sección:
lo que IMA **cobra** a sus clientes y lo que **paga** a sus operadores.

| Ruta | Archivo | Qué hace |
|---|---|---|
| `/finanzas` | `pages/finanzas/FinanzasPage.jsx` | Cobranza: qué se facturó, qué se cobró y qué falta |
| `/paymentDrivers` | `pages/finanzas/PagosConductoresPage.jsx` | Pagos pendientes a conductores |
| `/ticketPayment/:trip_id` | `pages/finanzas/TicketPagoPage.jsx` | Desglose del pago de un viaje |
| `/millasDriversTable` | `pages/finanzas/TarifasConductorPage.jsx` | Tarifa por milla de cada conductor |
| `/margen` | `pages/finanzas/MargenPage.jsx` | Margen por viaje |
| `/ResiduoTrip` | `pages/finanzas/ResiduosPage.jsx` | Residuos sin conciliar al cerrar viajes |

## Entidad

**`entities/finance`** — casi todo sale de `formularios.php`, que es el endpoint más
cargado de la API.

| op | Qué devuelve |
|---|---|
| `All_finanzas` | 430 viajes con sus **etapas anidadas** y su cobro |
| `All_paymentDrivers` | 447 pagos a conductores |
| `get_millasDriver` | Tarifa por milla de cada conductor |
| `I_pago_stage_bulk` | Registra el cobro de varias etapas |
| `I_update_millasDriverBulk` | Guarda varias tarifas |

`MargenPage` y `ResiduosPage` usan `trips.php` · `residuo_trip`.

## Reglas de negocio

- El **cobro de un viaje** pasa por: pendiente de cobrar → cobrada pendiente de pago →
  cobrada pendiente RTS → pagada. Los valores son 0 a 3.
- El **pago a un conductor** es otra cosa: pendiente → autorizado → pagado. Solo se puede
  pagar lo autorizado; en la pantalla, el botón Pagar está deshabilitado si no lo está.
- El cobro se registra **por etapa**, no por viaje: un viaje puede tener una etapa cobrada
  y otra pendiente. Por eso el estado del viaje es un resumen de sus etapas.

## Cosas que sorprenden

- **Hay 9 viajes con `status_trip` nulo.** No son un caso especial: significan lo mismo que
  0, pendiente de cobrar. `normalizarEstadoCobro` lo trata así, y un test comprueba que
  ningún viaje real se queda sin etiqueta.
- **El catálogo de estados ya existía** en `constants/finances.js`, con sus textos y
  colores. La entidad lo conserva tal cual: cambiar los textos habría cambiado lo que la
  gente ya reconoce, sin ganar nada.
- **Ocho operaciones no aparecen** al buscar `append('op', …)` porque usan comillas dobles.
- `MargenPage` y `ResiduosPage` comparten endpoint y op, pero **no son duplicados**: 279 de
  344 líneas difieren.
- `PagosConductoresPage` toca además `Mobile.php`, para la notificación al conductor.

## Historial

Migrado en el incremento 10 (2026-09-01). El ticket de pago ya se había arreglado en el
incremento 5: antes se iba a blanco si el fetch fallaba, porque su guarda solo miraba
`loading` y el render usaba `info.trip_number`.
