# entities/finance

Finanzas de los viajes: lo que se cobra por etapa, los pagos pendientes a conductores y su tarifa por milla.

## Contenido

- `api/finanzas.js` — `obtenerViajesFinanzas`, `obtenerPagosConductores`, `obtenerTarifasConductor`, `guardarTarifasConductor`, `registrarCobrosEtapas`, `useViajesFinanzas`… (10)
- `model/finanzas.js` — `METODOS_PAGO`, `ESTADO_COBRO`, `ETIQUETA_COBRO`, `ESTADO_PAGO_CONDUCTOR`, `esquemaEtapa`, `esquemaViajeFinanzas`… (16)

Pruebas: `finanzas.test.js`.

## Endpoints que consume

| Endpoint | op | Función |
|---|---|---|
| `formularios.php` | `All_finanzas` | `obtenerViajesFinanzas()` |
| `formularios.php` | `All_paymentDrivers` | `obtenerPagosConductores()` |
| `formularios.php` | `get_millasDriver` | `obtenerTarifasConductor()` |
| `formularios.php` | `I_update_millasDriverBulk` | `guardarTarifasConductor()` |
| `formularios.php` | `I_pago_stage_bulk` | `registrarCobrosEtapas()` |

## Reglas de negocio

- El estado de cobro sigue el ciclo pendiente de cobrar → cobrada, pendiente de pago → cobrada, pendiente RTS → pagada. `null` cuenta como pendiente: hay viajes reales sin estado (`normalizarEstadoCobro`).
- Las etiquetas y colores de cada estado son los que la gente ya reconoce (`ETIQUETA_COBRO`).
- Los cobros y las tarifas se guardan en lote (`I_pago_stage_bulk`, `I_update_millasDriverBulk`).

## Pendiente

- `pages/finanzas/FinanzasPage.jsx`, `PagosConductoresPage.jsx` y `TarifasConductorPage.jsx` piden `formularios.php` con `fetch`. Conectarla a esta entidad es parte del incremento de su módulo: ver `docs/refactor/PENDIENTES.md`.

## Quién lo usa

**Nadie.** Ver *Pendiente*.
