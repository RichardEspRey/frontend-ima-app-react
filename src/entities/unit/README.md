# entities/unit

Las tres unidades con expediente —camión, caja y conductor— administradas con un solo flujo.

## Contenido

- `api/unidades.js` — `obtenerUnidades`, `guardarUnidad`, `eliminarUnidad`, `darDeBaja`, `crearRequisito`, `eliminarRequisito`… (14)
- `model/requisitos.js` — `ESTADO_DOCUMENTO`, `DIAS_AVISO_VENCIMIENTO`, `COLOR_CATEGORIA`, `colorCategoria`, `esquemaRequisito`, `esquemaDocumento`… (15)
- `model/tipos.js` — `TIPO_UNIDAD`, `CATALOGO_UNIDAD`, `descriptorDe`, `unidadEnBlanco`
- `model/unidades.js` — `ESTADO_CONDUCTOR`, `estadoConductor`, `filtrarUnidades`, `camposParaGuardar`, `expedienteParaGuardar`, `validarUnidad`

Pruebas: `unidades.test.js`.

## Endpoints que consume

| Endpoint | op | Función |
|---|---|---|
| `trucks_v2.php` / `cajas_v2.php` / `drivers_v2.php` | `getInitData` | `obtenerUnidades()` |
| el del tipo de unidad | `saveTruck` / `saveTrailer` / `saveDriver` | `guardarUnidad()` |
| el del tipo de unidad | `deleteTruck` / `deleteTrailer` / `deleteDriver` | `eliminarUnidad()` |
| `drivers_v2.php` | `darDeBajaDriver` | `darDeBaja()` |
| el del tipo de unidad | `addConfig` | `crearRequisito()` |
| el del tipo de unidad | `deleteConfig` | `eliminarRequisito()` |
| el del tipo de unidad | `updateColumnVisibility` | `cambiarVisibilidadColumna()` |

## Reglas de negocio

- Lo que distingue a un tipo de otro vive en un descriptor (`CATALOGO_UNIDAD`): endpoint, operaciones, campos y columnas. Agregar un tipo es agregar una entrada, no otra pantalla.
- La «fecha cero» de MySQL (`0000-00-00`) es ausencia de fecha, no una fecha (`esFechaCero`).
- Se avisa de un vencimiento con días de antelación (`DIAS_AVISO_VENCIMIENTO`). `estadoDocumento` es la regla que también usan las fianzas del tablero de cajas.
- Un conductor sin estado cuenta como activo; darlo de baja pide motivo y fecha.
- Ocultar una columna del expediente la oculta para todos los usuarios.

## Quién lo usa

`features/estatus-cajas`, `features/units`, `pages/unidades`
