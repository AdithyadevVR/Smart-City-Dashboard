# 🏙️ SmartCity Decision Dashboard

A full-stack Smart City management dashboard built with **Node.js, Express, MongoDB, and a modern HTML/CSS/JavaScript frontend**.
The platform provides real-time visualization and administrative control over urban systems such as **traffic, weather, energy, waste, and water management**.

Designed as a **production-style MERN architecture project** showcasing authentication, role-based access, REST APIs, and interactive data visualization.

---

## ✨ Overview

SmartCity Dashboard simulates a centralized control system used by modern municipalities to monitor infrastructure and respond to city-wide events.

Users can:

* Monitor live city metrics through interactive dashboards
* Visualize infrastructure data using charts and SVG maps
* Manage alerts and operational status
* Perform administrative control via role-based permissions

---

## 🚀 Tech Stack

**Frontend**

* HTML5, CSS3, Vanilla JavaScript
* Chart.js
* Responsive layout + dark/light mode
* SVG-based interactive maps

**Backend**

* Node.js
* Express.js REST API
* JWT Authentication
* Role-based authorization

**Database**

* MongoDB (Atlas or Local)
* Mongoose ODM

---

## 📸 Features

### 📊 Smart City Modules

| Module     | Capabilities                                                 |
| ---------- | ------------------------------------------------------------ |
| 🚦 Traffic | Congestion visualization, incident tracking, control actions |
| 🌦 Weather | Temperature zones, AQI indicators, forecasts                 |
| ⚡ Energy   | Load monitoring, renewable distribution charts               |
| ♻️ Waste   | Collection tracking, recycling metrics                       |
| 💧 Water   | Pressure zones, consumption analytics, leak alerts           |

---

### 🔐 Authentication & Roles

* JWT-based secure login
* Admin & User role separation
* Protected API routes
* Admin-only controls automatically hidden for users

---

### 🎨 UI & Experience

* Dark / Light mode (persistent)
* Glassmorphism dashboard design
* Responsive layout (desktop & tablet)
* Animated SVG maps with tooltips
* Toast notifications & dynamic updates

---

## 📁 Project Structure

```
smartcity/
├── frontend/      # UI pages, styles, and dashboard modules
├── backend/       # Express API, models, routes, middleware
└── README.md
```

---

## ⚙️ Setup & Installation

### Prerequisites

* Node.js (v18+)
* MongoDB Atlas account or local MongoDB

---

### 1️⃣ Install dependencies

```bash
cd backend
npm install
```

---

### 2️⃣ Configure environment variables

Create or edit `backend/.env`:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
```

---

### 3️⃣ Seed database

```bash
npm run seed
```

---

### 4️⃣ Start server

```bash
npm start
```

Server runs at:

```
http://localhost:5000
```

---

## 🔐 Demo Credentials

| Role  | Email                                             | Password |
| ----- | ------------------------------------------------- | -------- |
| Admin | [admin@smartcity.com](mailto:admin@smartcity.com) | admin123 |
| User  | [user@smartcity.com](mailto:user@smartcity.com)   | user123  |

---

## 🔌 API Overview

Key REST endpoints:

```
POST   /api/auth/login
GET    /api/auth/me
GET    /api/traffic
GET    /api/weather
GET    /api/energy
GET    /api/waste
GET    /api/water
GET    /api/alerts
```

Admin endpoints enable full CRUD operations for users and city metrics.

---

## 🧠 Architecture

```
Frontend (Dashboard UI)
        ↓
Express REST API
        ↓
MongoDB Database
```

This separation mirrors real-world SaaS and municipal monitoring platforms.

---

## 🎯 Learning Goals

This project demonstrates:

* Full-stack application architecture
* REST API design
* Authentication & authorization
* Database modeling with MongoDB
* Interactive dashboard UI development

---

## 📌 Future Improvements

* WebSocket real-time updates
* Deployment with Docker
* Role permission customization
* Mobile optimization

---

## 👨‍💻 Author

Assishmon C S
Aagney Vinodkumar
Adithyadev V R

---
