<?php
// Bitácora de auditoría · consulta
//
// listar     · una página de la bitácora, con filtros; sin los datos de cada fila
// detalle    · una fila completa: datos recibidos y cambios registrados
// getFiltros · usuarios y archivos que aparecen, para los selectores de la pantalla
//
// Solo lee. Las tres operaciones tienen nombre de lectura, así que la propia bitácora
// no las registra.
//
// Quién puede consultarla: solo quien tenga encendido el permiso `bitacora_ver` (SQL 015),
// aunque sea administrador. Decidido por Emiliano el 2026-11-17: ser Admin no basta, para
// que la vea únicamente a quien él se la dé. Se comprueba con el `_usuario` que manda la app. La API no tiene sesión
// real, así que esto evita que la pantalla se abra por error, no que alguien con
// mala intención la lea con curl.
//
// Las fechas viajan en UTC (`fecha_utc`); la pantalla las convierte a hora de Monterrey
// y manda los rangos ya convertidos (desde_utc / hasta_utc).

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once 'conexion.php';

header("Content-Type: application/json; charset=utf-8");

define('POR_PAGINA_MAXIMO', 100);

function responder($datos) {
    echo json_encode($datos, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit();
}

function fallar($codigo, $mensaje) {
    http_response_code($codigo);
    responder(['status' => 'error', 'message' => $mensaje]);
}

function esFechaUtc($texto) {
    return is_string($texto) && preg_match('/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/', $texto) === 1;
}

function puedeVer($db, $usuarioId) {
    $stmt = $db->prepare("
        SELECT 1
          FROM Users_credentials uc
         WHERE uc.id = ?
           AND COALESCE(uc.active, 1) = 1
           AND EXISTS (SELECT 1
                         FROM user_feature_flags uff
                         JOIN features f ON f.feature_id = uff.feature_id
                        WHERE uff.user_id = uc.id
                          AND uff.enabled = 1
                          AND f.feature_key = 'bitacora_ver')
    ");
    $stmt->execute([$usuarioId]);
    return (bool)$stmt->fetchColumn();
}

try {
    $conexion = new Conexion();
    $db = $conexion->getConnection();
    if (!$db) fallar(500, 'No se pudo conectar a la base de datos.');

    // La bitácora está en utf8mb4 y Users_credentials en latin1: así las dos llegan bien.
    $db->exec("SET NAMES utf8mb4");

    $usuarioId = $_POST['_usuario'] ?? '';
    if (!filter_var($usuarioId, FILTER_VALIDATE_INT) || !puedeVer($db, (int)$usuarioId)) {
        fallar(403, 'No tienes permiso para ver la bitácora.');
    }

    $op = $_POST['op'] ?? '';

    switch ($op) {
        case 'listar':
            $condiciones = [];
            $valores = [];

            if (esFechaUtc($_POST['desde_utc'] ?? null)) {
                $condiciones[] = 'b.fecha_utc >= ?';
                $valores[] = $_POST['desde_utc'];
            }
            if (esFechaUtc($_POST['hasta_utc'] ?? null)) {
                $condiciones[] = 'b.fecha_utc < ?';
                $valores[] = $_POST['hasta_utc'];
            }

            $usuario = $_POST['usuario_id'] ?? '';
            if ($usuario === 'sin') {
                $condiciones[] = 'b.usuario_id IS NULL';
            } elseif (filter_var($usuario, FILTER_VALIDATE_INT)) {
                $condiciones[] = 'b.usuario_id = ?';
                $valores[] = (int)$usuario;
            }

            $archivo = trim((string)($_POST['archivo'] ?? ''));
            if ($archivo !== '') {
                $condiciones[] = 'b.archivo = ?';
                $valores[] = $archivo;
            }

            $resultado = $_POST['resultado'] ?? '';
            if ($resultado === 'error') {
                $condiciones[] = "b.resultado = 'error'";
            } elseif ($resultado === 'exito') {
                $condiciones[] = "(b.resultado IS NULL OR b.resultado <> 'error')";
            }

            $texto = trim((string)($_POST['texto'] ?? ''));
            if ($texto !== '') {
                $condiciones[] = '(b.op LIKE ? OR b.datos LIKE ?)';
                $valores[] = '%' . $texto . '%';
                $valores[] = '%' . $texto . '%';
            }

            $donde = $condiciones ? 'WHERE ' . implode(' AND ', $condiciones) : '';

            $porPagina = (int)($_POST['por_pagina'] ?? 25);
            $porPagina = max(1, min(POR_PAGINA_MAXIMO, $porPagina));
            $pagina = max(0, (int)($_POST['pagina'] ?? 0));

            $total = $db->prepare("SELECT COUNT(*) FROM bitacora b {$donde}");
            $total->execute($valores);

            $stmt = $db->prepare("
                SELECT b.id, b.fecha_utc, b.usuario_id, uc.name AS usuario_nombre, uc.user AS usuario_cuenta,
                       b.app, b.app_version, b.archivo, b.op, b.resultado, b.mensaje, b.ip
                  FROM bitacora b
             LEFT JOIN Users_credentials uc ON uc.id = b.usuario_id
                {$donde}
              ORDER BY b.fecha_utc DESC, b.id DESC
                 LIMIT {$porPagina} OFFSET " . ($pagina * $porPagina)
            );
            $stmt->execute($valores);

            responder([
                'status' => 'success',
                'total' => (int)$total->fetchColumn(),
                'filas' => $stmt->fetchAll(PDO::FETCH_ASSOC),
            ]);

        case 'detalle':
            $id = $_POST['id'] ?? '';
            if (!filter_var($id, FILTER_VALIDATE_INT)) fallar(400, 'Falta id.');

            $stmt = $db->prepare("
                SELECT b.*, uc.name AS usuario_nombre, uc.user AS usuario_cuenta
                  FROM bitacora b
             LEFT JOIN Users_credentials uc ON uc.id = b.usuario_id
                 WHERE b.id = ?
            ");
            $stmt->execute([(int)$id]);
            $fila = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$fila) fallar(404, 'Ese registro no existe.');

            $cambios = $db->prepare("
                SELECT id, fecha_utc, tabla, registro_id, operacion, antes, despues
                  FROM bitacora_cambios
                 WHERE peticion = ?
              ORDER BY id
            ");
            $cambios->execute([$fila['peticion']]);

            responder([
                'status' => 'success',
                'fila' => $fila,
                'cambios' => $cambios->fetchAll(PDO::FETCH_ASSOC),
            ]);

        case 'getFiltros':
            $usuarios = $db->query("
                SELECT DISTINCT b.usuario_id AS id, uc.name, uc.user
                  FROM bitacora b
                  JOIN Users_credentials uc ON uc.id = b.usuario_id
              ORDER BY uc.name
            ")->fetchAll(PDO::FETCH_ASSOC);

            $archivos = $db->query("SELECT DISTINCT archivo FROM bitacora ORDER BY archivo")
                ->fetchAll(PDO::FETCH_COLUMN);

            responder([
                'status' => 'success',
                'usuarios' => $usuarios,
                'archivos' => $archivos,
            ]);

        default:
            fallar(400, 'Operación no reconocida');
    }
} catch (Throwable $e) {
    fallar(500, $e->getMessage());
}
