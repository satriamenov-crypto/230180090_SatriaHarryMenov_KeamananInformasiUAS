// Initialize Icons
lucide.createIcons();

// Target Doughnut Chart
const targetCtx = document.getElementById('targetChart').getContext('2d');
const targetChartInstance = new Chart(targetCtx, {
    type: 'doughnut',
    data: {
        datasets: [{
            data: [80, 20],
            backgroundColor: ['#1d4ed8', '#eff6ff'], // Blue-700 and Blue-50
            borderWidth: 0,
            circumference: 270,
            rotation: 225,
            cutout: '80%',
            borderRadius: 20
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            tooltip: { enabled: false },
            legend: { display: false }
        }
    }
});

// Thermal Fluctuation Line Chart
const lineCtx = document.getElementById('lineChart').getContext('2d');

// Gradient for line chart area
let gradient = lineCtx.createLinearGradient(0, 0, 0, 300);
gradient.addColorStop(0, 'rgba(37, 99, 235, 0.15)');
gradient.addColorStop(1, 'rgba(37, 99, 235, 0)');

const lineChartInstance = new Chart(lineCtx, {
    type: 'line',
    data: {
        labels: [], // Will be updated dynamically
        datasets: [{
            label: 'Temperature °C',
            data: [], // Will be updated dynamically
            borderColor: '#2563eb',
            backgroundColor: gradient,
            borderWidth: 3,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#ffffff',
            pointBorderColor: '#2563eb',
            pointBorderWidth: 2,
            pointRadius: 3,
            pointHoverRadius: 5
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1e293b',
                padding: 10,
                titleFont: { family: 'Outfit', size: 12 },
                bodyFont: { family: 'Outfit', size: 13, weight: 'bold' },
                displayColors: false,
                callbacks: {
                    label: function (context) {
                        return parseFloat(Number(context.parsed.y).toFixed(1)) + ' °C';
                    }
                }
            }
        },
        scales: {
            x: {
                grid: { display: false, drawBorder: false },
                ticks: { font: { family: 'Outfit', size: 10, weight: '500' }, color: '#94a3b8' }
            },
            y: {
                grid: { color: '#f1f5f9', drawBorder: false },
                border: { display: false },
                ticks: {
                    font: { family: 'Outfit', size: 10, weight: '500' },
                    color: '#94a3b8',
                    callback: function (value) { return parseFloat(Number(value).toFixed(1)) + '°C'; }
                },
                // min and max will adjust automatically if we remove them
            }
        },
            interaction: {
            intersect: false,
            mode: 'index',
        },
    }
});

function fleetBadge(t) {
    const isCrit = t > 30;
    return {
        cls: isCrit ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100',
        txt: isCrit ? 'CRITICAL' : 'STABLE',
        isCrit
    };
}

function fmtTime(isoStr) {
    const d = new Date(isoStr);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

const SUPABASE_URL = "https://pqeeujhjioclijlsafif.supabase.co/rest/v1/sensor_data?order=created_at.desc&limit=1000";
const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxZWV1amhqaW9jbGlqbHNhZmlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MjIwODIsImV4cCI6MjA5ODQ5ODA4Mn0.keY1b1XJe9ri3d-H4Eaj4dk0UivC7ppX-3my_DcGz7M";
const startTime = Date.now();

// updateData & setInterval defined below (with caching for all pages)

// ── Chart Filter ────────────────────────────────────────────────────
let chartFilterHours = 24;

function setChartFilter(hours, event) {
    chartFilterHours = hours;
    
    // Update UI buttons
    const buttons = event.target.parentElement.querySelectorAll('button');
    buttons.forEach(btn => {
        btn.classList.remove('bg-white', 'text-slate-800', 'shadow-sm');
        btn.classList.add('text-slate-500');
        btn.classList.remove('hover:text-slate-800'); // reset
        btn.classList.add('hover:text-slate-800');
    });
    
    event.target.classList.remove('text-slate-500', 'hover:text-slate-800');
    event.target.classList.add('bg-white', 'text-slate-800', 'shadow-sm');
    
    // Update Header
    const headerEl = event.target.closest('.flex-col, .bg-white').querySelector('h2');
    if (headerEl) {
        headerEl.innerText = hours === 1 ? 'Last 60 Minutes' : `Last ${hours} Hours`;
    }
    
    // Re-render chart
    updateChartWithFilter();
}

function updateChartWithFilter() {
    if (!_cachedData || !_cachedData.length) return;
    const now = new Date();
    const filteredData = _cachedData.filter(item => {
        const d = new Date(item.created_at);
        const diffHours = (now - d) / (1000 * 60 * 60);
        return diffHours <= chartFilterHours;
    });
    
    const chartData = [...filteredData].reverse();
    lineChartInstance.data.labels = chartData.map(item => fmtTime(item.created_at));
    
    // Gunakan deteksi kolom suhu (suhu atau temperature)
    lineChartInstance.data.datasets[0].data = chartData.map(item => {
        const tKey = 'suhu' in item ? 'suhu' : ('temperature' in item ? 'temperature' : Object.keys(item).find(k => k.toLowerCase().includes('temp') || k.toLowerCase().includes('suhu')));
        return parseFloat(item[tKey]);
    });
    
    lineChartInstance.update();
}

// ── Toast Notification ──────────────────────────────────────────────
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `px-4 py-3 rounded-lg shadow-lg text-sm font-medium flex items-center gap-3 transform transition-all duration-300 translate-y-10 opacity-0 bg-white border-l-4 ${type === 'info' ? 'border-blue-500 text-slate-700' : 'border-red-500 text-slate-700'}`;
    
    const icon = type === 'info' 
        ? '<i data-lucide="info" class="w-4 h-4 text-blue-500"></i>'
        : '<i data-lucide="alert-circle" class="w-4 h-4 text-red-500"></i>';
        
    toast.innerHTML = `${icon} <span>${message}</span>`;
    container.appendChild(toast);
    lucide.createIcons();
    
    // Animate in
    setTimeout(() => {
        toast.classList.remove('translate-y-10', 'opacity-0');
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.add('translate-y-10', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ── SPA Navigation ──────────────────────────────────────────────────
let analyticsChartInstance = null;

function navigateTo(page) {
    // Hide all pages
    document.getElementById('main-scroll').classList.add('hidden');
    ['analytics','sensors','reports','logs','settings','profile'].forEach(p => {
        const pageEl = document.getElementById('page-' + p);
        if (pageEl) pageEl.classList.add('hidden');
    });

    // Update sidebar active state
    document.querySelectorAll('.nav-link').forEach(a => {
        const isActive = a.dataset.page === page;
        a.classList.toggle('bg-blue-600', isActive);
        a.classList.toggle('text-white', isActive);
        a.classList.toggle('shadow-md', isActive);
        a.classList.toggle('shadow-blue-500/20', isActive);
        a.classList.toggle('text-slate-500', !isActive);
    });

    // Update header active state
    document.querySelectorAll('.header-link').forEach(a => {
        if (a.dataset.page) {
            const isActive = a.dataset.page === page;
            a.classList.toggle('text-blue-600', isActive);
            a.classList.toggle('border-blue-600', isActive);
            a.classList.toggle('text-slate-500', !isActive);
            a.classList.toggle('border-transparent', !isActive);
        }
    });

    if (page === 'dashboard') {
        document.getElementById('main-scroll').classList.remove('hidden');
    } else {
        const el = document.getElementById('page-' + page);
        if (el) el.classList.remove('hidden');
        if (page === 'analytics') renderAnalytics();
        if (page === 'reports') renderReports();
        if (page === 'logs') renderLogs();
        lucide.createIcons();
    }
}

// ── Settings Dropdown Menu ──────────────────────────────────────────
function toggleSettingsMenu(event) {
    if (event) {
        event.stopPropagation();
    }
    const menu = document.getElementById('settings-menu');
    if (menu) {
        menu.classList.toggle('hidden');
        lucide.createIcons();
    }
}

// Close settings menu when clicking outside
document.addEventListener('click', function(event) {
    const menu = document.getElementById('settings-menu');
    
    if (menu && !menu.classList.contains('hidden') && !menu.contains(event.target)) {
        menu.classList.add('hidden');
    }
});

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
    navigateTo('dashboard');
});

// Profile Picture Upload Handler
function handleProfileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const dataUrl = e.target.result;
            // Save to localStorage so it persists
            localStorage.setItem('profileImage_satria', dataUrl);
            
            // Update the images immediately
            const headerImg = document.getElementById('header-profile-img');
            const pageImg = document.getElementById('page-profile-img');
            if (headerImg) headerImg.src = dataUrl;
            if (pageImg) pageImg.src = dataUrl;
            
            showToast('Foto profil berhasil diperbarui!', 'success');
        };
        reader.readAsDataURL(file);
    }
}

