# Crear una pantalla o un componente

> **Qué es este documento.** La receta para construir algo nuevo en la estructura del
> refactor: qué archivos crear, en qué orden, con qué patrón y cómo saber que está
> terminado.
>
> **Qué no es.** No repite el porqué de cada regla: eso vive en
> [`ESTANDAR-DE-INGENIERIA.md`](ESTANDAR-DE-INGENIERIA.md). Las reglas cortas del repo
> están en [`CONTRIBUYENDO.md`](CONTRIBUYENDO.md) y el mapa de capas en
> [`ARQUITECTURA.md`](ARQUITECTURA.md). Para **migrar** una pantalla vieja, la receta es
> otra —lleva un `git mv` aparte— y está en `refactor/05-INCREMENTOS.md`.

---

## 0 · Antes de escribir una línea

Cinco preguntas. Si alguna no tiene respuesta, la pantalla no está lista para empezarse.

| Pregunta | Por qué importa | Dónde se responde |
|---|---|---|
| **¿De qué concepto del negocio habla?** | Decide en qué `entities/<x>` vive la regla. Casi siempre ya existe | `src/entities/`, `GLOSARIO.md` |
| **¿Qué endpoint y qué `op` la alimentan?** | Hay que ver la respuesta real antes de diseñar el esquema | `API-ENDPOINTS.md`, `docs/backend/` |
| **¿La app móvil usa ese endpoint?** | Cambiar su contrato la rompe sin que este repo se entere | Columna *Móvil* de `API-ENDPOINTS.md` |
| **¿Quién la ve y con qué permiso?** | El menú se filtra por `featureKey` | `ROLES-Y-PERMISOS.md`, `shared/auth/permisos.js` |
| **¿Cómo se llega a ella?** | Entrada del menú, botón en otra pantalla o ambos | `config/menuConfig.js` |

Y una sexta que ahorra semanas: **¿ya existe algo parecido?** Antes de crear una tabla, un
selector o un modal, revisar `shared/ui` y la feature del módulo. Copiar una pantalla para
hacer la siguiente es el antipatrón más caro del estándar.

---

## 1 · El árbol de archivos

La plantilla es **Estatus de cajas**: es pequeña, tiene consulta, captura con actualización
optimista, subida de archivo y refresco periódico, y cumple todas las reglas.

```
src/
  entities/trailer/                 El dominio: qué es una caja y qué reglas tiene
    model/estatusCaja.js            Constantes del dominio, esquema zod, normalizador, reglas puras
    api/estatusCajas.js             Petición con @endpoint, llave de caché, useQuery y useMutation
    __tests__/estatusCaja.test.js   Las reglas, probadas sin React
    index.js                        Lo público de la entidad. Nadie importa de model/ o api/ directo
    README.md

  features/estatus-cajas/           El caso de uso: el tablero
    model/useTableroCajas.js        El controlador: estado, mutaciones y diálogos de la pantalla
    ui/TablaEstatusCajas.jsx        Pinta: columnas declarativas sobre DataTable
    ui/SelectCelda.jsx              Pinta: un control reutilizado por dos columnas
    ui/coloresEstatus.js            Presentación: el color de cada estado
    ui/ModalFianza.jsx, ...
    index.js
    README.md

  pages/viajes/EstatusCajasPage.jsx Compone: encabezado, tabla y modal. Sin lógica

  navigation/AppRouter.jsx          La ruta
  config/menuConfig.js              La entrada del menú y su permiso (si va en el menú)
```

Tres capas, tres preguntas:

| Capa | Pregunta que responde | Lo que **no** hace |
|---|---|---|
| `entities/` | ¿Qué es esto y qué reglas cumple? | No sabe qué pantalla lo usa. No pinta pantallas |
| `features/` | ¿Qué hace la persona aquí? | No habla HTTP: pide a la entidad. No importa otra feature |
| `pages/` | ¿Qué se ve en esta ruta? | No calcula, no pide datos, no guarda estado de negocio |

---

## 2 · Dónde va cada pieza

Cuando dudes, busca la pieza en esta tabla.

