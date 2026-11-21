#!/usr/bin/env node
/**
 * op_model_checker.mjs
 *
 * Minimal, zero-dependency formal engine for the Overlapping Problems (OP) technique.
 *
 * Design principle (anti-ansatz):
 *   No heavy background logic is smuggled in. Every bridge rule is declared explicitly
 *   as a parameter of the run. The engine supports two binary coupling modes plus two
 *   multi-valued / stratified extensions:
 *
 *   1. Mode A — Truth-Coupled (`evaluateCell`):
 *        Q2(x) evaluates whether x's relational formula holds in finite models (D, Q1, Q2).
 *   2. Mode B — Reflexive Criterion Self-Application (`evaluateCriterionCell`):
 *        Q2 need NOT be truth. A candidate criterion C proposes a bridge mask B_C between
 *        Q1 and Q2, and the engine tests whether C (or an adversarial item) survives its
 *        own rule — and automatically computes the Minimal Exit Menu on collapse (∅).
 *   3. Three-Valued Revenge & Two-Arrow Interpreter Check (`evaluateRevenge`):
 *        Compares flat {Y, N, G} evaluation (Priest's revenge collapse) against the
 *        two-arrow disciplined-interpreter model (Meaning I ∈ {Y, N, ⊥} vs. Accuracy A ∈ {Y, N}).
 *   4. Multi-Valued Fixed-Point Board (`evaluateGameShowBoard`):
 *        Evaluates finite self-referential probability boards (Millionaire problem).
 */

import { pathToFileURL } from "node:url";

export const STATES = Object.freeze(["YY", "YN", "NY", "NN"]);

export function q1Of(state) {
  return state[0] === "Y";
}

export function q2Of(state) {
  return state[1] === "Y";
}

export function makeState(q1, q2) {
  return (q1 ? "Y" : "N") + (q2 ? "Y" : "N");
}

export function canonicalStates(iterable) {
  const set = new Set(iterable);
  return STATES.filter((s) => set.has(s));
}

export function formatStates(states) {
  const c = canonicalStates(states);
  return c.length === 0 ? "∅" : `{${c.join(", ")}}`;
}

// ---------------------------------------------------------------------------
// 1. Symmetry group actions on S = {YY, YN, NY, NN}
// ---------------------------------------------------------------------------

function applyStateTransform(state, { flip1 = false, flip2 = false, swap = false }) {
  let a = q1Of(state);
  let b = q2Of(state);
  if (swap) [a, b] = [b, a];
  if (flip1) a = !a;
  if (flip2) b = !b;
  return makeState(a, b);
}

export const V4_TRANSFORMS = Object.freeze([
  { name: "id", flip1: false, flip2: false, swap: false },
  { name: "flipQ1", flip1: true, flip2: false, swap: false },
  { name: "flipQ2", flip1: false, flip2: true, swap: false },
  { name: "flipBoth", flip1: true, flip2: true, swap: false },
]);

export const D4_TRANSFORMS = Object.freeze([
  ...V4_TRANSFORMS,
  { name: "swap", flip1: false, flip2: false, swap: true },
  { name: "swap+flipQ1", flip1: true, flip2: false, swap: true },
  { name: "swap+flipQ2", flip1: false, flip2: true, swap: true },
  { name: "swap+flipBoth", flip1: true, flip2: true, swap: true },
]);

export function transformMask(mask, transform) {
  return canonicalStates(mask.map((s) => applyStateTransform(s, transform)));
}

export function allMasks() {
  const masks = [];
  for (let bits = 0; bits < 16; bits++) {
    const mask = [];
    for (let i = 0; i < 4; i++) {
      if ((bits >> i) & 1) mask.push(STATES[i]);
    }
    masks.push(mask);
  }
  return masks;
}

