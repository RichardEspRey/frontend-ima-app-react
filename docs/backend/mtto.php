<?php
// Mantenimiento · inspecciones, puntos y reparaciones pendientes
//
// getInspecciones   · las inspecciones de un lado, con lo que REALMENTE hay que atender
// getPuntos         · los puntos de una inspección, con el estado de cada uno
// resolverPuntos    · manda puntos a pendientes o los descarta
// getPendientes     · las reparaciones pendientes, por unidad
// crearPendiente    · levanta una reparación a mano, sin inspección de por medio
// completarLado     · cierra el lado de camión o de caja de una inspección
// crearOrden        · levanta la orden de servicio con un servicio por punto
// ligarGasto        · amarra un gasto ya creado con el concepto de la orden (reparación)
//
// No escribe en ninguna tabla del checklist del operador ni en `cl_final`: lo que él
// reportó queda como lo escribió. El estado vive en `mtto_puntos` y en
// `mtto_inspeccion_lado`.

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

define('LARGO_DESCRIPCION', 250);

// Desde cuándo trabaja esta pantalla. Todo lo anterior se da por cerrado: lo atendió
// la pantalla de Inspección final, que sigue viva mientras la oficina se cambia de
// una a otra. `cl_final.status` no sirve para esto: vale 1 en las 248 inspecciones
// porque lo pone el móvil al enviarlas, no la oficina al revisarlas.
//
// EL DÍA QUE SE LIBERE: poner aquí esa fecha y volver a subir el archivo. Lo de antes
// queda consultable en la pestaña de Completadas, con todos sus puntos. Mientras
// tanto está en una fecha reciente para poder probar con inspecciones de verdad.
define('MTTO_CORTE', '2026-09-25');

// Los rubros del checklist, con su tabla y de qué unidad habla cada uno.
$RUBROS = [
    ['clave' => 'motor',      'etiqueta' => 'Motor',      'tabla' => 'cl_motor',      'unidad' => 'camion'],
    ['clave' => 'exterior',   'etiqueta' => 'Exterior',   'tabla' => 'cl_exterior',   'unidad' => 'camion'],
    ['clave' => 'neumaticos', 'etiqueta' => 'Neumaticos', 'tabla' => 'cl_neumaticos', 'unidad' => 'camion'],
    ['clave' => 'cabina',     'etiqueta' => 'Cabina',     'tabla' => 'cl_cabina',     'unidad' => 'camion'],
    ['clave' => 'otro',       'etiqueta' => 'Otro',       'tabla' => 'cl_otro',       'unidad' => 'camion'],
    ['clave' => 'remolque',   'etiqueta' => 'Remolque',   'tabla' => 'cl_remolque',   'unidad' => 'caja'],
];

// Lo que el operador escribe cuando no hay nada que reparar. Son 64 de cada 145 puntos
// que manda: contarlos como trabajo es lo que hacía que la lista pareciera el doble de
// larga de lo que es. La colación de la base no distingue mayúsculas, así que basta con
// recortar espacios y puntos finales.
$SIN_FALLA = [
    '', 'ok', 'okay', 'o.k', 'bien', 'todo bien', 'todo ok', 'buen estado', 'en buen estado',
    'buenas condiciones', 'todo en orden', 'sin novedad', 'sin novedades', 'sin fallas',
    'sin falla', 'correcto', 'na', 'n/a', 'ninguna', 'ninguno', 'nada', 'no aplica',
];

// La expresión que decide si un renglón del checklist es trabajo o es "todo bien".
function filtroConFalla($columna = 'contenido') {
    return "TRIM(TRAILING '.' FROM TRIM(COALESCE({$columna}, ''))) NOT IN (" .
        implode(',', array_fill(0, count($GLOBALS['SIN_FALLA']), '?')) . ")";
}

function rubrosDeLado($lado) {
    return array_values(array_filter($GLOBALS['RUBROS'], function ($rubro) use ($lado) {
        return $lado === 'caja' ? $rubro['unidad'] === 'caja' : $rubro['unidad'] === 'camion';
    }));
}

