/**
 * map-weather.js — Leaflet weather map initialization & layer controls
 * Integrates OpenWeatherMap tile overlays
 */

// ═══════════════════════════════════════════════════════════════════════════════
// WEATHER MAP
// ═══════════════════════════════════════════════════════════════════════════════
let weatherMap=null,owmTileLayer=null;
const WEATHER_STATIONS=[{name:'Nungambakkam',lat:13.0674,lon:80.2376},{name:'Meenambakkam Airport',lat:12.9941,lon:80.1709},{name:'Thiruvallur',lat:13.1627,lon:80.2828},{name:'Chennai Port',lat:13.0878,lon:80.2878}];

function initWeatherMap(){
  weatherMap=L.map('weatherMap',{zoomControl:false,attributionControl:false}).setView([LAT,LON],10);
  stadiaLayer().addTo(weatherMap);
  L.control.zoom({position:'bottomright'}).addTo(weatherMap);
  L.control.scale({position:'bottomleft',metric:true,imperial:false}).addTo(weatherMap);
  const base=STATE.weather?STATE.weather.temperature_2m:32;
  [{lat:13.14,lon:80.24,t:base+1.2},{lat:13.08,lon:80.27,t:base},{lat:12.99,lon:80.17,t:base-0.5},{lat:13.09,lon:80.29,t:base+0.3},{lat:12.90,lon:80.22,t:base-0.8},{lat:13.06,lon:80.22,t:base+0.1}].forEach(c=>{L.circle([c.lat,c.lon],{radius:2200,color:'none',fillColor:tempColor(c.t),fillOpacity:0.12,weight:0}).addTo(weatherMap);});
  WEATHER_STATIONS.forEach((s,i)=>{const t=parseFloat((base+([-0.4,0.3,0.8,0.2][i]||0)).toFixed(1));const col=tempColor(t);const icon=L.divIcon({html:`<div class="wx-chip" style="background:${col}22;border-color:${col};color:${col}">🌡 ${t}°C</div>`,iconSize:[80,28],iconAnchor:[40,14],className:''});L.marker([s.lat,s.lon],{icon}).addTo(weatherMap).bindPopup(`<div class="popup-title">🌡 ${s.name}</div><div class="popup-row"><span class="popup-label">Temperature</span><span class="popup-val" style="color:${col}">${t}°C</span></div><div class="popup-row"><span class="popup-label">Wind</span><span class="popup-val">${STATE.windSpeed||'--'} km/h</span></div>`);});
  document.getElementById('owm-key-note').textContent=OWM_KEY?'':'(Add OWM key for overlays)';
  if(OWM_KEY)updateWeatherLayer('precipitation_new');
  updateRainAnimation();
  const l=L.control({position:'bottomleft'});l.onAdd=function(){const d=L.DomUtil.create('div','map-legend');d.innerHTML=`<div style="font-size:9px;letter-spacing:0.08em;color:var(--t3);margin-bottom:4px">TEMPERATURE</div><div class="legend-row"><div class="legend-dot" style="background:#3b82f6"></div>&lt;20°C Cool</div><div class="legend-row"><div class="legend-dot" style="background:#22c55e"></div>20–28°C Mild</div><div class="legend-row"><div class="legend-dot" style="background:#f59e0b"></div>28–32°C Warm</div><div class="legend-row"><div class="legend-dot" style="background:#ef4444"></div>&gt;32°C Hot</div>`;return d;};l.addTo(weatherMap);
}
function tempColor(t){if(t<20)return'#3b82f6';if(t<28)return'#22c55e';if(t<32)return'#f59e0b';return'#ef4444';}
function setWeatherLayer(layer,btn){document.querySelectorAll('#weatherLayerBtns .map-layer-btn').forEach(b=>b.classList.remove('active'));if(btn)btn.classList.add('active');updateWeatherLayer(layer);}
function updateWeatherLayer(layer){if(owmTileLayer){weatherMap.removeLayer(owmTileLayer);owmTileLayer=null;}if(layer==='none'||!OWM_KEY){updateRainAnimation();return;}owmTileLayer=L.tileLayer(`https://tile.openweathermap.org/map/${layer}/{z}/{x}/{y}.png?appid=${OWM_KEY}`,{maxZoom:19,opacity:0.7}).addTo(weatherMap);updateRainAnimation();}
function updateRainAnimation(){const r=document.getElementById('weatherMapRain');if(!r)return;if(STATE.rainProb>50){r.style.display='block';if(r.children.length<30){r.innerHTML='';for(let i=0;i<30;i++){const d=document.createElement('div');d.className='raindrop';d.style.left=Math.random()*100+'%';d.style.top=Math.random()*100+'%';d.style.height=(Math.random()*60+20)+'px';d.style.animationDuration=(Math.random()*0.8+0.4)+'s';d.style.animationDelay=Math.random()*2+'s';r.appendChild(d);}}}else r.style.display='none';}