# Módulo: Viajes

El módulo más grande y más caliente del proyecto: 44 toques en los últimos cuatro meses.
Cubre todo el ciclo de un viaje, desde que se cotiza hasta que se cierra y se resume.

| Ruta | Archivo | Qué hace |
|---|---|---|
| `/admin-trips` | `pages/viajes/AdminViajesPage.jsx` | La pantalla central: lista por etapa del ciclo |
| `/cotizador` | `pages/viajes/CotizadorPage.jsx` | Cuánto se cobra por llevar una carga |
| `/edit-trip/:tripId` | `pages/viajes/EditarViajePage.jsx` | Edición normal |
| `/edit-trip-complete/:tripId` | `pages/viajes/EditarViajeCompletoPage.jsx` | Edición sin restricciones |
| `/ResumenTrip/:tripId` | `pages/viajes/ResumenViajePage.jsx` | El resumen que se imprime |
| `/estatus-cajas` | `pages/viajes/EstatusCajasPage.jsx` | Dónde está cada caja, con qué viaje y con qué nota |

## Entidades y features

- **`entities/trip`** — pestañas y permisos, filtros, acciones del ciclo, el resumen y toda
  la edición de etapas, documentos y paradas.
- **`entities/schedule`** — la programación de viajes: quién y qué está libre.
- **`entities/quote`** — las cotizaciones y el cruce tarifa/millas/rate.
- **`features/trips-admin`** — tabla, filtros, programación y mapa.
- **`features/trip-edit`** — el editor común a las dos pantallas de edición.
- **`features/cotizador`** — buscador de ubicaciones, mapa y resumen.
- **`features/estatus-cajas`** — el tablero de cajas: la tabla, los dos combos de captura y
  la subida de la fianza. Se apoya en `entities/trailer`, que es donde vive el estatus.

| Endpoint | Operaciones |
|---|---|
| `new_tripsv2.php` | `getPaginated`, `salida_trip`, `get_transnational_trips` |
| `new_trips.php` | `getById`, `Update`, `Update_complete`, `UpdateUpcoming`, `AlmostOverTrip`, `FinalizeTrip`, `activate_trip`, `delete_trip` |
| `trips.php` | `trip_summary` |
| `Programacion_viajes.php` | `dashboard`, `getAll`, `insert`, `update`, `delete` |
| `Cotizaciones.php` | `obtener_todas`, `guardar`, `eliminar` |
| `update_invoices.php` | `update_invoices` |
| `cajas_estatus.php` | `getEstatusCajas`, `saveEstatusCaja` |
| `cajas_docs.php` | `Alta` (la fianza, compartida con el Administrador de Cajas) |

## Reglas de negocio

- Un viaje pasa por **cinco etapas**: programado, próximo, en despacho, en ruta y
  finalizado. Cada una es una pestaña, y **cada pestaña tiene su propio permiso**.
- Los permisos se refrescan cada 15 segundos, así que a alguien le pueden quitar el acceso
  a la pestaña que está mirando: entonces cae en la primera que le quede.
- **Programar es apartar** operador, camión y caja para una salida futura. Cuando llega el
  día se aprueba y se convierte en viaje, llevando los datos precargados.
- Al crear un viaje desde una programación, **la programación se elimina**.
- Hay **tres formas de guardar** un viaje, una por pantalla: `UpdateUpcoming`, `Update` y
  `Update_complete`. La última no tiene restricciones y además enlaza transnacionales.
- La edición completa usa los **catálogos completos**, no solo los activos: un viaje viejo
  puede tener un conductor o una unidad que ya se dio de baja.
- Solo se pueden **generar facturas** en viajes En Ruta, Casi Finalizados o Finalizados, y
  solo en etapas ya guardadas.
- Una etapa de cruce pasa de `In Coming` a `In Transit` **en cuanto se le captura el CI**.
- En el cotizador, las **millas vacías** —lo que el camión recorre para llegar a la carga—
  se cobran igual, así que entran en el total.
- Tarifa, millas y rate se calculan unas de otras: se entra por la que se tenga.
- En el **estatus de cajas**, la ubicación y la observación se calculan del viaje en turno:
  una caja cargada va en ruta según la dirección de su etapa, y una vacía se queda en la
  pensión. Lo que alguien capture a mano pisa a eso, pero **solo mientras la caja siga en
  la misma etapa**: al avanzar el viaje de tramo caduca sola y vuelve a mandar lo
  automático. Se midió por viaje hasta el 2026-09-28 y no alcanzaba: seis de siete cajas
  estaban congeladas en una corrección vieja, con el tablero diciendo RUTA BAJANDO
  mientras el viaje ya iba subiendo.
- Una caja **sin viaje no tiene etapa**, así que ahí lo capturado no caduca: es lo que
  sostiene el caso de la caja parada en el taller.
- El tablero **se refresca solo cada cinco minutos** mientras está en primer plano, y al
  volver a la ventana. El refresco de fondo no levanta el indicador de carga.
