-- ============================================================================
-- Modelo de roles y permisos de IMA  ·  propuesta 2026-08-31
-- ============================================================================
--
-- NO TOCA NADA DE LO QUE HAY EN PRODUCCIÓN.
--
-- `Users_credentials.type` se queda exactamente como está y sigue siendo la
-- fuente de verdad mientras el frontend lea de ahí. Estas tablas son nuevas y
-- nadie las consulta todavía: se llenan, se comparan contra lo que hay hoy, y
-- solo cuando cuadren al 100 % se cambia el backend para leer de ellas.
--
-- Ese orden es el que permite volver atrás: mientras nada lea estas tablas,
-- borrarlas no rompe nada.
--
-- IMPORTANTE (phpMyAdmin de GoDaddy): no hay transacciones entre envíos. Manda
-- cada BLOQUE por separado y verifica antes de seguir al siguiente.
--
-- ============================================================================
-- BLOQUE 1 — Crear el esquema. Reversible: basta con DROP.
-- ============================================================================

CREATE TABLE IF NOT EXISTS roles (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  clave        VARCHAR(40)  NOT NULL UNIQUE COMMENT 'administrador, operaciones, finanzas...',
  nombre       VARCHAR(80)  NOT NULL        COMMENT 'Cómo se le muestra a una persona',
  descripcion  VARCHAR(255) NULL,
  ve_todo      TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '1 = omite la comprobación de permisos',
  activo       TINYINT(1)   NOT NULL DEFAULT 1,
  creado_en    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS permisos (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  clave        VARCHAR(60)  NOT NULL UNIQUE COMMENT 'La misma clave que hoy usa features.php',
  modulo       VARCHAR(40)  NOT NULL        COMMENT 'gastos, viajes, finanzas...',
  nombre       VARCHAR(120) NOT NULL,
  descripcion  VARCHAR(255) NULL,
  INDEX idx_permisos_modulo (modulo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS rol_permisos (
  rol_id     INT NOT NULL,
  permiso_id INT NOT NULL,
  PRIMARY KEY (rol_id, permiso_id),
  FOREIGN KEY (rol_id)     REFERENCES roles(id)    ON DELETE CASCADE,
  FOREIGN KEY (permiso_id) REFERENCES permisos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS usuario_roles (
  usuario_id INT NOT NULL,
  rol_id     INT NOT NULL,
  asignado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (usuario_id, rol_id),
  FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
COMMENT='Sin FK a Users_credentials a propósito: no se toca esa tabla todavía';

-- Ajustes por usuario. Es el equivalente de los feature flags de hoy, pero con
-- la negación explícita: `concedido = 0` quita algo que el rol sí daba.
CREATE TABLE IF NOT EXISTS usuario_permisos (
  usuario_id INT NOT NULL,
  permiso_id INT NOT NULL,
  concedido  TINYINT(1) NOT NULL,
  PRIMARY KEY (usuario_id, permiso_id),
  FOREIGN KEY (permiso_id) REFERENCES permisos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- BLOQUE 2 — Catálogo de roles.
-- ============================================================================

INSERT INTO roles (clave, nombre, descripcion, ve_todo) VALUES
  ('administrador',  'Administrador',  'Acceso total. Es el Admin de hoy.',                    1),
  ('operaciones',    'Operaciones',    'Viajes, despacho y unidades.',                         0),
  ('finanzas',       'Finanzas',       'Nómina, pagos, ventas, margen y gastos.',              0),
  ('mantenimiento',  'Mantenimiento',  'Órdenes de servicio, inspecciones, afinaciones.',      0),
  ('safety',         'Safety',         'Safety e IFTA.',                                       0),
  ('administrativo', 'Administrativo', 'Rol de transición: conserva sus permisos actuales.',   0),
  ('operador',       'Operador',       'Conductores. Usan la app móvil, no la de escritorio.', 0),
  ('consulta',       'Consulta',       'Solo lectura del inicio. Destino de un rol desconocido.', 0)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), descripcion = VALUES(descripcion);

-- ============================================================================
-- BLOQUE 3 — Catálogo de permisos.
-- Las claves son EXACTAMENTE las que usa features.php hoy. No se renombran:
-- la app móvil consume los mismos endpoints y se rompería en silencio.
-- ============================================================================

INSERT INTO permisos (clave, modulo, nombre) VALUES
  ('inicio',                  'general',        'Inicio'),
  ('mapa',                    'general',        'Mapa'),
  ('reports',                 'general',        'Reports'),
  ('ima_manager',             'ima_manager',    'IMA Manager'),
  ('ima_documentos',          'ima_manager',    'Documentos'),
  ('ima_conductores',         'ima_manager',    'Conductores'),
  ('ima_camiones',            'ima_manager',    'Camiones'),
  ('ima_cajas',               'ima_manager',    'Cajas'),
  ('gastos',                  'gastos',         'Gastos'),
  ('gastos_nuevo',            'gastos',         'Nuevo gasto'),
  ('gastos_admin_general',    'gastos',         'Administrador de gastos'),
  ('gastos_diesel',           'gastos',         'Gastos diesel'),
  ('gastos_viajes',           'gastos',         'Gastos de viajes'),
  ('mantenimientos',          'mantenimientos', 'Mantenimientos'),
  ('mant_inspeccion_final',   'mantenimientos', 'Inspección final'),
  ('mant_ordenes_servicio',   'mantenimientos', 'Órdenes de servicio'),
  ('mant_inventario',         'mantenimientos', 'Inventario'),
  ('mant_autonomias',         'mantenimientos', 'Autonomías'),
  ('mant_afinaciones',        'mantenimientos', 'Afinaciones'),
  ('viajes',                  'viajes',         'Viajes'),
  ('viajes_cotizador',        'viajes',         'Cotizador'),
  ('viajes_crear',            'viajes',         'Crear viaje'),
  ('viajes_admin',            'viajes',         'Administrador de viajes'),
  ('viajes_tab_programacion', 'viajes',         'Pestaña Programación'),
  ('viajes_tab_upcoming',     'viajes',         'Pestaña Upcoming'),
  ('viajes_tab_despacho',     'viajes',         'Pestaña Despacho'),
  ('viajes_tab_en_ruta',      'viajes',         'Pestaña En ruta'),
  ('viajes_tab_completados',  'viajes',         'Pestaña Completados'),
  ('view_all_trips',          'viajes',         'Visibilidad global de viajes'),
  ('viajes_invoice_fields',   'viajes',         'Gestionar invoices'),
  ('safety',                  'safety',         'Safety'),
  ('safety_general',          'safety',         'Safety general'),
  ('safety_ifta',             'safety',         'IFTA'),
  ('finanzas',                'finanzas',       'Finanzas'),
  ('finanzas_nomina',         'finanzas',       'Nómina'),
  ('finanzas_pagos',          'finanzas',       'Pagos'),
  ('finanzas_ventas',         'finanzas',       'Ventas'),
  ('finanzas_margen',         'finanzas',       'Margen')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), modulo = VALUES(modulo);

-- ============================================================================
-- BLOQUE 3b — Paquete de permisos de cada rol.
--
-- GENERADO desde src/shared/auth/roles.js. No editar a mano: si cambia el
-- paquete de un rol se cambia ahí y se vuelve a generar, para que el frontend y
-- la base de datos no puedan discrepar. Hay un test que lo verifica.
--
-- El rol 'administrador' no aparece: tiene ve_todo = 1 y no pasa por aquí.
-- Se usa UNION ALL y no la sintaxis VALUES(), que necesita MySQL 8.0.19+.
-- ============================================================================

INSERT IGNORE INTO rol_permisos (rol_id, permiso_id)
SELECT r.id, p.id
FROM (
  SELECT 'operaciones' AS rol_clave, 'gastos' AS permiso_clave
  UNION ALL
  SELECT 'operaciones' AS rol_clave, 'gastos_viajes' AS permiso_clave
  UNION ALL
  SELECT 'operaciones' AS rol_clave, 'ima_cajas' AS permiso_clave
  UNION ALL
  SELECT 'operaciones' AS rol_clave, 'ima_camiones' AS permiso_clave
  UNION ALL
  SELECT 'operaciones' AS rol_clave, 'ima_conductores' AS permiso_clave
  UNION ALL
  SELECT 'operaciones' AS rol_clave, 'ima_documentos' AS permiso_clave
  UNION ALL
  SELECT 'operaciones' AS rol_clave, 'ima_manager' AS permiso_clave
  UNION ALL
  SELECT 'operaciones' AS rol_clave, 'inicio' AS permiso_clave
  UNION ALL
  SELECT 'operaciones' AS rol_clave, 'mapa' AS permiso_clave
  UNION ALL
  SELECT 'operaciones' AS rol_clave, 'reports' AS permiso_clave
  UNION ALL
  SELECT 'operaciones' AS rol_clave, 'viajes' AS permiso_clave
  UNION ALL
  SELECT 'operaciones' AS rol_clave, 'viajes_admin' AS permiso_clave
  UNION ALL
  SELECT 'operaciones' AS rol_clave, 'viajes_cotizador' AS permiso_clave
  UNION ALL
  SELECT 'operaciones' AS rol_clave, 'viajes_crear' AS permiso_clave
  UNION ALL
  SELECT 'operaciones' AS rol_clave, 'viajes_invoice_fields' AS permiso_clave
  UNION ALL
  SELECT 'operaciones' AS rol_clave, 'viajes_tab_completados' AS permiso_clave
  UNION ALL
  SELECT 'operaciones' AS rol_clave, 'viajes_tab_despacho' AS permiso_clave
  UNION ALL
  SELECT 'operaciones' AS rol_clave, 'viajes_tab_en_ruta' AS permiso_clave
  UNION ALL
  SELECT 'operaciones' AS rol_clave, 'viajes_tab_programacion' AS permiso_clave
  UNION ALL
  SELECT 'operaciones' AS rol_clave, 'viajes_tab_upcoming' AS permiso_clave
  UNION ALL
  SELECT 'operaciones' AS rol_clave, 'view_all_trips' AS permiso_clave
  UNION ALL
  SELECT 'finanzas' AS rol_clave, 'finanzas' AS permiso_clave
  UNION ALL
  SELECT 'finanzas' AS rol_clave, 'finanzas_margen' AS permiso_clave
  UNION ALL
  SELECT 'finanzas' AS rol_clave, 'finanzas_nomina' AS permiso_clave
  UNION ALL
  SELECT 'finanzas' AS rol_clave, 'finanzas_pagos' AS permiso_clave
  UNION ALL
  SELECT 'finanzas' AS rol_clave, 'finanzas_ventas' AS permiso_clave
  UNION ALL
  SELECT 'finanzas' AS rol_clave, 'gastos' AS permiso_clave
  UNION ALL
  SELECT 'finanzas' AS rol_clave, 'gastos_admin_general' AS permiso_clave
  UNION ALL
  SELECT 'finanzas' AS rol_clave, 'gastos_diesel' AS permiso_clave
  UNION ALL
  SELECT 'finanzas' AS rol_clave, 'gastos_nuevo' AS permiso_clave
  UNION ALL
  SELECT 'finanzas' AS rol_clave, 'gastos_viajes' AS permiso_clave
  UNION ALL
  SELECT 'finanzas' AS rol_clave, 'inicio' AS permiso_clave
  UNION ALL
  SELECT 'finanzas' AS rol_clave, 'mapa' AS permiso_clave
  UNION ALL
  SELECT 'finanzas' AS rol_clave, 'reports' AS permiso_clave
  UNION ALL
  SELECT 'finanzas' AS rol_clave, 'viajes' AS permiso_clave
  UNION ALL
  SELECT 'finanzas' AS rol_clave, 'viajes_admin' AS permiso_clave
  UNION ALL
  SELECT 'finanzas' AS rol_clave, 'viajes_invoice_fields' AS permiso_clave
  UNION ALL
  SELECT 'mantenimiento' AS rol_clave, 'gastos' AS permiso_clave
  UNION ALL
  SELECT 'mantenimiento' AS rol_clave, 'gastos_diesel' AS permiso_clave
  UNION ALL
  SELECT 'mantenimiento' AS rol_clave, 'ima_cajas' AS permiso_clave
  UNION ALL
  SELECT 'mantenimiento' AS rol_clave, 'ima_camiones' AS permiso_clave
  UNION ALL
  SELECT 'mantenimiento' AS rol_clave, 'ima_manager' AS permiso_clave
  UNION ALL
  SELECT 'mantenimiento' AS rol_clave, 'inicio' AS permiso_clave
  UNION ALL
  SELECT 'mantenimiento' AS rol_clave, 'mant_afinaciones' AS permiso_clave
  UNION ALL
  SELECT 'mantenimiento' AS rol_clave, 'mant_autonomias' AS permiso_clave
  UNION ALL
  SELECT 'mantenimiento' AS rol_clave, 'mant_inspeccion_final' AS permiso_clave
  UNION ALL
  SELECT 'mantenimiento' AS rol_clave, 'mant_inventario' AS permiso_clave
  UNION ALL
  SELECT 'mantenimiento' AS rol_clave, 'mant_ordenes_servicio' AS permiso_clave
  UNION ALL
  SELECT 'mantenimiento' AS rol_clave, 'mantenimientos' AS permiso_clave
  UNION ALL
  SELECT 'mantenimiento' AS rol_clave, 'mapa' AS permiso_clave
  UNION ALL
  SELECT 'mantenimiento' AS rol_clave, 'reports' AS permiso_clave
  UNION ALL
  SELECT 'safety' AS rol_clave, 'ima_conductores' AS permiso_clave
  UNION ALL
  SELECT 'safety' AS rol_clave, 'ima_documentos' AS permiso_clave
  UNION ALL
  SELECT 'safety' AS rol_clave, 'ima_manager' AS permiso_clave
  UNION ALL
  SELECT 'safety' AS rol_clave, 'inicio' AS permiso_clave
  UNION ALL
  SELECT 'safety' AS rol_clave, 'mapa' AS permiso_clave
  UNION ALL
  SELECT 'safety' AS rol_clave, 'reports' AS permiso_clave
  UNION ALL
  SELECT 'safety' AS rol_clave, 'safety' AS permiso_clave
  UNION ALL
  SELECT 'safety' AS rol_clave, 'safety_general' AS permiso_clave
  UNION ALL
  SELECT 'safety' AS rol_clave, 'safety_ifta' AS permiso_clave
  UNION ALL
  SELECT 'administrativo' AS rol_clave, 'inicio' AS permiso_clave
  UNION ALL
  SELECT 'consulta' AS rol_clave, 'inicio' AS permiso_clave
) AS paquete
JOIN roles    r ON r.clave = paquete.rol_clave
JOIN permisos p ON p.clave = paquete.permiso_clave;

-- Verificación: cuántos permisos quedó con cada rol.
SELECT r.clave, COUNT(*) AS permisos
FROM rol_permisos rp JOIN roles r ON r.id = rp.rol_id
GROUP BY r.clave ORDER BY permisos DESC;

-- ============================================================================
-- BLOQUE 4 — Asignar los usuarios actuales a su rol equivalente.
-- Nadie cambia de permisos: los `Administrativo` van a un rol con el paquete
-- mínimo, y sus permisos siguen viniendo de sus ajustes individuales.
-- ============================================================================

INSERT IGNORE INTO usuario_roles (usuario_id, rol_id)
SELECT u.id, r.id
FROM Users_credentials u
JOIN roles r ON r.clave = CASE LOWER(TRIM(u.type))
    WHEN 'admin'          THEN 'administrador'
    WHEN 'administrativo' THEN 'administrativo'
    WHEN 'driver'         THEN 'operador'
    ELSE 'consulta'
  END;

-- ============================================================================
-- BLOQUE 5 — VERIFICACIÓN. Correr ANTES de que nada lea las tablas nuevas.
-- ============================================================================

-- 5a. Todo usuario tiene exactamente un rol. Debe salir 0 filas.
SELECT u.id, u.name, u.type, COUNT(ur.rol_id) AS roles
FROM Users_credentials u
LEFT JOIN usuario_roles ur ON ur.usuario_id = u.id
GROUP BY u.id HAVING roles <> 1;

-- 5b. Nadie cayó en 'consulta' por un type no previsto. Debe salir 0 filas.
SELECT u.id, u.name, u.type
FROM Users_credentials u
JOIN usuario_roles ur ON ur.usuario_id = u.id
JOIN roles r ON r.id = ur.rol_id
WHERE r.clave = 'consulta';

-- 5c. Reparto final. Debe dar administrador 3, administrativo 12, operador 16.
SELECT r.clave, COUNT(*) AS usuarios
FROM usuario_roles ur JOIN roles r ON r.id = ur.rol_id
GROUP BY r.clave ORDER BY usuarios DESC;

-- ============================================================================
-- BLOQUE 6 — Solo cuando el 5 salga limpio: copiar los flags actuales.
-- Sustituye <TABLA_FEATURES> y <COL_*> por los nombres reales; hay que mirarlos
-- antes con  SHOW TABLES LIKE '%feature%';
-- ============================================================================

-- INSERT IGNORE INTO usuario_permisos (usuario_id, permiso_id, concedido)
-- SELECT f.<COL_USER_ID>, p.id, IF(f.<COL_ENABLED> = 1, 1, 0)
-- FROM <TABLA_FEATURES> f
-- JOIN permisos p ON p.clave = f.<COL_FEATURE_KEY>;

-- Verificación: los permisos efectivos nuevos deben coincidir con los de hoy,
-- usuario por usuario. Si alguna fila difiere, NO seguir.

-- ============================================================================
-- DESHACER (mientras nada lea estas tablas)
-- ============================================================================
-- DROP TABLE IF EXISTS usuario_permisos, usuario_roles, rol_permisos, permisos, roles;
