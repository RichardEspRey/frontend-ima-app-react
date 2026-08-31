# Estándar de documentación

Dos cosas distintas y no se mezclan:

| | Qué es | Dónde vive |
|---|---|---|
| **Contrato** | Qué hace una pieza, qué recibe, qué devuelve, qué falla | **JSDoc**, arriba de lo exportado |
| **Razonamiento** | Por qué se decidió así, qué alternativas se descartaron | `docs/`, mensaje de commit — **nunca** dentro de la función |

La regla operativa: **JSDoc arriba, cuerpo limpio.** Si el cuerpo necesita un comentario
para entenderse, el problema es el cuerpo: extrae una función con nombre.

---

## 1. Nivel función — JSDoc obligatorio en todo lo exportado

Obligatorio en: funciones exportadas, hooks, componentes, stores de zustand, funciones de
`api/`, normalizadores y esquemas. **No** obligatorio en helpers locales de un archivo,
aunque se agradece si el nombre no basta.

### Función pura

```js
/**
 * Calcula el total de un gasto sumando subtotal e impuestos, aplicando el tipo de cambio
 * cuando la moneda del gasto no coincide con la moneda de reporte.
 *
 * @param {object}  gasto              Gasto normalizado.
 * @param {number}  gasto.subtotal     Subtotal en la moneda original.
 * @param {number}  gasto.impuestos    Impuestos en la moneda original.
 * @param {'MXN'|'USD'} gasto.moneda   Moneda en que se capturó el gasto.
 * @param {number}  tipoCambio         Pesos por dólar. Debe ser mayor que 0.
 * @returns {number} Total en la moneda de reporte, redondeado a 2 decimales.
 * @throws {RangeError} Si `tipoCambio` es 0 o negativo.
 */
export function calcularTotalGasto(gasto, tipoCambio) { … }
```

### Hook

```js
/**
 * Obtiene la lista de gastos aplicando los filtros activos. Cachea por combinación de
 * filtros y conserva la página anterior mientras llega la nueva, para que la tabla no
 * parpadee al filtrar.
 *
 * @param {import('./tipos').FiltrosGasto} filtros Filtros activos de la vista.
 * @returns {{
 *   gastos: import('./tipos').Gasto[],
 *   isLoading: boolean,
 *   isError: boolean,
 *   error: import('@/shared/api/errors').ApiError | null,
 *   refetch: () => void
 * }}
 */
export function useGastos(filtros) { … }
```

### Componente

```js
/**
 * Tabla genérica con orden por columna, paginación y estados de carga, error y vacío.
 * Las columnas son declarativas: agregar una columna no requiere editar este componente.
 *
 * @param {object} props
 * @param {object[]} props.rows                Filas a pintar.
 * @param {import('./tipos').Columna[]} props.columns  Definición declarativa de columnas.
 * @param {string} [props.rowKey='id']         Campo que identifica cada fila.
 * @param {boolean} [props.loading=false]      Muestra el esqueleto de carga.
 * @param {(row: object) => void} [props.onRowClick] Se dispara al hacer clic en una fila.
 * @returns {JSX.Element}
 *
 * @example
 * <DataTable rows={gastos} columns={columnasGasto} onRowClick={abrirDetalle} />
 */
export function DataTable({ rows, columns, rowKey = 'id', loading = false, onRowClick }) { … }
```

### Función de API

Además del contrato, **documenta el endpoint y la operación**. Es lo único que va a
existir como referencia de la API PHP.

```js
/**
 * Trae todos los gastos no borrados que cumplen los filtros.
 *
 * @endpoint POST save_expense.php · op=getAllGastos
 * @param {import('./tipos').FiltrosGasto} filtros
 * @returns {Promise<import('./tipos').Gasto[]>} Gastos normalizados y validados con zod.
 * @throws {ApiError} Si la API responde `status: 'error'` o la forma no valida.
 */
export const getGastos = (filtros) => post(ENDPOINTS.gastos, 'getAllGastos', filtros)
```

### Store de zustand

```js
/**
 * Estado de sesión: usuario autenticado y sus permisos efectivos.
 * Se persiste en localStorage bajo la llave `auth-storage`.
 *
 * @typedef {object} SesionState
 * @property {import('@/entities/user/tipos').Usuario | null} user
 * @property {string[]} permissions  Permisos efectivos en formato `modulo.accion`.
 * @property {(credenciales: {usuario: string, password: string}) => Promise<void>} login
 * @property {() => void} logout  Limpia zustand, la caché de react-query y el token push.
 */
```

### Reglas de estilo

- Primera línea: **qué hace**, en presente, sin "Esta función…". Una oración.
- Segundo párrafo solo si hay algo no obvio en el comportamiento (efectos, caché, orden).
- Documentar unidades y monedas siempre (`pesos`, `USD`, `millas`, `ms`).
- Opcionales entre corchetes con su default: `@param {number} [limite=50]`.
- `@throws` cuando la función puede lanzar. Si nunca lanza, no se pone.
- `@deprecated Usar X en su lugar.` en los puentes de re-export, para que se vean.
- Español, igual que el resto del proyecto.

### Cómo se hace obligatorio

`eslint-plugin-jsdoc` en el incremento 0:

