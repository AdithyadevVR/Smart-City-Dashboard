let wasteData = [];

async function loadWaste() {
  try {
    wasteData = await apiFetch('/api/waste');
    renderWasteBinLevels(wasteData);
    drawWasteMap(wasteData);
    drawWasteWeeklyChart(wasteData);
    drawWasteRecyclingChart(wasteData);
    if (isAdmin()) renderWasteControls(wasteData);
  } catch(err) { console.error('Waste load error:', err); }
}

function fillColor(level) {
  if (level < 40) return '#10b981';
  if (level < 70) return '#f59e0b';
  return '#ef4444';
}

function renderWasteBinLevels(data) {
  const el = document.getElementById('wasteBinLevels');
  if (!el) return;
  el.innerHTML = data.map(d => `
    <div style="margin-bottom:14px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">
        <div>
          <span style="font-size:0.875rem;font-weight:600;">${d.district}</span>
          <span class="badge ${collStatusBadge(d.collectionStatus)}" style="margin-left:8px;">${d.collectionStatus}</span>
        </div>
        <span style="font-size:0.875rem;font-weight:700;color:${fillColor(d.binFillLevel)};">${d.binFillLevel}%</span>
      </div>
      <div class="progress" style="height:14px;">
        <div class="progress-bar" style="width:${d.binFillLevel}%;background:${fillColor(d.binFillLevel)};height:14px;"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:0.72rem;color:var(--text-tertiary);margin-top:3px;">
        <span>${d.binsNeedingCollection} bins need collection of ${d.totalBins}</span>
        <span>Next: ${d.nextCollection ? new Date(d.nextCollection).toLocaleDateString() : '--'}</span>
      </div>
    </div>
  `).join('');
}

function collStatusBadge(s) {
  return s === 'completed' ? 'badge-success' : s === 'overdue' ? 'badge-danger' : 'badge-warning';
}

const wasteDistPos = [
  { name: 'Downtown', x: 130, y: 90, w: 110, h: 90 },
  { name: 'North District', x: 120, y: 10, w: 130, h: 70 },
  { name: 'South District', x: 130, y: 200, w: 110, h: 80 },
  { name: 'East District', x: 260, y: 80, w: 110, h: 100 },
  { name: 'West District', x: 10, y: 80, w: 100, h: 100 },
  { name: 'Harbor Zone', x: 260, y: 195, w: 110, h: 85 }
];

function drawWasteMap(data) {
  const svg = document.getElementById('wasteMap');
  if (!svg) return;
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const bgColor = isDark ? '#0f172a' : '#f8faff';
  const textColor = isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)';

  let html = `<rect width="400" height="320" fill="${bgColor}" rx="0"/>`;

  wasteDistPos.forEach(pos => {
    const d = data.find(d => d.district === pos.name);
    const fill = d?.binFillLevel || 0;
    const color = fillColor(fill);

    html += `
      <g style="cursor:default;">
        <rect x="${pos.x}" y="${pos.y}" width="${pos.w}" height="${pos.h}"
          fill="${color}" opacity="0.25" rx="10" stroke="${color}" stroke-width="1.5" stroke-opacity="0.5"/>
        <text x="${pos.x + pos.w/2}" y="${pos.y + pos.h/2 - 8}" text-anchor="middle"
          font-size="9" fill="${textColor}" font-family="DM Sans, sans-serif" font-weight="600">
          ${pos.name.replace(' District','').replace(' Zone','')}
        </text>
        <text x="${pos.x + pos.w/2}" y="${pos.y + pos.h/2 + 8}" text-anchor="middle"
          font-size="13" font-weight="800" fill="${color}" font-family="DM Sans, sans-serif">
          ${fill}%
        </text>
        <!-- Bin icon -->
        <text x="${pos.x + pos.w - 14}" y="${pos.y + 16}" font-size="12">🗑️</text>
      </g>
    `;
  });

  svg.innerHTML = html;

  // Status list below map
  const statusEl = document.getElementById('wasteStatusList');
  if (statusEl) {
    statusEl.innerHTML = `<div style="display:flex;flex-wrap:wrap;gap:6px;">` +
      data.map(d => `
        <span class="badge ${collStatusBadge(d.collectionStatus)}" style="font-size:0.72rem;">
          ${d.district.split(' ')[0]}: ${d.collectionStatus}
        </span>
      `).join('') + `</div>`;
  }
}

