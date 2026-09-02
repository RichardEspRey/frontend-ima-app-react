# shared/ui

Piezas de interfaz reutilizables. **Cero lógica de negocio**: nada de aquí sabe qué es un
gasto, un viaje o un empleado. Si un componente necesita saberlo, va en `features/`.

## Contenido

| Pieza | Qué resuelve |
|---|---|
| `DataTable` | Tabla con columnas declarativas, orden por columna y los tres estados (cargando, error, vacío). Sustituye el patrón copiado en **45 archivos**. |
| `PageHeader` | Sección, título, descripción y acciones. Estaba copiado con variaciones en casi todas las pantallas. |
| `StatCard` | Tarjeta de cifra: etiqueta, número grande y nota al pie. |
| `ErrorBoundary` | Aísla el fallo de una pantalla para que no deje la app en blanco. Se monta **por página**, no una vez arriba. |
| `notify` | Avisos y confirmaciones. Envuelve una sola librería. |
| `estilos` | Los tokens del sistema de diseño: cabeceras, tarjetas, botones, chips. |

## DataTable

Agregar una columna es agregar un objeto, no editar el componente:

```jsx
const columnas = [
  { id: 'nombre', label: 'Nombre', ordenable: true },
  { id: 'sueldo', label: 'Sueldo', ordenable: true, align: 'right',
    valor:  (e) => e.sueldo,
    render: (e) => `$${e.sueldo.toFixed(2)}` },
]

<DataTable filas={empleados} columnas={columnas} cargando={isLoading} />
```

`render` es lo que se pinta; `valor` es por lo que se ordena. Se separan porque una
columna de dinero se pinta como `"$1,500.00"` y se ordena como `1500`.

El orden reutiliza la semántica que ya tenía el Expense Manager, ahora en
`shared/lib/orden`: ciclo **ascendente → descendente → sin orden**, y los valores vacíos
**siempre al final**, en las dos direcciones. El tercer estado del ciclo importa: permite
volver al orden natural que trae la API sin recargar.

Por omisión el orden es interno. Pasa `orden` y `onOrdenChange` solo si la pantalla
necesita conservarlo entre navegaciones.

## notify

```js
notify.exito('Guardado correctamente')
notify.error(e, 'No se pudo guardar')      // acepta un Error directamente
notify.aviso('El nombre es obligatorio')

const acepto = await notify.confirmar({     // devuelve booleano, no {isConfirmed}
  titulo: '¿Eliminar empleado?',
  mensaje: 'El historial de pagos previos se mantendrá intacto.',
  confirmar: 'Sí, eliminar',
})
```

**Por qué existe**: el proyecto usaba tres librerías para lo mismo — `sweetalert2`,
`react-toastify` y `@pablotheblink/flashyjs` — y las tres se ven distintas entre sí y
distintas del resto de la app. Hoy no hay ninguna: los avisos se pintan con MUI y el
tema del proyecto.

`notify` no pinta, **encola**: por eso se puede llamar desde un `catch`, desde el
manejador global de errores o desde un hook, sin que ninguno de esos sitios sea un
componente. Quien pinta es `AnfitrionAvisos`, montado una sola vez en `ThemeProvider`.

- `notify.discreto(...)` es el aviso flotante que no bloquea; para fallos de fondo.
- `notify.cargando()` bloquea, y **cualquier aviso posterior lo releva**: no hace falta
  cerrarlo a mano al terminar de guardar.
- `formato` acepta marcas de HTML y es el único punto de la app donde entra HTML sin
  escapar. Está aislado en `avisos/AnfitrionAvisos.jsx` para que sea auditable.

## estilos

Los tokens del sistema: `HEADER_ROW_SX`, `HEADER_CELL_SX`, `TABLE_CONTAINER_SX`,
`DARK_BTN_SX`, `GHOST_BTN_SX`, `CHIP_SX`, `CARD_SX`, `ICON_BTN_SX`, `CELL_STRONG_SX`…

Vivían en `src/styles/estilosTabla.js` y los usaban 11 archivos; se movieron aquí porque
son interfaz compartida. Ese archivo quedó como puente `@deprecated` mientras los
consumidores viejos pasan por su incremento.

**`DataTable` y `PageHeader` ya los aplican de fábrica.** Una pantalla que use esos dos
componentes se ve como el Expense Manager y el Administrador de viajes sin escribir una
sola regla de estilo. Cambiar el diseño de todas las tablas del proyecto es editar
`estilos.js`.

Para lo que no cubran esos componentes —botones, tarjetas, chips— se importan los tokens
directo: `import { DARK_BTN_SX } from "../../shared/ui/estilos"`. Nada de colores a mano.

## StatCard

```jsx
<StatCard
  etiqueta="Nómina total (MXN)"
  valor="$18,800.00"
  pie="Pagado a 7 empleado(s)"
  acento="#15803d"
  icono={<MonetizationOnIcon fontSize="small" />}
/>
```

**Tarjeta blanca con borde fino, y el color solo en la cifra.** No lleva fondo de color ni
barra lateral gruesa: eso compite con el dato en vez de destacarlo, y es lo que hacía que
el Desglose de Nómina no se pareciera al resto de la app.

El icono va junto a la etiqueta y no junto al número, para que una fila de tarjetas se lea
de un vistazo por sus cifras.

## Cuidado con `<Typography>` y los `div`

`Typography` renderiza `<p>` por omisión. Un `<Chip>`, un `<Box>` o cualquier `div`
dentro de él es HTML inválido: React lo avisa en consola y **ningún test en jsdom lo
detecta**. Si vas a meter un componente dentro, pásale `component="div"`.

Pasó dos veces en el incremento 5, una de ellas en este mismo `DataTable`.

## Regla

`shared/ui` no importa nada de `entities/`, `features/` ni `pages/`. El linter lo verifica.
