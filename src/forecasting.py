
from pathlib import Path
import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parent.parent

FORECAST_PATH = (
    PROJECT_ROOT
    / "data"
    / "processed"
    / "final_demand_forecast.parquet"
)


def load_demand_forecast() -> pd.DataFrame:
    """Load and validate the saved demand forecast."""

    if not FORECAST_PATH.exists():
        raise FileNotFoundError(
            f"Forecast file not found: {FORECAST_PATH}"
        )

    forecast = pd.read_parquet(FORECAST_PATH)

    required_columns = {
        "item_id",
        "store_id",
        "predicted_demand_30d",
    }

    missing = required_columns - set(forecast.columns)

    if missing:
        raise ValueError(
            f"Forecast file is missing columns: {sorted(missing)}"
        )

    if forecast.duplicated(["item_id", "store_id"]).any():
        raise ValueError(
            "Forecast contains duplicate item-store pairs."
        )

    return forecast


if __name__ == "__main__":
    df = load_demand_forecast()

    print("Forecast loaded successfully.")
    print("Shape:", df.shape)
    print("Columns:", df.columns.tolist())
    print(df.head())
