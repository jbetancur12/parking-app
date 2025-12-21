import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import { fork, ChildProcess } from 'child_process'

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
    win = new BrowserWindow({
        icon: path.join(process.env.VITE_PUBLIC || '', 'electron-vite.svg'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
    })

    // Test active push message to Renderer-process.
    win.webContents.on('did-finish-load', () => {
        win?.webContents.send('main-process-message', (new Date).toLocaleString())
    })

    if (VITE_DEV_SERVER_URL) {
        win.loadURL(VITE_DEV_SERVER_URL)
    } else {
        // win.loadFile('dist/index.html')
        win.loadFile(path.join(process.env.DIST || '', 'index.html'))
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

    startServer()
    createWindow()
})
