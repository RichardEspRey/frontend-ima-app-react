# features/notifications

La campana de notificaciones y la administración de quién recibe las de viajes.

## Contenido

- `model/useAvisoDeNotificaciones.js` — `useAvisoDeNotificaciones`
- `model/useCampanaNotificaciones.js` — `FILTRO_CAMPANA`, `useCampanaNotificaciones`
- `ui/CampanaNotificaciones.jsx` — `CampanaNotificaciones`
- `ui/SuscriptoresDeViajes.jsx` — `SuscriptoresDeViajes`

Pruebas: `useAvisoDeNotificaciones.test.jsx`.

## Cómo funciona

- `useCampanaNotificaciones` recuerda en el navegador qué se leyó y filtra entre todas, sin leer y leídas.
- `useAvisoDeNotificaciones` reproduce el sonido sin arriesgar la app si el navegador lo bloquea.

## Quién lo usa

`components/Header.jsx`, `layouts/DashboardLayout.jsx`, `pages/notificaciones`
