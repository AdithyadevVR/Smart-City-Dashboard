/**
 * data-services.js — Curated city services POI data
 * Hospitals, Police, Fire, Pharmacy, Blood Banks, ATMs, Fuel
 */

// ═══════════════════════════════════════════════════════════════════════════════
// CITY SERVICES DATA
// ═══════════════════════════════════════════════════════════════════════════════
const CURATED_SERVICES={
  hospitals:[
    {n:'Government General Hospital',lat:13.0821,lon:80.2755,type:'Government',beds:2670,note:'Largest public hospital in TN'},
    {n:'Apollo Hospitals – Greams Road',lat:13.0579,lon:80.2441,type:'Private',beds:550,note:'Premier tertiary care'},
    {n:'MIOT International',lat:13.0096,lon:80.1836,type:'Private',beds:1000,note:'Multi-specialty, ortho focus'},
    {n:'Fortis Malar Hospital',lat:13.0067,lon:80.2559,type:'Private',beds:180,note:'Cardiac & ortho specialist'},
    {n:'Sri Ramachandra Medical Centre',lat:13.0352,lon:80.1580,type:'Private',beds:1500,note:'University hospital, Porur'},
    {n:'Stanley Medical College Hospital',lat:13.1034,lon:80.2900,type:'Government',beds:1700,note:'Heritage govt hospital, Royapuram'},
    {n:'Rajiv Gandhi Govt. Hospital',lat:13.0810,lon:80.2770,type:'Government',beds:400,note:'Paediatric speciality'},
    {n:'Kauvery Hospital – Alwarpet',lat:13.0362,lon:80.2534,type:'Private',beds:300,note:'Cardiac centre'},
    {n:'SIMS Hospital – Vadapalani',lat:13.0505,lon:80.2126,type:'Private',beds:400,note:'Super-specialty'},
    {n:'Vijaya Hospital – Vadapalani',lat:13.0547,lon:80.2182,type:'Private',beds:450,note:'Multi-specialty'},
    {n:'Sundaram Medical Foundation',lat:13.0431,lon:80.2458,type:'Private',beds:350,note:'Cancer & general'},
    {n:'Gleneagles Global Health City',lat:12.9558,lon:80.2400,type:'Private',beds:1000,note:'OMR, organ transplant centre'},
  ],
  police:[
    {n:'Commissioner of Police Office',lat:13.0799,lon:80.2741,zone:'HQ',note:'Vepery, main HQ'},
    {n:'Anna Nagar Police Station',lat:13.0868,lon:80.2094,zone:'North'},
    {n:'T. Nagar Police Station',lat:13.0418,lon:80.2341,zone:'South'},
    {n:'Adyar Police Station',lat:13.0051,lon:80.2562,zone:'South'},
    {n:'Egmore Police Station',lat:13.0794,lon:80.2621,zone:'Central'},
    {n:'Mylapore Police Station',lat:13.0368,lon:80.2676,zone:'South'},
    {n:'Sholinganallur Police Station',lat:12.9010,lon:80.2279,zone:'IT Corridor'},
    {n:'Perambur Police Station',lat:13.1142,lon:80.2330,zone:'North'},
    {n:'Arumbakkam Police Station',lat:13.0644,lon:80.2094,zone:'West'},
    {n:'Guindy Police Station',lat:13.0070,lon:80.2197,zone:'South-West'},
    {n:'Royapuram Police Station',lat:13.1070,lon:80.2920,zone:'North'},
    {n:'Tambaram Police Station',lat:12.9263,lon:80.1200,zone:'South-West'},
  ],
  fire:[
    {n:'Central Fire Station – Egmore',lat:13.0798,lon:80.2620,type:'Central',note:'Main station, all vehicles'},
    {n:'Anna Nagar Fire Station',lat:13.0880,lon:80.2068,type:'Category A'},
    {n:'T. Nagar Fire Station',lat:13.0433,lon:80.2354,type:'Category A'},
    {n:'Adyar Fire Station',lat:13.0060,lon:80.2565,type:'Category B'},
    {n:'Perambur Fire Station',lat:13.1143,lon:80.2335,type:'Category B'},
    {n:'Guindy Fire Station',lat:13.0071,lon:80.2203,type:'Category A',note:'Industrial zone cover'},
    {n:'Sholinganallur Fire Post',lat:12.9008,lon:80.2280,type:'Post',note:'IT corridor'},
    {n:'Tambaram Fire Station',lat:12.9268,lon:80.1198,type:'Category A'},
  ],
  pharmacy:[
    {n:'Apollo Pharmacy – Anna Salai',lat:13.0582,lon:80.2440,open:'24 hours'},
    {n:'MedPlus – T. Nagar',lat:13.0418,lon:80.2350,open:'24 hours'},
    {n:'Wellness Forever – Adyar',lat:13.0065,lon:80.2558,open:'09:00 – 22:00'},
    {n:'Netmeds Pharmacy – Mylapore',lat:13.0362,lon:80.2681,open:'09:00 – 22:00'},
    {n:'Santhigiri Pharmacy – Anna Nagar',lat:13.0870,lon:80.2088,open:'08:30 – 21:30'},
    {n:'Shifa Medical – Sholinganallur',lat:12.9012,lon:80.2282,open:'24 hours'},
    {n:'BigChemist – Koyambedu',lat:13.0690,lon:80.1952,open:'09:00 – 21:00'},
    {n:'Thyrocare Pharmacy – Egmore',lat:13.0793,lon:80.2617,open:'08:00 – 21:00'},
  ],
  blood:[
    {n:'GH Blood Bank',lat:13.0820,lon:80.2752,units:'All types',note:'Largest in Tamil Nadu'},
    {n:'Apollo Blood Bank',lat:13.0580,lon:80.2442,units:'All types',note:'24/7 emergency supply'},
    {n:'IRCS Blood Bank – Red Cross',lat:13.0710,lon:80.2540,units:'All types',note:'Non-profit, walk-in'},
    {n:'Sri Ramachandra Blood Bank',lat:13.0355,lon:80.1578,units:'Rare types',note:'Rare group specialist'},
    {n:'Rotary TTK Blood Bank',lat:13.0498,lon:80.2230,units:'All types',note:'Volunteer-driven'},
  ],
  clinics:[
    {n:'PHC Arumbakkam',lat:13.0641,lon:80.2097,note:'Government PHC'},
    {n:'ESI Hospital – KK Nagar',lat:13.0375,lon:80.2069,note:'Employee health scheme'},
    {n:'CGHS Dispensary – Nungambakkam',lat:13.0725,lon:80.2580,note:'Central govt employees'},
    {n:'Narayana e-Clinic – Anna Nagar',lat:13.0800,lon:80.2200,note:'Teleconsultation hub'},
    {n:'Ayush Health Centre – Adyar',lat:13.0070,lon:80.2490,note:'Ayurvedic & Yoga'},
    {n:'TNMSC Dispensary – Royapuram',lat:13.1068,lon:80.2915,note:'Tamil Nadu govt medicines'},
  ],
  atm:[
    {n:'SBI ATM – Anna Nagar',lat:13.0868,lon:80.2092,bank:'SBI'},
    {n:'HDFC ATM – T. Nagar',lat:13.0421,lon:80.2348,bank:'HDFC'},
    {n:'ICICI ATM – Adyar',lat:13.0063,lon:80.2560,bank:'ICICI'},
    {n:'Axis Bank ATM – Mylapore',lat:13.0366,lon:80.2674,bank:'Axis'},
    {n:'Canara Bank ATM – Egmore',lat:13.0796,lon:80.2619,bank:'Canara'},
    {n:'City Union Bank – Sholinganallur',lat:12.9014,lon:80.2277,bank:'CUB'},
    {n:'PNB ATM – Perambur',lat:13.1140,lon:80.2328,bank:'PNB'},
    {n:'Indian Bank ATM – Guindy',lat:13.0069,lon:80.2199,bank:'Indian Bank'},
  ],
  petrol:[
    {n:'Indian Oil – Anna Nagar',lat:13.0870,lon:80.2090,brand:'IOCL',fuel:'Petrol · Diesel · CNG'},
    {n:'BPCL – T. Nagar',lat:13.0416,lon:80.2343,brand:'BPCL',fuel:'Petrol · Diesel'},
    {n:'HP Petrol – Adyar',lat:13.0062,lon:80.2563,brand:'HPCL',fuel:'Petrol · Diesel'},
    {n:'Indian Oil – OMR',lat:12.9650,lon:80.2350,brand:'IOCL',fuel:'Petrol · Diesel · EV Charge'},
    {n:'BPCL – Koyambedu',lat:13.0692,lon:80.1950,brand:'BPCL',fuel:'Petrol · Diesel · CNG'},
    {n:'Shell – Guindy',lat:13.0068,lon:80.2200,brand:'Shell',fuel:'Petrol · Diesel · Premium'},
  ]
};
const SVC_CFG={
  hospitals:{icon:'🏥',color:'#ef4444',label:'Hospital'},
  police:   {icon:'🚔',color:'#3b82f6',label:'Police Station'},
  fire:     {icon:'🔥',color:'#f59e0b',label:'Fire Station'},
  pharmacy: {icon:'💊',color:'#22c55e',label:'Pharmacy'},
  blood:    {icon:'🩸',color:'#f87171',label:'Blood Bank'},
  clinics:  {icon:'🏪',color:'#14b8a6',label:'Clinic / PHC'},
  atm:      {icon:'🏧',color:'#8b5cf6',label:'ATM / Bank'},
  petrol:   {icon:'⛽',color:'#f97316',label:'Fuel Station'},
};

