<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once 'conexion.php';

header("Content-Type: application/json");

$op = $_POST['op'] ?? '';

// Las cuatro ubicaciones y las dos observaciones que admite la pantalla.
$UBICACIONES  = ['PENSION NLD', 'TALLER', 'RUTA SUBIENDO', 'RUTA BAJANDO'];
$OBSERVACIONES = ['VACIA', 'CARGADA'];

// La ubicación que corresponde a cada dirección de viaje.
function ubicacionPorDireccion($direccion) {
    if ($direccion === 'Going Up')   return 'RUTA SUBIENDO';
    if ($direccion === 'Going Down') return 'RUTA BAJANDO';
    return null;
}

try {
    $database = new Conexion();
    $db = $database->getConnection();

    switch ($op) {

        case 'getEstatusCajas':
            // Por cada caja activa: su viaje en turno (el más reciente que no está
            // cerrado), el operador de ese viaje, la etapa en curso —la primera que
            // no está Completed— y el broker de esa etapa.
            $sql = "
                SELECT
                    c.caja_id,
                    c.no_caja,
                    t.trip_id,
                    t.trip_number,
                    t.country_code,
                    t.status              AS trip_status,
                    d.nombre              AS operador,
                    s.travel_direction    AS direccion,
                    s.estatus             AS etapa_estatus,
                    co.nombre_compania    AS broker,
                    ce.ubicacion          AS ubicacion_manual,
                    ce.observacion        AS observacion_manual,
                    ce.trip_id_referencia AS manual_trip_id,
                    cs.status             AS status_caja_viaje,
                    fz.fecha_vencimiento  AS fianza_vence,
                    fz.url_pdf            AS fianza_url
                FROM caja c

                LEFT JOIN trips t
                       ON t.trip_id = (
                            SELECT t2.trip_id
                              FROM trips t2
                             WHERE t2.caja_id = c.caja_id
                               AND t2.status IN ('In Transit', 'Almost Over')
                          ORDER BY t2.creation_date DESC
                             LIMIT 1)

                LEFT JOIN drivers d
                       ON d.driver_id = t.driver_id

                LEFT JOIN trip_stages s
                       ON s.trip_stage_id = (
                            SELECT s2.trip_stage_id
                              FROM trip_stages s2
                             WHERE s2.trip_id = t.trip_id
                               AND (s2.estatus IS NULL OR s2.estatus <> 'Completed')
                          ORDER BY s2.stage_number ASC
                             LIMIT 1)

                LEFT JOIN companies co
                       ON co.company_id = s.company_id

                LEFT JOIN caja_estatus ce
                       ON ce.caja_id = c.caja_id

                -- El último status de caja (Impo / Expo / Vacio) registrado al marcar
                -- Almost Over, para el ÚLTIMO viaje de esta caja, esté cerrado o no.
                LEFT JOIN caja_trips_status cs
                       ON cs.id = (
                            SELECT cs2.id
                              FROM caja_trips_status cs2
                              JOIN trips t3 ON t3.trip_id = cs2.trip_id
                             WHERE t3.caja_id = c.caja_id
                          ORDER BY cs2.id DESC
                             LIMIT 1)

                LEFT JOIN cajas_documents fz
                       ON fz.doc_id = (
                            SELECT f2.doc_id
                              FROM cajas_documents f2
                             WHERE f2.caja_id = c.caja_id
                               AND UPPER(f2.tipo_documento) = 'FIANZA'
                          ORDER BY f2.status DESC, f2.doc_id DESC
                             LIMIT 1)

                WHERE c.status = 1
             ORDER BY c.no_caja
            ";

            $stmt = $db->prepare($sql);
            $stmt->execute();
            $filas = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $hoy = new DateTime('today');
            $cajas = [];

            foreach ($filas as $fila) {
                $enViaje = !empty($fila['trip_id']);

                // Observación automática: manda lo que se reportó al cerrar el viaje;
                // si no hay reporte, un viaje abierto significa cargada.
                if ($fila['status_caja_viaje'] === 'Vacio') {
                    $observacionAuto = 'VACIA';
                } elseif (in_array($fila['status_caja_viaje'], ['Impo', 'Expo'], true)) {
                    $observacionAuto = 'CARGADA';
                } else {
                    $observacionAuto = $enViaje ? 'CARGADA' : 'VACIA';
                }

                // Un viaje en ruta manda sobre el reporte anterior: la caja volvió a salir.
                if ($enViaje && $fila['trip_status'] === 'In Transit') {
                    $observacionAuto = 'CARGADA';
                }

                // Ubicación automática: cargada va en ruta, según la dirección de la
                // etapa en curso; vacía se queda en la pensión.
                $ubicacionAuto = 'PENSION NLD';
                if ($observacionAuto === 'CARGADA') {
                    $ubicacionAuto = ubicacionPorDireccion($fila['direccion']) ?? 'PENSION NLD';
                }

                // Lo manual solo vale mientras la caja siga en el mismo viaje.
                $mismoViaje = (string)($fila['manual_trip_id'] ?? '') === (string)($fila['trip_id'] ?? '');
                $ubicacion  = ($mismoViaje && $fila['ubicacion_manual'])   ? $fila['ubicacion_manual']   : $ubicacionAuto;
                $observacion = ($mismoViaje && $fila['observacion_manual']) ? $fila['observacion_manual'] : $observacionAuto;

                $fianza = null;
                if (!empty($fila['fianza_vence'])) {
                    $vence = new DateTime($fila['fianza_vence']);
                    $fianza = [
                        'fecha_vencimiento' => $fila['fianza_vence'],
                        'url_pdf'           => $fila['fianza_url'],
                        'estado'            => $vence < $hoy ? 'Vencida' : 'Activa',
                    ];
                }

                $cajas[] = [
                    'caja_id'          => (int)$fila['caja_id'],
                    'no_caja'          => $fila['no_caja'],
                    'operador'         => $fila['operador'],
                    'trip_id'          => $fila['trip_id'] ? (int)$fila['trip_id'] : null,
                    'trip_number'      => $fila['trip_number'],
                    'ubicacion'        => $ubicacion,
                    'observacion'      => $observacion,
                    'ubicacion_auto'   => $ubicacionAuto,
                    'observacion_auto' => $observacionAuto,
                    'manual'           => $mismoViaje && ($fila['ubicacion_manual'] || $fila['observacion_manual']),
                    'broker'           => $observacion === 'CARGADA' ? $fila['broker'] : null,
                    'fianza'           => $fianza,
                ];
            }

            echo json_encode(['status' => 'success', 'cajas' => $cajas]);
            break;

        case 'saveEstatusCaja':
            $caja_id     = $_POST['caja_id'] ?? '';
            $ubicacion   = $_POST['ubicacion'] ?? null;
            $observacion = $_POST['observacion'] ?? null;
            $id_usuario  = $_POST['id_usuario'] ?? null;

            if (!filter_var($caja_id, FILTER_VALIDATE_INT)
                || ($ubicacion !== null && $ubicacion !== '' && !in_array($ubicacion, $UBICACIONES, true))
                || ($observacion !== null && $observacion !== '' && !in_array($observacion, $OBSERVACIONES, true))) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Parámetros inválidos: caja_id, ubicacion y observacion.']);
                break;
            }

            // El viaje en turno de esta caja, para saber hasta cuándo vale lo capturado.
            $stmtViaje = $db->prepare("
                SELECT trip_id
                  FROM trips
                 WHERE caja_id = :caja_id
                   AND status IN ('In Transit', 'Almost Over')
              ORDER BY creation_date DESC
                 LIMIT 1
            ");
            $stmtViaje->execute([':caja_id' => $caja_id]);
            $trip_id = $stmtViaje->fetchColumn();
            $trip_id = $trip_id === false ? null : (int)$trip_id;

            $stmt = $db->prepare("
                INSERT INTO caja_estatus (caja_id, ubicacion, observacion, trip_id_referencia, actualizado_por)
                VALUES (:caja_id, :ubicacion, :observacion, :trip_id, :usuario)
                ON DUPLICATE KEY UPDATE
                    ubicacion          = VALUES(ubicacion),
                    observacion        = VALUES(observacion),
                    trip_id_referencia = VALUES(trip_id_referencia),
                    actualizado_por    = VALUES(actualizado_por)
            ");
            $stmt->execute([
                ':caja_id'     => $caja_id,
                ':ubicacion'   => $ubicacion ?: null,
                ':observacion' => $observacion ?: null,
                ':trip_id'     => $trip_id,
                ':usuario'     => $id_usuario ?: null,
            ]);

            echo json_encode(['status' => 'success', 'message' => 'Estatus de la caja guardado']);
            break;

        default:
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Operación no reconocida']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
