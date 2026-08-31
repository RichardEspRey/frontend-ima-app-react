// Prueba de humo de la app empaquetada.
//
// `npm test` corre en jsdom: no dice nada de si la app arranca de verdad dentro de
// Electron. Esto sí. Levanta una ventana oculta con las mismas webPreferences que
// producción, carga el build y comprueba lo que importa:
//
//   · que React haya pintado algo de verdad, no solo montado el contenedor
//   · que el puente del preload esté expuesto
//   · que Node NO llegue al renderer, o sea que el aislamiento funcione
//   · que la CSP no esté bloqueando nada
//
// Correr después de tocar Electron, el preload, la CSP o el build:
//   npm run build && npm run humo:electron
//
const { app, BrowserWindow, shell } = require("electron")
const path = require("path")

const RAIZ = path.join(__dirname, "..")
const ESPERA_MAX_MS = 10000

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    webPreferences: {
      preload: path.join(RAIZ, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      nodeIntegrationInWorker: false,
      webviewTag: false,
      allowRunningInsecureContent: false,
    },
  })

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: "deny" }
  })
  win.webContents.on("will-navigate", (evento, url) => {
    if (!url.startsWith("file://")) evento.preventDefault()
  })

  const problemas = []
  win.webContents.on("console-message", (evento) => {
    const nivel = evento?.level ?? ""
    const mensaje = evento?.message ?? ""
    if (nivel === "error" || nivel === "warning") problemas.push(mensaje)
  })
  win.webContents.on("did-fail-load", (_e, codigo, descripcion) =>
    problemas.push(`did-fail-load ${codigo}: ${descripcion}`),
  )

  const sonda = `(async () => {
    const hasta = Date.now() + ${ESPERA_MAX_MS};
    const texto = () => (document.body.innerText || '').trim();
    while (Date.now() < hasta && !texto()) {
      await new Promise((listo) => setTimeout(listo, 100));
    }
    return {
      raiz: !!document.getElementById('root'),
      pintado: (document.getElementById('root')?.children.length ?? 0) > 0,
      puente: typeof window.electron === 'object'
        && typeof window.electron.checkForUpdates === 'function',
      nodeFuera: typeof window.require === 'undefined' && typeof window.process === 'undefined',
      texto: texto().slice(0, 70).replace(/\\s+/g, ' '),
    };
  })()`

  let salida = 1
  try {
    await win.loadFile(path.join(RAIZ, "dist", "index.html"))
    const r = await win.webContents.executeJavaScript(sonda)

    const bloqueos = problemas.filter((p) => /refused to|content security policy/i.test(p))
    const comprobaciones = [
      ["existe #root", r.raiz],
      ["React pintó contenido", r.pintado],
      ["hay texto en pantalla", Boolean(r.texto)],
      ["el preload expone window.electron", r.puente],
      ["Node NO llega al renderer", r.nodeFuera],
      ["la CSP no bloquea nada", bloqueos.length === 0],
    ]

    for (const [que, ok] of comprobaciones) {
      console.log(`  ${ok ? "✓" : "✗"} ${que}`)
    }
    console.log(`\n  en pantalla: ${JSON.stringify(r.texto)}`)
    if (bloqueos.length) console.log(`  bloqueos de CSP:\n    ${bloqueos.join("\n    ")}`)
    else if (problemas.length) console.log(`  avisos: ${problemas.length}`)

    salida = comprobaciones.every(([, ok]) => ok) ? 0 : 1
  } catch (error) {
    console.log(`  ✗ falló al cargar: ${error.message}`)
  }

  console.log(salida === 0 ? "\n  La app arranca correctamente." : "\n  LA APP NO ARRANCA BIEN.")
  app.exit(salida)
})
