const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('clawInstaller', {
  getEnvironment: () => ipcRenderer.invoke('system:getEnvironment'),
  getDashboard: () => ipcRenderer.invoke('system:getDashboard'),
  getLogs: () => ipcRenderer.invoke('installer:getLogs'),
  getPlan: () => ipcRenderer.invoke('installer:getPlan'),
  runOrchestratorDemo: () => ipcRenderer.invoke('installer:runOrchestratorDemo'),
});
