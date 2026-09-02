# Estándar de ingeniería frontend

> Este documento es **portátil**. Está escrito para aplicarse a cualquier aplicación
> frontend, no solo a esta. Los ejemplos vienen de IMA Desktop porque son reales y
> medidos, pero las reglas no dependen de este proyecto ni de su stack.
>
> **Cómo usarlo.** Es a la vez el brief de un refactor y el criterio de aceptación de
> cualquier cambio. Cada regla trae *qué*, *por qué* y **cómo se comprueba**. Una regla que
> no se puede comprobar es una opinión, y las opiniones no sobreviven a la tercera semana
> de un proyecto.

---

## 0 · Los cinco compromisos

Todo lo demás sale de aquí. Si hay que elegir entre dos formas de hacer algo, gana la que
más se acerque a estas cinco frases:

1. **Ningún archivo pasa de 1 000 líneas.** No es una preferencia estética: es el síntoma
   que revela que una unidad hace más de una cosa.
2. **Las dependencias apuntan en una sola dirección.** Un módulo puede depender de lo más
   general que él; nunca de lo más específico, nunca de un hermano.
3. **Lo que se repite tres veces se extrae.** Dos veces es coincidencia; tres es un patrón.
4. **La interfaz se comporta igual en toda la app.** Un botón, una tabla, un error y una
   espera se ven y se comportan igual sin importar en qué pantalla estén.
5. **Un fallo se contiene donde ocurre.** Nunca deja la aplicación en blanco ni en silencio.

---

## 1 · Arquitectura: la dirección de las dependencias

### La estructura

Capas ordenadas de lo más concreto a lo más general. **Cada una solo puede importar de las
que están por debajo.**

```
app/        Composición: providers, tema, router. No tiene lógica de negocio.
  ↓
pages/      Una pantalla = una ruta. Orquesta; no implementa.
  ↓
features/   Un caso de uso con su UI y su estado. Ej.: "editar un viaje".
  ↓
entities/   El dominio: modelo, validación y acceso a datos de un concepto.
  ↓
shared/     Lo que no sabe nada del negocio: UI base, utilidades, cliente de API.
```

**La regla que más se viola y más duele:** *una `feature` no puede importar otra `feature`.*
Cuando dos features necesitan lo mismo, ese algo no pertenece a ninguna de las dos: se baja
a `shared/` o a `entities/`. Sin esta regla, las features se enredan entre sí y en seis
meses no se puede tocar una sin romper tres.

**Cómo se comprueba:** con un linter de fronteras (`eslint-plugin-boundaries` o
equivalente), no con revisiones de código. Una regla que depende de que un humano se acuerde
no es una regla.

### SOLID, en concreto

Los principios sirven cuando se traducen a decisiones observables. Así se traducen aquí:

| Principio | Traducción operativa | Se detecta cuando… |
|---|---|---|
| **SRP** | Una pantalla orquesta; la lógica vive en un hook o en el modelo de la entidad | Un componente pasa de ~300 líneas o mezcla `fetch`, cálculo y JSX |
| **OCP** | Agregar un caso es agregar una entrada a una tabla, no un `if` más | Aparece el tercer `else if` sobre el mismo valor |
| **LSP / ISP** | Props angostas y con un solo significado | Un componente recibe un objeto entero para usar dos campos |
| **DIP** | Los componentes hablan con la capa de API, nunca con `fetch` | Aparece un `fetch(` fuera de `shared/api` |

### El patrón que sustituye a las cadenas de `if`

Cuando el mismo bloque cambia según un tipo, no se ramifica: **se parametriza**. Un *shell*
único más una tabla de descriptores, uno por tipo.

```js
// Antes: tres pantallas casi idénticas, o una con banderas por todas partes.
// Después: una pantalla y una tabla.
export const TIPOS = {
  CAMION:    { endpoint: "trucks.php",   campoId: "truck_id",  columnas: [...] },
  CAJA:      { endpoint: "cajas.php",    campoId: "caja_id",   columnas: [...] },
  CONDUCTOR: { endpoint: "drivers.php",  campoId: "driver_id", columnas: [...] },
}
```

Agregar un cuarto tipo es agregar una fila. Nadie toca el shell, así que nadie puede
romperlo. **Este patrón es el que de verdad mata los archivos de 1 000 líneas**, más que
cualquier regla de longitud.

---

## 2 · Estado: el fin del prop drilling

Tres tipos de estado, tres herramientas. Mezclarlos es el origen de la mayoría de los bugs
de sincronización.

