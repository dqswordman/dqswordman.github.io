"""Rebuild the web figures and result rows from the public WSDM CPU artifact."""

import argparse
import csv
import json
from math import isclose
from pathlib import Path
from statistics import fmean, median
import subprocess

import matplotlib
import numpy as np

matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.ticker import MultipleLocator


SITE = Path(__file__).resolve().parents[1]
RELEASE = "7b0f639a207b1826915227aaff2eef3addea499d"
PAPER = "decision-sufficiency"
KEY = ("dataset_key", "query_id", "universe_name", "model_key")
POLICIES = {
    "BO9": {"en": "Best measured (BO9)", "zh": "已测最优（BO9）"},
    "P1": {"en": "Additive (P1)", "zh": "加性策略（P1）"},
    "P1-check": {"en": "P1 + one check", "zh": "P1 + 一次核验"},
    "Adaptive": {"en": "Adaptive fit", "zh": "自适应二次拟合"},
    "BO-adaptive": {"en": "Best measured (pairs)", "zh": "补测对后取已测最优"},
    "Adaptive-check": {"en": "Adaptive + one check", "zh": "自适应拟合 + 一次核验"},
    "Random pairs": {"en": "Random pairs", "zh": "随机证据对"},
    "Hashed subsets": {"en": "Hashed subsets", "zh": "按哈希选子集"},
    "All-pairs": {"en": "All-pairs fit", "zh": "全证据对拟合"},
}
BASE_POLICIES = ("BO9", "P1", "P1-check")
PAIR_POLICIES = ("Adaptive", "BO-adaptive", "Adaptive-check", "Random pairs", "Hashed subsets", "All-pairs")
COMPARISONS = {
    ("P1", "BO9"): "P1 − BO9",
    ("P1-check", "BO9"): "P1 + check − BO9",
    ("P1-check", "P1"): "P1 + check − P1",
    ("Adaptive", "BO-adaptive"): "Adaptive fit − BO-pairs",
}
COLORS = {"ink": "#18382e", "muted": "#52665b", "grid": "#dce5d9",
          "surface": "#fdfef9", "measured": "#94aa9c", "estimate": "#d3b27f",
          "selected": "#2b6a55"}


def release_csv(artifact, name):
    result = subprocess.run(
        ["git", "-C", str(artifact), "show", f"{RELEASE}:{name}"],
        check=True, capture_output=True, encoding="utf-8",
    )
    return list(csv.DictReader(result.stdout.splitlines()))


def policy_tables(artifact):
    selection = {r["method"]: r for r in release_csv(artifact, "reference/results/selection_overall.csv")
                 if r["budget"] == "3"}
    generation = {r["method"]: r for r in release_csv(artifact, "reference/results/generation_overall.csv")}
    means = {name: float(selection[name]["mean_regret"]) for name in BASE_POLICIES}

    def policy_row(name):
        answer = generation.get(name)
        metrics = [f"{float(answer[key]):.3f}" for key in ("token_f1", "exact_match")] if answer else ["—", "—"]
        return [POLICIES[name], f"{float(selection[name]['mean_probes']):.2f}",
                f"{float(selection[name]['mean_regret']):.3f}", *metrics]

    effects = {}
    metrics = ("normalized_regret", "token_f1", "exact_match")
    for filename in ("selection_paired.csv", "generation_paired.csv"):
        for row in release_csv(artifact, "reference/results/" + filename):
            pair = row["left"], row["right"]
            if row["budget"] == "3" and pair in COMPARISONS and row["metric"] in metrics:
                assert (row["n"], row["clusters"]) == ("1440", "180")
                effects[(*pair, row["metric"])] = tuple(float(row[key]) for key in ("mean", "ci_lo", "ci_hi"))

    comparisons = [
        [{locale: f"{POLICIES[left][locale]} − {POLICIES[right][locale]}" for locale in ("en", "zh")},
         *(format_interval(effects[left, right, metric]) for metric in metrics)]
        for left, right in COMPARISONS
    ]
    return means, effects, {
        "policies": [policy_row(name) for name in BASE_POLICIES],
        "pair-policies": [policy_row(name) for name in PAIR_POLICIES],
        "paired": comparisons,
    }


def format_interval(effect):
    value, lo, hi = effect
    return f"{value:+.3f} [{lo:+.3f}, {hi:+.3f}]".replace("-", "−")


