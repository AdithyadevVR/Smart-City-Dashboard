// ===== GLOBAL STATE =====
let currentPage = 'overview';
let allAlerts = [];
let chartInstances = {};

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  applyRoleUI();
  initTopbar();
  initTheme();
  startClock();
  navigate('overview');
  setInterval(refreshCurrentPage, 30000);
});

function initTopbar() {
  const user = getUser();
  if (!user) return;
  document.getElementById('userName').textContent = user.name;
  document.getElementById('userRoleBadge').textContent = user.role;
  const initials = user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2);
  document.getElementById('userAvatar').textContent = initials;
}

function initTheme() {
  const saved = localStorage.getItem('sc-theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  document.getElementById('themeToggle').textContent = saved === 'dark' ? '☀️' : '🌙';

  document.getElementById('themeToggle').addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme');
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('sc-theme', next);
    document.getElementById('themeToggle').textContent = next === 'dark' ? '☀️' : '🌙';
    // Redraw charts for theme
    Object.values(chartInstances).forEach(c => { try { c.destroy(); } catch {} });
    chartInstances = {};
    refreshCurrentPage();
  });
}

function startClock() {
  const clockEl = document.getElementById('clock');
  function tick() {
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString('en-US', { hour12: false });
  }
  tick();
  setInterval(tick, 1000);
}

