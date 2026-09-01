# Módulo: Dispatch (alta y edición de viajes)

Donde nace un viaje. Dos pantallas que comparten casi todo: crear uno nuevo, y editar uno
que ya existe pero todavía no sale.

| Ruta | Archivo |
|---|---|
| `/CrearViaje` | `pages/dispatch/CrearViajePage.jsx` |
| `/edit-trip-upcoming/:tripId` | `pages/dispatch/EditarViajeProximoPage.jsx` |

## Entidades y features

- **`entities/dispatch/model/programacion.js`** — países, número de viaje, cruces.
- **`entities/dispatch/model/edicion.js`** — qué se guarda de un viaje y cómo.
- **`entities/dispatch/model/preset.js`** — precarga desde una programación aprobada.
- **`features/dispatch`** — `PanelConfiguracionViaje` y `FormulariosViaje`, que usan
  las dos pantallas.

| Endpoint | Operaciones |
|---|---|
| `new_tripsv2.php` | `get_next_trip_number`, `get_transnational_trips` |
| `new_trips.php` | `getById`, `UpdateUpcoming` |
| `update_invoices.php` | `update_invoices` |
| `Programacion_viajes.php` | `delete` |
| `teams.php` | `get_teams` (vía `entities/team`) |

## Reglas de negocio

- Un viaje se identifica por **`<número>-<país>-<año>`**: `197-US-26`. El número lo asigna
  la API por país y año, no el usuario.
- Un **viaje transnacional** son dos viajes, uno por país, unidos por
  `transnational_number`. `movement_number` dice cuál de los dos es. Al crear la
  continuación, el movimiento que se propone es el del viaje que continúa **más uno**.
- El país decide el formulario: **México solo tiene viaje normal**; Estados Unidos añade
  el cruce fronterizo como primera pestaña. De ahí que el mismo índice de pestaña
  signifique cosas distintas según el país.
- Una **caja propia y una externa son excluyentes**. La precarga rellena una y deja la
  otra vacía a propósito.
- Cuando un viaje se crea **a partir de una programación aprobada**, esa programación se
  borra: ya se convirtió en viaje, y dejarla duplica el trabajo del despacho. Si el borrado
  falla se avisa, pero el viaje ya está creado y no se deshace.

## Cosas que sorprenden

- **`new_tripsv2.php` no estaba en el registro de endpoints** aunque 12 archivos lo usan.
  Conviven las dos versiones: la v1 sigue viva para `getById` y `UpdateUpcoming`.
- Los parámetros se llaman **`country_code` y `trip_year`**, no `pais` ni `anio`. La API
  contesta `"Parámetros requeridos: country_code, trip_year"` si se equivoca el nombre.
- **`trip_year` viaja a dos dígitos** (`26`), pero la pantalla muestra el año completo.
- Una fila de programación **no siempre trae el id** de la compañía o del almacén: a veces
  solo el nombre escrito. Por eso se resuelve por id y, si no, por nombre.
- Las etapas y paradas creadas en el navegador llevan un id que empieza por **`new`**. Si
  ese id viaja tal cual, el backend intenta actualizar una fila que no existe en vez de
  insertarla: por eso van como `null`.
- La API **no borra etapas por omisión**. Hay que mandarle `deleted_stage_ids` o las etapas
  que el usuario quitó reaparecen al recargar.
- Hay documentos guardados con la llave vieja **`orden_de_retiro`** (un bug de
  `BorderCrossingFormNew2`). Se normalizan a `orden_retiro` al cargarlos, o desaparecen del
  detalle de la etapa.
- **Las facturas se guardan aparte**, en `update_invoices.php`. Que fallen no invalida el
  guardado del viaje, así que solo se registra el aviso.
- El selector de cruces **puede quedarse en blanco con un valor puesto**: si el viaje
  enlazado es la primera mitad de un cruce, la otra mitad todavía no existe y no hay opción
  que mostrar. No es un fallo; el valor sigue en el estado y se guarda igual.

## Lo que se arregló al migrar

- **8 `<Grid item xs md>`** que MUI v7 ignora: el panel se dibujaba en una sola columna.
- Al crear un viaje, el **Trip Number se vaciaba** y no se volvía a pedir hasta cambiar
  país o año. Ahora se invalida la consulta y aparece el siguiente número.
- La **llave de React de las opciones del selector** de cruces era el número de cruce, que
  se repite entre las dos mitades de un mismo cruce. Ahora es el `trip_id`.
- Se borró el efecto que pedía el siguiente número al editar: no podía ejecutarse nunca,
  porque la ruta siempre trae `tripId`.
- El panel de configuración y el bloque de pestañas estaban **duplicados** entre crear y
  editar, con diferencias. Ahora hay uno de cada.