def diagnostic_tables(artifact):
    geometry = {(row["domain_budget"], row["metric"]): row
                for row in release_csv(artifact, "reference/results/geometry_overall.csv")}
    extension = {(row["m"], row["method"]): row
                 for row in release_csv(artifact, "reference/results/extension_summary.csv")}
    domains = {
        "3": {"en": "Up to 3 passages", "zh": "最多 3 段"},
        "4": {"en": "Up to 4 passages", "zh": "最多 4 段"},
        "8": {"en": "Full eight-passage cube", "zh": "八段完整集合"},
    }
    expansion_labels = {**POLICIES, "BO9": {"en": "Best measured (base)", "zh": "初始已测最优"}}
    interaction_rates = ("material_negative_marginal_rate", "material_positive_hessian_rate")

    def interaction(domain, metric):
        row = geometry[domain, metric]
        assert (row["n"], row["clusters"]) == ("1440", "180")
        return f"{float(row['mean']):.1%}"

    def extension_cell(width, name):
        row = extension[width, name]
        assert row["n"] == "40"
        return f"{float(row['mean_regret']):.3f} ({float(row['mean_probes']):.2f})"

    return {
        "geometry": [[label, *(interaction(domain, metric) for metric in interaction_rates)]
                     for domain, label in domains.items()],
        "pool-expansion": [[expansion_labels[name], *(extension_cell(width, name) for width in ("8", "12"))]
                           for name in (*BASE_POLICIES, "Adaptive", "BO-adaptive")],
    }


def archived_cases(artifact, means):
    scales = {(r["dataset_key"], r["universe_name"], r["model_key"]): float(r["scale"])
              for r in release_csv(artifact, "reference/results/scales.csv")}
    frozen_p1 = {(r["dataset_key"], r["query_id"], r["universe_name"], r["target_model"]): int(r["subset_bitmask"])
                 for r in release_csv(artifact, "data/v4_generated_selected_sets.csv")
                 if r["selection_role"] == "P1_mplus1"}
    generation = {tuple(r[k] for k in KEY) + (int(r["selected_mask"]),): r
                  for r in release_csv(artifact, "data/generation_context_scores.csv")}
    feasible = np.array([mask for mask in range(256) if bin(mask).count("1") <= 3])
    singletons = np.array([1 << bit for bit in range(8)])
    initial = np.r_[0, singletons]
    incidence = ((feasible[:, None] & singletons) != 0).astype(float)
    totals = {name: [] for name in BASE_POLICIES}
    differences = []
    extra_calls = 0
    candidates = []
    for row in release_csv(artifact, "data/m8_raw_mean_logprobs.csv"):
        identity = tuple(row[k] for k in KEY)
        scores = np.array([float(row[f"mask_{mask}"]) for mask in range(256)])
        scores -= scores[0]
        predictions = incidence @ scores[singletons]
        proposal_index = int(predictions.argmax())
        proposal = int(feasible[proposal_index])
        assert proposal == frozen_p1[identity]
        best_initial = int(initial[scores[initial].argmax()])
        checked = min((best_initial, proposal), key=lambda mask: (-scores[mask], mask))
        oracle = scores[feasible].max()
        scale = scales[identity[0], identity[2], identity[3]]
        chosen = {"BO9": best_initial, "P1": proposal, "P1-check": checked}
        regrets = {name: (oracle - scores[mask]) / scale for name, mask in chosen.items()}
        for name, regret in regrets.items():
            totals[name].append(regret)
        differences.append(regrets["BO9"] - regrets["P1"])
        extra_calls += proposal not in initial
        if identity[2] == "B_m8" and bin(proposal).count("1") >= 2:
            candidates.append({
                "identity": identity, "gain": regrets["BO9"] - regrets["P1"],
                "predicted": float(predictions[proposal_index]), "chosen": chosen,
                "utilities": {name: float(scores[mask]) for name, mask in chosen.items()},
                "answers": {name: generation[identity + (mask,)] for name, mask in chosen.items()},
            })

    assert extra_calls == 876
    assert sum(delta > 0 for delta in differences) == 324
    assert sum(delta < 0 for delta in differences) == 552
    for name in BASE_POLICIES:
        assert len(totals[name]) == 1440 and isclose(fmean(totals[name]), means[name], abs_tol=1e-12)
    strata = [
        [case for case in candidates if case["gain"] >= .05],
        [case for case in candidates if case["gain"] <= -.05],
    ]
    assert [len(stratum) for stratum in strata] == [105, 185]
    examples = []
    for stratum in strata:
        middle = median(case["gain"] for case in stratum)
        examples.append(min(stratum, key=lambda case: (abs(case["gain"] - middle), case["identity"])))
    assert [case["identity"][1] for case in examples] == ["2hop__107905_110222", "2hop__10620_49084"]
    return examples


def style_axis(axis, xlabel, bounds, tick):
    axis.set_axisbelow(True)
    axis.grid(axis="x", linewidth=.8, color=COLORS["grid"])
    axis.spines[:].set_visible(False)
    axis.tick_params(axis="both", length=0, pad=9)
    axis.tick_params(axis="x", labelsize=12, colors=COLORS["muted"])
    axis.xaxis.set_major_locator(MultipleLocator(tick))
    axis.set_xlim(bounds)
    axis.set_xlabel(xlabel, loc="left", labelpad=9, fontsize=13, color=COLORS["muted"])
    axis.invert_yaxis()


def annotate_bars(axis, values):
    gap = axis.get_xlim()[1] * .025
    for y, value in enumerate(values):
        axis.text(value + gap, y, f"{value:.3f}", va="center", color=COLORS["ink"],
                  fontsize=14, fontweight="bold")


