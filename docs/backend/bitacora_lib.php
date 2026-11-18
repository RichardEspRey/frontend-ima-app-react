<?php
// Bitácora de auditoría · registro por petición
//
// Lo carga conexion.php, así que corre en todos los PHP de la API. Al terminar cada
// petición que cambió algo (alta, edición, borrado, inicio de sesión) escribe una fila
// en la tabla `bitacora`: quién, cuándo, qué archivo y operación, con qué datos y si
// salió bien. Las consultas no se registran.
//
// Reglas que no se pueden romper:
//   - Nunca tumba una operación. Todo va dentro de try/catch y, si algo falla, la
//     petición sigue como si este archivo no existiera.
//   - Nunca escribe nada a la salida: ni echo, ni avisos, ni espacios. Por eso este
//     archivo no lleva la etiqueta de cierre de PHP.
//   - Nunca guarda contraseñas: los campos de CAMPOS_OCULTOS se guardan como ***.
//
// Además, conexion.php llama a Bitacora::alConectar() en cada conexión que abre: marca la
// conexión con @ima_usuario y @ima_peticion, que es lo que leen los triggers para saber
// quién hizo cada cambio y a qué fila de `bitacora` pertenece.
//
// La fila se escribe con una conexión propia, abierta al final: así no se mezcla con
// una transacción que el PHP haya dejado a medias. La hora va en UTC (decisión del
// 2026-11-17); la pantalla de la bitácora la muestra en hora de Monterrey.
//
// Diseño completo: docs/refactor/10-BITACORA.md en el repositorio del front.

final class Bitacora
{
    // Operaciones que solo consultan, por cómo empieza su nombre. Una operación nueva
    // o desconocida SÍ se registra: el error por omisión es guardar de más.
    const PATRON_LECTURA = '/^(get|all_|chart|dashboard|periodo|list|buscar|search|consulta|obtener|fetch|count|collapse_|ver_|show|load|read|resumen|detalle|historial|report|export|print|ping|status|check|validar|validate|existe|exists|next_|pdf)/i';

    // Lecturas cuyo nombre no sigue el patrón.
    const LECTURAS = ['trip_summary', 'residuo_trip'];

    const CAMPOS_OCULTOS = ['pass', 'password', 'contrasena', 'contraseña', 'push_token', 'token', 'clave'];

    const LARGO_VALOR = 2000;
    const LARGO_DATOS = 20000;
    const LARGO_COPIA = 4096;

    private static $activa = false;
    private static $nivelBuffer = 0;
    private static $copia = '';
    private static $op = '';
    private static $peticion = null;

    public static function iniciar()
    {
        try {
            if (PHP_SAPI === 'cli') return;

            $op = trim((string)($_POST['op'] ?? $_REQUEST['op'] ?? ''));
            if ($op === '' || self::esLectura($op)) return;

            self::$op = $op;
            self::$peticion = bin2hex(random_bytes(16));
            self::$activa = true;

            // Copia los primeros KB de la respuesta para saber si salió bien. El buffer
            // se vacía cada 8 KB, así que la respuesta sigue saliendo igual que antes.
            self::$nivelBuffer = ob_get_level();
            ob_start([self::class, 'copiar'], 8192);

            register_shutdown_function([self::class, 'alTerminar']);
        } catch (Throwable $e) {
            self::$activa = false;
        }
    }

    // En las consultas no hay fila de bitácora, así que @ima_peticion va vacía; el usuario
    // sí se marca, por si una consulta llegara a cambiar algo. En los procesos automáticos
    // (cli) no se marca nada y sus cambios salen sin usuario.
    public static function alConectar($pdo)
    {
        try {
            if (PHP_SAPI === 'cli' || !($pdo instanceof PDO)) return;
            $usuario = self::usuario();
            $pdo->exec(
                "SET @ima_peticion = " . (self::$peticion === null ? "NULL" : $pdo->quote(self::$peticion)) .
                ", @ima_usuario = " . ($usuario === null ? "NULL" : (int)$usuario)
            );
        } catch (Throwable $e) {
            return;
        }
    }

    public static function esLectura($op)
    {
        return preg_match(self::PATRON_LECTURA, $op) === 1 || in_array($op, self::LECTURAS, true);
    }

    public static function copiar($trozo)
    {
        if (strlen(self::$copia) < self::LARGO_COPIA) {
            self::$copia .= substr($trozo, 0, self::LARGO_COPIA - strlen(self::$copia));
        }
        return $trozo;
    }

    public static function alTerminar()
    {
        if (!self::$activa) return;

        try {
            // Soltar la respuesta antes de escribir en la base: quien llamó no espera.
            while (ob_get_level() > self::$nivelBuffer) {
                if (!@ob_end_flush()) break;
            }
            if (function_exists('fastcgi_finish_request')) @fastcgi_finish_request();

            self::escribir();
        } catch (Throwable $e) {
            return;
        }
    }

    private static function escribir()
    {
        if (!defined('DB_HOST') || !defined('DB_NAME') || !defined('DB_USER') || !defined('DB_PASSWORD')) return;

        [$resultado, $mensaje] = self::resultado();
        [$app, $version] = self::app();

        $db = new PDO(
            "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
            DB_USER,
            DB_PASSWORD,
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_TIMEOUT => 3]
        );

