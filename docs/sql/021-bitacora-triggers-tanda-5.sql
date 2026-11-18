-- Bitácora · triggers de «antes y después», tanda 5
--
-- NO CORRER EN phpMyAdmin. Creados ahí quedarían con el usuario temporal de cPanel y
-- fallarían con el error 1449, como crud_diesel. Se instalan con
-- docs/backend/bitacora_triggers.php, que usa la conexión de la app.
-- Este archivo es la copia para revisar; el PHP lleva exactamente las mismas sentencias.
--
-- Tablas: truck_documents, drivers_documents, cajas_documents, IMA_documents, safety_docs, documents, gastos_documentos, trip_document_relationship, roadside_repair_docs, inspection_docs, status_documents_Drivers, status_documents_Trucks, status_documents_Trailers, status_documents_IMA, articulos_inventario, movimientos_inventario, activos, teams, user_teams, tipos_gasto, tipos_reparacion, categorias_mantenimiento, subcategorias_mantenimiento, inspection_descriptions, origenes, cat_origenes, cat_trucks_requisitos, cat_drivers_requisitos, cat_cajas_requisitos, cat_ima_requisitos, features
-- Generado desde docs/sql/bitacora-esquema-2026-11-18.json con
-- docs/sql/generar-triggers-bitacora.py.
--
-- Qué hace cada uno: al dar de alta guarda el registro completo; al editar guarda solo
-- las columnas que cambiaron (y nada si no cambió ninguna); al borrar guarda el registro
-- completo. Columnas que nunca se guardan: ninguna.
-- Quién y en qué petición salen de @ima_usuario y @ima_peticion, que pone conexion.php
-- en cada conexión. Si algo falla dentro del trigger, el manejador lo traga y el guardado
-- sigue.
--
-- No modifican ninguna tabla ni agregan columnas. Antes de RENOMBRAR o BORRAR una
-- columna de estas tablas hay que quitar sus triggers (accion=quitar&tabla=…).

-- bit_truck_documents_ins
CREATE TRIGGER `bit_truck_documents_ins` AFTER INSERT ON `truck_documents` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'truck_documents', CONCAT_WS('-', NEW.`doc_id`), 'I', NULL, JSON_OBJECT('doc_id', NEW.`doc_id`, 'truck_id', NEW.`truck_id`, 'tipo_documento', NEW.`tipo_documento`, 'fecha_vencimiento', NEW.`fecha_vencimiento`, 'url_pdf', NEW.`url_pdf`, 'status', (NEW.`status` + 0), 'valor_texto', NEW.`valor_texto`));
END;

-- bit_truck_documents_upd
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
END;

-- bit_truck_documents_del
CREATE TRIGGER `bit_truck_documents_del` AFTER DELETE ON `truck_documents` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'truck_documents', CONCAT_WS('-', OLD.`doc_id`), 'D', JSON_OBJECT('doc_id', OLD.`doc_id`, 'truck_id', OLD.`truck_id`, 'tipo_documento', OLD.`tipo_documento`, 'fecha_vencimiento', OLD.`fecha_vencimiento`, 'url_pdf', OLD.`url_pdf`, 'status', (OLD.`status` + 0), 'valor_texto', OLD.`valor_texto`), NULL);
END;

-- bit_drivers_documents_ins
CREATE TRIGGER `bit_drivers_documents_ins` AFTER INSERT ON `drivers_documents` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'drivers_documents', CONCAT_WS('-', NEW.`doc_id`), 'I', NULL, JSON_OBJECT('doc_id', NEW.`doc_id`, 'driver_id', NEW.`driver_id`, 'tipo_documento', NEW.`tipo_documento`, 'fecha_vencimiento', NEW.`fecha_vencimiento`, 'url_pdf', NEW.`url_pdf`, 'status', (NEW.`status` + 0), 'valor_texto', NEW.`valor_texto`));
END;

-- bit_drivers_documents_upd
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
END;

-- bit_drivers_documents_del
CREATE TRIGGER `bit_drivers_documents_del` AFTER DELETE ON `drivers_documents` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'drivers_documents', CONCAT_WS('-', OLD.`doc_id`), 'D', JSON_OBJECT('doc_id', OLD.`doc_id`, 'driver_id', OLD.`driver_id`, 'tipo_documento', OLD.`tipo_documento`, 'fecha_vencimiento', OLD.`fecha_vencimiento`, 'url_pdf', OLD.`url_pdf`, 'status', (OLD.`status` + 0), 'valor_texto', OLD.`valor_texto`), NULL);
END;

-- bit_cajas_documents_ins
CREATE TRIGGER `bit_cajas_documents_ins` AFTER INSERT ON `cajas_documents` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'cajas_documents', CONCAT_WS('-', NEW.`doc_id`), 'I', NULL, JSON_OBJECT('doc_id', NEW.`doc_id`, 'caja_id', NEW.`caja_id`, 'tipo_documento', NEW.`tipo_documento`, 'fecha_vencimiento', NEW.`fecha_vencimiento`, 'url_pdf', NEW.`url_pdf`, 'status', (NEW.`status` + 0), 'valor_texto', NEW.`valor_texto`));
END;

