# features/notifications

La campana de notificaciones y la administración de quién recibe las de viajes.

## Contenido

- `model/useAvisoDeNotificaciones.js` — `useAvisoDeNotificaciones`
- `model/useCampanaNotificaciones.js` — `FILTRO_CAMPANA`, `INTERVALO_INSPECCIONES_MS`, `useCampanaNotificaciones`
- `ui/CampanaNotificaciones.jsx` — `CampanaNotificaciones`
- `ui/SuscriptoresDeViajes.jsx` — `SuscriptoresDeViajes`

Pruebas: `useAvisoDeNotificaciones.test.jsx`.

## Cómo funciona

- `useCampanaNotificaciones` recuerda en el navegador qué se leyó y filtra entre todas, sin leer y leídas.
- La campana junta los BL firmados con las inspecciones que llegan a Reparaciones, solo para quien tiene `mant_inspeccion_final`. El clic en una inspección abre Reparaciones en Inspecciones, con su lado (`?lado=`).
- `useAvisoDeNotificaciones` anuncia también las inspecciones nuevas, pero no las que ya estaban al entrar.
- `useAvisoDeNotificaciones` reproduce el sonido sin arriesgar la app si el navegador lo bloquea.

## Quién lo usa

`components/Header.jsx`, `layouts/DashboardLayout.jsx`, `pages/notificaciones`
