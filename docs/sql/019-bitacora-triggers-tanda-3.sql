-- Bitácora · triggers de «antes y después», tanda 3
--
-- NO CORRER EN phpMyAdmin. Creados ahí quedarían con el usuario temporal de cPanel y
-- fallarían con el error 1449, como crud_diesel. Se instalan con
-- docs/backend/bitacora_triggers.php, que usa la conexión de la app.
-- Este archivo es la copia para revisar; el PHP lleva exactamente las mismas sentencias.
--
-- Tablas: pagos_semanales, pagos_detalle, stage_stops, trip_stage_invoices, gastos_viaje, programacion_trips, trucks, caja, drivers, companies, warehouses
-- Generado desde docs/sql/bitacora-esquema-2026-11-18.json con
-- docs/sql/generar-triggers-bitacora.py.
--
-- Qué hace cada uno: al dar de alta guarda el registro completo; al editar guarda solo
-- las columnas que cambiaron (y nada si no cambió ninguna); al borrar guarda el registro
-- completo. Columnas que nunca se guardan: trip_stage_invoices.json_data, trucks.current_fuel, trucks.dist_nv_l, trucks.last_fuel_calc_at, trucks.last_latitude, trucks.last_longitude, trucks.last_odometer_calc.
-- Quién y en qué petición salen de @ima_usuario y @ima_peticion, que pone conexion.php
-- en cada conexión. Si algo falla dentro del trigger, el manejador lo traga y el guardado
-- sigue.
--
-- No modifican ninguna tabla ni agregan columnas. Antes de RENOMBRAR o BORRAR una
-- columna de estas tablas hay que quitar sus triggers (accion=quitar&tabla=…).

-- bit_pagos_semanales_ins
CREATE TRIGGER `bit_pagos_semanales_ins` AFTER INSERT ON `pagos_semanales` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'pagos_semanales', CONCAT_WS('-', NEW.`period_id`), 'I', NULL, JSON_OBJECT('period_id', NEW.`period_id`, 'anio', NEW.`anio`, 'semana', NEW.`semana`, 'fecha_corte', NEW.`fecha_corte`, 'estado', NEW.`estado`, 'autorizado_en', NEW.`autorizado_en`));
END;

