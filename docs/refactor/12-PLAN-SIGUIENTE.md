# Plan de lo que sigue — rendimiento y bitácora, paso a paso

> Escrito el **2026-11-17** para retomar el trabajo en sesiones nuevas (con otro modelo).
> Cada paso es chico, se puede hacer en una sesión y deja algo terminado. **Hacer un paso,
> verificarlo, reportarlo a Emiliano y esperar su visto bueno antes del siguiente.**
>
> Antes de empezar cualquier paso, leer: `CLAUDE.md` de la raíz de `frontend-ima-app-react`,
> este archivo, y el documento que el paso cite (`11-RENDIMIENTO.md` o `10-BITACORA.md`).

## Dónde estamos

- Ramas con push al día: `Emiliano` en `4f4b3d1`, `refactor-fase-1` en `2647f1d`.
- Producción: SQL `010`, `011` y `012` corridos; `Notifications.php` con las cinco
  operaciones de avisos subido; `crud_diesel` quedó en `SQL SECURITY INVOKER`.
- Nada de lo hecho del 13 al 17 de noviembre se ha visto en la app corriendo. Emiliano
  tiene pendiente revisarlo: campana, Notificaciones manager, Gastos diesel con la V, Pago
  a Operadores y Ventas.

## Cómo se trabaja cada paso

1. **Primero en `Emiliano`** (`frontend-ima-app-react`), que es de donde sale el instalador.
2. **Luego se porta a `refactor-fase-1`** (`../wt-refactor`) como commit reescrito con su
   arquitectura, nunca con merge. El mensaje cita el hash de `Emiliano`.
3. **Verificar en las dos:** `npx vitest run`, `npm run build` y `npx eslint` sobre los
   archivos tocados. En el refactor, `npx eslint src` debe dar 0 errores.
4. **Commit sí; push solo cuando Emiliano lo pida.**
5. **Lo de servidor se entrega como archivo** en `../wt-refactor/docs/sql/` o
   `docs/backend/`. Emiliano lo sube. Después se comprueba con `curl` de solo lectura.
6. **Reportar con números**: qué se midió antes y después.

---

# Parte A · Rendimiento

Diagnóstico completo y mediciones en `11-RENDIMIENTO.md`. Los pasos van del que más ahorra
por menos riesgo al que menos. Del A1 al A6 son solo front y no necesitan nada de Emiliano.

### A1 · Cachear el catálogo de nomenclaturas — HECHO (2026-11-17)

> `Emiliano` `29cd841`. `src/utils/conCache.js` trae `conCache` (vigencia + promesa
> compartida) y `crearCompletador` (vuelve a pedir una vez si aparece un id nuevo); se
> reutilizan en A3 y A5. El refactor no necesitó cambio: `useNomenclaturas` ya lo cacheaba.
> No se enganchó a ningún botón Actualizar porque Reparaciones no tiene uno.

- **Problema:** `11-RENDIMIENTO.md` § 3.1 y § 3.2. `All_CL_Final` (80 KB) se pide cada
  minuto desde la campana, y otra vez desde Sidebar, avisos y Reparaciones.
- **Dónde:** `src/services/mantenimiento.js` · `obtenerInspecciones()`.
- **Qué hacer:** que `obtenerInspecciones()` guarde su respuesta en una variable del módulo
  con vigencia de 10 minutos y comparta la promesa en vuelo (dos llamadas simultáneas = una
  petición). Exportar una función para invalidarlo y llamarla desde el botón Actualizar de
  Reparaciones, para que quien lo pulse vea lo último.
- **Cuidado:** una inspección de un viaje recién creado saldría sin nomenclatura hasta 10
  minutos. Ya hay respaldo: `obtenerAvisosDeInspecciones` cae a `trip_number`. Si al armar
  avisos falta la nomenclatura de algún `viaje_id`, invalidar y volver a pedir una vez.
- **Refactor:** ya lo tiene (`useNomenclaturas` con `staleTime`). Solo revisar que
  `useAvisosDerivados` y `useAvisosDeInspecciones` usen la misma llave. Sin cambio de código,
  probablemente.
