const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  checkForUpdates: () => ipcRenderer.send('check-for-updates'),
  descargarUpdate: () => ipcRenderer.send('download-update'),
  onUpdateAvailable: (callback) => ipcRenderer.on('update_available', (_e, data) => callback(data)),
  onUpdateProgress: (callback) => ipcRenderer.on('update_progress', (_e, percent) => callback(percent)),
});
