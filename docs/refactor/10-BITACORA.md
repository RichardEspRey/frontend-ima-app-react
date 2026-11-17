# Bitácora de auditoría — plan

> Escrito el 2026-11-13. Es un plan: no se tocó producción ni se escribió código.
> Medido sobre la rama `Emiliano` (`592189b`), la app móvil (`App-operadores-react-native-expo`),
> el dump del 2026-09-02 y los PHP que hay en local.

> **Estado al 2026-11-17: listo para empezar.** Los cambios que iban primero ya están
> hechos. El orden de trabajo, paso a paso, está en `12-PLAN-SIGUIENTE.md`, parte B. Al
> retomarlo, volver a medir § 1 y § 2 —los conteos de `fetch` y la lista de tablas habrán
> cambiado— y empezar por la etapa 0.
>
> **Dos cosas cambiaron desde que se escribió:** los SQL `010`, `011` y `012` ya se usaron
> (avisos y permisos de pagos), así que el de la bitácora es el **`013-bitacora.sql`**; y
> hay una tabla nueva que auditar, `notif_suscriptores`.

## 0 · El requisito

Tal como lo entregó Emiliano:

> **Descripción:** Registra las acciones de los usuarios para fines de auditoría y supervisión.
>
> **Funcionalidades:**
> - Registro de acciones de usuarios para auditoría.
> - Consulta de logs de auditoría.

Cómo lo cubre este plan:

| Funcionalidad | Dónde se resuelve |
|---|---|
| Registro de acciones de usuarios | Etapas 1 y 2: una fila en `bitacora` por cada acción, con quién, cuándo y qué. Con eso el requisito ya se cumple |
| Consulta de logs de auditoría | Etapa 4: pantalla Bitácora con filtros por fecha, usuario, módulo y acción |
| *(más allá del requisito)* | Etapas 3 y 5: el valor de antes y el de después de cada registro. Sirve para supervisión, pero el requisito no lo exige; se puede dejar fuera o para el final |

**Alcance mínimo para cumplir el requisito: etapas 0, 1, 2 y 4.** No lleva triggers, así
que no depende del privilegio `TRIGGER` ni del problema del DEFINER de cPanel.

## 1 · Qué se revisó y qué no

| Capa | Revisado | Lo que no se pudo ver |
|---|---|---|
| Front de escritorio | Todo `src/`: 235 archivos, 264 `fetch` en 99 archivos, ~164 operaciones contra 39 PHP | — |
| App móvil | `services/` y `app/`: 51 `fetch` contra 17 PHP | — |
| Backend | `mtto.php`, `cajas_estatus.php`, `pagos_mx.php` completos y fragmentos de `formularios.php`, `trips.php`, `save_expense.php` | **Los otros ~35 PHP y `conexion.php` no están en local** |
| Base de datos | Las 97 tablas del dump, su único trigger (`after_diesel_insert`) | **Los procedimientos almacenados**: el dump dice `insufficient privileges to SHOW CREATE PROCEDURE`. Tampoco las tablas creadas después del 2 de septiembre |

Lo que no se vio pesa en el diseño: hay escrituras que ocurren dentro de procedimientos
(`crud_trip_stages`, `Crud_caja_trips_status`, `create_trip_header`…) y que ningún PHP
describe. Por eso el plan no depende de leerlos.

## 2 · Cómo está hoy

- **72 de 85 tablas de negocio no guardan quién ni cuándo.** Solo `gastos` y `gastos_viaje`
  tienen `created_by`/`updated_by`; `diesel` tiene `created_by`; las tablas nuevas de
  Reparaciones (`mtto_*`) sí guardan usuario.
- **El front casi nunca dice quién es.** De 264 `fetch`, unos 14 mandan `id_usuario`,
  `user_id` o `created_by`. Para el resto el servidor no tiene forma de saber quién fue.
- **Todos los PHP pasan por `include_once 'conexion.php'`** y abren la conexión con
  `new Conexion()` → `getConnection()`. Es el único punto común de todo el backend.
- **Todo es POST con un campo `op`** (salvo `Cotizaciones.php`, que lo manda en la URL).
- **La API no autentica.** El usuario es un número que manda el cliente.
- La app móvil y los instaladores viejos de escritorio seguirán llamando igual que hoy
  durante semanas: la 1.5.2 nunca llegó sola a las máquinas.