- **Esperado:** el sondeo de inspecciones baja de 168 a 88 KB/min; de 3 a 2 peticiones.
- **Pruebas:** con `vi.useFakeTimers`, que dos llamadas seguidas hagan un solo `fetch`, que
  pasada la vigencia vuelva a pedir, y que invalidar fuerce la petición.

### A2 · Quitar la petición de permisos en cada foco — HECHO (2026-11-17)

> `Emiliano` `6976508`, portado al refactor. Se quitó el efecto de `Sidebar` y
> `DashboardLayout` pasó a pedir al montar. Al iniciar sesión siguen saliendo dos
> peticiones (la del `login` del store y la del layout); es una sola vez y no se tocó.

- **Problema:** § 3.3. `src/components/Sidebar.jsx:82-91`.
- **Qué hacer:** borrar ese `useEffect` entero. `DashboardLayout.jsx` ya pide los permisos
  al entrar, cada 5 min y al volver a mostrar la ventana si ya tocaba.
- **Cuidado:** comprobar que `DashboardLayout` los pide al montar (hoy usa
  `alIniciar: false` porque contaba con que Sidebar lo hacía). Si es así, pasarlo a
  `alIniciar: true` o dejar en Sidebar solo la petición inicial, sin el `focus`.
- **Esperado:** desaparece una petición por cada cambio de ventana.

### A3 · Que Sidebar no repita las inspecciones — HECHO (2026-11-17)

> `Emiliano` `9a717ed`. `getInspecciones` se comparte un minuto por lado
> (`pedirInspecciones` en `services/mantenimiento.js`) y cualquier `op` de `mtto.php` que
> no empiece con `get` lo invalida. **El refactor no se tocó:** campana y Sidebar ya leen
> la misma llave de TanStack (`llaveInspecciones`), pero Sidebar conserva su propio
> `refetchInterval` de 5 min, así que ahí siguen saliendo 2 peticiones cada 5 min aunque la
> campana esté pidiendo. Quitarlo dejaría sin contador a quien no está suscrito a
> inspecciones; queda como mejora menor.

- **Problema:** § 3.4. `Sidebar.jsx:164-180` pide `getInspecciones` de los dos lados cada
  5 min solo para contar, y la campana ya los tiene.
- **Qué hacer:** misma técnica que A1 en `pedirMtto('getInspecciones', { lado })`: caché
  corto (30 s) con promesa compartida, de modo que campana y Sidebar reutilicen la misma
  respuesta. Alternativa más limpia: que la campana publique los conteos (un store de
  zustand chico o un evento) y Sidebar los lea.
- **Cuidado:** Sidebar muestra los contadores a todos los que ven Mantenimientos; la
  campana solo pide inspecciones a los suscritos. Si Sidebar depende de la campana, quien
  no esté suscrito se queda sin contador. Por eso el caché compartido es más seguro.
- **Esperado:** 2 peticiones y 88 KB menos cada 5 min por máquina suscrita.

### A4 · Nomenclatura de los BL sin un `getById` por notificación — HECHO (2026-11-17)

> `Emiliano` `3798e48`, portado al refactor. **No se usó el catálogo:** medido contra
> producción, `All_CL_Final` solo trae la mitad de los viajes con BL (10 de 21 para el
> usuario 14), porque el BL llega antes que la inspección final. En su lugar la
> nomenclatura se recuerda en `localStorage` 30 días (`nomenclaturasGuardadas`), tope de
> 300 viajes: el `getById` se hace una vez por viaje y por máquina, no en cada sesión.
> La alternativa de backend (que `getAll`/`getNew` manden `nomenclatura`) sigue en pausa y
> ya no hace falta.

- **Problema:** § 3.5. `NotificationBell.jsx`, efecto que llena `nomenclaturas`.
- **Qué hacer:** con A1 hecho, sacar la nomenclatura del catálogo en caché (viene por
  `viaje_id`). Dejar el `getById` solo como respaldo para los viajes que no estén en el
  catálogo. Comprobar antes con `curl` que el catálogo trae los viajes de los BL recientes:
  `All_CL_Final` lista viajes con inspección final, y un BL firmado puede llegar antes.
