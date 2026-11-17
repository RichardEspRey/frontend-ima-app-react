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

### A1 · Cachear el catálogo de nomenclaturas — el que más ahorra

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

### A2 · Quitar la petición de permisos en cada foco

- **Problema:** § 3.3. `src/components/Sidebar.jsx:82-91`.
- **Qué hacer:** borrar ese `useEffect` entero. `DashboardLayout.jsx` ya pide los permisos
  al entrar, cada 5 min y al volver a mostrar la ventana si ya tocaba.
- **Cuidado:** comprobar que `DashboardLayout` los pide al montar (hoy usa
  `alIniciar: false` porque contaba con que Sidebar lo hacía). Si es así, pasarlo a
  `alIniciar: true` o dejar en Sidebar solo la petición inicial, sin el `focus`.
- **Esperado:** desaparece una petición por cada cambio de ventana.

### A3 · Que Sidebar no repita las inspecciones

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

### A4 · Nomenclatura de los BL sin un `getById` por notificación

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

### A5 · Caché en los catálogos de los formularios

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

### A6 · Limpieza barata

- Borrar `src/auth/AuthContext.jsx` si de verdad nadie lo importa (confirmar con `grep`):
  trae un sondeo de permisos cada 15 s listo para revivir.
- Quitar los `console.log` que imprimen respuestas completas. Empezar por
  `src/screens/Finanzas.jsx` (`console.log(json)` con 758 KB) y revisar los otros 16.
- `preload.js`: que `onUpdateAvailable` y `onUpdateProgress` devuelvan una función que haga
  `ipcRenderer.removeListener`, y usarla en la limpieza de los `useEffect` de `App.jsx` y
  `Sidebar.jsx`.

### A7 · Compresión en el servidor — el mayor ahorro de datos, toca producción

- **Problema:** § 4. Ninguna respuesta va comprimida.
- **Necesita de Emiliano:** el `.htaccess` actual de `/API` (o confirmar que no existe).
- **Qué entregar:** un bloque `mod_deflate` para `application/json`, con la copia del
  archivo anterior y la instrucción de cómo revertir.
- **Verificar:** `curl -s -H "Accept-Encoding: gzip" -D - -o /dev/null …` debe traer
  `Content-Encoding: gzip`; comparar tamaños de `getAllGastos` y `All_finanzas`. Probar
  también una petición **sin** ese encabezado y la app móvil (pedirle a Emiliano que abra
  una pantalla en el teléfono).
- **Riesgo:** bajo, pero es global. Si el hosting no tiene `mod_deflate`, la regla dentro
  de `<IfModule>` simplemente no hace nada.

### A8 · Caché de Wialon en el mapa — toca producción

- **Problema:** § 4. `Tracking.php get_dashboard` tarda 7.7 s y consulta a Wialon siempre.
- **Necesita de Emiliano:** `Tracking.php` completo.
- **Qué entregar:** guardar la respuesta 30 a 60 s (archivo temporal o tabla de una fila) y
  servirla a quien pregunte dentro de ese margen.
- **Cuidado:** que dos peticiones simultáneas con el caché vencido no consulten las dos.

### A9 · Índices — riesgo casi nulo, toca producción

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

### B1 · Tablas — `013-bitacora.sql`

- Las dos tablas de `10-BITACORA.md` § 3. No las lee nadie todavía: riesgo nulo.
- Un envío por tabla. Verificar con `SHOW CREATE TABLE`.

### B2 · Registro por petición — `bitacora_lib.php` + 3 líneas en `conexion.php`

- Es el paso delicado: `conexion.php` lo cargan todos los PHP. Todo dentro de `try/catch`,
  copia `.ANTERIOR` y prueba inmediata de inicio de sesión, una lectura y una escritura.
- Entregar `conexion.php` completo ya modificado, armado a partir del que mande Emiliano y
  comparado línea por línea (como se hizo con `Notifications.php`).
- Verificar que **no** quedan contraseñas: tras un inicio de sesión de prueba,
  `SELECT datos FROM bitacora WHERE archivo = 'Auth.php'`.
- Dejar correr una semana y medir filas y MB por día antes de seguir.

### B3 · Que cada petición diga quién es — front

- Envoltorio de `fetch` en `Emiliano` (`src/main.jsx` + un archivo nuevo en `src/utils/`):
  si la URL es de `VITE_API_HOST`, agrega `_usuario` y `_app` al `FormData` o al cuerpo.
- Cuidado con los tres tipos de cuerpo que usa la app: `FormData`, texto
  `application/x-www-form-urlencoded` (`body: 'op=…'`) y `URLSearchParams`. Pruebas para
  los tres, y para una URL que no sea de la API (no debe tocarla).
- Portarlo al refactor (`shared/api/client.js` para lo migrado; el envoltorio para los
  `fetch` sueltos que queden).
- La app móvil es otro repo (`App-operadores-react-native-expo`): mismo envoltorio en
  `app/_layout.tsx`, sale con su próxima publicación.

### B4 · Pantalla de Bitácora — `bitacora.php` + front

- PHP nuevo con `listar` (paginado en el servidor desde el primer día), `detalle` e
  `historial`.
- Permiso nuevo `bitacora_ver`: fila en `features` (SQL), entrada en `menuConfig.js`. Mismo
  patrón que `012-permisos-pagos-us-mx.sql`. **No** agregarlo a
  `shared/auth/permisos.js` del refactor sin actualizar también `docs/ROLES-Y-PERMISOS.md`
  y `docs/sql/001-roles-y-permisos.sql`: hay pruebas que exigen que los tres coincidan.
- Pantalla con el estilo de Safety y Pago a Operadores (`src/styles/estilosTabla.js`).
- Diccionario `archivo.op → texto` para que se lea «Borró un gasto» y no `delete_gasto`.

### B5 en adelante · Triggers de antes y después

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
