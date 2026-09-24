-- Estatus de cajas · la columna de comentarios
--
-- Texto libre de hasta 300 caracteres, uno por caja. Vive en la misma fila que la
-- ubicación y la observación capturadas a mano, así que caduca con ellas: cuando la
-- caja cambia de viaje, `trip_id_referencia` deja de coincidir y el comentario deja
-- de mostrarse, sin que nadie tenga que acordarse de borrarlo.
--
-- No toca ninguna otra tabla y no borra nada: las filas que ya existen quedan con el
-- comentario en NULL.

ALTER TABLE `caja_estatus`
  ADD COLUMN `comentarios` VARCHAR(300) DEFAULT NULL
  COMMENT 'Texto libre del tablero; caduca con el viaje de referencia'
  AFTER `observacion`;
