<?php
// Bitácora · instalador de los triggers de «antes y después» (todas las tandas)
//
// De un solo uso. Se sube a /API, se llama con la clave y SE BORRA. Crea los triggers con
// la conexión de la app para que queden a nombre de su usuario, que es permanente; creados
// desde phpMyAdmin quedarían con el usuario temporal de cPanel y fallarían (error 1449).
//
//   ?clave=…                  · lista los triggers de la bitácora que hay hoy (solo lee)
//   ?clave=…&accion=crear     · crea o recrea todos (tandas 1, 2 y 3)
//   ?clave=…&accion=crear&tanda=3 · crea solo los de una tanda
//   ?clave=…&accion=quitar    · borra todos los triggers de la bitácora (los bit_*)
//
// Con &tabla=gastos (o cualquier tabla de la tanda), crear y quitar actúan solo sobre
// esa tabla. Es lo que se usa para cambiar una columna: quitar los de la tabla, hacer el
// cambio, regenerar las sentencias con docs/sql/generar-triggers-bitacora.py y crearlos.
//
// Las sentencias son las mismas de docs/sql/016, 017 y 019-bitacora-triggers*.sql. No tocan ninguna
// tabla del negocio. Sin la clave responde 404, como si el archivo no existiera.

header("Content-Type: application/json; charset=utf-8");

define('CLAVE', 'PONER_UNA_CLAVE_NUEVA_ANTES_DE_SUBIR');

if (!hash_equals(CLAVE, (string)($_GET['clave'] ?? ''))) {
    http_response_code(404);
    exit();
}

include_once 'conexion.php';

$TRIGGERS = [
    'bit_gastos_ins' => <<<'SQL'
CREATE TRIGGER `bit_gastos_ins` AFTER INSERT ON `gastos` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'gastos', CONCAT_WS('-', NEW.`id_gasto`), 'I', NULL, JSON_OBJECT('id_gasto', NEW.`id_gasto`, 'fecha_gasto', NEW.`fecha_gasto`, 'pais', NEW.`pais`, 'moneda', NEW.`moneda`, 'tipo_cambio', NEW.`tipo_cambio`, 'monto_total', NEW.`monto_total`, 'descripcion', NEW.`descripcion`, 'proveedor', NEW.`proveedor`, 'metodo_pago', NEW.`metodo_pago`, 'url_factura', NEW.`url_factura`, 'id_activo', NEW.`id_activo`, 'cantidad_original', NEW.`cantidad_original`, 'created_by', NEW.`created_by`, 'created_at', NEW.`created_at`, 'updated_by', NEW.`updated_by`, 'updated_at', NEW.`updated_at`, 'deleted_at', NEW.`deleted_at`, 'deleted_by', NEW.`deleted_by`));
END
SQL,
    'bit_gastos_upd' => <<<'SQL'
