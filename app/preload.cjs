const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('clawInstaller', {
  getEnvironment: () => ipcRenderer.invoke('system:getEnvironment'),
});
