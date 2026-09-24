-- Estatus de cajas · tabla para lo que se captura a mano (ya aplicada en producción el 2026-09-21)
--
-- No toca ninguna tabla existente: solo agrega una nueva, con una fila por caja.
-- Lo automático (viaje en turno, dirección, broker) NO se guarda aquí: se calcula
-- al consultar, para que nunca quede viejo.
--
-- trip_id_referencia es lo que hace caducar lo manual: guarda con qué viaje se fijó
-- el valor. Cuando la caja pasa a otro viaje, lo manual deja de aplicar y vuelve a
-- mandar lo automático, sin que nadie tenga que acordarse de quitarlo.

CREATE TABLE IF NOT EXISTS `caja_estatus` (
  `caja_id`            INT(11)      NOT NULL,
  `ubicacion`          VARCHAR(50)  DEFAULT NULL COMMENT 'PENSION NLD, TALLER, RUTA SUBIENDO, RUTA BAJANDO',
  `observacion`        VARCHAR(20)  DEFAULT NULL COMMENT 'VACIA o CARGADA',
  `trip_id_referencia` INT(11)      DEFAULT NULL COMMENT 'Viaje en turno cuando se capturó; al cambiar, lo manual caduca',
  `actualizado_en`     TIMESTAMP    NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `actualizado_por`    INT(11)      DEFAULT NULL,
  PRIMARY KEY (`caja_id`),
  CONSTRAINT `fk_caja_estatus_caja` FOREIGN KEY (`caja_id`) REFERENCES `caja` (`caja_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
