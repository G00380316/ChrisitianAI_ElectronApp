const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    askQuestion: (input) => ipcRenderer.invoke('ask-question', input)
});

