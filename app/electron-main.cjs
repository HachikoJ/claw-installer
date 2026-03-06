const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const os = require('os');

function defaultInstallPath() {
  return path.join(os.homedir(), 'openclaw');
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1480,
    height: 980,
    minWidth: 1200,
    minHeight: 760,
    backgroundColor: '#07111f',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const devUrl = process.env.VITE_DEV_SERVER_URL;
  if (devUrl) {
    win.loadURL(devUrl);
  } else {
    win.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }
}

ipcMain.handle('system:getEnvironment', async () => ({
  osType: process.platform,
  osVersion: os.release(),
  arch: os.arch(),
  homeDir: os.homedir(),
  defaultInstallPath: defaultInstallPath(),
  defaultDataPath: path.join(defaultInstallPath(), 'data'),
  memoryGb: Math.round(os.totalmem() / 1024 / 1024 / 1024),
}));

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