export function computeOrbits(transforms = D4_TRANSFORMS) {
  const seen = new Set();
  const orbits = [];
  const keepQ2Distinguished = transforms === V4_TRANSFORMS;

  for (const mask of allMasks()) {
    const key = mask.join(",");
    if (seen.has(key)) continue;

    const orbitMap = new Map();
    for (const t of transforms) {
      const img = transformMask(mask, t);
      orbitMap.set(img.join(","), img);
    }
    const members = [...orbitMap.values()].sort((a, b) =>
      a.join(",").localeCompare(b.join(","))
    );
    for (const m of members) seen.add(m.join(","));

    orbits.push({
      size: mask.length,
      cardinality: members.length,
      label: classifyRegimeOrbit(mask, keepQ2Distinguished),
      members,
    });
  }

  return orbits.sort((a, b) => b.size - a.size || a.label.localeCompare(b.label));
}

function classifyRegimeOrbit(sampleMask, keepQ2Distinguished) {
  const k = sampleMask.length;
  if (k === 4) return "Free (no global bridge rule)";
  if (k === 3) return "Nested (1 cell banned: Q1⇒Q2 up to polarity flips)";
  if (k === 0) return "Globally Inconsistent (∅)";
  if (k === 1) return "Degenerate (both Q1 and Q2 constant)";
  const key = sampleMask.join(",");
  if (key === "YY,NN" || key === "YN,NY") {
    return "Locked Parity (Claimed Mirror ↔ Built Opposite)";
  }
  if (keepQ2Distinguished) {
    const q1Vals = new Set(sampleMask.map(q1Of));
    return q1Vals.size === 1
      ? "Degenerate (Q1 constant everywhere)"
      : "Degenerate (Q2 constant everywhere)";
  }
  return "Degenerate (1 question constant everywhere)";
}

// ---------------------------------------------------------------------------
// 2. Outcome classification for surviving states V(x) ⊆ S
// ---------------------------------------------------------------------------

export function classifyOutcome(states) {
  const c = canonicalStates(states);
  const key = c.join(",");
  if (c.length === 0) return { code: "COLLAPSE", summary: "0 cells survive (setup refutation / paradox)" };
  if (c.length === 4) return { code: "FREE", summary: "Unforced (all 4 cells survive)" };
  if (c.length === 3) {
    const missing = STATES.find((s) => !c.includes(s));
    return { code: "SINGLE_EXCLUSION", summary: `Excludes ${missing} only` };
  }
  if (c.length === 1) {
    return {
      code: "PINNED_BOTH",
      summary: `Fully pinned: Q1=${c[0][0]}, Q2=${c[0][1]}`,
    };
  }
  if (key === "YY,YN") return { code: "FORCED_Q1", summary: "Q1 forced to Y (Q2 open)" };
  if (key === "NY,NN") return { code: "FORCED_Q1", summary: "Q1 forced to N (Q2 open)" };
  if (key === "YY,NY") return { code: "FORCED_Q2", summary: "Q2 forced to Y (Q1 open)" };
  if (key === "YN,NN") return { code: "FORCED_Q2", summary: "Q2 forced to N (Q1 open)" };
  if (key === "YY,NN") return { code: "FORCED_AGREEMENT", summary: "Forced agreement (Q1 = Q2)" };
  if (key === "YN,NY") return { code: "FORCED_DISAGREEMENT", summary: "Forced disagreement (Q1 ≠ Q2)" };
  throw new Error(`Unexpected state set: ${key}`);
}

// ---------------------------------------------------------------------------
// 3. Canonical global bridge-rule regimes
// ---------------------------------------------------------------------------

export const REGIMES = Object.freeze({
  FREE: {
    id: "FREE",
    name: "Free (unconstrained)",
    mask: ["YY", "YN", "NY", "NN"],
  },
  NESTED: {
    id: "NESTED",
    name: "Nested (Q1 ⇒ Q2)",
    mask: ["YY", "NY", "NN"],
  },
  REVERSE_NESTED: {
    id: "REVERSE_NESTED",
    name: "Reverse-Nested (Q2 ⇒ Q1)",
    mask: ["YY", "YN", "NN"],
  },
  MIRROR: {
    id: "MIRROR",
    name: "Claimed Mirror (Q1 ⇔ Q2)",
    mask: ["YY", "NN"],
  },
  OPPOSITE: {
    id: "OPPOSITE",
    name: "Built Opposite (Q1 ⇔ ¬Q2)",
    mask: ["YN", "NY"],
  },
});

