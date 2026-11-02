import io
import sys
from pathlib import Path
from typing import Optional

import numpy as np
import pandas as pd
from fastapi import FastAPI, File, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, StreamingResponse
from pydantic import BaseModel

# -----------------------------------------------------------------------------
# Path Resolution & Sys Path Setup
# -----------------------------------------------------------------------------
PROJECT_ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = PROJECT_ROOT / "src"
DATA_RAW_DIR = PROJECT_ROOT / "data" / "raw"
DATA_PROCESSED_DIR = PROJECT_ROOT / "data" / "processed"

if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

try:
    from forecasting import load_demand_forecast
    from inventory import generate_inventory_recommendations
except ImportError as e:
    raise RuntimeError(f"Could not import modules from src/: {e}")

# -----------------------------------------------------------------------------
# FastAPI App & Middleware
# -----------------------------------------------------------------------------
app = FastAPI(
    title="PredictStock API",
    description="Full-stack API for Retail Demand Forecasting & Inventory Optimization",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------------------------------------------------------
# Data Loading & Enrichment Utilities
# -----------------------------------------------------------------------------
def load_base_forecast() -> tuple[pd.DataFrame, bool]:
    """Loads demand forecasts from data/processed/ or creates synthetic data."""
    try:
        df = load_demand_forecast()
        is_fallback = False
    except Exception:
        np.random.seed(42)
        n_pairs = 500
        stores = np.random.choice([1, 2, 3, 4], size=n_pairs, p=[0.37, 0.13, 0.07, 0.43])
        items = [f"{np.random.randint(10**11, 10**12 - 1):012x}" for _ in range(n_pairs)]
        d7 = np.random.gamma(shape=1.5, scale=18.0, size=n_pairs).round(2)
        d30 = (d7 * np.random.uniform(4.0, 4.6, size=n_pairs)).round(2)
        d90 = (d30 * np.random.uniform(2.7, 3.1, size=n_pairs)).round(2)
        df = pd.DataFrame({
            "item_id": items,
            "store_id": stores,
            "pair_code": np.arange(n_pairs),
            "predicted_demand_7d": d7,
            "predicted_demand_30d": d30,
            "predicted_demand_90d": d90,
        }).drop_duplicates(subset=["item_id", "store_id"])
        is_fallback = True
    return df, is_fallback


def load_raw_metadata() -> tuple[Optional[pd.DataFrame], Optional[pd.DataFrame]]:
    """Loads catalog.csv and stores.csv from data/raw/ if present."""
    catalog_path = DATA_RAW_DIR / "catalog.csv"
    stores_path = DATA_RAW_DIR / "stores.csv"

    catalog_df = None
    stores_df = None

    if stores_path.exists():
        try:
            stores_df = pd.read_csv(stores_path)
            keep_s = [c for c in ["store_id", "division", "format", "city", "area"] if c in stores_df.columns]
            stores_df = stores_df[keep_s].drop_duplicates(subset=["store_id"])
        except Exception:
            stores_df = None

    if catalog_path.exists():
        try:
            catalog_df = pd.read_csv(catalog_path, dtype={"item_id": "string"})
            keep_c = [c for c in ["item_id", "dept_name", "class_name", "subclass_name", "item_type"] if c in catalog_df.columns]
            catalog_df = catalog_df[keep_c].drop_duplicates(subset=["item_id"])
            for col in keep_c:
                if col != "item_id":
                    catalog_df[col] = catalog_df[col].fillna("Unknown").astype(str)
        except Exception:
            catalog_df = None

    return catalog_df, stores_df


def load_default_stock(forecast_df: pd.DataFrame) -> pd.DataFrame:
    """Loads saved inventory recommendations or generates synthetic stock (seed 42)."""
    rec_parquet = DATA_PROCESSED_DIR / "final_inventory_recommendation.parquet"
    rec_csv = DATA_PROCESSED_DIR / "final_inventory_recommendation.csv"

    if rec_parquet.exists():
        try:
            saved_rec = pd.read_parquet(rec_parquet)
            return saved_rec[["item_id", "store_id", "current_stock"]].copy()
        except Exception:
            pass

    if rec_csv.exists():
        try:
            saved_rec = pd.read_csv(rec_csv)
            return saved_rec[["item_id", "store_id", "current_stock"]].copy()
        except Exception:
            pass

    rng = np.random.default_rng(42)
    req_20 = np.ceil(forecast_df["predicted_demand_30d"] * 1.20)
    synth_stock = np.floor(req_20 * rng.uniform(0.30, 1.30, size=len(forecast_df))).astype("int64")
    stock_df = forecast_df[["item_id", "store_id"]].copy()
    stock_df["current_stock"] = synth_stock
    return stock_df


def build_inventory_recommendations(
    forecast_df: pd.DataFrame,
    stock_df: pd.DataFrame,
    safety_buffer: float,
    catalog_df: Optional[pd.DataFrame] = None,
    stores_df: Optional[pd.DataFrame] = None,
) -> pd.DataFrame:
    """Runs inventory logic and merges multi-horizon forecasts & catalog metadata."""
    f_df = forecast_df.copy()
    s_df = stock_df.copy()
    f_df["item_id"] = f_df["item_id"].astype(str)
    s_df["item_id"] = s_df["item_id"].astype(str)
    f_df["store_id"] = f_df["store_id"].astype("int64")
    s_df["store_id"] = s_df["store_id"].astype("int64")

    # Call inventory optimizer
    result = generate_inventory_recommendations(
        forecast_df=f_df,
        current_stock_df=s_df,
        safety_buffer=safety_buffer,
    )

    # Attach 7d and 90d forecasts
    extra_cols = [c for c in ["pair_code", "predicted_demand_7d", "predicted_demand_90d"] if c in f_df.columns]
    if extra_cols:
        result = f_df[["item_id", "store_id"] + extra_cols].merge(
            result, on=["item_id", "store_id"], how="right"
        )
    else:
        result["predicted_demand_7d"] = (result["predicted_demand_30d"] / 4.28).round(2)
        result["predicted_demand_90d"] = (result["predicted_demand_30d"] * 2.80).round(2)

    # Analytical columns
    result["safety_stock"] = (result["predicted_demand_30d"] * safety_buffer).round(2)
    result["exact_required_stock"] = (result["predicted_demand_30d"] * (1 + safety_buffer)).round(2)
    result["stock_gap"] = (result["exact_required_stock"] - result["current_stock"]).round(2)

    # Enrich metadata
    if stores_df is not None:
        s_meta = stores_df.copy()
        s_meta["store_id"] = pd.to_numeric(s_meta["store_id"], errors="coerce")
        result = result.merge(s_meta, on="store_id", how="left")

    if catalog_df is not None:
        c_meta = catalog_df.copy()
        c_meta["item_id"] = c_meta["item_id"].astype(str)
        result = result.merge(c_meta, on="item_id", how="left")

    return result


def prepare_records(df: pd.DataFrame) -> list[dict]:
    """Prepares and sanitizes pandas rows for JSON response."""
    cols = [
        "item_id", "store_id", "stock_status", "current_stock",
        "predicted_demand_7d", "predicted_demand_30d", "predicted_demand_90d",
        "safety_stock", "required_stock", "stock_ratio", "reorder_quantity",
        "dept_name", "class_name", "subclass_name", "item_type", "city", "format"
    ]
    avail_cols = [c for c in cols if c in df.columns]
    sub_df = df[avail_cols].copy()
    sub_df["item_id"] = sub_df["item_id"].astype(str)

    records = sub_df.to_dict(orient="records")
    for r in records:
        for k, v in r.items():
            if pd.isna(v) or v is None:
                r[k] = None
            elif isinstance(v, (np.floating, float)):
                if np.isnan(v) or np.isinf(v):
                    r[k] = None
                else:
                    r[k] = round(float(v), 2)
            elif isinstance(v, (np.integer, int)):
                r[k] = int(v)
    return records


def calculate_kpis(df: pd.DataFrame) -> dict:
    """Computes aggregate portfolio inventory KPIs."""
    total_pairs = len(df)
    total_30d_demand = float(df["predicted_demand_30d"].sum()) if "predicted_demand_30d" in df.columns else 0.0
    total_curr_stock = int(df["current_stock"].sum()) if "current_stock" in df.columns else 0
    total_req_stock = int(df["required_stock"].sum()) if "required_stock" in df.columns else 0
    total_reorder = int(df["reorder_quantity"].sum()) if "reorder_quantity" in df.columns else 0
    coverage_pct = round((total_curr_stock / total_req_stock * 100), 2) if total_req_stock > 0 else 100.0
    critical_count = int((df["stock_status"] == "Critical").sum()) if "stock_status" in df.columns else 0
    low_count = int((df["stock_status"] == "Low").sum()) if "stock_status" in df.columns else 0
    sufficient_count = int((df["stock_status"] == "Sufficient").sum()) if "stock_status" in df.columns else 0
    stores = sorted([int(s) for s in df["store_id"].unique()]) if "store_id" in df.columns else []

    return {
        "total_pairs": total_pairs,
        "total_30d_demand": round(total_30d_demand, 1),
        "total_current_stock": total_curr_stock,
        "total_required_stock": total_req_stock,
        "total_reorder": total_reorder,
        "coverage_pct": coverage_pct,
        "critical_count": critical_count,
        "low_count": low_count,
        "sufficient_count": sufficient_count,
        "stores": stores,
    }


# -----------------------------------------------------------------------------
# In-Memory App State
# -----------------------------------------------------------------------------
print("Initializing PredictStock backend state...")
forecast_df, using_fallback = load_base_forecast()
default_stock_df = load_default_stock(forecast_df)
catalog_meta, stores_meta = load_raw_metadata()

current_stock_df = default_stock_df.copy()
current_safety_buffer = 0.20
current_recommendations_df = build_inventory_recommendations(
    forecast_df, current_stock_df, current_safety_buffer, catalog_meta, stores_meta
)
print(f"Backend state loaded: {len(current_recommendations_df):,} product-store pairs.")


# -----------------------------------------------------------------------------
# Request Models
# -----------------------------------------------------------------------------
class ComputeRequest(BaseModel):
    safety_buffer: float = 0.20


# -----------------------------------------------------------------------------
# API Endpoints
# -----------------------------------------------------------------------------
@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "app": "PredictStock Full-Stack API",
        "total_pairs": len(forecast_df),
        "using_fallback": using_fallback,
    }


