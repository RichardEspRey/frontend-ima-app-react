<?php
// Campana · quién recibe cada aviso calculado en el front
//
// getMisCategorias · los avisos a los que está suscrita una persona
// getSuscriptores  · quiénes reciben un aviso
// getDisponibles   · quiénes todavía no lo reciben
// suscribir        · da de alta a alguien en un aviso
// desuscribir      · lo da de baja
//
// Solo lee y escribe `notif_suscriptores` (SQL 010). Los avisos en sí no se
// guardan en el servidor: los arma la app con datos que ya existen.

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

header('Content-Type: application/json');

include_once 'conexion.php';

$CATEGORIAS = [
    'diesel_state',
    'diesel_fleetone',
    'sin_fallas',
    'sin_inspeccion',
    'viaje_programado',
    'viaje_despacho',
    'viaje_documentos',
];

// Las personas que pueden recibir avisos: las cuentas de la oficina, las mismas que
// usan Notifications.php y mtto.php. Los operadores entran por el móvil y no ven la
// campana.
define('PERSONAS_DE_OFICINA', "Users_credentials uc WHERE uc.type <> 'Driver' AND COALESCE(uc.active, 1) = 1");

function personaPublica($fila) {
    return [
        'id' => (string)$fila['id'],
        'name' => $fila['name'] ?? '',
        'user' => $fila['user'] ?? '',
        'subscribed_at' => $fila['subscribed_at'] ?? null,
    ];
}

function fallar($codigo, $mensaje) {
    http_response_code($codigo);
    echo json_encode(['status' => 'error', 'message' => $mensaje]);
    exit();
}

try {
    $conexion = new Conexion();
    $db = $conexion->getConnection();

    $op = $_POST['op'] ?? '';

    if ($op === 'getMisCategorias') {
        $user_id = $_POST['user_id'] ?? '';
        if (!filter_var($user_id, FILTER_VALIDATE_INT)) fallar(400, 'Falta user_id.');

        $stmt = $db->prepare("SELECT categoria FROM notif_suscriptores WHERE user_id = ?");
        $stmt->execute([(int)$user_id]);

        echo json_encode([
            'status' => 'success',
            'categorias' => array_values(array_intersect($stmt->fetchAll(PDO::FETCH_COLUMN), $CATEGORIAS)),
        ]);
        exit();
    }

    $categoria = $_POST['categoria'] ?? '';
    if (!in_array($categoria, $CATEGORIAS, true)) fallar(400, 'Categoría no reconocida.');

    switch ($op) {
        case 'getSuscriptores':
            $stmt = $db->prepare("
                SELECT uc.id, uc.name, uc.user, s.creado_en AS subscribed_at
                  FROM notif_suscriptores s
                  JOIN Users_credentials uc ON uc.id = s.user_id
                 WHERE s.categoria = ?
              ORDER BY uc.name
            ");
            $stmt->execute([$categoria]);
            echo json_encode([
                'status' => 'success',
                'users' => array_map('personaPublica', $stmt->fetchAll(PDO::FETCH_ASSOC)),
            ]);
            break;

        case 'getDisponibles':
            $stmt = $db->prepare("
                SELECT uc.id, uc.name, uc.user
                  FROM " . PERSONAS_DE_OFICINA . "
                   AND uc.id NOT IN (SELECT user_id FROM notif_suscriptores WHERE categoria = ?)
              ORDER BY uc.name
            ");
            $stmt->execute([$categoria]);
            echo json_encode([
                'status' => 'success',
                'users' => array_map('personaPublica', $stmt->fetchAll(PDO::FETCH_ASSOC)),
            ]);
            break;

        case 'suscribir':
            $user_id = $_POST['user_id'] ?? '';
            $id_usuario = $_POST['id_usuario'] ?? null;
            if (!filter_var($user_id, FILTER_VALIDATE_INT)) fallar(400, 'Falta user_id.');

            $stmt = $db->prepare("
                INSERT IGNORE INTO notif_suscriptores (categoria, user_id, creado_por)
                SELECT ?, uc.id, ? FROM " . PERSONAS_DE_OFICINA . " AND uc.id = ?
            ");
            $stmt->execute([
                $categoria,
                filter_var($id_usuario, FILTER_VALIDATE_INT) ? (int)$id_usuario : null,
                (int)$user_id,
            ]);

            echo json_encode(['status' => 'success', 'agregado' => $stmt->rowCount() > 0]);
            break;

        case 'desuscribir':
            $user_id = $_POST['user_id'] ?? '';
            if (!filter_var($user_id, FILTER_VALIDATE_INT)) fallar(400, 'Falta user_id.');

            $stmt = $db->prepare("DELETE FROM notif_suscriptores WHERE categoria = ? AND user_id = ?");
            $stmt->execute([$categoria, (int)$user_id]);

            echo json_encode(['status' => 'success', 'quitado' => $stmt->rowCount() > 0]);
            break;

        default:
            fallar(400, 'Operación no reconocida');
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