| Tipo | Qué es | Dónde vive |
|---|---|---|
| **De servidor** | Datos que son de otro sistema y aquí solo se cachean | Una librería de queries con caché, invalidación y reintentos |
| **De sesión / global** | Quién es el usuario, qué puede hacer, preferencias | Un store global pequeño |
| **Local** | Un modal abierto, el texto de un input | `useState`, y nada más |

**Regla dura:** los datos de servidor **nunca** se copian a `useState`. En cuanto se copian,
hay dos fuentes de verdad y empieza el trabajo de mantenerlas iguales, que es trabajo
infinito.

**Cómo se comprueba:** buscar `useEffect` que solo hagan `setState` con datos de una
petición. Cada uno es un bug esperando.

---

## 3 · La frontera con el backend

Todo el acceso a datos pasa por **una** capa. No hay excepciones "solo por esta vez".

Esa capa se encarga de:

- **Construir la petición.** Un solo lugar que sabe cómo se serializa.
- **Validar la respuesta** con un esquema. Lo que no cumple se descarta con un aviso, no
  revienta una pantalla.
- **Traducir el fallo a un tipo propio** con una *causa* legible por código, no por texto.
- **Distinguir cancelación de fallo.** Cambiar de pantalla con una petición en vuelo produce
  un rechazo que **no es un error**. Confundirlos llena los registros de ruido y le enseña
  a la gente a ignorarlos.
- **Sanear la entrada.** Quitar caracteres de control e invisibles, normalizar Unicode.

**Lo que esta capa NO debe hacer:** escapar comillas ni censurar palabras para "prevenir
inyección". Si el backend no está parametrizado, escapar en el cliente no protege —un
atacante no usa el cliente— y sí corrompe datos legítimos, como el apellido *O'Brien*. La
inyección se cierra con sentencias preparadas del lado del servidor. **Un control que da
sensación de seguridad sin darla es peor que no tenerlo**, porque cierra la conversación.

### Qué sí es responsabilidad del frontend

- **Lista blanca de protocolos** en toda URL que llegue a un `href` o se abra fuera de la
  app. `javascript:` en un `href` se ejecuta.
- **Validar archivos por su contenido**, no por su extensión: la extensión y el tipo MIME
  los controla quien sube; los primeros bytes, no.
- **Límites de longitud** por campo, alineados con el esquema de datos.
- En un contenedor de escritorio: aislamiento de contexto, sin integración de Node en el
  renderer, CSP, y permisos del sistema denegados por omisión.

---

## 4 · Consistencia visual: el sistema de diseño

> Esta sección existe porque la incoherencia visual **no se arregla revisando pantalla por
> pantalla**. Se arregla quitando la posibilidad de ser incoherente.

### El diagnóstico que se repite en todos los proyectos

Una aplicación sin tema configurado tiene, por definición, dos lenguajes visuales: el que
viene por omisión con la librería de componentes, y el que cada pantalla se escribe a mano
para escapar de él. En este proyecto eso significó **1 212 colores escritos a mano** en el
código. No porque nadie tuviera criterio, sino porque **no había dónde ponerlo**.

### Las tres capas, de la más general a la más concreta

**1 · Tokens.** El vocabulario. Colores, radios, sombras, tipografía y espaciado con
nombre. Un token se nombra **por su papel, no por su apariencia**: `COLOR.PELIGRO`, no
`COLOR.ROJO`. Un día el peligro deja de ser rojo y el nombre sigue siendo correcto.

**2 · Tema.** Los tokens aplicados a los valores por omisión de la librería de componentes.
**Esta es la capa que homogeneiza sin tocar archivo por archivo**: una pantalla que nadie
migró ya hereda la tipografía, los radios, los bordes y el color de marca correctos.

**3 · Presets y componentes compartidos.** Para lo que el tema no alcanza: la composición de
un encabezado de página, el aspecto de una tabla, el estado vacío.

### Reglas

- **El color se define una vez.** Un valor literal en un componente es un defecto, salvo
  dentro del archivo de tokens.
- **El tema no decide el color de una superficie.** Es la regla que más fácil se viola y la
  más cara: forzar, por ejemplo, un fondo blanco a todos los campos de texto rompe cualquier
  campo colocado sobre un panel oscuro, y el fallo aparece en una pantalla que nadie estaba
  mirando. *Lo global define el vocabulario; lo local decide el uso.*
