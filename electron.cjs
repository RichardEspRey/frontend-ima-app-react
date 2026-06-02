const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const path = require("path");
const { autoUpdater } = require("electron-updater");

let win; // ventana global

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // Carga el frontend compilado por Vite usando path.join (Súper seguro)
  win.loadFile(path.join(__dirname, "dist", "index.html"));
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
