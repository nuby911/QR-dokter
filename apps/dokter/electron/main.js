const { app, BrowserWindow } = require('electron');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');

// Isolate userData to prevent cache collision with other Electron apps (e.g. Apotek)
app.setName('MediQR-Dokter');
const userDataPath = path.join(app.getPath('appData'), 'mediqr-dokter');
app.setPath('userData', userDataPath);

let mainWindow = null;
let serverProcess = null;

const TARGET_PORT = 3001;
const DOCTOR_URL = `http://127.0.0.1:${TARGET_PORT}/`;

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
async function waitForServer(port, maxRetries = 25) {
  for (let i = 0; i < maxRetries; i++) {
    const isReady = await checkServerReady(port);
    if (isReady) return true;
    await new Promise((r) => setTimeout(r, 600));
  }
  return false;
}

function createDoctorWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 880,
    minWidth: 1024,
    minHeight: 720,
    title: 'MediQR Dokter — Terminal Peresepan Medis (Offline)',
    icon: path.join(__dirname, '../public/icons/icon-512.png'),
    autoHideMenuBar: true,
    backgroundColor: '#faf7f2',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  mainWindow.loadURL(DOCTOR_URL);

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.setTitle('MediQR Dokter — Terminal Peresepan Medis (Offline)');
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  const isAlreadyRunning = await checkServerReady(TARGET_PORT);

  if (!isAlreadyRunning) {
    console.log('[Electron Dokter] Memulai server background MediQR Dokter pada port 3001...');
    serverProcess = spawn('npx', ['next', 'dev', '-p', String(TARGET_PORT)], {
      cwd: path.join(__dirname, '..'),
      shell: true,
      stdio: 'ignore',
    });

    const ready = await waitForServer(TARGET_PORT);
    if (!ready) {
      console.warn('[Electron Dokter] Server masih memulai, membuka jendela aplikasi...');
    }
  }

  createDoctorWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createDoctorWindow();
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