| Si estás escribiendo… | Va en… | Ejemplo real |
|---|---|---|
| El nombre de un `.php` | `shared/api/endpoints.js`, y **solo** ahí | `ENDPOINTS.cajasEstatus` |
| Una llamada a la API | `entities/<x>/api/` | `obtenerEstatusCajas` |
| La forma de una respuesta | `entities/<x>/model/`, como esquema zod | `esquemaEstatusCaja` |
| Una lista cerrada del negocio | `entities/<x>/model/`, como objeto congelado de constantes | `UBICACION_CAJA` |
| Un cálculo o una regla | `entities/<x>/model/`, como función pura | `contarPorObservacion` |
| Una regla que solo tiene sentido en un flujo | `features/<y>/model/` | `features/maintenance/model/orden.js` |
| Estado de la pantalla: diálogo abierto, fila en edición | El controlador `features/<y>/model/use<Algo>.js` | `useTableroCajas` |
| Cómo se ve un estado (color, icono, etiqueta) | `features/<y>/ui/` | `coloresEstatus.js` |
| Un control sin dominio que sirve en cualquier app | `shared/ui/` | `DataTable`, `Selector`, `CampoFecha` |
| Un formato (dinero, fecha, millas) | `shared/lib/formato.js` | |
| Quién es el usuario y qué puede hacer | `shared/auth` → `useSesion()`, `usePermisos()`, `<Can>` | |
| La composición de una ruta | `pages/<modulo>/<Nombre>Page.jsx` | `EstatusCajasPage` |

**Cuando dos features necesitan lo mismo**, ese algo no es de ninguna de las dos: baja a la
entidad si es del negocio, o a `shared/` si no lo es. El linter rechaza
`features/a → features/b`.

---

## 3 · El orden de trabajo

De abajo hacia arriba. Cada paso deja algo que funciona y se puede probar solo, y casi
todos merecen su commit.

### Paso 1 · La respuesta real, guardada

Antes del esquema, la respuesta de verdad:

```bash
curl -s -X POST "$VITE_API_HOST/cajas_estatus.php" -F op=getEstatusCajas \
  > src/entities/trailer/__tests__/fixtures/getEstatusCajas.json
```

Los tests que inventan la respuesta reproducen la suposición de quien los escribe. Así se
descubrió tarde que un campo era `plataform` y no `app`, y que `IMA_Docsv2.php` manda
`valores` como objeto indexado y no como lista.

> El backend vive en producción y no hay staging. **Leer** con `curl` no hace daño;
> **escribir** con `curl` sí. Las operaciones que guardan se prueban desde la pantalla, con
> un registro elegido a propósito.

### Paso 2 · La entidad: el modelo

`entities/<x>/model/<concepto>.js`. Tres cosas, en este orden:

```js
import { z } from "zod"
import { nullable } from "../../../shared/api/zodPhp"

/**
 * Los lugares donde puede estar una caja.
 *
 * @readonly
 * @enum {string}
 */
export const UBICACION_CAJA = {
  PENSION: "PENSION NLD",
  TALLER: "TALLER",
}

/**
 * El renglón de una caja en el tablero de estatus.
 */
export const esquemaEstatusCaja = z.object({
  caja_id: z.coerce.number(),
  no_caja: z.coerce.string().catch(""),
  operador: nullable(z.string()),
  ubicacion: z.string().catch(UBICACION_CAJA.PENSION),
})

/**
 * Valida la lista que devuelve la API y descarta los renglones que no cumplen.
 *
 * @param {Array} lista Lo que vino en la respuesta.
 * @returns {{cajas: Array.<EstatusCaja>, descartados: number}} Las válidas y cuántas se omitieron.
 */
export function normalizarEstatusCajas(lista) {
  const cajas = []
  let descartados = 0
  for (const fila of Array.isArray(lista) ? lista : []) {
    const resultado = esquemaEstatusCaja.safeParse(fila)
    if (resultado.success) cajas.push(resultado.data)
    else descartados += 1
  }
  return { cajas, descartados }
}
```

