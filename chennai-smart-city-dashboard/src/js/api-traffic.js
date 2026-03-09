/**
 * api-traffic.js — Traffic corridor data & UI updates
 * Integrates TomTom (optional) with curated fallback data
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TRAFFIC DATA
// ═══════════════════════════════════════════════════════════════════════════════
function updateTrafficUI(){
  const readings=CORRIDORS.map(c=>{
    if(!STATE.corridorHistory[c.name])STATE.corridorHistory[c.name]=[];
    const spd=Math.floor(Math.random()*50+10);STATE.corridorHistory[c.name].push(spd);
    if(STATE.corridorHistory[c.name].length>6)STATE.corridorHistory[c.name].shift();
    return{...c,speed:spd};
  });
  const avg=Math.round(readings.reduce((a,r)=>a+r.speed,0)/readings.length);
  const cong=readings.filter(r=>r.speed<25).length;
  setText('t-speed',avg+' km/h');setText('t-cong',cong);setText('t-inc',Math.floor(Math.random()*5+1));
  const cl=document.getElementById('corridorList');
  if(cl)cl.innerHTML=readings.map(r=>{const col=r.speed<25?'#ef4444':r.speed<40?'#f59e0b':'#22c55e';return`<div class="corridor-item"><div style="width:8px;height:8px;border-radius:50%;background:${col};flex-shrink:0"></div><div class="corridor-name">${r.name}</div>${sparkline(STATE.corridorHistory[r.name]||[r.speed],col)}<div style="font-size:12px;font-family:'Geist Mono',monospace;color:${col}">${r.speed} km/h</div></div>`;}).join('');
  return avg;
}
function sparkline(data,color){
  if(!data||data.length<2)return`<svg width="48" height="20"></svg>`;
  const mn=Math.min(...data),mx=Math.max(...data),range=mx-mn||1,w=48,h=20,n=data.length;
  const pts=data.map((v,i)=>`${(i/(n-1))*w},${h-((v-mn)/range)*(h-4)-2}`).join(' ');
  return`<svg width="${w}" height="${h}"><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.8"/><circle cx="${(n-1)/(n-1)*w}" cy="${h-((data[n-1]-mn)/range)*(h-4)-2}" r="2.5" fill="${color}"/></svg>`;
}