try {
    $database = new Conexion();
    $db = $database->getConnection();

    switch ($op) {

        case 'getInspecciones':
            // Una fila por inspección que tenga algo que atender de este lado. El conteo
            // sale ya filtrado: es el número de puntos reales, no de renglones.
            $lado = ($_POST['lado'] ?? 'camion') === 'caja' ? 'caja' : 'camion';
            $rubros = rubrosDeLado($lado);

            // Dos conteos por rubro: lo que falta por atender y lo que el operador
            // reportó en total. El segundo es el que decide si la inspección se ve:
            // una con todo resuelto pero sin cerrar tiene que seguir en la lista para
            // que alguien le dé "Completar lado".
            $abiertos = [];
            $totales = [];
            $parametros = [];
            foreach ($rubros as $rubro) {
                $abiertos[] = "(SELECT COUNT(*) FROM {$rubro['tabla']} r
                            LEFT JOIN mtto_puntos m ON m.origen_tabla = ? AND m.origen_id = r.id
                                WHERE r.viaje_id = c.viaje_id AND " . filtroConFalla('r.contenido') . "
                                  AND COALESCE(m.estatus, 'sin_resolver') = 'sin_resolver')";
                $parametros = array_merge($parametros, [$rubro['tabla']], $SIN_FALLA);
            }
            foreach ($rubros as $rubro) {
                $totales[] = "(SELECT COUNT(*) FROM {$rubro['tabla']} r
                                WHERE r.viaje_id = c.viaje_id AND " . filtroConFalla('r.contenido') . ")";
                $parametros = array_merge($parametros, $SIN_FALLA);
            }
            $suma = implode(' + ', $abiertos);
            $sumaTotal = implode(' + ', $totales);

            $sql = "
                SELECT
                    c.id                AS cl_final_id,
                    c.viaje_id,
                    c.status            AS status_viejo,
                    c.fecha_creacion,
                    c.truck_id,
                    tr.unidad           AS no_camion,
                    t.trip_number,
                    t.country_code,
                    t.trip_year,
                    t.caja_id,
                    cj.no_caja,
                    d.nombre            AS operador,
                    ({$suma})           AS por_atender,
                    ({$sumaTotal})      AS reportados,
                    COALESCE(l.estatus, IF(c.fecha_creacion < ?, 'completada', 'pendiente')) AS estatus_lado
                  FROM cl_final c
             LEFT JOIN trips   t  ON t.trip_id  = c.viaje_id
             LEFT JOIN trucks  tr ON tr.truck_id = c.truck_id
             LEFT JOIN caja    cj ON cj.caja_id  = t.caja_id
             LEFT JOIN drivers d  ON d.driver_id = c.driver_id
             LEFT JOIN mtto_inspeccion_lado l ON l.cl_final_id = c.id AND l.lado = ?
                HAVING reportados > 0
              ORDER BY c.id DESC
            ";

            $stmt = $db->prepare($sql);
            $stmt->execute(array_merge($parametros, [MTTO_CORTE, $lado]));

            echo json_encode([
                'status' => 'success',
                'lado' => $lado,
                'inspecciones' => $stmt->fetchAll(PDO::FETCH_ASSOC),
            ]);
            break;

        case 'getPuntos':
            // Los puntos de un lado de la inspección, con el estado que ya tengan. Los
            // que nunca se tocaron salen como sin_resolver sin existir todavía en
            // `mtto_puntos`: solo se escriben cuando la oficina decide algo con ellos.
            $viaje_id = $_POST['viaje_id'] ?? '';
            $lado = ($_POST['lado'] ?? 'camion') === 'caja' ? 'caja' : 'camion';

            if (!filter_var($viaje_id, FILTER_VALIDATE_INT)) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Falta viaje_id.']);
                break;
            }

            $puntos = [];
            foreach (rubrosDeLado($lado) as $rubro) {
                $sql = "SELECT p.id, p.contenido, p.fecha_creacion,
                               m.id AS punto_id, m.estatus, m.id_orden, m.descripcion AS descripcion_trabajada
                          FROM {$rubro['tabla']} p
                     LEFT JOIN mtto_puntos m ON m.origen_tabla = ? AND m.origen_id = p.id
                         WHERE p.viaje_id = ? AND " . filtroConFalla('p.contenido') . "
                      ORDER BY p.id";

                $stmt = $db->prepare($sql);
                $stmt->execute(array_merge([$rubro['tabla'], $viaje_id], $SIN_FALLA));

                foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $fila) {
                    $puntos[] = [
                        'categoria'    => $rubro['etiqueta'],
                        'rubro'        => $rubro['clave'],
                        'origen_tabla' => $rubro['tabla'],
                        'origen_id'    => (int)$fila['id'],
                        'texto'        => $fila['descripcion_trabajada'] ?: $fila['contenido'],
                        'texto_original' => $fila['contenido'],
                        'unidad_tipo'  => $rubro['unidad'],
                        'punto_id'     => $fila['punto_id'] ? (int)$fila['punto_id'] : null,
                        'estatus'      => $fila['estatus'] ?: 'sin_resolver',
                        'id_orden'     => $fila['id_orden'],
                    ];
                }
            }

            echo json_encode(['status' => 'success', 'lado' => $lado, 'puntos' => $puntos]);
            break;

        case 'resolverPuntos':
            // Mandar a pendientes o descartar. Es idempotente por renglón del checklist:
            // si el punto ya existía, se le cambia el estado en vez de duplicarlo.
            $items = json_decode($_POST['items'] ?? '', true);
            $estatus = $_POST['estatus'] ?? '';
            $id_usuario = $_POST['id_usuario'] ?? null;

            if (!is_array($items) || count($items) === 0 || !in_array($estatus, ['en_pendientes', 'descartado', 'sin_resolver'], true)) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Parámetros inválidos: items y estatus.']);
                break;
            }

            $stmt = $db->prepare("
                INSERT INTO mtto_puntos
                    (origen, cl_final_id, viaje_id, categoria, origen_tabla, origen_id,
                     unidad_tipo, truck_id, caja_id, descripcion, estatus, creado_por)
                VALUES
                    ('inspeccion', :cl_final_id, :viaje_id, :categoria, :origen_tabla, :origen_id,
                     :unidad_tipo, :truck_id, :caja_id, :descripcion, :estatus, :usuario)
                ON DUPLICATE KEY UPDATE
                    estatus = VALUES(estatus),
                    descripcion = VALUES(descripcion),
                    actualizado_por = VALUES(creado_por)
            ");

            $tocados = 0;
            foreach ($items as $item) {
                $descripcion = trim($item['descripcion'] ?? '');
                $unidad_tipo = ($item['unidad_tipo'] ?? '') === 'caja' ? 'caja' : 'camion';
                if ($descripcion === '') continue;

                $stmt->execute([
                    ':cl_final_id'  => $item['cl_final_id'] ?? null,
                    ':viaje_id'     => $item['viaje_id'] ?? null,
                    ':categoria'    => $item['categoria'] ?? null,
                    ':origen_tabla' => $item['origen_tabla'] ?? null,
                    ':origen_id'    => $item['origen_id'] ?? null,
                    ':unidad_tipo'  => $unidad_tipo,
                    ':truck_id'     => $unidad_tipo === 'camion' ? ($item['truck_id'] ?? null) : null,
                    ':caja_id'      => $unidad_tipo === 'caja'   ? ($item['caja_id'] ?? null)   : null,
                    ':descripcion'  => mb_substr($descripcion, 0, LARGO_DESCRIPCION),
                    ':estatus'      => $estatus,
                    ':usuario'      => $id_usuario ?: null,
                ]);
                $tocados++;
            }

            echo json_encode(['status' => 'success', 'resueltos' => $tocados]);
            break;

        case 'getPendientes':
            $unidad_tipo = $_POST['unidad_tipo'] ?? '';

            $sql = "
                SELECT p.id, p.origen, p.categoria, p.descripcion, p.estatus, p.unidad_tipo,
                       p.truck_id, p.caja_id, p.viaje_id, p.creado_en,
                       tr.unidad AS no_camion, c.no_caja, t.trip_number
                  FROM mtto_puntos p
             LEFT JOIN trucks tr ON tr.truck_id = p.truck_id
             LEFT JOIN caja   c  ON c.caja_id   = p.caja_id
             LEFT JOIN trips  t  ON t.trip_id   = p.viaje_id
                 WHERE p.estatus = 'en_pendientes'
            ";

            $parametros = [];
            if ($unidad_tipo === 'camion' || $unidad_tipo === 'caja') {
                $sql .= " AND p.unidad_tipo = ?";
                $parametros[] = $unidad_tipo;
            }
            $sql .= " ORDER BY p.unidad_tipo, COALESCE(tr.unidad, c.no_caja), p.creado_en";

            $stmt = $db->prepare($sql);
            $stmt->execute($parametros);

            echo json_encode(['status' => 'success', 'pendientes' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
            break;

        case 'crearPendiente':
            $unidad_tipo = ($_POST['unidad_tipo'] ?? '') === 'caja' ? 'caja' : 'camion';
            $descripcion = trim($_POST['descripcion'] ?? '');
            $unidad_id = $_POST['unidad_id'] ?? '';
            $id_usuario = $_POST['id_usuario'] ?? null;

            if ($descripcion === '' || !filter_var($unidad_id, FILTER_VALIDATE_INT)) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Faltan la unidad y la descripción.']);
                break;
            }

            $stmt = $db->prepare("
                INSERT INTO mtto_puntos
                    (origen, unidad_tipo, truck_id, caja_id, descripcion, estatus, creado_por)
                VALUES
                    ('manual', :unidad_tipo, :truck_id, :caja_id, :descripcion, 'en_pendientes', :usuario)
            ");
            $stmt->execute([
                ':unidad_tipo' => $unidad_tipo,
                ':truck_id'    => $unidad_tipo === 'camion' ? (int)$unidad_id : null,
                ':caja_id'     => $unidad_tipo === 'caja'   ? (int)$unidad_id : null,
                ':descripcion' => mb_substr($descripcion, 0, LARGO_DESCRIPCION),
                ':usuario'     => $id_usuario ?: null,
            ]);

            echo json_encode(['status' => 'success', 'id' => (int)$db->lastInsertId()]);
            break;

        case 'completarLado':
            // Solo se puede cerrar el lado si ya no queda nada sin resolver. La cuenta se
            // hace aquí y no en la pantalla: es la regla, no una validación de forma.
            $cl_final_id = $_POST['cl_final_id'] ?? '';
            $viaje_id = $_POST['viaje_id'] ?? '';
            $lado = ($_POST['lado'] ?? 'camion') === 'caja' ? 'caja' : 'camion';
            $id_usuario = $_POST['id_usuario'] ?? null;

            if (!filter_var($cl_final_id, FILTER_VALIDATE_INT) || !filter_var($viaje_id, FILTER_VALIDATE_INT)) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Faltan cl_final_id y viaje_id.']);
                break;
            }

            $faltan = 0;
            foreach (rubrosDeLado($lado) as $rubro) {
                $sql = "SELECT COUNT(*)
                          FROM {$rubro['tabla']} p
                     LEFT JOIN mtto_puntos m ON m.origen_tabla = ? AND m.origen_id = p.id
                         WHERE p.viaje_id = ?
                           AND " . filtroConFalla('p.contenido') . "
                           AND (m.id IS NULL OR m.estatus = 'sin_resolver')";
                $stmt = $db->prepare($sql);
                $stmt->execute(array_merge([$rubro['tabla'], $viaje_id], $SIN_FALLA));
                $faltan += (int)$stmt->fetchColumn();
            }

            if ($faltan > 0) {
                http_response_code(409);
                echo json_encode([
                    'status' => 'error',
                    'message' => "Quedan {$faltan} punto(s) sin resolver en este lado.",
                    'faltan' => $faltan,
                ]);
                break;
            }

            $stmt = $db->prepare("
                INSERT INTO mtto_inspeccion_lado (cl_final_id, viaje_id, lado, estatus, completada_en, completada_por)
                VALUES (:cl_final_id, :viaje_id, :lado, 'completada', current_timestamp(), :usuario)
                ON DUPLICATE KEY UPDATE
                    estatus = 'completada',
                    completada_en = current_timestamp(),
                    completada_por = VALUES(completada_por)
            ");
            $stmt->execute([
                ':cl_final_id' => (int)$cl_final_id,
                ':viaje_id'    => $viaje_id,
                ':lado'        => $lado,
                ':usuario'     => $id_usuario ?: null,
            ]);

            echo json_encode(['status' => 'success']);
            break;

        case 'crearOrden':
            // Un servicio por punto, como lo pidió operaciones: la orden agrupa, pero
            // cada reparación se sigue por separado. Los conceptos son gastos capturados
            // a mano, sin pasar por el inventario.
            //
            // Vive aquí y no en `service_order.php` a propósito: aquel archivo sigue
            // atendiendo la pantalla vieja con su descuento de inventario, y no se toca.
            $unidad_tipo = ($_POST['unidad_tipo'] ?? '') === 'caja' ? 'caja' : 'camion';
            $unidad_id = $_POST['unidad_id'] ?? '';
            $fecha = $_POST['fecha'] ?? date('Y-m-d');
            $servicios = json_decode($_POST['servicios'] ?? '[]', true);
            $id_usuario = $_POST['id_usuario'] ?? null;

            $tipo_cambio = $_POST['tipo_cambio'] ?? null;
            if ($tipo_cambio !== null) {
                $tipo_cambio = str_replace(',', '.', trim((string)$tipo_cambio));
                $tipo_cambio = is_numeric($tipo_cambio) ? (float)$tipo_cambio : null;
            }

            if (!filter_var($unidad_id, FILTER_VALIDATE_INT) || !is_array($servicios) || count($servicios) === 0) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Faltan la unidad o los servicios.']);
                break;
            }

            try {
                $db->beginTransaction();

                $stmt = $db->prepare("
                    INSERT INTO ordenes_servicio (fecha_orden, truck_id, caja_id, tipo_cambio)
                    VALUES (?, ?, ?, ?)
                ");
                $stmt->execute([
                    $fecha,
                    $unidad_tipo === 'camion' ? (int)$unidad_id : null,
                    $unidad_tipo === 'caja'   ? (int)$unidad_id : null,
                    $tipo_cambio,
                ]);
                $id_orden = (int)$db->lastInsertId();

                $stmtServicio = $db->prepare("
                    INSERT INTO servicios_orden (id_orden, tipo_mantenimiento, origen_servicio, tipo_reparacion)
                    VALUES (?, ?, ?, ?)
                ");
                $stmtDetalle = $db->prepare("
                    INSERT INTO orden_servicio_detalles (id_servicio, id_articulo, tipo_detalle, descripcion, cantidad, costo)
                    VALUES (?, NULL, ?, ?, ?, ?)
                ");
                $stmtConcepto = $db->prepare("
                    INSERT INTO mtto_concepto_detalle (id_detalle, categoria, id_gasto) VALUES (?, ?, ?)
                ");
                $stmtPuntoNuevo = $db->prepare("
                    INSERT INTO mtto_puntos
                        (origen, cl_final_id, viaje_id, categoria, origen_tabla, origen_id,
                         unidad_tipo, truck_id, caja_id, descripcion, estatus, id_orden, id_servicio, creado_por)
                    VALUES
                        ('inspeccion', :cl_final_id, :viaje_id, :categoria, :origen_tabla, :origen_id,
                         :unidad_tipo, :truck_id, :caja_id, :descripcion, 'con_orden', :id_orden, :id_servicio, :usuario)
                    ON DUPLICATE KEY UPDATE
                        estatus = 'con_orden',
                        descripcion = VALUES(descripcion),
                        id_orden = VALUES(id_orden),
                        id_servicio = VALUES(id_servicio),
                        actualizado_por = VALUES(creado_por)
                ");
                $stmtPuntoExistente = $db->prepare("
                    UPDATE mtto_puntos
                       SET estatus = 'con_orden', id_orden = ?, id_servicio = ?,
                           descripcion = ?, actualizado_por = ?
                     WHERE id = ?
                ");

                $detallesCreados = [];
                foreach ($servicios as $iServicio => $servicio) {
                    $tipo_reparacion = trim($servicio['tipo_reparacion'] ?? '');
                    if ($tipo_reparacion === '') {
                        throw new Exception('Hay un servicio sin tipo de reparación.');
                    }

                    $stmtServicio->execute([
                        $id_orden,
                        $servicio['tipo_mantenimiento'] ?? 'Correctivo',
                        $servicio['origen_servicio'] ?? 'Interno',
                        mb_substr($tipo_reparacion, 0, 100),
                    ]);
                    $id_servicio = (int)$db->lastInsertId();

                    $mano_obra = (float)($servicio['costo_mano_obra'] ?? 0);
                    if ($mano_obra > 0) {
                        $stmtDetalle->execute([$id_servicio, 'Mano de Obra', 'Mano de Obra', 1, $mano_obra]);
                    }

                    // Los conceptos llegan agrupados por gasto: un servicio puede
                    // llevar varios, cada uno con su propio ticket y su comprobante.
                    foreach (($servicio['gastos'] ?? []) as $iGasto => $gasto) {
                        foreach (($gasto['conceptos'] ?? []) as $iConcepto => $concepto) {
                            $descripcion = trim($concepto['descripcion'] ?? '');
                            $cantidad = (float)($concepto['cantidad'] ?? 0);
                            $precio = (float)($concepto['precio_unitario'] ?? 0);
                            if ($descripcion === '' || $cantidad <= 0) continue;

                            $stmtDetalle->execute([$id_servicio, 'Gasto', $descripcion, $cantidad, $precio]);
                            $id_detalle = (int)$db->lastInsertId();
                            $stmtConcepto->execute([
                                $id_detalle,
                                $concepto['categoria_label'] ?? null,
                                $gasto['id_gasto'] ?? null,
                            ]);

                            $detallesCreados[] = [
                                'servicio' => $iServicio,
                                'gasto'    => $iGasto,
                                'concepto' => $iConcepto,
                                'id_detalle' => $id_detalle,
                            ];
                        }
                    }

                    if (!empty($servicio['punto_id'])) {
                        $stmtPuntoExistente->execute([
                            $id_orden, $id_servicio, mb_substr($tipo_reparacion, 0, LARGO_DESCRIPCION),
                            $id_usuario ?: null, (int)$servicio['punto_id'],
                        ]);
                    } elseif (!empty($servicio['punto'])) {
                        $punto = $servicio['punto'];
                        $stmtPuntoNuevo->execute([
                            ':cl_final_id'  => $punto['cl_final_id'] ?? null,
                            ':viaje_id'     => $punto['viaje_id'] ?? null,
                            ':categoria'    => $punto['categoria'] ?? null,
                            ':origen_tabla' => $punto['origen_tabla'] ?? null,
                            ':origen_id'    => $punto['origen_id'] ?? null,
                            ':unidad_tipo'  => $unidad_tipo,
                            ':truck_id'     => $unidad_tipo === 'camion' ? (int)$unidad_id : null,
                            ':caja_id'      => $unidad_tipo === 'caja'   ? (int)$unidad_id : null,
                            ':descripcion'  => mb_substr($tipo_reparacion, 0, LARGO_DESCRIPCION),
                            ':id_orden'     => $id_orden,
                            ':id_servicio'  => $id_servicio,
                            ':usuario'      => $id_usuario ?: null,
                        ]);
                    }
                }

                $db->commit();
                echo json_encode([
                    'status' => 'success',
                    'id_orden' => $id_orden,
                    'conceptos' => $detallesCreados,
                ]);
            } catch (Exception $e) {
                if ($db->inTransaction()) $db->rollBack();
                http_response_code(500);
                echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
            }
            break;

        case 'ligarGasto':
            // El gasto se crea por `save_expense.php`, que es quien sabe de monedas,
            // tipo de cambio y comprobantes. Aquí solo se guarda de qué concepto de la
            // orden salió, para poder ir de uno al otro.
            $ligas = json_decode($_POST['ligas'] ?? '', true);

            if (!is_array($ligas) || count($ligas) === 0) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'No se recibió ninguna liga.']);
                break;
            }

            $stmt = $db->prepare("UPDATE mtto_concepto_detalle SET id_gasto = ? WHERE id_detalle = ?");
            $ligados = 0;
            foreach ($ligas as $liga) {
                if (empty($liga['id_detalle']) || empty($liga['id_gasto'])) continue;
                $stmt->execute([(int)$liga['id_gasto'], (int)$liga['id_detalle']]);
                $ligados++;
            }

            echo json_encode(['status' => 'success', 'ligados' => $ligados]);
            break;

        default:
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Operación no reconocida']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