// ---------------------------------------------------------------------------
// 4. Mode A: Truth-Coupled Aligning-Statement shapes
//    Element 0 is the Aligning Statement x.
//    Element 1 (when domainSize >= 2) is an auxiliary target p or dissenter z.
// ---------------------------------------------------------------------------

export const SHAPES = Object.freeze({
  SA: {
    id: "SA",
    name: "Self-Affirming",
    formula: "Q1(x) = Y",
    minDomain: 1,
    holds: (model) => q1Of(model[0]),
  },
  SD: {
    id: "SD",
    name: "Self-Denying",
    formula: "Q1(x) = N",
    minDomain: 1,
    holds: (model) => !q1Of(model[0]),
  },
  BN: {
    id: "BN",
    name: "Blanket No",
    formula: "∀y, Q1(y) = N",
    minDomain: 1,
    holds: (model) => model.every((s) => !q1Of(s)),
  },
  BY: {
    id: "BY",
    name: "Blanket Yes",
    formula: "∀y, Q1(y) = Y",
    minDomain: 1,
    holds: (model) => model.every((s) => q1Of(s)),
  },
  EY: {
    id: "EY",
    name: "Existence Yes",
    formula: "∃y, Q1(y) = Y",
    minDomain: 1,
    holds: (model) => model.some((s) => q1Of(s)),
  },
  EN: {
    id: "EN",
    name: "Existence No",
    formula: "∃y, Q1(y) = N",
    minDomain: 1,
    holds: (model) => model.some((s) => !q1Of(s)),
  },
  BR_IMP: {
    id: "BR_IMP",
    name: "Bridge (Q1 ⇒ Q2)",
    formula: "∀y, Q1(y) ⇒ Q2(y)",
    minDomain: 1,
    holds: (model) => model.every((s) => !q1Of(s) || q2Of(s)),
  },
  BR_REV: {
    id: "BR_REV",
    name: "Bridge (Q2 ⇒ Q1)",
    formula: "∀y, Q2(y) ⇒ Q1(y)",
    minDomain: 1,
    holds: (model) => model.every((s) => !q2Of(s) || q1Of(s)),
  },
  BR_CONTRA: {
    id: "BR_CONTRA",
    name: "Bridge Contra (Q1 ⇒ ¬Q2)",
    formula: "∀y, Q1(y) ⇒ ¬Q2(y)",
    minDomain: 1,
    holds: (model) => model.every((s) => !(q1Of(s) && q2Of(s))),
  },
  CONJ: {
    id: "CONJ",
    name: "Conjunction Blindspot",
    formula: "Q2(p) ∧ ¬Q1(p)",
    minDomain: 2,
    holds: (model) => q2Of(model[1]) && !q1Of(model[1]),
  },
});

function enumerateModels(allowedMask, domainSize) {
  const results = [];
  const current = new Array(domainSize);

  function recurse(idx) {
    if (idx === domainSize) {
      results.push(current.slice());
      return;
    }
    for (const s of allowedMask) {
      current[idx] = s;
      recurse(idx + 1);
    }
  }
  recurse(0);
  return results;
}

/**
 * Mode A — Evaluate a Truth-Coupled OP cell by exhaustive finite-model checking.
 *
 * Extra rules are split honestly between:
 *   - Relational/domain rules: performative, conjunctionDist, unknownTruthTarget,
 *     dissenter, witnessNotQ1, diagonalEquality, reflection (2-pass).
 *   - Imported modal axiom: lobModalAxiom — NOT derived from 4-cell algebra; imports
 *     Löb's theorem from provability logic GL (□(□P → P) → □P) so Henkin/Löb can be
 *     placed accurately in the same grid.
 */
