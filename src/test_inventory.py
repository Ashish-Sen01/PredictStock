
import pandas as pd
from inventory import generate_inventory_recommendations

# Sample demand forecast
forecast_df = pd.DataFrame({
    "item_id": [101, 102, 103],
    "store_id": [1, 1, 1],
    "predicted_demand_30d": [100, 100, 0],
})

# Sample current stock
current_stock_df = pd.DataFrame({
    "item_id": [101, 102, 103],
    "store_id": [1, 1, 1],
    "current_stock": [20, 80, 0],
})

result = generate_inventory_recommendations(
    forecast_df,
    current_stock_df,
)

print(result[
    [
        "item_id",
        "predicted_demand_30d",
        "current_stock",
        "required_stock",
        "reorder_quantity",
        "stock_status",
    ]
].to_string(index=False))