- **Distinguir color decorativo de color con significado.** Son tres familias distintas y
  no deben mezclarse:

  | Familia | Para qué | Se puede unificar |
  |---|---|---|
  | **Neutra / de marca** | Estructura, texto, bordes | Sí, siempre |
  | **De estado** | Éxito, aviso, error, información | Sí, pero conserva su semántica |
  | **Categórica** | Distinguir series, categorías, entidades | **No.** Unificarla borra el dato |

  Un ejemplo real de la mezcla: usar el color de *advertencia* para la serie "Total Pagado"
  de una gráfica. El ámbar significa "atención" en toda la app, y una barra de cobranza no
  es una advertencia. Las series de datos necesitan **su propia paleta**, cuyo único trabajo
  es distinguir una de otra.

- **Lo categórico se nombra y se le da forma común.** No se unifican los colores, se unifica
  la *estructura* del tinte —fondo muy claro, texto oscuro, borde intermedio, acento—, de
  modo que toda categoría se construya igual aunque su color sea distinto.

### Cómo se comprueba

```bash
# Valores de color literales fuera del archivo de tokens: deben tender a cero.
grep -rn "#[0-9a-fA-F]\{6\}" src/ | grep -v tokens
```

Es una métrica, no un número mágico: lo que importa es que **baje** y que lo que quede esté
justificado por escrito.

### Migrar sin romper

Una migración de estilos se hace en pasadas separadas, cada una verificable por su cuenta:

1. **Idénticas** — el literal ya era el valor del token. Cero cambio visual; solo le pone
   nombre. Es el 60–70 % del trabajo y tiene riesgo nulo.
2. **Vecinas** — valores casi iguales que se alinean a la escala. Cambio mínimo.
3. **Acentos** — valores dispersos que se llevan a los colores de estado. Aquí sí cambia el
   aspecto, y es el objetivo.
4. **Lo que quede** — se revisa a mano y se documenta por qué se queda.

Mezclar las cuatro en un solo commit hace imposible saber si un cambio visual fue
intencional.

---

## 5 · Estados de carga

> Un indicador de carga tiene un solo trabajo: **decirle a alguien qué va a pasar y cuánto
> espacio va a ocupar.** Un círculo girando no hace ninguna de las dos cosas.

### La regla que decide qué usar

No es una cuestión de moda. Hay dos situaciones distintas:

| Situación | Qué usar | Por qué |
|---|---|---|
| **Va a llegar contenido de forma conocida** | Esqueleto | Se puede reservar el sitio, así que no hay salto |
| **Algo está trabajando** (guardar, subir, calcular) | Indicador de progreso | No va a aparecer contenido en ese hueco; un esqueleto mentiría |

Aplicar esqueletos a todo es tan incorrecto como no aplicarlos a nada. El botón que dice
"Guardando…" con su indicador está **bien**: reemplazarlo por un esqueleto sería peor.

### Los detalles que separan un esqueleto útil de uno decorativo

Un esqueleto que no cumple estos tres puntos no elimina el salto; solo lo hace más pequeño y
más difícil de diagnosticar:

- **Mismas dimensiones que el contenido real.** Mismo alto de fila, mismo número de filas
  que la página que va a llegar.
- **Medidas absolutas, no porcentuales.** Mientras carga no hay datos, así que las columnas
  se encogen al ancho de su encabezado; un 70 % de una columna estrecha es una astilla de
  cuatro píxeles.
- **Un umbral antes de mostrarlo.** Una respuesta de 90 ms no necesita anuncio: el esqueleto
  aparecería y desaparecería antes de que a nadie le diera tiempo de leerlo, y ese parpadeo
  se percibe como un error. Umbral típico: 200–300 ms. **La bajada es inmediata**; el umbral
  solo aplica a la subida.

### Accesibilidad: no es opcional

Un esqueleto es una pista **exclusivamente visual**. Quien navega con lector de pantalla no
ve nada y se queda sin saber que la aplicación está trabajando.

**Todo estado de carga lleva un anuncio textual** (`role="status"`, `aria-live="polite"`)
que no se ve pero sí se lee. Ventaja secundaria: es también el punto de anclaje estable para
las pruebas, que no deberían depender de clases CSS.

---

## 6 · Manejo de errores

> El objetivo no es que no haya errores. Es que **un error se contenga donde ocurre**, se
> explique, y deje una salida.

### Las cuatro capas, de la más cercana al fallo a la más lejana

Cada una atrapa lo que la anterior no puede. Ninguna sustituye a otra.

| Capa | Atrapa | Efecto |
|---|---|---|
| **1. Estado de error de la sección** | Una consulta que falló | El resto de la pantalla sigue viva |
| **2. Barrera de error por pantalla** | Un fallo de render | La navegación sobrevive |
| **3. Gancho global de la capa de datos** | Lo que ninguna pantalla miró | Nada falla en silencio |
| **4. Manejadores globales del entorno** | Rechazos sin `catch`, errores fuera del árbol | Última red |