export function evaluateCell({ mask, shape, domainSize = 2, rules = {} }) {
  const n = Math.max(domainSize, shape.minDomain, rules.dissenter ? 2 : 1);
  const allowed = canonicalStates(mask);
  const importedModalRules = [];
  if (rules.lobModalAxiom) importedModalRules.push("GL:Lob");

  const filterBase = (models) =>
    models.filter((m) => {
      if (q2Of(m[0]) !== shape.holds(m)) return false;
      if (rules.performative && !q1Of(m[0])) return false;
      if (rules.diagonalEquality && q1Of(m[0]) !== q2Of(m[0])) return false;
      if (rules.conjunctionDist && q1Of(m[0]) && !q1Of(m[1])) return false;
      if (rules.unknownTruthTarget && !(q2Of(m[1]) && !q1Of(m[1]))) return false;
      if (rules.dissenter && !(q2Of(m[1]) === !q2Of(m[0]) && q1Of(m[1]))) return false;
      if (rules.witnessNotQ1 && !m.some((s) => !q1Of(s))) return false;
      if (rules.lobModalAxiom && !allowed.includes("YN") && shape.id === "SA" && !q1Of(m[0])) {
        return false;
      }
      return true;
    });

  let survivingModels = filterBase(enumerateModels(allowed, n));
  let reflectionFired = false;

  if (rules.reflection && survivingModels.length > 0) {
    const forcesQ2True = survivingModels.every((m) => q2Of(m[0]));
    if (forcesQ2True) {
      reflectionFired = true;
      survivingModels = survivingModels.filter((m) => q1Of(m[0]));
    }
  }

  const survivingX = canonicalStates(survivingModels.map((m) => m[0]));
  const outcome = classifyOutcome(survivingX);

  const witnessRequirements = {};
  if (n >= 2) {
    for (const s of survivingX) {
      const modelsWithS = survivingModels.filter((m) => m[0] === s);
      const forcedOtherStates = STATES.filter((t) =>
        modelsWithS.every((m) => m.slice(1).includes(t))
      );
      const forcedOtherQ1Y = modelsWithS.every((m) =>
        m.slice(1).some((other) => q1Of(other))
      );
      const forcedOtherQ1N = modelsWithS.every((m) =>
        m.slice(1).some((other) => !q1Of(other))
      );
      witnessRequirements[s] = {
        forcedOtherStates,
        forcedOtherQ1Y,
        forcedOtherQ1N,
      };
    }
  }

  return {
    mode: "TRUTH_COUPLED",
    domainSize: n,
    survivingModelsCount: survivingModels.length,
    survivingX,
    outcome,
    reflectionFired,
    importedModalRules,
    witnessRequirements,
    models: survivingModels,
  };
}

export function analyzeWitnessForcing({ mask, shape, rules = {} }) {
  if (shape.minDomain > 1 || rules.dissenter) {
    return { applicable: false, reason: "Shape or rule already requires |D| >= 2." };
  }
  const n1 = evaluateCell({ mask, shape, domainSize: 1, rules });
  const n2 = evaluateCell({ mask, shape, domainSize: 2, rules });
  const requiresSecondItem = n2.survivingX.filter((s) => !n1.survivingX.includes(s));
  return {
    applicable: true,
    atN1: n1.survivingX,
    atN2: n2.survivingX,
    requiresSecondItem,
    witnessRequirements: n2.witnessRequirements,
  };
}

// ---------------------------------------------------------------------------
// 5. Mode B: Reflexive Criterion Self-Application (Non-Truth Rows)
// ---------------------------------------------------------------------------