-- bit_cajas_documents_upd
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
END;

-- bit_cajas_documents_del
CREATE TRIGGER `bit_cajas_documents_del` AFTER DELETE ON `cajas_documents` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'cajas_documents', CONCAT_WS('-', OLD.`doc_id`), 'D', JSON_OBJECT('doc_id', OLD.`doc_id`, 'caja_id', OLD.`caja_id`, 'tipo_documento', OLD.`tipo_documento`, 'fecha_vencimiento', OLD.`fecha_vencimiento`, 'url_pdf', OLD.`url_pdf`, 'status', (OLD.`status` + 0), 'valor_texto', OLD.`valor_texto`), NULL);
END;

-- bit_ima_documents_ins
CREATE TRIGGER `bit_ima_documents_ins` AFTER INSERT ON `IMA_documents` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'IMA_documents', CONCAT_WS('-', NEW.`doc_id`), 'I', NULL, JSON_OBJECT('doc_id', NEW.`doc_id`, 'tipo_documento', NEW.`tipo_documento`, 'fecha_vencimiento', NEW.`fecha_vencimiento`, 'url_pdf', NEW.`url_pdf`, 'status', (NEW.`status` + 0), 'valor_texto', NEW.`valor_texto`));
END;

-- bit_ima_documents_upd
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
END;

-- bit_ima_documents_del
CREATE TRIGGER `bit_ima_documents_del` AFTER DELETE ON `IMA_documents` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'IMA_documents', CONCAT_WS('-', OLD.`doc_id`), 'D', JSON_OBJECT('doc_id', OLD.`doc_id`, 'tipo_documento', OLD.`tipo_documento`, 'fecha_vencimiento', OLD.`fecha_vencimiento`, 'url_pdf', OLD.`url_pdf`, 'status', (OLD.`status` + 0), 'valor_texto', OLD.`valor_texto`), NULL);
END;

-- bit_safety_docs_ins
CREATE TRIGGER `bit_safety_docs_ins` AFTER INSERT ON `safety_docs` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'safety_docs', CONCAT_WS('-', NEW.`trip_id`), 'I', NULL, JSON_OBJECT('trip_id', NEW.`trip_id`, 'libro_electronico', NEW.`libro_electronico`, 'reporte_diesel', NEW.`reporte_diesel`, 'reporte_pcmiller', NEW.`reporte_pcmiller`, 'updated_at', NEW.`updated_at`));
END;

-- bit_safety_docs_upd
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
END;

-- bit_safety_docs_del
CREATE TRIGGER `bit_safety_docs_del` AFTER DELETE ON `safety_docs` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'safety_docs', CONCAT_WS('-', OLD.`trip_id`), 'D', JSON_OBJECT('trip_id', OLD.`trip_id`, 'libro_electronico', OLD.`libro_electronico`, 'reporte_diesel', OLD.`reporte_diesel`, 'reporte_pcmiller', OLD.`reporte_pcmiller`, 'updated_at', OLD.`updated_at`), NULL);
END;

-- bit_documents_ins
CREATE TRIGGER `bit_documents_ins` AFTER INSERT ON `documents` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'documents', CONCAT_WS('-', NEW.`document_id`), 'I', NULL, JSON_OBJECT('document_id', NEW.`document_id`, 'tipo_documento', NEW.`tipo_documento`, 'nombre_archivo', NEW.`nombre_archivo`, 'path_servidor_real', NEW.`path_servidor_real`, 'fecha_vencimiento', NEW.`fecha_vencimiento`, 'uploaded_at', NEW.`uploaded_at`));
END;

-- bit_documents_upd
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
END;

-- bit_documents_del
CREATE TRIGGER `bit_documents_del` AFTER DELETE ON `documents` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'documents', CONCAT_WS('-', OLD.`document_id`), 'D', JSON_OBJECT('document_id', OLD.`document_id`, 'tipo_documento', OLD.`tipo_documento`, 'nombre_archivo', OLD.`nombre_archivo`, 'path_servidor_real', OLD.`path_servidor_real`, 'fecha_vencimiento', OLD.`fecha_vencimiento`, 'uploaded_at', OLD.`uploaded_at`), NULL);
END;

-- bit_gastos_documentos_ins
CREATE TRIGGER `bit_gastos_documentos_ins` AFTER INSERT ON `gastos_documentos` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'gastos_documentos', CONCAT_WS('-', NEW.`id_documento`), 'I', NULL, JSON_OBJECT('id_documento', NEW.`id_documento`, 'id_gasto', NEW.`id_gasto`, 'tipo_documento', NEW.`tipo_documento`, 'nombre_original', NEW.`nombre_original`, 'ruta_archivo', NEW.`ruta_archivo`, 'fecha_carga', NEW.`fecha_carga`));
END;

-- bit_gastos_documentos_upd
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
END;

