# entities/company

Las compañías (clientes y brokers) a las que se asigna una etapa de viaje.

## Contenido

- `api/companias.js` — `obtenerCompanias`, `useCompanias`, `crearCompania`, `useCrearCompania`

Pruebas: `catalogos.test.jsx`.

## Endpoints que consume

| Endpoint | op | Función |
|---|---|---|
| `companies.php` | `getCompanies` | `obtenerCompanias()` |
| `companies.php` | `CreateCompany` | `crearCompania()` |

## Reglas de negocio

- Es un catálogo: se cachea `FRESCURA_CATALOGO_MS` y se comparte, así que varias pantallas abiertas hacen una sola petición.
- Se puede dar de alta una compañía desde el propio selector del viaje (`useCrearCompania`), para no abandonar el formulario a medias.

## Quién lo usa

`components/BorderCrossingFormNew2.jsx`, `components/TripFormMX.jsx`, `components/TripFormUSA.jsx`, `features/trip-edit`, `pages/dispatch`, `pages/viajes`
