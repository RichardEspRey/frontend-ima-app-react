# 0010 · No cambiar de librería de componentes; quitar las que sobran

**Fecha:** 2026-09-02 · **Estado:** aceptada

## Contexto

Se planteó evaluar Chakra UI —o cualquier librería moderna de React— para mejorar la
consistencia visual del sistema. La pregunta detrás era buena: *«MUI interfiere con los
estilos».*

Al medirlo, resultó que MUI **no** es la fuente de la inconsistencia. Otra cosa sí lo es.

## Lo que dicen los números

### Cuánto MUI hay

| | |
|---|---:|
| Archivos que importan `@mui/material` | **155 de 380** (41 %) |
| Componentes distintos en uso | **62** |
| Importaciones de iconos | 337, en 107 archivos |

### Y aquí está el hallazgo

**El proyecto ya tiene seis librerías de interfaz compitiendo entre sí:**

| Librería | Archivos | Con qué compite |
|---|---:|---|
| `@mui/material` | 155 | — |
| `sweetalert2` | 28 | Diálogos y avisos de MUI |
| `react-select` | 11 | `Autocomplete` y `Select` de MUI |
| `react-datepicker` | 9 | Campos de fecha de MUI |
| `react-toastify` | 3 | Avisos de sweetalert2 |
| `@pablotheblink/flashyjs` | 2 | Avisos de las otras dos |
| `react-icons` | 1 | `@mui/icons-material` |

**31 archivos mezclan dos o más de ellas.** Uno mezcla las tres librerías de notificación a
la vez.

Esa es la inconsistencia. No es que MUI imponga un aspecto: es que en la misma pantalla
conviven un `Select` de MUI y uno de `react-select`, con distinto foco, distinto teclado y
distinto aspecto, y ningún tema puede arreglar eso porque son sistemas separados.

## Lo que se evaluó

Criterios que importan **en este proyecto**, que no son los de cualquier proyecto:

- **Es una app de escritorio en Electron.** El peso del paquete es casi irrelevante: la
  instalación pesa 128 MB de todos modos y no se descarga en cada visita. El argumento
  número uno para cambiar de librería —el tamaño del *bundle*— **aquí no aplica**.
- **Es densa en datos.** 34 archivos con tablas, de 8 a 11 columnas, con cabecera fija,
  paginación y filas expandibles.
- **El equipo son dos personas.**

| Opción | Cubre lo que hace falta | Costo real | Veredicto |
|---|---|---|---|
| **Chakra UI** | No trae tabla de datos, ni selector de fecha, ni gráficas | Reescribir 155 archivos **y** buscar tres librerías más para lo que falta | Empeora el problema que se quiere resolver |
| **shadcn/ui** | Aspecto muy moderno; se copia el código, no se instala | Exige Tailwind y reescribir todo; la tabla se arma con TanStack Table a mano | Excelente para empezar de cero, no para migrar |
| **Mantine** | La más parecida en cobertura: tablas, fechas, gráficas, formularios | Es el único cambio realista, pero siguen siendo 155 archivos | Sería el candidato si hubiera que cambiar |
| **Ant Design** | Tablas muy completas | Aspecto muy marcado; costaría más igualarlo al diseño actual que mantenerlo | No |
| **Quedarse con MUI** | Ya cubre todo lo que la app usa | Cero | **Elegido** |

### Por qué el cambio no resuelve el problema

Cualquier migración deja el sistema **con dos librerías conviviendo durante meses**, que es
exactamente la inconsistencia que se quiere eliminar. Se pagaría el costo para reintroducir
el problema mientras dura.

Y el problema real —seis librerías compitiendo— **seguiría ahí**, porque cambiar MUI por
Chakra no quita ni `sweetalert2`, ni `react-select`, ni `react-datepicker`.

## Decisión

**No se cambia de librería. Se quitan las que sobran, y se envuelve la que queda.**

### 1 · Una sola librería base

MUI se queda. Ya cubre los 62 componentes que la app usa, el tema ya la tiene obedeciendo
—ver [`0007`](0007-sistema-de-diseno.md)— y no hay ninguna capacidad que le falte a esta
aplicación.

### 2 · Retirar las cinco que compiten

En este orden, de más fácil a más difícil. **Las tres primeras ya están hechas** — ver los
commits `ce8b589` y `b50d15b`.

| Orden | Qué se quita | Se reemplaza por | Archivos |
|---|---|---|---:|
| 1 | ~~`react-icons`~~ **hecho** | `@mui/icons-material` | 1 |
| 2 | ~~`@pablotheblink/flashyjs`~~ **hecho** — no se usaba | — | 0 |
| 3 | ~~`react-toastify`~~ **hecho** | `notify.discreto` | 3 |
| 4 | ~~`react-datepicker`~~ **hecho** | `CampoFecha` sobre el campo nativo | 9 |
| 5 | ~~`react-select`~~ **hecho** | `SelectorBusqueda` sobre `Autocomplete` | 11 |
| 6 | ~~`sweetalert2`~~ **hecho** | `notify` sobre `Dialog` y `Snackbar` de MUI | 25 |

**Las seis están hechas.** La sexta costó más de lo que anuncié: dije que sería «cambiar un
archivo, no 28» porque `notify` ya envolvía sweetalert2, pero **había 120 llamadas directas
a `Swal.fire` en 25 archivos** que nunca habían pasado por la envoltura. La envoltura no
sirve de nada si no es el único camino.