- **TALLER solo puede ser manual**: ningún dato del sistema dice que una caja está en el
  taller, y por eso existen los combos. Lo mismo PENSION USA, MANTENIMIENTO, AGENCIA
  ADUANAL, CARGANDO y DESCARGANDO, que se agregaron el 2026-10-05 sin ninguna lógica: solo
  se eligen a mano. El PHP los admite en su lista cerrada.
- **Cada estado tiene su color**, como fondo suave del combo con el texto oscuro del mismo
  tono: PENSION NLD y CARGANDO azul, PENSION USA rojo, RUTA SUBIENDO y CARGADA verde, RUTA
  BAJANDO y DESCARGANDO celeste, TALLER café, MANTENIMIENTO y VACIA amarillo, AGENCIA
  ADUANAL morado. Viven en `features/estatus-cajas/ui/coloresEstatus.js`.
- El encabezado cuenta cargadas y vacías **cada una por su nombre**. Restar las cargadas
  del total contaba como vacías a las que se están cargando o descargando.
- El broker solo se muestra con la caja CARGADA: lo decide el PHP. Si debe salir también
  con CARGANDO o DESCARGANDO es una decisión pendiente de operaciones.
- El tablero muestra **todas las cajas internas**, estén donde estén y traigan viaje o no.
  Lo único que se deja fuera es el registro sin placa ni VIN, que no es una caja real; se
  filtra por los datos y no por su id. Las cajas externas viven en otra tabla y no
  aparecen: no tienen expediente.
- La columna de **comentarios** son 300 caracteres de texto libre por caja y **no caduca
  nunca**: ahí se anotan los números de sello, y la operación reportó que se le borraban.
  Se queda hasta que alguien lo cambie o lo borre, y se guarda al salir del campo, no en
  cada tecla. (Caducó con el viaje entre el 2026-09-23 y el 2026-09-28; nunca se borró de
  la tabla, solo se ocultaba.)
- El encabezado del Administrador de viajes lleva **Actualizar** —vuelve a pedir viajes,
  compañías y, en la pestaña de programación, también el tablero y las programaciones— y
  otros dos botones: «Estatus de cajas» en
  claro y «Crear Nuevo Viaje» en oscuro. El peso visual separa la acción que crea algo de
  la que solo lleva a mirar, y `viajes_crear` sigue mandando sobre el segundo. Quitar el de
  crear dejaba la creación de viajes sin entrada directa, porque `/CrearViaje` está con
  `hideInSidebar` en `menuConfig`.

## Cosas que sorprenden

- **`trip_summary` no manda `driver_payments`.** La pantalla leía
  `summary.driver_payments.total_monto` para el renglón "Driver Pay", que por eso salía
  siempre en **USD 0.00**. El importe sí viene, en `totales.driver_pay`: en el viaje 480 son
  1 122.26 USD que nunca se vieron.
- **La "utilidad estimada" del backend no descuenta el pago al conductor.** Es
  `rate − diesel − gastos` (6 200 − 1 509 − 188 = 4 503, que es justo lo que manda). Es su
  definición, no un error; `utilidadNeta` da el número con el pago descontado.
- **Un viaje inexistente contesta `status: "not found"`**, que no es `"error"`: el cliente
  de API no lo convierte en excepción y la pantalla se quedaba cargando para siempre.
- **El selector de caja mezcla dos flotas** cuyos ids se repiten entre tablas: la caja
  propia 5 y la externa 5 son distintas. El prefijo `i_`/`e_` es lo único que las separa.
- **`Cotizaciones.php` acepta el `op` por query string o por el cuerpo.** El código lo
  mandaba por query string; se comprobó que las dos formas funcionan.
- **Quién puede usar la edición completa es una lista de nombres**, no un permiso:
  `Blanca`, `Angelica`, `Israel`, `Richard`. Viene de antes de que existieran los permisos
  por funcionalidad. Igual que el `user?.name === 'Blanca'` que concede admin. **No se
  tocó**: cambiarlo es una decisión de negocio.

## Lo que se arregló al migrar

- El renglón **"Driver Pay" siempre en cero** del resumen.
- Un **`<Grid item xs md>`** que MUI v7 ignora: las fichas de etapa se apilaban a ancho
  completo en vez de ir de tres en tres.
- Si `html2canvas` fallaba, los botones marcados `.no-print` **se quedaban ocultos** hasta
  recargar: el restaurado no estaba en un `finally`.
- **`EditTripForm` y `EditTripComplete` eran el mismo archivo copiado**: 97 % de líneas
  idénticas, la duplicación más alta del proyecto. Y con ellos, cuatro hooks duplicados.
- **Tres copias del mismo código de mapas** —`getRoute`, `makeDotIcon`, `FitBounds`—
  repartidas entre el cotizador, el administrador de viajes y el centro de comando.
- Los **nueve filtros** eran nueve bloques de JSX casi idénticos.

## Pantallas sin uso

`TripsScreen` (`/trips`) y `TripsScreenNew` (`/trips-new`) son versiones antiguas del alta
de viaje, contra los endpoints v1, que `CrearViajePage` sustituyó en el incremento 12. No
las alcanzaba ningún enlace: están en cuarentena en **`src/no-usadas/`** y sus rutas ya no
están registradas. Ver `src/no-usadas/README.md`.