function drawWasteWeeklyChart(data) {
  const ctx = document.getElementById('wasteWeeklyChart')?.getContext('2d');
  if (!ctx || !data.length) return;
  if (chartInstances.wasteWeekly) chartInstances.wasteWeekly.destroy();
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const { grid, text } = chartColors(isDark);

  const days = data[0]?.weeklyData?.map(w => w.day) || [];
  const collected = days.map((_, i) => data.reduce((s, d) => s + (d.weeklyData[i]?.collected || 0), 0));
  const recycled = days.map((_, i) => data.reduce((s, d) => s + (d.weeklyData[i]?.recycled || 0), 0));

  chartInstances.wasteWeekly = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: days,
      datasets: [
        { label: 'Collected (kg)', data: collected, backgroundColor: '#94a3b8', borderRadius: 6, borderSkipped: false },
        { label: 'Recycled (kg)', data: recycled, backgroundColor: '#10b981', borderRadius: 6, borderSkipped: false }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: text, font: { size: 11 } } } },
      scales: {
        x: { ticks: { color: text }, grid: { display: false } },
        y: { ticks: { color: text }, grid: { color: grid } }
      }
    }
  });
}

function drawWasteRecyclingChart(data) {
  const ctx = document.getElementById('wasteRecyclingChart')?.getContext('2d');
  if (!ctx || !data.length) return;
  if (chartInstances.wasteRecycling) chartInstances.wasteRecycling.destroy();
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const avgRecycling = Math.round(data.reduce((s, d) => s + d.recyclingPercent, 0) / data.length);

  chartInstances.wasteRecycling = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Recycled', 'Landfill'],
      datasets: [{
        data: [avgRecycling, 100 - avgRecycling],
        backgroundColor: ['#10b981', isDark ? '#1e293b' : '#e2e8f0'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: false,
      cutout: '72%',
      plugins: {
        legend: { labels: { color: isDark ? '#94a3b8' : '#475569', font: { size: 11 } } },
        tooltip: { enabled: true }
      }
    },
    plugins: [{
      id: 'center-text',
      afterDraw(chart) {
        const { ctx: c, chartArea: { left, right, top, bottom } } = chart;
        const x = (left + right) / 2, y = (top + bottom) / 2;
        c.save();
        c.textAlign = 'center';
        c.fillStyle = isDark ? '#f1f5f9' : '#0f172a';
        c.font = 'bold 20px DM Sans';
        c.fillText(`${avgRecycling}%`, x, y + 4);
        c.font = '11px DM Sans';
        c.fillStyle = isDark ? '#94a3b8' : '#475569';
        c.fillText('Recycled', x, y + 20);
        c.restore();
      }
    }]
  });
}

function renderWasteControls(data) {
  const card = document.getElementById('wasteControlsCard');
  const el = document.getElementById('wasteControlsBody');
  if (!card || !el) return;
  card.classList.remove('hidden');
  el.innerHTML = `
    <div style="font-size:0.85rem;font-weight:600;margin-bottom:8px;">Mark Collection Complete</div>
    <div style="display:flex;flex-wrap:wrap;gap:8px;">
      ${data.map(d => `
        <button class="btn ${d.binFillLevel > 0 ? 'btn-primary' : 'btn-secondary'} btn-sm"
          onclick="collectWaste('${d._id}','${d.district}')">
          🗑️ ${d.district.split(' ')[0]}
        </button>
      `).join('')}
    </div>
  `;
}

async function collectWaste(id, name) {
  try {
    await apiFetch(`/api/waste/${id}/collect`, { method: 'POST' });
    showToast(`Waste collected in ${name}`, 'success');
    loadWaste();
  } catch(err) { showToast(err.message, 'error'); }
}
