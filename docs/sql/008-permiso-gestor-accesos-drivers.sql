-- Gestor de accesos · solo Drivers
--
-- Un permiso nuevo de escritorio. Quien lo tenga entra al Gestor de accesos y solo ve la
-- pestaña Drivers: da de alta operadores, edita sus datos y sus permisos del móvil. Lo
-- conceden los administradores desde el panel de cada usuario (pestaña Desktop).
--
-- Una sola sentencia y no borra nada. Nace apagado para todos: `features.php` lista cada
-- permiso aunque la persona no tenga fila en `user_feature_flags`.

INSERT INTO `features` (`feature_key`, `name`, `description`, `module`, `plataform`, `active`)
VALUES (
  'gestor_accesos_drivers',
  'Gestor de accesos · solo Drivers',
  'Entra al Gestor de accesos y solo ve la pestaña Drivers.',
  'Gestor de Acceso',
  'Desktop',
  1
);
