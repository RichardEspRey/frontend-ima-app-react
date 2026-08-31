# 0005 — Proveedor de tiles de los mapas

**Fecha:** 2026-08-31 · **Estado:** aceptada · **Revisar si:** el mapa empieza a fallar

## Contexto

La app tiene cuatro mapas: `Mapas/Tracking`, `Viajes/TripAdmin` y dos en
`Viajes/Cotizacion`. Cada uno tenía su propia copia de la URL de tiles, y con el tiempo se
desincronizaron: tres apuntaban a OpenStreetMap **con** atribución, y `Tracking` a CartoDB
**sin** atribución.

En agosto de 2026 se detectó que el mapa de Tracking mostraba **"API KEY REQUIRED"**
estampado sobre todos los tiles. CartoDB empezó a exigir API key para sus basemaps.

Lo importante de cómo falló: Carto responde **HTTP 200** con la marca de agua ya impresa
en la imagen. No hay error en consola, ni petición bloqueada, ni nada que un test o un
`npm audit` pueda detectar. El mapa simplemente se ve mal, y se veía mal en producción sin
que saltara ninguna alarma.

## Decisión

1. La capa base se centraliza en `src/shared/config/mapa.js`. Los cuatro mapas hacen
   `<TileLayer {...TILES_BASE} />`.
2. El proveedor es **OpenStreetMap**, que es lo que ya usaban tres de los cuatro y no
   pide llave.
3. **No se cambia de proveedor** aunque haya alternativas mejores en papel: el aspecto
   actual es el que el equipo quiere, y no hay ningún problema hoy.

## Razones

- Unificar era la corrección de fondo. Arreglar solo la línea de Tracking habría dejado
  intacta la causa —cuatro copias de la misma URL— y volvería a divergir.
- Se eligió OSM y no Carto-con-llave porque era el cambio que no inventa nada: tres
  pantallas ya lo usaban y llevan años funcionando.
- Es datos planos y no un componente para que `shared/config` no importe react-leaflet:
  así ninguna pantalla sin mapa arrastra leaflet en su bundle.

## Consecuencias

Cambiar de proveedor ahora es editar **un archivo**, no cuatro. Y la atribución deja de
poder faltar en una pantalla y estar en las otras.

### El riesgo que queda, y por qué se acepta

**Los tiles de OpenStreetMap corren sobre infraestructura donada.** Su
[política de uso](https://operations.osmfoundation.org/policies/tiles/) desaconseja el
consumo comercial intensivo, y una app que rastrea una flota todo el día entra de lleno en
esa categoría.

Hoy no pasa nada y no hay nada ilegal. Pero si OSM empieza a limitar peticiones, el mapa
**se degradará sin avisar** — exactamente como acaba de pasar con Carto: sin error, sin
log, sin test en rojo. Alguien tendrá que verlo con los ojos.

Se acepta porque el equipo quiere el aspecto actual y porque migrar es barato el día que
haga falta.

## Señales de que toca revisar esto

- Tiles que salen en gris, a medias, o tardan visiblemente más de lo normal.
- Marcas de agua o mensajes sobre el mapa.
- Respuestas 429 a `tile.openstreetmap.org` en la pestaña de red.

## Alternativas, para cuando llegue ese día

Todas se aplican editando `src/shared/config/mapa.js`.

| Opción | Llave | Uso comercial | Nota |
|---|:--:|:--:|---|
| **CartoDB Voyager** | sí | sí | El estilo que tenía Tracking antes: más limpio y claro. Capa gratuita. Es lo más parecido a lo que había. |
| **OpenFreeMap** | no | sí | Sin llave y sin límite declarado. La opción de menor fricción. |
| **MapTiler** | sí | sí | Capa gratuita amplia, varios estilos. |
| **Stadia Maps** | sí | sí | Capa gratuita; sirve los estilos de Stamen. |
| **Mapbox** | sí | sí | El más completo y el más caro al crecer. |

Si se elige una que pida llave: va en `.env` como `VITE_TILES_KEY`, **nunca** escrita en el
código. Recordar que todo lo que empieza con `VITE_` acaba en el bundle y es público, así
que la llave debe ser de las que se restringen por dominio desde el panel del proveedor.

Y actualizar la CSP de `vite.config.js`: el `img-src` lista los dominios de tiles
permitidos, y un proveedor nuevo que no esté ahí se bloquea sin explicación visible.
