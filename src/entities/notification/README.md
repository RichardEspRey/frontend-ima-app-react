# entities/notification

Las notificaciones de la campana y quiénes reciben las de viajes.

## Contenido

- `api/notificaciones.js` — `INTERVALO_NOTIFICACIONES_MS`, `obtenerNotificaciones`, `useNotificaciones`, `obtenerNotificacionesNuevas`, `useNotificacionesNuevas`, `obtenerSuscriptores`, `obtenerUsuariosDisponibles`, `suscribir`… (14)
- `api/suscripciones.js` — `LLAVE_AVISOS`, `obtenerMisCategorias`, `useMisCategorias`, `obtenerSuscriptoresDeAviso`, `suscribirAAviso`, `desuscribirDeAviso`, `hooksDeAviso`… (9)
- `model/avisos.js` — `ZONA_AVISOS`, `HORA_CORTE_DIESEL`, `TIPO_AVISO`, `corteDiario`, `avisosDeDiesel`, `avisosSinFallas`, `avisosSinInspeccion`, `avisosDeProgramacion`… (16)
- `model/notificaciones.js` — `esquemaNotificacion`, `normalizarNotificaciones`, `sinAnunciar`, `fechaDeNotificacion`, `diasDeDiferencia`, `etiquetaDeDia`… (8)

Pruebas: `notificaciones.test.js`, `presentacion.test.js`.

## Endpoints que consume

| Endpoint | op | Función |
|---|---|---|
| `Notifications.php` | `getAll` | `obtenerNotificaciones()` |
| `Notifications.php` | `getNew` | `obtenerNotificacionesNuevas()` |
| `Notifications.php` | `getSubscribers` | `obtenerSuscriptores()` |
| `Notifications.php` | `getAvailableUsers` | `obtenerUsuariosDisponibles()` |
| `Notifications.php` | `subscribe` | `suscribir()` |
| `Notifications.php` | `unsubscribe` | `desuscribir()` |

## Reglas de negocio

- Se pregunta cada 15 segundos y el sondeo se detiene solo cuando la ventana no está al frente (`refetchInterval`).
- El mensaje llega como `mensaje` o como `Mensaje` según qué parte del backend responda; desde aquí siempre es `mensaje`.
- Una notificación inválida se descarta en vez de fallar: es un sondeo de fondo.
- La fecha de PHP (`2026-09-17 08:30:00`) se normaliza aquí porque Safari no la entiende (`fechaDeNotificacion`).
- Los días se cuentan por calendario, no por 24 horas.

## Quién lo usa

`features/notifications`
