let energyData = [];

async function loadEnergy() {
  try {
    energyData = await apiFetch('/api/energy');
    renderEnergyKPIs(energyData);
    drawEnergyLoadChart(energyData);
    drawEnergyDonut(energyData);
    renderEnergyDistricts(energyData);
    if (isAdmin()) renderEnergyControls(energyData);
  } catch(err) { console.error('Energy load error:', err); }
}

function renderEnergyKPIs(data) {
  const el = document.getElementById('energyKPIRow');
  if (!el) return;
  const totalLoad = data.reduce((s, d) => s + d.currentLoad, 0);
  const totalCap = data.reduce((s, d) => s + d.maxCapacity, 0);
  const avgRenewable = Math.round(data.reduce((s, d) => s + d.renewablePercent, 0) / data.length);
  const totalConsumption = data.reduce((s, d) => s + d.consumption, 0);
  const loadPercent = Math.round((totalLoad / totalCap) * 100);

  el.innerHTML = `
    <div class="kpi-card orange">
      <div class="kpi-icon">⚡</div>
      <div class="kpi-value">${totalLoad.toLocaleString()} MW</div>
      <div class="kpi-label">Total Grid Load</div>
      <div class="kpi-change ${loadPercent < 80 ? 'up' : 'down'}">${loadPercent}% of capacity</div>
    </div>
    <div class="kpi-card green">
      <div class="kpi-icon">🌿</div>
      <div class="kpi-value">${avgRenewable}%</div>
      <div class="kpi-label">Renewable Energy</div>
      <div class="kpi-change up">Solar + Wind combined</div>
    </div>
    <div class="kpi-card blue">
      <div class="kpi-icon">📊</div>
      <div class="kpi-value">${(totalConsumption/1000).toFixed(1)} GWh</div>
      <div class="kpi-label">Today's Consumption</div>
      <div class="kpi-change up">Across all districts</div>
    </div>
  `;
}

function drawEnergyLoadChart(data) {
  const ctx = document.getElementById('energyLoadChart')?.getContext('2d');
  if (!ctx || !data.length) return;
  if (chartInstances.energyLoad) chartInstances.energyLoad.destroy();
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const { grid, text } = chartColors(isDark);

  const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2,'0')}:00`);
  const aggregated = hours.map((_, h) => {
    const total = data.reduce((s, d) => s + (d.hourlyData?.find(hd => hd.hour === h)?.load || 0), 0);
    const renewable = data.reduce((s, d) => s + (d.hourlyData?.find(hd => hd.hour === h)?.renewable || 0), 0);
    return { total, renewable };
  });

  chartInstances.energyLoad = new Chart(ctx, {
    type: 'line',
    data: {
      labels: hours,
      datasets: [
        {
          label: 'Total Load (MW)',
          data: aggregated.map(d => d.total),
          borderColor: '#f97316',
          backgroundColor: 'rgba(249,115,22,0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4
        },
        {
          label: 'Renewable (MW)',
          data: aggregated.map(d => d.renewable),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16,185,129,0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { labels: { color: text, font: { size: 11 } } } },
      scales: {
        x: { ticks: { color: text, font: { size: 10 }, maxTicksLimit: 12 }, grid: { color: grid } },
        y: { ticks: { color: text }, grid: { color: grid } }
      }
    }
  });
}

function drawEnergyDonut(data) {
  const ctx = document.getElementById('energyDonut')?.getContext('2d');
  if (!ctx || !data.length) return;
  if (chartInstances.energyDonut) chartInstances.energyDonut.destroy();
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

  const totalSolar = data.reduce((s, d) => s + d.solarOutput, 0);
  const totalWind = data.reduce((s, d) => s + d.windOutput, 0);
  const totalGrid = data.reduce((s, d) => s + d.gridImport, 0);
  const other = Math.max(0, data.reduce((s, d) => s + d.currentLoad, 0) - totalSolar - totalWind - totalGrid);

  chartInstances.energyDonut = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Solar', 'Wind', 'Grid Import', 'Other'],
      datasets: [{
        data: [totalSolar, totalWind, totalGrid, other],
        backgroundColor: ['#f59e0b', '#60a5fa', '#a78bfa', '#94a3b8'],
        borderWidth: 0,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: false,
      cutout: '68%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: isDark ? '#94a3b8' : '#475569', font: { size: 11 }, padding: 12, boxWidth: 12 }
        }
      }
    }
  });
}

function renderEnergyDistricts(data) {
  const el = document.getElementById('energyDistrictList');
  if (!el) return;
  el.innerHTML = data.map(d => {
    const pct = Math.round((d.currentLoad / d.maxCapacity) * 100);
    const color = pct > 90 ? '#ef4444' : pct > 75 ? '#f97316' : '#10b981';
    return `
      <div class="district-item">
        <div class="district-info">
          <div class="district-name">${d.district}</div>
          <div class="district-sub">${d.currentLoad} / ${d.maxCapacity} MW · ${d.status}</div>
        </div>
        <div class="district-bar-wrap">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
            <span style="font-size:0.72rem;color:var(--text-tertiary);">Load</span>
            <span style="font-size:0.72rem;font-weight:600;color:${color};">${pct}%</span>
          </div>
          <div class="district-bar-bg" style="height:8px;">
            <div class="district-bar-fill" style="width:${pct}%;background:${color};"></div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderEnergyControls(data) {
  const card = document.getElementById('energyControlsCard');
  const el = document.getElementById('energyControlsBody');
  if (!card || !el) return;
  card.classList.remove('hidden');
  el.innerHTML = `
    <div style="margin-bottom:12px;">
      <div style="font-size:0.85rem;font-weight:600;margin-bottom:8px;">District Status Override</div>
      ${data.map(d => `
        <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);">
          <span style="flex:1;font-size:0.85rem;">${d.district}</span>
          <span class="badge ${d.status === 'normal' ? 'badge-success' : d.status === 'high' ? 'badge-warning' : 'badge-danger'}">${d.status}</span>
          <button class="btn btn-secondary btn-sm" onclick="updateEnergyStatus('${d._id}', '${d.status}')">Update</button>
        </div>
      `).join('')}
    </div>
  `;
}

async function updateEnergyStatus(id, currentStatus) {
  const statuses = ['normal', 'high', 'critical'];
  const nextStatus = statuses[(statuses.indexOf(currentStatus) + 1) % statuses.length];
  try {
    await apiFetch(`/api/energy/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: nextStatus })
    });
    showToast(`Status updated to ${nextStatus}`, 'success');
    loadEnergy();
  } catch(err) { showToast(err.message, 'error'); }
}