## 3 · Diseño

Dos tablas y dos mecanismos que se complementan.

```
  Escritorio ─┐                       ┌─ bitacora ────────── una fila por acción
  Móvil ──────┼─ POST op ─ conexion.php│   quién · cuándo · qué op · con qué datos · resultado
  (curl) ─────┘      │                └────────────┬─────────
                     │ SET @ima_peticion,          │ mismo `peticion`
                     │     @ima_usuario            │
                     ▼                ┌────────────┴─────────
              PHP / procedimientos ──▶│ bitacora_cambios ─── una fila por registro tocado
              escriben en tablas      │   tabla · id · antes · después   (la llenan triggers)
                                      └──────────────────────
```

### Mecanismo A — la petición (quién hizo qué acción)

En `conexion.php`, una sola vez para los ~39 PHP:

1. Al abrir la conexión se genera un identificador de petición y se ejecuta
   `SET @ima_peticion = ?, @ima_usuario = ?`.
2. Al terminar el script (`register_shutdown_function`) se inserta **una fila en
   `bitacora`** con: fecha, usuario, app y versión, archivo PHP, `op`, los parámetros del
   POST ya saneados, nombres de archivos subidos, IP y resultado (`success`/`error`).
3. Todo va dentro de un `try/catch` que no hace nada si falla: **la bitácora nunca puede
   tumbar una operación**.

Qué se guarda y qué no:

- **Solo escrituras e inicios de sesión.** Se omite toda `op` de lectura por patrón
  (`get*`, `All_*`, `chart_*`, `dashboard`, `periodo*`) más una lista corta explícita.
  Una `op` nueva o desconocida **se registra**: el error por defecto es guardar de más.
- **Red de seguridad:** si una `op` clasificada como lectura dejó filas en
  `bitacora_cambios`, también se registra. Así un error en la lista no esconde nada.
- **Nunca contraseñas.** `pass`, `password`, `push_token` se sustituyen por `***`
  (`Auth.php` y `features.php · create_user / update_user` las reciben en claro).
  De `Auth.php · new_login` se guarda el usuario intentado y si entró o no.
- Los valores largos se recortan; de los archivos solo nombre y tamaño.

### Mecanismo B — el cambio (qué valor había y cuál quedó)

Triggers `AFTER INSERT / UPDATE / DELETE` en las tablas que importan. Cada uno inserta en
`bitacora_cambios` el registro antes y después como JSON, con el `@ima_peticion` y
`@ima_usuario` de la conexión.

Por qué triggers y no código PHP:

- Capturan lo que hacen los **procedimientos almacenados**, que no se pueden leer.
- Capturan lo que hace la **app móvil** sin tocarla.
- Capturan los cambios hechos **a mano en phpMyAdmin**: quedan con usuario vacío, que es
  justo el dato («esto no lo hizo nadie desde la app»).
- No hay que reescribir 80 operaciones una por una.

Condiciones para que no estorben:

- **Se generan con un script** a partir de `information_schema`, nunca a mano; al agregar
  una columna a una tabla se regenera su trigger. El script vive en `docs/sql/`.
- Cada trigger lleva `DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;`: si la
  bitácora falla, la escritura del negocio sigue.
- **No se crean desde el phpMyAdmin de cPanel**: quedarían con el DEFINER temporal
  `cpses_*` y tronarían con el error 1449, como ya pasó con `Crud_caja_trips_status`.
  Se crean desde un PHP de un solo uso que corre con el usuario de la app y se borra.
- Se excluyen `pass` y `push_token` de `Users_credentials`.

### Las tablas