let cityServicesMap=null;
const svcLayers={};
let _poiSearch='';

function initCityServicesMap(){
  cityServicesMap=L.map('cityServicesMap',{zoomControl:false,attributionControl:false}).setView([LAT,LON],12);
  stadiaLayer().addTo(cityServicesMap);
  L.control.zoom({position:'bottomright'}).addTo(cityServicesMap);
  L.control.scale({position:'bottomleft',metric:true,imperial:false}).addTo(cityServicesMap);
  Object.keys(CURATED_SERVICES).forEach(type=>{
    svcLayers[type]=L.layerGroup();
    const cfg=SVC_CFG[type];
    CURATED_SERVICES[type].forEach(poi=>{
      const icon=L.divIcon({html:`<div class="poi-marker" style="background:${cfg.color}22;border-color:${cfg.color}">${cfg.icon}</div>`,iconSize:[30,30],iconAnchor:[15,15],className:''});
      L.marker([poi.lat,poi.lon],{icon}).bindPopup(buildSvcPopup(type,poi,cfg)).addTo(svcLayers[type]);
    });
    if(STATE.visibleServiceLayers.has(type))svcLayers[type].addTo(cityServicesMap);
  });
  addSvcLegend();renderPoiList();updatePoiCount();
}

function buildSvcPopup(type,poi,cfg){
  let rows='';
  if(type==='hospitals') rows=`<div class="popup-row"><span class="popup-label">Type</span><span class="popup-val">${poi.type}</span></div><div class="popup-row"><span class="popup-label">Beds</span><span class="popup-val">${poi.beds}</span></div>${poi.note?`<div class="popup-row"><span class="popup-label">Note</span><span class="popup-val">${poi.note}</span></div>`:''}`;
  if(type==='police')    rows=`<div class="popup-row"><span class="popup-label">Zone</span><span class="popup-val">${poi.zone}</span></div><div class="popup-row"><span class="popup-label">Emergency</span><span class="popup-val" style="color:#ef4444;font-weight:700">100</span></div>`;
  if(type==='fire')      rows=`<div class="popup-row"><span class="popup-label">Category</span><span class="popup-val">${poi.type}</span></div><div class="popup-row"><span class="popup-label">Emergency</span><span class="popup-val" style="color:#f59e0b;font-weight:700">101</span></div>`;
  if(type==='pharmacy')  rows=`<div class="popup-row"><span class="popup-label">Hours</span><span class="popup-val">${poi.open}</span></div>`;
  if(type==='blood')     rows=`<div class="popup-row"><span class="popup-label">Blood types</span><span class="popup-val">${poi.units}</span></div><div class="popup-row"><span class="popup-label">Note</span><span class="popup-val">${poi.note}</span></div>`;
  if(type==='clinics')   rows=`<div class="popup-row"><span class="popup-label">Type</span><span class="popup-val">${poi.note}</span></div>`;
  if(type==='atm')       rows=`<div class="popup-row"><span class="popup-label">Bank</span><span class="popup-val">${poi.bank}</span></div>`;
  if(type==='petrol')    rows=`<div class="popup-row"><span class="popup-label">Brand</span><span class="popup-val">${poi.brand}</span></div><div class="popup-row"><span class="popup-label">Fuel</span><span class="popup-val">${poi.fuel}</span></div>`;
  return`<div class="popup-title">${cfg.icon} ${poi.n}</div>${rows}<a class="popup-btn" href="https://maps.google.com?q=${poi.lat},${poi.lon}" target="_blank">📍 Open in Google Maps</a><div class="popup-source">Chennai Smart City · curated data</div>`;
}

