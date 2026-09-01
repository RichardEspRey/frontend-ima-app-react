# Pantallas sin uso

Ocho pantallas a las que **no lleva ningún enlace de la aplicación**. Siguen funcionando si
alguien escribe la URL o tiene un marcador guardado; lo que no hay es forma de llegar a
ellas desde el menú ni desde ninguna otra pantalla.

Están aquí en cuarentena, no borradas: si en unos meses nadie las echa de menos, se borran.
Si alguien las necesita, se devuelven a `pages/` y se migran como las demás.

## Qué hay y por qué dejó de usarse

| Archivo | Ruta | Sustituida por | El enlace se quitó |
|---|---|---|---|
| `DriverScreen.jsx` | `/drivers` | `/admin-drivers` | 2025-10-29 · Emiliano · "Primera versión de Admin de Permisos" |
| `TruckScreen.jsx` | `/trucks` | `/admin-trucks` | 2025-10-29 · Emiliano · misma |
| `TrailerScreen.jsx` | `/trailers` | `/admin-trailers` | 2025-10-29 · Emiliano · misma |
| `DriverEditor.jsx` | `/editor-drivers/:id` | el expediente de `/admin-drivers` | 2026-05-11 · Emiliano · "IMA Manager y DriverAdmin modificados" |
| `TrucksEditor.jsx` | `/editor-trucks/:id` | el expediente de `/admin-trucks` | 2026-05-11 · Emiliano · misma |
| `TrailerEdit.jsx` | `/editor-trailers/:id`, `/edit-trailer/:id` | el expediente de `/admin-trailers` | 2026-05-11 · Emiliano · misma |
| `TripsScreen.jsx` | `/trips` | `/CrearViaje` | — nunca estuvo en el menú |
| `TripsScreenNew.jsx` | `/trips-new` | `/CrearViaje` | — nunca estuvo en el menú |

Las tres primeras y las tres de en medio son de **unidades**; las dos últimas, de **viajes**.
Las seis primeras hablan con los endpoints **v1** (`drivers.php`, `trucks.php`, `cajas.php`
y sus `_docs`); las pantallas vivas usan los **v2**.

## Cómo se comprobó que no llevan a ningún lado

Doce comprobaciones, todas el 2026-09-01:

1. `menuConfig.js` produce **25 rutas** y ninguna es de estas.
2. Ningún componente fuera de `screens/` y del router las importa.
3. No hay ningún `navigate()` a esas rutas en todo el repositorio.
4. No hay `navigate()` con plantilla que pueda construirlas: las ocho que existen se
   resolvieron una por una.
5. No hay ningún `<Link to>` ni `href` en toda la aplicación.
6. El proceso de Electron solo carga `dist/index.html`; no abre rutas concretas.
7. Ningún documento del repositorio manda a ellas.
8. Se rastreó en la historia de `main` **cuándo se quitó cada enlace**, y con qué commit.
9. La última modificación de cada archivo es de hace 4 a 16 meses, y la más reciente
   —`DriverEditor`, marzo de 2026— fue **una línea** (`op: 'Update'` → `'Alta'`) aplicada
   de golpe a cinco archivos: una corrección en bloque, no trabajo sobre esa pantalla.
10. El router tiene un comodín `path="*"` que manda a `/home`, así que una URL vieja nunca
    deja una pantalla en blanco.
11. Las rutas **siguen registradas a propósito**: un marcador guardado sigue funcionando.
12. Se comprobó contra producción que **v1 y v2 escriben en la misma tabla** —los 7
    conductores que lista `drivers.php` son los mismos que `drivers_v2.php`, que además
    lista los 25 dados de baja—. Es decir: si alguien diera de alta desde una de estas
    pantallas, el registro **sí** aparecería en la pantalla nueva. No hay riesgo de datos
    partidos por dejarlas accesibles.

Lo único que no se puede comprobar desde el repositorio es si alguien tiene un marcador en
su navegador. Por eso están en cuarentena y no borradas, y por eso las rutas siguen vivas.

## Antes de borrarlas

- Preguntar a Richard y a Emiliano si alguien usa esas URLs a mano.
- Quitar las rutas de `navigation/AppRouter.jsx`.
- Quitar sus entradas de `src/test/rutas.smoke.test.jsx`.
- Revisar si los endpoints v1 quedan sin ningún consumidor **en este repositorio** — ojo:
  la aplicación móvil consume la misma API y no se ve desde aquí, así que que el front deje
  de usarlos no significa que se puedan borrar del backend.
