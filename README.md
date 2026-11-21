# The OP Technique (Overlapping Problems)

> *The most over-powered philosophical technique in all of the history of philosophy: The Overlapping Problems technique.*

The **OP (Overlapping Problems) technique** gets a firm answer — or exposes a hidden assumption — by holding two fixed questions against each other on a shared domain and hunting for **Aligning Statements** where the two questions couple and eliminate answer combinations.

OP lives in two complementary registers:

1. **Pre-formal heuristic advice** ([`origins/op_technique_overlapping_problems_2026-11-12.md`](origins/op_technique_overlapping_problems_2026-11-12.md)): When exploring foundational terrain *before* a formal logic exists (Descartes's goal, the Language Problem), importing a full formal system begs the question as an ansatz. Informal OP stays deliberately loose — a tractable piece of scaffolding for catching hidden rules without pretending to be a proof.
2. **A lightweight formal periodic table** ([`docs/01_formal_kernel_and_periodic_table.md`](docs/01_formal_kernel_and_periodic_table.md)): Rather than adopting a heavy background logic, every bridge rule is declared explicitly as a mask on the 4-cell table $S = \{YY, YN, NY, NN\}$. Exhaustive finite-model checking maps both non-contradictory forced answers (Mackie's territory) and 0-cell collapses (Priest's / Lawvere's territory) in one grid — including non-truth pairs like `question / answer`.

---

## Repository Layout

```text
OP-technique/
├── docs/
│   ├── 01_formal_kernel_and_periodic_table.md   # Pass 1.1: symmetry collapse, Mode A & Mode B, periodic table, coupling gate
│   └── 02_philosophical_atlas.md                # Pass 2: 14-row Atlas (classic + non-truth), Rule-Exit Matrix, Non-Fit Shelf
├── engine/
│   ├── op_model_checker.mjs                     # Zero-dependency finite-model checker & periodic-table generator
│   ├── verify.test.mjs                          # Kernel verification suite (11 test suites)
│   └── atlas_verify.test.mjs                    # Philosophical Atlas verification suite (8 test suites)
└── origins/                                     # Founding OP records and linked VD Theory notes (from VD-docs@90383f7)
    ├── README.md
    ├── op_technique_overlapping_problems_2026-11-12.md
    ├── what_is_a_question_op_run_2026-11-12.md
    ├── the_chain_2026-11-14.md
    ├── language_problem_revised_draft_d2.md
    ├── handle_derivation_note_rewritten.md
    └── alpha_and_the_one_draft_d1.md
```

---

## Key Results Verified (Pass 1.1 + Pass 2)

- **Exactly 3 non-degenerate binary row regimes:** Up to label polarity flips and question swaps ($D_4$), all 16 masks on $\{YY, YN, NY, NN\}$ collapse into **Free** ($|B|=4$), **Nested** ($|B|=3$, $Q_1 \Rightarrow Q_2$ up to polarity flips), and **Locked Parity** ($|B|=2$, Claimed Mirror $\leftrightarrow$ Built Opposite) — plus degenerate constant/empty masks.
- **Polarity-flip collapse of the worked doubt example:** Flipping `can be doubted` $\leftrightarrow$ `is indubitable` maps the worked doubt table (`false ⇒ doubtable`) directly onto `NESTED × BN`, showing it is structurally isomorphic to Sextus Empiricus's `"nothing is known"`.
- **14-row Philosophical Atlas ([`docs/02_philosophical_atlas.md`](docs/02_philosophical_atlas.md)):** Maps both classic truth-adjacent pairs (Sextus, Protagoras, Prior, Buridan, Smullyan, Moore, Fitch, Augustine, Descartes, Berkeley + `alpha_and_the_one` §3, Anselm/Gaunilo, Gödel, Löb, Tarski, Turing, Cantor, Russell) and **9 non-truth rows** — including **Ayer vs. Popper** (differing by one Boolean switch `requiresQ2Y`), **Plato's Meno** (the unrun VD pair #3, auto-generating the Eristic, *Anamnesis*, and VD verifier-vs-solver exits), **VD unrun pair #2** (`question / truth value` under Disjointness), **Deontic Axiom D**, **Ross/Suber constitutional entrenchment**, and **Scriven's Prediction Paradox** (the human-agency twin of Turing's $D$).
- **Unified Rule-Exit Matrix & Honest Non-Fit Shelf:** Compares philosophical schools by which incompatible rule each sacrifices on 0-cell collapses, and explicitly refuses non-fits (`Euthyphro`, `Hume's is–ought`, trivial 1-Q syntax, continuous mass-estimator symmetries).
- **Three-valued Revenge vs. Two-Arrow Interpreter:** Verifies Priest's flat `{Y, N, G}` revenge collapse alongside *The Chain*'s two-arrow split (Meaning $I \in \{Y, N, \bot\}$ vs. Accuracy $A \in \{Y, N\}$), where soundness uniquely pins $(I = \bot,\, A = Y)$ (Turing incompleteness, no dialetheism) and soundness + totality yields $\emptyset$.
- **Multi-valued game-show board catch:** Modeling the Millionaire board via $f(p) = \frac{100}{k}\#\{i : o_i = p\}$ reveals that `[25%, 50%, 60%, 75%]` actually has **two** global fixed points (`0%` off-board and `25%` on-board) unless you declare *"an option on the board must be right"*, whereas `[0%, 25%, 60%, 75%]` makes `25%` globally unique.

---

## Quick Start

Requires Node.js 18+ (zero external dependencies):

```bash
# Print the orbit classification, periodic table, Mode B examples, revenge check, and game-show boards
node engine/op_model_checker.mjs

# Run all 19 automated verification tests (kernel + philosophical atlas)
node --test engine/verify.test.mjs engine/atlas_verify.test.mjs
```
