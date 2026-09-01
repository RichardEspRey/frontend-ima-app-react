# Módulo: Tracking (centro de comando)

El mapa en vivo de la flota. Es la única pantalla que junta dos fuentes que no se
conocen entre sí: el GPS de Wialon y la telemetría de IMA.

| Ruta | Archivo |
|---|---|
| `/tracking` | `pages/tracking/TrackingPage.jsx` |

## Entidades y features

- **`entities/tracking/model/flota.js`** — emparejar GPS con base, combinar, combustible.
- **`entities/tracking/model/paradas.js`** — estado de las paradas de la etapa activa.
- **`entities/tracking/model/ruta.js`** — los dos puntos y el trazo entre ellos.
- **`entities/tracking/api/flota.js`** — GPS, tablero y paradas.
- **`entities/tracking/api/geo.js`** — servicios externos de búsqueda y rutas.
- **`features/tracking`** — `MapaFlota`, `ListaUnidades`, `TrazadorRuta`, `HudUnidad`, `ParadasEtapa`.

| Endpoint | Operaciones |
|---|---|
| `Tracking.php` | ninguna: el script **ignora el campo `op`** |
| `estatus_unidades.php` | `get_dashboard`, `update_config` |
| `new_tripsv2.php` | `getPaginated` (para las paradas de la etapa) |
| `router.project-osrm.org` | trazado de rutas — servicio público, sin llave ni garantía |
| `nominatim.openstreetmap.org` | búsqueda de direcciones — máximo una petición por segundo |

## Reglas de negocio

- **Manda el GPS.** Una unidad que reporta posición se dibuja aunque no esté dada de alta
  en IMA; simplemente no trae telemetría. Al revés no: sin posición no hay dónde pintarla.
- **El GPS y la base no llaman igual a la misma unidad.** Wialon dice `IMA 01`, la base
  dice `1`. Se empareja por nombre exacto, y si no, por el **primer número de los dos
  nombres**. Un número que no cuadra descarta la fila: no se sigue buscando por otro lado.
- Los colores de las unidades se asignan **por posición en la lista**, así que una unidad
  conserva el suyo mientras la flota no cambie de tamaño.
- El tablero manda **solo la próxima parada pendiente**. El estado del resto se deduce por
  posición: lo anterior está hecho, lo posterior falta.
- La flota se refresca **cada 50 segundos**, incluso con la pestaña en segundo plano: es
  una pantalla de vigilancia y quien la deja en otro monitor espera verla al día.

## Cosas que sorprenden

- **`Tracking.php` tarda unos 21 segundos.** Medido contra producción, dos de dos. Está
  por encima del timeout general de la app (20 s), así que esta llamada lleva su propio
  margen de 45 s. Si algún día el mapa vuelve a quedarse cargando, mide esto primero.
- El tablero contesta en **0.12 s**, ciento setenta veces más rápido. Por eso se piden en
  orden y no a la vez.
- **El GPS manda el literal `Unknown address`** cuando no resuelve la calle — y hay ratos
  en que lo manda en las once unidades a la vez. No es una dirección: se trata como
  ausencia y se enseñan las coordenadas.
- **Hay lecturas de tanque imposibles en producción.** La unidad 5 reporta 850 galones en
  un tanque de 270, un 315 %. `porcentajeTanque` acota a 100 y la pantalla marca la unidad
  con un aviso en vez de fingir que el dato es bueno.
- **Un `current_stop` que no coincide con ninguna parada deja todas como completadas.** Es
  el mismo camino que "ya no queda ninguna pendiente", y no hay forma de distinguirlos con
  lo que manda el tablero. Está anotado en el código y probado.
- **Casi ningún viaje tiene paradas adicionales.** De los 40 viajes en ruta revisados el
  2026-09-01, ninguno; hubo que sacar los datos de prueba de viajes ya cerrados.
- Los servicios de rutas y de direcciones son **públicos y gratuitos, sin garantía**. Si el
  trazador deja de funcionar, comprueba primero que sigan en pie.

## Lo que se arregló al migrar

- **`Tracking.php` iba a `http://imaexpressllc.com/API/` escrito a mano**, ignorando
  `VITE_API_HOST`: apuntar la app a otro backend seguía pegándole al GPS de producción.
- **2 `<Grid item xs={6}>`** que MUI v7 ignora: rendimiento y alcance se apilaban.
- El `setTimeout` de la búsqueda de direcciones **no se cancelaba al desmontar**.
- La llave de React de los resultados de búsqueda era **el índice del arreglo**.
- El aviso de carga era un modal de sweetalert2 que **bloqueaba la pantalla** los 21
  segundos que tarda el GPS.
- En `shared/api`: el cliente reportaba **cualquier cancelación externa como tiempo
  agotado**. Afectaba a todo el proyecto, no solo a esta pantalla.
