# Formal OP Kernel and Periodic Table (Pass 1)

**Status:** Pass 1 formalization — verified computationally by [`engine/op_model_checker.mjs`](../engine/op_model_checker.mjs) and [`engine/verify.test.mjs`](../engine/verify.test.mjs) (all 9 test suites passing).
**Relationship to informal OP:** Informal OP ([`origins/op_technique_overlapping_problems_2026-11-12.md`](../origins/op_technique_overlapping_problems_2026-11-12.md)) is heuristic advice for exploring pre-formal conceptual terrain without committing to a formal ansatz. This document introduces the **lightweight formal counterpart**: a minimal finite-model constraint algebra with **no hidden background logic** — every bridge rule is declared explicitly as a parameter of the row.

---

## 1. Anti-Ansatz Design Principle

Formalizing OP in a heavy system (category theory, typed set theory, or a paraconsistent logic) risks smuggling philosophical commitments in at the start. To avoid turning OP into an ansatz, the formal kernel uses only:

1. A finite domain of items $D = \{0, 1, \dots, n-1\}$, where item $x = 0$ is the candidate **Aligning Statement**.
2. Two binary assignment maps $Q_1, Q_2 : D \to \{Y, N\}$.
3. An explicit **global bridge mask** $B \subseteq S$, where $S = \{YY, YN, NY, NN\}$ lists the four joint states $(Q_1(y), Q_2(y))$.
4. A **T-link** (satisfaction coupling) on $x$: $Q_2(x) = Y \iff \text{the condition stated by } x \text{ holds in } (D, Q_1, Q_2)$.
5. Zero or more **explicitly declared extra rules** (performative triggering, reflection, conjunction distribution, dissenter existence, etc.).

Nothing is assumed about what the "real" answers to $Q_1$ or $Q_2$ are. We simply enumerate all $4^n$ assignments on $D$, keep the models that satisfy the declared rules, and read off the **surviving state set** $V(x) \subseteq S$.

---

## 2. The 16 Outcomes: Refining Easy / Interfering / Aligning

The surviving set $V(x) \subseteq \{YY, YN, NY, NN\}$ falls into **8 structural outcome types** across the $2^4 = 16$ subsets of $S$:

