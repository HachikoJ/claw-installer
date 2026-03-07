const { app, BrowserWindow, ipcMain } = require(electron);
const path = require(path);
const os = require(os);
const fs = require(fs);

function defaultInstallPath() {
  return path.join(os.homedir(), openclaw);
}

function getEnvironment() {
  return {
    osType: process.platform,
    osVersion: os.release(),
    arch: os.arch(),
    homeDir: os.homedir(),
    defaultInstallPath: defaultInstallPath(),
    defaultDataPath: path.join(defaultInstallPath(), data),
    memoryGb: Math.round(os.totalmem() / 1024 / 1024 / 1024),
    hasNode: Boolean(process.versions.node),
    cwdWritable: (() => {
      try {
        fs.accessSync(process.cwd(), fs.constants.W_OK);
        return true;
      } catch {
        return false;
      }
    })(),
  };
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1480,
    height: 980,
    minWidth: 1200,
    minHeight: 760,
    backgroundColor: #07111f,
    webPreferences: {
      preload: path.join(__dirname, preload.cjs),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const devUrl = process.env.VITE_DEV_SERVER_URL;
  if (devUrl) {
    win.loadURL(devUrl);
  } else {
    win.loadFile(path.join(__dirname, dist, index.html));
  }
}

ipcMain.handle(system:getEnvironment, async () => getEnvironment());
ipcMain.handle(system:getDashboard, async () => ({
  serviceStatus: stopped,
  gatewayStatus: ready,
  channelCount: 0,
  installedSkillCount: 0,
  lastStartTime: null,
  recentEvents: [
    Installer