// ── Shared data store ────────────────────────────────────────────────
let _cachedData = [];

async function updateData() {
    try {
        const fetchStart = performance.now();
        const res = await fetch(SUPABASE_URL, {
            headers: { "apikey": API_KEY, "Authorization": "Bearer " + API_KEY },
            cache: 'no-store'
        });
        const data = await res.json();
        const latency = Math.round(performance.now() - fetchStart);

        console.log('[Supabase] HTTP Status:', res.status, '| Jumlah baris:', Array.isArray(data) ? data.length : 'bukan array', '| Data:', data);

        // Handle Supabase error response (bukan array)
        if (!Array.isArray(data)) {
            const errMsg = data?.message || data?.error || JSON.stringify(data);
            console.error('[Supabase] Error response:', errMsg);
            document.getElementById('status-koneksi').innerText = `ERROR Supabase: ${errMsg}`;
            document.getElementById('status-koneksi').classList.add("text-red-500");
            return;
        }

        if (Array.isArray(data) && data.length > 0) {
            _cachedData = data;
            const latest = data[0];

            // Auto-detect nama kolom (suhu/temperature, kelembaban/humidity)
            const keys = Object.keys(latest);
            const tempKey = keys.find(k => k === 'suhu' || k === 'temperature' || k.toLowerCase().includes('temp') || k.toLowerCase().includes('suhu')) || 'suhu';
            const humKey  = keys.find(k => k === 'kelembaban' || k === 'humidity' || k.toLowerCase().includes('hum') || k.toLowerCase().includes('lem')) || 'kelembaban';

            console.log('[Supabase] Kolom terdeteksi → Suhu:', tempKey, '| Kelembaban:', humKey, '| Data terbaru:', latest);

            const temp = parseFloat(latest[tempKey]).toFixed(1);
            const hum  = parseFloat(latest[humKey]).toFixed(1);

            document.getElementById('suhu').innerText  = temp;
            document.getElementById('lembab').innerText = hum;

            const tempPct = Math.min(parseFloat(temp), 50) / 50 * 100;
            targetChartInstance.data.datasets[0].data = [tempPct, 100 - tempPct];
            targetChartInstance.update();

            const now = new Date();
            document.getElementById('status-koneksi').innerText = `Update terakhir: ${now.toLocaleTimeString()}`;
            document.getElementById('status-koneksi').classList.remove("text-red-500");

            updateChartWithFilter();

            const tbody = document.getElementById('fleet-tbody');
            const fleetCount = document.getElementById('fleet-count');
            if (tbody) {
                tbody.innerHTML = '';
                if (fleetCount) fleetCount.innerText = `${data.length} records`;
                data.forEach(item => {
                    const t    = parseFloat(item[tempKey]).toFixed(1);
                    const h    = parseFloat(item[humKey]).toFixed(1);
                    const tNum = parseFloat(t);
                    const { cls, txt, isCrit } = fleetBadge(tNum);
                    const row = document.createElement('tr');
                    row.className = 'border-b border-slate-100 hover:bg-slate-50 transition-colors';
                    row.innerHTML = `
                        <td class="py-3 font-mono text-slate-800 font-semibold">ID #${item.id}</td>
                        <td class="py-3 text-slate-600">${fmtTime(item.created_at)}</td>
                        <td class="py-3 text-center"><span class="px-2 py-0.5 ${cls} text-[9px] font-bold rounded border">${txt}</span></td>
                        <td class="py-3 text-center"><span class="${isCrit ? 'font-bold text-red-600' : 'font-semibold text-slate-800'}">${t}°C</span></td>
                        <td class="py-3 text-center text-slate-500 font-medium">${parseFloat(h).toFixed(0)}%</td>
                        <td class="py-3 text-right"><button onclick="showToast('Detail sensor #${item.id}', 'info')" class="text-slate-400 hover:text-blue-600"><i data-lucide="more-vertical" class="w-4 h-4 ml-auto"></i></button></td>
                    `;
                    tbody.appendChild(row);
                });
                lucide.createIcons();
            }

            const latencyEl = document.getElementById('latency-display');
            if (latencyEl) latencyEl.innerHTML = `${latency}<span class="text-xs text-slate-500 font-medium ml-0.5">ms</span>`;

            const elapsedMin = Math.floor((Date.now() - startTime) / 60000);
            const hh = Math.floor(elapsedMin / 60);
            const mm = elapsedMin % 60;
            const uptimeEl = document.getElementById('uptime-display');
            if (uptimeEl) uptimeEl.innerText = `${hh}h ${mm}m`;

            const rssiPct = Math.max(10, Math.min(100, Math.round(100 - latency * 0.12)));
            const rssiDbm = Math.round(-30 - (100 - rssiPct) * 0.6);
            const rssiLabelEl = document.getElementById('rssi-label');
            const rssiBarEl   = document.getElementById('rssi-bar');
            if (rssiLabelEl) rssiLabelEl.innerText = `${rssiDbm} dBm`;
            if (rssiBarEl)   rssiBarEl.style.width  = `${rssiPct}%`;

            const ipEl = document.getElementById('ip-display');
            if (ipEl) ipEl.innerText = 'pqeeujhjioclijlsafif.supabase.co';

            const st = document.getElementById('sen-temp');
            const sh = document.getElementById('sen-hum');
            const sn = document.getElementById('sen-total');
            const sl = document.getElementById('sen-latest-time');
            if (st) st.innerText = temp;
            if (sh) sh.innerText = hum;
            if (sn) sn.innerText = data.length;
            if (sl) sl.innerText = new Date(latest.created_at).toLocaleString('id-ID');

        } else if (Array.isArray(data) && data.length === 0) {
            console.warn('[Supabase] Tabel kosong atau RLS memblokir SELECT. Aktifkan policy SELECT untuk role anon di Supabase.');
            document.getElementById('status-koneksi').innerText = "Data kosong - Aktifkan RLS Policy SELECT di Supabase untuk anon!";
            document.getElementById('status-koneksi').classList.add("text-red-500");
        }
    } catch (err) {
        console.error('[Supabase] Fetch gagal:', err);
        document.getElementById('status-koneksi').innerText = `ERROR Fetch: ${err.message}`;
        document.getElementById('status-koneksi').classList.add("text-red-500");
    }
}