### Reglas

**La barrera de error se monta por pantalla, dentro del layout — nunca una sola vez arriba
del todo.** Si envuelve la aplicación entera, un fallo se lleva también la navegación, y la
única salida es recargar. En una aplicación de escritorio **no hay barra de direcciones**:
la única salida es cerrar y volver a abrir el programa.

**La barrera debe olvidar el error al cambiar de pantalla.** Es el detalle que más se
olvida y el que convierte "esta pantalla falló" en "la aplicación se rompió": sin él, el
mensaje se queda puesto para siempre, porque el componente que falló ya no está pero el
estado sí.

**Un mensaje de error tiene tres partes, y la tercera es la que casi siempre falta:**

1. Qué pasó, en el idioma de quien lo lee.
2. **Qué puede hacer al respecto.**
3. El botón para hacerlo.

El detalle técnico se conserva —hace falta para reportar el fallo— pero **plegado y
desmontado**, no solo oculto por CSS. Un lector de pantalla lee lo que está en el DOM
aunque no se vea, y nadie pidió que le leyeran una traza de pila.

**Nunca se muestra el texto crudo de una excepción.** `Cannot read properties of undefined`
no le sirve a nadie que no esté leyendo el código, y erosiona la confianza en el sistema.

### Interrumpir o no interrumpir: la distinción que hay que hacer bien

| El fallo viene de… | Cómo se avisa |
|---|---|
| **Algo que la persona acaba de pulsar** | Diálogo con botón. Hay que enterarse antes de seguir |
| **Algo de fondo** (una consulta, una promesa) | Aviso discreto que se va solo |

Enganchar los fallos de fondo a un diálogo modal es un error clásico y **empeora el
problema**: tapa la pantalla y obliga a descartar un mensaje sobre algo que la persona ni
siquiera estaba mirando, escondiendo de paso lo que sí cargó bien.

**Un mismo fallo no debe avisar seis veces.** Una pantalla con seis consultas contra un
servidor caído produce seis rechazos idénticos en el mismo segundo. Debe haber **un solo
punto de salida** para los avisos, con una ventana de silencio por mensaje (5 s es
razonable). Que sea uno solo es justo lo que hace que la deduplicación funcione: si cada
origen tuviera la suya, la ráfaga seguiría apilándose.

**Las cancelaciones no son errores.** Cambiar de pantalla con una petición en vuelo produce
un rechazo esperado. Avisar de eso es ruido constante que le enseña a la gente a ignorar los
avisos de verdad.

### Reintentar: cuándo tiene sentido

Solo lo que puede arreglarse solo: red caída, tiempo agotado, error del servidor. Un error
de negocio —"ese registro ya existe"— daría el mismo resultado tres veces y solo retrasaría
el mensaje. **La política de reintento se decide por la causa del error, no por su texto**;
por eso el tipo de error propio lleva una causa como dato.

### Cómo se comprueba

La prueba real es una sola: **romper una pantalla a propósito** y confirmar que el resto de
la aplicación sigue usable y que se puede salir navegando, sin recargar.

---

## 7 · Documentación

**Todo lo exportado lleva documentación.** Nombre, parámetros, retorno y —cuando el
comportamiento sorprende— un ejemplo.

**Dentro del cuerpo de una función, cero comentarios.** Un comentario que explica *qué* hace
una línea es una línea mal escrita. El *porqué* va en el commit o en un registro de
decisión, que es donde alguien lo va a buscar dentro de un año.

**Tres excepciones**, y solo tres:

1. Una **trampa real** que se repetiría: un formato de fecha inválido que llega del backend,
   un prefijo con significado, un identificador que no es lo que parece.
2. **Intención perdida**: código que existe pero no se aplica, y que borrar sería tomar una
   decisión de negocio sin permiso. Se deja escrito por qué sigue ahí.
3. La **razón de una excepción a una regla** —una supresión de linter, por ejemplo—, junto a
   la excepción.

### Los registros de decisión

Cada decisión estructural deja un documento corto con: contexto, decisión, alternativas
descartadas y **consecuencias**, incluidas las malas. Un registro que solo cuenta lo bueno
es publicidad, y nadie confía en él la segunda vez.

**La documentación se produce con cada incremento, nunca al final.** La que se pospone no se
escribe, y si se escribe es desde la memoria, que a esas alturas ya es ficción.

---

## 8 · Pruebas

Se prueba **la regla de negocio y el contrato**, no el detalle de implementación.

