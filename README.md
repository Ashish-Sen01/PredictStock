# PredictStock: An AI-Based Demand Forecasting and Inventory Optimization System

PredictStock is an end-to-end retail intelligence platform that combines machine learning demand forecasting with automated inventory replenishment optimization. It enables retail planners and store managers to eliminate stockouts, prevent overstocking, and make data-driven ordering decisions across multiple store branches and product hierarchies.

---

## 💡 Project Concept & Workflow

Retail supply chains face a dual challenge: under-stocking leads to lost revenue and customer dissatisfaction, while over-stocking locks up capital and causes inventory depreciation. **PredictStock** bridges the gap between historical sales patterns and actionable purchasing orders through a four-stage intelligent workflow:

```
[ Historical Sales & Catalog Data ] 
                 │
                 ▼
[ 1. Data Processing & Auditing ] ──► Cleaned sales transactions, discounts, and store hierarchies
                 │
                 ▼
[ 2. AI Multi-Horizon Forecasting ] ──► LightGBM Direct Models (7-Day, 30-Day, 90-Day horizons)
                 │
                 ▼
[ 3. Inventory Optimization Engine ] ──► Dynamic safety buffer, required stock & reorder quantities
                 │
                 ▼
[ 4. Interactive Decision Dashboard ] ──► Visual analytics, what-if simulator & replenishment workbench
```

### 1. Data Preparation & Feature Auditing
- Ingests multi-store sales transactions, catalog metadata, promotional discounts, and store hierarchy details.
- Validates data integrity, fills calendar gaps, and handles intermittent or seasonal retail sales trends.

### 2. Multi-Horizon Demand Forecasting
- Employs a **Direct Multi-Horizon Forecasting** approach using gradient-boosted decision trees (LightGBM).
- Generates independent forecasts for three key operational timeframes:
  - **7-Day Short-Term**: Rapid tactical replenishment and shelf management.
  - **30-Day Operational (Primary)**: Standard monthly replenishment and distributor purchase orders.
  - **90-Day Strategic**: Quarterly warehouse allocation and seasonal supply chain planning.
- Achieves high forecasting precision with an **R² score exceeding 0.92** on untouched evaluation datasets.

### 3. Inventory Replenishment & Optimization Engine
- Compares forecasted demand against live on-hand inventory levels for each product-store pair.
- Computes:
  - **Safety Buffer Stock**: Configurable risk buffer to hedge against unexpected sales spikes.
  - **Required Stock**: 30-Day Forecasted Demand × (1 + Safety Buffer).
  - **Stock Status**: Categorizes items as **Critical** (<50% coverage), **Low** (50%–100%), or **Sufficient** (≥100%).
  - **Recommended Reorder Units**: Exact deficit to order immediately.

---

## 🖥️ Dashboard Features

PredictStock features an interactive, clean enterprise web dashboard that turns forecast numbers into actionable purchasing recommendations:

### 1. 📊 Executive & Store Analytics
- **High-Level KPI Summary**: Instant visibility into total evaluated product-store pairs, total 30-day forecasted demand volume, on-hand inventory, and total recommended order units.
- **Stock Health Breakdown**: Donut chart showing the proportion of items in Critical, Low, and Sufficient stock conditions.
- **Store-by-Store Comparison**: Grouped charts comparing current stock vs. required stock vs. reorder quantities across all retail branches.
- **Top Urgent Items**: Ranked overview highlighting the product-store pairs facing the most severe stock deficits.
- **Multi-Horizon Demand Volume**: Side-by-side comparison of 7-day, 30-day, and 90-day demand totals across branches.

### 2. 🔍 Product Deep Dive & What-If Simulator
- **Single-Product Inspection**: Detailed view for any SKU across individual store branches with catalog specifications.
- **Interactive "What-If" Simulation**:
  - Adjust on-hand inventory live to evaluate immediate stock status changes.
  - Modify the safety buffer slider (0% to 100%) to observe real-time impacts on recommended order volume.
- **Stock Coverage Gauge**: Intuitive visual dial illustrating current stock coverage relative to required levels.
- **Demand Trend Curves**: Multi-horizon demand curves (7D, 30D, 90D) comparing product forecasts against category averages.
- **Related Products Panel**: Recommendations for related items within the same category and store for cross-replenishment planning.

### 3. 📋 Replenishment Workbench
- **Actionable Order Grid**: Centralized table presenting stock health status, current inventory, multi-horizon forecasts, required stock, and exact reorder recommendations.
- **Visual Stock Health Indicators**: Color-coded badges and mini progress indicators for quick identification of critical stockouts.
- **Search & Pagination**: Effortlessly filter and browse across thousands of product-store combinations.
- **Export Data**: One-click download of the active replenishment recommendations in **CSV** or **Parquet** formats for direct integration with ERP or procurement systems.

### 4. 🧠 Model Performance & Validation
- **Accuracy Metrics**: Transparent evaluation reporting R² score, Mean Absolute Error (MAE), and bias metrics on untouched test data.
- **Multi-Horizon Benchmarking**: Clear performance breakdown demonstrating consistent accuracy across 7-day, 30-day, and 90-day horizons.

### 5. ⚙️ Global Optimization & Scope Controls
- **Branch Filtering**: Filter analytics and tables by individual stores or all branches simultaneously.
- **Safety Policy Control**: Set enterprise-wide default safety buffers (from lean 0% to conservative 100%).
- **Status Filter**: Focus specifically on critical stockout risks or items requiring immediate reorder.
- **Custom Inventory Ingestion**: Upload custom store stock CSVs or switch back to default demonstration inventory anytime.

---

## 📂 Project Structure

```
PredictStock/
├── backend/                  # FastAPI Application Service
│   ├── main.py               # Application endpoints & business services
│   ├── requirements.txt      # Python dependencies
│   ├── run.py                # Server launcher script
│   └── start.bat             # 1-Click Windows startup script
├── frontend/                 # React + Vite Web Application
│   ├── src/                  # Dashboard pages, components & visual charts
│   ├── package.json          # Node dependencies
│   └── start.bat             # 1-Click Windows startup script
├── src/                      # Core Forecasting & Optimization Logic
│   ├── forecasting.py        # Model loading & forecast generation
│   ├── inventory.py          # Replenishment rules & safety buffer engine
│   └── predictstock_service.py # End-to-end orchestration service
├── models/                   # Serialized ML model binaries (LightGBM, CatBoost)
├── notebooks/                # Jupyter exploration & model training notebooks
├── data/                     # Store catalogs, audit data, and precomputed forecasts
└── README.md                 # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- **Python**: Version 3.9 or higher
- **Node.js**: Version 18 or higher

### 1. Launch the Backend
Open a terminal in the project root:
```bash
cd backend
pip install -r requirements.txt
python run.py
```
> The API server will be live at: `http://localhost:8000` (API documentation at `http://localhost:8000/docs`).

### 2. Launch the Dashboard
Open a second terminal in the project root:
```bash
cd frontend
npm install
npm run dev
```
> The web dashboard will be accessible at: `http://localhost:5173`.

---

## 📄 License
This project is developed for educational and portfolio demonstration purposes.