Reglas del modelo:

- **PHP manda números como texto y nulos donde no debe.** `z.coerce`, `.catch(valorSeguro)`
  y los ayudantes de `shared/api/zodPhp` (`idPhp`, `numeroPhp`, `booleanoPhp`, `nullable`,
  `fechaDia`) existen para eso.
- **Normalizar descarta, no revienta.** Un renglón malo se omite y se cuenta; la pantalla
  sigue con los demás. Quien llama avisa en consola si `descartados > 0`.
- **Las listas cerradas son constantes con nombre.** Nada de `"CARGADA"` escrito en un
  componente: `OBSERVACION_CAJA.CARGADA`.
- **Las reglas son funciones puras.** Reciben datos, devuelven datos, sin React. Así se
  prueban en milisegundos.
- **Las `@typedef` se escriben a mano** con sus `@property`: `jsdoc` no entiende
  `z.infer<>`, y escribirlas documenta la forma para quien lee.

### Paso 3 · Las pruebas del modelo

`entities/<x>/__tests__/<concepto>.test.js`, contra el fixture del paso 1:

```js
import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import { normalizarEstatusCajas, contarPorObservacion, OBSERVACION_CAJA } from "../model/estatusCaja"

const REAL = JSON.parse(readFileSync("src/entities/trailer/__tests__/fixtures/getEstatusCajas.json", "utf8"))

describe("normalizarEstatusCajas", () => {
  it("acepta la respuesta real completa", () => {
    expect(normalizarEstatusCajas(REAL.cajas).descartados).toBe(0)
  })
})

describe("contarPorObservacion", () => {
  it("cargando y descargando no cuentan como vacías ni como cargadas", () => {
    const cajas = [{ observacion: OBSERVACION_CAJA.CARGANDO }, { observacion: OBSERVACION_CAJA.VACIA }]
    expect(contarPorObservacion(cajas)).toEqual({ cargadas: 0, vacias: 1 })
  })
})
```

Se prueba **la regla y el contrato**: casos borde, nulos, la respuesta real. No se prueba
que un componente pinte cierto `div`. El nombre de cada `it` es la regla en una frase: si
falla, el nombre dice qué se rompió.

### Paso 4 · La entidad: la API

`entities/<x>/api/<concepto>.js`. Una función que pide y un hook que cachea:

```js
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ENDPOINTS, post } from "../../../shared/api"
import { normalizarEstatusCajas } from "../model/estatusCaja"

/**
 * Llave de caché del tablero de estatus de cajas.
 *
 * @type {Array.<string>}
 */
export const LLAVE_ESTATUS_CAJAS = ["estatus-cajas"]

/**
 * Trae una fila por caja activa, con lo automático ya resuelto.
 *
 * @endpoint POST cajas_estatus.php · op=getEstatusCajas
 * @param {object} [opciones] Ajustes de la petición.
 * @param {AbortSignal} [opciones.signal] Señal de cancelación.
 * @returns {Promise.<Array.<EstatusCaja>>} Las cajas normalizadas.
 * @throws {ApiError} Si la petición falla.
 */
export async function obtenerEstatusCajas(opciones = {}) {
  const cuerpo = await post(ENDPOINTS.cajasEstatus, "getEstatusCajas", {}, { signal: opciones.signal })
  const { cajas, descartados } = normalizarEstatusCajas(cuerpo?.cajas)
  if (descartados > 0) console.warn(`getEstatusCajas: ${descartados} caja(s) con forma inválida; se omitieron.`)
  return cajas
}

/**
 * El tablero de estatus de cajas.
 *
 * @returns {object} El resultado de `useQuery`.
 */
export function useEstatusCajas() {
  return useQuery({
    queryKey: LLAVE_ESTATUS_CAJAS,
    queryFn: ({ signal }) => obtenerEstatusCajas({ signal }),
  })
}
```

Qué elegir en cada caso:

