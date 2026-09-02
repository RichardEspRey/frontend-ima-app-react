# 0009 · Que un fallo no se lleve por delante toda la aplicación

**Fecha:** 2026-09-02 · **Estado:** aceptada

## Contexto

Se pidió que si algo falla no rompa todo lo demás, que se muestre algo entendible y que la
aplicación siga funcionando. Al medirlo, el estado real era peor de lo que parecía:

- **El `ErrorBoundary` existía y no se usaba en ningún sitio.** Un error de render en
  cualquier pantalla dejaba la ventana en blanco. En el navegador se recarga; en la app de
  escritorio **no hay barra de direcciones**, así que la única salida era cerrar y volver a
  abrir.
- **Una consulta que fallaba en una pantalla que no mira su `error` no decía nada.** La
  persona veía una tabla vacía, sin saber si no hay datos o si la petición se cayó, que son
  cosas muy distintas.
- **No había ningún manejador global.** Una promesa rechazada sin `catch` solo llegaba a la
  consola, que nadie mira.
- Las pantallas que sí mostraban el error enseñaban `error.message` crudo y **sin botón de
  reintentar**, así que la única salida era navegar a otro lado y volver.
- Tres sitios leían `json.data.x` sin comprobar que `data` existiera. Iban dentro de un
  `try/catch`, así que no rompían nada visible: **perdían el dato en silencio**.

## Decisión

Cuatro capas, de la más cercana al fallo a la más lejana:

1. **`EstadoError`** — el hueco que ocupa una sección cuando sus datos no llegaron. Dice
   qué pasó, **qué se puede hacer** —que es lo que un mensaje de error suele omitir— y trae
   el botón para hacerlo. El detalle técnico está, pero plegado.
2. **`ErrorBoundary`, ahora montado** dentro del layout, alrededor del contenido de la
   página. El menú y la cabecera sobreviven al fallo, así que se puede navegar a otro lado
   sin reiniciar. **Olvida el error al cambiar de pantalla**: sin eso, un fallo dejaba el
   mensaje puesto para siempre, que es lo que convierte "esta pantalla falló" en "la
   aplicación se rompió".
3. **`QueryCache.onError`** — ninguna consulta falla ya en silencio, aunque la pantalla no
   mire su `error`. No sustituye al estado de la pantalla: es la red por debajo.
4. **Manejadores globales** de `unhandledrejection` y `error`, para la franja que queda
   fuera de React.

### Dos reglas que salieron de equivocarme

**Un aviso de fondo no puede bloquear.** Enganché los fallos globales a `notify.error`, que
es un diálogo con botón. Al probarlo, una caída de red tapaba la pantalla con un modal que
había que descartar para poder seguir trabajando con lo que sí había cargado. Se añadió
`notify.discreto`: arriba a la derecha y se va solo. El diálogo se queda para lo que la
persona **acaba de pulsar**; ahí sí hay que enterarse antes de seguir.

**Un mismo fallo no debe avisar seis veces.** Una pantalla con seis consultas contra un
servidor caído produce seis rechazos idénticos en el mismo segundo. Hay un solo punto de
salida —`avisarDeFallo`— con una ventana de silencio de 5 s por mensaje. Que sea uno solo
es lo que hace que la deduplicación funcione.

### Lo que no se hizo

Las **cancelaciones no se avisan**. Cambiar de pantalla con una petición en vuelo produce un
rechazo que no es un fallo; avisar de eso sería ruido constante.

`AvisoParcial` se escribió y se borró: el único caso que lo justificaba —el tipo de cambio
que no se pudo consultar— ya estaba resuelto, porque la tabla de gastos informa cuántos
registros quedaron sin convertir. No se deja código sin uso esperando a un caso futuro.

## Consecuencias

- Se comprobó rompiendo una pantalla a propósito: el fallo queda contenido, el menú sigue
  vivo, y se sale navegando.
- Quedan pantallas que siguen sin mirar su `error`. Ya no fallan en silencio gracias a la
  capa 3, pero enseñan una tabla vacía en vez de un estado de error. Se van conectando a
  `EstadoError` según se toquen.
- **Una lección sobre las pruebas:** el fallo de `notify.discreto` —una abreviatura de
  objeto que referenciaba una variable inexistente— no lo vio ninguna prueba, porque todas
  simulaban `notify`. Solo apareció al usarlo en el navegador. Ahora `notify.discreto` tiene
  pruebas propias contra el `Swal.fire` simulado, que es el límite correcto.
