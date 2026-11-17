<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
include_once 'conexion.php';

// ── Avisos calculados en el front · quién recibe cada uno ────────────────────
//
// getMisCategorias · los avisos a los que está suscrita una persona
// getSuscriptores  · quiénes reciben un aviso
// getDisponibles   · quiénes todavía no lo reciben
// suscribir        · da de alta a alguien en un aviso
// desuscribir      · lo da de baja
//
// Solo leen y escriben `notif_suscriptores` (SQL 010). No usan procedimientos ni
// tocan las tablas de los BL. Los avisos en sí no se guardan en el servidor: los
// arma la app con datos que ya existen.

$CATEGORIAS_DE_AVISO = [
    'diesel_state',
    'diesel_fleetone',
    'sin_fallas',
    'sin_inspeccion',
    'viaje_programado',
    'viaje_despacho',
    'viaje_documentos',
];

// Las personas que pueden recibir avisos: las cuentas de la oficina. Los operadores
// entran por el móvil y no ven la campana.
define('PERSONAS_DE_OFICINA', "Users_credentials uc WHERE uc.type <> 'Driver' AND COALESCE(uc.active, 1) = 1");

function personaDeAviso($fila) {
    return [
        'id' => (string)$fila['id'],
        'name' => $fila['name'] ?? '',
        'user' => $fila['user'] ?? '',
        'subscribed_at' => $fila['subscribed_at'] ?? null,
    ];
}

function categoriaDeAviso($categorias) {
    $categoria = $_POST['categoria'] ?? '';
    if (!in_array($categoria, $categorias, true)) {
        throw new Exception("Categoría no reconocida.");
    }
    return $categoria;
}

function usuarioDeAviso() {
    $user_id = $_POST['user_id'] ?? '';
    if (!filter_var($user_id, FILTER_VALIDATE_INT)) {
        throw new Exception("user_id es requerido.");
    }
    return (int)$user_id;
}

$option = $_REQUEST['op'];