| $\|V(x)\|$ | Count | Surviving Sets | Code | Structural Meaning |
|---:|---:|---|---|---|
| 4 | 1 | $\{YY, YN, NY, NN\}$ | `FREE` | Unforced — neither question constrained |
| 3 | 4 | e.g. $\{YN, NY, NN\}$ | `SINGLE_EXCLUSION` | Excludes one joint pair (e.g. Mackie pragmatic: cannot be both believed and true) |
| 2 | 2 | $\{YY, YN\}$, $\{NY, NN\}$ | `FORCED_Q1` | **$Q_1(x)$ forced**, $Q_2(x)$ stays open (e.g. Sextus, Can's doubt $A$) |
| 2 | 2 | $\{YY, NY\}$, $\{YN, NN\}$ | `FORCED_Q2` | **$Q_2(x)$ forced**, $Q_1(x)$ stays open (e.g. Protagoras with dissenter, Mackie Kind 2) |
| 2 | 1 | $\{YY, NN\}$ | `FORCED_AGREEMENT` | **Parity lock:** $Q_1(x) = Q_2(x)$, neither pinned alone (Smullyan, Truth-Teller) |
| 2 | 1 | $\{YN, NY\}$ | `FORCED_DISAGREEMENT` | **Anti-parity lock:** $Q_1(x) \neq Q_2(x)$, neither pinned alone (Buridan/Burge) |
| 1 | 4 | $\{YY\}, \{YN\}, \{NY\}, \{NN\}$ | `PINNED_BOTH` | **Both answers pinned** (Gödel $\{NY\}$, Löb $\{YY\}$, Cogito $\{YY\}$) |
| 0 | 1 | $\emptyset$ | `COLLAPSE` | **Setup refutation / paradox** — at least one declared rule must give way |

This refines informal OP's 3-way feel (`Easy / Interfering / Aligning`) into an exact partition:
- `FREE` = Easy.
- `SINGLE_EXCLUSION`, `FORCED_AGREEMENT`, `FORCED_DISAGREEMENT` = Coupled / Interfering (joint restriction without pinning either answer alone).
- `FORCED_Q1`, `FORCED_Q2`, `PINNED_BOTH` = Batch-1 Aligning Statements (force an answer about $x$).
- `COLLAPSE` ($\emptyset$) = Batch-2 Aligning Statements (force an answer onto the setup).

---

## 3. Complete Classification of Binary Row Regimes (Up to Symmetry)

In OP, which answer is called `"Yes"` is a free label choice. Relabelling induces two natural symmetry groups on $S$:
- **$V_4$ (order 4):** `flipQ1`, `flipQ2`, `flipBoth` — preserves $Q_2$ as the distinguished standard (e.g., truth).
- **$D_4$ (order 8):** $V_4$ plus `swap` ($Q_1 \leftrightarrow Q_2$).

Exhaustive orbit enumeration (`computeOrbits` in `engine/op_model_checker.mjs`) shows that **all 16 global masks $B \subseteq S$ collapse into 6 orbits under $D_4$ (7 under $V_4$), of which exactly 3 are non-degenerate:**

| $\|B\|$ | Orbit Size | Regime | Masks in Orbit | Examples |
|---:|---:|---|---|---|
| 4 | 1 | **Regime 0 — Free** | $\{YY, YN, NY, NN\}$ | `believed / true`, unrestricted `conceived / exists` |
| 3 | 4 | **Regime 1 — Nested** | $\{YY, NY, NN\}$ ($Q_1 \Rightarrow Q_2$)<br>$\{YY, YN, NN\}$ ($Q_2 \Rightarrow Q_1$)<br>$\{YN, NY, NN\}$ ($\neg(Q_1 \land Q_2)$)<br>$\{YY, YN, NY\}$ ($Q_1 \lor Q_2$) | `known / true`, `provable / true`, `indubitable / true`, `question / has an answer`, `every truth is knowable` |
| 2 | 2 | **Regime 2 — Locked Parity** | $\{YY, NN\}$ (Claimed Mirror)<br>$\{YN, NY\}$ (Built Opposite) | Tarski, Turing, Protagoras-as-rule ↔ Cantor, Russell |
| 2 | 4 | *Degenerate (1-Q constant)* | $\{YY,YN\}, \{NY,NN\}, \{YY,NY\}, \{YN,NN\}$ | Blanket thesis elevated into a global law |
| 1 | 4 | *Degenerate (both constant)* | $\{YY\}, \{YN\}, \{NY\}, \{NN\}$ | Trivial constant world |
| 0 | 1 | *Globally Inconsistent* | $\emptyset$ | Contradictory rules before any item is tested |

### Two immediate structural consequences
1. **Why Batch 2 had exactly two builds.** In [`origins/op_technique_overlapping_problems_2026-11-12.md`](../origins/op_technique_overlapping_problems_2026-11-12.md), the harder cases split into **Claimed Mirror** ($Q_1 \Leftrightarrow Q_2$) and **Built Opposite** ($Q_1 \Leftrightarrow \neg Q_2$). The orbit theorem shows those are the **exact two members** of Regime 2, mapped into each other by `flipQ2`.
2. **Polarity-flip collapse of the worked doubt example.** In the doubt example ($Q_1 =$ *can be doubted*, $Q_2 =$ *true*), hidden Rule 3 (*"shown false $\Rightarrow$ doubtable"*) bans `NN`, leaving mask $\{YY, YN, NY\}$. Applying `flipQ1` (*can be doubted* $\leftrightarrow$ *is indubitable*) maps $\{YY, YN, NY\} \mapsto \{YY, NY, NN\}$ (**Nested**: `indubitable ⇒ true`) and maps Blanket Yes (*"every statement can be doubted"*) $\mapsto$ Blanket No (*"nothing is indubitable"*). The worked doubt example is therefore **structurally isomorphic** to Sextus Empiricus's `"nothing is known"` (`NESTED × BN`, Mackie's Absolute Kind 1).

---

## 4. Statement Shapes and the Base Periodic Table

We formalize 10 canonical Aligning-Statement shapes via their relational satisfaction condition `holds(model)` on $D$:

