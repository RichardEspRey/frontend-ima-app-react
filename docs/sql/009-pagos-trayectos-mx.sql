CREATE TABLE IF NOT EXISTS pago_trayectos_mx (
    id             INT(11)       NOT NULL AUTO_INCREMENT,
    nombre         VARCHAR(100)  NOT NULL,
    monto          DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    activo         TINYINT(1)    NOT NULL DEFAULT 1,
    creado_en      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en DATETIME      NULL DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_pago_trayectos_mx_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pago_trayecto_viaje (
    trip_id     INT(11)       NOT NULL,
    driver_id   INT(11)       NOT NULL,
    trayecto_id INT(11)       NOT NULL,
    monto       DECIMAL(10,2) NOT NULL,
    id_usuario  INT(11)       NULL DEFAULT NULL,
    asignado_en DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (trip_id, driver_id),
    KEY idx_pago_trayecto_viaje_trayecto (trayecto_id),
    CONSTRAINT fk_pago_trayecto_viaje_trayecto FOREIGN KEY (trayecto_id) REFERENCES pago_trayectos_mx (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO pago_trayectos_mx (nombre, monto) VALUES
    ('Apodaca', 0.00),
    ('Gómez Palacio', 0.00);

SELECT id, nombre, monto, activo FROM pago_trayectos_mx ORDER BY nombre;
