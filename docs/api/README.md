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
<dt><a href="#idPhp">idPhp</a> ⇒ <code>object</code></dt>
<dd><p>Un identificador: siempre cadena, aunque PHP lo mande como número.</p>
</dd>
<dt><a href="#numeroPhp">numeroPhp</a> ⇒ <code>object</code></dt>
<dd><p>Un número que puede llegar como cadena. MySQL devuelve los <code>DECIMAL</code> así.</p>
</dd>
<dt><a href="#booleanoPhp">booleanoPhp</a> ⇒ <code>object</code></dt>
<dd><p>Un booleano que llega como <code>&quot;1&quot;</code> o <code>&quot;0&quot;</code>.</p>
</dd>
<dt><a href="#nullable">nullable</a> ⇒ <code>object</code></dt>
<dd><p>Un campo que puede venir nulo, <strong>conservando el nulo</strong>.</p>
<p><code>z.coerce.number()</code> convierte <code>null</code> en <code>0</code> y <code>z.coerce.string()</code> en la cadena
<code>&quot;null&quot;</code>; ambas cosas cambian el significado del dato. Un <code>tipo_cambio</code> de 0 no
es &quot;orden en pesos&quot;, y un <code>driver_id</code> de <code>&quot;null&quot;</code> acaba viajando así al backend.
Por eso el nullable va <strong>antes</strong> que la coacción en la unión.</p>
</dd>
<dt><a href="#fechaDia">fechaDia</a> ⇒ <code>object</code></dt>
<dd><p>Una fecha de la que solo interesa el día.</p>
<p>La API devuelve <code>&quot;2026-08-31 00:00:00&quot;</code> y las pantallas solo muestran la fecha.
Recortarla aquí evita el <code>fecha.split(&#39; &#39;)[0]</code> repartido por el JSX, que
revienta cuando la fecha viene nula.</p>
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
<dt><a href="#LLAVE_AUTONOMIA">LLAVE_AUTONOMIA</a> : <code>Array.&lt;string&gt;</code></dt>
<dd><p>Llave de caché de la autonomía de la flota.</p>
</dd>
<dt><a href="#esquemaRegistroAutonomia">esquemaRegistroAutonomia</a></dt>
<dd><p>Un registro de rendimiento: cuánto recorrió el camión con cuántos galones.</p>
</dd>
<dt><a href="#esquemaAutonomia">esquemaAutonomia</a></dt>
<dd><p>La autonomía de un camión, con sus registros de rendimiento anidados.</p>
</dd>
<dt><a href="#ultimoRegistro">ultimoRegistro</a> ⇒ <code>object</code> | <code>null</code></dt>
<dd><p>El registro más reciente de un camión.</p>
<p>Los registros vienen ordenados del más reciente al más antiguo.</p>
</dd>
<dt><a href="#LLAVE_DOCUMENTOS">LLAVE_DOCUMENTOS</a> : <code>Array.&lt;string&gt;</code></dt>
<dd><p>Llave de caché de los documentos corporativos.</p>
</dd>
<dt><a href="#useGuardarDocumento">useGuardarDocumento</a> ⇒ <code>object</code></dt>
<dd><p>Guarda el valor de un requisito y refresca el panel.</p>
</dd>
<dt><a href="#useCrearRequisito">useCrearRequisito</a> ⇒ <code>object</code></dt>
<dd><p>Crea un requisito y refresca el panel.</p>
</dd>
<dt><a href="#useEliminarRequisito">useEliminarRequisito</a> ⇒ <code>object</code></dt>
<dd><p>Retira un requisito y refresca el panel.</p>
</dd>
<dt><a href="#DIAS_POR_VENCER">DIAS_POR_VENCER</a> : <code>number</code></dt>
<dd><p>Días de antelación con los que un vencimiento se considera próximo.</p>
</dd>
<dt><a href="#esquemaRequisito">esquemaRequisito</a></dt>
<dd><p>Un requisito documental: qué documento hace falta y cómo se captura.</p>
</dd>
<dt><a href="#esquemaValor">esquemaValor</a></dt>
<dd><p>El valor capturado de un requisito.</p>
<p>Los tres campos son opcionales: un requisito de texto no trae <code>url_pdf</code>, y uno
sin vencimiento no trae fecha.</p>
</dd>
<dt><a href="#LLAVE_FINANZAS">LLAVE_FINANZAS</a> : <code>Array.&lt;string&gt;</code></dt>
<dd><p>Llave de caché de los viajes vistos desde finanzas.</p>
</dd>
<dt><a href="#LLAVE_PAGOS">LLAVE_PAGOS</a> : <code>Array.&lt;string&gt;</code></dt>
<dd><p>Llave de caché de los pagos a conductores.</p>
</dd>
<dt><a href="#LLAVE_TARIFAS">LLAVE_TARIFAS</a> : <code>Array.&lt;string&gt;</code></dt>
<dd><p>Llave de caché de las tarifas por milla.</p>
</dd>
<dt><a href="#METODOS_PAGO">METODOS_PAGO</a> : <code>Array.&lt;string&gt;</code></dt>
<dd><p>Formas de pago que acepta una etapa de viaje.</p>
</dd>
<dt><a href="#esquemaEtapa">esquemaEtapa</a></dt>
<dd><p>Una etapa de viaje con su cobro.</p>
</dd>
<dt><a href="#esquemaViajeFinanzas">esquemaViajeFinanzas</a></dt>
<dd><p>Un viaje visto desde finanzas: lo que se cobra y lo que ya se pagó.</p>
</dd>
<dt><a href="#esquemaPagoConductor">esquemaPagoConductor</a></dt>
<dd><p>El pago pendiente a un conductor por un viaje.</p>
</dd>
<dt><a href="#esquemaTarifaConductor">esquemaTarifaConductor</a></dt>
<dd><p>La tarifa por milla de un conductor.</p>
</dd>
<dt><a href="#normalizarEstadoCobro">normalizarEstadoCobro</a> ⇒ <code>number</code></dt>
<dd><p>Normaliza un estado de cobro, tratando el nulo como pendiente.</p>
</dd>
<dt><a href="#etiquetaCobro">etiquetaCobro</a> ⇒ <code>Object</code></dt>
<dd><p>Cómo mostrar el estado de cobro de un viaje.</p>
</dd>
<dt><a href="#estaPagado">estaPagado</a> ⇒ <code>boolean</code></dt>
<dd><p>Indica si un viaje ya está cobrado por completo.</p>
</dd>
<dt><a href="#saldoPendiente">saldoPendiente</a> ⇒ <code>number</code></dt>
<dd><p>Lo que falta por cobrar de un viaje.</p>
</dd>
<dt><a href="#estaAutorizado">estaAutorizado</a> ⇒ <code>boolean</code></dt>
<dd><p>Indica si el pago a un conductor está autorizado pero sin pagar.</p>
</dd>
<dt><a href="#estaPagadoConductor">estaPagadoConductor</a> ⇒ <code>boolean</code></dt>
<dd><p>Indica si al conductor ya se le pagó.</p>
</dd>
<dt><a href="#LLAVE_PERIODOS_IFTA">LLAVE_PERIODOS_IFTA</a> : <code>Array.&lt;string&gt;</code></dt>
<dd><p>Llave de caché de los periodos IFTA.</p>
</dd>
<dt><a href="#llaveTotalesIfta">llaveTotalesIfta</a> ⇒ <code>Array</code></dt>
<dd><p>Llave de caché de los totales por estado.</p>
<p>Los filtros entran en la llave para que cada combinación tenga su propio
resultado en vez de pisar el anterior.</p>
</dd>
<dt><a href="#esquemaPeriodoIfta">esquemaPeriodoIfta</a></dt>
<dd><p>Millas recorridas y galones cargados en un estado, dentro de un periodo.</p>
<p><code>periodo</code> viene vacío en la respuesta real: el corte se decide con <code>trip_year</code>
y los filtros de fecha, no con ese campo.</p>
</dd>
<dt><a href="#esquemaTotalEstado">esquemaTotalEstado</a></dt>
<dd><p>Millas totales por estado, con cuántos viajes las produjeron.</p>
</dd>
<dt><a href="#LLAVE_INSPECCIONES">LLAVE_INSPECCIONES</a> : <code>Array.&lt;string&gt;</code></dt>
<dd><p>Llave de caché de las inspecciones.</p>
</dd>
<dt><a href="#esquemaReporte">esquemaReporte</a></dt>
<dd><p>Un reporte dentro de una inspección: cada violación levantada.</p>
</dd>
<dt><a href="#esquemaInspeccion">esquemaInspeccion</a></dt>
<dd><p>Una inspección operativa hecha a un camión en ruta.</p>
<p>Las multas se separan en dos: lo que paga IMA y lo que paga el conductor. El
<code>total</code> lo calcula el backend sumando ambas.</p>
</dd>
<dt><a href="#sinMulta">sinMulta</a> ⇒ <code>boolean</code></dt>
<dd><p>Indica si una inspección salió sin multa.</p>
<p>Es lo normal: al 2026-09-01 las tres inspecciones registradas están en 0. Una
inspección limpia no es un dato faltante.</p>
</dd>
<dt><a href="#cuentaViolaciones">cuentaViolaciones</a> ⇒ <code>number</code></dt>
<dd><p>Cuenta las violaciones de una inspección.</p>
</dd>
<dt><a href="#LLAVE_INVENTARIO">LLAVE_INVENTARIO</a> : <code>Array.&lt;string&gt;</code></dt>
<dd><p>Llave de caché del inventario.</p>
</dd>
<dt><a href="#esquemaArticulo">esquemaArticulo</a></dt>
<dd><p>Un artículo del inventario con su categoría y subcategoría.</p>
<p>La API los devuelve ya cruzados con los catálogos, así que no hay que unir
nada del lado del cliente.</p>
</dd>
<dt><a href="#sinNombre">sinNombre</a> ⇒ <code>boolean</code></dt>
<dd><p>Indica si a un artículo le falta el nombre.</p>
<p>Existen en la base y la pantalla los muestra como &quot;Sin nombre&quot;. Marcarlos
permite filtrarlos para limpiarlos, sin esconder sus existencias.</p>
</dd>
<dt><a href="#estaAgotado">estaAgotado</a> ⇒ <code>boolean</code></dt>
<dd><p>Indica si un artículo está agotado.</p>
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
<dt><a href="#llaveGrafica">llaveGrafica</a> ⇒ <code>Array</code></dt>
<dd><p>Llave de caché de una gráfica.</p>
<p>Los parámetros entran en la llave para que cambiar el periodo traiga su propio
resultado en vez de pisar el anterior.</p>
</dd>
<dt><a href="#aDia">aDia</a> ⇒ <code>string</code></dt>
<dd><p>Recorta una fecha ISO al día.</p>
</dd>
<dt><a href="#aMes">aMes</a> ⇒ <code>string</code></dt>
<dd><p>Recorta una fecha ISO al mes, que es como se agrupan las gráficas.</p>
</dd>
<dt><a href="#etiquetaMes">etiquetaMes</a> ⇒ <code>string</code></dt>
<dd><p>Convierte <code>2026-08</code> en <code>ago 2026</code>, para los ejes.</p>
</dd>
<dt><a href="#normalizarFinanzas">normalizarFinanzas</a> ⇒ <code>Array</code></dt>
<dd><p>Normaliza las series de rate contra pagado, que comparten forma.</p>
<p>La usan <code>chart_finances</code> y <code>chart_finances_rts</code>: mismas claves, distinto origen.</p>
</dd>
<dt><a href="#normalizarMantenimiento">normalizarMantenimiento</a> ⇒ <code>Array</code></dt>
<dd><p>Normaliza el costo de mantenimiento por mes.</p>
</dd>
<dt><a href="#agruparDieselPorMes">agruparDieselPorMes</a> ⇒ <code>Array</code></dt>
<dd><p>Agrupa las cargas de diesel por mes, sumando monto y fleetone.</p>
<p>La API devuelve una fila por carga; la gráfica es mensual, así que la suma
ocurre aquí y no en el JSX. Es lógica de negocio, no de presentación.</p>
</dd>
<dt><a href="#ultimosMeses">ultimosMeses</a> ⇒ <code>Array</code></dt>
<dd><p>Se queda con los últimos N meses de una serie ya ordenada.</p>
</dd>
<dt><a href="#LLAVE_REPARACIONES">LLAVE_REPARACIONES</a> : <code>Array.&lt;string&gt;</code></dt>
<dd><p>Llave de caché de las reparaciones en ruta.</p>
</dd>
<dt><a href="#esquemaDocumento">esquemaDocumento</a></dt>
<dd><p>Un documento adjunto a una reparación.</p>
</dd>
<dt><a href="#esquemaReparacion">esquemaReparacion</a></dt>
<dd><p>Una reparación en ruta: lo que le pasó a un camión durante un viaje.</p>
<p>Ojo con las dos fechas, que no son lo mismo:</p>
<ul>
<li><code>fecha_suceso</code> es <strong>cuándo ocurrió</strong> la avería.</li>
<li><code>fecha_registro</code> es <strong>cuándo se capturó</strong> en el sistema.</li>
</ul>
<p><code>fecha_suceso</code> se agregó después y admite nulos a propósito: la app móvil
también da de alta reparaciones, y el UPDATE del backend solo toca la columna
si el campo llegó en el POST, para que un cliente que no la mande no borre la
fecha existente. Al 2026-09-01 está nula en todos los registros.</p>
</dd>
<dt><a href="#fechaRelevante">fechaRelevante</a> ⇒ <code>string</code></dt>
<dd><p>La fecha con la que conviene mostrar una reparación.</p>
<p>Prefiere cuándo ocurrió; si no se capturó, cae a cuándo se registró. Así la
lista siempre tiene una fecha que enseñar aunque falte la del suceso.</p>
</dd>
<dt><a href="#tieneDocumentos">tieneDocumentos</a> ⇒ <code>boolean</code></dt>
<dd><p>Indica si una reparación tiene comprobantes adjuntos.</p>
</dd>
<dt><a href="#LLAVE_SAFETY">LLAVE_SAFETY</a> : <code>Array.&lt;string&gt;</code></dt>
<dd><p>Llave de caché de los viajes de cumplimiento.</p>
</dd>
<dt><a href="#esquemaViajeSafety">esquemaViajeSafety</a></dt>
<dd><p>Un viaje visto desde cumplimiento: qué documentos tiene y cuáles le faltan.</p>
<p>Los tres documentos llegan como una URL o como <code>null</code>. Un <code>null</code> significa que
falta, no que haya un error.</p>
</dd>
<dt><a href="#tieneDocumento">tieneDocumento</a> ⇒ <code>boolean</code></dt>
<dd><p>Indica si un viaje tiene subido un documento concreto.</p>
</dd>
<dt><a href="#documentosFaltantes">documentosFaltantes</a> ⇒ <code>Array.&lt;string&gt;</code></dt>
<dd><p>Los documentos que le faltan a un viaje.</p>
</dd>
<dt><a href="#cumplimientoCompleto">cumplimientoCompleto</a> ⇒ <code>boolean</code></dt>
<dd><p>Indica si un viaje tiene toda su documentación.</p>
</dd>
<dt><a href="#LLAVE_ORDENES">LLAVE_ORDENES</a> : <code>Array.&lt;string&gt;</code></dt>
<dd><p>Llave de caché de las órdenes de servicio.</p>
</dd>
<dt><a href="#esquemaServicio">esquemaServicio</a></dt>
<dd><p>Un servicio dentro de una orden: qué se le hizo al camión.</p>
<p><code>detalles</code> son las refacciones y la mano de obra; puede venir vacío.</p>
</dd>
<dt><a href="#esquemaOrden">esquemaOrden</a></dt>
<dd><p>Una orden de servicio con sus servicios anidados.</p>
<p>La API los devuelve así, en una sola llamada: no hay que pedir el detalle
aparte. <code>tipo_cambio</code> viene nulo cuando la orden es en pesos.</p>
</dd>
<dt><a href="#estaAbierta">estaAbierta</a> ⇒ <code>boolean</code></dt>
<dd><p>Indica si una orden sigue abierta al trabajo.</p>
</dd>
<dt><a href="#LLAVE_EQUIPOS">LLAVE_EQUIPOS</a> : <code>Array.&lt;string&gt;</code></dt>
<dd><p>Llave de caché de la lista de equipos.</p>
</dd>
<dt><a href="#llaveMiembros">llaveMiembros</a> ⇒ <code>Array.&lt;string&gt;</code></dt>
<dd><p>Llave de caché de los miembros de un equipo.</p>
</dd>
<dt><a href="#LLAVE_AFINACIONES">LLAVE_AFINACIONES</a> : <code>Array.&lt;string&gt;</code></dt>
<dd><p>Llave de caché del estado de afinaciones.</p>
</dd>
<dt><a href="#LLAVE_HISTORIAL">LLAVE_HISTORIAL</a> : <code>Array.&lt;string&gt;</code></dt>
<dd><p>Llave de caché del historial de afinaciones.</p>
</dd>
<dt><a href="#useRegistrarAfinacion">useRegistrarAfinacion</a> ⇒ <code>object</code></dt>
<dd><p>Registra una afinación y refresca la flota.</p>
</dd>
<dt><a href="#useActualizarLimite">useActualizarLimite</a> ⇒ <code>object</code></dt>
<dd><p>Cambia el límite de un camión y refresca la flota.</p>
</dd>
<dt><a href="#useCorregirOdometro">useCorregirOdometro</a> ⇒ <code>object</code></dt>
<dd><p>Corrige un odómetro y refresca la flota.</p>
</dd>
<dt><a href="#UMBRAL_PROXIMA">UMBRAL_PROXIMA</a> : <code>number</code></dt>
<dd><p>Proporción del límite a partir de la cual una afinación se considera próxima.</p>
</dd>
<dt><a href="#esquemaRegistroDiesel">esquemaRegistroDiesel</a></dt>
<dd><p>Una carga de diesel, que es de donde sale la lectura del odómetro.</p>
</dd>
<dt><a href="#esquemaAfinacion">esquemaAfinacion</a></dt>
<dd><p>El estado de afinación de un camión.</p>
<p><code>millas_acumuladas</code> las calcula el backend restando el odómetro base al último
registrado, así que aquí se toma tal cual y no se recalcula: hacerlo daría dos
verdades que pueden discrepar.</p>
</dd>
<dt><a href="#esquemaHistorial">esquemaHistorial</a></dt>
<dd><p>Un registro histórico de afinación.</p>
</dd>
<dt><a href="#millasRestantes">millasRestantes</a> ⇒ <code>number</code></dt>
<dd><p>Millas que faltan para la próxima afinación.</p>
</dd>
<dt><a href="#llavePermisosUsuario">llavePermisosUsuario</a> ⇒ <code>Array.&lt;string&gt;</code></dt>
<dd><p>Llave de caché de los permisos de un usuario.</p>
</dd>
<dt><a href="#LLAVE_USUARIOS">LLAVE_USUARIOS</a> : <code>Array.&lt;string&gt;</code></dt>
<dd><p>Llave de caché de la lista de usuarios.</p>
</dd>
<dt><a href="#esquemaUsuario">esquemaUsuario</a></dt>
<dd><p>Usuario del sistema, tal como lo devuelve <code>features.php</code> · <code>get_users</code>.</p>
<p><strong>No incluye <code>pass</code> a propósito.</strong> El endpoint devuelve la contraseña en claro
de cada usuario; dejarla fuera del esquema evita que llegue al estado de la
aplicación, se pinte por accidente o acabe en un log. No arregla el endpoint
—eso es de backend— pero corta la propagación en el frontend.</p>
</dd>
<dt><a href="#estaActivo">estaActivo</a> ⇒ <code>boolean</code></dt>
<dd><p>Indica si un usuario está activo.</p>
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
<dt><a href="#obtenerAutonomia">obtenerAutonomia([opciones])</a> ⇒ <code>Promise.&lt;Array&gt;</code></dt>
<dd><p>Trae el rendimiento de cada camión con sus registros anidados.</p>
</dd>
<dt><a href="#useAutonomia">useAutonomia()</a> ⇒ <code>object</code></dt>
<dd><p>Autonomía de la flota, cacheada.</p>
</dd>
<dt><a href="#promedioMpg">promedioMpg(autonomia)</a> ⇒ <code>number</code></dt>
<dd><p>Promedio de millas por galón de un camión.</p>
<p>Ignora los registros con rendimiento 0 o negativo: son cargas sin recorrido
asociado, y meterlas en el promedio lo hunde sin que nada haya pasado.</p>
</dd>
<dt><a href="#totales">totales(autonomia)</a> ⇒ <code>Object</code></dt>
<dd><p>Totales de distancia y galones de un camión.</p>
</dd>
<dt><a href="#normalizarAutonomias">normalizarAutonomias(filas)</a> ⇒ <code>Object</code></dt>
<dd><p>Valida la lista de autonomías descartando lo que no cumple.</p>
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
<dt><a href="#obtenerDocumentos">obtenerDocumentos([opciones])</a> ⇒ <code>Promise.&lt;object&gt;</code></dt>
<dd><p>Trae los requisitos documentales y lo capturado para cada uno.</p>
<p>La respuesta trae dos cosas distintas: <code>requisitos</code> es una lista y <code>valores</code> un
<strong>objeto indexado por <code>key_name</code></strong>. Por eso usa <code>post</code> y no <code>postLista</code>.</p>
</dd>
<dt><a href="#guardarDocumento">guardarDocumento(datos)</a> ⇒ <code>Promise.&lt;object&gt;</code></dt>
<dd><p>Guarda el valor de un requisito: sube el archivo, el texto y la vigencia.</p>
</dd>
<dt><a href="#crearRequisito">crearRequisito(datos)</a> ⇒ <code>Promise.&lt;object&gt;</code></dt>
<dd><p>Crea un requisito documental nuevo.</p>
</dd>
<dt><a href="#eliminarRequisito">eliminarRequisito(keyName)</a> ⇒ <code>Promise.&lt;object&gt;</code></dt>
<dd><p>Retira un requisito del panel.</p>
<p>No borra lo capturado: el documento se conserva y solo deja de pedirse.</p>
</dd>
<dt><a href="#useDocumentos">useDocumentos()</a> ⇒ <code>object</code></dt>
<dd><p>Requisitos y valores, cacheados.</p>
</dd>
<dt><a href="#crearMutacion">crearMutacion(mutationFn)</a> ⇒ <code>function</code></dt>
<dd><p>Crea una mutación que refresca los documentos al terminar.</p>
<p>Las tres operaciones invalidan lo mismo, así que comparten fábrica en vez de
repetir el <code>onSuccess</code> tres veces.</p>
</dd>
<dt><a href="#diasRestantes">diasRestantes(fecha, [hoy])</a> ⇒ <code>number</code> | <code>null</code></dt>
<dd><p>Días que faltan para una fecha, contando desde hoy.</p>
<p>Compara a medianoche para que un documento que vence hoy dé 0 y no un número
negativo por unas horas.</p>
</dd>
<dt><a href="#estadoDocumento">estadoDocumento(requisito, [valor], [hoy])</a> ⇒ <code>string</code></dt>
<dd><p>Clasifica un documento según su captura y su vencimiento.</p>
<p>Un requisito sin control de vencimiento nunca sale como vencido: solo importa
si está capturado o no.</p>
</dd>
<dt><a href="#normalizarDocumentos">normalizarDocumentos(respuesta)</a> ⇒ <code>Object</code></dt>
<dd><p>Valida los requisitos y deja los valores listos para consultarlos por clave.</p>
<p><code>valores</code> llega como <strong>objeto indexado por <code>key_name</code></strong>, no como arreglo: es lo
que devuelve <code>IMA_Docsv2.php</code> y tratarlo como lista da siempre vacío.</p>
</dd>
<dt><a href="#porRegion">porRegion(requisitos)</a> ⇒ <code>Object</code></dt>
<dd><p>Separa los requisitos activos por región, que es como se pintan.</p>
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
<dt><a href="#obtenerViajesFinanzas">obtenerViajesFinanzas([opciones])</a> ⇒ <code>Promise.&lt;Array&gt;</code></dt>
<dd><p>Trae los viajes con su cobro y sus etapas anidadas.</p>
</dd>
<dt><a href="#obtenerPagosConductores">obtenerPagosConductores([opciones])</a> ⇒ <code>Promise.&lt;Array&gt;</code></dt>
<dd><p>Trae los pagos pendientes a conductores.</p>
</dd>
<dt><a href="#obtenerTarifasConductor">obtenerTarifasConductor([opciones])</a> ⇒ <code>Promise.&lt;Array&gt;</code></dt>
<dd><p>Trae la tarifa por milla de cada conductor.</p>
</dd>
<dt><a href="#guardarTarifasConductor">guardarTarifasConductor(tarifas)</a> ⇒ <code>Promise.&lt;object&gt;</code></dt>
<dd><p>Guarda varias tarifas por milla de una vez.</p>
</dd>
<dt><a href="#registrarCobrosEtapas">registrarCobrosEtapas(pagos)</a> ⇒ <code>Promise.&lt;object&gt;</code></dt>
<dd><p>Registra el cobro de varias etapas a la vez.</p>
</dd>
<dt><a href="#useViajesFinanzas">useViajesFinanzas()</a> ⇒ <code>object</code></dt>
<dd><p>Viajes de finanzas, cacheados.</p>
</dd>
<dt><a href="#usePagosConductores">usePagosConductores()</a> ⇒ <code>object</code></dt>
<dd><p>Pagos a conductores, cacheados.</p>
</dd>
<dt><a href="#useTarifasConductor">useTarifasConductor()</a> ⇒ <code>object</code></dt>
<dd><p>Tarifas por milla. Es un catálogo: se cachea más tiempo.</p>
</dd>
<dt><a href="#useGuardarTarifasConductor">useGuardarTarifasConductor()</a> ⇒ <code>object</code></dt>
<dd><p>Guarda las tarifas y refresca su lista.</p>
</dd>
<dt><a href="#useRegistrarCobrosEtapas">useRegistrarCobrosEtapas()</a> ⇒ <code>object</code></dt>
<dd><p>Registra cobros y refresca los viajes de finanzas.</p>
</dd>
<dt><a href="#totalesFinanzas">totalesFinanzas(viajes)</a> ⇒ <code>Object</code></dt>
<dd><p>Suma tarifa y cobrado de una lista de viajes.</p>
</dd>
<dt><a href="#normalizarLista">normalizarLista(filas, esquema)</a> ⇒ <code>Object</code></dt>
<dd><p>Valida una lista con el esquema dado, descartando lo que no cumple.</p>
</dd>
<dt><a href="#obtenerPeriodosIfta">obtenerPeriodosIfta([opciones])</a> ⇒ <code>Promise.&lt;Array&gt;</code></dt>
<dd><p>Trae millas y galones por estado y año fiscal.</p>
</dd>
<dt><a href="#obtenerTotalesPorEstado">obtenerTotalesPorEstado([filtros])</a> ⇒ <code>Promise.&lt;Array&gt;</code></dt>
<dd><p>Trae las millas totales por estado, con filtros opcionales.</p>
<p>Cada filtro solo viaja si trae valor: mandar un rango vacío cambiaría el
resultado en vez de dejarlo sin filtrar.</p>
</dd>
<dt><a href="#obtenerViajesIfta">obtenerViajesIfta([filtros])</a> ⇒ <code>Promise.&lt;Array&gt;</code></dt>
<dd><p>Trae los viajes que componen un total de IFTA.</p>
</dd>
<dt><a href="#usePeriodosIfta">usePeriodosIfta()</a> ⇒ <code>object</code></dt>
<dd><p>Periodos IFTA, cacheados. Cambian poco: se cachean más tiempo.</p>
</dd>
<dt><a href="#useTotalesPorEstado">useTotalesPorEstado([filtros])</a> ⇒ <code>object</code></dt>
<dd><p>Totales por estado según los filtros activos.</p>
</dd>
<dt><a href="#rendimientoEstado">rendimientoEstado(registro)</a> ⇒ <code>number</code></dt>
<dd><p>Rendimiento de un estado: millas recorridas por galón cargado.</p>
<p>Es el número que importa para IFTA, porque el impuesto se paga por la
diferencia entre dónde se recorrió y dónde se compró el combustible.</p>
</dd>
<dt><a href="#totalesIfta">totalesIfta(registros)</a> ⇒ <code>Object</code></dt>
<dd><p>Suma millas y galones de una lista de estados.</p>
</dd>
<dt><a href="#agruparPorAnio">agruparPorAnio(registros)</a> ⇒ <code>Array.&lt;{anio: string, registros: Array}&gt;</code></dt>
<dd><p>Agrupa los registros por año fiscal, del más reciente al más antiguo.</p>
</dd>
<dt><a href="#normalizarLista">normalizarLista(filas, esquema)</a> ⇒ <code>Object</code></dt>
<dd><p>Valida una lista con el esquema dado, descartando lo que no cumple.</p>
</dd>
<dt><a href="#obtenerInspecciones">obtenerInspecciones([opciones])</a> ⇒ <code>Promise.&lt;Array&gt;</code></dt>
<dd><p>Trae todas las inspecciones con sus reportes y documentos.</p>
<p>Los reportes llegan ya parseados en <code>reportes</code>; el campo <code>reportes_json</code> es la
misma información como cadena y no hace falta tocarlo.</p>
</dd>
<dt><a href="#guardarInspeccion">guardarInspeccion(datos)</a> ⇒ <code>Promise.&lt;object&gt;</code></dt>
<dd><p>Guarda una inspección, nueva o existente.</p>
</dd>
<dt><a href="#obtenerDescripciones">obtenerDescripciones([opciones])</a> ⇒ <code>Promise.&lt;Array&gt;</code></dt>
<dd><p>Trae el catálogo de descripciones de violación.</p>
</dd>
<dt><a href="#eliminarDocumento">eliminarDocumento(documentoId)</a> ⇒ <code>Promise.&lt;object&gt;</code></dt>
<dd><p>Elimina un documento adjunto de una inspección.</p>
</dd>
<dt><a href="#useInspecciones">useInspecciones()</a> ⇒ <code>object</code></dt>
<dd><p>Inspecciones, cacheadas.</p>
</dd>
<dt><a href="#useDescripciones">useDescripciones()</a> ⇒ <code>object</code></dt>
<dd><p>Catálogo de descripciones. Se cachea más tiempo: cambia poco.</p>
</dd>
<dt><a href="#useGuardarInspeccion">useGuardarInspeccion()</a> ⇒ <code>object</code></dt>
<dd><p>Guarda una inspección y refresca la lista.</p>
</dd>
<dt><a href="#useEliminarDocumentoInspeccion">useEliminarDocumentoInspeccion()</a> ⇒ <code>object</code></dt>
<dd><p>Elimina un documento y refresca la lista.</p>
</dd>
<dt><a href="#totalCuadra">totalCuadra(inspeccion, [tolerancia])</a> ⇒ <code>boolean</code></dt>
<dd><p>Comprueba que el total cuadre con la suma de las dos multas.</p>
</dd>
<dt><a href="#normalizarInspecciones">normalizarInspecciones(filas)</a> ⇒ <code>Object</code></dt>
<dd><p>Valida la lista de inspecciones descartando lo que no cumple.</p>
</dd>
<dt><a href="#obtenerInventario">obtenerInventario([opciones])</a> ⇒ <code>Promise.&lt;Array&gt;</code></dt>
<dd><p>Trae el inventario completo, ya cruzado con sus categorías.</p>
<p>Ojo con el nombre de la operación: es <code>getFullInventoryList</code>, no <code>getAll</code>.
<code>inventory.php</code> responde &quot;Operación no válida&quot; ante cualquier otra.</p>
</dd>
<dt><a href="#useInventario">useInventario()</a> ⇒ <code>object</code></dt>
<dd><p>Inventario completo, cacheado.</p>
</dd>
<dt><a href="#normalizarArticulos">normalizarArticulos(filas)</a> ⇒ <code>Object</code></dt>
<dd><p>Valida la lista de artículos descartando los que no cumplen lo mínimo.</p>
</dd>
<dt><a href="#agruparPorCategoria">agruparPorCategoria(articulos)</a> ⇒ <code>Array.&lt;{categoria: string, articulos: Array.&lt;Articulo&gt;}&gt;</code></dt>
<dd><p>Agrupa los artículos por categoría, conservando el orden alfabético.</p>
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
<dt><a href="#obtenerGrafica">obtenerGrafica(argumentos)</a> ⇒ <code>Promise.&lt;Array&gt;</code></dt>
<dd><p>Trae los datos de una gráfica.</p>
</dd>
<dt><a href="#useGrafica">useGrafica(op, [parametros])</a> ⇒ <code>object</code></dt>
<dd><p>Datos de una gráfica, cacheados.</p>
</dd>
<dt><a href="#useGraficas">useGraficas(peticiones)</a> ⇒ <code>Array.&lt;object&gt;</code></dt>
<dd><p>Varias gráficas a la vez.</p>
<p>Se piden en paralelo y cada una llega cuando puede, así que una lenta no
retrasa a las demás. Antes eran seis <code>useEffect</code> y doce <code>useState</code>.</p>
</dd>
<dt><a href="#obtenerReparaciones">obtenerReparaciones([opciones])</a> ⇒ <code>Promise.&lt;Array&gt;</code></dt>
<dd><p>Trae todas las reparaciones en ruta con sus documentos.</p>
</dd>
<dt><a href="#guardarReparacion">guardarReparacion(datos)</a> ⇒ <code>Promise.&lt;object&gt;</code></dt>
<dd><p>Guarda una reparación, nueva o existente.</p>
<p><strong><code>fecha_suceso</code> solo viaja si trae valor.</strong> El UPDATE del backend solo toca la
columna si el campo llegó en el POST, para que un cliente que no la mande —la
app móvil, por ejemplo— no borre la fecha que ya estaba.</p>
</dd>
<dt><a href="#eliminarDocumento">eliminarDocumento(documentoId)</a> ⇒ <code>Promise.&lt;object&gt;</code></dt>
<dd><p>Elimina un documento adjunto de una reparación.</p>
</dd>
<dt><a href="#useReparaciones">useReparaciones()</a> ⇒ <code>object</code></dt>
<dd><p>Reparaciones en ruta, cacheadas.</p>
</dd>
<dt><a href="#useGuardarReparacion">useGuardarReparacion()</a> ⇒ <code>object</code></dt>
<dd><p>Guarda una reparación y refresca la lista.</p>
</dd>
<dt><a href="#useEliminarDocumentoReparacion">useEliminarDocumentoReparacion()</a> ⇒ <code>object</code></dt>
<dd><p>Elimina un documento y refresca la lista.</p>
</dd>
<dt><a href="#totalCuadra">totalCuadra(reparacion, [tolerancia])</a> ⇒ <code>boolean</code></dt>
<dd><p>Comprueba que el total cuadre con la suma de sus partes.</p>
<p>El backend lo calcula, así que aquí no se recalcula —serían dos verdades que
pueden discrepar—, pero sí se puede detectar cuando no cuadra.</p>
</dd>
<dt><a href="#normalizarReparaciones">normalizarReparaciones(filas)</a> ⇒ <code>Object</code></dt>
<dd><p>Valida la lista de reparaciones descartando lo que no cumple.</p>
</dd>
<dt><a href="#obtenerViajesSafety">obtenerViajesSafety([opciones])</a> ⇒ <code>Promise.&lt;Array&gt;</code></dt>
<dd><p>Trae los viajes con el estado de su documentación.</p>
</dd>
<dt><a href="#useViajesSafety">useViajesSafety()</a> ⇒ <code>object</code></dt>
<dd><p>Viajes de cumplimiento, cacheados.</p>
</dd>
<dt><a href="#separarPorCumplimiento">separarPorCumplimiento(viajes)</a> ⇒ <code>Object</code></dt>
<dd><p>Separa los viajes entre los que cumplen y los que no.</p>
<p>Es lo que alimenta las dos primeras pestañas de la pantalla.</p>
</dd>
<dt><a href="#contarFaltantes">contarFaltantes(viajes)</a> ⇒ <code>object</code></dt>
<dd><p>Cuenta cuántos viajes carecen de cada documento.</p>
<p>Alimenta los contadores rojos junto a cada columna.</p>
</dd>
<dt><a href="#normalizarViajesSafety">normalizarViajesSafety(filas)</a> ⇒ <code>Object</code></dt>
<dd><p>Valida la lista de viajes descartando lo que no cumple.</p>
</dd>
<dt><a href="#obtenerOrdenes">obtenerOrdenes([opciones])</a> ⇒ <code>Promise.&lt;Array&gt;</code></dt>
<dd><p>Trae todas las órdenes con sus servicios anidados.</p>
<p>Vienen en una sola llamada: la API anida los servicios dentro de cada orden,
así que no hay que pedir el detalle aparte.</p>
</dd>
<dt><a href="#obtenerOrden">obtenerOrden(parametros)</a> ⇒ <code>Promise.&lt;object&gt;</code></dt>
<dd><p>Trae una orden concreta para editarla.</p>
</dd>
<dt><a href="#obtenerCamionesDeOrden">obtenerCamionesDeOrden([opciones])</a> ⇒ <code>Promise.&lt;Array&gt;</code></dt>
<dd><p>Camiones disponibles para asignar una orden.</p>
<p>Ya vienen con la forma <code>{value, label}</code> que espera react-select.</p>
</dd>
<dt><a href="#cambiarEstatusServicio">cambiarEstatusServicio(parametros)</a> ⇒ <code>Promise.&lt;object&gt;</code></dt>
<dd><p>Cambia el estatus de un servicio dentro de una orden.</p>
</dd>
<dt><a href="#useOrdenes">useOrdenes()</a> ⇒ <code>object</code></dt>
<dd><p>Órdenes de servicio, cacheadas.</p>
</dd>
<dt><a href="#useCamionesDeOrden">useCamionesDeOrden()</a> ⇒ <code>object</code></dt>
<dd><p>Camiones para el formulario de orden. Es un catálogo: se cachea más tiempo.</p>
</dd>
<dt><a href="#useCambiarEstatusServicio">useCambiarEstatusServicio()</a> ⇒ <code>object</code></dt>
<dd><p>Cambia el estatus de un servicio y refresca las órdenes.</p>
</dd>
<dt><a href="#normalizarOrdenes">normalizarOrdenes(filas)</a> ⇒ <code>Object</code></dt>
<dd><p>Valida una lista de órdenes descartando las que no cumplen lo mínimo.</p>
</dd>
<dt><a href="#resumenServicios">resumenServicios(orden)</a> ⇒ <code>Object</code></dt>
<dd><p>Cuenta los servicios de una orden por estatus.</p>
<p>Sirve para el resumen de la fila sin recorrer los servicios en el JSX.</p>
</dd>
<dt><a href="#todoCompletado">todoCompletado(orden)</a> ⇒ <code>boolean</code></dt>
<dd><p>Indica si todos los servicios de una orden están completados.</p>
<p>Una orden sin servicios <strong>no</strong> cuenta como completa: no hay nada hecho todavía.</p>
</dd>
<dt><a href="#obtenerEquipos">obtenerEquipos([opciones])</a> ⇒ <code>Promise.&lt;Array&gt;</code></dt>
<dd><p>Trae todos los equipos.</p>
</dd>
<dt><a href="#obtenerMiembros">obtenerMiembros(parametros)</a> ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code></dt>
<dd><p>Trae los identificadores de los miembros de un equipo.</p>
</dd>
<dt><a href="#crearEquipo">crearEquipo(datos)</a> ⇒ <code>Promise.&lt;object&gt;</code></dt>
<dd><p>Crea un equipo.</p>
</dd>
<dt><a href="#editarEquipo">editarEquipo(parametros)</a> ⇒ <code>Promise.&lt;object&gt;</code></dt>
<dd><p>Renombra o redescribe un equipo.</p>
</dd>
<dt><a href="#eliminarEquipo">eliminarEquipo(teamId)</a> ⇒ <code>Promise.&lt;object&gt;</code></dt>
<dd><p>Elimina un equipo. No borra a sus miembros, solo la agrupación.</p>
</dd>
<dt><a href="#guardarMiembros">guardarMiembros(parametros)</a> ⇒ <code>Promise.&lt;object&gt;</code></dt>
<dd><p>Reemplaza por completo la lista de miembros de un equipo.</p>
<p>No es incremental: manda la lista final, así que un id que falte queda fuera
del equipo.</p>
</dd>
<dt><a href="#useEquipos">useEquipos()</a> ⇒ <code>object</code></dt>
<dd><p>Lista de equipos, cacheada.</p>
</dd>
<dt><a href="#useMiembros">useMiembros(teamId)</a> ⇒ <code>object</code></dt>
<dd><p>Miembros de un equipo. No consulta hasta tener un equipo seleccionado.</p>
</dd>
<dt><a href="#useCrearEquipo">useCrearEquipo()</a> ⇒ <code>object</code></dt>
<dd><p>Crea un equipo y refresca la lista.</p>
</dd>
<dt><a href="#useEditarEquipo">useEditarEquipo()</a> ⇒ <code>object</code></dt>
<dd><p>Edita un equipo y refresca la lista.</p>
</dd>
<dt><a href="#useEliminarEquipo">useEliminarEquipo()</a> ⇒ <code>object</code></dt>
<dd><p>Elimina un equipo y refresca la lista.</p>
</dd>
<dt><a href="#useGuardarMiembros">useGuardarMiembros()</a> ⇒ <code>object</code></dt>
<dd><p>Guarda los miembros de un equipo y refresca ese equipo.</p>
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
<dt><a href="#obtenerAfinaciones">obtenerAfinaciones([opciones])</a> ⇒ <code>Promise.&lt;Array&gt;</code></dt>
<dd><p>Trae el estado de afinación de cada camión.</p>
</dd>
<dt><a href="#obtenerHistorial">obtenerHistorial([opciones])</a> ⇒ <code>Promise.&lt;Array&gt;</code></dt>
<dd><p>Trae el historial de afinaciones hechas.</p>
</dd>
<dt><a href="#registrarAfinacion">registrarAfinacion(datos)</a> ⇒ <code>Promise.&lt;object&gt;</code></dt>
<dd><p>Registra una afinación y reinicia el contador de millas del camión.</p>
</dd>
<dt><a href="#actualizarLimite">actualizarLimite(datos)</a> ⇒ <code>Promise.&lt;object&gt;</code></dt>
<dd><p>Cambia cada cuántas millas se afina un camión.</p>
</dd>
<dt><a href="#corregirOdometro">corregirOdometro(datos)</a> ⇒ <code>Promise.&lt;object&gt;</code></dt>
<dd><p>Corrige una lectura de odómetro mal capturada.</p>
<p>Existe porque pasa: en los datos reales hay lecturas con un dígito de menos
entre valores de un millón y medio.</p>
</dd>
<dt><a href="#useAfinaciones">useAfinaciones()</a> ⇒ <code>object</code></dt>
<dd><p>Estado de afinación de la flota, cacheado.</p>
</dd>
<dt><a href="#useHistorialAfinaciones">useHistorialAfinaciones()</a> ⇒ <code>object</code></dt>
<dd><p>Historial de afinaciones, cacheado.</p>
</dd>
<dt><a href="#crearMutacion">crearMutacion(mutationFn)</a> ⇒ <code>function</code></dt>
<dd><p>Crea una mutación que refresca las afinaciones al terminar.</p>
<p>Las tres invalidan lo mismo, así que comparten fábrica.</p>
</dd>
<dt><a href="#progresoAfinacion">progresoAfinacion(afinacion)</a> ⇒ <code>number</code></dt>
<dd><p>Qué proporción del límite lleva recorrida un camión.</p>
</dd>
<dt><a href="#estadoAfinacion">estadoAfinacion(afinacion)</a> ⇒ <code>string</code></dt>
<dd><p>Clasifica a un camión según lo cerca que esté de su afinación.</p>
</dd>
<dt><a href="#lecturasSospechosas">lecturasSospechosas(registros)</a> ⇒ <code>Array</code></dt>
<dd><p>Detecta una lectura de odómetro que se salga del orden esperado.</p>
<p>El odómetro solo puede subir, así que una lectura menor que la anterior es un
error de captura. Pasa: en los datos reales hay un registro con 149 946 entre
lecturas de 1,5 millones — un dígito perdido al teclear. Por eso el backend
tiene la operación <code>correct_odometer</code>.</p>
<p>Los registros vienen del más reciente al más antiguo.</p>
</dd>
<dt><a href="#normalizarLista">normalizarLista(filas, esquema)</a> ⇒ <code>Object</code></dt>
<dd><p>Valida una lista con el esquema dado, descartando lo que no cumple.</p>
</dd>
<dt><a href="#obtenerPermisosUsuario">obtenerPermisosUsuario(parametros)</a> ⇒ <code>Promise.&lt;object&gt;</code></dt>
<dd><p>Trae todos los permisos de un usuario, separados por plataforma.</p>
</dd>
<dt><a href="#cambiarPermisoUsuario">cambiarPermisoUsuario(parametros)</a> ⇒ <code>Promise.&lt;object&gt;</code></dt>
<dd><p>Concede o quita un permiso a un usuario.</p>
</dd>
<dt><a href="#usePermisosUsuario">usePermisosUsuario(userId)</a> ⇒ <code>object</code></dt>
<dd><p>Permisos de un usuario. No consulta hasta tener un usuario.</p>
</dd>
<dt><a href="#useCambiarPermisoUsuario">useCambiarPermisoUsuario()</a> ⇒ <code>object</code></dt>
<dd><p>Cambia un permiso, con actualización optimista.</p>
<p>El interruptor se mueve de inmediato y se revierte si la API falla: son 55
permisos por usuario y esperar la respuesta en cada clic hacía la pantalla
lenta de usar. Al terminar se revalida contra el servidor.</p>
</dd>
<dt><a href="#obtenerUsuarios">obtenerUsuarios([opciones])</a> ⇒ <code>Promise.&lt;Array&gt;</code></dt>
<dd><p>Trae todos los usuarios del sistema, sin sus contraseñas.</p>
<p>El endpoint las devuelve en claro; el esquema no las incluye, así que no
llegan al estado de la aplicación. Ver <code>entities/user/model/usuario.js</code>.</p>
</dd>
<dt><a href="#crearUsuario">crearUsuario(datos)</a> ⇒ <code>Promise.&lt;object&gt;</code></dt>
<dd><p>Da de alta un usuario.</p>
</dd>
<dt><a href="#actualizarUsuario">actualizarUsuario(parametros)</a> ⇒ <code>Promise.&lt;object&gt;</code></dt>
<dd><p>Actualiza un usuario.</p>
<p><code>pass</code> solo viaja si trae algo: vacío significa &quot;no cambiar la contraseña&quot;, y
el backend no toca el campo si no lo recibe.</p>
</dd>
<dt><a href="#useUsuarios">useUsuarios()</a> ⇒ <code>object</code></dt>
<dd><p>Lista de usuarios, cacheada.</p>
</dd>
<dt><a href="#useCrearUsuario">useCrearUsuario()</a> ⇒ <code>object</code></dt>
<dd><p>Crea un usuario y refresca la lista.</p>
</dd>
<dt><a href="#useActualizarUsuario">useActualizarUsuario()</a> ⇒ <code>object</code></dt>
<dd><p>Actualiza un usuario y refresca la lista.</p>
</dd>
<dt><a href="#normalizarUsuarios">normalizarUsuarios(filas)</a> ⇒ <code>Object</code></dt>
<dd><p>Valida la lista de usuarios y les agrega su rol canónico.</p>
</dd>
<dt><a href="#validarFormularioUsuario">validarFormularioUsuario(formulario, [opciones])</a> ⇒ <code>Object</code></dt>
<dd><p>Valida el formulario de alta o edición de un usuario.</p>
<p><code>pass</code> es opcional al editar: vacío significa &quot;no cambiar la contraseña&quot;, y el
campo solo viaja si trae algo. Al <strong>crear</strong>, en cambio, es obligatorio.</p>
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
<dt><a href="#Autonomia">Autonomia</a> : <code>object</code></dt>
<dd><p>La autonomía de un camión, ya validada.</p>
</dd>
<dt><a href="#Requisito">Requisito</a> : <code>object</code></dt>
<dd><p>Un requisito documental ya validado.</p>
</dd>
<dt><a href="#Inspeccion">Inspeccion</a> : <code>object</code></dt>
<dd><p>Una inspección ya validada.</p>
</dd>
<dt><a href="#Articulo">Articulo</a> : <code>object</code></dt>
<dd><p>Un artículo de inventario ya validado.</p>
</dd>
<dt><a href="#Periodo">Periodo</a> : <code>object</code></dt>
<dd><p>Un periodo de nómina ya validado.</p>
</dd>
<dt><a href="#DetallePago">DetallePago</a> : <code>object</code></dt>
<dd><p>Un renglón del desglose por empleado.</p>
</dd>
<dt><a href="#Empleado">Empleado</a> : <code>object</code></dt>
<dd><p>Empleado de nómina ya normalizado y validado.</p>
</dd>
<dt><a href="#Reparacion">Reparacion</a> : <code>object</code></dt>
<dd><p>Una reparación en ruta ya validada.</p>
</dd>
<dt><a href="#ViajeSafety">ViajeSafety</a> : <code>object</code></dt>
<dd><p>Un viaje con su estado de documentación.</p>
</dd>
<dt><a href="#Orden">Orden</a> : <code>object</code></dt>
<dd><p>Una orden de servicio ya validada.</p>
</dd>
<dt><a href="#Afinacion">Afinacion</a> : <code>object</code></dt>
<dd><p>El estado de afinación de un camión, ya validado.</p>
</dd>
<dt><a href="#Usuario">Usuario</a> : <code>object</code></dt>
<dd><p>Usuario ya validado y normalizado.</p>
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
<a name="REGION"></a>

## REGION : <code>enum</code>
Regiones a las que pertenece un requisito documental.

**Kind**: global enum  
**Read only**: true  
<a name="TIPO_REQUISITO"></a>

## TIPO\_REQUISITO : <code>enum</code>
Cómo se captura un requisito: subiendo un archivo o escribiendo un valor.

**Kind**: global enum  
**Read only**: true  
<a name="ESTADO_DOCUMENTO"></a>

## ESTADO\_DOCUMENTO : <code>enum</code>
Estado de un documento respecto a su vencimiento.

**Kind**: global enum  
**Read only**: true  
<a name="ESTADO_COBRO"></a>

## ESTADO\_COBRO : <code>enum</code>
Estados de cobro de un viaje, en el orden del ciclo.

Los valores son los que guarda la base. `null` significa lo mismo que 0: hay
9 viajes reales sin estado y son pendientes de cobrar, no un caso aparte.

**Kind**: global enum  
**Read only**: true  
<a name="ETIQUETA_COBRO"></a>

## ETIQUETA\_COBRO : <code>enum</code>
Cómo se muestra cada estado de cobro.

Sale de `constants/finances.js`, que ya lo tenía. Se mantiene el mismo texto y
el mismo color para no cambiar lo que la gente ya reconoce.

**Kind**: global enum  
**Read only**: true  
<a name="ESTADO_PAGO_CONDUCTOR"></a>

## ESTADO\_PAGO\_CONDUCTOR : <code>enum</code>
Estados del pago a un conductor.

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
<a name="GRAFICAS"></a>

## GRAFICAS : <code>enum</code>
Las gráficas del tablero, con el `op` que las alimenta.

Todas salen de `charts.php` cambiando solo el `op`, así que en vez de seis
funciones idénticas hay una tabla de datos. Agregar una gráfica es agregar una
línea aquí, no otra copia del mismo `fetch`.

Las claves de cada respuesta están verificadas contra la API real el
2026-08-31, no supuestas.

**Kind**: global enum  
**Read only**: true  
<a name="DOCUMENTOS_REQUERIDOS"></a>

## DOCUMENTOS\_REQUERIDOS : <code>enum</code>
Los tres documentos que un viaje debe tener al cerrarse.

El orden es el de las columnas en pantalla.

**Kind**: global enum  
**Read only**: true  
<a name="NOMBRE_DOCUMENTO"></a>

## NOMBRE\_DOCUMENTO : <code>enum</code>
Cómo se llama cada documento en pantalla.

**Kind**: global enum  
**Read only**: true  
<a name="ESTATUS_ORDEN"></a>

## ESTATUS\_ORDEN : <code>enum</code>
Estados por los que pasa una orden de servicio y cada uno de sus servicios.

Verificado contra la API el 2026-09-01: son los tres únicos valores que
aparecen, tanto en órdenes como en servicios.

**Kind**: global enum  
**Read only**: true  
<a name="ESTADO_AFINACION"></a>

## ESTADO\_AFINACION : <code>enum</code>
Estado de un camión respecto a su próxima afinación.

**Kind**: global enum  
**Read only**: true  
<a name="PLATAFORMA"></a>

## PLATAFORMA : <code>enum</code>
Plataformas para las que se conceden permisos.

La app móvil consume los mismos endpoints y tiene su propio juego de permisos,
por eso cada `feature` viaja con su plataforma.

**Kind**: global enum  
**Read only**: true  
<a name="TIPO_USUARIO_API"></a>

## TIPO\_USUARIO\_API : <code>enum</code>
Valores de `type` que la API acepta al crear o editar un usuario.

Son los que existen hoy en `Users_credentials`, no los del catálogo canónico:
el backend guarda este campo tal cual, así que mandarle un valor normalizado
lo cambiaría en la base. La normalización es **de lectura**, para decidir en el
frontend; lo que viaja al servidor es el valor crudo.

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
<a name="idPhp"></a>

## idPhp ⇒ <code>object</code>
Un identificador: siempre cadena, aunque PHP lo mande como número.

**Kind**: global constant  
**Returns**: <code>object</code> - El esquema de zod.  
<a name="numeroPhp"></a>

## numeroPhp ⇒ <code>object</code>
Un número que puede llegar como cadena. MySQL devuelve los `DECIMAL` así.

**Kind**: global constant  
**Returns**: <code>object</code> - El esquema de zod.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [porOmision] | <code>number</code> | <code>0</code> | Valor si el campo falta o no es numérico. |

<a name="booleanoPhp"></a>

## booleanoPhp ⇒ <code>object</code>
Un booleano que llega como `"1"` o `"0"`.

**Kind**: global constant  
**Returns**: <code>object</code> - El esquema de zod.  
<a name="nullable"></a>

## nullable ⇒ <code>object</code>
Un campo que puede venir nulo, **conservando el nulo**.

`z.coerce.number()` convierte `null` en `0` y `z.coerce.string()` en la cadena
`"null"`; ambas cosas cambian el significado del dato. Un `tipo_cambio` de 0 no
es "orden en pesos", y un `driver_id` de `"null"` acaba viajando así al backend.
Por eso el nullable va **antes** que la coacción en la unión.

**Kind**: global constant  
**Returns**: <code>object</code> - El esquema de zod, que devuelve `null` si no hay valor.  

| Param | Type | Description |
| --- | --- | --- |
| esquema | <code>object</code> | El esquema a aplicar cuando sí hay valor. |

<a name="fechaDia"></a>

## fechaDia ⇒ <code>object</code>
Una fecha de la que solo interesa el día.

La API devuelve `"2026-08-31 00:00:00"` y las pantallas solo muestran la fecha.
Recortarla aquí evita el `fecha.split(' ')[0]` repartido por el JSX, que
revienta cuando la fecha viene nula.

**Kind**: global constant  
**Returns**: <code>object</code> - El esquema de zod.  
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

<a name="LLAVE_AUTONOMIA"></a>

## LLAVE\_AUTONOMIA : <code>Array.&lt;string&gt;</code>
Llave de caché de la autonomía de la flota.

**Kind**: global constant  
<a name="esquemaRegistroAutonomia"></a>

## esquemaRegistroAutonomia
Un registro de rendimiento: cuánto recorrió el camión con cuántos galones.

**Kind**: global constant  
<a name="esquemaAutonomia"></a>

## esquemaAutonomia
La autonomía de un camión, con sus registros de rendimiento anidados.

**Kind**: global constant  
<a name="ultimoRegistro"></a>

## ultimoRegistro ⇒ <code>object</code> \| <code>null</code>
El registro más reciente de un camión.

Los registros vienen ordenados del más reciente al más antiguo.

**Kind**: global constant  
**Returns**: <code>object</code> \| <code>null</code> - El último registro, o `null` si no hay ninguno.  

| Param | Type | Description |
| --- | --- | --- |
| autonomia | [<code>Autonomia</code>](#Autonomia) | El camión a evaluar. |

<a name="LLAVE_DOCUMENTOS"></a>

## LLAVE\_DOCUMENTOS : <code>Array.&lt;string&gt;</code>
Llave de caché de los documentos corporativos.

**Kind**: global constant  
<a name="useGuardarDocumento"></a>

## useGuardarDocumento ⇒ <code>object</code>
Guarda el valor de un requisito y refresca el panel.

**Kind**: global constant  
**Returns**: <code>object</code> - El resultado de `useMutation`.  
<a name="useCrearRequisito"></a>

## useCrearRequisito ⇒ <code>object</code>
Crea un requisito y refresca el panel.

**Kind**: global constant  
**Returns**: <code>object</code> - El resultado de `useMutation`.  
<a name="useEliminarRequisito"></a>

## useEliminarRequisito ⇒ <code>object</code>
Retira un requisito y refresca el panel.

**Kind**: global constant  
**Returns**: <code>object</code> - El resultado de `useMutation`.  
<a name="DIAS_POR_VENCER"></a>

## DIAS\_POR\_VENCER : <code>number</code>
Días de antelación con los que un vencimiento se considera próximo.

**Kind**: global constant  
<a name="esquemaRequisito"></a>

## esquemaRequisito
Un requisito documental: qué documento hace falta y cómo se captura.

**Kind**: global constant  
<a name="esquemaValor"></a>

## esquemaValor
El valor capturado de un requisito.

Los tres campos son opcionales: un requisito de texto no trae `url_pdf`, y uno
sin vencimiento no trae fecha.

**Kind**: global constant  
<a name="LLAVE_FINANZAS"></a>

## LLAVE\_FINANZAS : <code>Array.&lt;string&gt;</code>
Llave de caché de los viajes vistos desde finanzas.

**Kind**: global constant  
<a name="LLAVE_PAGOS"></a>

## LLAVE\_PAGOS : <code>Array.&lt;string&gt;</code>
Llave de caché de los pagos a conductores.

**Kind**: global constant  
<a name="LLAVE_TARIFAS"></a>

## LLAVE\_TARIFAS : <code>Array.&lt;string&gt;</code>
Llave de caché de las tarifas por milla.

**Kind**: global constant  
<a name="METODOS_PAGO"></a>

## METODOS\_PAGO : <code>Array.&lt;string&gt;</code>
Formas de pago que acepta una etapa de viaje.

**Kind**: global constant  
<a name="esquemaEtapa"></a>

## esquemaEtapa
Una etapa de viaje con su cobro.

**Kind**: global constant  
<a name="esquemaViajeFinanzas"></a>

## esquemaViajeFinanzas
Un viaje visto desde finanzas: lo que se cobra y lo que ya se pagó.

**Kind**: global constant  
<a name="esquemaPagoConductor"></a>

## esquemaPagoConductor
El pago pendiente a un conductor por un viaje.

**Kind**: global constant  
<a name="esquemaTarifaConductor"></a>

## esquemaTarifaConductor
La tarifa por milla de un conductor.

**Kind**: global constant  
<a name="normalizarEstadoCobro"></a>

## normalizarEstadoCobro ⇒ <code>number</code>
Normaliza un estado de cobro, tratando el nulo como pendiente.

**Kind**: global constant  
**Returns**: <code>number</code> - Un valor de `ESTADO_COBRO`.  

| Param | Type | Description |
| --- | --- | --- |
| estado | <code>\*</code> | El valor crudo de `status_trip`. |

<a name="etiquetaCobro"></a>

## etiquetaCobro ⇒ <code>Object</code>
Cómo mostrar el estado de cobro de un viaje.

**Kind**: global constant  
**Returns**: <code>Object</code> - Texto y color.  

| Param | Type | Description |
| --- | --- | --- |
| viaje | <code>object</code> | El viaje a evaluar. |

<a name="estaPagado"></a>

## estaPagado ⇒ <code>boolean</code>
Indica si un viaje ya está cobrado por completo.

**Kind**: global constant  
**Returns**: <code>boolean</code> - `true` si está pagado.  

| Param | Type | Description |
| --- | --- | --- |
| viaje | <code>object</code> | El viaje a evaluar. |

<a name="saldoPendiente"></a>

## saldoPendiente ⇒ <code>number</code>
Lo que falta por cobrar de un viaje.

**Kind**: global constant  
**Returns**: <code>number</code> - La diferencia; 0 si ya se cobró de más o completo.  

| Param | Type | Description |
| --- | --- | --- |
| viaje | <code>object</code> | El viaje a evaluar. |

<a name="estaAutorizado"></a>

## estaAutorizado ⇒ <code>boolean</code>
Indica si el pago a un conductor está autorizado pero sin pagar.

**Kind**: global constant  
**Returns**: <code>boolean</code> - `true` si está autorizado.  

| Param | Type | Description |
| --- | --- | --- |
| pago | <code>object</code> | El pago a evaluar. |

<a name="estaPagadoConductor"></a>

## estaPagadoConductor ⇒ <code>boolean</code>
Indica si al conductor ya se le pagó.

**Kind**: global constant  
**Returns**: <code>boolean</code> - `true` si está pagado.  

| Param | Type | Description |
| --- | --- | --- |
| pago | <code>object</code> | El pago a evaluar. |

<a name="LLAVE_PERIODOS_IFTA"></a>

## LLAVE\_PERIODOS\_IFTA : <code>Array.&lt;string&gt;</code>
Llave de caché de los periodos IFTA.

**Kind**: global constant  
<a name="llaveTotalesIfta"></a>

## llaveTotalesIfta ⇒ <code>Array</code>
Llave de caché de los totales por estado.

Los filtros entran en la llave para que cada combinación tenga su propio
resultado en vez de pisar el anterior.

**Kind**: global constant  
**Returns**: <code>Array</code> - La llave para `useQuery`.  

| Param | Type | Description |
| --- | --- | --- |
| [filtros] | <code>object</code> | Estado y rango de fechas. |

<a name="esquemaPeriodoIfta"></a>

## esquemaPeriodoIfta
Millas recorridas y galones cargados en un estado, dentro de un periodo.

`periodo` viene vacío en la respuesta real: el corte se decide con `trip_year`
y los filtros de fecha, no con ese campo.

**Kind**: global constant  
<a name="esquemaTotalEstado"></a>

## esquemaTotalEstado
Millas totales por estado, con cuántos viajes las produjeron.

**Kind**: global constant  
<a name="LLAVE_INSPECCIONES"></a>

## LLAVE\_INSPECCIONES : <code>Array.&lt;string&gt;</code>
Llave de caché de las inspecciones.

**Kind**: global constant  
<a name="esquemaReporte"></a>

## esquemaReporte
Un reporte dentro de una inspección: cada violación levantada.

**Kind**: global constant  
<a name="esquemaInspeccion"></a>

## esquemaInspeccion
Una inspección operativa hecha a un camión en ruta.

Las multas se separan en dos: lo que paga IMA y lo que paga el conductor. El
`total` lo calcula el backend sumando ambas.

**Kind**: global constant  
<a name="sinMulta"></a>

## sinMulta ⇒ <code>boolean</code>
Indica si una inspección salió sin multa.

Es lo normal: al 2026-09-01 las tres inspecciones registradas están en 0. Una
inspección limpia no es un dato faltante.

**Kind**: global constant  
**Returns**: <code>boolean</code> - `true` si no hay multa para nadie.  

| Param | Type | Description |
| --- | --- | --- |
| inspeccion | [<code>Inspeccion</code>](#Inspeccion) | La inspección a evaluar. |

<a name="cuentaViolaciones"></a>

## cuentaViolaciones ⇒ <code>number</code>
Cuenta las violaciones de una inspección.

**Kind**: global constant  
**Returns**: <code>number</code> - Cuántos reportes tiene.  

| Param | Type | Description |
| --- | --- | --- |
| inspeccion | [<code>Inspeccion</code>](#Inspeccion) | La inspección a evaluar. |

<a name="LLAVE_INVENTARIO"></a>

## LLAVE\_INVENTARIO : <code>Array.&lt;string&gt;</code>
Llave de caché del inventario.

**Kind**: global constant  
<a name="esquemaArticulo"></a>

## esquemaArticulo
Un artículo del inventario con su categoría y subcategoría.

La API los devuelve ya cruzados con los catálogos, así que no hay que unir
nada del lado del cliente.

**Kind**: global constant  
<a name="sinNombre"></a>

## sinNombre ⇒ <code>boolean</code>
Indica si a un artículo le falta el nombre.

Existen en la base y la pantalla los muestra como "Sin nombre". Marcarlos
permite filtrarlos para limpiarlos, sin esconder sus existencias.

**Kind**: global constant  
**Returns**: <code>boolean</code> - `true` si no tiene nombre.  

| Param | Type | Description |
| --- | --- | --- |
| articulo | [<code>Articulo</code>](#Articulo) | El artículo a evaluar. |

<a name="estaAgotado"></a>

## estaAgotado ⇒ <code>boolean</code>
Indica si un artículo está agotado.

**Kind**: global constant  
**Returns**: <code>boolean</code> - `true` si no quedan existencias.  

| Param | Type | Description |
| --- | --- | --- |
| articulo | [<code>Articulo</code>](#Articulo) | El artículo a evaluar. |

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
<a name="llaveGrafica"></a>

## llaveGrafica ⇒ <code>Array</code>
Llave de caché de una gráfica.

Los parámetros entran en la llave para que cambiar el periodo traiga su propio
resultado en vez de pisar el anterior.

**Kind**: global constant  
**Returns**: <code>Array</code> - La llave para `useQuery`.  

| Param | Type | Description |
| --- | --- | --- |
| op | <code>string</code> | Operación de la gráfica. |
| [parametros] | <code>object</code> | Parámetros que modifican el resultado. |

<a name="aDia"></a>

## aDia ⇒ <code>string</code>
Recorta una fecha ISO al día.

**Kind**: global constant  
**Returns**: <code>string</code> - `YYYY-MM-DD`, o cadena vacía si no vino.  

| Param | Type | Description |
| --- | --- | --- |
| iso | <code>string</code> | Fecha como la devuelve la API. |

<a name="aMes"></a>

## aMes ⇒ <code>string</code>
Recorta una fecha ISO al mes, que es como se agrupan las gráficas.

**Kind**: global constant  
**Returns**: <code>string</code> - `YYYY-MM`, o cadena vacía si no vino.  

| Param | Type | Description |
| --- | --- | --- |
| iso | <code>string</code> | Fecha como la devuelve la API. |

<a name="etiquetaMes"></a>

## etiquetaMes ⇒ <code>string</code>
Convierte `2026-08` en `ago 2026`, para los ejes.

**Kind**: global constant  
**Returns**: <code>string</code> - El mes legible, o un guion si la clave no sirve.  

| Param | Type | Description |
| --- | --- | --- |
| clave | <code>string</code> | Mes en formato `YYYY-MM`. |

<a name="normalizarFinanzas"></a>

## normalizarFinanzas ⇒ <code>Array</code>
Normaliza las series de rate contra pagado, que comparten forma.

La usan `chart_finances` y `chart_finances_rts`: mismas claves, distinto origen.

**Kind**: global constant  
**Returns**: <code>Array</code> - Filas con `periodo`, `label`, `rate` y `paid`.  

| Param | Type | Description |
| --- | --- | --- |
| filas | <code>Array</code> | Filas con `periodo`, `total_rate` y `total_paid`. |

<a name="normalizarMantenimiento"></a>

## normalizarMantenimiento ⇒ <code>Array</code>
Normaliza el costo de mantenimiento por mes.

**Kind**: global constant  
**Returns**: <code>Array</code> - Filas con `periodo`, `label` y `total`.  

| Param | Type | Description |
| --- | --- | --- |
| filas | <code>Array</code> | Filas con `periodo` y `total`. |

<a name="agruparDieselPorMes"></a>

## agruparDieselPorMes ⇒ <code>Array</code>
Agrupa las cargas de diesel por mes, sumando monto y fleetone.

La API devuelve una fila por carga; la gráfica es mensual, así que la suma
ocurre aquí y no en el JSX. Es lógica de negocio, no de presentación.

**Kind**: global constant  
**Returns**: <code>Array</code> - Una fila por mes, ordenada cronológicamente.  

| Param | Type | Description |
| --- | --- | --- |
| filas | <code>Array</code> | Cargas con `fecha`, `monto`, `galones` y `fleetone`. |

<a name="ultimosMeses"></a>

## ultimosMeses ⇒ <code>Array</code>
Se queda con los últimos N meses de una serie ya ordenada.

**Kind**: global constant  
**Returns**: <code>Array</code> - Los últimos `meses` elementos.  

| Param | Type | Description |
| --- | --- | --- |
| serie | <code>Array</code> | Filas ordenadas cronológicamente. |
| meses | <code>number</code> | Cuántos meses conservar. |

<a name="LLAVE_REPARACIONES"></a>

## LLAVE\_REPARACIONES : <code>Array.&lt;string&gt;</code>
Llave de caché de las reparaciones en ruta.

**Kind**: global constant  
<a name="esquemaDocumento"></a>

## esquemaDocumento
Un documento adjunto a una reparación.

**Kind**: global constant  
<a name="esquemaReparacion"></a>

## esquemaReparacion
Una reparación en ruta: lo que le pasó a un camión durante un viaje.

Ojo con las dos fechas, que no son lo mismo:
- `fecha_suceso` es **cuándo ocurrió** la avería.
- `fecha_registro` es **cuándo se capturó** en el sistema.

`fecha_suceso` se agregó después y admite nulos a propósito: la app móvil
también da de alta reparaciones, y el UPDATE del backend solo toca la columna
si el campo llegó en el POST, para que un cliente que no la mande no borre la
fecha existente. Al 2026-09-01 está nula en todos los registros.

**Kind**: global constant  
<a name="fechaRelevante"></a>

## fechaRelevante ⇒ <code>string</code>
La fecha con la que conviene mostrar una reparación.

Prefiere cuándo ocurrió; si no se capturó, cae a cuándo se registró. Así la
lista siempre tiene una fecha que enseñar aunque falte la del suceso.

**Kind**: global constant  
**Returns**: <code>string</code> - La fecha, o cadena vacía si no hay ninguna.  

| Param | Type | Description |
| --- | --- | --- |
| reparacion | [<code>Reparacion</code>](#Reparacion) | La reparación a evaluar. |

<a name="tieneDocumentos"></a>

## tieneDocumentos ⇒ <code>boolean</code>
Indica si una reparación tiene comprobantes adjuntos.

**Kind**: global constant  
**Returns**: <code>boolean</code> - `true` si tiene al menos un documento.  

| Param | Type | Description |
| --- | --- | --- |
| reparacion | [<code>Reparacion</code>](#Reparacion) | La reparación a evaluar. |

<a name="LLAVE_SAFETY"></a>

## LLAVE\_SAFETY : <code>Array.&lt;string&gt;</code>
Llave de caché de los viajes de cumplimiento.

**Kind**: global constant  
<a name="esquemaViajeSafety"></a>

## esquemaViajeSafety
Un viaje visto desde cumplimiento: qué documentos tiene y cuáles le faltan.

Los tres documentos llegan como una URL o como `null`. Un `null` significa que
falta, no que haya un error.

**Kind**: global constant  
<a name="tieneDocumento"></a>

## tieneDocumento ⇒ <code>boolean</code>
Indica si un viaje tiene subido un documento concreto.

**Kind**: global constant  
**Returns**: <code>boolean</code> - `true` si el documento está.  

| Param | Type | Description |
| --- | --- | --- |
| viaje | [<code>ViajeSafety</code>](#ViajeSafety) | El viaje a evaluar. |
| documento | <code>string</code> | Una clave de `DOCUMENTOS_REQUERIDOS`. |

<a name="documentosFaltantes"></a>

## documentosFaltantes ⇒ <code>Array.&lt;string&gt;</code>
Los documentos que le faltan a un viaje.

**Kind**: global constant  
**Returns**: <code>Array.&lt;string&gt;</code> - Las claves de los documentos faltantes.  

| Param | Type | Description |
| --- | --- | --- |
| viaje | [<code>ViajeSafety</code>](#ViajeSafety) | El viaje a evaluar. |

<a name="cumplimientoCompleto"></a>

## cumplimientoCompleto ⇒ <code>boolean</code>
Indica si un viaje tiene toda su documentación.

**Kind**: global constant  
**Returns**: <code>boolean</code> - `true` si no le falta ninguno.  

| Param | Type | Description |
| --- | --- | --- |
| viaje | [<code>ViajeSafety</code>](#ViajeSafety) | El viaje a evaluar. |

<a name="LLAVE_ORDENES"></a>

## LLAVE\_ORDENES : <code>Array.&lt;string&gt;</code>
Llave de caché de las órdenes de servicio.

**Kind**: global constant  
<a name="esquemaServicio"></a>

## esquemaServicio
Un servicio dentro de una orden: qué se le hizo al camión.

`detalles` son las refacciones y la mano de obra; puede venir vacío.

**Kind**: global constant  
<a name="esquemaOrden"></a>

## esquemaOrden
Una orden de servicio con sus servicios anidados.

La API los devuelve así, en una sola llamada: no hay que pedir el detalle
aparte. `tipo_cambio` viene nulo cuando la orden es en pesos.

**Kind**: global constant  
<a name="estaAbierta"></a>

## estaAbierta ⇒ <code>boolean</code>
Indica si una orden sigue abierta al trabajo.

**Kind**: global constant  
**Returns**: <code>boolean</code> - `true` si no está completada.  

| Param | Type | Description |
| --- | --- | --- |
| orden | [<code>Orden</code>](#Orden) | La orden a evaluar. |

<a name="LLAVE_EQUIPOS"></a>

## LLAVE\_EQUIPOS : <code>Array.&lt;string&gt;</code>
Llave de caché de la lista de equipos.

**Kind**: global constant  
<a name="llaveMiembros"></a>

## llaveMiembros ⇒ <code>Array.&lt;string&gt;</code>
Llave de caché de los miembros de un equipo.

**Kind**: global constant  
**Returns**: <code>Array.&lt;string&gt;</code> - La llave para `useQuery`.  

| Param | Type | Description |
| --- | --- | --- |
| teamId | <code>string</code> | Identificador del equipo. |

<a name="LLAVE_AFINACIONES"></a>

## LLAVE\_AFINACIONES : <code>Array.&lt;string&gt;</code>
Llave de caché del estado de afinaciones.

**Kind**: global constant  
<a name="LLAVE_HISTORIAL"></a>

## LLAVE\_HISTORIAL : <code>Array.&lt;string&gt;</code>
Llave de caché del historial de afinaciones.

**Kind**: global constant  
<a name="useRegistrarAfinacion"></a>

## useRegistrarAfinacion ⇒ <code>object</code>
Registra una afinación y refresca la flota.

**Kind**: global constant  
**Returns**: <code>object</code> - El resultado de `useMutation`.  
<a name="useActualizarLimite"></a>

## useActualizarLimite ⇒ <code>object</code>
Cambia el límite de un camión y refresca la flota.

**Kind**: global constant  
**Returns**: <code>object</code> - El resultado de `useMutation`.  
<a name="useCorregirOdometro"></a>

## useCorregirOdometro ⇒ <code>object</code>
Corrige un odómetro y refresca la flota.

**Kind**: global constant  
**Returns**: <code>object</code> - El resultado de `useMutation`.  
<a name="UMBRAL_PROXIMA"></a>

## UMBRAL\_PROXIMA : <code>number</code>
Proporción del límite a partir de la cual una afinación se considera próxima.

**Kind**: global constant  
<a name="esquemaRegistroDiesel"></a>

## esquemaRegistroDiesel
Una carga de diesel, que es de donde sale la lectura del odómetro.

**Kind**: global constant  
<a name="esquemaAfinacion"></a>

## esquemaAfinacion
El estado de afinación de un camión.

`millas_acumuladas` las calcula el backend restando el odómetro base al último
registrado, así que aquí se toma tal cual y no se recalcula: hacerlo daría dos
verdades que pueden discrepar.

**Kind**: global constant  
<a name="esquemaHistorial"></a>

## esquemaHistorial
Un registro histórico de afinación.

**Kind**: global constant  
<a name="millasRestantes"></a>

## millasRestantes ⇒ <code>number</code>
Millas que faltan para la próxima afinación.

**Kind**: global constant  
**Returns**: <code>number</code> - Las millas restantes; 0 si ya se pasó.  

| Param | Type | Description |
| --- | --- | --- |
| afinacion | [<code>Afinacion</code>](#Afinacion) | El camión a evaluar. |

<a name="llavePermisosUsuario"></a>

## llavePermisosUsuario ⇒ <code>Array.&lt;string&gt;</code>
Llave de caché de los permisos de un usuario.

**Kind**: global constant  
**Returns**: <code>Array.&lt;string&gt;</code> - La llave para `useQuery`.  

| Param | Type | Description |
| --- | --- | --- |
| userId | <code>string</code> | Identificador del usuario. |

<a name="LLAVE_USUARIOS"></a>

## LLAVE\_USUARIOS : <code>Array.&lt;string&gt;</code>
Llave de caché de la lista de usuarios.

**Kind**: global constant  
<a name="esquemaUsuario"></a>

## esquemaUsuario
Usuario del sistema, tal como lo devuelve `features.php` · `get_users`.

**No incluye `pass` a propósito.** El endpoint devuelve la contraseña en claro
de cada usuario; dejarla fuera del esquema evita que llegue al estado de la
aplicación, se pinte por accidente o acabe en un log. No arregla el endpoint
—eso es de backend— pero corta la propagación en el frontend.

**Kind**: global constant  
<a name="estaActivo"></a>

## estaActivo ⇒ <code>boolean</code>
Indica si un usuario está activo.

**Kind**: global constant  
**Returns**: <code>boolean</code> - `true` si la cuenta está habilitada.  

| Param | Type | Description |
| --- | --- | --- |
| usuario | [<code>Usuario</code>](#Usuario) | El usuario a evaluar. |

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

<a name="obtenerAutonomia"></a>

## obtenerAutonomia([opciones]) ⇒ <code>Promise.&lt;Array&gt;</code>
Trae el rendimiento de cada camión con sus registros anidados.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array&gt;</code> - Las autonomías normalizadas.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API falla.

**Endpoint**: POST autonomia.php · op=get_truck_autonomy  

| Param | Type | Description |
| --- | --- | --- |
| [opciones] | <code>object</code> | Ajustes de la petición. |
| [opciones.signal] | <code>AbortSignal</code> | Señal de cancelación. |

<a name="useAutonomia"></a>

## useAutonomia() ⇒ <code>object</code>
Autonomía de la flota, cacheada.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useQuery`.  
<a name="promedioMpg"></a>

## promedioMpg(autonomia) ⇒ <code>number</code>
Promedio de millas por galón de un camión.

Ignora los registros con rendimiento 0 o negativo: son cargas sin recorrido
asociado, y meterlas en el promedio lo hunde sin que nada haya pasado.

**Kind**: global function  
**Returns**: <code>number</code> - El promedio, o 0 si no hay registros útiles.  

| Param | Type | Description |
| --- | --- | --- |
| autonomia | [<code>Autonomia</code>](#Autonomia) | El camión a evaluar. |

<a name="totales"></a>

## totales(autonomia) ⇒ <code>Object</code>
Totales de distancia y galones de un camión.

**Kind**: global function  
**Returns**: <code>Object</code> - Los totales.  

| Param | Type | Description |
| --- | --- | --- |
| autonomia | [<code>Autonomia</code>](#Autonomia) | El camión a evaluar. |

<a name="normalizarAutonomias"></a>

## normalizarAutonomias(filas) ⇒ <code>Object</code>
Valida la lista de autonomías descartando lo que no cumple.

**Kind**: global function  
**Returns**: <code>Object</code> - Las válidas y cuántas se cayeron.  

| Param | Type | Description |
| --- | --- | --- |
| filas | <code>Array</code> | Lo que vino en la respuesta. |

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
<a name="obtenerDocumentos"></a>

## obtenerDocumentos([opciones]) ⇒ <code>Promise.&lt;object&gt;</code>
Trae los requisitos documentales y lo capturado para cada uno.

La respuesta trae dos cosas distintas: `requisitos` es una lista y `valores` un
**objeto indexado por `key_name`**. Por eso usa `post` y no `postLista`.

**Kind**: global function  
**Returns**: <code>Promise.&lt;object&gt;</code> - `{requisitos, valores}` ya validados.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API falla.

**Endpoint**: POST IMA_Docsv2.php · op=getAll  

| Param | Type | Description |
| --- | --- | --- |
| [opciones] | <code>object</code> | Ajustes de la petición. |
| [opciones.signal] | <code>AbortSignal</code> | Señal de cancelación. |

<a name="guardarDocumento"></a>

## guardarDocumento(datos) ⇒ <code>Promise.&lt;object&gt;</code>
Guarda el valor de un requisito: sube el archivo, el texto y la vigencia.

**Kind**: global function  
**Returns**: <code>Promise.&lt;object&gt;</code> - La respuesta de la API.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API rechaza la operación.

**Endpoint**: POST IMA_Docsv2.php · op=Alta  

| Param | Type | Description |
| --- | --- | --- |
| datos | <code>object</code> | Lo capturado. |
| datos.keyName | <code>string</code> | Clave del requisito. |
| [datos.valorTexto] | <code>string</code> | Valor, si el requisito es de tipo texto. |
| [datos.fechaVencimiento] | <code>string</code> | Vigencia en formato `YYYY-MM-DD`. |
| [datos.archivo] | <code>File</code> | Documento a subir. |

<a name="crearRequisito"></a>

## crearRequisito(datos) ⇒ <code>Promise.&lt;object&gt;</code>
Crea un requisito documental nuevo.

**Kind**: global function  
**Returns**: <code>Promise.&lt;object&gt;</code> - La respuesta de la API.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API rechaza la operación.

**Endpoint**: POST IMA_Docsv2.php · op=addConfig  

| Param | Type | Description |
| --- | --- | --- |
| datos | <code>object</code> | Definición del requisito. |
| datos.label | <code>string</code> | Nombre visible. |
| datos.region | <code>string</code> | `MEX` o `USA`. |
| datos.tipo | <code>string</code> | `file` o `text`. |
| datos.tieneVencimiento | <code>boolean</code> | Si se le controla vigencia. |

<a name="eliminarRequisito"></a>

## eliminarRequisito(keyName) ⇒ <code>Promise.&lt;object&gt;</code>
Retira un requisito del panel.

No borra lo capturado: el documento se conserva y solo deja de pedirse.

**Kind**: global function  
**Returns**: <code>Promise.&lt;object&gt;</code> - La respuesta de la API.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API rechaza la operación.

**Endpoint**: POST IMA_Docsv2.php · op=deleteConfig  

| Param | Type | Description |
| --- | --- | --- |
| keyName | <code>string</code> | Clave del requisito. |

<a name="useDocumentos"></a>

## useDocumentos() ⇒ <code>object</code>
Requisitos y valores, cacheados.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useQuery`: `{data, isLoading, isError, error}`.  
<a name="crearMutacion"></a>

## crearMutacion(mutationFn) ⇒ <code>function</code>
Crea una mutación que refresca los documentos al terminar.

Las tres operaciones invalidan lo mismo, así que comparten fábrica en vez de
repetir el `onSuccess` tres veces.

**Kind**: global function  
**Returns**: <code>function</code> - Un hook de mutación listo para usar.  

| Param | Type | Description |
| --- | --- | --- |
| mutationFn | <code>function</code> | La operación a ejecutar. |

<a name="diasRestantes"></a>

## diasRestantes(fecha, [hoy]) ⇒ <code>number</code> \| <code>null</code>
Días que faltan para una fecha, contando desde hoy.

Compara a medianoche para que un documento que vence hoy dé 0 y no un número
negativo por unas horas.

**Kind**: global function  
**Returns**: <code>number</code> \| <code>null</code> - Los días restantes, o `null` si no hay fecha válida.  

| Param | Type | Description |
| --- | --- | --- |
| fecha | <code>string</code> \| <code>null</code> | Fecha en formato `YYYY-MM-DD`. |
| [hoy] | <code>Date</code> | Fecha de referencia; existe para poder probarlo. |

<a name="estadoDocumento"></a>

## estadoDocumento(requisito, [valor], [hoy]) ⇒ <code>string</code>
Clasifica un documento según su captura y su vencimiento.

Un requisito sin control de vencimiento nunca sale como vencido: solo importa
si está capturado o no.

**Kind**: global function  
**Returns**: <code>string</code> - Un valor de `ESTADO_DOCUMENTO`.  

| Param | Type | Description |
| --- | --- | --- |
| requisito | [<code>Requisito</code>](#Requisito) | El requisito a evaluar. |
| [valor] | <code>object</code> | Lo capturado para ese requisito. |
| [hoy] | <code>Date</code> | Fecha de referencia; existe para poder probarlo. |

<a name="normalizarDocumentos"></a>

## normalizarDocumentos(respuesta) ⇒ <code>Object</code>
Valida los requisitos y deja los valores listos para consultarlos por clave.

`valores` llega como **objeto indexado por `key_name`**, no como arreglo: es lo
que devuelve `IMA_Docsv2.php` y tratarlo como lista da siempre vacío.

**Kind**: global function  
**Returns**: <code>Object</code> - Lo normalizado.  

| Param | Type | Description |
| --- | --- | --- |
| respuesta | <code>object</code> | Lo que devolvió la API. |
| [respuesta.requisitos] | <code>Array</code> | Los requisitos. |
| [respuesta.valores] | <code>object</code> | Los valores, indexados por `key_name`. |

<a name="porRegion"></a>

## porRegion(requisitos) ⇒ <code>Object</code>
Separa los requisitos activos por región, que es como se pintan.

**Kind**: global function  
**Returns**: <code>Object</code> - Los activos de cada región.  

| Param | Type | Description |
| --- | --- | --- |
| requisitos | [<code>Array.&lt;Requisito&gt;</code>](#Requisito) | Los requisitos ya validados. |

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
<a name="obtenerViajesFinanzas"></a>

## obtenerViajesFinanzas([opciones]) ⇒ <code>Promise.&lt;Array&gt;</code>
Trae los viajes con su cobro y sus etapas anidadas.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array&gt;</code> - Los viajes normalizados.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API falla.

**Endpoint**: POST formularios.php · op=All_finanzas  

| Param | Type | Description |
| --- | --- | --- |
| [opciones] | <code>object</code> | Ajustes de la petición. |
| [opciones.signal] | <code>AbortSignal</code> | Señal de cancelación. |

<a name="obtenerPagosConductores"></a>

## obtenerPagosConductores([opciones]) ⇒ <code>Promise.&lt;Array&gt;</code>
Trae los pagos pendientes a conductores.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array&gt;</code> - Los pagos normalizados.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API falla.

**Endpoint**: POST formularios.php · op=All_paymentDrivers  

| Param | Type | Description |
| --- | --- | --- |
| [opciones] | <code>object</code> | Ajustes de la petición. |
| [opciones.signal] | <code>AbortSignal</code> | Señal de cancelación. |

<a name="obtenerTarifasConductor"></a>

## obtenerTarifasConductor([opciones]) ⇒ <code>Promise.&lt;Array&gt;</code>
Trae la tarifa por milla de cada conductor.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array&gt;</code> - Las tarifas normalizadas.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API falla.

**Endpoint**: POST formularios.php · op=get_millasDriver  

| Param | Type | Description |
| --- | --- | --- |
| [opciones] | <code>object</code> | Ajustes de la petición. |
| [opciones.signal] | <code>AbortSignal</code> | Señal de cancelación. |

<a name="guardarTarifasConductor"></a>

## guardarTarifasConductor(tarifas) ⇒ <code>Promise.&lt;object&gt;</code>
Guarda varias tarifas por milla de una vez.

**Kind**: global function  
**Returns**: <code>Promise.&lt;object&gt;</code> - La respuesta de la API.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API rechaza la operación.

**Endpoint**: POST formularios.php · op=I_update_millasDriverBulk  

| Param | Type | Description |
| --- | --- | --- |
| tarifas | <code>Array</code> | Las tarifas a guardar. |

<a name="registrarCobrosEtapas"></a>

## registrarCobrosEtapas(pagos) ⇒ <code>Promise.&lt;object&gt;</code>
Registra el cobro de varias etapas a la vez.

**Kind**: global function  
**Returns**: <code>Promise.&lt;object&gt;</code> - La respuesta de la API.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API rechaza la operación.

**Endpoint**: POST formularios.php · op=I_pago_stage_bulk  

| Param | Type | Description |
| --- | --- | --- |
| pagos | <code>Array</code> | Los cobros a registrar. |

<a name="useViajesFinanzas"></a>

## useViajesFinanzas() ⇒ <code>object</code>
Viajes de finanzas, cacheados.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useQuery`.  
<a name="usePagosConductores"></a>

## usePagosConductores() ⇒ <code>object</code>
Pagos a conductores, cacheados.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useQuery`.  
<a name="useTarifasConductor"></a>

## useTarifasConductor() ⇒ <code>object</code>
Tarifas por milla. Es un catálogo: se cachea más tiempo.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useQuery`.  
<a name="useGuardarTarifasConductor"></a>

## useGuardarTarifasConductor() ⇒ <code>object</code>
Guarda las tarifas y refresca su lista.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useMutation`.  
<a name="useRegistrarCobrosEtapas"></a>

## useRegistrarCobrosEtapas() ⇒ <code>object</code>
Registra cobros y refresca los viajes de finanzas.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useMutation`.  
<a name="totalesFinanzas"></a>

## totalesFinanzas(viajes) ⇒ <code>Object</code>
Suma tarifa y cobrado de una lista de viajes.

**Kind**: global function  
**Returns**: <code>Object</code> - Los totales.  

| Param | Type | Description |
| --- | --- | --- |
| viajes | <code>Array</code> | Los viajes a sumar. |

<a name="normalizarLista"></a>

## normalizarLista(filas, esquema) ⇒ <code>Object</code>
Valida una lista con el esquema dado, descartando lo que no cumple.

**Kind**: global function  
**Returns**: <code>Object</code> - Los que pasaron y cuántos no.  

| Param | Type | Description |
| --- | --- | --- |
| filas | <code>Array</code> | Lo que vino en la respuesta. |
| esquema | <code>object</code> | Esquema zod con el que validar cada fila. |

<a name="obtenerPeriodosIfta"></a>

## obtenerPeriodosIfta([opciones]) ⇒ <code>Promise.&lt;Array&gt;</code>
Trae millas y galones por estado y año fiscal.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array&gt;</code> - Los periodos normalizados.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API falla.

**Endpoint**: POST IFTA.php · op=periodos  

| Param | Type | Description |
| --- | --- | --- |
| [opciones] | <code>object</code> | Ajustes de la petición. |
| [opciones.signal] | <code>AbortSignal</code> | Señal de cancelación. |

<a name="obtenerTotalesPorEstado"></a>

## obtenerTotalesPorEstado([filtros]) ⇒ <code>Promise.&lt;Array&gt;</code>
Trae las millas totales por estado, con filtros opcionales.

Cada filtro solo viaja si trae valor: mandar un rango vacío cambiaría el
resultado en vez de dejarlo sin filtrar.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array&gt;</code> - Los totales por estado.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API falla.

**Endpoint**: POST IFTA.php · op=get_ifta_totals_by_state  

| Param | Type | Description |
| --- | --- | --- |
| [filtros] | <code>object</code> | Ajustes de la consulta. |
| [filtros.estado] | <code>string</code> | Código del estado, por ejemplo `TX`. |
| [filtros.desde] | <code>string</code> | Fecha inicial, `YYYY-MM-DD`. |
| [filtros.hasta] | <code>string</code> | Fecha final, `YYYY-MM-DD`. |
| [filtros.signal] | <code>AbortSignal</code> | Señal de cancelación. |

<a name="obtenerViajesIfta"></a>

## obtenerViajesIfta([filtros]) ⇒ <code>Promise.&lt;Array&gt;</code>
Trae los viajes que componen un total de IFTA.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array&gt;</code> - Los viajes.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API falla.

**Endpoint**: POST IFTA.php · op=get_ifta_trips  

| Param | Type | Description |
| --- | --- | --- |
| [filtros] | <code>object</code> | Ajustes de la consulta. |
| [filtros.estado] | <code>string</code> | Código del estado, por ejemplo `TX`. |
| [filtros.desde] | <code>string</code> | Fecha inicial, `YYYY-MM-DD`. |
| [filtros.hasta] | <code>string</code> | Fecha final, `YYYY-MM-DD`. |
| [filtros.signal] | <code>AbortSignal</code> | Señal de cancelación. |

<a name="usePeriodosIfta"></a>

## usePeriodosIfta() ⇒ <code>object</code>
Periodos IFTA, cacheados. Cambian poco: se cachean más tiempo.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useQuery`.  
<a name="useTotalesPorEstado"></a>

## useTotalesPorEstado([filtros]) ⇒ <code>object</code>
Totales por estado según los filtros activos.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useQuery`.  

| Param | Type | Description |
| --- | --- | --- |
| [filtros] | <code>object</code> | Estado y rango de fechas. |

<a name="rendimientoEstado"></a>

## rendimientoEstado(registro) ⇒ <code>number</code>
Rendimiento de un estado: millas recorridas por galón cargado.

Es el número que importa para IFTA, porque el impuesto se paga por la
diferencia entre dónde se recorrió y dónde se compró el combustible.

**Kind**: global function  
**Returns**: <code>number</code> - Millas por galón, o 0 si no se cargó combustible ahí.  

| Param | Type | Description |
| --- | --- | --- |
| registro | <code>object</code> | El registro del estado. |

<a name="totalesIfta"></a>

## totalesIfta(registros) ⇒ <code>Object</code>
Suma millas y galones de una lista de estados.

**Kind**: global function  
**Returns**: <code>Object</code> - Los totales.  

| Param | Type | Description |
| --- | --- | --- |
| registros | <code>Array</code> | Los registros a sumar. |

<a name="agruparPorAnio"></a>

## agruparPorAnio(registros) ⇒ <code>Array.&lt;{anio: string, registros: Array}&gt;</code>
Agrupa los registros por año fiscal, del más reciente al más antiguo.

**Kind**: global function  
**Returns**: <code>Array.&lt;{anio: string, registros: Array}&gt;</code> - Los grupos.  

| Param | Type | Description |
| --- | --- | --- |
| registros | <code>Array</code> | Los registros a agrupar. |

<a name="normalizarLista"></a>

## normalizarLista(filas, esquema) ⇒ <code>Object</code>
Valida una lista con el esquema dado, descartando lo que no cumple.

**Kind**: global function  
**Returns**: <code>Object</code> - Los que pasaron y cuántos no.  

| Param | Type | Description |
| --- | --- | --- |
| filas | <code>Array</code> | Lo que vino en la respuesta. |
| esquema | <code>object</code> | Esquema zod con el que validar cada fila. |

<a name="obtenerInspecciones"></a>

## obtenerInspecciones([opciones]) ⇒ <code>Promise.&lt;Array&gt;</code>
Trae todas las inspecciones con sus reportes y documentos.

Los reportes llegan ya parseados en `reportes`; el campo `reportes_json` es la
misma información como cadena y no hace falta tocarlo.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array&gt;</code> - Las inspecciones normalizadas.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API falla.

**Endpoint**: POST inspecciones.php · op=getAll  

| Param | Type | Description |
| --- | --- | --- |
| [opciones] | <code>object</code> | Ajustes de la petición. |
| [opciones.signal] | <code>AbortSignal</code> | Señal de cancelación. |

<a name="guardarInspeccion"></a>

## guardarInspeccion(datos) ⇒ <code>Promise.&lt;object&gt;</code>
Guarda una inspección, nueva o existente.

**Kind**: global function  
**Returns**: <code>Promise.&lt;object&gt;</code> - La respuesta de la API.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API rechaza la operación.

**Endpoint**: POST inspecciones.php · op=save  

| Param | Type | Description |
| --- | --- | --- |
| datos | <code>object</code> | Los campos de la inspección. |

<a name="obtenerDescripciones"></a>

## obtenerDescripciones([opciones]) ⇒ <code>Promise.&lt;Array&gt;</code>
Trae el catálogo de descripciones de violación.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array&gt;</code> - Las descripciones.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API falla.

**Endpoint**: POST inspecciones.php · op=get_descriptions  

| Param | Type | Description |
| --- | --- | --- |
| [opciones] | <code>object</code> | Ajustes de la petición. |
| [opciones.signal] | <code>AbortSignal</code> | Señal de cancelación. |

<a name="eliminarDocumento"></a>

## eliminarDocumento(documentoId) ⇒ <code>Promise.&lt;object&gt;</code>
Elimina un documento adjunto de una inspección.

**Kind**: global function  
**Returns**: <code>Promise.&lt;object&gt;</code> - La respuesta de la API.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API rechaza la operación.

**Endpoint**: POST inspecciones.php · op=delete_doc  

| Param | Type | Description |
| --- | --- | --- |
| documentoId | <code>string</code> | Documento a borrar. |

<a name="useInspecciones"></a>

## useInspecciones() ⇒ <code>object</code>
Inspecciones, cacheadas.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useQuery`.  
<a name="useDescripciones"></a>

## useDescripciones() ⇒ <code>object</code>
Catálogo de descripciones. Se cachea más tiempo: cambia poco.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useQuery`.  
<a name="useGuardarInspeccion"></a>

## useGuardarInspeccion() ⇒ <code>object</code>
Guarda una inspección y refresca la lista.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useMutation`.  
<a name="useEliminarDocumentoInspeccion"></a>

## useEliminarDocumentoInspeccion() ⇒ <code>object</code>
Elimina un documento y refresca la lista.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useMutation`.  
<a name="totalCuadra"></a>

## totalCuadra(inspeccion, [tolerancia]) ⇒ <code>boolean</code>
Comprueba que el total cuadre con la suma de las dos multas.

**Kind**: global function  
**Returns**: <code>boolean</code> - `true` si el total coincide.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| inspeccion | [<code>Inspeccion</code>](#Inspeccion) |  | La inspección a evaluar. |
| [tolerancia] | <code>number</code> | <code>0.01</code> | Margen para los redondeos de MySQL. |

<a name="normalizarInspecciones"></a>

## normalizarInspecciones(filas) ⇒ <code>Object</code>
Valida la lista de inspecciones descartando lo que no cumple.

**Kind**: global function  
**Returns**: <code>Object</code> - Las válidas y cuántas se cayeron.  

| Param | Type | Description |
| --- | --- | --- |
| filas | <code>Array</code> | Lo que vino en la respuesta. |

<a name="obtenerInventario"></a>

## obtenerInventario([opciones]) ⇒ <code>Promise.&lt;Array&gt;</code>
Trae el inventario completo, ya cruzado con sus categorías.

Ojo con el nombre de la operación: es `getFullInventoryList`, no `getAll`.
`inventory.php` responde "Operación no válida" ante cualquier otra.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array&gt;</code> - Los artículos normalizados.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API falla.

**Endpoint**: POST inventory.php · op=getFullInventoryList  

| Param | Type | Description |
| --- | --- | --- |
| [opciones] | <code>object</code> | Ajustes de la petición. |
| [opciones.signal] | <code>AbortSignal</code> | Señal de cancelación. |

<a name="useInventario"></a>

## useInventario() ⇒ <code>object</code>
Inventario completo, cacheado.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useQuery`: `{data, isLoading, isError, error}`.  
<a name="normalizarArticulos"></a>

## normalizarArticulos(filas) ⇒ <code>Object</code>
Valida la lista de artículos descartando los que no cumplen lo mínimo.

**Kind**: global function  
**Returns**: <code>Object</code> - Los válidos y cuántos se cayeron.  

| Param | Type | Description |
| --- | --- | --- |
| filas | <code>Array</code> | Lo que vino en la respuesta. |

<a name="agruparPorCategoria"></a>

## agruparPorCategoria(articulos) ⇒ <code>Array.&lt;{categoria: string, articulos: Array.&lt;Articulo&gt;}&gt;</code>
Agrupa los artículos por categoría, conservando el orden alfabético.

**Kind**: global function  
**Returns**: <code>Array.&lt;{categoria: string, articulos: Array.&lt;Articulo&gt;}&gt;</code> - Los grupos.  

| Param | Type | Description |
| --- | --- | --- |
| articulos | [<code>Array.&lt;Articulo&gt;</code>](#Articulo) | Los artículos ya validados. |

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

<a name="obtenerGrafica"></a>

## obtenerGrafica(argumentos) ⇒ <code>Promise.&lt;Array&gt;</code>
Trae los datos de una gráfica.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array&gt;</code> - Las filas de la gráfica, o `[]`.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API falla.

**Endpoint**: POST charts.php · op=chart_*  

| Param | Type | Description |
| --- | --- | --- |
| argumentos | <code>object</code> | Datos de la consulta. |
| argumentos.op | <code>string</code> | Operación, un valor de `GRAFICAS`. |
| [argumentos.parametros] | <code>object</code> | Parámetros como `period`. |
| [argumentos.signal] | <code>AbortSignal</code> | Señal de cancelación. |

<a name="useGrafica"></a>

## useGrafica(op, [parametros]) ⇒ <code>object</code>
Datos de una gráfica, cacheados.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useQuery`: `{data, isLoading, isError, error}`.  

| Param | Type | Description |
| --- | --- | --- |
| op | <code>string</code> | Operación, un valor de `GRAFICAS`. |
| [parametros] | <code>object</code> | Parámetros como `period`. |

<a name="useGraficas"></a>

## useGraficas(peticiones) ⇒ <code>Array.&lt;object&gt;</code>
Varias gráficas a la vez.

Se piden en paralelo y cada una llega cuando puede, así que una lenta no
retrasa a las demás. Antes eran seis `useEffect` y doce `useState`.

**Kind**: global function  
**Returns**: <code>Array.&lt;object&gt;</code> - Un resultado de `useQuery` por petición, en el mismo orden.  

| Param | Type | Description |
| --- | --- | --- |
| peticiones | <code>Array.&lt;object&gt;</code> | Lista de `{op, parametros}`. |

<a name="obtenerReparaciones"></a>

## obtenerReparaciones([opciones]) ⇒ <code>Promise.&lt;Array&gt;</code>
Trae todas las reparaciones en ruta con sus documentos.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array&gt;</code> - Las reparaciones normalizadas.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API falla.

**Endpoint**: POST roadside_repairs.php · op=getAll  

| Param | Type | Description |
| --- | --- | --- |
| [opciones] | <code>object</code> | Ajustes de la petición. |
| [opciones.signal] | <code>AbortSignal</code> | Señal de cancelación. |

<a name="guardarReparacion"></a>

## guardarReparacion(datos) ⇒ <code>Promise.&lt;object&gt;</code>
Guarda una reparación, nueva o existente.

**`fecha_suceso` solo viaja si trae valor.** El UPDATE del backend solo toca la
columna si el campo llegó en el POST, para que un cliente que no la mande —la
app móvil, por ejemplo— no borre la fecha que ya estaba.

**Kind**: global function  
**Returns**: <code>Promise.&lt;object&gt;</code> - La respuesta de la API.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API rechaza la operación.

**Endpoint**: POST roadside_repairs.php · op=save  

| Param | Type | Description |
| --- | --- | --- |
| datos | <code>object</code> | Los campos de la reparación. |

<a name="eliminarDocumento"></a>

## eliminarDocumento(documentoId) ⇒ <code>Promise.&lt;object&gt;</code>
Elimina un documento adjunto de una reparación.

**Kind**: global function  
**Returns**: <code>Promise.&lt;object&gt;</code> - La respuesta de la API.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API rechaza la operación.

**Endpoint**: POST roadside_repairs.php · op=delete_doc  

| Param | Type | Description |
| --- | --- | --- |
| documentoId | <code>string</code> | Documento a borrar. |

<a name="useReparaciones"></a>

## useReparaciones() ⇒ <code>object</code>
Reparaciones en ruta, cacheadas.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useQuery`.  
<a name="useGuardarReparacion"></a>

## useGuardarReparacion() ⇒ <code>object</code>
Guarda una reparación y refresca la lista.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useMutation`.  
<a name="useEliminarDocumentoReparacion"></a>

## useEliminarDocumentoReparacion() ⇒ <code>object</code>
Elimina un documento y refresca la lista.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useMutation`.  
<a name="totalCuadra"></a>

## totalCuadra(reparacion, [tolerancia]) ⇒ <code>boolean</code>
Comprueba que el total cuadre con la suma de sus partes.

El backend lo calcula, así que aquí no se recalcula —serían dos verdades que
pueden discrepar—, pero sí se puede detectar cuando no cuadra.

**Kind**: global function  
**Returns**: <code>boolean</code> - `true` si el total coincide con la suma.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| reparacion | [<code>Reparacion</code>](#Reparacion) |  | La reparación a evaluar. |
| [tolerancia] | <code>number</code> | <code>0.01</code> | Margen para los redondeos de MySQL. |

<a name="normalizarReparaciones"></a>

## normalizarReparaciones(filas) ⇒ <code>Object</code>
Valida la lista de reparaciones descartando lo que no cumple.

**Kind**: global function  
**Returns**: <code>Object</code> - Las válidas y cuántas se cayeron.  

| Param | Type | Description |
| --- | --- | --- |
| filas | <code>Array</code> | Lo que vino en la respuesta. |

<a name="obtenerViajesSafety"></a>

## obtenerViajesSafety([opciones]) ⇒ <code>Promise.&lt;Array&gt;</code>
Trae los viajes con el estado de su documentación.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array&gt;</code> - Los viajes normalizados.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API falla.

**Endpoint**: POST safety.php · op=get_safety_trips  

| Param | Type | Description |
| --- | --- | --- |
| [opciones] | <code>object</code> | Ajustes de la petición. |
| [opciones.signal] | <code>AbortSignal</code> | Señal de cancelación. |

<a name="useViajesSafety"></a>

## useViajesSafety() ⇒ <code>object</code>
Viajes de cumplimiento, cacheados.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useQuery`.  
<a name="separarPorCumplimiento"></a>

## separarPorCumplimiento(viajes) ⇒ <code>Object</code>
Separa los viajes entre los que cumplen y los que no.

Es lo que alimenta las dos primeras pestañas de la pantalla.

**Kind**: global function  
**Returns**: <code>Object</code> - Los dos grupos.  

| Param | Type | Description |
| --- | --- | --- |
| viajes | [<code>Array.&lt;ViajeSafety&gt;</code>](#ViajeSafety) | Los viajes a separar. |

<a name="contarFaltantes"></a>

## contarFaltantes(viajes) ⇒ <code>object</code>
Cuenta cuántos viajes carecen de cada documento.

Alimenta los contadores rojos junto a cada columna.

**Kind**: global function  
**Returns**: <code>object</code> - Un conteo por cada clave de `DOCUMENTOS_REQUERIDOS`.  

| Param | Type | Description |
| --- | --- | --- |
| viajes | [<code>Array.&lt;ViajeSafety&gt;</code>](#ViajeSafety) | Los viajes a contar. |

<a name="normalizarViajesSafety"></a>

## normalizarViajesSafety(filas) ⇒ <code>Object</code>
Valida la lista de viajes descartando lo que no cumple.

**Kind**: global function  
**Returns**: <code>Object</code> - Los válidos y cuántos se cayeron.  

| Param | Type | Description |
| --- | --- | --- |
| filas | <code>Array</code> | Lo que vino en la respuesta. |

<a name="obtenerOrdenes"></a>

## obtenerOrdenes([opciones]) ⇒ <code>Promise.&lt;Array&gt;</code>
Trae todas las órdenes con sus servicios anidados.

Vienen en una sola llamada: la API anida los servicios dentro de cada orden,
así que no hay que pedir el detalle aparte.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array&gt;</code> - Las órdenes normalizadas.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API falla.

**Endpoint**: POST service_order.php · op=getAllOrdersWithDetails  

| Param | Type | Description |
| --- | --- | --- |
| [opciones] | <code>object</code> | Ajustes de la petición. |
| [opciones.signal] | <code>AbortSignal</code> | Señal de cancelación. |

<a name="obtenerOrden"></a>

## obtenerOrden(parametros) ⇒ <code>Promise.&lt;object&gt;</code>
Trae una orden concreta para editarla.

**Kind**: global function  
**Returns**: <code>Promise.&lt;object&gt;</code> - La orden tal como la devuelve la API.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API falla.

**Endpoint**: POST service_order.php · op=getOrderById  

| Param | Type | Description |
| --- | --- | --- |
| parametros | <code>object</code> | Datos de la consulta. |
| parametros.ordenId | <code>string</code> | Identificador de la orden. |
| [parametros.signal] | <code>AbortSignal</code> | Señal de cancelación. |

<a name="obtenerCamionesDeOrden"></a>

## obtenerCamionesDeOrden([opciones]) ⇒ <code>Promise.&lt;Array&gt;</code>
Camiones disponibles para asignar una orden.

Ya vienen con la forma `{value, label}` que espera react-select.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array&gt;</code> - Los camiones.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API falla.

**Endpoint**: POST service_order.php · op=getTrucks  

| Param | Type | Description |
| --- | --- | --- |
| [opciones] | <code>object</code> | Ajustes de la petición. |
| [opciones.signal] | <code>AbortSignal</code> | Señal de cancelación. |

<a name="cambiarEstatusServicio"></a>

## cambiarEstatusServicio(parametros) ⇒ <code>Promise.&lt;object&gt;</code>
Cambia el estatus de un servicio dentro de una orden.

**Kind**: global function  
**Returns**: <code>Promise.&lt;object&gt;</code> - La respuesta de la API.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API rechaza la operación.

**Endpoint**: POST service_order.php · op=updateDetailStatus  

| Param | Type | Description |
| --- | --- | --- |
| parametros | <code>object</code> | Datos del cambio. |
| parametros.servicioId | <code>string</code> | Servicio a cambiar. |
| parametros.estatus | <code>string</code> | Nuevo estatus. |

<a name="useOrdenes"></a>

## useOrdenes() ⇒ <code>object</code>
Órdenes de servicio, cacheadas.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useQuery`: `{data, isLoading, isError, error}`.  
<a name="useCamionesDeOrden"></a>

## useCamionesDeOrden() ⇒ <code>object</code>
Camiones para el formulario de orden. Es un catálogo: se cachea más tiempo.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useQuery`.  
<a name="useCambiarEstatusServicio"></a>

## useCambiarEstatusServicio() ⇒ <code>object</code>
Cambia el estatus de un servicio y refresca las órdenes.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useMutation`.  
<a name="normalizarOrdenes"></a>

## normalizarOrdenes(filas) ⇒ <code>Object</code>
Valida una lista de órdenes descartando las que no cumplen lo mínimo.

**Kind**: global function  
**Returns**: <code>Object</code> - Las válidas y cuántas se cayeron.  

| Param | Type | Description |
| --- | --- | --- |
| filas | <code>Array</code> | Lo que vino en la respuesta. |

<a name="resumenServicios"></a>

## resumenServicios(orden) ⇒ <code>Object</code>
Cuenta los servicios de una orden por estatus.

Sirve para el resumen de la fila sin recorrer los servicios en el JSX.

**Kind**: global function  
**Returns**: <code>Object</code> - El conteo.  

| Param | Type | Description |
| --- | --- | --- |
| orden | [<code>Orden</code>](#Orden) | La orden a resumir. |

<a name="todoCompletado"></a>

## todoCompletado(orden) ⇒ <code>boolean</code>
Indica si todos los servicios de una orden están completados.

Una orden sin servicios **no** cuenta como completa: no hay nada hecho todavía.

**Kind**: global function  
**Returns**: <code>boolean</code> - `true` si tiene servicios y todos están completados.  

| Param | Type | Description |
| --- | --- | --- |
| orden | [<code>Orden</code>](#Orden) | La orden a evaluar. |

<a name="obtenerEquipos"></a>

## obtenerEquipos([opciones]) ⇒ <code>Promise.&lt;Array&gt;</code>
Trae todos los equipos.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array&gt;</code> - Los equipos.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API falla.

**Endpoint**: POST teams.php · op=get_teams  

| Param | Type | Description |
| --- | --- | --- |
| [opciones] | <code>object</code> | Ajustes de la petición. |
| [opciones.signal] | <code>AbortSignal</code> | Señal de cancelación. |

<a name="obtenerMiembros"></a>

## obtenerMiembros(parametros) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
Trae los identificadores de los miembros de un equipo.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array.&lt;string&gt;&gt;</code> - Los ids de los miembros.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API falla.

**Endpoint**: POST teams.php · op=get_team_users  

| Param | Type | Description |
| --- | --- | --- |
| parametros | <code>object</code> | Datos de la consulta. |
| parametros.teamId | <code>string</code> | Identificador del equipo. |
| [parametros.signal] | <code>AbortSignal</code> | Señal de cancelación. |

<a name="crearEquipo"></a>

## crearEquipo(datos) ⇒ <code>Promise.&lt;object&gt;</code>
Crea un equipo.

**Kind**: global function  
**Returns**: <code>Promise.&lt;object&gt;</code> - La respuesta de la API.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API rechaza la operación.

**Endpoint**: POST teams.php · op=create_team  

| Param | Type | Description |
| --- | --- | --- |
| datos | <code>object</code> | Nombre y descripción. |

<a name="editarEquipo"></a>

## editarEquipo(parametros) ⇒ <code>Promise.&lt;object&gt;</code>
Renombra o redescribe un equipo.

**Kind**: global function  
**Returns**: <code>Promise.&lt;object&gt;</code> - La respuesta de la API.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API rechaza la operación.

**Endpoint**: POST teams.php · op=edit_team  

| Param | Type | Description |
| --- | --- | --- |
| parametros | <code>object</code> | Datos de la edición. |
| parametros.teamId | <code>string</code> | Identificador del equipo. |
| parametros.datos | <code>object</code> | Nombre y descripción nuevos. |

<a name="eliminarEquipo"></a>

## eliminarEquipo(teamId) ⇒ <code>Promise.&lt;object&gt;</code>
Elimina un equipo. No borra a sus miembros, solo la agrupación.

**Kind**: global function  
**Returns**: <code>Promise.&lt;object&gt;</code> - La respuesta de la API.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API rechaza la operación.

**Endpoint**: POST teams.php · op=delete_team  

| Param | Type | Description |
| --- | --- | --- |
| teamId | <code>string</code> | Identificador del equipo. |

<a name="guardarMiembros"></a>

## guardarMiembros(parametros) ⇒ <code>Promise.&lt;object&gt;</code>
Reemplaza por completo la lista de miembros de un equipo.

No es incremental: manda la lista final, así que un id que falte queda fuera
del equipo.

**Kind**: global function  
**Returns**: <code>Promise.&lt;object&gt;</code> - La respuesta de la API.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API rechaza la operación.

**Endpoint**: POST teams.php · op=save_team_users  

| Param | Type | Description |
| --- | --- | --- |
| parametros | <code>object</code> | Datos a guardar. |
| parametros.teamId | <code>string</code> | Identificador del equipo. |
| parametros.miembros | <code>Array.&lt;string&gt;</code> | Ids de los miembros finales. |

<a name="useEquipos"></a>

## useEquipos() ⇒ <code>object</code>
Lista de equipos, cacheada.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useQuery`: `{data, isLoading, isError, error}`.  
<a name="useMiembros"></a>

## useMiembros(teamId) ⇒ <code>object</code>
Miembros de un equipo. No consulta hasta tener un equipo seleccionado.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useQuery`: `{data, isLoading, isError, error}`.  

| Param | Type | Description |
| --- | --- | --- |
| teamId | <code>string</code> \| <code>undefined</code> | Identificador del equipo. |

<a name="useCrearEquipo"></a>

## useCrearEquipo() ⇒ <code>object</code>
Crea un equipo y refresca la lista.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useMutation`.  
<a name="useEditarEquipo"></a>

## useEditarEquipo() ⇒ <code>object</code>
Edita un equipo y refresca la lista.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useMutation`.  
<a name="useEliminarEquipo"></a>

## useEliminarEquipo() ⇒ <code>object</code>
Elimina un equipo y refresca la lista.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useMutation`.  
<a name="useGuardarMiembros"></a>

## useGuardarMiembros() ⇒ <code>object</code>
Guarda los miembros de un equipo y refresca ese equipo.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useMutation`.  
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
<a name="obtenerAfinaciones"></a>

## obtenerAfinaciones([opciones]) ⇒ <code>Promise.&lt;Array&gt;</code>
Trae el estado de afinación de cada camión.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array&gt;</code> - Las afinaciones normalizadas.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API falla.

**Endpoint**: POST afinaciones.php · op=get_maintenance_status  

| Param | Type | Description |
| --- | --- | --- |
| [opciones] | <code>object</code> | Ajustes de la petición. |
| [opciones.signal] | <code>AbortSignal</code> | Señal de cancelación. |

<a name="obtenerHistorial"></a>

## obtenerHistorial([opciones]) ⇒ <code>Promise.&lt;Array&gt;</code>
Trae el historial de afinaciones hechas.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array&gt;</code> - El historial normalizado.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API falla.

**Endpoint**: POST afinaciones.php · op=get_history  

| Param | Type | Description |
| --- | --- | --- |
| [opciones] | <code>object</code> | Ajustes de la petición. |
| [opciones.signal] | <code>AbortSignal</code> | Señal de cancelación. |

<a name="registrarAfinacion"></a>

## registrarAfinacion(datos) ⇒ <code>Promise.&lt;object&gt;</code>
Registra una afinación y reinicia el contador de millas del camión.

**Kind**: global function  
**Returns**: <code>Promise.&lt;object&gt;</code> - La respuesta de la API.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API rechaza la operación.

**Endpoint**: POST afinaciones.php · op=reset_counter  

| Param | Type | Description |
| --- | --- | --- |
| datos | <code>object</code> | Datos de la afinación. |
| datos.truckId | <code>string</code> | Camión afinado. |
| datos.millasAcumuladas | <code>number</code> | Millas que llevaba al afinarse. |
| datos.porcentajeAceite | <code>number</code> | Porcentaje de aceite registrado. |

<a name="actualizarLimite"></a>

## actualizarLimite(datos) ⇒ <code>Promise.&lt;object&gt;</code>
Cambia cada cuántas millas se afina un camión.

**Kind**: global function  
**Returns**: <code>Promise.&lt;object&gt;</code> - La respuesta de la API.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API rechaza la operación.

**Endpoint**: POST afinaciones.php · op=update_limit  

| Param | Type | Description |
| --- | --- | --- |
| datos | <code>object</code> | Datos del cambio. |
| datos.truckId | <code>string</code> | Camión afectado. |
| datos.limite | <code>number</code> | Millas entre afinaciones. |

<a name="corregirOdometro"></a>

## corregirOdometro(datos) ⇒ <code>Promise.&lt;object&gt;</code>
Corrige una lectura de odómetro mal capturada.

Existe porque pasa: en los datos reales hay lecturas con un dígito de menos
entre valores de un millón y medio.

**Kind**: global function  
**Returns**: <code>Promise.&lt;object&gt;</code> - La respuesta de la API.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API rechaza la operación.

**Endpoint**: POST afinaciones.php · op=correct_odometer  

| Param | Type | Description |
| --- | --- | --- |
| datos | <code>object</code> | Datos de la corrección. |
| datos.dieselId | <code>string</code> | Registro de diesel a corregir. |
| datos.odometro | <code>number</code> | Lectura correcta. |

<a name="useAfinaciones"></a>

## useAfinaciones() ⇒ <code>object</code>
Estado de afinación de la flota, cacheado.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useQuery`.  
<a name="useHistorialAfinaciones"></a>

## useHistorialAfinaciones() ⇒ <code>object</code>
Historial de afinaciones, cacheado.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useQuery`.  
<a name="crearMutacion"></a>

## crearMutacion(mutationFn) ⇒ <code>function</code>
Crea una mutación que refresca las afinaciones al terminar.

Las tres invalidan lo mismo, así que comparten fábrica.

**Kind**: global function  
**Returns**: <code>function</code> - Un hook de mutación.  

| Param | Type | Description |
| --- | --- | --- |
| mutationFn | <code>function</code> | La operación a ejecutar. |

<a name="progresoAfinacion"></a>

## progresoAfinacion(afinacion) ⇒ <code>number</code>
Qué proporción del límite lleva recorrida un camión.

**Kind**: global function  
**Returns**: <code>number</code> - Entre 0 y 1 normalmente; pasa de 1 si ya se venció.  

| Param | Type | Description |
| --- | --- | --- |
| afinacion | [<code>Afinacion</code>](#Afinacion) | El camión a evaluar. |

<a name="estadoAfinacion"></a>

## estadoAfinacion(afinacion) ⇒ <code>string</code>
Clasifica a un camión según lo cerca que esté de su afinación.

**Kind**: global function  
**Returns**: <code>string</code> - Un valor de `ESTADO_AFINACION`.  

| Param | Type | Description |
| --- | --- | --- |
| afinacion | [<code>Afinacion</code>](#Afinacion) | El camión a evaluar. |

<a name="lecturasSospechosas"></a>

## lecturasSospechosas(registros) ⇒ <code>Array</code>
Detecta una lectura de odómetro que se salga del orden esperado.

El odómetro solo puede subir, así que una lectura menor que la anterior es un
error de captura. Pasa: en los datos reales hay un registro con 149 946 entre
lecturas de 1,5 millones — un dígito perdido al teclear. Por eso el backend
tiene la operación `correct_odometer`.

Los registros vienen del más reciente al más antiguo.

**Kind**: global function  
**Returns**: <code>Array</code> - Los registros cuya lectura rompe el orden.  

| Param | Type | Description |
| --- | --- | --- |
| registros | <code>Array</code> | Las cargas de diesel del camión. |

<a name="normalizarLista"></a>

## normalizarLista(filas, esquema) ⇒ <code>Object</code>
Valida una lista con el esquema dado, descartando lo que no cumple.

**Kind**: global function  
**Returns**: <code>Object</code> - Los que pasaron y cuántos no.  

| Param | Type | Description |
| --- | --- | --- |
| filas | <code>Array</code> | Lo que vino en la respuesta. |
| esquema | <code>object</code> | Esquema zod con el que validar cada fila. |

<a name="obtenerPermisosUsuario"></a>

## obtenerPermisosUsuario(parametros) ⇒ <code>Promise.&lt;object&gt;</code>
Trae todos los permisos de un usuario, separados por plataforma.

**Kind**: global function  
**Returns**: <code>Promise.&lt;object&gt;</code> - `{escritorio, movil}`, cada uno una lista de permisos.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API falla.

**Endpoint**: POST features.php · op=get_all_user_features  

| Param | Type | Description |
| --- | --- | --- |
| parametros | <code>object</code> | Datos de la consulta. |
| parametros.userId | <code>string</code> | Identificador del usuario. |
| [parametros.signal] | <code>AbortSignal</code> | Señal de cancelación. |

<a name="cambiarPermisoUsuario"></a>

## cambiarPermisoUsuario(parametros) ⇒ <code>Promise.&lt;object&gt;</code>
Concede o quita un permiso a un usuario.

**Kind**: global function  
**Returns**: <code>Promise.&lt;object&gt;</code> - La respuesta de la API.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API rechaza la operación.

**Endpoint**: POST features.php · op=toggle_user_feature  

| Param | Type | Description |
| --- | --- | --- |
| parametros | <code>object</code> | Datos del cambio. |
| parametros.userId | <code>string</code> | Usuario afectado. |
| parametros.featureId | <code>string</code> | Permiso a cambiar. Identifica ya la   plataforma, así que el endpoint no necesita recibirla. |
| parametros.concedido | <code>boolean</code> | Si queda habilitado. |

<a name="usePermisosUsuario"></a>

## usePermisosUsuario(userId) ⇒ <code>object</code>
Permisos de un usuario. No consulta hasta tener un usuario.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useQuery`: `{data, isLoading, isError, error}`.  

| Param | Type | Description |
| --- | --- | --- |
| userId | <code>string</code> \| <code>undefined</code> | Identificador del usuario. |

<a name="useCambiarPermisoUsuario"></a>

## useCambiarPermisoUsuario() ⇒ <code>object</code>
Cambia un permiso, con actualización optimista.

El interruptor se mueve de inmediato y se revierte si la API falla: son 55
permisos por usuario y esperar la respuesta en cada clic hacía la pantalla
lenta de usar. Al terminar se revalida contra el servidor.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useMutation`.  
<a name="obtenerUsuarios"></a>

## obtenerUsuarios([opciones]) ⇒ <code>Promise.&lt;Array&gt;</code>
Trae todos los usuarios del sistema, sin sus contraseñas.

El endpoint las devuelve en claro; el esquema no las incluye, así que no
llegan al estado de la aplicación. Ver `entities/user/model/usuario.js`.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array&gt;</code> - Usuarios normalizados, con su rol canónico.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API falla.

**Endpoint**: POST features.php · op=get_users  

| Param | Type | Description |
| --- | --- | --- |
| [opciones] | <code>object</code> | Ajustes de la petición. |
| [opciones.signal] | <code>AbortSignal</code> | Señal de cancelación. |

<a name="crearUsuario"></a>

## crearUsuario(datos) ⇒ <code>Promise.&lt;object&gt;</code>
Da de alta un usuario.

**Kind**: global function  
**Returns**: <code>Promise.&lt;object&gt;</code> - La respuesta de la API.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API rechaza la operación.

**Endpoint**: POST features.php · op=create_user  

| Param | Type | Description |
| --- | --- | --- |
| datos | <code>object</code> | Nombre, usuario, contraseña, tipo y conductor asociado. |

<a name="actualizarUsuario"></a>

## actualizarUsuario(parametros) ⇒ <code>Promise.&lt;object&gt;</code>
Actualiza un usuario.

`pass` solo viaja si trae algo: vacío significa "no cambiar la contraseña", y
el backend no toca el campo si no lo recibe.

**Kind**: global function  
**Returns**: <code>Promise.&lt;object&gt;</code> - La respuesta de la API.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API rechaza la operación.

**Endpoint**: POST features.php · op=update_user  

| Param | Type | Description |
| --- | --- | --- |
| parametros | <code>object</code> | Datos de la edición. |
| parametros.userId | <code>string</code> | Identificador del usuario. |
| parametros.datos | <code>object</code> | Campos a guardar. |

<a name="useUsuarios"></a>

## useUsuarios() ⇒ <code>object</code>
Lista de usuarios, cacheada.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useQuery`: `{data, isLoading, isError, error}`.  
<a name="useCrearUsuario"></a>

## useCrearUsuario() ⇒ <code>object</code>
Crea un usuario y refresca la lista.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useMutation`.  
<a name="useActualizarUsuario"></a>

## useActualizarUsuario() ⇒ <code>object</code>
Actualiza un usuario y refresca la lista.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useMutation`.  
<a name="normalizarUsuarios"></a>

## normalizarUsuarios(filas) ⇒ <code>Object</code>
Valida la lista de usuarios y les agrega su rol canónico.

**Kind**: global function  
**Returns**: <code>Object</code> - Los válidos y cuántos se cayeron.  

| Param | Type | Description |
| --- | --- | --- |
| filas | <code>Array</code> | Lo que vino en la respuesta. |

<a name="validarFormularioUsuario"></a>

## validarFormularioUsuario(formulario, [opciones]) ⇒ <code>Object</code>
Valida el formulario de alta o edición de un usuario.

`pass` es opcional al editar: vacío significa "no cambiar la contraseña", y el
campo solo viaja si trae algo. Al **crear**, en cambio, es obligatorio.

**Kind**: global function  
**Returns**: <code>Object</code> - Resultado de la validación.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| formulario | <code>object</code> |  | Datos capturados. |
| [opciones] | <code>object</code> |  | Ajustes de la validación. |
| [opciones.esAlta] | <code>boolean</code> | <code>false</code> | Si es un alta y no una edición. |

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
<a name="Autonomia"></a>

## Autonomia : <code>object</code>
La autonomía de un camión, ya validada.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| truck_id | <code>string</code> | Identificador del camión. |
| unidad | <code>string</code> | Número de unidad. |
| placa | <code>string</code> \| <code>null</code> | Placa del camión. |
| registros | <code>Array</code> | Registros de rendimiento, del más reciente al más antiguo. |

<a name="Requisito"></a>

## Requisito : <code>object</code>
Un requisito documental ya validado.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| id_requisito | <code>string</code> | Identificador. |
| key_name | <code>string</code> | Clave con la que se indexa su valor. |
| label | <code>string</code> | Nombre visible. |
| region | <code>string</code> | `MEX` o `USA`. |
| tipo | <code>string</code> | `file` o `text`. |
| tiene_vencimiento | <code>boolean</code> | Si se le controla fecha de caducidad. |
| activo | <code>boolean</code> | Si sigue vigente. |

<a name="Inspeccion"></a>

## Inspeccion : <code>object</code>
Una inspección ya validada.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| id_inspeccion | <code>string</code> | Identificador. |
| fecha_inspeccion | <code>string</code> | Cuándo se hizo la inspección. |
| nombre_camion | <code>string</code> | Unidad inspeccionada. |
| operador | <code>string</code> | Conductor. |
| multa_ima | <code>number</code> | Multa que paga la empresa. |
| multa_driver | <code>number</code> | Multa que paga el conductor. |
| total | <code>number</code> | Suma de ambas multas. |
| reportes | <code>Array</code> | Violaciones levantadas. |

<a name="Articulo"></a>

## Articulo : <code>object</code>
Un artículo de inventario ya validado.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| id_articulo | <code>string</code> | Identificador. |
| nombre_articulo | <code>string</code> | Nombre del artículo. |
| cantidad_stock | <code>number</code> | Existencias. |
| nombre_subcategoria | <code>string</code> | Subcategoría a la que pertenece. |
| nombre_categoria | <code>string</code> | Categoría a la que pertenece. |

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

<a name="Reparacion"></a>

## Reparacion : <code>object</code>
Una reparación en ruta ya validada.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| id_reparacion | <code>string</code> | Identificador. |
| fecha_registro | <code>string</code> | Cuándo se capturó. |
| fecha_suceso | <code>string</code> \| <code>null</code> | Cuándo ocurrió; puede faltar. |
| nombre_camion | <code>string</code> | Unidad afectada. |
| operador | <code>string</code> | Conductor que reportó. |
| costo_reparacion | <code>number</code> | Mano de obra. |
| costo_refacciones | <code>number</code> | Refacciones. |
| total | <code>number</code> | Suma de ambos. |
| documentos | <code>Array</code> | Comprobantes adjuntos. |

<a name="ViajeSafety"></a>

## ViajeSafety : <code>object</code>
Un viaje con su estado de documentación.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| trip_id | <code>string</code> | Identificador. |
| trip_number | <code>string</code> | Número visible del viaje. |
| driver_nombre | <code>string</code> | Conductor. |
| truck_unidad | <code>string</code> | Unidad. |
| libro_electronico | <code>string</code> \| <code>null</code> | URL del documento, o `null` si falta. |
| reporte_diesel | <code>string</code> \| <code>null</code> | URL del documento, o `null` si falta. |
| reporte_pcmiller | <code>string</code> \| <code>null</code> | URL del documento, o `null` si falta. |

<a name="Orden"></a>

## Orden : <code>object</code>
Una orden de servicio ya validada.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| id_orden | <code>string</code> | Identificador. |
| fecha_orden | <code>string</code> | Fecha, solo el día. |
| estatus | <code>string</code> | `Abierta`, `Pendiente` o `Completado`. |
| truck_id | <code>string</code> | Camión al que pertenece. |
| nombre_camion | <code>string</code> | Número de unidad. |
| tipo_cambio | <code>number</code> \| <code>null</code> | Tipo de cambio, o `null` si es en pesos. |
| servicios | <code>Array</code> | Los servicios de la orden. |

<a name="Afinacion"></a>

## Afinacion : <code>object</code>
El estado de afinación de un camión, ya validado.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| truck_id | <code>string</code> | Identificador del camión. |
| unidad | <code>string</code> | Número de unidad. |
| ultima_afinacion_fecha | <code>string</code> | Fecha de la última afinación. |
| odometro_base | <code>number</code> | Odómetro cuando se afinó por última vez. |
| limite_afinacion | <code>number</code> | Millas entre afinaciones. |
| millas_acumuladas | <code>number</code> | Millas recorridas desde la última. |
| requiere_actualizacion | <code>boolean</code> | Si el backend pide revisar el dato. |
| ultimos_registros | <code>Array</code> | Últimas cargas de diesel del camión. |

<a name="Usuario"></a>

## Usuario : <code>object</code>
Usuario ya validado y normalizado.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | Identificador. |
| name | <code>string</code> | Nombre completo. |
| user | <code>string</code> | Nombre de acceso. |
| type | <code>string</code> | Valor crudo de `Users_credentials.type`. |
| active | <code>number</code> | 1 si la cuenta está activa. |
| driver_id | <code>string</code> \| <code>null</code> | Conductor asociado, si el usuario es de tipo Driver. |
| rol | <code>string</code> | Rol canónico derivado de `type`. |
| nombreRol | <code>string</code> | Nombre del rol para mostrar. |

