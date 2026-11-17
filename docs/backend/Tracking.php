<?php
// Mapa · posición de las unidades (Wialon) con su dirección
//
// Responde lo mismo que antes: { status, units }, cada unidad como la manda Wialon
// más `address`. Lo que cambia es cuánto trabaja para responder:
//
//   1. La respuesta completa se guarda 45 segundos. Quien pregunte dentro de ese
//      margen recibe la guardada, sin tocar Wialon ni el servicio de direcciones.
//      Dos mapas abiertos ya no son dos consultas.
//   2. Las direcciones se guardan 7 días por coordenada redondeada (~110 m). Un
//      camión estacionado no vuelve a consultarse.
//   3. Se consultan como mucho 4 direcciones nuevas por actualización, con un
//      segundo entre una y otra, que es lo que pide Nominatim. Antes se consultaba
//      una por camión, seguidas, en cada petición, y el «caché» era una variable
//      que se borraba al terminar: nunca guardó nada.
//   4. Si el servicio de direcciones falla dos veces seguidas se deja de intentar
//      media hora. El 2026-11-17 las 12 unidades salían «Unknown address» y cada
//      petición perdía ~6 s esperando esos fallos.
//
// Cuando no hay dirección, `address` va vacío en vez de «Unknown address», para que
// el mapa muestre las coordenadas en su lugar.
//
// Los archivos de caché viven en la carpeta temporal del sistema, fuera de la web.
// Si se borran no pasa nada: se vuelven a armar.

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit();
}

header("Content-Type: application/json");

define('VIGENCIA_RESPUESTA', 45);               // segundos
define('VIGENCIA_DIRECCION', 7 * 24 * 3600);    // segundos
define('MAX_DIRECCIONES_NUEVAS', 4);            // por actualización
define('PAUSA_ENTRE_DIRECCIONES', 1100000);     // microsegundos
define('PAUSA_SI_FALLA', 30 * 60);              // segundos sin intentar tras dos fallos
define('DECIMALES_DIRECCION', 3);

$carpeta = rtrim(sys_get_temp_dir(), '/\\');
$sufijo = substr(md5(__DIR__), 0, 10);
define('ARCHIVO_RESPUESTA', "{$carpeta}/ima_tracking_{$sufijo}_respuesta.json");
define('ARCHIVO_DIRECCIONES', "{$carpeta}/ima_tracking_{$sufijo}_direcciones.json");
define('ARCHIVO_CANDADO', "{$carpeta}/ima_tracking_{$sufijo}.lock");

function leerJson($archivo) {
    $texto = @file_get_contents($archivo);
    if ($texto === false || $texto === '') return null;
    $datos = json_decode($texto, true);
    return is_array($datos) ? $datos : null;
}

// Escribe a un archivo aparte y lo renombra: nadie lee un archivo a medias.
function guardarJson($archivo, $datos) {
    $temporal = $archivo . '.' . getmypid() . '.tmp';
    if (@file_put_contents($temporal, json_encode($datos)) === false) return;
    @rename($temporal, $archivo);
}

function respuestaGuardada($soloVigente) {
    // PHP recuerda la fecha del archivo durante la petición; sin esto, quien esperó
    // el candado seguiría viendo la fecha vieja.
    clearstatcache(true, ARCHIVO_RESPUESTA);
    $edad = @filemtime(ARCHIVO_RESPUESTA);
    if ($edad === false) return null;
    if ($soloVigente && (time() - $edad) >= VIGENCIA_RESPUESTA) return null;
    $texto = @file_get_contents(ARCHIVO_RESPUESTA);
    return ($texto === false || $texto === '') ? null : $texto;
}

function claveDeCoordenada($lat, $lon) {
    return round((float)$lat, DECIMALES_DIRECCION) . ',' . round((float)$lon, DECIMALES_DIRECCION);
}

// Devuelve la dirección, o null si el servicio no respondió.
function consultarDireccion($lat, $lon) {
    $url = "https://nominatim.openstreetmap.org/reverse?lat={$lat}&lon={$lon}&format=json&zoom=18&addressdetails=1";
    $contexto = stream_context_create([
        "http" => [
            "header" => "User-Agent: IMAExpress-Tracking/1.1 (imaexpressllc.com)\r\n",
            "timeout" => 4,
        ],
    ]);

    $json = @file_get_contents($url, false, $contexto);
    if (!$json) return null;

    $datos = json_decode($json, true);
    $direccion = is_array($datos) ? ($datos["display_name"] ?? null) : null;
    return (is_string($direccion) && $direccion !== '') ? $direccion : null;
}

// ── 1 · Si hay una respuesta reciente, se entrega y se acaba ─────────────────

$reciente = respuestaGuardada(true);
if ($reciente !== null) {
    echo $reciente;
    exit();
}

// ── 2 · Solo una petición a la vez arma la respuesta nueva ───────────────────
//
// Las demás, si ya hay una respuesta anterior, se la llevan sin esperar. Si no hay
// ninguna (primera vez), esperan a que la primera termine.

$candado = @fopen(ARCHIVO_CANDADO, 'c');
$tengoCandado = false;

