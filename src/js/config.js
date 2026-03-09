/**
 * config.js — API keys, constants, global state
 * Chennai Smart City Dashboard
 */

// ── Keys ─────────────────────────────────────────────────────────────────────
let OWM_KEY=localStorage.getItem('OWM_KEY')||'';
let TOMTOM_KEY=localStorage.getItem('TOMTOM_KEY')||'';
let AQI_KEY=localStorage.getItem('AQI_KEY')||'';
const LAT=13.0827,LON=80.2707;
const WEATHER_ICONS={0:'☀️',1:'🌤',2:'⛅',3:'☁️',45:'🌫',48:'🌫',51:'🌦',53:'🌧',55:'🌧',61:'🌧',63:'🌧',65:'🌧',71:'🌨',73:'🌨',75:'🌨',80:'🌦',81:'🌧',82:'🌧',95:'⛈',96:'⛈',99:'⛈'};
const WEEKDAYS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const STATE={weather:null,forecast:null,aqi:null,news:[],windDir:0,windSpeed:0,rainProb:0,temp:0,corridorHistory:{},
  visibleServiceLayers:new Set(['hospitals','police','fire','pharmacy','clinics']),
  visibleTourLayers:new Set(['heritage','temples','beaches','museums','malls'])};

// ── Clock ─────────────────────────────────────────────────────────────────────
function updateClock(){document.getElementById('navClock').textContent=new Date().toLocaleTimeString('en-IN',{hour12:false});}
setInterval(updateClock,1000);updateClock();

// ── Setup ─────────────────────────────────────────────────────────────────────
function openSetup(){updateSetupStatus();document.getElementById('setupOverlay').style.display='flex';}
function closeSetup(){document.getElementById('setupOverlay').style.display='none';}
function applyAndReload(){location.reload();}
function maskKey(k){if(!k||k.length<5)return'';return k.slice(0,4)+'●●●●●●';}
function updateSetupStatus(){
  [['OWM_KEY','owm-status','owm-input'],['TOMTOM_KEY','tomtom-status','tomtom-input'],['AQI_KEY','waqi-status','waqi-input']].forEach(([k,sid,iid])=>{
    const v=localStorage.getItem(k)||'',el=document.getElementById(sid),inp=document.getElementById(iid);
    if(v){el.className='key-status key-ok';el.textContent='✅ '+maskKey(v);inp.placeholder=maskKey(v);}
    else{el.className='key-status key-missing';el.textContent='⚠ Not set';}
  });
}
function saveKey(sk,ii,si){
  const v=document.getElementById(ii).value.trim();if(!v)return;
  localStorage.setItem(sk,v);
  if(sk==='OWM_KEY')OWM_KEY=v;if(sk==='TOMTOM_KEY')TOMTOM_KEY=v;if(sk==='AQI_KEY')AQI_KEY=v;
  const el=document.getElementById(si);el.className='key-status key-ok';el.textContent='✅ '+maskKey(v);
  document.getElementById(ii).value='';document.getElementById(ii).placeholder=maskKey(v);
}

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