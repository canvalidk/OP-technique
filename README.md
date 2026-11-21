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
│   ├── 01_formal_kernel_and_periodic_table.md   # Pass 1: symmetry collapse, shape algebra, periodic table, coupling gate
│   └── 02_philosophical_atlas_outline.md        # Pass 2 roadmap: non-truth rows, rule-exit matrix, fit/non-fit rubric
├── engine/
│   ├── op_model_checker.mjs                     # Zero-dependency finite-model checker & periodic-table generator
│   └── verify.test.mjs                          # Automated verification suite (11 test suites)
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

## Key Results Verified in Pass 1.1

- **Exactly 3 non-degenerate binary row regimes:** Up to label polarity flips and question swaps ($D_4$), all 16 masks on $\{YY, YN, NY, NN\}$ collapse into **Free** ($|B|=4$), **Nested** ($|B|=3$, $Q_1 \Rightarrow Q_2$ up to polarity flips), and **Locked Parity** ($|B|=2$, Claimed Mirror $\leftrightarrow$ Built Opposite) — plus degenerate constant/empty masks.
- **Polarity-flip collapse of the worked doubt example:** Flipping `can be doubted` $\leftrightarrow$ `is indubitable` maps the worked doubt table (`false ⇒ doubtable`) directly onto `NESTED × BN`, showing it is structurally isomorphic to Sextus Empiricus's `"nothing is known"`.
- **Two coupling modes (Mode A + Mode B):** Mode A (truth-coupled finite models) recovers Buridan, Gödel I, Kaplan–Montague Knower, Henkin/Löb (with `GL:Lob` flagged explicitly as an imported modal rule), Sextus, Prior (1961), Protagoras (including its $n=2$ vs. $n=3$ witness requirement), Moore, Fitch, Tarski, Turing, Cantor, and Russell — plus newly surfaced cells like `NESTED × BR_REV` and `NESTED × EN`. Mode B (reflexive criterion self-application) handles non-truth rows cleanly, showing that Ayer's verificationism vs. Popper's falsificationism differ by a single Boolean switch (`requiresQ2Y`) and auto-computing the single-rule **Exit Menu** on every collapse.
- **Three-valued Revenge vs. Two-Arrow Interpreter:** Verifies Priest's flat `{Y, N, G}` revenge collapse alongside *The Chain*'s two-arrow split (Meaning $I \in \{Y, N, \bot\}$ vs. Accuracy $A \in \{Y, N\}$), where soundness uniquely pins $(I = \bot,\, A = Y)$ (Turing incompleteness, no dialetheism) and soundness + totality yields $\emptyset$.
- **Coupling / refusal gate:** Cleanly rejects trivial 1-question syntactic cases (such as *"This sentence is not written in English"*) and inert cells where the statement adds nothing beyond the row mask.
- **Multi-valued game-show board catch:** Modeling the Millionaire board via $f(p) = \frac{100}{k}\#\{i : o_i = p\}$ reveals that `[25%, 50%, 60%, 75%]` actually has **two** global fixed points (`0%` off-board and `25%` on-board) unless you declare *"an option on the board must be right"*, whereas `[0%, 25%, 60%, 75%]` makes `25%` globally unique.

---

## Quick Start

Requires Node.js 18+ (zero external dependencies):

```bash
# Print the orbit classification, periodic table, Mode B examples, revenge check, and game-show boards
node engine/op_model_checker.mjs

# Run all 11 automated verification tests
node --test engine/verify.test.mjs
```
