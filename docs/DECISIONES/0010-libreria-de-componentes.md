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

En este orden, de más fácil a más difícil:

| Orden | Qué se quita | Se reemplaza por | Archivos |
|---|---|---|---:|
| 1 | `react-icons` | `@mui/icons-material` | 1 |
| 2 | `@pablotheblink/flashyjs` | `shared/ui/notify` | 2 |
| 3 | `react-toastify` | `notify.discreto` | 3 |
| 4 | `react-datepicker` | Campo de fecha de MUI, envuelto | 9 |
| 5 | `react-select` | `Autocomplete` de MUI, envuelto | 11 |
| 6 | `sweetalert2` | Ya está detrás de `shared/ui/notify` | 28 |

Los tres primeros son trabajo de una tarde. El sexto ya está medio hecho: `notify` envuelve
sweetalert2, así que quitarla es cambiar un archivo, no 28.

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
- El aspecto no cambia por esta decisión. Lo que cambia es que deje de haber dos formas de
  hacer cada cosa.

## Cuándo reconsiderar

Esta decisión se revisa si ocurre alguna de estas tres:

1. **MUI deja de mantenerse** o publica una versión mayor que rompa el tema.
2. Aparece una **necesidad que MUI no cubra** y que la envoltura no pueda resolver.
3. El proyecto deja de ser una app de escritorio y **el peso del paquete empieza a
   importar**. Hoy no importa; en la web sí importaría.

Mientras ninguna ocurra, cambiar de librería es costo sin beneficio.
