# entities/warehouse

Las bodegas de origen y destino de las etapas.

## Contenido

- `api/bodegas.js` — `obtenerBodegas`, `useBodegas`, `crearBodega`, `useCrearBodega`

Sin pruebas: no tiene reglas propias, solo peticiones.

## Endpoints que consume

| Endpoint | op | Función |
|---|---|---|
| `warehouses.php` | `getWarehouses` | `obtenerBodegas()` |
| `warehouses.php` | `CreateWarehouse` | `crearBodega()` |

## Reglas de negocio

- Es un catálogo compartido y se puede dar de alta una bodega desde el propio selector del viaje.

## Quién lo usa

`components/BorderCrossingFormNew2.jsx`, `components/TripFormMX.jsx`, `components/TripFormUSA.jsx`, `features/trip-edit`, `pages/dispatch`
