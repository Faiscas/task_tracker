const { app, BrowserWindow } = require("electron");
const path = require("path");

const isDevelopment = !app.isPackaged;

function createWindow() {
    const window = new BrowserWindow({
        width: 1280,
        height: 820,
        minWidth: 960,
        minHeight: 640,
        autoHideMenuBar: true,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    if (isDevelopment) {
        window.loadURL("http://127.0.0.1:5173");
    } else {
        window.loadFile(path.join(__dirname, "dist", "index.html"));
    }
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});