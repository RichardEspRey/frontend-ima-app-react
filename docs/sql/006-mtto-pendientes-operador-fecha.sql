-- Reparaciones pendientes · operador y fecha de enviado
--
-- Los pendientes que vienen de una inspección ya traen operador y fecha en `cl_final`
-- (`driver_id`, `fecha_creacion`). Estas dos columnas guardan lo que la oficina captura
-- al levantar un pendiente a mano o lo que corrige en uno de inspección. Vacías, se usa
-- el dato de la inspección; así el original no se pierde.
--
-- Una sola sentencia. Subir el `mtto.php` nuevo DESPUÉS de correrla: su consulta de
-- pendientes ya pide las columnas.

ALTER TABLE `mtto_puntos`
  ADD COLUMN `driver_id` INT(11) DEFAULT NULL
    COMMENT 'Operador capturado o corregido; NULL = el de cl_final'
    AFTER `caja_id`,
  ADD COLUMN `fecha_reporte` DATE DEFAULT NULL
    COMMENT 'Fecha de enviado capturada o corregida; NULL = cl_final.fecha_creacion'
    AFTER `driver_id`;