| Situación | Cómo |
|---|---|
| Una lista en `data` | `postLista(ENDPOINTS.x, "op", { campo: "data", signal })` |
| Una respuesta con otra forma | `post(...)` y se extrae el campo a mano |
| Un catálogo (compañías, bodegas, tipos) | `staleTime: FRESCURA_CATALOGO_MS`: 30 min, compartido entre pantallas |
| Datos que cambian mientras se miran | `refetchInterval` con una constante con nombre (`REFRESCO_TABLERO_MS`) |
| Un detalle que depende de un id | `enabled: Boolean(id)` y el id dentro de la llave |
| Filtros que cambian el resultado | Los filtros dentro de la llave: `["gastos", filtros]` |
| Varias consultas que se mueven juntas | Una **llave raíz** y se invalida la raíz (`LLAVE_MANTENIMIENTO`) |
| Guardar | `useMutation` con `onSuccess`/`onSettled` que invalida la llave |
| Guardar desde un combo o una casilla de fila | Actualización optimista: `onMutate` pinta, `onError` revierte (`useGuardarEstatusCaja`) |

Reglas de la API:

- **Siempre `signal`.** Cambiar de pantalla cancela la petición, y el cliente distingue la
  cancelación del fallo: no avisa de algo que no es un error.
- **`@endpoint` en todo lo que pega a PHP.** Es la única referencia que existe de la API.
- **Si el endpoint es nuevo, se registra en `ENDPOINTS`.** Ningún otro archivo escribe `.php`.
- **Lo que viaja también se limpia.** Recortar al largo de la columna
  (`recortarComentario`), mandar `""` y no `undefined`, y nunca escapar comillas "por
  seguridad": la inyección se cierra en el servidor.

### Paso 5 · El índice de la entidad

`entities/<x>/index.js` es la puerta. Lo que no se exporta aquí es privado:

```js
export { UBICACION_CAJA, esquemaEstatusCaja, normalizarEstatusCajas, contarPorObservacion } from "./model/estatusCaja"
export { LLAVE_ESTATUS_CAJAS, obtenerEstatusCajas, useEstatusCajas } from "./api/estatusCajas"
```

Fuera de la entidad se importa **siempre** del índice: `from "../../../entities/trailer"`.

### Paso 6 · La feature: el controlador

`features/<y>/model/use<Algo>.js`. Junta en un solo hook todo lo que la pantalla necesita
y devuelve una **superficie plana**: datos, banderas y acciones con nombre de verbo.

```js
import { useCallback, useMemo, useState } from "react"
import { contarPorObservacion, useEstatusCajas, useGuardarEstatusCaja } from "../../../entities/trailer"
import { useSesion } from "../../../shared/auth"
import { notify } from "../../../shared/ui"

/**
 * Todo el estado y los efectos del tablero de estatus de cajas.
 *
 * @returns {object} `{cajas, cargando, mensajeError, recargar, recargando, resumen, guardandoId, capturar}`.
 */
export function useTableroCajas() {
  const { usuario } = useSesion()
  const consulta = useEstatusCajas()
  const guardado = useGuardarEstatusCaja()

  const cajas = useMemo(() => consulta.data ?? [], [consulta.data])
  const resumen = useMemo(() => contarPorObservacion(cajas), [cajas])

  const capturar = useCallback(async ({ caja, campo, valor }) => {
    try {
      await guardado.mutateAsync({ cajaId: caja.caja_id, [campo]: valor, usuarioId: usuario?.id })
    } catch (fallo) {
      notify.error(fallo)
    }
  }, [guardado, usuario])

  return {
    cajas,
    cargando: consulta.isLoading,
    mensajeError: consulta.error?.message ?? null,
    recargar: consulta.refetch,
    recargando: consulta.isFetching,
    resumen,
    guardandoId: guardado.isPending ? guardado.variables?.cajaId : null,
    capturar,
  }
}
```

- **Los datos del servidor no se copian a `useState`.** Se derivan con `useMemo`. Copiarlos
  crea dos fuentes de verdad.
- **`isLoading` para la primera carga, `isFetching` para el refresco.** El refresco no debe
  vaciar la tabla encima de quien está escribiendo.