Por eso se hizo en dos pasos separados y verificables: primero **rutar todo por `notify`**
sin cambiar de librería, y solo entonces cambiar lo que hay debajo. El primer paso deja el
sistema funcionando igual y se puede revertir solo; el segundo toca un módulo.

### 3 · Envolver la que queda

Es lo que ya empezamos con `Pestanas` y `Selector`, y funciona: **importar el control de
MUI directamente es un error de linter**, y el estilo vive en un componente en vez de en una
guía que alguien tiene que recordar.

El cerco se extiende a los controles con aspecto propio: `Chip`, `Dialog`, `Button`,
`TextField`, `Select`. Los primitivos de composición —`Box`, `Stack`, `Typography`, `Grid`—
se quedan libres: no tienen aspecto propio que defender y envolverlos sería ceremonia sin
beneficio.

## Consecuencias

- **Se gana casi todo lo que daría cambiar de librería, sin cambiar de librería.** Fuera de
  `shared/ui`, nadie puede desviarse del estilo; el aspecto se define en un sitio.
- **La puerta queda abierta.** Si algún día conviene cambiar —o si MUI toma una dirección
  que no nos sirva— solo hay que reescribir `shared/ui`, no las 47 pantallas. Ese es el
  verdadero valor de envolver: convierte una decisión irreversible en una reversible.
- **De 7 librerías de interfaz a 2** (MUI y sus iconos), y de 31 archivos mezclando a cero.
  Conseguido: quedan `@mui/material` y `@mui/icons-material`.
- El aspecto no cambia por esta decisión. Lo que cambia es que deje de haber dos formas de
  hacer cada cosa.

## Cómo se sustituye un control sin romper el envío

Lo aprendido al quitar `react-select`, que aplica a cualquier sustitución de un control de
formulario:

**Lo que hay que preservar es el contrato del valor, no la apariencia.** Las pantallas
guardaban la opción entera y sacaban el dato después: `pais: country?.value`. Un reemplazo
que entregara `"MX"` en vez de `{value:"MX", label:"México"}` habría hecho que ese acceso
diera `undefined`; la capa de API omite los `undefined`, y **el gasto se habría guardado sin
país sin que nadie viera un error**.

**La verificación que de verdad prueba que nada se rompió no es una prueba unitaria: es
capturar el envío real.** Se interceptó `fetch` en el navegador para leer el `FormData` sin
dejarlo salir —así que no se guardó nada—, se llenó el mismo formulario antes y después, y
se compararon los dos cuerpos campo por campo.

**Y a veces la respuesta no es la librería del sistema.** Para las fechas, `@mui/x-date-pickers`
no estaba instalado: habría sido **agregar una dependencia para quitar otra**, ganancia cero.
El campo de fecha del navegador no agrega nada, y además era lo que la app ya usaba en **15
archivos** frente a los 9 de `react-datepicker`. La opción correcta no siempre es la de la
misma familia.

**Y hay que buscar la capacidad que se va a perder.** `react-select/creatable` permite crear
compañías y bodegas escribiendo en el campo, y eso se usa de verdad en los formularios de
viaje. Reemplazarlo sin reproducirlo habría dejado a la operación sin poder dar de alta un
destino nuevo.

**Una API imperativa necesita un puente, no un componente.** `notify` se llama desde un
`catch`, desde el manejador global de errores y desde hooks: sitios que no son componentes y
que no pueden devolver JSX. La solución es partirlo en dos: un módulo que **encola** —al que
puede llamar cualquiera— y un componente montado una sola vez que **pinta** lo que hay en la
cola. Sin esa separación, quitar una librería de diálogos obliga a convertir en componente
cada sitio que la llamaba.

**Al quitar una librería se poda el árbol de dependencias, y ahí salen los polizones.** El
build se rompió al desinstalar sweetalert2: `date-fns` lo usan **15 archivos** sin estar
declarado en `package.json`: vivía de ser dependencia transitiva de otra cosa. Funcionaba
por accidente y habría fallado igual en cualquier instalación limpia.

## Lo que se cerró de paso: el HTML sin escapar

Los avisos con negritas o listas se armaban concatenando etiquetas y se le pasaban a la
librería como `html`. Eso era **la única puerta de XSS de la aplicación**, y no era teórica:
tres de esos cinco avisos metían dentro de la cadena el **nombre de archivo que devuelve el
servidor**.

No se reprodujo. `formato` se sustituyó por `detalle`, que son **datos** —una lista de
puntos, o renglones con su total— que React escapa por su cuenta:

```js
notify.conDetalle({ lista: errores }, 'Revisa los datos', 'warning')

notify.confirmar({
  titulo: '¿Autorizar Pago?',
  detalle: {
    renglones: [{ etiqueta: 'Tarifa', valor: '$2.10' }],
    total: { etiqueta: 'Total', valor: '$3,594.65' },
  },
})
```

Es también la razón por la que la regla `no-restricted-syntax` que prohíbe
`dangerouslySetInnerHTML` —ver [`0006`](0006-seguridad-en-el-front.md)— **sigue en pie sin
una sola excepción**. La regla hizo su trabajo: falló el lint, y la salida fácil habría sido
silenciarla en una línea.

## Cuándo reconsiderar

Esta decisión se revisa si ocurre alguna de estas tres:

1. **MUI deja de mantenerse** o publica una versión mayor que rompa el tema.
2. Aparece una **necesidad que MUI no cubra** y que la envoltura no pueda resolver.
3. El proyecto deja de ser una app de escritorio y **el peso del paquete empieza a
   importar**. Hoy no importa; en la web sí importaría.

Mientras ninguna ocurra, cambiar de librería es costo sin beneficio.
