# 🌾 KrishiSetu -- Smart Farming Platform

> **Connecting Farmers to Better Farming**

KrishiSetu is a farmer-focused MERN stack web application designed to
make everyday farming information and management simple, accessible, and
practical.

## 🌟 Key Features

### 1. 📊 Dashboard

-   Quick overview of farms, soil information, weather, expenses, and
    farming activities.
-   Simple farmer-friendly information and navigation.

### 2. 🚜 My Farms

-   Add and manage multiple farm plots.
-   Store acreage, location, soil type, and irrigation details.
-   View important information for each farm.

### 3. 🧪 Soil Test

-   Record soil values such as pH, Nitrogen, Phosphorus, Potassium,
    Moisture, and Organic Carbon.
-   View soil information for individual farms.
-   Provides useful soil-related suggestions.

### 4. 🌦️ Weather & Alerts

-   Current weather and forecast information.
-   Temperature, humidity, rainfall probability, wind speed, and UV
    index.
-   Farming-focused weather alerts and guidance.
-   Weather data powered by Open-Meteo API.

### 5. 🛍️ Agri Marketplace

-   Farmers can buy and sell agricultural products.
-   Search, filtering, product details, cart, and order management.
-   Sellers can publish products and manage inventory.

### 6. 💰 Expenses & Billing

-   Track farming expenses and marketplace purchases.
-   Eligible marketplace purchases can be automatically recorded as
    expenses.
-   Displays **Total Expenses, Farm Income, and Profit / Loss**.
-   Includes billing and invoice information.

### 7. 🏛️ Government Schemes

-   Provides useful information about agriculture-related government
    schemes.
-   Helps farmers discover schemes relevant to their farming needs.

### 8. 🤖 Krishi Mitra AI

-   AI-based farming assistant for agriculture-related questions.
-   Guidance related to crops, fertilizers, soil, weather, pests, and
    government schemes.
-   Supports **English, Hindi, and Marathi**.
-   Designed for simple, farmer-friendly responses.
-   Can integrate with Google Gemini API.

## 🔐 Additional Features

-   JWT-based authentication.
-   Bcrypt password hashing.
-   Role-based access for Farmer, Seller/Vendor, and Admin.
-   Multilingual interface using `i18next` and `react-i18next`.
-   Light and Dark mode.
-   Responsive React interface.

## 🏗️ Technology Stack

**Frontend:** React.js, Vite, Tailwind CSS, Axios, React Router, i18next

**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, Bcrypt

**APIs / AI:** Open-Meteo API, Google Gemini API

## 📁 Project Structure

``` text
KrishiSetu/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── i18n/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
│
└── README.md
```

## 🚀 Local Setup

### Prerequisites

-   Node.js 18+
-   MongoDB local installation or MongoDB Atlas
-   Git

### Backend

``` bash
cd backend
npm install
npm start
```

Backend runs on `http://localhost:5000`.

Create `backend/.env` with your MongoDB connection string and required
API keys.

### Frontend

``` bash
cd frontend
npm install
npm run dev
```

Use the local URL displayed by Vite.

> **Security:** Never commit `.env`, MongoDB passwords, API keys, or
> other secrets to GitHub.

## 🌐 Supported Languages

-   🇬🇧 English
-   🇮🇳 Hindi
-   🇮🇳 Marathi

## 🌓 Theme

-   Light Mode
-   Dark Mode

## 📌 Project Purpose

KrishiSetu brings essential farming tools into one platform so farmers
can manage farms, understand soil and weather conditions, buy or sell
agricultural products, track financial information, discover government
schemes, and get AI-based farming assistance.

------------------------------------------------------------------------

**KrishiSetu -- Connecting Farmers to Better Farming 🌾**
