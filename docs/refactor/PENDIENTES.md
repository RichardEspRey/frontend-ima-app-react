# Pendientes con medición

> Cosas que faltan por hacer, cada una con lo que ya se midió para que quien la retome no
> tenga que volver a investigar. **Ninguna está empezada.**
>
> Lo que ya está decidido pero no ejecutado vive en otro sitio:
> `../NOTAS-PIPELINE-ACTUALIZACIONES.md` para el pipeline de Windows, y
> `08-DIAGNOSTICO-BD.md` para las fases 2 y 3.

---

## 1 · Paginar la tabla de Inspecciones de Camiones

**Pantalla:** `/Inspeccion-final` · `pages/mantenimientos/InspeccionFinalPage.jsx:238`

Hoy pinta `filteredRows.map(...)` **sin ningún límite**. Cada fila que entre a la base se
pinta en el DOM. Con las 471 filas de `conteo_inspecciones` en producción, la pantalla ya
está en el rango donde el navegador empieza a arrastrarse, y no hay nada que lo frene.

**No está sola.** Estas tampoco paginan:

| Archivo | Qué pinta |
|---|---|
| `pages/mantenimientos/InspeccionFinalPage.jsx` | Inspecciones de camiones ← **la reportada** |
| `features/inspections/ui/TablaInspecciones.jsx` | Inspecciones operativas |
| `features/inspections/ui/TablaReparaciones.jsx` | Reparaciones en ruta |
| `pages/mantenimientos/InspeccionesPage.jsx` | Inspecciones |
| `pages/mantenimientos/ReparacionesRutaPage.jsx` | Reparaciones |

Las de arriba son de bajo volumen hoy —3 y 5 filas en la base— pero el problema es el
mismo y crece solo.

### Cómo hacerlo

**No agregando `TablePagination` a mano en cada una.** Eso repetiría por sexta vez el
patrón que `shared/ui/DataTable` ya resuelve: pagina, ordena, y trae los estados de carga,
error y vacío. Migrar `InspeccionFinalPage` a `DataTable` resuelve la paginación **y** de
paso le da el esqueleto de carga y el ordenamiento por columna, que hoy no tiene.

Si alguna no encaja en `DataTable`, la respuesta es ampliarlo, no rodearlo — igual que con
`Pestanas` y `Selector`. Ver `../ESTANDAR-DE-INGENIERIA.md`.

**Esfuerzo:** una tarde por pantalla. La primera cuesta más porque hay que comprobar que
`DataTable` cubre lo que la pantalla hacía.

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

## 3 · Botón de idioma (español / inglés)

Posible, pero es el más caro de los tres. Y al medirlo salió algo que hay que decidir antes.

### El hallazgo: la interfaz ya está en dos idiomas

No es que esté en español y haya que traducirla. **Está mezclada hoy**, en la misma
pantalla:

| | Cuántas |
|---|---:|
| Cabeceras de tabla en inglés | 62 |
| Cabeceras de tabla en español | 99 |

En una sola tabla conviven `Trip Number`, `Total Rate` y `Total Pagado`. Hay pantallas con
`Actions` y `Acciones`, `Driver` y `Conductor`, `Status` y `Estatus`. La paginación dice
`Rows per page` en unas y `Filas por página` en otras.

**Eso significa que el botón de idioma arreglaría un problema que existe hoy**, no solo
agregaría una función. Es un argumento a favor más fuerte que el de "estaría bien tenerlo".

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

### Cómo hacerlo

1. Elegir librería. `react-i18next` es la estándar y encaja sin fricción.
2. **Empezar por unificar**, no por traducir: fijar un idioma por defecto y arreglar las
   mezclas de hoy. Eso ya mejora la app aunque el botón nunca llegue.
3. Extraer los textos a catálogos, módulo por módulo, aprovechando que se toque cada uno.
4. El botón al final, cuando haya dos catálogos completos.

**Esfuerzo:** una semana larga para la interfaz. Los valores del backend, aparte.

---

## Orden sugerido

1. **Paginar las tablas.** Es el único de los tres que corrige un problema que ya está
   pasando, y el más barato.
2. **Unificar el idioma de la interfaz** aunque no se ponga el botón. Arregla una
   inconsistencia real y es prerrequisito de lo demás.
3. **Modo oscuro**, si alguien lo va a usar.
4. **El botón de idioma**, al final: es el que más trabajo pide y el único que no arregla
   nada que hoy esté roto.
