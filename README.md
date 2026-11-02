# PredictStock

### An AI-Based Demand Forecasting and Inventory Optimization System

*Forecast Smarter. Stock Better.*

PredictStock is an AI-powered retail inventory management system that uses machine learning to forecast product demand and recommend optimal replenishment quantities.

It uses a trained **LightGBM model** to generate 7-day, 30-day and 90-day demand forecasts across four retail stores. By combining predicted demand with current stock information, it helps identify inventory shortages and supports better stock planning.

### Key Features

* **Demand Forecasting:** 7-day, 30-day and 90-day product demand predictions.
* **Executive Analytics:** Inventory KPIs, stock health distribution, store comparisons and demand analysis.
* **Product Deep Dive:** Product-level forecasting, inventory analysis and What-If simulations.
* **Related Products:** Category-based product suggestions with forecast information.
* **Replenishment Workbench:** Product-wise stock requirements and recommended order quantities.
* **Inventory Classification:** Critical, Low and Sufficient stock identification.
* **Model Evaluation:** Comparison of LightGBM, CatBoost and XGBoost using R², MAE and RMSE.
* **Data Export:** Download inventory and replenishment results in CSV and Parquet formats.

### System Workflow

```
Historical Sales Data
       |
       v
Data Preparation & Feature Engineering
       |
       v
LightGBM Model
       |
       v
7-Day / 30-Day / 90-Day Forecasts
       |
       +------ Current Stock CSV
       |              |
       +-------+------+
               |
               v
     Inventory Optimization
               |
               v
Stock Classification & 
Replenishment Recommendations
               |
               v
      Interactive Dashboard
```

### Dataset

**Original Dataset:** [Retail Sales Forecasting Data – Kaggle](https://www.kaggle.com/datasets/svizor/retail-sales-forecasting-data)

* **Historical sales records:** Approximately 7.4 million
* **Stores covered:** 4
* **Forecasted product–store combinations:** 13,447

### Model Performance

| Forecast Horizon | R² Score |
| :--- | :--- |
| **7-Day** | 93.46% |
| **30-Day** | 92.92% |

*90-day forecasts are generated, but a complete 90-day test evaluation was not available.*

### Technology Stack

* **Frontend:** React, Vite, Tailwind CSS, Recharts
* **Backend:** Python, FastAPI
* **Machine Learning:** LightGBM, CatBoost, XGBoost
* **Data Processing:** Pandas, NumPy
* **Storage:** CSV, Parquet

### Developer

**Ashish Kumar Sen**  
B.Tech – Computer Science and Design (CSD)  
Madhav Institute of Technology & Science, Gwalior  

*PredictStock — Smarter Inventory. Better Decisions.*