switch ($option) {

    // Polling cada 15s (toast). Trae solo lo no entregado y lo marca como recibido
    // en la misma llamada, así nunca se repite en el siguiente poll.
    case 'getNew':
        header("Content-Type: application/json");

        $user_id = $_POST['user_id'] ?? '';

        try {
            $database = new Conexion();
            $db = $database->getConnection();

            $stmt = $db->prepare("CALL sp_notifications_trips_get_new(:user_id)");
            $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
            $stmt->execute();
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $stmt->closeCursor();

            echo json_encode([
                "status" => "success",
                "notifications" => $rows
            ]);
        } catch (Exception $e) {
            echo json_encode([
                "status" => "error",
                "message" => "Error al obtener notificaciones nuevas: " . $e->getMessage()
            ]);
        }

        exit();
    break;

    // Pantalla "ver todas las notificaciones": historial completo ya recibido por el usuario.
    case 'getAll':
        header("Content-Type: application/json");

        $user_id = $_POST['user_id'] ?? '';
        $limit = isset($_POST['limit']) ? (int)$_POST['limit'] : 20;

        try {
            $database = new Conexion();
            $db = $database->getConnection();

            $stmt = $db->prepare("CALL sp_notifications_trips_get_all(:user_id, :limit)");
            $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
            $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $stmt->closeCursor();

            echo json_encode([
                "status" => "success",
                "notifications" => $rows
            ]);
        } catch (Exception $e) {
            echo json_encode([
                "status" => "error",
                "message" => "Error al obtener las notificaciones: " . $e->getMessage()
            ]);
        }

        exit();
    break;

    // Registra un evento de notificación de viaje (llamarlo cuando ocurra la acción,
    // ej. subida de un documento). El mensaje se arma aquí según tipo_accion, para
    // dejar abierto a agregar más acciones sin cambiar el contrato del endpoint.
    case 'create':
        header("Content-Type: application/json");

        $user_id = $_POST['user_id'] ?? '';
        $trip_id = $_POST['trip_id'] ?? '';
        $tipo_accion = $_POST['tipo_accion'] ?? '';

        try {
            if (!$user_id || !$trip_id || !$tipo_accion) {
                throw new Exception("user_id, trip_id y tipo_accion son requeridos.");
            }

            switch ($tipo_accion) {
                case 'documento_subido':
                    $tipo_documento = $_POST['tipo_documento'] ?? 'documento';
                    $mensaje = "Se subió el documento '{$tipo_documento}' en el viaje #{$trip_id}.";
                    break;
                default:
                    throw new Exception("tipo_accion '{$tipo_accion}' no reconocido.");
            }

            $database = new Conexion();
            $db = $database->getConnection();

            $stmt = $db->prepare("CALL sp_notifications_trips_create(:user_id, :trip_id, :mensaje)");
            $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
            $stmt->bindParam(':trip_id', $trip_id, PDO::PARAM_INT);
            $stmt->bindParam(':mensaje', $mensaje, PDO::PARAM_STR);
            $stmt->execute();
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $stmt->closeCursor();

            echo json_encode([
                "status" => "success",
                "notification_id" => $row['notification_id'] ?? null
            ]);
        } catch (Exception $e) {
            echo json_encode([
                "status" => "error",
                "message" => "Error al registrar la notificación: " . $e->getMessage()
            ]);
        }

        exit();
    break;

    // Alta/reactivación de un usuario como suscriptor de notificaciones de viajes.
    case 'subscribe':
        header("Content-Type: application/json");

        $user_id = $_POST['user_id'] ?? '';

        try {
            if (!$user_id) throw new Exception("user_id es requerido.");

            $database = new Conexion();
            $db = $database->getConnection();

            $stmt = $db->prepare("CALL sp_notifications_trips_subscribe(:user_id)");
            $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
            $stmt->execute();
            $stmt->closeCursor();

            echo json_encode(["status" => "success"]);
        } catch (Exception $e) {
            echo json_encode([
                "status" => "error",
                "message" => "Error al suscribir al usuario: " . $e->getMessage()
            ]);
        }

        exit();
    break;

    // Baja de un suscriptor (no se borra el registro, solo se desactiva).
    case 'unsubscribe':
        header("Content-Type: application/json");

        $user_id = $_POST['user_id'] ?? '';

        try {
            if (!$user_id) throw new Exception("user_id es requerido.");

            $database = new Conexion();
            $db = $database->getConnection();

            $stmt = $db->prepare("CALL sp_notifications_trips_unsubscribe(:user_id)");
            $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
            $stmt->execute();
            $stmt->closeCursor();

            echo json_encode(["status" => "success"]);
        } catch (Exception $e) {
            echo json_encode([
                "status" => "error",
                "message" => "Error al dar de baja al usuario: " . $e->getMessage()
            ]);
        }

        exit();
    break;

    // Notifications Manager: usuarios actualmente suscritos a notificaciones de viajes.
    case 'getSubscribers':
        header("Content-Type: application/json");

        try {
            $database = new Conexion();
            $db = $database->getConnection();

            $stmt = $db->prepare("CALL sp_notifications_trips_get_subscribers()");
            $stmt->execute();
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $stmt->closeCursor();

            echo json_encode([
                "status" => "success",
                "users" => $rows
            ]);
        } catch (Exception $e) {
            echo json_encode([
                "status" => "error",
                "message" => "Error al obtener suscriptores: " . $e->getMessage()
            ]);
        }

        exit();
    break;

    // Notifications Manager: candidatos para el diálogo "Agregar usuario"
    // (usuarios activos, sin driver_id, que aún no están suscritos).
    case 'getAvailableUsers':
        header("Content-Type: application/json");

        try {
            $database = new Conexion();
            $db = $database->getConnection();

            $stmt = $db->prepare("CALL sp_notifications_trips_get_available_users()");
            $stmt->execute();
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $stmt->closeCursor();

            echo json_encode([
                "status" => "success",
                "users" => $rows
            ]);
        } catch (Exception $e) {
            echo json_encode([
                "status" => "error",
                "message" => "Error al obtener usuarios disponibles: " . $e->getMessage()
            ]);
        }

        exit();
    break;

    // ── Avisos calculados en el front ────────────────────────────────────────

    // Campana: a qué avisos está suscrita la persona.
    case 'getMisCategorias':
        header("Content-Type: application/json");

        try {
            $user_id = usuarioDeAviso();

            $database = new Conexion();
            $db = $database->getConnection();

            $stmt = $db->prepare("SELECT categoria FROM notif_suscriptores WHERE user_id = ?");
            $stmt->execute([$user_id]);

            echo json_encode([
                "status" => "success",
                "categorias" => array_values(array_intersect($stmt->fetchAll(PDO::FETCH_COLUMN), $CATEGORIAS_DE_AVISO))
            ]);
        } catch (Exception $e) {
            echo json_encode([
                "status" => "error",
                "message" => "Error al obtener los avisos del usuario: " . $e->getMessage()
            ]);
        }

        exit();
    break;

    // Notifications Manager: quiénes reciben un aviso.
    case 'getSuscriptores':
        header("Content-Type: application/json");

        try {
            $categoria = categoriaDeAviso($CATEGORIAS_DE_AVISO);

            $database = new Conexion();
            $db = $database->getConnection();

            $stmt = $db->prepare("
                SELECT uc.id, uc.name, uc.user, s.creado_en AS subscribed_at
                  FROM notif_suscriptores s
                  JOIN Users_credentials uc ON uc.id = s.user_id
                 WHERE s.categoria = ?
              ORDER BY uc.name
            ");
            $stmt->execute([$categoria]);

            echo json_encode([
                "status" => "success",
                "users" => array_map('personaDeAviso', $stmt->fetchAll(PDO::FETCH_ASSOC))
            ]);
        } catch (Exception $e) {
            echo json_encode([
                "status" => "error",
                "message" => "Error al obtener suscriptores del aviso: " . $e->getMessage()
            ]);
        }

        exit();
    break;

    // Notifications Manager: quiénes todavía no reciben un aviso.
    case 'getDisponibles':
        header("Content-Type: application/json");

        try {
            $categoria = categoriaDeAviso($CATEGORIAS_DE_AVISO);

            $database = new Conexion();
            $db = $database->getConnection();

            $stmt = $db->prepare("
                SELECT uc.id, uc.name, uc.user
                  FROM " . PERSONAS_DE_OFICINA . "
                   AND uc.id NOT IN (SELECT user_id FROM notif_suscriptores WHERE categoria = ?)
              ORDER BY uc.name
            ");
            $stmt->execute([$categoria]);

            echo json_encode([
                "status" => "success",
                "users" => array_map('personaDeAviso', $stmt->fetchAll(PDO::FETCH_ASSOC))
            ]);
        } catch (Exception $e) {
            echo json_encode([
                "status" => "error",
                "message" => "Error al obtener usuarios disponibles del aviso: " . $e->getMessage()
            ]);
        }

        exit();
    break;

    // Alta de una persona en un aviso.
    case 'suscribir':
        header("Content-Type: application/json");

        try {
            $categoria = categoriaDeAviso($CATEGORIAS_DE_AVISO);
            $user_id = usuarioDeAviso();
            $id_usuario = $_POST['id_usuario'] ?? null;

            $database = new Conexion();
            $db = $database->getConnection();

            $stmt = $db->prepare("
                INSERT IGNORE INTO notif_suscriptores (categoria, user_id, creado_por)
                SELECT ?, uc.id, ? FROM " . PERSONAS_DE_OFICINA . " AND uc.id = ?
            ");
            $stmt->execute([
                $categoria,
                filter_var($id_usuario, FILTER_VALIDATE_INT) ? (int)$id_usuario : null,
                $user_id,
            ]);

            echo json_encode(["status" => "success", "agregado" => $stmt->rowCount() > 0]);
        } catch (Exception $e) {
            echo json_encode([
                "status" => "error",
                "message" => "Error al suscribir al aviso: " . $e->getMessage()
            ]);
        }

        exit();
    break;

    // Baja de una persona de un aviso.
    case 'desuscribir':
        header("Content-Type: application/json");

        try {
            $categoria = categoriaDeAviso($CATEGORIAS_DE_AVISO);
            $user_id = usuarioDeAviso();

            $database = new Conexion();
            $db = $database->getConnection();

            $stmt = $db->prepare("DELETE FROM notif_suscriptores WHERE categoria = ? AND user_id = ?");
            $stmt->execute([$categoria, $user_id]);

            echo json_encode(["status" => "success", "quitado" => $stmt->rowCount() > 0]);
        } catch (Exception $e) {
            echo json_encode([
                "status" => "error",
                "message" => "Error al dar de baja del aviso: " . $e->getMessage()
            ]);
        }

        exit();
    break;

  }

?>
