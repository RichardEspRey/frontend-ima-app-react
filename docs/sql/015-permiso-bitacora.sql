-- Bitácora · permiso para consultarla
--
-- Un permiso nuevo de escritorio, «Ver bitácora». Los Admin la ven siempre; a
-- cualquier otra persona se le enciende desde el Gestor de accesos, en el grupo
-- «Gestor de Acceso». Decidido por Emiliano el 2026-11-17.
--
-- Un solo envío. No borra ni modifica nada. Nace apagado para todos:
-- features.php lista cada permiso aunque la persona no tenga fila en
-- user_feature_flags.

INSERT INTO `features` (`feature_key`, `name`, `description`, `module`, `plataform`, `active`)
VALUES (
  'bitacora_ver',
  'Ver bitácora',
  'Entra a la bitácora de auditoría: quién hizo cada cambio y cuándo.',
  'Gestor de Acceso',
  'Desktop',
  1
);