- **La sesión sale de `useSesion()`**, no de `useAuthStore`: `shared/auth` es la única
  puerta a la identidad, y es lo que la fase 2 va a cambiar cuando llegue el token.
- **Una pantalla grande tiene varios controladores**, uno por panel
  (`usePanelInspecciones`, `usePanelPendientes`, `useConstructorOrden`). Si un controlador
  pasa de 250 líneas, está haciendo el trabajo de dos.

### Paso 7 · La feature: la interfaz

`features/<y>/ui/`. Componentes que **solo pintan**: reciben datos y callbacks, no piden
nada, no montan `useEffect` de datos, no arman `FormData`.

```jsx
import { DataTable } from "../../../shared/ui"
import { UBICACIONES_CAJA } from "../../../entities/trailer"
import { COLORES_ESTATUS_CAJA } from "./coloresEstatus"
import { SelectCelda } from "./SelectCelda"

/**
 * El tablero de cajas: una fila por caja interna.
 *
 * @param {object} props Propiedades del componente.
 * @param {Array.<EstatusCaja>} props.cajas Las cajas a pintar.
 * @param {boolean} props.cargando Si es la primera carga.
 * @param {(string|null)} props.error Mensaje de error, si lo hay.
 * @param {Function} props.onCapturar `({caja, campo, valor}) => void`.
 * @returns {object} La tabla renderizada.
 */
export function TablaEstatusCajas({ cajas, cargando, error, onCapturar }) {
  const columnas = [
    { id: "no_caja", label: "Cajas", ordenable: true },
    {
      id: "ubicacion",
      label: "Ubicación",
      ordenable: true,
      render: (caja) => (
        <SelectCelda
          valor={caja.ubicacion}
          opciones={UBICACIONES_CAJA}
          colores={COLORES_ESTATUS_CAJA}
          onChange={(valor) => onCapturar({ caja, campo: "ubicacion", valor })}
        />
      ),
    },
  ]

  return <DataTable filas={cajas} columnas={columnas} claveFila="caja_id" cargando={cargando} error={error} />
}
```

- **Columnas declarativas.** Agregar una columna es agregar un objeto. `render` es lo que
  se ve, `valor` es por lo que se ordena.
- **Props angostas.** El componente declara exactamente lo que usa. Si recibe un objeto
  entero para leer dos campos, recibe los dos campos.
- **Callbacks con prefijo `on`** (`onCapturar`, `onConfirmar`, `onCancelar`) y en pasado o
  infinitivo según el verbo del negocio.
- **Lo visual de un estado vive en la feature, no en la entidad.** El color de CARGADA es
  decisión de esta pantalla; que CARGADA exista es del negocio.

### Paso 8 · La página

`pages/<modulo>/<Nombre>Page.jsx`. Composición y nada más:

```jsx
import { Box } from "@mui/material"
import { TablaEstatusCajas, useTableroCajas } from "../../features/estatus-cajas"
import { BotonActualizar, PAGE_SHELL_SX, PageHeader } from "../../shared/ui"

/**
 * Estatus de cajas: dónde está cada caja y con qué viaje.
 *
 * @returns {object} La pantalla renderizada.
 */
export default function EstatusCajasPage() {
  const tablero = useTableroCajas()

  return (
    <Box sx={PAGE_SHELL_SX}>
      <PageHeader
        seccion="Viajes · Unidades"
        titulo="Estatus de cajas"
        descripcion={`${tablero.resumen.cargadas} cargadas · ${tablero.resumen.vacias} vacías.`}
        acciones={<BotonActualizar onActualizar={() => tablero.recargar()} actualizando={tablero.recargando} />}
      />
      <TablaEstatusCajas
        cajas={tablero.cajas}
        cargando={tablero.cargando}
        error={tablero.mensajeError}
        onCapturar={tablero.capturar}
      />
    </Box>
  )
}
```

- `PAGE_SHELL_SX` da el relleno, el alto y el fondo de toda pantalla.
- `PageHeader` da la sección, el título, la descripción y las acciones.
- El `ErrorBoundary` **no** se monta aquí: ya lo pone `DashboardLayout` alrededor de cada
  ruta, con la ruta como clave para que olvide el error al navegar.
