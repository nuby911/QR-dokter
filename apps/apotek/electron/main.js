const { app, BrowserWindow } = require('electron');
const path = require('path');
const http = require('http');
const fs = require('fs');
const { spawn } = require('child_process');

// Isolate userData to prevent cache collision with other Electron apps (e.g. Dokter)
app.setName('MediQR-Apotek');
const userDataPath = path.join(app.getPath('appData'), 'mediqr-apotek');
app.setPath('userData', userDataPath);

let mainWindow = null;
let serverProcess = null;

const TARGET_PORT = 3003;
const PHARMACY_URL = `http://127.0.0.1:${TARGET_PORT}/`;

// Function to check if the local server is already running
function checkServerReady(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${port}/`, (res) => {
      resolve(true);
    });
    req.on('error', () => {
      resolve(false);
    });
    req.setTimeout(800, () => {
      req.destroy();
      resolve(false);
    });
  });
}

// Wait for the local server to be ready with retries
async function waitForServer(port, maxRetries = 30) {
  for (let i = 0; i < maxRetries; i++) {
    const isReady = await checkServerReady(port);
    if (isReady) return true;
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

function createPharmacyWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 880,
    minWidth: 1024,
    minHeight: 720,
    title: 'MediQR Apotek — Terminal Kasir & Inventaris Farmasi',
    icon: path.join(__dirname, '../public/icons/icon-512.png'),
    autoHideMenuBar: true,
    backgroundColor: '#faf7f2',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  mainWindow.loadURL(PHARMACY_URL).catch(() => {});

  mainWindow.webContents.on('did-fail-load', () => {
    setTimeout(() => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.loadURL(PHARMACY_URL).catch(() => {});
      }
    }, 1000);
  });

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.setTitle('MediQR Apotek — Terminal Kasir & Inventaris Farmasi');
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  const isAlreadyRunning = await checkServerReady(TARGET_PORT);

  if (!isAlreadyRunning) {
    console.log('[Electron Apotek] Memulai server background MediQR Apotek pada port 3003...');
    const appDir = path.join(__dirname, '..');
    const hasBuild = fs.existsSync(path.join(appDir, '.next'));
    const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    const npmArg = hasBuild ? 'start' : 'run dev';

    serverProcess = spawn(npmCmd, ['run', hasBuild ? 'start' : 'dev'], {
      cwd: appDir,
      shell: true,
      stdio: 'ignore',
    });

    const ready = await waitForServer(TARGET_PORT);
    if (!ready) {
      console.warn('[Electron Apotek] Server masih memulai, membuka jendela aplikasi...');
    }
  }

  createPharmacyWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createPharmacyWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (serverProcess) {
    try {
      serverProcess.kill();
    } catch {
      // ignore
    }
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
