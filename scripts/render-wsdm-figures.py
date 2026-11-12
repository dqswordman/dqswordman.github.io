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
}
COMPARISONS = [("P1", "BO9"), ("P1-check", "BO9"), ("P1-check", "P1")]
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
    means = {name: float(selection[name]["mean_regret"]) for name in POLICIES}
    results = [
        [label, f"{float(selection[name]['mean_probes']):.2f}", f"{means[name]:.3f}",
         f"{float(generation[name]['token_f1']):.3f}", f"{float(generation[name]['exact_match']):.3f}"]
        for name, label in POLICIES.items()
    ]

    pairs = {}
    for filename in ("selection_paired.csv", "generation_paired.csv"):
        for row in release_csv(artifact, "reference/results/" + filename):
            if row["budget"] == "3":
                pairs[row["left"], row["right"], row["metric"]] = row

    def interval(left, right, metric):
        row = pairs[left, right, metric]
        assert (row["n"], row["clusters"]) == ("1440", "180")
        value, lo, hi = (float(row[key]) for key in ("mean", "ci_lo", "ci_hi"))
        return f"{value:+.3f} [{lo:+.3f}, {hi:+.3f}]".replace("-", "−")

    comparisons = [
        [{locale: f"{POLICIES[left][locale]} − {POLICIES[right][locale]}" for locale in ("en", "zh")},
         *(interval(left, right, metric) for metric in ("normalized_regret", "token_f1", "exact_match"))]
        for left, right in COMPARISONS
    ]
    return means, results, comparisons


def archived_cases(artifact, means):
    scales = {(r["dataset_key"], r["universe_name"], r["model_key"]): float(r["scale"])
              for r in release_csv(artifact, "reference/results/scales.csv")}
    frozen_p1 = {(r["dataset_key"], r["query_id"], r["universe_name"], r["target_model"]): int(r["subset_bitmask"])
                 for r in release_csv(artifact, "data/v4_generated_selected_sets.csv")
                 if r["selection_role"] == "P1_mplus1"}
    generation = {tuple(r[k] for k in KEY) + (int(r["selected_mask"]),): r
                  for r in release_csv(artifact, "data/generation_context_scores.csv")}
    feasible = np.array([mask for mask in range(256) if mask.bit_count() <= 3])
    singletons = np.array([1 << bit for bit in range(8)])
    initial = np.r_[0, singletons]
    incidence = ((feasible[:, None] & singletons) != 0).astype(float)
    totals = {name: [] for name in POLICIES}
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
        extra_calls += proposal not in initial
        if identity[2] == "B_m8" and proposal.bit_count() >= 2:
            candidates.append({
                "identity": identity, "gain": regrets["BO9"] - regrets["P1"],
                "predicted": float(predictions[proposal_index]), "chosen": chosen,
                "utilities": {name: float(scores[mask]) for name, mask in chosen.items()},
                "answers": {name: generation[identity + (mask,)] for name, mask in chosen.items()},
            })

    assert extra_calls == 876
    for name in POLICIES:
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
    return examples


def style_axis(axis, xlabel, xmax, tick):
    axis.set_axisbelow(True)
    axis.grid(axis="x", linewidth=.8, color=COLORS["grid"])
    axis.spines[:].set_visible(False)
    axis.tick_params(axis="both", length=0, pad=9)
    axis.tick_params(axis="x", labelsize=12, colors=COLORS["muted"])
    axis.xaxis.set_major_locator(MultipleLocator(tick))
    axis.set_xlim(0, xmax)
    axis.set_xlabel(xlabel, loc="left", labelpad=9, fontsize=13, color=COLORS["muted"])
    axis.invert_yaxis()


def annotate_bars(axis, values):
    gap = axis.get_xlim()[1] * .025
    for y, value in enumerate(values):
        axis.text(value + gap, y, f"{value:.3f}", va="center", color=COLORS["ink"],
                  fontsize=14, fontweight="bold")


def render_figures(folder, means, examples):
    plt.rcParams.update({
        "font.family": "DejaVu Sans", "text.color": COLORS["ink"],
        "axes.facecolor": COLORS["surface"], "figure.facecolor": COLORS["surface"],
        "ytick.color": COLORS["ink"], "ytick.labelsize": 14,
    })
    fig, axis = plt.subplots(figsize=(9, 3.8))
    fig.subplots_adjust(left=.29, right=.95, top=.95, bottom=.22)
    values = list(means.values())
    axis.barh([label["en"] for label in POLICIES.values()], values, height=.48,
              color=[COLORS[key] for key in ("measured", "estimate", "selected")])
    style_axis(axis, "Mean normalized regret (lower is better)", .33, .10)
    annotate_bars(axis, values)
    fig.savefig(folder / "mean-regret.png", dpi=150)
    plt.close(fig)

    fig, axes = plt.subplots(2, 1, figsize=(9, 7.2))
    fig.subplots_adjust(left=.29, right=.94, top=.89, bottom=.14, hspace=.88)
    case_style = [("A  ·  The measured proposal wins", 6.7, 2.0),
                  ("B  ·  The initial best wins", 1.9, .5)]
    for axis, case, (title, xmax, tick) in zip(axes, examples, case_style):
        values = [case["predicted"], case["utilities"]["P1"], case["utilities"]["BO9"]]
        proposal_wins = case["chosen"]["P1"] == case["chosen"]["P1-check"]
        colors = ["estimate", "selected", "measured"] if proposal_wins else ["estimate", "measured", "selected"]
        axis.barh(["Additive estimate", "Measured proposal", "Initial best"], values, height=.46,
                  color=[COLORS[key] for key in colors])
        axis.set_title(title, loc="left", pad=12, fontsize=17, fontweight="bold")
        style_axis(axis, "Centered utility (mean token log-probability difference)", xmax, tick)
        annotate_bars(axis, values)
    fig.savefig(folder / "utility-examples.png", dpi=150)
    plt.close(fig)


def write_report_rows(results, comparisons, examples):
    rows = []
    for label, case in zip("AB", examples):
        for name, policy in POLICIES.items():
            mask = case["chosen"][name]
            positions = ", ".join(str(bit + 1) for bit in range(8) if mask & (1 << bit)) or "∅"
            score = case["answers"][name]
            rows.append([label, policy, positions, f"{case['utilities'][name]:.3f}",
                         f"{float(score['token_f1']):.3f}", str(int(float(score["exact_match"])))])

    report_path = SITE / "content" / "technical-reports" / (PAPER + ".json")
    report = json.loads(report_path.read_text(encoding="utf-8"))
    tables = {"policies": results, "paired": comparisons, "examples": rows}
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
    means, results, comparisons = policy_tables(args.artifact)
    examples = archived_cases(args.artifact, means)
    output = SITE / "public" / "assets" / "reports" / PAPER
    output.mkdir(parents=True, exist_ok=True)
    render_figures(output, means, examples)
    write_report_rows(results, comparisons, examples)
    for label, case in zip("AB", examples):
        print(f"Case {label}: {' / '.join(case['identity'])}, masks {case['chosen']}")
    print("Wrote two figures and three data tables from the pinned public artifact.")


if __name__ == "__main__":
    main()
