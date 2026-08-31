# Arquitectura destino

## Estructura

```
src/
  app/                      Arranque: providers, router, tema, error boundary
    providers/
    router/
  shared/                   Cero lógica de negocio. Reutilizable en cualquier app.
    api/                    Cliente HTTP, registro de endpoints, errores, react-query
    ui/                     DataTable, FormField, Modal, PageHeader, ConfirmDialog…
    lib/                    fechas, dinero, formato, descargas, exportar
    hooks/                  useDebounce, useDisclosure, useLocalStorage…
    auth/                   roles, permisos, can(), <Can>, guardas de ruta
    config/                 env, constantes globales
  entities/                 El dominio. Un modelo = una carpeta.
    driver/  truck/  trailer/  trip/  expense/  user/  …
      model/                normalizadores, esquemas zod, tipos
      api/                  queries y mutations de esa entidad
      ui/                   presentación mínima reutilizable (Badge, Chip, Row)
  features/                 Casos de uso con UI propia
    expense-create/  expense-list-filters/  trip-edit/  access-manager/  …
      ui/  model/  api/
  pages/                    Una pantalla = composición de features. Nada de lógica.
    gastos/  viajes/  finanzas/  nomina/  safety/  mantenimientos/  …
```

Es Feature-Sliced Design recortado. Se eligió porque la rama `refactor` abandonada ya
había llegado a esta misma forma: el destino era correcto, lo que falló fue el método
(una rama de meses). Aquí se llega igual, pero por incrementos mergeables.

`screens/` desaparece: se reparte entre `pages/` (la composición) y `features/` (la lógica).

## La regla que sostiene todo: dirección de dependencias

```
app  →  pages  →  features  →  entities  →  shared
```

Solo hacia la derecha. Nunca hacia la izquierda, nunca en horizontal entre hermanos
(`features/a` no importa de `features/b`; si necesitan lo mismo, baja a `entities` o `shared`).

**Esto no se sostiene con disciplina, se sostiene con el linter.** Se configura
`eslint-plugin-boundaries` (o `import/no-restricted-paths`) en el incremento 0 para que
romper la regla sea un error de lint, no una decisión de criterio en un code review.

Es la traducción práctica de la inversión de dependencias: `shared/api` no sabe que
existen los gastos; `entities/expense` no sabe qué pantalla lo usa.

## Cómo se aplica cada principio, en concreto

### SRP — el patrón que mata los archivos de 1 000 líneas

Un componente hace **una** de estas tres cosas, nunca las tres:

- **pide datos** → un hook (`useExpenses`, `useExpenseFilters`)
- **decide** → una función pura en `model/` (cálculos, validaciones, reglas de negocio)
- **pinta** → un componente sin `useEffect` ni `fetch`

Regla operativa: **un componente que renderiza no monta `useEffect` de datos ni construye
un `FormData`.** Cuando una pantalla crece, lo que se extrae es un
`usePantallaController()` que concentra estado y efectos; el componente se queda con el
JSX. `TripAdmin.jsx` (1 341 líneas) baja a ~150 sin cambiar una sola regla de negocio.

Techo blando: **250 líneas por archivo**. No es dogma, es la señal de que algo tiene dos
responsabilidades.

### OCP — extender sin editar

Nada de reescribir una tabla por módulo. Una sola `<DataTable>` que se **configura**:

```js
const columnas = [
  { id: 'fecha',   label: 'Fecha',   sortable: true,  render: r => fmtFecha(r.fecha) },
  { id: 'monto',   label: 'Monto',   sortable: true,  align: 'right', render: r => money(r.monto) },
  { id: 'acciones', label: '',       render: r => <AccionesGasto gasto={r} /> },
]
```

Agregar una columna es agregar un objeto, no editar el componente. Lo mismo con
formularios (esquema declarativo de campos) y filtros.

### ISP / LSP — props angostas

Nada de `<Row data={todoElObjeto} handlers={objetoDeCallbacks} />`. Cada componente
declara exactamente lo que consume. Un `<TripRow>` que recibe 14 props sueltas está
pidiendo un contexto o una composición, no más props.

### DRY — dónde está el duplicado real

Los 14 hooks `useFetchActiveDrivers`, `useFetchActiveTrucks`, `useFetchActiveTrailers`…
son el mismo hook con otro endpoint. Desaparecen: cada uno se vuelve una línea sobre
`useQuery` en `entities/<x>/api`.

Los 68 archivos con `setLoading/try/catch` a mano desaparecen igual.

### KISS y "no reinventar la rueda"

Se usa librería para lo que es problema resuelto (caché de servidor, validación,
formularios). Se escribe a mano solo el dominio de IMA.

## Manejo de estado — el fin del prop drilling

Hoy todo el estado se trata igual. Se separa en cuatro tipos, cada uno con su herramienta:

| Tipo de estado | Ejemplo | Herramienta |
|---|---|---|
| **De servidor** | lista de gastos, catálogos, conductores | **TanStack Query** |
| **De sesión / global** | usuario, permisos, notificaciones, sidebar | **zustand** (ya está) |
| **De pantalla compartido** | filtros de una vista, wizard de varios pasos | **Context por feature**, no props |
| **Local** | un input, un modal abierto | `useState` |

