const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('knockAPI', {
  requestPermissions: () => ipcRenderer.invoke('request-permissions'),
  executeAction: (action) => ipcRenderer.send('execute-action', action),
  onDeviceMotion: (callback) => {
    window.addEventListener('devicemotion', callback);
  },
  onDeviceOrientation: (callback) => {
    window.addEventListener('deviceorientation', callback);
  }
});
