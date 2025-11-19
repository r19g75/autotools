// ZARZĄDZANIE ZAKŁADKAMI
function switchTab(tabName) {
    // Ukryj wszystkie
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Pokaż wybraną
    document.getElementById(tabName).classList.add('active');
    
    // Znajdź i aktywuj przycisk
    document.querySelectorAll('.tab-btn').forEach(btn => {
        if(btn.getAttribute('onclick').includes(tabName)) {
            btn.classList.add('active');
        }
    });
}

// PRZELICZNIK CIŚNIENIA
function convertPressure() {
    const bar = parseFloat(document.getElementById('barInput').value) || 0;
    
    if(bar > 0) {
        document.getElementById('paResult').textContent = (bar * 100000).toFixed(0);
        document.getElementById('psiResult').textContent = (bar * 14.5038).toFixed(2);
        document.getElementById('mpaResult').textContent = (bar * 0.1).toFixed(3);
        
        // Podświetl wyniki
        document.getElementById('paDiv').classList.remove('empty');
        document.getElementById('psiDiv').classList.remove('empty');
        document.getElementById('mpaDiv').classList.remove('empty');
    }
}

// PRZELICZNIK PRZEPŁYWU
function convertFlow() {
    const value = parseFloat(document.getElementById('flowInput').value) || 0;
    const unit = document.getElementById('flowUnit').value;
    
    if(value > 0) {
        let m3h, lmin, cfm;
        
        switch(unit) {
            case 'm3h':
                m3h = value;
                lmin = value * 16.667;
                cfm = value * 0.5886;
                break;
            case 'lmin':
                lmin = value;
                m3h = value / 16.667;
                cfm = value * 0.03531;
                break;
            case 'cfm':
                cfm = value;
                m3h = value / 0.5886;
                lmin = value / 0.03531;
                break;
        }
        
        document.getElementById('m3hResult').textContent = m3h.toFixed(2);
        document.getElementById('lminResult').textContent = lmin.toFixed(2);
        document.getElementById('cfmResult').textContent = cfm.toFixed(2);
        
        // Podświetl wyniki
        document.getElementById('m3hDiv').classList.remove('empty');
        document.getElementById('lminDiv').classList.remove('empty');
        document.getElementById('cfmDiv').classList.remove('empty');
    }
}

// ZARZĄDZANIE MASZYNAMI
function showAddMachine() {
    document.getElementById('addMachineForm').style.display = 'block';
}

function hideAddMachine() {
    document.getElementById('addMachineForm').style.display = 'none';
    // Wyczyść formularz
    document.getElementById('machName').value = '';
    document.getElementById('machIP').value = '';
    document.getElementById('machPLC').value = '';
    document.getElementById('machLocation').value = '';
    document.getElementById('machNotes').value = '';
}

function saveMachine() {
    const machine = {
        id: Date.now(),
        name: document.getElementById('machName').value,
        ip: document.getElementById('machIP').value,
        plc: document.getElementById('machPLC').value,
        location: document.getElementById('machLocation').value,
        notes: document.getElementById('machNotes').value,
        added: new Date().toLocaleDateString('pl-PL')
    };
    
    // Pobierz istniejące
    let machines = JSON.parse(localStorage.getItem('machines') || '[]');
    machines.push(machine);
    localStorage.setItem('machines', JSON.stringify(machines));
    
    hideAddMachine();
    displayMachines();
}

function displayMachines() {
    const machines = JSON.parse(localStorage.getItem('machines') || '[]');
    const searchTerm = (document.getElementById('searchMachine')?.value || '').toLowerCase();
    
    const filtered = machines.filter(m => 
        m.name.toLowerCase().includes(searchTerm) ||
        m.ip.includes(searchTerm) ||
        m.location.toLowerCase().includes(searchTerm)
    );
    
    const list = document.getElementById('machineList');
    list.innerHTML = filtered.map(m => `
        <div class="machine-card">
            <h3>${m.name}</h3>
            <div>📍 ${m.location}</div>
            <div>🔌 ${m.plc}</div>
            <div>
                IP: ${m.ip}
                <button class="copy-btn" onclick="copyToClipboard('${m.ip}')">📋</button>
            </div>
            ${m.notes ? `<div style="margin-top:10px; color:#aaa;">${m.notes}</div>` : ''}
            <div style="margin-top:10px; display:flex; justify-content:space-between;">
                <small style="color:#666;">Dodano: ${m.added}</small>
                <button class="delete" onclick="deleteMachine(${m.id})">USUŃ</button>
            </div>
        </div>
    `).join('');
}

