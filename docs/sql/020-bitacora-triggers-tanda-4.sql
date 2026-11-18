-- Bitácora · triggers de «antes y después», tanda 4
--
-- NO CORRER EN phpMyAdmin. Creados ahí quedarían con el usuario temporal de cPanel y
-- fallarían con el error 1449, como crud_diesel. Se instalan con
-- docs/backend/bitacora_triggers.php, que usa la conexión de la app.
-- Este archivo es la copia para revisar; el PHP lleva exactamente las mismas sentencias.
--
-- Tablas: personal_admin, milla_driver, company_invoice_info, pago_trayecto_viaje, diesel_fuente_margen, cajas_externas, mtto_puntos, mtto_inspeccion_lado, mtto_concepto_detalle, mtto_notif_suscriptores, caja_estatus, roadside_repairs, inspections, servicios_orden, afinaciones_historial
-- Generado desde docs/sql/bitacora-esquema-2026-11-18.json con
-- docs/sql/generar-triggers-bitacora.py.
--
-- Qué hace cada uno: al dar de alta guarda el registro completo; al editar guarda solo
-- las columnas que cambiaron (y nada si no cambió ninguna); al borrar guarda el registro
-- completo. Columnas que nunca se guardan: inspections.reportes_json.
-- Quién y en qué petición salen de @ima_usuario y @ima_peticion, que pone conexion.php
-- en cada conexión. Si algo falla dentro del trigger, el manejador lo traga y el guardado
-- sigue.
--
-- No modifican ninguna tabla ni agregan columnas. Antes de RENOMBRAR o BORRAR una
-- columna de estas tablas hay que quitar sus triggers (accion=quitar&tabla=…).

-- bit_personal_admin_ins
CREATE TRIGGER `bit_personal_admin_ins` AFTER INSERT ON `personal_admin` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'personal_admin', CONCAT_WS('-', NEW.`id`), 'I', NULL, JSON_OBJECT('id', NEW.`id`, 'nombre', NEW.`nombre`, 'puesto', NEW.`puesto`, 'sueldo', NEW.`sueldo`, 'frecuencia_pago', NEW.`frecuencia_pago`, 'tipo_nomina', NEW.`tipo_nomina`, 'created_at', NEW.`created_at`, 'status', NEW.`status`));
END;

-- bit_personal_admin_upd
CREATE TRIGGER `bit_personal_admin_upd` AFTER UPDATE ON `personal_admin` FOR EACH ROW
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
  IF NOT (OLD.`created_at` <=> NEW.`created_at`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."created_at"', OLD.`created_at`);
    SET v_despues = JSON_INSERT(v_despues, '$."created_at"', NEW.`created_at`);
  END IF;
  IF NOT (OLD.`status` <=> NEW.`status`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."status"', OLD.`status`);
    SET v_despues = JSON_INSERT(v_despues, '$."status"', NEW.`status`);
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'personal_admin', CONCAT_WS('-', NEW.`id`), 'U', v_antes, v_despues);
  END IF;
END;

-- bit_personal_admin_del
CREATE TRIGGER `bit_personal_admin_del` AFTER DELETE ON `personal_admin` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'personal_admin', CONCAT_WS('-', OLD.`id`), 'D', JSON_OBJECT('id', OLD.`id`, 'nombre', OLD.`nombre`, 'puesto', OLD.`puesto`, 'sueldo', OLD.`sueldo`, 'frecuencia_pago', OLD.`frecuencia_pago`, 'tipo_nomina', OLD.`tipo_nomina`, 'created_at', OLD.`created_at`, 'status', OLD.`status`), NULL);
END;

-- bit_milla_driver_ins
CREATE TRIGGER `bit_milla_driver_ins` AFTER INSERT ON `milla_driver` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'milla_driver', CONCAT_WS('-', NEW.`milla_id`), 'I', NULL, JSON_OBJECT('milla_id', NEW.`milla_id`, 'driver_id', NEW.`driver_id`, 'valor_milla', NEW.`valor_milla`));
END;

-- bit_milla_driver_upd
CREATE TRIGGER `bit_milla_driver_upd` AFTER UPDATE ON `milla_driver` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  IF NOT (OLD.`milla_id` <=> NEW.`milla_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."milla_id"', OLD.`milla_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."milla_id"', NEW.`milla_id`);
  END IF;
  IF NOT (OLD.`driver_id` <=> NEW.`driver_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."driver_id"', OLD.`driver_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."driver_id"', NEW.`driver_id`);
  END IF;
  IF NOT (OLD.`valor_milla` <=> NEW.`valor_milla`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."valor_milla"', OLD.`valor_milla`);
    SET v_despues = JSON_INSERT(v_despues, '$."valor_milla"', NEW.`valor_milla`);
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'milla_driver', CONCAT_WS('-', NEW.`milla_id`), 'U', v_antes, v_despues);
  END IF;
END;

-- bit_milla_driver_del
CREATE TRIGGER `bit_milla_driver_del` AFTER DELETE ON `milla_driver` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'milla_driver', CONCAT_WS('-', OLD.`milla_id`), 'D', JSON_OBJECT('milla_id', OLD.`milla_id`, 'driver_id', OLD.`driver_id`, 'valor_milla', OLD.`valor_milla`), NULL);
END;

-- bit_company_invoice_info_ins
CREATE TRIGGER `bit_company_invoice_info_ins` AFTER INSERT ON `company_invoice_info` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'company_invoice_info', CONCAT_WS('-', NEW.`company_id`), 'I', NULL, JSON_OBJECT('company_id', NEW.`company_id`, 'nombre_factura', NEW.`nombre_factura`, 'direccion', NEW.`direccion`, 'updated_at', NEW.`updated_at`));
END;

