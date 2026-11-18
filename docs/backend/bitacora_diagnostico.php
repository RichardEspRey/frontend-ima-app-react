<?php
// Bitácora · diagnóstico de un solo uso para preparar los triggers (paso B5)
//
// SOLO LEE. Responde con (todas las tablas salvo WordPress y la bitácora):
//   - si el usuario de la app puede crear triggers (SHOW GRANTS con su conexión, sin
//     contraseñas: cualquier hash se borra antes de responder),
//   - la estructura actual de las tablas candidatas a llevar «antes y después»,
//   - cuánto ha crecido la bitácora y qué se cambia más.
//
// Se sube a /API, se consulta una vez con la clave y SE BORRA. Generar una clave nueva
// cada vez (por ejemplo `python3 -c "import secrets; print(secrets.token_hex(16))"`).
// Sin la clave responde 404
// como si no existiera.

header("Content-Type: application/json; charset=utf-8");

define('CLAVE', 'PONER_UNA_CLAVE_NUEVA_ANTES_DE_SUBIR');

// La copia del repositorio no trae clave; subida así no debe abrir para nadie.
if (CLAVE === 'PONER_UNA_CLAVE_NUEVA_ANTES_DE_SUBIR' || !hash_equals(CLAVE, (string)($_GET['clave'] ?? ''))) {
    http_response_code(404);
    exit();
}

include_once 'conexion.php';


$salida = ['status' => 'success'];

try {
    $db = (new Conexion())->getConnection();
    if (!$db) throw new Exception('Sin conexión');
    $db->exec("SET NAMES utf8mb4");

    $salida['usuario'] = $db->query("SELECT CURRENT_USER()")->fetchColumn();

    $permisos = [];
    foreach ($db->query("SHOW GRANTS")->fetchAll(PDO::FETCH_COLUMN) as $linea) {
        $permisos[] = preg_replace("/(IDENTIFIED (BY|VIA|WITH)).*$/i", '$1 [oculto]', $linea);
    }
    $salida['permisos'] = $permisos;
    $texto = strtoupper(implode(' ', $permisos));
    $salida['puede_crear_triggers'] = strpos($texto, 'ALL PRIVILEGES') !== false || strpos($texto, 'TRIGGER') !== false;

    // Todas las tablas de la base salvo WordPress y la propia bitácora, para elegir
    // qué tablas llevan «antes y después» sin depender de una copia vieja.
    $candidatas = $db->query("
        SELECT table_name
          FROM information_schema.TABLES
         WHERE table_schema = DATABASE()
           AND table_type = 'BASE TABLE'
           AND table_name NOT LIKE 'wp\\_%'
           AND table_name NOT IN ('bitacora', 'bitacora_cambios')
      ORDER BY table_name
    ")->fetchAll(PDO::FETCH_COLUMN);

    $marcadores = implode(',', array_fill(0, count($candidatas), '?'));

    $stmt = $db->prepare("
        SELECT table_name, table_rows, create_time, update_time,
               ROUND((data_length + index_length) / 1024, 1) AS kb
          FROM information_schema.TABLES
         WHERE table_schema = DATABASE() AND table_name IN ($marcadores)
    ");
    $stmt->execute($candidatas);
    $tablas = [];
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $fila) {
        $tablas[$fila['table_name']] = [
            'filas' => (int)$fila['table_rows'],
            'kb' => (float)$fila['kb'],
            'creada' => $fila['create_time'],
            'ultimo_cambio' => $fila['update_time'],
            'columnas' => [],
            'llave' => [],
        ];
    }

    $stmt = $db->prepare("
        SELECT table_name, column_name, column_type, column_key
          FROM information_schema.COLUMNS
         WHERE table_schema = DATABASE() AND table_name IN ($marcadores)
      ORDER BY table_name, ordinal_position
    ");
    $stmt->execute($candidatas);
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $c) {
        if (!isset($tablas[$c['table_name']])) continue;
        $tablas[$c['table_name']]['columnas'][] = $c['column_name'] . ' ' . $c['column_type'];
        if ($c['column_key'] === 'PRI') $tablas[$c['table_name']]['llave'][] = $c['column_name'];
    }
    $salida['tablas'] = $tablas;
    $salida['no_existen'] = array_values(array_diff($candidatas, array_keys($tablas)));

    $salida['triggers_actuales'] = $db->query("
        SELECT trigger_name, event_object_table, action_timing, event_manipulation, definer
          FROM information_schema.TRIGGERS
         WHERE trigger_schema = DATABASE()
    ")->fetchAll(PDO::FETCH_ASSOC);

    $salida['bitacora'] = $db->query("
        SELECT COUNT(*) AS filas,
               ROUND(SUM(LENGTH(COALESCE(datos, ''))) / 1024, 1) AS kb_datos,
               ROUND(AVG(LENGTH(COALESCE(datos, ''))), 0) AS bytes_promedio,
               MIN(fecha_utc) AS primera, MAX(fecha_utc) AS ultima
          FROM bitacora
    ")->fetch(PDO::FETCH_ASSOC);

    $salida['bitacora_por_dia'] = $db->query("
        SELECT DATE(fecha_utc) AS dia, COUNT(*) AS filas,
               SUM(usuario_id IS NULL) AS sin_usuario
          FROM bitacora
      GROUP BY DATE(fecha_utc)
      ORDER BY dia
    ")->fetchAll(PDO::FETCH_ASSOC);

    $salida['bitacora_mas_frecuentes'] = $db->query("
        SELECT archivo, op, COUNT(*) AS veces
          FROM bitacora
      GROUP BY archivo, op
      ORDER BY veces DESC
         LIMIT 25
    ")->fetchAll(PDO::FETCH_ASSOC);

    // Quién manda las filas sin usuario o sin app reconocida (columna `agente`, SQL 018).
    try {
        $salida['bitacora_sin_identificar'] = $db->query("
            SELECT app, agente, archivo, ip, COUNT(*) AS filas, MAX(id) AS ultima
              FROM bitacora
             WHERE agente IS NOT NULL
               AND (usuario_id IS NULL OR app IN ('Otro', 'Sin agente'))
          GROUP BY app, agente, archivo, ip
          ORDER BY filas DESC
             LIMIT 50
        ")->fetchAll(PDO::FETCH_ASSOC);
    } catch (Throwable $e) {
        $salida['bitacora_sin_identificar'] = 'Sin la columna agente: ' . $e->getMessage();
    }

    $salida['tamano_tablas_bitacora_kb'] = $db->query("
        SELECT table_name, ROUND((data_length + index_length) / 1024, 1) AS kb
          FROM information_schema.TABLES
         WHERE table_schema = DATABASE() AND table_name IN ('bitacora', 'bitacora_cambios')
    ")->fetchAll(PDO::FETCH_KEY_PAIR);
} catch (Throwable $e) {
    $salida = ['status' => 'error', 'message' => $e->getMessage()];
}

echo json_encode($salida, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