-- bit_pagos_semanales_upd
CREATE TRIGGER `bit_pagos_semanales_upd` AFTER UPDATE ON `pagos_semanales` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  IF NOT (OLD.`period_id` <=> NEW.`period_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."period_id"', OLD.`period_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."period_id"', NEW.`period_id`);
  END IF;
  IF NOT (OLD.`anio` <=> NEW.`anio`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."anio"', OLD.`anio`);
    SET v_despues = JSON_INSERT(v_despues, '$."anio"', NEW.`anio`);
  END IF;
  IF NOT (OLD.`semana` <=> NEW.`semana`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."semana"', OLD.`semana`);
    SET v_despues = JSON_INSERT(v_despues, '$."semana"', NEW.`semana`);
  END IF;
  IF NOT (OLD.`fecha_corte` <=> NEW.`fecha_corte`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."fecha_corte"', OLD.`fecha_corte`);
    SET v_despues = JSON_INSERT(v_despues, '$."fecha_corte"', NEW.`fecha_corte`);
  END IF;
  IF NOT (OLD.`estado` <=> NEW.`estado`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."estado"', OLD.`estado`);
    SET v_despues = JSON_INSERT(v_despues, '$."estado"', NEW.`estado`);
  END IF;
  IF NOT (OLD.`autorizado_en` <=> NEW.`autorizado_en`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."autorizado_en"', OLD.`autorizado_en`);
    SET v_despues = JSON_INSERT(v_despues, '$."autorizado_en"', NEW.`autorizado_en`);
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'pagos_semanales', CONCAT_WS('-', NEW.`period_id`), 'U', v_antes, v_despues);
  END IF;
END;

-- bit_pagos_semanales_del
CREATE TRIGGER `bit_pagos_semanales_del` AFTER DELETE ON `pagos_semanales` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'pagos_semanales', CONCAT_WS('-', OLD.`period_id`), 'D', JSON_OBJECT('period_id', OLD.`period_id`, 'anio', OLD.`anio`, 'semana', OLD.`semana`, 'fecha_corte', OLD.`fecha_corte`, 'estado', OLD.`estado`, 'autorizado_en', OLD.`autorizado_en`), NULL);
END;

-- bit_pagos_detalle_ins
CREATE TRIGGER `bit_pagos_detalle_ins` AFTER INSERT ON `pagos_detalle` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'pagos_detalle', CONCAT_WS('-', NEW.`id`), 'I', NULL, JSON_OBJECT('id', NEW.`id`, 'period_id', NEW.`period_id`, 'personal_id', NEW.`personal_id`, 'nombre', NEW.`nombre`, 'puesto', NEW.`puesto`, 'sueldo', NEW.`sueldo`, 'frecuencia_pago', NEW.`frecuencia_pago`, 'tipo_nomina', NEW.`tipo_nomina`));
END;

-- bit_pagos_detalle_upd
CREATE TRIGGER `bit_pagos_detalle_upd` AFTER UPDATE ON `pagos_detalle` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  IF NOT (OLD.`id` <=> NEW.`id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."id"', OLD.`id`);
    SET v_despues = JSON_INSERT(v_despues, '$."id"', NEW.`id`);
  END IF;
  IF NOT (OLD.`period_id` <=> NEW.`period_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."period_id"', OLD.`period_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."period_id"', NEW.`period_id`);
  END IF;
  IF NOT (OLD.`personal_id` <=> NEW.`personal_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."personal_id"', OLD.`personal_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."personal_id"', NEW.`personal_id`);
  END IF;
  IF NOT (OLD.`nombre` <=> NEW.`nombre`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."nombre"', OLD.`nombre`);
    SET v_despues = JSON_INSERT(v_despues, '$."nombre"', NEW.`nombre`);
  END IF;
  IF NOT (OLD.`puesto` <=> NEW.`puesto`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."puesto"', OLD.`puesto`);
    SET v_despues = JSON_INSERT(v_despues, '$."puesto"', NEW.`puesto`);
  END IF;
  IF NOT (OLD.`sueldo` <=> NEW.`sueldo`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."sueldo"', OLD.`sueldo`);
    SET v_despues = JSON_INSERT(v_despues, '$."sueldo"', NEW.`sueldo`);
  END IF;
  IF NOT (OLD.`frecuencia_pago` <=> NEW.`frecuencia_pago`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."frecuencia_pago"', OLD.`frecuencia_pago`);
    SET v_despues = JSON_INSERT(v_despues, '$."frecuencia_pago"', NEW.`frecuencia_pago`);
  END IF;
  IF NOT (OLD.`tipo_nomina` <=> NEW.`tipo_nomina`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."tipo_nomina"', OLD.`tipo_nomina`);
    SET v_despues = JSON_INSERT(v_despues, '$."tipo_nomina"', NEW.`tipo_nomina`);
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'pagos_detalle', CONCAT_WS('-', NEW.`id`), 'U', v_antes, v_despues);
  END IF;
END;

-- bit_pagos_detalle_del
CREATE TRIGGER `bit_pagos_detalle_del` AFTER DELETE ON `pagos_detalle` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'pagos_detalle', CONCAT_WS('-', OLD.`id`), 'D', JSON_OBJECT('id', OLD.`id`, 'period_id', OLD.`period_id`, 'personal_id', OLD.`personal_id`, 'nombre', OLD.`nombre`, 'puesto', OLD.`puesto`, 'sueldo', OLD.`sueldo`, 'frecuencia_pago', OLD.`frecuencia_pago`, 'tipo_nomina', OLD.`tipo_nomina`), NULL);
END;

-- bit_stage_stops_ins
CREATE TRIGGER `bit_stage_stops_ins` AFTER INSERT ON `stage_stops` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'stage_stops', CONCAT_WS('-', NEW.`stop_id`), 'I', NULL, JSON_OBJECT('stop_id', NEW.`stop_id`, 'trip_stage_id', NEW.`trip_stage_id`, 'location', NEW.`location`, 'bl_firmado_document_id', NEW.`bl_firmado_document_id`, 'stop_order', NEW.`stop_order`, 'created_at', NEW.`created_at`, 'updated_at', NEW.`updated_at`, 'time_of_delivery', NEW.`time_of_delivery`));
END;

-- bit_stage_stops_upd
CREATE TRIGGER `bit_stage_stops_upd` AFTER UPDATE ON `stage_stops` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  IF NOT (OLD.`stop_id` <=> NEW.`stop_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."stop_id"', OLD.`stop_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."stop_id"', NEW.`stop_id`);
  END IF;
  IF NOT (OLD.`trip_stage_id` <=> NEW.`trip_stage_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."trip_stage_id"', OLD.`trip_stage_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."trip_stage_id"', NEW.`trip_stage_id`);
  END IF;
  IF NOT (OLD.`location` <=> NEW.`location`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."location"', OLD.`location`);
    SET v_despues = JSON_INSERT(v_despues, '$."location"', NEW.`location`);
  END IF;
  IF NOT (OLD.`bl_firmado_document_id` <=> NEW.`bl_firmado_document_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."bl_firmado_document_id"', OLD.`bl_firmado_document_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."bl_firmado_document_id"', NEW.`bl_firmado_document_id`);
  END IF;
  IF NOT (OLD.`stop_order` <=> NEW.`stop_order`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."stop_order"', OLD.`stop_order`);
    SET v_despues = JSON_INSERT(v_despues, '$."stop_order"', NEW.`stop_order`);
  END IF;
  IF NOT (OLD.`created_at` <=> NEW.`created_at`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."created_at"', OLD.`created_at`);
    SET v_despues = JSON_INSERT(v_despues, '$."created_at"', NEW.`created_at`);
  END IF;
  IF NOT (OLD.`updated_at` <=> NEW.`updated_at`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."updated_at"', OLD.`updated_at`);
    SET v_despues = JSON_INSERT(v_despues, '$."updated_at"', NEW.`updated_at`);
  END IF;
  IF NOT (OLD.`time_of_delivery` <=> NEW.`time_of_delivery`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."time_of_delivery"', OLD.`time_of_delivery`);
    SET v_despues = JSON_INSERT(v_despues, '$."time_of_delivery"', NEW.`time_of_delivery`);
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'stage_stops', CONCAT_WS('-', NEW.`stop_id`), 'U', v_antes, v_despues);
  END IF;
END;

-- bit_stage_stops_del
CREATE TRIGGER `bit_stage_stops_del` AFTER DELETE ON `stage_stops` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'stage_stops', CONCAT_WS('-', OLD.`stop_id`), 'D', JSON_OBJECT('stop_id', OLD.`stop_id`, 'trip_stage_id', OLD.`trip_stage_id`, 'location', OLD.`location`, 'bl_firmado_document_id', OLD.`bl_firmado_document_id`, 'stop_order', OLD.`stop_order`, 'created_at', OLD.`created_at`, 'updated_at', OLD.`updated_at`, 'time_of_delivery', OLD.`time_of_delivery`), NULL);
END;

-- bit_trip_stage_invoices_ins
CREATE TRIGGER `bit_trip_stage_invoices_ins` AFTER INSERT ON `trip_stage_invoices` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'trip_stage_invoices', CONCAT_WS('-', NEW.`id`), 'I', NULL, JSON_OBJECT('id', NEW.`id`, 'stage_id', NEW.`stage_id`, 'invoice_number', NEW.`invoice_number`, 'file_path', NEW.`file_path`, 'version', NEW.`version`, 'is_active', NEW.`is_active`, 'created_at', NEW.`created_at`));
END;

-- bit_trip_stage_invoices_upd
CREATE TRIGGER `bit_trip_stage_invoices_upd` AFTER UPDATE ON `trip_stage_invoices` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  IF NOT (OLD.`id` <=> NEW.`id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."id"', OLD.`id`);
    SET v_despues = JSON_INSERT(v_despues, '$."id"', NEW.`id`);
  END IF;
  IF NOT (OLD.`stage_id` <=> NEW.`stage_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."stage_id"', OLD.`stage_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."stage_id"', NEW.`stage_id`);
  END IF;
  IF NOT (OLD.`invoice_number` <=> NEW.`invoice_number`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."invoice_number"', OLD.`invoice_number`);
    SET v_despues = JSON_INSERT(v_despues, '$."invoice_number"', NEW.`invoice_number`);
  END IF;
  IF NOT (OLD.`file_path` <=> NEW.`file_path`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."file_path"', OLD.`file_path`);
    SET v_despues = JSON_INSERT(v_despues, '$."file_path"', NEW.`file_path`);
  END IF;
  IF NOT (OLD.`version` <=> NEW.`version`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."version"', OLD.`version`);
    SET v_despues = JSON_INSERT(v_despues, '$."version"', NEW.`version`);
  END IF;
  IF NOT (OLD.`is_active` <=> NEW.`is_active`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."is_active"', OLD.`is_active`);
    SET v_despues = JSON_INSERT(v_despues, '$."is_active"', NEW.`is_active`);
  END IF;
  IF NOT (OLD.`created_at` <=> NEW.`created_at`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."created_at"', OLD.`created_at`);
    SET v_despues = JSON_INSERT(v_despues, '$."created_at"', NEW.`created_at`);
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'trip_stage_invoices', CONCAT_WS('-', NEW.`id`), 'U', v_antes, v_despues);
  END IF;
END;

-- bit_trip_stage_invoices_del
CREATE TRIGGER `bit_trip_stage_invoices_del` AFTER DELETE ON `trip_stage_invoices` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'trip_stage_invoices', CONCAT_WS('-', OLD.`id`), 'D', JSON_OBJECT('id', OLD.`id`, 'stage_id', OLD.`stage_id`, 'invoice_number', OLD.`invoice_number`, 'file_path', OLD.`file_path`, 'version', OLD.`version`, 'is_active', OLD.`is_active`, 'created_at', OLD.`created_at`), NULL);
END;

-- bit_gastos_viaje_ins
CREATE TRIGGER `bit_gastos_viaje_ins` AFTER INSERT ON `gastos_viaje` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'gastos_viaje', CONCAT_WS('-', NEW.`id`), 'I', NULL, JSON_OBJECT('id', NEW.`id`, 'trip_id', NEW.`trip_id`, 'driver_id', NEW.`driver_id`, 'tipo_gasto', NEW.`tipo_gasto`, 'monto', NEW.`monto`, 'fecha', NEW.`fecha`, 'created_by', NEW.`created_by`, 'created_at', NEW.`created_at`, 'updated_by', NEW.`updated_by`, 'updated_at', NEW.`updated_at`));
END;

-- bit_gastos_viaje_upd
CREATE TRIGGER `bit_gastos_viaje_upd` AFTER UPDATE ON `gastos_viaje` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  IF NOT (OLD.`id` <=> NEW.`id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."id"', OLD.`id`);
    SET v_despues = JSON_INSERT(v_despues, '$."id"', NEW.`id`);
  END IF;
  IF NOT (OLD.`trip_id` <=> NEW.`trip_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."trip_id"', OLD.`trip_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."trip_id"', NEW.`trip_id`);
  END IF;
  IF NOT (OLD.`driver_id` <=> NEW.`driver_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."driver_id"', OLD.`driver_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."driver_id"', NEW.`driver_id`);
  END IF;
  IF NOT (OLD.`tipo_gasto` <=> NEW.`tipo_gasto`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."tipo_gasto"', OLD.`tipo_gasto`);
    SET v_despues = JSON_INSERT(v_despues, '$."tipo_gasto"', NEW.`tipo_gasto`);
  END IF;
  IF NOT (OLD.`monto` <=> NEW.`monto`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."monto"', OLD.`monto`);
    SET v_despues = JSON_INSERT(v_despues, '$."monto"', NEW.`monto`);
  END IF;
  IF NOT (OLD.`fecha` <=> NEW.`fecha`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."fecha"', OLD.`fecha`);
    SET v_despues = JSON_INSERT(v_despues, '$."fecha"', NEW.`fecha`);
  END IF;
  IF NOT (OLD.`created_by` <=> NEW.`created_by`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."created_by"', OLD.`created_by`);
    SET v_despues = JSON_INSERT(v_despues, '$."created_by"', NEW.`created_by`);
  END IF;
  IF NOT (OLD.`created_at` <=> NEW.`created_at`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."created_at"', OLD.`created_at`);
    SET v_despues = JSON_INSERT(v_despues, '$."created_at"', NEW.`created_at`);
  END IF;
  IF NOT (OLD.`updated_by` <=> NEW.`updated_by`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."updated_by"', OLD.`updated_by`);
    SET v_despues = JSON_INSERT(v_despues, '$."updated_by"', NEW.`updated_by`);
  END IF;
  IF NOT (OLD.`updated_at` <=> NEW.`updated_at`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."updated_at"', OLD.`updated_at`);
    SET v_despues = JSON_INSERT(v_despues, '$."updated_at"', NEW.`updated_at`);
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'gastos_viaje', CONCAT_WS('-', NEW.`id`), 'U', v_antes, v_despues);
  END IF;
END;

-- bit_gastos_viaje_del
CREATE TRIGGER `bit_gastos_viaje_del` AFTER DELETE ON `gastos_viaje` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'gastos_viaje', CONCAT_WS('-', OLD.`id`), 'D', JSON_OBJECT('id', OLD.`id`, 'trip_id', OLD.`trip_id`, 'driver_id', OLD.`driver_id`, 'tipo_gasto', OLD.`tipo_gasto`, 'monto', OLD.`monto`, 'fecha', OLD.`fecha`, 'created_by', OLD.`created_by`, 'created_at', OLD.`created_at`, 'updated_by', OLD.`updated_by`, 'updated_at', OLD.`updated_at`), NULL);
END;

-- bit_programacion_trips_ins
CREATE TRIGGER `bit_programacion_trips_ins` AFTER INSERT ON `programacion_trips` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'programacion_trips', CONCAT_WS('-', NEW.`id`), 'I', NULL, JSON_OBJECT('id', NEW.`id`, 'driver_id', NEW.`driver_id`, 'truck_id', NEW.`truck_id`, 'caja_id', NEW.`caja_id`, 'caja_externa_id', NEW.`caja_externa_id`, 'company_id', NEW.`company_id`, 'destino', NEW.`destino`, 'salida', NEW.`salida`));
END;

-- bit_programacion_trips_upd
CREATE TRIGGER `bit_programacion_trips_upd` AFTER UPDATE ON `programacion_trips` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  IF NOT (OLD.`id` <=> NEW.`id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."id"', OLD.`id`);
    SET v_despues = JSON_INSERT(v_despues, '$."id"', NEW.`id`);
  END IF;
  IF NOT (OLD.`driver_id` <=> NEW.`driver_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."driver_id"', OLD.`driver_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."driver_id"', NEW.`driver_id`);
  END IF;
  IF NOT (OLD.`truck_id` <=> NEW.`truck_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."truck_id"', OLD.`truck_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."truck_id"', NEW.`truck_id`);
  END IF;
  IF NOT (OLD.`caja_id` <=> NEW.`caja_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."caja_id"', OLD.`caja_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."caja_id"', NEW.`caja_id`);
  END IF;
  IF NOT (OLD.`caja_externa_id` <=> NEW.`caja_externa_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."caja_externa_id"', OLD.`caja_externa_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."caja_externa_id"', NEW.`caja_externa_id`);
  END IF;
  IF NOT (OLD.`company_id` <=> NEW.`company_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."company_id"', OLD.`company_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."company_id"', NEW.`company_id`);
  END IF;
  IF NOT (OLD.`destino` <=> NEW.`destino`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."destino"', OLD.`destino`);
    SET v_despues = JSON_INSERT(v_despues, '$."destino"', NEW.`destino`);
  END IF;
  IF NOT (OLD.`salida` <=> NEW.`salida`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."salida"', OLD.`salida`);
    SET v_despues = JSON_INSERT(v_despues, '$."salida"', NEW.`salida`);
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'programacion_trips', CONCAT_WS('-', NEW.`id`), 'U', v_antes, v_despues);
  END IF;
END;

-- bit_programacion_trips_del
CREATE TRIGGER `bit_programacion_trips_del` AFTER DELETE ON `programacion_trips` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'programacion_trips', CONCAT_WS('-', OLD.`id`), 'D', JSON_OBJECT('id', OLD.`id`, 'driver_id', OLD.`driver_id`, 'truck_id', OLD.`truck_id`, 'caja_id', OLD.`caja_id`, 'caja_externa_id', OLD.`caja_externa_id`, 'company_id', OLD.`company_id`, 'destino', OLD.`destino`, 'salida', OLD.`salida`), NULL);
END;

-- bit_trucks_ins
CREATE TRIGGER `bit_trucks_ins` AFTER INSERT ON `trucks` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'trucks', CONCAT_WS('-', NEW.`truck_id`), 'I', NULL, JSON_OBJECT('truck_id', NEW.`truck_id`, 'unidad', NEW.`unidad`, 'Placa_MEX', NEW.`Placa_MEX`, 'Placa_EUA', NEW.`Placa_EUA`, 'Modelo', NEW.`Modelo`, 'Marca_camion', NEW.`Marca_camion`, 'Numero_VIN', NEW.`Numero_VIN`, 'status', NEW.`status`, 'Tag', NEW.`Tag`, 'activo', (NEW.`activo` + 0), 'tank_capacity', NEW.`tank_capacity`, 'ultima_afinacion_fecha', NEW.`ultima_afinacion_fecha`, 'manual_offset', NEW.`manual_offset`, 'odometro_base', NEW.`odometro_base`, 'wialon_unit_id', NEW.`wialon_unit_id`, 'wialon_account', NEW.`wialon_account`, 'limite_afinacion', NEW.`limite_afinacion`));
END;

-- bit_trucks_upd
CREATE TRIGGER `bit_trucks_upd` AFTER UPDATE ON `trucks` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  IF NOT (OLD.`truck_id` <=> NEW.`truck_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."truck_id"', OLD.`truck_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."truck_id"', NEW.`truck_id`);
  END IF;
  IF NOT (OLD.`unidad` <=> NEW.`unidad`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."unidad"', OLD.`unidad`);
    SET v_despues = JSON_INSERT(v_despues, '$."unidad"', NEW.`unidad`);
  END IF;
  IF NOT (OLD.`Placa_MEX` <=> NEW.`Placa_MEX`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."Placa_MEX"', OLD.`Placa_MEX`);
    SET v_despues = JSON_INSERT(v_despues, '$."Placa_MEX"', NEW.`Placa_MEX`);
  END IF;
  IF NOT (OLD.`Placa_EUA` <=> NEW.`Placa_EUA`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."Placa_EUA"', OLD.`Placa_EUA`);
    SET v_despues = JSON_INSERT(v_despues, '$."Placa_EUA"', NEW.`Placa_EUA`);
  END IF;
  IF NOT (OLD.`Modelo` <=> NEW.`Modelo`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."Modelo"', OLD.`Modelo`);
    SET v_despues = JSON_INSERT(v_despues, '$."Modelo"', NEW.`Modelo`);
  END IF;
  IF NOT (OLD.`Marca_camion` <=> NEW.`Marca_camion`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."Marca_camion"', OLD.`Marca_camion`);
    SET v_despues = JSON_INSERT(v_despues, '$."Marca_camion"', NEW.`Marca_camion`);
  END IF;
  IF NOT (OLD.`Numero_VIN` <=> NEW.`Numero_VIN`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."Numero_VIN"', OLD.`Numero_VIN`);
    SET v_despues = JSON_INSERT(v_despues, '$."Numero_VIN"', NEW.`Numero_VIN`);
  END IF;
  IF NOT (OLD.`status` <=> NEW.`status`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."status"', OLD.`status`);
    SET v_despues = JSON_INSERT(v_despues, '$."status"', NEW.`status`);
  END IF;
  IF NOT (OLD.`Tag` <=> NEW.`Tag`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."Tag"', OLD.`Tag`);
    SET v_despues = JSON_INSERT(v_despues, '$."Tag"', NEW.`Tag`);
  END IF;
  IF NOT (OLD.`activo` <=> NEW.`activo`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."activo"', (OLD.`activo` + 0));
    SET v_despues = JSON_INSERT(v_despues, '$."activo"', (NEW.`activo` + 0));
  END IF;
  IF NOT (OLD.`tank_capacity` <=> NEW.`tank_capacity`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."tank_capacity"', OLD.`tank_capacity`);
    SET v_despues = JSON_INSERT(v_despues, '$."tank_capacity"', NEW.`tank_capacity`);
  END IF;
  IF NOT (OLD.`ultima_afinacion_fecha` <=> NEW.`ultima_afinacion_fecha`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."ultima_afinacion_fecha"', OLD.`ultima_afinacion_fecha`);
    SET v_despues = JSON_INSERT(v_despues, '$."ultima_afinacion_fecha"', NEW.`ultima_afinacion_fecha`);
  END IF;
  IF NOT (OLD.`manual_offset` <=> NEW.`manual_offset`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."manual_offset"', OLD.`manual_offset`);
    SET v_despues = JSON_INSERT(v_despues, '$."manual_offset"', NEW.`manual_offset`);
  END IF;
  IF NOT (OLD.`odometro_base` <=> NEW.`odometro_base`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."odometro_base"', OLD.`odometro_base`);
    SET v_despues = JSON_INSERT(v_despues, '$."odometro_base"', NEW.`odometro_base`);
  END IF;
  IF NOT (OLD.`wialon_unit_id` <=> NEW.`wialon_unit_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."wialon_unit_id"', OLD.`wialon_unit_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."wialon_unit_id"', NEW.`wialon_unit_id`);
  END IF;
  IF NOT (OLD.`wialon_account` <=> NEW.`wialon_account`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."wialon_account"', OLD.`wialon_account`);
    SET v_despues = JSON_INSERT(v_despues, '$."wialon_account"', NEW.`wialon_account`);
  END IF;
  IF NOT (OLD.`limite_afinacion` <=> NEW.`limite_afinacion`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."limite_afinacion"', OLD.`limite_afinacion`);
    SET v_despues = JSON_INSERT(v_despues, '$."limite_afinacion"', NEW.`limite_afinacion`);
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'trucks', CONCAT_WS('-', NEW.`truck_id`), 'U', v_antes, v_despues);
  END IF;
END;

-- bit_trucks_del
CREATE TRIGGER `bit_trucks_del` AFTER DELETE ON `trucks` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'trucks', CONCAT_WS('-', OLD.`truck_id`), 'D', JSON_OBJECT('truck_id', OLD.`truck_id`, 'unidad', OLD.`unidad`, 'Placa_MEX', OLD.`Placa_MEX`, 'Placa_EUA', OLD.`Placa_EUA`, 'Modelo', OLD.`Modelo`, 'Marca_camion', OLD.`Marca_camion`, 'Numero_VIN', OLD.`Numero_VIN`, 'status', OLD.`status`, 'Tag', OLD.`Tag`, 'activo', (OLD.`activo` + 0), 'tank_capacity', OLD.`tank_capacity`, 'ultima_afinacion_fecha', OLD.`ultima_afinacion_fecha`, 'manual_offset', OLD.`manual_offset`, 'odometro_base', OLD.`odometro_base`, 'wialon_unit_id', OLD.`wialon_unit_id`, 'wialon_account', OLD.`wialon_account`, 'limite_afinacion', OLD.`limite_afinacion`), NULL);
END;

-- bit_caja_ins
CREATE TRIGGER `bit_caja_ins` AFTER INSERT ON `caja` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'caja', CONCAT_WS('-', NEW.`caja_id`), 'I', NULL, JSON_OBJECT('caja_id', NEW.`caja_id`, 'no_caja', NEW.`no_caja`, 'no_placa', NEW.`no_placa`, 'estado_placa', NEW.`estado_placa`, 'no_vin', NEW.`no_vin`, 'status', NEW.`status`, 'activo', (NEW.`activo` + 0)));
END;

-- bit_caja_upd
CREATE TRIGGER `bit_caja_upd` AFTER UPDATE ON `caja` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  IF NOT (OLD.`caja_id` <=> NEW.`caja_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."caja_id"', OLD.`caja_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."caja_id"', NEW.`caja_id`);
  END IF;
  IF NOT (OLD.`no_caja` <=> NEW.`no_caja`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."no_caja"', OLD.`no_caja`);
    SET v_despues = JSON_INSERT(v_despues, '$."no_caja"', NEW.`no_caja`);
  END IF;
  IF NOT (OLD.`no_placa` <=> NEW.`no_placa`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."no_placa"', OLD.`no_placa`);
    SET v_despues = JSON_INSERT(v_despues, '$."no_placa"', NEW.`no_placa`);
  END IF;
  IF NOT (OLD.`estado_placa` <=> NEW.`estado_placa`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."estado_placa"', OLD.`estado_placa`);
    SET v_despues = JSON_INSERT(v_despues, '$."estado_placa"', NEW.`estado_placa`);
  END IF;
  IF NOT (OLD.`no_vin` <=> NEW.`no_vin`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."no_vin"', OLD.`no_vin`);
    SET v_despues = JSON_INSERT(v_despues, '$."no_vin"', NEW.`no_vin`);
  END IF;
  IF NOT (OLD.`status` <=> NEW.`status`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."status"', OLD.`status`);
    SET v_despues = JSON_INSERT(v_despues, '$."status"', NEW.`status`);
  END IF;
  IF NOT (OLD.`activo` <=> NEW.`activo`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."activo"', (OLD.`activo` + 0));
    SET v_despues = JSON_INSERT(v_despues, '$."activo"', (NEW.`activo` + 0));
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'caja', CONCAT_WS('-', NEW.`caja_id`), 'U', v_antes, v_despues);
  END IF;
END;

-- bit_caja_del
CREATE TRIGGER `bit_caja_del` AFTER DELETE ON `caja` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'caja', CONCAT_WS('-', OLD.`caja_id`), 'D', JSON_OBJECT('caja_id', OLD.`caja_id`, 'no_caja', OLD.`no_caja`, 'no_placa', OLD.`no_placa`, 'estado_placa', OLD.`estado_placa`, 'no_vin', OLD.`no_vin`, 'status', OLD.`status`, 'activo', (OLD.`activo` + 0)), NULL);
END;

-- bit_drivers_ins
CREATE TRIGGER `bit_drivers_ins` AFTER INSERT ON `drivers` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'drivers', CONCAT_WS('-', NEW.`driver_id`), 'I', NULL, JSON_OBJECT('driver_id', NEW.`driver_id`, 'nombre', NEW.`nombre`, 'fecha_nacimiento', NEW.`fecha_nacimiento`, 'fecha_ingreso', NEW.`fecha_ingreso`, 'curp', NEW.`curp`, 'rfc', NEW.`rfc`, 'phone_mex', NEW.`phone_mex`, 'phone_usa', NEW.`phone_usa`, 'status', NEW.`status`, 'licencia', NEW.`licencia`, 'visa', NEW.`visa`, 'activo', NEW.`activo`, 'valor_milla', NEW.`valor_milla`, 'motivo_baja', NEW.`motivo_baja`, 'fecha_baja', NEW.`fecha_baja`, 'observaciones_baja', NEW.`observaciones_baja`));
END;

-- bit_drivers_upd
CREATE TRIGGER `bit_drivers_upd` AFTER UPDATE ON `drivers` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  IF NOT (OLD.`driver_id` <=> NEW.`driver_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."driver_id"', OLD.`driver_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."driver_id"', NEW.`driver_id`);
  END IF;
  IF NOT (OLD.`nombre` <=> NEW.`nombre`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."nombre"', OLD.`nombre`);
    SET v_despues = JSON_INSERT(v_despues, '$."nombre"', NEW.`nombre`);
  END IF;
  IF NOT (OLD.`fecha_nacimiento` <=> NEW.`fecha_nacimiento`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."fecha_nacimiento"', OLD.`fecha_nacimiento`);
    SET v_despues = JSON_INSERT(v_despues, '$."fecha_nacimiento"', NEW.`fecha_nacimiento`);
  END IF;
  IF NOT (OLD.`fecha_ingreso` <=> NEW.`fecha_ingreso`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."fecha_ingreso"', OLD.`fecha_ingreso`);
    SET v_despues = JSON_INSERT(v_despues, '$."fecha_ingreso"', NEW.`fecha_ingreso`);
  END IF;
  IF NOT (OLD.`curp` <=> NEW.`curp`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."curp"', OLD.`curp`);
    SET v_despues = JSON_INSERT(v_despues, '$."curp"', NEW.`curp`);
  END IF;
  IF NOT (OLD.`rfc` <=> NEW.`rfc`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."rfc"', OLD.`rfc`);
    SET v_despues = JSON_INSERT(v_despues, '$."rfc"', NEW.`rfc`);
  END IF;
  IF NOT (OLD.`phone_mex` <=> NEW.`phone_mex`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."phone_mex"', OLD.`phone_mex`);
    SET v_despues = JSON_INSERT(v_despues, '$."phone_mex"', NEW.`phone_mex`);
  END IF;
  IF NOT (OLD.`phone_usa` <=> NEW.`phone_usa`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."phone_usa"', OLD.`phone_usa`);
    SET v_despues = JSON_INSERT(v_despues, '$."phone_usa"', NEW.`phone_usa`);
  END IF;
  IF NOT (OLD.`status` <=> NEW.`status`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."status"', OLD.`status`);
    SET v_despues = JSON_INSERT(v_despues, '$."status"', NEW.`status`);
  END IF;
  IF NOT (OLD.`licencia` <=> NEW.`licencia`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."licencia"', OLD.`licencia`);
    SET v_despues = JSON_INSERT(v_despues, '$."licencia"', NEW.`licencia`);
  END IF;
  IF NOT (OLD.`visa` <=> NEW.`visa`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."visa"', OLD.`visa`);
    SET v_despues = JSON_INSERT(v_despues, '$."visa"', NEW.`visa`);
  END IF;
  IF NOT (OLD.`activo` <=> NEW.`activo`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."activo"', OLD.`activo`);
    SET v_despues = JSON_INSERT(v_despues, '$."activo"', NEW.`activo`);
  END IF;
  IF NOT (OLD.`valor_milla` <=> NEW.`valor_milla`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."valor_milla"', OLD.`valor_milla`);
    SET v_despues = JSON_INSERT(v_despues, '$."valor_milla"', NEW.`valor_milla`);
  END IF;
  IF NOT (OLD.`motivo_baja` <=> NEW.`motivo_baja`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."motivo_baja"', OLD.`motivo_baja`);
    SET v_despues = JSON_INSERT(v_despues, '$."motivo_baja"', NEW.`motivo_baja`);
  END IF;
  IF NOT (OLD.`fecha_baja` <=> NEW.`fecha_baja`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."fecha_baja"', OLD.`fecha_baja`);
    SET v_despues = JSON_INSERT(v_despues, '$."fecha_baja"', NEW.`fecha_baja`);
  END IF;
  IF NOT (OLD.`observaciones_baja` <=> NEW.`observaciones_baja`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."observaciones_baja"', OLD.`observaciones_baja`);
    SET v_despues = JSON_INSERT(v_despues, '$."observaciones_baja"', NEW.`observaciones_baja`);
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'drivers', CONCAT_WS('-', NEW.`driver_id`), 'U', v_antes, v_despues);
  END IF;
END;

-- bit_drivers_del
CREATE TRIGGER `bit_drivers_del` AFTER DELETE ON `drivers` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'drivers', CONCAT_WS('-', OLD.`driver_id`), 'D', JSON_OBJECT('driver_id', OLD.`driver_id`, 'nombre', OLD.`nombre`, 'fecha_nacimiento', OLD.`fecha_nacimiento`, 'fecha_ingreso', OLD.`fecha_ingreso`, 'curp', OLD.`curp`, 'rfc', OLD.`rfc`, 'phone_mex', OLD.`phone_mex`, 'phone_usa', OLD.`phone_usa`, 'status', OLD.`status`, 'licencia', OLD.`licencia`, 'visa', OLD.`visa`, 'activo', OLD.`activo`, 'valor_milla', OLD.`valor_milla`, 'motivo_baja', OLD.`motivo_baja`, 'fecha_baja', OLD.`fecha_baja`, 'observaciones_baja', OLD.`observaciones_baja`), NULL);
END;

-- bit_companies_ins
CREATE TRIGGER `bit_companies_ins` AFTER INSERT ON `companies` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'companies', CONCAT_WS('-', NEW.`company_id`), 'I', NULL, JSON_OBJECT('company_id', NEW.`company_id`, 'nombre_compania', NEW.`nombre_compania`));
END;

-- bit_companies_upd
CREATE TRIGGER `bit_companies_upd` AFTER UPDATE ON `companies` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  IF NOT (OLD.`company_id` <=> NEW.`company_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."company_id"', OLD.`company_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."company_id"', NEW.`company_id`);
  END IF;
  IF NOT (OLD.`nombre_compania` <=> NEW.`nombre_compania`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."nombre_compania"', OLD.`nombre_compania`);
    SET v_despues = JSON_INSERT(v_despues, '$."nombre_compania"', NEW.`nombre_compania`);
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'companies', CONCAT_WS('-', NEW.`company_id`), 'U', v_antes, v_despues);
  END IF;
END;

-- bit_companies_del
CREATE TRIGGER `bit_companies_del` AFTER DELETE ON `companies` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'companies', CONCAT_WS('-', OLD.`company_id`), 'D', JSON_OBJECT('company_id', OLD.`company_id`, 'nombre_compania', OLD.`nombre_compania`), NULL);
END;

-- bit_warehouses_ins
CREATE TRIGGER `bit_warehouses_ins` AFTER INSERT ON `warehouses` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'warehouses', CONCAT_WS('-', NEW.`warehouse_id`), 'I', NULL, JSON_OBJECT('warehouse_id', NEW.`warehouse_id`, 'nombre_almacen', NEW.`nombre_almacen`, 'direccion', NEW.`direccion`));
END;

-- bit_warehouses_upd
CREATE TRIGGER `bit_warehouses_upd` AFTER UPDATE ON `warehouses` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  IF NOT (OLD.`warehouse_id` <=> NEW.`warehouse_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."warehouse_id"', OLD.`warehouse_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."warehouse_id"', NEW.`warehouse_id`);
  END IF;
  IF NOT (OLD.`nombre_almacen` <=> NEW.`nombre_almacen`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."nombre_almacen"', OLD.`nombre_almacen`);
    SET v_despues = JSON_INSERT(v_despues, '$."nombre_almacen"', NEW.`nombre_almacen`);
  END IF;
  IF NOT (OLD.`direccion` <=> NEW.`direccion`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."direccion"', OLD.`direccion`);
    SET v_despues = JSON_INSERT(v_despues, '$."direccion"', NEW.`direccion`);
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'warehouses', CONCAT_WS('-', NEW.`warehouse_id`), 'U', v_antes, v_despues);
  END IF;
END;

-- bit_warehouses_del
CREATE TRIGGER `bit_warehouses_del` AFTER DELETE ON `warehouses` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'warehouses', CONCAT_WS('-', OLD.`warehouse_id`), 'D', JSON_OBJECT('warehouse_id', OLD.`warehouse_id`, 'nombre_almacen', OLD.`nombre_almacen`, 'direccion', OLD.`direccion`), NULL);
END;

