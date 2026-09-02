# 0008 · Esqueletos en lugar de spinners, pero no en todas partes

**Fecha:** 2026-09-02 · **Estado:** aceptada

## Contexto

Había **130 `CircularProgress` en 55 archivos** y cero esqueletos. El problema no es que un
spinner sea feo: es que **no dice nada**. Un círculo girando en mitad de la pantalla informa
de que hay que esperar, pero no de qué va a llegar ni de cuánto va a ocupar. Cuando llegan
los datos, el spinner de 40 px se sustituye por una tabla de diez filas y **todo salta**.

## Decisión

Un módulo `shared/ui/carga.jsx` con cuatro piezas, cada una con la forma de lo que va a
reemplazar: `FilasEsqueleto` para el cuerpo de una tabla, `TarjetasEsqueleto` para una lista
o rejilla, `BloqueEsqueleto` para una gráfica o un panel, y `PantallaEsqueleto` para el
primer pintado de una pantalla entera.

### Un spinner no siempre está mal

**Se cambian los de contenido; se conservan los de acción.** Son cosas distintas:

- **Contenido que va a llegar** → esqueleto. Se sabe qué forma tendrá, así que se puede
  reservar el sitio.
- **Una acción en curso** —guardar, subir, borrar, calcular una ruta, leer un PDF— →
  spinner. Ahí no llega contenido a ese hueco: lo que pasa es que algo está trabajando, y
  un esqueleto mentiría sobre lo que va a aparecer.

Por eso quedan 53 `CircularProgress` en el proyecto, y están bien: casi todos dentro del
`startIcon` de un botón.

### Tres detalles que no son de adorno

- **`AnuncioCarga`**: un esqueleto es una pista **visual**. Quien navega con lector de
  pantalla no ve nada y se queda sin saber que la app está trabajando. Cada esqueleto lleva
  un `role="status"` que no se ve pero sí se lee — y es también lo que buscan las pruebas.
- **Anchos en `em`, no en porcentaje**: mientras carga no hay datos, así que las columnas
  se encogen al ancho de su encabezado, y un 70 % de la columna «ID» es una astilla de
  cuatro píxeles. En `em` la barra mide lo que medirá el texto.
- **El número de filas y el alto de la celda**: si el esqueleto es más corto o más bajo que
  lo que llega, el salto vuelve, solo que más pequeño. Las tablas le pasan su tamaño de
  página real.

### `useCargaVisible`

Existe pero **no se aplica por omisión**. Separa "está cargando" de "hay que avisar que está
cargando": por debajo de 250 ms el esqueleto aparecería y desaparecería antes de que a nadie
le diera tiempo de leerlo, y ese parpadeo se percibe como un error. Está disponible para las
pantallas rápidas; la bajada siempre es inmediata.

## Consecuencias

- El `DataTable` compartido lo hereda todo, así que las pantallas que ya lo usan cambian
  solas.
- Quedan tablas propias que no pasan por `DataTable` y tuvieron que conectarse a mano. Cada
  una que se migre al componente compartido es una menos.
- Salió a la luz un fallo de antes: `Sidebar` leía `data.Users[0]` sin comprobar que
  `Users` existiera. Estaba dentro de un `try/catch`, así que no rompía nada visible — solo
  perdía en silencio los contadores del menú. Quedan otros dos del mismo tipo, en
  `EditarOrdenPage` y `TicketPagoPage`, que se atienden en el trabajo de errores.
