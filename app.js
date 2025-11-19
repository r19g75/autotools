// =========================================================
//  AutoTools – app.js  (wersja naprawiona pod Android/iOS)
// =========================================================

// ZARZĄDZANIE ZAKŁADKAMI
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

    document.getElementById(tabName).classList.add('active');

    document.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.getAttribute('onclick')?.includes(tabName)) btn.classList.add('active');
    });
}

// PRZELICZNIK CIŚNIENIA
function convertPressure() {
    const bar = parseFloat(document.getElementById('barInput').value) || 0;
    document.getElementById('paResult').textContent  = (bar * 100000).toFixed(0);
    document.getElementById('psiResult').textContent = (bar * 14.5038).toFixed(2);
    document.getElementById('mpaResult').textContent = (bar * 0.1).toFixed(3);
}

// PRZELICZNIK PRZEPŁYWU
function convertFlow() {
    const value = parseFloat(document.getElementById('flowInput').value) || 0;
    const unit  = document.getElementById('flowUnit').value;

    let m3h, lmin, cfm;
    switch (unit) {
        case 'm3h': m3h = value; lmin = value * 16.667; cfm = value * 0.5886; break;
        case 'lmin': lmin = value; m3h = value / 16.667; cfm = value * 0.03531; break;
        case 'cfm': cfm = value; m3h = value / 0.5886; lmin = value / 0.03531; break;
    }
    document.getElementById('m3hResult').textContent = m3h.toFixed(2);
    document.getElementById('lminResult').textContent = lmin.toFixed(2);
    document.getElementById('cfmResult').textContent  = cfm.toFixed(2);
}

// MASZYNY – FORMULARZ
function showAddMachine() { document.getElementById('addMachineForm').style.display = 'block'; }
function hideAddMachine() {
    document.getElementById('addMachineForm').style.display = 'none';
    ['machName','machIP','machPLC','machLocation','machNotes']
        .forEach(id => document.getElementById(id).value = '');
}

function saveMachine() {
    const machine = {
        id: Date.now(),
        name: document.getElementById('machName').value,
        ip:   document.getElementById('machIP').value,
        plc:  document.getElementById('machPLC').value,
        location: document.getElementById('machLocation').value,
        notes:    document.getElementById('machNotes').value,
        added: new Date().toLocaleDateString('pl-PL')
    };
    const machines = JSON.parse(localStorage.getItem('machines') || '[]');
    machines.push(machine);
    localStorage.setItem('machines', JSON.stringify(machines));
    hideAddMachine(); displayMachines();
}

function displayMachines() {
    const machines   = JSON.parse(localStorage.getItem('machines') || '[]');
    const searchTerm = (document.getElementById('searchMachine')?.value || '').toLowerCase();
    const filtered   = machines.filter(m =>
        m.name.toLowerCase().includes(searchTerm) ||
        m.ip.includes(searchTerm) ||
        m.location.toLowerCase().includes(searchTerm)
    );
    document.getElementById('machineList').innerHTML = filtered.map(m => `
        <div class="machine-card">
            <h3>${m.name}</h3>
            <div>📍 ${m.location}</div><div>🔌 ${m.plc}</div>
            <div>IP: ${m.ip}
                <button class="copy-btn" onclick="copyToClipboard('${m.ip}')">📋</button>
            </div>
            ${m.notes ? `<div style="margin-top:10px;color:#aaa;">${m.notes}</div>`:''}
            <div style="margin-top:10px;display:flex;justify-content:space-between;">
                <small style="color:#666;">Dodano: ${m.added}</small>
                <button class="delete" onclick="deleteMachine(${m.id})">USUŃ</button>
            </div>
        </div>`).join('');
}

function deleteMachine(id) {
    if (!confirm('Na pewno usunąć?')) return;
    const machines = JSON.parse(localStorage.getItem('machines') || '[]')
                         .filter(m => m.id !== id);
    localStorage.setItem('machines', JSON.stringify(machines));
    displayMachines();
}
function searchMachines() { displayMachines(); }

// COPY CLIPBOARD
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        const btn = document.activeElement;
        const org = btn.textContent; btn.textContent = '✓';
        setTimeout(() => btn.textContent = org, 1000);
    }).catch(() => { // fallback
        const ta = document.createElement('textarea'); ta.value = text;
        document.body.appendChild(ta); ta.select(); document.execCommand('copy');
        document.body.removeChild(ta);
    });
}

// KALKULATOR KABLI
function calculateCable() {
    const kw  = parseFloat(document.getElementById('powerKW').value) || 0;
    const v   = parseFloat(document.getElementById('voltage').value);
    const len = parseFloat(document.getElementById('cableLength').value) || 0;

    const curr = v === 400 ?
        (kw * 1000) / (v * 1.732 * 0.85) :
        (kw * 1000) / (v * 0.95);

    let cable = '1.5';
    if (curr > 10) cable = '2.5';
    if (curr > 16) cable = '4';
    if (curr > 25) cable = '6';
    if (curr > 32) cable = '10';
    if (curr > 50) cable = '16';

    document.getElementById('cableResult').innerHTML =
        `Prąd: ${curr.toFixed(1)}A<br>
         Przekrój: ${cable} mm²<br>
         Zabezpieczenie: ${Math.ceil(curr * 1.25)}A`;
}

function showCableInfo() {
    const data = {
        '1.5':'Max 10A | 2.3kW (3F) | 2.2kW (1F)',
        '2.5':'Max 16A | 11kW (3F) | 3.6kW (1F)',
        '4':'Max 25A | 17kW (3F) | 5.7kW (1F)',
        '6':'Max 32A | 22kW (3F) | 7.3kW (1F)',
        '10':'Max 50A | 34kW (3F) | 11.5kW (1F)',
        '16':'Max 63A | 43kW (3F) | 14.5kW (1F)'
    };
    const sel = document.getElementById('cableType').value;
    document.getElementById('cableInfo').textContent = sel ? data[sel] : '-';
}

// BACKUP / RESTORE
function backupData() {
    const data = {
        machines: JSON.parse(localStorage.getItem('machines') || '[]'),
        exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
    const a    = document.createElement('a');
    a.href     = URL.createObjectURL(blob);
    a.download = `autotools_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
}
function importData(file) {
    const r = new FileReader();
    r.onload = e => {
        try {
            const data = JSON.parse(e.target.result);
            if (data.machines) {
                localStorage.setItem('machines', JSON.stringify(data.machines));
                displayMachines(); alert('Dane zaimportowane!');
            }
        } catch { alert('Błąd importu!'); }
    };
    r.readAsText(file);
}

// SERVICE WORKER
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(r => console.log('SW registered'));
}

// --------- FIX: klawiatura nie znika na telefonie ---------
document.addEventListener('DOMContentLoaded', () => {
    displayMachines();

    // nie zabieraj focusa inputom
    document.querySelectorAll('input, select, textarea').forEach(el => {
        el.addEventListener('touchstart', e => e.stopPropagation(), {passive:true});
        el.addEventListener('touchend',   e => e.stopPropagation(), {passive:true});
    });
});

// Blokuj tylko pull-to-refresh, nie cały touchmove
let lastTouchY = 0;
document.addEventListener('touchstart', e => {
    lastTouchY = e.touches[0].clientY;
}, {passive:true});

document.addEventListener('touchmove', e => {
    const touchY  = e.touches[0].clientY;
    const scrollT = document.documentElement.scrollTop || document.body.scrollTop;

    if (scrollT === 0 && touchY > lastTouchY + 5) e.preventDefault(); // tylko pull-down
    lastTouchY = touchY;
}, {passive:false});
