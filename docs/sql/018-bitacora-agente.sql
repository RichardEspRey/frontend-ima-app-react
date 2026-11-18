-- Bitácora · guardar cómo se identifica el cliente (User-Agent)
--
-- Para saber de dónde vienen las filas que salen sin app o como «Otro»: el lib
-- deduce la app por el User-Agent, pero no lo guardaba, y sin él no hay forma de
-- saber qué programa las manda. 2026-11-18.
--
-- Un solo envío. Solo agrega una columna al final; no toca datos. La tabla
-- bitacora no tiene triggers, así que no hay que quitar ni regenerar nada.
-- Se puede correr antes o después de subir el bitacora_lib.php nuevo: si la
-- columna todavía no existe, el lib guarda la fila sin ella.

ALTER TABLE `bitacora`
  ADD COLUMN `agente` VARCHAR(255) NULL COMMENT 'User-Agent del cliente, recortado' AFTER `ip`;

-- Comprobación: debe salir la columna `agente`.
-- SHOW COLUMNS FROM bitacora LIKE 'agente';
