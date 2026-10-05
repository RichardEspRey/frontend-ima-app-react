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

## 3 · Botón de idioma (español / inglés) — el idioma YA está unificado

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

### Cómo hacerlo

1. Elegir librería. `react-i18next` es la estándar y encaja sin fricción.
2. **Empezar por unificar**, no por traducir: fijar un idioma por defecto y arreglar las
   mezclas de hoy. Eso ya mejora la app aunque el botón nunca llegue.
3. Extraer los textos a catálogos, módulo por módulo, aprovechando que se toque cada uno.
4. El botón al final, cuando haya dos catálogos completos.

**Esfuerzo:** una semana larga para la interfaz. Los valores del backend, aparte.

---

## 4 · Ocho entidades construidas que ninguna pantalla usa

**Medido el 2026-10-05** con `npm run estandar:medir`, sección 2.

Los incrementos 9a, 9b, 9c, 10 y 11 crearon la entidad —esquema, reglas, peticiones, hooks y
pruebas— pero las pantallas siguieron con su propio `fetch`. El resultado es lo peor de los
dos mundos: el código nuevo existe, se mantiene y se prueba, y la pantalla no se beneficia
de nada (ni caché, ni cancelación, ni validación, ni reintento).

| Entidad | Pantallas que deberían usarla | Lo que hoy hacen |
|---|---|---|
| `autonomy` | `pages/mantenimientos/AutonomiaPage.jsx` | `fetch` a `autonomia.php` |
| `finance` | `pages/finanzas/FinanzasPage.jsx`, `PagosConductoresPage.jsx`, `TarifasConductorPage.jsx` | `fetch` a `formularios.php` |
| `ifta` | `pages/safety/IftaPage.jsx` | `fetch` a `IFTA.php` |
| `inspection` | `features/inspections/ui/TablaInspecciones.jsx`, `InspeccionModal.jsx` | `fetch` a `inspecciones.php` |
| `inventory` | `features/service-order/ui/TablaInventario.jsx` | `fetch` a `inventory.php` |
| `roadside-repair` | `features/inspections/ui/TablaReparaciones.jsx`, `ReparacionModal.jsx` | `fetch` a `roadside_repairs.php` |
| `safety` | `pages/safety/SafetyPage.jsx` | `fetch` a `safety.php` |
| `tuning` | `pages/mantenimientos/AfinacionesPage.jsx`, `AfinacionesHistorialPage.jsx` | `fetch` a `afinaciones.php` |

`service-order` está a medias: `TablaOrdenes.jsx` usa sus reglas (`nombreUnidad`,
`etiquetaUnidad`) pero no `useOrdenes`.

### Cómo hacerlo

Por pantalla, siguiendo `docs/CREAR-UNA-PANTALLA.md` desde el paso 6: un controlador en la
feature que use el hook de la entidad, la interfaz que solo pinta, y la página que compone.
**Comparar contra la pantalla vieja en `Emiliano`** antes de dar por bueno el cambio: la
entidad se escribió contra la API real, pero nadie la ha visto pintada.

Orden propuesto, de menor a mayor riesgo: `autonomy` y `safety` (una lista, solo lectura) →
`ifta` → `inventory` → `tuning` → `finance` → `inspection` y `roadside-repair` (modales con
guardado y archivos).

**Esfuerzo:** de medio día (autonomía) a dos días (inspecciones) por pantalla.

---

## 5 · Los otros `fetch` de la zona nueva

Además de los ocho anteriores, quedan con `fetch` propio: `MargenPage`, `ResiduosPage` y
`TicketPagoPage` (finanzas), `CotizadorPage`, `NuevaOrdenPage`, `EditarOrdenPage` e
`InspeccionFinalPage` (mantenimiento), `ExpenseManagerPage`, `EditarGastoGeneralPage` y
`ModalNuevoGasto` (gastos). Para estas **no** existe la petición en una entidad: hay que
escribirla.

