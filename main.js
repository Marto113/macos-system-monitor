const { app, BrowserWindow } = require('electron');

const createWindow = () => {
    const window = new BrowserWindow({
        width: 350,
        height: 350
    })

    window.loadFile('index.html');
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})