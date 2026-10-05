# entities/dispatch

Lo necesario para crear un viaje: el siguiente número libre, los viajes transnacionales con los que enlazar un cruce y el precargado desde una programación aprobada.

## Contenido

- `api/programacion.js` — `obtenerSiguienteNumero`, `obtenerViajesTransnacionales`, `eliminarProgramacion`, `useSiguienteNumero`, `useViajesTransnacionales`, `useEliminarProgramacion`
- `model/preset.js` — `resolverIdDeCatalogo`, `companiaDePrograma`, `almacenDePrograma`, `datosInicialesDesdePrograma`, `etapaInicialDesdePrograma`
- `model/programacion.js` — `PAIS`, `paisOpuesto`, `esquemaViajeTransnacional`, `formatearNumeroViaje`, `anioDosDigitos`, `agruparPorCruce`… (10)

Pruebas: `preset.test.js`, `programacion.test.js`.

## Endpoints que consume

| Endpoint | op | Función |
|---|---|---|
| `new_tripsv2.php` | `get_next_trip_number` | `obtenerSiguienteNumero()` |
| `new_tripsv2.php` | `get_transnational_trips` | `obtenerViajesTransnacionales()` |
| `Programacion_viajes.php` | `delete` | `eliminarProgramacion()` |

## Reglas de negocio

- `get_next_trip_number` exige los parámetros `country_code` y `trip_year`; con otro nombre la API rechaza la petición.
- Un cruce son dos viajes, uno por país, enlazados por `transnational_number`; `movement_number` dice cuál mitad es cuál. Para buscar la pareja se consulta el país opuesto (`paisOpuesto`).
- El año viaja a dos dígitos (`anioDosDigitos`): es el formato de la API.
- Al precargar desde una programación, la caja propia y la externa son excluyentes: se llena la que indique la programación y la otra queda vacía.
- Si la programación trae el nombre y no el id de la compañía o el almacén, se busca por las dos vías (`resolverIdDeCatalogo`).

## Quién lo usa

`features/dispatch`, `features/trip-edit`, `pages/dispatch`
