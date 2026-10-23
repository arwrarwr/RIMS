// OM Store server: login + record-level sync + SQLite storage + automatic backups. No npm packages needed (Node 22.13+).
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto');
const { DatabaseSync } = require('node:sqlite');
const DATA = process.env.OM_DATA || path.join(__dirname, '..', 'data'), PORT = +process.env.PORT || 3000, WEB = path.join(__dirname, '..', 'src');
fs.mkdirSync(path.join(DATA, 'backups'), { recursive: true });
const db = new DatabaseSync(path.join(DATA, 'om-store.db'));
db.exec(`PRAGMA journal_mode=WAL;
CREATE TABLE IF NOT EXISTS records(key TEXT PRIMARY KEY, j TEXT, rv INTEGER NOT NULL, del INTEGER DEFAULT 0);
CREATE INDEX IF NOT EXISTS rv_idx ON records(rv);
CREATE TABLE IF NOT EXISTS users(name TEXT PRIMARY KEY, salt TEXT, hash TEXT, role TEXT);
CREATE TABLE IF NOT EXISTS meta(k TEXT PRIMARY KEY, v TEXT);`);
const meta = (k, v) => { if (v === undefined) { const r = db.prepare('SELECT v FROM meta WHERE k=?').get(k); return r && r.v } db.prepare('INSERT OR REPLACE INTO meta VALUES(?,?)').run(k, String(v)) };
if (!meta('secret')) meta('secret', crypto.randomBytes(32).toString('hex'));
if (!meta('v')) meta('v', 0);
const hash = (p, s) => crypto.scryptSync(p, s, 32).toString('hex');
const addUser = (n, p, role) => { const s = crypto.randomBytes(16).toString('hex'); db.prepare('INSERT OR REPLACE INTO users VALUES(?,?,?,?)').run(n, s, hash(p, s), role) };
if (process.argv[2] === 'adduser') { addUser(process.argv[3].toLowerCase(), process.argv[4], 'staff'); console.log('User saved:', process.argv[3]); process.exit() }
const sign = s => crypto.createHmac('sha256', meta('secret')).update(s).digest('hex');
const mkTok = n => { const e = Date.now() + 30 * 864e5; return `${n}.${e}.${sign(n + '.' + e)}` };
const auth = req => { const t = (req.headers.authorization || '').slice(7).split('.'); if (t.length != 3 || +t[1] < Date.now() || sign(t[0] + '.' + t[1]) !== t[2]) return null; return db.prepare('SELECT name FROM users WHERE name=?').get(t[0]) };
const bad = new Map(), fails = ip => (bad.get(ip) || []).filter(t => t > Date.now() - 6e5).length, fail = ip => bad.set(ip, [...(bad.get(ip) || []), Date.now()]);
const send = (res, c, b, t = 'application/json') => { res.writeHead(c, { 'Content-Type': t }); res.end(typeof b == 'string' ? b : JSON.stringify(b)) };

function sync(b) { // optimistic concurrency per record: a write is skipped if someone else changed that record since you last synced
  let v = +meta('v'); const get = db.prepare('SELECT rv FROM records WHERE key=?'), put = db.prepare('INSERT OR REPLACE INTO records VALUES(?,?,?,0)'), del = db.prepare('UPDATE records SET del=1,j=NULL,rv=? WHERE key=?');
  db.exec('BEGIN');
  try {
    for (const u of b.ups || []) { const r = get.get(u.k); if (r && r.rv > u.bv) continue; put.run(u.k, u.j, ++v) }
    for (const d of b.dels || []) { const r = get.get(d.k); if (!r || r.rv > d.bv) continue; del.run(++v, d.k) }
    meta('v', v); db.exec('COMMIT');
  } catch (e) { db.exec('ROLLBACK'); throw e }
  const rows = db.prepare('SELECT key,j,rv,del FROM records WHERE rv>? ORDER BY rv LIMIT 5000').all(b.since || 0), more = rows.length == 5000;
  return { v: more ? rows[rows.length - 1].rv : v, more, changes: rows.map(r => ({ k: r.key, j: r.del ? null : r.j, v: r.rv })) };
}

