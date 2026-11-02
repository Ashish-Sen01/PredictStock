
import pandas as pd

from forecasting import load_demand_forecast
from inventory import generate_inventory_recommendations
from related_products import get_related_product_recommendations


def get_inventory_recommendations(
    current_stock_df: pd.DataFrame,
    safety_buffer: float = 0.20,
) -> pd.DataFrame:
    """Combine saved demand forecasts with uploaded current stock."""

    forecast_df = load_demand_forecast()

    return generate_inventory_recommendations(
        forecast_df=forecast_df,
        current_stock_df=current_stock_df,
        safety_buffer=safety_buffer,
    )


def get_related_products(
    item_id: str,
    store_id: int,
    limit: int = 5,
) -> pd.DataFrame:
    """Return related products with their available saved forecasts."""

    return get_related_product_recommendations(
        item_id=item_id,
        store_id=store_id,
        limit=limit,
    )
