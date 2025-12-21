import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { fork } from "child_process";
const __filename$1 = fileURLToPath(import.meta.url);
const __dirname$1 = path.dirname(__filename$1);
process.env.DIST = path.join(__dirname$1, "../dist");
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, "../public");
let win;
let serverProcess = null;
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
function startServer() {
  const isDev = !app.isPackaged;
  const serverPath = isDev ? path.join(__dirname$1, "../../server/dist/index.js") : path.join(process.resourcesPath, "server/dist/index.js");
  console.log("Starting server from:", serverPath);
  serverProcess = fork(serverPath, [], {
    env: {
      ...process.env,
      // Force SQLite for desktop app
      DB_TYPE: "sqlite",
      PORT: "3001",
      // Clear any PostgreSQL variables that might exist
      DB_NAME: void 0,
      DB_USER: void 0,
      DB_PASSWORD: void 0,
      DB_HOST: void 0,
      DB_PORT: void 0
    }
  });
  serverProcess.on("message", (msg) => {
    console.log("Server message:", msg);
  });
  serverProcess.on("error", (err) => {
    console.error("Server failed to start:", err);
  });
}
function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC || "", "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname$1, "preload.js")
    }
  });
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(process.env.DIST || "", "index.html"));
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("will-quit", () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(() => {
  ipcMain.handle("print-window", async (_, content) => {
    const workerWindow = new BrowserWindow({
      show: false,
      width: 800,
      // Size matters for preview generation
      height: 600,
      opacity: 0,
      // Make it invisible but present implies show: true (done later)
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    });
    console.log("Main: Received print request. Content length:", content.length);
    try {
      await workerWindow.loadURL("data:text/html;charset=utf-8," + encodeURIComponent(content));
      console.log("Main: Worker window loaded content");
    } catch (e) {
      console.error("Main: Failed to load content into worker window", e);
      workerWindow.close();
      throw e;
    }
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        workerWindow.show();
        workerWindow.webContents.print({
          silent: false,
          printBackground: true,
          deviceName: ""
        }, (success, errorType) => {
          if (!success) {
            console.error("Main: Print failed:", errorType);
            reject(errorType);
          } else {
            console.log("Main: Print initiated successfully");
            resolve(true);
          }
          setTimeout(() => {
            console.log("Main: Closing worker window");
            workerWindow.close();
          }, 500);
        });
      }, 500);
    });
  });
  startServer();
  createWindow();
});