-- bit_company_invoice_info_upd
CREATE TRIGGER `bit_company_invoice_info_upd` AFTER UPDATE ON `company_invoice_info` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  IF NOT (OLD.`company_id` <=> NEW.`company_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."company_id"', OLD.`company_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."company_id"', NEW.`company_id`);
  END IF;
  IF NOT (OLD.`nombre_factura` <=> NEW.`nombre_factura`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."nombre_factura"', OLD.`nombre_factura`);
    SET v_despues = JSON_INSERT(v_despues, '$."nombre_factura"', NEW.`nombre_factura`);
  END IF;
  IF NOT (OLD.`direccion` <=> NEW.`direccion`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."direccion"', OLD.`direccion`);
    SET v_despues = JSON_INSERT(v_despues, '$."direccion"', NEW.`direccion`);
  END IF;
  IF NOT (OLD.`updated_at` <=> NEW.`updated_at`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."updated_at"', OLD.`updated_at`);
    SET v_despues = JSON_INSERT(v_despues, '$."updated_at"', NEW.`updated_at`);
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'company_invoice_info', CONCAT_WS('-', NEW.`company_id`), 'U', v_antes, v_despues);
  END IF;
END;

-- bit_company_invoice_info_del
CREATE TRIGGER `bit_company_invoice_info_del` AFTER DELETE ON `company_invoice_info` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'company_invoice_info', CONCAT_WS('-', OLD.`company_id`), 'D', JSON_OBJECT('company_id', OLD.`company_id`, 'nombre_factura', OLD.`nombre_factura`, 'direccion', OLD.`direccion`, 'updated_at', OLD.`updated_at`), NULL);
END;

-- bit_pago_trayecto_viaje_ins
CREATE TRIGGER `bit_pago_trayecto_viaje_ins` AFTER INSERT ON `pago_trayecto_viaje` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'pago_trayecto_viaje', CONCAT_WS('-', NEW.`trip_id`, NEW.`driver_id`), 'I', NULL, JSON_OBJECT('trip_id', NEW.`trip_id`, 'driver_id', NEW.`driver_id`, 'trayecto_id', NEW.`trayecto_id`, 'monto', NEW.`monto`, 'id_usuario', NEW.`id_usuario`, 'asignado_en', NEW.`asignado_en`));
END;

-- bit_pago_trayecto_viaje_upd
CREATE TRIGGER `bit_pago_trayecto_viaje_upd` AFTER UPDATE ON `pago_trayecto_viaje` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  IF NOT (OLD.`trip_id` <=> NEW.`trip_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."trip_id"', OLD.`trip_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."trip_id"', NEW.`trip_id`);
  END IF;
  IF NOT (OLD.`driver_id` <=> NEW.`driver_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."driver_id"', OLD.`driver_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."driver_id"', NEW.`driver_id`);
  END IF;
  IF NOT (OLD.`trayecto_id` <=> NEW.`trayecto_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."trayecto_id"', OLD.`trayecto_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."trayecto_id"', NEW.`trayecto_id`);
  END IF;
  IF NOT (OLD.`monto` <=> NEW.`monto`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."monto"', OLD.`monto`);
    SET v_despues = JSON_INSERT(v_despues, '$."monto"', NEW.`monto`);
  END IF;
  IF NOT (OLD.`id_usuario` <=> NEW.`id_usuario`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."id_usuario"', OLD.`id_usuario`);
    SET v_despues = JSON_INSERT(v_despues, '$."id_usuario"', NEW.`id_usuario`);
  END IF;
  IF NOT (OLD.`asignado_en` <=> NEW.`asignado_en`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."asignado_en"', OLD.`asignado_en`);
    SET v_despues = JSON_INSERT(v_despues, '$."asignado_en"', NEW.`asignado_en`);
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'pago_trayecto_viaje', CONCAT_WS('-', NEW.`trip_id`, NEW.`driver_id`), 'U', v_antes, v_despues);
  END IF;
END;

-- bit_pago_trayecto_viaje_del
CREATE TRIGGER `bit_pago_trayecto_viaje_del` AFTER DELETE ON `pago_trayecto_viaje` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'pago_trayecto_viaje', CONCAT_WS('-', OLD.`trip_id`, OLD.`driver_id`), 'D', JSON_OBJECT('trip_id', OLD.`trip_id`, 'driver_id', OLD.`driver_id`, 'trayecto_id', OLD.`trayecto_id`, 'monto', OLD.`monto`, 'id_usuario', OLD.`id_usuario`, 'asignado_en', OLD.`asignado_en`), NULL);
END;

-- bit_diesel_fuente_margen_ins
CREATE TRIGGER `bit_diesel_fuente_margen_ins` AFTER INSERT ON `diesel_fuente_margen` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'diesel_fuente_margen', CONCAT_WS('-', NEW.`diesel_id`), 'I', NULL, JSON_OBJECT('diesel_id', NEW.`diesel_id`, 'usar_fleetone', NEW.`usar_fleetone`, 'actualizado_por', NEW.`actualizado_por`, 'actualizado_en', NEW.`actualizado_en`));
END;

-- bit_diesel_fuente_margen_upd
CREATE TRIGGER `bit_diesel_fuente_margen_upd` AFTER UPDATE ON `diesel_fuente_margen` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  IF NOT (OLD.`diesel_id` <=> NEW.`diesel_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."diesel_id"', OLD.`diesel_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."diesel_id"', NEW.`diesel_id`);
  END IF;
  IF NOT (OLD.`usar_fleetone` <=> NEW.`usar_fleetone`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."usar_fleetone"', OLD.`usar_fleetone`);
    SET v_despues = JSON_INSERT(v_despues, '$."usar_fleetone"', NEW.`usar_fleetone`);
  END IF;
  IF NOT (OLD.`actualizado_por` <=> NEW.`actualizado_por`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."actualizado_por"', OLD.`actualizado_por`);
    SET v_despues = JSON_INSERT(v_despues, '$."actualizado_por"', NEW.`actualizado_por`);
  END IF;
  IF NOT (OLD.`actualizado_en` <=> NEW.`actualizado_en`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."actualizado_en"', OLD.`actualizado_en`);
    SET v_despues = JSON_INSERT(v_despues, '$."actualizado_en"', NEW.`actualizado_en`);
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'diesel_fuente_margen', CONCAT_WS('-', NEW.`diesel_id`), 'U', v_antes, v_despues);
  END IF;
END;

-- bit_diesel_fuente_margen_del
CREATE TRIGGER `bit_diesel_fuente_margen_del` AFTER DELETE ON `diesel_fuente_margen` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'diesel_fuente_margen', CONCAT_WS('-', OLD.`diesel_id`), 'D', JSON_OBJECT('diesel_id', OLD.`diesel_id`, 'usar_fleetone', OLD.`usar_fleetone`, 'actualizado_por', OLD.`actualizado_por`, 'actualizado_en', OLD.`actualizado_en`), NULL);
END;

-- bit_cajas_externas_ins
CREATE TRIGGER `bit_cajas_externas_ins` AFTER INSERT ON `cajas_externas` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'cajas_externas', CONCAT_WS('-', NEW.`caja_externa_id`), 'I', NULL, JSON_OBJECT('caja_externa_id', NEW.`caja_externa_id`, 'no_caja', NEW.`no_caja`, 'no_vin', NEW.`no_vin`, 'modelo', NEW.`modelo`, 'anio', NEW.`anio`, 'placas', NEW.`placas`, 'estado', NEW.`estado`, 'fecha_creacion', NEW.`fecha_creacion`, 'status', NEW.`status`));
END;

-- bit_cajas_externas_upd
CREATE TRIGGER `bit_cajas_externas_upd` AFTER UPDATE ON `cajas_externas` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  IF NOT (OLD.`caja_externa_id` <=> NEW.`caja_externa_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."caja_externa_id"', OLD.`caja_externa_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."caja_externa_id"', NEW.`caja_externa_id`);
  END IF;
  IF NOT (OLD.`no_caja` <=> NEW.`no_caja`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."no_caja"', OLD.`no_caja`);
    SET v_despues = JSON_INSERT(v_despues, '$."no_caja"', NEW.`no_caja`);
  END IF;
  IF NOT (OLD.`no_vin` <=> NEW.`no_vin`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."no_vin"', OLD.`no_vin`);
    SET v_despues = JSON_INSERT(v_despues, '$."no_vin"', NEW.`no_vin`);
  END IF;
  IF NOT (OLD.`modelo` <=> NEW.`modelo`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."modelo"', OLD.`modelo`);
    SET v_despues = JSON_INSERT(v_despues, '$."modelo"', NEW.`modelo`);
  END IF;
  IF NOT (OLD.`anio` <=> NEW.`anio`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."anio"', OLD.`anio`);
    SET v_despues = JSON_INSERT(v_despues, '$."anio"', NEW.`anio`);
  END IF;
  IF NOT (OLD.`placas` <=> NEW.`placas`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."placas"', OLD.`placas`);
    SET v_despues = JSON_INSERT(v_despues, '$."placas"', NEW.`placas`);
  END IF;
  IF NOT (OLD.`estado` <=> NEW.`estado`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."estado"', OLD.`estado`);
    SET v_despues = JSON_INSERT(v_despues, '$."estado"', NEW.`estado`);
  END IF;
  IF NOT (OLD.`fecha_creacion` <=> NEW.`fecha_creacion`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."fecha_creacion"', OLD.`fecha_creacion`);
    SET v_despues = JSON_INSERT(v_despues, '$."fecha_creacion"', NEW.`fecha_creacion`);
  END IF;
  IF NOT (OLD.`status` <=> NEW.`status`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."status"', OLD.`status`);
    SET v_despues = JSON_INSERT(v_despues, '$."status"', NEW.`status`);
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'cajas_externas', CONCAT_WS('-', NEW.`caja_externa_id`), 'U', v_antes, v_despues);
  END IF;
END;

-- bit_cajas_externas_del
CREATE TRIGGER `bit_cajas_externas_del` AFTER DELETE ON `cajas_externas` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'cajas_externas', CONCAT_WS('-', OLD.`caja_externa_id`), 'D', JSON_OBJECT('caja_externa_id', OLD.`caja_externa_id`, 'no_caja', OLD.`no_caja`, 'no_vin', OLD.`no_vin`, 'modelo', OLD.`modelo`, 'anio', OLD.`anio`, 'placas', OLD.`placas`, 'estado', OLD.`estado`, 'fecha_creacion', OLD.`fecha_creacion`, 'status', OLD.`status`), NULL);
END;

-- bit_mtto_puntos_ins
CREATE TRIGGER `bit_mtto_puntos_ins` AFTER INSERT ON `mtto_puntos` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'mtto_puntos', CONCAT_WS('-', NEW.`id`), 'I', NULL, JSON_OBJECT('id', NEW.`id`, 'origen', NEW.`origen`, 'cl_final_id', NEW.`cl_final_id`, 'viaje_id', NEW.`viaje_id`, 'categoria', NEW.`categoria`, 'origen_tabla', NEW.`origen_tabla`, 'origen_id', NEW.`origen_id`, 'unidad_tipo', NEW.`unidad_tipo`, 'truck_id', NEW.`truck_id`, 'caja_id', NEW.`caja_id`, 'driver_id', NEW.`driver_id`, 'fecha_reporte', NEW.`fecha_reporte`, 'descripcion', NEW.`descripcion`, 'estatus', NEW.`estatus`, 'descartado_en_pendientes', NEW.`descartado_en_pendientes`, 'id_orden', NEW.`id_orden`, 'id_servicio', NEW.`id_servicio`, 'creado_en', NEW.`creado_en`, 'creado_por', NEW.`creado_por`, 'actualizado_en', NEW.`actualizado_en`, 'actualizado_por', NEW.`actualizado_por`));
END;

-- bit_mtto_puntos_upd
CREATE TRIGGER `bit_mtto_puntos_upd` AFTER UPDATE ON `mtto_puntos` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  IF NOT (OLD.`id` <=> NEW.`id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."id"', OLD.`id`);
    SET v_despues = JSON_INSERT(v_despues, '$."id"', NEW.`id`);
  END IF;
  IF NOT (OLD.`origen` <=> NEW.`origen`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."origen"', OLD.`origen`);
    SET v_despues = JSON_INSERT(v_despues, '$."origen"', NEW.`origen`);
  END IF;
  IF NOT (OLD.`cl_final_id` <=> NEW.`cl_final_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."cl_final_id"', OLD.`cl_final_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."cl_final_id"', NEW.`cl_final_id`);
  END IF;
  IF NOT (OLD.`viaje_id` <=> NEW.`viaje_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."viaje_id"', OLD.`viaje_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."viaje_id"', NEW.`viaje_id`);
  END IF;
  IF NOT (OLD.`categoria` <=> NEW.`categoria`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."categoria"', OLD.`categoria`);
    SET v_despues = JSON_INSERT(v_despues, '$."categoria"', NEW.`categoria`);
  END IF;
  IF NOT (OLD.`origen_tabla` <=> NEW.`origen_tabla`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."origen_tabla"', OLD.`origen_tabla`);
    SET v_despues = JSON_INSERT(v_despues, '$."origen_tabla"', NEW.`origen_tabla`);
  END IF;
  IF NOT (OLD.`origen_id` <=> NEW.`origen_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."origen_id"', OLD.`origen_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."origen_id"', NEW.`origen_id`);
  END IF;
  IF NOT (OLD.`unidad_tipo` <=> NEW.`unidad_tipo`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."unidad_tipo"', OLD.`unidad_tipo`);
    SET v_despues = JSON_INSERT(v_despues, '$."unidad_tipo"', NEW.`unidad_tipo`);
  END IF;
  IF NOT (OLD.`truck_id` <=> NEW.`truck_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."truck_id"', OLD.`truck_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."truck_id"', NEW.`truck_id`);
  END IF;
  IF NOT (OLD.`caja_id` <=> NEW.`caja_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."caja_id"', OLD.`caja_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."caja_id"', NEW.`caja_id`);
  END IF;
  IF NOT (OLD.`driver_id` <=> NEW.`driver_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."driver_id"', OLD.`driver_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."driver_id"', NEW.`driver_id`);
  END IF;
  IF NOT (OLD.`fecha_reporte` <=> NEW.`fecha_reporte`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."fecha_reporte"', OLD.`fecha_reporte`);
    SET v_despues = JSON_INSERT(v_despues, '$."fecha_reporte"', NEW.`fecha_reporte`);
  END IF;
  IF NOT (OLD.`descripcion` <=> NEW.`descripcion`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."descripcion"', OLD.`descripcion`);
    SET v_despues = JSON_INSERT(v_despues, '$."descripcion"', NEW.`descripcion`);
  END IF;
  IF NOT (OLD.`estatus` <=> NEW.`estatus`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."estatus"', OLD.`estatus`);
    SET v_despues = JSON_INSERT(v_despues, '$."estatus"', NEW.`estatus`);
  END IF;
  IF NOT (OLD.`descartado_en_pendientes` <=> NEW.`descartado_en_pendientes`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."descartado_en_pendientes"', OLD.`descartado_en_pendientes`);
    SET v_despues = JSON_INSERT(v_despues, '$."descartado_en_pendientes"', NEW.`descartado_en_pendientes`);
  END IF;
  IF NOT (OLD.`id_orden` <=> NEW.`id_orden`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."id_orden"', OLD.`id_orden`);
    SET v_despues = JSON_INSERT(v_despues, '$."id_orden"', NEW.`id_orden`);
  END IF;
  IF NOT (OLD.`id_servicio` <=> NEW.`id_servicio`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."id_servicio"', OLD.`id_servicio`);
    SET v_despues = JSON_INSERT(v_despues, '$."id_servicio"', NEW.`id_servicio`);
  END IF;
  IF NOT (OLD.`creado_en` <=> NEW.`creado_en`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."creado_en"', OLD.`creado_en`);
    SET v_despues = JSON_INSERT(v_despues, '$."creado_en"', NEW.`creado_en`);
  END IF;
  IF NOT (OLD.`creado_por` <=> NEW.`creado_por`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."creado_por"', OLD.`creado_por`);
    SET v_despues = JSON_INSERT(v_despues, '$."creado_por"', NEW.`creado_por`);
  END IF;
  IF NOT (OLD.`actualizado_en` <=> NEW.`actualizado_en`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."actualizado_en"', OLD.`actualizado_en`);
    SET v_despues = JSON_INSERT(v_despues, '$."actualizado_en"', NEW.`actualizado_en`);
  END IF;
  IF NOT (OLD.`actualizado_por` <=> NEW.`actualizado_por`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."actualizado_por"', OLD.`actualizado_por`);
    SET v_despues = JSON_INSERT(v_despues, '$."actualizado_por"', NEW.`actualizado_por`);
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'mtto_puntos', CONCAT_WS('-', NEW.`id`), 'U', v_antes, v_despues);
  END IF;
END;

-- bit_mtto_puntos_del
CREATE TRIGGER `bit_mtto_puntos_del` AFTER DELETE ON `mtto_puntos` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'mtto_puntos', CONCAT_WS('-', OLD.`id`), 'D', JSON_OBJECT('id', OLD.`id`, 'origen', OLD.`origen`, 'cl_final_id', OLD.`cl_final_id`, 'viaje_id', OLD.`viaje_id`, 'categoria', OLD.`categoria`, 'origen_tabla', OLD.`origen_tabla`, 'origen_id', OLD.`origen_id`, 'unidad_tipo', OLD.`unidad_tipo`, 'truck_id', OLD.`truck_id`, 'caja_id', OLD.`caja_id`, 'driver_id', OLD.`driver_id`, 'fecha_reporte', OLD.`fecha_reporte`, 'descripcion', OLD.`descripcion`, 'estatus', OLD.`estatus`, 'descartado_en_pendientes', OLD.`descartado_en_pendientes`, 'id_orden', OLD.`id_orden`, 'id_servicio', OLD.`id_servicio`, 'creado_en', OLD.`creado_en`, 'creado_por', OLD.`creado_por`, 'actualizado_en', OLD.`actualizado_en`, 'actualizado_por', OLD.`actualizado_por`), NULL);
END;

-- bit_mtto_inspeccion_lado_ins
CREATE TRIGGER `bit_mtto_inspeccion_lado_ins` AFTER INSERT ON `mtto_inspeccion_lado` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'mtto_inspeccion_lado', CONCAT_WS('-', NEW.`id`), 'I', NULL, JSON_OBJECT('id', NEW.`id`, 'cl_final_id', NEW.`cl_final_id`, 'viaje_id', NEW.`viaje_id`, 'lado', NEW.`lado`, 'estatus', NEW.`estatus`, 'completada_en', NEW.`completada_en`, 'completada_por', NEW.`completada_por`));
END;

-- bit_mtto_inspeccion_lado_upd
CREATE TRIGGER `bit_mtto_inspeccion_lado_upd` AFTER UPDATE ON `mtto_inspeccion_lado` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  IF NOT (OLD.`id` <=> NEW.`id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."id"', OLD.`id`);
    SET v_despues = JSON_INSERT(v_despues, '$."id"', NEW.`id`);
  END IF;
  IF NOT (OLD.`cl_final_id` <=> NEW.`cl_final_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."cl_final_id"', OLD.`cl_final_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."cl_final_id"', NEW.`cl_final_id`);
  END IF;
  IF NOT (OLD.`viaje_id` <=> NEW.`viaje_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."viaje_id"', OLD.`viaje_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."viaje_id"', NEW.`viaje_id`);
  END IF;
  IF NOT (OLD.`lado` <=> NEW.`lado`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."lado"', OLD.`lado`);
    SET v_despues = JSON_INSERT(v_despues, '$."lado"', NEW.`lado`);
  END IF;
  IF NOT (OLD.`estatus` <=> NEW.`estatus`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."estatus"', OLD.`estatus`);
    SET v_despues = JSON_INSERT(v_despues, '$."estatus"', NEW.`estatus`);
  END IF;
  IF NOT (OLD.`completada_en` <=> NEW.`completada_en`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."completada_en"', OLD.`completada_en`);
    SET v_despues = JSON_INSERT(v_despues, '$."completada_en"', NEW.`completada_en`);
  END IF;
  IF NOT (OLD.`completada_por` <=> NEW.`completada_por`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."completada_por"', OLD.`completada_por`);
    SET v_despues = JSON_INSERT(v_despues, '$."completada_por"', NEW.`completada_por`);
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'mtto_inspeccion_lado', CONCAT_WS('-', NEW.`id`), 'U', v_antes, v_despues);
  END IF;
END;

-- bit_mtto_inspeccion_lado_del
CREATE TRIGGER `bit_mtto_inspeccion_lado_del` AFTER DELETE ON `mtto_inspeccion_lado` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'mtto_inspeccion_lado', CONCAT_WS('-', OLD.`id`), 'D', JSON_OBJECT('id', OLD.`id`, 'cl_final_id', OLD.`cl_final_id`, 'viaje_id', OLD.`viaje_id`, 'lado', OLD.`lado`, 'estatus', OLD.`estatus`, 'completada_en', OLD.`completada_en`, 'completada_por', OLD.`completada_por`), NULL);
END;

-- bit_mtto_concepto_detalle_ins
CREATE TRIGGER `bit_mtto_concepto_detalle_ins` AFTER INSERT ON `mtto_concepto_detalle` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'mtto_concepto_detalle', CONCAT_WS('-', NEW.`id_detalle`), 'I', NULL, JSON_OBJECT('id_detalle', NEW.`id_detalle`, 'categoria', NEW.`categoria`, 'id_gasto', NEW.`id_gasto`));
END;

-- bit_mtto_concepto_detalle_upd
CREATE TRIGGER `bit_mtto_concepto_detalle_upd` AFTER UPDATE ON `mtto_concepto_detalle` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  IF NOT (OLD.`id_detalle` <=> NEW.`id_detalle`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."id_detalle"', OLD.`id_detalle`);
    SET v_despues = JSON_INSERT(v_despues, '$."id_detalle"', NEW.`id_detalle`);
  END IF;
  IF NOT (OLD.`categoria` <=> NEW.`categoria`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."categoria"', OLD.`categoria`);
    SET v_despues = JSON_INSERT(v_despues, '$."categoria"', NEW.`categoria`);
  END IF;
  IF NOT (OLD.`id_gasto` <=> NEW.`id_gasto`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."id_gasto"', OLD.`id_gasto`);
    SET v_despues = JSON_INSERT(v_despues, '$."id_gasto"', NEW.`id_gasto`);
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'mtto_concepto_detalle', CONCAT_WS('-', NEW.`id_detalle`), 'U', v_antes, v_despues);
  END IF;
END;

-- bit_mtto_concepto_detalle_del
CREATE TRIGGER `bit_mtto_concepto_detalle_del` AFTER DELETE ON `mtto_concepto_detalle` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'mtto_concepto_detalle', CONCAT_WS('-', OLD.`id_detalle`), 'D', JSON_OBJECT('id_detalle', OLD.`id_detalle`, 'categoria', OLD.`categoria`, 'id_gasto', OLD.`id_gasto`), NULL);
END;

-- bit_mtto_notif_suscriptores_ins
CREATE TRIGGER `bit_mtto_notif_suscriptores_ins` AFTER INSERT ON `mtto_notif_suscriptores` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'mtto_notif_suscriptores', CONCAT_WS('-', NEW.`user_id`), 'I', NULL, JSON_OBJECT('user_id', NEW.`user_id`, 'creado_en', NEW.`creado_en`, 'creado_por', NEW.`creado_por`));
END;

-- bit_mtto_notif_suscriptores_upd
CREATE TRIGGER `bit_mtto_notif_suscriptores_upd` AFTER UPDATE ON `mtto_notif_suscriptores` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
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
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'mtto_notif_suscriptores', CONCAT_WS('-', NEW.`user_id`), 'U', v_antes, v_despues);
  END IF;
END;

-- bit_mtto_notif_suscriptores_del
CREATE TRIGGER `bit_mtto_notif_suscriptores_del` AFTER DELETE ON `mtto_notif_suscriptores` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'mtto_notif_suscriptores', CONCAT_WS('-', OLD.`user_id`), 'D', JSON_OBJECT('user_id', OLD.`user_id`, 'creado_en', OLD.`creado_en`, 'creado_por', OLD.`creado_por`), NULL);
END;

-- bit_caja_estatus_ins
CREATE TRIGGER `bit_caja_estatus_ins` AFTER INSERT ON `caja_estatus` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'caja_estatus', CONCAT_WS('-', NEW.`caja_id`), 'I', NULL, JSON_OBJECT('caja_id', NEW.`caja_id`, 'ubicacion', NEW.`ubicacion`, 'observacion', NEW.`observacion`, 'comentarios', NEW.`comentarios`, 'trip_id_referencia', NEW.`trip_id_referencia`, 'stage_id_referencia', NEW.`stage_id_referencia`, 'actualizado_en', NEW.`actualizado_en`, 'actualizado_por', NEW.`actualizado_por`));
END;

-- bit_caja_estatus_upd
CREATE TRIGGER `bit_caja_estatus_upd` AFTER UPDATE ON `caja_estatus` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  IF NOT (OLD.`caja_id` <=> NEW.`caja_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."caja_id"', OLD.`caja_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."caja_id"', NEW.`caja_id`);
  END IF;
  IF NOT (OLD.`ubicacion` <=> NEW.`ubicacion`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."ubicacion"', OLD.`ubicacion`);
    SET v_despues = JSON_INSERT(v_despues, '$."ubicacion"', NEW.`ubicacion`);
  END IF;
  IF NOT (OLD.`observacion` <=> NEW.`observacion`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."observacion"', OLD.`observacion`);
    SET v_despues = JSON_INSERT(v_despues, '$."observacion"', NEW.`observacion`);
  END IF;
  IF NOT (OLD.`comentarios` <=> NEW.`comentarios`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."comentarios"', OLD.`comentarios`);
    SET v_despues = JSON_INSERT(v_despues, '$."comentarios"', NEW.`comentarios`);
  END IF;
  IF NOT (OLD.`trip_id_referencia` <=> NEW.`trip_id_referencia`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."trip_id_referencia"', OLD.`trip_id_referencia`);
    SET v_despues = JSON_INSERT(v_despues, '$."trip_id_referencia"', NEW.`trip_id_referencia`);
  END IF;
  IF NOT (OLD.`stage_id_referencia` <=> NEW.`stage_id_referencia`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."stage_id_referencia"', OLD.`stage_id_referencia`);
    SET v_despues = JSON_INSERT(v_despues, '$."stage_id_referencia"', NEW.`stage_id_referencia`);
  END IF;
  IF NOT (OLD.`actualizado_en` <=> NEW.`actualizado_en`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."actualizado_en"', OLD.`actualizado_en`);
    SET v_despues = JSON_INSERT(v_despues, '$."actualizado_en"', NEW.`actualizado_en`);
  END IF;
  IF NOT (OLD.`actualizado_por` <=> NEW.`actualizado_por`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."actualizado_por"', OLD.`actualizado_por`);
    SET v_despues = JSON_INSERT(v_despues, '$."actualizado_por"', NEW.`actualizado_por`);
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'caja_estatus', CONCAT_WS('-', NEW.`caja_id`), 'U', v_antes, v_despues);
  END IF;
END;

-- bit_caja_estatus_del
CREATE TRIGGER `bit_caja_estatus_del` AFTER DELETE ON `caja_estatus` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'caja_estatus', CONCAT_WS('-', OLD.`caja_id`), 'D', JSON_OBJECT('caja_id', OLD.`caja_id`, 'ubicacion', OLD.`ubicacion`, 'observacion', OLD.`observacion`, 'comentarios', OLD.`comentarios`, 'trip_id_referencia', OLD.`trip_id_referencia`, 'stage_id_referencia', OLD.`stage_id_referencia`, 'actualizado_en', OLD.`actualizado_en`, 'actualizado_por', OLD.`actualizado_por`), NULL);
END;

-- bit_roadside_repairs_ins
CREATE TRIGGER `bit_roadside_repairs_ins` AFTER INSERT ON `roadside_repairs` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'roadside_repairs', CONCAT_WS('-', NEW.`id_reparacion`), 'I', NULL, JSON_OBJECT('id_reparacion', NEW.`id_reparacion`, 'fecha_registro', NEW.`fecha_registro`, 'fecha_suceso', NEW.`fecha_suceso`, 'truck_id', NEW.`truck_id`, 'operador', NEW.`operador`, 'ciudad', NEW.`ciudad`, 'estado', NEW.`estado`, 'fallo', NEW.`fallo`, 'tipo_reparacion', NEW.`tipo_reparacion`, 'comentarios', NEW.`comentarios`, 'costo_reparacion', NEW.`costo_reparacion`, 'costo_refacciones', NEW.`costo_refacciones`, 'total', NEW.`total`, 'trip_id', NEW.`trip_id`));
END;

-- bit_roadside_repairs_upd
CREATE TRIGGER `bit_roadside_repairs_upd` AFTER UPDATE ON `roadside_repairs` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  IF NOT (OLD.`id_reparacion` <=> NEW.`id_reparacion`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."id_reparacion"', OLD.`id_reparacion`);
    SET v_despues = JSON_INSERT(v_despues, '$."id_reparacion"', NEW.`id_reparacion`);
  END IF;
  IF NOT (OLD.`fecha_registro` <=> NEW.`fecha_registro`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."fecha_registro"', OLD.`fecha_registro`);
    SET v_despues = JSON_INSERT(v_despues, '$."fecha_registro"', NEW.`fecha_registro`);
  END IF;
  IF NOT (OLD.`fecha_suceso` <=> NEW.`fecha_suceso`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."fecha_suceso"', OLD.`fecha_suceso`);
    SET v_despues = JSON_INSERT(v_despues, '$."fecha_suceso"', NEW.`fecha_suceso`);
  END IF;
  IF NOT (OLD.`truck_id` <=> NEW.`truck_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."truck_id"', OLD.`truck_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."truck_id"', NEW.`truck_id`);
  END IF;
  IF NOT (OLD.`operador` <=> NEW.`operador`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."operador"', OLD.`operador`);
    SET v_despues = JSON_INSERT(v_despues, '$."operador"', NEW.`operador`);
  END IF;
  IF NOT (OLD.`ciudad` <=> NEW.`ciudad`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."ciudad"', OLD.`ciudad`);
    SET v_despues = JSON_INSERT(v_despues, '$."ciudad"', NEW.`ciudad`);
  END IF;
  IF NOT (OLD.`estado` <=> NEW.`estado`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."estado"', OLD.`estado`);
    SET v_despues = JSON_INSERT(v_despues, '$."estado"', NEW.`estado`);
  END IF;
  IF NOT (OLD.`fallo` <=> NEW.`fallo`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."fallo"', OLD.`fallo`);
    SET v_despues = JSON_INSERT(v_despues, '$."fallo"', NEW.`fallo`);
  END IF;
  IF NOT (OLD.`tipo_reparacion` <=> NEW.`tipo_reparacion`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."tipo_reparacion"', OLD.`tipo_reparacion`);
    SET v_despues = JSON_INSERT(v_despues, '$."tipo_reparacion"', NEW.`tipo_reparacion`);
  END IF;
  IF NOT (OLD.`comentarios` <=> NEW.`comentarios`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."comentarios"', OLD.`comentarios`);
    SET v_despues = JSON_INSERT(v_despues, '$."comentarios"', NEW.`comentarios`);
  END IF;
  IF NOT (OLD.`costo_reparacion` <=> NEW.`costo_reparacion`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."costo_reparacion"', OLD.`costo_reparacion`);
    SET v_despues = JSON_INSERT(v_despues, '$."costo_reparacion"', NEW.`costo_reparacion`);
  END IF;
  IF NOT (OLD.`costo_refacciones` <=> NEW.`costo_refacciones`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."costo_refacciones"', OLD.`costo_refacciones`);
    SET v_despues = JSON_INSERT(v_despues, '$."costo_refacciones"', NEW.`costo_refacciones`);
  END IF;
  IF NOT (OLD.`total` <=> NEW.`total`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."total"', OLD.`total`);
    SET v_despues = JSON_INSERT(v_despues, '$."total"', NEW.`total`);
  END IF;
  IF NOT (OLD.`trip_id` <=> NEW.`trip_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."trip_id"', OLD.`trip_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."trip_id"', NEW.`trip_id`);
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'roadside_repairs', CONCAT_WS('-', NEW.`id_reparacion`), 'U', v_antes, v_despues);
  END IF;
END;

-- bit_roadside_repairs_del
CREATE TRIGGER `bit_roadside_repairs_del` AFTER DELETE ON `roadside_repairs` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'roadside_repairs', CONCAT_WS('-', OLD.`id_reparacion`), 'D', JSON_OBJECT('id_reparacion', OLD.`id_reparacion`, 'fecha_registro', OLD.`fecha_registro`, 'fecha_suceso', OLD.`fecha_suceso`, 'truck_id', OLD.`truck_id`, 'operador', OLD.`operador`, 'ciudad', OLD.`ciudad`, 'estado', OLD.`estado`, 'fallo', OLD.`fallo`, 'tipo_reparacion', OLD.`tipo_reparacion`, 'comentarios', OLD.`comentarios`, 'costo_reparacion', OLD.`costo_reparacion`, 'costo_refacciones', OLD.`costo_refacciones`, 'total', OLD.`total`, 'trip_id', OLD.`trip_id`), NULL);
END;

-- bit_inspections_ins
CREATE TRIGGER `bit_inspections_ins` AFTER INSERT ON `inspections` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'inspections', CONCAT_WS('-', NEW.`id_inspeccion`), 'I', NULL, JSON_OBJECT('id_inspeccion', NEW.`id_inspeccion`, 'truck_id', NEW.`truck_id`, 'trip_id', NEW.`trip_id`, 'operador', NEW.`operador`, 'ciudad', NEW.`ciudad`, 'estado', NEW.`estado`, 'fecha_inspeccion', NEW.`fecha_inspeccion`, 'tipo_violacion', NEW.`tipo_violacion`, 'id_descripcion', NEW.`id_descripcion`, 'comentarios', NEW.`comentarios`, 'multa_ima', NEW.`multa_ima`, 'multa_driver', NEW.`multa_driver`, 'fecha_registro', NEW.`fecha_registro`));
END;

-- bit_inspections_upd
CREATE TRIGGER `bit_inspections_upd` AFTER UPDATE ON `inspections` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  IF NOT (OLD.`id_inspeccion` <=> NEW.`id_inspeccion`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."id_inspeccion"', OLD.`id_inspeccion`);
    SET v_despues = JSON_INSERT(v_despues, '$."id_inspeccion"', NEW.`id_inspeccion`);
  END IF;
  IF NOT (OLD.`truck_id` <=> NEW.`truck_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."truck_id"', OLD.`truck_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."truck_id"', NEW.`truck_id`);
  END IF;
  IF NOT (OLD.`trip_id` <=> NEW.`trip_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."trip_id"', OLD.`trip_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."trip_id"', NEW.`trip_id`);
  END IF;
  IF NOT (OLD.`operador` <=> NEW.`operador`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."operador"', OLD.`operador`);
    SET v_despues = JSON_INSERT(v_despues, '$."operador"', NEW.`operador`);
  END IF;
  IF NOT (OLD.`ciudad` <=> NEW.`ciudad`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."ciudad"', OLD.`ciudad`);
    SET v_despues = JSON_INSERT(v_despues, '$."ciudad"', NEW.`ciudad`);
  END IF;
  IF NOT (OLD.`estado` <=> NEW.`estado`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."estado"', OLD.`estado`);
    SET v_despues = JSON_INSERT(v_despues, '$."estado"', NEW.`estado`);
  END IF;
  IF NOT (OLD.`fecha_inspeccion` <=> NEW.`fecha_inspeccion`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."fecha_inspeccion"', OLD.`fecha_inspeccion`);
    SET v_despues = JSON_INSERT(v_despues, '$."fecha_inspeccion"', NEW.`fecha_inspeccion`);
  END IF;
  IF NOT (OLD.`tipo_violacion` <=> NEW.`tipo_violacion`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."tipo_violacion"', OLD.`tipo_violacion`);
    SET v_despues = JSON_INSERT(v_despues, '$."tipo_violacion"', NEW.`tipo_violacion`);
  END IF;
  IF NOT (OLD.`id_descripcion` <=> NEW.`id_descripcion`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."id_descripcion"', OLD.`id_descripcion`);
    SET v_despues = JSON_INSERT(v_despues, '$."id_descripcion"', NEW.`id_descripcion`);
  END IF;
  IF NOT (OLD.`comentarios` <=> NEW.`comentarios`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."comentarios"', OLD.`comentarios`);
    SET v_despues = JSON_INSERT(v_despues, '$."comentarios"', NEW.`comentarios`);
  END IF;
  IF NOT (OLD.`multa_ima` <=> NEW.`multa_ima`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."multa_ima"', OLD.`multa_ima`);
    SET v_despues = JSON_INSERT(v_despues, '$."multa_ima"', NEW.`multa_ima`);
  END IF;
  IF NOT (OLD.`multa_driver` <=> NEW.`multa_driver`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."multa_driver"', OLD.`multa_driver`);
    SET v_despues = JSON_INSERT(v_despues, '$."multa_driver"', NEW.`multa_driver`);
  END IF;
  IF NOT (OLD.`fecha_registro` <=> NEW.`fecha_registro`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."fecha_registro"', OLD.`fecha_registro`);
    SET v_despues = JSON_INSERT(v_despues, '$."fecha_registro"', NEW.`fecha_registro`);
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'inspections', CONCAT_WS('-', NEW.`id_inspeccion`), 'U', v_antes, v_despues);
  END IF;
END;

-- bit_inspections_del
CREATE TRIGGER `bit_inspections_del` AFTER DELETE ON `inspections` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'inspections', CONCAT_WS('-', OLD.`id_inspeccion`), 'D', JSON_OBJECT('id_inspeccion', OLD.`id_inspeccion`, 'truck_id', OLD.`truck_id`, 'trip_id', OLD.`trip_id`, 'operador', OLD.`operador`, 'ciudad', OLD.`ciudad`, 'estado', OLD.`estado`, 'fecha_inspeccion', OLD.`fecha_inspeccion`, 'tipo_violacion', OLD.`tipo_violacion`, 'id_descripcion', OLD.`id_descripcion`, 'comentarios', OLD.`comentarios`, 'multa_ima', OLD.`multa_ima`, 'multa_driver', OLD.`multa_driver`, 'fecha_registro', OLD.`fecha_registro`), NULL);
END;

-- bit_servicios_orden_ins
CREATE TRIGGER `bit_servicios_orden_ins` AFTER INSERT ON `servicios_orden` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'servicios_orden', CONCAT_WS('-', NEW.`id_servicio`), 'I', NULL, JSON_OBJECT('id_servicio', NEW.`id_servicio`, 'id_orden', NEW.`id_orden`, 'tipo_mantenimiento', NEW.`tipo_mantenimiento`, 'origen_servicio', NEW.`origen_servicio`, 'tipo_reparacion', NEW.`tipo_reparacion`, 'estatus', NEW.`estatus`, 'fecha_termino', NEW.`fecha_termino`));
END;

-- bit_servicios_orden_upd
CREATE TRIGGER `bit_servicios_orden_upd` AFTER UPDATE ON `servicios_orden` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  IF NOT (OLD.`id_servicio` <=> NEW.`id_servicio`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."id_servicio"', OLD.`id_servicio`);
    SET v_despues = JSON_INSERT(v_despues, '$."id_servicio"', NEW.`id_servicio`);
  END IF;
  IF NOT (OLD.`id_orden` <=> NEW.`id_orden`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."id_orden"', OLD.`id_orden`);
    SET v_despues = JSON_INSERT(v_despues, '$."id_orden"', NEW.`id_orden`);
  END IF;
  IF NOT (OLD.`tipo_mantenimiento` <=> NEW.`tipo_mantenimiento`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."tipo_mantenimiento"', OLD.`tipo_mantenimiento`);
    SET v_despues = JSON_INSERT(v_despues, '$."tipo_mantenimiento"', NEW.`tipo_mantenimiento`);
  END IF;
  IF NOT (OLD.`origen_servicio` <=> NEW.`origen_servicio`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."origen_servicio"', OLD.`origen_servicio`);
    SET v_despues = JSON_INSERT(v_despues, '$."origen_servicio"', NEW.`origen_servicio`);
  END IF;
  IF NOT (OLD.`tipo_reparacion` <=> NEW.`tipo_reparacion`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."tipo_reparacion"', OLD.`tipo_reparacion`);
    SET v_despues = JSON_INSERT(v_despues, '$."tipo_reparacion"', NEW.`tipo_reparacion`);
  END IF;
  IF NOT (OLD.`estatus` <=> NEW.`estatus`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."estatus"', OLD.`estatus`);
    SET v_despues = JSON_INSERT(v_despues, '$."estatus"', NEW.`estatus`);
  END IF;
  IF NOT (OLD.`fecha_termino` <=> NEW.`fecha_termino`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."fecha_termino"', OLD.`fecha_termino`);
    SET v_despues = JSON_INSERT(v_despues, '$."fecha_termino"', NEW.`fecha_termino`);
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'servicios_orden', CONCAT_WS('-', NEW.`id_servicio`), 'U', v_antes, v_despues);
  END IF;
END;

-- bit_servicios_orden_del
CREATE TRIGGER `bit_servicios_orden_del` AFTER DELETE ON `servicios_orden` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'servicios_orden', CONCAT_WS('-', OLD.`id_servicio`), 'D', JSON_OBJECT('id_servicio', OLD.`id_servicio`, 'id_orden', OLD.`id_orden`, 'tipo_mantenimiento', OLD.`tipo_mantenimiento`, 'origen_servicio', OLD.`origen_servicio`, 'tipo_reparacion', OLD.`tipo_reparacion`, 'estatus', OLD.`estatus`, 'fecha_termino', OLD.`fecha_termino`), NULL);
END;

-- bit_afinaciones_historial_ins
CREATE TRIGGER `bit_afinaciones_historial_ins` AFTER INSERT ON `afinaciones_historial` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'afinaciones_historial', CONCAT_WS('-', NEW.`id_afinacion`), 'I', NULL, JSON_OBJECT('id_afinacion', NEW.`id_afinacion`, 'truck_id', NEW.`truck_id`, 'fecha_registro', NEW.`fecha_registro`, 'millas_acumuladas', NEW.`millas_acumuladas`, 'porcentaje_aceite', NEW.`porcentaje_aceite`));
END;

-- bit_afinaciones_historial_upd
CREATE TRIGGER `bit_afinaciones_historial_upd` AFTER UPDATE ON `afinaciones_historial` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  IF NOT (OLD.`id_afinacion` <=> NEW.`id_afinacion`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."id_afinacion"', OLD.`id_afinacion`);
    SET v_despues = JSON_INSERT(v_despues, '$."id_afinacion"', NEW.`id_afinacion`);
  END IF;
  IF NOT (OLD.`truck_id` <=> NEW.`truck_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."truck_id"', OLD.`truck_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."truck_id"', NEW.`truck_id`);
  END IF;
  IF NOT (OLD.`fecha_registro` <=> NEW.`fecha_registro`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."fecha_registro"', OLD.`fecha_registro`);
    SET v_despues = JSON_INSERT(v_despues, '$."fecha_registro"', NEW.`fecha_registro`);
  END IF;
  IF NOT (OLD.`millas_acumuladas` <=> NEW.`millas_acumuladas`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."millas_acumuladas"', OLD.`millas_acumuladas`);
    SET v_despues = JSON_INSERT(v_despues, '$."millas_acumuladas"', NEW.`millas_acumuladas`);
  END IF;
  IF NOT (OLD.`porcentaje_aceite` <=> NEW.`porcentaje_aceite`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."porcentaje_aceite"', OLD.`porcentaje_aceite`);
    SET v_despues = JSON_INSERT(v_despues, '$."porcentaje_aceite"', NEW.`porcentaje_aceite`);
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'afinaciones_historial', CONCAT_WS('-', NEW.`id_afinacion`), 'U', v_antes, v_despues);
  END IF;
END;

-- bit_afinaciones_historial_del
CREATE TRIGGER `bit_afinaciones_historial_del` AFTER DELETE ON `afinaciones_historial` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'afinaciones_historial', CONCAT_WS('-', OLD.`id_afinacion`), 'D', JSON_OBJECT('id_afinacion', OLD.`id_afinacion`, 'truck_id', OLD.`truck_id`, 'fecha_registro', OLD.`fecha_registro`, 'millas_acumuladas', OLD.`millas_acumuladas`, 'porcentaje_aceite', OLD.`porcentaje_aceite`), NULL);
END;

