/**
 * api-news.js — Live news/RSS feed aggregation
 * Sources: The Hindu, Times of India, New Indian Express, OneIndia
 */

// ═══════════════════════════════════════════════════════════════════════════════
// NEWS / RSS
// ═══════════════════════════════════════════════════════════════════════════════
const RSS_FEEDS=[
  {name:'The Hindu',url:'https://www.thehindu.com/news/cities/chennai/feeder/default.rss'},
  {name:'Times of India',url:'https://timesofindia.indiatimes.com/city/chennai/rssfeedstopstories.cms'},
  {name:'New Indian Express',url:'https://www.newindianexpress.com/cities/chennai/rssFeed/'},
  {name:'OneIndia',url:'https://www.oneindia.com/rss/feeds/chennai-fb.xml'},
];
async function fetchNews(){
  const all=[];
  for(const f of RSS_FEEDS){
    try{const r=await fetch(`https://corsproxy.io/?${encodeURIComponent(f.url)}`,{signal:AbortSignal.timeout(8000)});const text=await r.text();const xml=new DOMParser().parseFromString(text,'text/xml');xml.querySelectorAll('item').forEach((item,i)=>{if(i>5)return;const title=item.querySelector('title')?.textContent?.trim()||'';const link=item.querySelector('link')?.textContent?.trim()||'#';const pub=item.querySelector('pubDate')?.textContent?.trim()||'';if(title)all.push({title,link,pub,source:f.name});});}catch(e){}
  }
  STATE.news=all;setText('ds-rss',all.length+' articles');document.getElementById('ds-rss').className='pill p-green';
  updateNewsUI(all);updateTicker(all);generateAIDecisions();
}
function updateNewsUI(news){
  const el=document.getElementById('newsAlerts');if(!el)return;
  if(!news.length){el.innerHTML='<div style="color:var(--t2);font-size:13px;padding:12px">Loading news…</div>';return;}
  el.innerHTML=news.map(n=>`<div class="alert-item" style="cursor:pointer" onclick="window.open('${n.link}','_blank')"><div class="alert-dot" style="background:var(--blue)"></div><div><div class="alert-text">${n.title}</div><div class="alert-meta">${n.source} · ${n.pub?timeSince(new Date(n.pub)):'recent'} <span class="pill p-blue" style="font-size:10px;padding:2px 6px">News</span></div></div></div>`).join('');
}
function updateTicker(news){
  const el=document.getElementById('tickerInner');if(!el||!news.length)return;
  const items=news.map(n=>`<span class="ticker-item" onclick="window.open('${n.link}','_blank')">${n.source}: ${n.title}<span class="ticker-sep"> ◆ </span></span>`).join('');
  el.innerHTML=items+items;
}
function timeSince(date){const s=Math.floor((new Date()-date)/1000);if(s<60)return s+'s ago';if(s<3600)return Math.floor(s/60)+'m ago';if(s<86400)return Math.floor(s/3600)+'h ago';return Math.floor(s/86400)+'d ago';}