| ID | Shape | Formula ($Q_2(x) = Y \iff \dots$) | Min $\|D\|$ |
|---|---|---|---:|
| `SA` | Self-Affirming | $Q_1(x) = Y$ | 1 |
| `SD` | Self-Denying | $Q_1(x) = N$ | 1 |
| `BN` | Blanket No | $\forall y \in D,\, Q_1(y) = N$ | 1 |
| `BY` | Blanket Yes | $\forall y \in D,\, Q_1(y) = Y$ | 1 |
| `EY` | Existence Yes | $\exists y \in D,\, Q_1(y) = Y$ | 1 |
| `EN` | Existence No | $\exists y \in D,\, Q_1(y) = N$ | 1 |
| `BR_IMP` | Bridge Forward | $\forall y \in D,\, Q_1(y) \Rightarrow Q_2(y)$ | 1 |
| `BR_REV` | Bridge Reverse | $\forall y \in D,\, Q_2(y) \Rightarrow Q_1(y)$ | 1 |
| `BR_CONTRA` | Bridge Contra (Prior) | $\forall y \in D,\, Q_1(y) \Rightarrow \neg Q_2(y)$ | 1 |
| `CONJ` | Conjunction Blindspot | $Q_2(p) \land \neg Q_1(p)$ (for target $p \in D$) | 2 |

### Verified Base Periodic Table (zero extra rules; identical for $|D| = 2, 3, 4$)

Verified by `engine/verify.test.mjs` (Test 2 confirms exact domain-size stability across $n = 2, 3, 4$):

| Shape | `FREE` | `NESTED` ($Q_1 \Rightarrow Q_2$) | `REVERSE_NESTED` ($Q_2 \Rightarrow Q_1$) | `MIRROR` ($Q_1 \Leftrightarrow Q_2$) | `OPPOSITE` ($Q_1 \Leftrightarrow \neg Q_2$) |
|---|---|---|---|---|---|
| `SA` | $\{YY, NN\}$ | $\{YY, NN\}$ | $\{YY, NN\}$ | $\{YY, NN\}$ *(inert)* | **$\emptyset$** |
| `SD` | $\{YN, NY\}$ | **$\{NY\}$** | **$\{YN\}$** | **$\emptyset$** | $\{YN, NY\}$ *(inert)* |
| `BN` | $\{YN, NY, NN\}$ | **$\{NY, NN\}$** ($Q_1=N$) | **$\{YN, NN\}$** ($Q_2=N$) | **$\{NN\}$** *(forces $y=YY$)* | $\{YN, NY\}$ |
| `BY` | $\{YY, YN, NN\}$ | $\{YY, NN\}$ | $\{YY, YN, NN\}$ | $\{YY, NN\}$ | **$\{YN\}$** |
| `EY` | $\{YY, NY, NN\}$ | $\{YY, NY, NN\}$ | $\{YY, NN\}$ | $\{YY, NN\}$ | **$\{NY\}$** *(forces $y=YN$)* |
| `EN` | $\{YY, YN, NY\}$ | **$\{YY, NY\}$** ($Q_2=Y$) | $\{YY, YN\}$ ($Q_1=Y$) | **$\{YY\}$** *(forces $y=NN$)* | $\{YN, NY\}$ |
| `BR_IMP` | $\{YY, YN, NY, NN\}$ | **$\{YY, NY\}$** ($Q_2=Y$) | $\{YY, YN, NN\}$ | **$\{YY\}$** | $\{YN, NY\}$ |
| `BR_REV` | $\{YY, YN, NN\}$ | **$\{YY, NN\}$** | **$\{YY\}$** | **$\{YY\}$** | **$\{YN\}$** |
| `BR_CONTRA` | $\{YN, NY, NN\}$ | **$\{NY, NN\}$** ($Q_1=N$) | **$\{YN, NN\}$** ($Q_2=N$) | **$\{NN\}$** *(forces $y=YY$)* | **$\{NY\}$** |

