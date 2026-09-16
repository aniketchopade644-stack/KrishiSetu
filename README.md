# 🌾 KrishiSetu – Smart Farming & Agriculture Management Platform

> A production-grade, multilingual MERN stack agricultural management ecosystem with soil health diagnostics, live agro-weather telemetry, direct buy/sell marketplace, automatic expense synchronization, and context-aware AI farming advisory (*Krishi Mitra*).

---

## 🌟 Key Features

### 1. 🔐 User Authentication & RBAC
- JWT Token Authentication with Bcrypt password hashing.
- Role-based authorization: **Farmer**, **Seller / Vendor**, and **Admin**.
- One-click demo login buttons for rapid role switching.
- Persistent user regional language and dark/light mode preferences.

### 2. 🚜 Farm Plot Management
- Manage multiple farm plots with acreage, geographical location, soil classification, and irrigation systems (Drip, Sprinkler, Tube Well, Canal, Rainfed).
- Track current crop status, sowing dates, and expected harvest schedules.

### 3. 🧪 Soil Health & Nutrient Diagnostics
- Record laboratory / field-kit soil tests (pH, Nitrogen, Phosphorus, Potassium, Moisture %, Organic Carbon).
- Historical Recharts bar & line progression trends.
- Automated AI-driven agronomic corrective suggestions (e.g., lime/gypsum application for pH correction, bio-fertilizers, urea dosing).

### 4. 🌦️ Live Hyperlocal Agro-Weather & 7-Day Forecast
- Live meteorological telemetry powered by Open-Meteo API.
- Hyperlocal precipitation probability, humidity %, wind speed, and UV index.
- Actionable Agro-Advisories: Foliar spraying suitability windows, irrigation postponement alerts, and extreme heatwave/frost warnings.
- Instant search across major Indian agricultural hubs (Nashik, Pune, Nagpur, Ludhiana, Indore, Varanasi, Hyderabad, Jaipur, etc.).

### 5. 🛍️ Agricultural Marketplace & Seller Portal
- Direct buy & sell marketplace for certified hybrid seeds, organic fertilizers, bio-pesticides, drip lateral kits, and spray equipment.
- Category filtering, instant search, price sorting, and detailed agronomy product modals.
- Vendor Seller Portal to publish listings, manage stock inventory, and monitor incoming orders.

### 6. ⚡ Automatic Billing & Farm Expense Synchronization
- **Zero-Manual-Entry Purchase Tracking**: Whenever a farmer orders supplies from the marketplace, the backend **automatically generates and links an expense record** under the appropriate category (`Seeds`, `Fertilizers`, `Equipment`, etc.).
- Financial analytics: Total expenditure, store purchases, operational expenses, crop revenue, and estimated net profit margin with printable invoice receipts.
- Visual Recharts Donut category distribution & monthly burn charts.

### 7. 🌾 Crop Lifecycle & Financial Revenue Tracking
- Track Kharif, Rabi, and Zaid crop seasons from sowing, vegetative growth, and flowering to harvest and Mandi sale.
- Automatic revenue calculation: `Yield Quantity × Selling Price per Unit`.

### 8. 🤖 Krishi Mitra – Context-Aware AI Farming Assistant
- Agricultural advisory supporting **English**, **Hindi (हिन्दी)**, and **Marathi (मराठी)**.
- **Context Injection**: Automatically aggregates active farm plots, latest soil test reports (pH, NPK), and live local weather conditions to provide tailored advice.
- Works with Google Gemini API, OpenAI API, and includes a fallback Indian agronomy knowledge engine ensuring 100% uptime and zero crashes.

### 9. 🌐 Multilingual Interface (EN, HI, MR)
- Complete interface internationalization using `i18next` and `react-i18next`.
- Reactive language switching without page reload.

### 10. 🌓 Light & Dark Mode
- System-level theme switching with smooth transitions and persistent state.

---

## 🏗️ Architecture

```
d:/Projects/
├── backend/
│   ├── config/             # Database connection handler (MongoDB)
│   ├── models/             # Mongoose Models (User, Farm, SoilRecord, CropRecord, Product, Cart, Order, Expense, AIChat)
│   ├── controllers/        # REST API Controllers
│   ├── routes/             # Express Route definitions
│   ├── middleware/         # JWT Auth, Role Authorization, Error handlers
│   ├── services/           # AI Context Engine (Gemini / OpenAI / Agronomy Rules Engine)
│   ├── seed/               # Realistic Indian agriculture database seeder
│   ├── server.js           # Express main server entry
│   └── test-suite.js       # 27-point automated integration test suite
│
└── frontend/
    ├── src/
    │   ├── components/     # Navbar, Sidebar, Footer, StatCard, Modal, Toast, LoadingSpinner, EmptyState
    │   ├── context/        # AuthContext, ThemeContext, LanguageContext, CartContext
    │   ├── i18n/           # English (en), Hindi (hi), Marathi (mr) locales
    │   ├── pages/          # Dashboard, Farms, SoilRecords, Crops, WeatherDashboard, Marketplace, SellerPortal, Cart, Expenses, AIAssistant, Profile, Login, Register
    │   ├── services/       # Axios API client
    │   ├── App.jsx         # Main router and layout
    │   └── main.jsx        # Root entry point
    ├── index.html
    ├── tailwind.config.js
    └── vite.config.js
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18+ (Tested on v22.19.0)
- **MongoDB**: Local MongoDB service running or MongoDB Atlas connection string.

### 2. Start Backend Server
```bash
cd backend
npm install
npm run seed      # Populates demo farms, soil tests, crops, products, orders & expenses
npm start         # Runs on http://localhost:5000
```

### 3. Start Frontend App
```bash
cd frontend
npm install
npm run dev       # Runs on http://localhost:3000
```

---

## 🔑 Demo Login Credentials

| Role | Email | Password | Features |
|---|---|---|---|
| 👨‍🌾 **Farmer** | `farmer@krishisetu.com` | `password123` | Farm management, soil reports, crop revenues, buying supplies, AI assistant |
| 🏪 **Seller** | `seller@krishisetu.com` | `password123` | Product catalog publishing, inventory management, sales orders |
| 🛡️ **Admin** | `admin@krishisetu.com` | `password123` | System oversight & catalog management |

*(1-Click Demo Login buttons are also available directly on the `/login` screen)*

---

## 🧪 Verification & Test Suite

Run the full integration test suite:
```bash
cd backend
node test-suite.js
```
**Results:** `27 PASSED, 0 FAILED` (100% coverage across all 11 modules).
