const $ = s => document.querySelector(s), inr = n => '₹' + Math.round(n).toLocaleString('en-IN');
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647, pick = a => a[Math.floor(rnd() * a.length)];
const DAY = 864e5, now = Date.now(), fd = t => new Date(t).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }), ft = t => new Date(t).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
const TIER = { A1: 'Top management', A2: 'Middle management', A3: 'Middle management', A4: 'Lower management' };
const Q = [], I = [], T = [], D = [], S = []; let tid = 1000;
const mk = (q, lines, t, paid) => { const total = lines.reduce((s, l) => s + l.p * l.n, 0); T.push({ id: nid(), q, lines, t, paid, total }); lines.forEach(l => IT(l.i).sold += l.n) };
/* state */
let view = 'counter', cur = null, bill = [], qs = '', is = '', dq = null, df = '', dt = '', scope = 'due';
const nav = [['counter', 'Counter'], ['diary', 'Customer diary'], ['ret', 'Returns'], ['dash', 'Dashboard'], ['sup', 'Suppliers'], ['rec', 'Records']];
$('#nav').innerHTML = nav.map(n => `<button data-v="${n[0]}" onclick="view='${n[0]}';render()">${n[1]}</button>`).join('');
const toast = m => { const e = $('#toast'); e.textContent = m; e.style.display = 'block'; clearTimeout(toast.h); toast.h = setTimeout(() => e.style.display = 'none', 2400) };
const qdue = id => T.filter(x => x.q === id && !x.paid).reduce((s, x) => s + x.total, 0);
const qObj = id => Q.find(x => x.id === id);
const modal = h => { $('#sheet').innerHTML = h; $('#modal').classList.add('on') }, close = () => $('#modal').classList.remove('on');
$('#modal').onclick = e => { if (e.target.id == 'modal') close() };
function render() {
    document.querySelectorAll('nav button').forEach(b => b.classList.toggle('on', b.dataset.v == view));
    $('#app').innerHTML = { counter: vCounter, diary: vDiary, ret: vRet, dash: vDash, sup: vSup, rec: vRec }[view]();
    const f = document.activeElement;
}
/* COUNTER */
function vCounter() {
    const ql = Q.filter(x => x.id.toLowerCase().includes(qs.toLowerCase()) || x.name.toLowerCase().includes(qs.toLowerCase())).slice(0, 40);
    const il = is ? I.filter(x => !x.off && x.name.toLowerCase().includes(is.toLowerCase())) : [];
    const fq = [...I].filter(x => !x.off).sort((a, b) => b.sold - a.sold).slice(0, 12);
    const tot = bill.reduce((s, l) => s + IT(l.i).price * l.n, 0), c = cur && qObj(cur);
    return `<div class="cols">
 <div class="panel"><h3>Quarter no.</h3>
 <button class="quick ${cur ? '' : 'on'}" onclick="cur=null;render()">Quick pay · walk-in</button>
 <input class="search" id="qs" placeholder="Search A3-08 or name" value="${qs}" oninput="qs=this.value;render();keep('qs')">
 ${Q.length ? '' : '<p class="sub">No quarters yet. Add them under Records → Quarters.</p>'}<div style="max-height:520px;overflow:auto">${ql.map(x => `<button class="q ${cur == x.id ? 'on' : ''}" onclick="cur='${x.id}';render()"><span><b>${x.id}</b><small>${x.name}</small></span>${qdue(x.id) ? `<span class="chip due">${inr(qdue(x.id))}</span>` : ''}</button>`).join('')}</div></div>
 <div class="panel"><h3>Items</h3>
 <input class="search" id="is" placeholder="Search items, e.g. mayonnaise" value="${is}" oninput="is=this.value;render();keep('is')">
 ${il.map(x => `<div class="row ${x.stock ? '' : 'oos'}"><span class="n">${x.name}</span><button class="sq" aria-label="Add" onclick="add(${x.id})" ${x.stock ? '' : 'disabled'}>+</button><button class="sq" aria-label="Remove" onclick="rem(${x.id})">−</button><span>Price ${x.price}</span><span class="chip ${x.stock ? 'paid' : 'out'}">${x.stock ? x.stock + ' in stock' : 'out of stock'}</span></div>`).join('') || (is ? '<p>No item found.</p>' : '')}
 ${I.length ? '' : '<p class="sub">No items yet. Add them under Records → Items &amp; stock.</p>'}<h3 style="margin-top:14px">Frequently ordered</h3>
 <div class="tiles">${fq.map(x => `<button class="tile" onclick="add(${x.id})" ${x.stock ? '' : 'disabled'}><b>${x.name}</b><span>${inr(x.price)}${x.stock ? '' : ' · out'}</span></button>`).join('')}</div></div>
 <div class="panel"><h3>${c ? `Bill · ${c.id}` : 'Bill · Quick pay'}</h3>
 ${c ? `<p style="margin:0 0 8px;color:var(--mute)">${c.name} · ${c.des}, ${c.co}${qdue(c.id) ? `<br><span class="chip due">Earlier due ${inr(qdue(c.id))}</span>` : ''}</p>` : '<p style="margin:0 0 8px;color:var(--mute)">No account. Stock and sales update; no diary entry.</p>'}
 <table><tr><th>Item</th><th class="r">Price</th><th class="r">Qty</th></tr>
 ${bill.map(l => `<tr><td>${IT(l.i).name}</td><td class="r">${IT(l.i).price}</td><td class="r"><button class="sq" onclick="rem(${l.i})">−</button> ${l.n} <button class="sq" onclick="add(${l.i})">+</button></td></tr>`).join('') || '<tr><td colspan=3>Pick items to start a bill.</td></tr>'}</table>
 <div class="total">${inr(tot)}</div>
 <div class="pay">${c ? `<button class="btn p" onclick="checkout(true)" ${tot ? '' : 'disabled'}>Pay now</button><button class="btn i" onclick="checkout(false)" ${tot ? '' : 'disabled'}>Pay later</button>` : `<button class="btn p" onclick="checkout(true)" ${tot ? '' : 'disabled'}>Quick pay</button>`}
 <button class="btn" onclick="bill=[];render()" ${tot ? '' : 'disabled'}>Clear</button></div></div></div>`
}
function keep(id) { const e = document.getElementById(id); e.focus(); e.setSelectionRange(e.value.length, e.value.length) }
function add(i) { const l = bill.find(x => x.i == i); if ((l ? l.n : 0) >= IT(i).stock) return toast('Only ' + IT(i).stock + ' in stock'); l ? l.n++ : bill.push({ i, n: 1 }); render() }
function rem(i) { const l = bill.find(x => x.i == i); if (!l) return; if (--l.n < 1) bill = bill.filter(x => x !== l); render() }
function checkout(paid) {
    const lines = bill.map(l => ({ i: l.i, n: l.n, p: IT(l.i).price })); lines.forEach(l => { IT(l.i).stock -= l.n });
    mk(cur, lines, Date.now(), paid); const tot = T[T.length - 1].total; bill = []; toast(cur ? (paid ? `Paid ${inr(tot)} · saved to ${cur}` : `${inr(tot)} added to ${cur} due`) : `Quick sale ${inr(tot)} recorded`); render(); printAsk(T[T.length - 1])
}
/* DIARY */
function rows() {
    let r = T.filter(x => x.q === dq).sort((a, b) => b.t - a.t);
    if (df) r = r.filter(x => x.t >= new Date(df).getTime()); if (dt) r = r.filter(x => x.t <= new Date(dt).getTime() + DAY); return r
}
function vDiary() {
    if (!Q.length) return empty('No quarters yet. Add them under Records → Quarters.'); if (!qObj(dq)) dq = Q[0].id; const q = qObj(dq), r = rows(), list = Q.filter(x => x.id.toLowerCase().includes(qs.toLowerCase()) || x.name.toLowerCase().includes(qs.toLowerCase())).slice(0, 40);
    return `<div class="cols" style="grid-template-columns:230px 1fr"><div class="panel"><h3>Customer diary</h3>
 <input class="search" id="qs" placeholder="Search quarter" value="${qs}" oninput="qs=this.value;render();keep('qs')">
 <div style="max-height:600px;overflow:auto">${list.map(x => `<button class="q ${dq == x.id ? 'on' : ''}" onclick="dq='${x.id}';render()"><span><b>${x.id}</b><small>${x.name}</small></span>${qdue(x.id) ? `<span class="chip due">${inr(qdue(x.id))}</span>` : ''}</button>`).join('')}</div></div>
 <div class="panel"><h3>Transaction history · ${q.id}</h3><p style="margin:0 0 10px;color:var(--mute)">${q.name} · ${q.des}, ${q.co} · +91 ${q.ph} · Due <b style="color:var(--bad)">${inr(qdue(dq))}</b></p>
 <div class="filters"><label>From<input type="date" value="${df}" onchange="df=this.value;render()"></label><label>To<input type="date" value="${dt}" onchange="dt=this.value;render()"></label>
 <button class="btn" onclick="df=dt='';render()">Reset</button></div>
 <div class="scroll"><table><tr><th>Items</th><th class="r">Price</th><th>Date &amp; time</th><th>Status</th><th></th></tr>
 ${r.map(x => `<tr><td>${ds(x)}</td><td class="r" style="${x.ret ? 'color:var(--bad)' : ''}">${inr(x.total)}</td><td>${fd(x.t)}, ${ft(x.t)}</td><td><span class="chip ${x.ret ? 'out' : x.paid ? 'paid' : 'due'}">${x.ret ? (x.paid ? 'Refunded' : 'Credited to due') : x.paid ? 'Paid' : 'Due'}</span></td><td>${canRet(x) ? `<button class="btn" onclick="openRet(${x.id})">Return</button>` : ''}</td></tr>`).join('') || '<tr><td colspan=5>No transactions in this range.</td></tr>'}</table></div>
 <div class="filters" style="margin-top:14px"><b style="font-family:Fraunces;font-size:18px;align-self:center">Generate bill</b>
 <label>For<select id="sc"><option value="due">Unpaid dues</option><option value="last">Last paid</option><option value="range">Filtered range</option></select></label>
 <button class="btn p" onclick="genBill()">Generate bill</button>
 <button class="btn" onclick="settle()" ${qdue(dq) ? '' : 'disabled'}>Mark dues paid</button></div></div></div>`
}
function settle() { T.filter(x => x.q === dq && !x.paid).forEach(x => x.paid = true); toast('Dues cleared for ' + dq); render() }
function genBill() {
    const s = $('#sc').value; let r = T.filter(x => x.q === dq);
    if (s == 'due') r = r.filter(x => !x.paid); else if (s == 'last') r = r.filter(x => x.paid && !x.ret).sort((a, b) => b.t - a.t).slice(0, 1); else r = rows();
    if (!r.length) return toast('Nothing to bill for that choice'); const q = qObj(dq), sum = r.reduce((a, x) => a + x.total, 0);
    let txt = `*OM Store* – Bill for ${q.id} (${q.name})\n` + r.map(x => `${fd(x.t)}: ${ds(x).replace(/×/g, 'x')} = ${inr(x.total)}`).join('\n') + `\n*Total: ${inr(sum)}*`;
    window.curBill = { txt, ph: q.ph, r };
    modal(`<h3>Bill · ${q.id}</h3><p style="color:var(--mute);margin:4px 0 8px">${q.name}</p><table>${r.map(x => `<tr><td>${fd(x.t)}</td><td>${ds(x)}</td><td class="r">${inr(x.total)}</td></tr>`).join('')}</table>
 <div class="total">${inr(sum)}</div>
 <div class="filters"><label>Send<select id="to" onchange="$('#own').style.display=this.value=='own'?'block':'none'"><option value="acc">To account number (+91 ${q.ph})</option><option value="own">To another number</option></select></label>
 <input id="own" placeholder="10-digit number" style="display:none;padding:7px 10px;border:1.5px solid var(--indigo);border-radius:10px;background:var(--card)"></div>
 <div class="pay"><button class="btn p" onclick="sendWA()">Send on WhatsApp</button><button class="btn" onclick="printBills(curBill.r)">Print</button><button class="btn" onclick="close()">Close</button></div>`)
}
function sendWA() {
    let n = $('#to').value == 'acc' ? curBill.ph : $('#own').value.replace(/\D/g, '').slice(-10); if (n.length < 10) return toast('Enter a valid 10-digit number');
    window.open('https://wa.me/91' + n + '?text=' + encodeURIComponent(curBill.txt), '_blank'); toast('Opening WhatsApp for +91 ' + n)
}
/* DASH */
function vDash() {
    const day0 = new Date().setHours(0, 0, 0, 0), inD = (t, a, b) => t >= day0 - a * DAY && t < day0 - b * DAY + DAY;
    const sum = a => a.reduce((s, x) => s + x.total, 0), today = sum(T.filter(x => x.t >= day0)), m30 = T.filter(x => x.t >= day0 - 29 * DAY), dues = sum(T.filter(x => x.q && !x.paid));
    const low = I.filter(x => x.stock <= x.min).sort((a, b) => a.stock - b.stock), days = [...Array(14)].map((_, k) => { const d = 13 - k; return { d, v: sum(T.filter(x => inD(x.t, d, d))) } }), mx = Math.max(...days.map(x => x.v), 1);
    const tier = t => sum(T.filter(x => x.q && !x.paid && qObj(x.q).t == t)), tm = Math.max(...['A1', 'A2', 'A3', 'A4'].map(tier), 1);
    const debt = Q.map(q => [q, qdue(q.id)]).filter(a => a[1]).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const top = [...I].sort((a, b) => b.sold - a.sold).slice(0, 6), topm = (top[0] && top[0].sold) || 1;
    const cost = D.reduce((s, x) => s + x.amt, 0), quick = sum(T.filter(x => !x.q && x.t >= day0 - 29 * DAY));
    const gp = m30.reduce((s, x) => s + x.lines.reduce((a, l) => a + (l.p - (IT(l.i).cost || 0)) * l.n * (x.ret ? -1 : 1), 0), 0);
    const kp = (l, v, c, s) => `<div class="kpi" style="background:${c}"><span>${l}</span><b>${v}</b><small>${s}</small></div>`;
    return `<div class="kpis">${kp('Sales today', inr(today), 'var(--cream)', T.filter(x => x.t >= day0 && !x.ret).length + ' bills, net of returns')}${kp('Sales, last 30 days', inr(sum(m30)), 'var(--peach)', m30.filter(x => !x.ret).length + ' bills · quick pay ' + inr(quick))}${kp('Outstanding dues', inr(dues), 'var(--pink)', debt.length + ' quarters owe')}${kp('Returns, last 30 days', inr(-sum(m30.filter(x => x.ret))), 'var(--cream)', m30.filter(x => x.ret).length + ' return entries')}${kp('Est. gross profit (30d)', inr(gp), 'var(--indigo)', 'from the cost prices you entered')}${kp('Low stock', low.length + ' items', 'var(--mauve)', 'reorder soon')}</div>
 <div class="grid2"><div class="panel"><h3>Daily sales, last 14 days</h3><svg viewBox="0 0 560 190" width="100%" role="img" aria-label="Daily sales bar chart">${days.map((x, k) => { const h = x.v / mx * 140; return `<rect x="${k * 40 + 6}" y="${150 - h}" width="28" height="${h}" rx="5" fill="${k == 13 ? 'var(--pink)' : 'var(--indigo)'}"/><text x="${k * 40 + 20}" y="168" font-size="10" text-anchor="middle" fill="currentColor">${new Date(day0 - x.d * DAY).getDate()}</text>${k % 3 == 1 ? `<text x="${k * 40 + 20}" y="${144 - h}" font-size="9" text-anchor="middle" fill="currentColor">${Math.round(x.v / 100) / 10}k</text>` : ''}` }).join('')}</svg></div>
 <div class="panel"><h3>Top selling items</h3>${top.map(x => `<div class="bar"><span>${x.name}</span><i style="width:${x.sold / topm * 100}%"></i><span>${x.sold} sold</span></div>`).join('')}</div></div>
 <div class="grid2"><div class="panel"><h3>Dues by management tier</h3>${['A1', 'A2', 'A3', 'A4'].map(t => `<div class="bar"><span>${t} · ${TIER[t].split(' ')[0]}</span><i style="width:${tier(t) / tm * 100}%;background:var(--mauve)"></i><span>${inr(tier(t))}</span></div>`).join('')}
 <h3 style="margin-top:14px">Highest dues</h3><table>${debt.map(([q, v]) => `<tr><td><b>${q.id}</b> ${q.name}<br><small style="color:var(--mute)">${q.des}, ${q.co}</small></td><td class="r">${inr(v)}</td><td><button class="btn" onclick="dq='${q.id}';view='diary';render()">Open</button></td></tr>`).join('')}</table></div>
 <div class="panel"><h3>Reorder list</h3><table><tr><th>Item</th><th class="r">Stock</th><th class="r">Suggest</th></tr>${low.map(x => `<tr><td>${x.name}</td><td class="r">${x.stock ? x.stock : '<span class="chip out">out</span>'}</td><td class="r">${Math.max(20 - x.stock, 10)}</td></tr>`).join('') || '<tr><td colspan=3>All items are above minimum stock.</td></tr>'}</table>
 <p style="color:var(--mute)">Supplier bills in the last 6 weeks: ${inr(cost)}. Pending: ${inr(D.filter(x => !x.paid).reduce((s, x) => s + x.amt, 0))}.</p></div></div>`
}
/* ===== empty-start data tools: records, forms, supplier stock, printing, backup ===== */
const SCH = {
    q: { n: 'quarter', f: [['id', 'Quarter no. (e.g. A3-08)'], ['name', 'Resident name'], ['des', 'Designation'], ['co', 'Company', 'sel', ['ITC', 'Century']], ['ph', 'Phone (10 digits)'], ['t', 'Block', 'sel', ['A1', 'A2', 'A3', 'A4']]] },
    i: { n: 'item', f: [['name', 'Item name'], ['price', 'Selling price ₹', 'num'], ['cost', 'Cost price ₹', 'num'], ['stock', 'Stock in hand', 'num'], ['min', 'Reorder level', 'num']] },
    s: { n: 'supplier', f: [['name', 'Supplier name'], ['supplies', 'What they supply'], ['phone', 'Phone']] }
};
const ARR = { q: Q, i: I, s: S };
const empty = m => `<div class="panel empty">${m}</div>`;
function openForm(t, k) {
    const sc = SCH[t], o = k == null ? {} : ARR[t][k];
    modal(`<h3>${k == null ? 'Add' : 'Edit'} ${sc.n}</h3><div class="form">${sc.f.map(([f, l, ty, op]) => `<label>${l}${ty == 'sel' ? `<select id="f_${f}">${op.map(v => `<option ${o[f] == v ? 'selected' : ''}>${v}</option>`).join('')}</select>` : `<input id="f_${f}" type="${ty == 'num' ? 'number' : 'text'}" ${ty == 'num' ? 'min="0" step="any"' : ''} ${f == 'id' && k != null ? 'disabled' : ''} value="${o[f] ?? ''}">`}</label>`).join('')}</div>
 <div class="pay" style="margin-top:12px"><button class="btn p" onclick="saveForm('${t}',${k == null ? 'null' : k})">Save</button><button class="btn" onclick="close()">Cancel</button>${k != null && t != 'i' ? `<button class="btn" style="margin-left:auto;color:var(--bad)" onclick="delRow('${t}',${k})">Delete</button>` : ''}</div>`)
}
function saveForm(t, k) {
    const sc = SCH[t], o = {}; sc.f.forEach(([f, , ty]) => { const v = $('#f_' + f).value.trim(); o[f] = ty == 'num' ? (+v || 0) : v });
    if (!o[sc.f[0][0]]) return toast('Fill in ' + sc.f[0][1]);
    if (t == 'q') { o.id = o.id.toUpperCase(); if (k == null && Q.some(x => x.id == o.id)) return toast(o.id + ' already exists'); if (o.ph && !/^\d{10}$/.test(o.ph)) return toast('Phone must be 10 digits') }
    if (k == null) { if (t == 'i') { o.id = I.reduce((m, x) => Math.max(m, x.id), -1) + 1; o.sold = 0 } ARR[t].push(o) } else { const old = ARR[t][k]; if (t == 's' && old.name != o.name) D.forEach(d => { if (d.s == old.name) d.s = o.name }); Object.assign(old, o) }
    close(); toast('Saved'); render()
}
function delRow(t, k) { if (t == 'q' && T.some(x => x.q == Q[k].id)) return toast('This quarter has bills, so it cannot be deleted'); if (!confirm('Delete this ' + SCH[t].n + '?')) return; ARR[t].splice(k, 1); close(); render() }
let rtab = 'q', rf = '';
function vRec() {
    const tabs = [['q', 'Quarters'], ['i', 'Items & stock'], ['s', 'Suppliers'], ['b', 'Bills'], ['d', 'Deliveries']], s = rf.toLowerCase(),
        ed = (t, k) => `<button class="btn" onclick="openForm('${t}',${k})">Edit</button>`,
        C = {
            q: [['Quarter', x => `<b>${x.id}</b>`], ['Resident', x => x.name], ['Designation', x => x.des], ['Company', x => x.co], ['Phone', x => x.ph], ['Block', x => x.t], ['Due', x => inr(qdue(x.id)), 1], ['', (x, k) => ed('q', k)]],
            i: [['Item', x => x.name + (x.off ? ' <span class="chip">hidden</span>' : '')], ['Selling ₹', x => x.price, 1], ['Cost ₹', x => x.cost, 1], ['Stock', x => x.stock, 1], ['Reorder at', x => x.min, 1], ['Stock value', x => inr(x.stock * x.cost), 1], ['Sold', x => x.sold, 1], ['', (x, k) => ed('i', k) + ` <button class="btn" onclick="I[${k}].off=!I[${k}].off;render()">${x.off ? 'Show' : 'Hide'}</button>`]],
            s: [['Supplier', x => x.name], ['Supplies', x => x.supplies], ['Phone', x => x.phone], ['Billed', x => inr(D.filter(d => d.s == x.name).reduce((a, d) => a + d.amt, 0)), 1], ['', (x, k) => ed('s', k)]],
            b: [['Bill', x => '#' + x.id], ['Date', x => fd(x.t) + ', ' + ft(x.t)], ['Customer', x => who(x.q)], ['Items', x => ds(x)], ['Amount', x => inr(x.total), 1], ['Status', x => `<span class="chip ${x.ret ? 'out' : x.paid ? 'paid' : 'due'}">${x.ret ? 'Return' : x.paid ? 'Paid' : 'Due'}</span>`], ['', x => `<button class="btn" onclick="printBills([T.find(t=>t.id==${x.id})])">Print</button>`]],
            d: [['Date', x => fd(x.t)], ['Supplier', x => x.s], ['Goods', x => x.what], ['Amount', x => inr(x.amt), 1], ['Status', x => `<span class="chip ${x.paid ? 'paid' : 'due'}">${x.paid ? 'Paid' : 'Pending'}</span>`], ['', (x, k) => x.paid ? '' : `<button class="btn" onclick="D[${k}].paid=true;render()">Mark paid</button>`]]
        }[rtab],
        rows = ({ q: Q, i: I, s: S, b: T, d: D }[rtab]).map((x, k) => [x, k]).filter(([x]) => !s || (JSON.stringify(x) + (x.lines ? who(x.q) + ds(x) : '')).toLowerCase().includes(s));
    if (rtab == 'b' || rtab == 'd') rows.reverse(); const n = rows.length;
    return `<div class="panel"><div class="filters">${tabs.map(([k, l]) => `<button class="seg ${rtab == k ? 'on' : ''}" onclick="rtab='${k}';rf='';render()">${l}</button>`).join('')}</div>
 <div class="filters"><input class="search" id="rf" style="max-width:320px;margin:0" placeholder="Search ${SCH[rtab] ? SCH[rtab].n + 's' : 'records'}" value="${rf}" oninput="rf=this.value;render();keep('rf')">
 ${SCH[rtab] ? `<button class="btn p" onclick="openForm('${rtab}',null)">+ Add ${SCH[rtab].n}</button>` : ''}<button class="btn" onclick="csv()">Export CSV</button><button class="btn" onclick="backup()">Backup all data</button>
 <label class="btn" style="cursor:pointer">Restore backup<input type="file" accept=".json" hidden onchange="restore(this.files[0])"></label></div>
 <p class="sub">${n} record${n == 1 ? '' : 's'}${rtab == 'i' ? ' · stock value at cost ' + inr(I.reduce((a, x) => a + x.stock * x.cost, 0)) : ''}${n > 300 ? ' · showing the latest 300' : ''}</p>
 <div class="scroll"><table id="rt"><tr>${C.map(c => `<th class="${c[2] ? 'r' : ''}">${c[0]}</th>`).join('')}</tr>${rows.slice(0, 300).map(([x, k]) => `<tr>${C.map(c => `<td class="${c[2] ? 'r' : ''}">${c[1](x, k)}</td>`).join('')}</tr>`).join('') || '<tr><td colspan=9>Nothing here yet. Use the Add button.</td></tr>'}</table></div></div>`
}
function dl(txt, name, type) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([txt], { type })); a.download = name; a.click() }
function csv() { dl([...document.querySelectorAll('#rt tr')].map(tr => [...tr.children].slice(0, -1).map(c => '"' + c.textContent.replace(/"/g, '""') + '"').join(',')).join('\n'), `om-store-${rtab}.csv`, 'text/csv') }
function backup() { dl(JSON.stringify({ v: 2, tid, Q, I, T, D, S }), 'om-store-backup-' + new Date().toISOString().slice(0, 10) + '.json', 'application/json') }
function loadData(d) { tid = d.tid;[[Q, d.Q], [I, d.I], [T, d.T], [D, d.D], [S, d.S]].forEach(([a, b]) => { a.length = 0; a.push(...(b || [])) }) }
function restore(f) { if (!f) return; f.text().then(t => { try { const d = JSON.parse(t); if (d.v != 2) throw 0; if (!confirm('Replace all current data with this backup?')) return; loadData(d); toast('Backup restored'); render() } catch (e) { toast('That file is not an OM Store backup') } }) }
function vSup() {
    const by = S.map(s => { const d = D.filter(x => x.s == s.name); return { s, c: d.length, t: d.reduce((a, x) => a + x.amt, 0), p: d.filter(x => !x.paid).reduce((a, x) => a + x.amt, 0) } }), sel = 'padding:7px 10px;border:1px solid var(--indigo);border-radius:8px;background:var(--card)';
    return `<div class="panel" style="margin-bottom:14px"><h3>Receive stock from a supplier</h3>${S.length && I.length ? `<div class="filters"><label>Supplier<select id="rc_s" style="${sel}">${S.map(s => `<option>${s.name}</option>`).join('')}</select></label><label>Item<select id="rc_i" style="${sel}">${I.map(x => `<option value="${x.id}">${x.name}</option>`).join('')}</select></label><label>Quantity<input id="rc_q" type="number" min="1" value="10" style="width:90px"></label><label>Cost per unit ₹<input id="rc_c" type="number" min="0" style="width:110px"></label><label>Payment<select id="rc_p" style="${sel}"><option value="1">Paid</option><option value="0">Pay later</option></select></label><button class="btn p" onclick="recvStock()">Add to stock</button></div>` : '<p class="sub">Add at least one supplier and one item under Records first.</p>'}</div>
 <div class="panel" style="margin-bottom:14px"><h3>Suppliers</h3><div class="scroll"><table><tr><th>Supplier</th><th>Supplies</th><th class="r">Deliveries</th><th class="r">Total billed</th><th class="r">Payable</th></tr>${by.map(x => `<tr><td><b>${x.s.name}</b></td><td>${x.s.supplies || ''}</td><td class="r">${x.c}</td><td class="r">${inr(x.t)}</td><td class="r">${x.p ? `<span class="chip due">${inr(x.p)}</span>` : '—'}</td></tr>`).join('') || '<tr><td colspan=5>No suppliers yet. Add them under Records → Suppliers.</td></tr>'}</table></div></div>
 <div class="panel"><h3>Recent deliveries</h3><div class="scroll"><table><tr><th>Date</th><th>Supplier</th><th>Goods</th><th class="r">Bill</th><th>Status</th></tr>${[...D].reverse().slice(0, 25).map(x => `<tr><td>${fd(x.t)}</td><td>${x.s}</td><td>${x.what}</td><td class="r">${inr(x.amt)}</td><td><span class="chip ${x.paid ? 'paid' : 'due'}">${x.paid ? 'Paid' : 'Pending'}</span></td></tr>`).join('') || '<tr><td colspan=5>No deliveries yet.</td></tr>'}</table></div></div>`
}
function recvStock() {
    const it = IT(+$('#rc_i').value), n = +$('#rc_q').value, c = +$('#rc_c').value; if (!(n > 0) || !(c >= 0) || $('#rc_c').value === '') return toast('Enter quantity and cost per unit');
    it.stock += n; it.cost = c; D.push({ t: Date.now(), s: $('#rc_s').value, what: `${it.name} ×${n}`, amt: n * c, paid: $('#rc_p').value == '1' }); toast(`${it.name}: +${n} added to stock`); render()
}
function printBills(r) {
    const q = r[0] && r[0].q ? qObj(r[0].q) : null, sum = r.reduce((a, x) => a + x.total, 0);
    $('#print').innerHTML = `<h2>OM Store</h2><p>Proprietor: Satya Narayan Gupta</p><hr><p>${q ? `<b>Quarter ${q.id}</b> · ${q.name}<br>${q.des}, ${q.co}` : '<b>Cash memo</b>'}<br>Printed ${fd(Date.now())}, ${ft(Date.now())}</p>
 <table><tr><th>Date</th><th>Item</th><th>Qty</th><th>Rate</th><th>Amount</th></tr>${r.flatMap(x => x.lines.map(l => `<tr><td>${fd(x.t)}</td><td>${x.ret ? 'Return: ' : ''}${IT(l.i).name}</td><td>${l.n}</td><td>${l.p}</td><td>${(x.ret ? -1 : 1) * l.p * l.n}</td></tr>`)).join('')}</table>
 <h3>Total ${inr(sum)}</h3>${q ? `<p>Outstanding due on this quarter: <b>${inr(qdue(q.id))}</b></p>` : ''}<p>Thank you. Visit again.</p>`; window.print()
}
function printAsk(x) { modal(`<h3>Bill #${x.id} saved</h3><p class="sub">${who(x.q)} · ${inr(x.total)} · ${x.paid ? 'Paid' : 'Due'}</p><div class="pay"><button class="btn p" onclick="printBills([T.find(t=>t.id==${x.id})]);close()">Print bill</button><button class="btn" onclick="close()">Done</button></div>`) }
/* ===== cloud sync: login + record-level sync with the OM Store server ===== */
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
const IT = i => I.find(x => x.id == i) || { name: '(removed item)', price: 0, cost: 0, stock: 0, sold: 0 };
const nid = () => ++tid;
const COL = { q: Q, i: I, t: T, d: D, s: S }; let MODE = 'local', base = {}, ver = 0, tok = null, busy = false, dirty = false, polling = false;
try { tok = localStorage.getItem('om-token') } catch (e) { }
const setSync = (t, c) => { const e = $('#sync'); if (e) { e.textContent = t; e.style.color = c || '' } };
async function api(p, b) {
    const r = await fetch(p, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(tok ? { Authorization: 'Bearer ' + tok } : {}) }, body: JSON.stringify(b || {}) });
    if (r.status == 401 && p == '/api/sync') { showLogin(); throw new Error('login') }
    const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Server error'); return j
}
function applyCh(ch, mine, cur) {
    let n = 0, cf = 0; const M = {}; for (const c in COL) M[c] = new Map(COL[c].map((r, j) => [r._k, j]));
    for (const x of ch) {
        const i = x.k.indexOf(':'), c = x.k.slice(0, i), k = x.k.slice(i + 1), A = COL[c]; if (!A) continue; const pos = M[c].get(k);
        if (x.j === null) { if (pos !== undefined) A[pos] = null; delete base[x.k]; n++; continue }
        if (mine && mine.has(x.k) && cur[x.k] === x.j) { base[x.k] = { j: x.j, v: x.v }; continue }
        if (mine && mine.has(x.k)) cf++;
        if (base[x.k] && base[x.k].j === x.j && pos !== undefined) { base[x.k].v = x.v; continue }
        const o = JSON.parse(x.j); if (pos !== undefined) A[pos] = o; else M[c].set(k, A.push(o) - 1); base[x.k] = { j: x.j, v: x.v }; if (c == 't') tid = Math.max(tid, o.id || 0); n++
    }
    for (const c in COL) { const A = COL[c]; if (A.includes(null)) { const f = A.filter(Boolean); A.length = 0; f.forEach(r => A.push(r)) } }
    if (n) { I.sort((a, b) => a.id - b.id); Q.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true })); S.sort((a, b) => a.name.localeCompare(b.name)); D.sort((a, b) => a.t - b.t); T.sort((a, b) => a.t - b.t) }
    if (cf) toast(cf + ' record(s) were changed on another device and have been refreshed'); return n
}
async function sync() {
    if (MODE != 'cloud' || busy) return; busy = true; const diff = dirty; dirty = false;
    try {
        const ups = [], dels = [], cur = {};
        if (diff) {
            for (const c in COL) for (const r of COL[c]) { if (!r._k) r._k = uid(); cur[c + ':' + r._k] = JSON.stringify(r) }
            for (const k in cur) if (!base[k] || base[k].j !== cur[k]) ups.push({ k, j: cur[k], bv: base[k] ? base[k].v : 0 });
            for (const k in base) if (!(k in cur)) dels.push({ k, bv: base[k].v })
        }
        const mine = new Set(ups.map(u => u.k)); let r, first = true, chg = 0;
        do { r = await api('/api/sync', { since: ver, ups: first ? ups : [], dels: first ? dels : [] }); ver = r.v; chg += applyCh(r.changes, first ? mine : null, cur); first = false } while (r.more);
        if (chg) _render(); setSync('● Synced', 'var(--ok)')
    }
    catch (e) { dirty = true; if (e.message != 'login') setSync('● Offline, retrying', 'var(--bad)') } finally { busy = false }
}
function showLogin(setup) {
    const e = $('#login'); e.classList.add('on');
    e.innerHTML = `<form class="sheet" onsubmit="doLogin(event,${!!setup})"><h2>OM Store</h2><p class="sub">${setup ? 'First run: create the owner account' : 'Sign in to continue'}</p><div class="form" style="grid-template-columns:1fr"><label>Username<input id="lu" autocomplete="username" required></label><label>Password${setup ? ' (8+ characters)' : ''}<input id="lp" type="password" autocomplete="${setup ? 'new-password' : 'current-password'}" required></label></div><p id="le" style="color:var(--bad);min-height:20px"></p><button class="btn p">${setup ? 'Create account' : 'Sign in'}</button></form>`
}
async function doLogin(ev, setup) {
    ev.preventDefault(); try {
        const r = await api(setup ? '/api/setup' : '/api/login', { user: $('#lu').value, pass: $('#lp').value }); tok = r.token; try { localStorage.setItem('om-token', tok) } catch (e) { }
        $('#login').classList.remove('on'); for (const c in COL) COL[c].length = 0; base = {}; ver = 0; startCloud()
    } catch (x) { $('#le').textContent = x.message }
}
async function startCloud() {
    MODE = 'cloud'; $('#reset').style.display = 'none'; $('#me').textContent = 'Signed in as ' + tok.split('.')[0];
    const lo = $('#logout'); lo.style.display = ''; lo.onclick = () => { try { localStorage.removeItem('om-token') } catch (e) { } location.reload() };
    if (window.omCfg && !$('#chg')) { const b = document.createElement('button'); b.id = 'chg'; b.textContent = 'Change server'; b.onclick = () => omCfg.set({}); lo.after(b) }
    await sync();
    if (window.omDB && !Object.values(COL).some(A => A.length)) { const d = await window.omDB.load(); if (d && d.v == 2 && ['Q', 'I', 'T', 'D', 'S'].some(k => (d[k] || []).length)) { loadData(d); dirty = true; await sync(); toast('Your earlier local records were moved to the shared database') } }
    _render(); if (!polling) { polling = true; setInterval(sync, 8000) }
}
async function boot() {
    try { const s = await fetch('/api/status').then(r => r.json()); if (s.om) { MODE = 'cloud'; $('#reset').style.display = 'none'; if (!tok || s.setup) return showLogin(s.setup); return startCloud() } } catch (e) { }
    const d = await DB.load(); if (d && d.v == 2) loadData(d); render()
}
let rs = '', rsel = null, rq = {}, rrs = 'Changed mind', rst = true, rm = 'cash';
function ds(x) { return (x.ret ? '↩ Return: ' : '') + x.lines.map(l => IT(l.i).name + ' ×' + l.n).join(', ') + (x.reason ? ` (${x.reason})` : '') }
function canRet(x) { return !x.ret && x.lines.some(l => l.n - (l.rt || 0) > 0) }
function who(q) { return q ? `${q} · ${qObj(q).name}` : 'Walk-in' }
function openRet(id) { view = 'ret'; rsel = id; rq = {}; rrs = 'Changed mind'; rst = true; rm = 'cash'; render() }
function rset(k, d) { const x = T.find(t => t.id == rsel), l = x.lines[k], m = l.n - (l.rt || 0); rq[k] = Math.max(0, Math.min(m, (rq[k] || 0) + d)); render() }
function rall(on) { T.find(t => t.id == rsel).lines.forEach((l, k) => rq[k] = on ? l.n - (l.rt || 0) : 0); render() }
function setRs(r) { rrs = r; rst = !(r == 'Damaged' || r == 'Expired'); render() }
function procRet() {
    const x = T.find(t => t.id == rsel), L = []; x.lines.forEach((l, k) => { if (rq[k] > 0) L.push({ i: l.i, n: rq[k], p: l.p, k }) });
    if (!L.length) return toast('Choose at least one item to return');
    const paid = x.q ? (x.paid && rm == 'cash') : true, total = -L.reduce((s, l) => s + l.p * l.n, 0);
    L.forEach(l => { x.lines[l.k].rt = (x.lines[l.k].rt || 0) + l.n; if (rst) IT(l.i).stock += l.n; IT(l.i).sold -= l.n });
    T.push({ id: nid(), q: x.q, lines: L.map(l => ({ i: l.i, n: l.n, p: l.p })), t: Date.now(), paid, total, ret: true, ref: x.id, reason: rrs, nr: !rst });
    toast(`${inr(-total)} ${x.q ? (paid ? 'refunded in cash' : 'deducted from ' + x.q + ' due') : 'refunded'}${rst ? ' · stock updated' : ' · written off'}`); rsel = null; render()
}
function desk(x) {
    const tot = x.lines.reduce((s, l, k) => s + l.p * (rq[k] || 0), 0), due = x.q ? qdue(x.q) : 0;
    return `<h3>Return desk · bill #${x.id}</h3><p class="sub">${who(x.q)} · ${fd(x.t)}, ${ft(x.t)} · <span class="chip ${x.paid ? 'paid' : 'due'}">${x.paid ? 'Paid' : 'Due'}</span></p>
 <table><tr><th>Item</th><th class="r">Rate</th><th class="r">Bought</th><th class="r">Returning</th><th class="r">Refund</th></tr>${x.lines.map((l, k) => { const m = l.n - (l.rt || 0); return `<tr><td>${IT(l.i).name}${l.rt ? `<br><small class="sub">${l.rt} already returned</small>` : ''}</td><td class="r">${inr(l.p)}</td><td class="r">${l.n}</td><td class="r"><button class="sq" onclick="rset(${k},-1)" ${m ? '' : 'disabled'}>−</button> <b>${rq[k] || 0}</b> <button class="sq" onclick="rset(${k},1)" ${m ? '' : 'disabled'}>+</button></td><td class="r">${inr(l.p * (rq[k] || 0))}</td></tr>` }).join('')}</table>
 <div class="pay" style="margin:10px 0"><button class="btn" onclick="rall(true)">Return everything</button><button class="btn" onclick="rall(false)">Clear</button></div>
 <div class="opt"><span>Reason</span>${['Changed mind', 'Wrong item', 'Damaged', 'Expired'].map(r => `<button class="seg ${rrs == r ? 'on' : ''}" onclick="setRs('${r}')">${r}</button>`).join('')}</div>
 <div class="opt"><span>Stock</span><button class="seg ${rst ? 'on' : ''}" onclick="rst=true;render()">Back on shelf</button><button class="seg ${rst ? '' : 'on'}" onclick="rst=false;render()">Write off</button></div>
 <div class="opt"><span>Refund</span>${x.q && x.paid ? `<button class="seg ${rm == 'cash' ? 'on' : ''}" onclick="rm='cash';render()">Cash back</button><button class="seg ${rm == 'credit' ? 'on' : ''}" onclick="rm='credit';render()">Credit against dues${due ? ' (' + inr(due) + ')' : ''}</button>` : `<span style="width:auto">${x.q ? 'Reduces the unpaid amount in the diary' : 'Cash to walk-in customer'}</span>`}</div>
 <div class="refund"><div><small class="sub">Refund total</small><div class="total">${inr(tot)}</div></div><button class="btn p" onclick="procRet()" ${tot ? '' : 'disabled'}>Process return</button></div>`
}
function vRet() {
    const s = rs.toLowerCase(), day0 = new Date().setHours(0, 0, 0, 0), x = T.find(t => t.id == rsel),
        list = T.filter(b => canRet(b) && b.t >= now - 30 * DAY && (!s || (who(b.q) + ' ' + ds(b) + ' #' + b.id).toLowerCase().includes(s))).sort((a, b) => b.t - a.t).slice(0, 30),
        td = T.filter(b => b.ret && b.t >= day0), sm = a => -a.reduce((n, b) => n + b.total, 0),
        st = (l, v, n) => `<div class="stat"><span>${l}</span><b>${v}</b><small>${n}</small></div>`;
    return `<div class="stats">${st('Returns today', td.length, inr(sm(td)) + ' in value')}${st('Cash refunded today', inr(sm(td.filter(b => b.paid))), td.filter(b => b.paid).length + ' refunds')}${st('Credited to dues today', inr(sm(td.filter(b => !b.paid))), td.filter(b => !b.paid).length + ' credits')}${st('Written off, 30 days', inr(sm(T.filter(b => b.ret && b.nr && b.t >= now - 30 * DAY))), 'damaged or expired stock')}</div>
 <div class="cols" style="grid-template-columns:minmax(280px,400px) 1fr"><div class="panel"><h3>Find the original bill</h3><input class="search" id="rs" placeholder="Quarter, name, item or bill no." value="${rs}" oninput="rs=this.value;render();keep('rs')">
 <div class="list">${list.map(b => `<button class="q ${b.id == rsel ? 'on' : ''}" onclick="openRet(${b.id})"><span><b>${who(b.q)}</b><small>#${b.id} · ${ds(b)}</small></span><span class="r"><b>${inr(b.total)}</b><small>${fd(b.t)}</small></span></button>`).join('') || '<p class="sub">No bills match. Only the last 30 days can be returned.</p>'}</div></div>
 <div class="panel">${x ? desk(x) : '<div class="empty"><b>Select a bill to start a return</b><br>Tip: search an item name to find who bought it.</div>'}</div></div>
 <div class="panel" style="margin-top:14px"><h3>Recent returns</h3><div class="scroll"><table><tr><th>Date</th><th>Customer</th><th>Items</th><th class="r">Amount</th><th>Settled</th></tr>${T.filter(b => b.ret).sort((a, b) => b.t - a.t).slice(0, 10).map(b => `<tr><td>${fd(b.t)}, ${ft(b.t)}</td><td>${who(b.q)}</td><td>${ds(b)}${b.nr ? ' <span class="chip out">written off</span>' : ''}</td><td class="r" style="color:var(--bad)">${inr(b.total)}</td><td><span class="chip ${b.paid ? 'paid' : 'due'}">${b.paid ? 'Refunded' : 'Credited to due'}</span></td></tr>`).join('') || '<tr><td colspan=5>No returns yet.</td></tr>'}</table></div></div>`
}
/* persistence: Electron (window.omDB via preload) or browser localStorage */
const DB = window.omDB || { load: async () => { try { return JSON.parse(localStorage.getItem('om-store')) } catch (e) { return null } }, save: async d => { try { d == null ? localStorage.removeItem('om-store') : localStorage.setItem('om-store', JSON.stringify(d)) } catch (e) { } } };
let sv; const _render = render; render = function () { _render(); $('#title').textContent = (nav.find(n => n[0] == view) || [])[1] || ''; clearTimeout(sv); dirty = true; sv = setTimeout(() => MODE == 'cloud' ? sync() : DB.save({ v: 2, tid, Q, I, T, D, S }), 300) };
$('#today').textContent = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
$('#reset').onclick = async () => { if (confirm('Erase ALL data and start from zero? This cannot be undone.')) { await DB.save(null); location.reload() } };
boot();