// ── Analytics Page ───────────────────────────────────────────────────
function renderAnalytics() {
    if (!_cachedData.length) return;
    
    // Auto detect keys for analytics
    const keys = Object.keys(_cachedData[0]);
    const tempKey = keys.find(k => k === 'suhu' || k === 'temperature' || k.toLowerCase().includes('temp') || k.toLowerCase().includes('suhu')) || 'suhu';
    const humKey  = keys.find(k => k === 'kelembaban' || k === 'humidity' || k.toLowerCase().includes('hum') || k.toLowerCase().includes('lem')) || 'kelembaban';
    
    const temps = _cachedData.map(d => parseFloat(d[tempKey] || 0));
    const hums  = _cachedData.map(d => parseFloat(d[humKey] || 0));
    
    document.getElementById('an-min').innerText  = Math.min(...temps).toFixed(1);
    document.getElementById('an-max').innerText  = Math.max(...temps).toFixed(1);
    document.getElementById('an-avg').innerText  = (temps.reduce((a,b)=>a+b,0)/temps.length).toFixed(1);
    document.getElementById('an-avg-hum').innerText = (hums.reduce((a,b)=>a+b,0)/hums.length).toFixed(1);

    const ctx = document.getElementById('analyticsChart').getContext('2d');
    if (analyticsChartInstance) analyticsChartInstance.destroy();
    
    const labels = [..._cachedData].reverse().map(d => fmtTime(d.created_at));
    const tData  = [...temps].reverse();
    const hData  = [...hums].reverse();
    
    analyticsChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                { label: 'Suhu (°C)', data: tData, borderColor: '#2563eb', backgroundColor: 'rgba(37,99,235,0.08)', borderWidth: 2, tension: 0.4, fill: true, pointRadius: 0 },
                { label: 'Kelembaban (%)', data: hData, borderColor: '#14b8a6', backgroundColor: 'rgba(20,184,166,0.08)', borderWidth: 2, tension: 0.4, fill: true, pointRadius: 0 }
            ]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            plugins: { 
                legend: { position: 'top' },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return context.dataset.label + ': ' + parseFloat(Number(context.parsed.y).toFixed(1));
                        }
                    }
                }
            }, 
            scales: { 
                x: { ticks: { maxTicksLimit: 12, font: { size: 10 } } },
                y: {
                    ticks: {
                        callback: function (value) { return parseFloat(Number(value).toFixed(1)); }
                    }
                }
            } 
        }
    });
}

