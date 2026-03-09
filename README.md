# 🏙 Chennai Smart City Dashboard

A real-time, data-driven decision dashboard for Chennai city operations. Built as a single-page application with live weather, AQI, traffic, city services, and tourism data.

![Dashboard Preview](docs/preview.png)

## ✨ Features

| Module | Description |
|---|---|
| **Overview** | City vitals, AI decision engine, zone status, live headlines |
| **Weather** | Live conditions, 7-day forecast, interactive weather map |
| **Traffic** | Corridor flow, CMRL metro lines, congestion heatmap |
| **Environment** | AQI, PM2.5/PM10, pollutant breakdown, monitoring stations |
| **City Services** | Hospitals, police, fire stations, pharmacies, ATMs, fuel |
| **Tourism** | Heritage sites, temples, beaches, museums, restaurants, hotels |
| **Live Alerts** | News feed, system alerts, AI-generated advisories |

## 🚀 Quick Start

```bash
# Clone the repo
git clone https://github.com/your-username/chennai-smart-city-dashboard.git
cd chennai-smart-city-dashboard

# Open in browser (no build step required!)
open index.html
```

> **No build tools needed.** This is a pure HTML/CSS/JS project — just open `index.html` in any modern browser.

## 🔑 API Keys (Optional)

The dashboard works out of the box using free APIs. Optional keys unlock richer data:

| Key | Provider | Purpose | Free Tier |
|---|---|---|---|
| `OWM_KEY` | [OpenWeatherMap](https://openweathermap.org/api) | Weather map tile overlays | 1,000 calls/day |
| `TOMTOM_KEY` | [TomTom](https://developer.tomtom.com) | Live traffic tiles | 2,500 req/day |
| `AQI_KEY` | [WAQI / AQI.cn](https://aqicn.org/data-platform/token/) | Accurate AQI readings | Free |

Click the ⚙️ gear icon in the dashboard to enter your keys. They are stored locally in your browser — never sent anywhere else.

## 📁 Project Structure

```
chennai-smart-city-dashboard/
├── index.html              # Main entry point
├── src/
│   ├── css/
│   │   └── styles.css      # All styles (variables, layout, components)
│   └── js/
│       ├── config.js        # API keys, constants, global state
│       ├── data-services.js # City services POI data (hospitals, police, etc.)
│       ├── data-tourism.js  # Tourism & attractions POI data
│       ├── map-weather.js   # Leaflet weather map module
│       ├── map-traffic.js   # Leaflet traffic map + CMRL metro lines
│       ├── api-weather.js   # Open-Meteo weather fetching
│       ├── api-aqi.js       # WAQI / OpenAQ air quality fetching
│       ├── api-traffic.js   # Traffic corridor data & UI
│       ├── api-news.js      # RSS news feed aggregation
│       ├── dashboard.js     # Overview, AI engine, alerts, charts
│       └── main.js          # App entry point & refresh cycle
├── docs/
│   └── API_SETUP.md        # Detailed API key setup guide
└── .github/
    └── workflows/
        └── deploy.yml       # GitHub Pages auto-deploy
```

## 🗺 Data Sources

| Source | Data | Key Required |
|---|---|---|
| [Open-Meteo](https://open-meteo.com) | Weather, forecast | ❌ Free |
| [OpenAQ v3](https://openaq.org) | Air quality | ❌ Free |
| [WAQI](https://waqi.info) | Enhanced AQI | ✅ Optional |
| [OpenWeatherMap](https://openweathermap.org) | Weather map tiles | ✅ Optional |
| [TomTom](https://developer.tomtom.com) | Live traffic tiles | ✅ Optional |
| [RSS Feeds](https://rss2json.com) | Chennai news | ❌ Free |
| [Stadia Maps](https://stadiamaps.com) | Dark map tiles | ❌ Free |

## 🌐 Deploy to GitHub Pages

1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Set source to **main branch / root**
4. Your dashboard will be live at `https://your-username.github.io/chennai-smart-city-dashboard`

Or use the included GitHub Actions workflow — it deploys automatically on every push to `main`.

## 🛠 Tech Stack

- **Vanilla JS** — no frameworks, no bundler
- **Leaflet.js** — interactive maps
- **CSS Custom Properties** — theming & design tokens
- **Canvas API** — 24h activity chart
- **Open APIs** — weather, AQI, news

## 📄 License

MIT License — free to use, modify, and distribute.
