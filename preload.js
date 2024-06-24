const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    askQuestion: (input) => ipcRenderer.invoke('ask-question', input),
    forgetChat: () => ipcRenderer.invoke('forget-chat'),
    createChatroom: (input) => ipcRenderer.invoke('create-chat', input)
});