function deleteMachine(id) {
    if (confirm('Na pewno usunąć?')) {
        let machines = JSON.parse(localStorage.getItem('machines') || '[]');
        machines = machines.filter(m => m.id !== id);
        localStorage.setItem('machines', JSON.stringify(machines));
        displayMachines();
    }
}

function searchMachines() {
    displayMachines();
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(function() {
        // Znajdź przycisk który został kliknięty
        const btn = document.activeElement;
        const originalText = btn.textContent;
        btn.textContent = '✓';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 1000);
    }).catch(function(err) {
        // Fallback dla starszych przeglądarek
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    });
}

// KALKULATOR KABLI
function calculateCable() {
    const kw = parseFloat(document.getElementById('powerKW').value) || 0;
    const voltage = parseFloat(document.getElementById('voltage').value);
    const length = parseFloat(document.getElementById('cableLength').value) || 0;
    
    if(kw > 0) {
        // Prąd
        const current = voltage === 400 ? 
            (kw * 1000) / (voltage * 1.732 * 0.85) : // 3-fazowy
            (kw * 1000) / (voltage * 0.95); // 1-fazowy
        
        // Dobór przekroju (uproszczony)
        let cable = '1.5';
        if (current > 10) cable = '2.5';
        if (current > 16) cable = '4';
        if (current > 25) cable = '6';
        if (current > 32) cable = '10';
        if (current > 50) cable = '16';
        
        document.getElementById('cableResult').innerHTML = 
            `Prąd: ${current.toFixed(1)}A<br>
             Przekrój: ${cable} mm²<br>
             Zabezpieczenie: ${Math.ceil(current * 1.25)}A`;
        
        document.getElementById('cableResult').classList.remove('empty');
    }
}

// INFO O KABLACH
function showCableInfo() {
    const cableData = {
        '1.5': 'Max 10A | 2.3kW (3F) | 2.2kW (1F)',
        '2.5': 'Max 16A | 11kW (3F) | 3.6kW (1F)',
        '4': 'Max 25A | 17kW (3F) | 5.7kW (1F)',
        '6': 'Max 32A | 22kW (3F) | 7.3kW (1F)',
        '10': 'Max 50A | 34kW (3F) | 11.5kW (1F)',
        '16': 'Max 63A | 43kW (3F) | 14.5kW (1F)'
    };
    
    const selected = document.getElementById('cableType').value;
    if(selected) {
        document.getElementById('cableInfo').textContent = cableData[selected];
        document.getElementById('cableInfo').classList.remove('empty');
    } else {
        document.getElementById('cableInfo').textContent = '-';
        document.getElementById('cableInfo').classList.add('empty');
    }
}

// BACKUP/RESTORE
function backupData() {
    const data = {
        machines: JSON.parse(localStorage.getItem('machines') || '[]'),
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `autotools_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

function importData(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (data.machines) {
                localStorage.setItem('machines', JSON.stringify(data.machines));
                displayMachines();
                alert('Dane zaimportowane!');
            }
        } catch(err) {
            alert('Błąd importu!');
        }
    };
    reader.readAsText(file);
}

// SERVICE WORKER
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(function(registration) {
        console.log('Service Worker registered');
    });
}

// INICJALIZACJA
window.onload = function() {
    displayMachines();
}

// Enter key support dla przeliczników
document.addEventListener('DOMContentLoaded', function() {
    // Enter dla ciśnienia
    document.getElementById('barInput')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            convertPressure();
        }
    });
    
    // Enter dla przepływu
    document.getElementById('flowInput')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            convertFlow();
        }
    });
    
    // Enter dla kabli
    document.getElementById('cableLength')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            calculateCable();
        }
    });
});
