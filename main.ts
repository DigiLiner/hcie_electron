import mainMenuTemplate from "./main_menu";

const {createCanvas, loadImage} = require("canvas");

import electron from 'electron';
import url from 'url';
import path from 'node:path';

import fsp from 'node:fs/promises';


const {app, BrowserWindow, Menu, ipcMain, nativeTheme, dialog} = electron;
import fs from 'fs';
import {Canvas, CanvasRenderingContext2D} from "canvas";
// @ts-ignore
let mainWindow: BrowserWindow;
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
            preload: path.join(__dirname, 'preload.js'),


        }
    });
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));
})


// @ts-ignore
const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
Menu.setApplicationMenu(mainMenu);

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
})
app.whenReady().then(() => {
//OPEN DIALOG
    ipcMain.handle('open-file', async () => {
        const {canceled, filePaths} = await dialog.showOpenDialog({
            properties: ['openFile']//defined in preload
        });
        if (!canceled) {
            path.join(filePaths[0]);
            return filePaths[0];
        } else {
            return "Dosya seçilmedi!";//send to renderer
        }
    })
//END OPEN DIALOG
    //SAVE DIALOG

    ipcMain.handle('save-file', async (event, dataURL: string) => {
        const {canceled, filePath} = await dialog.showSaveDialog({});
        if (!canceled) {
            path.join(filePath);
            console.log(dataURL);
            const base64Data = dataURL.replace(/^data:image\/png;base64,/, '');

            // Dosyayı kaydedin
            fs.writeFile(filePath, base64Data, 'base64', (err) => {
                if (err) {
                    console.error('Resim kaydedilirken hata oluştu:', err);
                } else {
                    console.log('Resim başarıyla kaydedildi:', filePath);
                }
            });

        } else {
            return "Dosya seçilmedi!";//send to renderer
        }


// END SAVE DIALOG
    })
    ;
    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit()
        }
    })
})

