# Módulo: Unidades (camiones, cajas y conductores)

Tres administradores que son la misma pantalla. Cada uno lista su tipo de unidad, la
busca, la da de alta y le lleva un **expediente de documentos configurable**: los
requisitos no están en el código, se crean desde la propia pantalla.

| Ruta | Archivo | Tipo |
|---|---|---|
| `/admin-trucks` | `pages/unidades/CamionesPage.jsx` | `TIPO_UNIDAD.CAMION` |
| `/admin-trailers` | `pages/unidades/CajasPage.jsx` | `TIPO_UNIDAD.CAJA` |
| `/admin-drivers` | `pages/unidades/ConductoresPage.jsx` | `TIPO_UNIDAD.CONDUCTOR` |
| `/estatus-unidades` | `pages/unidades/TableroCombustiblePage.jsx` | — |

Las tres páginas tienen **once líneas**: eligen el tipo y montan `AdminUnidades`.

## Entidades y features

- **`entities/unit/model/tipos.js`** — el descriptor de cada tipo: endpoint, campo de la
  lista, campo del id, nombre de cada operación, columnas, campos del formulario,
  buscadores y todos los textos. Es el único sitio donde los tres se diferencian.
- **`entities/unit/model/requisitos.js`** — estado de cada documento y categorías.
- **`entities/unit/model/unidades.js`** — filtros y armado del guardado.
- **`features/units`** — `AdminUnidades` y sus cinco piezas.

| Endpoint | Operaciones |
|---|---|
| `trucks_v2.php` | `getInitData`, `saveTruck`, `deleteTruck`, `addConfig`, `deleteConfig`, `updateColumnVisibility` |
| `cajas_v2.php` | lo mismo **menos `updateColumnVisibility`** |
| `drivers_v2.php` | lo mismo **más `darDeBajaDriver`** |
| `estatus_unidades.php` | `get_dashboard`, `update_config` (vía `entities/tracking`) |

## Reglas de negocio

- El expediente es **configurable en caliente**. Un requisito nuevo se convierte al
  instante en una columna de la tabla y en un campo del formulario.
- Un requisito es de **archivo** o de **texto**. Los de archivo pueden exigir vencimiento;
  los de texto no vencen: o tienen valor o faltan.
- Un documento con vencimiento pasa por **vencido**, **por vencer** (30 días o menos) y
  **vigente**.
- **Solo los conductores se dan de baja.** Una baja no borra: el expediente sigue y el
  conductor pasa a la pestaña de bajas. Camiones y cajas sí se eliminan.
- **Eliminar un requisito no borra los documentos** ya subidos contra él; lo que
  desaparece es la exigencia.
- Al guardar solo viajan los campos **con valor**: el backend entiende la ausencia como
  "no lo toques", y mandar la cadena vacía borraría lo que ya estaba.
- Solo un administrador ve los botones de Columnas y Requisitos.

## Cosas que sorprenden

- **`trucks_v2.php`, `cajas_v2.php` y `drivers_v2.php` no estaban en el registro de
  endpoints** aunque son los que usan las pantallas vivas. Lo que sí estaba era la v1, que
  ya no usa ninguna pantalla del menú.
- **158 documentos de conductores tienen `fecha_vencimiento` = `0000-00-00`**, la fecha
  cero de MySQL, que significa "sin fecha". `new Date()` de eso no es una fecha válida: la
  resta daba `NaN`, ninguna comparación se cumplía y los 158 se pintaban en verde con la
  leyenda "Vigente hasta 0000-00-00". Se tratan como sin fecha.
- **La tabla de requisitos de cajas no tiene la columna `oculto_en_tabla`** y
  `cajas_v2.php` no atiende `updateColumnVisibility` (comprobado contra producción: responde
  "Operación no válida"). Por eso ahí la preferencia de columnas vive solo en la pantalla y
  el modal lo dice. **Arreglarlo es trabajo de la fase 2**: agregar la columna y la
  operación, y luego poner `columnasPersistidas: true` en el descriptor.
- Las categorías de requisitos **las escribe quien crea el requisito**. Camiones y cajas
  usan `USA`/`MEX`; conductores usa `Personales`, `Viaje` y `Otros`. Cualquier texto vale,
  así que el color se resuelve con un valor por omisión.
- De los 13 requisitos de conductores, **7 están ocultos en la tabla**: se capturan en el
  expediente pero no se listan.
- El **tablero de combustible** comparte la telemetría con el mapa (`entities/tracking`),
  no tiene endpoint propio.
- Hay **dos lecturas de tanque imposibles** en producción: la unidad 5 reporta 850 galones
  en un tanque de 270, y la 7 reporta −33. El indicador acota lo que dibuja, así que sin
  avisar se ven como un tanque lleno y uno vacío normales.

## Pantallas sin uso

Seis archivos de este módulo no los alcanza ningún enlace de la aplicación. Están en
cuarentena en **`src/no-usadas/`**, con sus rutas todavía registradas para no romper un
marcador guardado. El detalle de cada uno, de por qué dejó de usarse y de las doce
comprobaciones que se hicieron está en `src/no-usadas/README.md`.
