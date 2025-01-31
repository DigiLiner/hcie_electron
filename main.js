"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const main_menu_1 = __importDefault(require("./main_menu"));
const electron_1 = __importDefault(require("electron"));
const url_1 = __importDefault(require("url"));
const node_path_1 = __importDefault(require("node:path"));
const { app, BrowserWindow, Menu, ipcMain, nativeTheme, dialog } = electron_1.default;
const fs_1 = __importDefault(require("fs"));
// @ts-ignore
let mainWindow;
app.commandLine.appendSwitch('high-dpi-support', '1');
app.commandLine.appendSwitch('force-device-scale-factor', '1');
//import mainMenuTemplate from './main_menu';
app.on('ready', function () {
    // @ts-ignore
    mainWindow = new BrowserWindow({
        minWidth: 1000,
        minHeight: 800,
        width: 1200,
        height: 900,
        // x: 0,
        // y: 150,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: node_path_1.default.join(__dirname, 'preload.js'), //disable dpi scaling
        },
    });
    mainWindow.loadURL(url_1.default.format({
        pathname: node_path_1.default.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));
});
// @ts-ignore
const mainMenu = Menu.buildFromTemplate(main_menu_1.default);
Menu.setApplicationMenu(mainMenu);
//region theme
/*
ipcMain.handle('dark-mode:toggle', () => {
    if (nativeTheme.shouldUseDarkColors) {
        nativeTheme.themeSource = 'light'
    } else {
        nativeTheme.themeSource = 'dark'
    }
    return nativeTheme.shouldUseDarkColors
})

ipcMain.handle('dark-mode:system', () => {
    nativeTheme.themeSource = 'system'
})*/
//endregion
app.whenReady().then(() => {
    //region open file dialog
    ipcMain.handle('open-file', async () => {
        const { canceled, filePaths } = await dialog.showOpenDialog({
            properties: ['openFile'] //defined in preload
        });
        if (!canceled) {
            node_path_1.default.join(filePaths[0]);
            return filePaths[0];
        }
        else {
            return "Dosya seçilmedi!"; //send to renderer
        }
    });
    //endregion
    //region save file dialog
    ipcMain.handle('save-file', async (event, dataURL, imagePath, saveas = false) => {
        try {
            if (!imagePath || saveas) {
                const { canceled, filePath } = await dialog.showSaveDialog({});
                if (canceled) {
                    console.log('Save dialog was canceled.');
                    return;
                }
                imagePath = filePath;
            }
            node_path_1.default.join(imagePath);
            console.log(dataURL);
            const base64Data = dataURL.replace(/^data:image\/png;base64,/, '');
            const fullPath = node_path_1.default.join(imagePath);
            fs_1.default.writeFile(fullPath, base64Data, 'base64', (err) => {
                if (err) {
                    console.error('Error saving image:', err);
                }
                else {
                    console.log('Image saved successfully:', fullPath);
                }
            });
        }
        catch (error) {
            console.error('An error occurred:', error);
        }
    });
    //endregion
    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });
});
