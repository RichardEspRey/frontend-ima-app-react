-- Bitácora de auditoría · las dos tablas
--
-- Diseño completo en docs/refactor/10-BITACORA.md. Aquí solo se crean las tablas:
-- nadie las lee ni las escribe todavía, así que correr esto no cambia nada de lo que
-- hace la app. La escritura empieza cuando se suba el conexion.php nuevo (paso B2).
--
--   bitacora          · una fila por acción: quién, cuándo, qué op, con qué datos
--   bitacora_cambios  · una fila por registro tocado, con el antes y el después
--                       (la llenarán triggers en una etapa posterior)
--
-- La hora se guarda en UTC (columna fecha_utc) y la pantalla la convierte a hora de
-- Monterrey. Decidido por Emiliano el 2026-11-17: MySQL corre una hora atrás de la
-- oficina y así la bitácora no depende de eso. Por eso fecha_utc no tiene valor por
-- omisión: quien inserta la llena con UTC_TIMESTAMP().
--
-- Sin llave foránea a Users_credentials a propósito: la bitácora debe sobrevivir a que
-- se borre un usuario, y esa tabla está en latin1.
--
-- Son DOS envíos. Mandar cada uno por separado en phpMyAdmin y revisar que diga que se
-- ejecutó con éxito antes del siguiente. Ninguno toca tablas existentes.
-- Crear tablas desde phpMyAdmin es seguro: el problema del usuario temporal (error 1449)
-- solo afecta a procedimientos, vistas y triggers.

-- ── Envío 1 · bitacora ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `bitacora` (
  `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `peticion`     CHAR(32)     NOT NULL COMMENT 'Identificador de la petición; une con bitacora_cambios',
  `fecha_utc`    DATETIME     NOT NULL COMMENT 'Cuándo, en UTC',
  `usuario_id`   INT          NULL     COMMENT 'Users_credentials.id de quien lo hizo; vacío si el cliente no lo mandó',
  `verificado`   TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '1 cuando el usuario salga de una sesión real y no del cliente',
  `app`          VARCHAR(20)  NULL     COMMENT 'Desktop o Movil',
  `app_version`  VARCHAR(20)  NULL,
  `archivo`      VARCHAR(60)  NOT NULL COMMENT 'PHP que atendió la petición',
  `op`           VARCHAR(60)  NOT NULL,
  `modulo`       VARCHAR(40)  NULL,
  `resultado`    VARCHAR(10)  NULL     COMMENT 'success, error o vacío si no se pudo leer',
  `mensaje`      VARCHAR(255) NULL,
  `datos`        LONGTEXT     NULL     COMMENT 'Parámetros recibidos, sin contraseñas y recortados',
  `ip`           VARCHAR(45)  NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_bitacora_peticion` (`peticion`),
  KEY `idx_bitacora_fecha` (`fecha_utc`),
  KEY `idx_bitacora_usuario` (`usuario_id`, `fecha_utc`),
  KEY `idx_bitacora_op` (`archivo`, `op`, `fecha_utc`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ── Envío 2 · bitacora_cambios ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `bitacora_cambios` (
  `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `peticion`     CHAR(32)    NULL     COMMENT 'Vacío si el cambio no vino de la API (phpMyAdmin, procesos)',
  `fecha_utc`    DATETIME    NOT NULL,
  `usuario_id`   INT         NULL,
  `tabla`        VARCHAR(64) NOT NULL,
  `registro_id`  VARCHAR(40) NOT NULL,
  `operacion`    CHAR(1)     NOT NULL COMMENT 'I alta, U cambio, D borrado',
  `antes`        LONGTEXT    NULL     COMMENT 'El registro antes, en JSON',
  `despues`      LONGTEXT    NULL     COMMENT 'El registro después, en JSON',
  PRIMARY KEY (`id`),
  KEY `idx_cambios_registro` (`tabla`, `registro_id`, `fecha_utc`),
  KEY `idx_cambios_peticion` (`peticion`),
  KEY `idx_cambios_fecha` (`fecha_utc`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ── Para comprobar (solo lee) ────────────────────────────────────────────────
-- SHOW CREATE TABLE bitacora;
-- SHOW CREATE TABLE bitacora_cambios;