function addSvcLegend(){
  const l=L.control({position:'bottomleft'});
  l.onAdd=function(){const d=L.DomUtil.create('div','map-legend');d.innerHTML=Object.entries(SVC_CFG).map(([k,v])=>`<div class="legend-row"><div class="legend-dot" style="background:${v.color}"></div>${v.icon} ${v.label}</div>`).join('');return d;};
  l.addTo(cityServicesMap);
}

function toggleServiceLayer(type,chip){
  if(STATE.visibleServiceLayers.has(type)){STATE.visibleServiceLayers.delete(type);if(cityServicesMap&&svcLayers[type])cityServicesMap.removeLayer(svcLayers[type]);chip.classList.add('off');}
  else{STATE.visibleServiceLayers.add(type);if(cityServicesMap&&svcLayers[type])svcLayers[type].addTo(cityServicesMap);chip.classList.remove('off');}
  renderPoiList();updatePoiCount();
}
function updatePoiCount(){let t=0;STATE.visibleServiceLayers.forEach(k=>{t+=(CURATED_SERVICES[k]||[]).length;});setText('poiCount',t+' services');}
function filterPoiList(v){_poiSearch=v.toLowerCase();renderPoiList();}
function renderPoiList(){
  const el=document.getElementById('poiListPanel');if(!el)return;
  const items=[];
  STATE.visibleServiceLayers.forEach(type=>{(CURATED_SERVICES[type]||[]).forEach(poi=>{items.push({...poi,type,cfg:SVC_CFG[type]});});});
  const f=_poiSearch?items.filter(i=>i.n.toLowerCase().includes(_poiSearch)||i.type.includes(_poiSearch)):items;
  if(!f.length){el.innerHTML='<div style="color:var(--t2);font-size:12px;padding:8px">No results.</div>';return;}
  el.innerHTML=f.map(i=>{
    let sub='';
    if(i.type==='hospitals')sub=`${i.type||''} · ${i.beds} beds`;
    else if(i.type==='police')sub=`Zone: ${i.zone||'--'}`;
    else if(i.type==='fire')sub=`${i.type2||i.type}`;
    else if(i.type==='pharmacy')sub=`Open: ${i.open||'--'}`;
    else if(i.type==='atm')sub=`Bank: ${i.bank}`;
    else if(i.type==='petrol')sub=`${i.brand} · ${i.fuel}`;
    else sub=i.note||i.cfg.label;
    return`<div class="poi-list-item" onclick="if(cityServicesMap)cityServicesMap.flyTo([${i.lat},${i.lon}],16,{duration:1.2})">
      <div class="poi-list-icon">${i.cfg.icon}</div>
      <div class="poi-list-body"><div class="poi-list-name">${i.n}</div><div class="poi-list-meta">${sub}</div></div>
      <span class="pill" style="background:${i.cfg.color}18;color:${i.cfg.color};border-color:${i.cfg.color}44;font-size:9px;flex-shrink:0">${i.cfg.label}</span>
    </div>`;
  }).join('');
}