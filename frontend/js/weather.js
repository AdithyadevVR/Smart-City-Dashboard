let weatherData = [];

async function loadWeather() {
  try {
    weatherData = await apiFetch('/api/weather');
    drawWeatherMap(weatherData);
    renderWeatherCurrent(weatherData);
    renderWeatherAQI(weatherData);
    renderForecast(weatherData);
    drawWeatherTempChart(weatherData);
  } catch(err) { console.error('Weather load error:', err); }
}

const weatherDistrictPos = [
  { name: 'Downtown',       x: 240, y: 160, w: 180, h: 130 },
  { name: 'North District', x: 230, y: 20,  w: 200, h: 120 },
  { name: 'South District', x: 240, y: 305, w: 180, h: 115 },
  { name: 'East District',  x: 440, y: 140, w: 160, h: 150 },
  { name: 'West District',  x: 60,  y: 140, w: 160, h: 150 },
  { name: 'Harbor Zone',    x: 440, y: 305, w: 160, h: 115 }
];

function tempToColor(temp) {
  if (temp < 10) return '#60a5fa';   // cold blue
  if (temp < 18) return '#34d399';   // cool green
  if (temp < 25) return '#fbbf24';   // warm yellow
  if (temp < 32) return '#f97316';   // hot orange
  return '#ef4444';                   // very hot red
}

function weatherEmoji(condition) {
  const map = { sunny: '☀️', cloudy: '☁️', rainy: '🌧️', stormy: '⛈️', foggy: '🌫️', 'partly-cloudy': '⛅' };
  return map[condition] || '🌤️';
}

function drawWeatherMap(data) {
  const svg = document.getElementById('weatherMap');
  if (!svg) return;
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const bgColor = isDark ? '#0f172a' : '#f0f8ff';
  const textColor = isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)';

  let html = `<rect width="700" height="440" fill="${bgColor}" rx="0"/>`;

  // Draw subtle connection lines
  html += `<line x1="330" y1="80" x2="330" y2="160" stroke="${isDark ? '#1e293b' : '#e2e8f0'}" stroke-width="2" stroke-dasharray="4,4"/>`;
  html += `<line x1="330" y1="290" x2="330" y2="305" stroke="${isDark ? '#1e293b' : '#e2e8f0'}" stroke-width="2" stroke-dasharray="4,4"/>`;

  weatherDistrictPos.forEach(pos => {
    const d = data.find(d => d.district === pos.name);
    const temp = d?.temperature || 20;
    const color = tempToColor(temp);
    const emoji = weatherEmoji(d?.condition || 'sunny');

    html += `
      <g style="cursor:pointer;"
        onmouseover="showWeatherTooltip(event,'${pos.name}')"
        onmouseout="hideTooltip('weatherTooltip')">
        <defs>
          <radialGradient id="wg_${pos.name.replace(/\s/g,'')}" cx="50%" cy="40%">
            <stop offset="0%" stop-color="${color}" stop-opacity="0.85"/>
            <stop offset="100%" stop-color="${color}" stop-opacity="0.45"/>
          </radialGradient>
        </defs>
        <rect x="${pos.x}" y="${pos.y}" width="${pos.w}" height="${pos.h}"
          fill="url(#wg_${pos.name.replace(/\s/g,'')})" rx="16"
          stroke="${color}" stroke-width="1.5" stroke-opacity="0.4"/>
        <text x="${pos.x + pos.w/2}" y="${pos.y + 28}" text-anchor="middle"
          font-size="11" font-weight="600" fill="${textColor}" font-family="DM Sans, sans-serif" opacity="0.8">
          ${pos.name}
        </text>
        <text x="${pos.x + pos.w/2}" y="${pos.y + pos.h/2 + 4}" text-anchor="middle"
          font-size="28">
          ${emoji}
        </text>
        <text x="${pos.x + pos.w/2}" y="${pos.y + pos.h - 16}" text-anchor="middle"
          font-size="15" font-weight="700" fill="${textColor}" font-family="DM Sans, sans-serif">
          ${Math.round(temp)}°C
        </text>
      </g>
    `;
  });

  // Legend
  const legendY = 420;
  const gradStops = ['#60a5fa', '#34d399', '#fbbf24', '#f97316', '#ef4444'];
  const gradLabels = ['<10°', '10-18°', '18-25°', '25-32°', '>32°'];
  html += `<defs><linearGradient id="tempGrad" x1="0%" y1="0%" x2="100%" y2="0%">`;
  gradStops.forEach((c, i) => { html += `<stop offset="${i * 25}%" stop-color="${c}"/>`; });
  html += `</linearGradient></defs>`;

  svg.innerHTML = html;

  // Render legend separately
  const legendEl = document.getElementById('weatherMapLegend');
  if (legendEl) {
    legendEl.innerHTML = gradLabels.map((l, i) => `
      <div class="legend-item">
        <span class="legend-dot" style="background:${gradStops[i]}"></span>
        ${l}
      </div>
    `).join('');
  }
}