/**
 * Mode B — Evaluate a non-truth row where a candidate criterion C proposes a bridge
 * mask `proposedMask` between Q1 and Q2, and we test whether a target item x
 * (either C itself under self-application, or an adversarial item a) survives under
 * a set of explicitly named constraints.
 *
 * When the surviving set is ∅ (COLLAPSE), automatically computes the single-rule
 * `exitMenu`: every active constraint whose individual removal restores satisfiability.
 *
 * @param {object} config
 * @param {string}   [config.name]
 * @param {string[]} [config.envMask=STATES]     Ambient row law (e.g., Deontic Axiom D: Q1⇒Q2)
 * @param {string[]} [config.proposedMask=STATES] Bridge mask proposed by criterion C
 * @param {boolean}  [config.selfApplies=true]   Whether C's proposedMask applies to x
 * @param {object}   [config.itemConstraints={}] Explicit predicates asserted of x:
 *   - requiresQ1Y / requiresQ1N  (e.g., failsQ1: verificationism is not verifiable)
 *   - requiresQ2Y / requiresQ2N  (e.g., selfQualifiesQ2: a rule of meaning must be meaningful)
 *   - customMask: string[]       (optional explicit subset of S for x)
 * @param {object}   [config.labels={}]          Optional human-readable labels for exitMenu
 */
export function evaluateCriterionCell({
  name = "unnamed criterion",
  envMask = STATES,
  proposedMask = STATES,
  selfApplies = true,
  itemConstraints = {},
  labels = {},
}) {
  const activeConstraints = [];

  if (canonicalStates(envMask).length < 4) {
    activeConstraints.push({
      id: "envMask",
      label: labels.envMask || `Ambient row rule ${formatStates(envMask)}`,
      mask: canonicalStates(envMask),
    });
  }

  if (selfApplies && canonicalStates(proposedMask).length < 4) {
    activeConstraints.push({
      id: "proposedMask_and_selfApplies",
      label:
        labels.proposedMask ||
        `Criterion's proposed rule ${formatStates(proposedMask)} applied to target`,
      mask: canonicalStates(proposedMask),
    });
  }

  if (itemConstraints.requiresQ1Y) {
    activeConstraints.push({
      id: "requiresQ1Y",
      label: labels.requiresQ1Y || "Target satisfies Q1 (Q1(x) = Y)",
      mask: ["YY", "YN"],
    });
  }
  if (itemConstraints.requiresQ1N) {
    activeConstraints.push({
      id: "requiresQ1N",
      label: labels.requiresQ1N || "Target fails Q1 (Q1(x) = N)",
      mask: ["NY", "NN"],
    });
  }
  if (itemConstraints.requiresQ2Y) {
    activeConstraints.push({
      id: "requiresQ2Y",
      label: labels.requiresQ2Y || "Target requires Q2 (Q2(x) = Y)",
      mask: ["YY", "NY"],
    });
  }
  if (itemConstraints.requiresQ2N) {
    activeConstraints.push({
      id: "requiresQ2N",
      label: labels.requiresQ2N || "Target fails Q2 (Q2(x) = N)",
      mask: ["YN", "NN"],
    });
  }
  if (itemConstraints.customMask) {
    activeConstraints.push({
      id: "customMask",
      label: labels.customMask || `Target constraint ${formatStates(itemConstraints.customMask)}`,
      mask: canonicalStates(itemConstraints.customMask),
    });
  }

  const intersectAll = (constraints) =>
    STATES.filter((s) => constraints.every((c) => c.mask.includes(s)));

  const survivingX = intersectAll(activeConstraints);
  const outcome = classifyOutcome(survivingX);

  // Automatic Exit Menu when collapse occurs: drop each active constraint one by one
  const exitMenu = [];
  if (survivingX.length === 0) {
    for (const c of activeConstraints) {
      const withoutC = activeConstraints.filter((other) => other.id !== c.id);
      const rescued = intersectAll(withoutC);
      if (rescued.length > 0) {
        if (c.id === "proposedMask_and_selfApplies") {
          // Expose both conceptually distinct exits bundled in self-application of C:
          exitMenu.push({
            droppedRule: "selfApplies",
            label: labels.dropSelfApplies || "Exempt criterion from its own domain (meta-level split)",
            survivingIfDropped: rescued,
          });
          exitMenu.push({
            droppedRule: "proposedMask",
            label: labels.dropProposedMask || "Reject or weaken the criterion itself",
            survivingIfDropped: rescued,
          });
        } else {
          exitMenu.push({
            droppedRule: c.id,
            label: `Drop: ${c.label}`,
            survivingIfDropped: rescued,
          });
        }
      }
    }
  }

  return {
    mode: "CRITERION_SELF_APPLICATION",
    name,
    survivingX,
    outcome,
    activeConstraints: activeConstraints.map((c) => ({ id: c.id, label: c.label, mask: c.mask })),
    exitMenu,
  };
}

