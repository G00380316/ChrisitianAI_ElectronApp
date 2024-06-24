const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { handleQuestion } = require('./aiHandler');
const { deleteHistory, createChatroom  } = require('./userHandler'); 

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: false
        }
    });

    mainWindow.loadFile('index.html');
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

ipcMain.handle('ask-question', async (event, input) => {
    const response = await handleQuestion(input);
    return response;
});

ipcMain.handle('forget-chat', async (event) => {
    const response = await deleteHistory();
    return response;
});

ipcMain.handle('create-chat', async (event, input) => {
    const response = await createChatroom(input);
    return response;
})
