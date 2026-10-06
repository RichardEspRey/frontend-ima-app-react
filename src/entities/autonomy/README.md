# entities/autonomy

La autonomía de la flota: cuántas millas recorre cada camión por galón, con sus registros de rendimiento.

## Contenido

- `api/autonomia.js` — `obtenerAutonomia`, `useAutonomia`
- `model/autonomia.js` — `esquemaRegistroAutonomia`, `REGISTROS_POR_CAMION`, `esquemaAutonomia`, `promedioMpg`, `NIVEL_RENDIMIENTO`, `UMBRAL_RENDIMIENTO`… (11)

Pruebas: `autonomia.test.js`.

## Endpoints que consume

| Endpoint | op | Función |
|---|---|---|
| `autonomia.php` | `get_truck_autonomy` | `obtenerAutonomia()` |

## Reglas de negocio

- Cada camión trae sus últimas 5 cargas de más de 100 galones (`REGISTROS_POR_CAMION`). Un registro vacío o mal formado se omite sin tirar los demás, y `registrosEnCasillas` los acomoda en sus 5 columnas.
- El rendimiento es bueno desde 7 millas por galón y regular desde 5.5; por debajo, bajo (`UMBRAL_RENDIMIENTO`, `nivelRendimiento`). Sin un número positivo no hay dato.
- `promedioMpg` ignora los registros en cero: son cargas sin recorrido y hundirían el promedio. Medido el 2026-10-06, coincide con el `promedio` que manda la API en los 8 camiones.
- Los registros llegan del más reciente al más antiguo; `ultimoRegistro` toma el primero sin reordenar.

## Quién lo usa

`features/autonomia`, `pages/mantenimientos`
