<!-- Generado por 'npm run docs:api'. NO editar a mano: edita el JSDoc. -->

## Classes

<dl>
<dt><a href="#ApiError">ApiError</a></dt>
<dd><p>Error de una llamada a la API de IMA.</p>
<p>Separa el mensaje que se le enseña a la persona del detalle técnico que va al
log. La API responde HTTP 200 incluso cuando falla —el fallo viaja en
<code>{status:&#39;error&#39;}</code>— así que sin esta clase cada pantalla tiene que decidir
por su cuenta qué significa un error, que es lo que pasa hoy.</p>
</dd>
</dl>

## Constants

<dl>
<dt><a href="#EN_PRUEBAS">EN_PRUEBAS</a> : <code>boolean</code></dt>
<dd><p>Bajo test, la caché se recolecta de inmediato y no se reintenta nada.</p>
<p>El smoke test monta las 61 rutas en la misma sesión; sin esto, la caché de una
ruta sobrevive a la siguiente y los tests dependen del orden en que corren.
Los reintentos tampoco aportan nada cuando <code>fetch</code> está simulado.</p>
</dd>
<dt><a href="#FRESCURA_CATALOGO_MS">FRESCURA_CATALOGO_MS</a> : <code>number</code></dt>
<dd><p>Tiempo que un catálogo se considera fresco. Conductores, camiones, cajas y
almacenes cambian de vez en cuando, no dentro de una sesión de trabajo: no
tiene sentido volver a pedirlos en cada pantalla que los use.</p>
</dd>
<dt><a href="#TODOS_LOS_PERMISOS">TODOS_LOS_PERMISOS</a> : <code>Array.&lt;string&gt;</code></dt>
<dd><p>Todos los permisos existentes, sin repetir.</p>
</dd>
<dt><a href="#ROLES_TOTALES">ROLES_TOTALES</a> : <code>Set.&lt;string&gt;</code></dt>
<dd><p>Roles que ven toda la aplicación sin pasar por la comprobación de permisos.</p>
<p>Es deliberadamente un solo rol. Sustituye los cinco <code>ADMIN_TYPES</code> sueltos que
hoy están declarados por separado en <code>useAuthStore</code>, <code>Sidebar</code>, <code>AccessManager</code>,
<code>AdminGastos</code> y <code>AdminOrdenesServicio</code>.</p>
</dd>
<dt><a href="#API_BASE">API_BASE</a> : <code>string</code></dt>
<dd><p>URL base de la API PHP, sin barra final.</p>
<p>Es el único punto del proyecto que lee <code>VITE_API_HOST</code>. Cuando el hosting
tenga TLS funcionando, cambiar a <code>https://</code> se hace aquí y en <code>.env</code>,
no en las 96 pantallas que antes lo leían por su cuenta.</p>
</dd>
<dt><a href="#TIMEOUT_PETICION_MS">TIMEOUT_PETICION_MS</a> : <code>number</code></dt>
<dd><p>Milisegundos que espera una petición antes de abortarse.</p>
</dd>
<dt><a href="#ZOOM_MAXIMO_TILES">ZOOM_MAXIMO_TILES</a> : <code>number</code></dt>
<dd><p>Zoom máximo que sirven los tiles de OpenStreetMap. Pedir más devuelve 404 y
deja el mapa en gris.</p>
</dd>
<dt><a href="#esVacio">esVacio</a> ⇒ <code>boolean</code></dt>
<dd><p>Indica si un valor debe tratarse como vacío al ordenar.</p>
</dd>
<dt><a href="#compararValores">compararValores</a> ⇒ <code>number</code></dt>
<dd><p>Compara dos valores del mismo campo.</p>
<p>Los números se comparan como números; el resto como texto en español con
<code>numeric: true</code>, para que &quot;Caja 10&quot; quede después de &quot;Caja 9&quot; y no antes.</p>
</dd>
<dt><a href="#siguienteOrden">siguienteOrden</a> ⇒ <code>Object</code></dt>
<dd><p>Calcula el siguiente estado al hacer clic en una cabecera de columna.</p>
<p>El ciclo tiene tres pasos: ascendente, descendente y sin orden. El tercero
importa: permite volver al orden natural que trae la API sin recargar.</p>
</dd>
<dt><a href="#ordenarPor">ordenarPor</a> ⇒ <code>Array</code></dt>
<dd><p>Ordena una lista según un orden y un mapa de accesores.</p>
<p>Los valores vacíos van <strong>siempre al final</strong>, suban o bajen los demás: una fila
sin fecha estorba igual arriba que abajo, y verlas agrupadas es más útil que
verlas saltar de extremo con cada clic.</p>
<p>No muta la lista original.</p>
</dd>
<dt><a href="#notify">notify</a></dt>
<dd><p>Avisos al usuario, en un solo lugar.</p>
<p>Hoy el proyecto usa <strong>tres</strong> librerías para lo mismo: <code>sweetalert2</code> (343
llamadas en 56 archivos), <code>react-toastify</code> (una) y <code>@pablotheblink/flashyjs</code>
(nueve). Este módulo envuelve sweetalert2, que es la que domina, para que las
otras dos se puedan ir retirando módulo por módulo y para que cambiar de
librería sea editar este archivo en vez de 56.</p>
<p>Cada función devuelve una promesa, así que se puede esperar el cierre.</p>
</dd>
<dt><a href="#LLAVE_PERIODOS">LLAVE_PERIODOS</a> : <code>Array.&lt;string&gt;</code></dt>
<dd><p>Llave de caché de los periodos de nómina.</p>
</dd>
<dt><a href="#llaveDetalle">llaveDetalle</a> ⇒ <code>Array.&lt;string&gt;</code></dt>
<dd><p>Llave de caché del desglose de un periodo.</p>
</dd>
<dt><a href="#tipoNomina">tipoNomina</a></dt>
<dd><p>Normaliza el tipo de nómina igual que en <code>entities/personal</code>: <code>MX</code>, o <code>US</code>
para todo lo demás. Está aquí también porque <code>pagos_admin.php</code> es otro
endpoint y podría devolver el campo con otra forma.</p>
</dd>
<dt><a href="#esquemaPeriodo">esquemaPeriodo</a></dt>
<dd><p>Semana de nómina, tal como la devuelve <code>pagos_admin.php</code> · <code>get_weeks</code>.</p>
<p><code>fecha_corte</code> llega como <code>&quot;2026-08-31 00:00:00&quot;</code> y se recorta al día: la
pantalla solo muestra la fecha, y el código anterior hacía
<code>fecha_corte.split(&#39; &#39;)[0]</code> sin comprobar que existiera — con un corte nulo,
la tabla entera reventaba.</p>
</dd>
<dt><a href="#esquemaDetallePago">esquemaDetallePago</a></dt>
<dd><p>Renglón del desglose de una semana, de <code>pagos_admin.php</code> · <code>get_details</code>.</p>
</dd>
<dt><a href="#estaPendiente">estaPendiente</a> ⇒ <code>boolean</code></dt>
<dd><p>Indica si una semana todavía admite cambios.</p>
</dd>
<dt><a href="#plantillaTotal">plantillaTotal</a> ⇒ <code>number</code></dt>
<dd><p>Suma la plantilla de una semana, sin importar la divisa.</p>
</dd>
<dt><a href="#etiquetaPeriodo">etiquetaPeriodo</a> ⇒ <code>string</code></dt>
<dd><p>Etiqueta legible de una semana, para encabezados y confirmaciones.</p>
</dd>
<dt><a href="#LLAVE_PERSONAL">LLAVE_PERSONAL</a> : <code>Array.&lt;string&gt;</code></dt>
<dd><p>Llave de caché de la lista de personal. Las mutaciones la invalidan para que
la tabla se actualice sola, sin que la pantalla tenga que volver a pedirla.</p>
</dd>
<dt><a href="#numeroDePhp">numeroDePhp</a></dt>
<dd><p>Número que llega de PHP. MySQL devuelve los DECIMAL como cadena
(<code>&quot;1500.00&quot;</code>), así que se coacciona en vez de exigir <code>number</code>.</p>
</dd>
<dt><a href="#idDePhp">idDePhp</a></dt>
<dd><p>Identificador que llega de PHP, siempre como cadena en las respuestas.</p>
</dd>
<dt><a href="#esquemaEmpleado">esquemaEmpleado</a></dt>
<dd><p>Forma de un empleado tal como lo devuelve <code>personal_admin.php</code>.</p>
<p>Es deliberadamente tolerante con lo que no afecta al render: <code>.catch()</code> pone
un valor por omisión en vez de tirar la lista entera porque un registro traiga
un campo raro. Lo que sí es obligatorio es <code>id</code> y <code>nombre</code>: sin eso la fila no
se puede ni pintar ni editar.</p>
<p><code>frecuencia_pago</code> se lee tal cual, sin enum: forzarla a un valor conocido
cambiaría en silencio el significado de un registro que traiga algo distinto.
El enum sí se aplica al <strong>escribir</strong>, en <code>esquemaFormularioEmpleado</code>, porque
ahí el valor sale de un select controlado.</p>
</dd>
<dt><a href="#esquemaFormularioEmpleado">esquemaFormularioEmpleado</a></dt>
<dd><p>Valida los datos del formulario antes de mandarlos.</p>
<p><code>id</code> ausente significa alta; presente, edición.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#construirFormData">construirFormData(op, [payload])</a> ⇒ <code>FormData</code></dt>
<dd><p>Convierte un objeto plano en el <code>FormData</code> que espera la API PHP.</p>
<p>Omite <code>undefined</code> y <code>null</code> en vez de mandarlos: <code>FormData</code> los serializa como
las cadenas <code>&quot;undefined&quot;</code> y <code>&quot;null&quot;</code>, y PHP las recibe como texto, que es de
donde salen los campos con el literal &quot;undefined&quot; guardado en la base.
Los booleanos van como <code>1</code>/<code>0</code>, que es lo que el backend interpreta.</p>
</dd>
<dt><a href="#post">post(endpoint, op, [payload], [opciones])</a> ⇒ <code>Promise.&lt;object&gt;</code></dt>
<dd><p>Llama a una operación de la API de IMA.</p>
<p>Concentra lo que hoy está repetido en 232 llamadas sueltas: armar el
<code>FormData</code>, poner el <code>op</code>, abortar por tiempo, y traducir la respuesta a un
valor o a un <code>ApiError</code>. La API contesta HTTP 200 aunque falle —el fallo va
en <code>{status:&#39;error&#39;}</code>— así que aquí es donde eso se convierte en excepción.</p>
</dd>
<dt><a href="#postLista">postLista(endpoint, op, [opciones])</a> ⇒ <code>Promise.&lt;Array&gt;</code></dt>
<dd><p>Igual que <a href="#post">post</a>, pero devuelve directo el arreglo del campo indicado.</p>
<p>Casi todas las pantallas hacen lo mismo con la respuesta: comprobar el status
y quedarse con una lista. Cuando la API responde bien pero sin esa clave,
devuelve <code>[]</code> en vez de <code>undefined</code>, que es el origen de la mitad de los
&quot;cannot read properties of undefined&quot; del proyecto.</p>
</dd>
<dt><a href="#debeReintentar">debeReintentar(intentosPrevios, error)</a> ⇒ <code>boolean</code></dt>
<dd><p>Decide si TanStack Query debe reintentar una consulta fallida.</p>
<p>Solo se reintenta lo que puede arreglarse solo —red caída, tiempo agotado—.
Un error de negocio (&quot;ese empleado ya existe&quot;) daría el mismo resultado tres
veces y solo retrasaría el mensaje.</p>
</dd>
<dt><a href="#crearQueryClient">crearQueryClient()</a> ⇒ <code>object</code></dt>
<dd><p>Crea el cliente de TanStack Query con la configuración del proyecto.</p>
<p>Se crea con una función y no como constante de módulo para que cada test
pueda tener el suyo: una caché compartida entre tests los vuelve dependientes
del orden en que corren.</p>
</dd>
<dt><a href="#calcularPermisosEfectivos">calcularPermisosEfectivos(rol, [ajustesUsuario])</a> ⇒ <code>Set.&lt;string&gt;</code></dt>
<dd><p>Calcula los permisos que realmente tiene una persona.</p>
<p>La fórmula es <code>paquete del rol ∪/∖ ajustes del usuario</code>:</p>
<ol>
<li>El <strong>rol</strong> da el paquete de arranque.</li>
<li>Los <strong>ajustes por usuario</strong> de <code>features.php</code> mandan encima, y pueden tanto
conceder algo que el rol no trae como quitar algo que sí traía. Un flag en
<code>false</code> es una negación explícita, no una ausencia.</li>
<li>Un rol total (hoy solo Administrador) ve todo y no pasa por lo anterior.</li>
</ol>
<p>Ese orden importa para migrar sin sustos: mientras los ajustes por usuario
sigan existiendo, cambiar el paquete de un rol no le quita nada a nadie que ya
lo tuviera concedido a mano.</p>
</dd>
<dt><a href="#crearComprobador">crearComprobador(permisosEfectivos, [esTotal])</a> ⇒ <code>function</code></dt>
<dd><p>Construye la función <code>can</code> que usan los componentes.</p>
<p>Devolver una función en vez de exponer el <code>Set</code> mantiene a los componentes
ignorantes de cómo se calculan los permisos: el día que la fase 2 los emita en
un token firmado, <code>can</code> sigue igual.</p>
</dd>
<dt><a href="#normalizarRol">normalizarRol(crudo)</a> ⇒ <code>string</code></dt>
<dd><p>Normaliza un valor de rol al catálogo canónico.</p>
<p>Es el mismo patrón que <code>normalizarSubcategoria</code> en el backend, y por la misma
razón: deja la aplicación consistente <strong>hoy</strong> sin depender de que la base de
datos migre primero, que en producción no tiene red de seguridad. Cuando la
migración ocurra, esta función se queda como camino de lectura hasta que ya no
aplique a nadie y entonces se borra.</p>
<p>Un valor desconocido cae a <code>CONSULTA</code>, el rol de <strong>menor</strong> privilegio: un rol
que nadie reconoce no debe abrir puertas.</p>
</dd>
<dt><a href="#obtenerCompanias">obtenerCompanias([opciones])</a> ⇒ <code>Promise.&lt;Array&gt;</code></dt>
<dd><p>Compañías dadas de alta.</p>
</dd>
<dt><a href="#useCompanias">useCompanias()</a> ⇒ <code>object</code></dt>
<dd><p>Compañías dadas de alta.</p>
<p>Es un catálogo: se cachea <a href="#FRESCURA_CATALOGO_MS">FRESCURA_CATALOGO_MS</a> y se comparte entre
todas las pantallas que lo pidan, así que varias a la vez hacen una sola
petición en lugar de una cada una.</p>
</dd>
<dt><a href="#obtenerConductoresActivos">obtenerConductoresActivos([opciones])</a> ⇒ <code>Promise.&lt;Array&gt;</code></dt>
<dd><p>Conductores activos, para los selectores de viaje.</p>
</dd>
<dt><a href="#useConductoresActivos">useConductoresActivos()</a> ⇒ <code>object</code></dt>
<dd><p>Conductores activos, para los selectores de viaje.</p>
<p>Es un catálogo: se cachea <a href="#FRESCURA_CATALOGO_MS">FRESCURA_CATALOGO_MS</a> y se comparte entre
todas las pantallas que lo pidan, así que varias a la vez hacen una sola
petición en lugar de una cada una.</p>
</dd>
<dt><a href="#obtenerConductoresActivosCompletos">obtenerConductoresActivosCompletos([opciones])</a> ⇒ <code>Promise.&lt;Array&gt;</code></dt>
<dd><p>Conductores activos con los campos extra que pide la edición completa de viaje.</p>
</dd>
<dt><a href="#useConductoresActivosCompletos">useConductoresActivosCompletos()</a> ⇒ <code>object</code></dt>
<dd><p>Conductores activos con los campos extra que pide la edición completa de viaje.</p>
<p>Es un catálogo: se cachea <a href="#FRESCURA_CATALOGO_MS">FRESCURA_CATALOGO_MS</a> y se comparte entre
todas las pantallas que lo pidan, así que varias a la vez hacen una sola
petición en lugar de una cada una.</p>
</dd>
<dt><a href="#obtenerPeriodos">obtenerPeriodos([opciones])</a> ⇒ <code>Promise.&lt;Array.&lt;Periodo&gt;&gt;</code></dt>
<dd><p>Trae todas las semanas de nómina, validadas.</p>
</dd>
<dt><a href="#obtenerDetalle">obtenerDetalle(parametros)</a> ⇒ <code>Promise.&lt;Array.&lt;DetallePago&gt;&gt;</code></dt>
<dd><p>Trae el desglose por empleado de una semana.</p>
</dd>
<dt><a href="#autorizarPeriodo">autorizarPeriodo(periodo)</a> ⇒ <code>Promise.&lt;object&gt;</code></dt>
<dd><p>Cierra el corte de una semana. <strong>Es irreversible desde la app.</strong></p>
</dd>
<dt><a href="#usePeriodos">usePeriodos()</a> ⇒ <code>object</code></dt>
<dd><p>Semanas de nómina, cacheadas.</p>
</dd>
<dt><a href="#useDetallePeriodo">useDetallePeriodo(periodo)</a> ⇒ <code>object</code></dt>
<dd><p>Desglose de una semana. No se dispara hasta tener los datos del periodo.</p>
</dd>
<dt><a href="#useAutorizarPeriodo">useAutorizarPeriodo()</a> ⇒ <code>object</code></dt>
<dd><p>Autoriza una semana y refresca la lista al terminar.</p>
</dd>
<dt><a href="#normalizarLista">normalizarLista(filas, esquema)</a> ⇒ <code>Object</code></dt>
<dd><p>Valida una lista descartando lo que no cumple lo mínimo.</p>
<p>Un registro roto se omite y se cuenta, en vez de dejar pasar <code>undefined</code> hacia
el render y tumbar la pantalla entera por una fila mala.</p>
</dd>
<dt><a href="#obtenerPersonal">obtenerPersonal([opciones])</a> ⇒ <code>Promise.&lt;Array.&lt;Empleado&gt;&gt;</code></dt>
<dd><p>Trae todo el personal de nómina, validado.</p>
</dd>
<dt><a href="#guardarEmpleado">guardarEmpleado(empleado)</a> ⇒ <code>Promise.&lt;object&gt;</code></dt>
<dd><p>Da de alta o actualiza un empleado, según traiga <code>id</code> o no.</p>
</dd>
<dt><a href="#eliminarEmpleado">eliminarEmpleado(id)</a> ⇒ <code>Promise.&lt;object&gt;</code></dt>
<dd><p>Elimina un empleado. El historial de pagos previos se conserva.</p>
</dd>
<dt><a href="#usePersonal">usePersonal()</a> ⇒ <code>object</code></dt>
<dd><p>Lista de personal, cacheada y compartida entre componentes.</p>
<p>Dos pantallas que la pidan a la vez hacen <strong>una</strong> sola petición, y al volver
de otra vista la tabla se pinta al instante con lo cacheado mientras se
revalida en segundo plano.</p>
</dd>
<dt><a href="#useGuardarEmpleado">useGuardarEmpleado()</a> ⇒ <code>object</code></dt>
<dd><p>Guarda un empleado y refresca la lista al terminar.</p>
</dd>
<dt><a href="#useEliminarEmpleado">useEliminarEmpleado()</a> ⇒ <code>object</code></dt>
<dd><p>Elimina un empleado y refresca la lista al terminar.</p>
</dd>
<dt><a href="#normalizarEmpleados">normalizarEmpleados(filas)</a> ⇒ <code>Object</code></dt>
<dd><p>Valida y normaliza la lista de empleados que devuelve la API.</p>
<p>Descarta los registros que no cumplen lo mínimo en lugar de dejar pasar
<code>undefined</code> hacia el render, que es el origen de los &quot;cannot read properties
of undefined&quot; que hay repartidos por el proyecto.</p>
</dd>
<dt><a href="#validarFormularioEmpleado">validarFormularioEmpleado(formulario)</a> ⇒ <code>Object</code></dt>
<dd><p>Comprueba el formulario y devuelve el primer mensaje de error, si lo hay.</p>
</dd>
<dt><a href="#obtenerCajasActivas">obtenerCajasActivas([opciones])</a> ⇒ <code>Promise.&lt;Array&gt;</code></dt>
<dd><p>Cajas propias activas.</p>
</dd>
<dt><a href="#useCajasActivas">useCajasActivas()</a> ⇒ <code>object</code></dt>
<dd><p>Cajas propias activas.</p>
<p>Es un catálogo: se cachea <a href="#FRESCURA_CATALOGO_MS">FRESCURA_CATALOGO_MS</a> y se comparte entre
todas las pantallas que lo pidan, así que varias a la vez hacen una sola
petición en lugar de una cada una.</p>
</dd>
<dt><a href="#obtenerCajasActivasCompletas">obtenerCajasActivasCompletas([opciones])</a> ⇒ <code>Promise.&lt;Array&gt;</code></dt>
<dd><p>Cajas propias activas con los campos de la edición completa de viaje.</p>
</dd>
<dt><a href="#useCajasActivasCompletas">useCajasActivasCompletas()</a> ⇒ <code>object</code></dt>
<dd><p>Cajas propias activas con los campos de la edición completa de viaje.</p>
<p>Es un catálogo: se cachea <a href="#FRESCURA_CATALOGO_MS">FRESCURA_CATALOGO_MS</a> y se comparte entre
todas las pantallas que lo pidan, así que varias a la vez hacen una sola
petición en lugar de una cada una.</p>
</dd>
<dt><a href="#obtenerCajasExternasActivas">obtenerCajasExternasActivas([opciones])</a> ⇒ <code>Promise.&lt;Array&gt;</code></dt>
<dd><p>Cajas externas activas: las que no son propias de IMA.</p>
</dd>
<dt><a href="#useCajasExternasActivas">useCajasExternasActivas()</a> ⇒ <code>object</code></dt>
<dd><p>Cajas externas activas, cacheadas y compartidas entre pantallas.</p>
</dd>
<dt><a href="#obtenerCamionesActivos">obtenerCamionesActivos([opciones])</a> ⇒ <code>Promise.&lt;Array&gt;</code></dt>
<dd><p>Camiones activos, para los selectores de viaje.</p>
</dd>
<dt><a href="#useCamionesActivos">useCamionesActivos()</a> ⇒ <code>object</code></dt>
<dd><p>Camiones activos, para los selectores de viaje.</p>
<p>Es un catálogo: se cachea <a href="#FRESCURA_CATALOGO_MS">FRESCURA_CATALOGO_MS</a> y se comparte entre
todas las pantallas que lo pidan, así que varias a la vez hacen una sola
petición en lugar de una cada una.</p>
</dd>
<dt><a href="#obtenerCamionesActivosCompletos">obtenerCamionesActivosCompletos([opciones])</a> ⇒ <code>Promise.&lt;Array&gt;</code></dt>
<dd><p>Camiones activos con los campos extra de la edición completa de viaje.</p>
</dd>
<dt><a href="#useCamionesActivosCompletos">useCamionesActivosCompletos()</a> ⇒ <code>object</code></dt>
<dd><p>Camiones activos con los campos extra de la edición completa de viaje.</p>
<p>Es un catálogo: se cachea <a href="#FRESCURA_CATALOGO_MS">FRESCURA_CATALOGO_MS</a> y se comparte entre
todas las pantallas que lo pidan, así que varias a la vez hacen una sola
petición en lugar de una cada una.</p>
</dd>
<dt><a href="#obtenerBodegas">obtenerBodegas([opciones])</a> ⇒ <code>Promise.&lt;Array&gt;</code></dt>
<dd><p>Bodegas dadas de alta.</p>
</dd>
<dt><a href="#useBodegas">useBodegas()</a> ⇒ <code>object</code></dt>
<dd><p>Bodegas dadas de alta.</p>
<p>Es un catálogo: se cachea <a href="#FRESCURA_CATALOGO_MS">FRESCURA_CATALOGO_MS</a> y se comparte entre
todas las pantallas que lo pidan, así que varias a la vez hacen una sola
petición en lugar de una cada una.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#Periodo">Periodo</a> : <code>object</code></dt>
<dd><p>Un periodo de nómina ya validado.</p>
</dd>
<dt><a href="#DetallePago">DetallePago</a> : <code>object</code></dt>
<dd><p>Un renglón del desglose por empleado.</p>
</dd>
<dt><a href="#Empleado">Empleado</a> : <code>object</code></dt>
<dd><p>Empleado de nómina ya normalizado y validado.</p>
</dd>
</dl>

<a name="ENDPOINTS"></a>

## ENDPOINTS : <code>enum</code>
Los archivos PHP de la API. Es el **único** lugar del proyecto donde aparece
un `.php`: fuera de aquí nadie sabe qué hay del otro lado.

**Kind**: global enum  
**Read only**: true  
<a name="CAUSA_ERROR"></a>

## CAUSA\_ERROR : <code>enum</code>
Causas por las que una petición a la API puede fallar. El componente decide
qué mostrar según la causa, sin tener que leer el texto del mensaje.

**Kind**: global enum  
**Read only**: true  
<a name="PERMISOS"></a>

## PERMISOS : <code>enum</code>
Catálogo de permisos de IMA.

Las claves son **exactamente** las que guarda `features.php` hoy. No se
renombran a `modulo.accion` todavía: son el formato de red, y cambiarlas
rompería la app móvil, que consume los mismos endpoints. El nombre nuevo vive
en la migración de base de datos (`docs/sql/`), para la fase 3.

Lo que sí gana el frontend desde ya es que ningún componente vuelva a escribir
la cadena a mano: el día que cambien, se cambian aquí.

**Kind**: global enum  
**Read only**: true  
<a name="MODULOS"></a>

## MODULOS : <code>enum</code>
Los permisos agrupados por módulo, para las pantallas de administración y para
armar los paquetes de cada rol sin escribir 38 constantes a mano.

**Kind**: global enum  
**Read only**: true  
<a name="ROLES"></a>

## ROLES : <code>enum</code>
Catálogo canónico de roles.

Sale de los valores que existen de verdad en `Users_credentials.type`
(`Admin` 3, `Administrativo` 12, `Driver` 16 al 2026-08-31), con los nombres
que se acordaron: `Admin` pasa a **Administrador** y `Driver` a **Operador**.
`Administrativo` se subdivide en roles por área.

**Kind**: global enum  
**Read only**: true  
<a name="NOMBRE_ROL"></a>

## NOMBRE\_ROL : <code>enum</code>
Nombre de cada rol tal como se le muestra a una persona.

**Kind**: global enum  
**Read only**: true  
<a name="PERMISOS_POR_ROL"></a>

## PERMISOS\_POR\_ROL : <code>enum</code>
Permisos que trae cada rol de fábrica.

Es el **paquete de arranque**, no la última palabra: encima siguen mandando
los permisos por usuario de `features.php`, que pueden conceder o quitar casos
puntuales. Sirve para no tener que palomear 38 casillas cada vez que entra
alguien nuevo, que es lo que pasa hoy.

`ADMINISTRATIVO` existe a propósito con el paquete mínimo: es el destino del
`Administrativo` actual mientras no se decida en qué área cae cada persona.
Nadie pierde accesos al migrar porque sus flags individuales siguen mandando.

**Kind**: global enum  
**Read only**: true  
<a name="ALIAS_ROL"></a>

## ALIAS\_ROL : <code>enum</code>
Traduce el valor crudo de `Users_credentials.type` al catálogo canónico.

Los valores reales en producción al 2026-08-31 son `Admin`, `Administrativo` y
`Driver`. El mapa acepta además variantes de escritura que podrían aparecer al
dar de alta a alguien a mano.

**Kind**: global enum  
**Read only**: true  
<a name="TILES_BASE"></a>

## TILES\_BASE : <code>enum</code>
Capa base de los mapas, en un solo lugar.

Son datos planos a propósito, no un componente: así `shared/config` no importa
react-leaflet y ninguna pantalla que no dibuje mapas arrastra leaflet en su
bundle. Se usa esparciéndolo sobre el `TileLayer`:

```jsx
import { TILES_BASE } from "../../shared/config/mapa";
<TileLayer {...TILES_BASE} />
```

Existe porque las cuatro pantallas con mapa lo tenían cada una por su cuenta y
se desincronizaron: tres usaban OpenStreetMap con atribución y `Tracking` usaba
CartoDB **sin** atribución. Carto empezó a exigir API key y devuelve los tiles
estampados con "API KEY REQUIRED" — con HTTP 200, así que no salta ningún error
en consola: el mapa simplemente se ve mal.

Antes de cambiar de proveedor, lee `docs/DECISIONES/0005-proveedor-de-tiles-de-mapa.md`:
está el porqué de OpenStreetMap, el riesgo que se aceptó a sabiendas, las señales de
que toca migrar y la tabla de alternativas. Y acuérdate de actualizar el `img-src` de
la CSP en `vite.config.js`, o el proveedor nuevo se bloquea sin explicación visible.

**Kind**: global enum  
**Read only**: true  
<a name="ESTADO_PERIODO"></a>

## ESTADO\_PERIODO : <code>enum</code>
Estados de un periodo de nómina.

`Pendiente` admite cambios; `Autorizado` cierra el corte y ya no se le pueden
agregar pagos. Es una operación irreversible desde la app.

**Kind**: global enum  
**Read only**: true  
<a name="FRECUENCIA_PAGO"></a>

## FRECUENCIA\_PAGO : <code>enum</code>
Frecuencias de pago que acepta la nómina.

**Kind**: global enum  
**Read only**: true  
<a name="TIPO_NOMINA"></a>

## TIPO\_NOMINA : <code>enum</code>
Tipos de nómina, por divisa.

Toda la app decide con `tipo_nomina === 'MX'` y trata cualquier otro valor
como dólares; el único punto que escribe el campo es el select del formulario,
que manda `US`. Por eso el dominio real son estos dos valores y no más.

**Kind**: global enum  
**Read only**: true  
<a name="EN_PRUEBAS"></a>

## EN\_PRUEBAS : <code>boolean</code>
Bajo test, la caché se recolecta de inmediato y no se reintenta nada.

El smoke test monta las 61 rutas en la misma sesión; sin esto, la caché de una
ruta sobrevive a la siguiente y los tests dependen del orden en que corren.
Los reintentos tampoco aportan nada cuando `fetch` está simulado.

**Kind**: global constant  
<a name="FRESCURA_CATALOGO_MS"></a>

## FRESCURA\_CATALOGO\_MS : <code>number</code>
Tiempo que un catálogo se considera fresco. Conductores, camiones, cajas y
almacenes cambian de vez en cuando, no dentro de una sesión de trabajo: no
tiene sentido volver a pedirlos en cada pantalla que los use.

**Kind**: global constant  
<a name="TODOS_LOS_PERMISOS"></a>

## TODOS\_LOS\_PERMISOS : <code>Array.&lt;string&gt;</code>
Todos los permisos existentes, sin repetir.

**Kind**: global constant  
<a name="ROLES_TOTALES"></a>

## ROLES\_TOTALES : <code>Set.&lt;string&gt;</code>
Roles que ven toda la aplicación sin pasar por la comprobación de permisos.

Es deliberadamente un solo rol. Sustituye los cinco `ADMIN_TYPES` sueltos que
hoy están declarados por separado en `useAuthStore`, `Sidebar`, `AccessManager`,
`AdminGastos` y `AdminOrdenesServicio`.

**Kind**: global constant  
<a name="API_BASE"></a>

## API\_BASE : <code>string</code>
URL base de la API PHP, sin barra final.

Es el único punto del proyecto que lee `VITE_API_HOST`. Cuando el hosting
tenga TLS funcionando, cambiar a `https://` se hace aquí y en `.env`,
no en las 96 pantallas que antes lo leían por su cuenta.

**Kind**: global constant  
<a name="TIMEOUT_PETICION_MS"></a>

## TIMEOUT\_PETICION\_MS : <code>number</code>
Milisegundos que espera una petición antes de abortarse.

**Kind**: global constant  
<a name="ZOOM_MAXIMO_TILES"></a>

## ZOOM\_MAXIMO\_TILES : <code>number</code>
Zoom máximo que sirven los tiles de OpenStreetMap. Pedir más devuelve 404 y
deja el mapa en gris.

**Kind**: global constant  
<a name="esVacio"></a>

## esVacio ⇒ <code>boolean</code>
Indica si un valor debe tratarse como vacío al ordenar.

**Kind**: global constant  
**Returns**: <code>boolean</code> - `true` si es `null`, `undefined` o cadena vacía.  

| Param | Type | Description |
| --- | --- | --- |
| valor | <code>\*</code> | Valor a evaluar. |

<a name="compararValores"></a>

## compararValores ⇒ <code>number</code>
Compara dos valores del mismo campo.

Los números se comparan como números; el resto como texto en español con
`numeric: true`, para que "Caja 10" quede después de "Caja 9" y no antes.

**Kind**: global constant  
**Returns**: <code>number</code> - Negativo, cero o positivo, como espera `Array.sort`.  

| Param | Type | Description |
| --- | --- | --- |
| a | <code>\*</code> | Primer valor. |
| b | <code>\*</code> | Segundo valor. |

<a name="siguienteOrden"></a>

## siguienteOrden ⇒ <code>Object</code>
Calcula el siguiente estado al hacer clic en una cabecera de columna.

El ciclo tiene tres pasos: ascendente, descendente y sin orden. El tercero
importa: permite volver al orden natural que trae la API sin recargar.

**Kind**: global constant  
**Returns**: <code>Object</code> - El orden siguiente.  

| Param | Type | Description |
| --- | --- | --- |
| actual | <code>Object</code> | Orden vigente. |
| campo | <code>string</code> | Columna sobre la que se hizo clic. |

<a name="ordenarPor"></a>

## ordenarPor ⇒ <code>Array</code>
Ordena una lista según un orden y un mapa de accesores.

Los valores vacíos van **siempre al final**, suban o bajen los demás: una fila
sin fecha estorba igual arriba que abajo, y verlas agrupadas es más útil que
verlas saltar de extremo con cada clic.

No muta la lista original.

**Kind**: global constant  
**Returns**: <code>Array</code> - Una lista nueva, ordenada; la original si el campo no existe.  

| Param | Type | Description |
| --- | --- | --- |
| filas | <code>Array</code> | Lista a ordenar. |
| orden | <code>Object</code> | Campo y dirección. |
| accesores | <code>object</code> | Mapa `campo -> (fila, contexto) => valor`. |
| [contexto] | <code>\*</code> | Segundo argumento que reciben los accesores, por ejemplo   el tipo de cambio cuando la columna es un total convertido. |

<a name="notify"></a>

## notify
Avisos al usuario, en un solo lugar.

Hoy el proyecto usa **tres** librerías para lo mismo: `sweetalert2` (343
llamadas en 56 archivos), `react-toastify` (una) y `@pablotheblink/flashyjs`
(nueve). Este módulo envuelve sweetalert2, que es la que domina, para que las
otras dos se puedan ir retirando módulo por módulo y para que cambiar de
librería sea editar este archivo en vez de 56.

Cada función devuelve una promesa, así que se puede esperar el cierre.

**Kind**: global constant  

* [notify](#notify)
    * [.exito(mensaje, [titulo])](#notify.exito) ⇒ <code>Promise</code>
    * [.error(problema, [titulo])](#notify.error) ⇒ <code>Promise</code>
    * [.aviso(mensaje, [titulo])](#notify.aviso) ⇒ <code>Promise</code>
    * [.confirmar(opciones)](#notify.confirmar) ⇒ <code>Promise.&lt;boolean&gt;</code>

<a name="notify.exito"></a>

### notify.exito(mensaje, [titulo]) ⇒ <code>Promise</code>
Confirma que una operación salió bien.

**Kind**: static method of [<code>notify</code>](#notify)  
**Returns**: <code>Promise</code> - Se resuelve al cerrarse el aviso.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| mensaje | <code>string</code> |  | Qué ocurrió, en lenguaje de la persona. |
| [titulo] | <code>string</code> | <code>&quot;&#x27;Listo&#x27;&quot;</code> | Encabezado del aviso. |

<a name="notify.error"></a>

### notify.error(problema, [titulo]) ⇒ <code>Promise</code>
Informa de un fallo.

Acepta un `Error` directamente, para que un `catch` no tenga que acordarse
de sacar el `.message`.

**Kind**: static method of [<code>notify</code>](#notify)  
**Returns**: <code>Promise</code> - Se resuelve al cerrarse el aviso.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| problema | <code>string</code> \| <code>Error</code> |  | Mensaje, o el error capturado. |
| [titulo] | <code>string</code> | <code>&quot;&#x27;No se pudo completar&#x27;&quot;</code> | Encabezado del aviso. |

<a name="notify.aviso"></a>

### notify.aviso(mensaje, [titulo]) ⇒ <code>Promise</code>
Advierte de algo que impide continuar, como un campo obligatorio vacío.

**Kind**: static method of [<code>notify</code>](#notify)  
**Returns**: <code>Promise</code> - Se resuelve al cerrarse el aviso.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| mensaje | <code>string</code> |  | Qué falta o qué está mal. |
| [titulo] | <code>string</code> | <code>&quot;&#x27;Atención&#x27;&quot;</code> | Encabezado del aviso. |

<a name="notify.confirmar"></a>

### notify.confirmar(opciones) ⇒ <code>Promise.&lt;boolean&gt;</code>
Pide confirmación antes de una acción destructiva.

Devuelve un booleano en vez del objeto de sweetalert2, para que quien llama
no tenga que conocer la forma `{ isConfirmed }` de la librería.

**Kind**: static method of [<code>notify</code>](#notify)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - `true` si la persona aceptó.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| opciones | <code>object</code> |  | Textos del diálogo. |
| opciones.titulo | <code>string</code> |  | Pregunta principal. |
| [opciones.mensaje] | <code>string</code> |  | Consecuencia de aceptar; conviene ser explícito. |
| [opciones.confirmar] | <code>string</code> | <code>&quot;&#x27;Sí, continuar&#x27;&quot;</code> | Texto del botón de aceptar. |
| [opciones.cancelar] | <code>string</code> | <code>&quot;&#x27;Cancelar&#x27;&quot;</code> | Texto del botón de cancelar. |
| [opciones.peligroso] | <code>boolean</code> | <code>true</code> | Pinta de rojo el botón de aceptar. |

<a name="LLAVE_PERIODOS"></a>

## LLAVE\_PERIODOS : <code>Array.&lt;string&gt;</code>
Llave de caché de los periodos de nómina.

**Kind**: global constant  
<a name="llaveDetalle"></a>

## llaveDetalle ⇒ <code>Array.&lt;string&gt;</code>
Llave de caché del desglose de un periodo.

**Kind**: global constant  
**Returns**: <code>Array.&lt;string&gt;</code> - La llave para `useQuery`.  

| Param | Type | Description |
| --- | --- | --- |
| periodId | <code>string</code> | Identificador del periodo. |

<a name="tipoNomina"></a>

## tipoNomina
Normaliza el tipo de nómina igual que en `entities/personal`: `MX`, o `US`
para todo lo demás. Está aquí también porque `pagos_admin.php` es otro
endpoint y podría devolver el campo con otra forma.

**Kind**: global constant  
<a name="esquemaPeriodo"></a>

## esquemaPeriodo
Semana de nómina, tal como la devuelve `pagos_admin.php` · `get_weeks`.

`fecha_corte` llega como `"2026-08-31 00:00:00"` y se recorta al día: la
pantalla solo muestra la fecha, y el código anterior hacía
`fecha_corte.split(' ')[0]` sin comprobar que existiera — con un corte nulo,
la tabla entera reventaba.

**Kind**: global constant  
<a name="esquemaDetallePago"></a>

## esquemaDetallePago
Renglón del desglose de una semana, de `pagos_admin.php` · `get_details`.

**Kind**: global constant  
<a name="estaPendiente"></a>

## estaPendiente ⇒ <code>boolean</code>
Indica si una semana todavía admite cambios.

**Kind**: global constant  
**Returns**: <code>boolean</code> - `true` si sigue pendiente de autorizar.  

| Param | Type | Description |
| --- | --- | --- |
| periodo | [<code>Periodo</code>](#Periodo) | El periodo a evaluar. |

<a name="plantillaTotal"></a>

## plantillaTotal ⇒ <code>number</code>
Suma la plantilla de una semana, sin importar la divisa.

**Kind**: global constant  
**Returns**: <code>number</code> - Empleados en total.  

| Param | Type | Description |
| --- | --- | --- |
| periodo | [<code>Periodo</code>](#Periodo) | El periodo a evaluar. |

<a name="etiquetaPeriodo"></a>

## etiquetaPeriodo ⇒ <code>string</code>
Etiqueta legible de una semana, para encabezados y confirmaciones.

**Kind**: global constant  
**Returns**: <code>string</code> - Por ejemplo `Semana 35 (2026)`.  

| Param | Type | Description |
| --- | --- | --- |
| periodo | [<code>Periodo</code>](#Periodo) | El periodo a nombrar. |

<a name="LLAVE_PERSONAL"></a>

## LLAVE\_PERSONAL : <code>Array.&lt;string&gt;</code>
Llave de caché de la lista de personal. Las mutaciones la invalidan para que
la tabla se actualice sola, sin que la pantalla tenga que volver a pedirla.

**Kind**: global constant  
<a name="numeroDePhp"></a>

## numeroDePhp
Número que llega de PHP. MySQL devuelve los DECIMAL como cadena
(`"1500.00"`), así que se coacciona en vez de exigir `number`.

**Kind**: global constant  
<a name="idDePhp"></a>

## idDePhp
Identificador que llega de PHP, siempre como cadena en las respuestas.

**Kind**: global constant  
<a name="esquemaEmpleado"></a>

## esquemaEmpleado
Forma de un empleado tal como lo devuelve `personal_admin.php`.

Es deliberadamente tolerante con lo que no afecta al render: `.catch()` pone
un valor por omisión en vez de tirar la lista entera porque un registro traiga
un campo raro. Lo que sí es obligatorio es `id` y `nombre`: sin eso la fila no
se puede ni pintar ni editar.

`frecuencia_pago` se lee tal cual, sin enum: forzarla a un valor conocido
cambiaría en silencio el significado de un registro que traiga algo distinto.
El enum sí se aplica al **escribir**, en `esquemaFormularioEmpleado`, porque
ahí el valor sale de un select controlado.

**Kind**: global constant  
<a name="esquemaFormularioEmpleado"></a>

## esquemaFormularioEmpleado
Valida los datos del formulario antes de mandarlos.

`id` ausente significa alta; presente, edición.

**Kind**: global constant  
<a name="construirFormData"></a>

## construirFormData(op, [payload]) ⇒ <code>FormData</code>
Convierte un objeto plano en el `FormData` que espera la API PHP.

Omite `undefined` y `null` en vez de mandarlos: `FormData` los serializa como
las cadenas `"undefined"` y `"null"`, y PHP las recibe como texto, que es de
donde salen los campos con el literal "undefined" guardado en la base.
Los booleanos van como `1`/`0`, que es lo que el backend interpreta.

**Kind**: global function  
**Returns**: <code>FormData</code> - El cuerpo listo para enviar.  

| Param | Type | Description |
| --- | --- | --- |
| op | <code>string</code> | Operación a ejecutar, el campo `op` del POST. |
| [payload] | <code>object</code> | Campos adicionales. |

<a name="post"></a>

## post(endpoint, op, [payload], [opciones]) ⇒ <code>Promise.&lt;object&gt;</code>
Llama a una operación de la API de IMA.

Concentra lo que hoy está repetido en 232 llamadas sueltas: armar el
`FormData`, poner el `op`, abortar por tiempo, y traducir la respuesta a un
valor o a un `ApiError`. La API contesta HTTP 200 aunque falle —el fallo va
en `{status:'error'}`— así que aquí es donde eso se convierte en excepción.

**Kind**: global function  
**Returns**: <code>Promise.&lt;object&gt;</code> - El cuerpo de la respuesta ya parseado.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si falla la red, se agota el tiempo, el HTTP no es 2xx,
  el cuerpo no es JSON, o la API responde `status: 'error'`.


| Param | Type | Description |
| --- | --- | --- |
| endpoint | <code>string</code> | Valor de `ENDPOINTS`, por ejemplo `ENDPOINTS.personalAdmin`. |
| op | <code>string</code> | Operación, por ejemplo `getAll`. |
| [payload] | <code>object</code> | Campos del POST. |
| [opciones] | <code>object</code> | Ajustes de la petición. |
| [opciones.signal] | <code>AbortSignal</code> | Señal externa; se combina con el timeout. |
| [opciones.timeoutMs] | <code>number</code> | Sobrescribe el timeout por omisión. |

**Example**  
```js
const respuesta = await post(ENDPOINTS.personalAdmin, 'getAll')
```
<a name="postLista"></a>

## postLista(endpoint, op, [opciones]) ⇒ <code>Promise.&lt;Array&gt;</code>
Igual que [post](#post), pero devuelve directo el arreglo del campo indicado.

Casi todas las pantallas hacen lo mismo con la respuesta: comprobar el status
y quedarse con una lista. Cuando la API responde bien pero sin esa clave,
devuelve `[]` en vez de `undefined`, que es el origen de la mitad de los
"cannot read properties of undefined" del proyecto.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array&gt;</code> - La lista, o `[]` si la clave no vino.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Lo mismo que [post](#post).


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| endpoint | <code>string</code> |  | Valor de `ENDPOINTS`. |
| op | <code>string</code> |  | Operación. |
| [opciones] | <code>object</code> |  | Ajustes de la petición. |
| [opciones.campo] | <code>string</code> | <code>&quot;&#x27;data&#x27;&quot;</code> | Clave del arreglo dentro de la respuesta. |
| [opciones.payload] | <code>object</code> |  | Campos del POST. |
| [opciones.signal] | <code>AbortSignal</code> |  | Señal de cancelación. |

<a name="debeReintentar"></a>

## debeReintentar(intentosPrevios, error) ⇒ <code>boolean</code>
Decide si TanStack Query debe reintentar una consulta fallida.

Solo se reintenta lo que puede arreglarse solo —red caída, tiempo agotado—.
Un error de negocio ("ese empleado ya existe") daría el mismo resultado tres
veces y solo retrasaría el mensaje.

**Kind**: global function  
**Returns**: <code>boolean</code> - `true` si debe reintentarse.  

| Param | Type | Description |
| --- | --- | --- |
| intentosPrevios | <code>number</code> | Cuántas veces ya se reintentó. |
| error | <code>\*</code> | El error que lanzó la consulta. |

<a name="crearQueryClient"></a>

## crearQueryClient() ⇒ <code>object</code>
Crea el cliente de TanStack Query con la configuración del proyecto.

Se crea con una función y no como constante de módulo para que cada test
pueda tener el suyo: una caché compartida entre tests los vuelve dependientes
del orden en que corren.

**Kind**: global function  
**Returns**: <code>object</code> - Cliente de TanStack Query listo para el provider.  
<a name="calcularPermisosEfectivos"></a>

## calcularPermisosEfectivos(rol, [ajustesUsuario]) ⇒ <code>Set.&lt;string&gt;</code>
Calcula los permisos que realmente tiene una persona.

La fórmula es `paquete del rol ∪/∖ ajustes del usuario`:

1. El **rol** da el paquete de arranque.
2. Los **ajustes por usuario** de `features.php` mandan encima, y pueden tanto
   conceder algo que el rol no trae como quitar algo que sí traía. Un flag en
   `false` es una negación explícita, no una ausencia.
3. Un rol total (hoy solo Administrador) ve todo y no pasa por lo anterior.

Ese orden importa para migrar sin sustos: mientras los ajustes por usuario
sigan existiendo, cambiar el paquete de un rol no le quita nada a nadie que ya
lo tuviera concedido a mano.

**Kind**: global function  
**Returns**: <code>Set.&lt;string&gt;</code> - Los permisos efectivos.  

| Param | Type | Description |
| --- | --- | --- |
| rol | <code>string</code> | Rol canónico, ya normalizado. |
| [ajustesUsuario] | <code>object</code> | Mapa `clave -> boolean` de `features.php`. |

<a name="crearComprobador"></a>

## crearComprobador(permisosEfectivos, [esTotal]) ⇒ <code>function</code>
Construye la función `can` que usan los componentes.

Devolver una función en vez de exponer el `Set` mantiene a los componentes
ignorantes de cómo se calculan los permisos: el día que la fase 2 los emita en
un token firmado, `can` sigue igual.

**Kind**: global function  
**Returns**: <code>function</code> - `(permiso) => boolean`.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| permisosEfectivos | <code>Set.&lt;string&gt;</code> |  | Resultado de [calcularPermisosEfectivos](#calcularPermisosEfectivos). |
| [esTotal] | <code>boolean</code> | <code>false</code> | Si el rol ve todo sin comprobar. |

<a name="normalizarRol"></a>

## normalizarRol(crudo) ⇒ <code>string</code>
Normaliza un valor de rol al catálogo canónico.

Es el mismo patrón que `normalizarSubcategoria` en el backend, y por la misma
razón: deja la aplicación consistente **hoy** sin depender de que la base de
datos migre primero, que en producción no tiene red de seguridad. Cuando la
migración ocurra, esta función se queda como camino de lectura hasta que ya no
aplique a nadie y entonces se borra.

Un valor desconocido cae a `CONSULTA`, el rol de **menor** privilegio: un rol
que nadie reconoce no debe abrir puertas.

**Kind**: global function  
**Returns**: <code>string</code> - Un valor de `ROLES`.  

| Param | Type | Description |
| --- | --- | --- |
| crudo | <code>\*</code> | Valor de `type` tal como viene de la API. |

<a name="obtenerCompanias"></a>

## obtenerCompanias([opciones]) ⇒ <code>Promise.&lt;Array&gt;</code>
Compañías dadas de alta.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array&gt;</code> - La lista, o `[]` si la API no la devolvió.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la petición falla.

**Endpoint**: POST companies.php · op=getCompanies  

| Param | Type | Description |
| --- | --- | --- |
| [opciones] | <code>object</code> | Ajustes de la petición. |
| [opciones.signal] | <code>AbortSignal</code> | Señal de cancelación. |

<a name="useCompanias"></a>

## useCompanias() ⇒ <code>object</code>
Compañías dadas de alta.

Es un catálogo: se cachea [FRESCURA_CATALOGO_MS](#FRESCURA_CATALOGO_MS) y se comparte entre
todas las pantallas que lo pidan, así que varias a la vez hacen una sola
petición en lugar de una cada una.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useQuery`: `{data, isLoading, isError, error}`.  
<a name="obtenerConductoresActivos"></a>

## obtenerConductoresActivos([opciones]) ⇒ <code>Promise.&lt;Array&gt;</code>
Conductores activos, para los selectores de viaje.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array&gt;</code> - La lista, o `[]` si la API no la devolvió.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la petición falla.

**Endpoint**: POST drivers.php · op=getDriversActivos  

| Param | Type | Description |
| --- | --- | --- |
| [opciones] | <code>object</code> | Ajustes de la petición. |
| [opciones.signal] | <code>AbortSignal</code> | Señal de cancelación. |

<a name="useConductoresActivos"></a>

## useConductoresActivos() ⇒ <code>object</code>
Conductores activos, para los selectores de viaje.

Es un catálogo: se cachea [FRESCURA_CATALOGO_MS](#FRESCURA_CATALOGO_MS) y se comparte entre
todas las pantallas que lo pidan, así que varias a la vez hacen una sola
petición en lugar de una cada una.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useQuery`: `{data, isLoading, isError, error}`.  
<a name="obtenerConductoresActivosCompletos"></a>

## obtenerConductoresActivosCompletos([opciones]) ⇒ <code>Promise.&lt;Array&gt;</code>
Conductores activos con los campos extra que pide la edición completa de viaje.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array&gt;</code> - La lista, o `[]` si la API no la devolvió.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la petición falla.

**Endpoint**: POST drivers.php · op=getDriversActivosComplete  

| Param | Type | Description |
| --- | --- | --- |
| [opciones] | <code>object</code> | Ajustes de la petición. |
| [opciones.signal] | <code>AbortSignal</code> | Señal de cancelación. |

<a name="useConductoresActivosCompletos"></a>

## useConductoresActivosCompletos() ⇒ <code>object</code>
Conductores activos con los campos extra que pide la edición completa de viaje.

Es un catálogo: se cachea [FRESCURA_CATALOGO_MS](#FRESCURA_CATALOGO_MS) y se comparte entre
todas las pantallas que lo pidan, así que varias a la vez hacen una sola
petición en lugar de una cada una.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useQuery`: `{data, isLoading, isError, error}`.  
<a name="obtenerPeriodos"></a>

## obtenerPeriodos([opciones]) ⇒ <code>Promise.&lt;Array.&lt;Periodo&gt;&gt;</code>
Trae todas las semanas de nómina, validadas.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array.&lt;Periodo&gt;&gt;</code> - Los periodos normalizados.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API falla.

**Endpoint**: POST pagos_admin.php · op=get_weeks  

| Param | Type | Description |
| --- | --- | --- |
| [opciones] | <code>object</code> | Ajustes de la petición. |
| [opciones.signal] | <code>AbortSignal</code> | Señal de cancelación. |

<a name="obtenerDetalle"></a>

## obtenerDetalle(parametros) ⇒ <code>Promise.&lt;Array.&lt;DetallePago&gt;&gt;</code>
Trae el desglose por empleado de una semana.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array.&lt;DetallePago&gt;&gt;</code> - El desglose normalizado.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API falla.

**Endpoint**: POST pagos_admin.php · op=get_details  

| Param | Type | Description |
| --- | --- | --- |
| parametros | <code>object</code> | Datos del periodo. |
| parametros.periodId | <code>string</code> | Identificador del periodo. |
| parametros.fechaCorte | <code>string</code> | Fecha de corte de la semana. |
| parametros.estado | <code>string</code> | Estado del periodo. |
| [parametros.signal] | <code>AbortSignal</code> | Señal de cancelación. |

<a name="autorizarPeriodo"></a>

## autorizarPeriodo(periodo) ⇒ <code>Promise.&lt;object&gt;</code>
Cierra el corte de una semana. **Es irreversible desde la app.**

**Kind**: global function  
**Returns**: <code>Promise.&lt;object&gt;</code> - La respuesta de la API.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API rechaza la operación.

**Endpoint**: POST pagos_admin.php · op=authorize  

| Param | Type | Description |
| --- | --- | --- |
| periodo | [<code>Periodo</code>](#Periodo) | La semana a autorizar. |

<a name="usePeriodos"></a>

## usePeriodos() ⇒ <code>object</code>
Semanas de nómina, cacheadas.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useQuery`: `{data, isLoading, isError, error}`.  
<a name="useDetallePeriodo"></a>

## useDetallePeriodo(periodo) ⇒ <code>object</code>
Desglose de una semana. No se dispara hasta tener los datos del periodo.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useQuery`: `{data, isLoading, isError, error}`.  

| Param | Type | Description |
| --- | --- | --- |
| periodo | [<code>Periodo</code>](#Periodo) \| <code>undefined</code> | La semana de la que se quiere el desglose. |

<a name="useAutorizarPeriodo"></a>

## useAutorizarPeriodo() ⇒ <code>object</code>
Autoriza una semana y refresca la lista al terminar.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useMutation`: `{mutateAsync, isPending, error}`.  
<a name="normalizarLista"></a>

## normalizarLista(filas, esquema) ⇒ <code>Object</code>
Valida una lista descartando lo que no cumple lo mínimo.

Un registro roto se omite y se cuenta, en vez de dejar pasar `undefined` hacia
el render y tumbar la pantalla entera por una fila mala.

**Kind**: global function  
**Returns**: <code>Object</code> - Los que pasaron y cuántos no.  

| Param | Type | Description |
| --- | --- | --- |
| filas | <code>Array</code> | Lo que vino en la respuesta. |
| esquema | <code>object</code> | Esquema zod con el que validar cada fila. |

<a name="obtenerPersonal"></a>

## obtenerPersonal([opciones]) ⇒ <code>Promise.&lt;Array.&lt;Empleado&gt;&gt;</code>
Trae todo el personal de nómina, validado.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array.&lt;Empleado&gt;&gt;</code> - Empleados normalizados.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API falla.

**Endpoint**: POST personal_admin.php · op=getAll  

| Param | Type | Description |
| --- | --- | --- |
| [opciones] | <code>object</code> | Ajustes de la petición. |
| [opciones.signal] | <code>AbortSignal</code> | Señal de cancelación. |

<a name="guardarEmpleado"></a>

## guardarEmpleado(empleado) ⇒ <code>Promise.&lt;object&gt;</code>
Da de alta o actualiza un empleado, según traiga `id` o no.

**Kind**: global function  
**Returns**: <code>Promise.&lt;object&gt;</code> - La respuesta de la API.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API rechaza la operación.

**Endpoint**: POST personal_admin.php · op=add | op=update  

| Param | Type | Description |
| --- | --- | --- |
| empleado | <code>object</code> | Datos ya validados del formulario. |

<a name="eliminarEmpleado"></a>

## eliminarEmpleado(id) ⇒ <code>Promise.&lt;object&gt;</code>
Elimina un empleado. El historial de pagos previos se conserva.

**Kind**: global function  
**Returns**: <code>Promise.&lt;object&gt;</code> - La respuesta de la API.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API rechaza la operación.

**Endpoint**: POST personal_admin.php · op=delete  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | Identificador del empleado. |

<a name="usePersonal"></a>

## usePersonal() ⇒ <code>object</code>
Lista de personal, cacheada y compartida entre componentes.

Dos pantallas que la pidan a la vez hacen **una** sola petición, y al volver
de otra vista la tabla se pinta al instante con lo cacheado mientras se
revalida en segundo plano.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useQuery`: `{data, isLoading, isError, error, refetch}`.  
<a name="useGuardarEmpleado"></a>

## useGuardarEmpleado() ⇒ <code>object</code>
Guarda un empleado y refresca la lista al terminar.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useMutation`: `{mutateAsync, isPending, error}`.  
<a name="useEliminarEmpleado"></a>

## useEliminarEmpleado() ⇒ <code>object</code>
Elimina un empleado y refresca la lista al terminar.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useMutation`: `{mutateAsync, isPending, error}`.  
<a name="normalizarEmpleados"></a>

## normalizarEmpleados(filas) ⇒ <code>Object</code>
Valida y normaliza la lista de empleados que devuelve la API.

Descarta los registros que no cumplen lo mínimo en lugar de dejar pasar
`undefined` hacia el render, que es el origen de los "cannot read properties
of undefined" que hay repartidos por el proyecto.

**Kind**: global function  
**Returns**: <code>Object</code> - Los válidos y cuántos se cayeron.  

| Param | Type | Description |
| --- | --- | --- |
| filas | <code>Array.&lt;unknown&gt;</code> | Lo que vino en la respuesta. |

<a name="validarFormularioEmpleado"></a>

## validarFormularioEmpleado(formulario) ⇒ <code>Object</code>
Comprueba el formulario y devuelve el primer mensaje de error, si lo hay.

**Kind**: global function  
**Returns**: <code>Object</code> - Resultado de la validación.  

| Param | Type | Description |
| --- | --- | --- |
| formulario | <code>Record.&lt;string, unknown&gt;</code> | Datos capturados en el modal. |

<a name="obtenerCajasActivas"></a>

## obtenerCajasActivas([opciones]) ⇒ <code>Promise.&lt;Array&gt;</code>
Cajas propias activas.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array&gt;</code> - La lista, o `[]` si la API no la devolvió.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la petición falla.

**Endpoint**: POST cajas.php · op=getCajasActivas  

| Param | Type | Description |
| --- | --- | --- |
| [opciones] | <code>object</code> | Ajustes de la petición. |
| [opciones.signal] | <code>AbortSignal</code> | Señal de cancelación. |

<a name="useCajasActivas"></a>

## useCajasActivas() ⇒ <code>object</code>
Cajas propias activas.

Es un catálogo: se cachea [FRESCURA_CATALOGO_MS](#FRESCURA_CATALOGO_MS) y se comparte entre
todas las pantallas que lo pidan, así que varias a la vez hacen una sola
petición en lugar de una cada una.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useQuery`: `{data, isLoading, isError, error}`.  
<a name="obtenerCajasActivasCompletas"></a>

## obtenerCajasActivasCompletas([opciones]) ⇒ <code>Promise.&lt;Array&gt;</code>
Cajas propias activas con los campos de la edición completa de viaje.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array&gt;</code> - La lista, o `[]` si la API no la devolvió.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la petición falla.

**Endpoint**: POST cajas.php · op=getCajasActivasComplete  

| Param | Type | Description |
| --- | --- | --- |
| [opciones] | <code>object</code> | Ajustes de la petición. |
| [opciones.signal] | <code>AbortSignal</code> | Señal de cancelación. |

<a name="useCajasActivasCompletas"></a>

## useCajasActivasCompletas() ⇒ <code>object</code>
Cajas propias activas con los campos de la edición completa de viaje.

Es un catálogo: se cachea [FRESCURA_CATALOGO_MS](#FRESCURA_CATALOGO_MS) y se comparte entre
todas las pantallas que lo pidan, así que varias a la vez hacen una sola
petición en lugar de una cada una.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useQuery`: `{data, isLoading, isError, error}`.  
<a name="obtenerCajasExternasActivas"></a>

## obtenerCajasExternasActivas([opciones]) ⇒ <code>Promise.&lt;Array&gt;</code>
Cajas externas activas: las que no son propias de IMA.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array&gt;</code> - La lista, o `[]` si la API no la devolvió.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la petición falla.

**Endpoint**: POST caja_externa.php · op=getCajasExternasActivas  

| Param | Type | Description |
| --- | --- | --- |
| [opciones] | <code>object</code> | Ajustes de la petición. |
| [opciones.signal] | <code>AbortSignal</code> | Señal de cancelación. |

<a name="useCajasExternasActivas"></a>

## useCajasExternasActivas() ⇒ <code>object</code>
Cajas externas activas, cacheadas y compartidas entre pantallas.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useQuery`: `{data, isLoading, isError, error}`.  
<a name="obtenerCamionesActivos"></a>

## obtenerCamionesActivos([opciones]) ⇒ <code>Promise.&lt;Array&gt;</code>
Camiones activos, para los selectores de viaje.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array&gt;</code> - La lista, o `[]` si la API no la devolvió.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la petición falla.

**Endpoint**: POST trucks.php · op=getTrucksActivos  

| Param | Type | Description |
| --- | --- | --- |
| [opciones] | <code>object</code> | Ajustes de la petición. |
| [opciones.signal] | <code>AbortSignal</code> | Señal de cancelación. |

<a name="useCamionesActivos"></a>

## useCamionesActivos() ⇒ <code>object</code>
Camiones activos, para los selectores de viaje.

Es un catálogo: se cachea [FRESCURA_CATALOGO_MS](#FRESCURA_CATALOGO_MS) y se comparte entre
todas las pantallas que lo pidan, así que varias a la vez hacen una sola
petición en lugar de una cada una.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useQuery`: `{data, isLoading, isError, error}`.  
<a name="obtenerCamionesActivosCompletos"></a>

## obtenerCamionesActivosCompletos([opciones]) ⇒ <code>Promise.&lt;Array&gt;</code>
Camiones activos con los campos extra de la edición completa de viaje.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array&gt;</code> - La lista, o `[]` si la API no la devolvió.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la petición falla.

**Endpoint**: POST trucks.php · op=getTrucksActivosComplete  

| Param | Type | Description |
| --- | --- | --- |
| [opciones] | <code>object</code> | Ajustes de la petición. |
| [opciones.signal] | <code>AbortSignal</code> | Señal de cancelación. |

<a name="useCamionesActivosCompletos"></a>

## useCamionesActivosCompletos() ⇒ <code>object</code>
Camiones activos con los campos extra de la edición completa de viaje.

Es un catálogo: se cachea [FRESCURA_CATALOGO_MS](#FRESCURA_CATALOGO_MS) y se comparte entre
todas las pantallas que lo pidan, así que varias a la vez hacen una sola
petición en lugar de una cada una.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useQuery`: `{data, isLoading, isError, error}`.  
<a name="obtenerBodegas"></a>

## obtenerBodegas([opciones]) ⇒ <code>Promise.&lt;Array&gt;</code>
Bodegas dadas de alta.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array&gt;</code> - La lista, o `[]` si la API no la devolvió.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la petición falla.

**Endpoint**: POST warehouses.php · op=getWarehouses  

| Param | Type | Description |
| --- | --- | --- |
| [opciones] | <code>object</code> | Ajustes de la petición. |
| [opciones.signal] | <code>AbortSignal</code> | Señal de cancelación. |

<a name="useBodegas"></a>

## useBodegas() ⇒ <code>object</code>
Bodegas dadas de alta.

Es un catálogo: se cachea [FRESCURA_CATALOGO_MS](#FRESCURA_CATALOGO_MS) y se comparte entre
todas las pantallas que lo pidan, así que varias a la vez hacen una sola
petición en lugar de una cada una.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useQuery`: `{data, isLoading, isError, error}`.  
<a name="Periodo"></a>

## Periodo : <code>object</code>
Un periodo de nómina ya validado.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| period_id | <code>string</code> | Identificador del periodo. |
| semana | <code>number</code> | Número de semana del año. |
| anio | <code>number</code> | Año al que pertenece la semana. |
| fecha_corte | <code>string</code> | Fecha de corte, solo el día (`YYYY-MM-DD`). |
| emps_mx | <code>number</code> | Empleados en nómina mexicana. |
| total_mx | <code>number</code> | Total a pagar en pesos. |
| emps_us | <code>number</code> | Empleados en nómina estadounidense. |
| total_us | <code>number</code> | Total a pagar en dólares. |
| estado | <code>string</code> | `Pendiente` o `Autorizado`. |

<a name="DetallePago"></a>

## DetallePago : <code>object</code>
Un renglón del desglose por empleado.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| nombre | <code>string</code> | Nombre del empleado. |
| puesto | <code>string</code> | Puesto; cadena vacía si no se capturó. |
| frecuencia_pago | <code>string</code> | Semanal, Quincenal o Mensual. |
| tipo_nomina | <code>string</code> | `MX` o `US`. |
| sueldo | <code>number</code> | Monto a pagar en la divisa de su nómina. |

<a name="Empleado"></a>

## Empleado : <code>object</code>
Empleado de nómina ya normalizado y validado.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | Identificador del empleado. |
| nombre | <code>string</code> | Nombre completo. |
| puesto | <code>string</code> | Puesto; cadena vacía si no se capturó. |
| sueldo | <code>number</code> | Sueldo a pagar, ya convertido a número. |
| frecuencia_pago | <code>string</code> | Semanal, Quincenal o Mensual. |
| tipo_nomina | <code>string</code> | `MX` (pesos) o `US` (dólares). |

