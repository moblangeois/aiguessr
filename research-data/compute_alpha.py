"""
Cronbach's alpha computation for AIGuessr research data.

Reads the item-level Site A data and computes internal consistency
(Cronbach's alpha) for each construct, pre and post intervention.

Requirements: pandas, numpy
Usage: python compute_alpha.py
"""

import pandas as pd
import numpy as np
import sys


def cronbach_alpha(df):
    """Compute Cronbach's alpha for a DataFrame of item scores."""
    df = df.dropna()
    n_items = df.shape[1]
    n_obs = df.shape[0]
    if n_items < 2 or n_obs < 2:
        return np.nan, n_obs
    item_vars = df.var(ddof=1)
    total_var = df.sum(axis=1).var(ddof=1)
    alpha = (n_items / (n_items - 1)) * (1 - item_vars.sum() / total_var)
    return alpha, n_obs


def main():
    data_path = "research-data/data_site_a_items.csv"
    try:
        df = pd.read_csv(data_path)
    except FileNotFoundError:
        print(f"File not found: {data_path}")
        print("Run this script from the repository root.")
        sys.exit(1)

    constructs = {
        "Materiality awareness (5 items)": {
            "pre": [f"mat{i}_pre" for i in range(1, 6)],
            "post": [f"mat{i}_post" for i in range(1, 6)],
        },
        "Impact representations (4 items)": {
            "pre": [f"imp{i}_pre" for i in range(1, 5)],
            "post": [f"imp{i}_post" for i in range(1, 5)],
        },
        "Critical self-efficacy (3 items)": {
            "pre": [f"eff{i}_pre" for i in range(1, 4)],
            "post": [f"eff{i}_post" for i in range(1, 4)],
        },
    }

    print("AIGuessr - Cronbach's Alpha (Site A, retrospective pretest)")
    print("=" * 65)
    print(f"{'Construct':<38} {'Phase':<6} {'alpha':>6} {'n':>5}")
    print("-" * 65)

    for name, phases in constructs.items():
        for phase, cols in phases.items():
            alpha, n = cronbach_alpha(df[cols])
            print(f"{name:<38} {phase:<6} {alpha:>6.3f} {n:>5d}")
        print()


if __name__ == "__main__":
    main()