### Highlights and newly surfaced cells from the base table
- **Gödel I sits directly in `NESTED × SD` ($\{NY\}$):** No extra rule beyond soundness ($Q_1 \Rightarrow Q_2$) and self-denial is needed to pin *unprovable and true*.
- **Sextus / Can's doubt $A$ sits in `NESTED × BN` ($\{NY, NN\}$):** $Q_1(x)$ is forced to $N$, $Q_2(x)$ stays open. Comparing $n=1$ vs $n=2$ proves automatically that `NN` requires a distinct witness $y \neq x$ with $Q_1(y) = Y$ (*if universal doubt is false, some other statement is indubitable*).
- **`NESTED × BR_REV` ($\{YY, NN\}$ — newly surfaced):** On any nested pair (e.g., `known / true`), *"Every truth is known"* **cannot be an unknown truth (`NY`)** — if it is true, it must itself be known; if unknown, it must be false.
- **`NESTED × EN` ($\{YY, NY\}$ — newly surfaced):** On any sound pair ($Q_1 \Rightarrow Q_2$), *"Something is not $Q_1$"* (e.g., *"Some statement is unknown"* / *"Some sentence is unprovable"*) is **forced to be true ($Q_2 = Y$)** without assuming negation on $D$: if it were false, everything including $x$ would be $Q_1$, forcing $x$ true by nesting.
- **`MIRROR × EN` ($\{YY\}$) and `MIRROR × BN` ($\{NN\}$):** Both are unsatisfiable at $|D|=1$ and pin a unique state at $|D| \ge 2$ while **forcing a distinct witness** of the opposite state ($y = NN$ or $y = YY$).
- **`NESTED × BR_CONTRA` ($\{NY, NN\}$):** *"Everything known is false"* can never be known ($Q_1 = N$), while truth stays open (true iff nothing is known).

---

## 5. Explicitly Declared Extra Rules (How the Remaining Classics Arise)

Every classic argument not already produced by the base table requires a specific, nameable **extra rule**:

| Historical Landmark | Base Cell | Declared Extra Rule | Verified Outcome $V(x)$ |
|---|---|---|---|
| **Kaplan–Montague Knower** | `NESTED × SD` | `reflection` (if base rules force $Q_2(x)=Y$, then $Q_1(x)=Y$) | **$\emptyset$** (pass 1 pins $\{NY\}$; pass 2 kills it) |
| **Henkin / Löb** | `NESTED × SA` | `lob` (provable soundness + SA forces $Q_1(x)=Y$) | **$\{YY\}$** |
| **Cogito / Augustine / *"Are there any questions?"*** | `FREE × EY` | `performative` (asking/doubting/conceiving $x$ makes $Q_1(x)=Y$) | **$\{YY\}$** |
| **Prior's Theorem (1961)** | `FREE × BR_CONTRA` | `performative` (someone believes *"every belief is false"*) | $\emptyset$ at $n=1$; **$\{YN\}$** at $n \ge 2$, **forcing $\exists y \neq x$ in $YY$** |
| **Protagoras (*Theaetetus*)** | `FREE × BR_IMP` | `dissenter` ($\exists z$ asserting $\neg x$ with $Q_1(z)=Y$) | **$\{YN\}$** at $n=2$; **$\{YN, NN\}$** ($Q_2=N$) at $n \ge 3$ |
| **Moore's Paradox** | `FREE × CONJ` | `conjunctionDist` ($Q_1(A \land B) \Rightarrow Q_1(A)$) | **$\{YN, NY, NN\}$** (`YY` banned) |
| **Fitch's Knowability** | `NESTED × CONJ` | `conjunctionDist` (+ `unknownTruthTarget` $p$) | **$\{NY, NN\}$** (general); **$\{NY\}$** (on unknown truth); **$\emptyset$** under `MIRROR` |
| **Cantor / Russell** | `OPPOSITE` | `diagonalEquality` (constructed diagonal item has $Q_1(x)=Q_2(x)$) | **$\emptyset$** |

**Subtle model-checker catch on Protagoras:** Without a dissenter, `FREE × BR_IMP` leaves all 4 states open. With a dissenter $z = \neg x$ believed ($Q_1(z)=Y$), in a 2-statement universe $\{x, \neg x\}$ the state `NN` (*nobody believes Protagoras's thesis, and it's false*) is **impossible** — because $\neg x$ would be true and believed while $x$ is unbelieved, making every belief in $\{x, \neg x\}$ true! So at $n=2$ only `YN` survives; `NN` only opens up at $n \ge 3$ and **forces a third statement $w$ in state `YN`** (some other false belief).