La causa real del prop drilling es que hoy el estado de servidor se levanta arriba y se
baja a mano hasta la hoja. Con TanStack Query el componente que necesita los datos los
pide donde está — la misma query desde tres componentes hace **una** petición.

**Redux se elimina.** Solo sobrevive `menuSlice` y solo lo usa `AppRouter`. Zustand ya
cubre ese caso y tener dos librerías de estado global es deuda pura.

## La capa de API

Es el cambio de mayor retorno: 94 archivos dejan de hablar HTTP.

```
shared/api/
  client.js        una función: arma FormData, mete op, adjunta identidad,
                   AbortController con timeout, normaliza {status,message} → throw
  endpoints.js     el único lugar donde aparece un ".php"
  errors.js        ApiError con código, mensaje de usuario y detalle técnico
  queryClient.js   configuración de TanStack Query (staleTime, retry, backoff)
```

```js
// entities/expense/api/getExpenses.js
export const getExpenses = (filtros) =>
  post(ENDPOINTS.gastos, 'getAllGastos', filtros)

export const useExpenses = (filtros) =>
  useQuery({ queryKey: ['gastos', filtros], queryFn: () => getExpenses(filtros) })
```

Ningún componente vuelve a saber que del otro lado hay PHP. Cuando la fase 2 cambie la
autenticación a un token, se edita **`client.js`**, no 94 archivos. Ese es el punto.

De ahí salen, gratis, los requisitos no funcionales que pediste:

- **Rendimiento**: caché, deduplicación de peticiones idénticas, `keepPreviousData` en
  filtros (la tabla no parpadea), `staleTime` en catálogos (no se vuelven a pedir).
- **Alta disponibilidad / fiabilidad**: reintentos con backoff, timeout por
  `AbortController`, un `ErrorBoundary` por página para que un módulo caído no tumbe la
  app, estados de error uniformes.
- **Arranque**: `React.lazy` por ruta en `app/router`. Hoy se cargan 70 pantallas para
  pintar el login.

## Validación en la frontera (seguridad del lado del front)

La API PHP no valida tipos y devuelve lo que sea. Se pone **zod** en el borde:

- **Saliente**: nada se manda sin pasar por el esquema del formulario. Se acabaron los
  `NaN`, los `undefined` serializados como `"undefined"` y los campos vacíos.
- **Entrante**: la respuesta se valida contra el esquema de la entidad antes de entrar al
  estado. Una respuesta malformada falla en un punto identificable, no tres componentes
  después con un `cannot read property of undefined`.

Aclaración honesta: **esto no previene inyección SQL**. La inyección se previene con
sentencias preparadas en el backend, y eso es fase 2. Lo que sí da la validación en el
front es integridad de datos y errores diagnosticables. XSS no es un problema hoy: hay
0 usos de `dangerouslySetInnerHTML`, `innerHTML` y `eval`, y esa regla se fija en el linter
para que siga siendo cierta.

Además, en el incremento 0 se explicitan las `webPreferences` de Electron con `contextIsolation: true`,
`nodeIntegration: false`, `sandbox: true`, `setWindowOpenHandler` que niega ventanas
nuevas y guarda de `will-navigate`.

## Sobre TypeScript

**No en la fase 1.** Migrar 40 000 líneas mientras Richard mete features a diario es
justo el tipo de trabajo que mata un refactor. Y contra una API PHP sin tipos, TS te da
una falsa sensación de seguridad: los tipos desaparecen en runtime, que es donde llegan
los datos malos.

Lo que sí resuelve el problema es **zod**: valida de verdad, en ejecución, y de paso
infiere tipos si algún día se migra.

Puerta abierta: Vite compila `.ts` y `.jsx` mezclados sin configuración extra. Si más
adelante quieres, se empieza por `shared/` y `entities/` (archivos nuevos, sin migrar
nada) y se avanza solo si aporta. Decisión revisable, no cerrada.

## Dependencias que se agregan

| Paquete | Para qué | Reemplaza |
|---|---|---|
| `@tanstack/react-query` | estado de servidor, caché, reintentos | 68 bloques de `setLoading/try/catch` |
| `zod` | validación en la frontera | validación manual dispersa |
| `react-hook-form` | formularios grandes sin re-render por tecla | `useState` por campo |
| `eslint-plugin-boundaries` | hacer la arquitectura obligatoria | code reviews |
| `eslint-plugin-jsdoc` | hacer el JSDoc obligatorio | buenas intenciones |
| `jsdoc-to-markdown` | referencia generada en `docs/api/` | nada, hoy no existe |

## Dependencias que se quitan

`@reduxjs/toolkit` y `react-redux`. Y a revisar durante el trabajo: `sweetalert2` +
`react-toastify` + `@pablotheblink/flashyjs` son **tres** librerías para notificar al
usuario; hay que quedarse con una y envolverla en `shared/ui/notify` para que cambiarla
después sea un archivo.
