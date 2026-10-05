# entities/tracking

El seguimiento de la flota: posición por GPS, telemetría de IMA, paradas de la etapa activa y el trazado de rutas por carretera.

## Contenido

- `api/flota.js` — `REFRESCO_FLOTA_MS`, `TIMEOUT_GPS_MS`, `obtenerUnidadesGps`, `obtenerTablero`, `obtenerFlota`, `obtenerParadasEtapa`… (10)
- `api/geo.js` — `SERVICIO_RUTAS`, `SERVICIO_LUGARES`, `MAXIMO_LUGARES`, `buscarLugares`, `ubicarLugar`, `nombreCortoDeLugar`… (8)
- `model/flota.js` — `COLORES_UNIDAD`, `CAPACIDAD_POR_OMISION`, `COLOR_ESTADO`, `colorEstado`, `esquemaUnidadGps`, `esquemaUnidadTablero`… (17)
- `model/paradas.js` — `ESTADO_PARADA`, `ETIQUETA_PARADA`, `ordenarParadas`, `estadoDeParadas`, `avanceParadas`, `tramoActivo`
- `model/ruta.js` — `MODO_PING`, `ESPERA_BUSQUEDA_MS`, `puntoDesdeMapa`, `puntoDesdeBusqueda`, `puntoDesdeUnidad`, `coordenadasDeRuta`… (8)

Pruebas: `flota.test.js`, `paradas.test.js`, `ruta.test.js`.

## Endpoints que consume

| Endpoint | op | Función |
|---|---|---|
| `Tracking.php` | `—` | `obtenerUnidadesGps()` |
| `estatus_unidades.php` | `get_dashboard` | `obtenerTablero()` |
| `new_tripsv2.php` | `getPaginated` | `obtenerParadasEtapa()` |
| `estatus_unidades.php` | `update_config` | `guardarConfiguracionTanque()` |

## Reglas de negocio

- `Tracking.php` tarda unos 21 s medidos en producción: tiene su propio límite de espera (`TIMEOUT_GPS_MS`) en vez de subir el de toda la app.
- El tablero de IMA se pide antes que el GPS porque contesta en décimas de segundo. Si falla, se dibujan las posiciones sin telemetría: sin galones el mapa sirve; sin posiciones, no.
- Pedir la flota más seguido que cada minuto no da datos más frescos (`REFRESCO_FLOTA_MS`).
- Una lectura de tanque imposible se marca como sospechosa en vez de mostrarse.

## Pendiente

- `api/geo.js` llama con `fetch` a los servicios públicos de rutas y lugares: no son la API de IMA y no pasan por `shared/api`. Es una excepción consciente, no un descuido.

## Quién lo usa

`features/cotizador`, `features/tracking`, `pages/tracking`, `pages/unidades`, `pages/viajes`