// ===== NAVIGATION =====
function navigate(page) {
  currentPage = page;

  document.querySelectorAll('.module-page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const pageEl = document.getElementById(`page-${page}`);
  if (pageEl) pageEl.classList.add('active');

  const navEl = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (navEl) navEl.classList.add('active');

  refreshCurrentPage();
}

function refreshCurrentPage() {
  document.getElementById('lastUpdated').textContent = new Date().toLocaleTimeString();
  switch(currentPage) {
    case 'overview': loadOverview(); break;
    case 'traffic': loadTraffic(); break;
    case 'weather': loadWeather(); break;
    case 'energy': loadEnergy(); break;
    case 'waste': loadWaste(); break;
    case 'water': loadWater(); break;
    case 'alerts': loadAlerts(); break;
    case 'admin': loadAdminTab(); break;
  }
}

// ===== OVERVIEW =====
async function loadOverview() {
  try {
    const [traffic, weather, energy, waste, water, alerts] = await Promise.all([
      apiFetch('/api/traffic'),
      apiFetch('/api/weather'),
      apiFetch('/api/energy'),
      apiFetch('/api/waste'),
      apiFetch('/api/water'),
      apiFetch('/api/alerts')
    ]);

    allAlerts = alerts;
    updateAlertCount(alerts.length);
    updateTicker(alerts);

    // KPIs
    const avgCongestion = avg(traffic, 'congestionLevel');
    const avgTemp = avg(weather, 'temperature');
    const avgLoad = avg(energy, d => (d.currentLoad / d.maxCapacity) * 100);
    const avgBin = avg(waste, 'binFillLevel');
    const avgReservoir = avg(water, 'reservoirLevel');

    setText('kpi-traffic', Math.round(avgCongestion));
    setText('kpi-temp', `${Math.round(avgTemp)}°`);
    setText('kpi-energy', `${Math.round(avgLoad)}%`);
    setText('kpi-waste', `${Math.round(avgBin)}%`);
    setText('kpi-water', `${Math.round(avgReservoir)}%`);

    setKPIChange('kpi-traffic-change', avgCongestion, 50, false, 'congestion');
    setKPIChange('kpi-energy-change', avgLoad, 70, false, 'grid load');
    setKPIChange('kpi-waste-change', avgBin, 60, false, 'fill level');
    setKPIChange('kpi-water-change', avgReservoir, 40, true, 'reservoir');
    setText('kpi-weather-change', `Avg ${Math.round(avg(weather,'humidity'))}% humidity`);

    // Health score
    const healthScore = calcHealthScore(avgCongestion, avgLoad, avgBin, avgReservoir);
    const healthBadge = document.getElementById('healthBadge');
    if (healthScore > 70) { healthBadge.textContent = '✓ Good'; healthBadge.className = 'badge badge-success'; }
    else if (healthScore > 45) { healthBadge.textContent = '⚠ Fair'; healthBadge.className = 'badge badge-warning'; }
    else { healthBadge.textContent = '✕ Poor'; healthBadge.className = 'badge badge-danger'; }

    drawOverviewRadar(avgCongestion, avgTemp, avgLoad, avgBin, avgReservoir);
    renderOverviewAlerts(alerts);
    renderOverviewModuleCards(traffic, weather, energy, waste, water);

  } catch(err) {
    console.error('Overview load error:', err);
  }
}

function avg(arr, key) {
  if (!arr || !arr.length) return 0;
  const vals = arr.map(d => typeof key === 'function' ? key(d) : d[key]).filter(v => v != null);
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function calcHealthScore(cong, load, bin, reservoir) {
  return 100 - (cong * 0.3 + Math.max(0, load - 50) * 0.4 + bin * 0.2 + Math.max(0, 60 - reservoir) * 0.1);
}

function setKPIChange(id, val, threshold, higherIsBetter, label) {
  const el = document.getElementById(id);
  if (!el) return;
  const good = higherIsBetter ? val >= threshold : val < threshold;
  el.className = `kpi-change ${good ? 'up' : 'down'}`;
  el.textContent = good ? `↑ ${label} normal` : `↓ ${label} elevated`;
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function updateAlertCount(n) {
  document.getElementById('notifCount').textContent = n;
  document.getElementById('sidebarAlertCount').textContent = n;
}

function updateTicker(alerts) {
  if (!alerts.length) { document.getElementById('tickerText').textContent = 'All systems operating normally'; return; }
  let i = 0;
  function rotate() {
    const a = alerts[i % alerts.length];
    document.getElementById('tickerText').textContent = `${a.module}: ${a.message}`;
    i++;
  }
  rotate();
  clearInterval(window._tickerInterval);
  window._tickerInterval = setInterval(rotate, 4000);
}

function renderOverviewAlerts(alerts) {
  const el = document.getElementById('overviewAlertsList');
  if (!alerts.length) { el.innerHTML = '<div style="color:var(--text-tertiary);font-size:0.875rem;text-align:center;padding:20px;">No active alerts 🎉</div>'; return; }
  el.innerHTML = alerts.slice(0, 6).map(a => `
    <div style="display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid var(--border);">
      <span class="badge ${severityBadge(a.severity)}" style="flex-shrink:0;margin-top:2px;">${a.severity}</span>
      <div>
        <div style="font-size:0.85rem;font-weight:600;">${a.module}</div>
        <div style="font-size:0.8rem;color:var(--text-secondary);">${a.message}</div>
      </div>
    </div>
  `).join('');
}

function severityBadge(s) {
  return s === 'critical' ? 'badge-danger' : s === 'warning' ? 'badge-warning' : 'badge-info';
}

function renderOverviewModuleCards(traffic, weather, energy, waste, water) {
  const el = document.getElementById('overviewModuleCards');
  const cards = [
    { icon: '🚦', title: 'Traffic', color: 'blue', val: `${Math.round(avg(traffic,'congestionLevel'))}%`, sub: 'Avg congestion', page: 'traffic' },
    { icon: '🌤️', title: 'Weather', color: 'green', val: `${Math.round(avg(weather,'temperature'))}°C`, sub: `${weather[0]?.condition || '--'}`, page: 'weather' },
    { icon: '⚡', title: 'Energy', color: 'orange', val: `${Math.round(avg(energy,'renewablePercent'))}%`, sub: 'Renewable energy', page: 'energy' },
    { icon: '🗑️', title: 'Waste', color: 'red', val: `${Math.round(avg(waste,'recyclingPercent'))}%`, sub: 'Recycling rate', page: 'waste' },
    { icon: '💧', title: 'Water', color: 'purple', val: `${Math.round(avg(water,'waterQuality'))}`, sub: 'Quality score', page: 'water' },
  ];
  el.innerHTML = cards.map((c, i) => `
    <div class="kpi-card ${c.color} animate-fade" style="animation-delay:${i*0.08}s;cursor:pointer;" onclick="navigate('${c.page}')">
      <div class="kpi-icon">${c.icon}</div>
      <div class="kpi-value">${c.val}</div>
      <div class="kpi-label">${c.title} — ${c.sub}</div>
      <div class="kpi-change up" style="margin-top:12px;">→ View module</div>
    </div>
  `).join('');
}

function drawOverviewRadar(cong, temp, load, bin, reservoir) {
  const ctx = document.getElementById('overviewRadarChart')?.getContext('2d');
  if (!ctx) return;
  if (chartInstances.radar) chartInstances.radar.destroy();
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  chartInstances.radar = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['Traffic', 'Temperature', 'Energy', 'Waste', 'Water'],
      datasets: [{
        label: 'City Health',
        data: [
          100 - cong,
          Math.min(100, temp + 20),
          100 - load,
          100 - bin,
          reservoir
        ],
        backgroundColor: 'rgba(26,86,219,0.15)',
        borderColor: '#1a56db',
        pointBackgroundColor: '#1a56db',
        pointRadius: 4,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        r: {
          min: 0, max: 100,
          ticks: { display: false },
          grid: { color: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)' },
          angleLines: { color: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)' },
          pointLabels: { color: isDark ? '#94a3b8' : '#475569', font: { size: 12, weight: '500' } }
        }
      }
    }
  });
}

// ===== ALERTS PAGE =====
async function loadAlerts() {
  try {
    const alerts = await apiFetch('/api/alerts');
    allAlerts = alerts;
    updateAlertCount(alerts.length);
    const el = document.getElementById('alertsContainer');
    if (!alerts.length) {
      el.innerHTML = '<div class="card"><div class="card-body" style="text-align:center;padding:40px;"><div style="font-size:3rem;margin-bottom:16px;">🎉</div><h3>No Active Alerts</h3><p style="color:var(--text-secondary);margin-top:8px;">All city systems are operating normally.</p></div></div>';
      return;
    }
    el.innerHTML = `<div style="display:flex;flex-direction:column;gap:12px;">` +
      alerts.map(a => `
        <div class="card" style="border-left: 4px solid ${severityColor(a.severity)};">
          <div class="card-body" style="display:flex;align-items:center;gap:16px;">
            <span style="font-size:1.5rem;">${moduleIcon(a.module)}</span>
            <div style="flex:1;">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                <span class="badge ${severityBadge(a.severity)}">${a.severity}</span>
                <strong style="font-size:0.875rem;">${a.module}</strong>
                ${a.district ? `<span style="font-size:0.78rem;color:var(--text-tertiary);">· ${a.district}</span>` : ''}
              </div>
              <p style="font-size:0.875rem;color:var(--text-secondary);">${a.message}</p>
              <p style="font-size:0.75rem;color:var(--text-tertiary);margin-top:4px;">${new Date(a.createdAt).toLocaleString()}</p>
            </div>
            ${isAdmin() ? `<button class="btn btn-success btn-sm" onclick="resolveAlert('${a._id}')">✓ Resolve</button>` : ''}
          </div>
        </div>
      `).join('') + `</div>`;
  } catch(err) { console.error(err); }
}

async function resolveAlert(id) {
  try {
    await apiFetch(`/api/alerts/${id}/resolve`, { method: 'PUT' });
    showToast('Alert resolved successfully', 'success');
    loadAlerts();
  } catch(err) { showToast(err.message, 'error'); }
}

function severityColor(s) { return s === 'critical' ? '#dc2626' : s === 'warning' ? '#d97706' : '#0891b2'; }
function moduleIcon(m) {
  const icons = { Traffic: '🚦', Weather: '🌤️', Energy: '⚡', Waste: '🗑️', Water: '💧', System: '⚙️' };
  return icons[m] || '🔔';
}

// Chart color helpers
function chartColors(isDark) {
  return {
    grid: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    text: isDark ? '#94a3b8' : '#475569'
  };
}

function loadAdminTab() {
  if (isAdmin()) {
    loadUsers();
    loadMetricsTable();
    loadAdminAlerts();
  }
}