// ── Reports Page ─────────────────────────────────────────────────────
function renderReports() {
    if (!_cachedData.length) return;
    
    // Auto detect keys
    const keys = Object.keys(_cachedData[0]);
    const tempKey = keys.find(k => k === 'suhu' || k === 'temperature' || k.toLowerCase().includes('temp') || k.toLowerCase().includes('suhu')) || 'suhu';
    const humKey  = keys.find(k => k === 'kelembaban' || k === 'humidity' || k.toLowerCase().includes('hum') || k.toLowerCase().includes('lem')) || 'kelembaban';
    
    const tbody = document.getElementById('rep-tbody');
    const count = document.getElementById('rep-count');
    tbody.innerHTML = '';
    if (count) count.innerText = `${_cachedData.length} total records`;
    _cachedData.forEach(item => {
        const d = new Date(item.created_at);
        const t = parseFloat(item[tempKey]).toFixed(1);
        const h = parseFloat(item[humKey]).toFixed(1);
        const isCrit = parseFloat(t) > 30;
        const row = document.createElement('tr');
        row.className = 'border-b border-slate-100 hover:bg-slate-50 transition-colors';
        row.innerHTML = `
            <td class="px-5 py-3 font-mono font-semibold text-slate-800">#${item.id}</td>
            <td class="px-5 py-3 text-slate-600">${d.toLocaleDateString('id-ID')}</td>
            <td class="px-5 py-3 text-slate-600">${d.toLocaleTimeString('id-ID')}</td>
            <td class="px-5 py-3 text-center font-bold ${isCrit ? 'text-red-600' : 'text-slate-800'}">${t}</td>
            <td class="px-5 py-3 text-center text-teal-600 font-semibold">${h}</td>
            <td class="px-5 py-3 text-center"><span class="px-2 py-0.5 ${isCrit ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'} text-[9px] font-bold rounded border">${isCrit ? 'CRITICAL' : 'STABLE'}</span></td>
        `;
        tbody.appendChild(row);
    });
}

