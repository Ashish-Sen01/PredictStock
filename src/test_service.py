
import pandas as pd

from forecasting import load_demand_forecast
from predictstock_service import get_inventory_recommendations

# Load the actual saved forecast.
forecast = load_demand_forecast()

# Generate synthetic stock for testing only.
# This covers every product-store pair in the forecast.
sample_stock = forecast[["item_id", "store_id"]].copy()
sample_stock["current_stock"] = 50

# Run the complete service.
result = get_inventory_recommendations(sample_stock)

print("Service test passed.")
print("Forecast pairs:", len(forecast))
print("Recommendation rows:", len(result))
print("\nSample recommendations:")

print(
    result[
        [
            "item_id",
            "store_id",
            "predicted_demand_30d",
            "current_stock",
            "required_stock",
            "reorder_quantity",
            "stock_status",
        ]
    ].head(10).to_string(index=False)
)

print("\nStock status counts:")
print(result["stock_status"].value_counts())
