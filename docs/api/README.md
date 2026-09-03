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
<dt><a href="#LOCALE">LOCALE</a> : <code>string</code></dt>
<dd><p>Con qué convenciones se formatean los números y las fechas.</p>
<p>Hoy el proyecto formatea dinero a mano en <strong>27 sitios</strong>, y no todos igual:
unos usan <code>es-MX</code> y otros <code>en-US</code>, así que la misma cantidad se ve distinta
según la pantalla. Este módulo existe para que eso converja módulo a módulo;
el valor por omisión es el que ya usan las pantallas de viajes.</p>
</dd>
<dt><a href="#MONEDA">MONEDA</a> : <code>string</code></dt>
<dd><p>Moneda con la que se opera casi todo.</p>
</dd>
<dt><a href="#soloHora">soloHora</a> ⇒ <code>string</code> | <code>null</code></dt>
<dd><p>Recorta una hora <code>HH:MM:SS</code> a <code>HH:MM</code>.</p>
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
<dt><a href="#CLASE_NO_IMPRIMIR">CLASE_NO_IMPRIMIR</a> : <code>string</code></dt>
<dd><p>Clase que marca lo que no debe salir en el PDF.</p>
<p>Los botones de la pantalla estorban en un documento impreso, así que se
ocultan mientras se toma la foto y se restauran después.</p>
</dd>
<dt><a href="#ESTADO_GEOGRAFICO">ESTADO_GEOGRAFICO</a> : <code>string</code></dt>
<dd><p>«Estado» geográfico, que <strong>no</strong> es lo mismo que el estatus de un viaje.</p>
<p>Se declara aparte a propósito. En IFTA, «Estado» significa entidad federativa
—Texas, Oklahoma— y en el resto de la app significaría la situación de un
registro. Por eso el estatus se llama <code>Estatus</code>: para que esta palabra
conserve un solo significado.</p>
</dd>
<dt><a href="#TAMANO_MAXIMO_BYTES">TAMANO_MAXIMO_BYTES</a> : <code>number</code></dt>
<dd><p>Tamaño máximo que se acepta en una subida, en bytes.</p>
<p>El límite real lo pone PHP (<code>upload_max_filesize</code>), pero cuando se rebasa allá
la petición muere sin mensaje útil y la persona no sabe qué pasó. Rechazarlo
aquí permite decirle cuánto pesa su archivo y cuánto cabe.</p>
</dd>
<dt><a href="#TIPOS_PERMITIDOS">TIPOS_PERMITIDOS</a></dt>
<dd><p>Los tipos de archivo que la app acepta, con su firma binaria.</p>
<p><code>firmas</code> son los primeros bytes reales del archivo. La extensión y el
<code>file.type</code> que reporta el navegador los controla quien sube: renombrar
<code>algo.exe</code> a <code>algo.pdf</code> cambia las dos cosas, pero no cambia el contenido.
Comparar la firma es lo único que dice qué es el archivo de verdad.</p>
</dd>
<dt><a href="#GRUPOS_ARCHIVO">GRUPOS_ARCHIVO</a></dt>
<dd><p>Los grupos de tipos que pide cada pantalla.</p>
</dd>
<dt><a href="#atributoAccept">atributoAccept</a> ⇒ <code>string</code></dt>
<dd><p>El valor de <code>accept</code> para un <code>&lt;input type=&quot;file&quot;&gt;</code> a partir de un grupo.</p>
<p>Se genera de la misma tabla que valida, para que el filtro del explorador de
archivos y la comprobación real nunca se desincronicen.</p>
</dd>
<dt><a href="#CARACTERES_INVISIBLES">CARACTERES_INVISIBLES</a> : <code>RegExp</code></dt>
<dd><p>Caracteres invisibles: ancho cero, marcas de dirección y BOM.</p>
<p>Ocupan lugar en la cadena pero no pintan nada. Dos textos que se ven idénticos
pueden ser distintos por culpa de uno de estos, y entonces una búsqueda falla
sin explicación posible.</p>
</dd>
<dt><a href="#PROTOCOLOS_SEGUROS">PROTOCOLOS_SEGUROS</a> : <code>Array.&lt;string&gt;</code></dt>
<dd><p>Protocolos que se consideran seguros para navegar o abrir fuera de la app.</p>
<p>Es una lista blanca a propósito: cualquier esquema que no esté aquí se
rechaza. Una lista negra siempre se queda corta \u2014<code>javascript:</code>, <code>vbscript:</code>,
<code>data:</code>, <code>file:</code>, <code>smb:</code> y los esquemas que registre cualquier programa
instalado en la máquina\u2014 y basta que se escape uno para perder la garantía.</p>
</dd>
<dt><a href="#URL_INERTE">URL_INERTE</a> : <code>string</code></dt>
<dd><p>El valor que se pone en un <code>href</code> cuando la URL no es de fiar.</p>
<p>No se usa cadena vacía ni <code>#</code>: ambos dejan el enlace con aspecto de enlace
funcional. <code>about:blank</code> abre una pestaña en blanco, que es un fallo visible
y sin daño.</p>
</dd>
<dt><a href="#urlSegura">urlSegura</a> ⇒ <code>string</code></dt>
<dd><p>Devuelve la URL si es segura, y una URL inerte si no lo es.</p>
<p>Pensada para usarse en el punto exacto donde el dato entra al DOM, de modo que
ningún componente tenga que acordarse de validar.</p>
</dd>
<dt><a href="#enlaceExterno">enlaceExterno</a> ⇒ <code>Object</code></dt>
<dd><p>Las props que necesita un enlace externo para ser seguro.</p>
<p><code>noopener</code> evita que la página abierta pueda manipular la que la abrió a
través de <code>window.opener</code>; <code>noreferrer</code> además le oculta de dónde viene. Van
juntas porque olvidar una de las dos es el error habitual.</p>
</dd>
<dt><a href="#DURACION_FLOTANTE_MS">DURACION_FLOTANTE_MS</a> : <code>number</code></dt>
<dd><p>Cuánto dura en pantalla un aviso flotante.</p>
</dd>
<dt><a href="#usarCola">usarCola</a></dt>
<dd><p>La cola de avisos pendientes de pintar.</p>
<p>Es un store de zustand y no un módulo con estado suelto porque el proyecto ya
tiene tres stores así, y tener dos mecanismos para lo mismo es la clase de
duplicación que el estándar manda evitar. Zustand resuelve además, de fábrica,
lo que aquí había que escribir a mano: se lee y se escribe <strong>fuera de React</strong>
con <code>getState</code>, que es justo lo que necesita <code>notify</code> para poder llamarse
desde un <code>catch</code>, y <code>useStore</code> da la suscripción para pintar.</p>
<p>Tres ranuras, separadas a propósito:</p>
<ul>
<li><code>cola</code>: los diálogos que esperan respuesta. Se muestran de uno en uno y por
orden; el segundo espera en vez de reemplazar al primero, porque perder un
aviso es peor que mostrar dos seguidos.</li>
<li><code>cargando</code>: el indicador que bloquea. No espera respuesta, así que no entra
en la cola, y cualquier diálogo nuevo lo releva.</li>
<li><code>flotantes</code>: los avisos que no bloquean. Conviven y se van solos.</li>
</ul>
</dd>
<dt><a href="#PAGE_SHELL_SX">PAGE_SHELL_SX</a></dt>
<dd><p>El contenedor de una pantalla completa.</p>
</dd>
<dt><a href="#SECTION_LABEL_SX">SECTION_LABEL_SX</a></dt>
<dd><p>La etiqueta pequeña en mayúsculas que rotula una sección.</p>
</dd>
<dt><a href="#PAGE_OVERLINE_SX">PAGE_OVERLINE_SX</a></dt>
<dd><p>La misma etiqueta, con más espaciado, para el rótulo sobre el título.</p>
</dd>
<dt><a href="#PAGE_TITLE_SX">PAGE_TITLE_SX</a></dt>
<dd></dd>
<dt><a href="#CARD_SX">CARD_SX</a></dt>
<dd></dd>
<dt><a href="#DIALOG_PAPER_SX">DIALOG_PAPER_SX</a></dt>
<dd></dd>
<dt><a href="#DIALOG_TITLE_SX">DIALOG_TITLE_SX</a></dt>
<dd></dd>
<dt><a href="#DIALOG_CONTENT_SX">DIALOG_CONTENT_SX</a></dt>
<dd></dd>
<dt><a href="#DIALOG_ACTIONS_SX">DIALOG_ACTIONS_SX</a></dt>
<dd></dd>
<dt><a href="#SECTION_ICON_SX">SECTION_ICON_SX</a></dt>
<dd></dd>
<dt><a href="#SECTION_TITLE_SX">SECTION_TITLE_SX</a></dt>
<dd></dd>
<dt><a href="#HEADER_ROW_SX">HEADER_ROW_SX</a></dt>
<dd></dd>
<dt><a href="#HEADER_CELL_SX">HEADER_CELL_SX</a></dt>
<dd></dd>
<dt><a href="#TABLE_CONTAINER_SX">TABLE_CONTAINER_SX</a></dt>
<dd></dd>
<dt><a href="#PAGINATION_BOX_SX">PAGINATION_BOX_SX</a></dt>
<dd></dd>
<dt><a href="#PAGINATION_SX">PAGINATION_SX</a></dt>
<dd></dd>
<dt><a href="#TABS_WRAPPER_SX">TABS_WRAPPER_SX</a></dt>
<dd></dd>
<dt><a href="#TAB_SX">TAB_SX</a></dt>
<dd></dd>
<dt><a href="#CHIP_SX">CHIP_SX</a></dt>
<dd></dd>
<dt><a href="#CHIP_OK_SX">CHIP_OK_SX</a></dt>
<dd></dd>
<dt><a href="#CHIP_DANGER_SX">CHIP_DANGER_SX</a></dt>
<dd></dd>
<dt><a href="#CHIP_WARN_SX">CHIP_WARN_SX</a></dt>
<dd><p>Un chip de aviso, para lo que no está mal pero pide atención.</p>
</dd>
<dt><a href="#CHIP_INFO_SX">CHIP_INFO_SX</a></dt>
<dd><p>Un chip informativo, sin carga de bueno ni malo.</p>
</dd>
<dt><a href="#ICON_BTN_SX">ICON_BTN_SX</a></dt>
<dd></dd>
<dt><a href="#CELL_STRONG_SX">CELL_STRONG_SX</a></dt>
<dd></dd>
<dt><a href="#CELL_SX">CELL_SX</a></dt>
<dd></dd>
<dt><a href="#CELL_MUTED_SX">CELL_MUTED_SX</a></dt>
<dd></dd>
<dt><a href="#DARK_BTN_SX">DARK_BTN_SX</a></dt>
<dd></dd>
<dt><a href="#GHOST_BTN_SX">GHOST_BTN_SX</a></dt>
<dd></dd>
<dt><a href="#INPUT_SX">INPUT_SX</a></dt>
<dd></dd>
<dt><a href="#notify">notify</a></dt>
<dd><p>Avisos al usuario, en un solo lugar.</p>
<p>El proyecto llegó a tener <strong>tres</strong> librerías para lo mismo: <code>sweetalert2</code>,
<code>react-toastify</code> y <code>@pablotheblink/flashyjs</code>. Hoy no tiene ninguna: los avisos
se pintan con los componentes de MUI y el tema de la aplicación —ver
<code>docs/DECISIONES/0010</code> y <code>0011</code>—, así que un diálogo de confirmación se ve
como el resto de la app y no como una librería ajena.</p>
<p>Este módulo no pinta nada: encola. Quien pinta es <code>AnfitrionAvisos</code>, montado
una sola vez junto al tema. Esa separación es lo que permite llamar a <code>notify</code>
desde un <code>catch</code>, desde el manejador global de errores o desde un hook, sin
que ninguno de esos sitios tenga que ser un componente.</p>
<p>Cada función devuelve una promesa, así que se puede esperar el cierre.</p>
</dd>
<dt><a href="#COLOR">COLOR</a></dt>
<dd><p>La paleta de la aplicación.</p>
<p>Son los colores que ya usaban el Administrador de viajes y el Expense Manager,
que es el aspecto que el equipo quiere en toda la app. Estaban escritos a mano
en 1 212 lugares; aquí quedan con nombre para que el siguiente no tenga que
copiarlos de otra pantalla y para que un cambio de paleta sea un solo archivo.</p>
<p>La escala va de más oscuro a más claro, como en las escalas de grises de
cualquier sistema de diseño: <code>TINTA</code> es el texto principal y el color de
marca; <code>LIENZO</code> es el fondo de la pantalla.</p>
</dd>
<dt><a href="#MARCA">MARCA</a></dt>
<dd><p>El azul de la barra lateral, que es la identidad de la aplicación.</p>
<p>No se unifica con la paleta de contenido a propósito: una navegación de color
sobre un lienzo neutro es una decisión de diseño, no un descuido. Lo que sí se
unifica es que haya <strong>un</strong> azul de cada cosa. Antes había dos colores de
hover que se diferenciaban en un dígito —<code>#4F5DDA</code> y <code>#4f5bda</code>—, así que el
menú cambiaba de tono según por dónde se pasara el ratón.</p>
</dd>
<dt><a href="#TINTE">TINTE</a></dt>
<dd><p>Tintes para categorías: cuando el color es información y no decoración.</p>
<p>Un chip de &quot;Refacciones&quot; y uno de &quot;Consumibles&quot; tienen que distinguirse a
simple vista; unificarlos al color de marca borraría el dato. Lo que sí se
unifica es la <em>forma</em> del tinte —fondo muy claro, texto oscuro, borde
intermedio y un acento— para que todas las categorías de la app se construyan
igual, sin importar la pantalla.</p>
</dd>
<dt><a href="#SERIE">SERIE</a> : <code>Array.&lt;string&gt;</code></dt>
<dd><p>La paleta de series para las gráficas.</p>
<p>Va aparte de <code>COLOR</code> a propósito. Antes las series usaban los colores de
estado —<code>COLOR.AVISO</code> para &quot;Total Pagado&quot;—, y eso confunde: el ámbar significa
&quot;atención&quot; en toda la app, y una barra de cobranza no es una advertencia. Aquí
el color solo distingue una serie de otra.</p>
<p>El orden importa: son los colores en el orden en que se asignan, elegidos para
distinguirse entre sí incluso en escala de grises al imprimir un reporte.</p>
</dd>
<dt><a href="#TIPO">TIPO</a></dt>
<dd><p>Los valores de tipografía que se repiten fuera de las variantes de MUI.</p>
</dd>
<dt><a href="#BORDE">BORDE</a> : <code>string</code></dt>
<dd><p>El borde estándar de un contenedor: 1 px del color de borde.</p>
</dd>
<dt><a href="#RELLENO_PANTALLA">RELLENO_PANTALLA</a></dt>
<dd><p>El relleno de una pantalla, que cambia con el ancho.</p>
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
<dt><a href="#llaveSiguienteNumero">llaveSiguienteNumero</a> ⇒ <code>Array</code></dt>
<dd><p>Llave de caché del siguiente número de viaje disponible.</p>
</dd>
<dt><a href="#llaveTransnacionales">llaveTransnacionales</a> ⇒ <code>Array</code></dt>
<dd><p>Llave de caché de los viajes transnacionales de un país.</p>
</dd>
<dt><a href="#companiaDePrograma">companiaDePrograma</a> ⇒ <code>*</code></dt>
<dd><p>El id de la compañía de una programación.</p>
</dd>
<dt><a href="#almacenDePrograma">almacenDePrograma</a> ⇒ <code>*</code></dt>
<dd><p>El id del almacén de destino de una programación.</p>
</dd>
<dt><a href="#paisOpuesto">paisOpuesto</a> ⇒ <code>string</code></dt>
<dd><p>El país contrario al dado.</p>
<p>Un viaje transnacional continúa uno del otro lado de la frontera, así que para
buscar su pareja hay que consultar el país opuesto.</p>
</dd>
<dt><a href="#esquemaViajeTransnacional">esquemaViajeTransnacional</a></dt>
<dd><p>Un viaje transnacional: la parte de un cruce que ocurre en un país.</p>
<p><code>transnational_number</code> es lo que enlaza las dos mitades, y <code>movement_number</code>
dice cuál es cuál dentro del cruce.</p>
</dd>
<dt><a href="#formatearNumeroViaje">formatearNumeroViaje</a> ⇒ <code>string</code></dt>
<dd><p>Arma el número visible de un viaje.</p>
<p>El formato es <code>&lt;número&gt;-&lt;país&gt;-&lt;año&gt;</code>, que es como la gente lo reconoce en toda
la app: <code>197-US-26</code>.</p>
</dd>
<dt><a href="#valorViajeTransnacional">valorViajeTransnacional</a> ⇒ <code>string</code></dt>
<dd><p>El valor con el que se identifica un viaje en el selector de cruces.</p>
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
<dt><a href="#llaveResumen">llaveResumen</a> ⇒ <code>Array</code></dt>
<dd><p>Llave de caché del resumen por viaje de un tipo.</p>
</dd>
<dt><a href="#llaveRegistros">llaveRegistros</a> ⇒ <code>Array</code></dt>
<dd><p>Llave de caché de los registros de un viaje.</p>
</dd>
<dt><a href="#llaveRegistro">llaveRegistro</a> ⇒ <code>Array</code></dt>
<dd><p>Llave de caché de un registro suelto.</p>
</dd>
<dt><a href="#useGuardarRegistro">useGuardarRegistro</a> ⇒ <code>object</code></dt>
<dd><p>Guarda un registro.</p>
</dd>
<dt><a href="#useEliminarRegistro">useEliminarRegistro</a> ⇒ <code>object</code></dt>
<dd><p>Elimina un registro.</p>
</dd>
<dt><a href="#useCrearRegistroManual">useCrearRegistroManual</a> ⇒ <code>object</code></dt>
<dd><p>Da de alta una carga manual.</p>
</dd>
<dt><a href="#LLAVE_GASTOS">LLAVE_GASTOS</a> : <code>Array</code></dt>
<dd><p>Llave de caché de la lista de gastos generales.</p>
</dd>
<dt><a href="#llaveGasto">llaveGasto</a> ⇒ <code>Array</code></dt>
<dd><p>Llave de caché de un gasto suelto.</p>
</dd>
<dt><a href="#obtenerCatalogo">obtenerCatalogo</a> ⇒ <code>Promise.&lt;Array&gt;</code></dt>
<dd><p>Pide uno de los catálogos del formulario de gastos.</p>
<p>Los cuatro viven en el mismo endpoint y devuelven <code>{value, label}</code>, así que
comparten una sola función.</p>
</dd>
<dt><a href="#TODOS">TODOS</a> : <code>string</code></dt>
<dd><p>El valor de los filtros que significa &quot;no filtrar por esto&quot;.</p>
</dd>
<dt><a href="#renglonesDe">renglonesDe</a> ⇒ <code>Array</code></dt>
<dd><p>Los renglones de un gasto, siempre como lista.</p>
</dd>
<dt><a href="#paisesDe">paisesDe</a> ⇒ <code>Array.&lt;string&gt;</code></dt>
<dd><p>Los países que aparecen en los gastos, para el selector.</p>
<p>Salen de los datos y no de una lista fija: si mañana se captura un gasto de
otro país, aparece solo.</p>
</dd>
<dt><a href="#etiquetasDe">etiquetasDe</a> ⇒ <code>Array.&lt;string&gt;</code></dt>
<dd><p>Las etiquetas de un catálogo, ordenadas en español.</p>
</dd>
<dt><a href="#filaPorEtiqueta">filaPorEtiqueta</a> ⇒ <code>object</code> | <code>null</code></dt>
<dd><p>Busca en un catálogo la fila que corresponde a una etiqueta.</p>
<p>Los filtros guardan la etiqueta, no el id, porque es lo que se ve; para
encadenar tipo → categoría → subcategoría hace falta volver al id.</p>
</dd>
<dt><a href="#ordenarGastos">ordenarGastos</a> ⇒ <code>Array</code></dt>
<dd><p>Ordena los gastos por la columna elegida.</p>
</dd>
<dt><a href="#esquemaResumenViaje">esquemaResumenViaje</a></dt>
<dd><p>Un renglón del resumen: lo que un viaje lleva gastado o cargado.</p>
</dd>
<dt><a href="#identificadorViaje">identificadorViaje</a> ⇒ <code>string</code></dt>
<dd><p>Cómo se identifica un viaje en pantalla.</p>
<p>La nomenclatura completa —<code>200-US-26</code>— es lo que la gente reconoce; el número
a secas es el respaldo para los viajes viejos que no la tienen.</p>
</dd>
<dt><a href="#totalDe">totalDe</a> ⇒ <code>number</code></dt>
<dd><p>Lo que suman los renglones visibles.</p>
</dd>
<dt><a href="#esManual">esManual</a> ⇒ <code>boolean</code></dt>
<dd><p>Indica si una carga de diesel se capturó a mano.</p>
<p>Las que llegan solas vienen del proveedor; las manuales las escribió alguien,
y por eso se marcan.</p>
</dd>
<dt><a href="#CATALOGO_REGISTRO">CATALOGO_REGISTRO</a> : <code>Object.&lt;string, object&gt;</code></dt>
<dd><p>Los descriptores de los dos tipos, por su clave.</p>
</dd>
<dt><a href="#esGastoMXN">esGastoMXN</a> ⇒ <code>boolean</code></dt>
<dd><p>Indica si un gasto se capturó en pesos.</p>
</dd>
<dt><a href="#totalDeDetalles">totalDeDetalles</a> ⇒ <code>number</code></dt>
<dd><p>Lo que suman los renglones de un gasto.</p>
<p>Es el respaldo de <code>totalUSD</code> cuando el total guardado viene en cero.</p>
</dd>
<dt><a href="#totalUSD">totalUSD</a> ⇒ <code>number</code></dt>
<dd><p>El total de un gasto en dólares.</p>
<p>Todos los gastos se guardan convertidos a dólares en <code>monto_total</code>, sea cual
sea la moneda en que se capturaron. Cuando ese campo viene en cero se recurre
a la suma de los renglones.</p>
</dd>
<dt><a href="#totalMXN">totalMXN</a> ⇒ <code>Object</code></dt>
<dd><p>El total de un gasto en pesos.</p>
<p>Un gasto capturado en México ya trae la cantidad en pesos que se pagó de
verdad —<code>cantidad_original</code>—, y esa es la que vale. Uno capturado en dólares
se convierte con el tipo de cambio del día, y se marca como convertido para
que en pantalla se distinga de una cifra real.</p>
</dd>
<dt><a href="#tipoGastoPrincipal">tipoGastoPrincipal</a> ⇒ <code>string</code></dt>
<dd><p>El tipo de gasto con el que se identifica un gasto de varios renglones.</p>
<p>Se toma el <strong>último</strong> renglón, no el primero: es el criterio que ya usaba la
pantalla y con el que la gente lee la tabla.</p>
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
<dt><a href="#LLAVE_COTIZACIONES">LLAVE_COTIZACIONES</a> : <code>Array</code></dt>
<dd><p>Llave de caché del historial de cotizaciones.</p>
</dd>
<dt><a href="#ubicacionVacia">ubicacionVacia</a> ⇒ <code><a href="#Ubicacion">Ubicacion</a></code></dt>
<dd><p>Una ubicación vacía, la que abre cada campo.</p>
</dd>
<dt><a href="#millasTotales">millasTotales</a> ⇒ <code>number</code></dt>
<dd><p>Las millas totales de una cotización: las del viaje más las vacías.</p>
<p>Las millas vacías son las que el camión recorre para llegar al origen de la
carga. Se cobran igual, así que entran en el total.</p>
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
<dt><a href="#LLAVE_TABLERO">LLAVE_TABLERO</a> : <code>Array</code></dt>
<dd><p>Llave de caché del tablero de disponibilidad.</p>
</dd>
<dt><a href="#LLAVE_PROGRAMACIONES">LLAVE_PROGRAMACIONES</a> : <code>Array</code></dt>
<dd><p>Llave de caché de las programaciones guardadas.</p>
</dd>
<dt><a href="#NUEVO_LAREDO">NUEVO_LAREDO</a> : <code>Object</code></dt>
<dd><p>El patio desde donde salen y a donde vuelven los viajes.</p>
<p>Todas las distancias que se muestran al programar se miden contra este punto:
qué tan lejos está cada camión de poder empezar el siguiente viaje.</p>
</dd>
<dt><a href="#valorCaja">valorCaja</a> ⇒ <code>string</code></dt>
<dd><p>El valor con el que una caja se identifica dentro del selector.</p>
</dd>
<dt><a href="#programacionEnBlanco">programacionEnBlanco</a> ⇒ <code>object</code></dt>
<dd><p>Una programación en blanco, la que abre el modal al dar de alta.</p>
</dd>
<dt><a href="#estaDisponible">estaDisponible</a> ⇒ <code>boolean</code></dt>
<dd><p>Indica si una unidad está libre para programarse.</p>
<p>El tablero marca como no disponibles las que ya están en un viaje.</p>
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
<dt><a href="#REFRESCO_FLOTA_MS">REFRESCO_FLOTA_MS</a> : <code>number</code></dt>
<dd><p>Cada cuánto se vuelve a preguntar dónde está la flota.</p>
<p>El GPS reporta cada minuto largo, así que pedir más seguido no da datos más
frescos: solo carga el servidor.</p>
</dd>
<dt><a href="#TIMEOUT_GPS_MS">TIMEOUT_GPS_MS</a> : <code>number</code></dt>
<dd><p>Cuánto se le espera al GPS antes de darlo por perdido.</p>
<p><code>Tracking.php</code> tarda unos <strong>21 segundos</strong> medidos contra producción, por
encima del tiempo que la app da por omisión: con el límite general, el mapa se
quedaba cargando y fallaba sin que nada explicara por qué. Se le da margen
propio en lugar de subir el de toda la aplicación.</p>
</dd>
<dt><a href="#LLAVE_FLOTA">LLAVE_FLOTA</a> : <code>Array</code></dt>
<dd><p>Llave de caché de la flota.</p>
</dd>
<dt><a href="#llaveParadas">llaveParadas</a> ⇒ <code>Array</code></dt>
<dd><p>Llave de caché de las paradas de una etapa.</p>
<p>Incluye la parada actual porque el estado de cada una se calcula a partir de
ella: sin eso, avanzar de parada seguiría mostrando el avance anterior.</p>
</dd>
<dt><a href="#SERVICIO_RUTAS">SERVICIO_RUTAS</a> : <code>string</code></dt>
<dd><p>Servicio público de rutas por carretera.</p>
<p>Es la instancia de demostración de OSRM: gratuita, sin llave, y sin ninguna
garantía de disponibilidad. Si el trazador deja de funcionar, empieza por
comprobar que este servicio siga en pie.</p>
</dd>
<dt><a href="#SERVICIO_LUGARES">SERVICIO_LUGARES</a> : <code>string</code></dt>
<dd><p>Servicio público de búsqueda de lugares.</p>
</dd>
<dt><a href="#MAXIMO_LUGARES">MAXIMO_LUGARES</a> : <code>number</code></dt>
<dd><p>Cuántos lugares se ofrecen al escribir una dirección.</p>
</dd>
<dt><a href="#COLORES_UNIDAD">COLORES_UNIDAD</a> : <code>Array.&lt;string&gt;</code></dt>
<dd><p>Colores con los que se distinguen las unidades en el mapa y en la lista.</p>
<p>Se asignan por posición, así que una unidad conserva su color mientras la
flota no cambie de tamaño. Son diez: con más unidades, los colores se repiten.</p>
</dd>
<dt><a href="#CAPACIDAD_POR_OMISION">CAPACIDAD_POR_OMISION</a> : <code>number</code></dt>
<dd><p>Capacidad que se asume cuando la unidad no tiene tanque configurado.</p>
</dd>
<dt><a href="#colorEstado">colorEstado</a> ⇒ <code>string</code></dt>
<dd><p>El color con el que se pinta un estado de viaje.</p>
</dd>
<dt><a href="#esquemaUnidadGps">esquemaUnidadGps</a></dt>
<dd><p>Una unidad tal como la reporta el GPS.</p>
<p>Los nombres de campo son los de Wialon: <code>nm</code> es el nombre, y <code>pos</code> trae la
posición con <code>y</code> = latitud y <code>x</code> = longitud, al revés de lo habitual.</p>
</dd>
<dt><a href="#esquemaUnidadTablero">esquemaUnidadTablero</a></dt>
<dd><p>Una unidad tal como la conoce IMA, con su telemetría.</p>
</dd>
<dt><a href="#SIN_DIRECCION">SIN_DIRECCION</a> : <code>Array.&lt;string&gt;</code></dt>
<dd><p>Textos con los que el GPS dice &quot;no pude resolver la calle&quot;.</p>
<p>Vienen en el campo de la dirección como si fueran una, así que hay que
reconocerlos: si no, la pantalla enseña <code>Unknown address</code> en las once unidades
en lugar de las coordenadas, que sí sirven para localizar el camión.</p>
</dd>
<dt><a href="#ESTATUS_TODOS">ESTATUS_TODOS</a> : <code>string</code></dt>
<dd><p>Opción del filtro que no descarta nada.</p>
</dd>
<dt><a href="#ESTATUS_SIN_VIAJE">ESTATUS_SIN_VIAJE</a> : <code>string</code></dt>
<dd><p>Opción del filtro para las unidades sin viaje asignado.</p>
<p>No es un estatus de la base: es la ausencia de viaje, y por eso se resuelve
aparte en vez de comparar contra la columna.</p>
</dd>
<dt><a href="#ESTATUS_TABLERO">ESTATUS_TABLERO</a> : <code>Array.&lt;string&gt;</code></dt>
<dd><p>Los estatus por los que se puede filtrar el tablero, en el orden del ciclo.</p>
</dd>
<dt><a href="#ESPERA_BUSQUEDA_MS">ESPERA_BUSQUEDA_MS</a> : <code>number</code></dt>
<dd><p>Cuánto se espera antes de buscar una dirección mientras se escribe.</p>
<p>Nominatim pide no más de una petición por segundo por cliente; medio segundo
de espera basta para no dispararle una por tecla.</p>
</dd>
<dt><a href="#puntoDesdeMapa">puntoDesdeMapa</a> ⇒ <code><a href="#PuntoRuta">PuntoRuta</a></code></dt>
<dd><p>Convierte un clic en el mapa en un punto de ruta.</p>
</dd>
<dt><a href="#puntoDesdeUnidad">puntoDesdeUnidad</a> ⇒ <code><a href="#PuntoRuta">PuntoRuta</a></code></dt>
<dd><p>Convierte una unidad de la flota en un punto de ruta.</p>
</dd>
<dt><a href="#METROS_POR_MILLA">METROS_POR_MILLA</a> : <code>number</code></dt>
<dd><p>Cuántos metros tiene una milla.</p>
<p>Las tarifas de IMA se cotizan por milla aunque el servicio de rutas conteste
en metros, así que la conversión aparece en cada pantalla que calcula un
precio.</p>
</dd>
<dt><a href="#llaveViajeUpcoming">llaveViajeUpcoming</a> ⇒ <code>Array</code></dt>
<dd><p>Llave de caché del detalle de un viaje próximo.</p>
</dd>
<dt><a href="#llaveResumenViaje">llaveResumenViaje</a> ⇒ <code>Array</code></dt>
<dd><p>Llave de caché del resumen de un viaje.</p>
</dd>
<dt><a href="#llaveViajes">llaveViajes</a> ⇒ <code>Array</code></dt>
<dd><p>Llave de caché de una página de la lista de viajes.</p>
</dd>
<dt><a href="#PREFIJO_ID_NUEVO">PREFIJO_ID_NUEVO</a> : <code>string</code></dt>
<dd><p>Prefijo que llevan las etapas y paradas creadas en el navegador.</p>
<p>La API asigna el id real al guardar, así que estos ids provisionales deben
viajar como <code>null</code>: si se mandan tal cual, el backend intenta actualizar una
fila inexistente en vez de insertarla.</p>
</dd>
<dt><a href="#esNuevo">esNuevo</a> ⇒ <code>boolean</code></dt>
<dd><p>Indica si un id es provisional, de algo que todavía no existe en la base.</p>
</dd>
<dt><a href="#idParaGuardar">idParaGuardar</a> ⇒ <code>*</code></dt>
<dd><p>El id que debe viajar a la API: el real, o <code>null</code> si es provisional.</p>
</dd>
<dt><a href="#normalizarTipoDocumento">normalizarTipoDocumento</a> ⇒ <code>string</code></dt>
<dd><p>Corrige el tipo de documento de los adjuntos guardados con la llave vieja.</p>
<p><code>BorderCrossingFormNew2</code> guardó durante un tiempo <code>orden_de_retiro</code> en lugar
de <code>orden_retiro</code>. Los documentos ya subidos con la llave vieja siguen en la
base; sin esta corrección desaparecen del detalle de la etapa.</p>
</dd>
<dt><a href="#nombreDeArchivo">nombreDeArchivo</a> ⇒ <code>string</code></dt>
<dd><p>El nombre del archivo dentro de una ruta del servidor.</p>
<p>Las rutas llegan con separadores de Windows o de Unix según cómo se subió el
archivo, así que se cortan por los dos.</p>
</dd>
<dt><a href="#TIPO_ETAPA_POR_OMISION">TIPO_ETAPA_POR_OMISION</a> : <code>string</code></dt>
<dd><p>El tipo de etapa por omisión cuando la API no lo dice.</p>
</dd>
<dt><a href="#PESTANAS_VIAJES">PESTANAS_VIAJES</a> : <code>Array.&lt;{id: number, etiqueta: string, permiso: string}&gt;</code></dt>
<dd><p>Las pestañas del administrador de viajes.</p>
<p>El <code>id</code> es el <code>tabValue</code> que espera la API, no la posición en pantalla: la
programación es la primera que se ve pero la última que se agregó, de ahí que
su id sea el 4.</p>
<p>Cada pestaña se muestra solo si la persona tiene su permiso.</p>
</dd>
<dt><a href="#PESTANA_PROGRAMACION">PESTANA_PROGRAMACION</a> : <code>number</code></dt>
<dd><p>El id de la pestaña de programación, que no lista viajes sino programaciones.</p>
</dd>
<dt><a href="#PESTANA_PROXIMOS">PESTANA_PROXIMOS</a> : <code>number</code></dt>
<dd><p>El id de la pestaña de próximos, cuya edición va a otra pantalla.</p>
</dd>
<dt><a href="#pestanasPermitidas">pestanasPermitidas</a> ⇒ <code>Array</code></dt>
<dd><p>Las pestañas que una persona puede ver, según sus permisos.</p>
</dd>
<dt><a href="#FILTROS_VIAJES">FILTROS_VIAJES</a> : <code>Array.&lt;string&gt;</code></dt>
<dd><p>Los filtros de la lista de viajes, con el nombre que espera la API.</p>
</dd>
<dt><a href="#DIRECCION_TODAS">DIRECCION_TODAS</a> : <code>string</code></dt>
<dd><p>El valor del filtro de dirección que significa &quot;no filtrar&quot;.</p>
</dd>
<dt><a href="#utilidadNeta">utilidadNeta</a> ⇒ <code>number</code></dt>
<dd><p>Lo que queda del viaje después de pagarle también al conductor.</p>
<p>La utilidad del backend no lo descuenta, así que este es el número que hay
que mirar para saber qué deja el viaje de verdad.</p>
</dd>
<dt><a href="#etapasDeResumen">etapasDeResumen</a> ⇒ <code>Array</code></dt>
<dd><p>Las etapas de un resumen, siempre como lista.</p>
</dd>
<dt><a href="#dieselDeResumen">dieselDeResumen</a> ⇒ <code>Array</code></dt>
<dd><p>Las cargas de diesel de un resumen.</p>
</dd>
<dt><a href="#gastosDeResumen">gastosDeResumen</a> ⇒ <code>Array</code></dt>
<dd><p>Los gastos de un resumen.</p>
</dd>
<dt><a href="#galonesDeResumen">galonesDeResumen</a> ⇒ <code>number</code></dt>
<dd><p>Los galones cargados en el viaje.</p>
</dd>
<dt><a href="#ESTADO_POR_OMISION">ESTADO_POR_OMISION</a> : <code>string</code></dt>
<dd><p>El estado que se asume cuando el viaje no trae ninguno.</p>
</dd>
<dt><a href="#colorEstadoViaje">colorEstadoViaje</a> ⇒ <code>string</code></dt>
<dd><p>El color con el que se marca el estado de un viaje.</p>
</dd>
<dt><a href="#etiquetaTipoEtapa">etiquetaTipoEtapa</a> ⇒ <code>string</code></dt>
<dd><p>El nombre de un tipo de etapa, tal como se lee en pantalla.</p>
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
<dt><a href="#llaveUnidades">llaveUnidades</a> ⇒ <code>Array</code></dt>
<dd><p>Llave de caché del expediente de un tipo de unidad.</p>
</dd>
<dt><a href="#useGuardarUnidad">useGuardarUnidad</a> ⇒ <code>object</code></dt>
<dd><p>Guarda una unidad.</p>
</dd>
<dt><a href="#useEliminarUnidad">useEliminarUnidad</a> ⇒ <code>object</code></dt>
<dd><p>Elimina una unidad.</p>
</dd>
<dt><a href="#useDarDeBaja">useDarDeBaja</a> ⇒ <code>object</code></dt>
<dd><p>Da de baja a un conductor.</p>
</dd>
<dt><a href="#useCrearRequisito">useCrearRequisito</a> ⇒ <code>object</code></dt>
<dd><p>Crea un requisito del expediente.</p>
</dd>
<dt><a href="#useEliminarRequisito">useEliminarRequisito</a> ⇒ <code>object</code></dt>
<dd><p>Elimina un requisito del expediente.</p>
</dd>
<dt><a href="#useCambiarVisibilidadColumna">useCambiarVisibilidadColumna</a> ⇒ <code>object</code></dt>
<dd><p>Muestra u oculta una columna.</p>
</dd>
<dt><a href="#DIAS_AVISO_VENCIMIENTO">DIAS_AVISO_VENCIMIENTO</a> : <code>number</code></dt>
<dd><p>Con cuántos días de antelación se avisa de un vencimiento.</p>
</dd>
<dt><a href="#colorCategoria">colorCategoria</a> ⇒ <code>string</code></dt>
<dd><p>El color con el que se subraya una categoría de requisitos.</p>
</dd>
<dt><a href="#esquemaRequisito">esquemaRequisito</a></dt>
<dd><p>Un requisito del expediente: qué documento se le pide a una unidad.</p>
<p><code>oculto_en_tabla</code> solo existe en camiones y conductores. En cajas la columna
no está en la base, así que llega como ausente y se trata como visible.</p>
</dd>
<dt><a href="#esquemaDocumento">esquemaDocumento</a></dt>
<dd><p>Un documento subido contra un requisito.</p>
</dd>
<dt><a href="#esFechaCero">esFechaCero</a> ⇒ <code>boolean</code></dt>
<dd><p>Indica si una fecha es la &quot;fecha cero&quot; de MySQL.</p>
<p><code>0000-00-00</code> significa <strong>sin fecha</strong>, no una fecha antigua. Hay 158
documentos de conductores guardados así, y <code>new Date(&quot;0000-00-00&quot;)</code> no es una
fecha válida: la resta daba <code>NaN</code>, ninguna comparación se cumplía y los 158
se pintaban en verde con la leyenda &quot;Vigente hasta 0000-00-00&quot;.</p>
</dd>
<dt><a href="#categoriasDe">categoriasDe</a> ⇒ <code>Array.&lt;string&gt;</code></dt>
<dd><p>Las categorías presentes en un expediente, sin repetir y en orden de aparición.</p>
</dd>
<dt><a href="#requisitosDeCategoria">requisitosDeCategoria</a> ⇒ <code>Array</code></dt>
<dd><p>Los requisitos de una categoría.</p>
</dd>
<dt><a href="#CATALOGO_UNIDAD">CATALOGO_UNIDAD</a> : <code>Object.&lt;string, DescriptorUnidad&gt;</code></dt>
<dd><p>Los descriptores de los tres tipos, por su clave.</p>
</dd>
<dt><a href="#estadoConductor">estadoConductor</a> ⇒ <code>string</code></dt>
<dd><p>El estado de un conductor, tratando el ausente como activo.</p>
<p>La columna se agregó después de dar de alta a la plantilla, así que quien no
la tiene es porque nunca se le dio de baja.</p>
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
<dt><a href="#money">money</a> ⇒ <code>string</code></dt>
<dd><p>Un importe en dólares.</p>
</dd>
<dt><a href="#moneyMXN">moneyMXN</a> ⇒ <code>string</code></dt>
<dd><p>Un importe en pesos.</p>
<p>Va en <code>es-MX</code> a propósito, no en <code>en-US</code> como el de dólares: es la cifra que
se compara contra facturas mexicanas.</p>
</dd>
<dt><a href="#COLOR_PUNTO_1">COLOR_PUNTO_1</a> : <code>string</code></dt>
<dd><p>Color del primer punto de la ruta, el que marca la unidad de partida.</p>
</dd>
<dt><a href="#COLOR_PUNTO_2">COLOR_PUNTO_2</a> : <code>string</code></dt>
<dd><p>Color del segundo punto de la ruta, el destino.</p>
</dd>
<dt><a href="#AJUSTES_MODO">AJUSTES_MODO</a> : <code>Object.&lt;string, object&gt;</code></dt>
<dd><p>Lo que cambia entre los dos modos de edición.</p>
</dd>
<dt><a href="#DOCUMENTOS_SIN_VENCIMIENTO">DOCUMENTOS_SIN_VENCIMIENTO</a> : <code>Array.&lt;string&gt;</code></dt>
<dd><p>Documentos que no vencen, así que su modal no pide fecha.</p>
</dd>
<dt><a href="#pideVencimiento">pideVencimiento</a> ⇒ <code>boolean</code></dt>
<dd><p>Indica si un tipo de documento tiene fecha de vencimiento.</p>
</dd>
<dt><a href="#ESTADOS_FACTURABLES">ESTADOS_FACTURABLES</a> : <code>Array.&lt;string&gt;</code></dt>
<dd><p>Estados de viaje en los que se puede generar una factura.</p>
</dd>
<dt><a href="#admiteFacturas">admiteFacturas</a> ⇒ <code>boolean</code></dt>
<dd><p>Indica si un viaje admite que se le generen facturas.</p>
</dd>
<dt><a href="#estadoPorCi">estadoPorCi</a> ⇒ <code>string</code></dt>
<dd><p>El estado que le toca a una etapa de cruce según tenga número de CI.</p>
<p>Una etapa de cruce arranca &quot;In Coming&quot; y pasa a &quot;In Transit&quot; en cuanto se le
captura el CI: es lo que marca que el cruce ya se hizo.</p>
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
<p>Todo texto pasa antes por <code>limpiarProfundo</code>, que le quita los caracteres
invisibles y de control y lo normaliza. Se hace aquí, en el único punto por el
que salen las 232 llamadas, para que ninguna pantalla tenga que acordarse.
<strong>No recorta el largo</strong>: el límite depende de la columna, así que lo pone
quien conoce el campo, no esta función; truncar aquí perdería datos en
silencio, que es justo lo que se quiere evitar.</p>
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
<dt><a href="#crearQueryClient">crearQueryClient([opciones])</a> ⇒ <code>object</code></dt>
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
<dt><a href="#moneda">moneda(valor, [codigo], [locale])</a> ⇒ <code>string</code></dt>
<dd><p>Formatea una cantidad como dinero.</p>
<p>Un valor ausente o ilegible se muestra como cero, no como <code>NaN</code>: en una
columna de importes, un cero se entiende y un <code>NaN</code> asusta.</p>
</dd>
<dt><a href="#fechaHora">fechaHora(valor, [locale])</a> ⇒ <code>string</code></dt>
<dd><p>Formatea una fecha con su hora.</p>
</dd>
<dt><a href="#soloFecha">soloFecha(valor, [locale])</a> ⇒ <code>string</code></dt>
<dd><p>Formatea una fecha sin hora.</p>
</dd>
<dt><a href="#decimales">decimales(valor, [cuantos])</a> ⇒ <code>string</code></dt>
<dd><p>Formatea una cantidad con decimales fijos.</p>
</dd>
<dt><a href="#exportarElementoAPdf">exportarElementoAPdf(parametros)</a> ⇒ <code>Promise.&lt;void&gt;</code></dt>
<dd><p>Convierte un trozo de la pantalla en un PDF y lo abre en una pestaña nueva.</p>
<p>Es una foto del DOM, no un documento generado: sirve cuando lo que se quiere
imprimir es exactamente lo que se ve, con su maquetación.</p>
<p>Los elementos marcados con <a href="#CLASE_NO_IMPRIMIR">CLASE_NO_IMPRIMIR</a> se ocultan y <strong>siempre</strong>
se vuelven a mostrar, incluso si la captura falla. Sin eso, un error dejaba
los botones ocultos hasta recargar la página.</p>
</dd>
<dt><a href="#pesoLegible">pesoLegible(bytes)</a> ⇒ <code>string</code></dt>
<dd><p>Convierte bytes a un texto legible.</p>
</dd>
<dt><a href="#primerosBytes">primerosBytes(archivo, [cuantos])</a> ⇒ <code>Promise.&lt;Uint8Array&gt;</code></dt>
<dd><p>Lee los primeros bytes de un archivo.</p>
</dd>
<dt><a href="#coincideFirma">coincideFirma(bytes, firma)</a> ⇒ <code>boolean</code></dt>
<dd><p>Indica si unos bytes empiezan con una firma dada.</p>
</dd>
<dt><a href="#validarArchivo">validarArchivo(archivo, [opciones])</a> ⇒ <code><a href="#ResultadoArchivo">Promise.&lt;ResultadoArchivo&gt;</a></code></dt>
<dd><p>Valida un archivo antes de subirlo: tamaño, extensión y contenido real.</p>
<p>Las tres comprobaciones son distintas y ninguna sobra. El tamaño evita el
fallo mudo de PHP. La extensión da un mensaje claro cuando alguien se
equivoca de archivo. La firma binaria es la única que resiste a alguien que
renombra a propósito.</p>
</dd>
<dt><a href="#validarArchivos">validarArchivos(archivos, [opciones])</a> ⇒ <code>Promise.&lt;{aceptados: Array.&lt;File&gt;, rechazados: Array.&lt;{archivo: File, motivo: string}&gt;}&gt;</code></dt>
<dd><p>Valida varios archivos y separa los que pasan de los que no.</p>
<p>Los modales de inspecciones y reparaciones aceptan selección múltiple; que un
archivo malo tire los demás sería peor que avisar de cuál falló.</p>
</dd>
<dt><a href="#archivosDelEvento">archivosDelEvento(evento, [opciones])</a> ⇒ <code>Promise.&lt;Array.&lt;File&gt;&gt;</code></dt>
<dd><p>Toma los archivos de un <code>&lt;input type=&quot;file&quot;&gt;</code>, los valida y avisa de los malos.</p>
<p>Existe porque las 16 subidas de la app hacen hoy lo mismo —<code>e.target.files</code>
directo al estado— y ninguna comprueba nada. Concentrarlo aquí evita repetir
la validación en cada pantalla y, sobre todo, evita olvidarla en la siguiente.</p>
<p>Limpia el valor del input al terminar: sin eso, volver a elegir el mismo
archivo después de un rechazo no dispara <code>change</code> y parece que la app se colgó.</p>
</dd>
<dt><a href="#archivoDelEvento">archivoDelEvento(evento, [opciones])</a> ⇒ <code>Promise.&lt;(File|null)&gt;</code></dt>
<dd><p>Igual que <a href="#archivosDelEvento">archivosDelEvento</a>, para los inputs de un solo archivo.</p>
</dd>
<dt><a href="#limpiarTexto">limpiarTexto(valor, [largoMaximo])</a> ⇒ <code>string</code></dt>
<dd><p>Limpia un texto que va a viajar a la API.</p>
<p>Lo que hace y lo que no:</p>
<ul>
<li><strong>Quita caracteres de control y de ancho cero</strong>, por lo dicho arriba.</li>
<li><strong>Normaliza a NFC.</strong> Sin esto, «José» escrito de dos formas distintas son
dos cadenas distintas para la base.</li>
<li><strong>Recorta espacios de los extremos</strong> y colapsa los saltos de línea sobrantes.</li>
<li><strong>No escapa comillas ni palabras de SQL.</strong> Escapar aquí no protege nada \u2014la
API no autentica, cualquiera puede saltarse el navegador con un <code>curl</code>\u2014 y sí
rompe datos legítimos: apellidos como O&#39;Brien, o una nota que mencione
&quot;select&quot;. La inyección se cierra con sentencias preparadas en el backend.</li>
</ul>
</dd>
<dt><a href="#tieneInvisibles">tieneInvisibles(valor)</a> ⇒ <code>boolean</code></dt>
<dd><p>Indica si un texto trae caracteres que no se ven.</p>
<p>Sirve para avisarle a la persona que lo que pegó traía basura invisible, en
vez de limpiárselo callando y que después no entienda por qué cambió su texto.</p>
</dd>
<dt><a href="#limpiarProfundo">limpiarProfundo(valor, [largoMaximo])</a> ⇒ <code>*</code></dt>
<dd><p>Limpia todos los valores de texto de un objeto, sin tocar el resto.</p>
<p>Se aplica en la capa de API, así que ninguna pantalla tiene que acordarse.
Respeta <code>File</code>, <code>Blob</code>, números, booleanos y <code>null</code>, que la capa de API ya
sabe serializar, y baja por objetos y arreglos anidados.</p>
</dd>
<dt><a href="#esUrlSegura">esUrlSegura(url)</a> ⇒ <code>boolean</code></dt>
<dd><p>Indica si una URL se puede abrir sin riesgo.</p>
<p>Importa más de lo normal en esta app: la API viaja por HTTP en claro, así que
un intermediario en la red puede cambiar la ruta de un documento por un
<code>javascript:...</code>. En un <code>&lt;a href&gt;</code> de Electron eso se ejecuta con los permisos
del renderer. Toda URL que venga de la API pasa por aquí antes de llegar al DOM.</p>
<p>Las rutas relativas se aceptan: no llevan protocolo, así que no pueden
ejecutar nada, y son la forma normal de enlazar dentro de la propia app. Las
que empiezan con <code>//</code> no, porque heredan el protocolo de la página.</p>
</dd>
<dt><a href="#pedir">pedir(peticion)</a> ⇒ <code>Promise.&lt;*&gt;</code></dt>
<dd><p>Encola un diálogo y espera a que la persona responda.</p>
<p>Cierra el indicador de carga si lo hay: es el comportamiento que tenía
sweetalert2 —un diálogo nuevo reemplazaba al anterior— y del que dependen las
pantallas que abren «Guardando…» y terminan mostrando el resultado sin cerrar
el indicador a mano.</p>
</dd>
<dt><a href="#responder">responder(id, valor)</a> ⇒ <code>void</code></dt>
<dd><p>Responde al diálogo indicado y lo saca de la cola.</p>
</dd>
<dt><a href="#abrirCargando">abrirCargando(titulo)</a> ⇒ <code>void</code></dt>
<dd><p>Abre el indicador de carga que bloquea la pantalla.</p>
</dd>
<dt><a href="#cerrarAbierto">cerrarAbierto()</a> ⇒ <code>void</code></dt>
<dd><p>Cierra el indicador de carga y el diálogo que esté abierto.</p>
</dd>
<dt><a href="#anunciar">anunciar(aviso, [duracion])</a> ⇒ <code>Promise</code></dt>
<dd><p>Encola un aviso flotante, de los que se van solos.</p>
<p>El temporizador vive aquí y no en el componente para que el aviso se retire
—y su promesa se resuelva— aunque nadie lo esté pintando.</p>
</dd>
<dt><a href="#retirar">retirar(id)</a> ⇒ <code>void</code></dt>
<dd><p>Retira un aviso flotante.</p>
</dd>
<dt><a href="#reiniciar">reiniciar()</a> ⇒ <code>void</code></dt>
<dd><p>Vacía la cola sin resolver nada. Existe para aislar las pruebas entre sí.</p>
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
<dt><a href="#crearCompania">crearCompania(nombre)</a> ⇒ <code>Promise.&lt;object&gt;</code></dt>
<dd><p>Da de alta una compañía desde el propio selector.</p>
<p>Quien está capturando un viaje descubre que la compañía no está dada de alta
justo cuando la necesita; poder crearla ahí evita abandonar el formulario a
medias.</p>
</dd>
<dt><a href="#useCrearCompania">useCrearCompania()</a> ⇒ <code>object</code></dt>
<dd><p>Da de alta una compañía y refresca el catálogo.</p>
</dd>
<dt><a href="#obtenerSiguienteNumero">obtenerSiguienteNumero(parametros)</a> ⇒ <code>Promise.&lt;(number|null)&gt;</code></dt>
<dd><p>Pide el siguiente número de viaje libre para un país y año.</p>
<p>Los parámetros se llaman <code>country_code</code> y <code>trip_year</code>, no <code>pais</code> ni <code>anio</code>: la
API rechaza la petición si se mandan con otro nombre.</p>
</dd>
<dt><a href="#obtenerViajesTransnacionales">obtenerViajesTransnacionales(parametros)</a> ⇒ <code>Promise.&lt;Array&gt;</code></dt>
<dd><p>Trae los viajes transnacionales de un país, para enlazar un cruce.</p>
</dd>
<dt><a href="#eliminarProgramacion">eliminarProgramacion(programacionId)</a> ⇒ <code>Promise.&lt;object&gt;</code></dt>
<dd><p>Elimina una programación aprobada tras convertirla en viaje.</p>
</dd>
<dt><a href="#useSiguienteNumero">useSiguienteNumero(pais, anio)</a> ⇒ <code>object</code></dt>
<dd><p>Siguiente número de viaje. No consulta hasta tener país y año.</p>
</dd>
<dt><a href="#useViajesTransnacionales">useViajesTransnacionales(pais, anio)</a> ⇒ <code>object</code></dt>
<dd><p>Viajes transnacionales de un país. No consulta hasta tener país y año.</p>
</dd>
<dt><a href="#useEliminarProgramacion">useEliminarProgramacion()</a> ⇒ <code>object</code></dt>
<dd><p>Elimina una programación e invalida lo que dependa de ella.</p>
</dd>
<dt><a href="#resolverIdDeCatalogo">resolverIdDeCatalogo(catalogo, campos)</a> ⇒ <code>*</code></dt>
<dd><p>Busca un id en un catálogo, primero por id y luego por nombre.</p>
<p>Una fila de programación no siempre trae el id de la compañía o del almacén:
a veces solo llegó el nombre escrito. Buscar por las dos vías es lo que evita
que el formulario se abra con el campo vacío y la persona lo vuelva a teclear.</p>
</dd>
<dt><a href="#datosInicialesDesdePrograma">datosInicialesDesdePrograma(programacion)</a> ⇒ <code>object</code> | <code>undefined</code></dt>
<dd><p>Los datos del viaje precargados desde una programación aprobada.</p>
<p>Una caja externa y una propia son excluyentes: se rellena la que la
programación indique, y la otra queda vacía para que no viajen las dos.</p>
</dd>
<dt><a href="#etapaInicialDesdePrograma">etapaInicialDesdePrograma(programacion, catalogos)</a> ⇒ <code>object</code> | <code>undefined</code></dt>
<dd><p>La primera etapa precargada desde una programación aprobada.</p>
</dd>
<dt><a href="#anioDosDigitos">anioDosDigitos([fecha])</a> ⇒ <code>string</code></dt>
<dd><p>El año a dos dígitos, que es el formato que usa la API.</p>
</dd>
<dt><a href="#agruparPorCruce">agruparPorCruce(viajes)</a> ⇒ <code>Array.&lt;{numero: string, viajes: Array}&gt;</code></dt>
<dd><p>Agrupa los viajes transnacionales por su número de cruce.</p>
<p>Sirve para ver las dos mitades juntas: un cruce completo tiene una de cada
país, y uno a medias tiene solo una.</p>
</dd>
<dt><a href="#normalizarViajesTransnacionales">normalizarViajesTransnacionales(filas)</a> ⇒ <code>Object</code></dt>
<dd><p>Valida la lista de viajes transnacionales descartando lo que no cumple.</p>
</dd>
<dt><a href="#etiquetaViajeTransnacional">etiquetaViajeTransnacional(viaje)</a> ⇒ <code>string</code></dt>
<dd><p>Cómo se lista un viaje al vincular un cruce.</p>
<p>El formato completo —<code>197-US-63T2-26</code>— solo se puede armar si el viaje tiene
número de cruce; sin él se muestra el número a secas, que es lo único que lo
identifica.</p>
</dd>
<dt><a href="#siguienteMovimiento">siguienteMovimiento(viaje)</a> ⇒ <code>string</code></dt>
<dd><p>El movimiento que le toca a la continuación de un viaje.</p>
<p>Cada mitad de un cruce lleva su número de movimiento; la que se está creando
continúa la anterior. Si el viaje elegido no trae movimiento, se deja vacío
para que la persona lo escriba.</p>
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
<dt><a href="#listaDe">listaDe(cuerpo, campo)</a> ⇒ <code>Array</code></dt>
<dd><p>Saca la lista de una respuesta de <code>formularios.php</code>.</p>
</dd>
<dt><a href="#obtenerResumen">obtenerResumen(parametros)</a> ⇒ <code>Promise.&lt;Array&gt;</code></dt>
<dd><p>El resumen por viaje: cuánto lleva cada uno y de cuándo es lo último.</p>
</dd>
<dt><a href="#obtenerRegistros">obtenerRegistros(parametros)</a> ⇒ <code>Promise.&lt;Array&gt;</code></dt>
<dd><p>Los registros de un viaje.</p>
</dd>
<dt><a href="#obtenerRegistro">obtenerRegistro(parametros)</a> ⇒ <code>Promise.&lt;object&gt;</code></dt>
<dd><p>Un registro suelto, el que se va a editar.</p>
<p>La API lo devuelve dentro de un arreglo de un solo elemento, en un campo
llamado <code>row</code>.</p>
</dd>
<dt><a href="#obtenerTickets">obtenerTickets(parametros)</a> ⇒ <code>Promise.&lt;Array&gt;</code></dt>
<dd><p>Los tickets escaneados de un registro.</p>
<p>Es la única operación del endpoint que devuelve la lista en <code>data</code>.</p>
</dd>
<dt><a href="#guardarRegistro">guardarRegistro(parametros)</a> ⇒ <code>Promise.&lt;object&gt;</code></dt>
<dd><p>Guarda los cambios de un registro.</p>
</dd>
<dt><a href="#eliminarRegistro">eliminarRegistro(parametros)</a> ⇒ <code>Promise.&lt;object&gt;</code></dt>
<dd><p>Elimina un registro.</p>
</dd>
<dt><a href="#crearRegistroManual">crearRegistroManual(parametros)</a> ⇒ <code>Promise.&lt;object&gt;</code></dt>
<dd><p>Da de alta una carga de diesel capturada a mano.</p>
<p>Solo el diesel lo admite: los gastos se capturan desde la aplicación móvil.</p>
</dd>
<dt><a href="#useResumen">useResumen(tipo)</a> ⇒ <code>object</code></dt>
<dd><p>El resumen por viaje de un tipo.</p>
</dd>
<dt><a href="#useRegistros">useRegistros(tipo, tripId)</a> ⇒ <code>object</code></dt>
<dd><p>Los registros de un viaje. No consulta hasta tener el viaje.</p>
</dd>
<dt><a href="#useRegistro">useRegistro(tipo, id, tripId)</a> ⇒ <code>object</code></dt>
<dd><p>Un registro suelto. No consulta hasta tener el id.</p>
</dd>
<dt><a href="#useTickets">useTickets(tipo, id, tripId)</a> ⇒ <code>object</code></dt>
<dd><p>Los tickets de un registro. No consulta hasta tener el id.</p>
</dd>
<dt><a href="#useMutacionRegistro">useMutacionRegistro(tipo, accion)</a> ⇒ <code>object</code></dt>
<dd><p>Crea la mutación de un tipo, refrescando todo lo suyo al terminar.</p>
</dd>
<dt><a href="#obtenerGastos">obtenerGastos([opciones])</a> ⇒ <code>Promise.&lt;Array&gt;</code></dt>
<dd><p>Todos los gastos generales, con sus renglones y sus tickets.</p>
<p>La API los devuelve completos de una vez —1 638 al escribir esto—, así que
filtrar y ordenar se hace en el navegador y no hay ida y vuelta por página.</p>
</dd>
<dt><a href="#obtenerGasto">obtenerGasto(parametros)</a> ⇒ <code>Promise.&lt;object&gt;</code></dt>
<dd><p>Un gasto con todo su detalle, el que se va a editar.</p>
</dd>
<dt><a href="#crearGasto">crearGasto(gasto)</a> ⇒ <code>Promise.&lt;object&gt;</code></dt>
<dd><p>Da de alta un gasto con sus renglones y sus archivos.</p>
</dd>
<dt><a href="#actualizarGasto">actualizarGasto(gasto)</a> ⇒ <code>Promise.&lt;object&gt;</code></dt>
<dd><p>Guarda los cambios de un gasto.</p>
</dd>
<dt><a href="#useGastos">useGastos()</a> ⇒ <code>object</code></dt>
<dd><p>Todos los gastos generales.</p>
</dd>
<dt><a href="#useGasto">useGasto(idGasto)</a> ⇒ <code>object</code></dt>
<dd><p>Un gasto suelto. No consulta hasta tener el id.</p>
</dd>
<dt><a href="#useCatalogoGastos">useCatalogoGastos(op)</a> ⇒ <code>object</code></dt>
<dd><p>Uno de los catálogos del formulario.</p>
<p>Es un catálogo: se cachea <a href="#FRESCURA_CATALOGO_MS">FRESCURA_CATALOGO_MS</a> y se comparte, así que
el modal de alta y la barra de filtros lo piden una sola vez entre los dos.</p>
</dd>
<dt><a href="#useCrearGasto">useCrearGasto()</a> ⇒ <code>object</code></dt>
<dd><p>Da de alta un gasto y refresca la lista.</p>
</dd>
<dt><a href="#useActualizarGasto">useActualizarGasto()</a> ⇒ <code>object</code></dt>
<dd><p>Guarda un gasto y refresca la lista.</p>
</dd>
<dt><a href="#algunRenglon">algunRenglon(gasto, cumple)</a> ⇒ <code>boolean</code></dt>
<dd><p>Indica si alguno de los renglones de un gasto cumple algo.</p>
<p>Un gasto con varios renglones entra en el filtro si <strong>cualquiera</strong> de ellos
coincide: se factura junto pero puede mezclar categorías.</p>
</dd>
<dt><a href="#filtrarGastos">filtrarGastos([gastos], [filtros])</a> ⇒ <code>Array</code></dt>
<dd><p>Filtra los gastos con todo lo que hay puesto en la barra.</p>
<p>El buscador mira el folio, el país y la moneda; la descripción se busca
aparte y <strong>sin acentos</strong>, porque se captura a mano y la mitad de las veces
llega sin ellos.</p>
</dd>
<dt><a href="#categoriasDeTipo">categoriasDeTipo([categorias], [tipo])</a> ⇒ <code>Array.&lt;string&gt;</code></dt>
<dd><p>Las categorías que cuelgan de un tipo de gasto.</p>
<p>Sin tipo elegido se ofrecen todas; con uno, solo las suyas. Es lo que evita
que alguien filtre por una combinación que no existe.</p>
</dd>
<dt><a href="#subcategoriasDeCategoria">subcategoriasDeCategoria([subcategorias], [categoria])</a> ⇒ <code>Array.&lt;string&gt;</code></dt>
<dd><p>Las subcategorías que cuelgan de una categoría.</p>
<p>Sin categoría elegida no se ofrece ninguna: el selector se esconde en vez de
enseñar las 41 sueltas.</p>
</dd>
<dt><a href="#totalesDe">totalesDe([gastos], aPesos)</a> ⇒ <code>Object</code></dt>
<dd><p>Lo que suman los gastos visibles, en dólares y en pesos.</p>
<p><code>sinConversion</code> cuenta los que no se pudieron pasar a pesos porque no había
tipo de cambio: sin ese dato, el total en pesos estaría incompleto y hay que
decirlo en vez de enseñar una cifra que engaña.</p>
</dd>
<dt><a href="#filtrarResumen">filtrarResumen([filas], filtros)</a> ⇒ <code>Array</code></dt>
<dd><p>Filtra el resumen por país y por lo escrito en el buscador.</p>
<p>El buscador mira el viaje y el conductor, que es como se busca de verdad:
&quot;el gasto de aquel viaje&quot; o &quot;lo que cargó fulano&quot;.</p>
</dd>
<dt><a href="#pendientesDe">pendientesDe(fila)</a> ⇒ <code>Object</code></dt>
<dd><p>Cuántos registros pendientes de conciliar tiene un viaje.</p>
<p>Solo el diesel los tiene: son las cargas que aún no cuadran con el estado de
cuenta ni con FleetOne.</p>
</dd>
<dt><a href="#normalizarLista">normalizarLista(filas, esquema)</a> ⇒ <code>Object</code></dt>
<dd><p>Valida una lista descartando lo que no cumple.</p>
</dd>
<dt><a href="#descriptorDe">descriptorDe(tipo)</a> ⇒ <code>object</code></dt>
<dd><p>El descriptor de un tipo de registro.</p>
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
<dt><a href="#obtenerCotizaciones">obtenerCotizaciones([opciones])</a> ⇒ <code>Promise.&lt;Array&gt;</code></dt>
<dd><p>El historial de cotizaciones guardadas.</p>
</dd>
<dt><a href="#guardarCotizacion">guardarCotizacion(cotizacion)</a> ⇒ <code>Promise.&lt;object&gt;</code></dt>
<dd><p>Guarda una cotización con su nombre.</p>
</dd>
<dt><a href="#eliminarCotizacion">eliminarCotizacion(id)</a> ⇒ <code>Promise.&lt;object&gt;</code></dt>
<dd><p>Elimina una cotización guardada.</p>
</dd>
<dt><a href="#useCotizaciones">useCotizaciones()</a> ⇒ <code>object</code></dt>
<dd><p>El historial de cotizaciones.</p>
</dd>
<dt><a href="#useGuardarCotizacion">useGuardarCotizacion()</a> ⇒ <code>object</code></dt>
<dd><p>Guarda una cotización y refresca el historial.</p>
</dd>
<dt><a href="#useEliminarCotizacion">useEliminarCotizacion()</a> ⇒ <code>object</code></dt>
<dd><p>Elimina una cotización y refresca el historial.</p>
</dd>
<dt><a href="#numeroONulo">numeroONulo(valor)</a> ⇒ <code>number</code> | <code>null</code></dt>
<dd><p>Convierte a número lo que la API manda como texto.</p>
</dd>
<dt><a href="#ubicacionDesdeApi">ubicacionDesdeApi(nombre, lat, lon)</a> ⇒ <code><a href="#Ubicacion">Ubicacion</a></code></dt>
<dd><p>Arma una ubicación a partir de las columnas planas que devuelve la base.</p>
</dd>
<dt><a href="#cotizacionDesdeApi">cotizacionDesdeApi(fila)</a> ⇒ <code>object</code></dt>
<dd><p>Convierte una cotización guardada al estado que maneja la pantalla.</p>
<p>La base la guarda plana —una columna por coordenada— y la pantalla trabaja
con ubicaciones.</p>
</dd>
<dt><a href="#cotizacionParaGuardar">cotizacionParaGuardar(cotizacion)</a> ⇒ <code>object</code></dt>
<dd><p>Los campos con los que se guarda una cotización.</p>
</dd>
<dt><a href="#recalcularTarifa">recalcularTarifa(actuales, campo, valor)</a> ⇒ <code>Object</code></dt>
<dd><p>Las tres cifras de una cotización, que se calculan unas de otras.</p>
<p><code>tarifa = rate × millas</code>. Al tocar una, se recalcula la que se pueda con las
otras dos: es lo que permite cotizar entrando por donde se tenga el dato —a
veces se sabe el precio total y se quiere saber a cuánto sale la milla, y a
veces al revés—.</p>
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
<dt><a href="#obtenerTableroProgramacion">obtenerTableroProgramacion([opciones])</a> ⇒ <code>Promise.&lt;object&gt;</code></dt>
<dd><p>Camiones, operadores y cajas con su disponibilidad.</p>
<p>Es lo que alimenta los selectores del modal: quién y qué está libre para
programarse, y dónde está cada camión.</p>
</dd>
<dt><a href="#obtenerProgramaciones">obtenerProgramaciones([opciones])</a> ⇒ <code>Promise.&lt;Array&gt;</code></dt>
<dd><p>Las programaciones guardadas, pendientes de convertirse en viaje.</p>
</dd>
<dt><a href="#guardarProgramacion">guardarProgramacion(parametros)</a> ⇒ <code>Promise.&lt;object&gt;</code></dt>
<dd><p>Guarda una programación, nueva o existente.</p>
</dd>
<dt><a href="#eliminarProgramacion">eliminarProgramacion(id)</a> ⇒ <code>Promise.&lt;object&gt;</code></dt>
<dd><p>Elimina una programación.</p>
</dd>
<dt><a href="#useTableroProgramacion">useTableroProgramacion([habilitada])</a> ⇒ <code>object</code></dt>
<dd><p>El tablero de disponibilidad. No consulta hasta que se necesita.</p>
</dd>
<dt><a href="#useProgramaciones">useProgramaciones([habilitada])</a> ⇒ <code>object</code></dt>
<dd><p>Las programaciones guardadas.</p>
</dd>
<dt><a href="#useGuardarProgramacion">useGuardarProgramacion()</a> ⇒ <code>object</code></dt>
<dd><p>Guarda una programación y refresca la lista y el tablero.</p>
</dd>
<dt><a href="#useEliminarProgramacion">useEliminarProgramacion()</a> ⇒ <code>object</code></dt>
<dd><p>Elimina una programación y refresca la lista y el tablero.</p>
</dd>
<dt><a href="#leerValorCaja">leerValorCaja([valor])</a> ⇒ <code>Object</code></dt>
<dd><p>Descompone el valor del selector en el id y de qué flota es.</p>
</dd>
<dt><a href="#formularioDesdePrograma">formularioDesdePrograma(programacion)</a> ⇒ <code>object</code></dt>
<dd><p>Convierte una programación guardada en el formulario que la edita.</p>
</dd>
<dt><a href="#programacionParaGuardar">programacionParaGuardar(formulario)</a> ⇒ <code>object</code></dt>
<dd><p>Los campos que se mandan al guardar una programación.</p>
<p>La caja viaja en uno u otro campo según de qué flota sea; el que no aplica va
vacío, no ausente, porque así es como se borra la asignación anterior.</p>
</dd>
<dt><a href="#validarProgramacion">validarProgramacion(formulario)</a> ⇒ <code>string</code> | <code>null</code></dt>
<dd><p>Comprueba que la programación tenga lo mínimo para guardarse.</p>
</dd>
<dt><a href="#posicionDeCamion">posicionDeCamion(camion)</a> ⇒ <code>Object</code> | <code>null</code></dt>
<dd><p>La posición de un camión, si el GPS la reportó.</p>
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
<dt><a href="#iniciarSesion">iniciarSesion(credenciales)</a> ⇒ <code>Promise.&lt;object&gt;</code></dt>
<dd><p>Comprueba unas credenciales contra el servidor.</p>
<p>La API responde <code>{status:&#39;error&#39;}</code> tanto si el usuario no existe como si la
contraseña está mal, y con el mismo mensaje. Es lo correcto: distinguirlos le
diría a quien prueba credenciales cuáles usuarios existen.</p>
</dd>
<dt><a href="#validarCredenciales">validarCredenciales([credenciales])</a> ⇒ <code>string</code> | <code>null</code></dt>
<dd><p>Comprueba que estén los dos campos antes de molestar al servidor.</p>
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
<dt><a href="#obtenerUnidadesGps">obtenerUnidadesGps([opciones])</a> ⇒ <code>Promise.&lt;Array&gt;</code></dt>
<dd><p>Posición de cada unidad, según el GPS.</p>
<p>El script ignora el campo <code>op</code>: contesta lo mismo con cualquier valor.</p>
</dd>
<dt><a href="#obtenerTablero">obtenerTablero([opciones])</a> ⇒ <code>Promise.&lt;Array&gt;</code></dt>
<dd><p>Telemetría de las unidades dadas de alta en IMA.</p>
</dd>
<dt><a href="#obtenerFlota">obtenerFlota([opciones])</a> ⇒ <code>Promise.&lt;Array&gt;</code></dt>
<dd><p>La flota completa: dónde está cada unidad y qué sabe IMA de ella.</p>
<p>El tablero se pide <strong>primero</strong> aunque no dependa del GPS: contesta en décimas
de segundo y el GPS tarda veinte veces más, así que lanzarlos juntos solo
conseguía que el rápido esperara detrás del lento.</p>
<p>Si el tablero falla, se dibujan las posiciones sin telemetría: un mapa con
camiones y sin galones sigue sirviendo; sin posiciones no hay pantalla.</p>
</dd>
<dt><a href="#obtenerParadasEtapa">obtenerParadasEtapa(parametros)</a> ⇒ <code>Promise.&lt;Array&gt;</code></dt>
<dd><p>Las paradas de una etapa, ya marcadas como completadas, en curso o pendientes.</p>
<p>Se piden a la lista de viajes en ruta filtrando por número de viaje, porque no
hay una operación que devuelva las paradas de una etapa sueltas.</p>
</dd>
<dt><a href="#guardarConfiguracionTanque">guardarConfiguracionTanque(parametros)</a> ⇒ <code>Promise.&lt;object&gt;</code></dt>
<dd><p>Guarda la configuración del tanque de una unidad.</p>
</dd>
<dt><a href="#useFlota">useFlota()</a> ⇒ <code>object</code></dt>
<dd><p>La flota, refrescándose sola cada <a href="#REFRESCO_FLOTA_MS">REFRESCO_FLOTA_MS</a>.</p>
<p>Sigue refrescando con la pestaña en segundo plano: el mapa es una pantalla de
vigilancia y quien la deja abierta en otro monitor espera verla al día.</p>
</dd>
<dt><a href="#useParadasEtapa">useParadasEtapa([unidad])</a> ⇒ <code>object</code></dt>
<dd><p>Las paradas de la etapa activa. No consulta hasta tener viaje y etapa.</p>
</dd>
<dt><a href="#useGuardarTanque">useGuardarTanque()</a> ⇒ <code>object</code></dt>
<dd><p>Guarda el tanque de una unidad y vuelve a pedir la flota.</p>
</dd>
<dt><a href="#buscarLugares">buscarLugares(parametros)</a> ⇒ <code>Promise.&lt;Array&gt;</code></dt>
<dd><p>Busca lugares por su nombre o dirección.</p>
<p>Con <code>conDetalles</code> el servicio devuelve además ciudad, estado y país por
separado, que es lo que permite enseñar un nombre corto en vez de la
dirección completa de cuarenta caracteres.</p>
</dd>
<dt><a href="#ubicarLugar">ubicarLugar(texto)</a> ⇒ <code>Promise.&lt;{lat: number, lon: number}&gt;</code></dt>
<dd><p>El primer lugar que coincide con lo escrito.</p>
<p>Es lo que se usa al calcular una ruta con ubicaciones que se escribieron pero
no se eligieron de la lista.</p>
</dd>
<dt><a href="#nombreCortoDeLugar">nombreCortoDeLugar(lugar)</a> ⇒ <code>string</code></dt>
<dd><p>El nombre corto de un lugar: ciudad, estado y país.</p>
<p>La dirección completa que devuelve el servicio no cabe en un campo y no dice
más de lo que hace falta para cotizar.</p>
</dd>
<dt><a href="#trazarRuta">trazarRuta(parametros)</a> ⇒ <code>Promise.&lt;{coordenadas: Array, resumen: object}&gt;</code></dt>
<dd><p>Traza la ruta por carretera entre dos puntos, con las paradas de en medio.</p>
<p>El servicio calcula la ruta pasando por todos los puntos en el orden en que
se le dan, así que las paradas van entre el origen y el destino: la ruta a
tres ciudades no es la suma de dos rutas sueltas.</p>
</dd>
<dt><a href="#useTrazarRuta">useTrazarRuta()</a> ⇒ <code>object</code></dt>
<dd><p>Traza una ruta entre dos puntos.</p>
</dd>
<dt><a href="#numerosEn">numerosEn(texto)</a> ⇒ <code>Array.&lt;string&gt;</code></dt>
<dd><p>Los números que aparecen en un texto.</p>
</dd>
<dt><a href="#escaparRegex">escaparRegex(texto)</a> ⇒ <code>string</code></dt>
<dd><p>Escapa lo que en una cadena tendría significado dentro de una expresión regular.</p>
<p>El nombre de una unidad puede traer puntos o guiones, y sin escapar cambiarían
lo que la expresión busca.</p>
</dd>
<dt><a href="#emparejarUnidad">emparejarUnidad(nombreGps, [unidadesTablero])</a> ⇒ <code>object</code> | <code>null</code></dt>
<dd><p>Busca en el tablero la unidad que corresponde a un GPS, por su nombre.</p>
<p>El GPS y la base no llaman igual a la misma unidad: Wialon dice <code>IMA 01</code> y la
base dice <code>1</code>. La regla es:</p>
<ol>
<li>Si los nombres coinciden enteros, es esa.</li>
<li>Si los dos nombres traen número, <strong>el primer número tiene que ser el mismo</strong>.
<code>IMA 01</code> es la unidad <code>1</code>, y <code>IMA 12 - Caja 5</code> no es la unidad <code>5</code> por mucho
que el 5 aparezca: un número que no cuadra descarta la fila, no se sigue
buscando por otro lado.</li>
<li>Solo si la fila del tablero no trae ningún número se prueba a buscar su
nombre como palabra suelta dentro del de Wialon.</li>
</ol>
<p>El paso 2 es más estricto que lo que había: antes bastaba con que el número de
la base apareciera en cualquier parte del nombre de Wialon, y eso le colgaba a
un camión la telemetría de otro.</p>
</dd>
<dt><a href="#esDireccionReal">esDireccionReal(texto)</a> ⇒ <code>boolean</code></dt>
<dd><p>Indica si lo que llegó es una dirección de verdad.</p>
</dd>
<dt><a href="#direccionDeUnidad">direccionDeUnidad(unidadGps)</a> ⇒ <code>string</code></dt>
<dd><p>La dirección que se muestra de una unidad.</p>
<p>El GPS no siempre resuelve la calle. Cuando no la trae —o cuando manda un
marcador de que no pudo—, es mejor enseñar las coordenadas que un texto
inútil: con ellas se puede buscar el punto a mano.</p>
</dd>
<dt><a href="#combinarFlota">combinarFlota([unidadesGps], [unidadesTablero])</a> ⇒ <code><a href="#UnidadFlota">Array.&lt;UnidadFlota&gt;</a></code></dt>
<dd><p>Junta lo que dice el GPS con lo que sabe IMA de cada unidad.</p>
<p>Manda el GPS: si una unidad no está en el tablero se muestra igual, sin
telemetría, porque en el mapa sigue siendo un camión moviéndose. Al revés no:
una unidad de la base sin GPS no tiene dónde dibujarse.</p>
</dd>
<dt><a href="#porcentajeTanque">porcentajeTanque(galones, capacidad)</a> ⇒ <code>number</code></dt>
<dd><p>Qué tan lleno está el tanque, en porcentaje.</p>
<p>Se acota a 100 porque en producción hay lecturas imposibles —una unidad con
850 galones en un tanque de 270— y sin acotar la barra se sale del cuadro y el
indicador circular se dibuja dando vueltas.</p>
</dd>
<dt><a href="#lecturaTanqueSospechosa">lecturaTanqueSospechosa(unidad)</a> ⇒ <code>boolean</code></dt>
<dd><p>Indica si la lectura del tanque es imposible.</p>
<p>Un tanque no puede tener más de lo que le cabe ni menos que nada. En
producción pasan las dos cosas: la unidad 5 reporta 850 galones en un tanque
de 270 y la 7 reporta −33. Conviene decirlo en vez de pintar una barra llena
o vacía como si el dato fuera bueno.</p>
</dd>
<dt><a href="#filtrarFlota">filtrarFlota([flota], [busqueda])</a> ⇒ <code>Array</code></dt>
<dd><p>Filtra la flota por nombre, como escribe la persona.</p>
</dd>
<dt><a href="#normalizarUnidadesGps">normalizarUnidadesGps(filas)</a> ⇒ <code>Object</code></dt>
<dd><p>Valida las unidades del GPS descartando lo que no cumple.</p>
<p>Una unidad sin posición no se puede dibujar, así que se descarta con aviso en
vez de reventar el mapa.</p>
</dd>
<dt><a href="#filtrarPorEstatus">filtrarPorEstatus([unidades], estatus)</a> ⇒ <code>Array</code></dt>
<dd><p>Filtra las unidades del tablero por el estatus de su viaje.</p>
</dd>
<dt><a href="#ordenarParadas">ordenarParadas([paradas])</a> ⇒ <code>Array</code></dt>
<dd><p>Ordena las paradas por el orden de la ruta.</p>
<p>La API las devuelve en el orden en que se guardaron, no en el que se recorren.</p>
</dd>
<dt><a href="#estadoDeParadas">estadoDeParadas([paradas], [paradaActual])</a> ⇒ <code>Array</code></dt>
<dd><p>Marca cada parada como completada, en curso o pendiente.</p>
<p>El tablero solo manda <strong>la próxima parada pendiente</strong> (<code>current_stop</code>), así que
el resto se deduce por posición: lo anterior ya se cubrió, lo posterior falta.</p>
<p>Cuando <code>current_stop</code> viene vacío significa que ya no queda ninguna pendiente y
todas cuentan como completadas. Ojo: eso también pasa si el nombre que manda el
tablero no coincide con ninguna parada de la etapa, y entonces se pintan todas
como hechas sin serlo.</p>
</dd>
<dt><a href="#avanceParadas">avanceParadas([paradas])</a> ⇒ <code>Object</code></dt>
<dd><p>Cuántas paradas se han cubierto.</p>
</dd>
<dt><a href="#tramoActivo">tramoActivo(unidad)</a> ⇒ <code>Object</code></dt>
<dd><p>El tramo que la unidad está recorriendo ahora mismo.</p>
<p>Mientras queden paradas, el tramo activo termina en la próxima; cuando ya no
queda ninguna, termina en el destino final de la etapa.</p>
</dd>
<dt><a href="#puntoDesdeBusqueda">puntoDesdeBusqueda(resultado, [largoMaximo])</a> ⇒ <code><a href="#PuntoRuta">PuntoRuta</a></code></dt>
<dd><p>Convierte un resultado de búsqueda en un punto de ruta.</p>
<p>Los nombres de Nominatim son direcciones completas que desbordan el panel, así
que se recortan.</p>
</dd>
<dt><a href="#coordenadasDeRuta">coordenadasDeRuta(ruta)</a> ⇒ <code>Array.&lt;Array.&lt;number&gt;&gt;</code></dt>
<dd><p>Las coordenadas de una ruta, en el orden que espera Leaflet.</p>
<p>GeoJSON las da como <code>[longitud, latitud]</code> y Leaflet las quiere al revés. Es
el error clásico: sin voltearlas la ruta aparece en el otro hemisferio.</p>
</dd>
<dt><a href="#resumenRuta">resumenRuta(ruta)</a> ⇒ <code>Object</code></dt>
<dd><p>El resumen de una ruta, en las unidades en que se lee.</p>
<p>El servicio contesta en metros y segundos. En pantalla se leen kilómetros y
minutos, y para cotizar, millas.</p>
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
<dt><a href="#crearCajaExterna">crearCajaExterna(datos)</a> ⇒ <code>Promise.&lt;object&gt;</code></dt>
<dd><p>Da de alta una caja externa desde el propio formulario de viaje.</p>
</dd>
<dt><a href="#useCrearCajaExterna">useCrearCajaExterna()</a> ⇒ <code>object</code></dt>
<dd><p>Da de alta una caja externa y refresca el catálogo.</p>
</dd>
<dt><a href="#obtenerViajePorId">obtenerViajePorId(parametros)</a> ⇒ <code>Promise.&lt;object&gt;</code></dt>
<dd><p>Trae un viaje con sus etapas, documentos y paradas.</p>
</dd>
<dt><a href="#guardarViajeUpcoming">guardarViajeUpcoming(parametros)</a> ⇒ <code>Promise.&lt;object&gt;</code></dt>
<dd><p>Guarda los cambios de un viaje, con sus etapas y sus archivos nuevos.</p>
<p>Los campos escalares del viaje van sueltos, las etapas como JSON, y cada
archivo nuevo en un campo propio nombrado por su posición.</p>
</dd>
<dt><a href="#guardarInvoices">guardarInvoices(parametros)</a> ⇒ <code>Promise.&lt;object&gt;</code></dt>
<dd><p>Guarda los números de factura de las etapas de un viaje.</p>
<p>Va aparte del guardado del viaje porque vive en otro endpoint. Que falle no
invalida lo ya guardado, así que quien la llama decide si avisar.</p>
</dd>
<dt><a href="#useViajeUpcoming">useViajeUpcoming(tripId)</a> ⇒ <code>object</code></dt>
<dd><p>Detalle de un viaje próximo. No consulta hasta tener un id.</p>
</dd>
<dt><a href="#useGuardarViajeUpcoming">useGuardarViajeUpcoming()</a> ⇒ <code>object</code></dt>
<dd><p>Guarda un viaje próximo e invalida su detalle.</p>
</dd>
<dt><a href="#obtenerResumenViaje">obtenerResumenViaje(parametros)</a> ⇒ <code>Promise.&lt;object&gt;</code></dt>
<dd><p>El resumen de un viaje: etapas, diesel, gastos y totales.</p>
<p>Cuando el viaje no existe la API responde <code>status: &quot;not found&quot;</code>, que no es ni
éxito ni el <code>&quot;error&quot;</code> que el cliente convierte en excepción: llegaría un
cuerpo sin datos y la pantalla se quedaría cargando para siempre. Por eso se
comprueba aquí.</p>
</dd>
<dt><a href="#useResumenViaje">useResumenViaje(tripId)</a> ⇒ <code>object</code></dt>
<dd><p>Resumen de un viaje. No consulta hasta tener un id.</p>
</dd>
<dt><a href="#obtenerViajes">obtenerViajes(parametros)</a> ⇒ <code>Promise.&lt;{viajes: Array, total: number}&gt;</code></dt>
<dd><p>Una página de la lista de viajes.</p>
<p>La API pagina en el servidor y devuelve el total aparte, así que la pantalla
nunca tiene la lista completa en memoria.</p>
</dd>
<dt><a href="#ejecutarAccionViaje">ejecutarAccionViaje(parametros)</a> ⇒ <code>Promise.&lt;object&gt;</code></dt>
<dd><p>Cambia el estado de un viaje.</p>
</dd>
<dt><a href="#useViajes">useViajes(consulta, [opciones])</a> ⇒ <code>object</code></dt>
<dd><p>Una página de la lista de viajes, con sus filtros.</p>
</dd>
<dt><a href="#useAccionViaje">useAccionViaje()</a> ⇒ <code>object</code></dt>
<dd><p>Ejecuta una acción sobre un viaje y refresca la lista.</p>
</dd>
<dt><a href="#documentoDesdeApi">documentoDesdeApi(doc)</a> ⇒ <code>object</code></dt>
<dd><p>Convierte un documento de la API en el estado que maneja el formulario.</p>
</dd>
<dt><a href="#documentosDeEtapa">documentosDeEtapa(plantilla, [adjuntos])</a> ⇒ <code>object</code></dt>
<dd><p>Rellena la plantilla de documentos de una etapa con los que ya están subidos.</p>
<p>Solo se conservan los tipos que la plantilla contempla: un documento de un
tipo que la etapa ya no usa no debe reaparecer en el formulario.</p>
</dd>
<dt><a href="#paradasDesdeApi">paradasDesdeApi([paradas])</a> ⇒ <code>Array</code></dt>
<dd><p>Convierte las paradas de una etapa al estado del formulario.</p>
</dd>
<dt><a href="#metadatosDocumentos">metadatosDocumentos([documentos])</a> ⇒ <code>Array.&lt;object&gt;</code></dt>
<dd><p>Los metadatos de documentos que acompañan al guardado.</p>
<p>Los archivos van aparte, en campos propios del <code>FormData</code>; esto es solo la
descripción de cada uno. Se omiten los tipos que no tienen archivo alguno.</p>
</dd>
<dt><a href="#paradasParaGuardar">paradasParaGuardar([paradas])</a> ⇒ <code>Array.&lt;object&gt;</code></dt>
<dd><p>Las paradas de una etapa, listas para el JSON del guardado.</p>
<p>El orden se recalcula a partir de la posición en la lista: es lo que el
usuario ve, y arrastrar una parada no actualiza su <code>stop_order</code>.</p>
</dd>
<dt><a href="#etapaParaGuardar">etapaParaGuardar(etapa, formatearFecha)</a> ⇒ <code>object</code></dt>
<dd><p>Los campos de una etapa que se guardan, en el formato de la API.</p>
</dd>
<dt><a href="#etapasEliminadas">etapasEliminadas([etapasIniciales], [etapasActuales])</a> ⇒ <code>Array</code></dt>
<dd><p>Las etapas que el usuario quitó durante la edición.</p>
<p>La API no borra por omisión: hay que decirle explícitamente cuáles ya no
están, o las etapas eliminadas reaparecen al recargar.</p>
</dd>
<dt><a href="#archivosNuevos">archivosNuevos([etapas])</a> ⇒ <code>object</code></dt>
<dd><p>Los archivos nuevos de las etapas, con el nombre de campo que espera la API.</p>
<p>Solo viajan los que el usuario acaba de escoger; los ya subidos se
identifican por su <code>document_id</code> en los metadatos. Cuando un archivo nuevo
reemplaza a uno existente se manda además el id del que se sustituye.</p>
</dd>
<dt><a href="#etapasDesdeApi">etapasDesdeApi([etapas], conversores)</a> ⇒ <code>Array</code></dt>
<dd><p>Convierte las etapas que devuelve la API al estado del formulario.</p>
<p>La plantilla de documentos depende del tipo de etapa y del país, que es algo
que solo saben las constantes del formulario: se recibe como función para que
el dominio no dependa de ellas.</p>
</dd>
<dt><a href="#pestanaDeReemplazo">pestanaDeReemplazo(permitidas, actual)</a> ⇒ <code>number</code> | <code>null</code></dt>
<dd><p>La pestaña a la que caer cuando la elegida ya no está permitida.</p>
<p>Los permisos se refrescan cada 15 segundos, así que a alguien se le puede
retirar el acceso a la pestaña que está mirando.</p>
</dd>
<dt><a href="#filtrosActivos">filtrosActivos([filtros])</a> ⇒ <code>number</code></dt>
<dd><p>Cuántos filtros están puestos.</p>
<p>Sirve para el contador de la barra: la dirección solo cuenta si no es &quot;todas&quot;.</p>
</dd>
<dt><a href="#numero">numero(valor)</a> ⇒ <code>number</code></dt>
<dd><p>Un número de la API, que puede venir como texto, nulo o ausente.</p>
</dd>
<dt><a href="#totalesViaje">totalesViaje([resumen])</a> ⇒ <code><a href="#TotalesViaje">TotalesViaje</a></code></dt>
<dd><p>Los totales de un viaje, tomados de donde el backend los publica.</p>
<p>El backend ya calcula los cinco números y los manda en <code>totales</code>. La pantalla
los recalculaba, y para el pago al conductor leía <code>driver_payments.total_monto</code>
—una clave que la respuesta <strong>no tiene</strong>—, así que el renglón &quot;Pago a
conductor&quot; salía siempre en cero aunque la API mandara el importe: en el viaje
480, 1 122.26 USD que nunca se vieron.</p>
<p>Ojo con la utilidad: la que publica el backend es <code>rate - diesel - gastos</code>,
<strong>sin restar el pago al conductor</strong> (comprobado con el viaje 480: 6 200 −
1 509 − 188 = 4 503, que es justo lo que manda). Es una decisión suya, no un
error, y por eso aquí se expone tal cual en vez de recalcularla.</p>
</dd>
<dt><a href="#utilidadCuadra">utilidadCuadra(totales, [tolerancia])</a> ⇒ <code>boolean</code></dt>
<dd><p>Comprueba que la utilidad que manda el backend cuadre con sus propios números.</p>
<p>Se compara contra <code>tarifa - diesel - gastos</code>, que es como el backend la
calcula: el pago al conductor queda fuera. No corrige nada; solo permite
avisar cuando el resumen se contradice, que es mejor que enseñar dos cifras
que no cuadran sin decir nada.</p>
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
<dt><a href="#obtenerUnidades">obtenerUnidades(parametros)</a> ⇒ <code>Promise.&lt;{requisitos: Array, unidades: Array}&gt;</code></dt>
<dd><p>Trae de una sola vez los requisitos y las unidades de un tipo.</p>
<p>Los tres endpoints resuelven todo en una operación: la lista de requisitos
configurados y las unidades con su expediente ya adjunto.</p>
</dd>
<dt><a href="#guardarUnidad">guardarUnidad(parametros)</a> ⇒ <code>Promise.&lt;object&gt;</code></dt>
<dd><p>Guarda una unidad con su expediente.</p>
</dd>
<dt><a href="#eliminarUnidad">eliminarUnidad(parametros)</a> ⇒ <code>Promise.&lt;object&gt;</code></dt>
<dd><p>Elimina una unidad.</p>
</dd>
<dt><a href="#darDeBaja">darDeBaja(parametros)</a> ⇒ <code>Promise.&lt;object&gt;</code></dt>
<dd><p>Da de baja a un conductor, con su motivo y su fecha.</p>
<p>Una baja no borra: el expediente sigue existiendo y el conductor pasa a la
pestaña de bajas. Solo el tipo conductor la admite.</p>
</dd>
<dt><a href="#crearRequisito">crearRequisito(parametros)</a> ⇒ <code>Promise.&lt;object&gt;</code></dt>
<dd><p>Crea un requisito nuevo en el expediente de un tipo.</p>
</dd>
<dt><a href="#eliminarRequisito">eliminarRequisito(parametros)</a> ⇒ <code>Promise.&lt;object&gt;</code></dt>
<dd><p>Elimina un requisito del expediente.</p>
<p>Los documentos ya subidos contra ese requisito siguen en la base; lo que
desaparece es la exigencia.</p>
</dd>
<dt><a href="#cambiarVisibilidadColumna">cambiarVisibilidadColumna(parametros)</a> ⇒ <code>Promise.&lt;object&gt;</code></dt>
<dd><p>Muestra u oculta una columna del expediente para todos los usuarios.</p>
<p>Solo camiones y conductores la guardan: la tabla de cajas no tiene la columna
<code>oculto_en_tabla</code> en la base, así que ahí la preferencia vive en la pantalla
y se pierde al recargar. Está anotado en <code>docs/MODULOS/unidades.md</code>.</p>
</dd>
<dt><a href="#useUnidades">useUnidades(tipo)</a> ⇒ <code>object</code></dt>
<dd><p>Requisitos y unidades de un tipo.</p>
</dd>
<dt><a href="#useMutacionUnidad">useMutacionUnidad(tipo, accion)</a> ⇒ <code>object</code></dt>
<dd><p>Crea la mutación de un tipo de unidad, refrescando su lista al terminar.</p>
</dd>
<dt><a href="#fechaVencimiento">fechaVencimiento([documento])</a> ⇒ <code>string</code> | <code>null</code></dt>
<dd><p>La fecha de vencimiento de un documento, o <code>null</code> si no tiene una de verdad.</p>
</dd>
<dt><a href="#diasPara">diasPara(fecha, [hoy])</a> ⇒ <code>number</code> | <code>null</code></dt>
<dd><p>Cuántos días faltan para una fecha.</p>
</dd>
<dt><a href="#estadoDocumento">estadoDocumento(requisito, [documento], [hoy])</a> ⇒ <code>Object</code></dt>
<dd><p>En qué estado está un documento respecto a su requisito.</p>
<p>Un requisito de texto no vence: o tiene valor o falta. Uno de archivo con
vencimiento pasa por vencido, por vencer y vigente según la fecha.</p>
</dd>
<dt><a href="#requisitosVisibles">requisitosVisibles([requisitos], [ocultasLocales])</a> ⇒ <code>Array</code></dt>
<dd><p>Los requisitos que se muestran como columna de la tabla.</p>
<p>En cajas la visibilidad no se puede guardar —el backend no tiene la columna—
así que ahí se pasa la lista de ocultas que vive solo en la pantalla.</p>
</dd>
<dt><a href="#resumenExpediente">resumenExpediente([requisitos], [documentos], [hoy])</a> ⇒ <code>object</code></dt>
<dd><p>Cuenta el estado del expediente de una unidad.</p>
<p>Sirve para saber de un vistazo si a una unidad le falta papeleo, sin abrir su
ficha.</p>
</dd>
<dt><a href="#normalizarRequisitos">normalizarRequisitos(filas)</a> ⇒ <code>Object</code></dt>
<dd><p>Valida los requisitos descartando los que no cumplen.</p>
</dd>
<dt><a href="#descriptorDe">descriptorDe(tipo)</a> ⇒ <code><a href="#DescriptorUnidad">DescriptorUnidad</a></code></dt>
<dd><p>El descriptor de un tipo de unidad.</p>
</dd>
<dt><a href="#unidadEnBlanco">unidadEnBlanco(tipo)</a> ⇒ <code>object</code></dt>
<dd><p>Los campos vacíos con los que arranca un alta.</p>
</dd>
<dt><a href="#filtrarUnidades">filtrarUnidades([unidades], [busquedas], [texto])</a> ⇒ <code>Array</code></dt>
<dd><p>Filtra una lista de unidades por lo escrito en cada buscador.</p>
<p>Cada buscador puede mirar varios campos —el de placa mira la mexicana y la
estadounidense—, y una unidad pasa si coincide en alguno de ellos.</p>
</dd>
<dt><a href="#camposParaGuardar">camposParaGuardar(tipo, unidad)</a> ⇒ <code>object</code></dt>
<dd><p>Los campos del formulario que se mandan al guardar.</p>
<p>Se omiten los vacíos: el backend interpreta la ausencia como &quot;no lo toques&quot;,
y mandar la cadena vacía borraría lo que ya estaba.</p>
</dd>
<dt><a href="#expedienteParaGuardar">expedienteParaGuardar([requisitos], [documentos], [archivos])</a> ⇒ <code>object</code></dt>
<dd><p>Los campos del expediente que se mandan al guardar.</p>
<p>Los requisitos de texto viajan como <code>text_&lt;clave&gt;</code>, las fechas como
<code>date_&lt;clave&gt;</code> y los archivos como <code>file_&lt;clave&gt;</code>. Es el contrato del backend
y no se puede cambiar desde aquí.</p>
</dd>
<dt><a href="#validarUnidad">validarUnidad(tipo, unidad)</a> ⇒ <code>string</code> | <code>null</code></dt>
<dd><p>Comprueba que estén los campos obligatorios del tipo.</p>
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
<dt><a href="#crearBodega">crearBodega(nombre)</a> ⇒ <code>Promise.&lt;object&gt;</code></dt>
<dd><p>Da de alta una bodega desde el propio selector.</p>
</dd>
<dt><a href="#useCrearBodega">useCrearBodega()</a> ⇒ <code>object</code></dt>
<dd><p>Da de alta una bodega y refresca el catálogo.</p>
</dd>
<dt><a href="#iconoUnidad">iconoUnidad(rumbo, color)</a> ⇒ <code>object</code></dt>
<dd><p>Marcador de una unidad, apuntando hacia donde va.</p>
</dd>
<dt><a href="#iconoPunto">iconoPunto(etiqueta, color)</a> ⇒ <code>object</code></dt>
<dd><p>Marcador numerado de un extremo de la ruta.</p>
</dd>
<dt><a href="#ajustesDe">ajustesDe(modo)</a> ⇒ <code>object</code></dt>
<dd><p>Los ajustes de un modo de edición.</p>
</dd>
<dt><a href="#contrarioDe">contrarioDe([pais])</a> ⇒ <code>string</code></dt>
<dd><p>El país del otro lado de la frontera, o cadena vacía si el país no se reconoce.</p>
</dd>
<dt><a href="#useEnlaceTransnacional">useEnlaceTransnacional(parametros)</a> ⇒ <code>Object</code></dt>
<dd><p>El enlace de un viaje con su mitad del otro lado de la frontera.</p>
<p>Solo lo usa la edición completa. Cuando el viaje <strong>ya venía enlazado</strong>, no se
ofrece la lista: el enlace está hecho y volver a elegir solo permitiría
romperlo por accidente. Por eso importa si estaba enlazado <em>al cargar</em>, no si
lo está ahora mismo.</p>
</dd>
<dt><a href="#documentosFaltantesDeViaje">documentosFaltantesDeViaje(viaje)</a> ⇒ <code>Object</code></dt>
<dd><p>Los documentos que le faltan a un viaje, sumando los de todas sus etapas.</p>
<p>La API manda el conteo y la lista por etapa; aquí se juntan y se prefija cada
documento con su etapa, que es lo que hace útil la lista: saber que falta un
BL no sirve si no se sabe de cuál de las tres etapas.</p>
</dd>
<dt><a href="#urlDocumento">urlDocumento(rutaServidor, apiBase)</a> ⇒ <code>string</code></dt>
<dd><p>La URL con la que se abre un documento del viaje.</p>
<p>Del camino que manda el servidor solo sirve el nombre del archivo; el resto
es la ruta interna de su disco.</p>
</dd>
<dt><a href="#columnasDeTabla">columnasDeTabla(contexto)</a> ⇒ <code>number</code></dt>
<dd><p>Cuántas columnas tiene la tabla en la pestaña actual.</p>
<p>Hace falta para que la fila de &quot;no hay registros&quot; ocupe todo el ancho. Las
columnas cambian por pestaña y por permiso.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#ResultadoArchivo">ResultadoArchivo</a> : <code>object</code></dt>
<dd><p>El resultado de validar un archivo.</p>
</dd>
<dt><a href="#Detalle">Detalle</a> : <code>object</code></dt>
<dd><p>Contenido estructurado que acompaña a un aviso.</p>
<p>Existe en lugar de una cadena de HTML. Un aviso que necesitaba negritas o una
lista se armaba concatenando etiquetas, y eso metía al DOM texto que venía del
servidor —un nombre de archivo, un mensaje de error— sin escapar. Con datos,
React escapa por su cuenta y la puerta se cierra sola.</p>
</dd>
<dt><a href="#Autonomia">Autonomia</a> : <code>object</code></dt>
<dd><p>La autonomía de un camión, ya validada.</p>
</dd>
<dt><a href="#ViajeTransnacional">ViajeTransnacional</a> : <code>object</code></dt>
<dd><p>Un viaje transnacional ya validado.</p>
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
<dt><a href="#Ubicacion">Ubicacion</a> : <code>object</code></dt>
<dd><p>Una ubicación de la cotización: lo que se escribió y dónde cayó en el mapa.</p>
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
<dt><a href="#UnidadFlota">UnidadFlota</a> : <code>object</code></dt>
<dd><p>Una unidad de la flota, ya con GPS y telemetría juntos.</p>
</dd>
<dt><a href="#PuntoRuta">PuntoRuta</a> : <code>object</code></dt>
<dd><p>Un punto de la ruta, como lo entienden el mapa y el trazador.</p>
</dd>
<dt><a href="#TotalesViaje">TotalesViaje</a> : <code>object</code></dt>
<dd><p>Los totales de un viaje: lo que se cobra y lo que cuesta.</p>
</dd>
<dt><a href="#Afinacion">Afinacion</a> : <code>object</code></dt>
<dd><p>El estado de afinación de un camión, ya validado.</p>
</dd>
<dt><a href="#DescriptorUnidad">DescriptorUnidad</a> : <code>object</code></dt>
<dd><p>Todo lo que distingue a un tipo de unidad de los otros dos.</p>
<p>Las tres pantallas hacen exactamente lo mismo —listar, buscar, dar de alta,
editar el expediente y configurar requisitos— contra tres endpoints que solo
se diferencian en el nombre del sustantivo. En vez de tres pantallas casi
iguales que se van separando con cada arreglo, hay una y esta tabla.</p>
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
<a name="TERMINO"></a>

## TERMINO : <code>enum</code>
El vocabulario de la aplicación: una palabra por concepto.

Existe porque la interfaz estaba **mezclada en dos idiomas dentro de la misma
pantalla**: la misma columna decía `Driver` en una tabla y `Conductor` en
otra, `Status` aquí y `Estatus` allá, `Trip #` junto a `Total Pagado`.

La regla que decidió el equipo, y que este archivo aplica:

> **Los sustantivos del oficio van en inglés; todo lo demás en español.**

`Trip` y `Driver` se quedan en inglés porque es como se habla en el
transporte de carga en la frontera —«el trip 199», «el driver»— y porque es
como los nombra el backend. Traducirlos haría que la pantalla dejara de
coincidir con la conversación. El resto de la interfaz va en español, que es
el idioma en que se trabaja.

**Este archivo es también la semilla del catálogo de traducción.** Cuando
llegue el botón de idioma, estas claves son las que tendrán una versión en
cada idioma; por eso las claves describen el **concepto** y no el texto.

**Kind**: global enum  
**Read only**: true  
<a name="LARGO_MAXIMO"></a>

## LARGO\_MAXIMO : <code>enum</code>
Límites de longitud por tipo de campo, en caracteres.

Salen de lo que aguanta la columna en la base, no de una preferencia. Un texto
más largo hoy se manda igual y MySQL lo corta en silencio, así que el dato
queda a medias sin que nadie se entere.

**Kind**: global enum  
**Read only**: true  
<a name="RADIO"></a>

## RADIO : <code>enum</code>
Radios de borde, en píxeles.

MUI multiplica su `shape.borderRadius` por el factor que se le pase a `sx`,
así que estos valores son los que corresponden a `borderRadius: 1, 2, 2.5, 3`.

**Kind**: global enum  
**Read only**: true  
<a name="SOMBRA"></a>

## SOMBRA : <code>enum</code>
Las sombras que usa la app.

Son deliberadamente pocas: el lenguaje visual de las pantallas de referencia
separa las cosas con bordes de 1 px, no con sombras. La única sombra fuerte
es la del botón principal al pasar el ratón.

**Kind**: global enum  
**Read only**: true  
<a name="PAIS"></a>

## PAIS : <code>enum</code>
Los dos países entre los que IMA opera.

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
<a name="CATALOGO_GASTOS"></a>

## CATALOGO\_GASTOS : <code>enum</code>
Los cuatro catálogos que alimentan el formulario de gastos.

**Kind**: global enum  
**Read only**: true  
<a name="ORDEN_ACCESSORS"></a>

## ORDEN\_ACCESSORS : <code>enum</code>
Cómo se lee cada columna ordenable de la tabla de gastos.

Ordenar por pesos necesita el tipo de cambio, porque la mitad de los gastos
están en dólares y hay que convertirlos para compararlos con los demás.

**Kind**: global enum  
**Read only**: true  
<a name="PAIS_REGISTRO"></a>

## PAIS\_REGISTRO : <code>enum</code>
Países entre los que se reparten los registros.

**Kind**: global enum  
**Read only**: true  
<a name="TIPO_REGISTRO"></a>

## TIPO\_REGISTRO : <code>enum</code>
Los dos tipos de registro que lleva `formularios.php`.

Son la misma pantalla tres veces —resumen por viaje, registros de un viaje y
edición de uno— contra operaciones que solo cambian el sustantivo.

**Kind**: global enum  
**Read only**: true  
<a name="CAMPO_RESPUESTA"></a>

## CAMPO\_RESPUESTA : <code>enum</code>
Dónde viene la lista en cada respuesta de `formularios.php`.

El endpoint usa **tres claves distintas** según la operación, y ninguna es la
habitual `data`: las listas vienen en `id` —sí, un arreglo en un campo que se
llama `id`—, un registro suelto en `row`, y solo los tickets en `data`.

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
<a name="PREFIJO_CAJA"></a>

## PREFIJO\_CAJA : <code>enum</code>
Prefijos con los que se distingue una caja propia de una externa en el selector.

El selector de caja mezcla las dos flotas en una sola lista, y sus ids se
repiten entre tablas: la caja interna 5 y la externa 5 son distintas. El
prefijo es lo que las separa mientras están juntas.

**Kind**: global enum  
**Read only**: true  
<a name="ESTATUS_ORDEN"></a>

## ESTATUS\_ORDEN : <code>enum</code>
Estados por los que pasa una orden de servicio y cada uno de sus servicios.

Verificado contra la API el 2026-09-01: son los tres únicos valores que
aparecen, tanto en órdenes como en servicios.

**Kind**: global enum  
**Read only**: true  
<a name="COLOR_ESTADO"></a>

## COLOR\_ESTADO : <code>enum</code>
Color de cada estado de viaje, en la pastilla del HUD.

**Kind**: global enum  
**Read only**: true  
<a name="ESTADO_PARADA"></a>

## ESTADO\_PARADA : <code>enum</code>
Estado de una parada dentro de la etapa activa.

**Kind**: global enum  
**Read only**: true  
<a name="ETIQUETA_PARADA"></a>

## ETIQUETA\_PARADA : <code>enum</code>
Cómo se muestra cada estado de parada.

**Kind**: global enum  
**Read only**: true  
<a name="MODO_PING"></a>

## MODO\_PING : <code>enum</code>
Modos en que se puede colocar el segundo punto de una ruta.

**Kind**: global enum  
**Read only**: true  
<a name="OP_GUARDADO"></a>

## OP\_GUARDADO : <code>enum</code>
Las tres formas de guardar un viaje, según desde qué pantalla se edite.

Son operaciones distintas del mismo endpoint: cada una acepta editar unas
cosas y no otras. `Update_complete` es la que no tiene restricciones.

**Kind**: global enum  
**Read only**: true  
<a name="ACCION_VIAJE"></a>

## ACCION\_VIAJE : <code>enum</code>
Operaciones que cambian el estado de un viaje.

Cada una vive en un endpoint distinto porque se fueron agregando en momentos
distintos: `salida_trip` está en la v2 y las demás en la v1.

**Kind**: global enum  
**Read only**: true  
<a name="ESTADO_VIAJE"></a>

## ESTADO\_VIAJE : <code>enum</code>
Estados por los que pasa un viaje, en el orden del ciclo.

**Kind**: global enum  
**Read only**: true  
<a name="COLOR_ESTADO_VIAJE"></a>

## COLOR\_ESTADO\_VIAJE : <code>enum</code>
Color de cada estado de viaje.

**Kind**: global enum  
**Read only**: true  
<a name="TIPO_ETAPA"></a>

## TIPO\_ETAPA : <code>enum</code>
Tipos de etapa que puede tener un viaje.

**Kind**: global enum  
**Read only**: true  
<a name="NOMBRE_TIPO_ETAPA"></a>

## NOMBRE\_TIPO\_ETAPA : <code>enum</code>
Cómo se llama cada tipo de etapa en pantalla.

La comparación va en minúsculas porque la base guarda el tipo con distinta
capitalización según por qué formulario se creó la etapa.

**Kind**: global enum  
**Read only**: true  
**Properties**

| Name | Type | Default |
| --- | --- | --- |
| bordercrossing | <code>string</code> | <code>&quot;Cruce&quot;</code> | 
| emptymileage | <code>string</code> | <code>&quot;Etapa de Millaje Vacío&quot;</code> | 
| normaltrip | <code>string</code> | <code>&quot;Normal&quot;</code> | 

<a name="ESTADO_AFINACION"></a>

## ESTADO\_AFINACION : <code>enum</code>
Estado de un camión respecto a su próxima afinación.

**Kind**: global enum  
**Read only**: true  
<a name="ESTADO_DOCUMENTO"></a>

## ESTADO\_DOCUMENTO : <code>enum</code>
Estado en que puede estar un documento del expediente.

**Kind**: global enum  
**Read only**: true  
<a name="COLOR_CATEGORIA"></a>

## COLOR\_CATEGORIA : <code>enum</code>
Categorías en que se agrupan los requisitos, con su color.

Lo que no cae en ninguna se pinta con el color de "Otros"; las categorías las
escribe quien crea el requisito, así que puede aparecer cualquier texto.

**Kind**: global enum  
**Read only**: true  
<a name="TIPO_UNIDAD"></a>

## TIPO\_UNIDAD : <code>enum</code>
Los tres tipos de unidad que IMA administra con expediente de documentos.

**Kind**: global enum  
**Read only**: true  
<a name="ESTADO_CONDUCTOR"></a>

## ESTADO\_CONDUCTOR : <code>enum</code>
Estados en que puede estar un conductor.

Solo los conductores se dan de baja; camiones y cajas se eliminan.

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
<a name="MODO_EDICION"></a>

## MODO\_EDICION : <code>enum</code>
Desde qué pantalla se está editando un viaje.

Son la misma pantalla con dos permisos distintos: la normal edita lo que se
puede cambiar sobre la marcha, y la completa no tiene restricciones —también
el enlace transnacional— y trabaja sobre los catálogos completos, porque un
viaje viejo puede tener un conductor o una unidad que ya no está activa.

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
<a name="LOCALE"></a>

## LOCALE : <code>string</code>
Con qué convenciones se formatean los números y las fechas.

Hoy el proyecto formatea dinero a mano en **27 sitios**, y no todos igual:
unos usan `es-MX` y otros `en-US`, así que la misma cantidad se ve distinta
según la pantalla. Este módulo existe para que eso converja módulo a módulo;
el valor por omisión es el que ya usan las pantallas de viajes.

**Kind**: global constant  
<a name="MONEDA"></a>

## MONEDA : <code>string</code>
Moneda con la que se opera casi todo.

**Kind**: global constant  
<a name="soloHora"></a>

## soloHora ⇒ <code>string</code> \| <code>null</code>
Recorta una hora `HH:MM:SS` a `HH:MM`.

**Kind**: global constant  
**Returns**: <code>string</code> \| <code>null</code> - La hora recortada, o `null` si no hay.  

| Param | Type | Description |
| --- | --- | --- |
| valor | <code>\*</code> | La hora, como la manda la API. |

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

<a name="CLASE_NO_IMPRIMIR"></a>

## CLASE\_NO\_IMPRIMIR : <code>string</code>
Clase que marca lo que no debe salir en el PDF.

Los botones de la pantalla estorban en un documento impreso, así que se
ocultan mientras se toma la foto y se restauran después.

**Kind**: global constant  
<a name="ESTADO_GEOGRAFICO"></a>

## ESTADO\_GEOGRAFICO : <code>string</code>
«Estado» geográfico, que **no** es lo mismo que el estatus de un viaje.

Se declara aparte a propósito. En IFTA, «Estado» significa entidad federativa
—Texas, Oklahoma— y en el resto de la app significaría la situación de un
registro. Por eso el estatus se llama `Estatus`: para que esta palabra
conserve un solo significado.

**Kind**: global constant  
**Read only**: true  
<a name="TAMANO_MAXIMO_BYTES"></a>

## TAMANO\_MAXIMO\_BYTES : <code>number</code>
Tamaño máximo que se acepta en una subida, en bytes.

El límite real lo pone PHP (`upload_max_filesize`), pero cuando se rebasa allá
la petición muere sin mensaje útil y la persona no sabe qué pasó. Rechazarlo
aquí permite decirle cuánto pesa su archivo y cuánto cabe.

**Kind**: global constant  
**Read only**: true  
<a name="TIPOS_PERMITIDOS"></a>

## TIPOS\_PERMITIDOS
Los tipos de archivo que la app acepta, con su firma binaria.

`firmas` son los primeros bytes reales del archivo. La extensión y el
`file.type` que reporta el navegador los controla quien sube: renombrar
`algo.exe` a `algo.pdf` cambia las dos cosas, pero no cambia el contenido.
Comparar la firma es lo único que dice qué es el archivo de verdad.

**Kind**: global constant  
**Read only**: true  
<a name="GRUPOS_ARCHIVO"></a>

## GRUPOS\_ARCHIVO
Los grupos de tipos que pide cada pantalla.

**Kind**: global constant  
**Read only**: true  
<a name="atributoAccept"></a>

## atributoAccept ⇒ <code>string</code>
El valor de `accept` para un `<input type="file">` a partir de un grupo.

Se genera de la misma tabla que valida, para que el filtro del explorador de
archivos y la comprobación real nunca se desincronicen.

**Kind**: global constant  
**Returns**: <code>string</code> - La lista para el atributo `accept`.  

| Param | Type | Description |
| --- | --- | --- |
| grupo | <code>Array.&lt;string&gt;</code> | Un valor de `GRUPOS_ARCHIVO`. |

**Example**  
```js
<input type="file" accept={atributoAccept(GRUPOS_ARCHIVO.SOLO_PDF)} />
```
<a name="CARACTERES_INVISIBLES"></a>

## CARACTERES\_INVISIBLES : <code>RegExp</code>
Caracteres invisibles: ancho cero, marcas de dirección y BOM.

Ocupan lugar en la cadena pero no pintan nada. Dos textos que se ven idénticos
pueden ser distintos por culpa de uno de estos, y entonces una búsqueda falla
sin explicación posible.

**Kind**: global constant  
**Read only**: true  
<a name="PROTOCOLOS_SEGUROS"></a>

## PROTOCOLOS\_SEGUROS : <code>Array.&lt;string&gt;</code>
Protocolos que se consideran seguros para navegar o abrir fuera de la app.

Es una lista blanca a propósito: cualquier esquema que no esté aquí se
rechaza. Una lista negra siempre se queda corta \u2014`javascript:`, `vbscript:`,
`data:`, `file:`, `smb:` y los esquemas que registre cualquier programa
instalado en la máquina\u2014 y basta que se escape uno para perder la garantía.

**Kind**: global constant  
**Read only**: true  
<a name="URL_INERTE"></a>

## URL\_INERTE : <code>string</code>
El valor que se pone en un `href` cuando la URL no es de fiar.

No se usa cadena vacía ni `#`: ambos dejan el enlace con aspecto de enlace
funcional. `about:blank` abre una pestaña en blanco, que es un fallo visible
y sin daño.

**Kind**: global constant  
**Read only**: true  
<a name="urlSegura"></a>

## urlSegura ⇒ <code>string</code>
Devuelve la URL si es segura, y una URL inerte si no lo es.

Pensada para usarse en el punto exacto donde el dato entra al DOM, de modo que
ningún componente tenga que acordarse de validar.

**Kind**: global constant  
**Returns**: <code>string</code> - La misma URL sin espacios alrededor, o `URL_INERTE`.  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>\*</code> | La URL que viene del servidor o del usuario. |

**Example**  
```js
<a href={urlSegura(doc.url)}>Ver</a>
```
<a name="enlaceExterno"></a>

## enlaceExterno ⇒ <code>Object</code>
Las props que necesita un enlace externo para ser seguro.

`noopener` evita que la página abierta pueda manipular la que la abrió a
través de `window.opener`; `noreferrer` además le oculta de dónde viene. Van
juntas porque olvidar una de las dos es el error habitual.

**Kind**: global constant  
**Returns**: <code>Object</code> - Props listas para el `<a>`.  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>\*</code> | La URL destino. |

**Example**  
```js
<Button {...enlaceExterno(doc.url)}>Ver documento</Button>
```
<a name="DURACION_FLOTANTE_MS"></a>

## DURACION\_FLOTANTE\_MS : <code>number</code>
Cuánto dura en pantalla un aviso flotante.

**Kind**: global constant  
**Read only**: true  
<a name="usarCola"></a>

## usarCola
La cola de avisos pendientes de pintar.

Es un store de zustand y no un módulo con estado suelto porque el proyecto ya
tiene tres stores así, y tener dos mecanismos para lo mismo es la clase de
duplicación que el estándar manda evitar. Zustand resuelve además, de fábrica,
lo que aquí había que escribir a mano: se lee y se escribe **fuera de React**
con `getState`, que es justo lo que necesita `notify` para poder llamarse
desde un `catch`, y `useStore` da la suscripción para pintar.

Tres ranuras, separadas a propósito:

- `cola`: los diálogos que esperan respuesta. Se muestran de uno en uno y por
  orden; el segundo espera en vez de reemplazar al primero, porque perder un
  aviso es peor que mostrar dos seguidos.
- `cargando`: el indicador que bloquea. No espera respuesta, así que no entra
  en la cola, y cualquier diálogo nuevo lo releva.
- `flotantes`: los avisos que no bloquean. Conviven y se van solos.

**Kind**: global constant  
<a name="PAGE_SHELL_SX"></a>

## PAGE\_SHELL\_SX
El contenedor de una pantalla completa.

**Kind**: global constant  
**Read only**: true  
<a name="SECTION_LABEL_SX"></a>

## SECTION\_LABEL\_SX
La etiqueta pequeña en mayúsculas que rotula una sección.

**Kind**: global constant  
**Read only**: true  
<a name="PAGE_OVERLINE_SX"></a>

## PAGE\_OVERLINE\_SX
La misma etiqueta, con más espaciado, para el rótulo sobre el título.

**Kind**: global constant  
**Read only**: true  
<a name="PAGE_TITLE_SX"></a>

## PAGE\_TITLE\_SX
**Kind**: global constant  
**Read only**: true  
<a name="CARD_SX"></a>

## CARD\_SX
**Kind**: global constant  
**Read only**: true  
<a name="DIALOG_PAPER_SX"></a>

## DIALOG\_PAPER\_SX
**Kind**: global constant  
**Read only**: true  
<a name="DIALOG_TITLE_SX"></a>

## DIALOG\_TITLE\_SX
**Kind**: global constant  
**Read only**: true  
<a name="DIALOG_CONTENT_SX"></a>

## DIALOG\_CONTENT\_SX
**Kind**: global constant  
**Read only**: true  
<a name="DIALOG_ACTIONS_SX"></a>

## DIALOG\_ACTIONS\_SX
**Kind**: global constant  
**Read only**: true  
<a name="SECTION_ICON_SX"></a>

## SECTION\_ICON\_SX
**Kind**: global constant  
**Read only**: true  
<a name="SECTION_TITLE_SX"></a>

## SECTION\_TITLE\_SX
**Kind**: global constant  
**Read only**: true  
<a name="HEADER_ROW_SX"></a>

## HEADER\_ROW\_SX
**Kind**: global constant  
**Read only**: true  
<a name="HEADER_CELL_SX"></a>

## HEADER\_CELL\_SX
**Kind**: global constant  
**Read only**: true  
<a name="TABLE_CONTAINER_SX"></a>

## TABLE\_CONTAINER\_SX
**Kind**: global constant  
**Read only**: true  
<a name="PAGINATION_BOX_SX"></a>

## PAGINATION\_BOX\_SX
**Kind**: global constant  
**Read only**: true  
<a name="PAGINATION_SX"></a>

## PAGINATION\_SX
**Kind**: global constant  
**Read only**: true  
<a name="TABS_WRAPPER_SX"></a>

## TABS\_WRAPPER\_SX
**Kind**: global constant  
**Read only**: true  
<a name="TAB_SX"></a>

## TAB\_SX
**Kind**: global constant  
**Read only**: true  
<a name="CHIP_SX"></a>

## CHIP\_SX
**Kind**: global constant  
**Read only**: true  
<a name="CHIP_OK_SX"></a>

## CHIP\_OK\_SX
**Kind**: global constant  
**Read only**: true  
<a name="CHIP_DANGER_SX"></a>

## CHIP\_DANGER\_SX
**Kind**: global constant  
**Read only**: true  
<a name="CHIP_WARN_SX"></a>

## CHIP\_WARN\_SX
Un chip de aviso, para lo que no está mal pero pide atención.

**Kind**: global constant  
**Read only**: true  
<a name="CHIP_INFO_SX"></a>

## CHIP\_INFO\_SX
Un chip informativo, sin carga de bueno ni malo.

**Kind**: global constant  
**Read only**: true  
<a name="ICON_BTN_SX"></a>

## ICON\_BTN\_SX
**Kind**: global constant  
**Read only**: true  
<a name="CELL_STRONG_SX"></a>

## CELL\_STRONG\_SX
**Kind**: global constant  
**Read only**: true  
<a name="CELL_SX"></a>

## CELL\_SX
**Kind**: global constant  
**Read only**: true  
<a name="CELL_MUTED_SX"></a>

## CELL\_MUTED\_SX
**Kind**: global constant  
**Read only**: true  
<a name="DARK_BTN_SX"></a>

## DARK\_BTN\_SX
**Kind**: global constant  
**Read only**: true  
<a name="GHOST_BTN_SX"></a>

## GHOST\_BTN\_SX
**Kind**: global constant  
**Read only**: true  
<a name="INPUT_SX"></a>

## INPUT\_SX
**Kind**: global constant  
**Read only**: true  
<a name="notify"></a>

## notify
Avisos al usuario, en un solo lugar.

El proyecto llegó a tener **tres** librerías para lo mismo: `sweetalert2`,
`react-toastify` y `@pablotheblink/flashyjs`. Hoy no tiene ninguna: los avisos
se pintan con los componentes de MUI y el tema de la aplicación —ver
`docs/DECISIONES/0010` y `0011`—, así que un diálogo de confirmación se ve
como el resto de la app y no como una librería ajena.

Este módulo no pinta nada: encola. Quien pinta es `AnfitrionAvisos`, montado
una sola vez junto al tema. Esa separación es lo que permite llamar a `notify`
desde un `catch`, desde el manejador global de errores o desde un hook, sin
que ninguno de esos sitios tenga que ser un componente.

Cada función devuelve una promesa, así que se puede esperar el cierre.

**Kind**: global constant  

* [notify](#notify)
    * [.exito(mensaje, [titulo])](#notify.exito) ⇒ <code>Promise</code>
    * [.conDetalle(detalle, [titulo], [icono])](#notify.conDetalle) ⇒ <code>Promise</code>
    * [.cargando([titulo])](#notify.cargando) ⇒ <code>void</code>
    * [.cerrar()](#notify.cerrar) ⇒ <code>void</code>
    * [.error(problema, [titulo])](#notify.error) ⇒ <code>Promise</code>
    * [.discreto(problema, [icono])](#notify.discreto) ⇒ <code>Promise</code>
    * [.aviso(mensaje, [titulo])](#notify.aviso) ⇒ <code>Promise</code>
    * [.confirmar(opciones)](#notify.confirmar) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.elegir(opciones)](#notify.elegir) ⇒ <code>Promise.&lt;\*&gt;</code>

<a name="notify.exito"></a>

### notify.exito(mensaje, [titulo]) ⇒ <code>Promise</code>
Confirma que una operación salió bien.

**Kind**: static method of [<code>notify</code>](#notify)  
**Returns**: <code>Promise</code> - Se resuelve al cerrarse el aviso.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| mensaje | <code>string</code> |  | Qué ocurrió, en lenguaje de la persona. |
| [titulo] | <code>string</code> | <code>&quot;&#x27;Listo&#x27;&quot;</code> | Encabezado del aviso. |

<a name="notify.conDetalle"></a>

### notify.conDetalle(detalle, [titulo], [icono]) ⇒ <code>Promise</code>
Informa de algo que se lee mejor enumerado que en un párrafo.

Sustituye al aviso con HTML que había antes. El contenido son **datos**, no
marcas: así un nombre que venga del servidor no puede convertirse en
etiquetas al pintarse.

**Kind**: static method of [<code>notify</code>](#notify)  
**Returns**: <code>Promise</code> - Se resuelve al cerrarse el aviso.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| detalle | [<code>Detalle</code>](#Detalle) |  | El contenido estructurado. |
| [titulo] | <code>string</code> | <code>&quot;&#x27;Atención&#x27;&quot;</code> | Encabezado del aviso. |
| [icono] | <code>string</code> | <code>&quot;&#x27;warning&#x27;&quot;</code> | Icono a mostrar. |

<a name="notify.cargando"></a>

### notify.cargando([titulo]) ⇒ <code>void</code>
Bloquea la pantalla mientras una operación larga termina.

No se cierra sola. Se cierra al llamar a `cerrar()` o, más habitualmente,
en cuanto se abre cualquier otro aviso: las pantallas que muestran
«Guardando…» terminan siempre en un `exito` o un `error`, y ese aviso la
releva.

**Kind**: static method of [<code>notify</code>](#notify)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [titulo] | <code>string</code> | <code>&quot;&#x27;Guardando…&#x27;&quot;</code> | Qué se está haciendo. |

<a name="notify.cerrar"></a>

### notify.cerrar() ⇒ <code>void</code>
Cierra el aviso que esté abierto.

**Kind**: static method of [<code>notify</code>](#notify)  
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

<a name="notify.discreto"></a>

### notify.discreto(problema, [icono]) ⇒ <code>Promise</code>
Avisa de algo sin interrumpir lo que la persona está haciendo.

`error` abre un diálogo con un botón, que es lo correcto cuando el fallo es
consecuencia de algo que la persona acaba de pulsar: hay que enterarse antes
de seguir. Para un fallo de fondo —una consulta que se cayó sola, una
promesa rechazada— ese diálogo es peor que el fallo: tapa la pantalla y
obliga a descartarlo para poder seguir trabajando con lo que sí cargó.

Aparece arriba a la derecha y se va solo.

**Kind**: static method of [<code>notify</code>](#notify)  
**Returns**: <code>Promise</code> - Se resuelve cuando el aviso desaparece.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| problema | <code>string</code> \| <code>Error</code> |  | Mensaje, o el error capturado. |
| [icono] | <code>string</code> | <code>&quot;&#x27;error&#x27;&quot;</code> | Severidad del aviso: `error`, `warning`, `info`, `success`. |

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

Devuelve un booleano, para que quien llama no tenga que conocer la forma
interna del diálogo. Cerrar sin elegir cuenta como no aceptar.

El botón de cancelar va primero y el de aceptar al final, que es donde la
vista termina de leer y donde MUI pone la acción principal.

**Kind**: static method of [<code>notify</code>](#notify)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - `true` si la persona aceptó.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| opciones | <code>object</code> |  | Textos del diálogo. |
| opciones.titulo | <code>string</code> |  | Pregunta principal. |
| [opciones.mensaje] | <code>string</code> |  | Consecuencia de aceptar; conviene ser explícito. |
| [opciones.detalle] | [<code>Detalle</code>](#Detalle) |  | Contenido estructurado bajo el mensaje:   una lista de puntos, o un resumen de renglones con su total. |
| [opciones.confirmar] | <code>string</code> | <code>&quot;&#x27;Sí, continuar&#x27;&quot;</code> | Texto del botón de aceptar. |
| [opciones.cancelar] | <code>string</code> | <code>&quot;&#x27;Cancelar&#x27;&quot;</code> | Texto del botón de cancelar. |
| [opciones.peligroso] | <code>boolean</code> | <code>true</code> | Pinta de rojo el botón de aceptar. |

<a name="notify.elegir"></a>

### notify.elegir(opciones) ⇒ <code>Promise.&lt;\*&gt;</code>
Pide elegir entre dos caminos, o cancelar.

No es una confirmación: son dos acciones distintas que no se pueden
plantear como "sí o no". Reactivar un viaje, por ejemplo, es distinto según
se reactive para administrativos o para operadores.

**Kind**: static method of [<code>notify</code>](#notify)  
**Returns**: <code>Promise.&lt;\*&gt;</code> - El valor elegido, o `null` si se canceló.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| opciones | <code>object</code> |  | Textos del diálogo. |
| opciones.titulo | <code>string</code> |  | Pregunta principal. |
| [opciones.mensaje] | <code>string</code> |  | Detalle de la elección. |
| opciones.opciones | <code>Array.&lt;{valor: \*, texto: string}&gt;</code> |  | Las dos opciones, en orden. |
| [opciones.cancelar] | <code>string</code> | <code>&quot;&#x27;Cancelar&#x27;&quot;</code> | Texto del botón de cancelar. |

<a name="COLOR"></a>

## COLOR
La paleta de la aplicación.

Son los colores que ya usaban el Administrador de viajes y el Expense Manager,
que es el aspecto que el equipo quiere en toda la app. Estaban escritos a mano
en 1 212 lugares; aquí quedan con nombre para que el siguiente no tenga que
copiarlos de otra pantalla y para que un cambio de paleta sea un solo archivo.

La escala va de más oscuro a más claro, como en las escalas de grises de
cualquier sistema de diseño: `TINTA` es el texto principal y el color de
marca; `LIENZO` es el fondo de la pantalla.

**Kind**: global constant  
**Read only**: true  
<a name="MARCA"></a>

## MARCA
El azul de la barra lateral, que es la identidad de la aplicación.

No se unifica con la paleta de contenido a propósito: una navegación de color
sobre un lienzo neutro es una decisión de diseño, no un descuido. Lo que sí se
unifica es que haya **un** azul de cada cosa. Antes había dos colores de
hover que se diferenciaban en un dígito —`#4F5DDA` y `#4f5bda`—, así que el
menú cambiaba de tono según por dónde se pasara el ratón.

**Kind**: global constant  
**Read only**: true  
<a name="TINTE"></a>

## TINTE
Tintes para categorías: cuando el color es información y no decoración.

Un chip de "Refacciones" y uno de "Consumibles" tienen que distinguirse a
simple vista; unificarlos al color de marca borraría el dato. Lo que sí se
unifica es la *forma* del tinte —fondo muy claro, texto oscuro, borde
intermedio y un acento— para que todas las categorías de la app se construyan
igual, sin importar la pantalla.

**Kind**: global constant  
**Read only**: true  
<a name="SERIE"></a>

## SERIE : <code>Array.&lt;string&gt;</code>
La paleta de series para las gráficas.

Va aparte de `COLOR` a propósito. Antes las series usaban los colores de
estado —`COLOR.AVISO` para "Total Pagado"—, y eso confunde: el ámbar significa
"atención" en toda la app, y una barra de cobranza no es una advertencia. Aquí
el color solo distingue una serie de otra.

El orden importa: son los colores en el orden en que se asignan, elegidos para
distinguirse entre sí incluso en escala de grises al imprimir un reporte.

**Kind**: global constant  
**Read only**: true  
<a name="TIPO"></a>

## TIPO
Los valores de tipografía que se repiten fuera de las variantes de MUI.

**Kind**: global constant  
**Read only**: true  
<a name="BORDE"></a>

## BORDE : <code>string</code>
El borde estándar de un contenedor: 1 px del color de borde.

**Kind**: global constant  
**Read only**: true  
<a name="RELLENO_PANTALLA"></a>

## RELLENO\_PANTALLA
El relleno de una pantalla, que cambia con el ancho.

**Kind**: global constant  
**Read only**: true  
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

<a name="llaveSiguienteNumero"></a>

## llaveSiguienteNumero ⇒ <code>Array</code>
Llave de caché del siguiente número de viaje disponible.

**Kind**: global constant  
**Returns**: <code>Array</code> - La llave para `useQuery`.  

| Param | Type | Description |
| --- | --- | --- |
| pais | <code>string</code> | País del viaje. |
| anio | <code>string</code> | Año a dos dígitos. |

<a name="llaveTransnacionales"></a>

## llaveTransnacionales ⇒ <code>Array</code>
Llave de caché de los viajes transnacionales de un país.

**Kind**: global constant  
**Returns**: <code>Array</code> - La llave para `useQuery`.  

| Param | Type | Description |
| --- | --- | --- |
| pais | <code>string</code> | País a consultar. |
| anio | <code>string</code> | Año a dos dígitos. |

<a name="companiaDePrograma"></a>

## companiaDePrograma ⇒ <code>\*</code>
El id de la compañía de una programación.

**Kind**: global constant  
**Returns**: <code>\*</code> - El id, o `null` si no se pudo resolver.  

| Param | Type | Description |
| --- | --- | --- |
| programacion | <code>object</code> | La fila aprobada. |
| companias | <code>Array</code> | Las compañías activas. |

<a name="almacenDePrograma"></a>

## almacenDePrograma ⇒ <code>\*</code>
El id del almacén de destino de una programación.

**Kind**: global constant  
**Returns**: <code>\*</code> - El id, o `null` si no se pudo resolver.  

| Param | Type | Description |
| --- | --- | --- |
| programacion | <code>object</code> | La fila aprobada. |
| almacenes | <code>Array</code> | Los almacenes activos. |

<a name="paisOpuesto"></a>

## paisOpuesto ⇒ <code>string</code>
El país contrario al dado.

Un viaje transnacional continúa uno del otro lado de la frontera, así que para
buscar su pareja hay que consultar el país opuesto.

**Kind**: global constant  
**Returns**: <code>string</code> - El otro país.  

| Param | Type | Description |
| --- | --- | --- |
| pais | <code>string</code> | Un valor de `PAIS`. |

<a name="esquemaViajeTransnacional"></a>

## esquemaViajeTransnacional
Un viaje transnacional: la parte de un cruce que ocurre en un país.

`transnational_number` es lo que enlaza las dos mitades, y `movement_number`
dice cuál es cuál dentro del cruce.

**Kind**: global constant  
<a name="formatearNumeroViaje"></a>

## formatearNumeroViaje ⇒ <code>string</code>
Arma el número visible de un viaje.

El formato es `<número>-<país>-<año>`, que es como la gente lo reconoce en toda
la app: `197-US-26`.

**Kind**: global constant  
**Returns**: <code>string</code> - El número formateado.  

| Param | Type | Description |
| --- | --- | --- |
| datos | <code>object</code> | Los datos del viaje. |
| datos.numero | <code>string</code> \| <code>number</code> | Número dentro del país. |
| datos.pais | <code>string</code> | Un valor de `PAIS`. |
| datos.anio | <code>string</code> \| <code>number</code> | Año a dos dígitos. |

<a name="valorViajeTransnacional"></a>

## valorViajeTransnacional ⇒ <code>string</code>
El valor con el que se identifica un viaje en el selector de cruces.

**Kind**: global constant  
**Returns**: <code>string</code> - Su número de cruce, o el del viaje si aún no tiene.  

| Param | Type | Description |
| --- | --- | --- |
| viaje | [<code>ViajeTransnacional</code>](#ViajeTransnacional) | El viaje a identificar. |

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
<a name="llaveResumen"></a>

## llaveResumen ⇒ <code>Array</code>
Llave de caché del resumen por viaje de un tipo.

**Kind**: global constant  
**Returns**: <code>Array</code> - La llave para `useQuery`.  

| Param | Type | Description |
| --- | --- | --- |
| tipo | <code>string</code> | Un valor de `TIPO_REGISTRO`. |

<a name="llaveRegistros"></a>

## llaveRegistros ⇒ <code>Array</code>
Llave de caché de los registros de un viaje.

**Kind**: global constant  
**Returns**: <code>Array</code> - La llave para `useQuery`.  

| Param | Type | Description |
| --- | --- | --- |
| tipo | <code>string</code> | Un valor de `TIPO_REGISTRO`. |
| tripId | <code>string</code> | Viaje a consultar. |

<a name="llaveRegistro"></a>

## llaveRegistro ⇒ <code>Array</code>
Llave de caché de un registro suelto.

**Kind**: global constant  
**Returns**: <code>Array</code> - La llave para `useQuery`.  

| Param | Type | Description |
| --- | --- | --- |
| tipo | <code>string</code> | Un valor de `TIPO_REGISTRO`. |
| id | <code>string</code> | Registro a consultar. |

<a name="useGuardarRegistro"></a>

## useGuardarRegistro ⇒ <code>object</code>
Guarda un registro.

**Kind**: global constant  
**Returns**: <code>object</code> - El resultado de `useMutation`.  

| Param | Type | Description |
| --- | --- | --- |
| tipo | <code>string</code> | Un valor de `TIPO_REGISTRO`. |

<a name="useEliminarRegistro"></a>

## useEliminarRegistro ⇒ <code>object</code>
Elimina un registro.

**Kind**: global constant  
**Returns**: <code>object</code> - El resultado de `useMutation`.  

| Param | Type | Description |
| --- | --- | --- |
| tipo | <code>string</code> | Un valor de `TIPO_REGISTRO`. |

<a name="useCrearRegistroManual"></a>

## useCrearRegistroManual ⇒ <code>object</code>
Da de alta una carga manual.

**Kind**: global constant  
**Returns**: <code>object</code> - El resultado de `useMutation`.  

| Param | Type | Description |
| --- | --- | --- |
| tipo | <code>string</code> | Un valor de `TIPO_REGISTRO`. |

<a name="LLAVE_GASTOS"></a>

## LLAVE\_GASTOS : <code>Array</code>
Llave de caché de la lista de gastos generales.

**Kind**: global constant  
<a name="llaveGasto"></a>

## llaveGasto ⇒ <code>Array</code>
Llave de caché de un gasto suelto.

**Kind**: global constant  
**Returns**: <code>Array</code> - La llave para `useQuery`.  

| Param | Type | Description |
| --- | --- | --- |
| idGasto | <code>string</code> | Gasto a consultar. |

<a name="obtenerCatalogo"></a>

## obtenerCatalogo ⇒ <code>Promise.&lt;Array&gt;</code>
Pide uno de los catálogos del formulario de gastos.

Los cuatro viven en el mismo endpoint y devuelven `{value, label}`, así que
comparten una sola función.

**Kind**: global constant  
**Returns**: <code>Promise.&lt;Array&gt;</code> - El catálogo, o `[]` si no vino.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la petición falla.

**Endpoint**: POST save_expense.php  

| Param | Type | Description |
| --- | --- | --- |
| op | <code>string</code> | La operación del catálogo. |
| [opciones] | <code>object</code> | Ajustes de la petición. |
| [opciones.signal] | <code>AbortSignal</code> | Señal de cancelación. |

<a name="TODOS"></a>

## TODOS : <code>string</code>
El valor de los filtros que significa "no filtrar por esto".

**Kind**: global constant  
<a name="renglonesDe"></a>

## renglonesDe ⇒ <code>Array</code>
Los renglones de un gasto, siempre como lista.

**Kind**: global constant  
**Returns**: <code>Array</code> - Sus renglones.  

| Param | Type | Description |
| --- | --- | --- |
| gasto | <code>object</code> | El gasto. |

<a name="paisesDe"></a>

## paisesDe ⇒ <code>Array.&lt;string&gt;</code>
Los países que aparecen en los gastos, para el selector.

Salen de los datos y no de una lista fija: si mañana se captura un gasto de
otro país, aparece solo.

**Kind**: global constant  
**Returns**: <code>Array.&lt;string&gt;</code> - `All` y los países, ordenados.  

| Param | Type | Description |
| --- | --- | --- |
| [gastos] | <code>Array</code> | Los gastos. |

<a name="etiquetasDe"></a>

## etiquetasDe ⇒ <code>Array.&lt;string&gt;</code>
Las etiquetas de un catálogo, ordenadas en español.

**Kind**: global constant  
**Returns**: <code>Array.&lt;string&gt;</code> - `All` y las etiquetas.  

| Param | Type | Description |
| --- | --- | --- |
| [catalogo] | <code>Array</code> | El catálogo con `{value, label}`. |

<a name="filaPorEtiqueta"></a>

## filaPorEtiqueta ⇒ <code>object</code> \| <code>null</code>
Busca en un catálogo la fila que corresponde a una etiqueta.

Los filtros guardan la etiqueta, no el id, porque es lo que se ve; para
encadenar tipo → categoría → subcategoría hace falta volver al id.

**Kind**: global constant  
**Returns**: <code>object</code> \| <code>null</code> - La fila, o `null`.  

| Param | Type | Description |
| --- | --- | --- |
| [catalogo] | <code>Array</code> | El catálogo. |
| etiqueta | <code>string</code> | La etiqueta elegida. |

<a name="ordenarGastos"></a>

## ordenarGastos ⇒ <code>Array</code>
Ordena los gastos por la columna elegida.

**Kind**: global constant  
**Returns**: <code>Array</code> - Los gastos ordenados.  

| Param | Type | Description |
| --- | --- | --- |
| gastos | <code>Array</code> | Los gastos a ordenar. |
| orden | <code>object</code> | `{campo, dir}`; `dir` en `null` deja el orden original. |
| mxnRate | <code>number</code> \| <code>string</code> | El tipo de cambio, para la columna en pesos. |

<a name="esquemaResumenViaje"></a>

## esquemaResumenViaje
Un renglón del resumen: lo que un viaje lleva gastado o cargado.

**Kind**: global constant  
<a name="identificadorViaje"></a>

## identificadorViaje ⇒ <code>string</code>
Cómo se identifica un viaje en pantalla.

La nomenclatura completa —`200-US-26`— es lo que la gente reconoce; el número
a secas es el respaldo para los viajes viejos que no la tienen.

**Kind**: global constant  
**Returns**: <code>string</code> - El identificador visible.  

| Param | Type | Description |
| --- | --- | --- |
| fila | <code>object</code> | Un renglón del resumen o del detalle. |

<a name="totalDe"></a>

## totalDe ⇒ <code>number</code>
Lo que suman los renglones visibles.

**Kind**: global constant  
**Returns**: <code>number</code> - El total.  

| Param | Type | Description |
| --- | --- | --- |
| [filas] | <code>Array</code> | Los renglones. |

<a name="esManual"></a>

## esManual ⇒ <code>boolean</code>
Indica si una carga de diesel se capturó a mano.

Las que llegan solas vienen del proveedor; las manuales las escribió alguien,
y por eso se marcan.

**Kind**: global constant  
**Returns**: <code>boolean</code> - `true` si es manual.  

| Param | Type | Description |
| --- | --- | --- |
| registro | <code>object</code> | El registro de diesel. |

<a name="CATALOGO_REGISTRO"></a>

## CATALOGO\_REGISTRO : <code>Object.&lt;string, object&gt;</code>
Los descriptores de los dos tipos, por su clave.

**Kind**: global constant  
<a name="esGastoMXN"></a>

## esGastoMXN ⇒ <code>boolean</code>
Indica si un gasto se capturó en pesos.

**Kind**: global constant  
**Returns**: <code>boolean</code> - `true` si la moneda es MXN.  

| Param | Type | Description |
| --- | --- | --- |
| gasto | <code>object</code> | El gasto a revisar. |

<a name="totalDeDetalles"></a>

## totalDeDetalles ⇒ <code>number</code>
Lo que suman los renglones de un gasto.

Es el respaldo de `totalUSD` cuando el total guardado viene en cero.

**Kind**: global constant  
**Returns**: <code>number</code> - La suma de cantidad por precio unitario.  

| Param | Type | Description |
| --- | --- | --- |
| gasto | <code>object</code> | El gasto con sus detalles. |

<a name="totalUSD"></a>

## totalUSD ⇒ <code>number</code>
El total de un gasto en dólares.

Todos los gastos se guardan convertidos a dólares en `monto_total`, sea cual
sea la moneda en que se capturaron. Cuando ese campo viene en cero se recurre
a la suma de los renglones.

**Kind**: global constant  
**Returns**: <code>number</code> - El total en dólares.  

| Param | Type | Description |
| --- | --- | --- |
| gasto | <code>object</code> | El gasto a sumar. |

<a name="totalMXN"></a>

## totalMXN ⇒ <code>Object</code>
El total de un gasto en pesos.

Un gasto capturado en México ya trae la cantidad en pesos que se pagó de
verdad —`cantidad_original`—, y esa es la que vale. Uno capturado en dólares
se convierte con el tipo de cambio del día, y se marca como convertido para
que en pantalla se distinga de una cifra real.

**Kind**: global constant  
**Returns**: <code>Object</code> - El importe y si se convirtió.  

| Param | Type | Description |
| --- | --- | --- |
| gasto | <code>object</code> | El gasto a convertir. |
| mxnRate | <code>number</code> \| <code>string</code> | El tipo de cambio del día. |

<a name="tipoGastoPrincipal"></a>

## tipoGastoPrincipal ⇒ <code>string</code>
El tipo de gasto con el que se identifica un gasto de varios renglones.

Se toma el **último** renglón, no el primero: es el criterio que ya usaba la
pantalla y con el que la gente lee la tabla.

**Kind**: global constant  
**Returns**: <code>string</code> - El tipo, o cadena vacía si no hay renglones.  

| Param | Type | Description |
| --- | --- | --- |
| gasto | <code>object</code> | El gasto a etiquetar. |

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
<a name="LLAVE_COTIZACIONES"></a>

## LLAVE\_COTIZACIONES : <code>Array</code>
Llave de caché del historial de cotizaciones.

**Kind**: global constant  
<a name="ubicacionVacia"></a>

## ubicacionVacia ⇒ [<code>Ubicacion</code>](#Ubicacion)
Una ubicación vacía, la que abre cada campo.

**Kind**: global constant  
**Returns**: [<code>Ubicacion</code>](#Ubicacion) - La ubicación en blanco.  
<a name="millasTotales"></a>

## millasTotales ⇒ <code>number</code>
Las millas totales de una cotización: las del viaje más las vacías.

Las millas vacías son las que el camión recorre para llegar al origen de la
carga. Se cobran igual, así que entran en el total.

**Kind**: global constant  
**Returns**: <code>number</code> - El total.  

| Param | Type | Description |
| --- | --- | --- |
| [millasViaje] | <code>number</code> | Millas del recorrido cargado. |
| [millasVacias] | <code>number</code> | Millas hasta el origen. |

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

<a name="LLAVE_TABLERO"></a>

## LLAVE\_TABLERO : <code>Array</code>
Llave de caché del tablero de disponibilidad.

**Kind**: global constant  
<a name="LLAVE_PROGRAMACIONES"></a>

## LLAVE\_PROGRAMACIONES : <code>Array</code>
Llave de caché de las programaciones guardadas.

**Kind**: global constant  
<a name="NUEVO_LAREDO"></a>

## NUEVO\_LAREDO : <code>Object</code>
El patio desde donde salen y a donde vuelven los viajes.

Todas las distancias que se muestran al programar se miden contra este punto:
qué tan lejos está cada camión de poder empezar el siguiente viaje.

**Kind**: global constant  
<a name="valorCaja"></a>

## valorCaja ⇒ <code>string</code>
El valor con el que una caja se identifica dentro del selector.

**Kind**: global constant  
**Returns**: <code>string</code> - El valor con su prefijo.  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> \| <code>number</code> | El id de la caja. |
| externa | <code>boolean</code> | Si es de la flota externa. |

<a name="programacionEnBlanco"></a>

## programacionEnBlanco ⇒ <code>object</code>
Una programación en blanco, la que abre el modal al dar de alta.

**Kind**: global constant  
**Returns**: <code>object</code> - El formulario vacío.  
<a name="estaDisponible"></a>

## estaDisponible ⇒ <code>boolean</code>
Indica si una unidad está libre para programarse.

El tablero marca como no disponibles las que ya están en un viaje.

**Kind**: global constant  
**Returns**: <code>boolean</code> - `true` si se puede asignar.  

| Param | Type | Description |
| --- | --- | --- |
| unidad | <code>object</code> | Un camión o un operador del tablero. |

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

<a name="REFRESCO_FLOTA_MS"></a>

## REFRESCO\_FLOTA\_MS : <code>number</code>
Cada cuánto se vuelve a preguntar dónde está la flota.

El GPS reporta cada minuto largo, así que pedir más seguido no da datos más
frescos: solo carga el servidor.

**Kind**: global constant  
<a name="TIMEOUT_GPS_MS"></a>

## TIMEOUT\_GPS\_MS : <code>number</code>
Cuánto se le espera al GPS antes de darlo por perdido.

`Tracking.php` tarda unos **21 segundos** medidos contra producción, por
encima del tiempo que la app da por omisión: con el límite general, el mapa se
quedaba cargando y fallaba sin que nada explicara por qué. Se le da margen
propio en lugar de subir el de toda la aplicación.

**Kind**: global constant  
<a name="LLAVE_FLOTA"></a>

## LLAVE\_FLOTA : <code>Array</code>
Llave de caché de la flota.

**Kind**: global constant  
<a name="llaveParadas"></a>

## llaveParadas ⇒ <code>Array</code>
Llave de caché de las paradas de una etapa.

Incluye la parada actual porque el estado de cada una se calcula a partir de
ella: sin eso, avanzar de parada seguiría mostrando el avance anterior.

**Kind**: global constant  
**Returns**: <code>Array</code> - La llave para `useQuery`.  

| Param | Type | Description |
| --- | --- | --- |
| viaje | <code>string</code> | Número del viaje. |
| etapa | <code>string</code> | Número de la etapa. |
| [paradaActual] | <code>string</code> | Próxima parada pendiente. |

<a name="SERVICIO_RUTAS"></a>

## SERVICIO\_RUTAS : <code>string</code>
Servicio público de rutas por carretera.

Es la instancia de demostración de OSRM: gratuita, sin llave, y sin ninguna
garantía de disponibilidad. Si el trazador deja de funcionar, empieza por
comprobar que este servicio siga en pie.

**Kind**: global constant  
<a name="SERVICIO_LUGARES"></a>

## SERVICIO\_LUGARES : <code>string</code>
Servicio público de búsqueda de lugares.

**Kind**: global constant  
<a name="MAXIMO_LUGARES"></a>

## MAXIMO\_LUGARES : <code>number</code>
Cuántos lugares se ofrecen al escribir una dirección.

**Kind**: global constant  
<a name="COLORES_UNIDAD"></a>

## COLORES\_UNIDAD : <code>Array.&lt;string&gt;</code>
Colores con los que se distinguen las unidades en el mapa y en la lista.

Se asignan por posición, así que una unidad conserva su color mientras la
flota no cambie de tamaño. Son diez: con más unidades, los colores se repiten.

**Kind**: global constant  
<a name="CAPACIDAD_POR_OMISION"></a>

## CAPACIDAD\_POR\_OMISION : <code>number</code>
Capacidad que se asume cuando la unidad no tiene tanque configurado.

**Kind**: global constant  
<a name="colorEstado"></a>

## colorEstado ⇒ <code>string</code>
El color con el que se pinta un estado de viaje.

**Kind**: global constant  
**Returns**: <code>string</code> - El color; el azul oscuro de la marca si el estado no se reconoce.  

| Param | Type | Description |
| --- | --- | --- |
| estado | <code>string</code> | El estado tal como viene de la base. |

<a name="esquemaUnidadGps"></a>

## esquemaUnidadGps
Una unidad tal como la reporta el GPS.

Los nombres de campo son los de Wialon: `nm` es el nombre, y `pos` trae la
posición con `y` = latitud y `x` = longitud, al revés de lo habitual.

**Kind**: global constant  
<a name="esquemaUnidadTablero"></a>

## esquemaUnidadTablero
Una unidad tal como la conoce IMA, con su telemetría.

**Kind**: global constant  
<a name="SIN_DIRECCION"></a>

## SIN\_DIRECCION : <code>Array.&lt;string&gt;</code>
Textos con los que el GPS dice "no pude resolver la calle".

Vienen en el campo de la dirección como si fueran una, así que hay que
reconocerlos: si no, la pantalla enseña `Unknown address` en las once unidades
en lugar de las coordenadas, que sí sirven para localizar el camión.

**Kind**: global constant  
<a name="ESTATUS_TODOS"></a>

## ESTATUS\_TODOS : <code>string</code>
Opción del filtro que no descarta nada.

**Kind**: global constant  
<a name="ESTATUS_SIN_VIAJE"></a>

## ESTATUS\_SIN\_VIAJE : <code>string</code>
Opción del filtro para las unidades sin viaje asignado.

No es un estatus de la base: es la ausencia de viaje, y por eso se resuelve
aparte en vez de comparar contra la columna.

**Kind**: global constant  
<a name="ESTATUS_TABLERO"></a>

## ESTATUS\_TABLERO : <code>Array.&lt;string&gt;</code>
Los estatus por los que se puede filtrar el tablero, en el orden del ciclo.

**Kind**: global constant  
<a name="ESPERA_BUSQUEDA_MS"></a>

## ESPERA\_BUSQUEDA\_MS : <code>number</code>
Cuánto se espera antes de buscar una dirección mientras se escribe.

Nominatim pide no más de una petición por segundo por cliente; medio segundo
de espera basta para no dispararle una por tecla.

**Kind**: global constant  
<a name="puntoDesdeMapa"></a>

## puntoDesdeMapa ⇒ [<code>PuntoRuta</code>](#PuntoRuta)
Convierte un clic en el mapa en un punto de ruta.

**Kind**: global constant  
**Returns**: [<code>PuntoRuta</code>](#PuntoRuta) - El punto, nombrado por sus coordenadas.  

| Param | Type | Description |
| --- | --- | --- |
| latlng | <code>object</code> | El punto que reportó Leaflet, con `lat` y `lng`. |

<a name="puntoDesdeUnidad"></a>

## puntoDesdeUnidad ⇒ [<code>PuntoRuta</code>](#PuntoRuta)
Convierte una unidad de la flota en un punto de ruta.

**Kind**: global constant  
**Returns**: [<code>PuntoRuta</code>](#PuntoRuta) - El punto, con el id para reconocerlo después.  

| Param | Type | Description |
| --- | --- | --- |
| unidad | <code>object</code> | La unidad seleccionada. |

<a name="METROS_POR_MILLA"></a>

## METROS\_POR\_MILLA : <code>number</code>
Cuántos metros tiene una milla.

Las tarifas de IMA se cotizan por milla aunque el servicio de rutas conteste
en metros, así que la conversión aparece en cada pantalla que calcula un
precio.

**Kind**: global constant  
<a name="llaveViajeUpcoming"></a>

## llaveViajeUpcoming ⇒ <code>Array</code>
Llave de caché del detalle de un viaje próximo.

**Kind**: global constant  
**Returns**: <code>Array</code> - La llave para `useQuery`.  

| Param | Type | Description |
| --- | --- | --- |
| tripId | <code>string</code> | Viaje a consultar. |

<a name="llaveResumenViaje"></a>

## llaveResumenViaje ⇒ <code>Array</code>
Llave de caché del resumen de un viaje.

**Kind**: global constant  
**Returns**: <code>Array</code> - La llave para `useQuery`.  

| Param | Type | Description |
| --- | --- | --- |
| tripId | <code>string</code> | Viaje a consultar. |

<a name="llaveViajes"></a>

## llaveViajes ⇒ <code>Array</code>
Llave de caché de una página de la lista de viajes.

**Kind**: global constant  
**Returns**: <code>Array</code> - La llave para `useQuery`.  

| Param | Type | Description |
| --- | --- | --- |
| consulta | <code>object</code> | Pestaña, página, tamaño y filtros. |

<a name="PREFIJO_ID_NUEVO"></a>

## PREFIJO\_ID\_NUEVO : <code>string</code>
Prefijo que llevan las etapas y paradas creadas en el navegador.

La API asigna el id real al guardar, así que estos ids provisionales deben
viajar como `null`: si se mandan tal cual, el backend intenta actualizar una
fila inexistente en vez de insertarla.

**Kind**: global constant  
<a name="esNuevo"></a>

## esNuevo ⇒ <code>boolean</code>
Indica si un id es provisional, de algo que todavía no existe en la base.

**Kind**: global constant  
**Returns**: <code>boolean</code> - `true` si aún no se ha guardado.  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>\*</code> | El id a evaluar. |

<a name="idParaGuardar"></a>

## idParaGuardar ⇒ <code>\*</code>
El id que debe viajar a la API: el real, o `null` si es provisional.

**Kind**: global constant  
**Returns**: <code>\*</code> - El id, o `null`.  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>\*</code> | El id a convertir. |

<a name="normalizarTipoDocumento"></a>

## normalizarTipoDocumento ⇒ <code>string</code>
Corrige el tipo de documento de los adjuntos guardados con la llave vieja.

`BorderCrossingFormNew2` guardó durante un tiempo `orden_de_retiro` en lugar
de `orden_retiro`. Los documentos ya subidos con la llave vieja siguen en la
base; sin esta corrección desaparecen del detalle de la etapa.

**Kind**: global constant  
**Returns**: <code>string</code> - El tipo con el que trabaja la pantalla.  

| Param | Type | Description |
| --- | --- | --- |
| tipo | <code>string</code> | El tipo tal como vino de la API. |

<a name="nombreDeArchivo"></a>

## nombreDeArchivo ⇒ <code>string</code>
El nombre del archivo dentro de una ruta del servidor.

Las rutas llegan con separadores de Windows o de Unix según cómo se subió el
archivo, así que se cortan por los dos.

**Kind**: global constant  
**Returns**: <code>string</code> - Solo el nombre.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| ruta | <code>string</code> |  | Ruta o nombre completo. |
| [porOmision] | <code>string</code> | <code>&quot;&#x27;Archivo existente&#x27;&quot;</code> | Qué devolver si no hay ruta. |

<a name="TIPO_ETAPA_POR_OMISION"></a>

## TIPO\_ETAPA\_POR\_OMISION : <code>string</code>
El tipo de etapa por omisión cuando la API no lo dice.

**Kind**: global constant  
<a name="PESTANAS_VIAJES"></a>

## PESTANAS\_VIAJES : <code>Array.&lt;{id: number, etiqueta: string, permiso: string}&gt;</code>
Las pestañas del administrador de viajes.

El `id` es el `tabValue` que espera la API, no la posición en pantalla: la
programación es la primera que se ve pero la última que se agregó, de ahí que
su id sea el 4.

Cada pestaña se muestra solo si la persona tiene su permiso.

**Kind**: global constant  
<a name="PESTANA_PROGRAMACION"></a>

## PESTANA\_PROGRAMACION : <code>number</code>
El id de la pestaña de programación, que no lista viajes sino programaciones.

**Kind**: global constant  
<a name="PESTANA_PROXIMOS"></a>

## PESTANA\_PROXIMOS : <code>number</code>
El id de la pestaña de próximos, cuya edición va a otra pantalla.

**Kind**: global constant  
<a name="pestanasPermitidas"></a>

## pestanasPermitidas ⇒ <code>Array</code>
Las pestañas que una persona puede ver, según sus permisos.

**Kind**: global constant  
**Returns**: <code>Array</code> - Las pestañas visibles, en el orden de `PESTANAS_VIAJES`.  

| Param | Type | Description |
| --- | --- | --- |
| [permisos] | <code>object</code> | Los permisos de la sesión. |

<a name="FILTROS_VIAJES"></a>

## FILTROS\_VIAJES : <code>Array.&lt;string&gt;</code>
Los filtros de la lista de viajes, con el nombre que espera la API.

**Kind**: global constant  
<a name="DIRECCION_TODAS"></a>

## DIRECCION\_TODAS : <code>string</code>
El valor del filtro de dirección que significa "no filtrar".

**Kind**: global constant  
<a name="utilidadNeta"></a>

## utilidadNeta ⇒ <code>number</code>
Lo que queda del viaje después de pagarle también al conductor.

La utilidad del backend no lo descuenta, así que este es el número que hay
que mirar para saber qué deja el viaje de verdad.

**Kind**: global constant  
**Returns**: <code>number</code> - La utilidad menos el pago al conductor.  

| Param | Type | Description |
| --- | --- | --- |
| totales | [<code>TotalesViaje</code>](#TotalesViaje) | Los totales del viaje. |

<a name="etapasDeResumen"></a>

## etapasDeResumen ⇒ <code>Array</code>
Las etapas de un resumen, siempre como lista.

**Kind**: global constant  
**Returns**: <code>Array</code> - Las etapas.  

| Param | Type | Description |
| --- | --- | --- |
| [resumen] | <code>object</code> | La respuesta de `trip_summary`. |

<a name="dieselDeResumen"></a>

## dieselDeResumen ⇒ <code>Array</code>
Las cargas de diesel de un resumen.

**Kind**: global constant  
**Returns**: <code>Array</code> - Las cargas.  

| Param | Type | Description |
| --- | --- | --- |
| [resumen] | <code>object</code> | La respuesta de `trip_summary`. |

<a name="gastosDeResumen"></a>

## gastosDeResumen ⇒ <code>Array</code>
Los gastos de un resumen.

**Kind**: global constant  
**Returns**: <code>Array</code> - Los gastos.  

| Param | Type | Description |
| --- | --- | --- |
| [resumen] | <code>object</code> | La respuesta de `trip_summary`. |

<a name="galonesDeResumen"></a>

## galonesDeResumen ⇒ <code>number</code>
Los galones cargados en el viaje.

**Kind**: global constant  
**Returns**: <code>number</code> - Los galones.  

| Param | Type | Description |
| --- | --- | --- |
| [resumen] | <code>object</code> | La respuesta de `trip_summary`. |

<a name="ESTADO_POR_OMISION"></a>

## ESTADO\_POR\_OMISION : <code>string</code>
El estado que se asume cuando el viaje no trae ninguno.

**Kind**: global constant  
<a name="colorEstadoViaje"></a>

## colorEstadoViaje ⇒ <code>string</code>
El color con el que se marca el estado de un viaje.

**Kind**: global constant  
**Returns**: <code>string</code> - Su color, o un gris si el estado no se reconoce.  

| Param | Type | Description |
| --- | --- | --- |
| [estado] | <code>string</code> | El estado del viaje. |

<a name="etiquetaTipoEtapa"></a>

## etiquetaTipoEtapa ⇒ <code>string</code>
El nombre de un tipo de etapa, tal como se lee en pantalla.

**Kind**: global constant  
**Returns**: <code>string</code> - El nombre, o el propio valor si no se reconoce.  

| Param | Type | Description |
| --- | --- | --- |
| [tipo] | <code>string</code> | El tipo tal como vino de la base. |

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

<a name="llaveUnidades"></a>

## llaveUnidades ⇒ <code>Array</code>
Llave de caché del expediente de un tipo de unidad.

**Kind**: global constant  
**Returns**: <code>Array</code> - La llave para `useQuery`.  

| Param | Type | Description |
| --- | --- | --- |
| tipo | <code>string</code> | Un valor de `TIPO_UNIDAD`. |

<a name="useGuardarUnidad"></a>

## useGuardarUnidad ⇒ <code>object</code>
Guarda una unidad.

**Kind**: global constant  
**Returns**: <code>object</code> - El resultado de `useMutation`.  

| Param | Type | Description |
| --- | --- | --- |
| tipo | <code>string</code> | Un valor de `TIPO_UNIDAD`. |

<a name="useEliminarUnidad"></a>

## useEliminarUnidad ⇒ <code>object</code>
Elimina una unidad.

**Kind**: global constant  
**Returns**: <code>object</code> - El resultado de `useMutation`.  

| Param | Type | Description |
| --- | --- | --- |
| tipo | <code>string</code> | Un valor de `TIPO_UNIDAD`. |

<a name="useDarDeBaja"></a>

## useDarDeBaja ⇒ <code>object</code>
Da de baja a un conductor.

**Kind**: global constant  
**Returns**: <code>object</code> - El resultado de `useMutation`.  

| Param | Type | Description |
| --- | --- | --- |
| tipo | <code>string</code> | Un valor de `TIPO_UNIDAD`. |

<a name="useCrearRequisito"></a>

## useCrearRequisito ⇒ <code>object</code>
Crea un requisito del expediente.

**Kind**: global constant  
**Returns**: <code>object</code> - El resultado de `useMutation`.  

| Param | Type | Description |
| --- | --- | --- |
| tipo | <code>string</code> | Un valor de `TIPO_UNIDAD`. |

<a name="useEliminarRequisito"></a>

## useEliminarRequisito ⇒ <code>object</code>
Elimina un requisito del expediente.

**Kind**: global constant  
**Returns**: <code>object</code> - El resultado de `useMutation`.  

| Param | Type | Description |
| --- | --- | --- |
| tipo | <code>string</code> | Un valor de `TIPO_UNIDAD`. |

<a name="useCambiarVisibilidadColumna"></a>

## useCambiarVisibilidadColumna ⇒ <code>object</code>
Muestra u oculta una columna.

**Kind**: global constant  
**Returns**: <code>object</code> - El resultado de `useMutation`.  

| Param | Type | Description |
| --- | --- | --- |
| tipo | <code>string</code> | Un valor de `TIPO_UNIDAD`. |

<a name="DIAS_AVISO_VENCIMIENTO"></a>

## DIAS\_AVISO\_VENCIMIENTO : <code>number</code>
Con cuántos días de antelación se avisa de un vencimiento.

**Kind**: global constant  
<a name="colorCategoria"></a>

## colorCategoria ⇒ <code>string</code>
El color con el que se subraya una categoría de requisitos.

**Kind**: global constant  
**Returns**: <code>string</code> - Su color, o el ámbar de "Otros".  

| Param | Type | Description |
| --- | --- | --- |
| categoria | <code>string</code> | La categoría del requisito. |

<a name="esquemaRequisito"></a>

## esquemaRequisito
Un requisito del expediente: qué documento se le pide a una unidad.

`oculto_en_tabla` solo existe en camiones y conductores. En cajas la columna
no está en la base, así que llega como ausente y se trata como visible.

**Kind**: global constant  
<a name="esquemaDocumento"></a>

## esquemaDocumento
Un documento subido contra un requisito.

**Kind**: global constant  
<a name="esFechaCero"></a>

## esFechaCero ⇒ <code>boolean</code>
Indica si una fecha es la "fecha cero" de MySQL.

`0000-00-00` significa **sin fecha**, no una fecha antigua. Hay 158
documentos de conductores guardados así, y `new Date("0000-00-00")` no es una
fecha válida: la resta daba `NaN`, ninguna comparación se cumplía y los 158
se pintaban en verde con la leyenda "Vigente hasta 0000-00-00".

**Kind**: global constant  
**Returns**: <code>boolean</code> - `true` si es la fecha cero.  

| Param | Type | Description |
| --- | --- | --- |
| fecha | <code>\*</code> | La fecha a revisar. |

<a name="categoriasDe"></a>

## categoriasDe ⇒ <code>Array.&lt;string&gt;</code>
Las categorías presentes en un expediente, sin repetir y en orden de aparición.

**Kind**: global constant  
**Returns**: <code>Array.&lt;string&gt;</code> - Las categorías.  

| Param | Type | Description |
| --- | --- | --- |
| [requisitos] | <code>Array</code> | Los requisitos del expediente. |

<a name="requisitosDeCategoria"></a>

## requisitosDeCategoria ⇒ <code>Array</code>
Los requisitos de una categoría.

**Kind**: global constant  
**Returns**: <code>Array</code> - Los requisitos de esa categoría.  

| Param | Type | Description |
| --- | --- | --- |
| [requisitos] | <code>Array</code> | Los requisitos del expediente. |
| categoria | <code>string</code> | La categoría a filtrar. |

<a name="CATALOGO_UNIDAD"></a>

## CATALOGO\_UNIDAD : <code>Object.&lt;string, DescriptorUnidad&gt;</code>
Los descriptores de los tres tipos, por su clave.

**Kind**: global constant  
<a name="estadoConductor"></a>

## estadoConductor ⇒ <code>string</code>
El estado de un conductor, tratando el ausente como activo.

La columna se agregó después de dar de alta a la plantilla, así que quien no
la tiene es porque nunca se le dio de baja.

**Kind**: global constant  
**Returns**: <code>string</code> - Un valor de `ESTADO_CONDUCTOR`.  

| Param | Type | Description |
| --- | --- | --- |
| conductor | <code>object</code> | El conductor a evaluar. |

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

<a name="money"></a>

## money ⇒ <code>string</code>
Un importe en dólares.

**Kind**: global constant  
**Returns**: <code>string</code> - El importe formateado.  

| Param | Type | Description |
| --- | --- | --- |
| v | <code>\*</code> | La cantidad. |

<a name="moneyMXN"></a>

## moneyMXN ⇒ <code>string</code>
Un importe en pesos.

Va en `es-MX` a propósito, no en `en-US` como el de dólares: es la cifra que
se compara contra facturas mexicanas.

**Kind**: global constant  
**Returns**: <code>string</code> - El importe formateado.  

| Param | Type | Description |
| --- | --- | --- |
| v | <code>\*</code> | La cantidad. |

<a name="COLOR_PUNTO_1"></a>

## COLOR\_PUNTO\_1 : <code>string</code>
Color del primer punto de la ruta, el que marca la unidad de partida.

**Kind**: global constant  
<a name="COLOR_PUNTO_2"></a>

## COLOR\_PUNTO\_2 : <code>string</code>
Color del segundo punto de la ruta, el destino.

**Kind**: global constant  
<a name="AJUSTES_MODO"></a>

## AJUSTES\_MODO : <code>Object.&lt;string, object&gt;</code>
Lo que cambia entre los dos modos de edición.

**Kind**: global constant  
<a name="DOCUMENTOS_SIN_VENCIMIENTO"></a>

## DOCUMENTOS\_SIN\_VENCIMIENTO : <code>Array.&lt;string&gt;</code>
Documentos que no vencen, así que su modal no pide fecha.

**Kind**: global constant  
<a name="pideVencimiento"></a>

## pideVencimiento ⇒ <code>boolean</code>
Indica si un tipo de documento tiene fecha de vencimiento.

**Kind**: global constant  
**Returns**: <code>boolean</code> - `true` si hay que pedir la fecha.  

| Param | Type | Description |
| --- | --- | --- |
| tipo | <code>string</code> | El tipo de documento. |

<a name="ESTADOS_FACTURABLES"></a>

## ESTADOS\_FACTURABLES : <code>Array.&lt;string&gt;</code>
Estados de viaje en los que se puede generar una factura.

**Kind**: global constant  
<a name="admiteFacturas"></a>

## admiteFacturas ⇒ <code>boolean</code>
Indica si un viaje admite que se le generen facturas.

**Kind**: global constant  
**Returns**: <code>boolean</code> - `true` si se puede facturar.  

| Param | Type | Description |
| --- | --- | --- |
| estado | <code>string</code> | El estado del viaje. |

<a name="estadoPorCi"></a>

## estadoPorCi ⇒ <code>string</code>
El estado que le toca a una etapa de cruce según tenga número de CI.

Una etapa de cruce arranca "In Coming" y pasa a "In Transit" en cuanto se le
captura el CI: es lo que marca que el cruce ya se hizo.

**Kind**: global constant  
**Returns**: <code>string</code> - El estado que corresponde.  

| Param | Type | Description |
| --- | --- | --- |
| numeroCi | <code>string</code> | El número de CI capturado. |

<a name="construirFormData"></a>

## construirFormData(op, [payload]) ⇒ <code>FormData</code>
Convierte un objeto plano en el `FormData` que espera la API PHP.

Omite `undefined` y `null` en vez de mandarlos: `FormData` los serializa como
las cadenas `"undefined"` y `"null"`, y PHP las recibe como texto, que es de
donde salen los campos con el literal "undefined" guardado en la base.
Los booleanos van como `1`/`0`, que es lo que el backend interpreta.

Todo texto pasa antes por `limpiarProfundo`, que le quita los caracteres
invisibles y de control y lo normaliza. Se hace aquí, en el único punto por el
que salen las 232 llamadas, para que ninguna pantalla tenga que acordarse.
**No recorta el largo**: el límite depende de la columna, así que lo pone
quien conoce el campo, no esta función; truncar aquí perdería datos en
silencio, que es justo lo que se quiere evitar.

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
  el cuerpo no es JSON, o la API responde `status: 'error'`. Una cancelación
  desde fuera —cambiar de pantalla, `StrictMode`— llega con causa
  `CANCELADA`, no como tiempo agotado: son cosas distintas y confundirlas
  hacía que un cambio de pantalla se registrara como servidor lento.


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
| [opciones.timeoutMs] | <code>number</code> |  | Sobrescribe el timeout por omisión. |

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

## crearQueryClient([opciones]) ⇒ <code>object</code>
Crea el cliente de TanStack Query con la configuración del proyecto.

Se crea con una función y no como constante de módulo para que cada test
pueda tener el suyo: una caché compartida entre tests los vuelve dependientes
del orden en que corren.

**Kind**: global function  
**Returns**: <code>object</code> - Cliente de TanStack Query listo para el provider.  

| Param | Type | Description |
| --- | --- | --- |
| [opciones] | <code>object</code> | Ajustes del cliente. |
| [opciones.alFallar] | <code>function</code> | Qué hacer cuando una consulta falla y   nadie más lo atrapó. Se inyecta para no acoplar la capa de API a la de UI, y   para que las pruebas puedan comprobar que se llama. |

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

<a name="moneda"></a>

## moneda(valor, [codigo], [locale]) ⇒ <code>string</code>
Formatea una cantidad como dinero.

Un valor ausente o ilegible se muestra como cero, no como `NaN`: en una
columna de importes, un cero se entiende y un `NaN` asusta.

**Kind**: global function  
**Returns**: <code>string</code> - La cantidad formateada.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| valor | <code>\*</code> |  | La cantidad. |
| [codigo] | <code>string</code> | <code>&quot;&#x27;USD&#x27;&quot;</code> | Código de la moneda. |
| [locale] | <code>string</code> | <code>&quot;&#x27;es-MX&#x27;&quot;</code> | Convención de formato. |

<a name="fechaHora"></a>

## fechaHora(valor, [locale]) ⇒ <code>string</code>
Formatea una fecha con su hora.

**Kind**: global function  
**Returns**: <code>string</code> - La fecha y hora, o una raya si no hay fecha válida.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| valor | <code>\*</code> |  | La fecha, como la manda la API. |
| [locale] | <code>string</code> | <code>&quot;&#x27;es-MX&#x27;&quot;</code> | Convención de formato. |

<a name="soloFecha"></a>

## soloFecha(valor, [locale]) ⇒ <code>string</code>
Formatea una fecha sin hora.

**Kind**: global function  
**Returns**: <code>string</code> - La fecha, o una raya si no hay fecha válida.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| valor | <code>\*</code> |  | La fecha, como la manda la API. |
| [locale] | <code>string</code> | <code>&quot;&#x27;es-MX&#x27;&quot;</code> | Convención de formato. |

<a name="decimales"></a>

## decimales(valor, [cuantos]) ⇒ <code>string</code>
Formatea una cantidad con decimales fijos.

**Kind**: global function  
**Returns**: <code>string</code> - La cantidad, o `0.00` si no es un número.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| valor | <code>\*</code> |  | La cantidad. |
| [cuantos] | <code>number</code> | <code>2</code> | Cuántos decimales. |

<a name="exportarElementoAPdf"></a>

## exportarElementoAPdf(parametros) ⇒ <code>Promise.&lt;void&gt;</code>
Convierte un trozo de la pantalla en un PDF y lo abre en una pestaña nueva.

Es una foto del DOM, no un documento generado: sirve cuando lo que se quiere
imprimir es exactamente lo que se ve, con su maquetación.

Los elementos marcados con [CLASE_NO_IMPRIMIR](#CLASE_NO_IMPRIMIR) se ocultan y **siempre**
se vuelven a mostrar, incluso si la captura falla. Sin eso, un error dejaba
los botones ocultos hasta recargar la página.

**Kind**: global function  
**Returns**: <code>Promise.&lt;void&gt;</code> - Se resuelve cuando el PDF está abierto.  
**Throws**:

- <code>Error</code> Si no hay elemento que capturar.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| parametros | <code>object</code> |  | Qué capturar y cómo llamarlo. |
| parametros.elemento | <code>HTMLElement</code> |  | El trozo de pantalla a capturar. |
| parametros.nombreArchivo | <code>string</code> |  | Nombre del PDF, sin extensión. |
| [parametros.escala] | <code>number</code> | <code>2</code> | Resolución de la captura. |

<a name="pesoLegible"></a>

## pesoLegible(bytes) ⇒ <code>string</code>
Convierte bytes a un texto legible.

**Kind**: global function  
**Returns**: <code>string</code> - Por ejemplo `2.4 MB`.  

| Param | Type | Description |
| --- | --- | --- |
| bytes | <code>number</code> | La cantidad. |

<a name="primerosBytes"></a>

## primerosBytes(archivo, [cuantos]) ⇒ <code>Promise.&lt;Uint8Array&gt;</code>
Lee los primeros bytes de un archivo.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Uint8Array&gt;</code> - Los bytes leídos.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| archivo | <code>File</code> |  | El archivo a leer. |
| [cuantos] | <code>number</code> | <code>8</code> | Cuántos bytes leer. |

<a name="coincideFirma"></a>

## coincideFirma(bytes, firma) ⇒ <code>boolean</code>
Indica si unos bytes empiezan con una firma dada.

**Kind**: global function  
**Returns**: <code>boolean</code> - `true` si coincide.  

| Param | Type | Description |
| --- | --- | --- |
| bytes | <code>Uint8Array</code> | Los bytes del archivo. |
| firma | <code>Array.&lt;number&gt;</code> | La secuencia esperada. |

<a name="validarArchivo"></a>

## validarArchivo(archivo, [opciones]) ⇒ [<code>Promise.&lt;ResultadoArchivo&gt;</code>](#ResultadoArchivo)
Valida un archivo antes de subirlo: tamaño, extensión y contenido real.

Las tres comprobaciones son distintas y ninguna sobra. El tamaño evita el
fallo mudo de PHP. La extensión da un mensaje claro cuando alguien se
equivoca de archivo. La firma binaria es la única que resiste a alguien que
renombra a propósito.

**Kind**: global function  
**Returns**: [<code>Promise.&lt;ResultadoArchivo&gt;</code>](#ResultadoArchivo) - Si se puede subir, y si no, por qué.  

| Param | Type | Description |
| --- | --- | --- |
| archivo | <code>File</code> | El archivo elegido. |
| [opciones] | <code>object</code> | Ajustes. |
| [opciones.grupo] | <code>Array.&lt;string&gt;</code> | Tipos aceptados; por omisión, documento. |
| [opciones.maximoBytes] | <code>number</code> | Tamaño máximo; por omisión, `TAMANO_MAXIMO_BYTES`. |

**Example**  
```js
const r = await validarArchivo(file, { grupo: GRUPOS_ARCHIVO.SOLO_PDF })
if (!r.valido) return notify.error(r.motivo)
```
<a name="validarArchivos"></a>

## validarArchivos(archivos, [opciones]) ⇒ <code>Promise.&lt;{aceptados: Array.&lt;File&gt;, rechazados: Array.&lt;{archivo: File, motivo: string}&gt;}&gt;</code>
Valida varios archivos y separa los que pasan de los que no.

Los modales de inspecciones y reparaciones aceptan selección múltiple; que un
archivo malo tire los demás sería peor que avisar de cuál falló.

**Kind**: global function  
**Returns**: <code>Promise.&lt;{aceptados: Array.&lt;File&gt;, rechazados: Array.&lt;{archivo: File, motivo: string}&gt;}&gt;</code> - El reparto.  

| Param | Type | Description |
| --- | --- | --- |
| archivos | <code>Array.&lt;File&gt;</code> | Los archivos elegidos. |
| [opciones] | <code>object</code> | Los mismos que [validarArchivo](#validarArchivo). |

<a name="archivosDelEvento"></a>

## archivosDelEvento(evento, [opciones]) ⇒ <code>Promise.&lt;Array.&lt;File&gt;&gt;</code>
Toma los archivos de un `<input type="file">`, los valida y avisa de los malos.

Existe porque las 16 subidas de la app hacen hoy lo mismo —`e.target.files`
directo al estado— y ninguna comprueba nada. Concentrarlo aquí evita repetir
la validación en cada pantalla y, sobre todo, evita olvidarla en la siguiente.

Limpia el valor del input al terminar: sin eso, volver a elegir el mismo
archivo después de un rechazo no dispara `change` y parece que la app se colgó.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array.&lt;File&gt;&gt;</code> - Solo los archivos que pasaron.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| evento | <code>Event</code> |  | El `change` del input. |
| [opciones] | <code>object</code> |  | Ajustes. |
| [opciones.grupo] | <code>Array.&lt;string&gt;</code> |  | Tipos aceptados; por omisión, documento. |
| [opciones.maximoBytes] | <code>number</code> |  | Tamaño máximo por archivo. |
| [opciones.avisar] | <code>boolean</code> | <code>true</code> | Si muestra el aviso de los rechazados. |

**Example**  
```js
onChange={async (e) => setFiles(await archivosDelEvento(e, { grupo: GRUPOS_ARCHIVO.SOLO_PDF }))}
```
<a name="archivoDelEvento"></a>

## archivoDelEvento(evento, [opciones]) ⇒ <code>Promise.&lt;(File\|null)&gt;</code>
Igual que [archivosDelEvento](#archivosDelEvento), para los inputs de un solo archivo.

**Kind**: global function  
**Returns**: <code>Promise.&lt;(File\|null)&gt;</code> - El archivo si pasó, o `null`.  

| Param | Type | Description |
| --- | --- | --- |
| evento | <code>Event</code> | El `change` del input. |
| [opciones] | <code>object</code> | Los mismos que [archivosDelEvento](#archivosDelEvento). |

**Example**  
```js
onChange={async (e) => { const f = await archivoDelEvento(e); if (f) onArchivo(f) }}
```
<a name="limpiarTexto"></a>

## limpiarTexto(valor, [largoMaximo]) ⇒ <code>string</code>
Limpia un texto que va a viajar a la API.

Lo que hace y lo que no:

- **Quita caracteres de control y de ancho cero**, por lo dicho arriba.
- **Normaliza a NFC.** Sin esto, «José» escrito de dos formas distintas son
  dos cadenas distintas para la base.
- **Recorta espacios de los extremos** y colapsa los saltos de línea sobrantes.
- **No escapa comillas ni palabras de SQL.** Escapar aquí no protege nada \u2014la
  API no autentica, cualquiera puede saltarse el navegador con un `curl`\u2014 y sí
  rompe datos legítimos: apellidos como O'Brien, o una nota que mencione
  "select". La inyección se cierra con sentencias preparadas en el backend.

**Kind**: global function  
**Returns**: <code>string</code> - El texto limpio, o cadena vacía si no era texto.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| valor | <code>\*</code> |  | El texto tal como lo escribió la persona. |
| [largoMaximo] | <code>number</code> | <code>LARGO_MAXIMO.MEDIO</code> | Cuántos caracteres se conservan. |

**Example**  
```js
limpiarTexto('  Nuevo Laredo  ') // 'Nuevo Laredo'
```
<a name="tieneInvisibles"></a>

## tieneInvisibles(valor) ⇒ <code>boolean</code>
Indica si un texto trae caracteres que no se ven.

Sirve para avisarle a la persona que lo que pegó traía basura invisible, en
vez de limpiárselo callando y que después no entienda por qué cambió su texto.

**Kind**: global function  
**Returns**: <code>boolean</code> - `true` si hay caracteres invisibles o de control.  

| Param | Type | Description |
| --- | --- | --- |
| valor | <code>\*</code> | El texto a revisar. |

<a name="limpiarProfundo"></a>

## limpiarProfundo(valor, [largoMaximo]) ⇒ <code>\*</code>
Limpia todos los valores de texto de un objeto, sin tocar el resto.

Se aplica en la capa de API, así que ninguna pantalla tiene que acordarse.
Respeta `File`, `Blob`, números, booleanos y `null`, que la capa de API ya
sabe serializar, y baja por objetos y arreglos anidados.

**Kind**: global function  
**Returns**: <code>\*</code> - La misma forma, con los textos limpios.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| valor | <code>\*</code> |  | El objeto, arreglo o valor suelto a limpiar. |
| [largoMaximo] | <code>number</code> | <code>LARGO_MAXIMO.NOTA</code> | El límite para cada texto. |

<a name="esUrlSegura"></a>

## esUrlSegura(url) ⇒ <code>boolean</code>
Indica si una URL se puede abrir sin riesgo.

Importa más de lo normal en esta app: la API viaja por HTTP en claro, así que
un intermediario en la red puede cambiar la ruta de un documento por un
`javascript:...`. En un `<a href>` de Electron eso se ejecuta con los permisos
del renderer. Toda URL que venga de la API pasa por aquí antes de llegar al DOM.

Las rutas relativas se aceptan: no llevan protocolo, así que no pueden
ejecutar nada, y son la forma normal de enlazar dentro de la propia app. Las
que empiezan con `//` no, porque heredan el protocolo de la página.

**Kind**: global function  
**Returns**: <code>boolean</code> - `true` si es relativa o usa un protocolo de la lista blanca.  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>\*</code> | La URL a evaluar; puede ser cualquier cosa. |

**Example**  
```js
esUrlSegura('https://imaexpressllc.com/doc.pdf') // true
esUrlSegura('javascript:alert(1)')               // false
```
<a name="pedir"></a>

## pedir(peticion) ⇒ <code>Promise.&lt;\*&gt;</code>
Encola un diálogo y espera a que la persona responda.

Cierra el indicador de carga si lo hay: es el comportamiento que tenía
sweetalert2 —un diálogo nuevo reemplazaba al anterior— y del que dependen las
pantallas que abren «Guardando…» y terminan mostrando el resultado sin cerrar
el indicador a mano.

**Kind**: global function  
**Returns**: <code>Promise.&lt;\*&gt;</code> - El valor de la acción elegida.  

| Param | Type | Description |
| --- | --- | --- |
| peticion | <code>object</code> | El diálogo a mostrar. |

<a name="responder"></a>

## responder(id, valor) ⇒ <code>void</code>
Responde al diálogo indicado y lo saca de la cola.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>number</code> | Identificador del diálogo. |
| valor | <code>\*</code> | Lo que devuelve la promesa de `pedir`. |

<a name="abrirCargando"></a>

## abrirCargando(titulo) ⇒ <code>void</code>
Abre el indicador de carga que bloquea la pantalla.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| titulo | <code>string</code> | Qué se está haciendo. |

<a name="cerrarAbierto"></a>

## cerrarAbierto() ⇒ <code>void</code>
Cierra el indicador de carga y el diálogo que esté abierto.

**Kind**: global function  
<a name="anunciar"></a>

## anunciar(aviso, [duracion]) ⇒ <code>Promise</code>
Encola un aviso flotante, de los que se van solos.

El temporizador vive aquí y no en el componente para que el aviso se retire
—y su promesa se resuelva— aunque nadie lo esté pintando.

**Kind**: global function  
**Returns**: <code>Promise</code> - Se resuelve cuando el aviso desaparece.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| aviso | <code>object</code> |  | El aviso a mostrar. |
| [duracion] | <code>number</code> | <code>DURACION_FLOTANTE_MS</code> | Milisegundos en pantalla. |

<a name="retirar"></a>

## retirar(id) ⇒ <code>void</code>
Retira un aviso flotante.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>number</code> | Identificador del aviso. |

<a name="reiniciar"></a>

## reiniciar() ⇒ <code>void</code>
Vacía la cola sin resolver nada. Existe para aislar las pruebas entre sí.

**Kind**: global function  
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
<a name="crearCompania"></a>

## crearCompania(nombre) ⇒ <code>Promise.&lt;object&gt;</code>
Da de alta una compañía desde el propio selector.

Quien está capturando un viaje descubre que la compañía no está dada de alta
justo cuando la necesita; poder crearla ahí evita abandonar el formulario a
medias.

**Kind**: global function  
**Returns**: <code>Promise.&lt;object&gt;</code> - La compañía creada, con su id.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API rechaza el alta.

**Endpoint**: POST companies.php · op=CreateCompany  

| Param | Type | Description |
| --- | --- | --- |
| nombre | <code>string</code> | Nombre de la compañía. |

<a name="useCrearCompania"></a>

## useCrearCompania() ⇒ <code>object</code>
Da de alta una compañía y refresca el catálogo.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useMutation`.  
<a name="obtenerSiguienteNumero"></a>

## obtenerSiguienteNumero(parametros) ⇒ <code>Promise.&lt;(number\|null)&gt;</code>
Pide el siguiente número de viaje libre para un país y año.

Los parámetros se llaman `country_code` y `trip_year`, no `pais` ni `anio`: la
API rechaza la petición si se mandan con otro nombre.

**Kind**: global function  
**Returns**: <code>Promise.&lt;(number\|null)&gt;</code> - El siguiente número, o `null` si no vino.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API falla.

**Endpoint**: POST new_tripsv2.php · op=get_next_trip_number  

| Param | Type | Description |
| --- | --- | --- |
| parametros | <code>object</code> | Datos de la consulta. |
| parametros.pais | <code>string</code> | Un valor de `PAIS`. |
| parametros.anio | <code>string</code> | Año a dos dígitos. |
| [parametros.signal] | <code>AbortSignal</code> | Señal de cancelación. |

<a name="obtenerViajesTransnacionales"></a>

## obtenerViajesTransnacionales(parametros) ⇒ <code>Promise.&lt;Array&gt;</code>
Trae los viajes transnacionales de un país, para enlazar un cruce.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array&gt;</code> - Los viajes normalizados.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API falla.

**Endpoint**: POST new_tripsv2.php · op=get_transnational_trips  

| Param | Type | Description |
| --- | --- | --- |
| parametros | <code>object</code> | Datos de la consulta. |
| parametros.pais | <code>string</code> | Un valor de `PAIS`. |
| parametros.anio | <code>string</code> | Año a dos dígitos. |
| [parametros.signal] | <code>AbortSignal</code> | Señal de cancelación. |

<a name="eliminarProgramacion"></a>

## eliminarProgramacion(programacionId) ⇒ <code>Promise.&lt;object&gt;</code>
Elimina una programación aprobada tras convertirla en viaje.

**Kind**: global function  
**Returns**: <code>Promise.&lt;object&gt;</code> - La respuesta de la API.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API rechaza la operación.

**Endpoint**: POST Programacion_viajes.php · op=delete  

| Param | Type | Description |
| --- | --- | --- |
| programacionId | <code>string</code> | Programación a borrar. |

<a name="useSiguienteNumero"></a>

## useSiguienteNumero(pais, anio) ⇒ <code>object</code>
Siguiente número de viaje. No consulta hasta tener país y año.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useQuery`.  

| Param | Type | Description |
| --- | --- | --- |
| pais | <code>string</code> | Un valor de `PAIS`. |
| anio | <code>string</code> | Año a dos dígitos. |

<a name="useViajesTransnacionales"></a>

## useViajesTransnacionales(pais, anio) ⇒ <code>object</code>
Viajes transnacionales de un país. No consulta hasta tener país y año.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useQuery`.  

| Param | Type | Description |
| --- | --- | --- |
| pais | <code>string</code> | Un valor de `PAIS`. |
| anio | <code>string</code> | Año a dos dígitos. |

<a name="useEliminarProgramacion"></a>

## useEliminarProgramacion() ⇒ <code>object</code>
Elimina una programación e invalida lo que dependa de ella.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useMutation`.  
<a name="resolverIdDeCatalogo"></a>

## resolverIdDeCatalogo(catalogo, campos) ⇒ <code>\*</code>
Busca un id en un catálogo, primero por id y luego por nombre.

Una fila de programación no siempre trae el id de la compañía o del almacén:
a veces solo llegó el nombre escrito. Buscar por las dos vías es lo que evita
que el formulario se abra con el campo vacío y la persona lo vuelva a teclear.

**Kind**: global function  
**Returns**: <code>\*</code> - El id encontrado, o `null`.  

| Param | Type | Description |
| --- | --- | --- |
| catalogo | <code>Array</code> | Las opciones vigentes. |
| campos | <code>object</code> | Cómo leer el catálogo y el dato a buscar. |
| campos.campoId | <code>string</code> | Nombre de la propiedad que guarda el id. |
| campos.campoNombre | <code>string</code> | Nombre de la propiedad que guarda el nombre. |
| campos.id | <code>\*</code> | El id que trae la programación, si lo trae. |
| campos.nombre | <code>string</code> | El nombre que trae la programación. |

<a name="datosInicialesDesdePrograma"></a>

## datosInicialesDesdePrograma(programacion) ⇒ <code>object</code> \| <code>undefined</code>
Los datos del viaje precargados desde una programación aprobada.

Una caja externa y una propia son excluyentes: se rellena la que la
programación indique, y la otra queda vacía para que no viajen las dos.

**Kind**: global function  
**Returns**: <code>object</code> \| <code>undefined</code> - Los campos precargados, o nada si no hay programación.  

| Param | Type | Description |
| --- | --- | --- |
| programacion | <code>object</code> | La fila aprobada. |

<a name="etapaInicialDesdePrograma"></a>

## etapaInicialDesdePrograma(programacion, catalogos) ⇒ <code>object</code> \| <code>undefined</code>
La primera etapa precargada desde una programación aprobada.

**Kind**: global function  
**Returns**: <code>object</code> \| <code>undefined</code> - La etapa precargada, o nada si no hay programación.  

| Param | Type | Description |
| --- | --- | --- |
| programacion | <code>object</code> | La fila aprobada. |
| catalogos | <code>object</code> | Los catálogos con los que resolver los ids. |
| catalogos.companias | <code>Array</code> | Las compañías activas. |
| catalogos.almacenes | <code>Array</code> | Los almacenes activos. |

<a name="anioDosDigitos"></a>

## anioDosDigitos([fecha]) ⇒ <code>string</code>
El año a dos dígitos, que es el formato que usa la API.

**Kind**: global function  
**Returns**: <code>string</code> - Los dos últimos dígitos del año.  

| Param | Type | Description |
| --- | --- | --- |
| [fecha] | <code>Date</code> \| <code>number</code> \| <code>string</code> | Fecha o año; por omisión, hoy. |

<a name="agruparPorCruce"></a>

## agruparPorCruce(viajes) ⇒ <code>Array.&lt;{numero: string, viajes: Array}&gt;</code>
Agrupa los viajes transnacionales por su número de cruce.

Sirve para ver las dos mitades juntas: un cruce completo tiene una de cada
país, y uno a medias tiene solo una.

**Kind**: global function  
**Returns**: <code>Array.&lt;{numero: string, viajes: Array}&gt;</code> - Los cruces.  

| Param | Type | Description |
| --- | --- | --- |
| viajes | [<code>Array.&lt;ViajeTransnacional&gt;</code>](#ViajeTransnacional) | Los viajes a agrupar. |

<a name="normalizarViajesTransnacionales"></a>

## normalizarViajesTransnacionales(filas) ⇒ <code>Object</code>
Valida la lista de viajes transnacionales descartando lo que no cumple.

**Kind**: global function  
**Returns**: <code>Object</code> - Los válidos y cuántos se cayeron.  

| Param | Type | Description |
| --- | --- | --- |
| filas | <code>Array</code> | Lo que vino en la respuesta. |

<a name="etiquetaViajeTransnacional"></a>

## etiquetaViajeTransnacional(viaje) ⇒ <code>string</code>
Cómo se lista un viaje al vincular un cruce.

El formato completo —`197-US-63T2-26`— solo se puede armar si el viaje tiene
número de cruce; sin él se muestra el número a secas, que es lo único que lo
identifica.

**Kind**: global function  
**Returns**: <code>string</code> - El texto de la opción.  

| Param | Type | Description |
| --- | --- | --- |
| viaje | [<code>ViajeTransnacional</code>](#ViajeTransnacional) | El viaje a describir. |

<a name="siguienteMovimiento"></a>

## siguienteMovimiento(viaje) ⇒ <code>string</code>
El movimiento que le toca a la continuación de un viaje.

Cada mitad de un cruce lleva su número de movimiento; la que se está creando
continúa la anterior. Si el viaje elegido no trae movimiento, se deja vacío
para que la persona lo escriba.

**Kind**: global function  
**Returns**: <code>string</code> - El siguiente movimiento, o cadena vacía.  

| Param | Type | Description |
| --- | --- | --- |
| viaje | [<code>ViajeTransnacional</code>](#ViajeTransnacional) | El viaje que se continúa. |

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
<a name="listaDe"></a>

## listaDe(cuerpo, campo) ⇒ <code>Array</code>
Saca la lista de una respuesta de `formularios.php`.

**Kind**: global function  
**Returns**: <code>Array</code> - La lista, o `[]` si no vino.  

| Param | Type | Description |
| --- | --- | --- |
| cuerpo | <code>object</code> | La respuesta. |
| campo | <code>string</code> | Un valor de `CAMPO_RESPUESTA`. |

<a name="obtenerResumen"></a>

## obtenerResumen(parametros) ⇒ <code>Promise.&lt;Array&gt;</code>
El resumen por viaje: cuánto lleva cada uno y de cuándo es lo último.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array&gt;</code> - Un renglón por viaje.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la petición falla.

**Endpoint**: POST formularios.php · op=getAll_gastos | getAll_diesel  

| Param | Type | Description |
| --- | --- | --- |
| parametros | <code>object</code> | Datos de la consulta. |
| parametros.tipo | <code>string</code> | Un valor de `TIPO_REGISTRO`. |
| [parametros.signal] | <code>AbortSignal</code> | Señal de cancelación. |

<a name="obtenerRegistros"></a>

## obtenerRegistros(parametros) ⇒ <code>Promise.&lt;Array&gt;</code>
Los registros de un viaje.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array&gt;</code> - Los registros del viaje.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la petición falla.

**Endpoint**: POST formularios.php · op=get_registers_gasto | get_registers_diesel  

| Param | Type | Description |
| --- | --- | --- |
| parametros | <code>object</code> | Datos de la consulta. |
| parametros.tipo | <code>string</code> | Un valor de `TIPO_REGISTRO`. |
| parametros.tripId | <code>string</code> | Viaje a consultar. |
| [parametros.signal] | <code>AbortSignal</code> | Señal de cancelación. |

<a name="obtenerRegistro"></a>

## obtenerRegistro(parametros) ⇒ <code>Promise.&lt;object&gt;</code>
Un registro suelto, el que se va a editar.

La API lo devuelve dentro de un arreglo de un solo elemento, en un campo
llamado `row`.

**Kind**: global function  
**Returns**: <code>Promise.&lt;object&gt;</code> - El registro.  
**Throws**:

- <code>Error</code> Si el registro no existe.
- [<code>ApiError</code>](#ApiError) Si la petición falla.

**Endpoint**: POST formularios.php · op=get_gasto | get_diesel  

| Param | Type | Description |
| --- | --- | --- |
| parametros | <code>object</code> | Datos de la consulta. |
| parametros.tipo | <code>string</code> | Un valor de `TIPO_REGISTRO`. |
| parametros.id | <code>string</code> | Registro a consultar. |
| parametros.tripId | <code>string</code> | Viaje al que pertenece. |
| [parametros.signal] | <code>AbortSignal</code> | Señal de cancelación. |

<a name="obtenerTickets"></a>

## obtenerTickets(parametros) ⇒ <code>Promise.&lt;Array&gt;</code>
Los tickets escaneados de un registro.

Es la única operación del endpoint que devuelve la lista en `data`.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array&gt;</code> - Los tickets, o `[]` si no hay.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la petición falla.

**Endpoint**: POST formularios.php · op=getTickets  

| Param | Type | Description |
| --- | --- | --- |
| parametros | <code>object</code> | Datos de la consulta. |
| parametros.tipo | <code>string</code> | Un valor de `TIPO_REGISTRO`. |
| parametros.id | <code>string</code> | Registro del que son los tickets. |
| parametros.tripId | <code>string</code> | Viaje al que pertenece. |
| [parametros.signal] | <code>AbortSignal</code> | Señal de cancelación. |

<a name="guardarRegistro"></a>

## guardarRegistro(parametros) ⇒ <code>Promise.&lt;object&gt;</code>
Guarda los cambios de un registro.

**Kind**: global function  
**Returns**: <code>Promise.&lt;object&gt;</code> - La respuesta de la API.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API rechaza el guardado.

**Endpoint**: POST formularios.php · op=edit_gasto | edit_diesel  

| Param | Type | Description |
| --- | --- | --- |
| parametros | <code>object</code> | Datos del guardado. |
| parametros.tipo | <code>string</code> | Un valor de `TIPO_REGISTRO`. |
| parametros.registro | <code>object</code> | Los campos del formulario. |

<a name="eliminarRegistro"></a>

## eliminarRegistro(parametros) ⇒ <code>Promise.&lt;object&gt;</code>
Elimina un registro.

**Kind**: global function  
**Returns**: <code>Promise.&lt;object&gt;</code> - La respuesta de la API.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API rechaza el borrado.

**Endpoint**: POST formularios.php · op=delete_gasto | delete_diesel  

| Param | Type | Description |
| --- | --- | --- |
| parametros | <code>object</code> | Datos del borrado. |
| parametros.tipo | <code>string</code> | Un valor de `TIPO_REGISTRO`. |
| parametros.id | <code>string</code> | Registro a borrar. |
| [parametros.tripId] | <code>string</code> | Viaje al que pertenece. |

<a name="crearRegistroManual"></a>

## crearRegistroManual(parametros) ⇒ <code>Promise.&lt;object&gt;</code>
Da de alta una carga de diesel capturada a mano.

Solo el diesel lo admite: los gastos se capturan desde la aplicación móvil.

**Kind**: global function  
**Returns**: <code>Promise.&lt;object&gt;</code> - La respuesta de la API.  
**Throws**:

- <code>Error</code> Si el tipo no admite altas manuales.
- [<code>ApiError</code>](#ApiError) Si la API rechaza el alta.

**Endpoint**: POST formularios.php · op=add_manual_diesel  

| Param | Type | Description |
| --- | --- | --- |
| parametros | <code>object</code> | Datos del alta. |
| parametros.tipo | <code>string</code> | Un valor de `TIPO_REGISTRO`. |
| parametros.registro | <code>object</code> | Los campos de la carga. |

<a name="useResumen"></a>

## useResumen(tipo) ⇒ <code>object</code>
El resumen por viaje de un tipo.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useQuery`.  

| Param | Type | Description |
| --- | --- | --- |
| tipo | <code>string</code> | Un valor de `TIPO_REGISTRO`. |

<a name="useRegistros"></a>

## useRegistros(tipo, tripId) ⇒ <code>object</code>
Los registros de un viaje. No consulta hasta tener el viaje.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useQuery`.  

| Param | Type | Description |
| --- | --- | --- |
| tipo | <code>string</code> | Un valor de `TIPO_REGISTRO`. |
| tripId | <code>string</code> | Viaje a consultar. |

<a name="useRegistro"></a>

## useRegistro(tipo, id, tripId) ⇒ <code>object</code>
Un registro suelto. No consulta hasta tener el id.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useQuery`.  

| Param | Type | Description |
| --- | --- | --- |
| tipo | <code>string</code> | Un valor de `TIPO_REGISTRO`. |
| id | <code>string</code> | Registro a consultar. |
| tripId | <code>string</code> | Viaje al que pertenece. |

<a name="useTickets"></a>

## useTickets(tipo, id, tripId) ⇒ <code>object</code>
Los tickets de un registro. No consulta hasta tener el id.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useQuery`.  

| Param | Type | Description |
| --- | --- | --- |
| tipo | <code>string</code> | Un valor de `TIPO_REGISTRO`. |
| id | <code>string</code> | Registro del que son. |
| tripId | <code>string</code> | Viaje al que pertenece. |

<a name="useMutacionRegistro"></a>

## useMutacionRegistro(tipo, accion) ⇒ <code>object</code>
Crea la mutación de un tipo, refrescando todo lo suyo al terminar.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useMutation`.  

| Param | Type | Description |
| --- | --- | --- |
| tipo | <code>string</code> | Un valor de `TIPO_REGISTRO`. |
| accion | <code>function</code> | La función que hace la llamada. |

<a name="obtenerGastos"></a>

## obtenerGastos([opciones]) ⇒ <code>Promise.&lt;Array&gt;</code>
Todos los gastos generales, con sus renglones y sus tickets.

La API los devuelve completos de una vez —1 638 al escribir esto—, así que
filtrar y ordenar se hace en el navegador y no hay ida y vuelta por página.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array&gt;</code> - Los gastos, o `[]` si no hay.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la petición falla.

**Endpoint**: POST save_expense.php · op=getAllGastos  

| Param | Type | Description |
| --- | --- | --- |
| [opciones] | <code>object</code> | Ajustes de la petición. |
| [opciones.signal] | <code>AbortSignal</code> | Señal de cancelación. |

<a name="obtenerGasto"></a>

## obtenerGasto(parametros) ⇒ <code>Promise.&lt;object&gt;</code>
Un gasto con todo su detalle, el que se va a editar.

**Kind**: global function  
**Returns**: <code>Promise.&lt;object&gt;</code> - El gasto.  
**Throws**:

- <code>Error</code> Si el gasto no existe.
- [<code>ApiError</code>](#ApiError) Si la petición falla.

**Endpoint**: POST save_expense.php · op=getGastoById  

| Param | Type | Description |
| --- | --- | --- |
| parametros | <code>object</code> | Datos de la consulta. |
| parametros.idGasto | <code>string</code> | Gasto a consultar. |
| [parametros.signal] | <code>AbortSignal</code> | Señal de cancelación. |

<a name="crearGasto"></a>

## crearGasto(gasto) ⇒ <code>Promise.&lt;object&gt;</code>
Da de alta un gasto con sus renglones y sus archivos.

**Kind**: global function  
**Returns**: <code>Promise.&lt;object&gt;</code> - La respuesta de la API.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API rechaza el alta.

**Endpoint**: POST save_expense.php · op=Alta  

| Param | Type | Description |
| --- | --- | --- |
| gasto | <code>object</code> | Los campos del formulario, ya listos para la API. |

<a name="actualizarGasto"></a>

## actualizarGasto(gasto) ⇒ <code>Promise.&lt;object&gt;</code>
Guarda los cambios de un gasto.

**Kind**: global function  
**Returns**: <code>Promise.&lt;object&gt;</code> - La respuesta de la API.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API rechaza el guardado.

**Endpoint**: POST save_expense.php · op=updateExpense  

| Param | Type | Description |
| --- | --- | --- |
| gasto | <code>object</code> | Los campos del formulario, con su `id_gasto`. |

<a name="useGastos"></a>

## useGastos() ⇒ <code>object</code>
Todos los gastos generales.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useQuery`.  
<a name="useGasto"></a>

## useGasto(idGasto) ⇒ <code>object</code>
Un gasto suelto. No consulta hasta tener el id.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useQuery`.  

| Param | Type | Description |
| --- | --- | --- |
| idGasto | <code>string</code> | Gasto a consultar. |

<a name="useCatalogoGastos"></a>

## useCatalogoGastos(op) ⇒ <code>object</code>
Uno de los catálogos del formulario.

Es un catálogo: se cachea [FRESCURA_CATALOGO_MS](#FRESCURA_CATALOGO_MS) y se comparte, así que
el modal de alta y la barra de filtros lo piden una sola vez entre los dos.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useQuery`.  

| Param | Type | Description |
| --- | --- | --- |
| op | <code>string</code> | Un valor de `CATALOGO_GASTOS`. |

<a name="useCrearGasto"></a>

## useCrearGasto() ⇒ <code>object</code>
Da de alta un gasto y refresca la lista.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useMutation`.  
<a name="useActualizarGasto"></a>

## useActualizarGasto() ⇒ <code>object</code>
Guarda un gasto y refresca la lista.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useMutation`.  
<a name="algunRenglon"></a>

## algunRenglon(gasto, cumple) ⇒ <code>boolean</code>
Indica si alguno de los renglones de un gasto cumple algo.

Un gasto con varios renglones entra en el filtro si **cualquiera** de ellos
coincide: se factura junto pero puede mezclar categorías.

**Kind**: global function  
**Returns**: <code>boolean</code> - `true` si algún renglón cumple.  

| Param | Type | Description |
| --- | --- | --- |
| gasto | <code>object</code> | El gasto a revisar. |
| cumple | <code>function</code> | Qué se le pide a un renglón. |

<a name="filtrarGastos"></a>

## filtrarGastos([gastos], [filtros]) ⇒ <code>Array</code>
Filtra los gastos con todo lo que hay puesto en la barra.

El buscador mira el folio, el país y la moneda; la descripción se busca
aparte y **sin acentos**, porque se captura a mano y la mitad de las veces
llega sin ellos.

**Kind**: global function  
**Returns**: <code>Array</code> - Los gastos que quedan.  

| Param | Type | Description |
| --- | --- | --- |
| [gastos] | <code>Array</code> | Los gastos a filtrar. |
| [filtros] | <code>object</code> | Lo que hay puesto en la barra. |

<a name="categoriasDeTipo"></a>

## categoriasDeTipo([categorias], [tipo]) ⇒ <code>Array.&lt;string&gt;</code>
Las categorías que cuelgan de un tipo de gasto.

Sin tipo elegido se ofrecen todas; con uno, solo las suyas. Es lo que evita
que alguien filtre por una combinación que no existe.

**Kind**: global function  
**Returns**: <code>Array.&lt;string&gt;</code> - `All` y las categorías que aplican.  

| Param | Type | Description |
| --- | --- | --- |
| [categorias] | <code>Array</code> | Todas las categorías. |
| [tipo] | <code>object</code> | El tipo elegido, con su `value`. |

<a name="subcategoriasDeCategoria"></a>

## subcategoriasDeCategoria([subcategorias], [categoria]) ⇒ <code>Array.&lt;string&gt;</code>
Las subcategorías que cuelgan de una categoría.

Sin categoría elegida no se ofrece ninguna: el selector se esconde en vez de
enseñar las 41 sueltas.

**Kind**: global function  
**Returns**: <code>Array.&lt;string&gt;</code> - Las subcategorías que aplican, sin `All`.  

| Param | Type | Description |
| --- | --- | --- |
| [subcategorias] | <code>Array</code> | Todas las subcategorías. |
| [categoria] | <code>object</code> | La categoría elegida, con su `value`. |

<a name="totalesDe"></a>

## totalesDe([gastos], aPesos) ⇒ <code>Object</code>
Lo que suman los gastos visibles, en dólares y en pesos.

`sinConversion` cuenta los que no se pudieron pasar a pesos porque no había
tipo de cambio: sin ese dato, el total en pesos estaría incompleto y hay que
decirlo en vez de enseñar una cifra que engaña.

**Kind**: global function  
**Returns**: <code>Object</code> - Los totales.  

| Param | Type | Description |
| --- | --- | --- |
| [gastos] | <code>Array</code> | Los gastos visibles. |
| aPesos | <code>function</code> | Recibe un gasto y devuelve `{valor, esConvertido}`. |

<a name="filtrarResumen"></a>

## filtrarResumen([filas], filtros) ⇒ <code>Array</code>
Filtra el resumen por país y por lo escrito en el buscador.

El buscador mira el viaje y el conductor, que es como se busca de verdad:
"el gasto de aquel viaje" o "lo que cargó fulano".

**Kind**: global function  
**Returns**: <code>Array</code> - Los renglones que quedan.  

| Param | Type | Description |
| --- | --- | --- |
| [filas] | <code>Array</code> | Los renglones del resumen. |
| filtros | <code>object</code> | Lo que hay puesto. |
| [filtros.pais] | <code>string</code> | Un valor de `PAIS_REGISTRO`. |
| [filtros.busqueda] | <code>string</code> | Lo escrito en el buscador. |

<a name="pendientesDe"></a>

## pendientesDe(fila) ⇒ <code>Object</code>
Cuántos registros pendientes de conciliar tiene un viaje.

Solo el diesel los tiene: son las cargas que aún no cuadran con el estado de
cuenta ni con FleetOne.

**Kind**: global function  
**Returns**: <code>Object</code> - Los pendientes.  

| Param | Type | Description |
| --- | --- | --- |
| fila | <code>object</code> | Un renglón del resumen de diesel. |

<a name="normalizarLista"></a>

## normalizarLista(filas, esquema) ⇒ <code>Object</code>
Valida una lista descartando lo que no cumple.

**Kind**: global function  
**Returns**: <code>Object</code> - Los que pasaron y cuántos no.  

| Param | Type | Description |
| --- | --- | --- |
| filas | <code>Array</code> | Lo que vino en la respuesta. |
| esquema | <code>object</code> | El esquema con el que validar. |

<a name="descriptorDe"></a>

## descriptorDe(tipo) ⇒ <code>object</code>
El descriptor de un tipo de registro.

**Kind**: global function  
**Returns**: <code>object</code> - El descriptor.  
**Throws**:

- <code>Error</code> Si el tipo no existe.


| Param | Type | Description |
| --- | --- | --- |
| tipo | <code>string</code> | Un valor de `TIPO_REGISTRO`. |

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

<a name="obtenerCotizaciones"></a>

## obtenerCotizaciones([opciones]) ⇒ <code>Promise.&lt;Array&gt;</code>
El historial de cotizaciones guardadas.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array&gt;</code> - Las cotizaciones, listas para cargarse.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la petición falla.

**Endpoint**: POST Cotizaciones.php · op=obtener_todas  

| Param | Type | Description |
| --- | --- | --- |
| [opciones] | <code>object</code> | Ajustes de la petición. |
| [opciones.signal] | <code>AbortSignal</code> | Señal de cancelación. |

<a name="guardarCotizacion"></a>

## guardarCotizacion(cotizacion) ⇒ <code>Promise.&lt;object&gt;</code>
Guarda una cotización con su nombre.

**Kind**: global function  
**Returns**: <code>Promise.&lt;object&gt;</code> - La respuesta de la API.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API rechaza el guardado.

**Endpoint**: POST Cotizaciones.php · op=guardar  

| Param | Type | Description |
| --- | --- | --- |
| cotizacion | <code>object</code> | El estado de la pantalla, con su nombre. |

<a name="eliminarCotizacion"></a>

## eliminarCotizacion(id) ⇒ <code>Promise.&lt;object&gt;</code>
Elimina una cotización guardada.

**Kind**: global function  
**Returns**: <code>Promise.&lt;object&gt;</code> - La respuesta de la API.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API rechaza el borrado.

**Endpoint**: POST Cotizaciones.php · op=eliminar  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | La cotización a borrar. |

<a name="useCotizaciones"></a>

## useCotizaciones() ⇒ <code>object</code>
El historial de cotizaciones.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useQuery`.  
<a name="useGuardarCotizacion"></a>

## useGuardarCotizacion() ⇒ <code>object</code>
Guarda una cotización y refresca el historial.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useMutation`.  
<a name="useEliminarCotizacion"></a>

## useEliminarCotizacion() ⇒ <code>object</code>
Elimina una cotización y refresca el historial.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useMutation`.  
<a name="numeroONulo"></a>

## numeroONulo(valor) ⇒ <code>number</code> \| <code>null</code>
Convierte a número lo que la API manda como texto.

**Kind**: global function  
**Returns**: <code>number</code> \| <code>null</code> - El número, o `null` si no lo es.  

| Param | Type | Description |
| --- | --- | --- |
| valor | <code>\*</code> | Lo que vino. |

<a name="ubicacionDesdeApi"></a>

## ubicacionDesdeApi(nombre, lat, lon) ⇒ [<code>Ubicacion</code>](#Ubicacion)
Arma una ubicación a partir de las columnas planas que devuelve la base.

**Kind**: global function  
**Returns**: [<code>Ubicacion</code>](#Ubicacion) - La ubicación.  

| Param | Type | Description |
| --- | --- | --- |
| nombre | <code>string</code> | Lo que se escribió. |
| lat | <code>\*</code> | Latitud. |
| lon | <code>\*</code> | Longitud. |

<a name="cotizacionDesdeApi"></a>

## cotizacionDesdeApi(fila) ⇒ <code>object</code>
Convierte una cotización guardada al estado que maneja la pantalla.

La base la guarda plana —una columna por coordenada— y la pantalla trabaja
con ubicaciones.

**Kind**: global function  
**Returns**: <code>object</code> - La cotización lista para cargarse en el formulario.  

| Param | Type | Description |
| --- | --- | --- |
| fila | <code>object</code> | La cotización tal como vino de la API. |

<a name="cotizacionParaGuardar"></a>

## cotizacionParaGuardar(cotizacion) ⇒ <code>object</code>
Los campos con los que se guarda una cotización.

**Kind**: global function  
**Returns**: <code>object</code> - Los campos para la API.  

| Param | Type | Description |
| --- | --- | --- |
| cotizacion | <code>object</code> | El estado de la pantalla. |

<a name="recalcularTarifa"></a>

## recalcularTarifa(actuales, campo, valor) ⇒ <code>Object</code>
Las tres cifras de una cotización, que se calculan unas de otras.

`tarifa = rate × millas`. Al tocar una, se recalcula la que se pueda con las
otras dos: es lo que permite cotizar entrando por donde se tenga el dato —a
veces se sabe el precio total y se quiere saber a cuánto sale la milla, y a
veces al revés—.

**Kind**: global function  
**Returns**: <code>Object</code> - Las tres, ya recalculadas.  

| Param | Type | Description |
| --- | --- | --- |
| actuales | <code>object</code> | Las tres cifras como están. |
| campo | <code>string</code> | Cuál se acaba de tocar: `tarifa`, `millas` o `rate`. |
| valor | <code>string</code> | Lo que se escribió. |

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

<a name="obtenerTableroProgramacion"></a>

## obtenerTableroProgramacion([opciones]) ⇒ <code>Promise.&lt;object&gt;</code>
Camiones, operadores y cajas con su disponibilidad.

Es lo que alimenta los selectores del modal: quién y qué está libre para
programarse, y dónde está cada camión.

**Kind**: global function  
**Returns**: <code>Promise.&lt;object&gt;</code> - `{camiones, operadores, cajas, cajasExternas}`.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la petición falla.

**Endpoint**: POST Programacion_viajes.php · op=dashboard  

| Param | Type | Description |
| --- | --- | --- |
| [opciones] | <code>object</code> | Ajustes de la petición. |
| [opciones.signal] | <code>AbortSignal</code> | Señal de cancelación. |

<a name="obtenerProgramaciones"></a>

## obtenerProgramaciones([opciones]) ⇒ <code>Promise.&lt;Array&gt;</code>
Las programaciones guardadas, pendientes de convertirse en viaje.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array&gt;</code> - La lista, o `[]` si no hay ninguna.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la petición falla.

**Endpoint**: POST Programacion_viajes.php · op=getAll  

| Param | Type | Description |
| --- | --- | --- |
| [opciones] | <code>object</code> | Ajustes de la petición. |
| [opciones.signal] | <code>AbortSignal</code> | Señal de cancelación. |

<a name="guardarProgramacion"></a>

## guardarProgramacion(parametros) ⇒ <code>Promise.&lt;object&gt;</code>
Guarda una programación, nueva o existente.

**Kind**: global function  
**Returns**: <code>Promise.&lt;object&gt;</code> - La respuesta de la API.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API rechaza el guardado.

**Endpoint**: POST Programacion_viajes.php · op=insert | update  

| Param | Type | Description |
| --- | --- | --- |
| parametros | <code>object</code> | Datos del guardado. |
| parametros.formulario | <code>object</code> | El formulario del modal. |
| [parametros.id] | <code>string</code> \| <code>null</code> | Id de la programación al editar. |

<a name="eliminarProgramacion"></a>

## eliminarProgramacion(id) ⇒ <code>Promise.&lt;object&gt;</code>
Elimina una programación.

**Kind**: global function  
**Returns**: <code>Promise.&lt;object&gt;</code> - La respuesta de la API.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API rechaza el borrado.

**Endpoint**: POST Programacion_viajes.php · op=delete  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | La programación a borrar. |

<a name="useTableroProgramacion"></a>

## useTableroProgramacion([habilitada]) ⇒ <code>object</code>
El tablero de disponibilidad. No consulta hasta que se necesita.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useQuery`.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [habilitada] | <code>boolean</code> | <code>true</code> | Si debe consultarse. |

<a name="useProgramaciones"></a>

## useProgramaciones([habilitada]) ⇒ <code>object</code>
Las programaciones guardadas.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useQuery`.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [habilitada] | <code>boolean</code> | <code>true</code> | Si debe consultarse. |

<a name="useGuardarProgramacion"></a>

## useGuardarProgramacion() ⇒ <code>object</code>
Guarda una programación y refresca la lista y el tablero.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useMutation`.  
<a name="useEliminarProgramacion"></a>

## useEliminarProgramacion() ⇒ <code>object</code>
Elimina una programación y refresca la lista y el tablero.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useMutation`.  
<a name="leerValorCaja"></a>

## leerValorCaja([valor]) ⇒ <code>Object</code>
Descompone el valor del selector en el id y de qué flota es.

**Kind**: global function  
**Returns**: <code>Object</code> - El id sin prefijo y de qué flota es.  

| Param | Type | Description |
| --- | --- | --- |
| [valor] | <code>string</code> | Lo que trae el selector. |

<a name="formularioDesdePrograma"></a>

## formularioDesdePrograma(programacion) ⇒ <code>object</code>
Convierte una programación guardada en el formulario que la edita.

**Kind**: global function  
**Returns**: <code>object</code> - El formulario con sus valores.  

| Param | Type | Description |
| --- | --- | --- |
| programacion | <code>object</code> | La fila guardada. |

<a name="programacionParaGuardar"></a>

## programacionParaGuardar(formulario) ⇒ <code>object</code>
Los campos que se mandan al guardar una programación.

La caja viaja en uno u otro campo según de qué flota sea; el que no aplica va
vacío, no ausente, porque así es como se borra la asignación anterior.

**Kind**: global function  
**Returns**: <code>object</code> - Los campos para la API.  

| Param | Type | Description |
| --- | --- | --- |
| formulario | <code>object</code> | El formulario del modal. |

<a name="validarProgramacion"></a>

## validarProgramacion(formulario) ⇒ <code>string</code> \| <code>null</code>
Comprueba que la programación tenga lo mínimo para guardarse.

**Kind**: global function  
**Returns**: <code>string</code> \| <code>null</code> - Qué falta, o `null` si está completo.  

| Param | Type | Description |
| --- | --- | --- |
| formulario | <code>object</code> | El formulario del modal. |

<a name="posicionDeCamion"></a>

## posicionDeCamion(camion) ⇒ <code>Object</code> \| <code>null</code>
La posición de un camión, si el GPS la reportó.

**Kind**: global function  
**Returns**: <code>Object</code> \| <code>null</code> - La posición, o `null` si no hay.  

| Param | Type | Description |
| --- | --- | --- |
| camion | <code>object</code> | El camión del tablero. |

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

<a name="iniciarSesion"></a>

## iniciarSesion(credenciales) ⇒ <code>Promise.&lt;object&gt;</code>
Comprueba unas credenciales contra el servidor.

La API responde `{status:'error'}` tanto si el usuario no existe como si la
contraseña está mal, y con el mismo mensaje. Es lo correcto: distinguirlos le
diría a quien prueba credenciales cuáles usuarios existen.

**Kind**: global function  
**Returns**: <code>Promise.&lt;object&gt;</code> - Los datos de la persona que entró.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si las credenciales no son válidas o falla la red.

**Endpoint**: POST Auth.php · op=new_login  

| Param | Type | Description |
| --- | --- | --- |
| credenciales | <code>object</code> | Lo que se escribió. |
| credenciales.usuario | <code>string</code> | Usuario o correo. |
| credenciales.contrasena | <code>string</code> | Contraseña. |
| [credenciales.signal] | <code>AbortSignal</code> | Señal de cancelación. |

<a name="validarCredenciales"></a>

## validarCredenciales([credenciales]) ⇒ <code>string</code> \| <code>null</code>
Comprueba que estén los dos campos antes de molestar al servidor.

**Kind**: global function  
**Returns**: <code>string</code> \| <code>null</code> - Qué falta, o `null` si está completo.  

| Param | Type | Description |
| --- | --- | --- |
| [credenciales] | <code>object</code> | Lo que se escribió. |
| [credenciales.usuario] | <code>string</code> | Usuario o correo. |
| [credenciales.contrasena] | <code>string</code> | Contraseña. |

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
<a name="obtenerUnidadesGps"></a>

## obtenerUnidadesGps([opciones]) ⇒ <code>Promise.&lt;Array&gt;</code>
Posición de cada unidad, según el GPS.

El script ignora el campo `op`: contesta lo mismo con cualquier valor.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array&gt;</code> - Las unidades con posición válida.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la petición falla.

**Endpoint**: POST Tracking.php  

| Param | Type | Description |
| --- | --- | --- |
| [opciones] | <code>object</code> | Ajustes de la petición. |
| [opciones.signal] | <code>AbortSignal</code> | Señal de cancelación. |

<a name="obtenerTablero"></a>

## obtenerTablero([opciones]) ⇒ <code>Promise.&lt;Array&gt;</code>
Telemetría de las unidades dadas de alta en IMA.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array&gt;</code> - La lista, o `[]` si la API no la devolvió.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la petición falla.

**Endpoint**: POST estatus_unidades.php · op=get_dashboard  

| Param | Type | Description |
| --- | --- | --- |
| [opciones] | <code>object</code> | Ajustes de la petición. |
| [opciones.signal] | <code>AbortSignal</code> | Señal de cancelación. |

<a name="obtenerFlota"></a>

## obtenerFlota([opciones]) ⇒ <code>Promise.&lt;Array&gt;</code>
La flota completa: dónde está cada unidad y qué sabe IMA de ella.

El tablero se pide **primero** aunque no dependa del GPS: contesta en décimas
de segundo y el GPS tarda veinte veces más, así que lanzarlos juntos solo
conseguía que el rápido esperara detrás del lento.

Si el tablero falla, se dibujan las posiciones sin telemetría: un mapa con
camiones y sin galones sigue sirviendo; sin posiciones no hay pantalla.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array&gt;</code> - La flota lista para pintar.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si falla la petición del GPS.


| Param | Type | Description |
| --- | --- | --- |
| [opciones] | <code>object</code> | Ajustes de la petición. |
| [opciones.signal] | <code>AbortSignal</code> | Señal de cancelación. |

<a name="obtenerParadasEtapa"></a>

## obtenerParadasEtapa(parametros) ⇒ <code>Promise.&lt;Array&gt;</code>
Las paradas de una etapa, ya marcadas como completadas, en curso o pendientes.

Se piden a la lista de viajes en ruta filtrando por número de viaje, porque no
hay una operación que devuelva las paradas de una etapa sueltas.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array&gt;</code> - Las paradas con su estado.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la petición falla.

**Endpoint**: POST new_tripsv2.php · op=getPaginated  

| Param | Type | Description |
| --- | --- | --- |
| parametros | <code>object</code> | Datos de la consulta. |
| parametros.viaje | <code>string</code> | Número del viaje. |
| parametros.etapa | <code>string</code> | Número de la etapa. |
| [parametros.paradaActual] | <code>string</code> | Próxima parada pendiente, según el tablero. |
| [parametros.signal] | <code>AbortSignal</code> | Señal de cancelación. |

<a name="guardarConfiguracionTanque"></a>

## guardarConfiguracionTanque(parametros) ⇒ <code>Promise.&lt;object&gt;</code>
Guarda la configuración del tanque de una unidad.

**Kind**: global function  
**Returns**: <code>Promise.&lt;object&gt;</code> - La respuesta de la API.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API rechaza el guardado.

**Endpoint**: POST estatus_unidades.php · op=update_config  

| Param | Type | Description |
| --- | --- | --- |
| parametros | <code>object</code> | Datos a guardar. |
| parametros.truckId | <code>string</code> | Camión a configurar. |
| parametros.galones | <code>number</code> | Lo que hay en el tanque. |
| parametros.capacidad | <code>number</code> | Lo que cabe. |

<a name="useFlota"></a>

## useFlota() ⇒ <code>object</code>
La flota, refrescándose sola cada [REFRESCO_FLOTA_MS](#REFRESCO_FLOTA_MS).

Sigue refrescando con la pestaña en segundo plano: el mapa es una pantalla de
vigilancia y quien la deja abierta en otro monitor espera verla al día.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useQuery`.  
<a name="useParadasEtapa"></a>

## useParadasEtapa([unidad]) ⇒ <code>object</code>
Las paradas de la etapa activa. No consulta hasta tener viaje y etapa.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useQuery`.  

| Param | Type | Description |
| --- | --- | --- |
| [unidad] | <code>object</code> | La unidad seleccionada. |

<a name="useGuardarTanque"></a>

## useGuardarTanque() ⇒ <code>object</code>
Guarda el tanque de una unidad y vuelve a pedir la flota.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useMutation`.  
<a name="buscarLugares"></a>

## buscarLugares(parametros) ⇒ <code>Promise.&lt;Array&gt;</code>
Busca lugares por su nombre o dirección.

Con `conDetalles` el servicio devuelve además ciudad, estado y país por
separado, que es lo que permite enseñar un nombre corto en vez de la
dirección completa de cuarenta caracteres.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array&gt;</code> - Los lugares encontrados, o `[]` si no hay ninguno.  

| Param | Type | Description |
| --- | --- | --- |
| parametros | <code>object</code> | Datos de la consulta. |
| parametros.texto | <code>string</code> | Lo que se escribió. |
| [parametros.limite] | <code>number</code> | Cuántos resultados pedir. |
| [parametros.conDetalles] | <code>boolean</code> | Si se piden los componentes de la dirección. |
| [parametros.signal] | <code>AbortSignal</code> | Señal de cancelación. |

<a name="ubicarLugar"></a>

## ubicarLugar(texto) ⇒ <code>Promise.&lt;{lat: number, lon: number}&gt;</code>
El primer lugar que coincide con lo escrito.

Es lo que se usa al calcular una ruta con ubicaciones que se escribieron pero
no se eligieron de la lista.

**Kind**: global function  
**Returns**: <code>Promise.&lt;{lat: number, lon: number}&gt;</code> - Dónde está.  
**Throws**:

- <code>Error</code> Si no se encuentra el lugar.


| Param | Type | Description |
| --- | --- | --- |
| texto | <code>string</code> | Lo que se escribió. |

<a name="nombreCortoDeLugar"></a>

## nombreCortoDeLugar(lugar) ⇒ <code>string</code>
El nombre corto de un lugar: ciudad, estado y país.

La dirección completa que devuelve el servicio no cabe en un campo y no dice
más de lo que hace falta para cotizar.

**Kind**: global function  
**Returns**: <code>string</code> - El nombre corto, o el completo si no hay detalles.  

| Param | Type | Description |
| --- | --- | --- |
| lugar | <code>object</code> | Un resultado de la búsqueda con detalles. |

<a name="trazarRuta"></a>

## trazarRuta(parametros) ⇒ <code>Promise.&lt;{coordenadas: Array, resumen: object}&gt;</code>
Traza la ruta por carretera entre dos puntos, con las paradas de en medio.

El servicio calcula la ruta pasando por todos los puntos en el orden en que
se le dan, así que las paradas van entre el origen y el destino: la ruta a
tres ciudades no es la suma de dos rutas sueltas.

**Kind**: global function  
**Returns**: <code>Promise.&lt;{coordenadas: Array, resumen: object}&gt;</code> - El trazo y su distancia y duración.  
**Throws**:

- <code>Error</code> Si el servicio no responde o no encuentra ruta entre los puntos.


| Param | Type | Description |
| --- | --- | --- |
| parametros | <code>object</code> | Los extremos de la ruta. |
| parametros.desde | <code>object</code> | Punto de partida, con `lat` y `lon`. |
| parametros.hasta | <code>object</code> | Punto de llegada, con `lat` y `lon`. |
| [parametros.intermedios] | <code>Array</code> | Paradas entre los dos, en orden. |
| [parametros.signal] | <code>AbortSignal</code> | Señal de cancelación. |

<a name="useTrazarRuta"></a>

## useTrazarRuta() ⇒ <code>object</code>
Traza una ruta entre dos puntos.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useMutation`.  
<a name="numerosEn"></a>

## numerosEn(texto) ⇒ <code>Array.&lt;string&gt;</code>
Los números que aparecen en un texto.

**Kind**: global function  
**Returns**: <code>Array.&lt;string&gt;</code> - Los números encontrados, en orden de aparición.  

| Param | Type | Description |
| --- | --- | --- |
| texto | <code>string</code> | El texto a revisar. |

<a name="escaparRegex"></a>

## escaparRegex(texto) ⇒ <code>string</code>
Escapa lo que en una cadena tendría significado dentro de una expresión regular.

El nombre de una unidad puede traer puntos o guiones, y sin escapar cambiarían
lo que la expresión busca.

**Kind**: global function  
**Returns**: <code>string</code> - El texto listo para meterse en una expresión regular.  

| Param | Type | Description |
| --- | --- | --- |
| texto | <code>string</code> | El texto a escapar. |

<a name="emparejarUnidad"></a>

## emparejarUnidad(nombreGps, [unidadesTablero]) ⇒ <code>object</code> \| <code>null</code>
Busca en el tablero la unidad que corresponde a un GPS, por su nombre.

El GPS y la base no llaman igual a la misma unidad: Wialon dice `IMA 01` y la
base dice `1`. La regla es:

1. Si los nombres coinciden enteros, es esa.
2. Si los dos nombres traen número, **el primer número tiene que ser el mismo**.
   `IMA 01` es la unidad `1`, y `IMA 12 - Caja 5` no es la unidad `5` por mucho
   que el 5 aparezca: un número que no cuadra descarta la fila, no se sigue
   buscando por otro lado.
3. Solo si la fila del tablero no trae ningún número se prueba a buscar su
   nombre como palabra suelta dentro del de Wialon.

El paso 2 es más estricto que lo que había: antes bastaba con que el número de
la base apareciera en cualquier parte del nombre de Wialon, y eso le colgaba a
un camión la telemetría de otro.

**Kind**: global function  
**Returns**: <code>object</code> \| <code>null</code> - La unidad del tablero, o `null` si ninguna corresponde.  

| Param | Type | Description |
| --- | --- | --- |
| nombreGps | <code>string</code> | El nombre que reporta el GPS. |
| [unidadesTablero] | <code>Array</code> | Las unidades del tablero. |

<a name="esDireccionReal"></a>

## esDireccionReal(texto) ⇒ <code>boolean</code>
Indica si lo que llegó es una dirección de verdad.

**Kind**: global function  
**Returns**: <code>boolean</code> - `true` si se puede mostrar como dirección.  

| Param | Type | Description |
| --- | --- | --- |
| texto | <code>\*</code> | Lo que vino en el campo. |

<a name="direccionDeUnidad"></a>

## direccionDeUnidad(unidadGps) ⇒ <code>string</code>
La dirección que se muestra de una unidad.

El GPS no siempre resuelve la calle. Cuando no la trae —o cuando manda un
marcador de que no pudo—, es mejor enseñar las coordenadas que un texto
inútil: con ellas se puede buscar el punto a mano.

**Kind**: global function  
**Returns**: <code>string</code> - La dirección, las coordenadas, o un aviso de que sigue resolviéndose.  

| Param | Type | Description |
| --- | --- | --- |
| unidadGps | <code>object</code> | La unidad como la reporta el GPS. |

<a name="combinarFlota"></a>

## combinarFlota([unidadesGps], [unidadesTablero]) ⇒ [<code>Array.&lt;UnidadFlota&gt;</code>](#UnidadFlota)
Junta lo que dice el GPS con lo que sabe IMA de cada unidad.

Manda el GPS: si una unidad no está en el tablero se muestra igual, sin
telemetría, porque en el mapa sigue siendo un camión moviéndose. Al revés no:
una unidad de la base sin GPS no tiene dónde dibujarse.

**Kind**: global function  
**Returns**: [<code>Array.&lt;UnidadFlota&gt;</code>](#UnidadFlota) - La flota lista para pintar.  

| Param | Type | Description |
| --- | --- | --- |
| [unidadesGps] | <code>Array</code> | Lo que devolvió el GPS. |
| [unidadesTablero] | <code>Array</code> | Lo que devolvió el tablero. |

<a name="porcentajeTanque"></a>

## porcentajeTanque(galones, capacidad) ⇒ <code>number</code>
Qué tan lleno está el tanque, en porcentaje.

Se acota a 100 porque en producción hay lecturas imposibles —una unidad con
850 galones en un tanque de 270— y sin acotar la barra se sale del cuadro y el
indicador circular se dibuja dando vueltas.

**Kind**: global function  
**Returns**: <code>number</code> - Un porcentaje entre 0 y 100.  

| Param | Type | Description |
| --- | --- | --- |
| galones | <code>number</code> | Lo que hay en el tanque. |
| capacidad | <code>number</code> | Lo que cabe. |

<a name="lecturaTanqueSospechosa"></a>

## lecturaTanqueSospechosa(unidad) ⇒ <code>boolean</code>
Indica si la lectura del tanque es imposible.

Un tanque no puede tener más de lo que le cabe ni menos que nada. En
producción pasan las dos cosas: la unidad 5 reporta 850 galones en un tanque
de 270 y la 7 reporta −33. Conviene decirlo en vez de pintar una barra llena
o vacía como si el dato fuera bueno.

**Kind**: global function  
**Returns**: <code>boolean</code> - `true` si la lectura no puede ser cierta.  

| Param | Type | Description |
| --- | --- | --- |
| unidad | <code>object</code> | La unidad a revisar. |

<a name="filtrarFlota"></a>

## filtrarFlota([flota], [busqueda]) ⇒ <code>Array</code>
Filtra la flota por nombre, como escribe la persona.

**Kind**: global function  
**Returns**: <code>Array</code> - Las unidades que coinciden.  

| Param | Type | Description |
| --- | --- | --- |
| [flota] | <code>Array</code> | Las unidades. |
| [busqueda] | <code>string</code> | Lo que se escribió. |

<a name="normalizarUnidadesGps"></a>

## normalizarUnidadesGps(filas) ⇒ <code>Object</code>
Valida las unidades del GPS descartando lo que no cumple.

Una unidad sin posición no se puede dibujar, así que se descarta con aviso en
vez de reventar el mapa.

**Kind**: global function  
**Returns**: <code>Object</code> - Las válidas y cuántas se cayeron.  

| Param | Type | Description |
| --- | --- | --- |
| filas | <code>Array</code> | Lo que vino en la respuesta. |

<a name="filtrarPorEstatus"></a>

## filtrarPorEstatus([unidades], estatus) ⇒ <code>Array</code>
Filtra las unidades del tablero por el estatus de su viaje.

**Kind**: global function  
**Returns**: <code>Array</code> - Las unidades que corresponden.  

| Param | Type | Description |
| --- | --- | --- |
| [unidades] | <code>Array</code> | Las unidades del tablero. |
| estatus | <code>string</code> | Un valor de `ESTATUS_TABLERO`. |

<a name="ordenarParadas"></a>

## ordenarParadas([paradas]) ⇒ <code>Array</code>
Ordena las paradas por el orden de la ruta.

La API las devuelve en el orden en que se guardaron, no en el que se recorren.

**Kind**: global function  
**Returns**: <code>Array</code> - Las paradas ordenadas, sin tocar el arreglo original.  

| Param | Type | Description |
| --- | --- | --- |
| [paradas] | <code>Array</code> | Las paradas de la etapa. |

<a name="estadoDeParadas"></a>

## estadoDeParadas([paradas], [paradaActual]) ⇒ <code>Array</code>
Marca cada parada como completada, en curso o pendiente.

El tablero solo manda **la próxima parada pendiente** (`current_stop`), así que
el resto se deduce por posición: lo anterior ya se cubrió, lo posterior falta.

Cuando `current_stop` viene vacío significa que ya no queda ninguna pendiente y
todas cuentan como completadas. Ojo: eso también pasa si el nombre que manda el
tablero no coincide con ninguna parada de la etapa, y entonces se pintan todas
como hechas sin serlo.

**Kind**: global function  
**Returns**: <code>Array</code> - Las paradas ordenadas, cada una con su `stopStatus`.  

| Param | Type | Description |
| --- | --- | --- |
| [paradas] | <code>Array</code> | Las paradas de la etapa. |
| [paradaActual] | <code>string</code> | El nombre de la próxima parada pendiente. |

<a name="avanceParadas"></a>

## avanceParadas([paradas]) ⇒ <code>Object</code>
Cuántas paradas se han cubierto.

**Kind**: global function  
**Returns**: <code>Object</code> - El avance.  

| Param | Type | Description |
| --- | --- | --- |
| [paradas] | <code>Array</code> | Las paradas con su estado. |

<a name="tramoActivo"></a>

## tramoActivo(unidad) ⇒ <code>Object</code>
El tramo que la unidad está recorriendo ahora mismo.

Mientras queden paradas, el tramo activo termina en la próxima; cuando ya no
queda ninguna, termina en el destino final de la etapa.

**Kind**: global function  
**Returns**: <code>Object</code> - El tramo.  

| Param | Type | Description |
| --- | --- | --- |
| unidad | <code>object</code> | La unidad seleccionada. |

<a name="puntoDesdeBusqueda"></a>

## puntoDesdeBusqueda(resultado, [largoMaximo]) ⇒ [<code>PuntoRuta</code>](#PuntoRuta)
Convierte un resultado de búsqueda en un punto de ruta.

Los nombres de Nominatim son direcciones completas que desbordan el panel, así
que se recortan.

**Kind**: global function  
**Returns**: [<code>PuntoRuta</code>](#PuntoRuta) - El punto.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| resultado | <code>object</code> |  | Un resultado de la búsqueda de lugares. |
| [largoMaximo] | <code>number</code> | <code>70</code> | Cuántos caracteres caben en el panel. |

<a name="coordenadasDeRuta"></a>

## coordenadasDeRuta(ruta) ⇒ <code>Array.&lt;Array.&lt;number&gt;&gt;</code>
Las coordenadas de una ruta, en el orden que espera Leaflet.

GeoJSON las da como `[longitud, latitud]` y Leaflet las quiere al revés. Es
el error clásico: sin voltearlas la ruta aparece en el otro hemisferio.

**Kind**: global function  
**Returns**: <code>Array.&lt;Array.&lt;number&gt;&gt;</code> - Las coordenadas como `[lat, lon]`.  

| Param | Type | Description |
| --- | --- | --- |
| ruta | <code>object</code> | La ruta que devolvió el servicio. |

<a name="resumenRuta"></a>

## resumenRuta(ruta) ⇒ <code>Object</code>
El resumen de una ruta, en las unidades en que se lee.

El servicio contesta en metros y segundos. En pantalla se leen kilómetros y
minutos, y para cotizar, millas.

**Kind**: global function  
**Returns**: <code>Object</code> - Kilómetros con un
  decimal, minutos enteros y millas sin redondear.  

| Param | Type | Description |
| --- | --- | --- |
| ruta | <code>object</code> | La ruta que devolvió el servicio. |

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
<a name="crearCajaExterna"></a>

## crearCajaExterna(datos) ⇒ <code>Promise.&lt;object&gt;</code>
Da de alta una caja externa desde el propio formulario de viaje.

**Kind**: global function  
**Returns**: <code>Promise.&lt;object&gt;</code> - La caja creada, con su id.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API rechaza el alta.

**Endpoint**: POST caja_externa.php · op=Alta  

| Param | Type | Description |
| --- | --- | --- |
| datos | <code>object</code> | Los campos de la caja. |

<a name="useCrearCajaExterna"></a>

## useCrearCajaExterna() ⇒ <code>object</code>
Da de alta una caja externa y refresca el catálogo.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useMutation`.  
<a name="obtenerViajePorId"></a>

## obtenerViajePorId(parametros) ⇒ <code>Promise.&lt;object&gt;</code>
Trae un viaje con sus etapas, documentos y paradas.

**Kind**: global function  
**Returns**: <code>Promise.&lt;object&gt;</code> - La respuesta completa, con `trip` y `etapas`.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API falla o el viaje no existe.

**Endpoint**: POST new_trips.php · op=getById  

| Param | Type | Description |
| --- | --- | --- |
| parametros | <code>object</code> | Datos de la consulta. |
| parametros.tripId | <code>string</code> | Viaje a consultar. |
| [parametros.signal] | <code>AbortSignal</code> | Señal de cancelación. |

<a name="guardarViajeUpcoming"></a>

## guardarViajeUpcoming(parametros) ⇒ <code>Promise.&lt;object&gt;</code>
Guarda los cambios de un viaje, con sus etapas y sus archivos nuevos.

Los campos escalares del viaje van sueltos, las etapas como JSON, y cada
archivo nuevo en un campo propio nombrado por su posición.

**Kind**: global function  
**Returns**: <code>Promise.&lt;object&gt;</code> - La respuesta de la API.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API rechaza el guardado.

**Endpoint**: POST new_trips.php · op=UpdateUpcoming | Update | Update_complete  

| Param | Type | Description |
| --- | --- | --- |
| parametros | <code>object</code> | Datos del guardado. |
| parametros.tripId | <code>string</code> | Viaje a actualizar. |
| [parametros.op] | <code>string</code> | Un valor de `OP_GUARDADO`; por omisión, el de próximos. |
| parametros.datosViaje | <code>object</code> | Campos del viaje. |
| parametros.etapas | <code>Array</code> | Las etapas en pantalla. |
| [parametros.etapasIniciales] | <code>Array</code> | Las etapas como llegaron, para detectar las borradas. |
| parametros.formatearFecha | <code>function</code> | Convierte una fecha al formato de la API. |

<a name="guardarInvoices"></a>

## guardarInvoices(parametros) ⇒ <code>Promise.&lt;object&gt;</code>
Guarda los números de factura de las etapas de un viaje.

Va aparte del guardado del viaje porque vive en otro endpoint. Que falle no
invalida lo ya guardado, así que quien la llama decide si avisar.

**Kind**: global function  
**Returns**: <code>Promise.&lt;object&gt;</code> - La respuesta de la API.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API rechaza el guardado.

**Endpoint**: POST update_invoices.php · op=update_invoices  

| Param | Type | Description |
| --- | --- | --- |
| parametros | <code>object</code> | Datos del guardado. |
| parametros.tripId | <code>string</code> | Viaje al que pertenecen las etapas. |
| parametros.etapas | <code>Array</code> | Las etapas con su `invoice_number`. |

<a name="useViajeUpcoming"></a>

## useViajeUpcoming(tripId) ⇒ <code>object</code>
Detalle de un viaje próximo. No consulta hasta tener un id.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useQuery`.  

| Param | Type | Description |
| --- | --- | --- |
| tripId | <code>string</code> | Viaje a consultar. |

<a name="useGuardarViajeUpcoming"></a>

## useGuardarViajeUpcoming() ⇒ <code>object</code>
Guarda un viaje próximo e invalida su detalle.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useMutation`.  
<a name="obtenerResumenViaje"></a>

## obtenerResumenViaje(parametros) ⇒ <code>Promise.&lt;object&gt;</code>
El resumen de un viaje: etapas, diesel, gastos y totales.

Cuando el viaje no existe la API responde `status: "not found"`, que no es ni
éxito ni el `"error"` que el cliente convierte en excepción: llegaría un
cuerpo sin datos y la pantalla se quedaría cargando para siempre. Por eso se
comprueba aquí.

**Kind**: global function  
**Returns**: <code>Promise.&lt;object&gt;</code> - El resumen completo.  
**Throws**:

- <code>Error</code> Si el viaje no existe.
- [<code>ApiError</code>](#ApiError) Si la petición falla.

**Endpoint**: POST trips.php · op=trip_summary  

| Param | Type | Description |
| --- | --- | --- |
| parametros | <code>object</code> | Datos de la consulta. |
| parametros.tripId | <code>string</code> | Viaje a consultar. |
| [parametros.signal] | <code>AbortSignal</code> | Señal de cancelación. |

<a name="useResumenViaje"></a>

## useResumenViaje(tripId) ⇒ <code>object</code>
Resumen de un viaje. No consulta hasta tener un id.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useQuery`.  

| Param | Type | Description |
| --- | --- | --- |
| tripId | <code>string</code> | Viaje a consultar. |

<a name="obtenerViajes"></a>

## obtenerViajes(parametros) ⇒ <code>Promise.&lt;{viajes: Array, total: number}&gt;</code>
Una página de la lista de viajes.

La API pagina en el servidor y devuelve el total aparte, así que la pantalla
nunca tiene la lista completa en memoria.

**Kind**: global function  
**Returns**: <code>Promise.&lt;{viajes: Array, total: number}&gt;</code> - La página y cuántos hay en total.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la petición falla.

**Endpoint**: POST new_tripsv2.php · op=getPaginated  

| Param | Type | Description |
| --- | --- | --- |
| parametros | <code>object</code> | Datos de la consulta. |
| parametros.pestana | <code>number</code> | Un `tabValue`. |
| parametros.pagina | <code>number</code> | Página, empezando en cero. |
| parametros.porPagina | <code>number</code> | Cuántos viajes por página. |
| [parametros.filtros] | <code>object</code> | Los filtros de la barra. |
| [parametros.usuario] | <code>object</code> | Quién consulta, para que la API filtre por equipo. |
| [parametros.signal] | <code>AbortSignal</code> | Señal de cancelación. |

<a name="ejecutarAccionViaje"></a>

## ejecutarAccionViaje(parametros) ⇒ <code>Promise.&lt;object&gt;</code>
Cambia el estado de un viaje.

**Kind**: global function  
**Returns**: <code>Promise.&lt;object&gt;</code> - La respuesta de la API.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API rechaza la operación.

**Endpoint**: POST new_trips.php | new_tripsv2.php  

| Param | Type | Description |
| --- | --- | --- |
| parametros | <code>object</code> | Datos de la acción. |
| parametros.accion | <code>object</code> | Un valor de `ACCION_VIAJE`. |
| parametros.tripId | <code>string</code> | Viaje afectado. |
| [parametros.extra] | <code>object</code> | Campos propios de la acción, como el tipo de reactivación. |

<a name="useViajes"></a>

## useViajes(consulta, [opciones]) ⇒ <code>object</code>
Una página de la lista de viajes, con sus filtros.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useQuery`.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| consulta | <code>object</code> |  | Lo que espera [obtenerViajes](#obtenerViajes). |
| [opciones] | <code>object</code> |  | Ajustes de la consulta. |
| [opciones.habilitada] | <code>boolean</code> | <code>true</code> | Si debe consultarse. |

<a name="useAccionViaje"></a>

## useAccionViaje() ⇒ <code>object</code>
Ejecuta una acción sobre un viaje y refresca la lista.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useMutation`.  
<a name="documentoDesdeApi"></a>

## documentoDesdeApi(doc) ⇒ <code>object</code>
Convierte un documento de la API en el estado que maneja el formulario.

**Kind**: global function  
**Returns**: <code>object</code> - El documento en el formato de la pantalla.  

| Param | Type | Description |
| --- | --- | --- |
| doc | <code>object</code> | El documento como vino de la API. |

<a name="documentosDeEtapa"></a>

## documentosDeEtapa(plantilla, [adjuntos]) ⇒ <code>object</code>
Rellena la plantilla de documentos de una etapa con los que ya están subidos.

Solo se conservan los tipos que la plantilla contempla: un documento de un
tipo que la etapa ya no usa no debe reaparecer en el formulario.

**Kind**: global function  
**Returns**: <code>object</code> - La plantilla con los documentos existentes puestos.  

| Param | Type | Description |
| --- | --- | --- |
| plantilla | <code>object</code> | Los tipos de documento que admite la etapa. |
| [adjuntos] | <code>Array</code> | Los documentos que devolvió la API. |

<a name="paradasDesdeApi"></a>

## paradasDesdeApi([paradas]) ⇒ <code>Array</code>
Convierte las paradas de una etapa al estado del formulario.

**Kind**: global function  
**Returns**: <code>Array</code> - Las paradas con su documento ya convertido.  

| Param | Type | Description |
| --- | --- | --- |
| [paradas] | <code>Array</code> | Las paradas como vinieron de la API. |

<a name="metadatosDocumentos"></a>

## metadatosDocumentos([documentos]) ⇒ <code>Array.&lt;object&gt;</code>
Los metadatos de documentos que acompañan al guardado.

Los archivos van aparte, en campos propios del `FormData`; esto es solo la
descripción de cada uno. Se omiten los tipos que no tienen archivo alguno.

**Kind**: global function  
**Returns**: <code>Array.&lt;object&gt;</code> - Los metadatos de los que sí tienen archivo.  

| Param | Type | Description |
| --- | --- | --- |
| [documentos] | <code>object</code> | Los documentos de una etapa. |

<a name="paradasParaGuardar"></a>

## paradasParaGuardar([paradas]) ⇒ <code>Array.&lt;object&gt;</code>
Las paradas de una etapa, listas para el JSON del guardado.

El orden se recalcula a partir de la posición en la lista: es lo que el
usuario ve, y arrastrar una parada no actualiza su `stop_order`.

**Kind**: global function  
**Returns**: <code>Array.&lt;object&gt;</code> - Las paradas en el formato de la API.  

| Param | Type | Description |
| --- | --- | --- |
| [paradas] | <code>Array</code> | Las paradas de la etapa. |

<a name="etapaParaGuardar"></a>

## etapaParaGuardar(etapa, formatearFecha) ⇒ <code>object</code>
Los campos de una etapa que se guardan, en el formato de la API.

**Kind**: global function  
**Returns**: <code>object</code> - La etapa lista para serializar.  

| Param | Type | Description |
| --- | --- | --- |
| etapa | <code>object</code> | La etapa del formulario. |
| formatearFecha | <code>function</code> | Convierte una fecha al formato de la API. |

<a name="etapasEliminadas"></a>

## etapasEliminadas([etapasIniciales], [etapasActuales]) ⇒ <code>Array</code>
Las etapas que el usuario quitó durante la edición.

La API no borra por omisión: hay que decirle explícitamente cuáles ya no
están, o las etapas eliminadas reaparecen al recargar.

**Kind**: global function  
**Returns**: <code>Array</code> - Los ids a eliminar.  

| Param | Type | Description |
| --- | --- | --- |
| [etapasIniciales] | <code>Array</code> | Las etapas como llegaron de la API. |
| [etapasActuales] | <code>Array</code> | Las etapas que quedaron en pantalla. |

<a name="archivosNuevos"></a>

## archivosNuevos([etapas]) ⇒ <code>object</code>
Los archivos nuevos de las etapas, con el nombre de campo que espera la API.

Solo viajan los que el usuario acaba de escoger; los ya subidos se
identifican por su `document_id` en los metadatos. Cuando un archivo nuevo
reemplaza a uno existente se manda además el id del que se sustituye.

**Kind**: global function  
**Returns**: <code>object</code> - Campos del `FormData`, de nombre a valor.  

| Param | Type | Description |
| --- | --- | --- |
| [etapas] | <code>Array</code> | Las etapas del formulario. |

<a name="etapasDesdeApi"></a>

## etapasDesdeApi([etapas], conversores) ⇒ <code>Array</code>
Convierte las etapas que devuelve la API al estado del formulario.

La plantilla de documentos depende del tipo de etapa y del país, que es algo
que solo saben las constantes del formulario: se recibe como función para que
el dominio no dependa de ellas.

**Kind**: global function  
**Returns**: <code>Array</code> - Las etapas listas para el formulario.  

| Param | Type | Description |
| --- | --- | --- |
| [etapas] | <code>Array</code> | Las etapas como vinieron de la API. |
| conversores | <code>object</code> | Cómo resolver lo que el dominio no sabe. |
| conversores.plantillaDocumentos | <code>function</code> | Recibe `(tipoEtapa, pais)` y devuelve los tipos admitidos. |
| conversores.parsearFecha | <code>function</code> | Convierte la fecha de la API en `Date`. |
| conversores.pais | <code>string</code> | País del viaje. |

<a name="pestanaDeReemplazo"></a>

## pestanaDeReemplazo(permitidas, actual) ⇒ <code>number</code> \| <code>null</code>
La pestaña a la que caer cuando la elegida ya no está permitida.

Los permisos se refrescan cada 15 segundos, así que a alguien se le puede
retirar el acceso a la pestaña que está mirando.

**Kind**: global function  
**Returns**: <code>number</code> \| <code>null</code> - A qué pestaña moverse, o `null` si la actual sigue valiendo.  

| Param | Type | Description |
| --- | --- | --- |
| permitidas | <code>Array</code> | Las pestañas visibles. |
| actual | <code>number</code> | La pestaña seleccionada. |

<a name="filtrosActivos"></a>

## filtrosActivos([filtros]) ⇒ <code>number</code>
Cuántos filtros están puestos.

Sirve para el contador de la barra: la dirección solo cuenta si no es "todas".

**Kind**: global function  
**Returns**: <code>number</code> - Cuántos están activos.  

| Param | Type | Description |
| --- | --- | --- |
| [filtros] | <code>object</code> | Los filtros actuales. |

<a name="numero"></a>

## numero(valor) ⇒ <code>number</code>
Un número de la API, que puede venir como texto, nulo o ausente.

**Kind**: global function  
**Returns**: <code>number</code> - El número, o 0.  

| Param | Type | Description |
| --- | --- | --- |
| valor | <code>\*</code> | Lo que vino. |

<a name="totalesViaje"></a>

## totalesViaje([resumen]) ⇒ [<code>TotalesViaje</code>](#TotalesViaje)
Los totales de un viaje, tomados de donde el backend los publica.

El backend ya calcula los cinco números y los manda en `totales`. La pantalla
los recalculaba, y para el pago al conductor leía `driver_payments.total_monto`
—una clave que la respuesta **no tiene**—, así que el renglón "Pago a
conductor" salía siempre en cero aunque la API mandara el importe: en el viaje
480, 1 122.26 USD que nunca se vieron.

Ojo con la utilidad: la que publica el backend es `rate - diesel - gastos`,
**sin restar el pago al conductor** (comprobado con el viaje 480: 6 200 −
1 509 − 188 = 4 503, que es justo lo que manda). Es una decisión suya, no un
error, y por eso aquí se expone tal cual en vez de recalcularla.

**Kind**: global function  
**Returns**: [<code>TotalesViaje</code>](#TotalesViaje) - Los cinco totales.  

| Param | Type | Description |
| --- | --- | --- |
| [resumen] | <code>object</code> | La respuesta de `trip_summary`. |

<a name="utilidadCuadra"></a>

## utilidadCuadra(totales, [tolerancia]) ⇒ <code>boolean</code>
Comprueba que la utilidad que manda el backend cuadre con sus propios números.

Se compara contra `tarifa - diesel - gastos`, que es como el backend la
calcula: el pago al conductor queda fuera. No corrige nada; solo permite
avisar cuando el resumen se contradice, que es mejor que enseñar dos cifras
que no cuadran sin decir nada.

**Kind**: global function  
**Returns**: <code>boolean</code> - `true` si la utilidad cuadra.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| totales | [<code>TotalesViaje</code>](#TotalesViaje) |  | Los totales del viaje. |
| [tolerancia] | <code>number</code> | <code>1</code> | Cuánto se admite de diferencia por redondeos. |

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

<a name="obtenerUnidades"></a>

## obtenerUnidades(parametros) ⇒ <code>Promise.&lt;{requisitos: Array, unidades: Array}&gt;</code>
Trae de una sola vez los requisitos y las unidades de un tipo.

Los tres endpoints resuelven todo en una operación: la lista de requisitos
configurados y las unidades con su expediente ya adjunto.

**Kind**: global function  
**Returns**: <code>Promise.&lt;{requisitos: Array, unidades: Array}&gt;</code> - El expediente completo.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la petición falla.

**Endpoint**: POST trucks_v2.php · cajas_v2.php · drivers_v2.php · op=getInitData  

| Param | Type | Description |
| --- | --- | --- |
| parametros | <code>object</code> | Datos de la consulta. |
| parametros.tipo | <code>string</code> | Un valor de `TIPO_UNIDAD`. |
| [parametros.signal] | <code>AbortSignal</code> | Señal de cancelación. |

<a name="guardarUnidad"></a>

## guardarUnidad(parametros) ⇒ <code>Promise.&lt;object&gt;</code>
Guarda una unidad con su expediente.

**Kind**: global function  
**Returns**: <code>Promise.&lt;object&gt;</code> - La respuesta de la API.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API rechaza el guardado.

**Endpoint**: POST · op=saveTruck | saveTrailer | saveDriver  

| Param | Type | Description |
| --- | --- | --- |
| parametros | <code>object</code> | Datos del guardado. |
| parametros.tipo | <code>string</code> | Un valor de `TIPO_UNIDAD`. |
| parametros.unidad | <code>object</code> | Los datos del formulario. |
| parametros.requisitos | <code>Array</code> | Los requisitos del expediente. |
| [parametros.archivos] | <code>object</code> | Los archivos recién escogidos. |

<a name="eliminarUnidad"></a>

## eliminarUnidad(parametros) ⇒ <code>Promise.&lt;object&gt;</code>
Elimina una unidad.

**Kind**: global function  
**Returns**: <code>Promise.&lt;object&gt;</code> - La respuesta de la API.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API rechaza el borrado.

**Endpoint**: POST · op=deleteTruck | deleteTrailer | deleteDriver  

| Param | Type | Description |
| --- | --- | --- |
| parametros | <code>object</code> | Datos del borrado. |
| parametros.tipo | <code>string</code> | Un valor de `TIPO_UNIDAD`. |
| parametros.id | <code>string</code> | Identificador de la unidad. |

<a name="darDeBaja"></a>

## darDeBaja(parametros) ⇒ <code>Promise.&lt;object&gt;</code>
Da de baja a un conductor, con su motivo y su fecha.

Una baja no borra: el expediente sigue existiendo y el conductor pasa a la
pestaña de bajas. Solo el tipo conductor la admite.

**Kind**: global function  
**Returns**: <code>Promise.&lt;object&gt;</code> - La respuesta de la API.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API rechaza la baja o el tipo no admite bajas.

**Endpoint**: POST drivers_v2.php · op=darDeBajaDriver  

| Param | Type | Description |
| --- | --- | --- |
| parametros | <code>object</code> | Datos de la baja. |
| parametros.tipo | <code>string</code> | Un valor de `TIPO_UNIDAD`. |
| parametros.id | <code>string</code> | Conductor a dar de baja. |
| parametros.motivo | <code>string</code> | Por qué se va. |
| parametros.fecha | <code>string</code> | Cuándo se va. |
| [parametros.observaciones] | <code>string</code> | Detalle libre. |

<a name="crearRequisito"></a>

## crearRequisito(parametros) ⇒ <code>Promise.&lt;object&gt;</code>
Crea un requisito nuevo en el expediente de un tipo.

**Kind**: global function  
**Returns**: <code>Promise.&lt;object&gt;</code> - La respuesta de la API.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API rechaza la creación.

**Endpoint**: POST · op=addConfig  

| Param | Type | Description |
| --- | --- | --- |
| parametros | <code>object</code> | Datos del requisito. |
| parametros.tipo | <code>string</code> | Un valor de `TIPO_UNIDAD`. |
| parametros.requisito | <code>object</code> | Etiqueta, categoría, tipo y vencimiento. |

<a name="eliminarRequisito"></a>

## eliminarRequisito(parametros) ⇒ <code>Promise.&lt;object&gt;</code>
Elimina un requisito del expediente.

Los documentos ya subidos contra ese requisito siguen en la base; lo que
desaparece es la exigencia.

**Kind**: global function  
**Returns**: <code>Promise.&lt;object&gt;</code> - La respuesta de la API.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API rechaza el borrado.

**Endpoint**: POST · op=deleteConfig  

| Param | Type | Description |
| --- | --- | --- |
| parametros | <code>object</code> | Datos del borrado. |
| parametros.tipo | <code>string</code> | Un valor de `TIPO_UNIDAD`. |
| parametros.keyName | <code>string</code> | Clave del requisito. |

<a name="cambiarVisibilidadColumna"></a>

## cambiarVisibilidadColumna(parametros) ⇒ <code>Promise.&lt;object&gt;</code>
Muestra u oculta una columna del expediente para todos los usuarios.

Solo camiones y conductores la guardan: la tabla de cajas no tiene la columna
`oculto_en_tabla` en la base, así que ahí la preferencia vive en la pantalla
y se pierde al recargar. Está anotado en `docs/MODULOS/unidades.md`.

**Kind**: global function  
**Returns**: <code>Promise.&lt;object&gt;</code> - La respuesta de la API.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API rechaza el cambio o el tipo no lo guarda.

**Endpoint**: POST · op=updateColumnVisibility  

| Param | Type | Description |
| --- | --- | --- |
| parametros | <code>object</code> | Datos del cambio. |
| parametros.tipo | <code>string</code> | Un valor de `TIPO_UNIDAD`. |
| parametros.keyName | <code>string</code> | Clave del requisito. |
| parametros.oculto | <code>boolean</code> | Si debe quedar oculta. |

<a name="useUnidades"></a>

## useUnidades(tipo) ⇒ <code>object</code>
Requisitos y unidades de un tipo.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useQuery`.  

| Param | Type | Description |
| --- | --- | --- |
| tipo | <code>string</code> | Un valor de `TIPO_UNIDAD`. |

<a name="useMutacionUnidad"></a>

## useMutacionUnidad(tipo, accion) ⇒ <code>object</code>
Crea la mutación de un tipo de unidad, refrescando su lista al terminar.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useMutation`.  

| Param | Type | Description |
| --- | --- | --- |
| tipo | <code>string</code> | Un valor de `TIPO_UNIDAD`. |
| accion | <code>function</code> | La función que hace la llamada. |

<a name="fechaVencimiento"></a>

## fechaVencimiento([documento]) ⇒ <code>string</code> \| <code>null</code>
La fecha de vencimiento de un documento, o `null` si no tiene una de verdad.

**Kind**: global function  
**Returns**: <code>string</code> \| <code>null</code> - La fecha, o `null`.  

| Param | Type | Description |
| --- | --- | --- |
| [documento] | <code>object</code> | El documento a revisar. |

<a name="diasPara"></a>

## diasPara(fecha, [hoy]) ⇒ <code>number</code> \| <code>null</code>
Cuántos días faltan para una fecha.

**Kind**: global function  
**Returns**: <code>number</code> \| <code>null</code> - Los días que faltan, negativo si ya pasó, o `null` si no hay fecha.  

| Param | Type | Description |
| --- | --- | --- |
| fecha | <code>string</code> | La fecha de vencimiento. |
| [hoy] | <code>Date</code> | Con qué día comparar; por omisión, hoy. |

<a name="estadoDocumento"></a>

## estadoDocumento(requisito, [documento], [hoy]) ⇒ <code>Object</code>
En qué estado está un documento respecto a su requisito.

Un requisito de texto no vence: o tiene valor o falta. Uno de archivo con
vencimiento pasa por vencido, por vencer y vigente según la fecha.

**Kind**: global function  
**Returns**: <code>Object</code> - El estado y su porqué.  

| Param | Type | Description |
| --- | --- | --- |
| requisito | <code>object</code> | El requisito del expediente. |
| [documento] | <code>object</code> | Lo que hay subido, si hay algo. |
| [hoy] | <code>Date</code> | Con qué día comparar; por omisión, hoy. |

<a name="requisitosVisibles"></a>

## requisitosVisibles([requisitos], [ocultasLocales]) ⇒ <code>Array</code>
Los requisitos que se muestran como columna de la tabla.

En cajas la visibilidad no se puede guardar —el backend no tiene la columna—
así que ahí se pasa la lista de ocultas que vive solo en la pantalla.

**Kind**: global function  
**Returns**: <code>Array</code> - Los requisitos visibles.  

| Param | Type | Description |
| --- | --- | --- |
| [requisitos] | <code>Array</code> | Todos los requisitos. |
| [ocultasLocales] | <code>Array</code> | Claves ocultas solo en esta sesión. |

<a name="resumenExpediente"></a>

## resumenExpediente([requisitos], [documentos], [hoy]) ⇒ <code>object</code>
Cuenta el estado del expediente de una unidad.

Sirve para saber de un vistazo si a una unidad le falta papeleo, sin abrir su
ficha.

**Kind**: global function  
**Returns**: <code>object</code> - Cuántos hay en cada estado de `ESTADO_DOCUMENTO`.  

| Param | Type | Description |
| --- | --- | --- |
| [requisitos] | <code>Array</code> | Los requisitos exigidos. |
| [documentos] | <code>object</code> | Lo que la unidad tiene subido. |
| [hoy] | <code>Date</code> | Con qué día comparar. |

<a name="normalizarRequisitos"></a>

## normalizarRequisitos(filas) ⇒ <code>Object</code>
Valida los requisitos descartando los que no cumplen.

**Kind**: global function  
**Returns**: <code>Object</code> - Los válidos y cuántos se cayeron.  

| Param | Type | Description |
| --- | --- | --- |
| filas | <code>Array</code> | Lo que vino en la respuesta. |

<a name="descriptorDe"></a>

## descriptorDe(tipo) ⇒ [<code>DescriptorUnidad</code>](#DescriptorUnidad)
El descriptor de un tipo de unidad.

**Kind**: global function  
**Returns**: [<code>DescriptorUnidad</code>](#DescriptorUnidad) - El descriptor.  
**Throws**:

- <code>Error</code> Si el tipo no existe, porque todo lo demás depende de él.


| Param | Type | Description |
| --- | --- | --- |
| tipo | <code>string</code> | Un valor de `TIPO_UNIDAD`. |

<a name="unidadEnBlanco"></a>

## unidadEnBlanco(tipo) ⇒ <code>object</code>
Los campos vacíos con los que arranca un alta.

**Kind**: global function  
**Returns**: <code>object</code> - El formulario en blanco, con su expediente vacío.  

| Param | Type | Description |
| --- | --- | --- |
| tipo | <code>string</code> | Un valor de `TIPO_UNIDAD`. |

<a name="filtrarUnidades"></a>

## filtrarUnidades([unidades], [busquedas], [texto]) ⇒ <code>Array</code>
Filtra una lista de unidades por lo escrito en cada buscador.

Cada buscador puede mirar varios campos —el de placa mira la mexicana y la
estadounidense—, y una unidad pasa si coincide en alguno de ellos.

**Kind**: global function  
**Returns**: <code>Array</code> - Las unidades que coinciden con todos los buscadores con texto.  

| Param | Type | Description |
| --- | --- | --- |
| [unidades] | <code>Array</code> | Las unidades a filtrar. |
| [busquedas] | <code>Array</code> | Los buscadores del descriptor. |
| [texto] | <code>object</code> | Lo escrito en cada buscador, por su clave. |

<a name="camposParaGuardar"></a>

## camposParaGuardar(tipo, unidad) ⇒ <code>object</code>
Los campos del formulario que se mandan al guardar.

Se omiten los vacíos: el backend interpreta la ausencia como "no lo toques",
y mandar la cadena vacía borraría lo que ya estaba.

**Kind**: global function  
**Returns**: <code>object</code> - Solo los campos con valor, más el id si lo hay.  

| Param | Type | Description |
| --- | --- | --- |
| tipo | <code>string</code> | Un valor de `TIPO_UNIDAD`. |
| unidad | <code>object</code> | Los datos del formulario. |

<a name="expedienteParaGuardar"></a>

## expedienteParaGuardar([requisitos], [documentos], [archivos]) ⇒ <code>object</code>
Los campos del expediente que se mandan al guardar.

Los requisitos de texto viajan como `text_<clave>`, las fechas como
`date_<clave>` y los archivos como `file_<clave>`. Es el contrato del backend
y no se puede cambiar desde aquí.

**Kind**: global function  
**Returns**: <code>object</code> - Los campos del `FormData`.  

| Param | Type | Description |
| --- | --- | --- |
| [requisitos] | <code>Array</code> | Los requisitos del expediente. |
| [documentos] | <code>object</code> | Lo que hay en el formulario. |
| [archivos] | <code>object</code> | Los archivos que se acaban de escoger. |

<a name="validarUnidad"></a>

## validarUnidad(tipo, unidad) ⇒ <code>string</code> \| <code>null</code>
Comprueba que estén los campos obligatorios del tipo.

**Kind**: global function  
**Returns**: <code>string</code> \| <code>null</code> - Qué falta, en lenguaje de la persona, o `null` si está completo.  

| Param | Type | Description |
| --- | --- | --- |
| tipo | <code>string</code> | Un valor de `TIPO_UNIDAD`. |
| unidad | <code>object</code> | Los datos del formulario. |

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
<a name="crearBodega"></a>

## crearBodega(nombre) ⇒ <code>Promise.&lt;object&gt;</code>
Da de alta una bodega desde el propio selector.

**Kind**: global function  
**Returns**: <code>Promise.&lt;object&gt;</code> - La bodega creada, con su id.  
**Throws**:

- [<code>ApiError</code>](#ApiError) Si la API rechaza el alta.

**Endpoint**: POST warehouses.php · op=CreateWarehouse  

| Param | Type | Description |
| --- | --- | --- |
| nombre | <code>string</code> | Nombre de la bodega. |

<a name="useCrearBodega"></a>

## useCrearBodega() ⇒ <code>object</code>
Da de alta una bodega y refresca el catálogo.

**Kind**: global function  
**Returns**: <code>object</code> - El resultado de `useMutation`.  
<a name="iconoUnidad"></a>

## iconoUnidad(rumbo, color) ⇒ <code>object</code>
Marcador de una unidad, apuntando hacia donde va.

**Kind**: global function  
**Returns**: <code>object</code> - El icono de Leaflet.  

| Param | Type | Description |
| --- | --- | --- |
| rumbo | <code>number</code> | Rumbo en grados, como lo reporta el GPS. |
| color | <code>string</code> | Color asignado a la unidad. |

<a name="iconoPunto"></a>

## iconoPunto(etiqueta, color) ⇒ <code>object</code>
Marcador numerado de un extremo de la ruta.

**Kind**: global function  
**Returns**: <code>object</code> - El icono de Leaflet.  

| Param | Type | Description |
| --- | --- | --- |
| etiqueta | <code>string</code> | Lo que va dentro del círculo, normalmente 1 o 2. |
| color | <code>string</code> | Color del círculo. |

<a name="ajustesDe"></a>

## ajustesDe(modo) ⇒ <code>object</code>
Los ajustes de un modo de edición.

**Kind**: global function  
**Returns**: <code>object</code> - Los ajustes.  
**Throws**:

- <code>Error</code> Si el modo no existe.


| Param | Type | Description |
| --- | --- | --- |
| modo | <code>string</code> | Un valor de `MODO_EDICION`. |

<a name="contrarioDe"></a>

## contrarioDe([pais]) ⇒ <code>string</code>
El país del otro lado de la frontera, o cadena vacía si el país no se reconoce.

**Kind**: global function  
**Returns**: <code>string</code> - El país contrario.  

| Param | Type | Description |
| --- | --- | --- |
| [pais] | <code>string</code> | El país base del viaje. |

<a name="useEnlaceTransnacional"></a>

## useEnlaceTransnacional(parametros) ⇒ <code>Object</code>
El enlace de un viaje con su mitad del otro lado de la frontera.

Solo lo usa la edición completa. Cuando el viaje **ya venía enlazado**, no se
ofrece la lista: el enlace está hecho y volver a elegir solo permitiría
romperlo por accidente. Por eso importa si estaba enlazado *al cargar*, no si
lo está ahora mismo.

**Kind**: global function  
**Returns**: <code>Object</code> - Lo que hay que pasarle al formulario general.  

| Param | Type | Description |
| --- | --- | --- |
| parametros | <code>object</code> | Datos del enlace. |
| parametros.activo | <code>boolean</code> | Si esta pantalla edita el enlace. |
| parametros.datosViaje | <code>object</code> | Los datos del viaje en edición. |
| [parametros.anioViaje] | <code>string</code> | Año del viaje, a dos dígitos. |
| parametros.enlazadoAlCargar | <code>boolean</code> | Si el viaje ya traía número de cruce. |
| parametros.onCambio | <code>function</code> | Recibe `(campo, valor)` para actualizar el viaje. |

<a name="documentosFaltantesDeViaje"></a>

## documentosFaltantesDeViaje(viaje) ⇒ <code>Object</code>
Los documentos que le faltan a un viaje, sumando los de todas sus etapas.

La API manda el conteo y la lista por etapa; aquí se juntan y se prefija cada
documento con su etapa, que es lo que hace útil la lista: saber que falta un
BL no sirve si no se sabe de cuál de las tres etapas.

**Kind**: global function  
**Returns**: <code>Object</code> - Cuántos faltan y cuáles.  

| Param | Type | Description |
| --- | --- | --- |
| viaje | <code>object</code> | El viaje con sus etapas. |

<a name="urlDocumento"></a>

## urlDocumento(rutaServidor, apiBase) ⇒ <code>string</code>
La URL con la que se abre un documento del viaje.

Del camino que manda el servidor solo sirve el nombre del archivo; el resto
es la ruta interna de su disco.

**Kind**: global function  
**Returns**: <code>string</code> - La URL, o `#` si no hay documento.  

| Param | Type | Description |
| --- | --- | --- |
| rutaServidor | <code>string</code> | El camino tal como vino de la API. |
| apiBase | <code>string</code> | La base de la API. |

<a name="columnasDeTabla"></a>

## columnasDeTabla(contexto) ⇒ <code>number</code>
Cuántas columnas tiene la tabla en la pestaña actual.

Hace falta para que la fila de "no hay registros" ocupe todo el ancho. Las
columnas cambian por pestaña y por permiso.

**Kind**: global function  
**Returns**: <code>number</code> - Cuántas columnas hay.  

| Param | Type | Description |
| --- | --- | --- |
| contexto | <code>object</code> | En qué pestaña y con qué permisos se está. |
| contexto.conDocumentos | <code>boolean</code> | Si se muestra la columna de faltantes. |
| contexto.enRuta | <code>boolean</code> | Si es la pestaña En Ruta, que añade "copiar". |
| contexto.conAdmin | <code>boolean</code> | Si se muestra la columna de administración. |

<a name="ResultadoArchivo"></a>

## ResultadoArchivo : <code>object</code>
El resultado de validar un archivo.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| valido | <code>boolean</code> | Si el archivo se puede subir. |
| [motivo] | <code>string</code> | Texto para mostrarle a la persona; solo si no es válido. |
| [tipo] | <code>string</code> | La clave de `TIPOS_PERMITIDOS` que se reconoció. |

<a name="Detalle"></a>

## Detalle : <code>object</code>
Contenido estructurado que acompaña a un aviso.

Existe en lugar de una cadena de HTML. Un aviso que necesitaba negritas o una
lista se armaba concatenando etiquetas, y eso metía al DOM texto que venía del
servidor —un nombre de archivo, un mensaje de error— sin escapar. Con datos,
React escapa por su cuenta y la puerta se cierra sola.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [lista] | <code>Array.&lt;string&gt;</code> | Puntos a enumerar, uno por renglón. |
| [renglones] | <code>Array.&lt;{etiqueta: string, valor: string}&gt;</code> | Pares dato-valor. |
| [total] | <code>Object</code> | El renglón destacado del final. |

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

<a name="ViajeTransnacional"></a>

## ViajeTransnacional : <code>object</code>
Un viaje transnacional ya validado.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| trip_id | <code>string</code> | Identificador. |
| trip_number | <code>string</code> | Número del viaje dentro de su país. |
| transnational_number | <code>string</code> \| <code>null</code> | Número que enlaza las dos mitades. |
| movement_number | <code>number</code> \| <code>null</code> | Cuál de las mitades es. |
| country_code | <code>string</code> | País donde ocurre. |
| trip_year | <code>string</code> | Año fiscal, a dos dígitos. |

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

<a name="Ubicacion"></a>

## Ubicacion : <code>object</code>
Una ubicación de la cotización: lo que se escribió y dónde cayó en el mapa.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| input | <code>string</code> | Lo que la persona escribió. |
| geo | <code>Object</code> \| <code>null</code> | Dónde está, si ya se resolvió. |

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

<a name="UnidadFlota"></a>

## UnidadFlota : <code>object</code>
Una unidad de la flota, ya con GPS y telemetría juntos.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| id | <code>string</code> \| <code>number</code> | Identificador del GPS. |
| name | <code>string</code> | Nombre que reporta el GPS. |
| lat | <code>number</code> | Latitud. |
| lon | <code>number</code> | Longitud. |
| speed | <code>number</code> | Velocidad en km/h. |
| heading | <code>number</code> | Rumbo en grados. |
| timestamp | <code>number</code> | Momento del último reporte, en segundos. |
| address | <code>string</code> | Dónde está. |
| color | <code>string</code> | Color asignado. |
| truck_id | <code>string</code> \| <code>null</code> | Camión en la base, o `null` si no está dado de alta. |
| unidad | <code>string</code> | Número de unidad. |
| placa | <code>string</code> | Placa mexicana. |
| status | <code>string</code> | Estado del viaje en curso. |
| trip_number | <code>string</code> \| <code>null</code> | Viaje en curso. |
| current_fuel | <code>number</code> | Galones en el tanque. |
| tank_capacity | <code>number</code> | Capacidad del tanque. |
| avg_mpg | <code>number</code> | Rendimiento promedio. |
| estimated_range | <code>number</code> | Alcance estimado en millas. |

<a name="PuntoRuta"></a>

## PuntoRuta : <code>object</code>
Un punto de la ruta, como lo entienden el mapa y el trazador.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| lat | <code>number</code> | Latitud. |
| lon | <code>number</code> | Longitud. |
| name | <code>string</code> | Cómo se llama el punto en pantalla. |
| [id] | <code>string</code> \| <code>number</code> | Id de la unidad, si el punto es un camión. |

<a name="TotalesViaje"></a>

## TotalesViaje : <code>object</code>
Los totales de un viaje: lo que se cobra y lo que cuesta.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| tarifa | <code>number</code> | Lo facturado por las etapas. |
| diesel | <code>number</code> | Lo gastado en combustible. |
| gastos | <code>number</code> | Los demás gastos del viaje. |
| pagoConductor | <code>number</code> | Lo que se le paga al conductor. |
| utilidad | <code>number</code> | Lo que queda después de restarlo todo. |

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

<a name="DescriptorUnidad"></a>

## DescriptorUnidad : <code>object</code>
Todo lo que distingue a un tipo de unidad de los otros dos.

Las tres pantallas hacen exactamente lo mismo —listar, buscar, dar de alta,
editar el expediente y configurar requisitos— contra tres endpoints que solo
se diferencian en el nombre del sustantivo. En vez de tres pantallas casi
iguales que se van separando con cada arreglo, hay una y esta tabla.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| clave | <code>string</code> | Un valor de `TIPO_UNIDAD`. |
| endpoint | <code>string</code> | Archivo PHP que atiende a este tipo. |
| campoLista | <code>string</code> | Clave del arreglo dentro de la respuesta. |
| campoId | <code>string</code> | Nombre de la columna que identifica a la unidad. |
| ops | <code>object</code> | Nombre de cada operación en este endpoint. |
| columnasPersistidas | <code>boolean</code> | Si el backend guarda qué columnas se ven. |
| etiquetas | <code>object</code> | Los textos de la pantalla. |
| columnas | <code>Array</code> | Las columnas fijas de la tabla, antes de los requisitos. |
| campos | <code>Array</code> | Los campos del formulario de alta y edición. |
| busquedas | <code>Array</code> | Los buscadores de la barra de filtros. |

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