- Exportación `default`: el router importa páginas, no piezas.

### Paso 9 · La ruta, el menú y el permiso

1. **Ruta**, en `src/navigation/AppRouter.jsx`, dentro del bloque autenticado:
   ```jsx
   <Route path="/estatus-cajas" element={<EstatusCajasPage />} />
   ```
2. **Menú**, si va en él, en `src/config/menuConfig.js`:
   ```js
   { name: "Reparaciones", featureKey: "mant_inspeccion_final", route: "/mantenimiento" }
   ```
   `hideInSidebar: true` deja la ruta viva sin enseñarla: es lo que se usa para una pantalla
   que se llega por un botón, o para conservar una vieja mientras la nueva se asienta.
3. **Permiso.** Un `featureKey` nuevo se declara en `shared/auth/permisos.js`, dentro del
   grupo de `MODULOS` al que pertenece, y se agrega a la matriz de `ROLES-Y-PERMISOS.md`.
   Hoy hay **dos lecturas distintas** del mismo permiso, y hay que contar con las dos:

   | Quién pregunta | Qué consulta | Quién ve la pantalla |
   |---|---|---|
   | El menú lateral (`components/Sidebar.jsx`) | `userPermissions` de `features.php`, vía `useAuthStore` | Los roles totales, y quien tenga la clave en `true` en `features.php`. **Lo que da el rol no cuenta** |
   | `<Can>`, `usePermisos()`, `useSesion().can` | `calcularPermisosEfectivos`: rol + ajustes de `features.php` | Los roles totales, los roles cuyo `PERMISOS_POR_ROL` incluye el grupo, y los ajustes por persona |

   Para que alguien que no es rol total vea la entrada del menú hay que concederle la
   clave en `features.php` (pantalla de Accesos). Unificar las dos lecturas está en
   `refactor/PENDIENTES.md`.

   Reusar el permiso de la pantalla que se sustituye evita tocar la base, a cambio de que
   quien tenía otro permiso no la vea: es una decisión, no un detalle, y se anota.

> **Esconder no es proteger.** El router no comprueba permisos: una ruta que no está en el
> menú se abre igual si alguien escribe su dirección. Los permisos del front son
> experiencia de usuario; la autorización real es del servidor, y hoy el servidor no
> autentica. Ver `DECISIONES/0006`.

### Paso 10 · Verificar

```bash
npm test          # verde, con las pruebas nuevas
npm run lint      # 0 errores; las advertencias no suben
npm run build     # verde
npm run docs:api  # regenera la referencia, y se commitea
```

Y después, **la pantalla abierta en la app**, contra producción:

- La consola sin errores ni avisos de React (`<div>` dentro de `<p>`, llaves repetidas,
  props desconocidas de MUI).
- Primera carga con esqueleto, no con un círculo girando.
- Un refresco que no vacía la tabla.
- Un error forzado —desconectar la red— que se ve en la sección, con salida, y no tumba la
  navegación.
- El ancho angosto: la barra lateral abierta y la ventana a la mitad.

Los tests corren en jsdom. No ven colores, ni el `Grid` sin ancho, ni el HTML inválido:
esos tres salieron siempre de abrir la pantalla.

### Paso 11 · Documentar

- `README.md` en cada carpeta nueva de `entities/` y `features/` (plantilla en
  `refactor/06-DOCUMENTACION.md`, ejemplo en `entities/payroll/README.md`).
- `docs/MODULOS/<modulo>.md`: la regla de negocio que sorprende y lo que se decidió.
- `API-ENDPOINTS.md` si el endpoint o el `op` son nuevos, con la columna *Móvil*.
- Un ADR en `docs/DECISIONES/` si se tomó una decisión estructural.

---

## 4 · Catálogo de patrones

Los que ya están en el repo, con el ejemplo donde copiarlos.