// ── Logs Page ────────────────────────────────────────────────────────
function renderLogs() {
    if (!_cachedData.length) return;
    
    const keys = Object.keys(_cachedData[0]);
    const tempKey = keys.find(k => k === 'suhu' || k === 'temperature' || k.toLowerCase().includes('temp') || k.toLowerCase().includes('suhu')) || 'suhu';
    const humKey  = keys.find(k => k === 'kelembaban' || k === 'humidity' || k.toLowerCase().includes('hum') || k.toLowerCase().includes('lem')) || 'kelembaban';
    
    const container = document.getElementById('log-content');
    container.innerHTML = '';
    _cachedData.forEach(item => {
        const d = new Date(item.created_at);
        const ts = d.toLocaleString('id-ID');
        const t = parseFloat(item[tempKey]).toFixed(1);
        const h = parseFloat(item[humKey]).toFixed(1);
        const isCrit = parseFloat(t) > 30;
        const div = document.createElement('div');
        div.className = 'flex gap-3';
        div.innerHTML = `
            <span class="text-slate-500 shrink-0">[${ts}]</span>
            <span class="text-green-400">INFO</span>
            <span class="text-slate-300">ID:<span class="text-yellow-300">#${item.id}</span> suhu=<span class="${isCrit ? 'text-red-400' : 'text-cyan-300'}">${t}°C</span> kelembaban=<span class="text-teal-300">${h}%</span> status=<span class="${isCrit ? 'text-red-400 font-bold' : 'text-green-400'}">${isCrit ? 'CRITICAL' : 'OK'}</span></span>
        `;
        container.appendChild(div);
    });
}