CREATE TRIGGER `bit_gastos_upd` AFTER UPDATE ON `gastos` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  IF NOT (OLD.`id_gasto` <=> NEW.`id_gasto`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."id_gasto"', OLD.`id_gasto`);
    SET v_despues = JSON_INSERT(v_despues, '$."id_gasto"', NEW.`id_gasto`);
  END IF;
  IF NOT (OLD.`fecha_gasto` <=> NEW.`fecha_gasto`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."fecha_gasto"', OLD.`fecha_gasto`);
    SET v_despues = JSON_INSERT(v_despues, '$."fecha_gasto"', NEW.`fecha_gasto`);
  END IF;
  IF NOT (OLD.`pais` <=> NEW.`pais`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."pais"', OLD.`pais`);
    SET v_despues = JSON_INSERT(v_despues, '$."pais"', NEW.`pais`);
  END IF;
  IF NOT (OLD.`moneda` <=> NEW.`moneda`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."moneda"', OLD.`moneda`);
    SET v_despues = JSON_INSERT(v_despues, '$."moneda"', NEW.`moneda`);
  END IF;
  IF NOT (OLD.`tipo_cambio` <=> NEW.`tipo_cambio`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."tipo_cambio"', OLD.`tipo_cambio`);
    SET v_despues = JSON_INSERT(v_despues, '$."tipo_cambio"', NEW.`tipo_cambio`);
  END IF;
  IF NOT (OLD.`monto_total` <=> NEW.`monto_total`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."monto_total"', OLD.`monto_total`);
    SET v_despues = JSON_INSERT(v_despues, '$."monto_total"', NEW.`monto_total`);
  END IF;
  IF NOT (OLD.`descripcion` <=> NEW.`descripcion`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."descripcion"', OLD.`descripcion`);
    SET v_despues = JSON_INSERT(v_despues, '$."descripcion"', NEW.`descripcion`);
  END IF;
  IF NOT (OLD.`proveedor` <=> NEW.`proveedor`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."proveedor"', OLD.`proveedor`);
    SET v_despues = JSON_INSERT(v_despues, '$."proveedor"', NEW.`proveedor`);
  END IF;
  IF NOT (OLD.`metodo_pago` <=> NEW.`metodo_pago`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."metodo_pago"', OLD.`metodo_pago`);
    SET v_despues = JSON_INSERT(v_despues, '$."metodo_pago"', NEW.`metodo_pago`);
  END IF;
  IF NOT (OLD.`url_factura` <=> NEW.`url_factura`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."url_factura"', OLD.`url_factura`);
    SET v_despues = JSON_INSERT(v_despues, '$."url_factura"', NEW.`url_factura`);
  END IF;
  IF NOT (OLD.`id_activo` <=> NEW.`id_activo`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."id_activo"', OLD.`id_activo`);
    SET v_despues = JSON_INSERT(v_despues, '$."id_activo"', NEW.`id_activo`);
  END IF;
  IF NOT (OLD.`cantidad_original` <=> NEW.`cantidad_original`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."cantidad_original"', OLD.`cantidad_original`);
    SET v_despues = JSON_INSERT(v_despues, '$."cantidad_original"', NEW.`cantidad_original`);
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
  IF NOT (OLD.`deleted_at` <=> NEW.`deleted_at`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."deleted_at"', OLD.`deleted_at`);
    SET v_despues = JSON_INSERT(v_despues, '$."deleted_at"', NEW.`deleted_at`);
  END IF;
  IF NOT (OLD.`deleted_by` <=> NEW.`deleted_by`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."deleted_by"', OLD.`deleted_by`);
    SET v_despues = JSON_INSERT(v_despues, '$."deleted_by"', NEW.`deleted_by`);
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'gastos', CONCAT_WS('-', NEW.`id_gasto`), 'U', v_antes, v_despues);
  END IF;
END
SQL,
    'bit_gastos_del' => <<<'SQL'
CREATE TRIGGER `bit_gastos_del` AFTER DELETE ON `gastos` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'gastos', CONCAT_WS('-', OLD.`id_gasto`), 'D', JSON_OBJECT('id_gasto', OLD.`id_gasto`, 'fecha_gasto', OLD.`fecha_gasto`, 'pais', OLD.`pais`, 'moneda', OLD.`moneda`, 'tipo_cambio', OLD.`tipo_cambio`, 'monto_total', OLD.`monto_total`, 'descripcion', OLD.`descripcion`, 'proveedor', OLD.`proveedor`, 'metodo_pago', OLD.`metodo_pago`, 'url_factura', OLD.`url_factura`, 'id_activo', OLD.`id_activo`, 'cantidad_original', OLD.`cantidad_original`, 'created_by', OLD.`created_by`, 'created_at', OLD.`created_at`, 'updated_by', OLD.`updated_by`, 'updated_at', OLD.`updated_at`, 'deleted_at', OLD.`deleted_at`, 'deleted_by', OLD.`deleted_by`), NULL);
END
SQL,
    'bit_detalles_gasto_ins' => <<<'SQL'
CREATE TRIGGER `bit_detalles_gasto_ins` AFTER INSERT ON `detalles_gasto` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'detalles_gasto', CONCAT_WS('-', NEW.`id_detalle_gasto`), 'I', NULL, JSON_OBJECT('id_detalle_gasto', NEW.`id_detalle_gasto`, 'id_gasto', NEW.`id_gasto`, 'id_tipo_gasto', NEW.`id_tipo_gasto`, 'id_articulo', NEW.`id_articulo`, 'descripcion_articulo', NEW.`descripcion_articulo`, 'cantidad_articulo', NEW.`cantidad_articulo`, 'precio_unitario', NEW.`precio_unitario`, 'id_categoria_mantenimiento', NEW.`id_categoria_mantenimiento`, 'id_subcategoria_mantenimiento', NEW.`id_subcategoria_mantenimiento`));
END
SQL,
    'bit_detalles_gasto_upd' => <<<'SQL'
CREATE TRIGGER `bit_detalles_gasto_upd` AFTER UPDATE ON `detalles_gasto` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  IF NOT (OLD.`id_detalle_gasto` <=> NEW.`id_detalle_gasto`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."id_detalle_gasto"', OLD.`id_detalle_gasto`);
    SET v_despues = JSON_INSERT(v_despues, '$."id_detalle_gasto"', NEW.`id_detalle_gasto`);
  END IF;
  IF NOT (OLD.`id_gasto` <=> NEW.`id_gasto`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."id_gasto"', OLD.`id_gasto`);
    SET v_despues = JSON_INSERT(v_despues, '$."id_gasto"', NEW.`id_gasto`);
  END IF;
  IF NOT (OLD.`id_tipo_gasto` <=> NEW.`id_tipo_gasto`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."id_tipo_gasto"', OLD.`id_tipo_gasto`);
    SET v_despues = JSON_INSERT(v_despues, '$."id_tipo_gasto"', NEW.`id_tipo_gasto`);
  END IF;
  IF NOT (OLD.`id_articulo` <=> NEW.`id_articulo`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."id_articulo"', OLD.`id_articulo`);
    SET v_despues = JSON_INSERT(v_despues, '$."id_articulo"', NEW.`id_articulo`);
  END IF;
  IF NOT (OLD.`descripcion_articulo` <=> NEW.`descripcion_articulo`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."descripcion_articulo"', OLD.`descripcion_articulo`);
    SET v_despues = JSON_INSERT(v_despues, '$."descripcion_articulo"', NEW.`descripcion_articulo`);
  END IF;
  IF NOT (OLD.`cantidad_articulo` <=> NEW.`cantidad_articulo`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."cantidad_articulo"', OLD.`cantidad_articulo`);
    SET v_despues = JSON_INSERT(v_despues, '$."cantidad_articulo"', NEW.`cantidad_articulo`);
  END IF;
  IF NOT (OLD.`precio_unitario` <=> NEW.`precio_unitario`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."precio_unitario"', OLD.`precio_unitario`);
    SET v_despues = JSON_INSERT(v_despues, '$."precio_unitario"', NEW.`precio_unitario`);
  END IF;
  IF NOT (OLD.`id_categoria_mantenimiento` <=> NEW.`id_categoria_mantenimiento`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."id_categoria_mantenimiento"', OLD.`id_categoria_mantenimiento`);
    SET v_despues = JSON_INSERT(v_despues, '$."id_categoria_mantenimiento"', NEW.`id_categoria_mantenimiento`);
  END IF;
  IF NOT (OLD.`id_subcategoria_mantenimiento` <=> NEW.`id_subcategoria_mantenimiento`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."id_subcategoria_mantenimiento"', OLD.`id_subcategoria_mantenimiento`);
    SET v_despues = JSON_INSERT(v_despues, '$."id_subcategoria_mantenimiento"', NEW.`id_subcategoria_mantenimiento`);
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'detalles_gasto', CONCAT_WS('-', NEW.`id_detalle_gasto`), 'U', v_antes, v_despues);
  END IF;
END
SQL,
    'bit_detalles_gasto_del' => <<<'SQL'
CREATE TRIGGER `bit_detalles_gasto_del` AFTER DELETE ON `detalles_gasto` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'detalles_gasto', CONCAT_WS('-', OLD.`id_detalle_gasto`), 'D', JSON_OBJECT('id_detalle_gasto', OLD.`id_detalle_gasto`, 'id_gasto', OLD.`id_gasto`, 'id_tipo_gasto', OLD.`id_tipo_gasto`, 'id_articulo', OLD.`id_articulo`, 'descripcion_articulo', OLD.`descripcion_articulo`, 'cantidad_articulo', OLD.`cantidad_articulo`, 'precio_unitario', OLD.`precio_unitario`, 'id_categoria_mantenimiento', OLD.`id_categoria_mantenimiento`, 'id_subcategoria_mantenimiento', OLD.`id_subcategoria_mantenimiento`), NULL);
END
SQL,
    'bit_diesel_ins' => <<<'SQL'
CREATE TRIGGER `bit_diesel_ins` AFTER INSERT ON `diesel` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'diesel', CONCAT_WS('-', NEW.`id`), 'I', NULL, JSON_OBJECT('id', NEW.`id`, 'trip_id', NEW.`trip_id`, 'driver_id', NEW.`driver_id`, 'odometro', NEW.`odometro`, 'galones', NEW.`galones`, 'monto', NEW.`monto`, 'fecha', NEW.`fecha`, 'estado', NEW.`estado`, 'fleetone', NEW.`fleetone`, 'periodo', NEW.`periodo`, 'is_manual', NEW.`is_manual`, 'created_by', NEW.`created_by`, 'odometro_revisado', NEW.`odometro_revisado`));
END
SQL,
    'bit_diesel_upd' => <<<'SQL'
CREATE TRIGGER `bit_diesel_upd` AFTER UPDATE ON `diesel` FOR EACH ROW
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
  IF NOT (OLD.`odometro` <=> NEW.`odometro`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."odometro"', OLD.`odometro`);
    SET v_despues = JSON_INSERT(v_despues, '$."odometro"', NEW.`odometro`);
  END IF;
  IF NOT (OLD.`galones` <=> NEW.`galones`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."galones"', OLD.`galones`);
    SET v_despues = JSON_INSERT(v_despues, '$."galones"', NEW.`galones`);
  END IF;
  IF NOT (OLD.`monto` <=> NEW.`monto`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."monto"', OLD.`monto`);
    SET v_despues = JSON_INSERT(v_despues, '$."monto"', NEW.`monto`);
  END IF;
  IF NOT (OLD.`fecha` <=> NEW.`fecha`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."fecha"', OLD.`fecha`);
    SET v_despues = JSON_INSERT(v_despues, '$."fecha"', NEW.`fecha`);
  END IF;
  IF NOT (OLD.`estado` <=> NEW.`estado`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."estado"', OLD.`estado`);
    SET v_despues = JSON_INSERT(v_despues, '$."estado"', NEW.`estado`);
  END IF;
  IF NOT (OLD.`fleetone` <=> NEW.`fleetone`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."fleetone"', OLD.`fleetone`);
    SET v_despues = JSON_INSERT(v_despues, '$."fleetone"', NEW.`fleetone`);
  END IF;
  IF NOT (OLD.`periodo` <=> NEW.`periodo`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."periodo"', OLD.`periodo`);
    SET v_despues = JSON_INSERT(v_despues, '$."periodo"', NEW.`periodo`);
  END IF;
  IF NOT (OLD.`is_manual` <=> NEW.`is_manual`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."is_manual"', OLD.`is_manual`);
    SET v_despues = JSON_INSERT(v_despues, '$."is_manual"', NEW.`is_manual`);
  END IF;
  IF NOT (OLD.`created_by` <=> NEW.`created_by`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."created_by"', OLD.`created_by`);
    SET v_despues = JSON_INSERT(v_despues, '$."created_by"', NEW.`created_by`);
  END IF;
  IF NOT (OLD.`odometro_revisado` <=> NEW.`odometro_revisado`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."odometro_revisado"', OLD.`odometro_revisado`);
    SET v_despues = JSON_INSERT(v_despues, '$."odometro_revisado"', NEW.`odometro_revisado`);
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'diesel', CONCAT_WS('-', NEW.`id`), 'U', v_antes, v_despues);
  END IF;
END
SQL,
    'bit_diesel_del' => <<<'SQL'
CREATE TRIGGER `bit_diesel_del` AFTER DELETE ON `diesel` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'diesel', CONCAT_WS('-', OLD.`id`), 'D', JSON_OBJECT('id', OLD.`id`, 'trip_id', OLD.`trip_id`, 'driver_id', OLD.`driver_id`, 'odometro', OLD.`odometro`, 'galones', OLD.`galones`, 'monto', OLD.`monto`, 'fecha', OLD.`fecha`, 'estado', OLD.`estado`, 'fleetone', OLD.`fleetone`, 'periodo', OLD.`periodo`, 'is_manual', OLD.`is_manual`, 'created_by', OLD.`created_by`, 'odometro_revisado', OLD.`odometro_revisado`), NULL);
END
SQL,
    'bit_trip_stages_ins' => <<<'SQL'
CREATE TRIGGER `bit_trip_stages_ins` AFTER INSERT ON `trip_stages` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'trip_stages', CONCAT_WS('-', NEW.`trip_stage_id`), 'I', NULL, JSON_OBJECT('trip_stage_id', NEW.`trip_stage_id`, 'trip_id', NEW.`trip_id`, 'stage_number', NEW.`stage_number`, 'origin', NEW.`origin`, 'destination', NEW.`destination`, 'zip_code_origin', NEW.`zip_code_origin`, 'zip_code_destination', NEW.`zip_code_destination`, 'loading_date', NEW.`loading_date`, 'delivery_date', NEW.`delivery_date`, 'estatus', NEW.`estatus`, 'rate_tarifa', NEW.`rate_tarifa`, 'millas_pcmiller', NEW.`millas_pcmiller`, 'travel_direction', NEW.`travel_direction`, 'company_id', NEW.`company_id`, 'creation_date', NEW.`creation_date`, 'warehouse_origin_id', NEW.`warehouse_origin_id`, 'warehouse_destination_id', NEW.`warehouse_destination_id`, 'ci_number', NEW.`ci_number`, 'stageType', NEW.`stageType`, 'millas_pcmiller_practicas', NEW.`millas_pcmiller_practicas`, 'comments', NEW.`comments`, 'time_of_delivery', NEW.`time_of_delivery`, 'date_of_departure', NEW.`date_of_departure`, 'metodo_pago', NEW.`metodo_pago`, 'tarifa_pagada', NEW.`tarifa_pagada`, 'status', NEW.`status`, 'invoice_number', NEW.`invoice_number`, 'ajuste_millas', NEW.`ajuste_millas`, 'fecha_inicio_cobro', NEW.`fecha_inicio_cobro`, 'fecha_pago_final', NEW.`fecha_pago_final`));
END
SQL,
    'bit_trip_stages_upd' => <<<'SQL'
CREATE TRIGGER `bit_trip_stages_upd` AFTER UPDATE ON `trip_stages` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  IF NOT (OLD.`trip_stage_id` <=> NEW.`trip_stage_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."trip_stage_id"', OLD.`trip_stage_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."trip_stage_id"', NEW.`trip_stage_id`);
  END IF;
  IF NOT (OLD.`trip_id` <=> NEW.`trip_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."trip_id"', OLD.`trip_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."trip_id"', NEW.`trip_id`);
  END IF;
  IF NOT (OLD.`stage_number` <=> NEW.`stage_number`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."stage_number"', OLD.`stage_number`);
    SET v_despues = JSON_INSERT(v_despues, '$."stage_number"', NEW.`stage_number`);
  END IF;
  IF NOT (OLD.`origin` <=> NEW.`origin`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."origin"', OLD.`origin`);
    SET v_despues = JSON_INSERT(v_despues, '$."origin"', NEW.`origin`);
  END IF;
  IF NOT (OLD.`destination` <=> NEW.`destination`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."destination"', OLD.`destination`);
    SET v_despues = JSON_INSERT(v_despues, '$."destination"', NEW.`destination`);
  END IF;
  IF NOT (OLD.`zip_code_origin` <=> NEW.`zip_code_origin`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."zip_code_origin"', OLD.`zip_code_origin`);
    SET v_despues = JSON_INSERT(v_despues, '$."zip_code_origin"', NEW.`zip_code_origin`);
  END IF;
  IF NOT (OLD.`zip_code_destination` <=> NEW.`zip_code_destination`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."zip_code_destination"', OLD.`zip_code_destination`);
    SET v_despues = JSON_INSERT(v_despues, '$."zip_code_destination"', NEW.`zip_code_destination`);
  END IF;
  IF NOT (OLD.`loading_date` <=> NEW.`loading_date`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."loading_date"', OLD.`loading_date`);
    SET v_despues = JSON_INSERT(v_despues, '$."loading_date"', NEW.`loading_date`);
  END IF;
  IF NOT (OLD.`delivery_date` <=> NEW.`delivery_date`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."delivery_date"', OLD.`delivery_date`);
    SET v_despues = JSON_INSERT(v_despues, '$."delivery_date"', NEW.`delivery_date`);
  END IF;
  IF NOT (OLD.`estatus` <=> NEW.`estatus`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."estatus"', OLD.`estatus`);
    SET v_despues = JSON_INSERT(v_despues, '$."estatus"', NEW.`estatus`);
  END IF;
  IF NOT (OLD.`rate_tarifa` <=> NEW.`rate_tarifa`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."rate_tarifa"', OLD.`rate_tarifa`);
    SET v_despues = JSON_INSERT(v_despues, '$."rate_tarifa"', NEW.`rate_tarifa`);
  END IF;
  IF NOT (OLD.`millas_pcmiller` <=> NEW.`millas_pcmiller`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."millas_pcmiller"', OLD.`millas_pcmiller`);
    SET v_despues = JSON_INSERT(v_despues, '$."millas_pcmiller"', NEW.`millas_pcmiller`);
  END IF;
  IF NOT (OLD.`travel_direction` <=> NEW.`travel_direction`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."travel_direction"', OLD.`travel_direction`);
    SET v_despues = JSON_INSERT(v_despues, '$."travel_direction"', NEW.`travel_direction`);
  END IF;
  IF NOT (OLD.`company_id` <=> NEW.`company_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."company_id"', OLD.`company_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."company_id"', NEW.`company_id`);
  END IF;
  IF NOT (OLD.`creation_date` <=> NEW.`creation_date`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."creation_date"', OLD.`creation_date`);
    SET v_despues = JSON_INSERT(v_despues, '$."creation_date"', NEW.`creation_date`);
  END IF;
  IF NOT (OLD.`warehouse_origin_id` <=> NEW.`warehouse_origin_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."warehouse_origin_id"', OLD.`warehouse_origin_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."warehouse_origin_id"', NEW.`warehouse_origin_id`);
  END IF;
  IF NOT (OLD.`warehouse_destination_id` <=> NEW.`warehouse_destination_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."warehouse_destination_id"', OLD.`warehouse_destination_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."warehouse_destination_id"', NEW.`warehouse_destination_id`);
  END IF;
  IF NOT (OLD.`ci_number` <=> NEW.`ci_number`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."ci_number"', OLD.`ci_number`);
    SET v_despues = JSON_INSERT(v_despues, '$."ci_number"', NEW.`ci_number`);
  END IF;
  IF NOT (OLD.`stageType` <=> NEW.`stageType`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."stageType"', OLD.`stageType`);
    SET v_despues = JSON_INSERT(v_despues, '$."stageType"', NEW.`stageType`);
  END IF;
  IF NOT (OLD.`millas_pcmiller_practicas` <=> NEW.`millas_pcmiller_practicas`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."millas_pcmiller_practicas"', OLD.`millas_pcmiller_practicas`);
    SET v_despues = JSON_INSERT(v_despues, '$."millas_pcmiller_practicas"', NEW.`millas_pcmiller_practicas`);
  END IF;
  IF NOT (OLD.`comments` <=> NEW.`comments`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."comments"', OLD.`comments`);
    SET v_despues = JSON_INSERT(v_despues, '$."comments"', NEW.`comments`);
  END IF;
  IF NOT (OLD.`time_of_delivery` <=> NEW.`time_of_delivery`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."time_of_delivery"', OLD.`time_of_delivery`);
    SET v_despues = JSON_INSERT(v_despues, '$."time_of_delivery"', NEW.`time_of_delivery`);
  END IF;
  IF NOT (OLD.`date_of_departure` <=> NEW.`date_of_departure`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."date_of_departure"', OLD.`date_of_departure`);
    SET v_despues = JSON_INSERT(v_despues, '$."date_of_departure"', NEW.`date_of_departure`);
  END IF;
  IF NOT (OLD.`metodo_pago` <=> NEW.`metodo_pago`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."metodo_pago"', OLD.`metodo_pago`);
    SET v_despues = JSON_INSERT(v_despues, '$."metodo_pago"', NEW.`metodo_pago`);
  END IF;
  IF NOT (OLD.`tarifa_pagada` <=> NEW.`tarifa_pagada`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."tarifa_pagada"', OLD.`tarifa_pagada`);
    SET v_despues = JSON_INSERT(v_despues, '$."tarifa_pagada"', NEW.`tarifa_pagada`);
  END IF;
  IF NOT (OLD.`status` <=> NEW.`status`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."status"', OLD.`status`);
    SET v_despues = JSON_INSERT(v_despues, '$."status"', NEW.`status`);
  END IF;
  IF NOT (OLD.`invoice_number` <=> NEW.`invoice_number`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."invoice_number"', OLD.`invoice_number`);
    SET v_despues = JSON_INSERT(v_despues, '$."invoice_number"', NEW.`invoice_number`);
  END IF;
  IF NOT (OLD.`ajuste_millas` <=> NEW.`ajuste_millas`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."ajuste_millas"', OLD.`ajuste_millas`);
    SET v_despues = JSON_INSERT(v_despues, '$."ajuste_millas"', NEW.`ajuste_millas`);
  END IF;
  IF NOT (OLD.`fecha_inicio_cobro` <=> NEW.`fecha_inicio_cobro`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."fecha_inicio_cobro"', OLD.`fecha_inicio_cobro`);
    SET v_despues = JSON_INSERT(v_despues, '$."fecha_inicio_cobro"', NEW.`fecha_inicio_cobro`);
  END IF;
  IF NOT (OLD.`fecha_pago_final` <=> NEW.`fecha_pago_final`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."fecha_pago_final"', OLD.`fecha_pago_final`);
    SET v_despues = JSON_INSERT(v_despues, '$."fecha_pago_final"', NEW.`fecha_pago_final`);
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'trip_stages', CONCAT_WS('-', NEW.`trip_stage_id`), 'U', v_antes, v_despues);
  END IF;
END
SQL,
    'bit_trip_stages_del' => <<<'SQL'
CREATE TRIGGER `bit_trip_stages_del` AFTER DELETE ON `trip_stages` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'trip_stages', CONCAT_WS('-', OLD.`trip_stage_id`), 'D', JSON_OBJECT('trip_stage_id', OLD.`trip_stage_id`, 'trip_id', OLD.`trip_id`, 'stage_number', OLD.`stage_number`, 'origin', OLD.`origin`, 'destination', OLD.`destination`, 'zip_code_origin', OLD.`zip_code_origin`, 'zip_code_destination', OLD.`zip_code_destination`, 'loading_date', OLD.`loading_date`, 'delivery_date', OLD.`delivery_date`, 'estatus', OLD.`estatus`, 'rate_tarifa', OLD.`rate_tarifa`, 'millas_pcmiller', OLD.`millas_pcmiller`, 'travel_direction', OLD.`travel_direction`, 'company_id', OLD.`company_id`, 'creation_date', OLD.`creation_date`, 'warehouse_origin_id', OLD.`warehouse_origin_id`, 'warehouse_destination_id', OLD.`warehouse_destination_id`, 'ci_number', OLD.`ci_number`, 'stageType', OLD.`stageType`, 'millas_pcmiller_practicas', OLD.`millas_pcmiller_practicas`, 'comments', OLD.`comments`, 'time_of_delivery', OLD.`time_of_delivery`, 'date_of_departure', OLD.`date_of_departure`, 'metodo_pago', OLD.`metodo_pago`, 'tarifa_pagada', OLD.`tarifa_pagada`, 'status', OLD.`status`, 'invoice_number', OLD.`invoice_number`, 'ajuste_millas', OLD.`ajuste_millas`, 'fecha_inicio_cobro', OLD.`fecha_inicio_cobro`, 'fecha_pago_final', OLD.`fecha_pago_final`), NULL);
END
SQL,
    'bit_trip_payments_ins' => <<<'SQL'
CREATE TRIGGER `bit_trip_payments_ins` AFTER INSERT ON `trip_payments` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'trip_payments', CONCAT_WS('-', NEW.`payment_id`), 'I', NULL, JSON_OBJECT('payment_id', NEW.`payment_id`, 'trip_id', NEW.`trip_id`, 'driver_id', NEW.`driver_id`, 'amount', NEW.`amount`, 'payment_date', NEW.`payment_date`, 'payment_method', NEW.`payment_method`, 'notes', NEW.`notes`, 'status', NEW.`status`, 'anticipo', NEW.`anticipo`, 'gastos_aplicados', NEW.`gastos_aplicados`, 'rate_per_mile', NEW.`rate_per_mile`, 'anticipo_2', NEW.`anticipo_2`, 'anticipo_3', NEW.`anticipo_3`, 'comentarios', NEW.`comentarios`, 'comentarios_operador', NEW.`comentarios_operador`));
END
SQL,
    'bit_trip_payments_upd' => <<<'SQL'
CREATE TRIGGER `bit_trip_payments_upd` AFTER UPDATE ON `trip_payments` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  IF NOT (OLD.`payment_id` <=> NEW.`payment_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."payment_id"', OLD.`payment_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."payment_id"', NEW.`payment_id`);
  END IF;
  IF NOT (OLD.`trip_id` <=> NEW.`trip_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."trip_id"', OLD.`trip_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."trip_id"', NEW.`trip_id`);
  END IF;
  IF NOT (OLD.`driver_id` <=> NEW.`driver_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."driver_id"', OLD.`driver_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."driver_id"', NEW.`driver_id`);
  END IF;
  IF NOT (OLD.`amount` <=> NEW.`amount`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."amount"', OLD.`amount`);
    SET v_despues = JSON_INSERT(v_despues, '$."amount"', NEW.`amount`);
  END IF;
  IF NOT (OLD.`payment_date` <=> NEW.`payment_date`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."payment_date"', OLD.`payment_date`);
    SET v_despues = JSON_INSERT(v_despues, '$."payment_date"', NEW.`payment_date`);
  END IF;
  IF NOT (OLD.`payment_method` <=> NEW.`payment_method`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."payment_method"', OLD.`payment_method`);
    SET v_despues = JSON_INSERT(v_despues, '$."payment_method"', NEW.`payment_method`);
  END IF;
  IF NOT (OLD.`notes` <=> NEW.`notes`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."notes"', OLD.`notes`);
    SET v_despues = JSON_INSERT(v_despues, '$."notes"', NEW.`notes`);
  END IF;
  IF NOT (OLD.`status` <=> NEW.`status`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."status"', OLD.`status`);
    SET v_despues = JSON_INSERT(v_despues, '$."status"', NEW.`status`);
  END IF;
  IF NOT (OLD.`anticipo` <=> NEW.`anticipo`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."anticipo"', OLD.`anticipo`);
    SET v_despues = JSON_INSERT(v_despues, '$."anticipo"', NEW.`anticipo`);
  END IF;
  IF NOT (OLD.`gastos_aplicados` <=> NEW.`gastos_aplicados`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."gastos_aplicados"', OLD.`gastos_aplicados`);
    SET v_despues = JSON_INSERT(v_despues, '$."gastos_aplicados"', NEW.`gastos_aplicados`);
  END IF;
  IF NOT (OLD.`rate_per_mile` <=> NEW.`rate_per_mile`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."rate_per_mile"', OLD.`rate_per_mile`);
    SET v_despues = JSON_INSERT(v_despues, '$."rate_per_mile"', NEW.`rate_per_mile`);
  END IF;
  IF NOT (OLD.`anticipo_2` <=> NEW.`anticipo_2`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."anticipo_2"', OLD.`anticipo_2`);
    SET v_despues = JSON_INSERT(v_despues, '$."anticipo_2"', NEW.`anticipo_2`);
  END IF;
  IF NOT (OLD.`anticipo_3` <=> NEW.`anticipo_3`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."anticipo_3"', OLD.`anticipo_3`);
    SET v_despues = JSON_INSERT(v_despues, '$."anticipo_3"', NEW.`anticipo_3`);
  END IF;
  IF NOT (OLD.`comentarios` <=> NEW.`comentarios`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."comentarios"', OLD.`comentarios`);
    SET v_despues = JSON_INSERT(v_despues, '$."comentarios"', NEW.`comentarios`);
  END IF;
  IF NOT (OLD.`comentarios_operador` <=> NEW.`comentarios_operador`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."comentarios_operador"', OLD.`comentarios_operador`);
    SET v_despues = JSON_INSERT(v_despues, '$."comentarios_operador"', NEW.`comentarios_operador`);
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'trip_payments', CONCAT_WS('-', NEW.`payment_id`), 'U', v_antes, v_despues);
  END IF;
END
SQL,
    'bit_trip_payments_del' => <<<'SQL'
CREATE TRIGGER `bit_trip_payments_del` AFTER DELETE ON `trip_payments` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'trip_payments', CONCAT_WS('-', OLD.`payment_id`), 'D', JSON_OBJECT('payment_id', OLD.`payment_id`, 'trip_id', OLD.`trip_id`, 'driver_id', OLD.`driver_id`, 'amount', OLD.`amount`, 'payment_date', OLD.`payment_date`, 'payment_method', OLD.`payment_method`, 'notes', OLD.`notes`, 'status', OLD.`status`, 'anticipo', OLD.`anticipo`, 'gastos_aplicados', OLD.`gastos_aplicados`, 'rate_per_mile', OLD.`rate_per_mile`, 'anticipo_2', OLD.`anticipo_2`, 'anticipo_3', OLD.`anticipo_3`, 'comentarios', OLD.`comentarios`, 'comentarios_operador', OLD.`comentarios_operador`), NULL);
END
SQL,
    'bit_user_feature_flags_ins' => <<<'SQL'
CREATE TRIGGER `bit_user_feature_flags_ins` AFTER INSERT ON `user_feature_flags` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'user_feature_flags', CONCAT_WS('-', NEW.`id`), 'I', NULL, JSON_OBJECT('id', NEW.`id`, 'user_id', NEW.`user_id`, 'feature_id', NEW.`feature_id`, 'enabled', NEW.`enabled`));
END
SQL,
    'bit_user_feature_flags_upd' => <<<'SQL'
CREATE TRIGGER `bit_user_feature_flags_upd` AFTER UPDATE ON `user_feature_flags` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  IF NOT (OLD.`id` <=> NEW.`id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."id"', OLD.`id`);
    SET v_despues = JSON_INSERT(v_despues, '$."id"', NEW.`id`);
  END IF;
  IF NOT (OLD.`user_id` <=> NEW.`user_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."user_id"', OLD.`user_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."user_id"', NEW.`user_id`);
  END IF;
  IF NOT (OLD.`feature_id` <=> NEW.`feature_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."feature_id"', OLD.`feature_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."feature_id"', NEW.`feature_id`);
  END IF;
  IF NOT (OLD.`enabled` <=> NEW.`enabled`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."enabled"', OLD.`enabled`);
    SET v_despues = JSON_INSERT(v_despues, '$."enabled"', NEW.`enabled`);
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'user_feature_flags', CONCAT_WS('-', NEW.`id`), 'U', v_antes, v_despues);
  END IF;
END
SQL,
    'bit_user_feature_flags_del' => <<<'SQL'
CREATE TRIGGER `bit_user_feature_flags_del` AFTER DELETE ON `user_feature_flags` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'user_feature_flags', CONCAT_WS('-', OLD.`id`), 'D', JSON_OBJECT('id', OLD.`id`, 'user_id', OLD.`user_id`, 'feature_id', OLD.`feature_id`, 'enabled', OLD.`enabled`), NULL);
END
SQL,
    'bit_users_credentials_ins' => <<<'SQL'
CREATE TRIGGER `bit_users_credentials_ins` AFTER INSERT ON `Users_credentials` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'Users_credentials', CONCAT_WS('-', NEW.`id`), 'I', NULL, JSON_OBJECT('id', NEW.`id`, 'driver_id', NEW.`driver_id`, 'user', NEW.`user`, 'type', NEW.`type`, 'active', NEW.`active`, 'name', NEW.`name`));
END
SQL,
    'bit_users_credentials_upd' => <<<'SQL'
CREATE TRIGGER `bit_users_credentials_upd` AFTER UPDATE ON `Users_credentials` FOR EACH ROW
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
  IF NOT (OLD.`user` <=> NEW.`user`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."user"', OLD.`user`);
    SET v_despues = JSON_INSERT(v_despues, '$."user"', NEW.`user`);
  END IF;
  IF NOT (OLD.`type` <=> NEW.`type`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."type"', OLD.`type`);
    SET v_despues = JSON_INSERT(v_despues, '$."type"', NEW.`type`);
  END IF;
  IF NOT (OLD.`active` <=> NEW.`active`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."active"', OLD.`active`);
    SET v_despues = JSON_INSERT(v_despues, '$."active"', NEW.`active`);
  END IF;
  IF NOT (OLD.`name` <=> NEW.`name`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."name"', OLD.`name`);
    SET v_despues = JSON_INSERT(v_despues, '$."name"', NEW.`name`);
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'Users_credentials', CONCAT_WS('-', NEW.`id`), 'U', v_antes, v_despues);
  END IF;
END
SQL,
    'bit_users_credentials_del' => <<<'SQL'
CREATE TRIGGER `bit_users_credentials_del` AFTER DELETE ON `Users_credentials` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'Users_credentials', CONCAT_WS('-', OLD.`id`), 'D', JSON_OBJECT('id', OLD.`id`, 'driver_id', OLD.`driver_id`, 'user', OLD.`user`, 'type', OLD.`type`, 'active', OLD.`active`, 'name', OLD.`name`), NULL);
END
SQL,
    'bit_trips_ins' => <<<'SQL'
CREATE TRIGGER `bit_trips_ins` AFTER INSERT ON `trips` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'trips', CONCAT_WS('-', NEW.`trip_id`), 'I', NULL, JSON_OBJECT('trip_id', NEW.`trip_id`, 'trip_number', NEW.`trip_number`, 'origen_id', NEW.`origen_id`, 'driver_id', NEW.`driver_id`, 'driver_id_second', NEW.`driver_id_second`, 'truck_id', NEW.`truck_id`, 'caja_id', NEW.`caja_id`, 'creation_date', NEW.`creation_date`, 'status', NEW.`status`, 'team_id', NEW.`team_id`, 'caja_externa_id', NEW.`caja_externa_id`, 'return_date', NEW.`return_date`, 'status_payment', NEW.`status_payment`, 'country_code', NEW.`country_code`, 'trip_year', NEW.`trip_year`, 'is_transnational', NEW.`is_transnational`, 'transnational_number', NEW.`transnational_number`, 'movement_number', NEW.`movement_number`, 'odometer_start', NEW.`odometer_start`, 'odometer_end', NEW.`odometer_end`, 'fecha_finalizacion', NEW.`fecha_finalizacion`, 'fecha_inicio_viaje', NEW.`fecha_inicio_viaje`));
END
SQL,
    'bit_trips_upd' => <<<'SQL'
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
END
SQL,
    'bit_trips_del' => <<<'SQL'
CREATE TRIGGER `bit_trips_del` AFTER DELETE ON `trips` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'trips', CONCAT_WS('-', OLD.`trip_id`), 'D', JSON_OBJECT('trip_id', OLD.`trip_id`, 'trip_number', OLD.`trip_number`, 'origen_id', OLD.`origen_id`, 'driver_id', OLD.`driver_id`, 'driver_id_second', OLD.`driver_id_second`, 'truck_id', OLD.`truck_id`, 'caja_id', OLD.`caja_id`, 'creation_date', OLD.`creation_date`, 'status', OLD.`status`, 'team_id', OLD.`team_id`, 'caja_externa_id', OLD.`caja_externa_id`, 'return_date', OLD.`return_date`, 'status_payment', OLD.`status_payment`, 'country_code', OLD.`country_code`, 'trip_year', OLD.`trip_year`, 'is_transnational', OLD.`is_transnational`, 'transnational_number', OLD.`transnational_number`, 'movement_number', OLD.`movement_number`, 'odometer_start', OLD.`odometer_start`, 'odometer_end', OLD.`odometer_end`, 'fecha_finalizacion', OLD.`fecha_finalizacion`, 'fecha_inicio_viaje', OLD.`fecha_inicio_viaje`), NULL);
END
SQL,
    'bit_ordenes_servicio_ins' => <<<'SQL'
CREATE TRIGGER `bit_ordenes_servicio_ins` AFTER INSERT ON `ordenes_servicio` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'ordenes_servicio', CONCAT_WS('-', NEW.`id_orden`), 'I', NULL, JSON_OBJECT('id_orden', NEW.`id_orden`, 'fecha_orden', NEW.`fecha_orden`, 'truck_id', NEW.`truck_id`, 'caja_id', NEW.`caja_id`, 'estatus', NEW.`estatus`, 'fecha_creacion', NEW.`fecha_creacion`, 'tipo_cambio', NEW.`tipo_cambio`));
END
SQL,
    'bit_ordenes_servicio_upd' => <<<'SQL'
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
END
SQL,
    'bit_ordenes_servicio_del' => <<<'SQL'
CREATE TRIGGER `bit_ordenes_servicio_del` AFTER DELETE ON `ordenes_servicio` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'ordenes_servicio', CONCAT_WS('-', OLD.`id_orden`), 'D', JSON_OBJECT('id_orden', OLD.`id_orden`, 'fecha_orden', OLD.`fecha_orden`, 'truck_id', OLD.`truck_id`, 'caja_id', OLD.`caja_id`, 'estatus', OLD.`estatus`, 'fecha_creacion', OLD.`fecha_creacion`, 'tipo_cambio', OLD.`tipo_cambio`), NULL);
END
SQL,
    'bit_orden_servicio_detalles_ins' => <<<'SQL'
CREATE TRIGGER `bit_orden_servicio_detalles_ins` AFTER INSERT ON `orden_servicio_detalles` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'orden_servicio_detalles', CONCAT_WS('-', NEW.`id_detalle`), 'I', NULL, JSON_OBJECT('id_detalle', NEW.`id_detalle`, 'id_servicio', NEW.`id_servicio`, 'id_articulo', NEW.`id_articulo`, 'tipo_detalle', NEW.`tipo_detalle`, 'descripcion', NEW.`descripcion`, 'cantidad', NEW.`cantidad`, 'costo', NEW.`costo`));
END
SQL,
    'bit_orden_servicio_detalles_upd' => <<<'SQL'
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
END
SQL,
    'bit_orden_servicio_detalles_del' => <<<'SQL'
CREATE TRIGGER `bit_orden_servicio_detalles_del` AFTER DELETE ON `orden_servicio_detalles` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'orden_servicio_detalles', CONCAT_WS('-', OLD.`id_detalle`), 'D', JSON_OBJECT('id_detalle', OLD.`id_detalle`, 'id_servicio', OLD.`id_servicio`, 'id_articulo', OLD.`id_articulo`, 'tipo_detalle', OLD.`tipo_detalle`, 'descripcion', OLD.`descripcion`, 'cantidad', OLD.`cantidad`, 'costo', OLD.`costo`), NULL);
END
SQL,
    'bit_pago_trayectos_mx_ins' => <<<'SQL'
CREATE TRIGGER `bit_pago_trayectos_mx_ins` AFTER INSERT ON `pago_trayectos_mx` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'pago_trayectos_mx', CONCAT_WS('-', NEW.`id`), 'I', NULL, JSON_OBJECT('id', NEW.`id`, 'nombre', NEW.`nombre`, 'monto', NEW.`monto`, 'activo', NEW.`activo`, 'creado_en', NEW.`creado_en`, 'actualizado_en', NEW.`actualizado_en`));
END
SQL,
    'bit_pago_trayectos_mx_upd' => <<<'SQL'
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
END
SQL,
    'bit_pago_trayectos_mx_del' => <<<'SQL'
CREATE TRIGGER `bit_pago_trayectos_mx_del` AFTER DELETE ON `pago_trayectos_mx` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'pago_trayectos_mx', CONCAT_WS('-', OLD.`id`), 'D', JSON_OBJECT('id', OLD.`id`, 'nombre', OLD.`nombre`, 'monto', OLD.`monto`, 'activo', OLD.`activo`, 'creado_en', OLD.`creado_en`, 'actualizado_en', OLD.`actualizado_en`), NULL);
END
SQL,
    'bit_notif_suscriptores_ins' => <<<'SQL'
CREATE TRIGGER `bit_notif_suscriptores_ins` AFTER INSERT ON `notif_suscriptores` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'notif_suscriptores', CONCAT_WS('-', NEW.`categoria`, NEW.`user_id`), 'I', NULL, JSON_OBJECT('categoria', NEW.`categoria`, 'user_id', NEW.`user_id`, 'creado_en', NEW.`creado_en`, 'creado_por', NEW.`creado_por`));
END
SQL,
    'bit_notif_suscriptores_upd' => <<<'SQL'
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
END
SQL,
    'bit_notif_suscriptores_del' => <<<'SQL'
CREATE TRIGGER `bit_notif_suscriptores_del` AFTER DELETE ON `notif_suscriptores` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'notif_suscriptores', CONCAT_WS('-', OLD.`categoria`, OLD.`user_id`), 'D', JSON_OBJECT('categoria', OLD.`categoria`, 'user_id', OLD.`user_id`, 'creado_en', OLD.`creado_en`, 'creado_por', OLD.`creado_por`), NULL);
END
SQL,
    'bit_pagos_semanales_ins' => <<<'SQL'
CREATE TRIGGER `bit_pagos_semanales_ins` AFTER INSERT ON `pagos_semanales` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'pagos_semanales', CONCAT_WS('-', NEW.`period_id`), 'I', NULL, JSON_OBJECT('period_id', NEW.`period_id`, 'anio', NEW.`anio`, 'semana', NEW.`semana`, 'fecha_corte', NEW.`fecha_corte`, 'estado', NEW.`estado`, 'autorizado_en', NEW.`autorizado_en`));
END
SQL,
    'bit_pagos_semanales_upd' => <<<'SQL'
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
END
SQL,
    'bit_pagos_semanales_del' => <<<'SQL'
CREATE TRIGGER `bit_pagos_semanales_del` AFTER DELETE ON `pagos_semanales` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'pagos_semanales', CONCAT_WS('-', OLD.`period_id`), 'D', JSON_OBJECT('period_id', OLD.`period_id`, 'anio', OLD.`anio`, 'semana', OLD.`semana`, 'fecha_corte', OLD.`fecha_corte`, 'estado', OLD.`estado`, 'autorizado_en', OLD.`autorizado_en`), NULL);
END
SQL,
    'bit_pagos_detalle_ins' => <<<'SQL'
CREATE TRIGGER `bit_pagos_detalle_ins` AFTER INSERT ON `pagos_detalle` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'pagos_detalle', CONCAT_WS('-', NEW.`id`), 'I', NULL, JSON_OBJECT('id', NEW.`id`, 'period_id', NEW.`period_id`, 'personal_id', NEW.`personal_id`, 'nombre', NEW.`nombre`, 'puesto', NEW.`puesto`, 'sueldo', NEW.`sueldo`, 'frecuencia_pago', NEW.`frecuencia_pago`, 'tipo_nomina', NEW.`tipo_nomina`));
END
SQL,
    'bit_pagos_detalle_upd' => <<<'SQL'
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
END
SQL,
    'bit_pagos_detalle_del' => <<<'SQL'
CREATE TRIGGER `bit_pagos_detalle_del` AFTER DELETE ON `pagos_detalle` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'pagos_detalle', CONCAT_WS('-', OLD.`id`), 'D', JSON_OBJECT('id', OLD.`id`, 'period_id', OLD.`period_id`, 'personal_id', OLD.`personal_id`, 'nombre', OLD.`nombre`, 'puesto', OLD.`puesto`, 'sueldo', OLD.`sueldo`, 'frecuencia_pago', OLD.`frecuencia_pago`, 'tipo_nomina', OLD.`tipo_nomina`), NULL);
END
SQL,
    'bit_stage_stops_ins' => <<<'SQL'
CREATE TRIGGER `bit_stage_stops_ins` AFTER INSERT ON `stage_stops` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'stage_stops', CONCAT_WS('-', NEW.`stop_id`), 'I', NULL, JSON_OBJECT('stop_id', NEW.`stop_id`, 'trip_stage_id', NEW.`trip_stage_id`, 'location', NEW.`location`, 'bl_firmado_document_id', NEW.`bl_firmado_document_id`, 'stop_order', NEW.`stop_order`, 'created_at', NEW.`created_at`, 'updated_at', NEW.`updated_at`, 'time_of_delivery', NEW.`time_of_delivery`));
END
SQL,
    'bit_stage_stops_upd' => <<<'SQL'
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
END
SQL,
    'bit_stage_stops_del' => <<<'SQL'
CREATE TRIGGER `bit_stage_stops_del` AFTER DELETE ON `stage_stops` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'stage_stops', CONCAT_WS('-', OLD.`stop_id`), 'D', JSON_OBJECT('stop_id', OLD.`stop_id`, 'trip_stage_id', OLD.`trip_stage_id`, 'location', OLD.`location`, 'bl_firmado_document_id', OLD.`bl_firmado_document_id`, 'stop_order', OLD.`stop_order`, 'created_at', OLD.`created_at`, 'updated_at', OLD.`updated_at`, 'time_of_delivery', OLD.`time_of_delivery`), NULL);
END
SQL,
    'bit_trip_stage_invoices_ins' => <<<'SQL'
CREATE TRIGGER `bit_trip_stage_invoices_ins` AFTER INSERT ON `trip_stage_invoices` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'trip_stage_invoices', CONCAT_WS('-', NEW.`id`), 'I', NULL, JSON_OBJECT('id', NEW.`id`, 'stage_id', NEW.`stage_id`, 'invoice_number', NEW.`invoice_number`, 'file_path', NEW.`file_path`, 'version', NEW.`version`, 'is_active', NEW.`is_active`, 'created_at', NEW.`created_at`));
END
SQL,
    'bit_trip_stage_invoices_upd' => <<<'SQL'
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
END
SQL,
    'bit_trip_stage_invoices_del' => <<<'SQL'
CREATE TRIGGER `bit_trip_stage_invoices_del` AFTER DELETE ON `trip_stage_invoices` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'trip_stage_invoices', CONCAT_WS('-', OLD.`id`), 'D', JSON_OBJECT('id', OLD.`id`, 'stage_id', OLD.`stage_id`, 'invoice_number', OLD.`invoice_number`, 'file_path', OLD.`file_path`, 'version', OLD.`version`, 'is_active', OLD.`is_active`, 'created_at', OLD.`created_at`), NULL);
END
SQL,
    'bit_gastos_viaje_ins' => <<<'SQL'
CREATE TRIGGER `bit_gastos_viaje_ins` AFTER INSERT ON `gastos_viaje` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'gastos_viaje', CONCAT_WS('-', NEW.`id`), 'I', NULL, JSON_OBJECT('id', NEW.`id`, 'trip_id', NEW.`trip_id`, 'driver_id', NEW.`driver_id`, 'tipo_gasto', NEW.`tipo_gasto`, 'monto', NEW.`monto`, 'fecha', NEW.`fecha`, 'created_by', NEW.`created_by`, 'created_at', NEW.`created_at`, 'updated_by', NEW.`updated_by`, 'updated_at', NEW.`updated_at`));
END
SQL,
    'bit_gastos_viaje_upd' => <<<'SQL'
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
END
SQL,
    'bit_gastos_viaje_del' => <<<'SQL'
CREATE TRIGGER `bit_gastos_viaje_del` AFTER DELETE ON `gastos_viaje` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'gastos_viaje', CONCAT_WS('-', OLD.`id`), 'D', JSON_OBJECT('id', OLD.`id`, 'trip_id', OLD.`trip_id`, 'driver_id', OLD.`driver_id`, 'tipo_gasto', OLD.`tipo_gasto`, 'monto', OLD.`monto`, 'fecha', OLD.`fecha`, 'created_by', OLD.`created_by`, 'created_at', OLD.`created_at`, 'updated_by', OLD.`updated_by`, 'updated_at', OLD.`updated_at`), NULL);
END
SQL,
    'bit_programacion_trips_ins' => <<<'SQL'
CREATE TRIGGER `bit_programacion_trips_ins` AFTER INSERT ON `programacion_trips` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'programacion_trips', CONCAT_WS('-', NEW.`id`), 'I', NULL, JSON_OBJECT('id', NEW.`id`, 'driver_id', NEW.`driver_id`, 'truck_id', NEW.`truck_id`, 'caja_id', NEW.`caja_id`, 'caja_externa_id', NEW.`caja_externa_id`, 'company_id', NEW.`company_id`, 'destino', NEW.`destino`, 'salida', NEW.`salida`));
END
SQL,
    'bit_programacion_trips_upd' => <<<'SQL'
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
END
SQL,
    'bit_programacion_trips_del' => <<<'SQL'
CREATE TRIGGER `bit_programacion_trips_del` AFTER DELETE ON `programacion_trips` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'programacion_trips', CONCAT_WS('-', OLD.`id`), 'D', JSON_OBJECT('id', OLD.`id`, 'driver_id', OLD.`driver_id`, 'truck_id', OLD.`truck_id`, 'caja_id', OLD.`caja_id`, 'caja_externa_id', OLD.`caja_externa_id`, 'company_id', OLD.`company_id`, 'destino', OLD.`destino`, 'salida', OLD.`salida`), NULL);
END
SQL,
    'bit_trucks_ins' => <<<'SQL'
CREATE TRIGGER `bit_trucks_ins` AFTER INSERT ON `trucks` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'trucks', CONCAT_WS('-', NEW.`truck_id`), 'I', NULL, JSON_OBJECT('truck_id', NEW.`truck_id`, 'unidad', NEW.`unidad`, 'Placa_MEX', NEW.`Placa_MEX`, 'Placa_EUA', NEW.`Placa_EUA`, 'Modelo', NEW.`Modelo`, 'Marca_camion', NEW.`Marca_camion`, 'Numero_VIN', NEW.`Numero_VIN`, 'status', NEW.`status`, 'Tag', NEW.`Tag`, 'activo', (NEW.`activo` + 0), 'tank_capacity', NEW.`tank_capacity`, 'ultima_afinacion_fecha', NEW.`ultima_afinacion_fecha`, 'manual_offset', NEW.`manual_offset`, 'odometro_base', NEW.`odometro_base`, 'wialon_unit_id', NEW.`wialon_unit_id`, 'wialon_account', NEW.`wialon_account`, 'limite_afinacion', NEW.`limite_afinacion`));
END
SQL,
    'bit_trucks_upd' => <<<'SQL'
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
END
SQL,
    'bit_trucks_del' => <<<'SQL'
CREATE TRIGGER `bit_trucks_del` AFTER DELETE ON `trucks` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'trucks', CONCAT_WS('-', OLD.`truck_id`), 'D', JSON_OBJECT('truck_id', OLD.`truck_id`, 'unidad', OLD.`unidad`, 'Placa_MEX', OLD.`Placa_MEX`, 'Placa_EUA', OLD.`Placa_EUA`, 'Modelo', OLD.`Modelo`, 'Marca_camion', OLD.`Marca_camion`, 'Numero_VIN', OLD.`Numero_VIN`, 'status', OLD.`status`, 'Tag', OLD.`Tag`, 'activo', (OLD.`activo` + 0), 'tank_capacity', OLD.`tank_capacity`, 'ultima_afinacion_fecha', OLD.`ultima_afinacion_fecha`, 'manual_offset', OLD.`manual_offset`, 'odometro_base', OLD.`odometro_base`, 'wialon_unit_id', OLD.`wialon_unit_id`, 'wialon_account', OLD.`wialon_account`, 'limite_afinacion', OLD.`limite_afinacion`), NULL);
END
SQL,
    'bit_caja_ins' => <<<'SQL'
CREATE TRIGGER `bit_caja_ins` AFTER INSERT ON `caja` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'caja', CONCAT_WS('-', NEW.`caja_id`), 'I', NULL, JSON_OBJECT('caja_id', NEW.`caja_id`, 'no_caja', NEW.`no_caja`, 'no_placa', NEW.`no_placa`, 'estado_placa', NEW.`estado_placa`, 'no_vin', NEW.`no_vin`, 'status', NEW.`status`, 'activo', (NEW.`activo` + 0)));
END
SQL,
    'bit_caja_upd' => <<<'SQL'
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
END
SQL,
    'bit_caja_del' => <<<'SQL'
CREATE TRIGGER `bit_caja_del` AFTER DELETE ON `caja` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'caja', CONCAT_WS('-', OLD.`caja_id`), 'D', JSON_OBJECT('caja_id', OLD.`caja_id`, 'no_caja', OLD.`no_caja`, 'no_placa', OLD.`no_placa`, 'estado_placa', OLD.`estado_placa`, 'no_vin', OLD.`no_vin`, 'status', OLD.`status`, 'activo', (OLD.`activo` + 0)), NULL);
END
SQL,
    'bit_drivers_ins' => <<<'SQL'
CREATE TRIGGER `bit_drivers_ins` AFTER INSERT ON `drivers` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'drivers', CONCAT_WS('-', NEW.`driver_id`), 'I', NULL, JSON_OBJECT('driver_id', NEW.`driver_id`, 'nombre', NEW.`nombre`, 'fecha_nacimiento', NEW.`fecha_nacimiento`, 'fecha_ingreso', NEW.`fecha_ingreso`, 'curp', NEW.`curp`, 'rfc', NEW.`rfc`, 'phone_mex', NEW.`phone_mex`, 'phone_usa', NEW.`phone_usa`, 'status', NEW.`status`, 'licencia', NEW.`licencia`, 'visa', NEW.`visa`, 'activo', NEW.`activo`, 'valor_milla', NEW.`valor_milla`, 'motivo_baja', NEW.`motivo_baja`, 'fecha_baja', NEW.`fecha_baja`, 'observaciones_baja', NEW.`observaciones_baja`));
END
SQL,
    'bit_drivers_upd' => <<<'SQL'
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
END
SQL,
    'bit_drivers_del' => <<<'SQL'
CREATE TRIGGER `bit_drivers_del` AFTER DELETE ON `drivers` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'drivers', CONCAT_WS('-', OLD.`driver_id`), 'D', JSON_OBJECT('driver_id', OLD.`driver_id`, 'nombre', OLD.`nombre`, 'fecha_nacimiento', OLD.`fecha_nacimiento`, 'fecha_ingreso', OLD.`fecha_ingreso`, 'curp', OLD.`curp`, 'rfc', OLD.`rfc`, 'phone_mex', OLD.`phone_mex`, 'phone_usa', OLD.`phone_usa`, 'status', OLD.`status`, 'licencia', OLD.`licencia`, 'visa', OLD.`visa`, 'activo', OLD.`activo`, 'valor_milla', OLD.`valor_milla`, 'motivo_baja', OLD.`motivo_baja`, 'fecha_baja', OLD.`fecha_baja`, 'observaciones_baja', OLD.`observaciones_baja`), NULL);
END
SQL,
    'bit_companies_ins' => <<<'SQL'
CREATE TRIGGER `bit_companies_ins` AFTER INSERT ON `companies` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'companies', CONCAT_WS('-', NEW.`company_id`), 'I', NULL, JSON_OBJECT('company_id', NEW.`company_id`, 'nombre_compania', NEW.`nombre_compania`));
END
SQL,
    'bit_companies_upd' => <<<'SQL'
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
END
SQL,
    'bit_companies_del' => <<<'SQL'
CREATE TRIGGER `bit_companies_del` AFTER DELETE ON `companies` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'companies', CONCAT_WS('-', OLD.`company_id`), 'D', JSON_OBJECT('company_id', OLD.`company_id`, 'nombre_compania', OLD.`nombre_compania`), NULL);
END
SQL,
    'bit_warehouses_ins' => <<<'SQL'
CREATE TRIGGER `bit_warehouses_ins` AFTER INSERT ON `warehouses` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'warehouses', CONCAT_WS('-', NEW.`warehouse_id`), 'I', NULL, JSON_OBJECT('warehouse_id', NEW.`warehouse_id`, 'nombre_almacen', NEW.`nombre_almacen`, 'direccion', NEW.`direccion`));
END
SQL,
    'bit_warehouses_upd' => <<<'SQL'
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
END
SQL,
    'bit_warehouses_del' => <<<'SQL'
CREATE TRIGGER `bit_warehouses_del` AFTER DELETE ON `warehouses` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'warehouses', CONCAT_WS('-', OLD.`warehouse_id`), 'D', JSON_OBJECT('warehouse_id', OLD.`warehouse_id`, 'nombre_almacen', OLD.`nombre_almacen`, 'direccion', OLD.`direccion`), NULL);
END
SQL,
];

$TANDAS = [
    1 => ['gastos', 'detalles_gasto', 'diesel', 'trip_stages', 'trip_payments', 'user_feature_flags', 'users_credentials'],
    2 => ['trips', 'ordenes_servicio', 'orden_servicio_detalles', 'pago_trayectos_mx', 'notif_suscriptores'],
    3 => ['pagos_semanales', 'pagos_detalle', 'stage_stops', 'trip_stage_invoices', 'gastos_viaje', 'programacion_trips', 'trucks', 'caja', 'drivers', 'companies', 'warehouses'],
];

function tablaDeTrigger($nombre) {
    return preg_replace('/^bit_(.+)_(ins|upd|del)$/', '$1', $nombre);
}

function triggersDeBitacora($db) {
    return $db->query("
        SELECT trigger_name, event_object_table, event_manipulation, definer
          FROM information_schema.TRIGGERS
         WHERE trigger_schema = DATABASE() AND trigger_name LIKE 'bit\\_%'
      ORDER BY event_object_table, trigger_name
    ")->fetchAll(PDO::FETCH_ASSOC);
}

$salida = ['status' => 'success'];

try {
    $db = (new Conexion())->getConnection();
    if (!$db) throw new Exception('Sin conexión');
    $db->exec("SET NAMES utf8mb4");

    $accion = $_GET['accion'] ?? 'ver';
    $tabla = trim((string)($_GET['tabla'] ?? ''));
    $tanda = trim((string)($_GET['tanda'] ?? ''));

    if ($tanda !== '' && !isset($TANDAS[(int)$tanda])) {
        throw new Exception("No existe la tanda «{$tanda}». Tandas: " . implode(', ', array_keys($TANDAS)));
    }

    if ($tabla !== '') {
        $conocidas = array_unique(array_map('tablaDeTrigger', array_keys($TRIGGERS)));
        if (!in_array(strtolower($tabla), $conocidas, true)) {
            throw new Exception("La tabla «{$tabla}» no está en esta tanda. Tablas: " . implode(', ', $conocidas));
        }
    }

    if ($accion === 'crear') {
        $resultado = [];
        foreach ($TRIGGERS as $nombre => $sql) {
            if ($tabla !== '' && tablaDeTrigger($nombre) !== strtolower($tabla)) continue;
            if ($tanda !== '' && !in_array(tablaDeTrigger($nombre), $TANDAS[(int)$tanda], true)) continue;
            try {
                $db->exec("DROP TRIGGER IF EXISTS `{$nombre}`");
                $db->exec($sql);
                $resultado[$nombre] = 'creado';
            } catch (Throwable $e) {
                $resultado[$nombre] = 'error: ' . $e->getMessage();
            }
        }
        $salida['resultado'] = $resultado;
    } elseif ($accion === 'quitar') {
        $quitados = [];
        foreach (triggersDeBitacora($db) as $t) {
            if ($tabla !== '' && strcasecmp($t['event_object_table'], $tabla) !== 0) continue;
            $db->exec("DROP TRIGGER IF EXISTS `" . str_replace('`', '', $t['trigger_name']) . "`");
            $quitados[] = $t['trigger_name'];
        }
        $salida['quitados'] = $quitados;
    }

    $salida['instalados'] = triggersDeBitacora($db);
} catch (Throwable $e) {
    $salida = ['status' => 'error', 'message' => $e->getMessage()];
}

echo json_encode($salida, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
