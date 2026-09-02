# Pendientes con medición

> Cosas que faltan por hacer, cada una con lo que ya se midió para que quien la retome no
> tenga que volver a investigar.
>
> Lo que ya está decidido pero no ejecutado vive en otro sitio:
> `../NOTAS-PIPELINE-ACTUALIZACIONES.md` para el pipeline de Windows, y
> `08-DIAGNOSTICO-BD.md` para las fases 2 y 3.

---

## 1 · Paginar la tabla de Inspecciones de Camiones — HECHO

**Pantalla:** `/Inspeccion-final` · `pages/mantenimientos/InspeccionFinalPage.jsx:238`

Pintaba `filteredRows.map(...)` **sin ningún límite**: cada fila que entrara a la base iba
al DOM. Con las 471 filas de `conteo_inspecciones` en producción, la pantalla ya estaba en
el rango donde el navegador empieza a arrastrarse.

**No estaba sola.** Estas tampoco paginaban:

| Archivo | Qué pinta |
|---|---|
| `pages/mantenimientos/InspeccionFinalPage.jsx` | Inspecciones de camiones ← **la reportada** |
| `features/inspections/ui/TablaInspecciones.jsx` | Inspecciones operativas |
| `features/inspections/ui/TablaReparaciones.jsx` | Reparaciones en ruta |
| `pages/mantenimientos/InspeccionesPage.jsx` | Inspecciones |
| `pages/mantenimientos/ReparacionesRutaPage.jsx` | Reparaciones |

Las de arriba son de bajo volumen hoy —3 y 5 filas en la base— pero el problema es el
mismo y crece solo.

### Cómo se resolvió

**No con `DataTable`.** Estas filas son expandibles —`InspeccionRow` abre un detalle— y
`DataTable` pinta celdas a partir de descriptores de columna, así que no las soporta.
Forzarlas habría sido rodear el componente en vez de usarlo.

Se extrajo `usePaginacion` + `Paginacion` a `shared/ui`, que sirve tanto a las tablas que
encajan en `DataTable` como a las que tienen filas propias. Eran **catorce pantallas
repitiendo la misma lógica a mano**, y ese copiado es justamente el que deja tablas sin
paginar: si hay que escribirlo cada vez, alguna se queda sin él.

De paso corrige un fallo que estaba en varias copias: al filtrar, la página actual podía
quedar más allá del final y se veía una tabla vacía con datos que sí existían. Ahora la
página se acota al último trozo con filas.

Quedaron paginadas `InspeccionFinalPage`, `TablaInspecciones` y `TablaReparaciones`. Las
otras dos de la lista —`InspeccionesPage` y `ReparacionesRutaPage`— resultaron ser solo
contenedores que montan esas tablas, así que eran tres sitios y no cinco.

**Pendiente menor:** las once pantallas que ya paginaban siguen con su copia a mano. No
están rotas, así que se migran a `usePaginacion` según se toque cada una.

---

## 2 · Modo oscuro

**Sí es posible, y el trabajo pesado ya está hecho.** El sistema de diseño de
[`0007`](../DECISIONES/0007-sistema-de-diseno.md) es exactamente lo que hacía falta: sin
tokens ni tema, esto habría sido inviable.

### Lo que ya juega a favor

- El tema de MUI existe y declara `mode`. Cambiarlo es un parámetro.
- La paleta está en un solo archivo con nombres **por papel y no por apariencia** —
  `COLOR.TINTA`, no `COLOR.NEGRO`—, que es justo lo que permite darles otro valor en
  oscuro sin que el nombre mienta.
- Las 8 hojas `.css` sueltas ya usan `var(--ima-*)`, así que se redefinen con un selector.
- El menú lateral **ya es oscuro**: media pantalla no cambia.

### Lo que falta, medido

| Obstáculo | Cuánto |
|---|---:|
| Usos de `COLOR.BLANCO` que asumen fondo claro | 76 |
| Usos de `COLOR.LIENZO` | 96 |
| Colores literales que aún no son token | 215 |

Los 215 literales son el trabajo real. La mayoría son las paletas categóricas —mapas,
gráficas, tintes— que **a propósito no se unificaron**, y varias necesitan una versión
oscura porque un fondo `#f0fdfa` sobre lienzo oscuro se ve como un error.

### Cómo hacerlo

1. Convertir `COLOR` en **dos paletas** con las mismas claves, y que el tema elija según el
   modo. Ningún componente cambia: siguen pidiendo `COLOR.LIENZO`.
2. Auditar los 76 `COLOR.BLANCO`: cuáles significan "papel" —y deben oscurecerse— y cuáles
   significan "blanco de verdad", como el texto sobre el botón oscuro.