if ($candado) {
    $tengoCandado = flock($candado, LOCK_EX | LOCK_NB);
    if (!$tengoCandado) {
        $anterior = respuestaGuardada(false);
        if ($anterior !== null) {
            fclose($candado);
            echo $anterior;
            exit();
        }
        $tengoCandado = flock($candado, LOCK_EX);
        $reciente = respuestaGuardada(true);
        if ($reciente !== null) {
            if ($tengoCandado) flock($candado, LOCK_UN);
            fclose($candado);
            echo $reciente;
            exit();
        }
    }
}

function soltarCandado($candado, $tengoCandado) {
    if (!$candado) return;
    if ($tengoCandado) flock($candado, LOCK_UN);
    fclose($candado);
}

// ── 3 · Wialon ───────────────────────────────────────────────────────────────

require_once "WialonService.php";

$params = [
    "spec" => [
        "itemsType" => "avl_unit",
        "propName" => "sys_name",
        "propValueMask" => "*",
        "sortType" => "sys_name"
    ],
    "force" => 1,
    "flags" => 1025, // Full info
    "from" => 0,
    "to" => 0
];

$unidades = [];
try {
    $res = WialonService::call("core/search_items", $params);
    $unidades = (is_array($res) && isset($res["items"]) && is_array($res["items"])) ? $res["items"] : [];
} catch (Throwable $e) {
    $unidades = [];
}

// Si Wialon no devolvió nada, mejor la última respuesta buena que un mapa vacío.
if (count($unidades) === 0) {
    $anterior = respuestaGuardada(false);
    soltarCandado($candado, $tengoCandado);
    echo $anterior !== null ? $anterior : json_encode(["status" => "success", "units" => []]);
    exit();
}

// ── 4 · Direcciones ──────────────────────────────────────────────────────────

$guardado = leerJson(ARCHIVO_DIRECCIONES) ?? [];
$direcciones = (isset($guardado['direcciones']) && is_array($guardado['direcciones'])) ? $guardado['direcciones'] : [];
$porUnidad = (isset($guardado['por_unidad']) && is_array($guardado['por_unidad'])) ? $guardado['por_unidad'] : [];
$pausadoHasta = (int)($guardado['pausado_hasta'] ?? 0);

$ahora = time();

// Tirar lo caducado para que el archivo no crezca sin fin.
foreach ($direcciones as $clave => $entrada) {
    if (!is_array($entrada) || ($ahora - (int)($entrada['t'] ?? 0)) >= VIGENCIA_DIRECCION) {
        unset($direcciones[$clave]);
    }
}

$pendientes = [];

foreach ($unidades as $i => $u) {
    $id = (string)($u['id'] ?? $i);

    if (!isset($u["pos"]["y"]) || !isset($u["pos"]["x"])) {
        $unidades[$i]["address"] = "";
        continue;
    }

    $clave = claveDeCoordenada($u["pos"]["y"], $u["pos"]["x"]);

    if (isset($direcciones[$clave])) {
        $unidades[$i]["address"] = $direcciones[$clave]['d'];
        $porUnidad[$id] = ['d' => $direcciones[$clave]['d'], 't' => $ahora];
        continue;
    }

    // Mientras llega su turno, se queda con la última dirección que tuvo.
    $unidades[$i]["address"] = $porUnidad[$id]['d'] ?? "";
    $pendientes[] = ['i' => $i, 'id' => $id, 'clave' => $clave, 'edad' => (int)($porUnidad[$id]['t'] ?? 0)];
}

// Primero las que llevan más tiempo sin dirección fresca.
usort($pendientes, function ($a, $b) { return $a['edad'] - $b['edad']; });

if ($ahora >= $pausadoHasta) {
    $fallosSeguidos = 0;
    $consultadas = 0;

    foreach ($pendientes as $p) {
        if ($consultadas >= MAX_DIRECCIONES_NUEVAS) break;
        if ($consultadas > 0) usleep(PAUSA_ENTRE_DIRECCIONES);
        $consultadas++;

        $u = $unidades[$p['i']];
        $direccion = consultarDireccion($u["pos"]["y"], $u["pos"]["x"]);

        if ($direccion === null) {
            $fallosSeguidos++;
            if ($fallosSeguidos >= 2) {
                $pausadoHasta = time() + PAUSA_SI_FALLA;
                break;
            }
            continue;
        }

        $fallosSeguidos = 0;
        $direcciones[$p['clave']] = ['d' => $direccion, 't' => time()];
        $porUnidad[$p['id']] = ['d' => $direccion, 't' => time()];
        $unidades[$p['i']]["address"] = $direccion;
    }
}

guardarJson(ARCHIVO_DIRECCIONES, [
    'direcciones' => $direcciones,
    'por_unidad' => $porUnidad,
    'pausado_hasta' => $pausadoHasta,
]);

// ── 5 · Respuesta ────────────────────────────────────────────────────────────

$salida = json_encode([
    "status" => "success",
    "units" => array_values($unidades)
]);

if ($salida !== false) {
    $temporal = ARCHIVO_RESPUESTA . '.' . getmypid() . '.tmp';
    if (@file_put_contents($temporal, $salida) !== false) {
        @rename($temporal, ARCHIVO_RESPUESTA);
    }
}

soltarCandado($candado, $tengoCandado);

echo $salida !== false ? $salida : json_encode(["status" => "success", "units" => []]);
