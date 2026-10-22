-- Reparaciones pendientes · el descarte que no descartaba
--
-- Descartar una pendiente levantada a mano mandaba `resolverPuntos`, que hace un
-- INSERT ... ON DUPLICATE KEY sobre (origen_tabla, origen_id). Las manuales llevan los
-- dos en NULL, así que nunca chocaba: se creaba una fila nueva «descartada» con
-- origen 'inspeccion' y sin renglón del checklist, y la pendiente seguía igual.
--
-- `mtto.php` ya descarta por id (`descartarPendientes`). Esto agrega la marca con la que
-- la pestaña de pendientes distingue lo que se descartó ahí de lo que se descartó desde
-- la inspección, y limpia las filas huérfanas que dejó el bug.
--
-- Mismo método que 004: una sentencia por envío en el phpMyAdmin, en este orden.
-- Subir el `mtto.php` nuevo DESPUÉS del paso 1: su consulta de pendientes ya pide la
-- columna.

-- 1. La marca ---------------------------------------------------------------------------
--
-- Solo la escribe `mtto.php`; ninguna pantalla vieja ni la app móvil tocan esta tabla.

ALTER TABLE `mtto_puntos`
  ADD COLUMN `descartado_en_pendientes` TINYINT(1) NOT NULL DEFAULT 0
  COMMENT '1 = se descartó desde la pestaña de pendientes'
  AFTER `estatus`;

-- 2. Ver las huérfanas antes de tocarlas ------------------------------------------------
--
-- Cada huérfana junto a la pendiente manual que quiso descartar (misma unidad y mismo
-- texto). Revisar que el emparejamiento tenga sentido antes de seguir.

SELECT h.id AS huerfana_id, m.id AS manual_id, h.unidad_tipo,
       COALESCE(h.truck_id, h.caja_id) AS unidad_id, h.descripcion, h.creado_en
  FROM mtto_puntos h
  LEFT JOIN mtto_puntos m
         ON m.origen = 'manual'
        AND m.estatus = 'en_pendientes'
        AND m.unidad_tipo = h.unidad_tipo
        AND m.descripcion = h.descripcion
        AND (m.truck_id <=> h.truck_id) AND (m.caja_id <=> h.caja_id)
 WHERE h.origen = 'inspeccion' AND h.origen_tabla IS NULL;

-- 3. Descartar de verdad las manuales que alguien ya había descartado --------------------

UPDATE mtto_puntos m
  JOIN mtto_puntos h
    ON h.origen = 'inspeccion' AND h.origen_tabla IS NULL
   AND h.estatus = 'descartado'
   AND h.unidad_tipo = m.unidad_tipo
   AND h.descripcion = m.descripcion
   AND (h.truck_id <=> m.truck_id) AND (h.caja_id <=> m.caja_id)
   SET m.estatus = 'descartado', m.descartado_en_pendientes = 1, m.actualizado_por = h.creado_por
 WHERE m.origen = 'manual' AND m.estatus = 'en_pendientes';

-- 4. Borrar las huérfanas ---------------------------------------------------------------
--
-- No están ligadas a nada: sin renglón del checklist, sin orden.

DELETE FROM mtto_puntos
 WHERE origen = 'inspeccion' AND origen_tabla IS NULL AND id_orden IS NULL;
