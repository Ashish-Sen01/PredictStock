# 📦 PredictStock — Full-Stack AI Demand Forecasting & Inventory Optimization

Enterprise full-stack web application designed for retail multi-horizon demand forecasting and automated replenishment decision support. Built with a high-performance **FastAPI (Python)** backend serving the core LightGBM models and optimization logic, paired with a modern, glassmorphic **React 18 + Vite** frontend.

---

## 🏗️ Architecture Overview

```
PredictStock/
├── backend/                  # FastAPI REST API Backend
│   ├── main.py               # API endpoints, data ingestion & in-memory state
│   ├── requirements.txt      # Backend Python dependencies
│   ├── run.py                # Uvicorn entry point (port 8000)
│   └── start.bat             # 1-click startup script for Windows
├── frontend/                 # React 18 + Vite Web Application
│   ├── package.json          # Node dependencies (React, Recharts, Lucide, Axios)
│   ├── vite.config.js        # Vite dev server with /api proxy to localhost:8000
│   ├── index.html            # Entry HTML with Inter typography
│   ├── start.bat             # 1-click startup script for Windows
│   └── src/
│       ├── App.jsx           # Master application container & global filters
│       ├── index.css         # Glassmorphism styling & color tokens
│       ├── api/client.js     # Axios API service client
│       ├── components/       # GlassNavbar, GlassSidebar, KPICard, GlassCard, StatusBadge, Spinner
│       ├── charts/           # Recharts components + Custom SVG Arc Gauge
│       └── tabs/             # 4 Dedicated Enterprise Tabs
├── src/                      # Existing Python ML & Business Logic
│   ├── forecasting.py        # Parquet forecast loader
│   ├── inventory.py          # Safety stock, required stock & reorder logic
│   └── predictstock_service.py # Orchestrator & related product services
└── data/                     # Audited sales, catalog, stores & precomputed forecasts
```

---

## 🎨 UI & Design Specification

- **Theme Style**: Option C (Clean Enterprise Analytics) with glassmorphic accents (`backdrop-filter: blur(16px)`).
- **Color Palette**:
  - Background: `#f0f4f8` (soft enterprise blue-gray)
  - Cards: `rgba(255, 255, 255, 0.82)` with subtle border `rgba(226, 232, 240, 0.85)`
  - Primary Accent: `#1d4ed8` (Corporate Blue)
  - Status Indicators: Critical (`#dc2626`), Low (`#d97706`), Sufficient (`#16a34a`)
- **Typography**: Inter (Google Fonts) with tabular numeral features for financials and quantities.

---

## 🚀 Quick Startup Guide

### 1. Start the Backend API (FastAPI)

In a new terminal window:
```bash
cd backend
pip install -r requirements.txt
python run.py
```
*Or double-click `backend\start.bat` on Windows.*

The backend will start at: **`http://localhost:8000`**  
Interactive API docs available at: **`http://localhost:8000/docs`**

---

### 2. Start the Frontend Application (React + Vite)

In a second terminal window:
```bash
cd frontend
npm install
npm run dev
```
*Or double-click `frontend\start.bat` on Windows.*

The frontend web app will start at: **`http://localhost:5173`**

---

## 🧭 Four Core Analytical Tabs

### 1. 📊 Executive & Store Analytics
- **Top Metric Cards**: Product-Store pairs, 30-Day demand volume, Current available stock (with coverage %), Required stock with safety buffer, and Total recommended replenishment units.
- **Stock Status Donut**: Proportional breakdown of Critical (&lt;50%), Low (50–100%), and Sufficient (&ge;100%) stock pairs.
- **Store Comparison Bar Chart**: Side-by-side grouped comparison across branches (Store 1, Store 2, Store 3, Store 4) for Current Stock vs. Required Stock vs. Recommended Order.
- **Top 12 Urgent Items**: Ranked horizontal bar chart highlighting the product-store pairs with the highest order deficit.
- **Multi-Horizon Volume**: Grouped multi-horizon demand totals (7-Day, 30-Day Primary, 90-Day) per store.

