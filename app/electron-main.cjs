const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const os = require('os');
const fs = require('fs');

const runtimeState = {
  logs: [
    '[info] Electron shell ready',
    '[info] Real environment bridge ready',
    '[info] Draft persistence enabled',
  ],
  plan: [
    { id: 'prepare', title: '准备环境', status: 'done' },
    { id: 'detect', title: '检测环境', status: 'running' },
    { id: 'config', title: '生成配置', status: 'pending' },
    { id: 'start', title: '启动服务', status: 'pending' },
  ],
};

function defaultInstallPath() {
  return path.join(os.homedir(), 'openclaw');
}

function exists(commandPath) {
  try {
    return fs.existsSync(commandPath);
  } catch {
    return false;
  }
}

function getEnvironment() {
  const homeDir = os.homedir();
  const installPath = defaultInstallPath();
  return {
    osType: process.platform,
    osVersion: os.release(),
    arch: os.arch(),
    homeDir,
    defaultInstallPath: installPath,
    defaultDataPath: path.join(installPath, 'data'),
    memoryGb: Math.round(os.totalmem() / 1024 / 1024 / 1024),
    cpuCount: os.cpus().length,
    hasNode: Boolean(process.versions.node),
    hasGit: exists('/usr/bin/git') || exists('/bin/git'),
    hasDisplay: Boolean(process.env.DISPLAY || process.env.WAYLAND_DISPLAY),
    hasDocker: exists('/usr/bin/docker') || exists('/bin/docker'),
    cwdWritable: (() => {
      try {
        fs.accessSync(process.cwd(), fs.constants.W_OK);
        return true;
      } catch {
        return false;
      }
    })(),
    homeWritable: (() => {
      try {
        fs.accessSync(homeDir, fs.constants.W_OK);
        return true;
      } catch {
        return false;
      }
    })(),
    isRoot: typeof process.getuid === 'function' ? process.getuid() === 0 : false,
  };
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

ipcMain.handle('system:getEnvironment', async () => getEnvironment());
ipcMain.handle('system:getDashboard', async () => ({
  serviceStatus: 'stopped',
  gatewayStatus: 'ready',
  channelCount: 0,
  installedSkillCount: 0,
  lastStartTime: null,
  recentEvents: runtimeState.logs.slice(-5),
}));
ipcMain.handle('installer:getLogs', async () => runtimeState.logs);
ipcMain.handle('installer:getPlan', async () => runtimeState.plan);
ipcMain.handle('installer:runOrchestratorDemo', async () => {
  runtimeState.logs.push('[info] Install orchestrator demo started');
  runtimeState.plan = [
    { id: 'prepare', title: '准备环境', status: 'done' },
    { id: 'detect', title: '检测环境', status: 'done' },
    { id: 'config', title: '生成配置', status: 'running' },
    { id: 'start', title: '启动服务', status: 'pending' },
  ];
  return { ok: true, plan: runtimeState.plan, logs: runtimeState.logs };
});
ipcMain.handle('installer:exportDiagnosis', async (_event, reportText) => {
  const outDir = path.join(process.cwd(), 'artifacts');
  fs.mkdirSync(outDir, { recursive: true });
  const filePath = path.join(outDir, `diagnosis-${Date.now()}.txt`);
  fs.writeFileSync(filePath, reportText || '', 'utf8');
  runtimeState.logs.push(`[info] Diagnosis exported: ${filePath}`);
  return { ok: true, filePath };
});

app.whenReady().then(() => {
  const env = getEnvironment();
  if (env.hasDisplay) {
    createWindow();
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  } else {
    runtimeState.logs.push('[warn] No DISPLAY detected, Electron window skipped; use dev:web as fallback');
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
