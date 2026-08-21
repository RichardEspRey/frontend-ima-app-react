const { contextBridge, ipcRenderer } = require('electron');
const {
  START_NOTIFICATION_SERVICE,
  NOTIFICATION_SERVICE_STARTED,
  NOTIFICATION_SERVICE_RESTARTED,
  NOTIFICATION_SERVICE_ERROR,
  NOTIFICATION_RECEIVED,
  TOKEN_UPDATED,
} = require('@cuj1559/electron-push-receiver/src/constants');

contextBridge.exposeInMainWorld('electron', {
  checkForUpdates: () => ipcRenderer.send('check-for-updates'),
  descargarUpdate: () => ipcRenderer.send('download-update'),
  onUpdateAvailable: (callback) => ipcRenderer.on('update_available', (_e, data) => callback(data)),
  onUpdateProgress: (callback) => ipcRenderer.on('update_progress', (_e, percent) => callback(percent)),

  // Notificaciones push (Firebase Cloud Messaging vía @cuj1559/electron-push-receiver)
  startPushReceiver: (appId, projectId, apiKey, vapidKey) =>
    ipcRenderer.send(START_NOTIFICATION_SERVICE, appId, projectId, apiKey, vapidKey),
  onTokenUpdate: (callback) => ipcRenderer.on(TOKEN_UPDATED, (_e, token) => callback(token)),
  onPushServiceStarted: (callback) => ipcRenderer.on(NOTIFICATION_SERVICE_STARTED, (_e, token) => callback(token)),
  onPushServiceRestarted: (callback) => ipcRenderer.on(NOTIFICATION_SERVICE_RESTARTED, (_e, token) => callback(token)),
  onNotificationReceived: (callback) => ipcRenderer.on(NOTIFICATION_RECEIVED, (_e, payload) => callback(payload)),
  onPushError: (callback) => ipcRenderer.on(NOTIFICATION_SERVICE_ERROR, (_e, error) => callback(error)),
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
