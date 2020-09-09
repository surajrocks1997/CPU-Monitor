const { app, BrowserWindow, Menu, ipcMain, Tray } = require('electron');
const log = require('electron-log');
const Store = require('./Store');
const path = require('path');

// Set env
process.env.NODE_ENV = 'production';

const isDev = process.env.NODE_ENV !== 'production' ? true : false;
const isMac = process.platform === 'darwin' ? true : false;

let mainWindow;
let tray;

//  Init Store and defaults
const store = new Store({
  configName: 'user-settings',
  defaults: {
    settings: {
      cpuOverload: 80,
      alertFrequency: 5,
    },
  },
});

const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    title: 'CPU Monitor',
    width: isDev ? 800 : 355,
    height: 500,
    show: false,
    opacity: 0.95,
    icon: './assets/icons/icon.png',
    resizable: isDev ? true : false,
    webPreferences: {
      nodeIntegration: true,
      worldSafeExecuteJavaScript: true,
    },
  });

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.loadFile('./app/index.html');
};

app.on('ready', () => {
  createMainWindow();

  mainWindow.webContents.on('dom-ready', () => {
    mainWindow.webContents.send('settings:get', store.get('settings'));
  });

  const mainMenu = Menu.buildFromTemplate(menu);

  mainWindow.on('close', (e) => {
    if(!app.isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }

    return true;
  })

  const icon = path.join(__dirname, 'assets', 'icons', 'tray_icon.png');
  tray = new Tray(icon);

  tray.on('click', () => {
    if (mainWindow.isVisible() === true) {
      mainWindow.hide();
    } else {
      mainWindow.show();
    }
  });

  tray.on('right-click', () => {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Quit',
        click: () => {
          app.isQuitting = true;
          app.quit();
        },
      },
    ]);
    tray.popUpContextMenu(contextMenu);
  });

  Menu.setApplicationMenu(mainMenu);
});

const menu = [
  ...(isMac ? [{ role: 'appMenu' }] : []),
  {
    role: 'fileMenu',
  },
  ...(isDev
    ? [
        {
          label: 'Developer',
          submenu: [
            { role: 'reload' },
            { role: 'forcereload' },
            { type: 'separator' },
            { role: 'toggledevtools' },
          ],
        },
      ]
    : []),
];

// set settings
ipcMain.on('settings:set', (e, value) => {
  store.set('settings', value);
  mainWindow.webContents.send('settings:get', store.get('settings'));
});

app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

app.allowRendererProcessReuse = true;
