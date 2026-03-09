/**
 * map-traffic.js — Leaflet traffic map, CMRL metro lines, corridor flow
 * Integrates TomTom traffic tile overlays
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TRAFFIC MAP
// ═══════════════════════════════════════════════════════════════════════════════
let trafficMap=null,ttFlowLayer=null,ttIncLayer=null;
const corridorLines=[];
const CORRIDORS=[
  {name:'OMR IT Corridor',from:[13.0827,80.2707],to:[12.9010,80.2279],color:'#3b82f6'},
  {name:'GST Road',from:[13.0067,80.2206],to:[12.9010,80.2180],color:'#14b8a6'},
  {name:'Anna Salai',from:[13.0836,80.2761],to:[13.0067,80.2206],color:'#8b5cf6'},
  {name:'ECR',from:[13.0368,80.2676],to:[12.8500,80.2500],color:'#f59e0b'},
  {name:'NH-44 (North)',from:[13.0836,80.2761],to:[13.2000,80.2500],color:'#22c55e'},
  {name:'Inner Ring Road',from:[13.0694,80.1948],to:[13.0067,80.2478],color:'#ef4444'},
];
const JUNCTIONS=[{name:'Kathipara Junction',lat:13.0062,lon:80.2205},{name:'Koyambedu',lat:13.0694,lon:80.1948},{name:'Gemini Flyover',lat:13.0584,lon:80.2461},{name:'Madhya Kailash',lat:12.9833,lon:80.2476},{name:'Tidel Park Junction',lat:12.9890,lon:80.2478}];
const CMRL_BLUE=[{n:'Wimco Nagar',lat:13.1347,lon:80.2888},{n:'Tirvotriyur',lat:13.1203,lon:80.2836},{n:'Kaladipet',lat:13.1137,lon:80.2808},{n:'Tondiarpet',lat:13.1012,lon:80.2734},{n:'Perambur',lat:13.0852,lon:80.2648},{n:'Washermanpet',lat:13.1055,lon:80.2916},{n:'Chennai Central',lat:13.0836,lon:80.2761},{n:'Government Estate',lat:13.0751,lon:80.2736},{n:'LIC',lat:13.0701,lon:80.2711},{n:'Egmore',lat:13.0794,lon:80.2621},{n:'AG-DMS',lat:13.0666,lon:80.2584},{n:'Teynampet',lat:13.0472,lon:80.2516},{n:'Nandanam',lat:13.0334,lon:80.2484},{n:'Saidapet',lat:13.0219,lon:80.2378},{n:'Guindy',lat:13.0067,lon:80.2206},{n:'Chennai Airport',lat:12.9940,lon:80.1736},{n:'Meenambakkam',lat:12.9828,lon:80.1690}];
const CMRL_GREEN=[{n:'St. Thomas Mount',lat:13.0050,lon:80.2094},{n:'Alandur',lat:12.9973,lon:80.2016},{n:'Ekkattuthangal',lat:13.0125,lon:80.2192},{n:'Ashok Nagar',lat:13.0297,lon:80.2124},{n:'Vadapalani',lat:13.0505,lon:80.2120},{n:'Arumbakkam',lat:13.0644,lon:80.2094},{n:'Koyambedu',lat:13.0694,lon:80.1948},{n:'CMBT',lat:13.0711,lon:80.1980},{n:'Porur',lat:13.0375,lon:80.1569},{n:'Ramapuram',lat:13.0238,lon:80.1768}];

function initTrafficMap(){
  trafficMap=L.map('trafficMap',{zoomControl:false,attributionControl:false}).setView([LAT,LON],12);
  stadiaLayer().addTo(trafficMap);
  L.control.zoom({position:'bottomright'}).addTo(trafficMap);
  L.control.scale({position:'bottomleft',metric:true,imperial:false}).addTo(trafficMap);
  L.polyline(CMRL_BLUE.map(s=>[s.lat,s.lon]),{color:'#3b82f6',weight:3,opacity:0.7,lineCap:'round'}).addTo(trafficMap);
  L.polyline(CMRL_GREEN.map(s=>[s.lat,s.lon]),{color:'#22c55e',weight:3,opacity:0.7,lineCap:'round'}).addTo(trafficMap);
  CMRL_BLUE.forEach(s=>{const i=L.divIcon({html:`<div class="metro-station" style="width:8px;height:8px;background:#3b82f6;color:#3b82f6"></div>`,iconSize:[8,8],iconAnchor:[4,4],className:''});L.marker([s.lat,s.lon],{icon:i}).addTo(trafficMap).bindPopup(`<div class="popup-title">🚇 ${s.n}</div><div class="popup-row"><span class="popup-label">Line</span><span class="popup-val"><span class="pill p-blue">Blue Line</span></span></div>`);});
  CMRL_GREEN.forEach(s=>{const i=L.divIcon({html:`<div class="metro-station" style="width:8px;height:8px;background:#22c55e;color:#22c55e"></div>`,iconSize:[8,8],iconAnchor:[4,4],className:''});L.marker([s.lat,s.lon],{icon:i}).addTo(trafficMap).bindPopup(`<div class="popup-title">🚇 ${s.n}</div><div class="popup-row"><span class="popup-label">Line</span><span class="popup-val"><span class="pill p-green">Green Line</span></span></div>`);});
  JUNCTIONS.forEach(j=>{const c=Math.floor(Math.random()*80+20);const col=c>70?'#ef4444':c>50?'#f59e0b':'#22c55e';const i=L.divIcon({html:`<div class="junc-marker" style="background:${col}18;border-color:${col};color:${col}">${j.name.split(' ')[0]}</div>`,iconSize:[100,26],iconAnchor:[50,13],className:''});L.marker([j.lat,j.lon],{icon:i}).addTo(trafficMap).bindPopup(`<div class="popup-title">🚦 ${j.name}</div><div class="popup-row"><span class="popup-label">Congestion</span><span class="popup-val" style="color:${col};font-weight:700">${c}%</span></div>`);});
  [{lat:13.0062,lon:80.2205,r:400},{lat:13.0694,lon:80.1948,r:350},{lat:13.0584,lon:80.2461,r:300},{lat:12.9890,lon:80.2478,r:300}].forEach(h=>{const lv=Math.random();const col=lv>0.7?'#ef4444':lv>0.4?'#f59e0b':'#22c55e';L.circle([h.lat,h.lon],{radius:h.r,color:col,fillColor:col,fillOpacity:0.12,weight:1.5}).addTo(trafficMap);});
  const l=L.control({position:'bottomleft'});l.onAdd=function(){const d=L.DomUtil.create('div','map-legend');d.innerHTML=`<div style="font-size:9px;color:var(--t3);margin-bottom:4px">TRAFFIC</div><div class="legend-row"><div class="legend-line" style="background:#22c55e"></div>Free flow</div><div class="legend-row"><div class="legend-line" style="background:#f59e0b"></div>Moderate</div><div class="legend-row"><div class="legend-line" style="background:#ef4444"></div>Congested</div><div style="font-size:9px;color:var(--t3);margin:6px 0 4px">METRO</div><div class="legend-row"><div class="legend-line" style="background:#3b82f6"></div>Blue Line</div><div class="legend-row"><div class="legend-line" style="background:#22c55e"></div>Green Line</div>`;return d;};l.addTo(trafficMap);
  if(TOMTOM_KEY)setTrafficLayerFn('flow');else drawCorridorLines();
}
function drawCorridorLines(){
  CORRIDORS.forEach(c=>{const spd=STATE.corridorHistory[c.name]?.slice(-1)[0]||Math.floor(Math.random()*50+10);const col=spd<25?'#ef4444':spd<40?'#f59e0b':c.color;L.polyline([c.from,c.to],{color:col,weight:10,opacity:0.08,lineCap:'round'}).addTo(trafficMap);corridorLines.push(L.polyline([c.from,c.to],{color:col,weight:4,opacity:0.85,lineCap:'round',dashArray:spd<25?'8,5':null}).addTo(trafficMap));L.polyline([c.from,c.to],{color:'#ffffff',weight:1.5,opacity:0.2,lineCap:'round',dashArray:'2,16',className:spd<25?'flow-line-slow':'flow-line-fast'}).addTo(trafficMap);});
}
function setTrafficLayer(mode,btn){document.querySelectorAll('#trafficLayerBtns .map-layer-btn').forEach(b=>b.classList.remove('active'));if(btn)btn.classList.add('active');setTrafficLayerFn(mode);}
function setTrafficLayerFn(mode){if(!trafficMap)return;if(ttFlowLayer){trafficMap.removeLayer(ttFlowLayer);ttFlowLayer=null;}if(ttIncLayer){trafficMap.removeLayer(ttIncLayer);ttIncLayer=null;}corridorLines.forEach(l=>trafficMap.removeLayer(l));corridorLines.length=0;if(TOMTOM_KEY){if(mode==='flow'||mode==='both')ttFlowLayer=L.tileLayer(`https://api.tomtom.com/traffic/map/4/tile/flow/relative0/{z}/{x}/{y}.png?key=${TOMTOM_KEY}`,{maxZoom:19,opacity:0.8}).addTo(trafficMap);if(mode==='incidents'||mode==='both')ttIncLayer=L.tileLayer(`https://api.tomtom.com/traffic/map/4/tile/incidents/{z}/{x}/{y}.png?key=${TOMTOM_KEY}`,{maxZoom:19,opacity:0.9}).addTo(trafficMap);}else drawCorridorLines();}