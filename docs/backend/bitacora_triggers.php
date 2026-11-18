<?php
// Bitácora · instalador de los triggers de «antes y después» (todas las tandas)
//
// De un solo uso. Se sube a /API, se llama con la clave y SE BORRA. Crea los triggers con
// la conexión de la app para que queden a nombre de su usuario, que es permanente; creados
// desde phpMyAdmin quedarían con el usuario temporal de cPanel y fallarían (error 1449).
//
//   ?clave=…                  · lista los triggers de la bitácora que hay hoy (solo lee)
//   ?clave=…&accion=crear     · crea o recrea todos (tandas 1 a 5)
//   ?clave=…&accion=crear&tanda=3 · crea solo los de una tanda
//   ?clave=…&accion=quitar    · borra todos los triggers de la bitácora (los bit_*)
//
// Con &tabla=gastos (o cualquier tabla de la tanda), crear y quitar actúan solo sobre
// esa tabla. Es lo que se usa para cambiar una columna: quitar los de la tabla, hacer el
// cambio, regenerar las sentencias con docs/sql/generar-triggers-bitacora.py y crearlos.
//
// Las sentencias son las mismas de docs/sql/016, 017, 019, 020 y 021-bitacora-triggers*.sql. No tocan ninguna
// tabla del negocio. Sin la clave responde 404, como si el archivo no existiera.

header("Content-Type: application/json; charset=utf-8");

define('CLAVE', 'PONER_UNA_CLAVE_NUEVA_ANTES_DE_SUBIR');

// La copia del repositorio no trae clave; subida así no debe abrir para nadie.
if (CLAVE === 'PONER_UNA_CLAVE_NUEVA_ANTES_DE_SUBIR' || !hash_equals(CLAVE, (string)($_GET['clave'] ?? ''))) {
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
    'bit_personal_admin_ins' => <<<'SQL'
CREATE TRIGGER `bit_personal_admin_ins` AFTER INSERT ON `personal_admin` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'personal_admin', CONCAT_WS('-', NEW.`id`), 'I', NULL, JSON_OBJECT('id', NEW.`id`, 'nombre', NEW.`nombre`, 'puesto', NEW.`puesto`, 'sueldo', NEW.`sueldo`, 'frecuencia_pago', NEW.`frecuencia_pago`, 'tipo_nomina', NEW.`tipo_nomina`, 'created_at', NEW.`created_at`, 'status', NEW.`status`));
END
SQL,
    'bit_personal_admin_upd' => <<<'SQL'
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
END
SQL,
    'bit_personal_admin_del' => <<<'SQL'
CREATE TRIGGER `bit_personal_admin_del` AFTER DELETE ON `personal_admin` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'personal_admin', CONCAT_WS('-', OLD.`id`), 'D', JSON_OBJECT('id', OLD.`id`, 'nombre', OLD.`nombre`, 'puesto', OLD.`puesto`, 'sueldo', OLD.`sueldo`, 'frecuencia_pago', OLD.`frecuencia_pago`, 'tipo_nomina', OLD.`tipo_nomina`, 'created_at', OLD.`created_at`, 'status', OLD.`status`), NULL);
END
SQL,
    'bit_milla_driver_ins' => <<<'SQL'
CREATE TRIGGER `bit_milla_driver_ins` AFTER INSERT ON `milla_driver` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'milla_driver', CONCAT_WS('-', NEW.`milla_id`), 'I', NULL, JSON_OBJECT('milla_id', NEW.`milla_id`, 'driver_id', NEW.`driver_id`, 'valor_milla', NEW.`valor_milla`));
END
SQL,
    'bit_milla_driver_upd' => <<<'SQL'
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
END
SQL,
    'bit_milla_driver_del' => <<<'SQL'
CREATE TRIGGER `bit_milla_driver_del` AFTER DELETE ON `milla_driver` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'milla_driver', CONCAT_WS('-', OLD.`milla_id`), 'D', JSON_OBJECT('milla_id', OLD.`milla_id`, 'driver_id', OLD.`driver_id`, 'valor_milla', OLD.`valor_milla`), NULL);
END
SQL,
    'bit_company_invoice_info_ins' => <<<'SQL'
CREATE TRIGGER `bit_company_invoice_info_ins` AFTER INSERT ON `company_invoice_info` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'company_invoice_info', CONCAT_WS('-', NEW.`company_id`), 'I', NULL, JSON_OBJECT('company_id', NEW.`company_id`, 'nombre_factura', NEW.`nombre_factura`, 'direccion', NEW.`direccion`, 'updated_at', NEW.`updated_at`));
END
SQL,
    'bit_company_invoice_info_upd' => <<<'SQL'
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
END
SQL,
    'bit_company_invoice_info_del' => <<<'SQL'
CREATE TRIGGER `bit_company_invoice_info_del` AFTER DELETE ON `company_invoice_info` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'company_invoice_info', CONCAT_WS('-', OLD.`company_id`), 'D', JSON_OBJECT('company_id', OLD.`company_id`, 'nombre_factura', OLD.`nombre_factura`, 'direccion', OLD.`direccion`, 'updated_at', OLD.`updated_at`), NULL);
END
SQL,
    'bit_pago_trayecto_viaje_ins' => <<<'SQL'
CREATE TRIGGER `bit_pago_trayecto_viaje_ins` AFTER INSERT ON `pago_trayecto_viaje` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'pago_trayecto_viaje', CONCAT_WS('-', NEW.`trip_id`, NEW.`driver_id`), 'I', NULL, JSON_OBJECT('trip_id', NEW.`trip_id`, 'driver_id', NEW.`driver_id`, 'trayecto_id', NEW.`trayecto_id`, 'monto', NEW.`monto`, 'id_usuario', NEW.`id_usuario`, 'asignado_en', NEW.`asignado_en`));
END
SQL,
    'bit_pago_trayecto_viaje_upd' => <<<'SQL'
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
END
SQL,
    'bit_pago_trayecto_viaje_del' => <<<'SQL'
CREATE TRIGGER `bit_pago_trayecto_viaje_del` AFTER DELETE ON `pago_trayecto_viaje` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'pago_trayecto_viaje', CONCAT_WS('-', OLD.`trip_id`, OLD.`driver_id`), 'D', JSON_OBJECT('trip_id', OLD.`trip_id`, 'driver_id', OLD.`driver_id`, 'trayecto_id', OLD.`trayecto_id`, 'monto', OLD.`monto`, 'id_usuario', OLD.`id_usuario`, 'asignado_en', OLD.`asignado_en`), NULL);
END
SQL,
    'bit_diesel_fuente_margen_ins' => <<<'SQL'
CREATE TRIGGER `bit_diesel_fuente_margen_ins` AFTER INSERT ON `diesel_fuente_margen` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'diesel_fuente_margen', CONCAT_WS('-', NEW.`diesel_id`), 'I', NULL, JSON_OBJECT('diesel_id', NEW.`diesel_id`, 'usar_fleetone', NEW.`usar_fleetone`, 'actualizado_por', NEW.`actualizado_por`, 'actualizado_en', NEW.`actualizado_en`));
END
SQL,
    'bit_diesel_fuente_margen_upd' => <<<'SQL'
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
END
SQL,
    'bit_diesel_fuente_margen_del' => <<<'SQL'
CREATE TRIGGER `bit_diesel_fuente_margen_del` AFTER DELETE ON `diesel_fuente_margen` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'diesel_fuente_margen', CONCAT_WS('-', OLD.`diesel_id`), 'D', JSON_OBJECT('diesel_id', OLD.`diesel_id`, 'usar_fleetone', OLD.`usar_fleetone`, 'actualizado_por', OLD.`actualizado_por`, 'actualizado_en', OLD.`actualizado_en`), NULL);
END
SQL,
    'bit_cajas_externas_ins' => <<<'SQL'
CREATE TRIGGER `bit_cajas_externas_ins` AFTER INSERT ON `cajas_externas` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'cajas_externas', CONCAT_WS('-', NEW.`caja_externa_id`), 'I', NULL, JSON_OBJECT('caja_externa_id', NEW.`caja_externa_id`, 'no_caja', NEW.`no_caja`, 'no_vin', NEW.`no_vin`, 'modelo', NEW.`modelo`, 'anio', NEW.`anio`, 'placas', NEW.`placas`, 'estado', NEW.`estado`, 'fecha_creacion', NEW.`fecha_creacion`, 'status', NEW.`status`));
END
SQL,
    'bit_cajas_externas_upd' => <<<'SQL'
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
END
SQL,
    'bit_cajas_externas_del' => <<<'SQL'
CREATE TRIGGER `bit_cajas_externas_del` AFTER DELETE ON `cajas_externas` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'cajas_externas', CONCAT_WS('-', OLD.`caja_externa_id`), 'D', JSON_OBJECT('caja_externa_id', OLD.`caja_externa_id`, 'no_caja', OLD.`no_caja`, 'no_vin', OLD.`no_vin`, 'modelo', OLD.`modelo`, 'anio', OLD.`anio`, 'placas', OLD.`placas`, 'estado', OLD.`estado`, 'fecha_creacion', OLD.`fecha_creacion`, 'status', OLD.`status`), NULL);
END
SQL,
    'bit_mtto_puntos_ins' => <<<'SQL'
CREATE TRIGGER `bit_mtto_puntos_ins` AFTER INSERT ON `mtto_puntos` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'mtto_puntos', CONCAT_WS('-', NEW.`id`), 'I', NULL, JSON_OBJECT('id', NEW.`id`, 'origen', NEW.`origen`, 'cl_final_id', NEW.`cl_final_id`, 'viaje_id', NEW.`viaje_id`, 'categoria', NEW.`categoria`, 'origen_tabla', NEW.`origen_tabla`, 'origen_id', NEW.`origen_id`, 'unidad_tipo', NEW.`unidad_tipo`, 'truck_id', NEW.`truck_id`, 'caja_id', NEW.`caja_id`, 'driver_id', NEW.`driver_id`, 'fecha_reporte', NEW.`fecha_reporte`, 'descripcion', NEW.`descripcion`, 'estatus', NEW.`estatus`, 'descartado_en_pendientes', NEW.`descartado_en_pendientes`, 'id_orden', NEW.`id_orden`, 'id_servicio', NEW.`id_servicio`, 'creado_en', NEW.`creado_en`, 'creado_por', NEW.`creado_por`, 'actualizado_en', NEW.`actualizado_en`, 'actualizado_por', NEW.`actualizado_por`));
END
SQL,
    'bit_mtto_puntos_upd' => <<<'SQL'
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
END
SQL,
    'bit_mtto_puntos_del' => <<<'SQL'
CREATE TRIGGER `bit_mtto_puntos_del` AFTER DELETE ON `mtto_puntos` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'mtto_puntos', CONCAT_WS('-', OLD.`id`), 'D', JSON_OBJECT('id', OLD.`id`, 'origen', OLD.`origen`, 'cl_final_id', OLD.`cl_final_id`, 'viaje_id', OLD.`viaje_id`, 'categoria', OLD.`categoria`, 'origen_tabla', OLD.`origen_tabla`, 'origen_id', OLD.`origen_id`, 'unidad_tipo', OLD.`unidad_tipo`, 'truck_id', OLD.`truck_id`, 'caja_id', OLD.`caja_id`, 'driver_id', OLD.`driver_id`, 'fecha_reporte', OLD.`fecha_reporte`, 'descripcion', OLD.`descripcion`, 'estatus', OLD.`estatus`, 'descartado_en_pendientes', OLD.`descartado_en_pendientes`, 'id_orden', OLD.`id_orden`, 'id_servicio', OLD.`id_servicio`, 'creado_en', OLD.`creado_en`, 'creado_por', OLD.`creado_por`, 'actualizado_en', OLD.`actualizado_en`, 'actualizado_por', OLD.`actualizado_por`), NULL);
END
SQL,
    'bit_mtto_inspeccion_lado_ins' => <<<'SQL'
CREATE TRIGGER `bit_mtto_inspeccion_lado_ins` AFTER INSERT ON `mtto_inspeccion_lado` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'mtto_inspeccion_lado', CONCAT_WS('-', NEW.`id`), 'I', NULL, JSON_OBJECT('id', NEW.`id`, 'cl_final_id', NEW.`cl_final_id`, 'viaje_id', NEW.`viaje_id`, 'lado', NEW.`lado`, 'estatus', NEW.`estatus`, 'completada_en', NEW.`completada_en`, 'completada_por', NEW.`completada_por`));
END
SQL,
    'bit_mtto_inspeccion_lado_upd' => <<<'SQL'
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
END
SQL,
    'bit_mtto_inspeccion_lado_del' => <<<'SQL'
CREATE TRIGGER `bit_mtto_inspeccion_lado_del` AFTER DELETE ON `mtto_inspeccion_lado` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'mtto_inspeccion_lado', CONCAT_WS('-', OLD.`id`), 'D', JSON_OBJECT('id', OLD.`id`, 'cl_final_id', OLD.`cl_final_id`, 'viaje_id', OLD.`viaje_id`, 'lado', OLD.`lado`, 'estatus', OLD.`estatus`, 'completada_en', OLD.`completada_en`, 'completada_por', OLD.`completada_por`), NULL);
END
SQL,
    'bit_mtto_concepto_detalle_ins' => <<<'SQL'
CREATE TRIGGER `bit_mtto_concepto_detalle_ins` AFTER INSERT ON `mtto_concepto_detalle` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'mtto_concepto_detalle', CONCAT_WS('-', NEW.`id_detalle`), 'I', NULL, JSON_OBJECT('id_detalle', NEW.`id_detalle`, 'categoria', NEW.`categoria`, 'id_gasto', NEW.`id_gasto`));
END
SQL,
    'bit_mtto_concepto_detalle_upd' => <<<'SQL'
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
END
SQL,
    'bit_mtto_concepto_detalle_del' => <<<'SQL'
CREATE TRIGGER `bit_mtto_concepto_detalle_del` AFTER DELETE ON `mtto_concepto_detalle` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'mtto_concepto_detalle', CONCAT_WS('-', OLD.`id_detalle`), 'D', JSON_OBJECT('id_detalle', OLD.`id_detalle`, 'categoria', OLD.`categoria`, 'id_gasto', OLD.`id_gasto`), NULL);
END
SQL,
    'bit_mtto_notif_suscriptores_ins' => <<<'SQL'
CREATE TRIGGER `bit_mtto_notif_suscriptores_ins` AFTER INSERT ON `mtto_notif_suscriptores` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'mtto_notif_suscriptores', CONCAT_WS('-', NEW.`user_id`), 'I', NULL, JSON_OBJECT('user_id', NEW.`user_id`, 'creado_en', NEW.`creado_en`, 'creado_por', NEW.`creado_por`));
END
SQL,
    'bit_mtto_notif_suscriptores_upd' => <<<'SQL'
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
END
SQL,
    'bit_mtto_notif_suscriptores_del' => <<<'SQL'