-- bit_gastos_documentos_del
CREATE TRIGGER `bit_gastos_documentos_del` AFTER DELETE ON `gastos_documentos` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'gastos_documentos', CONCAT_WS('-', OLD.`id_documento`), 'D', JSON_OBJECT('id_documento', OLD.`id_documento`, 'id_gasto', OLD.`id_gasto`, 'tipo_documento', OLD.`tipo_documento`, 'nombre_original', OLD.`nombre_original`, 'ruta_archivo', OLD.`ruta_archivo`, 'fecha_carga', OLD.`fecha_carga`), NULL);
END;

-- bit_trip_document_relationship_ins
CREATE TRIGGER `bit_trip_document_relationship_ins` AFTER INSERT ON `trip_document_relationship` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'trip_document_relationship', CONCAT_WS('-', NEW.`trip_stage_id`, NEW.`document_id`), 'I', NULL, JSON_OBJECT('trip_stage_id', NEW.`trip_stage_id`, 'document_id', NEW.`document_id`, 'is_active', NEW.`is_active`));
END;

-- bit_trip_document_relationship_upd
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
END;

-- bit_trip_document_relationship_del
CREATE TRIGGER `bit_trip_document_relationship_del` AFTER DELETE ON `trip_document_relationship` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'trip_document_relationship', CONCAT_WS('-', OLD.`trip_stage_id`, OLD.`document_id`), 'D', JSON_OBJECT('trip_stage_id', OLD.`trip_stage_id`, 'document_id', OLD.`document_id`, 'is_active', OLD.`is_active`), NULL);
END;

-- bit_roadside_repair_docs_ins
CREATE TRIGGER `bit_roadside_repair_docs_ins` AFTER INSERT ON `roadside_repair_docs` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'roadside_repair_docs', CONCAT_WS('-', NEW.`id_doc`), 'I', NULL, JSON_OBJECT('id_doc', NEW.`id_doc`, 'id_reparacion', NEW.`id_reparacion`, 'file_name', NEW.`file_name`, 'file_path', NEW.`file_path`));
END;

-- bit_roadside_repair_docs_upd
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
END;

-- bit_roadside_repair_docs_del
CREATE TRIGGER `bit_roadside_repair_docs_del` AFTER DELETE ON `roadside_repair_docs` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'roadside_repair_docs', CONCAT_WS('-', OLD.`id_doc`), 'D', JSON_OBJECT('id_doc', OLD.`id_doc`, 'id_reparacion', OLD.`id_reparacion`, 'file_name', OLD.`file_name`, 'file_path', OLD.`file_path`), NULL);
END;

-- bit_inspection_docs_ins
CREATE TRIGGER `bit_inspection_docs_ins` AFTER INSERT ON `inspection_docs` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'inspection_docs', CONCAT_WS('-', NEW.`id_doc`), 'I', NULL, JSON_OBJECT('id_doc', NEW.`id_doc`, 'id_inspeccion', NEW.`id_inspeccion`, 'file_name', NEW.`file_name`, 'file_path', NEW.`file_path`, 'uploaded_at', NEW.`uploaded_at`));
END;

-- bit_inspection_docs_upd
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
END;

-- bit_inspection_docs_del
CREATE TRIGGER `bit_inspection_docs_del` AFTER DELETE ON `inspection_docs` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'inspection_docs', CONCAT_WS('-', OLD.`id_doc`), 'D', JSON_OBJECT('id_doc', OLD.`id_doc`, 'id_inspeccion', OLD.`id_inspeccion`, 'file_name', OLD.`file_name`, 'file_path', OLD.`file_path`, 'uploaded_at', OLD.`uploaded_at`), NULL);
END;

-- bit_status_documents_drivers_ins
CREATE TRIGGER `bit_status_documents_drivers_ins` AFTER INSERT ON `status_documents_Drivers` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'status_documents_Drivers', CONCAT_WS('-', NEW.`id`), 'I', NULL, JSON_OBJECT('id', NEW.`id`, 'driver_id', NEW.`driver_id`, 'INE', (NEW.`INE` + 0), 'Acta_Nacimiento', (NEW.`Acta_Nacimiento` + 0), 'CURP', (NEW.`CURP` + 0), 'Comprobante_domicilio', (NEW.`Comprobante_domicilio` + 0), 'Constancia', (NEW.`Constancia` + 0), 'Visa', (NEW.`Visa` + 0), 'I94', (NEW.`I94` + 0), 'Solicitud_empleo', (NEW.`Solicitud_empleo` + 0), 'Licencia', (NEW.`Licencia` + 0), 'APTO', (NEW.`APTO` + 0), 'Antidoping', (NEW.`Antidoping` + 0)));
END;

-- bit_status_documents_drivers_upd
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
END;

