/**
 * main.js — App entry point, refresh cycle, event listeners
 * Orchestrates all modules
 */

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN REFRESH
// ═══════════════════════════════════════════════════════════════════════════════
async function refreshAll(){
  document.getElementById('liveLabel').textContent='Refreshing…';
  await Promise.all([fetchWeather(),fetchAQI(),fetchNews()]);
  const avgSpeed=updateTrafficUI();
  generateSystemAlerts();generateAIDecisions();
  updateOverviewHero(STATE.weather,STATE.aqi,avgSpeed);
  updateZoneStatus();updateOvNewsFeed();drawActivityChart();updateTourismWeatherTip();
  setText('ds-refresh',new Date().toLocaleTimeString('en-IN',{hour12:false}));
  const rssEl=document.getElementById('rss-dot');if(rssEl&&STATE.news.length)rssEl.style.background='var(--green)';
  document.getElementById('liveLabel').textContent='LIVE';
  refreshCountdown=300;
}

window.addEventListener('DOMContentLoaded',()=>{
  updateSetupStatus();
  refreshAll();
  setInterval(refreshAll,5*60*1000);
  window.addEventListener('resize',drawActivityChart);
});