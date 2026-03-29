const { app, BrowserWindow, Tray, Menu, ipcMain, nativeImage } = require('electron');
const path = require('path');
const { exec } = require('child_process');

let tray = null;
let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 500,
    show: false, // Hidden by default, tray app
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();
  
  app.dock.hide(); // Hide from dock
  
  const icon = nativeImage.createEmpty();
  tray = new Tray(icon);
  
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Knock Clone Status: Active', enabled: false },
    { type: 'separator' },
    { label: 'Preferences...', click: () => mainWindow.show() },
    { label: 'Quit', role: 'quit' }
  ]);
  
  tray.setToolTip('Knock Clone');
  tray.setContextMenu(contextMenu);
});

ipcMain.on('execute-action', (event, action) => {
  console.log('Executing action:', action);
  if (action.action_type === 'App Control') {
    exec(`open -a "${action.action_config.appName}"`, (err) => {
      if(err) console.error('Failed to open app', err);
    });
  } else if (action.action_type === 'System Command') {
    if (action.action_config.command === 'Mute') {
      exec(`osascript -e "set volume output muted true"`);
    } else if (action.action_config.command === 'Sleep') {
      exec(`pmset displaysleepnow`);
    }
  } else if (action.action_type === 'Media Playback') {
    exec(`osascript -e 'tell application "Spotify" to playpause'`);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