// ── Export CSV ───────────────────────────────────────────────────────
function exportCSV() {
    if (!_cachedData.length) return;
    
    const keys = Object.keys(_cachedData[0]);
    const tempKey = keys.find(k => k === 'suhu' || k === 'temperature' || k.toLowerCase().includes('temp') || k.toLowerCase().includes('suhu')) || 'suhu';
    const humKey  = keys.find(k => k === 'kelembaban' || k === 'humidity' || k.toLowerCase().includes('hum') || k.toLowerCase().includes('lem')) || 'kelembaban';
    
    let csv = 'ID,Tanggal,Waktu,Suhu (C),Kelembaban (%),Status\n';
    _cachedData.forEach(item => {
        const d = new Date(item.created_at);
        const t = parseFloat(item[tempKey]);
        const h = parseFloat(item[humKey]);
        const isCrit = t > 30;
        csv += `${item.id},${d.toLocaleDateString('id-ID')},${d.toLocaleTimeString('id-ID')},${t.toFixed(1)},${h.toFixed(1)},${isCrit ? 'CRITICAL' : 'STABLE'}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'sensor_data.csv'; a.click();
    URL.revokeObjectURL(url);
}

const firebaseConfig = {
    apiKey: "AIzaSyCzK3vNyfYEzwsy2uMewCHVzOtsKQKUaec",
    authDomain: "keamanan-satria.firebaseapp.com",
    databaseURL: "https://keamanan-satria-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "keamanan-satria",
    storageBucket: "keamanan-satria.firebasestorage.app",
    messagingSenderId: "617561225556",
    appId: "1:617561225556:web:3ac65ff64abb287c71f0c1",
    measurementId: "G-L9DGVX8020"
};
firebase.initializeApp(firebaseConfig);

let dataInterval;

let dataStarted = false;

function startDataFetch() {
    if (dataStarted) return;
    dataStarted = true;
    console.log('[Auth] Memulai fetch data Supabase...');
    updateData();
    if (!dataInterval) {
        dataInterval = setInterval(updateData, 3000);
    }
}

// KUNCI HALAMAN GLOBAL
firebase.auth().onAuthStateChanged((user) => {
    console.log('[Firebase Auth] State changed:', user ? 'LOGIN → ' + user.email : 'TIDAK LOGIN');
    if (!user) {
        window.location.href = 'login.html';
    } else {
        // Update user profile info
        const emailEl = document.getElementById('profile-email');
        const joinedEl = document.getElementById('profile-joined');
        const nameEl = document.getElementById('profile-name');
        
        if (emailEl) emailEl.innerText = user.email || 'Tidak ada email';
        if (nameEl && user.displayName) nameEl.innerText = user.displayName;
        if (joinedEl && user.metadata && user.metadata.creationTime) {
            const date = new Date(user.metadata.creationTime);
            joinedEl.innerText = date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
        } else if (joinedEl) {
            joinedEl.innerText = 'Tidak diketahui';
        }

        // Load custom profile picture if exists
        const savedImage = localStorage.getItem('profileImage_satria');
        if (savedImage) {
            const headerImg = document.getElementById('header-profile-img');
            const pageImg = document.getElementById('page-profile-img');
            if (headerImg) headerImg.src = savedImage;
            if (pageImg) pageImg.src = savedImage;
        }

        startDataFetch();
    }
});

// Fallback: jika Firebase Auth lambat (>4 detik), tetap jalankan data fetch
// Ini mencegah dashboard kosong jika sesi Firebase lambat ter-verifikasi
setTimeout(() => {
    if (!dataStarted) {
        console.warn('[Auth] Firebase Auth timeout - mencoba fetch data langsung...');
        startDataFetch();
    }
}, 4000);

function logoutFirebase() {
    firebase.auth().signOut().then(() => {
        window.location.href = 'login.html';
    });
}