@app.get("/api/forecast-info")
def forecast_info():
    return {
        "total_pairs": len(forecast_df),
        "stores": sorted(forecast_df["store_id"].unique().tolist()),
        "using_fallback": using_fallback,
        "catalog_enriched": catalog_meta is not None,
        "stores_enriched": stores_meta is not None,
    }


@app.post("/api/compute")
def compute_inventory(req: ComputeRequest):
    global current_safety_buffer, current_recommendations_df

    buf = max(0.0, min(1.0, float(req.safety_buffer)))
    current_safety_buffer = buf

    current_recommendations_df = build_inventory_recommendations(
        forecast_df, current_stock_df, current_safety_buffer, catalog_meta, stores_meta
    )

    kpis = calculate_kpis(current_recommendations_df)
    rows = prepare_records(current_recommendations_df)

    return {
        "rows": rows,
        "kpis": kpis,
        "using_fallback": using_fallback,
    }


@app.post("/api/upload-stock")
async def upload_stock(file: UploadFile = File(...)):
    global current_stock_df, current_recommendations_df

    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted.")

    contents = await file.read()
    try:
        user_df = pd.read_csv(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {e}")

    req_cols = {"item_id", "store_id", "current_stock"}
    if not req_cols.issubset(set(user_df.columns)):
        raise HTTPException(
            status_code=400,
            detail=f"CSV must contain headers: {list(req_cols)}. Found: {list(user_df.columns)}",
        )

    try:
        user_df["item_id"] = user_df["item_id"].astype(str)
        user_df["store_id"] = user_df["store_id"].astype("int64")
        user_df["current_stock"] = pd.to_numeric(user_df["current_stock"], errors="coerce").fillna(0).astype("int64")

        # Validate with test calculation
        _ = generate_inventory_recommendations(forecast_df, user_df, safety_buffer=current_safety_buffer)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Stock data validation error: {e}")

    current_stock_df = user_df[["item_id", "store_id", "current_stock"]].copy()

    # Recompute recommendation
    current_recommendations_df = build_inventory_recommendations(
        forecast_df, current_stock_df, current_safety_buffer, catalog_meta, stores_meta
    )

    kpis = calculate_kpis(current_recommendations_df)
    rows = prepare_records(current_recommendations_df)

    return {
        "status": "success",
        "message": f"Successfully validated and updated {len(user_df):,} inventory pairs.",
        "count": len(user_df),
        "kpis": kpis,
        "rows": rows,
    }


@app.post("/api/reset-stock")
def reset_stock():
    global current_stock_df, current_recommendations_df
    current_stock_df = default_stock_df.copy()
    current_recommendations_df = build_inventory_recommendations(
        forecast_df, current_stock_df, current_safety_buffer, catalog_meta, stores_meta
    )
    kpis = calculate_kpis(current_recommendations_df)
    rows = prepare_records(current_recommendations_df)
    return {
        "status": "success",
        "message": "Reset to default synthetic demo inventory.",
        "kpis": kpis,
        "rows": rows,
    }


@app.get("/api/download/csv")
def download_recommendations_csv():
    output = io.StringIO()
    cols = [
        "item_id", "store_id", "dept_name", "class_name", "subclass_name", "item_type",
        "stock_status", "current_stock", "predicted_demand_7d", "predicted_demand_30d",
        "predicted_demand_90d", "safety_stock", "required_stock", "stock_ratio", "reorder_quantity"
    ]
    avail_cols = [c for c in cols if c in current_recommendations_df.columns]
    current_recommendations_df[avail_cols].to_csv(output, index=False)

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=predictstock_recommendations.csv"},
    )


