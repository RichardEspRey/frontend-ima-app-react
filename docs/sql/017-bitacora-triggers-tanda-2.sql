-- Bitácora · triggers de «antes y después», tanda 2
--
-- NO CORRER EN phpMyAdmin. Creados ahí quedarían con el usuario temporal de cPanel y
-- fallarían con el error 1449, como crud_diesel. Se instalan con
-- docs/backend/bitacora_triggers.php, que usa la conexión de la app.
-- Este archivo es la copia para revisar; el PHP lleva exactamente las mismas sentencias.
--
-- Tablas: trips, ordenes_servicio, orden_servicio_detalles, pago_trayectos_mx, notif_suscriptores
-- Generado desde docs/sql/bitacora-esquema-2026-11-17.json con
-- docs/sql/generar-triggers-bitacora.py.
--
-- Qué hace cada uno: al dar de alta guarda el registro completo; al editar guarda solo
-- las columnas que cambiaron (y nada si no cambió ninguna); al borrar guarda el registro
-- completo. Columnas que nunca se guardan: trips.ruta_wialon.
-- Quién y en qué petición salen de @ima_usuario y @ima_peticion, que pone conexion.php
-- en cada conexión. Si algo falla dentro del trigger, el manejador lo traga y el guardado
-- sigue.
--
-- No modifican ninguna tabla ni agregan columnas. Antes de RENOMBRAR o BORRAR una
-- columna de estas tablas hay que quitar sus triggers (accion=quitar&tabla=…).

-- bit_trips_ins
CREATE TRIGGER `bit_trips_ins` AFTER INSERT ON `trips` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'trips', CONCAT_WS('-', NEW.`trip_id`), 'I', NULL, JSON_OBJECT('trip_id', NEW.`trip_id`, 'trip_number', NEW.`trip_number`, 'origen_id', NEW.`origen_id`, 'driver_id', NEW.`driver_id`, 'driver_id_second', NEW.`driver_id_second`, 'truck_id', NEW.`truck_id`, 'caja_id', NEW.`caja_id`, 'creation_date', NEW.`creation_date`, 'status', NEW.`status`, 'team_id', NEW.`team_id`, 'caja_externa_id', NEW.`caja_externa_id`, 'return_date', NEW.`return_date`, 'status_payment', NEW.`status_payment`, 'country_code', NEW.`country_code`, 'trip_year', NEW.`trip_year`, 'is_transnational', NEW.`is_transnational`, 'transnational_number', NEW.`transnational_number`, 'movement_number', NEW.`movement_number`, 'odometer_start', NEW.`odometer_start`, 'odometer_end', NEW.`odometer_end`, 'fecha_finalizacion', NEW.`fecha_finalizacion`, 'fecha_inicio_viaje', NEW.`fecha_inicio_viaje`));
END;

