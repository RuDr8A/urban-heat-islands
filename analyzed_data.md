# Urban Heat Island (UHI) Data Analysis & Insights Report
**Project:** Urban Heat Island Detection Model (Hackathon Prototype)  
**Dataset Size:** 2,500 rows  
**Target Variable:** Land Surface Temperature (LST)  

---

## Executive Summary

This report explains the data analysis for our Urban Heat Island (UHI) project. The dataset contains **2,500 location points**, which gives us a solid foundation to build, test, and demonstrate our machine learning prototype.

---

## 1. Dataset Quality & Feature Overview

Our dataset collects satellite indicator values (spectral indices) and geographic coordinates to measure surface heat.

| Feature Name | What It Measures | Function in Model | Status |
| :--- | :--- | :--- | :---: |
| **LST** | Land Surface Temperature | Target Variable (What we predict) | ✅ Good |
| **NDVI** | Vegetation & Greenery Level | Feature | ✅ Good |
| **NDBI** | Built-up & Concrete Density | Feature | ✅ Good |
| **NDWI** | Water & Moisture Level | Feature | ✅ Good |
| **Latitude** | Geographic Location (North-South) | Spatial Feature | ✅ Good |
| **Longitude** | Geographic Location (East-West) | Spatial Feature | ✅ Good |

---

## 2. Temperature Analysis & Summary

### Temperature Snapshot (°C)
* **Lowest Temperature:** $35.82^\circ	ext{C}$
* **Highest Temperature:** $61.36^\circ	ext{C}$
* **Average (Mean):** $47.91^\circ	ext{C}$
* **Middle Value (Median):** $47.63^\circ	ext{C}$

### Why Are Temperatures Like 55°C – 60°C+ Normal Here?
> **Key Concept:** **LST is surface ground temperature, not air temperature.**

Air temperature is what you feel in the shade, but ground temperature is what you feel if you touch the bare ground. Concrete roofs, asphalt roads, and stone structures absorb direct sunlight all day and trap immense heat. Reaching $55^\circ	ext{C} - 60^\circ	ext{C}+$ on sunlit asphalt is realistic and proves our dataset correctly highlights urban heat hot spots.

---

## 3. How Features Relate to Temperature (Correlation Analysis)

```
+-----------------------------------------------------------------+
| How Strongly Features Drive Surface Temperature (LST)           |
+-----------------------------------------------------------------+
| NDBI     | [===========================>        ]  +0.61 (Strong) |
| Latitude | [<<<<<<<<<<<<<<<<<<<<<<              ]  -0.45 (Moderate)|
| NDVI     | [<<<<<<<<<<<<<<<<<<<                 ]  -0.39 (Moderate)|
| NDWI     | [=========>                          ]  +0.17 (Weak)   |
+-----------------------------------------------------------------+
```

---

### Why Do the Values Behave Like This? (Detailed Explanation)

#### 1. NDBI vs. Temperature (+0.61) — Strong Positive
* **What it means:** More buildings and roads = Higher temperature.
* **Why this happens (Reason):** Materials like concrete, asphalt, stone, and metal absorb massive amounts of solar radiation and hold heat for hours. They don't cool off easily like natural soil or plants.
* **Expected vs Actual:** Expected a positive correlation, and the dataset strongly confirms it (+0.61). This will be our strongest predictor.

#### 2. Latitude vs. Temperature (-0.45) — Moderate Negative
* **What it means:** Moving south increases temperature steadily.
* **Why this happens (Reason):** Temperature isn't spread randomly. There is a continuous geographic gradient where the southern side of the studied region is naturally warmer due to local terrain, land cover layout, or exposure.
* **Expected vs Actual:** Latitude acts as a useful geographic coordinate feature to help the model learn spatial patterns.

#### 3. NDVI vs. Temperature (-0.39) — Moderate Negative
* **What it means:** More plants and trees = Lower surface temperature.
* **Why this happens (Reason):** Plants cool down their surroundings through two natural methods:
  1. **Shading:** Leaves block direct sunlight from heating up the ground.
  2. **Evapotranspiration:** Plants release water vapor into the air, acting as natural evaporative coolers.
* **Expected vs Actual:** Expected a negative correlation. The dataset supports our core Urban Heat Island hypothesis that greenery reduces surface heat.

#### 4. NDWI vs. Temperature (+0.17) — Weak Positive (The Unexpected Finding)
* **What was expected:** More water/moisture should mean lower temperatures (negative correlation).
* **What actually happened:** We got a weak positive correlation (+0.17).
* **Why did this happen? (Reason):** 
  * The dataset's NDWI values range from **-0.376 to +0.041** with an average of **-0.159**.
  * Over 95% of the data points have negative values, which means **there are almost no real water bodies (lakes, rivers, ponds) in this sample dataset**.
  * The points are almost entirely dry land, concrete, and sparse plants. Because there isn't enough actual water in the area to measure, NDWI isn't showing a natural water cooling effect.
* **Decision for the project:** Keep NDWI in the dataset as an optional feature, but do not focus heavily on it during presentations.

---

## 4. Heat Risk Categories & Imbalance Analysis

We split our target temperature data into 4 risk tiers:

```
Heat Risk Categories Distribution:
----------------------------------
Medium Risk  : [==================================================] 1,287 rows (51.5%)
High Risk    : [===================================               ]   903 rows (36.1%)
Extreme Risk : [=========                                         ]   233 rows ( 9.3%)
Low Risk     : [===                                               ]    77 rows ( 3.1%)
```

### What is the Issue Here?
* Over **87%** of our data points fall into the **Medium** and **High** categories.
* Very few points fall into **Low (3.1%)** or **Extreme (9.3%)**.

### Modeling Risk:
If we train a basic model, it might learn a shortcut: *"Guess Medium most of the time to get high overall accuracy."* This would make the model perform poorly when predicting critical **Extreme Heat Risk** zones.

### Simple Solutions for Model Building:
1. **Balanced Stratified Splits:** Use `StratifiedKFold` so every training split keeps the exact same mix of Low, Medium, High, and Extreme classes.
2. **Class Weighting:** Set `class_weight='balanced'` in XGBoost or Random Forest so the model pays equal attention to rare Extreme Risk cases.
3. **Resampling:** Use synthetic oversampling (SMOTE) to boost Low and Extreme class numbers if necessary.

---

## 5. Summary & Action Steps

1. **Feature Engineering:** Create a combined index ratio (Built-up area divided by Greenery) to help the model identify hot spots even faster.
2. **Model Choice:** Use tree-based ensemble models like **Random Forest** or **XGBoost** because they handle non-linear patterns and slightly imbalanced data effectively.
3. **Presentation Focus:** Highlight **NDBI (Concrete)** and **NDVI (Greenery)** as primary drivers of Urban Heat Islands during the demo.