// ---------------------------------------------------------------------------
// 6. Coupling / Refusal criterion checker
// ---------------------------------------------------------------------------

export function checkCoupling({
  mask,
  shape,
  domainSize = 2,
  rules = {},
  independentQ1Pinned = false,
  independentQ2Pinned = false,
}) {
  if (independentQ1Pinned || independentQ2Pinned) {
    return {
      coupled: false,
      verdict: "REFUSED_TRIVIAL_1Q",
      reason:
        "One question is settled directly by independent inspection prior to any Q1–Q2 interaction.",
    };
  }

  const res = evaluateCell({ mask, shape, domainSize, rules });
  if (res.survivingX.length === 4) {
    return {
      coupled: false,
      verdict: "UNFORCED",
      reason: "All 4 states survive; no forcing occurred.",
    };
  }

  const freeOnly = evaluateCell({
    mask: REGIMES.FREE.mask,
    shape,
    domainSize,
    rules: {},
  });

  const maskAllowed = canonicalStates(mask);
  const narrowedByRow = res.survivingX.length < freeOnly.survivingX.length;
  const narrowedByShape = res.survivingX.length < maskAllowed.length;

  if (narrowedByRow && narrowedByShape) {
    return {
      coupled: true,
      verdict: "GENUINE_OP_BOTH_LOAD_BEARING",
      reason:
        "Both the row rules and the statement's self/domain reference strictly eliminate cells.",
      survivingX: res.survivingX,
    };
  }
  if (narrowedByShape && maskAllowed.length === 4) {
    return {
      coupled: true,
      verdict: "GENUINE_OP_PURE_SHAPE",
      reason:
        "Even on a Free row, the T-link couples Q1 and Q2 without settling either question independently.",
      survivingX: res.survivingX,
    };
  }
  return {
    coupled: false,
    verdict: "ROW_ONLY_NO_SHAPE_WORK",
    reason:
      "The surviving set is no tighter than the global row mask alone; the statement adds no forcing.",
    survivingX: res.survivingX,
  };
}

// ---------------------------------------------------------------------------
// 7. Three-Valued Revenge & Two-Arrow Disciplined-Interpreter Check
// ---------------------------------------------------------------------------

/**
 * Evaluates polar self-referential questions in 3-valued {Y, N, G} ("Yes / No / Gibberish")
 * and contrasts flat single-level evaluation against the two-arrow disciplined-interpreter
 * model (Meaning: interpreter output I ∈ {Y, N, ⊥} vs. Accuracy: external truth A ∈ {Y, N}).
 */
