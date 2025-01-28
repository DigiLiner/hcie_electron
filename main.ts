import mainMenuTemplate from "./main_menu";
import electron from 'electron';
import url from 'url';
import path from 'node:path';

const {app, BrowserWindow, Menu, ipcMain, nativeTheme, dialog} = electron;
import fs from 'fs';
// @ts-ignore
let mainWindow: BrowserWindow;
app.commandLine.appendSwitch('high-dpi-support', '1');
app.commandLine.appendSwitch('force-device-scale-factor', '1');
//import mainMenuTemplate from './main_menu';
app.on('ready', function () {

    // @ts-ignore
    mainWindow = new BrowserWindow({
        minWidth:1000,
        minHeight:800,
        width: 1200,
        height: 900,
       // x: 0,
       // y: 150,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),          //disable dpi scaling

        },

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
//endregion
//region save file dialog

    ipcMain.handle('save-file', async (event, dataURL: string,imagePath:string,saveas:boolean=false) => {
        if (!imagePath || saveas) {
        const {canceled, filePath} = await dialog.showSaveDialog({});
        if (!canceled) {}
            imagePath = filePath;}

            path.join(imagePath);
            console.log(dataURL);
            const base64Data = dataURL.replace(/^data:image\/png;base64,/, '');

            // Dosyayı kaydedin
            fs.writeFile(imagePath, base64Data, 'base64', (err) => {
                if (err) {
                    console.error('Resim kaydedilirken hata oluştu:', err);
                } else {
                    console.log('Resim başarıyla kaydedildi:', imagePath);
                }
            });

    })
    //endregion
    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit()
        }
    })
})

