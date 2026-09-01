# Módulo: Safety e IFTA

Dos cosas distintas bajo la misma sección: el **cumplimiento documental** de los viajes
cerrados y el **reporte IFTA** de millas por estado.

| Ruta | Archivo |
|---|---|
| `/safety` | `pages/safety/SafetyPage.jsx` |
| `/Ifta` | `pages/safety/IftaPage.jsx` |

## Entidades

- **`entities/safety`** — `safety.php` · `get_safety_trips`
- **`entities/ifta`** — `IFTA.php` · `periodos`, `get_ifta_totals_by_state`, `get_ifta_trips`

## Reglas de negocio

- Un viaje cerrado necesita **tres documentos**: libro electrónico, reporte diesel y
  reporte PC Miller. Cada uno llega como una URL o como `null`; el nulo significa que
  **falta**, no que haya un error.
- Un viaje "cumple" solo si tiene los tres. Es lo que separa las dos primeras pestañas.
- **IFTA se paga por la diferencia** entre dónde se recorrieron las millas y dónde se
  compró el combustible. Por eso lo que importa de cada estado es la relación entre
  `total_millas` y `galones`, no cada número por separado.

## Cosas que sorprenden

- **`periodos` devuelve el campo `periodo` VACÍO.** El corte se decide con `trip_year` y
  los filtros de fecha, no con ese campo, pese al nombre de la operación.
- **Los filtros de IFTA solo viajan si traen valor.** Mandar un rango vacío cambiaría el
  resultado en vez de dejarlo sin filtrar, así que la entidad los omite cuando están vacíos.
- Hay estados con **millas pero sin galones cargados** — se recorrió sin repostar ahí —.
  `rendimientoEstado` devuelve 0 y no `Infinity`; hay un test que lo comprueba estado por
  estado contra los datos reales.
- **`SafetyPage` monta dos tablas que no son suyas**: las de reparaciones en ruta e
  inspecciones, que viven en `features/inspections` porque también son pantallas propias
  del módulo de mantenimientos.
- Los contadores rojos de cada columna cuentan **por documento, no por viaje**: un viaje al
  que le faltan los tres suma en las tres columnas.

## Historial

Migrado en el incremento 11 (2026-09-01). Se hizo después de Finanzas por un descuido al
numerar los incrementos, no por una decisión.

Las dos tablas embebidas se habían separado del encabezado justo antes, al cerrar el 9c:
antes se montaban con una prop `embedded` que solo quitaba el contenedor, así que dentro
de Safety salían dos títulos apilados.