- **Si el catálogo no los cubre:** la solución es de backend y Emiliano la tiene en pausa
  desde el 2026-10-28 (memoria `campana-nomenclatura`): que `getAll`/`getNew` devuelvan
  `nomenclatura`. Esos dos usan procedimientos (`sp_notifications_trips_get_all`), así que
  hay que pedirle el `SHOW CREATE PROCEDURE`. **Preguntarle antes; no retomarlo por
  iniciativa propia.**
- **Esperado:** hasta 20 peticiones menos al abrir sesión.

### A5 · Caché en los catálogos de los formularios — HECHO (2026-11-17)

> `Emiliano` `3fd29ca`. `src/utils/catalogos.js` (`pedirCatalogo`, `invalidarCatalogo`)
> sobre `conCache`; los seis hooks pasan por ahí sin cambiar lo que devuelven. Vigencias:
> compañías, bodegas y cajas externas 5 min; conductores, camiones y cajas 1 min, porque
> «activos» depende de la disponibilidad. Los `refetch` fuerzan la petición. **El refactor
> no se tocó:** esos catálogos ya son entidades con TanStack Query (`staleTime` global de
> 5 min). **Falta la prueba a mano de Emiliano:** crear un viaje dando de alta una compañía
> y una bodega nuevas, y ver que aparezcan en la lista sin recargar.

- **Problema:** § 3.6. Los seis hooks de `src/hooks/useFetch*.jsx`.
- **Qué hacer:** un ayudante `src/utils/cacheDeCatalogo.js` (promesa compartida + vigencia
  de 5 min + `invalidar(clave)`) y usarlo en los seis hooks sin cambiar lo que devuelven.
  Los `refetch` que ya exponen deben saltarse el caché. Después de un alta (`CreateCompany`,
  `CreateWarehouse`, `Alta` de caja externa) hay que invalidar: buscar esos `op` y confirmar
  que llaman al `refetch`.
- **Cuidado:** es el paso con más superficie (86 usos). Hacerlo con pruebas del ayudante y
  probar a mano crear un viaje con compañía nueva: la compañía tiene que aparecer en la
  lista sin recargar.
- **Refactor:** ya usa TanStack Query en lo migrado; revisar `staleTime` de catálogos.
- **Esperado:** abrir un formulario por segunda vez no pide nada.

### A6 · Limpieza barata — HECHO (2026-11-17)

> `Emiliano` `c56fe9f`, portado al refactor. Se borró `AuthContext.jsx`, se quitaron los 17
> `console.log` (en el refactor solo quedaba uno, el de Ventas) y `preload.js` devuelve la
> función de baja de las escuchas de actualización. Con esto se cierra la parte de front
> (A1–A6). Lo de Electron solo se puede comprobar en la app instalada.

- Borrar `src/auth/AuthContext.jsx` si de verdad nadie lo importa (confirmar con `grep`):
  trae un sondeo de permisos cada 15 s listo para revivir.
- Quitar los `console.log` que imprimen respuestas completas. Empezar por
  `src/screens/Finanzas.jsx` (`console.log(json)` con 758 KB) y revisar los otros 16.
- `preload.js`: que `onUpdateAvailable` y `onUpdateProgress` devuelvan una función que haga
  `ipcRenderer.removeListener`, y usarla en la limpieza de los `useEffect` de `App.jsx` y
  `Sidebar.jsx`.

### A7 · Compresión en el servidor — HECHO (2026-11-17)

> Emiliano subió `docs/backend/API.htaccess`. Medido después: `getAllGastos` 1 493 KB →
> 144 KB, `All_finanzas` 766 → 60 KB, `All_CL_Final` 80 → 4.8 KB, `get_safety_trips` 110 →
> 13 KB. **Falta que vuelva a subir el archivo:** la versión del repo ya trae activo el
> bloque que deja de servir los `.log`, y la que subió lo traía apagado.

