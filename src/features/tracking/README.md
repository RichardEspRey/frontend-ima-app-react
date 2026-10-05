# features/tracking

El mapa de la flota: la lista de unidades, el panel de la seleccionada, las paradas de su etapa y el trazador de rutas.

## Contenido

- `ui/HudUnidad.jsx` — `HudPlegado`, `HudUnidad`
- `ui/ListaUnidades.jsx` — `ListaUnidades`
- `ui/MapaFlota.jsx` — `MapaFlota`
- `ui/ParadasEtapa.jsx` — `ParadasEtapa`
- `ui/TrazadorRuta.jsx` — `TrazadorRuta`
- `ui/iconos.js` — `iconoUnidad`, `iconoPunto`, `COLOR_PUNTO_1`, `COLOR_PUNTO_2`

## Cómo funciona

- Los datos y sus reglas son de `entities/tracking`; aquí viven el mapa, los marcadores y los paneles.

## Quién lo usa

`pages/tracking`
