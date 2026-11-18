<?php
    require_once "config.php";

    // Bitácora de auditoría: registra quién hizo cada cambio. Si el archivo falta o
    // tiene un error, la API sigue funcionando igual que antes.
    try {
        if (is_file(__DIR__ . "/bitacora_lib.php")) {
            include_once __DIR__ . "/bitacora_lib.php";
        }
    } catch (Throwable $e) {
    }

    class Conexion {
        private $host = DB_HOST; // Dirección del servidor de la base de datos
        private $db_name = DB_NAME; // Nombre de la base de datos
        private $username = DB_USER; // Nombre de usuario para conectarse a la base de datos
        private $password = DB_PASSWORD; // Contraseña del usuario para conectarse a la base de datos
        public $conn;

        public function getConnection() {
            $this->conn = null;

            try {
                $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
                $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                // Si se desea utilizar acentos en la base de datos, se puede agregar la siguiente línea:
                // $this->conn->exec("set names utf8");
            } catch(PDOException $exception) {
                echo "Error de conexión: " . $exception->getMessage();
            }

            return $this->conn;
        }
    }
?>
