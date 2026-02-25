# 🏙️ SmartCity Decision Dashboard

A full-stack, production-grade Smart City management dashboard with MongoDB, Node.js/Express backend, and a premium HTML/CSS/JS frontend.

---

## 📁 Folder Structure

```
smartcity/
├── frontend/
│   ├── index.html          ← Login page
│   ├── dashboard.html      ← Main dashboard
│   ├── css/
│   │   ├── main.css        ← Design system, variables, components
│   │   └── dashboard.css   ← Layout, sidebar, topbar, modules
│   └── js/
│       ├── auth.js         ← Auth utilities, token management
│       ├── dashboard.js    ← Navigation, overview, charts
│       ├── traffic.js      ← Traffic SVG map + controls
│       ├── weather.js      ← Weather SVG map + forecasts
│       ├── energy.js       ← Energy charts + controls
│       ├── waste.js        ← Waste levels + maps
│       ├── water.js        ← Water gauges + pressure map
│       └── admin.js        ← User CRUD + metrics editor
├── backend/
│   ├── server.js           ← Express app entry point
│   ├── seed.js             ← Database seeder
│   ├── .env                ← Environment variables
│   ├── package.json
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── traffic.js
│   │   ├── weather.js
│   │   ├── energy.js
│   │   ├── waste.js
│   │   ├── water.js
│   │   └── alerts.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Traffic.js
│   │   ├── Weather.js
│   │   ├── Energy.js
│   │   ├── Waste.js
│   │   ├── Water.js
│   │   └── Alert.js
│   └── middleware/
│       └── auth.js         ← JWT + role middleware
└── README.md
```

---

## 🚀 Setup & Run

### Prerequisites
- Node.js 18+
- MongoDB running locally (or MongoDB Atlas URI)

### 1. Install dependencies
```bash
cd smartcity/backend
npm install
```

### 2. Configure environment
Edit `backend/.env`:
```
MONGO_URI=mongodb://localhost:27017/smartcity
JWT_SECRET=your_secret_key_here
PORT=5000
```

### 3. Seed the database
```bash
npm run seed
```

### 4. Start the server
```bash
npm start
# or for development with auto-reload:
npm run dev
```

### 5. Open in browser
```
http://localhost:5000
```

---

## 🔐 Login Credentials

| Role  | Email                    | Password   |
|-------|--------------------------|------------|
| Admin | admin@smartcity.com      | admin123   |
| User  | user@smartcity.com       | user123    |

---

## ✨ Features

### Dashboard Modules
| Module  | Map | Charts | Admin Controls |
|---------|-----|--------|----------------|
| Traffic | SVG city congestion map | Speed/volume bar chart | Clear incidents |
| Weather | SVG temperature zone map | Temp/humidity chart, 7-day forecast | Update readings |
| Energy  | — | Load curve, source donut | Toggle status |
| Waste   | SVG zone collection map | Weekly bar, recycling donut | Mark collected |
| Water   | SVG pressure zone map | 24h consumption line | Toggle valves |

### Role-Based Access
- **Admin**: Full CRUD on users, edit all city metrics, create/resolve/delete alerts, use all controls
- **User**: View-only access to all dashboards and charts

### Design
- Light/dark mode toggle (persistent)
- Glassmorphism cards, frosted panels
- Premium typography (DM Sans + DM Serif Display)
- Responsive layout (desktop + tablet)
- Animated SVG maps with tooltips
- Chart.js powered charts
- Toast notifications

---

## 🛠️ API Endpoints

```
POST   /api/auth/login              → Login, returns JWT
GET    /api/auth/me                 → Current user
GET    /api/users                   → [Admin] List users
POST   /api/users                   → [Admin] Create user
PUT    /api/users/:id               → [Admin] Update user
DELETE /api/users/:id               → [Admin] Delete user
GET    /api/traffic                 → Traffic data
PUT    /api/traffic/:id             → [Admin] Update traffic
POST   /api/traffic/:id/clear-incident → [Admin] Clear incidents
GET    /api/weather                 → Weather data
PUT    /api/weather/:id             → [Admin] Update weather
GET    /api/energy                  → Energy data
PUT    /api/energy/:id              → [Admin] Update energy
GET    /api/waste                   → Waste data
PUT    /api/waste/:id               → [Admin] Update waste
POST   /api/waste/:id/collect       → [Admin] Mark collected
GET    /api/water                   → Water data
PUT    /api/water/:id               → [Admin] Update water
POST   /api/water/:id/toggle-valve  → [Admin] Toggle valve
GET    /api/alerts                  → Active alerts
GET    /api/alerts/all              → [Admin] All alerts
POST   /api/alerts                  → [Admin] Create alert
PUT    /api/alerts/:id/resolve      → [Admin] Resolve alert
DELETE /api/alerts/:id              → [Admin] Delete alert
```
