-- Campana · quién recibe cada aviso calculado en el front
--
-- Una fila por persona y por aviso. Se administra desde Notificaciones manager,
-- una tarjeta por aviso. Los BL siguen en su tabla de `Notifications.php` y las
-- inspecciones con falla en `mtto_notif_suscriptores`; aquí van los siete nuevos:
--
--   diesel_state      · State pending, diario a las 10:00
--   diesel_fleetone   · Fleet One pending, diario a las 10:00
--   sin_fallas        · inspección que llega sin fallas
--   sin_inspeccion    · operador con más de un viaje sin inspección
--   viaje_programado  · viaje agregado a Programación
--   viaje_despacho    · viaje que entra a Despacho
--   viaje_documentos  · documentos agregados a un viaje en Despacho
--
-- Son DOS envíos. Mandar cada uno por separado en phpMyAdmin y revisar el
-- resultado antes del siguiente. Ninguno borra ni modifica datos existentes.
-- Correrlos ANTES de subir `Notifications.php`.

-- ── Envío 1 · la tabla ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `notif_suscriptores` (
  `categoria` VARCHAR(40) NOT NULL COMMENT 'Qué aviso: diesel_state, sin_fallas, viaje_programado…',
  `user_id` INT(11) NOT NULL COMMENT 'Users_credentials.id de quien recibe el aviso',
  `creado_en` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `creado_por` INT(11) DEFAULT NULL COMMENT 'Users_credentials.id de quien lo dio de alta',
  PRIMARY KEY (`categoria`, `user_id`),
  KEY `idx_notif_suscriptores_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- ── Envío 2 · carga inicial (opcional) ───────────────────────────────────────
--
-- Deja a cada quien recibiendo lo mismo que recibe hoy, para que nadie note el
-- cambio: diesel y viajes a quien tiene el permiso de la pantalla (y a los
-- Admin, que ven todo), y los dos de Reparaciones a los suscritos a Inspecciones.
-- Sin este envío las listas arrancan vacías y hay que llenarlas a mano.
-- Se puede correr más de una vez: no duplica.

INSERT IGNORE INTO `notif_suscriptores` (`categoria`, `user_id`)
SELECT c.categoria, uc.id
  FROM (
        SELECT 'diesel_state' AS categoria, 'gastos_diesel' AS feature_key
        UNION ALL SELECT 'diesel_fleetone', 'gastos_diesel'
        UNION ALL SELECT 'viaje_programado', 'viajes_tab_programacion'
        UNION ALL SELECT 'viaje_despacho', 'viajes_tab_despacho'
        UNION ALL SELECT 'viaje_documentos', 'viajes_tab_despacho'
       ) c
  JOIN `Users_credentials` uc
    ON uc.type <> 'Driver' AND COALESCE(uc.active, 1) = 1
 WHERE LOWER(uc.type) = 'admin'
    OR EXISTS (
        SELECT 1
          FROM `user_feature_flags` uff
          JOIN `features` f ON f.feature_id = uff.feature_id
         WHERE uff.user_id = uc.id
           AND uff.enabled = 1
           AND f.feature_key = c.feature_key
       )
UNION
SELECT c.categoria, s.user_id
  FROM `mtto_notif_suscriptores` s
  JOIN (SELECT 'sin_fallas' AS categoria UNION ALL SELECT 'sin_inspeccion') c;
