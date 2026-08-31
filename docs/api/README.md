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
<dt><a href="#FRESCURA_CATALOGO_MS">FRESCURA_CATALOGO_MS</a> : <code>number</code></dt>
<dd><p>Tiempo que un catálogo se considera fresco. Conductores, camiones, cajas y
almacenes cambian de vez en cuando, no dentro de una sesión de trabajo: no
tiene sentido volver a pedirlos en cada pantalla que los use.</p>
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
</dl>

## Typedefs

<dl>
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
<a name="FRESCURA_CATALOGO_MS"></a>

## FRESCURA\_CATALOGO\_MS : <code>number</code>
Tiempo que un catálogo se considera fresco. Conductores, camiones, cajas y
almacenes cambian de vez en cuando, no dentro de una sesión de trabajo: no
tiene sentido volver a pedirlos en cada pantalla que los use.

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