- **Problema:** § 4. Ninguna respuesta va comprimida.
- **Listo para subir:** `docs/backend/API.htaccess` (2026-11-17). Es el `.htaccess` que
  ya había —solo apagaba el rewrite de WordPress— más el bloque `mod_deflate`. Se sube a
  `/public_html/API/.htaccess`. Para revertir, dejar solo el bloque de `mod_rewrite`.
- **Verificar:** `curl -s -H "Accept-Encoding: gzip" -D - -o /dev/null …` debe traer
  `Content-Encoding: gzip`; comparar tamaños de `getAllGastos` y `All_finanzas`. Probar
  también una petición **sin** ese encabezado y la app móvil (pedirle a Emiliano que abra
  una pantalla en el teléfono).
- **Riesgo:** bajo, pero es global. Si el hosting no tiene `mod_deflate`, la regla dentro
  de `<IfModule>` simplemente no hace nada.

### A8 · Caché en el mapa — HECHO (2026-11-17)

> Subido y medido. El archivo viejo había llegado a 21–22 s por consulta. Con el nuevo:
> 0.25 s cuando la respuesta está guardada y 2.8–3.9 s cuando toca refrescar (eso es lo
> que tarda Wialon solo). **Las direcciones siguen sin llegar:** las 12 unidades vienen con
> `address` vacío y el mapa enseña coordenadas. Nominatim tiene bloqueado al servidor;
> el archivo reintenta cada 30 min. Si en unos días no vuelven, toca cambiar de proveedor
> de direcciones, y eso lo decide Emiliano.

> `docs/backend/Tracking.php`, sintaxis revisada con `php-parser`. Al escribirlo se vio que
> **las 12 unidades ya salían «Unknown address»**: Nominatim está rechazando al servidor, y
> cada petición perdía ~6 s esperando esos fallos. El archivo nuevo guarda la respuesta
> 45 s, las direcciones 7 días por coordenada a 3 decimales, consulta como mucho 4 nuevas
> por actualización con 1.1 s entre ellas, y si fallan dos seguidas deja de intentar 30 min.
> Sin dirección manda `address` vacío y el mapa enseña coordenadas. `Emiliano` ya pide
> `${apiHost}/Tracking.php` en vez de la URL fija. **Al subirlo, medir:** la primera
> petición puede tardar lo de Wialon más los intentos de dirección; la segunda dentro de
> 45 s debe bajar de medio segundo. Si las direcciones siguen sin llegar, el servidor está
> bloqueado en Nominatim y habría que cambiar de proveedor (decisión de Emiliano).

- **Problema:** `Tracking.php` tarda entre 7 y 21 s. Con el archivo en la mano (llegó el
  2026-11-17) la causa no es Wialon sino **Nominatim**: después de pedirle las unidades a
  Wialon, hace una consulta de dirección a `nominatim.openstreetmap.org` **por cada
  camión, una tras otra**. El caché que trae es una variable `static`, que muere al
  terminar la petición: nunca ha guardado nada. Además Nominatim pide no pasar de una
  consulta por segundo; a este ritmo pueden bloquear al servidor.
- **Qué entregar:** `Tracking.php` completo, igual por fuera (misma respuesta
  `{status, units}` con `address` en cada unidad), con dos cachés en archivo dentro de una
  carpeta que no se sirva por web:
  1. La respuesta entera, 45 s. Dos mapas abiertos = una sola consulta a Wialon.
  2. La dirección por coordenada redondeada a 4 decimales (unos 11 m), 24 h. Un camión
     estacionado no vuelve a consultar; uno en movimiento, una vez por posición nueva.
  Con tope de consultas a Nominatim por petición (por ejemplo 5): a las que no alcancen se
  les deja la dirección anterior o vacía, y el front ya cae a `u.pos` y a coordenadas.
- **Cuidado:** que dos peticiones simultáneas con el caché vencido no consulten las dos
  (bloqueo con `flock`). `WialonService.php` no se conoce: no tocarlo, solo llamarlo igual.
  El archivo no despacha por `op`: cualquier petición lo ejecuta, y `Emiliano` lo llama con
  `GET` y por `http://` fijo (`src/screens/Mapas/Tracking.jsx:123`); de paso cambiarlo a
  `${apiHost}`.
