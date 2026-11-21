# The Philosophical Atlas (Pass 2)

**Status:** Pass 2 complete — all 14 rows, the Rule-Exit Matrix, and the Honest Non-Fit Shelf are backed by [`engine/op_model_checker.mjs`](../engine/op_model_checker.mjs) and verified programmatically across [`engine/verify.test.mjs`](../engine/verify.test.mjs) and [`engine/atlas_verify.test.mjs`](../engine/atlas_verify.test.mjs) (**19/19 test suites passing**).

This Atlas populates the Pass 1.1 periodic table ([`01_formal_kernel_and_periodic_table.md`](01_formal_kernel_and_periodic_table.md)) across both classic truth-adjacent pairs (**Group A**) and non-truth philosophical domains that Mackie (1964) and Priest (1995) leave largely unmapped (**Group B**).

---

## 1. Epistemic Rubric (Anti-Shoehorning Discipline)

Every entry carries two explicit tags:

- **Fit grade:**
  - `CLEAN_FIT` — maps onto an explicit Mode A or Mode B regime, shape, and declared rules without distorting the argument.
  - `STRETCH` — genuinely OP-shaped, but relies on an extra operator beyond bare $\{Y, N\}^2$ (comparative order, modality, multi-valued options, domain-of-things, or temporal state transition $t \to t+1$).
  - `HONEST_NON_FIT` — looks OP-adjacent on the surface, but fails the coupling gate or lives in a different logical mechanism altogether (§6).
- **Source grade:**
  - `VERIFIED_PRIMARY` — primary text read directly (inherited from `origins/op_technique_overlapping_problems_2026-11-12.md`: Augustine, Mackie 1964, Burnyeat 1976, Priest 1995 in part).
  - `VERIFIED_SECONDARY` — checked against cited scholarly reference / encyclopedia summaries (SEP, Castagnoli, Ayer 1946 & Popper 1934/1959 summaries, Ross 1969 & Suber 1990 summaries, Plato *Meno* 80d & Scriven summaries).
  - `LEAD` — conceptual lead or recollection, not yet checked against primary text.

---

## 2. Group A — Classic Truth-Adjacent Rows (Mode A)

These five rows consolidate the historical batch from [`origins/op_technique_overlapping_problems_2026-11-12.md`](../origins/op_technique_overlapping_problems_2026-11-12.md) into the exact Pass 1.1 formal algebra, adding newly surfaced cells and cross-repo links.

### Row 1: `Is it known?` / `Is it true?` (`NESTED`: $Q_1 \Rightarrow Q_2$)