```sql
CREATE TABLE bitacora (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  peticion      CHAR(32)     NOT NULL,
  fecha         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  usuario_id    INT          NULL,
  verificado    TINYINT(1)   NOT NULL DEFAULT 0,
  app           VARCHAR(20)  NULL,
  app_version   VARCHAR(20)  NULL,
  archivo       VARCHAR(60)  NOT NULL,
  op            VARCHAR(60)  NOT NULL,
  modulo        VARCHAR(40)  NULL,
  resultado     VARCHAR(10)  NULL,
  mensaje       VARCHAR(255) NULL,
  datos         LONGTEXT     NULL,
  ip            VARCHAR(45)  NULL,
  UNIQUE KEY uq_bitacora_peticion (peticion),
  KEY idx_bitacora_fecha (fecha),
  KEY idx_bitacora_usuario (usuario_id, fecha),
  KEY idx_bitacora_op (archivo, op, fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE bitacora_cambios (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  peticion     CHAR(32)    NULL,
  fecha        DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  usuario_id   INT         NULL,
  tabla        VARCHAR(64) NOT NULL,
  registro_id  VARCHAR(40) NOT NULL,
  operacion    CHAR(1)     NOT NULL,
  antes        LONGTEXT    NULL,
  despues      LONGTEXT    NULL,
  KEY idx_cambios_registro (tabla, registro_id, fecha),
  KEY idx_cambios_peticion (peticion),
  KEY idx_cambios_fecha (fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

`usuario_id` apunta a `Users_credentials.id` (no a `users`). Sin llave foránea a propósito:
la bitácora debe sobrevivir a que borren al usuario, y `Users_credentials` está en `latin1`.

`verificado` nace en 0 y es la parte honesta del diseño — ver § 4.

### Cómo llega el usuario al servidor

Un campo extra en cada petición: `_usuario` (el `user.id` de la sesión) y `_app`
(`Desktop 1.5.10`, `Movil 2.3`). Va como campo del formulario y no como cabecera para no
disparar el preflight de CORS, que cada PHP configura por su cuenta. Los PHP ignoran los
campos que no conocen, así que no rompe nada.

| Cliente | Dónde se pone | Cuánto es |
|---|---|---|
| Escritorio, rama `Emiliano` | Un envoltorio de `fetch` instalado en `main.jsx`: si la URL es de `VITE_API_HOST`, agrega los campos al `FormData` o al cuerpo `op=...` | 1 archivo nuevo + 1 línea; no se tocan los 99 archivos |
| Escritorio, `refactor-fase-1` | El mismo envoltorio (quedan 115 `fetch` sueltos en 47 archivos); se borra cuando todo pase por `shared/api/client.js` | igual |
| Móvil | El mismo envoltorio en `app/_layout.tsx`; `apiClient.post` solo cubre la parte de administración | 1 archivo + publicar versión |

Mientras un cliente no se actualice, `conexion.php` cae a `$_POST['id_usuario']` si viene,
y si no, deja `usuario_id` vacío con la IP y la versión. La propia bitácora dirá qué
máquinas siguen con un instalador viejo.

## 4 · Lo que esta bitácora no es

**No es prueba contra alguien que quiera engañar.** El `_usuario` lo declara el cliente,
igual que hoy el `id_usuario`. Sirve para lo que se pidió —saber quién de la oficina movió
qué, en uso normal— pero un `curl` puede poner el número de otra persona.

Eso no se arregla aquí sino con la sesión real (paso 3 de `PENDIENTES.md` § 9, en espera).
El diseño ya lo deja listo: cuando exista el token, `conexion.php` saca el usuario del
token en vez del campo y escribe `verificado = 1`. Ni las tablas, ni los triggers, ni la
pantalla cambian.

Tampoco impide que alguien con acceso a phpMyAdmin borre filas de la bitácora. En un
hosting compartido con un solo usuario de MySQL no hay forma barata de evitarlo.

## 5 · Etapas

Cada etapa se puede subir sola y deja algo útil. Las de producción se muestran y se
aprueban antes, como siempre.

### Etapa 0 — Lo que necesito ver antes de escribir nada

1. **`conexion.php` actual**, completo. Todo el mecanismo A vive ahí.
2. La **lista de archivos de `/API`** (un `ls`), para saber si alguno no incluye
   `conexion.php` (crons, webhooks de Wialon o FleetOne).
3. `SHOW GRANTS` del usuario de la app: hace falta el privilegio **`TRIGGER`**.
4. Si la conexión usa `PDO::ATTR_PERSISTENT`. Si es persistente, las variables
   `@ima_*` se heredarían entre peticiones y habría que limpiarlas al conectar.
5. `SHOW PROCEDURE STATUS WHERE Db = 'i8768260_wp1'` y `SHOW TRIGGERS`, para tener por
   fin el inventario que el dump no dio.

### Etapa 1 — Tablas y registro por petición · BD + 1 PHP

- SQL `013-bitacora.sql`: las dos tablas. No las lee nadie; riesgo nulo.
- `bitacora_lib.php` (nuevo) + 3 líneas en `conexion.php`, con copia `.ANTERIOR`.
- Resultado: desde ese día queda registrada cada escritura con fecha, `op`, datos e IP.
  El usuario saldrá vacío en casi todas hasta la etapa 2.
- Verificación: una semana de datos para medir cuántas filas y cuántos MB por día, y
  afinar la lista de lecturas.

### Etapa 2 — Que cada petición diga quién es · front + móvil

- Envoltorio de `fetch` en `Emiliano` y portado a `refactor-fase-1` con su arquitectura.
- El mismo en la app móvil; sale con la próxima publicación.
- Resultado: `usuario_id` lleno en todo lo que venga de un cliente actualizado.

### Etapa 3 — Antes y después en lo que mueve dinero y viajes · BD

Generador de triggers y primera tanda:

| Grupo | Tablas |
|---|---|
| Viajes | `trips`, `trip_stages`, `stage_stops`, `trip_stage_invoices` |
| Gastos y diesel | `gastos`, `detalles_gasto`, `gastos_viaje`, `diesel`, `diesel_tickets` |
| Pagos | `pagos_semanales`, `pagos_detalle`, `trip_payments`, `pago_trayectos_mx` |
| Accesos | `Users_credentials` (sin `pass`), `user_feature_flags` |
| Mantenimiento | `ordenes_servicio`, `orden_servicio_detalles` |

Se sube tabla por tabla, probando una escritura real después de cada una.

### Etapa 4 — Pantalla de Bitácora · front + 1 PHP

- `bitacora.php`: `listar` (paginado; filtros por fecha, usuario, módulo, `op`),
  `detalle` (los cambios de una petición) e `historial` (todo lo ocurrido a un registro).
- Pantalla **Bitácora** con permiso nuevo `bitacora.ver`: tabla con «quién · cuándo ·
  qué hizo», y al abrir una fila, el antes y el después campo por campo.
- Botón **Historial** en el detalle de viaje y de gasto, que es donde más se pregunta.
- Un diccionario `archivo.op → texto` («Borró un gasto», «Autorizó la nómina») para que
  no se lea como nombres de funciones.

### Etapa 5 — Completar y mantener

- Segunda tanda de triggers: catálogos (`trucks`, `drivers`, `caja`, `companies`,
  `warehouses`), documentos, inventario, inspecciones, `caja_estatus`, `mtto_*`.
- Retención: evento o cron que borre lo más viejo que el plazo acordado.
- Cuando llegue la sesión real: `verificado = 1`.

## 6 · Decisiones tuyas

| # | Pregunta | Recomendación |
|---|---|---|
| 1 | ¿Registrar también las consultas (quién vio qué)? | No. Solo escrituras e inicios de sesión; las consultas multiplican el volumen y no responden «quién lo cambió» |
| 2 | ¿Quién puede ver la bitácora? | Solo `Admin`, con el permiso `bitacora.ver` para poder abrirlo a alguien más |
| 3 | ¿Cuánto tiempo se conserva? | 24 meses; se confirma con el volumen real que mida la etapa 1 |
| 4 | ¿La primera tanda de tablas de la etapa 3 es la correcta? | La de la tabla de arriba |
| 5 | ¿Se registra lo que hacen los operadores desde el móvil? | Sí: sus gastos, diesel e inspecciones entran a las mismas tablas |

## 7 · Riesgos

| Riesgo | Cómo se contiene |
|---|---|
| `conexion.php` lo cargan todos los PHP: un error ahí tira toda la API | Cambio mínimo, todo en `try/catch`, copia `.ANTERIOR` lista y prueba inmediata de login + una lectura + una escritura |
| Un trigger roto bloquea las escrituras de su tabla | Handler que traga el error; se suben de una en una |
| DEFINER temporal de cPanel (error 1449) | Crear los triggers desde PHP con el usuario de la app |
| Contraseñas dentro de la bitácora | Lista de campos censurados en el PHP y columnas excluidas en los triggers; se revisa con un `SELECT` buscando contraseñas conocidas tras la etapa 1 |
| Crecimiento de la tabla | Solo escrituras, valores recortados, retención; se mide antes de decidir |
| Clientes sin actualizar | Se registran igual, sin usuario; la bitácora los delata por versión e IP |
