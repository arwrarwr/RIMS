const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('omDB', {
  load: () => ipcRenderer.invoke('db:load'),
  save: (d) => ipcRenderer.invoke('db:save', d)
});
contextBridge.exposeInMainWorld('omCfg', { get: () => ipcRenderer.invoke('cfg:get'), set: (c) => ipcRenderer.invoke('cfg:set', c) });
