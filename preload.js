const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  checkForUpdates: () => ipcRenderer.send('check-for-updates'),
  descargarUpdate: () => ipcRenderer.send('download-update'),
  onUpdateAvailable: (callback) => ipcRenderer.on('update_available', (_e, data) => callback(data)),
  onUpdateProgress: (callback) => ipcRenderer.on('update_progress', (_e, percent) => callback(percent)),
});

// Bloquea el zoom con Ctrl/Cmd + rueda del mouse (Chromium lo maneja a nivel de
// DOM, por eso no se puede interceptar desde el proceso principal). Complementa
// el bloqueo de pinch-zoom y de los atajos de teclado hecho en electron.cjs.
window.addEventListener(
  'wheel',
  (event) => {
    if (event.ctrlKey || event.metaKey) event.preventDefault();
  },
  { passive: false }
);
