# 0007 · Un sistema de diseño en vez de 1 212 colores sueltos

**Fecha:** 2026-09-02 · **Estado:** aceptada

## Contexto

Se pidió que el aspecto del **Administrador de viajes** y del **Expense Manager** se
aplicara a toda la app, sin tocar el funcionamiento.

Al medirlo apareció la causa real de que las pantallas no se parecieran:

- **No había ningún tema de MUI.** Cada componente usaba sus valores por omisión: el azul
  `#1976d2`, las esquinas de 4 px, los botones en MAYÚSCULAS.
- Por eso, las pantallas que sí se veían bien lo conseguían **escribiendo el color a mano
  en cada `sx`**. De ahí salían **1 212 colores** repartidos por el código.
- Ya existía un `shared/ui/estilos.js` con el lenguaje correcto, pero **ni siquiera estaba
  exportado** en el índice, y solo 4 pantallas lo usaban.
- Dentro de ese desorden había errores que nadie podía ver: la barra lateral tenía **dos
  colores de hover que se diferenciaban en un dígito** (`#4F5DDA` y `#4f5bda`), así que
  cambiaba de tono según por dónde pasara el ratón.

## Decisión

Tres piezas, de la más general a la más concreta:

1. **`shared/ui/tokens.js`** — la paleta con nombre. `COLOR` para la escala neutra y los
   estados; `TINTE` para las categorías; `MARCA` para el azul de la barra lateral.
2. **`app/tema.js`** — un tema de MUI construido con esos tokens, puesto en la raíz. Es lo
   que homogeneiza **sin tocar archivo por archivo**: una pantalla no migrada ya hereda la
   tipografía, el radio, los bordes y el color de marca. Los `sx` sueltos siguen ganando,
   así que ponerlo no rompe lo que ya estaba bien.
3. **`shared/ui/estilos.js`** — los mismos presets de antes, ahora construidos con tokens
   en vez de literales. Conserva todos los nombres, así que los 25 archivos que ya lo
   usaban no cambian.

La migración de los colores se hizo en **cuatro pasadas separadas a propósito**, para poder
verificar cada una por su cuenta:

| Pasada | Qué hizo | ¿Cambia el aspecto? |
|---|---|---|
| Idénticos | 785 colores que ya eran el valor del token | **No.** Solo les pone nombre |
| Vecinos | 98 grises sueltos de MUI a la escala neutra | Sí, mínimo |
| Acentos | 259 azules, rojos, verdes y ámbares dispersos a los colores de estado | Sí, es el objetivo |
| CSS | 42 colores en las 7 hojas sueltas, a variables CSS | Sí, arregla el hover doble |

## Lo que NO se unificó, y por qué

**Donde el color es información, no decoración.** Unificarlo borraría el dato:

- La paleta categórica de las unidades en el mapa (`entities/tracking`).
- Los colores por categoría de documento: USA azul, MEX verde (`entities/unit`).
- Los tintes de inventario: Refacciones, Consumibles, Herramientas, Básicos.

A los tintes sí se les dio nombre (`TINTE.INDIGO`, `TINTE.TEAL`, …) y una **forma común**
—fondo muy claro, texto oscuro, borde intermedio, acento—, de modo que toda categoría de
la app se construya igual aunque su color sea distinto.

**El azul de la barra lateral tampoco se unificó.** Una navegación de color sobre un lienzo
neutro es una decisión de diseño, no un descuido. Lo que se arregló es que haya **un** azul
de cada cosa.

## Consecuencias

- De **1 212 colores sueltos a 250**, y 40 de esos son la definición de los tokens, que es
  donde deben estar. El resto son las paletas categóricas de arriba.
- Cambiar la paleta de la app es hoy **editar un archivo**.
- Las pantallas sin migrar mejoran solas al heredar el tema.
- Quedan **7 hojas `.css`** con `var(--ima-*)` de `shared/ui/tokens.css`. Es un puente:
  cuando esos componentes terminen de pasar a MUI, ese archivo desaparece. Mientras exista,
  un valor cambiado hay que cambiarlo en los dos sitios.
- Dos pruebas que fijaban el tono exacto (`#16a34a`, `#d32f2f`) ahora comprueban el token.
  Es lo correcto: lo que importa es que un viaje completado se vea verde, no el hexadecimal.