| Sí se prueba | No se prueba |
|---|---|
| El cálculo de un total con sus casos borde | Que un componente pinte cierto `div` |
| Que un error de red se traduzca al mensaje correcto | El color exacto de un elemento |
| Que las rutas monten sin reventar | El orden interno de un hook |

**Fixtures reales.** Guardar respuestas de verdad del backend, incluidas las raras: la que
viene vacía, la que trae `null` donde debería haber número, la que trae una fecha inválida.
Un fixture inventado prueba que el código funciona con datos que nunca van a llegar.

### La lección más cara sobre las pruebas

**Una prueba que simula la dependencia no puede encontrar un fallo dentro de ella.** En este
proyecto, una función de aviso tenía un `ReferenceError` —una abreviatura de objeto que
apuntaba a una variable inexistente— que **ninguna prueba vio, porque todas simulaban ese
módulo**. Apareció al usar la aplicación.

De ahí dos consecuencias prácticas:

- Cada módulo necesita pruebas **en su propio límite**, no solo donde se le consume.
- Un cambio de interfaz se verifica **también a mano**, en la aplicación real. Las pruebas
  no ven colores, ni saltos de layout, ni un modal que tapa lo que hacía falta ver.

---

## 9 · Definición de terminado

Un cambio no está terminado hasta que **todo** esto es cierto:

- [ ] Ningún archivo del cambio pasa de 1 000 líneas.
- [ ] No hay dependencias en dirección prohibida; el linter de fronteras pasa.
- [ ] No hay acceso a datos fuera de la capa de API.
- [ ] Los colores, espaciados y radios salen de los tokens.
- [ ] Cada carga usa el indicador que le corresponde, con las dimensiones del contenido
      real y su anuncio accesible.
- [ ] Cada fallo tiene un estado visible con salida, y no puede tumbar la pantalla entera.
- [ ] Todo lo exportado está documentado; el cuerpo no tiene comentarios sin justificación.
- [ ] Hay pruebas de las reglas nuevas, con fixtures reales.
- [ ] **Se vio funcionando en la aplicación real**, no solo en verde en la terminal.
- [ ] Lo que se decidió y no es obvio quedó escrito donde alguien lo va a buscar.

---

## 10 · Anti-patrones

Los que más cuestan, en orden de frecuencia:

| Anti-patrón | Por qué duele |
|---|---|
| **Copiar una pantalla para hacer la siguiente** | El defecto se duplica; la corrección no |
| **Copiar datos de servidor a estado local** | Dos fuentes de verdad y trabajo infinito de sincronizarlas |
| **Una barrera de error única arriba del todo** | Un fallo se lleva también la navegación |
| **Un valor de color literal "solo por esta vez"** | Nunca es una vez; son 1 212 |
| **Una regla global que decide algo local** | Rompe en la pantalla que nadie estaba mirando |
| **Escapar entradas en el cliente por seguridad** | No protege y sí corrompe datos legítimos |
| **Un aviso modal para un fallo de fondo** | Tapa lo que sí funcionó y obliga a descartarlo |
| **Documentar al final del proyecto** | No se escribe, y si se escribe es desde la memoria |
| **Dejar código sin uso "por si acaso"** | Se mantiene, se lee y confunde, y nunca se usa |

---

## Apéndice · Aplicar esto a un proyecto nuevo

Orden sugerido. Cada paso deja el proyecto en un estado usable, y ninguno depende de que el
siguiente se complete:

1. **Medir antes de tocar.** Archivos por tamaño, valores literales, dependencias cruzadas,
   cobertura. Sin la medición inicial no hay forma de saber si el refactor sirvió.
2. **Red de seguridad primero**: pruebas de humo de todas las rutas, linter de fronteras en
   modo aviso, y un comando único que verifique todo.
3. **La capa de API**, antes que cualquier pantalla. Es la que hace posible todo lo demás.
4. **Tokens y tema.** Barato, y todas las pantallas mejoran solas.
5. **Los componentes transversales**: tabla, encabezado, estados de carga, estados de error.
6. **Los módulos, de frío a caliente.** El que menos cambia se migra primero: sirve de
   patrón de referencia con el menor riesgo de conflicto.
7. **Subir el linter de aviso a error** por capa, según se migra. Un módulo migrado no puede
   regresar.

**Sobre las ramas de vida larga.** Un refactor en una rama que no se sincroniza a diario
muere; no por hacer demasiado, sino por quedarse atrás de lo que se sigue desarrollando. Hay
que medir la divergencia y ponerle un umbral explícito con acción asociada.
