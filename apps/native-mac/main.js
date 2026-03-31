const { app, BrowserWindow, Tray, Menu, ipcMain, nativeImage, systemPreferences } = require('electron');
const path = require('path');
const { exec } = require('child_process');

let tray = null;
let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 550,
    show: true, // Show by default for development
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
  
  // A simple black circle for the tray icon instead of transparent
  const icon = nativeImage.createFromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAW0lEQVR42mNkYGD4z0AAMDAwMLRiIDH8Z2RkZCRWnAGI8Rkh7D8IBy7GwABh/CKE/YfhwMUYGCBMXpSAp7AgfRGi/IML0pchyj+4IP/ggvRTpP6DC9JPkfofLkg/AMX9KBNvB004AAAAAElFTkSuQmCC');
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

// Handle Permission Requests
ipcMain.handle('request-permissions', async () => {
  console.log('Main process: request-permissions triggered');
  let isTrusted = false;
  try {
    // Prompts macOS to request Accessibility privileges for the Electron app
    isTrusted = systemPreferences.isTrustedAccessibilityClient(true);
    console.log('Main process: isTrustedAccessibilityClient result:', isTrusted);
    
    if (!isTrusted) {
      console.log('Main process: Not trusted, opening System Settings as fallback');
      exec('open "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility"');
    }
  } catch (err) {
    console.error('Failed to request accessibility', err);
  }
  return isTrusted;
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
