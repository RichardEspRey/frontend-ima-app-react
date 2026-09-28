-- Estatus de cajas · que lo capturado a mano caduque al cambiar de etapa
--
-- Hasta ahora lo manual mandaba hasta que la caja cambiaba de viaje entero, así que
-- una caja corregida a mano se quedaba congelada tramo tras tramo: el tablero decía
-- RUTA BAJANDO mientras el viaje ya iba subiendo. Con la etapa de referencia, la
-- corrección dura lo que dura el tramo y luego la caja vuelve a seguirse sola.
--
-- Una caja sin viaje no tiene etapa: ahí la referencia queda en NULL y lo capturado
-- sigue valiendo, que es lo que hace falta para la caja parada en el taller.
--
-- No borra nada. Las filas que ya existen quedan con la etapa en NULL, así que su
-- captura deja de aplicar en cuanto la caja esté en una etapa: es justo lo que se
-- quiere, porque son las seis capturas viejas que tienen el tablero congelado.

ALTER TABLE `caja_estatus`
  ADD COLUMN `stage_id_referencia` INT(11) DEFAULT NULL
  COMMENT 'Etapa en curso cuando se capturó; al cambiar, lo manual caduca'
  AFTER `trip_id_referencia`;