| Patrón | Cuándo | Dónde verlo |
|---|---|---|
| **Controlador** | Siempre que una pantalla tenga estado o efectos | `features/estatus-cajas/model/useTableroCajas.js` |
| **Columnas declarativas** | Toda tabla | `features/estatus-cajas/ui/TablaEstatusCajas.jsx` |
| **Shell + tabla de descriptores** | El mismo flujo para varios tipos (camión/caja/conductor, gasto/diesel) | `entities/unit/model/tipos.js` (`CATALOGO_UNIDAD`), `entities/expense/model/tipos.js` |
| **Tabla de datos en vez de funciones copiadas** | N operaciones que solo cambian el `op` | `entities/report/api/graficas.js` (`GRAFICAS`) |
| **Normalizar descartando** | Toda respuesta de lista | `normalizarEstatusCajas`, `normalizarOrdenes` |
| **Catálogo compartido** | Listas que cambian poco y piden varias pantallas | `entities/company/api/companias.js` |
| **Actualización optimista** | Captura por fila: combos, casillas, permisos | `useGuardarEstatusCaja`, `useCambiarPermisoUsuario` |
| **Llave raíz** | Una acción que mueve varias listas a la vez | `entities/maintenance-point/api/puntos.js` (`LLAVE_MANTENIMIENTO`) |
| **Refresco periódico** | Tableros que se dejan abiertos | `REFRESCO_TABLERO_MS`, `REFRESCO_FLOTA_MS` |
| **Fábrica de mutaciones** | Varias operaciones que invalidan lo mismo | `entities/document/api/documentos.js` |
| **Mapa de presentación** | Color, icono o etiqueta por estado | `features/estatus-cajas/ui/coloresEstatus.js` |
| **Control compartido con un solo aspecto** | Pestañas, selectores segmentados | `shared/ui/Pestanas`, `shared/ui/Selector` (el linter prohíbe los de MUI) |

---

## 5 · Componentes: ¿`shared/ui`, la feature o la entidad?

```
¿Sabe qué es un viaje, una caja, un gasto?
├── No  → ¿Lo van a usar dos módulos o más?
│         ├── Sí → shared/ui        (DataTable, CampoFecha, Selector)
│         └── No → features/<y>/ui  (hasta que aparezca el segundo)
└── Sí  → ¿Es un flujo o una pieza del flujo?
          └── features/<y>/ui       (TablaEstatusCajas, ModalFianza)
```

`entities/<x>/ui/` se reserva para la presentación mínima de un concepto que muchas
features pintan igual —una pastilla de estado, por ejemplo—. Hoy ninguna entidad la
necesita; no se crea la carpeta por adelantado.

**Para subir algo a `shared/ui`** debe pasar dos pruebas: no menciona el negocio y ya lo
usan dos módulos. Se documenta en `shared/ui/README.md` y se exporta del índice.

**Si a `shared/ui` le falta una capacidad**, se le agrega ahí. Nunca se copia el componente
a la feature para cambiarle una línea: esa copia es la que deriva.

---

## 6 · Los cuatro estados que toda sección tiene

| Estado | Qué se ve | Con qué |
|---|---|---|
| **Cargando** (primera vez) | Esqueleto con la forma del contenido | `DataTable cargando`, `FilasEsqueleto`, `TarjetasEsqueleto`, `PantallaEsqueleto` |
| **Error** | Qué pasó, qué hacer y el botón | `DataTable error`, `<EstadoError error onReintentar />` |
| **Vacío** | Por qué no hay nada | `DataTable vacio="…"` |
| **Trabajando** (guardar, subir) | El botón dice qué hace y se bloquea | `BotonActualizar actualizando`, `disabled` + texto |

Y los avisos, según de dónde venga el fallo:

| El fallo viene de… | Se avisa con |
|---|---|
| Algo que la persona acaba de pulsar | `notify.error(fallo)` |
| Algo de fondo (un sondeo, un refresco) | `notify.discreto(...)`, o nada si la sección ya lo pinta |
| Una acción irreversible, antes de hacerla | `await notify.confirmar({...})` |

Nunca el texto crudo de la excepción: `notify.error` y `EstadoError` ya lo traducen con
`describirError`.

---

## 7 · Límites

