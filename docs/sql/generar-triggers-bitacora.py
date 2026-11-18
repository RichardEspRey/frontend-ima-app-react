# Genera los triggers de la bitácora a partir de la estructura guardada de las tablas.
#
#   python3 docs/sql/generar-triggers-bitacora.py [archivo-de-salida-para-el-php]
#
# Escribe un .sql por tanda y un solo arreglo PHP con todas, para que el instalador
# pueda crear o quitar cualquiera.
#
# Escribe docs/sql/016-bitacora-triggers.sql (para revisar) y, si se pasa un archivo,
# el arreglo PHP que va dentro de docs/backend/bitacora_triggers.php. Para una tanda
# nueva: volver a leer la estructura de producción, agregar las tablas a TABLAS y correrlo.
import json, sys
ESQUEMA = 'docs/sql/bitacora-esquema-2026-11-18.json'
TANDAS = {
    1: ('016-bitacora-triggers.sql',
        ['gastos', 'detalles_gasto', 'diesel', 'trip_stages', 'trip_payments', 'user_feature_flags', 'Users_credentials']),
    2: ('017-bitacora-triggers-tanda-2.sql',
        ['trips', 'ordenes_servicio', 'orden_servicio_detalles', 'pago_trayectos_mx', 'notif_suscriptores']),
    3: ('019-bitacora-triggers-tanda-3.sql',
        ['pagos_semanales', 'pagos_detalle',
         'stage_stops', 'trip_stage_invoices', 'gastos_viaje', 'programacion_trips',
         'trucks', 'caja', 'drivers', 'companies', 'warehouses']),
    4: ('020-bitacora-triggers-tanda-4.sql',
        ['personal_admin', 'milla_driver', 'company_invoice_info', 'pago_trayecto_viaje',
         'diesel_fuente_margen', 'cajas_externas',
         'mtto_puntos', 'mtto_inspeccion_lado', 'mtto_concepto_detalle', 'mtto_notif_suscriptores',
         'caja_estatus', 'roadside_repairs', 'inspections', 'servicios_orden', 'afinaciones_historial']),
    5: ('021-bitacora-triggers-tanda-5.sql',
        ['truck_documents', 'drivers_documents', 'cajas_documents', 'IMA_documents', 'safety_docs',
         'documents', 'gastos_documentos', 'trip_document_relationship', 'roadside_repair_docs',
         'inspection_docs',
         'status_documents_Drivers', 'status_documents_Trucks', 'status_documents_Trailers',
         'status_documents_IMA',
         'articulos_inventario', 'movimientos_inventario', 'activos',
         'teams', 'user_teams', 'tipos_gasto', 'tipos_reparacion', 'categorias_mantenimiento',
         'subcategorias_mantenimiento', 'inspection_descriptions', 'origenes', 'cat_origenes',
         'cat_trucks_requisitos', 'cat_drivers_requisitos', 'cat_cajas_requisitos',
         'cat_ima_requisitos', 'features']),
}
EXCLUIR = {
    'Users_credentials': {'pass', 'push_token'},
    'trips': {'ruta_wialon'},
    # Las reescribe el rastreo de Wialon a cada consulta; registrarlas sería puro ruido.
    'trucks': {'current_fuel', 'last_fuel_calc_at', 'last_odometer_calc', 'dist_nv_l',
               'last_latitude', 'last_longitude'},
    # El XML/JSON completo de la factura; pesa mucho y ya queda el archivo y la versión.
    'trip_stage_invoices': {'json_data'},
    # El reporte completo de la inspección en JSON; quedan el resto de los campos.
    'inspections': {'reportes_json'},
}

d = json.load(open(ESQUEMA))

def columnas(t):
    return [c.split(' ')[0] for c in d['tablas'][t]['columnas'] if c.split(' ')[0] not in EXCLUIR.get(t, set())]

def tipo(t, c):
    for col in d['tablas'][t]['columnas']:
        nombre, _, resto = col.partition(' ')
        if nombre == c: return resto
    return ''

def valor(t, fila, c):
    # BIT(1) dentro de JSON sale como un byte ilegible; + 0 lo vuelve 0 o 1.
    return f"({fila}.`{c}` + 0)" if tipo(t, c).startswith('bit(') else f"{fila}.`{c}`"

def objeto(t, fila, cols):
    return 'JSON_OBJECT(' + ', '.join(f"'{c}', {valor(t, fila, c)}" for c in cols) + ')'

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
  {INSERTAR.format(t=t, reg=registro('NEW', llave), op='I', antes='NULL', despues=objeto(t, 'NEW', cols))}
END"""))
    cambios = '\n'.join(
        f"  IF NOT (OLD.`{c}` <=> NEW.`{c}`) THEN\n"
        f"    SET v_antes = JSON_INSERT(v_antes, '$.\"{c}\"', {valor(t, 'OLD', c)});\n"
        f"    SET v_despues = JSON_INSERT(v_despues, '$.\"{c}\"', {valor(t, 'NEW', c)});\n"
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
  {INSERTAR.format(t=t, reg=registro('OLD', llave), op='D', antes=objeto(t, 'OLD', cols), despues='NULL')}
END"""))
    return salida

ENCABEZADO = """-- Bitácora · triggers de «antes y después», tanda {n}
--
-- NO CORRER EN phpMyAdmin. Creados ahí quedarían con el usuario temporal de cPanel y
-- fallarían con el error 1449, como crud_diesel. Se instalan con
-- docs/backend/bitacora_triggers.php, que usa la conexión de la app.
-- Este archivo es la copia para revisar; el PHP lleva exactamente las mismas sentencias.
--
-- Tablas: {tablas}
-- Generado desde docs/sql/bitacora-esquema-2026-11-18.json con
-- docs/sql/generar-triggers-bitacora.py.
--
-- Qué hace cada uno: al dar de alta guarda el registro completo; al editar guarda solo
-- las columnas que cambiaron (y nada si no cambió ninguna); al borrar guarda el registro
-- completo. Columnas que nunca se guardan: {excluidas}.
-- Quién y en qué petición salen de @ima_usuario y @ima_peticion, que pone conexion.php
-- en cada conexión. Si algo falla dentro del trigger, el manejador lo traga y el guardado
-- sigue.
--
-- No modifican ninguna tabla ni agregan columnas. Antes de RENOMBRAR o BORRAR una
-- columna de estas tablas hay que quitar sus triggers (accion=quitar&tabla=…).

"""

todos = []
for n, (archivo, tablas) in TANDAS.items():
    de_la_tanda = [x for t in tablas for x in triggers(t)]
    todos.extend(de_la_tanda)
    excluidas = ', '.join(f"{t}.{c}" for t in tablas for c in sorted(EXCLUIR.get(t, ()))) or 'ninguna'
    with open(f'docs/sql/{archivo}', 'w') as f:
        f.write(ENCABEZADO.format(n=n, tablas=', '.join(tablas), excluidas=excluidas))
        for nombre, sql in de_la_tanda:
            f.write(f"-- {nombre}\n{sql};\n\n")

# arreglo para el PHP
partes = []
for nombre, sql in todos:
    partes.append(f"    '{nombre}' => <<<'SQL'\n{sql}\nSQL,")
tandas_php = '\n'.join(
    f"    {n} => [" + ', '.join(f"'{t.lower()}'" for t in tablas) + "]," for n, (_, tablas) in TANDAS.items())
if len(sys.argv) > 1:
    open(sys.argv[1], 'w').write('\n'.join(partes) + '\n];\n\n$TANDAS = [\n' + tandas_php)
print(len(todos), 'triggers')
