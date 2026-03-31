const { app, BrowserWindow, Tray, Menu, ipcMain, nativeImage, systemPreferences } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const { exec } = require('child_process');

let tray = null;
let mainWindow = null;
let knockHelper = null;

function startKnockHelper() {
  const helperPath = path.join(__dirname, 'motion-helper', 'knock-detector');
  
  knockHelper = spawn(helperPath, { stdio: ['pipe', 'pipe', 'pipe'] });

  knockHelper.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    for (const line of lines) {
      if (line.trim()) {
        try {
          const msg = JSON.parse(line);
          if (msg.type === 'knock' && mainWindow) {
            mainWindow.webContents.send('knock_event', { intensity: msg.intensity });
          }
        } catch (e) {
          // non-JSON output (logs), ignore
        }
      }
    }
  });

  knockHelper.stderr.on('data', (data) => {
    console.log('KnockHelper stderr:', data.toString());
  });

  knockHelper.on('error', (err) => {
    console.error('KnockHelper error:', err);
  });

  knockHelper.on('exit', (code) => {
    console.log('KnockHelper exited with code:', code);
  });
}

function sendToHelper(command) {
  if (knockHelper && knockHelper.stdin.writable) {
    knockHelper.stdin.write(JSON.stringify(command) + '\n');
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 550,
    show: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  startKnockHelper();
  createWindow();
  
  const icon = nativeImage.createFromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAW0lEQVR42mNkYGD4z0AAMDAwMLRgIDH8Z2RkZCRWnAGI8Rkh7D8IBy7GwABh/CKE/YfhwMUYGCBMXpSAp7AgfRGi/IML0pchyj+4IP/ggvRTpP6DC9JPkfofLkg/AMX9KBNvB004AAAAAElFTkSuQmCC');
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

ipcMain.handle('set-knock-threshold', async (event, value) => {
  sendToHelper({ type: 'set_threshold', value });
  return true;
});

ipcMain.handle('request-microphone-access', async () => {
  try {
    const status = systemPreferences.getMediaAccessStatus('microphone');
    if (status === 'not-determined') {
      const success = await systemPreferences.askForMediaAccess('microphone');
      return success ? 'granted' : 'denied';
    }
    return status;
  } catch (error) {
    console.error('Failed to request microphone access:', error);
    return 'denied';
  }
});

ipcMain.handle('get-microphone-status', () => {
  return systemPreferences.getMediaAccessStatus('microphone');
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

app.on('before-quit', () => {
  if (knockHelper) {
    sendToHelper({ type: 'stop' });
    knockHelper.kill();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
