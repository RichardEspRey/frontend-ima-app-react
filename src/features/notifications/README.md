# features/notifications

La campana de notificaciones y la administración de quién recibe cada aviso (BL firmados e inspecciones).

## Contenido

- `model/useAvisoDeNotificaciones.js` — `useAvisoDeNotificaciones`
- `model/categorias.js` — `CATEGORIAS_DE_AVISO`, `nombreDe`, `buscarPersonas`
- `model/useCampanaNotificaciones.js` — `FILTRO_CAMPANA`, `INTERVALO_INSPECCIONES_MS`, `INTERVALO_SUSCRIPCION_MS`, `useCampanaNotificaciones`
- `ui/CampanaNotificaciones.jsx` — `CampanaNotificaciones`
- `ui/SuscriptoresDeAvisos.jsx` — `SuscriptoresDeAvisos`

Pruebas: `useAvisoDeNotificaciones.test.jsx`, `categorias.test.js`.

## Cómo funciona

- `useCampanaNotificaciones` recuerda en el navegador qué se leyó y filtra entre todas, sin leer y leídas.
- La campana junta los BL firmados con las inspecciones que llegan a Reparaciones, solo para quien está en la lista de Inspecciones (`mtto.php` · `getSuscriptoresInspeccion`). El clic en una inspección abre Reparaciones en Inspecciones, con su lado (`?lado=`).
- Notificaciones manager pinta una tarjeta por aviso (`CATEGORIAS_DE_AVISO`): cómo se ve, quién lo recibe, quitar y agregar. «Administrar» está arriba del panel de la campana.
- `useAvisoDeNotificaciones` anuncia también las inspecciones nuevas, pero no las que ya estaban al entrar.
- `useAvisoDeNotificaciones` reproduce el sonido sin arriesgar la app si el navegador lo bloquea.

## Quién lo usa

`components/Header.jsx`, `layouts/DashboardLayout.jsx`, `pages/notificaciones`
