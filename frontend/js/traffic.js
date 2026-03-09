let trafficData = [];

async function loadTraffic() {
  try {
    trafficData = await apiFetch('/api/traffic');
    drawTrafficMap(trafficData);
    renderTrafficDistricts(trafficData);
    drawTrafficChart(trafficData);
    renderTrafficIncidents(trafficData);
    if (isAdmin()) renderTrafficControls(trafficData);
  } catch(err) { console.error('Traffic load error:', err); }
}

// City grid SVG map
const districtPositions = [
  { name: 'Downtown',       x: 280, y: 180, w: 160, h: 120 },
  { name: 'North District', x: 270, y: 40,  w: 180, h: 120 },
  { name: 'South District', x: 280, y: 320, w: 160, h: 120 },
  { name: 'East District',  x: 460, y: 160, w: 140, h: 140 },
  { name: 'West District',  x: 120, y: 160, w: 140, h: 140 },
  { name: 'Harbor Zone',    x: 480, y: 330, w: 140, h: 110 }
];

function congestionColor(level) {
  if (level < 30) return '#10b981';
  if (level < 60) return '#f59e0b';
  if (level < 80) return '#f97316';
  return '#ef4444';
}

function drawTrafficMap(data) {
  const svg = document.getElementById('trafficMap');
  if (!svg) return;
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const bgColor = isDark ? '#0f172a' : '#f0f4ff';
  const roadColor = isDark ? '#1e293b' : '#e2e8f0';

  let html = `
    <rect width="700" height="460" fill="${bgColor}" rx="0"/>
    <!-- Roads grid -->
    <line x1="0" y1="160" x2="700" y2="160" stroke="${roadColor}" stroke-width="8"/>
    <line x1="0" y1="300" x2="700" y2="300" stroke="${roadColor}" stroke-width="8"/>
    <line x1="250" y1="0" x2="250" y2="460" stroke="${roadColor}" stroke-width="8"/>
    <line x1="460" y1="0" x2="460" y2="460" stroke="${roadColor}" stroke-width="8"/>
    <line x1="0" y1="40" x2="700" y2="40" stroke="${roadColor}" stroke-width="4" stroke-dasharray="12,8"/>
    <line x1="0" y1="420" x2="700" y2="420" stroke="${roadColor}" stroke-width="4" stroke-dasharray="12,8"/>
  `;

  districtPositions.forEach(pos => {
    const d = data.find(d => d.district === pos.name);
    const level = d ? d.congestionLevel : 0;
    const color = congestionColor(level);
    const opacity = 0.75;
    const textColor = isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)';

    html += `
      <g class="district-zone" data-district="${pos.name}" style="cursor:pointer;"
        onmouseover="showTrafficTooltip(event,'${pos.name}')"
        onmouseout="hideTooltip('trafficTooltip')"
        onclick="navigate('traffic')">
        <rect x="${pos.x}" y="${pos.y}" width="${pos.w}" height="${pos.h}"
          fill="${color}" opacity="${opacity}" rx="12"
          stroke="${color}" stroke-width="2"/>
        <text x="${pos.x + pos.w/2}" y="${pos.y + pos.h/2 - 12}" text-anchor="middle"
          font-size="11" font-weight="600" fill="${textColor}" font-family="DM Sans, sans-serif">
          ${pos.name}
        </text>
        <text x="${pos.x + pos.w/2}" y="${pos.y + pos.h/2 + 8}" text-anchor="middle"
          font-size="16" font-weight="800" fill="${textColor}" font-family="DM Sans, sans-serif">
          ${level}%
        </text>
        <text x="${pos.x + pos.w/2}" y="${pos.y + pos.h/2 + 24}" text-anchor="middle"
          font-size="10" fill="${textColor}" font-family="DM Sans, sans-serif" opacity="0.8">
          ${d ? d.status.toUpperCase() : '--'}
        </text>
      </g>
    `;

    // Traffic dots animation
    if (d && level > 20) {
      for (let i = 0; i < 3; i++) {
        const dotX = pos.x + 20 + Math.random() * (pos.w - 40);
        const dotY = pos.y + 20 + Math.random() * (pos.h - 40);
        html += `<circle cx="${dotX}" cy="${dotY}" r="3" fill="white" opacity="0.6"/>`;
      }
    }
  });

  // City label
  html += `<text x="350" y="455" text-anchor="middle" font-size="11" fill="${isDark ? '#475569' : '#94a3b8'}" font-family="DM Sans, sans-serif">SmartCity Traffic Grid</text>`;

  svg.innerHTML = html;
}

