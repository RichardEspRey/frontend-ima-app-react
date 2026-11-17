-- Campana · carga inicial de los tres avisos de Safety
--
--   safety_libro     · viajes sin Libro Electrónico, diario a las 10:00
--   safety_diesel    · viajes sin Reporte Diesel, diario a las 10:00
--   safety_pcmiller  · viajes sin Reporte PC Miller, diario a las 10:00
--
-- Un solo envío y opcional: la tabla `notif_suscriptores` (SQL 010) ya existe y no
-- cambia. Deja suscritos a quienes hoy ven Safety General y a los Admin; sin
-- correrlo, las tres listas arrancan vacías y se llenan desde Notificaciones
-- manager. No borra ni modifica nada y se puede correr más de una vez.
-- Subir antes el `Notifications.php` que ya reconoce estas tres categorías.

INSERT IGNORE INTO `notif_suscriptores` (`categoria`, `user_id`)
SELECT c.categoria, uc.id
  FROM (
        SELECT 'safety_libro' AS categoria
        UNION ALL SELECT 'safety_diesel'
        UNION ALL SELECT 'safety_pcmiller'
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
           AND f.feature_key = 'safety_general'
       );