```js
'jsdoc/require-jsdoc': ['warn', {
  publicOnly: true,
  require: { FunctionDeclaration: true, ArrowFunctionExpression: true, FunctionExpression: true },
}],
'jsdoc/require-description': 'warn',
'jsdoc/require-param': 'warn',
'jsdoc/require-param-description': 'warn',
'jsdoc/require-returns': 'warn',
'jsdoc/check-param-names': 'error',
'jsdoc/check-tag-names': 'error',
'jsdoc/no-undefined-types': 'off',
```

`warn` en `src/**` (hay 204 archivos sin documentar y no se van a documentar todos de
golpe), **`error` en `src/shared/**`, `src/entities/**` y `src/features/**`** — o sea, en
todo lo que el refactor va tocando. Así lo nuevo nace documentado y lo viejo no bloquea el
build. Cuando un módulo se migra, entra a la zona `error` y ya no puede salir.

---

## 2. Nivel módulo — un README por carpeta

Cada carpeta de `entities/` y `features/` lleva un `README.md` de media cuartilla:

```markdown
# entities/expense

Qué modela y qué reglas de negocio le pertenecen.

## Contenido
- `model/` — normalizadores, esquemas zod, cálculos puros
- `api/` — queries y mutations
- `ui/` — presentación reutilizable

## Endpoints que consume
| Endpoint | op | Función |
|---|---|---|
| `save_expense.php` | `getAllGastos` | `getGastos()` |
| `save_expense.php` | `deleteExpense` | `borrarGasto()` |

## Reglas de negocio
- Un gasto borrado tiene `deleted_at`; nunca se borra físicamente.
- Borrar un gasto revierte el movimiento de inventario asociado.

## Quién lo usa
`features/expense-list`, `features/expense-create`, `pages/gastos`
```

---

## 3. Nivel proyecto — `docs/`

```
docs/
  README.md              Índice. Punto de entrada del repo.
  ARQUITECTURA.md        La estructura y sus reglas (sale de 02-ARQUITECTURA.md)
  ONBOARDING.md          De cero a la app corriendo, para alguien nuevo
  CONTRIBUYENDO.md       Convenciones: ramas, commits, JSDoc, dónde va cada cosa
  GLOSARIO.md            Dominio: viaje, cruce, caja, residuo, afinación, IFTA…
  API-ENDPOINTS.md       Catálogo de los 36 endpoints PHP con sus ops
  MODULOS/               Un archivo por módulo funcional
    gastos.md  viajes.md  finanzas.md  nomina.md  …
  DECISIONES/            ADRs cortos: contexto, decisión, consecuencias
    0001-sin-idp-externo.md
    0002-tanstack-query.md
    0003-sin-typescript-en-fase-1.md
    0004-roles-normalizados-en-front.md
  refactor/              Este directorio (el plan; se archiva al terminar)
  api/                   Referencia generada desde JSDoc — NO se edita a mano
```

### `API-ENDPOINTS.md` es el de mayor valor inmediato

Hoy no existe **ningún** documento de la API. Son 36 archivos PHP con un parámetro `op`
que multiplexa operaciones, y la única forma de saber qué hace cada uno es leer el
frontend. Se llena mientras se hace el incremento 2, que es cuando de todos modos hay que
inventariar cada llamada:

```markdown
### save_expense.php

| op | Params | Devuelve | Usado por | Móvil |
|---|---|---|---|---|
| `getAllGastos` | `id_usuario`, filtros | `Gasto[]` | `getGastos()` | ? |
| `deleteExpense` | `id_usuario`, `id_gasto` | `{status}` | `borrarGasto()` | no |
```

La columna **Móvil** importa: marca qué contratos no se pueden tocar en la fase 2 sin
romper la app móvil.

### Los ADR

Media cuartilla cada uno: contexto, decisión, consecuencias, fecha. Sirven para que dentro
de seis meses nadie —tú incluido— vuelva a discutir si hay que meter Auth0. Los cuatro
primeros ya están decididos en estos documentos; solo hay que extraerlos.

---

## 4. Referencia generada

`jsdoc-to-markdown` genera `docs/api/` desde los bloques JSDoc:

```json
"docs:api": "jsdoc2md \"src/{shared,entities,features}/**/*.{js,jsx}\" --files > docs/api/README.md"
```

Se corre al cerrar cada incremento. No se edita a mano — se edita el JSDoc.

---

## 5. Cómo entra esto en el plan

**No es un incremento aparte.** Documentar al final nunca pasa. Se reparte:

- **Incremento 0**: `eslint-plugin-jsdoc` + `jsdoc-to-markdown`, `docs/README.md`,
  `CONTRIBUYENDO.md`, y los 4 ADR de las decisiones ya tomadas.
- **Cada incremento**: el código que se toca sale con JSDoc completo, su carpeta con
  `README.md`, y `docs/MODULOS/<modulo>.md` escrito o actualizado.
- **Incremento 2**: `API-ENDPOINTS.md` se llena en paralelo al inventario de llamadas.
- **Incremento 4**: `GLOSARIO.md` y la documentación del modelo de roles y permisos.

### Criterio de terminado, ampliado

A partir de aquí, un incremento no está cerrado hasta que:

1. `npm test` verde
2. `npm run build` verde
3. `npm run lint` sin errores de `jsdoc/*` en las zonas migradas
4. Todo lo exportado que se tocó tiene JSDoc completo
5. Las carpetas nuevas tienen `README.md`
6. `docs/MODULOS/<modulo>.md` actualizado
7. `npm run docs:api` corrido y commiteado
8. `docs/refactor/00-ESTADO.md` actualizado