function showWeatherTooltip(event, districtName) {
  const d = weatherData.find(d => d.district === districtName);
  if (!d) return;
  const tip = document.getElementById('weatherTooltip');
  tip.innerHTML = `
    <div class="popup-title">${weatherEmoji(d.condition)} ${districtName}</div>
    <div class="popup-row"><span>Temperature</span><strong>${d.temperature}°C</strong></div>
    <div class="popup-row"><span>Feels like</span><strong>${d.feelsLike}°C</strong></div>
    <div class="popup-row"><span>Humidity</span><strong>${d.humidity}%</strong></div>
    <div class="popup-row"><span>Wind</span><strong>${d.windSpeed} km/h ${d.windDirection}</strong></div>
    <div class="popup-row"><span>Visibility</span><strong>${d.visibility} km</strong></div>
  `;
  const svgEl = document.getElementById('weatherMap');
  const svgRect = svgEl.getBoundingClientRect();
  const target = event.target;
  const targetRect = target.getBoundingClientRect();
  tip.style.left = `${targetRect.left - svgRect.left}px`;
  tip.style.top = `${targetRect.top - svgRect.top - 120}px`;
  tip.classList.add('visible');
}

function renderWeatherCurrent(data) {
  const el = document.getElementById('weatherCurrentCard');
  if (!el || !data.length) return;
  const first = data[0];
  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:16px;">
      <span style="font-size:3rem;">${weatherEmoji(first.condition)}</span>
      <div>
        <div style="font-size:2rem;font-weight:700;letter-spacing:-0.03em;">${Math.round(first.temperature)}°C</div>
        <div style="color:var(--text-secondary);font-size:0.875rem;text-transform:capitalize;">${first.condition} · Feels ${first.feelsLike}°</div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:16px;">
      ${infoChip('💧', 'Humidity', `${first.humidity}%`)}
      ${infoChip('💨', 'Wind', `${first.windSpeed} km/h`)}
      ${infoChip('👁️', 'Visibility', `${first.visibility} km`)}
      ${infoChip('🌡️', 'UV Index', first.uvIndex)}
    </div>
  `;
}

function infoChip(icon, label, val) {
  return `<div style="background:var(--bg-overlay);border:1px solid var(--border);border-radius:10px;padding:10px;text-align:center;">
    <div>${icon}</div>
    <div style="font-size:0.72rem;color:var(--text-tertiary);margin-top:2px;">${label}</div>
    <div style="font-weight:600;font-size:0.9rem;">${val}</div>
  </div>`;
}

function renderWeatherAQI(data) {
  const el = document.getElementById('weatherAQICard');
  if (!el || !data.length) return;
  const avgAQI = Math.round(data.reduce((s, d) => s + d.aqi, 0) / data.length);
  const aqiColor = avgAQI < 50 ? '#10b981' : avgAQI < 100 ? '#f59e0b' : '#ef4444';
  const aqiLabel = avgAQI < 50 ? 'Good' : avgAQI < 100 ? 'Moderate' : 'Poor';

  el.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
      <span style="font-size:0.85rem;color:var(--text-secondary);">Air Quality Index</span>
      <span class="badge" style="background:${aqiColor}20;color:${aqiColor};">${aqiLabel}</span>
    </div>
    <div style="font-size:2.5rem;font-weight:700;color:${aqiColor};letter-spacing:-0.03em;">${avgAQI}</div>
    <div style="height:8px;background:var(--border);border-radius:99px;margin-top:10px;overflow:hidden;">
      <div style="height:100%;width:${Math.min(100, avgAQI)}%;background:${aqiColor};border-radius:99px;transition:width 1s;"></div>
    </div>
    <div style="display:flex;justify-content:space-between;font-size:0.72rem;color:var(--text-tertiary);margin-top:4px;">
      <span>0 — Good</span><span>100 — Poor</span><span>200 — Hazardous</span>
    </div>
  `;
}

function renderForecast(data) {
  const el = document.getElementById('forecastStrip');
  if (!el || !data.length) return;
  const forecast = data[0]?.forecast || [];
  el.innerHTML = forecast.map(f => `
    <div class="forecast-day">
      <div class="day-name">${f.day}</div>
      <div class="day-icon">${weatherEmoji(f.condition)}</div>
      <div class="day-high">${f.high}°</div>
      <div class="day-low">${f.low}°</div>
      <div style="font-size:0.68rem;color:#60a5fa;margin-top:2px;">${f.precipitation}%</div>
    </div>
  `).join('');
}

function drawWeatherTempChart(data) {
  const ctx = document.getElementById('weatherTempChart')?.getContext('2d');
  if (!ctx) return;
  if (chartInstances.weatherTemp) chartInstances.weatherTemp.destroy();
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const { grid, text } = chartColors(isDark);

  chartInstances.weatherTemp = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.district.replace(' District','').replace(' Zone','')),
      datasets: [
        {
          label: 'Temperature (°C)',
          data: data.map(d => d.temperature),
          backgroundColor: data.map(d => tempToColor(d.temperature)),
          borderRadius: 8,
          borderSkipped: false
        },
        {
          label: 'Humidity (%)',
          data: data.map(d => d.humidity),
          backgroundColor: 'rgba(96,165,250,0.3)',
          borderColor: '#60a5fa',
          borderWidth: 1.5,
          borderRadius: 8,
          borderSkipped: false,
          type: 'line',
          fill: false,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#60a5fa'
        }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: text, font: { size: 11 } } } },
      scales: {
        x: { ticks: { color: text, font: { size: 11 } }, grid: { display: false } },
        y: { ticks: { color: text }, grid: { color: grid } }
      }
    }
  });
}
