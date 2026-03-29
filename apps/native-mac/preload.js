const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('knockAPI', {
  executeAction: (action) => ipcRenderer.send('execute-action', action),
  onDeviceMotion: (callback) => {
    window.addEventListener('devicemotion', callback);
  }
});