-- bit_trips_upd
CREATE TRIGGER `bit_trips_upd` AFTER UPDATE ON `trips` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  IF NOT (OLD.`trip_id` <=> NEW.`trip_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."trip_id"', OLD.`trip_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."trip_id"', NEW.`trip_id`);
  END IF;
  IF NOT (OLD.`trip_number` <=> NEW.`trip_number`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."trip_number"', OLD.`trip_number`);
    SET v_despues = JSON_INSERT(v_despues, '$."trip_number"', NEW.`trip_number`);
  END IF;
  IF NOT (OLD.`origen_id` <=> NEW.`origen_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."origen_id"', OLD.`origen_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."origen_id"', NEW.`origen_id`);
  END IF;
  IF NOT (OLD.`driver_id` <=> NEW.`driver_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."driver_id"', OLD.`driver_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."driver_id"', NEW.`driver_id`);
  END IF;
  IF NOT (OLD.`driver_id_second` <=> NEW.`driver_id_second`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."driver_id_second"', OLD.`driver_id_second`);
    SET v_despues = JSON_INSERT(v_despues, '$."driver_id_second"', NEW.`driver_id_second`);
  END IF;
  IF NOT (OLD.`truck_id` <=> NEW.`truck_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."truck_id"', OLD.`truck_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."truck_id"', NEW.`truck_id`);
  END IF;
  IF NOT (OLD.`caja_id` <=> NEW.`caja_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."caja_id"', OLD.`caja_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."caja_id"', NEW.`caja_id`);
  END IF;
  IF NOT (OLD.`creation_date` <=> NEW.`creation_date`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."creation_date"', OLD.`creation_date`);
    SET v_despues = JSON_INSERT(v_despues, '$."creation_date"', NEW.`creation_date`);
  END IF;
  IF NOT (OLD.`status` <=> NEW.`status`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."status"', OLD.`status`);
    SET v_despues = JSON_INSERT(v_despues, '$."status"', NEW.`status`);
  END IF;
  IF NOT (OLD.`team_id` <=> NEW.`team_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."team_id"', OLD.`team_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."team_id"', NEW.`team_id`);
  END IF;
  IF NOT (OLD.`caja_externa_id` <=> NEW.`caja_externa_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."caja_externa_id"', OLD.`caja_externa_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."caja_externa_id"', NEW.`caja_externa_id`);
  END IF;
  IF NOT (OLD.`return_date` <=> NEW.`return_date`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."return_date"', OLD.`return_date`);
    SET v_despues = JSON_INSERT(v_despues, '$."return_date"', NEW.`return_date`);
  END IF;
  IF NOT (OLD.`status_payment` <=> NEW.`status_payment`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."status_payment"', OLD.`status_payment`);
    SET v_despues = JSON_INSERT(v_despues, '$."status_payment"', NEW.`status_payment`);
  END IF;
  IF NOT (OLD.`country_code` <=> NEW.`country_code`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."country_code"', OLD.`country_code`);
    SET v_despues = JSON_INSERT(v_despues, '$."country_code"', NEW.`country_code`);
  END IF;
  IF NOT (OLD.`trip_year` <=> NEW.`trip_year`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."trip_year"', OLD.`trip_year`);
    SET v_despues = JSON_INSERT(v_despues, '$."trip_year"', NEW.`trip_year`);
  END IF;
  IF NOT (OLD.`is_transnational` <=> NEW.`is_transnational`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."is_transnational"', OLD.`is_transnational`);
    SET v_despues = JSON_INSERT(v_despues, '$."is_transnational"', NEW.`is_transnational`);
  END IF;
  IF NOT (OLD.`transnational_number` <=> NEW.`transnational_number`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."transnational_number"', OLD.`transnational_number`);
    SET v_despues = JSON_INSERT(v_despues, '$."transnational_number"', NEW.`transnational_number`);
  END IF;
  IF NOT (OLD.`movement_number` <=> NEW.`movement_number`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."movement_number"', OLD.`movement_number`);
    SET v_despues = JSON_INSERT(v_despues, '$."movement_number"', NEW.`movement_number`);
  END IF;
  IF NOT (OLD.`odometer_start` <=> NEW.`odometer_start`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."odometer_start"', OLD.`odometer_start`);
    SET v_despues = JSON_INSERT(v_despues, '$."odometer_start"', NEW.`odometer_start`);
  END IF;
  IF NOT (OLD.`odometer_end` <=> NEW.`odometer_end`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."odometer_end"', OLD.`odometer_end`);
    SET v_despues = JSON_INSERT(v_despues, '$."odometer_end"', NEW.`odometer_end`);
  END IF;
  IF NOT (OLD.`fecha_finalizacion` <=> NEW.`fecha_finalizacion`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."fecha_finalizacion"', OLD.`fecha_finalizacion`);
    SET v_despues = JSON_INSERT(v_despues, '$."fecha_finalizacion"', NEW.`fecha_finalizacion`);
  END IF;
  IF NOT (OLD.`fecha_inicio_viaje` <=> NEW.`fecha_inicio_viaje`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."fecha_inicio_viaje"', OLD.`fecha_inicio_viaje`);
    SET v_despues = JSON_INSERT(v_despues, '$."fecha_inicio_viaje"', NEW.`fecha_inicio_viaje`);
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'trips', CONCAT_WS('-', NEW.`trip_id`), 'U', v_antes, v_despues);
  END IF;
END;

-- bit_trips_del
CREATE TRIGGER `bit_trips_del` AFTER DELETE ON `trips` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'trips', CONCAT_WS('-', OLD.`trip_id`), 'D', JSON_OBJECT('trip_id', OLD.`trip_id`, 'trip_number', OLD.`trip_number`, 'origen_id', OLD.`origen_id`, 'driver_id', OLD.`driver_id`, 'driver_id_second', OLD.`driver_id_second`, 'truck_id', OLD.`truck_id`, 'caja_id', OLD.`caja_id`, 'creation_date', OLD.`creation_date`, 'status', OLD.`status`, 'team_id', OLD.`team_id`, 'caja_externa_id', OLD.`caja_externa_id`, 'return_date', OLD.`return_date`, 'status_payment', OLD.`status_payment`, 'country_code', OLD.`country_code`, 'trip_year', OLD.`trip_year`, 'is_transnational', OLD.`is_transnational`, 'transnational_number', OLD.`transnational_number`, 'movement_number', OLD.`movement_number`, 'odometer_start', OLD.`odometer_start`, 'odometer_end', OLD.`odometer_end`, 'fecha_finalizacion', OLD.`fecha_finalizacion`, 'fecha_inicio_viaje', OLD.`fecha_inicio_viaje`), NULL);
END;

-- bit_ordenes_servicio_ins
CREATE TRIGGER `bit_ordenes_servicio_ins` AFTER INSERT ON `ordenes_servicio` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'ordenes_servicio', CONCAT_WS('-', NEW.`id_orden`), 'I', NULL, JSON_OBJECT('id_orden', NEW.`id_orden`, 'fecha_orden', NEW.`fecha_orden`, 'truck_id', NEW.`truck_id`, 'caja_id', NEW.`caja_id`, 'estatus', NEW.`estatus`, 'fecha_creacion', NEW.`fecha_creacion`, 'tipo_cambio', NEW.`tipo_cambio`));
END;

-- bit_ordenes_servicio_upd
CREATE TRIGGER `bit_ordenes_servicio_upd` AFTER UPDATE ON `ordenes_servicio` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  IF NOT (OLD.`id_orden` <=> NEW.`id_orden`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."id_orden"', OLD.`id_orden`);
    SET v_despues = JSON_INSERT(v_despues, '$."id_orden"', NEW.`id_orden`);
  END IF;
  IF NOT (OLD.`fecha_orden` <=> NEW.`fecha_orden`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."fecha_orden"', OLD.`fecha_orden`);
    SET v_despues = JSON_INSERT(v_despues, '$."fecha_orden"', NEW.`fecha_orden`);
  END IF;
  IF NOT (OLD.`truck_id` <=> NEW.`truck_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."truck_id"', OLD.`truck_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."truck_id"', NEW.`truck_id`);
  END IF;
  IF NOT (OLD.`caja_id` <=> NEW.`caja_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."caja_id"', OLD.`caja_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."caja_id"', NEW.`caja_id`);
  END IF;
  IF NOT (OLD.`estatus` <=> NEW.`estatus`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."estatus"', OLD.`estatus`);
    SET v_despues = JSON_INSERT(v_despues, '$."estatus"', NEW.`estatus`);
  END IF;
  IF NOT (OLD.`fecha_creacion` <=> NEW.`fecha_creacion`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."fecha_creacion"', OLD.`fecha_creacion`);
    SET v_despues = JSON_INSERT(v_despues, '$."fecha_creacion"', NEW.`fecha_creacion`);
  END IF;
  IF NOT (OLD.`tipo_cambio` <=> NEW.`tipo_cambio`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."tipo_cambio"', OLD.`tipo_cambio`);
    SET v_despues = JSON_INSERT(v_despues, '$."tipo_cambio"', NEW.`tipo_cambio`);
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'ordenes_servicio', CONCAT_WS('-', NEW.`id_orden`), 'U', v_antes, v_despues);
  END IF;
END;

-- bit_ordenes_servicio_del
CREATE TRIGGER `bit_ordenes_servicio_del` AFTER DELETE ON `ordenes_servicio` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'ordenes_servicio', CONCAT_WS('-', OLD.`id_orden`), 'D', JSON_OBJECT('id_orden', OLD.`id_orden`, 'fecha_orden', OLD.`fecha_orden`, 'truck_id', OLD.`truck_id`, 'caja_id', OLD.`caja_id`, 'estatus', OLD.`estatus`, 'fecha_creacion', OLD.`fecha_creacion`, 'tipo_cambio', OLD.`tipo_cambio`), NULL);
END;

-- bit_orden_servicio_detalles_ins
CREATE TRIGGER `bit_orden_servicio_detalles_ins` AFTER INSERT ON `orden_servicio_detalles` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'orden_servicio_detalles', CONCAT_WS('-', NEW.`id_detalle`), 'I', NULL, JSON_OBJECT('id_detalle', NEW.`id_detalle`, 'id_servicio', NEW.`id_servicio`, 'id_articulo', NEW.`id_articulo`, 'tipo_detalle', NEW.`tipo_detalle`, 'descripcion', NEW.`descripcion`, 'cantidad', NEW.`cantidad`, 'costo', NEW.`costo`));
END;

-- bit_orden_servicio_detalles_upd
CREATE TRIGGER `bit_orden_servicio_detalles_upd` AFTER UPDATE ON `orden_servicio_detalles` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  IF NOT (OLD.`id_detalle` <=> NEW.`id_detalle`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."id_detalle"', OLD.`id_detalle`);
    SET v_despues = JSON_INSERT(v_despues, '$."id_detalle"', NEW.`id_detalle`);
  END IF;
  IF NOT (OLD.`id_servicio` <=> NEW.`id_servicio`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."id_servicio"', OLD.`id_servicio`);
    SET v_despues = JSON_INSERT(v_despues, '$."id_servicio"', NEW.`id_servicio`);
  END IF;
  IF NOT (OLD.`id_articulo` <=> NEW.`id_articulo`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."id_articulo"', OLD.`id_articulo`);
    SET v_despues = JSON_INSERT(v_despues, '$."id_articulo"', NEW.`id_articulo`);
  END IF;
  IF NOT (OLD.`tipo_detalle` <=> NEW.`tipo_detalle`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."tipo_detalle"', OLD.`tipo_detalle`);
    SET v_despues = JSON_INSERT(v_despues, '$."tipo_detalle"', NEW.`tipo_detalle`);
  END IF;
  IF NOT (OLD.`descripcion` <=> NEW.`descripcion`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."descripcion"', OLD.`descripcion`);
    SET v_despues = JSON_INSERT(v_despues, '$."descripcion"', NEW.`descripcion`);
  END IF;
  IF NOT (OLD.`cantidad` <=> NEW.`cantidad`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."cantidad"', OLD.`cantidad`);
    SET v_despues = JSON_INSERT(v_despues, '$."cantidad"', NEW.`cantidad`);
  END IF;
  IF NOT (OLD.`costo` <=> NEW.`costo`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."costo"', OLD.`costo`);
    SET v_despues = JSON_INSERT(v_despues, '$."costo"', NEW.`costo`);
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'orden_servicio_detalles', CONCAT_WS('-', NEW.`id_detalle`), 'U', v_antes, v_despues);
  END IF;
END;

-- bit_orden_servicio_detalles_del
CREATE TRIGGER `bit_orden_servicio_detalles_del` AFTER DELETE ON `orden_servicio_detalles` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'orden_servicio_detalles', CONCAT_WS('-', OLD.`id_detalle`), 'D', JSON_OBJECT('id_detalle', OLD.`id_detalle`, 'id_servicio', OLD.`id_servicio`, 'id_articulo', OLD.`id_articulo`, 'tipo_detalle', OLD.`tipo_detalle`, 'descripcion', OLD.`descripcion`, 'cantidad', OLD.`cantidad`, 'costo', OLD.`costo`), NULL);
END;

-- bit_pago_trayectos_mx_ins
CREATE TRIGGER `bit_pago_trayectos_mx_ins` AFTER INSERT ON `pago_trayectos_mx` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'pago_trayectos_mx', CONCAT_WS('-', NEW.`id`), 'I', NULL, JSON_OBJECT('id', NEW.`id`, 'nombre', NEW.`nombre`, 'monto', NEW.`monto`, 'activo', NEW.`activo`, 'creado_en', NEW.`creado_en`, 'actualizado_en', NEW.`actualizado_en`));
END;

-- bit_pago_trayectos_mx_upd
CREATE TRIGGER `bit_pago_trayectos_mx_upd` AFTER UPDATE ON `pago_trayectos_mx` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  IF NOT (OLD.`id` <=> NEW.`id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."id"', OLD.`id`);
    SET v_despues = JSON_INSERT(v_despues, '$."id"', NEW.`id`);
  END IF;
  IF NOT (OLD.`nombre` <=> NEW.`nombre`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."nombre"', OLD.`nombre`);
    SET v_despues = JSON_INSERT(v_despues, '$."nombre"', NEW.`nombre`);
  END IF;
  IF NOT (OLD.`monto` <=> NEW.`monto`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."monto"', OLD.`monto`);
    SET v_despues = JSON_INSERT(v_despues, '$."monto"', NEW.`monto`);
  END IF;
  IF NOT (OLD.`activo` <=> NEW.`activo`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."activo"', OLD.`activo`);
    SET v_despues = JSON_INSERT(v_despues, '$."activo"', NEW.`activo`);
  END IF;
  IF NOT (OLD.`creado_en` <=> NEW.`creado_en`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."creado_en"', OLD.`creado_en`);
    SET v_despues = JSON_INSERT(v_despues, '$."creado_en"', NEW.`creado_en`);
  END IF;
  IF NOT (OLD.`actualizado_en` <=> NEW.`actualizado_en`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."actualizado_en"', OLD.`actualizado_en`);
    SET v_despues = JSON_INSERT(v_despues, '$."actualizado_en"', NEW.`actualizado_en`);
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'pago_trayectos_mx', CONCAT_WS('-', NEW.`id`), 'U', v_antes, v_despues);
  END IF;
END;

-- bit_pago_trayectos_mx_del
CREATE TRIGGER `bit_pago_trayectos_mx_del` AFTER DELETE ON `pago_trayectos_mx` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'pago_trayectos_mx', CONCAT_WS('-', OLD.`id`), 'D', JSON_OBJECT('id', OLD.`id`, 'nombre', OLD.`nombre`, 'monto', OLD.`monto`, 'activo', OLD.`activo`, 'creado_en', OLD.`creado_en`, 'actualizado_en', OLD.`actualizado_en`), NULL);
END;

-- bit_notif_suscriptores_ins
CREATE TRIGGER `bit_notif_suscriptores_ins` AFTER INSERT ON `notif_suscriptores` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'notif_suscriptores', CONCAT_WS('-', NEW.`categoria`, NEW.`user_id`), 'I', NULL, JSON_OBJECT('categoria', NEW.`categoria`, 'user_id', NEW.`user_id`, 'creado_en', NEW.`creado_en`, 'creado_por', NEW.`creado_por`));
END;

-- bit_notif_suscriptores_upd
CREATE TRIGGER `bit_notif_suscriptores_upd` AFTER UPDATE ON `notif_suscriptores` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  IF NOT (OLD.`categoria` <=> NEW.`categoria`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."categoria"', OLD.`categoria`);
    SET v_despues = JSON_INSERT(v_despues, '$."categoria"', NEW.`categoria`);
  END IF;
  IF NOT (OLD.`user_id` <=> NEW.`user_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."user_id"', OLD.`user_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."user_id"', NEW.`user_id`);
  END IF;
  IF NOT (OLD.`creado_en` <=> NEW.`creado_en`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."creado_en"', OLD.`creado_en`);
    SET v_despues = JSON_INSERT(v_despues, '$."creado_en"', NEW.`creado_en`);
  END IF;
  IF NOT (OLD.`creado_por` <=> NEW.`creado_por`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."creado_por"', OLD.`creado_por`);
    SET v_despues = JSON_INSERT(v_despues, '$."creado_por"', NEW.`creado_por`);
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'notif_suscriptores', CONCAT_WS('-', NEW.`categoria`, NEW.`user_id`), 'U', v_antes, v_despues);
  END IF;
END;

-- bit_notif_suscriptores_del
CREATE TRIGGER `bit_notif_suscriptores_del` AFTER DELETE ON `notif_suscriptores` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'notif_suscriptores', CONCAT_WS('-', OLD.`categoria`, OLD.`user_id`), 'D', JSON_OBJECT('categoria', OLD.`categoria`, 'user_id', OLD.`user_id`, 'creado_en', OLD.`creado_en`, 'creado_por', OLD.`creado_por`), NULL);
END;

