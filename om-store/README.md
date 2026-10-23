# OM Store (Electron)
    npm install
    npm start        # run the desktop app
    npm run dist     # build an installer (Windows .exe / macOS .dmg / Linux AppImage)

Data lives in the shared server database (`data/om-store.db`). `npm start` uses an already-running `npm run server`, or starts the server itself, so both always show the same records.
`src/app.js` uses `window.omDB` (from preload.js) when run in Electron and falls back to localStorage in a browser.
Fonts load from Google Fonts; for fully offline use, download them into `src/` and point `index.html` at the local files.

## Icon / launcher
- Linux: `sh install-launcher.sh` adds an OM Store icon to the app menu and Desktop.
- Windows: double-click `OM Store.bat` (right-click > Send to > Desktop to make a shortcut).
- Any system: `npm run dist` builds a proper installer with the icon and a desktop shortcut.

## Data
Starts empty. Add quarters, items and suppliers under Records. Use Records > Backup regularly.

## Cloud / multi-device mode
    npm run server          # starts the server on port 3000; open http://localhost:3000
First visit creates the owner account. Add staff with: `node server/server.js adduser anita her-password`
All data lives in the `data/` folder next to the server:
- `data/om-store.db`   the live SQLite database (open with DB Browser for SQLite)
- `data/backups/YYYY-MM-DD/`   automatic backup (every 3 hours, last 30 days kept): om-store.db copy + quarters.csv, items.csv, bills.csv, deliveries.csv, suppliers.csv + all-data.json
Set `OM_DATA=/some/folder` and `PORT=8080` to change the data folder and port. Needs Node 22.13 or newer.
Desktop app: it asks for the server address on first run (or set OM_SERVER). Any browser on any device can also use the same address.
Put it behind HTTPS (Cloudflare Tunnel, Caddy, or Tailscale) before exposing it to the internet.