CREATE TRIGGER `bit_mtto_notif_suscriptores_del` AFTER DELETE ON `mtto_notif_suscriptores` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'mtto_notif_suscriptores', CONCAT_WS('-', OLD.`user_id`), 'D', JSON_OBJECT('user_id', OLD.`user_id`, 'creado_en', OLD.`creado_en`, 'creado_por', OLD.`creado_por`), NULL);
END
SQL,
    'bit_caja_estatus_ins' => <<<'SQL'
CREATE TRIGGER `bit_caja_estatus_ins` AFTER INSERT ON `caja_estatus` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'caja_estatus', CONCAT_WS('-', NEW.`caja_id`), 'I', NULL, JSON_OBJECT('caja_id', NEW.`caja_id`, 'ubicacion', NEW.`ubicacion`, 'observacion', NEW.`observacion`, 'comentarios', NEW.`comentarios`, 'trip_id_referencia', NEW.`trip_id_referencia`, 'stage_id_referencia', NEW.`stage_id_referencia`, 'actualizado_en', NEW.`actualizado_en`, 'actualizado_por', NEW.`actualizado_por`));
END
SQL,
    'bit_caja_estatus_upd' => <<<'SQL'
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
END
SQL,
    'bit_caja_estatus_del' => <<<'SQL'
CREATE TRIGGER `bit_caja_estatus_del` AFTER DELETE ON `caja_estatus` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'caja_estatus', CONCAT_WS('-', OLD.`caja_id`), 'D', JSON_OBJECT('caja_id', OLD.`caja_id`, 'ubicacion', OLD.`ubicacion`, 'observacion', OLD.`observacion`, 'comentarios', OLD.`comentarios`, 'trip_id_referencia', OLD.`trip_id_referencia`, 'stage_id_referencia', OLD.`stage_id_referencia`, 'actualizado_en', OLD.`actualizado_en`, 'actualizado_por', OLD.`actualizado_por`), NULL);
END
SQL,
    'bit_roadside_repairs_ins' => <<<'SQL'
CREATE TRIGGER `bit_roadside_repairs_ins` AFTER INSERT ON `roadside_repairs` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'roadside_repairs', CONCAT_WS('-', NEW.`id_reparacion`), 'I', NULL, JSON_OBJECT('id_reparacion', NEW.`id_reparacion`, 'fecha_registro', NEW.`fecha_registro`, 'fecha_suceso', NEW.`fecha_suceso`, 'truck_id', NEW.`truck_id`, 'operador', NEW.`operador`, 'ciudad', NEW.`ciudad`, 'estado', NEW.`estado`, 'fallo', NEW.`fallo`, 'tipo_reparacion', NEW.`tipo_reparacion`, 'comentarios', NEW.`comentarios`, 'costo_reparacion', NEW.`costo_reparacion`, 'costo_refacciones', NEW.`costo_refacciones`, 'total', NEW.`total`, 'trip_id', NEW.`trip_id`));
END
SQL,
    'bit_roadside_repairs_upd' => <<<'SQL'
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
END
SQL,
    'bit_roadside_repairs_del' => <<<'SQL'
CREATE TRIGGER `bit_roadside_repairs_del` AFTER DELETE ON `roadside_repairs` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'roadside_repairs', CONCAT_WS('-', OLD.`id_reparacion`), 'D', JSON_OBJECT('id_reparacion', OLD.`id_reparacion`, 'fecha_registro', OLD.`fecha_registro`, 'fecha_suceso', OLD.`fecha_suceso`, 'truck_id', OLD.`truck_id`, 'operador', OLD.`operador`, 'ciudad', OLD.`ciudad`, 'estado', OLD.`estado`, 'fallo', OLD.`fallo`, 'tipo_reparacion', OLD.`tipo_reparacion`, 'comentarios', OLD.`comentarios`, 'costo_reparacion', OLD.`costo_reparacion`, 'costo_refacciones', OLD.`costo_refacciones`, 'total', OLD.`total`, 'trip_id', OLD.`trip_id`), NULL);
END
SQL,
    'bit_inspections_ins' => <<<'SQL'
CREATE TRIGGER `bit_inspections_ins` AFTER INSERT ON `inspections` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'inspections', CONCAT_WS('-', NEW.`id_inspeccion`), 'I', NULL, JSON_OBJECT('id_inspeccion', NEW.`id_inspeccion`, 'truck_id', NEW.`truck_id`, 'trip_id', NEW.`trip_id`, 'operador', NEW.`operador`, 'ciudad', NEW.`ciudad`, 'estado', NEW.`estado`, 'fecha_inspeccion', NEW.`fecha_inspeccion`, 'tipo_violacion', NEW.`tipo_violacion`, 'id_descripcion', NEW.`id_descripcion`, 'comentarios', NEW.`comentarios`, 'multa_ima', NEW.`multa_ima`, 'multa_driver', NEW.`multa_driver`, 'fecha_registro', NEW.`fecha_registro`));
END
SQL,
    'bit_inspections_upd' => <<<'SQL'
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
END
SQL,
    'bit_inspections_del' => <<<'SQL'
CREATE TRIGGER `bit_inspections_del` AFTER DELETE ON `inspections` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'inspections', CONCAT_WS('-', OLD.`id_inspeccion`), 'D', JSON_OBJECT('id_inspeccion', OLD.`id_inspeccion`, 'truck_id', OLD.`truck_id`, 'trip_id', OLD.`trip_id`, 'operador', OLD.`operador`, 'ciudad', OLD.`ciudad`, 'estado', OLD.`estado`, 'fecha_inspeccion', OLD.`fecha_inspeccion`, 'tipo_violacion', OLD.`tipo_violacion`, 'id_descripcion', OLD.`id_descripcion`, 'comentarios', OLD.`comentarios`, 'multa_ima', OLD.`multa_ima`, 'multa_driver', OLD.`multa_driver`, 'fecha_registro', OLD.`fecha_registro`), NULL);
END
SQL,
    'bit_servicios_orden_ins' => <<<'SQL'
CREATE TRIGGER `bit_servicios_orden_ins` AFTER INSERT ON `servicios_orden` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'servicios_orden', CONCAT_WS('-', NEW.`id_servicio`), 'I', NULL, JSON_OBJECT('id_servicio', NEW.`id_servicio`, 'id_orden', NEW.`id_orden`, 'tipo_mantenimiento', NEW.`tipo_mantenimiento`, 'origen_servicio', NEW.`origen_servicio`, 'tipo_reparacion', NEW.`tipo_reparacion`, 'estatus', NEW.`estatus`, 'fecha_termino', NEW.`fecha_termino`));
END
SQL,
    'bit_servicios_orden_upd' => <<<'SQL'
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
END
SQL,
    'bit_servicios_orden_del' => <<<'SQL'
CREATE TRIGGER `bit_servicios_orden_del` AFTER DELETE ON `servicios_orden` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'servicios_orden', CONCAT_WS('-', OLD.`id_servicio`), 'D', JSON_OBJECT('id_servicio', OLD.`id_servicio`, 'id_orden', OLD.`id_orden`, 'tipo_mantenimiento', OLD.`tipo_mantenimiento`, 'origen_servicio', OLD.`origen_servicio`, 'tipo_reparacion', OLD.`tipo_reparacion`, 'estatus', OLD.`estatus`, 'fecha_termino', OLD.`fecha_termino`), NULL);
END
SQL,
    'bit_afinaciones_historial_ins' => <<<'SQL'
CREATE TRIGGER `bit_afinaciones_historial_ins` AFTER INSERT ON `afinaciones_historial` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'afinaciones_historial', CONCAT_WS('-', NEW.`id_afinacion`), 'I', NULL, JSON_OBJECT('id_afinacion', NEW.`id_afinacion`, 'truck_id', NEW.`truck_id`, 'fecha_registro', NEW.`fecha_registro`, 'millas_acumuladas', NEW.`millas_acumuladas`, 'porcentaje_aceite', NEW.`porcentaje_aceite`));
END
SQL,
    'bit_afinaciones_historial_upd' => <<<'SQL'
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
END
SQL,
    'bit_afinaciones_historial_del' => <<<'SQL'
CREATE TRIGGER `bit_afinaciones_historial_del` AFTER DELETE ON `afinaciones_historial` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'afinaciones_historial', CONCAT_WS('-', OLD.`id_afinacion`), 'D', JSON_OBJECT('id_afinacion', OLD.`id_afinacion`, 'truck_id', OLD.`truck_id`, 'fecha_registro', OLD.`fecha_registro`, 'millas_acumuladas', OLD.`millas_acumuladas`, 'porcentaje_aceite', OLD.`porcentaje_aceite`), NULL);
END
SQL,
    'bit_truck_documents_ins' => <<<'SQL'
CREATE TRIGGER `bit_truck_documents_ins` AFTER INSERT ON `truck_documents` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'truck_documents', CONCAT_WS('-', NEW.`doc_id`), 'I', NULL, JSON_OBJECT('doc_id', NEW.`doc_id`, 'truck_id', NEW.`truck_id`, 'tipo_documento', NEW.`tipo_documento`, 'fecha_vencimiento', NEW.`fecha_vencimiento`, 'url_pdf', NEW.`url_pdf`, 'status', (NEW.`status` + 0), 'valor_texto', NEW.`valor_texto`));
END
SQL,
    'bit_truck_documents_upd' => <<<'SQL'
