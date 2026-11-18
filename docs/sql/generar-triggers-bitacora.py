# Genera los triggers de la bitácora a partir de la estructura guardada de las tablas.
#
#   python3 docs/sql/generar-triggers-bitacora.py [archivo-de-salida-para-el-php]
#
# Escribe docs/sql/016-bitacora-triggers.sql (para revisar) y, si se pasa un archivo,
# el arreglo PHP que va dentro de docs/backend/bitacora_triggers.php. Para una tanda
# nueva: volver a leer la estructura de producción, agregar las tablas a TABLAS y correrlo.
import json, sys
ESQUEMA = 'docs/sql/bitacora-esquema-2026-11-17.json'
TABLAS = ['gastos', 'detalles_gasto', 'diesel', 'trip_stages', 'trip_payments', 'user_feature_flags', 'Users_credentials']
EXCLUIR = {'Users_credentials': {'pass', 'push_token'}}

d = json.load(open(ESQUEMA))

def columnas(t):
    return [c.split(' ')[0] for c in d['tablas'][t]['columnas'] if c.split(' ')[0] not in EXCLUIR.get(t, set())]

def objeto(fila, cols):
    return 'JSON_OBJECT(' + ', '.join(f"'{c}', {fila}.`{c}`" for c in cols) + ')'

def registro(fila, llave):
    return "CONCAT_WS('-', " + ', '.join(f"{fila}.`{c}`" for c in llave) + ')'

INSERTAR = ("INSERT INTO bitacora_cambios (peticion, fecha_utc, usuario_id, tabla, registro_id, operacion, antes, despues) "
            "VALUES (@ima_peticion, UTC_TIMESTAMP(), @ima_usuario, '{t}', {reg}, '{op}', {antes}, {despues});")

def triggers(t):
    cols = columnas(t)
    llave = d['tablas'][t]['llave']
    corto = t.lower()[:40]
    salida = []
    salida.append((f'bit_{corto}_ins', f"""CREATE TRIGGER `bit_{corto}_ins` AFTER INSERT ON `{t}` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  {INSERTAR.format(t=t, reg=registro('NEW', llave), op='I', antes='NULL', despues=objeto('NEW', cols))}
END"""))
    cambios = '\n'.join(
        f"  IF NOT (OLD.`{c}` <=> NEW.`{c}`) THEN\n"
        f"    SET v_antes = JSON_INSERT(v_antes, '$.\"{c}\"', OLD.`{c}`);\n"
        f"    SET v_despues = JSON_INSERT(v_despues, '$.\"{c}\"', NEW.`{c}`);\n"
        f"  END IF;" for c in cols)
    salida.append((f'bit_{corto}_upd', f"""CREATE TRIGGER `bit_{corto}_upd` AFTER UPDATE ON `{t}` FOR EACH ROW
BEGIN
  DECLARE v_antes LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{{}}';
  DECLARE v_despues LONGTEXT CHARACTER SET utf8mb4 DEFAULT '{{}}';
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
{cambios}
  IF v_antes <> '{{}}' THEN
    {INSERTAR.format(t=t, reg=registro('NEW', llave), op='U', antes='v_antes', despues='v_despues')}
  END IF;
END"""))
    salida.append((f'bit_{corto}_del', f"""CREATE TRIGGER `bit_{corto}_del` AFTER DELETE ON `{t}` FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  {INSERTAR.format(t=t, reg=registro('OLD', llave), op='D', antes=objeto('OLD', cols), despues='NULL')}
END"""))
    return salida

todos = [x for t in TABLAS for x in triggers(t)]

# SQL legible para revisar (NO se corre en phpMyAdmin)
with open('docs/sql/016-bitacora-triggers.sql', 'w') as f:
    f.write("""-- Bitácora · triggers de «antes y después», primera tanda
--
-- NO CORRER EN phpMyAdmin. Creados ahí quedarían con el usuario temporal de cPanel y
-- fallarían con el error 1449, como crud_diesel. Se instalan con
-- docs/backend/bitacora_triggers.php, que usa la conexión de la app.
-- Este archivo es la copia para revisar; el PHP lleva exactamente las mismas sentencias.
--
-- Tablas: """ + ', '.join(TABLAS) + """
-- Generado desde docs/sql/bitacora-esquema-2026-11-17.json.
--
-- Qué hace cada uno: al dar de alta guarda el registro completo; al editar guarda solo
-- las columnas que cambiaron (y nada si no cambió ninguna); al borrar guarda el registro
-- completo. De Users_credentials nunca se guardan pass ni push_token. Quién y en qué
-- petición salen de @ima_usuario y @ima_peticion, que pone conexion.php en cada conexión.
-- Si algo falla dentro del trigger, el manejador lo traga y el guardado sigue.
--
-- No modifican ninguna tabla ni agregan columnas.

""")
    for nombre, sql in todos:
        f.write(f"-- {nombre}\n{sql};\n\n")

# arreglo para el PHP
partes = []
for nombre, sql in todos:
    partes.append(f"    '{nombre}' => <<<'SQL'\n{sql}\nSQL,")
if len(sys.argv) > 1:
    open(sys.argv[1], 'w').write('\n'.join(partes))
print(len(todos), 'triggers')
