/**
 * dashboard.js — Overview, AI Decision Engine, System Alerts, Charts
 * Core dashboard orchestration logic
 */

// ═══════════════════════════════════════════════════════════════════════════════
// OVERVIEW + AI + ALERTS
// ═══════════════════════════════════════════════════════════════════════════════
const ZONES=[{name:'T. Nagar',lat:13.0418,lon:80.2341},{name:'Anna Nagar',lat:13.0869,lon:80.2094},{name:'Adyar',lat:13.0067,lon:80.2561},{name:'Egmore',lat:13.0794,lon:80.2618},{name:'Mylapore',lat:13.0368,lon:80.2676},{name:'Perambur',lat:13.1142,lon:80.2330},{name:'Sholinganallur',lat:12.9010,lon:80.2279},{name:'Guindy',lat:13.0067,lon:80.2206}];

function updateOverviewHero(weather,aqi,avgSpeed){
  const w=weather||{},temp=w.temperature_2m??null,feels=w.apparent_temperature??null;
  const humid=w.relative_humidity_2m??null,rain=w.precipitation_probability??null;
  const wind=w.wind_speed_10m??null,vis=w.visibility?(w.visibility/1000).toFixed(1):null;
  setText('ov-temp',temp!=null?temp.toFixed(1)+'°':'--°');setText('ov-feels',feels!=null?'Feels like '+feels.toFixed(1)+'°':'--');
  setText('ov-aqi',aqi!=null?aqi:'---');setText('ov-aqi-cat',aqiCat(aqi||0).label);
  setText('ov-humid',humid!=null?humid+'%':'--%');setText('ov-wind-sub',wind!=null?'Wind '+wind+' km/h':'--');
  setText('ov-rain',rain!=null?rain+'%':'--%');setText('ov-vis-sub',vis?'Vis. '+vis+' km':'--');
  const cong=CORRIDORS.filter(c=>(STATE.corridorHistory[c.name]||[]).slice(-1)[0]<25).length;
  setText('ov-traffic',cong>2?'Heavy':cong>0?'Moderate':'Light');setText('ov-traffic-sub','Avg '+(avgSpeed||'--')+' km/h');
  colorHC('hc-temp',temp>35?'red':temp>30?'amber':'blue');colorHC('hc-aqi',aqi>150?'red':aqi>100?'amber':'green');colorHC('hc-traffic',cong>2?'red':cong>0?'amber':'green');colorHC('hc-rain',rain>70?'blue':rain>40?'purple':null);
  setGauge('gauge-aqi',aqi||0,300,aqi>150?'#ef4444':aqi>100?'#f59e0b':'#22c55e');setGauge('gauge-humid',humid||0,100,'#3b82f6');setGauge('gauge-rain',rain||0,100,'#8b5cf6');setGauge('gauge-traffic',Math.min(avgSpeed||0,80),80,'#14b8a6');
  setText('gauge-aqi-val',aqi||'--');setText('gauge-aqi-cat',aqiCat(aqi||0).label);setText('gauge-humid-val',(humid||'--')+'%');setText('gauge-rain-val',(rain||'--')+'%');setText('gauge-traffic-val',avgSpeed||'--');
}
function colorHC(id,color){const el=document.getElementById(id);if(!el||!color)return;const m={red:'rgba(239,68,68,0.3)',amber:'rgba(245,158,11,0.25)',green:'rgba(34,197,94,0.25)',blue:'rgba(59,130,246,0.25)',purple:'rgba(139,92,246,0.25)'};el.style.borderColor=m[color]||'';}
function setGauge(id,value,max,color){const el=document.getElementById(id);if(!el)return;const o=201-Math.min(value/max,1)*201;el.style.strokeDashoffset=o;el.style.stroke=color;}
function updateZoneStatus(){
  const grid=document.getElementById('zoneStatusGrid');if(!grid)return;
  const aqi=STATE.aqi||0,nt=STATE.news.map(n=>n.title.toLowerCase());
  grid.innerHTML=ZONES.map(z=>{const hasNews=nt.some(t=>t.includes(z.name.toLowerCase().split(' ')[0]));const col=hasNews?'#ef4444':aqi>150?'#ef4444':aqi>100?'#f59e0b':'#22c55e';const label=hasNews?'Alert':aqi>100?'Moderate':'Normal';return`<div class="zone-chip"><div class="zone-chip-dot" style="background:${col};box-shadow:0 0 5px ${col}88"></div><span style="flex:1;font-size:11px">${z.name}</span><span style="font-size:10px;color:${col};font-family:'Geist Mono',monospace">${label}</span></div>`;}).join('');
}
function updateOvNewsFeed(){
  const el=document.getElementById('ovNewsFeed');if(!el)return;const count=document.getElementById('ov-news-count');if(count)count.textContent=STATE.news.length+' articles';
  if(!STATE.news.length){el.innerHTML='<div style="color:var(--t2);font-size:12px;padding:8px">Loading headlines…</div>';return;}
  el.innerHTML=STATE.news.slice(0,18).map(n=>{const srcColor={'The Hindu':'#3b82f6','Times of India':'#ef4444','New Indian Express':'#f59e0b','OneIndia':'#22c55e'}[n.source]||'#8b5cf6';return`<div class="ov-news-item" onclick="window.open('${n.link}','_blank')"><div class="ov-news-title">${n.title}</div><div class="ov-news-meta"><span class="ov-news-src" style="color:${srcColor}">${n.source}</span><span>·</span><span>${n.pub?timeSince(new Date(n.pub)):'recent'}</span></div></div>`;}).join('');
}
function drawActivityChart(){
  const canvas=document.getElementById('activityCanvas');if(!canvas)return;
  const dpr=window.devicePixelRatio||1,rect=canvas.getBoundingClientRect();
  canvas.width=rect.width*dpr;canvas.height=80*dpr;
  const ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);const W=rect.width,H=80;
  const tp=[5,3,3,3,4,8,20,45,65,55,45,40,50,45,40,50,70,80,65,45,30,20,12,7];
  const ap=[40,38,36,35,36,40,52,65,72,68,63,60,65,68,65,60,58,62,65,60,55,50,46,43];
  const rp=[20,18,15,15,20,25,30,25,20,20,25,30,35,40,45,50,55,50,45,40,35,30,25,22];
  const norm=a=>{const mx=Math.max(...a),mn=Math.min(...a);return a.map(v=>(v-mn)/(mx-mn));};
  function drawLine(data,color,dashed){
    ctx.beginPath();ctx.strokeStyle=color;ctx.lineWidth=1.5;ctx.lineJoin='round';ctx.lineCap='round';
    if(dashed)ctx.setLineDash([3,4]);else ctx.setLineDash([]);
    data.forEach((v,i)=>{const x=i*(W/23),y=8+(1-v)*64;i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);});
    ctx.stroke();
    ctx.beginPath();data.forEach((v,i)=>{const x=i*(W/23),y=8+(1-v)*64;i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);});
    ctx.lineTo(23*(W/23),H);ctx.lineTo(0,H);ctx.closePath();
    const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,color.replace('rgb','rgba').replace(')',',0.15)'));g.addColorStop(1,color.replace('rgb','rgba').replace(')',',0)'));
    ctx.fillStyle=g;ctx.fill();ctx.setLineDash([]);
  }
  ctx.strokeStyle='rgba(255,255,255,0.04)';ctx.lineWidth=1;for(let i=0;i<=4;i++){const y=8+(i/4)*64;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
  drawLine(norm(rp),'rgb(139,92,246)',true);drawLine(norm(ap),'rgb(34,197,94)',false);drawLine(norm(tp),'rgb(59,130,246)',false);
  const now=new Date(),cx=((now.getHours()+now.getMinutes()/60)/23)*W;
  ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.lineWidth=1;ctx.setLineDash([2,3]);ctx.beginPath();ctx.moveTo(cx,0);ctx.lineTo(cx,H);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle='rgba(255,255,255,0.6)';ctx.beginPath();ctx.arc(cx,H/2,3,0,Math.PI*2);ctx.fill();
}
function generateSystemAlerts(){
  const aqi=STATE.aqi||80,rain=STATE.rainProb||30,alerts=[];
  if(aqi>150)alerts.push({type:'red',icon:'🚨',msg:`Critical AQI ${aqi} — Issue health advisory. Activate hospital respiratory protocols.`,cat:'Environment'});
  else if(aqi>100)alerts.push({type:'amber',icon:'⚠️',msg:`Moderate AQI ${aqi} — Monitor trends. Advisory for sensitive groups.`,cat:'Environment'});
  if(rain>70)alerts.push({type:'blue',icon:'🌧',msg:`Heavy rain probability ${rain}% — Alert flood-prone zones. Pre-position pumping units.`,cat:'Weather'});
  else if(rain>50)alerts.push({type:'amber',icon:'🌦',msg:`Rain expected (${rain}%) — Deploy traffic wardens at key intersections.`,cat:'Traffic'});
  alerts.push({type:'green',icon:'✅',msg:'CMRL Blue & Green lines operating normally — All 41 stations active.',cat:'Transit'});
  alerts.push({type:'green',icon:'🏥',msg:'All 12 major hospitals reporting normal operational capacity.',cat:'Health'});
  alerts.push({type:'teal',icon:'🔄',msg:`Data refresh cycle: ${new Date().toLocaleTimeString('en-IN',{hour12:false})} — Next refresh in 5 minutes.`,cat:'System'});
  if(STATE.weather?.wind_speed_10m>30)alerts.push({type:'amber',icon:'💨',msg:`High wind ${STATE.weather.wind_speed_10m} km/h — Caution advised for coastal & high-rise areas.`,cat:'Weather'});
  const el=document.getElementById('systemAlerts');
  if(el)el.innerHTML=alerts.map(a=>{const cp=a.type==='blue'?'blue':a.type==='teal'?'teal':a.type==='amber'?'amber':a.type==='red'?'red':'green';return`<div class="alert-item"><div class="alert-dot" style="background:var(--${cp})"></div><div><div class="alert-text">${a.icon} ${a.msg}</div><div class="alert-meta">${new Date().toLocaleTimeString('en-IN',{hour12:false})} <span class="pill p-${cp}" style="font-size:10px;padding:2px 6px">${a.cat}</span></div></div></div>`;}).join('');
  const warn=alerts.filter(a=>a.type==='red'||a.type==='amber').length;
  setText('ov-alerts',alerts.length);setText('ov-alerts-sub',warn+' warning'+(warn!==1?'s':''));colorHC('hc-alerts',warn>2?'red':warn>0?'amber':'green');
}
function generateAIDecisions(){
  const aqi=STATE.aqi||80,rain=STATE.rainProb||30,temp=STATE.temp||30,wind=STATE.windSpeed||10;
  const dirs=['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  const wdir=dirs[Math.round(STATE.windDir/22.5)%16];
  const decisions=[
    {icon:'🏙',title:'Urban Mobility',body:`Current avg speed ${Math.floor(Math.random()*30+20)} km/h. ${rain>50?'Rain imminent — recommend adaptive signal timing on Anna Salai & OMR.':'Traffic nominal. No signal intervention required.'} ${aqi>100?'Suggest alternate routing through Rajiv Gandhi Salai to reduce vehicle idling in congested areas.':''}`},
    {icon:'🌬',title:'Environmental Action',body:`AQI ${aqi} (${aqiCat(aqi).label}). ${aqi>150?'🔴 Emergency protocol: restrict heavy commercial vehicles in T. Nagar & Egmore. Activate water sprinklers on OMR.':aqi>100?'⚠ Issue public advisory. Sensitive populations advised to limit outdoor exposure between 10am–6pm.':'✅ Air quality within acceptable limits. Continue standard monitoring.'}`},
    {icon:'🌧',title:'Weather Preparedness',body:`Rain ${rain}%. Wind: ${wind} km/h ${wdir}. Temp: ${temp.toFixed(0)}°C. ${rain>60?'🟡 Deploy storm drain inspection teams. Alert Adyar & Cooum river flood warning systems.':rain>40?'Stand by: pre-position pump sets in Velachery, Saidapet low-lying areas.':'No immediate weather action. Monitor for Bay of Bengal pressure systems.'}`},
    {icon:'🏥',title:'Health Services Readiness',body:`${aqi>150?'Activate respiratory patient surge protocols at GH and Apollo. Notify 108 ambulance dispatch for increased response time monitoring. ':''}${rain>60?'Pre-alert Stanley Hospital and Kilpauk Medical College for potential flood-related injuries. ':''}All 12 major hospitals reporting normal operational capacity.`},
    {icon:'🚔',title:'Public Safety Ops',body:`${rain>60?'Deploy traffic police to flood-prone intersections: Kathipara, Koyambedu, Madhya Kailash. Coordinate with NDRF. ':'Routine patrol operations active across all zones. '}${aqi>150?'Issue mask advisory through all 12 police zones via public PA systems.':'Safety indices normal.'}`},
    {icon:'⚡',title:'Smart Grid Optimization',body:`Estimated demand index: ${(aqi/100+temp/40).toFixed(2)}. ${temp>35?'Peak cooling load expected — coordinate with TANGEDCO for load balancing across North and South Chennai feeders.':'Grid conditions normal. Solar output from rooftop installations optimal.'}`},
  ];
  if(STATE.news.length){const h=STATE.news[0];decisions.push({icon:'📰',title:'News Intelligence',body:`Latest headline: "${h.title.slice(0,80)}…" — Assess for city operations impact. Source: ${h.source}`});}
  const el=document.getElementById('aiDecisions');if(el)el.innerHTML=decisions.map(d=>`<div class="decision-card"><div class="decision-title">${d.icon} ${d.title}</div><div class="decision-body">${d.body}</div></div>`).join('');
  const pill=document.getElementById('ai-status-pill');if(pill){pill.textContent=decisions.length+' active';pill.className='pill p-green';}
}
let refreshCountdown=300;
function tickCountdown(){refreshCountdown=Math.max(0,refreshCountdown-1);const m=Math.floor(refreshCountdown/60),s=refreshCountdown%60;setText('ds-next',m+':'+(s<10?'0':'')+s);if(refreshCountdown===0)refreshCountdown=300;}
setInterval(tickCountdown,1000);
function setText(id,val){const e=document.getElementById(id);if(e)e.textContent=val;}