-- bit_status_documents_drivers_del
CREATE TRIGGER `bit_status_documents_drivers_del` AFTER DELETE ON `status_documents_Drivers` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'status_documents_Drivers', CONCAT_WS('-', OLD.`id`), 'D', JSON_OBJECT('id', OLD.`id`, 'driver_id', OLD.`driver_id`, 'INE', (OLD.`INE` + 0), 'Acta_Nacimiento', (OLD.`Acta_Nacimiento` + 0), 'CURP', (OLD.`CURP` + 0), 'Comprobante_domicilio', (OLD.`Comprobante_domicilio` + 0), 'Constancia', (OLD.`Constancia` + 0), 'Visa', (OLD.`Visa` + 0), 'I94', (OLD.`I94` + 0), 'Solicitud_empleo', (OLD.`Solicitud_empleo` + 0), 'Licencia', (OLD.`Licencia` + 0), 'APTO', (OLD.`APTO` + 0), 'Antidoping', (OLD.`Antidoping` + 0)), NULL);
END;

-- bit_status_documents_trucks_ins
CREATE TRIGGER `bit_status_documents_trucks_ins` AFTER INSERT ON `status_documents_Trucks` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'status_documents_Trucks', CONCAT_WS('-', NEW.`id`), 'I', NULL, JSON_OBJECT('id', NEW.`id`, 'truck_id', NEW.`truck_id`, 'registracion', (NEW.`registracion` + 0), 'cab', (NEW.`cab` + 0), 'coi', (NEW.`coi` + 0), 'inspeccion_mecanica', (NEW.`inspeccion_mecanica` + 0), 'tx_dmv', (NEW.`tx_dmv` + 0), 'permiso_ny', (NEW.`permiso_ny` + 0), 'permiso_nm', (NEW.`permiso_nm` + 0), 'dtops', (NEW.`dtops` + 0), 'tarjeta_circulacion', (NEW.`tarjeta_circulacion` + 0), 'inspeccion_fisio_mecanica', (NEW.`inspeccion_fisio_mecanica` + 0), 'inspeccion_humos', (NEW.`inspeccion_humos` + 0), 'puente_fideicomiso', (NEW.`puente_fideicomiso` + 0), 'seguro', (NEW.`seguro` + 0)));
END;

-- bit_status_documents_trucks_upd
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
END;

-- bit_status_documents_trucks_del
CREATE TRIGGER `bit_status_documents_trucks_del` AFTER DELETE ON `status_documents_Trucks` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'status_documents_Trucks', CONCAT_WS('-', OLD.`id`), 'D', JSON_OBJECT('id', OLD.`id`, 'truck_id', OLD.`truck_id`, 'registracion', (OLD.`registracion` + 0), 'cab', (OLD.`cab` + 0), 'coi', (OLD.`coi` + 0), 'inspeccion_mecanica', (OLD.`inspeccion_mecanica` + 0), 'tx_dmv', (OLD.`tx_dmv` + 0), 'permiso_ny', (OLD.`permiso_ny` + 0), 'permiso_nm', (OLD.`permiso_nm` + 0), 'dtops', (OLD.`dtops` + 0), 'tarjeta_circulacion', (OLD.`tarjeta_circulacion` + 0), 'inspeccion_fisio_mecanica', (OLD.`inspeccion_fisio_mecanica` + 0), 'inspeccion_humos', (OLD.`inspeccion_humos` + 0), 'puente_fideicomiso', (OLD.`puente_fideicomiso` + 0), 'seguro', (OLD.`seguro` + 0)), NULL);
END;

-- bit_status_documents_trailers_ins
CREATE TRIGGER `bit_status_documents_trailers_ins` AFTER INSERT ON `status_documents_Trailers` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'status_documents_Trailers', CONCAT_WS('-', NEW.`id`), 'I', NULL, JSON_OBJECT('id', NEW.`id`, 'caja_id', NEW.`caja_id`, 'Registracion', (NEW.`Registracion` + 0), 'Seguro', (NEW.`Seguro` + 0), 'CAB_CARD', (NEW.`CAB_CARD` + 0), 'Fianza', (NEW.`Fianza` + 0), 'Certificado', (NEW.`Certificado` + 0)));
END;

-- bit_status_documents_trailers_upd
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
END;

-- bit_status_documents_trailers_del
CREATE TRIGGER `bit_status_documents_trailers_del` AFTER DELETE ON `status_documents_Trailers` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'status_documents_Trailers', CONCAT_WS('-', OLD.`id`), 'D', JSON_OBJECT('id', OLD.`id`, 'caja_id', OLD.`caja_id`, 'Registracion', (OLD.`Registracion` + 0), 'Seguro', (OLD.`Seguro` + 0), 'CAB_CARD', (OLD.`CAB_CARD` + 0), 'Fianza', (OLD.`Fianza` + 0), 'Certificado', (OLD.`Certificado` + 0)), NULL);
END;

-- bit_status_documents_ima_ins
CREATE TRIGGER `bit_status_documents_ima_ins` AFTER INSERT ON `status_documents_IMA` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'status_documents_IMA', CONCAT_WS('-', NEW.`id`), 'I', NULL, JSON_OBJECT('id', NEW.`id`, 'MC', (NEW.`MC` + 0), 'W9', (NEW.`W9` + 0), 'IFTA', (NEW.`IFTA` + 0), 'd2290', (NEW.`d2290` + 0), 'Permiso_KYU', (NEW.`Permiso_KYU` + 0), 'UCR', (NEW.`UCR` + 0), 'SCAC', (NEW.`SCAC` + 0), 'CAAT', (NEW.`CAAT` + 0)));
END;

