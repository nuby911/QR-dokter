const { app, BrowserWindow } = require('electron');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');

let mainWindow = null;
let serverProcess = null;

const TARGET_PORT = 3000;
const DOCTOR_URL = `http://localhost:${TARGET_PORT}/doctor`;

// Function to check if the local server is already running
function checkServerReady(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/`, (res) => {
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
async function waitForServer(port, maxRetries = 20) {
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
    title: 'MediQR — Terminal Peresepan Dokter (Mode Offline)',
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
    mainWindow.setTitle('MediQR — Terminal Peresepan Dokter (Mode Offline)');
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  const isAlreadyRunning = await checkServerReady(TARGET_PORT);

  if (!isAlreadyRunning) {
    console.log('[Electron] Memulai mesin background MediQR...');
    serverProcess = spawn('npx', ['next', 'start', '-p', String(TARGET_PORT)], {
      cwd: path.join(__dirname, '..'),
      shell: true,
      stdio: 'ignore',
    });

    const ready = await waitForServer(TARGET_PORT);
    if (!ready) {
      console.warn('[Electron] Server lambat memulai, mencoba membuka browser window...');
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
