# features/dispatch

La creación y edición de viajes desde despacho: la configuración común (país, año, número y cruce) y los formularios por país.

## Contenido

- `ui/FormulariosViaje.jsx` — `FormulariosViaje`
- `ui/PanelConfiguracionViaje.jsx` — `PanelConfiguracionViaje`

## Cómo funciona

- `PanelConfiguracionViaje` es el mismo para crear y para editar.
- `FormulariosViaje` elige el formulario según el país del viaje; los formularios en sí siguen en `components/` (`TripFormMX`, `TripFormUSA`, `BorderCrossingFormNew2`).

## Pendiente

- Los formularios de viaje siguen en la estructura vieja; migrarlos es el siguiente paso de este módulo.

## Quién lo usa

`pages/dispatch`