        $stmt = $db->prepare("
            INSERT INTO bitacora
                (peticion, fecha_utc, usuario_id, app, app_version, archivo, op, resultado, mensaje, datos, ip)
            VALUES (?, UTC_TIMESTAMP(), ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            self::$peticion ?? bin2hex(random_bytes(16)),
            self::usuario(),
            $app,
            $version,
            substr(basename((string)($_SERVER['SCRIPT_NAME'] ?? 'desconocido')), 0, 60),
            substr(self::$op, 0, 60),
            $resultado,
            $mensaje,
            self::datos(),
            substr((string)($_SERVER['REMOTE_ADDR'] ?? ''), 0, 45),
        ]);
    }

    // Quién lo hizo, según lo que mande el cliente. `_usuario` lo pondrá la app en
    // cada petición (paso B3); mientras tanto se usa `id_usuario`, que ya mandan varias
    // pantallas. No se usa `user_id`: en varios PHP es la persona afectada, no quien
    // hizo el cambio.
    private static function usuario()
    {
        foreach (['_usuario', 'id_usuario'] as $campo) {
            $valor = $_POST[$campo] ?? null;
            if ($valor !== null && filter_var($valor, FILTER_VALIDATE_INT) !== false) return (int)$valor;
        }
        return null;
    }

    // `_app` llega como «Desktop 1.6.2» o «Movil 1.0.5». Las versiones de antes no lo
    // mandan; para esas se deduce la app por cómo se identifica el cliente (User-Agent)
    // y la versión queda vacía, que es lo que la pantalla lee como «sin actualizar».
    private static function app()
    {
        $texto = trim((string)($_POST['_app'] ?? ''));
        if ($texto === '') return [self::appPorAgente(), null];
        $partes = preg_split('/\s+/', $texto, 2);
        return [substr($partes[0], 0, 20), isset($partes[1]) ? substr($partes[1], 0, 20) : null];
    }

    // Electron dice «Electron/…»; React Native en Android usa okhttp y en iPhone
    // CFNetwork/Darwin; Expo Go se anuncia como Expo. Un navegador común queda como
    // «Navegador» y cualquier otra cosa (curl, scripts) como «Otro».
    private static function appPorAgente()
    {
        $agente = (string)($_SERVER['HTTP_USER_AGENT'] ?? '');
        if ($agente === '') return null;
        if (stripos($agente, 'Electron') !== false) return 'Desktop';
        foreach (['okhttp', 'CFNetwork', 'Darwin', 'Expo', 'Dalvik'] as $marca) {
            if (stripos($agente, $marca) !== false) return 'Movil';
        }
        if (stripos($agente, 'Mozilla') !== false) return 'Navegador';
        return 'Otro';
    }

    private static function resultado()
    {
        $error = error_get_last();
        if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR], true)) {
            return ['error', substr('Fallo de PHP: ' . $error['message'], 0, 255)];
        }

        $respuesta = json_decode(self::$copia, true);
        $codigo = http_response_code();

        if (is_array($respuesta)) {
            $estado = isset($respuesta['status']) ? substr((string)$respuesta['status'], 0, 10) : null;
            $mensaje = isset($respuesta['message']) ? substr((string)$respuesta['message'], 0, 255) : null;
            if ($estado === null && is_int($codigo) && $codigo >= 400) $estado = 'error';
            return [$estado, $mensaje];
        }

        return [is_int($codigo) && $codigo >= 400 ? 'error' : null, null];
    }

    private static function datos()
    {
        $datos = [];
        foreach ($_POST as $clave => $valor) {
            if (in_array($clave, ['op', '_usuario', '_app'], true)) continue;
            $datos[$clave] = self::limpiar($clave, $valor);
        }

        if (!empty($_FILES)) {
            $archivos = [];
            foreach ($_FILES as $campo => $archivo) {
                $nombres = (array)($archivo['name'] ?? []);
                $tamanos = (array)($archivo['size'] ?? []);
                foreach ($nombres as $i => $nombre) {
                    $archivos[] = ['campo' => $campo, 'nombre' => $nombre, 'bytes' => (int)($tamanos[$i] ?? 0)];
                }
            }
            $datos['_archivos'] = $archivos;
        }

        $json = json_encode($datos, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
        if ($json === false) return null;
        return strlen($json) > self::LARGO_DATOS ? substr($json, 0, self::LARGO_DATOS) . '…' : $json;
    }

    private static function limpiar($clave, $valor)
    {
        $nombre = strtolower((string)$clave);
        foreach (self::CAMPOS_OCULTOS as $oculto) {
            if (strpos($nombre, $oculto) !== false) return '***';
        }

        if (is_array($valor)) {
            $limpio = [];
            foreach ($valor as $k => $v) $limpio[$k] = self::limpiar($k, $v);
            return $limpio;
        }

        $texto = (string)$valor;
        return strlen($texto) > self::LARGO_VALOR ? substr($texto, 0, self::LARGO_VALOR) . '…' : $texto;
    }
}

Bitacora::iniciar();