export function evaluateRevenge() {
  const T3 = ["Y", "N", "G"];

  // 7a. Plain Liar-question: "Is the answer to this question No?"
  // Under classical-exclusion semantics: for v=G, "v === N" is FALSE ("N"), so G fails too.
  const plainLiarExclusion = T3.filter((v) => {
    const propTruth = v === "N" ? "Y" : "N";
    return v === propTruth;
  });

  // Under weak-Kleene / Bochvar infectious-gap semantics: v=G propagates G to the whole question.
  const plainLiarInfectiousGap = T3.filter((v) => {
    if (v === "G") return true;
    const propTruth = v === "N" ? "Y" : "N";
    return v === propTruth;
  });

  // 7b. Revenge Question: "Is the answer to this question No, or is this gibberish?"
  // Flat single-level: calling it G makes "this is gibberish" TRUE ("Y"), killing G!
  const revengeFlat = T3.filter((v) => {
    const propTruth = v === "N" || v === "G" ? "Y" : "N";
    return v === propTruth;
  });

  // 7c. Two-Arrow Disciplined-Interpreter Model (The Chain / VD):
  //   I(R) ∈ {Y, N, ⊥}  (what concrete interpreter I actually produces; ⊥ = non-convergence)
  //   A(R) ∈ {Y, N}     (external observer's accuracy check of "I(R)=N ∨ I(R)=⊥")
  const I_VALS = ["Y", "N", "⊥"];
  const A_VALS = ["Y", "N"];
  const allPairs = [];
  for (const I of I_VALS) {
    for (const A of A_VALS) {
      const holds = I === "N" || I === "⊥" ? "Y" : "N";
      if (A === holds) allPairs.push({ I, A });
    }
  }

  // Soundness of I: whenever I converges (I ≠ ⊥), its output matches external accuracy A.
  const soundPairs = allPairs.filter(({ I, A }) => I === "⊥" || I === A);

  // Soundness + Totality (I ≠ ⊥): Turing / Gödel impossibility!
  const soundAndTotalPairs = soundPairs.filter(({ I }) => I !== "⊥");

  return {
    plainLiarExclusion,
    plainLiarInfectiousGap,
    revengeFlat,
    twoArrowUnconstrained: allPairs,
    twoArrowSound: soundPairs,
    twoArrowSoundAndTotal: soundAndTotalPairs,
  };
}

// ---------------------------------------------------------------------------
// 8. Multi-valued fixed-point extension (Millionaire game-show board)
// ---------------------------------------------------------------------------

export function evaluateGameShowBoard(optionsPercent) {
  const k = optionsPercent.length;
  const uniqueOnBoard = [...new Set(optionsPercent)].sort((a, b) => a - b);
  const allCandidates = [...new Set([0, ...optionsPercent])].sort((a, b) => a - b);

  const isFixed = (p) => {
    const count = optionsPercent.filter((o) => o === p).length;
    const inducedPercent = (100 * count) / k;
    return Math.abs(inducedPercent - p) < 1e-9;
  };

  const onBoardFixedPoints = uniqueOnBoard.filter(isFixed);
  const allFixedPoints = allCandidates.filter(isFixed);

  const labelCount = (arr) => {
    if (arr.length === 0) return "COLLAPSE (0 fixed points)";
    if (arr.length === 1) return "UNIQUE (1 fixed point)";
    return `AMBIGUOUS (${arr.length} fixed points)`;
  };

  return {
    optionsPercent,
    onBoardFixedPoints,
    allFixedPoints,
    onBoardVerdict: labelCount(onBoardFixedPoints),
    globalVerdict: labelCount(allFixedPoints),
    offBoardZeroSurvives: allFixedPoints.includes(0) && !onBoardFixedPoints.includes(0),
  };
}

// ---------------------------------------------------------------------------
// 9. CLI report generator
// ---------------------------------------------------------------------------

