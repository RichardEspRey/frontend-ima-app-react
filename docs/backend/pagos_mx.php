<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once 'conexion.php';

header("Content-Type: application/json; charset=utf-8");

$op = $_POST['op'] ?? '';

function responderError($codigo, $mensaje) {
    http_response_code($codigo);
    echo json_encode(['status' => 'error', 'message' => $mensaje]);
}

try {
    $database = new Conexion();
    $db = $database->getConnection();

    switch ($op) {

        case 'getTrayectos':
            $stmt = $db->query("SELECT id, nombre, monto, activo, actualizado_en FROM pago_trayectos_mx ORDER BY activo DESC, nombre");
            echo json_encode(['status' => 'success', 'trayectos' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
            break;

        case 'guardarTrayecto':
            $id = $_POST['id'] ?? '';
            $nombre = trim((string)($_POST['nombre'] ?? ''));
            $monto = $_POST['monto'] ?? '';
            $activo = ($_POST['activo'] ?? '1') === '0' ? 0 : 1;

            if ($nombre === '' || mb_strlen($nombre) > 100) {
                responderError(400, 'El trayecto necesita un nombre de hasta 100 caracteres.');
                break;
            }
            if (!is_numeric($monto) || (float)$monto < 0) {
                responderError(400, 'El monto tiene que ser un número mayor o igual a cero.');
                break;
            }

            $duplicado = $db->prepare("SELECT id FROM pago_trayectos_mx WHERE nombre = ? AND id <> ?");
            $duplicado->execute([$nombre, filter_var($id, FILTER_VALIDATE_INT) ? (int)$id : 0]);
            if ($duplicado->fetchColumn()) {
                responderError(409, "Ya existe un trayecto llamado «{$nombre}».");
                break;
            }

            if (filter_var($id, FILTER_VALIDATE_INT)) {
                $stmt = $db->prepare("UPDATE pago_trayectos_mx SET nombre = ?, monto = ?, activo = ?, actualizado_en = NOW() WHERE id = ?");
                $stmt->execute([$nombre, round((float)$monto, 2), $activo, (int)$id]);
                $nuevoId = (int)$id;
            } else {
                $stmt = $db->prepare("INSERT INTO pago_trayectos_mx (nombre, monto, activo) VALUES (?, ?, ?)");
                $stmt->execute([$nombre, round((float)$monto, 2), $activo]);
                $nuevoId = (int)$db->lastInsertId();
            }

            echo json_encode(['status' => 'success', 'id' => $nuevoId]);
            break;

        case 'getDatosPagos':
            $viajes = $db->query("
                SELECT
                    t.trip_id,
                    t.country_code,
                    CASE WHEN t.is_transnational = 1
                         THEN CONCAT(t.trip_number, '-', t.country_code, '-', t.transnational_number, 'T', t.movement_number, '-', t.trip_year)
                         ELSE CONCAT(t.trip_number, '-', t.country_code, '-', t.trip_year)
                    END AS nomenclatura,
                    IF(t.country_code = 'MX',
                       (SELECT GROUP_CONCAT(TRIM(s.destination) ORDER BY s.stage_number SEPARATOR '|')
                          FROM trip_stages s
                         WHERE s.trip_id = t.trip_id AND TRIM(COALESCE(s.destination, '')) <> ''),
                       NULL) AS recorrido
                  FROM trips t
            ")->fetchAll(PDO::FETCH_ASSOC);

            $asignaciones = $db->query("
                SELECT a.trip_id, a.driver_id, a.trayecto_id, a.monto, a.asignado_en, p.nombre AS trayecto
                  FROM pago_trayecto_viaje a
                  JOIN pago_trayectos_mx p ON p.id = a.trayecto_id
            ")->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(['status' => 'success', 'viajes' => $viajes, 'asignaciones' => $asignaciones]);
            break;

        case 'asignarTrayecto':
            $trip_id = $_POST['trip_id'] ?? '';
            $driver_id = $_POST['driver_id'] ?? '';
            $trayecto_id = $_POST['trayecto_id'] ?? '';
            $id_usuario = $_POST['id_usuario'] ?? null;

            if (!filter_var($trip_id, FILTER_VALIDATE_INT) || !filter_var($driver_id, FILTER_VALIDATE_INT) || !filter_var($trayecto_id, FILTER_VALIDATE_INT)) {
                responderError(400, 'Faltan trip_id, driver_id o trayecto_id.');
                break;
            }

            $viaje = $db->prepare("SELECT country_code FROM trips WHERE trip_id = ?");
            $viaje->execute([(int)$trip_id]);
            if ($viaje->fetchColumn() !== 'MX') {
                responderError(400, 'Solo los viajes de México se pagan por trayecto.');
                break;
            }

            $pagado = $db->prepare("SELECT COUNT(*) FROM trip_payments WHERE trip_id = ? AND driver_id = ? AND status = 1");
            $pagado->execute([(int)$trip_id, (int)$driver_id]);
            if ((int)$pagado->fetchColumn() > 0) {
                responderError(409, 'Este viaje ya está pagado; su trayecto no se puede cambiar.');
                break;
            }

            $trayecto = $db->prepare("SELECT monto FROM pago_trayectos_mx WHERE id = ? AND activo = 1");
            $trayecto->execute([(int)$trayecto_id]);
            $monto = $trayecto->fetchColumn();
            if ($monto === false) {
                responderError(404, 'El trayecto no existe o está desactivado.');
                break;
            }
            if ((float)$monto <= 0) {
                responderError(400, 'El trayecto todavía no tiene monto. Asígnale uno en el catálogo.');
                break;
            }

            $stmt = $db->prepare("
                INSERT INTO pago_trayecto_viaje (trip_id, driver_id, trayecto_id, monto, id_usuario)
                VALUES (?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE trayecto_id = VALUES(trayecto_id), monto = VALUES(monto),
                                        id_usuario = VALUES(id_usuario), asignado_en = NOW()
            ");
            $stmt->execute([
                (int)$trip_id,
                (int)$driver_id,
                (int)$trayecto_id,
                $monto,
                filter_var($id_usuario, FILTER_VALIDATE_INT) ? (int)$id_usuario : null,
            ]);

            echo json_encode(['status' => 'success', 'monto' => $monto]);
            break;

        default:
            responderError(400, 'Operación no reconocida');
    }
} catch (Exception $e) {
    responderError(500, $e->getMessage());
}