CREATE TRIGGER `bit_truck_documents_upd` AFTER UPDATE ON `truck_documents` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  IF NOT (OLD.`doc_id` <=> NEW.`doc_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."doc_id"', OLD.`doc_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."doc_id"', NEW.`doc_id`);
  END IF;
  IF NOT (OLD.`truck_id` <=> NEW.`truck_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."truck_id"', OLD.`truck_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."truck_id"', NEW.`truck_id`);
  END IF;
  IF NOT (OLD.`tipo_documento` <=> NEW.`tipo_documento`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."tipo_documento"', OLD.`tipo_documento`);
    SET v_despues = JSON_INSERT(v_despues, '$."tipo_documento"', NEW.`tipo_documento`);
  END IF;
  IF NOT (OLD.`fecha_vencimiento` <=> NEW.`fecha_vencimiento`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."fecha_vencimiento"', OLD.`fecha_vencimiento`);
    SET v_despues = JSON_INSERT(v_despues, '$."fecha_vencimiento"', NEW.`fecha_vencimiento`);
  END IF;
  IF NOT (OLD.`url_pdf` <=> NEW.`url_pdf`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."url_pdf"', OLD.`url_pdf`);
    SET v_despues = JSON_INSERT(v_despues, '$."url_pdf"', NEW.`url_pdf`);
  END IF;
  IF NOT (OLD.`status` <=> NEW.`status`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."status"', (OLD.`status` + 0));
    SET v_despues = JSON_INSERT(v_despues, '$."status"', (NEW.`status` + 0));
  END IF;
  IF NOT (OLD.`valor_texto` <=> NEW.`valor_texto`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."valor_texto"', OLD.`valor_texto`);
    SET v_despues = JSON_INSERT(v_despues, '$."valor_texto"', NEW.`valor_texto`);
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'truck_documents', CONCAT_WS('-', NEW.`doc_id`), 'U', v_antes, v_despues);
  END IF;
END
SQL,
    'bit_truck_documents_del' => <<<'SQL'
CREATE TRIGGER `bit_truck_documents_del` AFTER DELETE ON `truck_documents` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'truck_documents', CONCAT_WS('-', OLD.`doc_id`), 'D', JSON_OBJECT('doc_id', OLD.`doc_id`, 'truck_id', OLD.`truck_id`, 'tipo_documento', OLD.`tipo_documento`, 'fecha_vencimiento', OLD.`fecha_vencimiento`, 'url_pdf', OLD.`url_pdf`, 'status', (OLD.`status` + 0), 'valor_texto', OLD.`valor_texto`), NULL);
END
SQL,
    'bit_drivers_documents_ins' => <<<'SQL'
CREATE TRIGGER `bit_drivers_documents_ins` AFTER INSERT ON `drivers_documents` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'drivers_documents', CONCAT_WS('-', NEW.`doc_id`), 'I', NULL, JSON_OBJECT('doc_id', NEW.`doc_id`, 'driver_id', NEW.`driver_id`, 'tipo_documento', NEW.`tipo_documento`, 'fecha_vencimiento', NEW.`fecha_vencimiento`, 'url_pdf', NEW.`url_pdf`, 'status', (NEW.`status` + 0), 'valor_texto', NEW.`valor_texto`));
END
SQL,
    'bit_drivers_documents_upd' => <<<'SQL'
CREATE TRIGGER `bit_drivers_documents_upd` AFTER UPDATE ON `drivers_documents` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  IF NOT (OLD.`doc_id` <=> NEW.`doc_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."doc_id"', OLD.`doc_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."doc_id"', NEW.`doc_id`);
  END IF;
  IF NOT (OLD.`driver_id` <=> NEW.`driver_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."driver_id"', OLD.`driver_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."driver_id"', NEW.`driver_id`);
  END IF;
  IF NOT (OLD.`tipo_documento` <=> NEW.`tipo_documento`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."tipo_documento"', OLD.`tipo_documento`);
    SET v_despues = JSON_INSERT(v_despues, '$."tipo_documento"', NEW.`tipo_documento`);
  END IF;
  IF NOT (OLD.`fecha_vencimiento` <=> NEW.`fecha_vencimiento`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."fecha_vencimiento"', OLD.`fecha_vencimiento`);
    SET v_despues = JSON_INSERT(v_despues, '$."fecha_vencimiento"', NEW.`fecha_vencimiento`);
  END IF;
  IF NOT (OLD.`url_pdf` <=> NEW.`url_pdf`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."url_pdf"', OLD.`url_pdf`);
    SET v_despues = JSON_INSERT(v_despues, '$."url_pdf"', NEW.`url_pdf`);
  END IF;
  IF NOT (OLD.`status` <=> NEW.`status`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."status"', (OLD.`status` + 0));
    SET v_despues = JSON_INSERT(v_despues, '$."status"', (NEW.`status` + 0));
  END IF;
  IF NOT (OLD.`valor_texto` <=> NEW.`valor_texto`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."valor_texto"', OLD.`valor_texto`);
    SET v_despues = JSON_INSERT(v_despues, '$."valor_texto"', NEW.`valor_texto`);
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'drivers_documents', CONCAT_WS('-', NEW.`doc_id`), 'U', v_antes, v_despues);
  END IF;
END
SQL,
    'bit_drivers_documents_del' => <<<'SQL'
CREATE TRIGGER `bit_drivers_documents_del` AFTER DELETE ON `drivers_documents` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'drivers_documents', CONCAT_WS('-', OLD.`doc_id`), 'D', JSON_OBJECT('doc_id', OLD.`doc_id`, 'driver_id', OLD.`driver_id`, 'tipo_documento', OLD.`tipo_documento`, 'fecha_vencimiento', OLD.`fecha_vencimiento`, 'url_pdf', OLD.`url_pdf`, 'status', (OLD.`status` + 0), 'valor_texto', OLD.`valor_texto`), NULL);
END
SQL,
    'bit_cajas_documents_ins' => <<<'SQL'
CREATE TRIGGER `bit_cajas_documents_ins` AFTER INSERT ON `cajas_documents` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'cajas_documents', CONCAT_WS('-', NEW.`doc_id`), 'I', NULL, JSON_OBJECT('doc_id', NEW.`doc_id`, 'caja_id', NEW.`caja_id`, 'tipo_documento', NEW.`tipo_documento`, 'fecha_vencimiento', NEW.`fecha_vencimiento`, 'url_pdf', NEW.`url_pdf`, 'status', (NEW.`status` + 0), 'valor_texto', NEW.`valor_texto`));
END
SQL,
    'bit_cajas_documents_upd' => <<<'SQL'
CREATE TRIGGER `bit_cajas_documents_upd` AFTER UPDATE ON `cajas_documents` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  IF NOT (OLD.`doc_id` <=> NEW.`doc_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."doc_id"', OLD.`doc_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."doc_id"', NEW.`doc_id`);
  END IF;
  IF NOT (OLD.`caja_id` <=> NEW.`caja_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."caja_id"', OLD.`caja_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."caja_id"', NEW.`caja_id`);
  END IF;
  IF NOT (OLD.`tipo_documento` <=> NEW.`tipo_documento`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."tipo_documento"', OLD.`tipo_documento`);
    SET v_despues = JSON_INSERT(v_despues, '$."tipo_documento"', NEW.`tipo_documento`);
  END IF;
  IF NOT (OLD.`fecha_vencimiento` <=> NEW.`fecha_vencimiento`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."fecha_vencimiento"', OLD.`fecha_vencimiento`);
    SET v_despues = JSON_INSERT(v_despues, '$."fecha_vencimiento"', NEW.`fecha_vencimiento`);
  END IF;
  IF NOT (OLD.`url_pdf` <=> NEW.`url_pdf`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."url_pdf"', OLD.`url_pdf`);
    SET v_despues = JSON_INSERT(v_despues, '$."url_pdf"', NEW.`url_pdf`);
  END IF;
  IF NOT (OLD.`status` <=> NEW.`status`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."status"', (OLD.`status` + 0));
    SET v_despues = JSON_INSERT(v_despues, '$."status"', (NEW.`status` + 0));
  END IF;
  IF NOT (OLD.`valor_texto` <=> NEW.`valor_texto`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."valor_texto"', OLD.`valor_texto`);
    SET v_despues = JSON_INSERT(v_despues, '$."valor_texto"', NEW.`valor_texto`);
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'cajas_documents', CONCAT_WS('-', NEW.`doc_id`), 'U', v_antes, v_despues);
  END IF;
END
SQL,
    'bit_cajas_documents_del' => <<<'SQL'
CREATE TRIGGER `bit_cajas_documents_del` AFTER DELETE ON `cajas_documents` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'cajas_documents', CONCAT_WS('-', OLD.`doc_id`), 'D', JSON_OBJECT('doc_id', OLD.`doc_id`, 'caja_id', OLD.`caja_id`, 'tipo_documento', OLD.`tipo_documento`, 'fecha_vencimiento', OLD.`fecha_vencimiento`, 'url_pdf', OLD.`url_pdf`, 'status', (OLD.`status` + 0), 'valor_texto', OLD.`valor_texto`), NULL);
END
SQL,
    'bit_ima_documents_ins' => <<<'SQL'
CREATE TRIGGER `bit_ima_documents_ins` AFTER INSERT ON `IMA_documents` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'IMA_documents', CONCAT_WS('-', NEW.`doc_id`), 'I', NULL, JSON_OBJECT('doc_id', NEW.`doc_id`, 'tipo_documento', NEW.`tipo_documento`, 'fecha_vencimiento', NEW.`fecha_vencimiento`, 'url_pdf', NEW.`url_pdf`, 'status', (NEW.`status` + 0), 'valor_texto', NEW.`valor_texto`));
END
SQL,
    'bit_ima_documents_upd' => <<<'SQL'
CREATE TRIGGER `bit_ima_documents_upd` AFTER UPDATE ON `IMA_documents` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  IF NOT (OLD.`doc_id` <=> NEW.`doc_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."doc_id"', OLD.`doc_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."doc_id"', NEW.`doc_id`);
  END IF;
  IF NOT (OLD.`tipo_documento` <=> NEW.`tipo_documento`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."tipo_documento"', OLD.`tipo_documento`);
    SET v_despues = JSON_INSERT(v_despues, '$."tipo_documento"', NEW.`tipo_documento`);
  END IF;
  IF NOT (OLD.`fecha_vencimiento` <=> NEW.`fecha_vencimiento`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."fecha_vencimiento"', OLD.`fecha_vencimiento`);
    SET v_despues = JSON_INSERT(v_despues, '$."fecha_vencimiento"', NEW.`fecha_vencimiento`);
  END IF;
  IF NOT (OLD.`url_pdf` <=> NEW.`url_pdf`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."url_pdf"', OLD.`url_pdf`);
    SET v_despues = JSON_INSERT(v_despues, '$."url_pdf"', NEW.`url_pdf`);
  END IF;
  IF NOT (OLD.`status` <=> NEW.`status`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."status"', (OLD.`status` + 0));
    SET v_despues = JSON_INSERT(v_despues, '$."status"', (NEW.`status` + 0));
  END IF;
  IF NOT (OLD.`valor_texto` <=> NEW.`valor_texto`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."valor_texto"', OLD.`valor_texto`);
    SET v_despues = JSON_INSERT(v_despues, '$."valor_texto"', NEW.`valor_texto`);
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'IMA_documents', CONCAT_WS('-', NEW.`doc_id`), 'U', v_antes, v_despues);
  END IF;
END
SQL,
    'bit_ima_documents_del' => <<<'SQL'
CREATE TRIGGER `bit_ima_documents_del` AFTER DELETE ON `IMA_documents` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'IMA_documents', CONCAT_WS('-', OLD.`doc_id`), 'D', JSON_OBJECT('doc_id', OLD.`doc_id`, 'tipo_documento', OLD.`tipo_documento`, 'fecha_vencimiento', OLD.`fecha_vencimiento`, 'url_pdf', OLD.`url_pdf`, 'status', (OLD.`status` + 0), 'valor_texto', OLD.`valor_texto`), NULL);
END
SQL,
    'bit_safety_docs_ins' => <<<'SQL'
CREATE TRIGGER `bit_safety_docs_ins` AFTER INSERT ON `safety_docs` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'safety_docs', CONCAT_WS('-', NEW.`trip_id`), 'I', NULL, JSON_OBJECT('trip_id', NEW.`trip_id`, 'libro_electronico', NEW.`libro_electronico`, 'reporte_diesel', NEW.`reporte_diesel`, 'reporte_pcmiller', NEW.`reporte_pcmiller`, 'updated_at', NEW.`updated_at`));
END
SQL,
    'bit_safety_docs_upd' => <<<'SQL'
CREATE TRIGGER `bit_safety_docs_upd` AFTER UPDATE ON `safety_docs` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  IF NOT (OLD.`trip_id` <=> NEW.`trip_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."trip_id"', OLD.`trip_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."trip_id"', NEW.`trip_id`);
  END IF;
  IF NOT (OLD.`libro_electronico` <=> NEW.`libro_electronico`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."libro_electronico"', OLD.`libro_electronico`);
    SET v_despues = JSON_INSERT(v_despues, '$."libro_electronico"', NEW.`libro_electronico`);
  END IF;
  IF NOT (OLD.`reporte_diesel` <=> NEW.`reporte_diesel`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."reporte_diesel"', OLD.`reporte_diesel`);
    SET v_despues = JSON_INSERT(v_despues, '$."reporte_diesel"', NEW.`reporte_diesel`);
  END IF;
  IF NOT (OLD.`reporte_pcmiller` <=> NEW.`reporte_pcmiller`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."reporte_pcmiller"', OLD.`reporte_pcmiller`);
    SET v_despues = JSON_INSERT(v_despues, '$."reporte_pcmiller"', NEW.`reporte_pcmiller`);
  END IF;
  IF NOT (OLD.`updated_at` <=> NEW.`updated_at`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."updated_at"', OLD.`updated_at`);
    SET v_despues = JSON_INSERT(v_despues, '$."updated_at"', NEW.`updated_at`);
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'safety_docs', CONCAT_WS('-', NEW.`trip_id`), 'U', v_antes, v_despues);
  END IF;
END
SQL,
    'bit_safety_docs_del' => <<<'SQL'
CREATE TRIGGER `bit_safety_docs_del` AFTER DELETE ON `safety_docs` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'safety_docs', CONCAT_WS('-', OLD.`trip_id`), 'D', JSON_OBJECT('trip_id', OLD.`trip_id`, 'libro_electronico', OLD.`libro_electronico`, 'reporte_diesel', OLD.`reporte_diesel`, 'reporte_pcmiller', OLD.`reporte_pcmiller`, 'updated_at', OLD.`updated_at`), NULL);
END
SQL,
    'bit_documents_ins' => <<<'SQL'
CREATE TRIGGER `bit_documents_ins` AFTER INSERT ON `documents` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'documents', CONCAT_WS('-', NEW.`document_id`), 'I', NULL, JSON_OBJECT('document_id', NEW.`document_id`, 'tipo_documento', NEW.`tipo_documento`, 'nombre_archivo', NEW.`nombre_archivo`, 'path_servidor_real', NEW.`path_servidor_real`, 'fecha_vencimiento', NEW.`fecha_vencimiento`, 'uploaded_at', NEW.`uploaded_at`));
END
SQL,
    'bit_documents_upd' => <<<'SQL'
CREATE TRIGGER `bit_documents_upd` AFTER UPDATE ON `documents` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  IF NOT (OLD.`document_id` <=> NEW.`document_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."document_id"', OLD.`document_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."document_id"', NEW.`document_id`);
  END IF;
  IF NOT (OLD.`tipo_documento` <=> NEW.`tipo_documento`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."tipo_documento"', OLD.`tipo_documento`);
    SET v_despues = JSON_INSERT(v_despues, '$."tipo_documento"', NEW.`tipo_documento`);
  END IF;
  IF NOT (OLD.`nombre_archivo` <=> NEW.`nombre_archivo`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."nombre_archivo"', OLD.`nombre_archivo`);
    SET v_despues = JSON_INSERT(v_despues, '$."nombre_archivo"', NEW.`nombre_archivo`);
  END IF;
  IF NOT (OLD.`path_servidor_real` <=> NEW.`path_servidor_real`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."path_servidor_real"', OLD.`path_servidor_real`);
    SET v_despues = JSON_INSERT(v_despues, '$."path_servidor_real"', NEW.`path_servidor_real`);
  END IF;
  IF NOT (OLD.`fecha_vencimiento` <=> NEW.`fecha_vencimiento`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."fecha_vencimiento"', OLD.`fecha_vencimiento`);
    SET v_despues = JSON_INSERT(v_despues, '$."fecha_vencimiento"', NEW.`fecha_vencimiento`);
  END IF;
  IF NOT (OLD.`uploaded_at` <=> NEW.`uploaded_at`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."uploaded_at"', OLD.`uploaded_at`);
    SET v_despues = JSON_INSERT(v_despues, '$."uploaded_at"', NEW.`uploaded_at`);
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'documents', CONCAT_WS('-', NEW.`document_id`), 'U', v_antes, v_despues);
  END IF;
END
SQL,
    'bit_documents_del' => <<<'SQL'
CREATE TRIGGER `bit_documents_del` AFTER DELETE ON `documents` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'documents', CONCAT_WS('-', OLD.`document_id`), 'D', JSON_OBJECT('document_id', OLD.`document_id`, 'tipo_documento', OLD.`tipo_documento`, 'nombre_archivo', OLD.`nombre_archivo`, 'path_servidor_real', OLD.`path_servidor_real`, 'fecha_vencimiento', OLD.`fecha_vencimiento`, 'uploaded_at', OLD.`uploaded_at`), NULL);
END
SQL,
    'bit_gastos_documentos_ins' => <<<'SQL'
CREATE TRIGGER `bit_gastos_documentos_ins` AFTER INSERT ON `gastos_documentos` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'gastos_documentos', CONCAT_WS('-', NEW.`id_documento`), 'I', NULL, JSON_OBJECT('id_documento', NEW.`id_documento`, 'id_gasto', NEW.`id_gasto`, 'tipo_documento', NEW.`tipo_documento`, 'nombre_original', NEW.`nombre_original`, 'ruta_archivo', NEW.`ruta_archivo`, 'fecha_carga', NEW.`fecha_carga`));
END
SQL,
    'bit_gastos_documentos_upd' => <<<'SQL'
CREATE TRIGGER `bit_gastos_documentos_upd` AFTER UPDATE ON `gastos_documentos` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  IF NOT (OLD.`id_documento` <=> NEW.`id_documento`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."id_documento"', OLD.`id_documento`);
    SET v_despues = JSON_INSERT(v_despues, '$."id_documento"', NEW.`id_documento`);
  END IF;
  IF NOT (OLD.`id_gasto` <=> NEW.`id_gasto`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."id_gasto"', OLD.`id_gasto`);
    SET v_despues = JSON_INSERT(v_despues, '$."id_gasto"', NEW.`id_gasto`);
  END IF;
  IF NOT (OLD.`tipo_documento` <=> NEW.`tipo_documento`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."tipo_documento"', OLD.`tipo_documento`);
    SET v_despues = JSON_INSERT(v_despues, '$."tipo_documento"', NEW.`tipo_documento`);
  END IF;
  IF NOT (OLD.`nombre_original` <=> NEW.`nombre_original`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."nombre_original"', OLD.`nombre_original`);
    SET v_despues = JSON_INSERT(v_despues, '$."nombre_original"', NEW.`nombre_original`);
  END IF;
  IF NOT (OLD.`ruta_archivo` <=> NEW.`ruta_archivo`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."ruta_archivo"', OLD.`ruta_archivo`);
    SET v_despues = JSON_INSERT(v_despues, '$."ruta_archivo"', NEW.`ruta_archivo`);
  END IF;
  IF NOT (OLD.`fecha_carga` <=> NEW.`fecha_carga`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."fecha_carga"', OLD.`fecha_carga`);
    SET v_despues = JSON_INSERT(v_despues, '$."fecha_carga"', NEW.`fecha_carga`);
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'gastos_documentos', CONCAT_WS('-', NEW.`id_documento`), 'U', v_antes, v_despues);
  END IF;
END
SQL,
    'bit_gastos_documentos_del' => <<<'SQL'
CREATE TRIGGER `bit_gastos_documentos_del` AFTER DELETE ON `gastos_documentos` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'gastos_documentos', CONCAT_WS('-', OLD.`id_documento`), 'D', JSON_OBJECT('id_documento', OLD.`id_documento`, 'id_gasto', OLD.`id_gasto`, 'tipo_documento', OLD.`tipo_documento`, 'nombre_original', OLD.`nombre_original`, 'ruta_archivo', OLD.`ruta_archivo`, 'fecha_carga', OLD.`fecha_carga`), NULL);
END
SQL,
    'bit_trip_document_relationship_ins' => <<<'SQL'
CREATE TRIGGER `bit_trip_document_relationship_ins` AFTER INSERT ON `trip_document_relationship` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'trip_document_relationship', CONCAT_WS('-', NEW.`trip_stage_id`, NEW.`document_id`), 'I', NULL, JSON_OBJECT('trip_stage_id', NEW.`trip_stage_id`, 'document_id', NEW.`document_id`, 'is_active', NEW.`is_active`));
END
SQL,
    'bit_trip_document_relationship_upd' => <<<'SQL'
CREATE TRIGGER `bit_trip_document_relationship_upd` AFTER UPDATE ON `trip_document_relationship` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  IF NOT (OLD.`trip_stage_id` <=> NEW.`trip_stage_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."trip_stage_id"', OLD.`trip_stage_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."trip_stage_id"', NEW.`trip_stage_id`);
  END IF;
  IF NOT (OLD.`document_id` <=> NEW.`document_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."document_id"', OLD.`document_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."document_id"', NEW.`document_id`);
  END IF;
  IF NOT (OLD.`is_active` <=> NEW.`is_active`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."is_active"', OLD.`is_active`);
    SET v_despues = JSON_INSERT(v_despues, '$."is_active"', NEW.`is_active`);
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'trip_document_relationship', CONCAT_WS('-', NEW.`trip_stage_id`, NEW.`document_id`), 'U', v_antes, v_despues);
  END IF;
END
SQL,
    'bit_trip_document_relationship_del' => <<<'SQL'
CREATE TRIGGER `bit_trip_document_relationship_del` AFTER DELETE ON `trip_document_relationship` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'trip_document_relationship', CONCAT_WS('-', OLD.`trip_stage_id`, OLD.`document_id`), 'D', JSON_OBJECT('trip_stage_id', OLD.`trip_stage_id`, 'document_id', OLD.`document_id`, 'is_active', OLD.`is_active`), NULL);
END
SQL,
    'bit_roadside_repair_docs_ins' => <<<'SQL'
CREATE TRIGGER `bit_roadside_repair_docs_ins` AFTER INSERT ON `roadside_repair_docs` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'roadside_repair_docs', CONCAT_WS('-', NEW.`id_doc`), 'I', NULL, JSON_OBJECT('id_doc', NEW.`id_doc`, 'id_reparacion', NEW.`id_reparacion`, 'file_name', NEW.`file_name`, 'file_path', NEW.`file_path`));
END
SQL,
    'bit_roadside_repair_docs_upd' => <<<'SQL'
CREATE TRIGGER `bit_roadside_repair_docs_upd` AFTER UPDATE ON `roadside_repair_docs` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  IF NOT (OLD.`id_doc` <=> NEW.`id_doc`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."id_doc"', OLD.`id_doc`);
    SET v_despues = JSON_INSERT(v_despues, '$."id_doc"', NEW.`id_doc`);
  END IF;
  IF NOT (OLD.`id_reparacion` <=> NEW.`id_reparacion`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."id_reparacion"', OLD.`id_reparacion`);
    SET v_despues = JSON_INSERT(v_despues, '$."id_reparacion"', NEW.`id_reparacion`);
  END IF;
  IF NOT (OLD.`file_name` <=> NEW.`file_name`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."file_name"', OLD.`file_name`);
    SET v_despues = JSON_INSERT(v_despues, '$."file_name"', NEW.`file_name`);
  END IF;
  IF NOT (OLD.`file_path` <=> NEW.`file_path`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."file_path"', OLD.`file_path`);
    SET v_despues = JSON_INSERT(v_despues, '$."file_path"', NEW.`file_path`);
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'roadside_repair_docs', CONCAT_WS('-', NEW.`id_doc`), 'U', v_antes, v_despues);
  END IF;
END
SQL,
    'bit_roadside_repair_docs_del' => <<<'SQL'
CREATE TRIGGER `bit_roadside_repair_docs_del` AFTER DELETE ON `roadside_repair_docs` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'roadside_repair_docs', CONCAT_WS('-', OLD.`id_doc`), 'D', JSON_OBJECT('id_doc', OLD.`id_doc`, 'id_reparacion', OLD.`id_reparacion`, 'file_name', OLD.`file_name`, 'file_path', OLD.`file_path`), NULL);
END
SQL,
    'bit_inspection_docs_ins' => <<<'SQL'
CREATE TRIGGER `bit_inspection_docs_ins` AFTER INSERT ON `inspection_docs` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'inspection_docs', CONCAT_WS('-', NEW.`id_doc`), 'I', NULL, JSON_OBJECT('id_doc', NEW.`id_doc`, 'id_inspeccion', NEW.`id_inspeccion`, 'file_name', NEW.`file_name`, 'file_path', NEW.`file_path`, 'uploaded_at', NEW.`uploaded_at`));
END
SQL,
    'bit_inspection_docs_upd' => <<<'SQL'
CREATE TRIGGER `bit_inspection_docs_upd` AFTER UPDATE ON `inspection_docs` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  IF NOT (OLD.`id_doc` <=> NEW.`id_doc`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."id_doc"', OLD.`id_doc`);
    SET v_despues = JSON_INSERT(v_despues, '$."id_doc"', NEW.`id_doc`);
  END IF;
  IF NOT (OLD.`id_inspeccion` <=> NEW.`id_inspeccion`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."id_inspeccion"', OLD.`id_inspeccion`);
    SET v_despues = JSON_INSERT(v_despues, '$."id_inspeccion"', NEW.`id_inspeccion`);
  END IF;
  IF NOT (OLD.`file_name` <=> NEW.`file_name`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."file_name"', OLD.`file_name`);
    SET v_despues = JSON_INSERT(v_despues, '$."file_name"', NEW.`file_name`);
  END IF;
  IF NOT (OLD.`file_path` <=> NEW.`file_path`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."file_path"', OLD.`file_path`);
    SET v_despues = JSON_INSERT(v_despues, '$."file_path"', NEW.`file_path`);
  END IF;
  IF NOT (OLD.`uploaded_at` <=> NEW.`uploaded_at`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."uploaded_at"', OLD.`uploaded_at`);
    SET v_despues = JSON_INSERT(v_despues, '$."uploaded_at"', NEW.`uploaded_at`);
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'inspection_docs', CONCAT_WS('-', NEW.`id_doc`), 'U', v_antes, v_despues);
  END IF;
END
SQL,
    'bit_inspection_docs_del' => <<<'SQL'
CREATE TRIGGER `bit_inspection_docs_del` AFTER DELETE ON `inspection_docs` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'inspection_docs', CONCAT_WS('-', OLD.`id_doc`), 'D', JSON_OBJECT('id_doc', OLD.`id_doc`, 'id_inspeccion', OLD.`id_inspeccion`, 'file_name', OLD.`file_name`, 'file_path', OLD.`file_path`, 'uploaded_at', OLD.`uploaded_at`), NULL);
END
SQL,
    'bit_status_documents_drivers_ins' => <<<'SQL'
CREATE TRIGGER `bit_status_documents_drivers_ins` AFTER INSERT ON `status_documents_Drivers` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'status_documents_Drivers', CONCAT_WS('-', NEW.`id`), 'I', NULL, JSON_OBJECT('id', NEW.`id`, 'driver_id', NEW.`driver_id`, 'INE', (NEW.`INE` + 0), 'Acta_Nacimiento', (NEW.`Acta_Nacimiento` + 0), 'CURP', (NEW.`CURP` + 0), 'Comprobante_domicilio', (NEW.`Comprobante_domicilio` + 0), 'Constancia', (NEW.`Constancia` + 0), 'Visa', (NEW.`Visa` + 0), 'I94', (NEW.`I94` + 0), 'Solicitud_empleo', (NEW.`Solicitud_empleo` + 0), 'Licencia', (NEW.`Licencia` + 0), 'APTO', (NEW.`APTO` + 0), 'Antidoping', (NEW.`Antidoping` + 0)));
END
SQL,
    'bit_status_documents_drivers_upd' => <<<'SQL'
CREATE TRIGGER `bit_status_documents_drivers_upd` AFTER UPDATE ON `status_documents_Drivers` FOR EACH ROW
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
  IF NOT (OLD.`INE` <=> NEW.`INE`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."INE"', (OLD.`INE` + 0));
    SET v_despues = JSON_INSERT(v_despues, '$."INE"', (NEW.`INE` + 0));
  END IF;
  IF NOT (OLD.`Acta_Nacimiento` <=> NEW.`Acta_Nacimiento`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."Acta_Nacimiento"', (OLD.`Acta_Nacimiento` + 0));
    SET v_despues = JSON_INSERT(v_despues, '$."Acta_Nacimiento"', (NEW.`Acta_Nacimiento` + 0));
  END IF;
  IF NOT (OLD.`CURP` <=> NEW.`CURP`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."CURP"', (OLD.`CURP` + 0));
    SET v_despues = JSON_INSERT(v_despues, '$."CURP"', (NEW.`CURP` + 0));
  END IF;
  IF NOT (OLD.`Comprobante_domicilio` <=> NEW.`Comprobante_domicilio`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."Comprobante_domicilio"', (OLD.`Comprobante_domicilio` + 0));
    SET v_despues = JSON_INSERT(v_despues, '$."Comprobante_domicilio"', (NEW.`Comprobante_domicilio` + 0));
  END IF;
  IF NOT (OLD.`Constancia` <=> NEW.`Constancia`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."Constancia"', (OLD.`Constancia` + 0));
    SET v_despues = JSON_INSERT(v_despues, '$."Constancia"', (NEW.`Constancia` + 0));
  END IF;
  IF NOT (OLD.`Visa` <=> NEW.`Visa`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."Visa"', (OLD.`Visa` + 0));
    SET v_despues = JSON_INSERT(v_despues, '$."Visa"', (NEW.`Visa` + 0));
  END IF;
  IF NOT (OLD.`I94` <=> NEW.`I94`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."I94"', (OLD.`I94` + 0));
    SET v_despues = JSON_INSERT(v_despues, '$."I94"', (NEW.`I94` + 0));
  END IF;
  IF NOT (OLD.`Solicitud_empleo` <=> NEW.`Solicitud_empleo`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."Solicitud_empleo"', (OLD.`Solicitud_empleo` + 0));
    SET v_despues = JSON_INSERT(v_despues, '$."Solicitud_empleo"', (NEW.`Solicitud_empleo` + 0));
  END IF;
  IF NOT (OLD.`Licencia` <=> NEW.`Licencia`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."Licencia"', (OLD.`Licencia` + 0));
    SET v_despues = JSON_INSERT(v_despues, '$."Licencia"', (NEW.`Licencia` + 0));
  END IF;
  IF NOT (OLD.`APTO` <=> NEW.`APTO`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."APTO"', (OLD.`APTO` + 0));
    SET v_despues = JSON_INSERT(v_despues, '$."APTO"', (NEW.`APTO` + 0));
  END IF;
  IF NOT (OLD.`Antidoping` <=> NEW.`Antidoping`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."Antidoping"', (OLD.`Antidoping` + 0));
    SET v_despues = JSON_INSERT(v_despues, '$."Antidoping"', (NEW.`Antidoping` + 0));
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'status_documents_Drivers', CONCAT_WS('-', NEW.`id`), 'U', v_antes, v_despues);
  END IF;
END
SQL,
    'bit_status_documents_drivers_del' => <<<'SQL'
CREATE TRIGGER `bit_status_documents_drivers_del` AFTER DELETE ON `status_documents_Drivers` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'status_documents_Drivers', CONCAT_WS('-', OLD.`id`), 'D', JSON_OBJECT('id', OLD.`id`, 'driver_id', OLD.`driver_id`, 'INE', (OLD.`INE` + 0), 'Acta_Nacimiento', (OLD.`Acta_Nacimiento` + 0), 'CURP', (OLD.`CURP` + 0), 'Comprobante_domicilio', (OLD.`Comprobante_domicilio` + 0), 'Constancia', (OLD.`Constancia` + 0), 'Visa', (OLD.`Visa` + 0), 'I94', (OLD.`I94` + 0), 'Solicitud_empleo', (OLD.`Solicitud_empleo` + 0), 'Licencia', (OLD.`Licencia` + 0), 'APTO', (OLD.`APTO` + 0), 'Antidoping', (OLD.`Antidoping` + 0)), NULL);
END
SQL,
    'bit_status_documents_trucks_ins' => <<<'SQL'
CREATE TRIGGER `bit_status_documents_trucks_ins` AFTER INSERT ON `status_documents_Trucks` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'status_documents_Trucks', CONCAT_WS('-', NEW.`id`), 'I', NULL, JSON_OBJECT('id', NEW.`id`, 'truck_id', NEW.`truck_id`, 'registracion', (NEW.`registracion` + 0), 'cab', (NEW.`cab` + 0), 'coi', (NEW.`coi` + 0), 'inspeccion_mecanica', (NEW.`inspeccion_mecanica` + 0), 'tx_dmv', (NEW.`tx_dmv` + 0), 'permiso_ny', (NEW.`permiso_ny` + 0), 'permiso_nm', (NEW.`permiso_nm` + 0), 'dtops', (NEW.`dtops` + 0), 'tarjeta_circulacion', (NEW.`tarjeta_circulacion` + 0), 'inspeccion_fisio_mecanica', (NEW.`inspeccion_fisio_mecanica` + 0), 'inspeccion_humos', (NEW.`inspeccion_humos` + 0), 'puente_fideicomiso', (NEW.`puente_fideicomiso` + 0), 'seguro', (NEW.`seguro` + 0)));
END
SQL,
    'bit_status_documents_trucks_upd' => <<<'SQL'
CREATE TRIGGER `bit_status_documents_trucks_upd` AFTER UPDATE ON `status_documents_Trucks` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  IF NOT (OLD.`id` <=> NEW.`id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."id"', OLD.`id`);
    SET v_despues = JSON_INSERT(v_despues, '$."id"', NEW.`id`);
  END IF;
  IF NOT (OLD.`truck_id` <=> NEW.`truck_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."truck_id"', OLD.`truck_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."truck_id"', NEW.`truck_id`);
  END IF;
  IF NOT (OLD.`registracion` <=> NEW.`registracion`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."registracion"', (OLD.`registracion` + 0));
    SET v_despues = JSON_INSERT(v_despues, '$."registracion"', (NEW.`registracion` + 0));
  END IF;
  IF NOT (OLD.`cab` <=> NEW.`cab`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."cab"', (OLD.`cab` + 0));
    SET v_despues = JSON_INSERT(v_despues, '$."cab"', (NEW.`cab` + 0));
  END IF;
  IF NOT (OLD.`coi` <=> NEW.`coi`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."coi"', (OLD.`coi` + 0));
    SET v_despues = JSON_INSERT(v_despues, '$."coi"', (NEW.`coi` + 0));
  END IF;
  IF NOT (OLD.`inspeccion_mecanica` <=> NEW.`inspeccion_mecanica`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."inspeccion_mecanica"', (OLD.`inspeccion_mecanica` + 0));
    SET v_despues = JSON_INSERT(v_despues, '$."inspeccion_mecanica"', (NEW.`inspeccion_mecanica` + 0));
  END IF;
  IF NOT (OLD.`tx_dmv` <=> NEW.`tx_dmv`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."tx_dmv"', (OLD.`tx_dmv` + 0));
    SET v_despues = JSON_INSERT(v_despues, '$."tx_dmv"', (NEW.`tx_dmv` + 0));
  END IF;
  IF NOT (OLD.`permiso_ny` <=> NEW.`permiso_ny`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."permiso_ny"', (OLD.`permiso_ny` + 0));
    SET v_despues = JSON_INSERT(v_despues, '$."permiso_ny"', (NEW.`permiso_ny` + 0));
  END IF;
  IF NOT (OLD.`permiso_nm` <=> NEW.`permiso_nm`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."permiso_nm"', (OLD.`permiso_nm` + 0));
    SET v_despues = JSON_INSERT(v_despues, '$."permiso_nm"', (NEW.`permiso_nm` + 0));
  END IF;
  IF NOT (OLD.`dtops` <=> NEW.`dtops`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."dtops"', (OLD.`dtops` + 0));
    SET v_despues = JSON_INSERT(v_despues, '$."dtops"', (NEW.`dtops` + 0));
  END IF;
  IF NOT (OLD.`tarjeta_circulacion` <=> NEW.`tarjeta_circulacion`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."tarjeta_circulacion"', (OLD.`tarjeta_circulacion` + 0));
    SET v_despues = JSON_INSERT(v_despues, '$."tarjeta_circulacion"', (NEW.`tarjeta_circulacion` + 0));
  END IF;
  IF NOT (OLD.`inspeccion_fisio_mecanica` <=> NEW.`inspeccion_fisio_mecanica`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."inspeccion_fisio_mecanica"', (OLD.`inspeccion_fisio_mecanica` + 0));
    SET v_despues = JSON_INSERT(v_despues, '$."inspeccion_fisio_mecanica"', (NEW.`inspeccion_fisio_mecanica` + 0));
  END IF;
  IF NOT (OLD.`inspeccion_humos` <=> NEW.`inspeccion_humos`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."inspeccion_humos"', (OLD.`inspeccion_humos` + 0));
    SET v_despues = JSON_INSERT(v_despues, '$."inspeccion_humos"', (NEW.`inspeccion_humos` + 0));
  END IF;
  IF NOT (OLD.`puente_fideicomiso` <=> NEW.`puente_fideicomiso`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."puente_fideicomiso"', (OLD.`puente_fideicomiso` + 0));
    SET v_despues = JSON_INSERT(v_despues, '$."puente_fideicomiso"', (NEW.`puente_fideicomiso` + 0));
  END IF;
  IF NOT (OLD.`seguro` <=> NEW.`seguro`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."seguro"', (OLD.`seguro` + 0));
    SET v_despues = JSON_INSERT(v_despues, '$."seguro"', (NEW.`seguro` + 0));
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'status_documents_Trucks', CONCAT_WS('-', NEW.`id`), 'U', v_antes, v_despues);
  END IF;
END
SQL,
    'bit_status_documents_trucks_del' => <<<'SQL'
CREATE TRIGGER `bit_status_documents_trucks_del` AFTER DELETE ON `status_documents_Trucks` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'status_documents_Trucks', CONCAT_WS('-', OLD.`id`), 'D', JSON_OBJECT('id', OLD.`id`, 'truck_id', OLD.`truck_id`, 'registracion', (OLD.`registracion` + 0), 'cab', (OLD.`cab` + 0), 'coi', (OLD.`coi` + 0), 'inspeccion_mecanica', (OLD.`inspeccion_mecanica` + 0), 'tx_dmv', (OLD.`tx_dmv` + 0), 'permiso_ny', (OLD.`permiso_ny` + 0), 'permiso_nm', (OLD.`permiso_nm` + 0), 'dtops', (OLD.`dtops` + 0), 'tarjeta_circulacion', (OLD.`tarjeta_circulacion` + 0), 'inspeccion_fisio_mecanica', (OLD.`inspeccion_fisio_mecanica` + 0), 'inspeccion_humos', (OLD.`inspeccion_humos` + 0), 'puente_fideicomiso', (OLD.`puente_fideicomiso` + 0), 'seguro', (OLD.`seguro` + 0)), NULL);
END
SQL,
    'bit_status_documents_trailers_ins' => <<<'SQL'
CREATE TRIGGER `bit_status_documents_trailers_ins` AFTER INSERT ON `status_documents_Trailers` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'status_documents_Trailers', CONCAT_WS('-', NEW.`id`), 'I', NULL, JSON_OBJECT('id', NEW.`id`, 'caja_id', NEW.`caja_id`, 'Registracion', (NEW.`Registracion` + 0), 'Seguro', (NEW.`Seguro` + 0), 'CAB_CARD', (NEW.`CAB_CARD` + 0), 'Fianza', (NEW.`Fianza` + 0), 'Certificado', (NEW.`Certificado` + 0)));
END
SQL,
    'bit_status_documents_trailers_upd' => <<<'SQL'
CREATE TRIGGER `bit_status_documents_trailers_upd` AFTER UPDATE ON `status_documents_Trailers` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  IF NOT (OLD.`id` <=> NEW.`id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."id"', OLD.`id`);
    SET v_despues = JSON_INSERT(v_despues, '$."id"', NEW.`id`);
  END IF;
  IF NOT (OLD.`caja_id` <=> NEW.`caja_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."caja_id"', OLD.`caja_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."caja_id"', NEW.`caja_id`);
  END IF;
  IF NOT (OLD.`Registracion` <=> NEW.`Registracion`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."Registracion"', (OLD.`Registracion` + 0));
    SET v_despues = JSON_INSERT(v_despues, '$."Registracion"', (NEW.`Registracion` + 0));
  END IF;
  IF NOT (OLD.`Seguro` <=> NEW.`Seguro`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."Seguro"', (OLD.`Seguro` + 0));
    SET v_despues = JSON_INSERT(v_despues, '$."Seguro"', (NEW.`Seguro` + 0));
  END IF;
  IF NOT (OLD.`CAB_CARD` <=> NEW.`CAB_CARD`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."CAB_CARD"', (OLD.`CAB_CARD` + 0));
    SET v_despues = JSON_INSERT(v_despues, '$."CAB_CARD"', (NEW.`CAB_CARD` + 0));
  END IF;
  IF NOT (OLD.`Fianza` <=> NEW.`Fianza`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."Fianza"', (OLD.`Fianza` + 0));
    SET v_despues = JSON_INSERT(v_despues, '$."Fianza"', (NEW.`Fianza` + 0));
  END IF;
  IF NOT (OLD.`Certificado` <=> NEW.`Certificado`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."Certificado"', (OLD.`Certificado` + 0));
    SET v_despues = JSON_INSERT(v_despues, '$."Certificado"', (NEW.`Certificado` + 0));
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'status_documents_Trailers', CONCAT_WS('-', NEW.`id`), 'U', v_antes, v_despues);
  END IF;
END
SQL,
    'bit_status_documents_trailers_del' => <<<'SQL'
CREATE TRIGGER `bit_status_documents_trailers_del` AFTER DELETE ON `status_documents_Trailers` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'status_documents_Trailers', CONCAT_WS('-', OLD.`id`), 'D', JSON_OBJECT('id', OLD.`id`, 'caja_id', OLD.`caja_id`, 'Registracion', (OLD.`Registracion` + 0), 'Seguro', (OLD.`Seguro` + 0), 'CAB_CARD', (OLD.`CAB_CARD` + 0), 'Fianza', (OLD.`Fianza` + 0), 'Certificado', (OLD.`Certificado` + 0)), NULL);
END
SQL,
    'bit_status_documents_ima_ins' => <<<'SQL'
CREATE TRIGGER `bit_status_documents_ima_ins` AFTER INSERT ON `status_documents_IMA` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'status_documents_IMA', CONCAT_WS('-', NEW.`id`), 'I', NULL, JSON_OBJECT('id', NEW.`id`, 'MC', (NEW.`MC` + 0), 'W9', (NEW.`W9` + 0), 'IFTA', (NEW.`IFTA` + 0), 'd2290', (NEW.`d2290` + 0), 'Permiso_KYU', (NEW.`Permiso_KYU` + 0), 'UCR', (NEW.`UCR` + 0), 'SCAC', (NEW.`SCAC` + 0), 'CAAT', (NEW.`CAAT` + 0)));
END
SQL,
    'bit_status_documents_ima_upd' => <<<'SQL'
CREATE TRIGGER `bit_status_documents_ima_upd` AFTER UPDATE ON `status_documents_IMA` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  IF NOT (OLD.`id` <=> NEW.`id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."id"', OLD.`id`);
    SET v_despues = JSON_INSERT(v_despues, '$."id"', NEW.`id`);
  END IF;
  IF NOT (OLD.`MC` <=> NEW.`MC`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."MC"', (OLD.`MC` + 0));
    SET v_despues = JSON_INSERT(v_despues, '$."MC"', (NEW.`MC` + 0));
  END IF;
  IF NOT (OLD.`W9` <=> NEW.`W9`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."W9"', (OLD.`W9` + 0));
    SET v_despues = JSON_INSERT(v_despues, '$."W9"', (NEW.`W9` + 0));
  END IF;
  IF NOT (OLD.`IFTA` <=> NEW.`IFTA`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."IFTA"', (OLD.`IFTA` + 0));
    SET v_despues = JSON_INSERT(v_despues, '$."IFTA"', (NEW.`IFTA` + 0));
  END IF;
  IF NOT (OLD.`d2290` <=> NEW.`d2290`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."d2290"', (OLD.`d2290` + 0));
    SET v_despues = JSON_INSERT(v_despues, '$."d2290"', (NEW.`d2290` + 0));
  END IF;
  IF NOT (OLD.`Permiso_KYU` <=> NEW.`Permiso_KYU`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."Permiso_KYU"', (OLD.`Permiso_KYU` + 0));
    SET v_despues = JSON_INSERT(v_despues, '$."Permiso_KYU"', (NEW.`Permiso_KYU` + 0));
  END IF;
  IF NOT (OLD.`UCR` <=> NEW.`UCR`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."UCR"', (OLD.`UCR` + 0));
    SET v_despues = JSON_INSERT(v_despues, '$."UCR"', (NEW.`UCR` + 0));
  END IF;
  IF NOT (OLD.`SCAC` <=> NEW.`SCAC`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."SCAC"', (OLD.`SCAC` + 0));
    SET v_despues = JSON_INSERT(v_despues, '$."SCAC"', (NEW.`SCAC` + 0));
  END IF;
  IF NOT (OLD.`CAAT` <=> NEW.`CAAT`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."CAAT"', (OLD.`CAAT` + 0));
    SET v_despues = JSON_INSERT(v_despues, '$."CAAT"', (NEW.`CAAT` + 0));
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'status_documents_IMA', CONCAT_WS('-', NEW.`id`), 'U', v_antes, v_despues);
  END IF;
END
SQL,
    'bit_status_documents_ima_del' => <<<'SQL'
CREATE TRIGGER `bit_status_documents_ima_del` AFTER DELETE ON `status_documents_IMA` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'status_documents_IMA', CONCAT_WS('-', OLD.`id`), 'D', JSON_OBJECT('id', OLD.`id`, 'MC', (OLD.`MC` + 0), 'W9', (OLD.`W9` + 0), 'IFTA', (OLD.`IFTA` + 0), 'd2290', (OLD.`d2290` + 0), 'Permiso_KYU', (OLD.`Permiso_KYU` + 0), 'UCR', (OLD.`UCR` + 0), 'SCAC', (OLD.`SCAC` + 0), 'CAAT', (OLD.`CAAT` + 0)), NULL);
END
SQL,
    'bit_articulos_inventario_ins' => <<<'SQL'
CREATE TRIGGER `bit_articulos_inventario_ins` AFTER INSERT ON `articulos_inventario` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'articulos_inventario', CONCAT_WS('-', NEW.`id_articulo`), 'I', NULL, JSON_OBJECT('id_articulo', NEW.`id_articulo`, 'id_subcategoria', NEW.`id_subcategoria`, 'nombre_articulo', NEW.`nombre_articulo`, 'descripcion', NEW.`descripcion`, 'sku', NEW.`sku`, 'cantidad_stock', NEW.`cantidad_stock`, 'unidad_medida', NEW.`unidad_medida`, 'costo_unidad', NEW.`costo_unidad`, 'ubicacion_almacen', NEW.`ubicacion_almacen`, 'punto_reorden', NEW.`punto_reorden`));
END
SQL,
    'bit_articulos_inventario_upd' => <<<'SQL'
CREATE TRIGGER `bit_articulos_inventario_upd` AFTER UPDATE ON `articulos_inventario` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  IF NOT (OLD.`id_articulo` <=> NEW.`id_articulo`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."id_articulo"', OLD.`id_articulo`);
    SET v_despues = JSON_INSERT(v_despues, '$."id_articulo"', NEW.`id_articulo`);
  END IF;
  IF NOT (OLD.`id_subcategoria` <=> NEW.`id_subcategoria`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."id_subcategoria"', OLD.`id_subcategoria`);
    SET v_despues = JSON_INSERT(v_despues, '$."id_subcategoria"', NEW.`id_subcategoria`);
  END IF;
  IF NOT (OLD.`nombre_articulo` <=> NEW.`nombre_articulo`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."nombre_articulo"', OLD.`nombre_articulo`);
    SET v_despues = JSON_INSERT(v_despues, '$."nombre_articulo"', NEW.`nombre_articulo`);
  END IF;
  IF NOT (OLD.`descripcion` <=> NEW.`descripcion`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."descripcion"', OLD.`descripcion`);
    SET v_despues = JSON_INSERT(v_despues, '$."descripcion"', NEW.`descripcion`);
  END IF;
  IF NOT (OLD.`sku` <=> NEW.`sku`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."sku"', OLD.`sku`);
    SET v_despues = JSON_INSERT(v_despues, '$."sku"', NEW.`sku`);
  END IF;
  IF NOT (OLD.`cantidad_stock` <=> NEW.`cantidad_stock`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."cantidad_stock"', OLD.`cantidad_stock`);
    SET v_despues = JSON_INSERT(v_despues, '$."cantidad_stock"', NEW.`cantidad_stock`);
  END IF;
  IF NOT (OLD.`unidad_medida` <=> NEW.`unidad_medida`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."unidad_medida"', OLD.`unidad_medida`);
    SET v_despues = JSON_INSERT(v_despues, '$."unidad_medida"', NEW.`unidad_medida`);
  END IF;
  IF NOT (OLD.`costo_unidad` <=> NEW.`costo_unidad`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."costo_unidad"', OLD.`costo_unidad`);
    SET v_despues = JSON_INSERT(v_despues, '$."costo_unidad"', NEW.`costo_unidad`);
  END IF;
  IF NOT (OLD.`ubicacion_almacen` <=> NEW.`ubicacion_almacen`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."ubicacion_almacen"', OLD.`ubicacion_almacen`);
    SET v_despues = JSON_INSERT(v_despues, '$."ubicacion_almacen"', NEW.`ubicacion_almacen`);
  END IF;
  IF NOT (OLD.`punto_reorden` <=> NEW.`punto_reorden`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."punto_reorden"', OLD.`punto_reorden`);
    SET v_despues = JSON_INSERT(v_despues, '$."punto_reorden"', NEW.`punto_reorden`);
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'articulos_inventario', CONCAT_WS('-', NEW.`id_articulo`), 'U', v_antes, v_despues);
  END IF;
END
SQL,
    'bit_articulos_inventario_del' => <<<'SQL'
CREATE TRIGGER `bit_articulos_inventario_del` AFTER DELETE ON `articulos_inventario` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'articulos_inventario', CONCAT_WS('-', OLD.`id_articulo`), 'D', JSON_OBJECT('id_articulo', OLD.`id_articulo`, 'id_subcategoria', OLD.`id_subcategoria`, 'nombre_articulo', OLD.`nombre_articulo`, 'descripcion', OLD.`descripcion`, 'sku', OLD.`sku`, 'cantidad_stock', OLD.`cantidad_stock`, 'unidad_medida', OLD.`unidad_medida`, 'costo_unidad', OLD.`costo_unidad`, 'ubicacion_almacen', OLD.`ubicacion_almacen`, 'punto_reorden', OLD.`punto_reorden`), NULL);
END
SQL,
    'bit_movimientos_inventario_ins' => <<<'SQL'
CREATE TRIGGER `bit_movimientos_inventario_ins` AFTER INSERT ON `movimientos_inventario` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'movimientos_inventario', CONCAT_WS('-', NEW.`id_movimiento`), 'I', NULL, JSON_OBJECT('id_movimiento', NEW.`id_movimiento`, 'id_articulo', NEW.`id_articulo`, 'tipo_movimiento', NEW.`tipo_movimiento`, 'cantidad', NEW.`cantidad`, 'fecha_movimiento', NEW.`fecha_movimiento`, 'id_detalle_gasto', NEW.`id_detalle_gasto`, 'referencia', NEW.`referencia`));
END
SQL,
    'bit_movimientos_inventario_upd' => <<<'SQL'
CREATE TRIGGER `bit_movimientos_inventario_upd` AFTER UPDATE ON `movimientos_inventario` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  IF NOT (OLD.`id_movimiento` <=> NEW.`id_movimiento`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."id_movimiento"', OLD.`id_movimiento`);
    SET v_despues = JSON_INSERT(v_despues, '$."id_movimiento"', NEW.`id_movimiento`);
  END IF;
  IF NOT (OLD.`id_articulo` <=> NEW.`id_articulo`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."id_articulo"', OLD.`id_articulo`);
    SET v_despues = JSON_INSERT(v_despues, '$."id_articulo"', NEW.`id_articulo`);
  END IF;
  IF NOT (OLD.`tipo_movimiento` <=> NEW.`tipo_movimiento`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."tipo_movimiento"', OLD.`tipo_movimiento`);
    SET v_despues = JSON_INSERT(v_despues, '$."tipo_movimiento"', NEW.`tipo_movimiento`);
  END IF;
  IF NOT (OLD.`cantidad` <=> NEW.`cantidad`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."cantidad"', OLD.`cantidad`);
    SET v_despues = JSON_INSERT(v_despues, '$."cantidad"', NEW.`cantidad`);
  END IF;
  IF NOT (OLD.`fecha_movimiento` <=> NEW.`fecha_movimiento`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."fecha_movimiento"', OLD.`fecha_movimiento`);
    SET v_despues = JSON_INSERT(v_despues, '$."fecha_movimiento"', NEW.`fecha_movimiento`);
  END IF;
  IF NOT (OLD.`id_detalle_gasto` <=> NEW.`id_detalle_gasto`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."id_detalle_gasto"', OLD.`id_detalle_gasto`);
    SET v_despues = JSON_INSERT(v_despues, '$."id_detalle_gasto"', NEW.`id_detalle_gasto`);
  END IF;
  IF NOT (OLD.`referencia` <=> NEW.`referencia`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."referencia"', OLD.`referencia`);
    SET v_despues = JSON_INSERT(v_despues, '$."referencia"', NEW.`referencia`);
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'movimientos_inventario', CONCAT_WS('-', NEW.`id_movimiento`), 'U', v_antes, v_despues);
  END IF;
END
SQL,
    'bit_movimientos_inventario_del' => <<<'SQL'
CREATE TRIGGER `bit_movimientos_inventario_del` AFTER DELETE ON `movimientos_inventario` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'movimientos_inventario', CONCAT_WS('-', OLD.`id_movimiento`), 'D', JSON_OBJECT('id_movimiento', OLD.`id_movimiento`, 'id_articulo', OLD.`id_articulo`, 'tipo_movimiento', OLD.`tipo_movimiento`, 'cantidad', OLD.`cantidad`, 'fecha_movimiento', OLD.`fecha_movimiento`, 'id_detalle_gasto', OLD.`id_detalle_gasto`, 'referencia', OLD.`referencia`), NULL);
END
SQL,
    'bit_activos_ins' => <<<'SQL'
CREATE TRIGGER `bit_activos_ins` AFTER INSERT ON `activos` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'activos', CONCAT_WS('-', NEW.`id_activo`), 'I', NULL, JSON_OBJECT('id_activo', NEW.`id_activo`, 'nombre_activo', NEW.`nombre_activo`, 'numero_serie', NEW.`numero_serie`, 'tipo_activo', NEW.`tipo_activo`, 'fecha_adquisicion', NEW.`fecha_adquisicion`));
END
SQL,
    'bit_activos_upd' => <<<'SQL'
CREATE TRIGGER `bit_activos_upd` AFTER UPDATE ON `activos` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  IF NOT (OLD.`id_activo` <=> NEW.`id_activo`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."id_activo"', OLD.`id_activo`);
    SET v_despues = JSON_INSERT(v_despues, '$."id_activo"', NEW.`id_activo`);
  END IF;
  IF NOT (OLD.`nombre_activo` <=> NEW.`nombre_activo`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."nombre_activo"', OLD.`nombre_activo`);
    SET v_despues = JSON_INSERT(v_despues, '$."nombre_activo"', NEW.`nombre_activo`);
  END IF;
  IF NOT (OLD.`numero_serie` <=> NEW.`numero_serie`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."numero_serie"', OLD.`numero_serie`);
    SET v_despues = JSON_INSERT(v_despues, '$."numero_serie"', NEW.`numero_serie`);
  END IF;
  IF NOT (OLD.`tipo_activo` <=> NEW.`tipo_activo`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."tipo_activo"', OLD.`tipo_activo`);
    SET v_despues = JSON_INSERT(v_despues, '$."tipo_activo"', NEW.`tipo_activo`);
  END IF;
  IF NOT (OLD.`fecha_adquisicion` <=> NEW.`fecha_adquisicion`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."fecha_adquisicion"', OLD.`fecha_adquisicion`);
    SET v_despues = JSON_INSERT(v_despues, '$."fecha_adquisicion"', NEW.`fecha_adquisicion`);
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'activos', CONCAT_WS('-', NEW.`id_activo`), 'U', v_antes, v_despues);
  END IF;
END
SQL,
    'bit_activos_del' => <<<'SQL'
CREATE TRIGGER `bit_activos_del` AFTER DELETE ON `activos` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'activos', CONCAT_WS('-', OLD.`id_activo`), 'D', JSON_OBJECT('id_activo', OLD.`id_activo`, 'nombre_activo', OLD.`nombre_activo`, 'numero_serie', OLD.`numero_serie`, 'tipo_activo', OLD.`tipo_activo`, 'fecha_adquisicion', OLD.`fecha_adquisicion`), NULL);
END
SQL,
    'bit_teams_ins' => <<<'SQL'
CREATE TRIGGER `bit_teams_ins` AFTER INSERT ON `teams` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'teams', CONCAT_WS('-', NEW.`team_id`), 'I', NULL, JSON_OBJECT('team_id', NEW.`team_id`, 'name', NEW.`name`, 'description', NEW.`description`, 'active', NEW.`active`, 'created_at', NEW.`created_at`));
END
SQL,
    'bit_teams_upd' => <<<'SQL'
CREATE TRIGGER `bit_teams_upd` AFTER UPDATE ON `teams` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  IF NOT (OLD.`team_id` <=> NEW.`team_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."team_id"', OLD.`team_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."team_id"', NEW.`team_id`);
  END IF;
  IF NOT (OLD.`name` <=> NEW.`name`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."name"', OLD.`name`);
    SET v_despues = JSON_INSERT(v_despues, '$."name"', NEW.`name`);
  END IF;
  IF NOT (OLD.`description` <=> NEW.`description`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."description"', OLD.`description`);
    SET v_despues = JSON_INSERT(v_despues, '$."description"', NEW.`description`);
  END IF;
  IF NOT (OLD.`active` <=> NEW.`active`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."active"', OLD.`active`);
    SET v_despues = JSON_INSERT(v_despues, '$."active"', NEW.`active`);
  END IF;
  IF NOT (OLD.`created_at` <=> NEW.`created_at`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."created_at"', OLD.`created_at`);
    SET v_despues = JSON_INSERT(v_despues, '$."created_at"', NEW.`created_at`);
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'teams', CONCAT_WS('-', NEW.`team_id`), 'U', v_antes, v_despues);
  END IF;
END
SQL,
    'bit_teams_del' => <<<'SQL'
CREATE TRIGGER `bit_teams_del` AFTER DELETE ON `teams` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'teams', CONCAT_WS('-', OLD.`team_id`), 'D', JSON_OBJECT('team_id', OLD.`team_id`, 'name', OLD.`name`, 'description', OLD.`description`, 'active', OLD.`active`, 'created_at', OLD.`created_at`), NULL);
END
SQL,
    'bit_user_teams_ins' => <<<'SQL'
CREATE TRIGGER `bit_user_teams_ins` AFTER INSERT ON `user_teams` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'user_teams', CONCAT_WS('-', NEW.`user_id`, NEW.`team_id`), 'I', NULL, JSON_OBJECT('user_id', NEW.`user_id`, 'team_id', NEW.`team_id`));
END
SQL,
    'bit_user_teams_upd' => <<<'SQL'
CREATE TRIGGER `bit_user_teams_upd` AFTER UPDATE ON `user_teams` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  IF NOT (OLD.`user_id` <=> NEW.`user_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."user_id"', OLD.`user_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."user_id"', NEW.`user_id`);
  END IF;
  IF NOT (OLD.`team_id` <=> NEW.`team_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."team_id"', OLD.`team_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."team_id"', NEW.`team_id`);
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'user_teams', CONCAT_WS('-', NEW.`user_id`, NEW.`team_id`), 'U', v_antes, v_despues);
  END IF;
END
SQL,
    'bit_user_teams_del' => <<<'SQL'
CREATE TRIGGER `bit_user_teams_del` AFTER DELETE ON `user_teams` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'user_teams', CONCAT_WS('-', OLD.`user_id`, OLD.`team_id`), 'D', JSON_OBJECT('user_id', OLD.`user_id`, 'team_id', OLD.`team_id`), NULL);
END
SQL,
    'bit_tipos_gasto_ins' => <<<'SQL'
CREATE TRIGGER `bit_tipos_gasto_ins` AFTER INSERT ON `tipos_gasto` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'tipos_gasto', CONCAT_WS('-', NEW.`id_tipo_gasto`), 'I', NULL, JSON_OBJECT('id_tipo_gasto', NEW.`id_tipo_gasto`, 'nombre_tipo_gasto', NEW.`nombre_tipo_gasto`, 'activo', NEW.`activo`));
END
SQL,
    'bit_tipos_gasto_upd' => <<<'SQL'
CREATE TRIGGER `bit_tipos_gasto_upd` AFTER UPDATE ON `tipos_gasto` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  IF NOT (OLD.`id_tipo_gasto` <=> NEW.`id_tipo_gasto`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."id_tipo_gasto"', OLD.`id_tipo_gasto`);
    SET v_despues = JSON_INSERT(v_despues, '$."id_tipo_gasto"', NEW.`id_tipo_gasto`);
  END IF;
  IF NOT (OLD.`nombre_tipo_gasto` <=> NEW.`nombre_tipo_gasto`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."nombre_tipo_gasto"', OLD.`nombre_tipo_gasto`);
    SET v_despues = JSON_INSERT(v_despues, '$."nombre_tipo_gasto"', NEW.`nombre_tipo_gasto`);
  END IF;
  IF NOT (OLD.`activo` <=> NEW.`activo`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."activo"', OLD.`activo`);
    SET v_despues = JSON_INSERT(v_despues, '$."activo"', NEW.`activo`);
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'tipos_gasto', CONCAT_WS('-', NEW.`id_tipo_gasto`), 'U', v_antes, v_despues);
  END IF;
END
SQL,
    'bit_tipos_gasto_del' => <<<'SQL'
CREATE TRIGGER `bit_tipos_gasto_del` AFTER DELETE ON `tipos_gasto` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'tipos_gasto', CONCAT_WS('-', OLD.`id_tipo_gasto`), 'D', JSON_OBJECT('id_tipo_gasto', OLD.`id_tipo_gasto`, 'nombre_tipo_gasto', OLD.`nombre_tipo_gasto`, 'activo', OLD.`activo`), NULL);
END
SQL,
    'bit_tipos_reparacion_ins' => <<<'SQL'
CREATE TRIGGER `bit_tipos_reparacion_ins` AFTER INSERT ON `tipos_reparacion` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'tipos_reparacion', CONCAT_WS('-', NEW.`id_tipo_reparacion`), 'I', NULL, JSON_OBJECT('id_tipo_reparacion', NEW.`id_tipo_reparacion`, 'nombre_reparacion', NEW.`nombre_reparacion`));
END
SQL,
    'bit_tipos_reparacion_upd' => <<<'SQL'
CREATE TRIGGER `bit_tipos_reparacion_upd` AFTER UPDATE ON `tipos_reparacion` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  IF NOT (OLD.`id_tipo_reparacion` <=> NEW.`id_tipo_reparacion`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."id_tipo_reparacion"', OLD.`id_tipo_reparacion`);
    SET v_despues = JSON_INSERT(v_despues, '$."id_tipo_reparacion"', NEW.`id_tipo_reparacion`);
  END IF;
  IF NOT (OLD.`nombre_reparacion` <=> NEW.`nombre_reparacion`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."nombre_reparacion"', OLD.`nombre_reparacion`);
    SET v_despues = JSON_INSERT(v_despues, '$."nombre_reparacion"', NEW.`nombre_reparacion`);
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'tipos_reparacion', CONCAT_WS('-', NEW.`id_tipo_reparacion`), 'U', v_antes, v_despues);
  END IF;
END
SQL,
    'bit_tipos_reparacion_del' => <<<'SQL'
CREATE TRIGGER `bit_tipos_reparacion_del` AFTER DELETE ON `tipos_reparacion` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'tipos_reparacion', CONCAT_WS('-', OLD.`id_tipo_reparacion`), 'D', JSON_OBJECT('id_tipo_reparacion', OLD.`id_tipo_reparacion`, 'nombre_reparacion', OLD.`nombre_reparacion`), NULL);
END
SQL,
    'bit_categorias_mantenimiento_ins' => <<<'SQL'
CREATE TRIGGER `bit_categorias_mantenimiento_ins` AFTER INSERT ON `categorias_mantenimiento` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'categorias_mantenimiento', CONCAT_WS('-', NEW.`id_categoria`), 'I', NULL, JSON_OBJECT('id_categoria', NEW.`id_categoria`, 'nombre_categoria', NEW.`nombre_categoria`, 'id_tipo_gasto', NEW.`id_tipo_gasto`));
END
SQL,
    'bit_categorias_mantenimiento_upd' => <<<'SQL'
CREATE TRIGGER `bit_categorias_mantenimiento_upd` AFTER UPDATE ON `categorias_mantenimiento` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  IF NOT (OLD.`id_categoria` <=> NEW.`id_categoria`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."id_categoria"', OLD.`id_categoria`);
    SET v_despues = JSON_INSERT(v_despues, '$."id_categoria"', NEW.`id_categoria`);
  END IF;
  IF NOT (OLD.`nombre_categoria` <=> NEW.`nombre_categoria`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."nombre_categoria"', OLD.`nombre_categoria`);
    SET v_despues = JSON_INSERT(v_despues, '$."nombre_categoria"', NEW.`nombre_categoria`);
  END IF;
  IF NOT (OLD.`id_tipo_gasto` <=> NEW.`id_tipo_gasto`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."id_tipo_gasto"', OLD.`id_tipo_gasto`);
    SET v_despues = JSON_INSERT(v_despues, '$."id_tipo_gasto"', NEW.`id_tipo_gasto`);
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'categorias_mantenimiento', CONCAT_WS('-', NEW.`id_categoria`), 'U', v_antes, v_despues);
  END IF;
END
SQL,
    'bit_categorias_mantenimiento_del' => <<<'SQL'
CREATE TRIGGER `bit_categorias_mantenimiento_del` AFTER DELETE ON `categorias_mantenimiento` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'categorias_mantenimiento', CONCAT_WS('-', OLD.`id_categoria`), 'D', JSON_OBJECT('id_categoria', OLD.`id_categoria`, 'nombre_categoria', OLD.`nombre_categoria`, 'id_tipo_gasto', OLD.`id_tipo_gasto`), NULL);
END
SQL,
    'bit_subcategorias_mantenimiento_ins' => <<<'SQL'
CREATE TRIGGER `bit_subcategorias_mantenimiento_ins` AFTER INSERT ON `subcategorias_mantenimiento` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'subcategorias_mantenimiento', CONCAT_WS('-', NEW.`id_subcategoria`), 'I', NULL, JSON_OBJECT('id_subcategoria', NEW.`id_subcategoria`, 'id_categoria', NEW.`id_categoria`, 'nombre_subcategoria', NEW.`nombre_subcategoria`));
END
SQL,
    'bit_subcategorias_mantenimiento_upd' => <<<'SQL'
CREATE TRIGGER `bit_subcategorias_mantenimiento_upd` AFTER UPDATE ON `subcategorias_mantenimiento` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  IF NOT (OLD.`id_subcategoria` <=> NEW.`id_subcategoria`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."id_subcategoria"', OLD.`id_subcategoria`);
    SET v_despues = JSON_INSERT(v_despues, '$."id_subcategoria"', NEW.`id_subcategoria`);
  END IF;
  IF NOT (OLD.`id_categoria` <=> NEW.`id_categoria`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."id_categoria"', OLD.`id_categoria`);
    SET v_despues = JSON_INSERT(v_despues, '$."id_categoria"', NEW.`id_categoria`);
  END IF;
  IF NOT (OLD.`nombre_subcategoria` <=> NEW.`nombre_subcategoria`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."nombre_subcategoria"', OLD.`nombre_subcategoria`);
    SET v_despues = JSON_INSERT(v_despues, '$."nombre_subcategoria"', NEW.`nombre_subcategoria`);
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'subcategorias_mantenimiento', CONCAT_WS('-', NEW.`id_subcategoria`), 'U', v_antes, v_despues);
  END IF;
END
SQL,
    'bit_subcategorias_mantenimiento_del' => <<<'SQL'
CREATE TRIGGER `bit_subcategorias_mantenimiento_del` AFTER DELETE ON `subcategorias_mantenimiento` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'subcategorias_mantenimiento', CONCAT_WS('-', OLD.`id_subcategoria`), 'D', JSON_OBJECT('id_subcategoria', OLD.`id_subcategoria`, 'id_categoria', OLD.`id_categoria`, 'nombre_subcategoria', OLD.`nombre_subcategoria`), NULL);
END
SQL,
    'bit_inspection_descriptions_ins' => <<<'SQL'
CREATE TRIGGER `bit_inspection_descriptions_ins` AFTER INSERT ON `inspection_descriptions` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'inspection_descriptions', CONCAT_WS('-', NEW.`id_descripcion`), 'I', NULL, JSON_OBJECT('id_descripcion', NEW.`id_descripcion`, 'descripcion', NEW.`descripcion`));
END
SQL,
    'bit_inspection_descriptions_upd' => <<<'SQL'
CREATE TRIGGER `bit_inspection_descriptions_upd` AFTER UPDATE ON `inspection_descriptions` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  IF NOT (OLD.`id_descripcion` <=> NEW.`id_descripcion`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."id_descripcion"', OLD.`id_descripcion`);
    SET v_despues = JSON_INSERT(v_despues, '$."id_descripcion"', NEW.`id_descripcion`);
  END IF;
  IF NOT (OLD.`descripcion` <=> NEW.`descripcion`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."descripcion"', OLD.`descripcion`);
    SET v_despues = JSON_INSERT(v_despues, '$."descripcion"', NEW.`descripcion`);
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'inspection_descriptions', CONCAT_WS('-', NEW.`id_descripcion`), 'U', v_antes, v_despues);
  END IF;
END
SQL,
    'bit_inspection_descriptions_del' => <<<'SQL'
CREATE TRIGGER `bit_inspection_descriptions_del` AFTER DELETE ON `inspection_descriptions` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'inspection_descriptions', CONCAT_WS('-', OLD.`id_descripcion`), 'D', JSON_OBJECT('id_descripcion', OLD.`id_descripcion`, 'descripcion', OLD.`descripcion`), NULL);
END
SQL,
    'bit_origenes_ins' => <<<'SQL'
CREATE TRIGGER `bit_origenes_ins` AFTER INSERT ON `origenes` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'origenes', CONCAT_WS('-', NEW.`id`), 'I', NULL, JSON_OBJECT('id', NEW.`id`, 'nombre', NEW.`nombre`));
END
SQL,
    'bit_origenes_upd' => <<<'SQL'
CREATE TRIGGER `bit_origenes_upd` AFTER UPDATE ON `origenes` FOR EACH ROW
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
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'origenes', CONCAT_WS('-', NEW.`id`), 'U', v_antes, v_despues);
  END IF;
END
SQL,
    'bit_origenes_del' => <<<'SQL'
CREATE TRIGGER `bit_origenes_del` AFTER DELETE ON `origenes` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'origenes', CONCAT_WS('-', OLD.`id`), 'D', JSON_OBJECT('id', OLD.`id`, 'nombre', OLD.`nombre`), NULL);
END
SQL,
    'bit_cat_origenes_ins' => <<<'SQL'
CREATE TRIGGER `bit_cat_origenes_ins` AFTER INSERT ON `cat_origenes` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'cat_origenes', CONCAT_WS('-', NEW.`id`), 'I', NULL, JSON_OBJECT('id', NEW.`id`, 'nombre', NEW.`nombre`, 'zip_code', NEW.`zip_code`, 'estatus', NEW.`estatus`, 'fecha_creacion', NEW.`fecha_creacion`));
END
SQL,
    'bit_cat_origenes_upd' => <<<'SQL'
CREATE TRIGGER `bit_cat_origenes_upd` AFTER UPDATE ON `cat_origenes` FOR EACH ROW
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
  IF NOT (OLD.`zip_code` <=> NEW.`zip_code`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."zip_code"', OLD.`zip_code`);
    SET v_despues = JSON_INSERT(v_despues, '$."zip_code"', NEW.`zip_code`);
  END IF;
  IF NOT (OLD.`estatus` <=> NEW.`estatus`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."estatus"', OLD.`estatus`);
    SET v_despues = JSON_INSERT(v_despues, '$."estatus"', NEW.`estatus`);
  END IF;
  IF NOT (OLD.`fecha_creacion` <=> NEW.`fecha_creacion`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."fecha_creacion"', OLD.`fecha_creacion`);
    SET v_despues = JSON_INSERT(v_despues, '$."fecha_creacion"', NEW.`fecha_creacion`);
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'cat_origenes', CONCAT_WS('-', NEW.`id`), 'U', v_antes, v_despues);
  END IF;
END
SQL,
    'bit_cat_origenes_del' => <<<'SQL'
CREATE TRIGGER `bit_cat_origenes_del` AFTER DELETE ON `cat_origenes` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'cat_origenes', CONCAT_WS('-', OLD.`id`), 'D', JSON_OBJECT('id', OLD.`id`, 'nombre', OLD.`nombre`, 'zip_code', OLD.`zip_code`, 'estatus', OLD.`estatus`, 'fecha_creacion', OLD.`fecha_creacion`), NULL);
END
SQL,
    'bit_cat_trucks_requisitos_ins' => <<<'SQL'
CREATE TRIGGER `bit_cat_trucks_requisitos_ins` AFTER INSERT ON `cat_trucks_requisitos` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'cat_trucks_requisitos', CONCAT_WS('-', NEW.`id_requisito`), 'I', NULL, JSON_OBJECT('id_requisito', NEW.`id_requisito`, 'key_name', NEW.`key_name`, 'label', NEW.`label`, 'categoria', NEW.`categoria`, 'tipo', NEW.`tipo`, 'tiene_vencimiento', NEW.`tiene_vencimiento`, 'activo', NEW.`activo`, 'oculto_en_tabla', NEW.`oculto_en_tabla`));
END
SQL,
    'bit_cat_trucks_requisitos_upd' => <<<'SQL'
CREATE TRIGGER `bit_cat_trucks_requisitos_upd` AFTER UPDATE ON `cat_trucks_requisitos` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  IF NOT (OLD.`id_requisito` <=> NEW.`id_requisito`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."id_requisito"', OLD.`id_requisito`);
    SET v_despues = JSON_INSERT(v_despues, '$."id_requisito"', NEW.`id_requisito`);
  END IF;
  IF NOT (OLD.`key_name` <=> NEW.`key_name`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."key_name"', OLD.`key_name`);
    SET v_despues = JSON_INSERT(v_despues, '$."key_name"', NEW.`key_name`);
  END IF;
  IF NOT (OLD.`label` <=> NEW.`label`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."label"', OLD.`label`);
    SET v_despues = JSON_INSERT(v_despues, '$."label"', NEW.`label`);
  END IF;
  IF NOT (OLD.`categoria` <=> NEW.`categoria`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."categoria"', OLD.`categoria`);
    SET v_despues = JSON_INSERT(v_despues, '$."categoria"', NEW.`categoria`);
  END IF;
  IF NOT (OLD.`tipo` <=> NEW.`tipo`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."tipo"', OLD.`tipo`);
    SET v_despues = JSON_INSERT(v_despues, '$."tipo"', NEW.`tipo`);
  END IF;
  IF NOT (OLD.`tiene_vencimiento` <=> NEW.`tiene_vencimiento`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."tiene_vencimiento"', OLD.`tiene_vencimiento`);
    SET v_despues = JSON_INSERT(v_despues, '$."tiene_vencimiento"', NEW.`tiene_vencimiento`);
  END IF;
  IF NOT (OLD.`activo` <=> NEW.`activo`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."activo"', OLD.`activo`);
    SET v_despues = JSON_INSERT(v_despues, '$."activo"', NEW.`activo`);
  END IF;
  IF NOT (OLD.`oculto_en_tabla` <=> NEW.`oculto_en_tabla`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."oculto_en_tabla"', OLD.`oculto_en_tabla`);
    SET v_despues = JSON_INSERT(v_despues, '$."oculto_en_tabla"', NEW.`oculto_en_tabla`);
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'cat_trucks_requisitos', CONCAT_WS('-', NEW.`id_requisito`), 'U', v_antes, v_despues);
  END IF;
END
SQL,
    'bit_cat_trucks_requisitos_del' => <<<'SQL'
CREATE TRIGGER `bit_cat_trucks_requisitos_del` AFTER DELETE ON `cat_trucks_requisitos` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'cat_trucks_requisitos', CONCAT_WS('-', OLD.`id_requisito`), 'D', JSON_OBJECT('id_requisito', OLD.`id_requisito`, 'key_name', OLD.`key_name`, 'label', OLD.`label`, 'categoria', OLD.`categoria`, 'tipo', OLD.`tipo`, 'tiene_vencimiento', OLD.`tiene_vencimiento`, 'activo', OLD.`activo`, 'oculto_en_tabla', OLD.`oculto_en_tabla`), NULL);
END
SQL,
    'bit_cat_drivers_requisitos_ins' => <<<'SQL'
CREATE TRIGGER `bit_cat_drivers_requisitos_ins` AFTER INSERT ON `cat_drivers_requisitos` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'cat_drivers_requisitos', CONCAT_WS('-', NEW.`id_requisito`), 'I', NULL, JSON_OBJECT('id_requisito', NEW.`id_requisito`, 'key_name', NEW.`key_name`, 'label', NEW.`label`, 'categoria', NEW.`categoria`, 'tipo', NEW.`tipo`, 'tiene_vencimiento', NEW.`tiene_vencimiento`, 'activo', NEW.`activo`, 'oculto_en_tabla', NEW.`oculto_en_tabla`));
END
SQL,
    'bit_cat_drivers_requisitos_upd' => <<<'SQL'
CREATE TRIGGER `bit_cat_drivers_requisitos_upd` AFTER UPDATE ON `cat_drivers_requisitos` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  IF NOT (OLD.`id_requisito` <=> NEW.`id_requisito`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."id_requisito"', OLD.`id_requisito`);
    SET v_despues = JSON_INSERT(v_despues, '$."id_requisito"', NEW.`id_requisito`);
  END IF;
  IF NOT (OLD.`key_name` <=> NEW.`key_name`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."key_name"', OLD.`key_name`);
    SET v_despues = JSON_INSERT(v_despues, '$."key_name"', NEW.`key_name`);
  END IF;
  IF NOT (OLD.`label` <=> NEW.`label`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."label"', OLD.`label`);
    SET v_despues = JSON_INSERT(v_despues, '$."label"', NEW.`label`);
  END IF;
  IF NOT (OLD.`categoria` <=> NEW.`categoria`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."categoria"', OLD.`categoria`);
    SET v_despues = JSON_INSERT(v_despues, '$."categoria"', NEW.`categoria`);
  END IF;
  IF NOT (OLD.`tipo` <=> NEW.`tipo`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."tipo"', OLD.`tipo`);
    SET v_despues = JSON_INSERT(v_despues, '$."tipo"', NEW.`tipo`);
  END IF;
  IF NOT (OLD.`tiene_vencimiento` <=> NEW.`tiene_vencimiento`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."tiene_vencimiento"', OLD.`tiene_vencimiento`);
    SET v_despues = JSON_INSERT(v_despues, '$."tiene_vencimiento"', NEW.`tiene_vencimiento`);
  END IF;
  IF NOT (OLD.`activo` <=> NEW.`activo`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."activo"', OLD.`activo`);
    SET v_despues = JSON_INSERT(v_despues, '$."activo"', NEW.`activo`);
  END IF;
  IF NOT (OLD.`oculto_en_tabla` <=> NEW.`oculto_en_tabla`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."oculto_en_tabla"', OLD.`oculto_en_tabla`);
    SET v_despues = JSON_INSERT(v_despues, '$."oculto_en_tabla"', NEW.`oculto_en_tabla`);
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'cat_drivers_requisitos', CONCAT_WS('-', NEW.`id_requisito`), 'U', v_antes, v_despues);
  END IF;
END
SQL,
    'bit_cat_drivers_requisitos_del' => <<<'SQL'
CREATE TRIGGER `bit_cat_drivers_requisitos_del` AFTER DELETE ON `cat_drivers_requisitos` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'cat_drivers_requisitos', CONCAT_WS('-', OLD.`id_requisito`), 'D', JSON_OBJECT('id_requisito', OLD.`id_requisito`, 'key_name', OLD.`key_name`, 'label', OLD.`label`, 'categoria', OLD.`categoria`, 'tipo', OLD.`tipo`, 'tiene_vencimiento', OLD.`tiene_vencimiento`, 'activo', OLD.`activo`, 'oculto_en_tabla', OLD.`oculto_en_tabla`), NULL);
END
SQL,
    'bit_cat_cajas_requisitos_ins' => <<<'SQL'
CREATE TRIGGER `bit_cat_cajas_requisitos_ins` AFTER INSERT ON `cat_cajas_requisitos` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'cat_cajas_requisitos', CONCAT_WS('-', NEW.`id_requisito`), 'I', NULL, JSON_OBJECT('id_requisito', NEW.`id_requisito`, 'key_name', NEW.`key_name`, 'label', NEW.`label`, 'categoria', NEW.`categoria`, 'tipo', NEW.`tipo`, 'tiene_vencimiento', NEW.`tiene_vencimiento`, 'activo', NEW.`activo`));
END
SQL,
    'bit_cat_cajas_requisitos_upd' => <<<'SQL'
CREATE TRIGGER `bit_cat_cajas_requisitos_upd` AFTER UPDATE ON `cat_cajas_requisitos` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  IF NOT (OLD.`id_requisito` <=> NEW.`id_requisito`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."id_requisito"', OLD.`id_requisito`);
    SET v_despues = JSON_INSERT(v_despues, '$."id_requisito"', NEW.`id_requisito`);
  END IF;
  IF NOT (OLD.`key_name` <=> NEW.`key_name`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."key_name"', OLD.`key_name`);
    SET v_despues = JSON_INSERT(v_despues, '$."key_name"', NEW.`key_name`);
  END IF;
  IF NOT (OLD.`label` <=> NEW.`label`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."label"', OLD.`label`);
    SET v_despues = JSON_INSERT(v_despues, '$."label"', NEW.`label`);
  END IF;
  IF NOT (OLD.`categoria` <=> NEW.`categoria`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."categoria"', OLD.`categoria`);
    SET v_despues = JSON_INSERT(v_despues, '$."categoria"', NEW.`categoria`);
  END IF;
  IF NOT (OLD.`tipo` <=> NEW.`tipo`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."tipo"', OLD.`tipo`);
    SET v_despues = JSON_INSERT(v_despues, '$."tipo"', NEW.`tipo`);
  END IF;
  IF NOT (OLD.`tiene_vencimiento` <=> NEW.`tiene_vencimiento`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."tiene_vencimiento"', OLD.`tiene_vencimiento`);
    SET v_despues = JSON_INSERT(v_despues, '$."tiene_vencimiento"', NEW.`tiene_vencimiento`);
  END IF;
  IF NOT (OLD.`activo` <=> NEW.`activo`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."activo"', OLD.`activo`);
    SET v_despues = JSON_INSERT(v_despues, '$."activo"', NEW.`activo`);
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'cat_cajas_requisitos', CONCAT_WS('-', NEW.`id_requisito`), 'U', v_antes, v_despues);
  END IF;
END
SQL,
    'bit_cat_cajas_requisitos_del' => <<<'SQL'
CREATE TRIGGER `bit_cat_cajas_requisitos_del` AFTER DELETE ON `cat_cajas_requisitos` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'cat_cajas_requisitos', CONCAT_WS('-', OLD.`id_requisito`), 'D', JSON_OBJECT('id_requisito', OLD.`id_requisito`, 'key_name', OLD.`key_name`, 'label', OLD.`label`, 'categoria', OLD.`categoria`, 'tipo', OLD.`tipo`, 'tiene_vencimiento', OLD.`tiene_vencimiento`, 'activo', OLD.`activo`), NULL);
END
SQL,
    'bit_cat_ima_requisitos_ins' => <<<'SQL'
CREATE TRIGGER `bit_cat_ima_requisitos_ins` AFTER INSERT ON `cat_ima_requisitos` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'cat_ima_requisitos', CONCAT_WS('-', NEW.`id_requisito`), 'I', NULL, JSON_OBJECT('id_requisito', NEW.`id_requisito`, 'key_name', NEW.`key_name`, 'label', NEW.`label`, 'region', NEW.`region`, 'tipo', NEW.`tipo`, 'tiene_vencimiento', NEW.`tiene_vencimiento`, 'activo', NEW.`activo`));
END
SQL,
    'bit_cat_ima_requisitos_upd' => <<<'SQL'
CREATE TRIGGER `bit_cat_ima_requisitos_upd` AFTER UPDATE ON `cat_ima_requisitos` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  IF NOT (OLD.`id_requisito` <=> NEW.`id_requisito`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."id_requisito"', OLD.`id_requisito`);
    SET v_despues = JSON_INSERT(v_despues, '$."id_requisito"', NEW.`id_requisito`);
  END IF;
  IF NOT (OLD.`key_name` <=> NEW.`key_name`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."key_name"', OLD.`key_name`);
    SET v_despues = JSON_INSERT(v_despues, '$."key_name"', NEW.`key_name`);
  END IF;
  IF NOT (OLD.`label` <=> NEW.`label`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."label"', OLD.`label`);
    SET v_despues = JSON_INSERT(v_despues, '$."label"', NEW.`label`);
  END IF;
  IF NOT (OLD.`region` <=> NEW.`region`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."region"', OLD.`region`);
    SET v_despues = JSON_INSERT(v_despues, '$."region"', NEW.`region`);
  END IF;
  IF NOT (OLD.`tipo` <=> NEW.`tipo`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."tipo"', OLD.`tipo`);
    SET v_despues = JSON_INSERT(v_despues, '$."tipo"', NEW.`tipo`);
  END IF;
  IF NOT (OLD.`tiene_vencimiento` <=> NEW.`tiene_vencimiento`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."tiene_vencimiento"', OLD.`tiene_vencimiento`);
    SET v_despues = JSON_INSERT(v_despues, '$."tiene_vencimiento"', NEW.`tiene_vencimiento`);
  END IF;
  IF NOT (OLD.`activo` <=> NEW.`activo`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."activo"', OLD.`activo`);
    SET v_despues = JSON_INSERT(v_despues, '$."activo"', NEW.`activo`);
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'cat_ima_requisitos', CONCAT_WS('-', NEW.`id_requisito`), 'U', v_antes, v_despues);
  END IF;
END
SQL,
    'bit_cat_ima_requisitos_del' => <<<'SQL'
CREATE TRIGGER `bit_cat_ima_requisitos_del` AFTER DELETE ON `cat_ima_requisitos` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'cat_ima_requisitos', CONCAT_WS('-', OLD.`id_requisito`), 'D', JSON_OBJECT('id_requisito', OLD.`id_requisito`, 'key_name', OLD.`key_name`, 'label', OLD.`label`, 'region', OLD.`region`, 'tipo', OLD.`tipo`, 'tiene_vencimiento', OLD.`tiene_vencimiento`, 'activo', OLD.`activo`), NULL);
END
SQL,
    'bit_features_ins' => <<<'SQL'
CREATE TRIGGER `bit_features_ins` AFTER INSERT ON `features` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'features', CONCAT_WS('-', NEW.`feature_id`), 'I', NULL, JSON_OBJECT('feature_id', NEW.`feature_id`, 'feature_key', NEW.`feature_key`, 'name', NEW.`name`, 'description', NEW.`description`, 'module', NEW.`module`, 'plataform', NEW.`plataform`, 'active', NEW.`active`));
END
SQL,
    'bit_features_upd' => <<<'SQL'
CREATE TRIGGER `bit_features_upd` AFTER UPDATE ON `features` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  IF NOT (OLD.`feature_id` <=> NEW.`feature_id`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."feature_id"', OLD.`feature_id`);
    SET v_despues = JSON_INSERT(v_despues, '$."feature_id"', NEW.`feature_id`);
  END IF;
  IF NOT (OLD.`feature_key` <=> NEW.`feature_key`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."feature_key"', OLD.`feature_key`);
    SET v_despues = JSON_INSERT(v_despues, '$."feature_key"', NEW.`feature_key`);
  END IF;
  IF NOT (OLD.`name` <=> NEW.`name`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."name"', OLD.`name`);
    SET v_despues = JSON_INSERT(v_despues, '$."name"', NEW.`name`);
  END IF;
  IF NOT (OLD.`description` <=> NEW.`description`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."description"', OLD.`description`);
    SET v_despues = JSON_INSERT(v_despues, '$."description"', NEW.`description`);
  END IF;
  IF NOT (OLD.`module` <=> NEW.`module`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."module"', OLD.`module`);
    SET v_despues = JSON_INSERT(v_despues, '$."module"', NEW.`module`);
  END IF;
  IF NOT (OLD.`plataform` <=> NEW.`plataform`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."plataform"', OLD.`plataform`);
    SET v_despues = JSON_INSERT(v_despues, '$."plataform"', NEW.`plataform`);
  END IF;
  IF NOT (OLD.`active` <=> NEW.`active`) THEN
    SET v_antes = JSON_INSERT(v_antes, '$."active"', OLD.`active`);
    SET v_despues = JSON_INSERT(v_despues, '$."active"', NEW.`active`);
  END IF;
  IF v_antes <> '{}' THEN
    INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'features', CONCAT_WS('-', NEW.`feature_id`), 'U', v_antes, v_despues);
  END IF;
END
SQL,
    'bit_features_del' => <<<'SQL'
CREATE TRIGGER `bit_features_del` AFTER DELETE ON `features` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'features', CONCAT_WS('-', OLD.`feature_id`), 'D', JSON_OBJECT('feature_id', OLD.`feature_id`, 'feature_key', OLD.`feature_key`, 'name', OLD.`name`, 'description', OLD.`description`, 'module', OLD.`module`, 'plataform', OLD.`plataform`, 'active', OLD.`active`), NULL);
END
SQL,
];

$TANDAS = [
    1 => ['gastos', 'detalles_gasto', 'diesel', 'trip_stages', 'trip_payments', 'user_feature_flags', 'users_credentials'],
    2 => ['trips', 'ordenes_servicio', 'orden_servicio_detalles', 'pago_trayectos_mx', 'notif_suscriptores'],
    3 => ['pagos_semanales', 'pagos_detalle', 'stage_stops', 'trip_stage_invoices', 'gastos_viaje', 'programacion_trips', 'trucks', 'caja', 'drivers', 'companies', 'warehouses'],
    4 => ['personal_admin', 'milla_driver', 'company_invoice_info', 'pago_trayecto_viaje', 'diesel_fuente_margen', 'cajas_externas', 'mtto_puntos', 'mtto_inspeccion_lado', 'mtto_concepto_detalle', 'mtto_notif_suscriptores', 'caja_estatus', 'roadside_repairs', 'inspections', 'servicios_orden', 'afinaciones_historial'],
    5 => ['truck_documents', 'drivers_documents', 'cajas_documents', 'ima_documents', 'safety_docs', 'documents', 'gastos_documentos', 'trip_document_relationship', 'roadside_repair_docs', 'inspection_docs', 'status_documents_drivers', 'status_documents_trucks', 'status_documents_trailers', 'status_documents_ima', 'articulos_inventario', 'movimientos_inventario', 'activos', 'teams', 'user_teams', 'tipos_gasto', 'tipos_reparacion', 'categorias_mantenimiento', 'subcategorias_mantenimiento', 'inspection_descriptions', 'origenes', 'cat_origenes', 'cat_trucks_requisitos', 'cat_drivers_requisitos', 'cat_cajas_requisitos', 'cat_ima_requisitos', 'features'],
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
