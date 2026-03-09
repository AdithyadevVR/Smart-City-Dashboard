/**
 * api-weather.js — Weather data fetching & UI updates
 * Source: Open-Meteo (free, no key required)
 */

// ═══════════════════════════════════════════════════════════════════════════════
// WEATHER DATA
// ═══════════════════════════════════════════════════════════════════════════════
async function fetchWeather(){
  try{
    const r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,wind_speed_10m,wind_direction_10m,weather_code,visibility,surface_pressure,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia/Kolkata&forecast_days=7`);
    const d=await r.json();
    STATE.weather=d.current;STATE.forecast=d.daily;
    STATE.windDir=d.current.wind_direction_10m;STATE.windSpeed=d.current.wind_speed_10m;
    STATE.rainProb=d.current.precipitation_probability;STATE.temp=d.current.temperature_2m;
    updateWeatherUI(d);updateCompass(d.current.wind_direction_10m);updateRainAnimation();
  }catch(e){console.warn(e);}
}
function updateWeatherUI(d){
  const c=d.current;
  setText('w-temp',c.temperature_2m.toFixed(1)+'°C');setText('w-feels','Feels like '+c.apparent_temperature.toFixed(1)+'°C');
  setText('w-humid',c.relative_humidity_2m+'%');setText('w-dew','Dew '+(c.temperature_2m-(100-c.relative_humidity_2m)/5).toFixed(1)+'°C');
  setText('w-wind',c.wind_speed_10m+' km/h');setText('w-wdir','Direction '+c.wind_direction_10m+'°');
  setText('w-rain',c.precipitation_probability+'%');setText('w-vis','Visibility '+(c.visibility/1000).toFixed(1)+' km');
  setText('env-wspeed',c.wind_speed_10m+' km/h');setText('env-press',c.surface_pressure.toFixed(0)+' hPa');
  setText('env-uv',c.uv_index||'--');setText('env-vis',(c.visibility/1000).toFixed(1)+' km');
  setText('st-1',(c.temperature_2m+0.3).toFixed(1)+'°C');setText('st-2',(c.temperature_2m-0.5).toFixed(1)+'°C');
  setText('st-3',(c.temperature_2m+0.8).toFixed(1)+'°C');setText('st-4',(c.temperature_2m+0.2).toFixed(1)+'°C');
  buildForecast(d.daily);
}
function buildForecast(daily){
  const el=document.getElementById('forecastRow');if(!el)return;
  el.innerHTML=daily.time.slice(0,7).map((t,i)=>{const day=new Date(t);return`<div class="forecast-item"><div class="f-day">${i===0?'Today':WEEKDAYS[day.getDay()]}</div><div class="f-icon">${WEATHER_ICONS[daily.weather_code[i]]||'🌤'}</div><div class="f-hi">${daily.temperature_2m_max[i].toFixed(0)}°</div><div class="f-lo">${daily.temperature_2m_min[i].toFixed(0)}°</div><div style="font-size:10px;color:var(--blue);margin-top:2px;font-family:'Geist Mono',monospace">${daily.precipitation_probability_max[i]}%</div></div>`;}).join('');
}
function updateCompass(dir){
  const a=document.getElementById('compassArrow'),b=document.getElementById('envCompassArrow');
  if(a)a.setAttribute('transform',`rotate(${dir},60,60)`);if(b)b.setAttribute('transform',`rotate(${dir},60,60)`);
  const dirs=['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  const label=dirs[Math.round(dir/22.5)%16];
  setText('windDirLabel',`${label} (${dir}°)`);setText('envWindLabel',`${label} (${dir}°)`);
}