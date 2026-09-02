const { app, BrowserWindow, dialog, ipcMain, shell } = require("electron");
const path = require("path");
const { autoUpdater } = require("electron-updater");

let win; // ventana global

// Protocolos que se pueden abrir en el navegador del sistema. Lista blanca a
// proposito: shell.openExternal se lo entrega al sistema operativo, asi que un
// esquema inesperado puede lanzar cualquier programa instalado. La API viaja por
// HTTP en claro, asi que la URL de un documento puede venir alterada.
const PROTOCOLOS_EXTERNOS = ["http:", "https:", "mailto:"];

/**
 * Indica si una URL se puede entregar al sistema operativo sin riesgo.
 *
 * @param {string} url La URL a evaluar.
 * @returns {boolean} `true` si su protocolo esta en la lista blanca.
 */
function esExternaSegura(url) {
  try {
    return PROTOCOLOS_EXTERNOS.includes(new URL(url).protocol);
  } catch {
    return false;
  }
}

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      nodeIntegrationInWorker: false,
      webviewTag: false,
      allowRunningInsecureContent: false,
      sandbox: true,
      spellcheck: false,
    },
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (esExternaSegura(url)) shell.openExternal(url);
    return { action: "deny" };
  });

  win.webContents.on("will-navigate", (event, url) => {
    if (!url.startsWith("file://")) event.preventDefault();
  });

  // La app no usa camara, microfono, ubicacion ni notificaciones del sistema.
  // Sin este manejador, Electron concede varios de esos permisos sin preguntar.
  win.webContents.session.setPermissionRequestHandler((_wc, _permiso, conceder) => {
    conceder(false);
  });

  win.webContents.session.setPermissionCheckHandler(() => false);

  // Un preload que no se pueda cargar dejaria la ventana sin puente de IPC y con
  // la app pintando a medias; es mejor saberlo que verlo como un fallo raro.
  win.webContents.on("preload-error", (_event, ruta, error) => {
    dialog.showErrorBox("Error al iniciar", `No se pudo cargar ${ruta}: ${error.message}`);
  });

  // Carga el frontend compilado por Vite usando path.join (Súper seguro)
  win.loadFile(path.join(__dirname, "dist", "index.html"));

  // -------------------------------
  //  BLOQUEO DE ZOOM
  // -------------------------------
  // Electron habilita por defecto el pinch-to-zoom del trackpad y los atajos
  // Ctrl+Plus/Ctrl+Minus/Ctrl+0. Un gesto accidental (ej. al mover el mouse/trackpad
  // hacia el sidebar para cambiar de módulo) dispara ese zoom nativo de Chromium,
  // recortando las tablas. Lo fijamos en 100% y desactivamos ambos mecanismos para
  // que la app se vea igual sin importar laptop o monitor.
  win.webContents.on("did-finish-load", () => {
    win.webContents.setZoomFactor(1);
    win.webContents.setVisualZoomLevelLimits(1, 1); // bloquea pinch-zoom del trackpad
  });

  win.webContents.on("before-input-event", (event, input) => {
    const isZoomKey = ["+", "-", "=", "0", "Add", "Subtract"].includes(input.key);
    if ((input.control || input.meta) && isZoomKey) {
      event.preventDefault();
    }
  });
}

// -------------------------------
//  LÓGICA DE AUTO-ACTUALIZACIÓN
// -------------------------------
autoUpdater.autoDownload = false; // No descarga automáticamente
autoUpdater.autoInstallOnAppQuit = true; // Instala al cerrar

//  1) Enviar evento a React cuando hay nueva versión
autoUpdater.on("update-available", () => {
  if (win) {
    win.webContents.send("update_available"); // 🔥 Notifica al frontend
  }
});

//  2) Descargar cuando React lo solicite
ipcMain.on("download-update", () => {
  autoUpdater.downloadUpdate();
});

//  3) Instalar al finalizar la descarga
autoUpdater.on("update-downloaded", () => {
  dialog
    .showMessageBox(win, {
      title: "Actualización lista para instalar",
      message:
        "La nueva versión se descargó correctamente. Se instalará al reiniciar.",
      buttons: ["Reiniciar ahora", "Después"],
    })
    .then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall(false, true);
      }
    });
});
//Estado de descarga
autoUpdater.on("download-progress", (progress) => {
  win.webContents.send("update_progress", progress.percent);
});

//  4) Mostrar errores si algo falla
autoUpdater.on("error", (error) => {
  dialog.showErrorBox(
    "Error al actualizar",
    error == null ? "Error desconocido" : (error.stack || error).toString(),
  );
});

//  5) React puede pedir verificar actualizaciones
ipcMain.on("check-for-updates", () => {
  autoUpdater.checkForUpdates();
});

// -------------------------------
// CICLO DE VIDA DE LA APP
// -------------------------------
app.whenReady().then(() => {
  createWindow();

  // En producción, busca actualizaciones automáticamente
  if (!process.env.IS_DEV) {
    autoUpdater.checkForUpdates();
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
