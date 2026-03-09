# 🔑 API Key Setup Guide

This guide walks you through getting and configuring the optional API keys for the Chennai Smart City Dashboard.

## Overview

The dashboard works without any API keys using free, open data sources. The optional keys below unlock additional features like live weather map overlays and real-time traffic tiles.

---

## 1. OpenWeatherMap (OWM_KEY)

**What it unlocks:** Weather map tile overlays (precipitation, cloud cover, wind, temperature)

### Steps:
1. Visit [https://openweathermap.org/api](https://openweathermap.org/api)
2. Click **Sign Up** and create a free account
3. Go to **My Profile → API Keys**
4. Copy your default API key (or generate a new one)
5. In the dashboard, click the ⚙️ gear icon
6. Paste the key in the **OpenWeatherMap** field and click **Save**

**Free tier:** 1,000 API calls/day, 60 calls/minute

---

## 2. TomTom Traffic (TOMTOM_KEY)

**What it unlocks:** Live real-time traffic flow and incident tiles on the traffic map

### Steps:
1. Visit [https://developer.tomtom.com](https://developer.tomtom.com)
2. Click **Get a free API key**
3. Create an account and navigate to **My Apps**
4. Create a new app — select **Traffic** as the product
5. Copy the generated API key
6. In the dashboard, click the ⚙️ gear icon
7. Paste the key in the **TomTom Traffic** field and click **Save**

**Free tier:** 2,500 daily transactions, 5 requests/second

---

## 3. WAQI / AQI.cn (AQI_KEY)

**What it unlocks:** More accurate, station-specific AQI readings for Chennai

### Steps:
1. Visit [https://aqicn.org/data-platform/token/](https://aqicn.org/data-platform/token/)
2. Enter your email and request a token
3. Check your email for the confirmation link
4. Copy your token from the confirmation page
5. In the dashboard, click the ⚙️ gear icon
6. Paste the token in the **WAQI / AQI.cn** field and click **Save**

**Free tier:** Unlimited requests for non-commercial use

---

## Key Storage

All API keys are stored in your browser's `localStorage` — they never leave your device and are not sent to any third-party server other than the respective API providers.

To clear your keys, open your browser's DevTools console and run:
```javascript
localStorage.removeItem('OWM_KEY');
localStorage.removeItem('TOMTOM_KEY');
localStorage.removeItem('AQI_KEY');
```