- **Verificar:** medir con `curl` antes y después; la segunda petición dentro de 45 s debe
  responder en menos de medio segundo.

### A9 · Índices — DESCARTADO por Emiliano (2026-11-17)

> Emiliano decidió no ponerlos. La ganancia medida era de una décima de segundo. El SQL
> queda en `docs/sql/013-indices.sql` por si las tablas crecen; **no volver a proponerlo**
> salvo que él lo retome o diesel/IFTA se vuelvan lentos.

> `docs/sql/013-indices.sql`, tres envíos. `SHOW INDEX` confirmó que las tres tablas solo
> tienen su llave primaria. Se entregan `trip_id` en `diesel_tickets` e `IFTA_STATE`, y
> `id_register` en `diesel_tickets`. **Los dos de `documents` se dejaron fuera:** esa tabla
> se consulta por llave primaria vía `trip_document_relationship` y no hay evidencia de que
> filtrar por tipo o vencimiento sea un cuello. Tiempos antes de correrlo, para comparar:
> `getAll_diesel` ~0.39 s, `get_ifta_trips` y `get_registers_diesel` medidos en el chat.
> El SQL de la bitácora pasa a ser el `014`.

- `08-DIAGNOSTICO-BD.md` § 5.1 trae los cuatro `CREATE INDEX`. Entregarlos de uno en uno;
  phpMyAdmin de GoDaddy no tiene transacciones entre envíos.
- Verificar antes con `SHOW INDEX FROM diesel_tickets` que no existan ya: el dump es de
  septiembre.

### A10 · Paginación en el servidor — el más grande, dejar al final

- Admin gastos (1.48 MB) y Ventas (758 KB) cargan la lista entera.
- Necesita `save_expense.php` y `formularios.php`, y cambia cómo filtran esas pantallas:
  hoy filtran y suman en el navegador (el «Total filtrado» de las dos depende de tener todo).
  **Es un proyecto aparte; no empezarlo sin planearlo con Emiliano.** Con A7 hecho el
  tamaño en la red ya baja ~8 veces y puede que deje de urgir.

---

# Parte B · Bitácora de auditoría

Diseño completo en `10-BITACORA.md`. El alcance mínimo que cumple el requisito («registro
de acciones» y «consulta de logs») son las etapas 0, 1, 2 y 4. Las etapas 3 y 5 (antes y
después con triggers) son el segundo tiempo.

### B0 · Reunir lo que falta — sin esto no se escribe nada

Pedirle a Emiliano, todo junto:

1. `conexion.php` actual, completo.
2. El listado de archivos de `/API`.
3. El resultado de estas consultas en phpMyAdmin (solo leen):
   ```sql
   SHOW GRANTS;
   SHOW PROCEDURE STATUS WHERE Db = 'i8768260_wp1';
   SHOW TRIGGERS;
   ```
4. Sus cinco decisiones de `10-BITACORA.md` § 6 (cada una trae recomendación).

Con `conexion.php` en la mano, revisar si usa `PDO::ATTR_PERSISTENT` y **de paso** si fija
zona horaria: MySQL corre en MST, una hora atrás de la oficina. La bitácora guarda fechas,
así que hay que decidir con Emiliano si se guarda en UTC, en hora del servidor o se fija
`-06:00`. No cambiar la zona de la conexión sin preguntar: afecta a toda la API y al móvil.

#### Lo que ya llegó de B0 (2026-11-17)

Emiliano mandó `conexion.php`, el `.htaccess`, `Tracking.php`, el listado de `/API` y las
tres consultas. Lo que dicen:

- **`conexion.php` es mínimo:** una clase `Conexion` con `getConnection()` que abre un PDO
  nuevo cada vez que se llama. **No es persistente** (bien: las variables `@ima_*` no se
  heredan entre peticiones). No fija juego de caracteres ni zona horaria. Las credenciales
  vienen de `config.php` (`DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`) — **no pedir ese
  archivo**, trae la contraseña.
