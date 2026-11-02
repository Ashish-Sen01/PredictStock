import pandas as pd
import numpy as np

def generate_inventory_recommendations(
    forecast_df: pd.DataFrame,
    current_stock_df: pd.DataFrame,
    safety_buffer: float = 0.20,
) -> pd.DataFrame:
    """
    Combine demand forecasts with uploaded current stock.

    Required forecast columns:
        item_id, store_id, predicted_demand_30d

    Required current stock columns:
        item_id, store_id, current_stock
    """

    forecast_required = {
        "item_id",
        "store_id",
        "predicted_demand_30d",
    }
    stock_required = {
        "item_id",
        "store_id",
        "current_stock",
    }

    missing_forecast = forecast_required - set(forecast_df.columns)
    missing_stock = stock_required - set(current_stock_df.columns)

    if missing_forecast:
        raise ValueError(
            f"Forecast is missing columns: {sorted(missing_forecast)}"
        )

    if missing_stock:
        raise ValueError(
            f"Stock CSV is missing columns: {sorted(missing_stock)}"
        )

    if not 0 <= safety_buffer <= 1:
        raise ValueError("safety_buffer must be between 0 and 1.")

    forecast = forecast_df[
        ["item_id", "store_id", "predicted_demand_30d"]
    ].copy()

    stock = current_stock_df[
        ["item_id", "store_id", "current_stock"]
    ].copy()

    if forecast.duplicated(["item_id", "store_id"]).any():
        raise ValueError("Forecast contains duplicate item-store pairs.")

    if stock.duplicated(["item_id", "store_id"]).any():
        raise ValueError("Stock CSV contains duplicate item-store pairs.")

    for column in ["predicted_demand_30d"]:
        forecast[column] = pd.to_numeric(
            forecast[column], errors="raise"
        )

    stock["current_stock"] = pd.to_numeric(
        stock["current_stock"], errors="raise"
    )

    if not np.isfinite(forecast["predicted_demand_30d"]).all():
        raise ValueError("Forecast demand contains invalid numeric values.")

    if not np.isfinite(stock["current_stock"]).all():
        raise ValueError("Current stock contains invalid numeric values.")

    if (forecast["predicted_demand_30d"] < 0).any():
        raise ValueError("Forecast demand cannot be negative.")

    if (stock["current_stock"] < 0).any():
        raise ValueError("Current stock cannot be negative.")

    result = forecast.merge(
        stock,
        on=["item_id", "store_id"],
        how="left",
        validate="one_to_one",
        indicator=True,
    )

    unmatched = result["_merge"] != "both"

    if unmatched.any():
        examples = result.loc[
            unmatched, ["item_id", "store_id"]
        ].head(5)

        raise ValueError(
            f"Current stock is missing for {int(unmatched.sum())} "
            f"forecast item-store pairs. Examples:\n{examples}"
        )

    result = result.drop(columns="_merge")

    result["required_stock"] = np.ceil(
        result["predicted_demand_30d"] * (1 + safety_buffer)
    ).astype("int64")

    result["reorder_quantity"] = (
        result["required_stock"] - result["current_stock"]
    ).clip(lower=0)

    result["stock_ratio"] = np.where(
        result["required_stock"] > 0,
        result["current_stock"] / result["required_stock"],
        np.inf,
    )

    result["stock_status"] = np.select(
        [
            result["required_stock"].eq(0),
            result["stock_ratio"] < 0.5,
            result["stock_ratio"] < 1.0,
        ],
        [
            "Sufficient",
            "Critical",
            "Low",
        ],
        default="Sufficient",
    )

    result["reorder_quantity"] = np.ceil(
        result["reorder_quantity"]
    ).astype("int64")

    return result
