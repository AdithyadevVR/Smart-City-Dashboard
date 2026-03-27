/**
 * api-news.js — Resilient News Aggregator
 * Uses dedicated RSS-to-JSON API to bypass proxy blocks
 */

const RSS_FEEDS = [
  { name: 'The Hindu', url: 'https://www.thehindu.com/news/cities/chennai/feeder/default.rss' },
  { name: 'Times of India', url: 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms' },
  { name: 'Indian Express', url: 'https://indianexpress.com/section/cities/chennai/feed/' },
  { name: 'OneIndia', url: 'https://www.oneindia.com/rss/feeds/chennai-fb.xml' },
];

async function fetchNews() {
  const all = [];
  // rss2json is a more professional API often allowed where 'cors-proxies' are blocked
  const apiBase = "https://api.rss2json.com/v1/api.json?rss_url=";

  for (const f of RSS_FEEDS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`${apiBase}${encodeURIComponent(f.url)}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error('API Error');

      const data = await response.json();

      if (data.status === 'ok' && data.items) {
        data.items.forEach((item, i) => {
          if (i > 4) return;
          all.push({
            title: item.title,
            link: item.link,
            pub: item.pubDate,
            source: f.name
          });
        });
        console.log(`✅ Loaded ${f.name}`);
      }
    } catch (e) {
      console.error(`❌ Failed ${f.name}:`, e.message);
    }
  }

  // Update Global State
  if (typeof STATE !== 'undefined') STATE.news = all;
  
  // UI Update
  const rssPill = document.getElementById('ds-rss');
  if (rssPill) {
    rssPill.innerText = all.length > 0 ? `${all.length} articles` : 'Sync Error';
    rssPill.className = all.length > 0 ? 'pill p-green' : 'pill p-red';
  }

  updateNewsUI(all);
  updateTicker(all);
  if (typeof generateAIDecisions === 'function') generateAIDecisions();
}

function updateNewsUI(news) {
  const el = document.getElementById('newsAlerts');
  if (!el) return;
  if (!news.length) {
    el.innerHTML = '<div style="color:var(--t2);font-size:13px;padding:12px">News sync failed. Reconnecting...</div>';
    return;
  }
  el.innerHTML = news.map(n => `
    <div class="alert-item" style="cursor:pointer" onclick="window.open('${n.link}','_blank')">
      <div class="alert-dot" style="background:var(--blue)"></div>
      <div>
        <div class="alert-text">${n.title}</div>
        <div class="alert-meta">${n.source} · ${timeSince(new Date(n.pub))} 
          <span class="pill p-blue" style="font-size:10px;padding:2px 6px">News</span>
        </div>
      </div>
    </div>`).join('');
}

function updateTicker(news) {
  const el = document.getElementById('tickerInner');
  if (!el || !news.length) return;
  const items = news.map(n => `
    <span class="ticker-item" onclick="window.open('${n.link}','_blank')">
      ${n.source}: ${n.title}<span class="ticker-sep"> ◆ </span>
    </span>`).join('');
  el.innerHTML = items + items;
}

function timeSince(date) {
  if (isNaN(date.getTime())) return 'recent';
  const s = Math.floor((new Date() - date) / 1000);
  if (s < 60) return s + 's ago';
  if (s < 3600) return Math.floor(s / 60) + 'm ago';
  if (s < 86400) return Math.floor(s / 3600) + 'h ago';
  return Math.floor(s / 86400) + 'd ago';
}