@app.get("/api/download/template")
def download_stock_template():
    output = io.StringIO()
    default_stock_df[["item_id", "store_id", "current_stock"]].to_csv(output, index=False)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=current_stock_template.csv"},
    )


@app.get("/api/download/parquet")
def download_recommendations_parquet():
    output = io.BytesIO()
    cols = [
        "item_id", "store_id", "dept_name", "class_name", "subclass_name", "item_type",
        "stock_status", "current_stock", "predicted_demand_7d", "predicted_demand_30d",
        "predicted_demand_90d", "safety_stock", "required_stock", "stock_ratio", "reorder_quantity"
    ]
    avail_cols = [c for c in cols if c in current_recommendations_df.columns]
    current_recommendations_df[avail_cols].to_parquet(output, index=False)

    return Response(
        content=output.getvalue(),
        media_type="application/octet-stream",
        headers={"Content-Disposition": "attachment; filename=predictstock_recommendations.parquet"},
    )


@app.get("/api/ml-benchmarks")
def get_ml_benchmarks():
    return {
        "untouched_test": {
            "d7_r2": 0.9346,
            "d7_mae": 8.7609,
            "d7_bias": "-6.17%",
            "d30_r2": 0.9292,
            "d30_mae": 32.9550,
            "d30_bias": "-2.26%",
            "universe_pairs": 13447,
            "consistency_pct": 99.54,
        },
        "models_benchmark": [
            {"Horizon": "7-Day", "Model": "LightGBM", "MAE": 5.9730, "RMSE": 35.9214, "R2": 0.9088},
            {"Horizon": "7-Day", "Model": "CatBoost", "MAE": 6.7199, "RMSE": 83.4915, "R2": 0.5074},
            {"Horizon": "7-Day", "Model": "XGBoost", "MAE": 6.8180, "RMSE": 87.6570, "R2": 0.4570},
            {"Horizon": "30-Day", "Model": "LightGBM", "MAE": 21.5318, "RMSE": 207.0304, "R2": 0.8144},
            {"Horizon": "30-Day", "Model": "CatBoost", "MAE": 23.1553, "RMSE": 249.4300, "R2": 0.7305},
            {"Horizon": "30-Day", "Model": "XGBoost", "MAE": 24.4171, "RMSE": 354.2800, "R2": 0.4564},
            {"Horizon": "90-Day", "Model": "LightGBM", "MAE": 64.3348, "RMSE": 858.3357, "R2": 0.6050},
            {"Horizon": "90-Day", "Model": "CatBoost", "MAE": 64.6648, "RMSE": 775.4362, "R2": 0.6776},
            {"Horizon": "90-Day", "Model": "XGBoost", "MAE": 66.2583, "RMSE": 1018.0266, "R2": 0.4443},
        ],
        "baselines_comparison": [
            {"strategy": "7-Day Seasonal Naive (Val)", "mae": 3.1484, "rmse": 8.9070, "r2": 0.8893, "bias": "+9.60%"},
            {"strategy": "14-Day Recent Mean (Val)", "mae": 2.7120, "rmse": 8.4770, "r2": 0.9000, "bias": "+6.35%"},
            {"strategy": "28-Day Recent Mean (Val)", "mae": 2.6692, "rmse": 8.2355, "r2": 0.9053, "bias": "+4.84%"},
            {"strategy": "56-Day Historical Mean (Val)", "mae": 2.6201, "rmse": 8.1800, "r2": 0.9066, "bias": "+1.72%"},
            {"strategy": "56-Day Historical Mean (Test)", "mae": 2.4749, "rmse": 8.9687, "r2": 0.8835, "bias": "+7.91%"},
            {"strategy": "❌ Earlier Recursive XGBoost (Test)", "mae": 2.0657, "rmse": 8.6476, "r2": 0.6166, "bias": "+93.49% (Rejected)"},
        ],
    }