function runCliReport() {
  console.log("=== 1. ORBIT CLASSIFICATION OF ALL 16 BINARY ROW MASKS (D4) ===");
  for (const o of computeOrbits(D4_TRANSFORMS)) {
    console.log(
      `  |B|=${o.size} | count=${String(o.cardinality).padEnd(2)} | ${o.label}`
    );
    console.log(`         members: ${o.members.map(formatStates).join("  ")}`);
  }

  console.log("\n=== 2. MODE A: BASE PERIODIC TABLE (domainSize = 2, no extra rules) ===");
  const baseShapes = [
    SHAPES.SA,
    SHAPES.SD,
    SHAPES.BN,
    SHAPES.BY,
    SHAPES.EY,
    SHAPES.EN,
    SHAPES.BR_IMP,
    SHAPES.BR_REV,
    SHAPES.BR_CONTRA,
  ];
  const regimes = [
    REGIMES.FREE,
    REGIMES.NESTED,
    REGIMES.REVERSE_NESTED,
    REGIMES.MIRROR,
    REGIMES.OPPOSITE,
  ];

  const header = "Shape".padEnd(14) + regimes.map((r) => r.id.padEnd(18)).join("");
  console.log(header);
  console.log("-".repeat(header.length));

  for (const shape of baseShapes) {
    const row =
      shape.id.padEnd(14) +
      regimes
        .map((r) => {
          const res = evaluateCell({ mask: r.mask, shape, domainSize: 2 });
          return formatStates(res.survivingX).padEnd(18);
        })
        .join("");
    console.log(row);
  }

  console.log("\n=== 3. MODE B: CRITERION SELF-APPLICATION (NON-TRUTH ROWS) ===");
  const ayer = evaluateCriterionCell({
    name: "Verificationism (verifiable / meaningful)",
    proposedMask: REGIMES.REVERSE_NESTED.mask, // meaningful => verifiable
    selfApplies: true,
    itemConstraints: { requiresQ2Y: true, requiresQ1N: true },
    labels: {
      requiresQ2Y: "Criterion must itself be meaningful",
      requiresQ1N: "Criterion is neither empirically verifiable nor analytic",
    },
  });
  const popper = evaluateCriterionCell({
    name: "Falsificationism (falsifiable / scientific)",
    proposedMask: REGIMES.REVERSE_NESTED.mask, // scientific => falsifiable
    selfApplies: true,
    itemConstraints: { requiresQ2Y: false, requiresQ1N: true },
    labels: {
      requiresQ1N: "Demarcation criterion is not empirically falsifiable",
    },
  });
  console.log(`  ${ayer.name}: ${formatStates(ayer.survivingX)} — ${ayer.outcome.summary}`);
  for (const ex of ayer.exitMenu) {
    console.log(`      exit [${ex.droppedRule}]: ${ex.label} -> ${formatStates(ex.survivingIfDropped)}`);
  }
  console.log(`  ${popper.name}: ${formatStates(popper.survivingX)} — ${popper.outcome.summary}`);

  console.log("\n=== 4. THREE-VALUED REVENGE vs. TWO-ARROW INTERPRETER ===");
  const rev = evaluateRevenge();
  console.log(`  Plain Liar {Y,N,G} (classical exclusion):  [${rev.plainLiarExclusion.join(", ") || "∅"}]`);
  console.log(`  Plain Liar {Y,N,G} (infectious gap):       [${rev.plainLiarInfectiousGap.join(", ") || "∅"}]`);
  console.log(`  Revenge Question {Y,N,G} (flat 1-level):   [${rev.revengeFlat.join(", ") || "∅"}]`);
  console.log(
    `  Revenge (Two-Arrow, Sound interpreter I):  [${rev.twoArrowSound
      .map((p) => `(I=${p.I}, A=${p.A})`)
      .join(", ")}]`
  );
  console.log(
    `  Revenge (Two-Arrow, Sound + Total I):      [${rev.twoArrowSoundAndTotal.join(", ") || "∅"}]`
  );

  console.log("\n=== 5. MULTI-VALUED GAME-SHOW BOARDS ===");
  const boards = [
    [25, 0, 50, 25],
    [0, 25, 60, 75],
    [25, 50, 60, 75],
    [25, 50, 50, 60],
    [10, 20, 30, 40],
    [0, 20, 30, 40],
  ];
  for (const b of boards) {
    const r = evaluateGameShowBoard(b);
    const fmt = (arr) => (arr.length ? arr.map((x) => `${x}%`).join(", ") : "none");
    console.log(
      `  [${b.map((x) => `${x}%`).join(", ")}] -> on-board: [${fmt(
        r.onBoardFixedPoints
      )}] (${r.onBoardVerdict}) | global: [${fmt(r.allFixedPoints)}] (${r.globalVerdict})`
    );
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCliReport();
}
