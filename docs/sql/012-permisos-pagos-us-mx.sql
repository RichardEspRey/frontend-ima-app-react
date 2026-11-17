-- Pago a Operadores · permisos por país
--
-- Dos permisos nuevos de escritorio: quién ve la pestaña de viajes US y quién la de
-- MX en Finanzas → Pagos. Se conceden desde el Gestor de accesos, en el grupo
-- «Pestañas de Pagos».
--
-- Son DOS envíos. Mandar cada uno por separado en phpMyAdmin y revisar el resultado
-- antes del siguiente. Ninguno borra ni modifica datos existentes.
--
-- Mientras no se corra el envío 1, la pantalla enseña las dos pestañas a todo el que
-- entra a Pagos, como hasta ahora.

-- ── Envío 1 · los dos permisos ───────────────────────────────────────────────
--
-- Nacen apagados: `features.php` lista cada permiso aunque la persona no tenga fila
-- en `user_feature_flags`. Los Admin ven las dos pestañas siempre.

INSERT INTO `features` (`feature_key`, `name`, `description`, `module`, `plataform`, `active`)
VALUES
  ('finanzas_pagos_us', 'Ver Pestaña Viajes US', 'Ve los viajes de US en Pago a Operadores.', 'Finanzas', 'Desktop', 1),
  ('finanzas_pagos_mx', 'Ver Pestaña Viajes MX', 'Ve los viajes de MX en Pago a Operadores.', 'Finanzas', 'Desktop', 1);

-- ── Envío 2 · carga inicial (recomendado, y enseguida del envío 1) ───────────
--
-- Le enciende las dos pestañas a quien hoy tiene el permiso de Pagos, para que nadie
-- pierda lo que ya veía. Después se le apaga a cada quien la que no le toque desde
-- el Gestor de accesos. Se puede correr más de una vez: no duplica ni pisa cambios.

INSERT IGNORE INTO `user_feature_flags` (`user_id`, `feature_id`, `enabled`)
SELECT uff.user_id, nuevo.feature_id, 1
  FROM `user_feature_flags` uff
  JOIN `features` pagos ON pagos.feature_id = uff.feature_id AND pagos.feature_key = 'finanzas_pagos'
  JOIN `features` nuevo ON nuevo.feature_key IN ('finanzas_pagos_us', 'finanzas_pagos_mx')
 WHERE uff.enabled = 1;