@app.get("/api/related-products")
def get_related_products_endpoint(
    item_id: str = Query(..., description="Target Item ID"),
    store_id: int = Query(..., description="Store branch ID"),
    limit: int = Query(5, ge=1, le=20),
):
    """Returns category-related products for the given item and store."""
    if catalog_meta is None:
        return {"items": [], "message": "Catalog metadata not loaded."}

    selected_rows = catalog_meta.loc[catalog_meta["item_id"] == str(item_id).strip()]
    if selected_rows.empty:
        return {"items": [], "message": f"Item {item_id} not found in catalog."}

    selected = selected_rows.iloc[0]

    # Filter forecasts for this store
    store_forecasts = forecast_df.loc[forecast_df["store_id"] == int(store_id)].copy()
    if store_forecasts.empty:
        return {"items": [], "message": f"No forecasts for store {store_id}."}

    store_forecasts["item_id"] = store_forecasts["item_id"].astype(str)
    candidates = store_forecasts.merge(catalog_meta, on="item_id", how="inner")
    candidates = candidates.loc[candidates["item_id"] != str(item_id).strip()].copy()

    if candidates.empty:
        return {"items": [], "message": "No candidates found."}

    category_weights = {
        "subclass_name": 4,
        "class_name": 3,
        "dept_name": 2,
        "item_type": 1,
    }

    candidates["similarity_score"] = 0
    candidates["match_reason"] = ""

    for col, weight in category_weights.items():
        if col in selected and pd.notna(selected[col]):
            sel_val = str(selected[col]).strip().casefold()
            if sel_val and sel_val != "unknown":
                matches = candidates[col].fillna("").astype(str).str.strip().str.casefold().eq(sel_val)
                candidates.loc[matches, "similarity_score"] += weight

    candidates = candidates.loc[candidates["similarity_score"] > 0]
    if candidates.empty:
        return {"items": [], "message": "No products match categories."}

    top_candidates = candidates.sort_values(
        by=["similarity_score", "predicted_demand_30d"],
        ascending=[False, False],
    ).head(limit)

    result_items = []
    for _, row in top_candidates.iterrows():
        result_items.append({
            "item_id": str(row["item_id"]),
            "dept_name": str(row.get("dept_name", "Unknown")),
            "class_name": str(row.get("class_name", "Unknown")),
            "subclass_name": str(row.get("subclass_name", "Unknown")),
            "item_type": str(row.get("item_type", "Unknown")),
            "similarity_score": int(row["similarity_score"]),
            "predicted_demand_7d": round(float(row.get("predicted_demand_7d", 0)), 2),
            "predicted_demand_30d": round(float(row.get("predicted_demand_30d", 0)), 2),
            "predicted_demand_90d": round(float(row.get("predicted_demand_90d", 0)), 2),
        })

    return {"items": result_items, "count": len(result_items)}
