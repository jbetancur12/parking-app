// @ts-nocheck
const { contextBridge, ipcRenderer } = require('electron')

console.log('🔧 Preload script is loading...');

// Expose Electron APIs
contextBridge.exposeInMainWorld('electronAPI', {
    // Print API
    print: (content, options) => ipcRenderer.invoke('print-window', content, options),

    // License APIs
    getHardwareId: () => ipcRenderer.invoke('get-hardware-id'),
    activateLicense: (licenseKey) => ipcRenderer.invoke('activate-license', licenseKey),
    validateLicense: () => ipcRenderer.invoke('validate-license'),
    startTrial: () => ipcRenderer.invoke('start-trial'),
    getLicenseDetails: () => ipcRenderer.invoke('get-license-details'),

    // Auto-Updater
    checkForUpdate: () => ipcRenderer.invoke('check-for-update'),
    quitAndInstall: () => ipcRenderer.invoke('quit-and-install'),
    onUpdateAvailable: (callback: (event: any) => void) => {
        const subscription = (_event: any) => callback(_event);
        ipcRenderer.on('update-available', subscription);
        return () => ipcRenderer.off('update-available', subscription);
    },
    onUpdateDownloaded: (callback: (event: any) => void) => {
        const subscription = (_event: any) => callback(_event);
        ipcRenderer.on('update-downloaded', subscription);
        return () => ipcRenderer.off('update-downloaded', subscription);
    }
})

console.log('✅ electronAPI exposed to window');

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
    on(...args) {
        const [channel, listener] = args
        return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
    },
    off(...args) {
        const [channel, ...omit] = args
        return ipcRenderer.off(channel, ...omit)
    },
    send(...args) {
        const [channel, ...omit] = args
        return ipcRenderer.send(channel, ...omit)
    },
    invoke(...args) {
        const [channel, ...omit] = args
        return ipcRenderer.invoke(channel, ...omit)
    },

    // You can expose other APTs you need here.
    // ...
})