3. Dar versión oscura a los tintes categóricos y a `SERIE`.
4. Redefinir las variables CSS bajo el selector del modo.
5. Guardar la preferencia y respetar la del sistema operativo.

**Esfuerzo:** dos o tres días bien hechos. El riesgo no es técnico sino de detalle: se
escapa siempre algún contraste, y solo se ve mirando.

**Antes de empezar conviene preguntar** si alguien lo va a usar. En una app de escritorio
que se usa de día en oficina, el modo oscuro a veces es una función que nadie enciende.

---

## 3 · Botón de idioma (español / inglés) — mecanismo hecho, textos a medias

Posible, pero es el más caro de los tres. Y al medirlo salió algo que hay que decidir antes.

### La mezcla, que ya se arregló

No era que estuviera en español y hubiera que traducirla. **Estaba mezclada dentro de la
misma pantalla:**

| | Cuántas |
|---|---:|
| Cabeceras de tabla en inglés | 62 |
| Cabeceras de tabla en español | 99 |

En una sola tabla conviven `Trip Number`, `Total Rate` y `Total Pagado`. Hay pantallas con
`Actions` y `Acciones`, `Driver` y `Conductor`, `Status` y `Estatus`. La paginación dice
`Rows per page` en unas y `Filas por página` en otras.

**Eso se resolvió aparte del botón**, porque era un problema por sí mismo.

La regla que decidió Emiliano el 2026-09-02:

> **Los sustantivos del oficio van en inglés; todo lo demás en español.**

`Trip` y `Driver` se quedan en inglés porque es como se habla en el transporte de carga en
la frontera y como los nombra el backend. `Estatus` en español, reservando `Estado` para su
sentido geográfico en IFTA, que es donde de verdad significa entidad federativa.

El vocabulario vive en `shared/lib/terminos.js`, que **es la semilla del catálogo de
traducción**: sus claves describen el concepto, no el texto, así que cuando llegue el botón
solo hay que darles una segunda versión.

### Lo que falta, medido

- **No hay ninguna librería de i18n** instalada.
- Unos **352 textos** en JSX, sin contar los que se arman con plantillas.
- Los textos viven **dentro de los componentes**, así que hay que extraerlos uno por uno.
- Hay textos que vienen **del backend** —estatus como `In Transit`, `Almost Over`,
  `Completed`; tipos de gasto; nombres de requisitos— y **esos no los arregla el front**.
  Traducirlos exige un catálogo de traducción por valor, o cambiarlos en la base.

Ese último punto es el que decide el alcance real: se puede traducir la interfaz y dejar
los datos como están —que es lo honesto y lo barato— o traducir también los valores, que ya
toca la fase 3.

### Cómo se hizo

**Sin librería de i18n.** Al medirlo salieron **cero** textos con interpolación y **cuatro**
casos de plural. Para dos idiomas y textos planos, `react-i18next` era un martillo para un
clavo, y `docs/DECISIONES/0010` acababa de reducir de siete librerías a dos: agregar una
octava para esto habría sido contradecirnos.

`shared/i18n` son unas 40 líneas propias: catálogo, contexto y el hook `useIdioma`.

**Se reconsidera** si aparece un tercer idioma, o si alguien fuera del equipo va a traducir
con herramientas estándar.

### Lo que ya funciona

- El botón, en el header junto al nombre y el rol.
- La preferencia se recuerda entre sesiones, y se ignora si el valor guardado no es un
  idioma que la app conozca.
- Una prueba impide que un catálogo se quede atrás del otro, que es lo que produce esas
  pantallas mitad traducidas.
- Conectados: la paginación, los estados de carga y error, y **33 cabeceras de tabla** en
  11 archivos.

### Lo que falta

**Unos 520 textos siguen fijos** dentro de los componentes: títulos de pantalla, botones,
etiquetas de formulario, mensajes de diálogo. Se van extrayendo módulo por módulo,
aprovechando que se toque cada uno; el catálogo y el hook ya están.

Y lo decidido: **los valores que vienen del backend se quedan como están.** `In Transit`,
`Almost Over`, `Completed` y los tipos de gasto no los traduce el front.

---

## Orden sugerido

1. **Paginar las tablas.** Es el único de los tres que corrige un problema que ya está
   pasando, y el más barato.
2. **Unificar el idioma de la interfaz** aunque no se ponga el botón. Arregla una
   inconsistencia real y es prerrequisito de lo demás.
3. **Modo oscuro**, si alguien lo va a usar.
4. **El botón de idioma**, al final: es el que más trabajo pide y el único que no arregla
   nada que hoy esté roto.
