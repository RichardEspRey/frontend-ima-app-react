-- Flujo de mantenimiento en una sola pantalla · el cimiento
--
-- Hoy lo que el operador reporta vive como texto suelto en `cl_motor`, `cl_exterior`,
-- `cl_neumaticos`, `cl_cabina`, `cl_remolque` y `cl_otro`: una fila por punto, sin
-- identidad ni estado. Por eso la oficina lo pasa a un Excel mientras decide qué se
-- repara, qué queda pendiente y qué se descarta, y hasta el final captura las órdenes.
--
-- REGLA DE ESTE ARCHIVO: no romper nada de lo que ya corre en producción.
--
--   * No se toca ninguna tabla que escriba la app móvil. El estado por lado de la
--     inspección vive en una tabla nueva, no en `cl_final`: si a `cl_final` se le
--     agrega una columna y algún INSERT del backend no lista sus columnas, el alta
--     de inspecciones truena en los teléfonos de los operadores.
--   * No se altera ni se borra ningún dato existente.
--   * Las inspecciones viejas no se migran: la ausencia de estado significa «lo que
--     diga `cl_final.status`», así que la historia se sigue leyendo igual.
--   * Cada sentencia es independiente. En el phpMyAdmin de GoDaddy no hay transacción
--     entre envíos, así que van de una en una y en este orden; si una falla, las
--     anteriores siguen siendo válidas por su cuenta.

-- 1. Cada punto, con identidad y estado ------------------------------------------------
--
-- Tabla nueva: no toca nada existente. Una fila por cosa que hay que atender, que nace
-- de la inspección (de la fila que escribió el operador) o a mano, para levantar una
-- reparación que nadie reportó en un viaje.
--
-- `descripcion` guarda el texto con el que se trabajó, que puede no ser el original
-- porque el campo es editable al mandarlo a la orden; `origen_tabla` y `origen_id`
-- conservan de qué renglón del checklist salió.
--
-- `estatus` vale:
--   sin_resolver   · recién leído de la inspección, todavía no se decide qué hacer
--   en_pendientes  · reparación pendiente, esperando orden
--   con_orden      · ya entró en una orden de servicio
--   descartado     · el rojo: ni orden ni pendiente, no procedía
--
-- El índice único sobre (origen_tabla, origen_id) evita que el mismo renglón del
-- checklist entre dos veces. Las filas manuales llevan los dos en NULL, y MySQL admite
-- NULLs repetidos en un índice único, así que no estorban.