- **Un PHP puede abrir varias conexiones en la misma petición** (`Notifications.php` hace
  `new Conexion()` dentro de cada `case`; otros lo hacen por función). Consecuencia para el
  diseño: el `SET @ima_peticion, @ima_usuario` va dentro de `getConnection()`, en **cada**
  conexión, con el mismo identificador de petición guardado en una variable estática; y la
  fila de `bitacora` se inserta una sola vez al terminar el script.
- **Si la conexión falla, `conexion.php` hace `echo` del error** y devuelve `null`. La
  bitácora no debe empeorar eso: nada de la librería puede escribir a la salida.
- **`SHOW GRANTS` no sirvió:** respondió por el usuario temporal de phpMyAdmin
  (`cpses_…`), no por el de la app. Sigue sin saberse si el usuario de la app tiene el
  privilegio `TRIGGER`. Solo importa para B5; se averigua entonces con un PHP de un solo
  uso que haga `SHOW GRANTS` con la conexión de la app.
- **Procedimientos:** 43. Todos a nombre de `root@localhost` salvo `crud_diesel` (ya en
  `INVOKER`) y dos a nombre de `root@<ip>`: `crud_inspecciones` (`root@189.203.182.94`) y
  `get_trips_details_user` (`root@187.190.172.94`). Si esos usuarios no existen, fallarían
  con el 1449 al llamarlos; hoy nadie se ha quejado, así que o existen o no se usan.
  `sp_prueba` es un resto de pruebas.
- **Triggers:** uno solo, `after_diesel_insert` sobre `diesel`. La etapa de triggers
  empieza en limpio; en `diesel` habrá dos `AFTER INSERT`, que MariaDB 10.11 permite.
- **Archivos de `/API` que no pasan por la app:** `job_consumo_diesel.php` y
  `job_distancia_nv_laredo.php` (procesos automáticos; si incluyen `conexion.php` saldrán
  en la bitácora sin usuario, y está bien), `test.php`, `Ping.php`, `formularios2.php`,
  y las variantes `_v2`. Hay 46 PHP de entrada, no 39.
- **Registros públicos:** `diesel_job.log` (28 MB) y `dist_nv_laredo.log` (5 MB) se pueden
  bajar desde el navegador. No se abrió su contenido. El bloque para cerrarlos va, apagado,
  en `docs/backend/API.htaccess`; activarlo es decisión de Emiliano.

**B0 completo (2026-11-17).** Emiliano tomó las decisiones: solo escrituras, Admin más
permiso `bitacora_ver`, 24 meses, hora en UTC mostrada en Monterrey. Ver `10-BITACORA.md` § 6.

### B1 · Tablas — `014-bitacora.sql` — ENTREGADO, falta correr (2026-11-17)

> Dos envíos. La columna de fecha es `fecha_utc` sin valor por omisión: la llena quien
> inserta, con `UTC_TIMESTAMP()`.

- Las dos tablas de `10-BITACORA.md` § 3. No las lee nadie todavía: riesgo nulo.
- Un envío por tabla. Verificar con `SHOW CREATE TABLE`.

### B2 · Registro por petición — ENTREGADO, falta subir (2026-11-17)

> `docs/backend/bitacora_lib.php` (nuevo) y `docs/backend/conexion.php` (el de producción
> más un `include_once` dentro de `try/catch`, que también atrapa un error de sintaxis de
> la librería). Sintaxis revisada con `php-parser`. Cómo quedó, distinto de lo que decía
> el diseño:
> - **No hace `SET @ima_*` en cada conexión todavía.** Solo hace falta para los triggers
>   (B5); se agrega entonces. Así B2 no toca ninguna conexión de la API.
> - **La fila se escribe con una conexión propia al final** (`register_shutdown_function`),
>   no con la del PHP: no se mezcla con una transacción a medias.
> - **Lecturas por patrón de nombre** (`get*`, `All_*`, …) más `trip_summary` y
>   `residuo_trip`. De las 119 operaciones del inventario, 51 se registran.
> - **Usuario:** `_usuario` (lo pondrá B3) o `id_usuario`. No `user_id`, que en varios PHP
>   es la persona afectada.
> - **Resultado:** lee `status` y `message` de los primeros 4 KB de la respuesta, copiados
>   con un `ob_start` que se vacía cada 8 KB (la respuesta sale igual). Antes de escribir
>   suelta la respuesta y llama `fastcgi_finish_request`.
>
> Orden: correr `014-bitacora.sql`, subir `bitacora_lib.php`, guardar copia de
> `conexion.php` y subir el nuevo. Verificación en `12-PLAN` § B2 del chat del 2026-11-17.

