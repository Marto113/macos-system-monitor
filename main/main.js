const { app, BrowserWindow } = require('electron');
const path = require('path');


const createWindow = () => {
    const window = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 1000,
        minHeight: 600,

        show: false,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            sandbox: false
        }
    });

    window.once("ready-to-show", () => {
        window.maximize();
        window.show();
    });

    window.loadFile('index.html');
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})