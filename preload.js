const { contextBridge, ipcRenderer } = require('electron');

// Registra una escucha y devuelve la función que la da de baja, para que quien
// la monte desde React pueda limpiarla al desmontar.
const escuchar = (canal, callback) => {
  const manejador = (_e, dato) => callback(dato);
  ipcRenderer.on(canal, manejador);
  return () => ipcRenderer.removeListener(canal, manejador);
};

contextBridge.exposeInMainWorld('electron', {
  checkForUpdates: () => ipcRenderer.send('check-for-updates'),
  descargarUpdate: () => ipcRenderer.send('download-update'),
  onUpdateAvailable: (callback) => escuchar('update_available', callback),
  onUpdateProgress: (callback) => escuchar('update_progress', callback),
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
