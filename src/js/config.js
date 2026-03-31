/**
 * config.js — API keys, constants, global state
 * Chennai Smart City Dashboard
 */

// ── Keys ─────────────────────────────────────────────────────────────────────
const OWM_KEY='f569f4589511bf89c287b52ccc8dc439';
const TOMTOM_KEY='aFHN7UYRt1sGI58pGrGYrrAZVwLaYO3G';
const AQI_KEY='87d6e773723e2a6ed5833c3b4b85defab4a29e72';
const LAT=13.0827,LON=80.2707;
const WEATHER_ICONS={0:'☀️',1:'🌤',2:'⛅',3:'☁️',45:'🌫',48:'🌫',51:'🌦',53:'🌧',55:'🌧',61:'🌧',63:'🌧',65:'🌧',71:'🌨',73:'🌨',75:'🌨',80:'🌦',81:'🌧',82:'🌧',95:'⛈',96:'⛈',99:'⛈'};
const WEEKDAYS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const STATE={weather:null,forecast:null,aqi:null,news:[],windDir:0,windSpeed:0,rainProb:0,temp:0,corridorHistory:{},
  visibleServiceLayers:new Set(['hospitals','police','fire','pharmacy','clinics']),
  visibleTourLayers:new Set(['heritage','temples','beaches','museums','malls'])};

// ── Clock ─────────────────────────────────────────────────────────────────────
function updateClock(){document.getElementById('navClock').textContent=new Date().toLocaleTimeString('en-IN',{hour12:false});}
setInterval(updateClock,1000);updateClock();

// ── Theme toggle ──────────────────────────────────────────────────────────────
function toggleTheme(){
  var isLight=document.documentElement.getAttribute('data-theme')==='light';
  var next=isLight?'dark':'light';
  document.documentElement.setAttribute('data-theme',next);
  document.getElementById('themeToggle').textContent=next==='light'?'🌙':'☀️';
  localStorage.setItem('scd-theme',next);
}
(function(){
  var saved=localStorage.getItem('scd-theme');
  if(saved==='light'||saved==='dark')document.documentElement.setAttribute('data-theme',saved);
  window.addEventListener('DOMContentLoaded',function(){
    var btn=document.getElementById('themeToggle');
    if(btn)btn.textContent=document.documentElement.getAttribute('data-theme')==='light'?'🌙':'☀️';
  });
})();

// ── Tab switching ─────────────────────────────────────────────────────────────
function switchTab(name,btn){
  document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('tab-'+name).classList.add('active');
  if(btn)btn.classList.add('active');
  if(name==='weather'&&!weatherMap)setTimeout(initWeatherMap,100);
  if(name==='traffic'&&!trafficMap)setTimeout(initTrafficMap,100);
  if(name==='cityservices'&&!cityServicesMap)setTimeout(initCityServicesMap,100);
  if(name==='tourism'&&!tourismMap)setTimeout(initTourismMap,100);
}

// ── Tile layer ────────────────────────────────────────────────────────────────
function stadiaLayer(){return L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',{maxZoom:20,attribution:'© OpenStreetMap © CARTO'});}