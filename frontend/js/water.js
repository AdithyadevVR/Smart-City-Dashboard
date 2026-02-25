let waterData = [];

async function loadWater() {
  try {
    waterData = await apiFetch('/api/water');
    renderWaterGauges(waterData);
    drawWaterConsumptionChart(waterData);
    drawWaterPressureMap(waterData);
    renderWaterLeaks(waterData);
    if (isAdmin()) renderWaterControls(waterData);
  } catch(err) { console.error('Water load error:', err); }
}

function reservoirColor(level) {
  if (level > 60) return '#10b981';
  if (level > 30) return '#f59e0b';
  return '#ef4444';
}

function renderWaterGauges(data) {
  const el = document.getElementById('waterGauges');
  if (!el) return;
  el.innerHTML = data.map(d => `
    <div class="gauge-card">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="38" fill="none" stroke="var(--border)" stroke-width="8"/>
        <circle cx="50" cy="50" r="38" fill="none"
          stroke="${reservoirColor(d.reservoirLevel)}"
          stroke-width="8"
          stroke-linecap="round"
          stroke-dasharray="${(d.reservoirLevel / 100) * 238.76} 238.76"
          transform="rotate(-90 50 50)"
          class="gauge-ring"
          style="transition:stroke-dasharray 1s ease;"/>
        <text x="50" y="46" text-anchor="middle" font-size="16" font-weight="700"
          fill="${reservoirColor(d.reservoirLevel)}" font-family="DM Sans, sans-serif">
          ${d.reservoirLevel}%
        </text>
        <text x="50" y="60" text-anchor="middle" font-size="8.5" fill="var(--text-tertiary)" font-family="DM Sans, sans-serif">
          RESERVOIR
        </text>
        ${d.leaks > 0 ? `<circle cx="82" cy="18" r="8" fill="#ef4444"/><text x="82" y="22" text-anchor="middle" font-size="9" fill="white" font-family="DM Sans">!</text>` : ''}
      </svg>
      <div class="gauge-label">${d.district}</div>
      <div class="gauge-value">${d.pressure} bar</div>
      <div style="font-size:0.7rem;color:${d.valveOpen ? 'var(--accent)' : 'var(--danger)'};">${d.valveOpen ? '✓ Valve Open' : '✕ Valve Closed'}</div>
    </div>
  `).join('');
}

function drawWaterConsumptionChart(data) {
  const ctx = document.getElementById('waterConsumptionChart')?.getContext('2d');
  if (!ctx || !data.length) return;
  if (chartInstances.waterConsumption) chartInstances.waterConsumption.destroy();
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const { grid, text } = chartColors(isDark);

  const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2,'0')}:00`);
  const aggregated = hours.map((_, h) =>
    data.reduce((s, d) => s + (d.consumptionTrend?.find(t => t.hour === h)?.consumption || 0), 0)
  );

  chartInstances.waterConsumption = new Chart(ctx, {
    type: 'line',
    data: {
      labels: hours,
      datasets: [{
        label: 'Water Consumption (L)',
        data: aggregated,
        borderColor: '#60a5fa',
        backgroundColor: 'rgba(96,165,250,0.12)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: text, font: { size: 11 } } } },
      scales: {
        x: { ticks: { color: text, font: { size: 10 }, maxTicksLimit: 12 }, grid: { color: grid } },
        y: { ticks: { color: text }, grid: { color: grid } }
      }
    }
  });
}

const waterPressurePos = [
  { name: 'Downtown', x: 90, y: 80, r: 42 },
  { name: 'North', x: 90, y: 30, r: 22 },
  { name: 'South', x: 90, y: 150, r: 30 },
  { name: 'East', x: 160, y: 80, r: 30 },
  { name: 'West', x: 30, y: 80, r: 30 },
  { name: 'Harbor', x: 200, y: 160, r: 22 }
];

function drawWaterPressureMap(data) {
  const svg = document.getElementById('waterPressureMap');
  if (!svg) return;
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const bgColor = isDark ? '#0f172a' : '#f0f8ff';

  let html = `<rect width="280" height="220" fill="${bgColor}" rx="0"/>`;

  waterPressurePos.forEach((pos, i) => {
    const d = data[i];
    const pressure = d?.pressure || 2;
    const level = Math.min(4, pressure);
    const color = level < 1.5 ? '#ef4444' : level < 2.5 ? '#f59e0b' : '#10b981';
    const opacity = 0.5 + (level / 4) * 0.4;

    html += `
      <circle cx="${pos.x}" cy="${pos.y}" r="${pos.r}" fill="${color}" opacity="${opacity}"/>
      <text x="${pos.x}" y="${pos.y + 4}" text-anchor="middle" font-size="9" fill="white"
        font-family="DM Sans, sans-serif" font-weight="700">
        ${pressure}b
      </text>
    `;
  });

  html += `
    <text x="140" y="215" text-anchor="middle" font-size="9" fill="${isDark ? '#475569' : '#94a3b8'}"
      font-family="DM Sans, sans-serif">Pressure Zone Map (bar)</text>
  `;

  svg.innerHTML = html;
}

function renderWaterLeaks(data) {
  const el = document.getElementById('waterLeakList');
  if (!el) return;
  const leaks = data.filter(d => d.leaks > 0);
  if (!leaks.length) {
    el.innerHTML = '<div style="color:var(--text-tertiary);font-size:0.875rem;text-align:center;padding:20px;">No leaks detected 🎉</div>';
    return;
  }
  el.innerHTML = leaks.map(d => `
    <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border);">
      <span style="font-size:1.2rem;">🚨</span>
      <div>
        <div style="font-weight:600;font-size:0.875rem;">${d.district}</div>
        <div style="font-size:0.78rem;color:var(--danger);">${d.leaks} leak${d.leaks !== 1 ? 's' : ''} detected</div>
        <div style="font-size:0.72rem;color:var(--text-tertiary);">Pressure: ${d.pressure} bar · Quality: ${d.waterQuality}%</div>
      </div>
      <span class="badge badge-danger" style="margin-left:auto;">Critical</span>
    </div>
  `).join('');
}

function renderWaterControls(data) {
  const card = document.getElementById('waterControlsCard');
  const el = document.getElementById('waterControlsBody');
  if (!card || !el) return;
  card.classList.remove('hidden');
  el.innerHTML = `
    <div style="font-size:0.85rem;font-weight:600;margin-bottom:10px;">District Valve Control</div>
    <div style="display:flex;flex-direction:column;gap:8px;">
      ${data.map(d => `
        <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);">
          <span style="flex:1;font-size:0.85rem;">${d.district}</span>
          <span class="badge ${d.valveOpen ? 'badge-success' : 'badge-danger'}">${d.valveOpen ? 'Open' : 'Closed'}</span>
          <button class="btn btn-secondary btn-sm" onclick="toggleWaterValve('${d._id}')">Toggle</button>
        </div>
      `).join('')}
    </div>
  `;
}

async function toggleWaterValve(id) {
  try {
    await apiFetch(`/api/water/${id}/toggle-valve`, { method: 'POST' });
    showToast('Valve status toggled', 'success');
    loadWater();
  } catch(err) { showToast(err.message, 'error'); }
}