-- bit_status_documents_ima_upd
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
END;

-- bit_status_documents_ima_del
CREATE TRIGGER `bit_status_documents_ima_del` AFTER DELETE ON `status_documents_IMA` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'status_documents_IMA', CONCAT_WS('-', OLD.`id`), 'D', JSON_OBJECT('id', OLD.`id`, 'MC', (OLD.`MC` + 0), 'W9', (OLD.`W9` + 0), 'IFTA', (OLD.`IFTA` + 0), 'd2290', (OLD.`d2290` + 0), 'Permiso_KYU', (OLD.`Permiso_KYU` + 0), 'UCR', (OLD.`UCR` + 0), 'SCAC', (OLD.`SCAC` + 0), 'CAAT', (OLD.`CAAT` + 0)), NULL);
END;

-- bit_articulos_inventario_ins
CREATE TRIGGER `bit_articulos_inventario_ins` AFTER INSERT ON `articulos_inventario` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'articulos_inventario', CONCAT_WS('-', NEW.`id_articulo`), 'I', NULL, JSON_OBJECT('id_articulo', NEW.`id_articulo`, 'id_subcategoria', NEW.`id_subcategoria`, 'nombre_articulo', NEW.`nombre_articulo`, 'descripcion', NEW.`descripcion`, 'sku', NEW.`sku`, 'cantidad_stock', NEW.`cantidad_stock`, 'unidad_medida', NEW.`unidad_medida`, 'costo_unidad', NEW.`costo_unidad`, 'ubicacion_almacen', NEW.`ubicacion_almacen`, 'punto_reorden', NEW.`punto_reorden`));
END;

-- bit_articulos_inventario_upd
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
END;

-- bit_articulos_inventario_del
CREATE TRIGGER `bit_articulos_inventario_del` AFTER DELETE ON `articulos_inventario` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'articulos_inventario', CONCAT_WS('-', OLD.`id_articulo`), 'D', JSON_OBJECT('id_articulo', OLD.`id_articulo`, 'id_subcategoria', OLD.`id_subcategoria`, 'nombre_articulo', OLD.`nombre_articulo`, 'descripcion', OLD.`descripcion`, 'sku', OLD.`sku`, 'cantidad_stock', OLD.`cantidad_stock`, 'unidad_medida', OLD.`unidad_medida`, 'costo_unidad', OLD.`costo_unidad`, 'ubicacion_almacen', OLD.`ubicacion_almacen`, 'punto_reorden', OLD.`punto_reorden`), NULL);
END;

-- bit_movimientos_inventario_ins
CREATE TRIGGER `bit_movimientos_inventario_ins` AFTER INSERT ON `movimientos_inventario` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'movimientos_inventario', CONCAT_WS('-', NEW.`id_movimiento`), 'I', NULL, JSON_OBJECT('id_movimiento', NEW.`id_movimiento`, 'id_articulo', NEW.`id_articulo`, 'tipo_movimiento', NEW.`tipo_movimiento`, 'cantidad', NEW.`cantidad`, 'fecha_movimiento', NEW.`fecha_movimiento`, 'id_detalle_gasto', NEW.`id_detalle_gasto`, 'referencia', NEW.`referencia`));
END;

-- bit_movimientos_inventario_upd
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
END;

-- bit_movimientos_inventario_del
CREATE TRIGGER `bit_movimientos_inventario_del` AFTER DELETE ON `movimientos_inventario` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'movimientos_inventario', CONCAT_WS('-', OLD.`id_movimiento`), 'D', JSON_OBJECT('id_movimiento', OLD.`id_movimiento`, 'id_articulo', OLD.`id_articulo`, 'tipo_movimiento', OLD.`tipo_movimiento`, 'cantidad', OLD.`cantidad`, 'fecha_movimiento', OLD.`fecha_movimiento`, 'id_detalle_gasto', OLD.`id_detalle_gasto`, 'referencia', OLD.`referencia`), NULL);
END;

-- bit_activos_ins
CREATE TRIGGER `bit_activos_ins` AFTER INSERT ON `activos` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'activos', CONCAT_WS('-', NEW.`id_activo`), 'I', NULL, JSON_OBJECT('id_activo', NEW.`id_activo`, 'nombre_activo', NEW.`nombre_activo`, 'numero_serie', NEW.`numero_serie`, 'tipo_activo', NEW.`tipo_activo`, 'fecha_adquisicion', NEW.`fecha_adquisicion`));
END;

-- bit_activos_upd
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
END;