- Es el paso delicado: `conexion.php` lo cargan todos los PHP. Todo dentro de `try/catch`,
  copia `.ANTERIOR` y prueba inmediata de inicio de sesión, una lectura y una escritura.
- Entregar `conexion.php` completo ya modificado, armado a partir del que mande Emiliano y
  comparado línea por línea (como se hizo con `Notifications.php`).
- Verificar que **no** quedan contraseñas: tras un inicio de sesión de prueba,
  `SELECT datos FROM bitacora WHERE archivo = 'Auth.php'`.
- Dejar correr una semana y medir filas y MB por día antes de seguir.

### B3 · Que cada petición diga quién es — HECHO y verificado (2026-11-17)

> Emiliano confirmó desde `localhost:5173`: las filas nuevas salen con `Desktop 1.6.0` y su
> usuario. B1, B2 y B4 también están en producción.

> `Emiliano` `9944e45`, portado al refactor (`shared/api/identidad.js`). Antes de esto,
> Emiliano probó B2 en Notificaciones manager: las altas salían con usuario (mandan
> `id_usuario`) y las bajas sin él. Con `_usuario` en toda petición eso se cierra, pero
> **solo a partir de la versión publicada que lo incluya**: las máquinas con 1.6.0 seguirán
> registrando sin usuario. Falta la app móvil (otro repo).

- Envoltorio de `fetch` en `Emiliano` (`src/main.jsx` + un archivo nuevo en `src/utils/`):
  si la URL es de `VITE_API_HOST`, agrega `_usuario` y `_app` al `FormData` o al cuerpo.
- Cuidado con los tres tipos de cuerpo que usa la app: `FormData`, texto
  `application/x-www-form-urlencoded` (`body: 'op=…'`) y `URLSearchParams`. Pruebas para
  los tres, y para una URL que no sea de la API (no debe tocarla).
- Portarlo al refactor (`shared/api/client.js` para lo migrado; el envoltorio para los
  `fetch` sueltos que queden).
- La app móvil es otro repo (`App-operadores-react-native-expo`): mismo envoltorio en
  `app/_layout.tsx`, sale con su próxima publicación.

### B4 · Pantalla de Bitácora — HECHO en el front, falta subir PHP y SQL (2026-11-17)

> `Emiliano` `3af8cf9`; refactor `entities/audit` + `pages/bitacora/BitacoraPage.jsx`.
> Servidor: `docs/backend/bitacora.php` (`listar`, `detalle`, `getFiltros`; las tres con
> nombre de lectura para que la bitácora no se registre a sí misma; comprueba con
> `_usuario` que sea Admin o tenga `bitacora_ver`; `SET NAMES utf8mb4`) y
> `docs/sql/015-permiso-bitacora.sql`. Sintaxis revisada con `php-parser`. Ruta `/bitacora`,
> entrada propia en el menú. `bitacora_ver` no entró a `shared/auth/permisos.js` (catálogo
> amarrado por pruebas); se lee de los ajustes por usuario, como Pagos US/MX.

- PHP nuevo con `listar` (paginado en el servidor desde el primer día), `detalle` e
  `historial`.
- Permiso nuevo `bitacora_ver`: fila en `features` (SQL), entrada en `menuConfig.js`. Mismo
  patrón que `012-permisos-pagos-us-mx.sql`. **No** agregarlo a
  `shared/auth/permisos.js` del refactor sin actualizar también `docs/ROLES-Y-PERMISOS.md`
  y `docs/sql/001-roles-y-permisos.sql`: hay pruebas que exigen que los tres coincidan.
- Pantalla con el estilo de Safety y Pago a Operadores (`src/styles/estilosTabla.js`).
- Diccionario `archivo.op → texto` para que se lea «Borró un gasto» y no `delete_gasto`.