| Shape / Rules | Statement | Surviving $V(x)$ | Fit / Source | Owner & Note |
|---|---|---|---|---|
| `BN` | *"Nothing is known."* | $\{NY, NN\}$ ($Q_1=N$) | `CLEAN_FIT` / `VERIFIED_SECONDARY` | **Academic Sceptics / Sextus Empiricus** (SEP *Ancient Skepticism*; Priest ch. 3). Cannot be known; truth open. `NN` forces a distinct known truth $y \neq x$. |
| `SD` | *"Nobody knows this statement."* | $\{NY\}$ | `CLEAN_FIT` / `LEAD` | Without reflection, pins an unknown truth (epistemic Gödel analog). |
| `SD` + `reflection` | *"Nobody knows this statement."* | **$\emptyset$** | `CLEAN_FIT` / `VERIFIED_SECONDARY` | **Kaplan & Montague (1960) Knower Paradox** (via Priest p. 59). Pass 1 forces $Q_2=Y$; reflection adds $Q_1=Y$, collapsing $\{NY\}$. |
| `CONJ` + `conjunctionDist` | *"$p$ is true, and nobody knows $p$."* | $\{NY, NN\}$ (on unknown $p$: $\{NY\}$; + `MIRROR`: $\emptyset$) | `STRETCH` (modal $\Diamond K$) / `VERIFIED_SECONDARY` | **Church (1945) / Fitch (1963)** (SEP *Fitch's Paradox*). Refutes blanket knowability. |
| `BR_REV` *(newly surfaced)* | *"Every truth is known."* | $\{YY, NN\}$ | `CLEAN_FIT` / *formal prediction* | **Forced agreement:** cannot be an unknown truth (`NY`). If true, it must itself be known. |
| `EN` *(newly surfaced)* | *"Something is not known."* | $\{YY, NY\}$ ($Q_2=Y$) | `CLEAN_FIT` / *formal prediction* | Forced true purely from Nesting (if false, everything including $x$ would be known, forcing $x$ true). |
| `BR_CONTRA` *(newly surfaced)* | *"Everything known is false."* | $\{NY, NN\}$ ($Q_1=N$) | `CLEAN_FIT` / *formal prediction* | Prior's thesis transposed to `known`: can never be known; true iff nothing is known. |

### Row 2: `Is it believed?` / `Is it true?` (`FREE`: all 4 cells open)

| Shape / Rules | Statement | Surviving $V(x)$ | Fit / Source | Owner & Note |
|---|---|---|---|---|
| `BN` | *"Nobody believes anything."* | $\{YN, NY, NN\}$ (`YY` banned) | `CLEAN_FIT` / `VERIFIED_PRIMARY` | **Mackie (1964) pragmatic self-refutation** (also standard objection to eliminative materialism, `LEAD`). Believing it makes it false. |
| `SD` | *"Nobody believes this statement."* | $\{YN, NY\}$ | `CLEAN_FIT` / `LEAD` | **Buridan / Burge / Grim** — forced disagreement: any community is either mistaken or ignorant on at least one statement, with zero contradiction. |
| `SA` | *"Someone believes this statement."* | $\{YY, NN\}$ | `CLEAN_FIT` / `LEAD` | **Smullyan** (*Forever Undecided*) — forced agreement: a single statement on which Protagoras is locally right. |
| `BR_IMP` (no dissenter) | *"Every belief is true."* | $\{YY, YN, NY, NN\}$ | `CLEAN_FIT` / `VERIFIED_PRIMARY` | **Unforced** (`checkCoupling` refuses it): proves mathematically why Protagoras requires an actual dissenter. |
| `BR_IMP` + `dissenter` | *"Every belief is true."* (someone believes $\neg x$) | $\{YN\}$ at $n=2$; $\{YN, NN\}$ ($Q_2=N$) at $n \ge 3$ | `CLEAN_FIT` / `VERIFIED_PRIMARY` | **Plato, *Theaetetus* 171a–b / Burnyeat (1976).** Model-checker catch: `NN` (*nobody believes Protagoras, yet it's false*) is impossible at $n=2$ and forces a **3rd** statement $w = YN$ (some other false belief)! |
| `BR_CONTRA` + `performative` | *"Every belief is false."* (believed) | $\emptyset$ at $n=1$; $\{YN\}$ at $n \ge 2$ (forces $y = YY$) | `CLEAN_FIT` / `VERIFIED_SECONDARY` | **Prior's Theorem (1961)** (via Priest p. 58). Believing it forces some *other* belief to be true. |
| `CONJ` + `conjunctionDist` | *"$p$, and I do not believe $p$."* | $\{YN, NY, NN\}$ (`YY` banned) | `CLEAN_FIT` / `VERIFIED_PRIMARY` | **Moore's Paradox (1944)** (Mackie p. 196 n.). Cannot be both believed and true. |

### Row 3: `Is it indubitable?` / `Is it true?` (`NESTED`, polarity-flipped from `can it be doubted?`)

By the Pass 1 orbit theorem, flipping $Q_1$ (`can be doubted` $\leftrightarrow$ `is indubitable`) maps Rule 3 (`false ⇒ doubtable`) directly onto `NESTED` (`indubitable ⇒ true`):

| Shape / Rules | Statement | Surviving $V(x)$ | Fit / Source | Owner & Note |
|---|---|---|---|---|
| `BN` | *"Nothing is indubitable."* (= *"Every statement can be doubted."*) | $\{NY, NN\}$ ($Q_1=N$) | `CLEAN_FIT` / *Can's worked example* | Isomorphic to Sextus (`Row 1 × BN`): $A$ itself is doubtable; if false (`NN`), forces some other indubitable statement $y \neq A$. |
| `EY` + `performative` | *"Some statement can be doubted."* / *"I am, I exist."* / *Si fallor, sum* | $\{YY\}$ | `CLEAN_FIT` / `VERIFIED_PRIMARY` | **Augustine (*City of God* XI.26) & Descartes (Second Meditation).** Performing doubt/error instantiates the witness $Q_1(x)=Y$, pinning $Q_2(x)=Y$. |

### Row 4: `Can it be conceived?` / `Does it exist?` (`STRETCH`: domain of things + Characterisation Principle)

| Shape / Rules | Item / Description | Surviving $V(x)$ | Fit / Source | Owner & Note |
|---|---|---|---|---|
| `BN` + `performative` | *"Nothing can be conceived."* | $\{YN\}$ (false) | `CLEAN_FIT` / `LEAD` | **Gorgias** — considering it conceives something. |
| `CONJ` + `performative` | *"A named thing that exists unconceived."* | `YY` banned | `STRETCH` / `VERIFIED_PRIMARY` | **Berkeley's Master Argument** (Priest ch. 4; Mackie pp. 200–202 distinguishes named item vs. existential *"some things exist unconceived"*). |
| **Residual uniqueness** (Berkeley cell) | *A proposed split $\{*_1, *_2\}$ inside the uncatalogued residual $*$.* | Forces inside catalogue or collapses to single $*$ | `STRETCH` / `VERIFIED_PRIMARY` (internal) | **[`origins/alpha_and_the_one_draft_d1.md`](../origins/alpha_and_the_one_draft_d1.md) §3:** Any criterion distinguishing $*_1$ from $*_2$ pulls them inside the catalogue (same move as Berkeley's unconceived tree; Mackie's check distinguishes inability to *individuate* inside $*$ from literal metaphysical singularity). |
| Limit + comparative order | *"The greatest conceivable being / island."* | Claimed $\{YY\}$ | `STRETCH` (needs ordering + Characterisation Principle) / `VERIFIED_SECONDARY` | **Anselm (1078) vs. Gaunilo** (SEP *Ontological Arguments*; Priest pp. 61–65). |

### Row 5: `Is it provable?` / `Is it true?` & The Diagonal Family (`NESTED`, `MIRROR`, `OPPOSITE`)

| Regime × Shape / Rules | Item | Surviving $V(x)$ | Fit / Source | Owner & Note |
|---|---|---|---|---|
| `NESTED × SD` | *"I am not provable in $F$."* | $\{NY\}$ | `CLEAN_FIT` / `VERIFIED_SECONDARY` | **Gödel's First Theorem (1931)** (SEP *Gödel's Incompleteness*). |
| `NESTED × SA` + `GL:Lob` | *"I am provable in $F$."* | $\{YY\}$ | `STRETCH` (imports modal rule `GL:Lob`) / `VERIFIED_SECONDARY` | **Henkin (1952) / Löb (1955)**. |
| `MIRROR × SD` | Liar built from truth predicate / Turing contrarian $D(D)$ | **$\emptyset$** | `CLEAN_FIT` / `VERIFIED_SECONDARY` | **Tarski (1935)** & **Turing (1936) / Kleene (1952) / Davis (1958)** (Hamkins & Nenu 2024). |
| `OPPOSITE` + `diagonalEquality` | Cantor's flipped diagonal / Russell's set $R$ | **$\emptyset$** | `CLEAN_FIT` / `VERIFIED_SECONDARY` | **Cantor (1891)** & **Russell (1901/1902)** — exact `flipQ2` dual of `MIRROR × SD`. |

---

## 3. Group B — Non-Truth Rows (The Unmapped Territory)

This is where formal OP goes beyond Mackie (1964) and Priest (1995), using **Mode B (Reflexive Criterion Self-Application)**, **Disjointness**, and the **Two-Arrow Interpreter model**. Every row below is verified in [`engine/atlas_verify.test.mjs`](../engine/atlas_verify.test.mjs).

### Row 6: `Is it verifiable (or analytic)?` / `Is it meaningful?` (`Mode B` — `CLEAN_FIT`, `VERIFIED_SECONDARY`)

- **Proposed criterion $x$ (A. J. Ayer, *Language, Truth and Logic*, 1936):** *"Every meaningful statement is either analytic or empirically verifiable"* $\implies B_x =$ `REVERSE_NESTED` ($Q_2 \Rightarrow Q_1$, mask $\{YY, YN, NN\}$).
- **Target constraints on $x$ itself:** `requiresQ2Y` (a stated criterion of meaning must itself be meaningful) + `requiresQ1N` (the criterion is neither an analytic tautology nor empirically verifiable).
- **Verified outcome:** **$\emptyset$ (`COLLAPSE`)**, auto-generating all four historical exits:
  1. Drop `selfApplies` $\to \{NY\}$: exempt the criterion as a meta-level linguistic rule (**Carnap**).
  2. Drop `requiresQ1N` $\to \{YY\}$: reclassify the principle as an analytic **stipulation / proposal** for how to use "meaningful" (**Ayer's 1946 2nd ed. Introduction**).
  3. Drop `requiresQ2Y` $\to \{NN\}$: treat the criterion as illuminating nonsense — a ladder thrown away (**early Wittgenstein**).
  4. Drop `proposedMask` $\to \{NY\}$: abandon verificationism.

### Row 7: `Is it falsifiable?` / `Is it scientific?` (`Mode B` — `CLEAN_FIT`, `VERIFIED_SECONDARY`)

- **Proposed criterion $x$ (Karl Popper, *The Logic of Scientific Discovery*, 1934/1959):** *"Every scientific theory is empirically falsifiable"* $\implies B_x =$ `REVERSE_NESTED` ($Q_2 \Rightarrow Q_1$).
- **Target constraints on $x$ itself:** `requiresQ1N` (the demarcation criterion is not itself empirically falsifiable), **but `requiresQ2Y = false`** (Popper explicitly treats demarcation as a *methodological convention*, never claiming it is a scientific hypothesis).
- **Verified outcome:** **$\{NN\}$ (fully pinned, NO collapse!)** — neither falsifiable nor scientific.
- **Payoff:** Comparing Row 6 and Row 7 shows that the *entire* structural difference between logical positivism's self-refutation and Popper's immunity to self-refutation is **one single Boolean switch (`requiresQ2Y`)**.

### Row 8: `Is it a question?` / `Does it have an answer?` (`Mode A` erotetic + `Mode B` + `3-Valued` + `Multi-Valued` — `CLEAN_FIT`)

- Fully mapped in [`origins/what_is_a_question_op_run_2026-11-12.md`](../origins/what_is_a_question_op_run_2026-11-12.md) and verified across Tests 9, 10, and 11:
  - Under the **erotetic T-schema** (`"Yes"` answers `?P` $\iff P$; `"No"` answers `?P` $\iff \neg P$), the polar question row maps straight onto Mode A (`SA` $\to$ Truth-Teller $\{YY, NN\}$; `SD` $\to$ Liar-question $\emptyset$).
  - Under **Mode B**, VD's standing criterion (*"every question has an answer"*, `NESTED`) colliding with the Liar-question (`requiresQ1Y` + `requiresQ2N`) yields $\emptyset$ and cleanly splits into Can's VD branch (drop `requiresQ1Y` $\to \{NN\}$: not a question) vs. standard erotetic logic (drop `proposedMask` $\to \{YN\}$: unanswerable question).
  - Under **Multi-Valued Fixed Points** (Millionaire board), `[25%, 50%, 60%, 75%]` reveals the hidden `mustBeOnBoard` assumption (off-board `0%` also survives), whereas `[0%, 25%, 60%, 75%]` pins `25%` globally uniquely.

### Row 9 (Unrun VD Pair #2): `Is it a question?` / `Does it have a truth value?` (`Mode B` — `CLEAN_FIT`)

Proposed in [`origins/what_is_a_question_op_run_2026-11-12.md`](../origins/what_is_a_question_op_run_2026-11-12.md) §1 and left unrun until now.

- **Standard linguistic bridge rule:** **Disjointness** ($\neg(Q_1 \land Q_2)$, mask $\{YN, NY, NN\}$) — questions do not have truth values; declaratives do. By the Pass 1 orbit theorem, `flipQ2` (*has truth value* $\leftrightarrow$ *lacks truth value*) maps Disjointness directly onto `NESTED`.
- **Self-application test:**
  - Stated declaratively (*"No question has a truth value"*, `Q1 = N, Q2 = Y`): survives cleanly at **$\{NY\}$**.
  - Asked interrogatively (*"Does any question have a truth value?"*, `Q1 = Y`): survives cleanly at **$\{YN\}$** (it has an *answer*, `"No"`, without having a *truth value*).
- **Diagnostic payoff for VD:** Unlike Row 8, Row 9 is **completely peaceful** — no paradox erupts unless you collapse *"having answer Yes"* into *"being True"*. This confirms that the Liar-question paradox is driven specifically by the **erotetic T-schema** (Row 8), not by questions illicitly bearing truth values.

### Row 10 (Unrun VD Pair #3 — Meno's Paradox): `Is it a genuine inquiry/question?` / `Does the asker already know the answer?` (`Mode B` — `CLEAN_FIT`, `VERIFIED_SECONDARY`)

Proposed in [`origins/what_is_a_question_op_run_2026-11-12.md`](../origins/what_is_a_question_op_run_2026-11-12.md) §1 (`"does asking it already require knowing the answer?"`) — which turns out to be **Plato's Paradox of Inquiry (*Meno* 80d–e)**!

- **Two competing global bridge rules:**
  - **Horn 1 (Redundancy / Non-triviality):** You cannot genuinely inquire into what you already know $\implies$ Disjointness $\neg(Q_1 \land Q_2)$, mask $B_1 = \{YN, NY, NN\}$.
  - **Horn 2 (Recognition / Searchability):** To ask a coherent question and recognize its answer, you must already know what you seek $\implies$ Nesting $Q_1 \Rightarrow Q_2$, mask $B_2 = \{YY, NY, NN\}$.
- **Intersection before witness:** $B_1 \cap B_2 = \{NY, NN\} \implies$ **$Q_1 \equiv N$ everywhere** (genuine inquiry is impossible!).
- **Add the performative witness** (Meno just asked a genuine question: `requiresQ1Y`): **$\emptyset$ (`COLLAPSE`)**, auto-generating all three historical/structural exits:
  1. **Drop `requiresQ1Y` $\to \{NY, NN\}$ (Eristic Sophist):** accept that inquiry is impossible.
  2. **Drop / split Horn 1 (`envMask`) $\to \{YY\}$ (Plato's *Anamnesis* / Recollection):** split $Q_2$ into *implicit* vs. *explicit* knowledge — inquiry searches for what you already implicitly know.
  3. **Drop Horn 2 (`proposedMask`) $\to \{YN\}$ (VD / Verifier-vs-Solver exit):** asking a question does *not* require knowing the **value**; it only requires knowing a **normalisation / verification procedure** (cf. VD's dictionary expansion model and CS's NP verifier vs. solver distinction).

### Row 11: `Is it defined (in a fixed dictionary)?` / `Is it meaningful (convergent on interpreter I)?` (`Two-Arrow` — `CLEAN_FIT`, internal VD)

- Bridges VD's Punnett Square (`definition_and_meaning`) and [`origins/the_chain_2026-11-14.md`](../origins/the_chain_2026-11-14.md) directly against **Priest's revenge objections** (*Beyond the Limits of Thought*, pp. 168–170, 253–254).
- **Verified result (`evaluateRevenge`, Test 11):**
  - Flat 1-level `{Y, N, G}` evaluation of *"Is the answer No, or is this gibberish?"* collapses to **$\emptyset$** (Priest's revenge).
  - Splitting **Meaning** (what a concrete disciplined interpreter $I$ actually outputs: $I(R) \in \{Y, N, \bot\}$, where $\bot =$ non-convergence / loop) from **Accuracy** (external observer's truth verdict $A(R) \in \{Y, N\}$) uniquely pins **$\{(I = \bot,\, A = Y)\}$** for any **sound** interpreter $I$ — **zero dialetheic contradiction**. Adding **totality** ($I \neq \bot$) collapses to $\emptyset$, reproducing Turing's halting / Gödel's incompleteness trade-off.
- **Cost for VD:** Priest (p. 253) still defeats the flat word *"gibberish"* — a parsed string that loops ($\bot$) is structurally distinct from unparsed noise (`pip plup pip plap pop`), as `the_chain`'s 4-failure-mode split already implies.

### Row 12: `Is it obligatory?` / `Is it permissible?` (`Mode B` Deontic — `CLEAN_FIT`, `VERIFIED_SECONDARY`)

- **Ambient law (`envMask`):** Standard Deontic Logic **Axiom D** ($Op \to Pp$, `NESTED`: $\{YY, NY, NN\}$ — *ought implies may*).
- **Verified Mode B runs:**
  - *Totalitarian norm* (*"everything permissible is obligatory"*, `REVERSE_NESTED`): intersects with Axiom D to yield **$\{YY, NN\}$ (`MIRROR`)** — collapses all merely permissible acts (`NY`) into obligation or prohibition.
  - *Nihilist prohibition* (*"nothing is permissible"*, `requiresQ2N`): pinned to **$\{NN\}$** — nothing can be obligatory either.
  - *Self-forbidding norm* (a binding rule forbidding obedience to itself: `requiresQ1Y` + `requiresQ2N`): **$\emptyset$ (`COLLAPSE`)**.

### Row 13: `Is it amendable?` / `Is it a valid constitutional rule?` (Ross 1969 / Suber 1990 — `CLEAN_FIT` static / `STRETCH` dynamic, `VERIFIED_SECONDARY`)

- **Static entrenchment conflict (`CLEAN_FIT`, Mode B):** An omnipotent amendment clause proposes `REVERSE_NESTED` (*every valid constitutional rule is amendable*, $Q_2 \Rightarrow Q_1$), colliding with an entrenched irrevocable clause (`requiresQ2Y` + `requiresQ1N`) $\implies$ **$\emptyset$ (`COLLAPSE`)**. Auto-computed exits: deny the entrenched clause's validity (`{NN}`), deny its irrevocability (`{YY}`), exempt it from the amendment clause's scope (`{NY}`), or reject constitutional omnipotence (`{NY}`).
- **Dynamic self-repeal (`STRETCH`):** Using a valid amendment clause to *repeal itself* (Alf Ross, *Mind* 1969; Peter Suber, *The Paradox of Self-Amendment*, 1990) crosses a **temporal transition** ($t \to t+1$: valid at $t$, invalid at $t+1$ via authority grounded at $t$), stepping outside single-snapshot binary masks.

### Row 14: `Is it publicly predicted?` / `Is it executed (freely chosen)?` (Scriven's Prediction Paradox — `CLEAN_FIT`, `VERIFIED_SECONDARY`)

- **Setup (Michael Scriven, *"An Essential Unpredictability in Human Behavior"*):**
  - **Infallible Public Predictor (`envMask`):** `MIRROR` ($Q_1 \Leftrightarrow Q_2$, $\{YY, NN\}$) — predicts publicly what the agent will do, and gets it right.
  - **Contrarian Avoider (`proposedMask`):** `OPPOSITE` ($Q_2 \Leftrightarrow \neg Q_1$, $\{YN, NY\}$) — motivated to defy whatever prediction is communicated.
- **Verified outcome:** $\{YY, NN\} \cap \{YN, NY\} =$ **$\emptyset$ (`COLLAPSE`)** — the exact human-agency twin of Turing's contrarian program $D$ (`MIRROR × OPPOSITE`).
- **Auto-computed exits:**
  1. Drop predictor infallibility (`envMask`) $\to \{YN, NY\}$: the Avoider falsifies the public prediction (Scriven's conclusion).
  2. Drop communication / self-application (`selfApplies`) $\to \{YY, NN\}$: keep the prediction **secret**, breaking feedback into the Avoider.
  3. Drop the Avoider's defiance capacity (`proposedMask`) $\to \{YY, NN\}$: coercion / loss of agency.

---

## 4. The Rule-Exit Matrix (Comparing Philosophical Traditions on 0-Cell Collapses)

Whenever OP hits **$\emptyset$**, the contradiction is a **map of incompatible rules**. Different philosophical traditions are simply choosing different rules to pay with:

| Collapse Case | Jointly Incompatible Rule Set | Exit A | Exit B | Exit C | Exit D |
|---|---|---|---|---|---|
| **Knower Paradox** (Row 1) | `NESTED` ($K \Rightarrow T$) + `SD` + `reflection` + classical consistency | **Stratify / restrict reflection** (block internalizing the proof) | **Drop `SD` well-formedness** (Tarski/hierarchy) | **Drop consistency** (**Priest**: dialetheism) | **Drop `NESTED`** (reduces to Buridan `{YN, NY}`: belief, not knowledge) |
| **Tarski / Turing / Liar** (Row 5) | `MIRROR` ($Q_1 \Leftrightarrow Q_2$) + `SD` (diagonal contrarian) + classical consistency | **Drop `MIRROR` / totality** (**Tarski / Turing**: no internal truth predicate / no halting decider) | **Drop `SD` from domain** (typed/stratified language) | **Drop consistency** (**Priest**: true contradiction) | — |
| **Verificationism** (Row 6) | `REVERSE_NESTED` ($M \Rightarrow V$) + `selfApplies` + `requiresQ2Y` + `requiresQ1N` | **Drop `selfApplies`** (**Carnap**: meta-level rule) | **Drop `requiresQ1N`** (**Ayer 1946**: analytic stipulation) | **Drop `requiresQ2Y`** (**early Wittgenstein**: nonsensical ladder) | **Drop criterion** (post-positivism) |
| **VD Question Fork** (Row 8) | `NESTED` (*every Q has answer*) + erotetic T-schema + `requiresQ1Y` (Liar is Q) | **Drop `requiresQ1Y`** (**Can / VD**: not a valid normalised question) | **Drop `NESTED`** (**Belnap / standard erotetic**: unanswerable questions exist) | **Drop classical consistency** (**Priest**: dialetheic answer) | — |
| **Meno's Paradox** (Row 10) | Horn 1 ($\neg(Q_1 \land Q_2)$) + Horn 2 ($Q_1 \Rightarrow Q_2$) + witness (`requiresQ1Y`) | **Drop Horn 2** (**VD / CS**: knowing a *verifier* $\neq$ knowing the *value*) | **Drop/split Horn 1** (**Plato**: *Anamnesis* — implicit vs. explicit knowledge) | **Drop witness** (**Eristic Sophist**: inquiry is impossible) | — |
| **Revenge Question** (Row 11) | Flat 1-level `{Y, N, G}` + expressible `"gibberish"` + classical consistency | **Split Meaning ($I$) vs. Accuracy ($A$)** (**The Chain / VD**: sound $I$ lands on $(I=\bot, A=Y)$) | **Drop consistency** (**Priest**: dialetheism) | **Drop totality of $I$** (Turing/Gödel boundary) | — |
| **Constitutional Entrenchment** (Row 13) | Omnipotent amendment ($V \Rightarrow A$) + `selfApplies` + valid entrenched clause ($V \land \neg A$) | **Drop omnipotence / scope** (substantive eternity clauses) | **Drop irrevocability** (clause can be amended) | **Drop clause validity** (entrenchment unconstitutional) | — |
| **Scriven's Prediction Paradox** (Row 14) | Infallible public predictor (`MIRROR`) + contrarian Avoider (`OPPOSITE`) + communication (`selfApplies`) | **Drop infallibility** (**Scriven**: public unpredictability) | **Drop communication (`selfApplies`)** (secret prediction still possible) | **Drop defiance (`OPPOSITE`)** (hard coercion / no Avoider) | — |

---

## 5. Empty / Under-Explored Cells (Periodic Table Predictions)

One test of a formal taxonomy is whether it predicts clean cells that didn't arrive pre-packaged from famous paradoxes:

1. **`NESTED × BR_REV` ($\{YY, NN\}$):** On any nested pair (`known / true`, `provable / true`, `indubitable / true`), *"Every truth is $Q_1$"* **cannot be an unknown/unprovable truth (`NY`)** — it is locked into agreement.
2. **`NESTED × EN` ($\{YY, NY\}$):** On any nested pair, *"Something is not $Q_1$"* is **forced to be true ($Q_2 = Y$)** without assuming the domain contains negation.
3. **`NESTED × BR_CONTRA` ($\{NY, NN\}$):** Transposing Prior's thesis onto `known / true` (*"Everything known is false"*) forces $Q_1 = N$ without needing `performative` — it can never be known, and is true iff nothing is known.
4. **`MIRROR × EN` ($\{YY\}$) and `MIRROR × BN` ($\{NN\}$):** On any claimed mirror, both shapes are unsatisfiable at $|D|=1$ and force a distinct witness of the opposite state at $|D| \ge 2$.
5. **The Protagoras 3-item threshold:** Under a dissenter who believes $\neg x$, *"nobody believes Protagoras's thesis, and it's false"* (`NN`) requires a **3rd** statement $w = YN$ in the domain.
6. **Globally unique Millionaire board (`[0%, 25%, 60%, 75%]`):** Unlike `[25%, 50%, 60%, 75%]` (which quietly relies on an unlisted `mustBeOnBoard` rule because off-board `0%` also survives), placing `0%` on the board destroys off-board `0%` while leaving `25%` globally unique across all of $[0, 100\%]$.
7. **Peaceful `Disjoint` rows (Row 9):** Polarity-dual to `NESTED`, yet non-paradoxical whenever no T-link collapses $Q_1$-answers into $Q_2$-values.

---

## 6. The Honest Non-Fit Shelf (Where OP Stops)

To prevent the Atlas from becoming unfalsifiable, here are five tempting candidates that **fail** the formal OP tests (three verified directly in `atlas_verify.test.mjs`):

| Candidate | Verdict | Why OP Refuses or Marks It Stretched |
|---|---|---|
| **Trivial syntactic self-reference** (*"This sentence is not written in English"*, *"This sentence has five words"*) | `HONEST_NON_FIT` (`REFUSED_TRIVIAL_1Q`) | $Q_1$ is settled immediately by syntactic inspection prior to any coupling with $Q_2$. Fails `checkCoupling`. |
| **Euthyphro's Dilemma** (*Euthyphro* 10a: `loved by the gods / pious`) | `HONEST_NON_FIT` (`EXTENSIONAL_MIRROR_CONSISTENT`) | Extensional `MIRROR` $\{YY, NN\}$ is completely consistent! Socrates's dilemma targets asymmetric **explanatory grounding** (*"because"*), not extensional cell elimination. |
| **Hume's Is–Ought Gap** (*Treatise* 3.1.1) | `HONEST_NON_FIT` (`FREE` / non-derivability) | Asserts the *absence* of deductive bridge rules (`FREE`, all 4 cells open) with no self-referential Aligning Statement eliminating cells. |
| **Quantitative symmetry uniqueness** (VD mass estimator's $m \leftrightarrow m^{-1}$ swap pinning $c = \sigma_F/\sigma_a$) | `HONEST_NON_FIT` (`CONTINUOUS_SYMMETRY`) | An involution fixed point on $(0, \infty)$ leaving even shape functions free belongs to invariance groups / functional equations (Cauchy, Pexider, Herschel–Maxwell), not discrete OP. |
| **Dynamic constitutional self-repeal** (Ross 1969 / Suber 1990) | `STRETCH` (temporal $t \to t+1$) | Static entrenchment conflicts are `CLEAN_FIT` (Row 13), but repealing an amendment clause via itself crosses two constitutional snapshots $(t \to t+1)$. |

---

## 7. Sources & Verification Ledger

- **Inherited primary-checked sources** (from [`origins/op_technique_overlapping_problems_2026-11-12.md`](../origins/op_technique_overlapping_problems_2026-11-12.md)): Augustine (*City of God* XI.26), J. L. Mackie ("Self-Refutation: A Formal Analysis", *Philosophical Quarterly* 14, 1964), M. F. Burnyeat ("Protagoras and Self-Refutation in Plato's *Theaetetus*", *Philosophical Review* 85, 1976), Graham Priest (*Beyond the Limits of Thought*, 1995, read in part).
- **Secondary sources checked for Pass 2** (21 November 2026, via web search summaries; treat as verified scholarly leads, not primary-text readings, before formal publication):
  - A. J. Ayer, *Language, Truth and Logic* (1936; 2nd ed. Introduction, 1946 — stipulative-definition defence of the verification principle).
  - K. R. Popper, *The Logic of Scientific Discovery* (1934/1959 — falsifiability as methodological convention rather than scientific claim).
  - A. Ross, "On Self-Reference and a Puzzle in Constitutional Law", *Mind* 78(309), 1969, pp. 1–24; P. Suber, *The Paradox of Self-Amendment* (Peter Lang, 1990).
  - Plato, *Meno* 80d–e (Paradox of Inquiry & *Anamnesis*).
  - M. Scriven, "An Essential Unpredictability in Human Behavior" (Prediction Paradox / Contrarian Avoider).
  - L. Castagnoli, *Ancient Self-Refutation* (Cambridge University Press, 2010); J. M. Boyle / G. Grisez (performative inconsistency taxonomy).
- **Executable verification:** Run `node --test engine/verify.test.mjs engine/atlas_verify.test.mjs` (19/19 passing).