CREATE TABLE IF NOT EXISTS `mtto_puntos` (
  `id`              INT(11)      NOT NULL AUTO_INCREMENT,
  `origen`          VARCHAR(12)  NOT NULL DEFAULT 'inspeccion' COMMENT 'inspeccion | manual',
  `cl_final_id`     INT(11)      DEFAULT NULL,
  `viaje_id`        VARCHAR(15)  DEFAULT NULL COMMENT 'Mismo formato que usan las tablas cl_*',
  `categoria`       VARCHAR(20)  DEFAULT NULL COMMENT 'Motor, Exterior, Neumaticos, Cabina, Remolque, Otro',
  `origen_tabla`    VARCHAR(20)  DEFAULT NULL,
  `origen_id`       INT(11)      DEFAULT NULL,
  `unidad_tipo`     VARCHAR(10)  NOT NULL COMMENT 'camion | caja',
  `truck_id`        INT(11)      DEFAULT NULL,
  `caja_id`         INT(11)      DEFAULT NULL,
  `descripcion`     VARCHAR(250) NOT NULL,
  `estatus`         VARCHAR(14)  NOT NULL DEFAULT 'sin_resolver',
  `id_orden`        INT(11)      DEFAULT NULL,
  `id_servicio`     INT(11)      DEFAULT NULL,
  `creado_en`       TIMESTAMP    NOT NULL DEFAULT current_timestamp(),
  `creado_por`      INT(11)      DEFAULT NULL,
  `actualizado_en`  TIMESTAMP    NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `actualizado_por` INT(11)      DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_origen` (`origen_tabla`, `origen_id`),
  KEY `idx_estatus_unidad` (`estatus`, `unidad_tipo`),
  KEY `idx_cl_final` (`cl_final_id`),
  KEY `idx_orden` (`id_orden`),
  KEY `truck_id` (`truck_id`),
  KEY `caja_id` (`caja_id`),
  CONSTRAINT `fk_mtto_puntos_truck` FOREIGN KEY (`truck_id`) REFERENCES `trucks` (`truck_id`),
  CONSTRAINT `fk_mtto_puntos_caja` FOREIGN KEY (`caja_id`) REFERENCES `caja` (`caja_id`),
  CONSTRAINT `fk_mtto_puntos_orden` FOREIGN KEY (`id_orden`) REFERENCES `ordenes_servicio` (`id_orden`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- 2. La inspección se cierra por lado, sin tocar `cl_final` -----------------------------
--
-- Una fila por lado trabajado. Si no hay fila, el lado se lee como lo diga
-- `cl_final.status`: así las 246 inspecciones que ya existen se siguen viendo
-- exactamente como hoy, sin migrar ni un dato.
--
-- `cl_final` queda intacta a propósito: es la tabla que da de alta la app móvil.

CREATE TABLE IF NOT EXISTS `mtto_inspeccion_lado` (
  `id`              INT(11)     NOT NULL AUTO_INCREMENT,
  `cl_final_id`     INT(11)     NOT NULL,
  `viaje_id`        VARCHAR(15) DEFAULT NULL,
  `lado`            VARCHAR(10) NOT NULL COMMENT 'camion | caja',
  `estatus`         VARCHAR(12) NOT NULL DEFAULT 'pendiente' COMMENT 'pendiente | completada',
  `completada_en`   TIMESTAMP   NULL DEFAULT NULL,
  `completada_por`  INT(11)     DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_inspeccion_lado` (`cl_final_id`, `lado`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- 3. La orden de servicio puede ser de una caja ----------------------------------------
--
-- En la pestaña de Camión se arma una orden del tractor; en la de Caja, una del
-- remolque. Son órdenes distintas, así el costo queda cargado a la unidad correcta.
--
-- ESTA ES LA ÚNICA SENTENCIA QUE TOCA UNA TABLA EXISTENTE. La columna es opcional, así
-- que cualquier INSERT que liste sus columnas sigue funcionando igual. Antes de correrla
-- hay que confirmar que los INSERT de `service_order.php` nombran sus columnas: si
-- alguno hace `INSERT INTO ordenes_servicio VALUES (...)` a secas, deja de cuadrar el
-- número de columnas y el alta de órdenes truena.

ALTER TABLE `ordenes_servicio`
  ADD COLUMN `caja_id` INT(11) DEFAULT NULL COMMENT 'Orden de remolque; excluyente con truck_id'
  AFTER `truck_id`,
  ADD CONSTRAINT `fk_ordenes_servicio_caja` FOREIGN KEY (`caja_id`) REFERENCES `caja` (`caja_id`);

-- 4. Los conceptos de gasto de la orden ------------------------------------------------
--
-- Lo que hoy se captura eligiendo del inventario pasa a capturarse como concepto, con su
-- categoría, igual que en Nuevo Gasto. Va en tabla aparte, colgada del detalle, para no
-- alterar `orden_servicio_detalles`, que es de donde el administrador de órdenes saca
-- los totales. Si esta tabla no existiera, la orden sigue sumando como hoy.

CREATE TABLE IF NOT EXISTS `mtto_concepto_detalle` (
  `id_detalle` INT(11)      NOT NULL,
  `categoria`  VARCHAR(100) DEFAULT NULL,
  `id_gasto`   INT(11)      DEFAULT NULL COMMENT 'Gasto generado en el Admin de Gastos',
  PRIMARY KEY (`id_detalle`),
  CONSTRAINT `fk_mtto_concepto_detalle` FOREIGN KEY (`id_detalle`)
    REFERENCES `orden_servicio_detalles` (`id_detalle`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
