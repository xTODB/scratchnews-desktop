const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

// The live site this app wraps. Update this one line if/when the domain
// migration to scratchnews.net happens.
const SITE_URL = 'https://scratchnews.freedev.app/';
const SITE_HOST = new URL(SITE_URL).hostname;

// Google's Identity Services library detects and refuses to run under a user agent
// that contains "Electron" (fails with a disallowed_useragent error), so every window
// that can load Google sign-in needs a normal-looking desktop Chrome UA instead of
// Electron's default one. Built from the app's actual bundled Chromium version so it
// stays accurate across Electron upgrades.
const DESKTOP_CHROME_UA = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${process.versions.chrome} Safari/537.36`;

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 720,
    minHeight: 480,
    title: 'ScratchNews',
    backgroundColor: '#1a1a1a',
    icon: path.join(__dirname, 'build', 'icon.png'),
    autoHideMenuBar: true, // keeps it feeling app-like; press Alt to reveal the menu if ever needed
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      userAgent: DESKTOP_CHROME_UA,
    },
  });

  mainWindow.loadURL(SITE_URL);

  // Links that open a new window/tab (target="_blank", window.open, etc.) —
  // e.g. Discord invite, Ko-fi, Scratch profiles, GitHub — should open in the
  // person's normal browser, not spawn a second app window. Google's own sign-in
  // popup (accounts.google.com) is the one exception: it needs to stay an in-app
  // window so it can postMessage the result back to the page that opened it, which
  // doesn't work if it's handed off to an external browser.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    const host = new URL(url).hostname;
    if (host === 'accounts.google.com') {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          width: 480,
          height: 640,
          autoHideMenuBar: true,
          webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true,
            userAgent: DESKTOP_CHROME_UA,
          },
        },
      };
    }
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Links clicked in the same window that navigate off-domain (no target=_blank)
  // get the same treatment, so the app window always stays on ScratchNews itself.
  mainWindow.webContents.on('will-navigate', (event, url) => {
    const targetHost = new URL(url).hostname;
    if (targetHost !== SITE_HOST) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});