-- bit_activos_del
CREATE TRIGGER `bit_activos_del` AFTER DELETE ON `activos` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'activos', CONCAT_WS('-', OLD.`id_activo`), 'D', JSON_OBJECT('id_activo', OLD.`id_activo`, 'nombre_activo', OLD.`nombre_activo`, 'numero_serie', OLD.`numero_serie`, 'tipo_activo', OLD.`tipo_activo`, 'fecha_adquisicion', OLD.`fecha_adquisicion`), NULL);
END;

-- bit_teams_ins
CREATE TRIGGER `bit_teams_ins` AFTER INSERT ON `teams` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'teams', CONCAT_WS('-', NEW.`team_id`), 'I', NULL, JSON_OBJECT('team_id', NEW.`team_id`, 'name', NEW.`name`, 'description', NEW.`description`, 'active', NEW.`active`, 'created_at', NEW.`created_at`));
END;

-- bit_teams_upd
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
END;

-- bit_teams_del
CREATE TRIGGER `bit_teams_del` AFTER DELETE ON `teams` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'teams', CONCAT_WS('-', OLD.`team_id`), 'D', JSON_OBJECT('team_id', OLD.`team_id`, 'name', OLD.`name`, 'description', OLD.`description`, 'active', OLD.`active`, 'created_at', OLD.`created_at`), NULL);
END;

-- bit_user_teams_ins
CREATE TRIGGER `bit_user_teams_ins` AFTER INSERT ON `user_teams` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'user_teams', CONCAT_WS('-', NEW.`user_id`, NEW.`team_id`), 'I', NULL, JSON_OBJECT('user_id', NEW.`user_id`, 'team_id', NEW.`team_id`));
END;

-- bit_user_teams_upd
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
END;

-- bit_user_teams_del
CREATE TRIGGER `bit_user_teams_del` AFTER DELETE ON `user_teams` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'user_teams', CONCAT_WS('-', OLD.`user_id`, OLD.`team_id`), 'D', JSON_OBJECT('user_id', OLD.`user_id`, 'team_id', OLD.`team_id`), NULL);
END;

-- bit_tipos_gasto_ins
CREATE TRIGGER `bit_tipos_gasto_ins` AFTER INSERT ON `tipos_gasto` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'tipos_gasto', CONCAT_WS('-', NEW.`id_tipo_gasto`), 'I', NULL, JSON_OBJECT('id_tipo_gasto', NEW.`id_tipo_gasto`, 'nombre_tipo_gasto', NEW.`nombre_tipo_gasto`, 'activo', NEW.`activo`));
END;

-- bit_tipos_gasto_upd
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
END;

-- bit_tipos_gasto_del
CREATE TRIGGER `bit_tipos_gasto_del` AFTER DELETE ON `tipos_gasto` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'tipos_gasto', CONCAT_WS('-', OLD.`id_tipo_gasto`), 'D', JSON_OBJECT('id_tipo_gasto', OLD.`id_tipo_gasto`, 'nombre_tipo_gasto', OLD.`nombre_tipo_gasto`, 'activo', OLD.`activo`), NULL);
END;

-- bit_tipos_reparacion_ins
CREATE TRIGGER `bit_tipos_reparacion_ins` AFTER INSERT ON `tipos_reparacion` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'tipos_reparacion', CONCAT_WS('-', NEW.`id_tipo_reparacion`), 'I', NULL, JSON_OBJECT('id_tipo_reparacion', NEW.`id_tipo_reparacion`, 'nombre_reparacion', NEW.`nombre_reparacion`));
END;

-- bit_tipos_reparacion_upd
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
END;

-- bit_tipos_reparacion_del
CREATE TRIGGER `bit_tipos_reparacion_del` AFTER DELETE ON `tipos_reparacion` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'tipos_reparacion', CONCAT_WS('-', OLD.`id_tipo_reparacion`), 'D', JSON_OBJECT('id_tipo_reparacion', OLD.`id_tipo_reparacion`, 'nombre_reparacion', OLD.`nombre_reparacion`), NULL);
END;

-- bit_categorias_mantenimiento_ins
CREATE TRIGGER `bit_categorias_mantenimiento_ins` AFTER INSERT ON `categorias_mantenimiento` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'categorias_mantenimiento', CONCAT_WS('-', NEW.`id_categoria`), 'I', NULL, JSON_OBJECT('id_categoria', NEW.`id_categoria`, 'nombre_categoria', NEW.`nombre_categoria`, 'id_tipo_gasto', NEW.`id_tipo_gasto`));
END;

-- bit_categorias_mantenimiento_upd
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
END;

-- bit_categorias_mantenimiento_del
CREATE TRIGGER `bit_categorias_mantenimiento_del` AFTER DELETE ON `categorias_mantenimiento` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'categorias_mantenimiento', CONCAT_WS('-', OLD.`id_categoria`), 'D', JSON_OBJECT('id_categoria', OLD.`id_categoria`, 'nombre_categoria', OLD.`nombre_categoria`, 'id_tipo_gasto', OLD.`id_tipo_gasto`), NULL);
END;

