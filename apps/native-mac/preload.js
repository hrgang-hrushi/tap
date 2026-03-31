const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('knockAPI', {
  setKnockThreshold: (value) => ipcRenderer.invoke('set-knock-threshold', value),
  executeAction: (action) => ipcRenderer.send('execute-action', action),
  requestMicrophoneAccess: () => ipcRenderer.invoke('request-microphone-access'),
  getMicrophoneStatus: () => ipcRenderer.invoke('get-microphone-status'),
  onKnock: (callback) => {
    ipcRenderer.on('knock_event', (event, data) => callback(data));
  }
});