---

## 6. The Coupling / Refusal Criterion

An informal critique of OP ([`origins/what_is_a_question_op_run_2026-11-12.md`](../origins/what_is_a_question_op_run_2026-11-12.md) §7 item 1) is: *"a technique that fits everything explains nothing; it needs at least one case it refuses."*

Consider $Q_1 =$ *"is this sentence written in English?"*, $Q_2 =$ *"is it true?"*, and $x =$ *"This sentence is not written in English."* That pins $Q_1(x)=Y, Q_2(x)=N$ — yet it is clearly trivial, not OP, because $Q_1(x)$ is settled immediately by inspecting the syntax before $Q_2$ ever enters.

The formal kernel implements a 3-way **coupling gate** (`checkCoupling` in `engine/op_model_checker.mjs`):
1. **`REFUSED_TRIVIAL_1Q`:** Refused if either $Q_1(x)$ or $Q_2(x)$ is directly settled by independent inspection prior to any $Q_1$–$Q_2$ coupling (rules out *"This sentence is not written in English"*, *"This sentence has five words"*).
2. **`UNFORCED` / `ROW_ONLY_NO_SHAPE_WORK`:** Refused if all 4 states survive (`FREE × BR_IMP` without dissenter) or if the statement adds zero elimination beyond the global row mask (`MIRROR × SA`, where both already equal $\{YY, NN\}$).
3. **Accepted (`GENUINE_OP_BOTH_LOAD_BEARING` or `GENUINE_OP_PURE_SHAPE`):** Neither question is independently settled; cells die strictly through the coupling of the T-link with the row rules (or, on a Free row, through self/quantifier coupling without settling either question directly).

---

## 7. Beyond Binary: Multi-Valued Fixed Points and Scope Boundaries

Three boundaries mark where bare $\{Y, N\}^2$ models stop and need an explicit extension:

1. **Multi-valued fixed points (the Millionaire game-show board).**
   For *"If you choose an answer to this question at random, what is the chance that you will be correct?"* with options $o_1, \dots, o_k$, a probability $p \in [0, 100\%]$ is a valid answer iff it is a fixed point of:
   $$f(p) = \frac{100}{k}\,\#\{i : o_i = p\}.$$
   Running `evaluateGameShowBoard` exposes a hidden rule missed in the original informal notes:

   | Options | On-board fixed points | Global fixed points (incl. off-board `0%`) | Hidden rule revealed |
   |---|---|---|---|
   | `[25%, 0%, 50%, 25%]` | none | none | Classic collapse (0% on-board acts as revenge clause) |
   | `[25%, 50%, 60%, 75%]` | `25%` (unique) | **`0%`, `25%` (ambiguous!)** | Only unique if you assume *"an option on the board must be right"* |
   | `[0%, 25%, 60%, 75%]` | `25%` (unique) | **`25%` (truly unique!)** | Putting `0%` on the board kills off-board `0%` without killing `25%` |
   | `[25%, 50%, 50%, 60%]` | `25%`, `50%` | `0%`, `25%`, `50%` | Multi-valued Truth-Teller analog |
   | `[10%, 20%, 30%, 40%]` | none | `0%` (off-board works) | Broken question diagnosable from outside |
   | `[0%, 20%, 30%, 40%]` | none | none | Adding `0%` turns an outside diagnosis into revenge collapse |

2. **Modal / ordering structure.**
   - **Fitch's modal step** distinguishes actual knowledge ($K$) from knowability ($\Diamond K$); in the binary kernel, universal knowability appears as elevating `NESTED` to `MIRROR` on the modal pair.
   - **Anselm / Gaunilo** relies on a comparative order (`greater than`) plus Priest's Characterisation Principle, not just two bare binary predicates.
3. **Quantitative symmetry arguments (out of scope).**
   Functional-equation / involution arguments (such as swapping $m \leftrightarrow m^{-1}$ in the VD mass estimator to pin a prior centre $c = \sigma_F/\sigma_a$ while leaving the shape free) are better handled by invariance groups and functional equations than stretched into OP.

---

## 8. Reproducing All Checks

From the repository root (requires Node.js 18+, zero external packages):

```bash
node engine/op_model_checker.mjs
node --test engine/verify.test.mjs
```
