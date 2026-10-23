const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path'), fs = require('fs');
const cfgFile = () => path.join(app.getPath('userData'), 'config.json');
const cfg = () => { try { return JSON.parse(fs.readFileSync(cfgFile(), 'utf8')); } catch { return {}; } };
const dbFile = () => path.join(app.getPath('userData'), 'om-store-data.json');

ipcMain.handle('db:load', () => { try { return JSON.parse(fs.readFileSync(dbFile(), 'utf8')); } catch { return null; } });
ipcMain.handle('db:save', (_e, data) => {
  if (data == null) { try { fs.unlinkSync(dbFile()); } catch {} return true; }
  const tmp = dbFile() + '.tmp';           // write-then-rename so a power cut never corrupts the diary
  fs.writeFileSync(tmp, JSON.stringify(data)); fs.renameSync(tmp, dbFile()); return true;
});

ipcMain.handle('cfg:get', () => cfg());
ipcMain.handle('cfg:set', (e, c) => { fs.writeFileSync(cfgFile(), JSON.stringify(c)); if (!c.serverUrl) BrowserWindow.fromWebContents(e.sender).loadFile(path.join(__dirname, 'src', 'connect.html')); return true; });
const http = require('http'), { fork } = require('child_process');
const PORT = process.env.PORT || 3000, LOCAL_URL = `http://localhost:${PORT}`;
let srv = null;
const alive = () => new Promise(r => { const q = http.get(LOCAL_URL + '/api/status', res => { res.resume(); r(res.statusCode === 200); }); q.on('error', () => r(false)); q.setTimeout(1500, () => { q.destroy(); r(false); }); });
// npm start and npm run server now share ONE database: if a server is already running we use it, otherwise we start it ourselves.
async function ensureServer() {
  if (await alive()) return true;
  const env = { ...process.env, ELECTRON_RUN_AS_NODE: '1', PORT: String(PORT) };
  if (app.isPackaged) env.OM_DATA = path.join(app.getPath('userData'), 'data'); // dev: project's ./data, same as npm run server
  srv = fork(path.join(__dirname, 'server', 'server.js'), [], { env, stdio: 'inherit' });
  for (let i = 0; i < 40; i++) { if (await alive()) return true; await new Promise(r => setTimeout(r, 250)); }
  return false;
}
app.on('quit', () => { if (srv) srv.kill(); });
async function createWindow() {
  const w = new BrowserWindow({
    width: 1440, height: 900, minWidth: 1100, minHeight: 700, backgroundColor: '#16131f', title: 'OM Store', icon: path.join(__dirname, 'build', 'icon.png'),
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  w.setMenuBarVisibility(false);
  const c = cfg(), remote = process.env.OM_SERVER || c.serverUrl, page = n => path.join(__dirname, 'src', n);
  if (remote) w.loadURL(remote).catch(() => w.loadFile(page('connect.html')));
  else if (await ensureServer()) w.loadURL(LOCAL_URL);
  else w.loadFile(page('index.html')); // server could not start: fall back to standalone mode
  w.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; }); // WhatsApp links
}
app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
