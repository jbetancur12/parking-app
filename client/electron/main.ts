import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron'
import { autoUpdater } from 'electron-updater'
import path from 'path'
import { fileURLToPath } from 'url'
import { fork, ChildProcess } from 'child_process'
import { getHardwareId } from './hardware-id'
import { validateLicense, saveLicenseLocally, getLicenseKey, getLicenseDetails } from './license-validator'

// Auto-Updater Logging
autoUpdater.logger = console;
// logger.transports is not available on console object
// autoUpdater.logger.transports.file.level = 'info';

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')

let win: BrowserWindow | null
let serverProcess: ChildProcess | null = null

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function startServer() {
    const isDev = !app.isPackaged
    // In dev, server is at ../../server/dist/index.js (compiled) or ../../server/src/index.ts (ts-node)
    // For simplicity, we assume server is built to dist/index.js
    const serverPath = isDev
        ? path.join(__dirname, '../../server/dist/index.js')
        : path.join(process.resourcesPath, 'server/dist/index.js')

    console.log('Starting server from:', serverPath)

    serverProcess = fork(serverPath, [], {
        env: {
            ...process.env,
            // Force SQLite for desktop app
            DB_TYPE: 'sqlite',
            PORT: '3001',
            // Clear any PostgreSQL variables that might exist
            DB_NAME: undefined,
            DB_USER: undefined,
            DB_PASSWORD: undefined,
            DB_HOST: undefined,
            DB_PORT: undefined
        }
    })

    serverProcess.on('message', (msg) => {
        console.log('Server message:', msg)
    })

    serverProcess.on('error', (err) => {
        console.error('Server failed to start:', err)
    })
}

function createWindow() {
    const preloadPath = path.join(__dirname, 'preload.js');
    console.log('Preload path:', preloadPath);
    console.log('__dirname:', __dirname);

    win = new BrowserWindow({
        icon: path.join(process.env.VITE_PUBLIC || '', 'electron-vite.svg'),
        width: 1200,
        height: 800,
        webPreferences: {
            preload: preloadPath,
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false,
            // Enable web security but allow local resources
            webSecurity: true,
        },
    })

    // Test active push message to Renderer-process.
    win.webContents.on('did-finish-load', () => {
        win?.webContents.send('main-process-message', (new Date).toLocaleString())
    })

    if (VITE_DEV_SERVER_URL) {
        win.loadURL(VITE_DEV_SERVER_URL)
        // Open DevTools in development
        win.webContents.openDevTools()
    } else {
        win.loadFile(path.join(process.env.DIST || '', 'index.html'))
    }

    // Check for updates if packaged (Production)
    if (app.isPackaged) {
        autoUpdater.checkForUpdatesAndNotify();
    }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
        win = null
    }
})

app.on('will-quit', () => {
    if (serverProcess) {
        serverProcess.kill()
    }
})

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

/**
 * Check license and start app accordingly
 */
async function checkLicenseAndStart() {
    const validation = await validateLicense();

    // Start server first
    startServer();

    if (!validation.isValid) {
        // No valid license - will show license activation page
        console.log('No valid license found:', validation.error);
        createWindow();
        return;
    }

    // License is valid - check if expiring soon
    if (validation.daysRemaining && validation.daysRemaining <= 30) {
        const licenseKey = getLicenseKey();
        dialog.showMessageBox({
            type: 'warning',
            title: 'Licencia por vencer',
            message: `Tu licencia vence en ${validation.daysRemaining} días`,
            detail: licenseKey ? `Clave: ${licenseKey}` : '',
            buttons: ['Renovar', 'Recordar después'],
            defaultId: 0
        }).then(result => {
            if (result.response === 0) {
                // Open renewal page
                shell.openExternal(`https://tuapp.com/renovar?key=${licenseKey || ''}`);
            }
        });
    }

    createWindow();
}

app.whenReady().then(() => {
    // Handle print requests from renderer with worker window
    ipcMain.handle('print-window', async (_, content, options) => {
        const workerWindow = new BrowserWindow({
            show: false,
            width: 800, // Size matters for preview generation
            height: 600,
            opacity: 0, // Make it invisible but present implies show: true (done later)
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true
            }
        });

        console.log('Main: Received print request. Content length:', content.length, 'Options:', options);

        try {
            await workerWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(content));
            console.log('Main: Worker window loaded content');
        } catch (e) {
            console.error('Main: Failed to load content into worker window', e);
            workerWindow.close();
            throw e;
        }

        return new Promise((resolve, reject) => {
            // Esperar un momento para asegurar renderizado
            setTimeout(() => {
                // IMPORTANT: Show the window (with opacity 0) to enable Windows to generate print preview
                // This "tricks" the OS into thinking it's a normal visible window print
                workerWindow.show();

                workerWindow.webContents.print({
                    silent: options?.silent || false,
                    printBackground: true,
                    deviceName: options?.deviceName || ''
                }, (success, errorType) => {
                    if (!success) {
                        console.error('Main: Print failed:', errorType);
                        reject(errorType);
                    } else {
                        console.log('Main: Print initiated successfully');
                        resolve(true);
                    }
                    // Cerrar después de un delay
                    setTimeout(() => {
                        console.log('Main: Closing worker window');
                        workerWindow.close();
                    }, 500);
                });
            }, 500);
        });
    });

    // License IPC Handlers
    ipcMain.handle('get-hardware-id', () => {
        return getHardwareId();
    });

    ipcMain.handle('activate-license', async (_, signedLicense: string) => {
        try {
            saveLicenseLocally(signedLicense);
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('validate-license', async () => {
        try {
            const result = await validateLicense();
            return result;
        } catch (error: any) {
            return { isValid: false, error: error.message };
        }
    });

    ipcMain.handle('start-trial', async () => {
        try {
            const hardwareId = getHardwareId();
            const LICENSE_SERVER_URL = process.env.LICENSE_SERVER_URL || 'http://localhost:3002';

            const response = await fetch(`${LICENSE_SERVER_URL}/trial`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hardwareId })
            });

            const data = await response.json() as { signedLicense: string; error?: string };

            if (!response.ok) {
                throw new Error(data.error || 'Failed to start trial');
            }

            saveLicenseLocally(data.signedLicense);
            return { success: true };
        } catch (error: any) {
            throw new Error(error.message || 'Trial activation failed');
        }
    });

    ipcMain.handle('get-license-details', () => {
        return getLicenseDetails();
    });

    // Auto-Updater IPC Handlers
    ipcMain.handle('check-for-update', () => {
        return autoUpdater.checkForUpdatesAndNotify();
    });

    ipcMain.handle('quit-and-install', () => {
        autoUpdater.quitAndInstall();
    });

    // Auto-Updater Events (forward to renderer)
    autoUpdater.on('update-available', () => {
        if (win) win.webContents.send('update-available');
    });

    autoUpdater.on('update-downloaded', () => {
        if (win) win.webContents.send('update-downloaded');
    });

    // Check license before starting app
    checkLicenseAndStart();
})