`entities/tracking/api/geo.js` también usa `fetch`, pero contra servicios públicos de mapas,
no contra la API de IMA. Es una excepción consciente.

En la estructura vieja (`components/`, `hooks/`) quedan 13 archivos más; se resuelven al
migrar cada uno.

---

## 6 · Layouts rotos por `Grid` de MUI 7 — 46 usos en 8 archivos

MUI 7 eliminó `item`, `xs`, `md`… como props de `Grid`: los ignora, los hijos quedan sin
ancho y solo avisa en consola. Afecta a `NuevaOrdenPage` y `EditarOrdenPage` (12 cada una),
`TablaOrdenes` (6), `FinanzasPage` (5), `TicketPagoPage` (4), `AfinacionesHistorialPage`
(3), `DocumentosPage` y `ConfigRequirementModal` (2 cada uno).

### Cómo hacerlo

```bash
npx @mui/codemod@latest v7.0.0/grid-props src/pages/mantenimientos
```

El codemod oficial funciona bien (ya se usó en Gastos). **Arreglarlo cambia el aspecto**:
hoy esos layouts se acomodan por accidente y al migrar se ven como el código siempre dijo.
Por eso va módulo por módulo, con revisión visual de cada pantalla.

---

## 7 · El menú y las pantallas leen permisos distintos

`components/Sidebar.jsx` decide qué entradas mostrar con `userPermissions` de
`features.php` (vía `useAuthStore`). `<Can>`, `usePermisos()` y `useSesion().can` usan
`calcularPermisosEfectivos`, que suma lo que da el rol. Resultado: a alguien de
operaciones su rol le da `viajes_*`, las pestañas internas lo dejan pasar, pero la entrada
del menú solo aparece si además tiene la clave en `features.php`.

### Cómo hacerlo

El menú pasa a preguntar con `useSesion().can(featureKey)`. Antes, **medir a quién le
cambia el menú**: para cada usuario, comparar lo que ve hoy con lo que vería con los
permisos efectivos. Si alguien gana entradas que no debía ver, el problema está en
`PERMISOS_POR_ROL`, no en el menú.

---

## 8 · Deuda menor, medida

| Qué | Dónde | Cómo |
|---|---|---|
| Sesión desde `useAuthStore` en vez de `useSesion` | `ModalNuevoGasto`, `useAvisoDeNotificaciones`, `AdminViajesPage`, `OrdenesServicioPage`, `EditarGastoGeneralPage`, `DieselDeViajePage`, `AccesosPage` | Cambiar a `useSesion()`. `LoginPage` sí debe usar el store: es quien abre la sesión |
| 39 archivos de más de 250 líneas | Encabeza `EditarGastoGeneralPage` (724) | Extraer el controlador a la feature; ninguno pasa de 1 000 |
| 99 colores escritos a mano | Casi todos paletas categóricas de mapas y gráficas | Revisar los que no sean categóricos; los categóricos se quedan |
| Features sin `index.js` | `access-manager`, `documentos`, `inspections`, `service-order` | Crear el índice y que las páginas importen de él |
| Sin `React.lazy` por ruta | `navigation/AppRouter.jsx` importa las 48 páginas | Cargar por ruta; mejora el arranque, no la corrección |

---

## Orden sugerido

1. **Arreglar los `Grid` (§6).** Son layouts rotos hoy mismo, y el codemod es mecánico.
2. **Conectar las ocho entidades (§4).** El código ya está escrito y probado; falta usarlo.
3. **Unificar la lectura de permisos del menú (§7).** Hoy dos personas con el mismo rol
   pueden ver menús distintos sin que nadie lo haya decidido.
4. **Paginar las tablas.** Corrige un problema que ya está pasando, y es barato.
5. **Unificar el idioma de la interfaz** aunque no se ponga el botón. Arregla una
   inconsistencia real y es prerrequisito de lo demás.
6. **Modo oscuro**, si alguien lo va a usar.
7. **El botón de idioma**, al final: es el que más trabajo pide y el único que no arregla
   nada que hoy esté roto.
