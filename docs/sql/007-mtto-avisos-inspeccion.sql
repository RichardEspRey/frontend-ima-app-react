-- Reparaciones · quién recibe el aviso de inspección nueva
--
-- Una fila por persona que ve en la campana las inspecciones que llegan a
-- Reparaciones. Se administra desde Notificaciones manager, igual que los BL.
-- Mientras la tabla esté vacía, nadie recibe el aviso.
--
-- Una sola sentencia y no borra nada. Correrla ANTES de subir el `mtto.php` nuevo:
-- sus cuatro operaciones de avisos leen esta tabla.

CREATE TABLE IF NOT EXISTS `mtto_notif_suscriptores` (
  `user_id` INT(11) NOT NULL COMMENT 'users.id de quien recibe el aviso',
  `creado_en` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `creado_por` INT(11) DEFAULT NULL COMMENT 'users.id de quien lo dio de alta',
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
