"use strict";
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('darkMode', {
    toggle: () => ipcRenderer.invoke('dark-mode:toggle'),
    system: () => ipcRenderer.invoke('dark-mode:system')
});
//OPEN FILE DIALOG
contextBridge.exposeInMainWorld('electronAPI', {
    openFile: () => ipcRenderer.invoke('open-file'),
    saveFile: (dataURL, filePath, saveas) => ipcRenderer.invoke('save-file', dataURL, filePath, saveas),
    //openFile func used in renderer
    //open-file used in main
});
//END OPEN DIALOG
