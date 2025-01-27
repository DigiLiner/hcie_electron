"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const main_menu_1 = __importDefault(require("./main_menu"));
const { createCanvas, loadImage } = require("canvas");
const electron_1 = __importDefault(require("electron"));
const url_1 = __importDefault(require("url"));
const node_path_1 = __importDefault(require("node:path"));
const { app, BrowserWindow, Menu, ipcMain, nativeTheme, dialog } = electron_1.default;
const fs_1 = __importDefault(require("fs"));
// @ts-ignore
let mainWindow;
//import mainMenuTemplate from './main_menu';
app.on('ready', function () {
    mainWindow = new BrowserWindow({
        width: 500,
        height: 500,
        x: 0,
        y: 150,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: node_path_1.default.join(__dirname, 'preload.js'),
        }
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
ipcMain.handle('dark-mode:toggle', () => {
    if (nativeTheme.shouldUseDarkColors) {
        nativeTheme.themeSource = 'light';
    }
    else {
        nativeTheme.themeSource = 'dark';
    }
    return nativeTheme.shouldUseDarkColors;
});
ipcMain.handle('dark-mode:system', () => {
    nativeTheme.themeSource = 'system';
});
app.whenReady().then(() => {
    //OPEN DIALOG
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
    //END OPEN DIALOG
    //SAVE DIALOG
    ipcMain.handle('save-file', async (event, dataURL) => {
        const { canceled, filePath } = await dialog.showSaveDialog({});
        if (!canceled) {
            node_path_1.default.join(filePath);
            console.log(dataURL);
            const base64Data = dataURL.replace(/^data:image\/png;base64,/, '');
            // Dosyayı kaydedin
            fs_1.default.writeFile(filePath, base64Data, 'base64', (err) => {
                if (err) {
                    console.error('Resim kaydedilirken hata oluştu:', err);
                }
                else {
                    console.log('Resim başarıyla kaydedildi:', filePath);
                }
            });
        }
        else {
            return "Dosya seçilmedi!"; //send to renderer
        }
        // END SAVE DIALOG
    });
    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });
});
