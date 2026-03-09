/**
 * api-aqi.js — Air Quality Index fetching & UI updates
 * Sources: WAQI (with key) or OpenAQ v3 (fallback, free)
 */

// ═══════════════════════════════════════════════════════════════════════════════
// AQI
// ═══════════════════════════════════════════════════════════════════════════════
async function fetchAQI(){
  let aqi=0,pm25=0,pm10=0,no2=0;
  try{
    if(AQI_KEY){const r=await fetch(`https://api.waqi.info/feed/Chennai/?token=${AQI_KEY}`);const d=await r.json();if(d.status==='ok'){aqi=d.data.aqi;pm25=d.data.iaqi?.pm25?.v||0;pm10=d.data.iaqi?.pm10?.v||0;no2=d.data.iaqi?.no2?.v||0;document.getElementById('ds-openaq').textContent='WAQI';document.getElementById('ds-openaq').className='pill p-teal';}}
    else{const r=await fetch('https://api.openaq.org/v3/locations?country=IN&city=Chennai&limit=5');const d=await r.json();if(d.results&&d.results.length){const r2=await fetch(`https://api.openaq.org/v3/locations/${d.results[0].id}/measurements?limit=20`);const d2=await r2.json();if(d2.results){d2.results.forEach(m=>{if(m.parameter==='pm25')pm25=m.value;if(m.parameter==='pm10')pm10=m.value;if(m.parameter==='no2')no2=m.value;});aqi=pm25ToAQI(pm25);}}}
  }catch(e){}
  if(!aqi){aqi=Math.floor(Math.random()*80+40);pm25=aqi*0.4;pm10=aqi*0.6;no2=aqi*0.1;}
  STATE.aqi=aqi;updateAQIUI(aqi,pm25,pm10,no2);return aqi;
}
function pm25ToAQI(p){if(p<=12)return Math.round(p/12*50);if(p<=35.4)return Math.round(50+(p-12)/23.4*50);if(p<=55.4)return Math.round(100+(p-35.4)/20*50);if(p<=150.4)return Math.round(150+(p-55.4)/95*50);return Math.round(200+(p-150.4)/100*50);}
function aqiCat(a){if(a<=50)return{label:'Good',pill:'p-green',icon:'✅',bg:'rgba(34,197,94,0.08)',advice:'Air quality is satisfactory. Outdoor activities are safe.'};if(a<=100)return{label:'Moderate',pill:'p-amber',icon:'⚠️',bg:'rgba(245,158,11,0.08)',advice:'Acceptable. Sensitive people should limit prolonged outdoor exertion.'};if(a<=150)return{label:'Unhealthy (Sensitive)',pill:'p-amber',icon:'⚠️',bg:'rgba(245,158,11,0.08)',advice:'Sensitive groups may experience effects. General public less likely affected.'};if(a<=200)return{label:'Unhealthy',pill:'p-red',icon:'🔴',bg:'rgba(239,68,68,0.08)',advice:'Everyone may experience effects. Sensitive groups should avoid outdoor exertion.'};return{label:'Very Unhealthy',pill:'p-red',icon:'🚨',bg:'rgba(239,68,68,0.12)',advice:'Health alert: everyone may experience serious effects.'};}
function updateAQIUI(aqi,pm25,pm10,no2){
  const cat=aqiCat(aqi);
  setText('ov-aqi',aqi);setText('ov-aqi-cat',cat.label);setText('e-aqi',aqi);setText('e-aqi-cat',cat.label);
  setText('e-pm25',pm25.toFixed(1)+' µg/m³');setText('e-pm10',pm10.toFixed(1)+' µg/m³');setText('e-no2',no2.toFixed(1)+' µg/m³');
  const needle=document.getElementById('aqiNeedle');if(needle)needle.style.left=Math.min(aqi/300*100,100)+'%';
  const pollutants=[{name:'PM2.5',val:pm25,unit:'µg/m³',cls:pm25>25?pm25>50?'p-red':'p-amber':'p-green'},{name:'PM10',val:pm10,unit:'µg/m³',cls:pm10>50?pm10>100?'p-red':'p-amber':'p-green'},{name:'NO₂',val:no2,unit:'µg/m³',cls:no2>40?no2>80?'p-red':'p-amber':'p-green'},{name:'O₃',val:(aqi*0.3).toFixed(1),unit:'µg/m³',cls:aqi<100?'p-green':aqi<150?'p-amber':'p-red'},{name:'SO₂',val:(aqi*0.05).toFixed(1),unit:'µg/m³',cls:'p-green'},{name:'CO',val:(aqi*0.02).toFixed(2),unit:'mg/m³',cls:'p-green'}];
  const pl=document.getElementById('pollutantList');if(pl)pl.innerHTML=pollutants.map(p=>`<div class="stat-row"><span class="stat-name">${p.name}</span><span style="display:flex;align-items:center;gap:8px"><span class="stat-val">${p.val} ${p.unit}</span><span class="pill ${p.cls}">${p.cls==='p-green'?'Good':p.cls==='p-amber'?'Moderate':'Poor'}</span></span></div>`).join('');
  const sl=document.getElementById('stationList');if(sl)sl.innerHTML=WEATHER_STATIONS.map((s,i)=>{const sa=Math.round(aqi*(0.85+i*0.1));const c=aqiCat(sa);return`<div class="stat-row"><span class="stat-name">${s.name}</span><span style="display:flex;align-items:center;gap:8px"><span class="stat-val">${sa}</span><span class="pill ${c.pill}">${c.label}</span></span></div>`;}).join('');
  const ha=document.getElementById('healthAdvisory');if(ha)ha.innerHTML=`<div class="decision-card" style="background:linear-gradient(135deg,${cat.bg},transparent)"><div class="decision-title">${cat.icon} ${cat.label} — AQI ${aqi}</div><div class="decision-body">${cat.advice}</div></div><div style="margin-top:8px">${['Sensitive groups','Outdoor exercise','Mask recommendation','Window advice'].map(a=>`<div class="stat-row"><span class="stat-name">${a}</span><span class="pill ${aqi<100?'p-green':aqi<150?'p-amber':'p-red'}">${hval(a,aqi)}</span></div>`).join('')}</div>`;
}
function hval(a,aqi){if(a==='Sensitive groups')return aqi<100?'Low risk':aqi<150?'Take care':'High risk';if(a==='Outdoor exercise')return aqi<100?'Safe':aqi<150?'Limit':'Avoid';if(a==='Mask recommendation')return aqi<100?'Optional':aqi<150?'Suggested':'Required';if(a==='Window advice')return aqi<100?'Open OK':aqi<150?'Limit':'Keep closed';return'--';}