# AIGuessr research data

Pseudonymized data from two formative evaluation episodes of the AIGuessr serious game, reported in:

> Langeois, M. (2026). Making AI materiality visible: design and formative evaluation of a serious game for management education. *Journal of Management Education* (submitted).

## Episodes

**Episode 1 (Clermont, January 2026).** 31 master's students in strategic management, 90-minute full workshop (expert documentation, jigsaw teams, ~20 questions, debriefing). Retrospective pretest design: participants rated their level before and after the workshop on the same instrument, administered once after the session.

**Episode 2 (Moulins, March 2026).** 30 vocational undergraduates (IUT), 25-minute game-only sessions. Traditional pretest-posttest design: pre-game and post-game questionnaires administered separately.

## Files

| File | Description |
|---|---|
| `data_clermont_individual.csv` | Episode 1, construct-level means per participant (pre, post, delta, satisfaction, open response) |
| `data_clermont_items.csv` | Episode 1, item-level scores (5 materiality, 4 impact, 3 efficacy, 4 satisfaction items) |
| `data_moulins_individual.csv` | Episode 2, item-level and construct-level scores per participant |
| `data_moulins_game.csv` | Episode 2, in-game performance (scores, distances, categories) |
| `stats_comparison.csv` | Comparative statistics across both episodes (t-tests, Wilcoxon, effect sizes, corrections) |
| `cleaning_log.txt` | Full data processing log (decisions, exclusions, transformations) |
| `compute_alpha.py` | Cronbach's alpha computation script (Python, requires pandas and numpy) |

## Constructs

Three self-assessed constructs, each measured on a 1-5 Likert scale:

1. **Materiality awareness** (5 items): ability to locate extraction sites, awareness of data center water consumption, knowledge of component lifecycle, semiconductor production geography, assembly labor conditions.
2. **Impact representations** (4 items): perceived environmental footprint of AI, human rights implications, link between personal usage and geopolitical impacts, local impacts of data centers.
3. **Critical self-efficacy** (3 items): perceived ability to evaluate socio-environmental impacts, legitimacy to question digital footprint, knowledge of where to find reliable information.

## Pseudonymization

All participant identifiers have been replaced with pseudonyms (C01-C34 for Clermont, M01-M58 for Moulins) using a fixed random seed. Names, surnames, and email addresses have been removed. Open-ended responses have been checked for residual identifying information.

## Reproduction

To reproduce the Cronbach's alpha values reported in the paper:

```bash
cd research-data
python compute_alpha.py
```

## License

The research data is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The AIGuessr application code is released under the MIT License (see the repository root).
