# Notas · Pipeline de actualizaciones para Windows

> **Estado: en pausa, sin empezar.** Investigación hecha el 2026-09-02. Se retoma cuando
> Emiliano decida las tres cosas del final. No se ha escrito ningún workflow.

## Lo que ya existe y funciona

**El mecanismo de actualización automática ya está montado.** No hay que inventarlo.

- `electron-updater` cableado en `electron.cjs`: `autoDownload = false`,
  `autoInstallOnAppQuit = true`, comprobación al arrancar, IPC para descargar e instalar.
- `electron-builder` configurado para publicar en **GitHub Releases**.
- Los artefactos correctos ya están publicados en cada release.

```
v.1.5.1 · publicado 2026-08-21
  IMA-Desktop-App-Setup-1.5.1.exe          128.1 MB     5 descargas
  IMA-Desktop-App-Setup-1.5.1.exe.blockmap   0.1 MB     5 descargas
  latest.yml                                           68 descargas
```

**Cómo leer esos números:** las 68 descargas de `latest.yml` frente a 5 del instalador son
las máquinas consultando si hay versión nueva. Las ~5-7 descargas del `.exe` por release
dicen cuántas computadoras Windows hay realmente en uso: **entre cinco y siete**.

El `.blockmap` significa que ya hay **descarga diferencial**: la actualización no baja los
128 MB, solo lo que cambió.

**Solo se publica Windows.** Hay configuración de `mac` en `package.json`, pero no existe
ni un `.dmg` ni un `latest-mac.yml` en ningún release. macOS es otro proceso y queda fuera
de este trabajo.

## Lo que hoy es manual

1. Subir el número en `package.json`.
2. `npm run dist`.
3. Crear el release en GitHub a mano.
4. Subir tres archivos, uno de ellos de 128 MB.

**No existe `.github/` en el repo: cero automatización.**

## Los cinco puntos a resolver antes de escribir nada

### 1 · "Cada push a `main`" es más peligroso de lo que suena

Con 555 commits y sin entorno de pruebas, cada push mandaría una actualización a las
máquinas de producción. Y hay un problema mecánico: **si dos pushes llevan la misma versión
en `package.json`, el segundo release falla.**

Recomendación: separar compilar de publicar. `main` compila y corre pruebas —para enterarse
de que algo se rompió—; publicar es un acto deliberado.

### 2 · El repo es público

Verificado: `api.github.com` responde 200 sin autenticación. Pero `package.json` declara
`"private": true` en el bloque `publish`. Funciona —está demostrado por las descargas— pero
es una inconsistencia que conviene limpiar.

De fondo, y más importante que el pipeline: **el código de una aplicación cuya API no
autentica y viaja sin TLS está publicado**. Ver `refactor/08-DIAGNOSTICO-BD.md`.

### 3 · El build necesita `VITE_API_HOST`

No está versionado, y está bien así. En CI tiene que ir como *secret*. Si falta,
`shared/config/env.js` lanza una excepción y el build falla en claro, que es el
comportamiento correcto.

### 4 · El instalador no está firmado

Windows seguirá mostrando "Windows protegió tu PC" en la **instalación inicial**. Las
actualizaciones posteriores no muestran nada. Un certificado de firma de código ronda los
200-400 USD al año. Es una decisión de presupuesto, no técnica, y se puede agregar después
sin rehacer el pipeline.

### 5 · La app solo busca actualizaciones al arrancar

Quien deje la aplicación abierta toda la semana no se entera hasta reiniciarla. Se puede
agregar una comprobación periódica.

## Dos detalles menores

**Formato de los tags.** Los actuales son `v.1.5.1`, con punto después de la `v`.
`electron-builder` los crea como `v1.5.2`, sin punto. No rompe nada —el updater lee el
último release, no el nombre del tag— pero convivirían dos convenciones.

**Secuencia.** El refactor todavía no está en `main`. El primer release automático sería el
del refactor completo. Conviene montar el pipeline, probarlo con un *prerelease* —que
`electron-updater` ignora por omisión— y decidir aparte cuándo se dispara el primero de
verdad.

## Costo

GitHub Actions es **ilimitado en repositorios públicos**. Un build de Windows ronda los
8-12 minutos.

## Lo que hay que decidir para retomar

1. **Disparador**: ¿tag publica y push a `main` solo compila? ¿O cada push publica? ¿O cada
   push crea un borrador que alguien publica a mano?
2. **Versionado**: ¿manual en `package.json`, o automático leyendo los prefijos de commit
   (`feat` sube minor, `fix` sube patch)?
3. **Firma**: ¿se deja sin firmar por ahora, o se cotiza un certificado?

## Preguntas abiertas que conviene resolver de paso

- **Cómo probar sin molestar a nadie**: con un release marcado como *prerelease*.
- **Qué pasa si un release sale mal**: borrarlo hace que las máquinas vuelvan a ver la
  versión anterior, pero **las que ya se actualizaron no regresan solas**. Hace falta un
  procedimiento escrito para eso antes del primer release automático.