### 2. 🔍 Product-Store Deep Dive & Simulator
- **Interactive Selectors**: Filter by Store Branch and inspect individual product IDs.
- **What-If Simulation Controls**:
  - Live **Current Stock** input box (simulates instant receipts or shrink).
  - Dynamic **Safety Buffer** slider (0% to 100%).
- **Custom SVG Semicircle Arc Gauge**: Custom SVG gauge rendering stock coverage percentage with colored critical (red 0–50%), low (amber 50–100%), and sufficient (green &gt;100%) segments with a dynamic needle.
- **Demand Horizon Curve**: Line chart tracking 7D, 30D, and 90D predictions with benchmark reference lines.
- **Related Products (Category Match)**: Suggestions sharing catalog metadata (department, class, subclass) with saved forecasts for the same branch.

### 3. 📋 Replenishment Workbench
- **Sortable Order Table**: Displays `item_id`, `store_id`, `dept_name`, `item_type`, `stock_status`, `current_stock`, `7D`, `30D`, `90D`, `safety_stock`, `required_stock`, `stock_ratio`, and `reorder_quantity`.
- **Interactive Mini Progress Bars**: Visual stock ratio column for rapid triage.
- **Critical Highlighting**: Critical rows are highlighted with a soft red tint.
- **Pagination**: 50 records per page with next/previous controls and direct page jump.
- **Direct Exports**: One-click download buttons for **CSV** (`predictstock_recommendations.csv`) and **Parquet** (`predictstock_recommendations.parquet`).

### 4. 🧠 ML Benchmarks & Model Evaluation
- **Untouched Test Performance**:
  - 7-Day Untouched Test $R^2 = 0.9346$ (MAE: 8.7609, Bias: -6.17%)
  - 30-Day Untouched Test $R^2 = 0.9292$ (MAE: 32.9550, Bias: -2.26%)
  - Fixed Evaluation Universe: 13,447 pairs with 99.54% horizon consistency ($30\text{D} \ge 7\text{D}$).
- **Interactive Multi-Model Comparison**: Toggle between $R^2$, MAE, and RMSE to benchmark LightGBM vs. CatBoost vs. XGBoost across all 3 horizons.
- **Baseline Comparison & Recursive Strategy Rejection**: Details why earlier recursive autoregressive models (+93.49% bias error) were rejected in favor of direct multi-horizon LightGBM.

---

## 📡 REST API Specification

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status and dataset pair count |
| `GET` | `/api/forecast-info` | Metadata on stores and forecast dataset presence |
| `POST` | `/api/compute` | Computes inventory recommendations given `{ "safety_buffer": 0.20 }` |
| `POST` | `/api/upload-stock` | Accepts multipart CSV upload to update live stock |
| `POST` | `/api/reset-stock` | Restores default synthetic seed-42 demonstration inventory |
| `GET` | `/api/download/csv` | Streams current recommendation dataset as CSV |
| `GET` | `/api/download/template` | Downloads standard CSV template (`item_id,store_id,current_stock`) |
| `GET` | `/api/download/parquet` | Streams current recommendations as binary Parquet |
| `GET` | `/api/ml-benchmarks` | Returns evaluation benchmark metrics and baseline comparisons |
| `GET` | `/api/related-products` | Returns category-matched items for a given item and store |

---

## 🛡️ Robustness & Fallback Handling

- **Missing Data Resiliency**: If processed parquet files are unavailable, the backend automatically generates a reproducible synthetic dataset (seed 42) matching the exact schema and distributions so testing continues uninterrupted.
- **Client-Side Debounce**: Buffer slider re-computations are debounced (800ms) to ensure smooth browser performance.
- **Full Metadata Enrichment**: Automatically enriches recommendations with catalog departments, product classes, and store city/format metadata when available.