-- bit_subcategorias_mantenimiento_ins
CREATE TRIGGER `bit_subcategorias_mantenimiento_ins` AFTER INSERT ON `subcategorias_mantenimiento` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'subcategorias_mantenimiento', CONCAT_WS('-', NEW.`id_subcategoria`), 'I', NULL, JSON_OBJECT('id_subcategoria', NEW.`id_subcategoria`, 'id_categoria', NEW.`id_categoria`, 'nombre_subcategoria', NEW.`nombre_subcategoria`));
END;

-- bit_subcategorias_mantenimiento_upd
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
END;

-- bit_subcategorias_mantenimiento_del
CREATE TRIGGER `bit_subcategorias_mantenimiento_del` AFTER DELETE ON `subcategorias_mantenimiento` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'subcategorias_mantenimiento', CONCAT_WS('-', OLD.`id_subcategoria`), 'D', JSON_OBJECT('id_subcategoria', OLD.`id_subcategoria`, 'id_categoria', OLD.`id_categoria`, 'nombre_subcategoria', OLD.`nombre_subcategoria`), NULL);
END;

-- bit_inspection_descriptions_ins
CREATE TRIGGER `bit_inspection_descriptions_ins` AFTER INSERT ON `inspection_descriptions` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'inspection_descriptions', CONCAT_WS('-', NEW.`id_descripcion`), 'I', NULL, JSON_OBJECT('id_descripcion', NEW.`id_descripcion`, 'descripcion', NEW.`descripcion`));
END;

-- bit_inspection_descriptions_upd
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
END;

-- bit_inspection_descriptions_del
CREATE TRIGGER `bit_inspection_descriptions_del` AFTER DELETE ON `inspection_descriptions` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'inspection_descriptions', CONCAT_WS('-', OLD.`id_descripcion`), 'D', JSON_OBJECT('id_descripcion', OLD.`id_descripcion`, 'descripcion', OLD.`descripcion`), NULL);
END;

-- bit_origenes_ins
CREATE TRIGGER `bit_origenes_ins` AFTER INSERT ON `origenes` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'origenes', CONCAT_WS('-', NEW.`id`), 'I', NULL, JSON_OBJECT('id', NEW.`id`, 'nombre', NEW.`nombre`));
END;

-- bit_origenes_upd
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
END;

-- bit_origenes_del
CREATE TRIGGER `bit_origenes_del` AFTER DELETE ON `origenes` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'origenes', CONCAT_WS('-', OLD.`id`), 'D', JSON_OBJECT('id', OLD.`id`, 'nombre', OLD.`nombre`), NULL);
END;

-- bit_cat_origenes_ins
CREATE TRIGGER `bit_cat_origenes_ins` AFTER INSERT ON `cat_origenes` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'cat_origenes', CONCAT_WS('-', NEW.`id`), 'I', NULL, JSON_OBJECT('id', NEW.`id`, 'nombre', NEW.`nombre`, 'zip_code', NEW.`zip_code`, 'estatus', NEW.`estatus`, 'fecha_creacion', NEW.`fecha_creacion`));
END;

-- bit_cat_origenes_upd
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
END;

-- bit_cat_origenes_del
CREATE TRIGGER `bit_cat_origenes_del` AFTER DELETE ON `cat_origenes` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'cat_origenes', CONCAT_WS('-', OLD.`id`), 'D', JSON_OBJECT('id', OLD.`id`, 'nombre', OLD.`nombre`, 'zip_code', OLD.`zip_code`, 'estatus', OLD.`estatus`, 'fecha_creacion', OLD.`fecha_creacion`), NULL);
END;

-- bit_cat_trucks_requisitos_ins
CREATE TRIGGER `bit_cat_trucks_requisitos_ins` AFTER INSERT ON `cat_trucks_requisitos` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'cat_trucks_requisitos', CONCAT_WS('-', NEW.`id_requisito`), 'I', NULL, JSON_OBJECT('id_requisito', NEW.`id_requisito`, 'key_name', NEW.`key_name`, 'label', NEW.`label`, 'categoria', NEW.`categoria`, 'tipo', NEW.`tipo`, 'tiene_vencimiento', NEW.`tiene_vencimiento`, 'activo', NEW.`activo`, 'oculto_en_tabla', NEW.`oculto_en_tabla`));
END;

-- bit_cat_trucks_requisitos_upd
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
END;

-- bit_cat_trucks_requisitos_del
CREATE TRIGGER `bit_cat_trucks_requisitos_del` AFTER DELETE ON `cat_trucks_requisitos` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'cat_trucks_requisitos', CONCAT_WS('-', OLD.`id_requisito`), 'D', JSON_OBJECT('id_requisito', OLD.`id_requisito`, 'key_name', OLD.`key_name`, 'label', OLD.`label`, 'categoria', OLD.`categoria`, 'tipo', OLD.`tipo`, 'tiene_vencimiento', OLD.`tiene_vencimiento`, 'activo', OLD.`activo`, 'oculto_en_tabla', OLD.`oculto_en_tabla`), NULL);
END;

