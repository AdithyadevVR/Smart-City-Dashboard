/**
 * data-tourism.js — Tourism & attractions POI data
 * Heritage, Temples, Beaches, Museums, Malls, Restaurants, Hotels, Transport
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TOURISM DATA
// ═══════════════════════════════════════════════════════════════════════════════
const TOURISM_DATA={
  heritage:[
    {n:'Fort St. George',lat:13.0797,lon:80.2855,icon:'🏰',desc:"India's oldest British fort (1644). Museum & St. Mary's Church inside.",rating:4.6,tip:'Museum open Sat–Thu 9am–5pm. Free entry.'},
    {n:'Kapaleeshwarar Temple',lat:13.0357,lon:80.2694,icon:'🛕',desc:'6th century Dravidian Shiva temple, Mylapore.',rating:4.8,tip:'Visit at dawn — breathtaking gopuram in morning light.'},
    {n:'Basilica of Santhome',lat:13.0295,lon:80.2779,icon:'⛪',desc:"16th century Portuguese church built over St. Thomas's tomb.",rating:4.7,tip:'Catacombs tour available. Peaceful & air-conditioned.'},
    {n:'Parthasarathy Temple',lat:13.0495,lon:80.2771,icon:'🛕',desc:"8th century Vishnu temple — oldest in Chennai. Triplicane.",rating:4.5,tip:'Quiet weekday mornings are best. Heritage neighbourhood nearby.'},
    {n:'Chepauk Palace',lat:13.0640,lon:80.2780,icon:'🏛',desc:'Nawab\'s Saracenic architecture palace, now TNPSC offices.',rating:4.3,tip:'Visible from road. Exterior photography allowed.'},
    {n:'Vivekananda House (Ice House)',lat:13.0626,lon:80.2913,icon:'🏛',desc:'Where Swami Vivekananda stayed in 1897. Now a museum.',rating:4.6,tip:'Free entry. 20-min guided tour available.'},
  ],
  temples:[
    {n:'Vadapalani Murugan Temple',lat:13.0502,lon:80.2113,icon:'🛕',desc:'Most visited temple in Chennai. Huge crowds on Fridays.',rating:4.8,tip:'Go early morning (6–8am) to avoid queues.'},
    {n:'Marundeeshwarar Temple – Thiruvanmiyur',lat:12.9870,lon:80.2609,icon:'🛕',desc:'Ancient Shiva temple on ECR. Famous for healing powers.',rating:4.7,tip:'Best during Panguni Uthiram festival (March/April).'},
    {n:'Arulmigu Abirami Amman Temple',lat:13.0950,lon:80.2730,icon:'🛕',desc:'Royapuram heritage temple, ornate architecture.',rating:4.5,tip:'Quiet early mornings. Beautiful lamp-lighting at dusk.'},
    {n:'Sri Kanchi Kamakoti Mutt',lat:13.0725,lon:80.2540,icon:'🛕',desc:'Holy mutt with visits by Kanchi Sankaracharya.',rating:4.6,tip:'Spiritual discourses held regularly. Check schedule.'},
    {n:'Pazhamudhircholai – Adyar',lat:13.0080,lon:80.2500,icon:'🛕',desc:'Murugan temple by the Adyar river. Peaceful setting.',rating:4.3,tip:'Sunset view of the river is spectacular.'},
  ],
  beaches:[
    {n:'Marina Beach',lat:13.0542,lon:80.2824,icon:'🏖',desc:"World's second longest natural urban beach — 13 km of golden sand.",rating:4.6,tip:'5–8am is magical: sunrise, vendors, joggers. Avoid 11am–4pm heat.'},
    {n:"Elliot's Beach (Besant Nagar)",lat:12.9982,lon:80.2744,icon:'🏖',desc:'Cleaner, calmer beach. Trendy cafes and restaurants nearby.',rating:4.4,tip:'Evening walk + dinner at Elliot\'s Beach Road cafes. Very popular weekends.'},
    {n:'Thiruvanmiyur Beach',lat:12.9817,lon:80.2695,icon:'🏖',desc:'Quiet residential beach with a nice park.',rating:4.1,tip:'Great for families. Less crowded than Marina.'},
    {n:'Covelong Beach',lat:12.7932,lon:80.2513,icon:'🏄',desc:'Surf destination 40 km south on ECR. Beginner-friendly.',rating:4.5,tip:'Surf lessons ₹500–1000. Best Oct–Feb. Great seafood shacks.'},
    {n:'Pulicat Lake Shore',lat:13.4183,lon:80.3167,icon:'🦩',desc:'Flamingo & pelican sanctuary 60 km north of Chennai.',rating:4.4,tip:'Best Nov–Jan for 30,000+ migratory birds.'},
  ],
  museums:[
    {n:'Government Museum Chennai',lat:13.0673,lon:80.2466,icon:'🏛',desc:'Largest museum complex in India. Bronze gallery is world-class.',rating:4.5,tip:'Closed Fridays. Allow 3+ hours. Bronze Hall is unmissable.'},
    {n:'National Art Gallery',lat:13.0672,lon:80.2468,icon:'🖼',desc:'Indo-Saracenic building housing Tanjore paintings.',rating:4.4,tip:'Same campus as Government Museum — combine visits.'},
    {n:'Birla Planetarium',lat:13.0607,lon:80.2417,icon:'🔭',desc:'Largest planetarium in India. Sky shows on a giant dome.',rating:4.3,tip:'Shows at fixed times — check schedule before visiting.'},
    {n:'DakshinaChitra – Muttukadu',lat:12.8508,lon:80.2376,icon:'🏺',desc:'Living museum of South Indian folk arts & crafts.',rating:4.6,tip:'30 km on ECR. Great for weekends. Allow 3 hours.'},
    {n:'Ripon Building',lat:13.0855,lon:80.2726,icon:'🏛',desc:'1913 Chennai Corporation building — heritage architecture.',rating:4.2,tip:'Exterior only. Beautiful at night with lighting.'},
  ],
  malls:[
    {n:'Express Avenue Mall',lat:13.0607,lon:80.2603,icon:'🛍',desc:'Largest mall in South India. 300+ stores.',rating:4.3,open:'10am – 10pm'},
    {n:'Phoenix MarketCity',lat:12.9950,lon:80.2200,icon:'🛍',desc:'Premium retail, entertainment & dining. Velachery.',rating:4.4,open:'11am – 10pm'},
    {n:'VR Chennai',lat:13.0637,lon:80.2051,icon:'🛍',desc:'Premium mall off NH-48. IKEA nearby.',rating:4.2,open:'11am – 10pm'},
    {n:'Spencer Plaza – Anna Salai',lat:13.0637,lon:80.2620,icon:'🛍',desc:'Oldest mall in India. Anna Salai landmark.',rating:3.9,open:'10am – 9pm'},
    {n:'Citi Centre – Mylapore',lat:13.0380,lon:80.2545,icon:'🛍',desc:'Compact upmarket mall.',rating:4.1,open:'10am – 9pm'},
  ],
  restaurants:[
    {n:'Saravana Bhavan – T. Nagar',lat:13.0418,lon:80.2360,icon:'🍽',desc:'The iconic Chennai vegetarian chain. Legendary thali.',rating:4.3,cuisine:'South Indian Veg',tip:'Expect queues on weekends. Worth the wait.'},
    {n:'Murugan Idli Shop – T. Nagar',lat:13.0415,lon:80.2355,icon:'🍚',desc:'Legendary soft idlis. A Chennai institution since 1969.',rating:4.6,cuisine:'Idli & Dosa specialist',tip:'Order the sambar separately. Gets busy after 8am.'},
    {n:'Hotel Palmshore – Marina',lat:13.0558,lon:80.2822,icon:'🦞',desc:'Sea-facing restaurant. Authentic Tamil seafood.',rating:4.1,cuisine:'Seafood & Tamil'},
    {n:'Buhari Hotel – Anna Salai',lat:13.0598,lon:80.2541,icon:'🍗',desc:'Legendary since 1951. Famous chicken 65 origin.',rating:4.2,cuisine:'Classic non-veg',tip:'Try the chicken biriyani and fish curry.'},
    {n:'Junior Kuppanna – Perambur',lat:13.1005,lon:80.2430,icon:'🍛',desc:'Authentic Kongu Nadu cuisine. Must-try brains & goat.',rating:4.5,cuisine:'Kongu Nadu',tip:'Visit for Sunday breakfast. Packed with locals.'},
    {n:'Ponnusamy Hotel – Egmore',lat:13.0770,lon:80.2595,icon:'🍲',desc:'Old-school biriyani and kari. No-frills, outstanding food.',rating:4.4,cuisine:'Non-Veg Tamil'},
  ],
  hotels:[
    {n:'The Leela Palace Chennai',lat:12.9955,lon:80.2493,icon:'🏨',desc:'5-star. Old Mahabalipuram Road.',rating:4.8,price:'₹15k–30k/night'},
    {n:'ITC Grand Chola',lat:13.0031,lon:80.2204,icon:'🏨',desc:'Largest hotel in South India. Chola-inspired architecture.',rating:4.8,price:'₹12k–25k/night'},
    {n:'Taj Coromandel',lat:13.0583,lon:80.2455,icon:'🏨',desc:'Heritage luxury. Nungambakkam.',rating:4.7,price:'₹10k–20k/night'},
    {n:'Hyatt Regency Chennai',lat:13.0619,lon:80.2390,icon:'🏨',desc:'Modern business hotel. Great rooftop bar.',rating:4.5,price:'₹8k–15k/night'},
    {n:'Novotel Chennai OMR',lat:12.9630,lon:80.2382,icon:'🏨',desc:'IT corridor hotel. Business-friendly, good pool.',rating:4.3,price:'₹5k–9k/night'},
    {n:'GRT Grand – T. Nagar',lat:13.0440,lon:80.2330,icon:'🏨',desc:'Mid-range, great T. Nagar location.',rating:4.3,price:'₹3k–6k/night'},
  ],
  transport:[
    {n:'Chennai Central Railway Station',lat:13.0836,lon:80.2761,icon:'🚂',desc:'Main intercity & express trains. Blue line metro inside.',type:'Rail'},
    {n:'Chennai Egmore Station',lat:13.0784,lon:80.2621,icon:'🚆',desc:'Southern routes — Pondicherry, Tiruchendur, Madurai.',type:'Rail'},
    {n:'CMBT Bus Terminus – Koyambedu',lat:13.0711,lon:80.1980,icon:'🚌',desc:'Largest bus terminus in Asia. Interstate + city buses.',type:'Bus',tip:'Arrive 30 min early. Platform numbers on overhead boards.'},
    {n:'Chennai Airport',lat:13.0012,lon:80.1624,icon:'✈️',desc:'International + Domestic terminal. Metro connected.',type:'Air'},
    {n:'Chennai Metro – Central',lat:13.0836,lon:80.2761,icon:'🚇',desc:'Blue line hub. Token & smart card at counters.',type:'Metro'},
    {n:'Koyambedu Metro Interchange',lat:13.0694,lon:80.1948,icon:'🚇',desc:'Blue + Green line interchange station.',type:'Metro'},
    {n:'MGR Suburban Rail Hub',lat:13.0835,lon:80.2762,icon:'🚉',desc:'Chennai suburban rail. EMU trains to all suburbs.',type:'Suburban'},
  ],
};
const TOUR_CFG={
  heritage:    {icon:'🏛',color:'#f59e0b',label:'Heritage'},
  temples:     {icon:'🛕',color:'#f97316',label:'Temple'},
  beaches:     {icon:'🏖',color:'#3b82f6',label:'Beach'},
  museums:     {icon:'🏛',color:'#8b5cf6',label:'Museum'},
  malls:       {icon:'🛍',color:'#14b8a6',label:'Shopping'},
  restaurants: {icon:'🍽',color:'#22c55e',label:'Restaurant'},
  hotels:      {icon:'🏨',color:'#60a5fa',label:'Hotel'},
  transport:   {icon:'🚌',color:'#94a3b8',label:'Transport Hub'},
};

let tourismMap=null;
const tourLayers={};

function initTourismMap(){
  tourismMap=L.map('tourismMap',{zoomControl:false,attributionControl:false}).setView([LAT,LON],12);
  stadiaLayer().addTo(tourismMap);
  L.control.zoom({position:'bottomright'}).addTo(tourismMap);
  L.control.scale({position:'bottomleft',metric:true,imperial:false}).addTo(tourismMap);
  Object.keys(TOURISM_DATA).forEach(type=>{
    tourLayers[type]=L.layerGroup();
    const cfg=TOUR_CFG[type];
    TOURISM_DATA[type].forEach(poi=>{
      const icon=L.divIcon({html:`<div class="poi-marker" style="background:${cfg.color}22;border-color:${cfg.color};font-size:15px">${poi.icon||cfg.icon}</div>`,iconSize:[30,30],iconAnchor:[15,15],className:''});
      L.marker([poi.lat,poi.lon],{icon}).bindPopup(buildTourPopup(type,poi,cfg)).addTo(tourLayers[type]);
    });
    if(STATE.visibleTourLayers.has(type))tourLayers[type].addTo(tourismMap);
  });
  addTourLegend();renderAttractionList();updateTourPoiCount();updateTourismWeatherTip();
}

function buildTourPopup(type,poi,cfg){
  const rating=poi.rating?`<div class="popup-row"><span class="popup-label">Rating</span><span class="popup-val" style="color:#f59e0b">★ ${poi.rating}/5</span></div>`:'';
  const price=poi.price?`<div class="popup-row"><span class="popup-label">Price</span><span class="popup-val">${poi.price}</span></div>`:'';
  const open=poi.open?`<div class="popup-row"><span class="popup-label">Hours</span><span class="popup-val">${poi.open}</span></div>`:'';
  const cuisine=poi.cuisine?`<div class="popup-row"><span class="popup-label">Cuisine</span><span class="popup-val">${poi.cuisine}</span></div>`:'';
  const ttype=poi.type?`<div class="popup-row"><span class="popup-label">Type</span><span class="popup-val">${poi.type}</span></div>`:'';
  const tip=poi.tip?`<div class="popup-tip">💡 ${poi.tip}</div>`:'';
  return`<div class="popup-title">${poi.icon||cfg.icon} ${poi.n}</div>
    <div style="font-size:11px;color:var(--t2);margin-bottom:6px;line-height:1.5">${poi.desc||''}</div>
    ${rating}${price}${open}${cuisine}${ttype}
    <a class="popup-btn" href="https://maps.google.com?q=${poi.lat},${poi.lon}" target="_blank">📍 Get Directions</a>${tip}`;
}

function addTourLegend(){
  const l=L.control({position:'bottomleft'});
  l.onAdd=function(){const d=L.DomUtil.create('div','map-legend');d.innerHTML=Object.entries(TOUR_CFG).map(([k,v])=>`<div class="legend-row"><div class="legend-dot" style="background:${v.color}"></div>${v.icon} ${v.label}</div>`).join('');return d;};
  l.addTo(tourismMap);
}

function toggleTourLayer(type,chip){
  if(STATE.visibleTourLayers.has(type)){STATE.visibleTourLayers.delete(type);if(tourismMap&&tourLayers[type])tourismMap.removeLayer(tourLayers[type]);chip.classList.add('off');}
  else{STATE.visibleTourLayers.add(type);if(tourismMap&&tourLayers[type])tourLayers[type].addTo(tourismMap);chip.classList.remove('off');}
  renderAttractionList();updateTourPoiCount();
}

function updateTourPoiCount(){let t=0;STATE.visibleTourLayers.forEach(k=>{t+=(TOURISM_DATA[k]||[]).length;});setText('tourPoiCount',t+' places');}

function renderAttractionList(){
  const el=document.getElementById('attractionList');if(!el)return;
  const items=[];
  STATE.visibleTourLayers.forEach(type=>{(TOURISM_DATA[type]||[]).forEach(poi=>{items.push({...poi,type,cfg:TOUR_CFG[type]});});});
  items.sort((a,b)=>(b.rating||0)-(a.rating||0));
  el.innerHTML=items.map(i=>`<div class="tour-card" onclick="if(tourismMap)tourismMap.flyTo([${i.lat},${i.lon}],16,{duration:1.2})">
    <div class="tour-card-header">
      <div class="tour-card-icon">${i.icon||i.cfg.icon}</div>
      <div style="flex:1;min-width:0">
        <div class="tour-card-title" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${i.n}</div>
        <div class="tour-card-cat">${i.cfg.label}</div>
      </div>
      ${i.rating?`<div style="font-size:12px;color:#f59e0b;font-family:'Geist Mono',monospace;flex-shrink:0;font-weight:700">★${i.rating}</div>`:''}
    </div>
    <div class="tour-card-desc">${(i.desc||'').slice(0,90)}${(i.desc||'').length>90?'…':''}</div>
    ${i.tip?`<div class="tour-card-tip">💡 ${i.tip.slice(0,70)}${i.tip.length>70?'…':''}</div>`:''}
    <div class="tour-card-footer">
      <span class="pill" style="background:${i.cfg.color}18;color:${i.cfg.color};border-color:${i.cfg.color}44;font-size:9px">${i.cfg.label}</span>
      ${i.open?`<span class="pill p-teal" style="font-size:9px">${i.open}</span>`:''}
      ${i.price?`<span class="pill p-purple" style="font-size:9px">${i.price}</span>`:''}
      ${i.cuisine?`<span class="pill p-green" style="font-size:9px">${i.cuisine}</span>`:''}
    </div>
  </div>`).join('');
}

function getCrowdLevel(){const h=new Date().getHours();if(h>=18&&h<=21)return'High';if((h>=10&&h<=13)||(h>=7&&h<=9))return'Moderate';return'Low';}

function updateTourismWeatherTip(){
  const rain=STATE.rainProb||0,temp=STATE.temp||30;
  const el=document.getElementById('tourWeatherTip');
  const outdoor=document.getElementById('tour-outdoor');
  const outdoorSub=document.getElementById('tour-outdoor-sub');
  setText('tour-crowd',getCrowdLevel());
  const h=new Date().getHours();
  setText('tour-best-time','Best time: '+(h<11?'Now (Morning)':h<17?'Evening (6pm)':'Now (Evening)'));
  if(rain>70){if(el){el.textContent='🌧 Rainy';el.className='pill p-blue';}if(outdoor)outdoor.textContent='Poor';if(outdoorSub)outdoorSub.textContent='Visit indoor spots today';}
  else if(rain>40){if(el){el.textContent='⛅ Carry umbrella';el.className='pill p-amber';}if(outdoor)outdoor.textContent='Fair';if(outdoorSub)outdoorSub.textContent='Carry umbrella outside';}
  else if(temp>36){if(el){el.textContent='🌡 Very Hot';el.className='pill p-red';}if(outdoor)outdoor.textContent='Caution';if(outdoorSub)outdoorSub.textContent='Visit early morning only';}
  else{if(el){el.textContent='☀ Great outdoors';el.className='pill p-green';}if(outdoor)outdoor.textContent='Good';if(outdoorSub)outdoorSub.textContent='Ideal day to explore';}
}