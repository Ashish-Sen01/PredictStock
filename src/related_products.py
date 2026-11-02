
from pathlib import Path

import pandas as pd

from forecasting import load_demand_forecast


PROJECT_ROOT = Path(__file__).resolve().parent.parent
CATALOG_PATH = PROJECT_ROOT / "data" / "raw" / "catalog.csv"

CATEGORY_WEIGHTS = {
    "subclass_name": 4,
    "class_name": 3,
    "dept_name": 2,
    "item_type": 1,
}


def get_related_product_recommendations(
    item_id: str,
    store_id: int,
    limit: int = 5,
) -> pd.DataFrame:
    """
    Recommend similar products with saved forecasts for the selected store.

    Similarity is based on matching product categories.
    Only products with saved forecasts for the selected store are returned.
    """

    if limit < 1:
        raise ValueError("limit must be at least 1.")

    if not CATALOG_PATH.exists():
        raise FileNotFoundError(
            f"Product catalog not found: {CATALOG_PATH}"
        )

    catalog = pd.read_csv(
        CATALOG_PATH,
        dtype={"item_id": "string"},
    )

    required_catalog = {
        "item_id",
        "dept_name",
        "class_name",
        "subclass_name",
        "item_type",
    }

    missing = required_catalog - set(catalog.columns)
    if missing:
        raise ValueError(
            f"Catalog is missing columns: {sorted(missing)}"
        )

    catalog = catalog.dropna(subset=["item_id"]).copy()
    catalog["item_id"] = catalog["item_id"].str.strip()
    catalog = catalog.drop_duplicates("item_id", keep="first")

    catalog["item_id"] = catalog["item_id"].astype("string")
    selected_id = str(item_id).strip()

    selected_rows = catalog.loc[
        catalog["item_id"] == selected_id
    ]

    if selected_rows.empty:
        raise ValueError(
            f"Product {selected_id!r} was not found in the catalog."
        )

    selected = selected_rows.iloc[0]

    forecast = load_demand_forecast().copy()
    forecast["item_id"] = forecast["item_id"].astype("string").str.strip()

    if "store_id" not in forecast.columns:
        raise ValueError("Forecast is missing store_id.")

    store_forecasts = forecast.loc[
        forecast["store_id"] == int(store_id)
    ].copy()

    if store_forecasts.empty:
        raise ValueError(
            f"No saved forecasts found for store {store_id}."
        )

    candidates = store_forecasts.merge(
        catalog,
        on="item_id",
        how="inner",
        validate="many_to_one",
    )

    # Never recommend the selected product itself.
    candidates = candidates.loc[
        candidates["item_id"] != selected_id
    ].copy()

    if candidates.empty:
        return candidates

    candidates["similarity_score"] = 0
    candidates["match_reason"] = ""

    matched_categories = []

    for column, weight in CATEGORY_WEIGHTS.items():
        selected_value = selected[column]

        if pd.isna(selected_value):
            continue

        selected_value = str(selected_value).strip().casefold()

        if not selected_value:
            continue

        matches = (
            candidates[column]
            .fillna("")
            .astype(str)
            .str.strip()
            .str.casefold()
            .eq(selected_value)
        )

        candidates.loc[matches, "similarity_score"] += weight

        if matches.any():
            matched_categories.append((column, matches))

    if not matched_categories:
        return candidates.iloc[0:0].copy()

    reasons = pd.Series(
        "",
        index=candidates.index,
        dtype="string",
    )

    for column, matches in matched_categories:
        reasons.loc[matches] = reasons.loc[matches].apply(
            lambda current: (
                f"{current}, {column}"
                if current
                else f"Same {column.replace('_name', '').replace('_', ' ')}"
            )
        )

    candidates["match_reason"] = reasons

    candidates = candidates.loc[
        candidates["similarity_score"] > 0
    ].copy()

    candidates = candidates.sort_values(
        ["similarity_score", "item_id"],
        ascending=[False, True],
    )

    output_columns = [
        column
        for column in [
            "item_id",
            "store_id",
            "dept_name",
            "class_name",
            "subclass_name",
            "item_type",
            "predicted_demand_7d",
            "predicted_demand_30d",
            "predicted_demand_90d",
            "similarity_score",
            "match_reason",
        ]
        if column in candidates.columns
    ]

    return candidates[output_columns].head(limit).reset_index(drop=True)