### B5 en adelante · Triggers de antes y después

> **Diagnóstico del 2026-11-17** (`bitacora_diagnostico.php`, borrado del servidor después):
> el usuario de la app (`fg5n48ine0xu@…`) tiene `ALL PRIVILEGES` sobre la base, así que
> **puede crear triggers**, y creados con su conexión quedan con un DEFINER permanente, no
> el temporal de phpMyAdmin. Existen las 18 tablas candidatas; su estructura quedó en
> `docs/sql/bitacora-esquema-2026-11-17.json`. Solo hay un trigger previo,
> `after_diesel_insert` (root). `pagos_semanales` está vacía. La bitácora tenía 6 filas
> con 52 bytes de datos en promedio: muy poco para proyectar.
>
> Ojo: el archivo se subió como `bitácora_diagnostico.php` (con acento, lo puso el sistema
> de Emiliano). Al pedir que suba algo, avisar que revise el nombre exacto.

**Primera tanda — INSTALADA (2026-11-17).** Los 21 creados con DEFINER `fg5n48ine0xu@…` (permanente). Falta la prueba de Emiliano editando un gasto. Emiliano eligió: `gastos`,
`detalles_gasto`, `diesel`, `trip_stages`, `trip_payments`, `user_feature_flags`,
`Users_credentials` (sin `pass` ni `push_token`). 21 triggers (alta, cambio, borrado),
generados con `docs/sql/generar-triggers-bitacora.py`; copia para revisar en
`docs/sql/016-bitacora-triggers.sql`. Al editar guardan solo las columnas que cambiaron.
Se instalan con `docs/backend/bitacora_triggers.php` (clave de un solo uso; `accion=crear`,
`accion=quitar`). Requieren el `conexion.php` y la `bitacora_lib.php` nuevos, que marcan
cada conexión con `@ima_usuario` y `@ima_peticion` (`Bitacora::alConectar`). 

**Segunda tanda — ENTREGADA, falta instalar (2026-11-17):** `trips` (sin `ruta_wialon`, que es
enorme y la escribe un proceso), `ordenes_servicio`, `orden_servicio_detalles`,
`pago_trayectos_mx`, `notif_suscriptores`. 15 triggers en `docs/sql/017-…tanda-2.sql`. El
instalador lleva las dos tandas (36); `accion=crear` recrea todos, sin efecto sobre los ya
creados. El generador ahora escribe un `.sql` por tanda.

Etapas 3 y 5 de `10-BITACORA.md`. **No crearlos desde phpMyAdmin de cPanel** (error 1449,
el mismo que tumbó `crud_diesel` el 2026-11-17). Se crean desde un PHP de un solo uso con
el usuario de la app. Requiere el privilegio `TRIGGER` (sale de B0).

---

# Parte C · Pendientes sueltos

Cosas abiertas que no son de A ni de B, para que no se pierdan:

- **Publicar una versión.** Todo lo de noviembre está en las ramas pero no en las máquinas.
  Los permisos de Pagos por país, el filtro de Q4 y el aviso de actualización con la app
  abierta solo existen a partir de esa versión.
- **Probar el aviso al operador al pagar** (`Mobile.php send_push`) con un operador de
  confianza antes de publicar. Nunca había funcionado: iba a `localhost`.
- **Repartir las pestañas de Pagos** en el Gestor de accesos: hoy quien tiene Pagos ve US y MX.
- **`IFTA.php op=periodos`** respondía «Operación no válida» el 2026-11-13. Necesita a
  Richard o el archivo.
- **Avisarle a Richard** que guardar procedimientos desde phpMyAdmin de cPanel los rompe,
  salvo que conserven `SQL SECURITY INVOKER`.
- **Seguridad de la API** (HTTPS en el `.env`, `get_users` sin `pass`, sesión real): en
  espera por decisión de Emiliano. No empezar sin que lo pida. El certificado vence el
  2026-12-10.
- **Migrar BL e Inspecciones con fallas a `notif_suscriptores`**, para que Notificaciones
  manager tenga una sola fuente. Opcional.