function showTrafficTooltip(event, districtName) {
  const d = trafficData.find(d => d.district === districtName);
  if (!d) return;
  const tip = document.getElementById('trafficTooltip');
  tip.innerHTML = `
    <div class="popup-title">${districtName}</div>
    <div class="popup-row"><span>Congestion</span><strong>${d.congestionLevel}%</strong></div>
    <div class="popup-row"><span>Avg Speed</span><strong>${Math.round(d.avgSpeed)} km/h</strong></div>
    <div class="popup-row"><span>Vehicles</span><strong>${d.vehicleCount?.toLocaleString()}</strong></div>
    <div class="popup-row"><span>Incidents</span><strong>${d.incidents}</strong></div>
    <div style="margin-top:6px;"><span class="badge ${congStatusBadge(d.status)}">${d.status}</span></div>
  `;
  const rect = event.target.closest('g').getBoundingClientRect();
  const mapRect = document.getElementById('trafficMap').getBoundingClientRect();
  tip.style.left = `${rect.left - mapRect.left + rect.width/2 - 80}px`;
  tip.style.top = `${rect.top - mapRect.top - 10}px`;
  tip.classList.add('visible');
}

function hideTooltip(id) {
  const tip = document.getElementById(id);
  if (tip) tip.classList.remove('visible');
}

function congStatusBadge(s) {
  return s === 'clear' ? 'badge-success' : s === 'moderate' ? 'badge-warning' : 'badge-danger';
}

function renderTrafficDistricts(data) {
  const el = document.getElementById('trafficDistrictList');
  if (!el) return;
  el.innerHTML = data.map(d => `
    <div class="district-item">
      <span style="font-size:1.1rem;">${d.congestionLevel > 70 ? '🔴' : d.congestionLevel > 40 ? '🟡' : '🟢'}</span>
      <div class="district-info">
        <div class="district-name">${d.district}</div>
        <div class="district-sub">${Math.round(d.avgSpeed)} km/h · ${d.incidents} incident${d.incidents !== 1 ? 's' : ''}</div>
      </div>
      <div class="district-bar-wrap">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
          <span style="font-size:0.72rem;color:var(--text-tertiary);">Congestion</span>
          <span style="font-size:0.72rem;font-weight:600;">${d.congestionLevel}%</span>
        </div>
        <div class="district-bar-bg">
          <div class="district-bar-fill" style="width:${d.congestionLevel}%;background:${congestionColor(d.congestionLevel)};"></div>
        </div>
      </div>
    </div>
  `).join('');
}

function renderTrafficIncidents(data) {
  const el = document.getElementById('trafficIncidentLog');
  if (!el) return;
  const incidents = data.filter(d => d.incidents > 0);
  if (!incidents.length) {
    el.innerHTML = '<div style="color:var(--text-tertiary);font-size:0.875rem;text-align:center;padding:20px;">No active incidents 🎉</div>';
    return;
  }
  el.innerHTML = incidents.map(d => `
    <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border);">
      <span style="font-size:1.1rem;">⚠️</span>
      <div>
        <div style="font-size:0.85rem;font-weight:600;">${d.district}</div>
        <div style="font-size:0.78rem;color:var(--text-secondary);">${d.incidents} incident${d.incidents !== 1 ? 's' : ''} reported · ${d.status}</div>
      </div>
    </div>
  `).join('');
}

function drawTrafficChart(data) {
  const ctx = document.getElementById('trafficSpeedChart')?.getContext('2d');
  if (!ctx) return;
  if (chartInstances.trafficSpeed) chartInstances.trafficSpeed.destroy();
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const { grid, text } = chartColors(isDark);

  chartInstances.trafficSpeed = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.district.replace(' District','').replace(' Zone','')),
      datasets: [
        {
          label: 'Avg Speed (km/h)',
          data: data.map(d => Math.round(d.avgSpeed)),
          backgroundColor: '#1a56db',
          borderRadius: 6,
          borderSkipped: false
        },
        {
          label: 'Congestion %',
          data: data.map(d => d.congestionLevel),
          backgroundColor: data.map(d => congestionColor(d.congestionLevel)),
          borderRadius: 6,
          borderSkipped: false
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: text, font: { size: 11 } } }
      },
      scales: {
        x: { ticks: { color: text, font: { size: 11 } }, grid: { display: false } },
        y: { ticks: { color: text }, grid: { color: grid } }
      }
    }
  });
}

function renderTrafficControls(data) {
  const el = document.getElementById('trafficControlsBody');
  if (!el) return;
  document.getElementById('trafficControls').classList.remove('hidden');
  el.innerHTML = data.map(d => `
    <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);">
      <div style="flex:1;">
        <div style="font-size:0.85rem;font-weight:600;">${d.district}</div>
        <div style="font-size:0.75rem;color:var(--text-tertiary);">${d.incidents} incidents</div>
      </div>
      <button class="btn btn-secondary btn-sm" onclick="clearTrafficIncident('${d._id}')">✓ Clear</button>
    </div>
  `).join('');
}

async function clearTrafficIncident(id) {
  try {
    await apiFetch(`/api/traffic/${id}/clear-incident`, { method: 'POST' });
    showToast('Incident cleared successfully', 'success');
    loadTraffic();
  } catch(err) { showToast(err.message, 'error'); }
}
