# cajas_estatus.php

Endpoint de la pantalla Estatus de cajas. Se sube al mismo directorio donde viven
`cajas_docs.php` y `conexion.php`.

## Confirmado contra producción (2026-09-21)

- `caja_trips_status(id, trip_id, status enum('Impo','Expo','Vacio'))` — es la tabla que
  escribe `Crud_caja_trips_status('I', trip_id, status)` desde el `add_status_caja_trips`
  de `new_tripsv2.php`. El `LEFT JOIN` de `getEstatusCajas` quedó como estaba.
- `conexion.php` va en minúsculas: el hosting es Linux y distingue mayúsculas.
- La fianza vigente es la fila de `cajas_documents` con `status = 1`; el procedimiento
  `crud_caja_docs` apaga la anterior. Por eso se ordena por `status DESC, doc_id DESC`
  y no por `fecha_vencimiento`.
- `tipo_documento` está en la base como `Fianza` y como `FIANZA`: la comparación va con
  `UPPER()`.
- La tabla `caja_estatus` ya está creada en producción.

## Cambios del 2026-09-28

Operaciones reportó dos cosas: «no se están actualizando las cajas» y «se nos borran los
comentarios de los sellos». Las dos tenían causa en la vigencia de lo capturado.

- **Lo capturado a mano caduca por etapa, no por viaje.** Seis de siete cajas estaban
  congeladas en una corrección vieja: el tablero decía RUTA BAJANDO mientras el viaje ya
  iba subiendo, porque lo manual mandaba hasta que cambiara el viaje entero. Ahora la
  referencia es `caja_estatus.stage_id_referencia` y la corrección dura lo que dura el
  tramo. Una caja sin viaje no tiene etapa: los dos lados quedan vacíos, coinciden, y la
  captura sigue valiendo, que es lo que hace falta para la caja parada en el taller.
- **El comentario ya no caduca.** Son números de sello; se quedan hasta que alguien los
  cambie o los borre. Los que estaban escondidos por la regla anterior reaparecen solos:
  nunca se borraron de la tabla.
- `viajeEnTurno()` y `etapaEnCurso()` existen para que el tablero y el guardado usen la
  misma regla. Si se separan, lo capturado se guarda apuntando a una etapa distinta de la
  que luego se compara, y caduca de inmediato.

Necesita `docs/sql/003-caja_estatus-etapa.sql` aplicado antes de subir este archivo.

## Pendiente

Probar en Chrome contra la base real y después portarlo al refactor.