def render_figures(folder, means, effects, examples):
    plt.rcParams.update({
        "font.family": "DejaVu Sans", "text.color": COLORS["ink"],
        "axes.facecolor": COLORS["surface"], "figure.facecolor": COLORS["surface"],
        "ytick.color": COLORS["ink"], "ytick.labelsize": 14,
    })
    fig, axis = plt.subplots(figsize=(9, 3.8))
    fig.subplots_adjust(left=.29, right=.95, top=.95, bottom=.22)
    values = list(means.values())
    axis.barh([POLICIES[name]["en"] for name in BASE_POLICIES], values, height=.48,
              color=[COLORS[key] for key in ("measured", "estimate", "selected")])
    style_axis(axis, "Mean normalized regret (lower is better)", (0, .33), .10)
    annotate_bars(axis, values)
    fig.savefig(folder / "mean-regret.png", dpi=150)
    plt.close(fig)

    fig, axes = plt.subplots(2, 1, figsize=(9, 7.2))
    fig.subplots_adjust(left=.36, right=.94, top=.87, bottom=.13, hspace=.87)
    panels = [
        ("normalized_regret", "Normalized regret", "Difference in regret (lower favors first)", (-.15, .14), .05),
        ("token_f1", "Generated-answer token F1", "Difference in token F1 (higher favors first)", (-.065, .065), .02),
    ]
    for axis, (metric, title, xlabel, bounds, tick) in zip(axes, panels):
        values, lows, highs = np.array([effects[(*pair, metric)] for pair in COMPARISONS]).T
        positions = np.arange(len(values))
        axis.axvline(0, color=COLORS["muted"], linewidth=1.1, linestyle=(0, (4, 4)))
        axis.errorbar(values, positions, xerr=[values - lows, highs - values], fmt="o",
                      color=COLORS["selected"], elinewidth=2, markersize=7, capsize=4, zorder=3)
        axis.set_yticks(positions, COMPARISONS.values(), fontsize=13)
        axis.set_title(title, loc="left", pad=13, fontsize=17, fontweight="bold")
        axis.set_ylim(-.5, len(values) - .5)
        style_axis(axis, xlabel, bounds, tick)
    fig.savefig(folder / "paired-effects.png", dpi=150)
    plt.close(fig)

    fig, axes = plt.subplots(2, 1, figsize=(9, 7.2))
    fig.subplots_adjust(left=.29, right=.94, top=.89, bottom=.14, hspace=.88)
    case_style = [("A  ·  A Burial at Ornans", 6.7, 2.0),
                  ("B  ·  King Arthur", 1.9, .5)]
    for axis, case, (title, xmax, tick) in zip(axes, examples, case_style):
        values = [case["predicted"], case["utilities"]["P1"], case["utilities"]["BO9"]]
        proposal_wins = case["chosen"]["P1"] == case["chosen"]["P1-check"]
        colors = ["estimate", "selected", "measured"] if proposal_wins else ["estimate", "measured", "selected"]
        axis.barh(["Additive estimate", "Measured proposal", "Initial best"], values, height=.46,
                  color=[COLORS[key] for key in colors])
        axis.set_title(title, loc="left", pad=12, fontsize=17, fontweight="bold")
        style_axis(axis, "Centered utility (nats per answer token)", (0, xmax), tick)
        annotate_bars(axis, values)
    fig.savefig(folder / "utility-examples.png", dpi=150)
    plt.close(fig)


def example_rows(examples):
    rows = []
    for label, case in zip("AB", examples):
        for name in BASE_POLICIES:
            mask = case["chosen"][name]
            positions = ", ".join(str(bit + 1) for bit in range(8) if mask & (1 << bit)) or "∅"
            score = case["answers"][name]
            rows.append([label, POLICIES[name], positions, f"{case['utilities'][name]:.3f}",
                         f"{float(score['token_f1']):.3f}", str(int(float(score["exact_match"])))])
    return rows


def write_report_rows(tables):
    report_path = SITE / "content" / "technical-reports" / (PAPER + ".json")
    report = json.loads(report_path.read_text(encoding="utf-8"))
    for section in report["sections"]:
        for block in section.get("blocks", []):
            if block["type"] == "table":
                block["rows"] = tables.pop(block["key"])
    assert not tables
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--artifact", type=Path, default=SITE.parent / "rag-decision-sufficiency",
                        help="Local Git checkout containing the public v1.0.0 artifact")
    args = parser.parse_args()
    means, effects, tables = policy_tables(args.artifact)
    examples = archived_cases(args.artifact, means)
    output = SITE / "public" / "assets" / "reports" / PAPER
    output.mkdir(parents=True, exist_ok=True)
    render_figures(output, means, effects, examples)
    tables.update(diagnostic_tables(args.artifact))
    tables["examples"] = example_rows(examples)
    write_report_rows(tables)
    for label, case in zip("AB", examples):
        print(f"Case {label}: {' / '.join(case['identity'])}, masks {case['chosen']}")
    print("Wrote three figures and six data tables from the pinned public artifact.")


if __name__ == "__main__":
    main()