-- bit_cat_drivers_requisitos_ins
CREATE TRIGGER `bit_cat_drivers_requisitos_ins` AFTER INSERT ON `cat_drivers_requisitos` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'cat_drivers_requisitos', CONCAT_WS('-', NEW.`id_requisito`), 'I', NULL, JSON_OBJECT('id_requisito', NEW.`id_requisito`, 'key_name', NEW.`key_name`, 'label', NEW.`label`, 'categoria', NEW.`categoria`, 'tipo', NEW.`tipo`, 'tiene_vencimiento', NEW.`tiene_vencimiento`, 'activo', NEW.`activo`, 'oculto_en_tabla', NEW.`oculto_en_tabla`));
END;

-- bit_cat_drivers_requisitos_upd
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
END;

-- bit_cat_drivers_requisitos_del
CREATE TRIGGER `bit_cat_drivers_requisitos_del` AFTER DELETE ON `cat_drivers_requisitos` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'cat_drivers_requisitos', CONCAT_WS('-', OLD.`id_requisito`), 'D', JSON_OBJECT('id_requisito', OLD.`id_requisito`, 'key_name', OLD.`key_name`, 'label', OLD.`label`, 'categoria', OLD.`categoria`, 'tipo', OLD.`tipo`, 'tiene_vencimiento', OLD.`tiene_vencimiento`, 'activo', OLD.`activo`, 'oculto_en_tabla', OLD.`oculto_en_tabla`), NULL);
END;

-- bit_cat_cajas_requisitos_ins
CREATE TRIGGER `bit_cat_cajas_requisitos_ins` AFTER INSERT ON `cat_cajas_requisitos` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'cat_cajas_requisitos', CONCAT_WS('-', NEW.`id_requisito`), 'I', NULL, JSON_OBJECT('id_requisito', NEW.`id_requisito`, 'key_name', NEW.`key_name`, 'label', NEW.`label`, 'categoria', NEW.`categoria`, 'tipo', NEW.`tipo`, 'tiene_vencimiento', NEW.`tiene_vencimiento`, 'activo', NEW.`activo`));
END;

-- bit_cat_cajas_requisitos_upd
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
END;

-- bit_cat_cajas_requisitos_del
CREATE TRIGGER `bit_cat_cajas_requisitos_del` AFTER DELETE ON `cat_cajas_requisitos` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'cat_cajas_requisitos', CONCAT_WS('-', OLD.`id_requisito`), 'D', JSON_OBJECT('id_requisito', OLD.`id_requisito`, 'key_name', OLD.`key_name`, 'label', OLD.`label`, 'categoria', OLD.`categoria`, 'tipo', OLD.`tipo`, 'tiene_vencimiento', OLD.`tiene_vencimiento`, 'activo', OLD.`activo`), NULL);
END;

-- bit_cat_ima_requisitos_ins
CREATE TRIGGER `bit_cat_ima_requisitos_ins` AFTER INSERT ON `cat_ima_requisitos` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'cat_ima_requisitos', CONCAT_WS('-', NEW.`id_requisito`), 'I', NULL, JSON_OBJECT('id_requisito', NEW.`id_requisito`, 'key_name', NEW.`key_name`, 'label', NEW.`label`, 'region', NEW.`region`, 'tipo', NEW.`tipo`, 'tiene_vencimiento', NEW.`tiene_vencimiento`, 'activo', NEW.`activo`));
END;

-- bit_cat_ima_requisitos_upd
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
END;

-- bit_cat_ima_requisitos_del
CREATE TRIGGER `bit_cat_ima_requisitos_del` AFTER DELETE ON `cat_ima_requisitos` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'cat_ima_requisitos', CONCAT_WS('-', OLD.`id_requisito`), 'D', JSON_OBJECT('id_requisito', OLD.`id_requisito`, 'key_name', OLD.`key_name`, 'label', OLD.`label`, 'region', OLD.`region`, 'tipo', OLD.`tipo`, 'tiene_vencimiento', OLD.`tiene_vencimiento`, 'activo', OLD.`activo`), NULL);
END;

-- bit_features_ins
CREATE TRIGGER `bit_features_ins` AFTER INSERT ON `features` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'features', CONCAT_WS('-', NEW.`feature_id`), 'I', NULL, JSON_OBJECT('feature_id', NEW.`feature_id`, 'feature_key', NEW.`feature_key`, 'name', NEW.`name`, 'description', NEW.`description`, 'module', NEW.`module`, 'plataform', NEW.`plataform`, 'active', NEW.`active`));
END;

-- bit_features_upd
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
END;

-- bit_features_del
CREATE TRIGGER `bit_features_del` AFTER DELETE ON `features` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, 'features', CONCAT_WS('-', OLD.`feature_id`), 'D', JSON_OBJECT('feature_id', OLD.`feature_id`, 'feature_key', OLD.`feature_key`, 'name', OLD.`name`, 'description', OLD.`description`, 'module', OLD.`module`, 'plataform', OLD.`plataform`, 'active', OLD.`active`), NULL);
END;