| Límite | Valor | Qué significa pasarlo |
|---|---|---|
| Archivo | **1 000 líneas, duro** | No entra. Es el primer compromiso del estándar |
| Componente, hook o módulo | **250 líneas, blando** | Señal de dos responsabilidades. Se parte, o se justifica en el commit |
| Prop bajada a mano | **3 niveles** | El estado está en el lugar equivocado: controlador, consulta compartida o Context de la feature |

---

## 8 · Lista de revisión

Antes de pedir que alguien lo vea:

- [ ] La regla de negocio está en `entities/<x>/model`, con pruebas contra una respuesta real.
- [ ] Ningún `fetch(`, ningún `.php` fuera de `shared/api/endpoints.js`.
- [ ] Los datos del servidor se leen de TanStack Query; no hay copias en `useState`.
- [ ] La página solo compone; el controlador tiene el estado; la UI solo pinta.
- [ ] Ningún import de una feature a otra (el lint lo dice).
- [ ] Ningún color, tamaño ni radio escrito a mano: tokens de `shared/ui`.
- [ ] `Grid` con `size={{ xs, md }}`; nunca `item`, `xs` ni `md` sueltos.
- [ ] Carga, error, vacío y trabajando, los cuatro, en cada sección.
- [ ] Todo lo exportado con JSDoc; cero comentarios dentro de las funciones.
- [ ] `npm test`, `npm run lint`, `npm run build` y `npm run docs:api` en verde.
- [ ] Vista funcionando en la app, con la consola limpia.
- [ ] README de carpeta, `MODULOS/<modulo>.md` y, si aplica, `API-ENDPOINTS.md` y un ADR.

---

## 9 · Los errores que más se repiten en este repo

Cada uno salió de un caso real.

| Error | Qué pasa | Lo correcto |
|---|---|---|
| `fetch` en la página "porque es una sola llamada" | Sin caché, sin cancelación, sin validar, sin reintento; y la próxima pantalla lo copia | La entidad, aunque sea una función y un hook |
| Construir la entidad y no conectarla | Hay 8 entidades con modelo y pruebas que ninguna pantalla usa (ver `refactor/PENDIENTES.md`) | La pantalla pasa a la entidad en el mismo incremento |
| `useAuthStore` en una feature | Dos puertas a la sesión; la fase 2 tendría que cambiar las dos | `useSesion()` de `shared/auth` |
| `<Grid item xs={6}>` | MUI 7 ignora esos props: los hijos quedan sin ancho y solo avisa en consola | `<Grid size={{ xs: 6 }}>` |
| Un `<Box>` o un `<Chip>` dentro de `<Typography>` | HTML inválido; React avisa en consola y jsdom no lo detecta | `<Typography component="div">` |
| `Tabs` o `ToggleButton` de MUI | El linter lo rechaza: el aspecto vive en `Pestanas` y `Selector` | Los de `shared/ui` |
| Detalle que lee `useLocation().state` | El enlace directo y el recargar abren la pantalla vacía | El id en la ruta (`/editar/:id`) y la consulta por id |
| Restar para contar ("vacías = total − cargadas") | Un estado nuevo se cuela en el conteo sin que nadie lo note | Contar cada estado por su nombre |
| Un `.catch` que solo hace `console.error` | El fallo desaparece | `notify.error`, o dejar que la sección lo pinte |

---

## 10 · Ejemplos para copiar

| Si vas a hacer… | Mira |
|---|---|
| Una pantalla de una tabla con captura | `features/estatus-cajas` + `pages/viajes/EstatusCajasPage.jsx` |
| Una pantalla con pestañas y varios paneles | `features/maintenance` + `pages/mantenimientos/MantenimientoPage.jsx` |
| Un administrador para varios tipos parecidos | `features/units` + `entities/unit/model/tipos.js` |
| El módulo de referencia del refactor | Nómina: `entities/payroll`, `entities/personal`, `pages/nomina` |
| Un tablero de gráficas | `entities/report` + `pages/reports` |
| Un mapa | `entities/tracking` + `features/tracking` |
