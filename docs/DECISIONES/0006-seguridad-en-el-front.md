# 0006 · Qué puede y qué no puede hacer la seguridad del front

**Fecha:** 2026-09-02 · **Estado:** aceptada

## Contexto

Se pidió "una capa de seguridad en el front para que no sea posible inyectar nada de SQL o
cosas de ese estilo". Al medirlo, el pedido se parte en dos mitades muy distintas.

## La mitad que el front no puede resolver

**La inyección SQL no se arregla desde el navegador.** La API de IMA no autentica: la
identidad es un `id_usuario` que manda el cliente. Cualquiera puede hacer esto sin abrir
la aplicación:

```
curl -X POST http://imaexpressllc.com/<endpoint>.php -F "op=..." -F "id_usuario=1"
```

Si el front escapa comillas, el atacante simplemente no usa el front. Peor: escapar rompe
datos legítimos —apellidos como O'Brien, una nota que mencione "select"— y deja la
sensación de estar protegido sin estarlo.

**La inyección se cierra con sentencias preparadas en PHP.** Es fase 2, y es la razón por
la que `limpiarTexto` normaliza y limpia pero **no** escapa ni censura palabras.

Lo mismo vale para los permisos guardados en `localStorage`: son manipulables desde las
herramientas de desarrollo, pero como la API no comprueba nada del lado del servidor,
endurecerlos aquí no le quita capacidad a nadie. Se cierra con autorización en el backend.

## La mitad que sí es del front, y estaba abierta

Estas sí eran vulnerabilidades reales de esta aplicación, no teoría:

| Hueco | Por qué importaba aquí |
|---|---|
| **URLs de documentos sin validar en `href`** | La API viaja **por HTTP en claro**. Un intermediario en la red puede cambiar la ruta de un documento por `javascript:...`, y en Electron eso se ejecuta con los permisos del renderer. Eran 20 enlaces. |
| **`shell.openExternal` sin lista blanca** | Recibía cualquier URL y se la entregaba al sistema operativo, que puede lanzar el programa registrado para ese esquema. |
| **16 subidas de archivo sin ninguna comprobación** | Ni tamaño, ni tipo, ni contenido. |
| **Permisos del sistema concedidos por omisión** | Electron concede varios sin preguntar; la app no usa cámara, micrófono ni ubicación. |
| **`rel` incompleto en enlaces externos** | Sin `noopener`, la página abierta puede manipular la que la abrió. |

## Decisión

Una capa en `src/shared/security/`, aplicada **en la costura por donde pasa todo**, no
pantalla por pantalla:

- **`urls.js`** — lista blanca de protocolos. `urlSegura()` envuelve los 20 `href` que
  reciben una URL del servidor; lo que no es `http`/`https` o una ruta relativa se
  convierte en `about:blank`, que es un fallo visible y sin daño.
- **`archivos.js`** — valida tamaño, extensión **y la firma binaria** del contenido. La
  extensión y el `file.type` los controla quien sube: renombrar `algo.exe` a `algo.pdf`
  cambia las dos cosas y no cambia el contenido. Los primeros bytes son lo único que dice
  qué es el archivo de verdad. El `accept` del input se genera de la misma tabla que
  valida, para que el filtro y la comprobación no se desincronicen.
- **`texto.js`** — quita caracteres de control e invisibles y normaliza a NFC. Se aplica en
  `construirFormData`, el único punto por el que salen las 232 llamadas. **No trunca**: el
  límite depende de la columna, y truncar ahí perdería datos en silencio.
- **`seleccion.js`** — `archivoDelEvento` / `archivosDelEvento`, para que las 16 subidas
  compartan la validación en vez de repetirla, y para que la número 17 no la olvide.
- **Electron** — `sandbox: true`, lista blanca en `openExternal`, y los permisos del
  sistema denegados de entrada.

## Consecuencias

- Un documento cuya URL venga alterada abre una pestaña en blanco en lugar de ejecutar
  código.
- Un archivo con la extensión cambiada se rechaza con un mensaje que dice exactamente eso.
- Los límites de largo por campo (`LARGO_MAXIMO`) están disponibles pero **no aplicados**
  todavía: hay que revisar columna por columna cuál corresponde a cada campo.
- **Nada de esto sustituye a la fase 2.** Cierra lo que se puede cerrar desde aquí y deja
  escrito, arriba, lo que no.
