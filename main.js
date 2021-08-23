const { app, BrowserWindow, nativeTheme } = require('electron');
const fetch = require('electron-fetch').default

if (require('electron-squirrel-startup')) return app.quit();

const url = require('url');
const path = require('path');

// const shell = require("electron").shell;
var child = require('child_process').execFile;
var executablePath = 'C:\\Program Files\\classifai\\classifai.exe';

let mainWindow;

function createWindow() {
    // Dark theme
    nativeTheme.themeSource = 'dark'; //not work on title bar and alert

    // shell.openExternal('https://www.google.com/');
    child(executablePath, function (err, data) {
        if (err) {
            console.error(err);
            return;
        }

        console.log(data.toString());
    });

    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        minWidth: 1280,
        minHeight: 720,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
        icon: 'src/assets/classifai_light.ico'
    });

    mainWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, `/dist/classifai/index.html`),
            protocol: 'file:',
            slashes: true,
        }),
    );

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        fetch('http://localhost:9999/v2/close', {
            method: 'PUT'
    })
        .then((response) => {
          app.quit()
        })
        .catch((error) => {
          alert('Error')
        })
    };
});

app.on('activate', function () {
    if (mainWindow === null) createWindow();
});