function api(p, b, req, res) {
  const ip = req.socket.remoteAddress;
  if (p == '/api/status') return send(res, 200, { om: true, setup: !db.prepare('SELECT 1 FROM users').get() });
  if (p == '/api/setup' || p == '/api/login') {
    const n = String(b.user || '').toLowerCase(), pw = String(b.pass || '');
    if (fails(ip) >= 10) return send(res, 429, { error: 'Too many attempts. Wait 10 minutes.' });
    if (p == '/api/setup') { if (db.prepare('SELECT 1 FROM users').get() || !/^[a-z0-9_]{3,20}$/.test(n) || pw.length < 8) return send(res, 400, { error: 'Use a 3-20 character username (letters, digits, _) and a password of 8+ characters.' }); addUser(n, pw, 'owner') }
    else { const u = db.prepare('SELECT * FROM users WHERE name=?').get(n); if (!u || hash(pw, u.salt) !== u.hash) { fail(ip); return send(res, 401, { error: 'Wrong username or password' }) } }
    return send(res, 200, { token: mkTok(n), user: n });
  }
  if (!auth(req)) return send(res, 401, { error: 'login' });
  if (p == '/api/sync') return send(res, 200, sync(b));
  send(res, 404, { error: 'unknown' });
}

function backup() { // one folder per day (refreshed every 3 hours): SQLite copy + readable CSVs + full JSON. Keeps 30 days.
  try {
    const root = path.join(DATA, 'backups'), dir = path.join(root, new Date().toISOString().slice(0, 10)); fs.mkdirSync(dir, { recursive: true });
    const f = path.join(dir, 'om-store.db'); try { fs.unlinkSync(f) } catch { } db.exec(`VACUUM INTO '${f.replace(/'/g, "''")}'`);
    const by = {}; for (const r of db.prepare('SELECT key,j FROM records WHERE del=0').all()) { const c = r.key.slice(0, r.key.indexOf(':')); (by[c] = by[c] || []).push(JSON.parse(r.j)) }
    const nm = Object.fromEntries((by.i || []).map(x => [x.id, x.name])), NAMES = { q: 'quarters', i: 'items', t: 'bills', d: 'deliveries', s: 'suppliers' };
    for (const c in NAMES) {
      const rows = (by[c] || []).map(x => { const o = { ...x }; delete o._k; if (o.lines) { o.items = o.lines.map(l => (nm[l.i] || l.i) + ' x' + l.n + ' @' + l.p).join('; '); delete o.lines } if (o.t > 1e12) o.date = new Date(o.t).toISOString(); return o });
      const cols = [...new Set(rows.flatMap(Object.keys))], q = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';
      fs.writeFileSync(path.join(dir, NAMES[c] + '.csv'), '\ufeff' + [cols.join(','), ...rows.map(o => cols.map(k => q(o[k])).join(','))].join('\n'));
    }
    fs.writeFileSync(path.join(dir, 'all-data.json'), JSON.stringify(by, null, 1));
    fs.readdirSync(root).sort().slice(0, -30).forEach(d => fs.rmSync(path.join(root, d), { recursive: true, force: true }));
    console.log('Backup written to', dir);
  } catch (e) { console.error('Backup failed:', e.message) }
}

const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png' };
http.createServer(async (req, res) => {
  try {
    const u = new URL(req.url, 'http://x');
    if (u.pathname.startsWith('/api/')) {
      const raw = req.method == 'POST' ? await new Promise(r => { let s = ''; req.on('data', c => { s += c; if (s.length > 3e7) req.destroy() }); req.on('end', () => r(s || '{}')) }) : '{}';
      return api(u.pathname, JSON.parse(raw), req, res);
    }
    const p = path.resolve(WEB, '.' + path.sep + decodeURIComponent(u.pathname == '/' ? 'index.html' : u.pathname));
    if (!p.startsWith(WEB + path.sep) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) return send(res, 404, 'Not found', 'text/plain');
    res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(res);
  } catch (e) { send(res, 500, { error: e.message }) }
}).listen(PORT, '0.0.0.0', () => { console.log(`OM Store server on http://localhost:${PORT}  (data: ${path.resolve(DATA)})`); backup(); setInterval(backup, 3 * 36e5) });
