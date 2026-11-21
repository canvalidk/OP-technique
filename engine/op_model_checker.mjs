#!/usr/bin/env node
/**
 * op_model_checker.mjs
 *
 * Minimal, zero-dependency formal engine for the Overlapping Problems (OP) technique.
 *
 * Design principle (anti-ansatz):
 *   No heavy background logic is smuggled in. A binary OP row is specified solely by
 *   an explicit global bridge mask B ⊆ {YY, YN, NY, NN} plus any explicitly declared
 *   extra rules (performative, reflection, conjunctionDist, dissenter, etc.). All
 *   checks are performed by exhaustive enumeration over finite domains D = {0, ..., n-1}.
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
// 4. Canonical Aligning-Statement shapes (relational satisfaction semantics)
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

// ---------------------------------------------------------------------------
// 5. Exhaustive finite-model enumerator & witness-forcing analyzer
// ---------------------------------------------------------------------------

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
 * Evaluate an OP cell by exhaustive finite-model checking.
 *
 * @param {object} config
 * @param {string[]} config.mask                Global bridge-rule mask B ⊆ S
 * @param {object}   config.shape               One of SHAPES.*
 * @param {number}   [config.domainSize=2]      Number of elements in D (>= shape.minDomain)
 * @param {object}   [config.rules={}]          Explicitly declared extra rules:
 *   - performative:       Q1(x) = Y (considering/uttering x triggers Q1 on x)
 *   - conjunctionDist:    Q1(x) = Y ⇒ Q1(p) = Y (for CONJ)
 *   - unknownTruthTarget: Q2(p) = Y ∧ Q1(p) = N (for CONJ / Fitch)
 *   - dissenter:          element 1 asserts ¬x (Q2(1) = ¬Q2(0)) and Q1(1) = Y (Protagoras)
 *   - witnessNotQ1:       ∃y, Q1(y) = N (someone disagrees/doubts something)
 *   - reflection:         2-pass rule: if base models force Q2(x) = Y, add Q1(x) = Y
 *   - lob:                if Nesting holds (YN banned) and shape is SA, add Q1(x) = Y
 *   - diagonalEquality:   forces Q1(x) = Q2(x) on x (Cantor/Russell diagonal self-application)
 */
export function evaluateCell({ mask, shape, domainSize = 2, rules = {} }) {
  const n = Math.max(domainSize, shape.minDomain, rules.dissenter ? 2 : 1);
  const allowed = canonicalStates(mask);

  const filterBase = (models) =>
    models.filter((m) => {
      if (q2Of(m[0]) !== shape.holds(m)) return false;
      if (rules.performative && !q1Of(m[0])) return false;
      if (rules.diagonalEquality && q1Of(m[0]) !== q2Of(m[0])) return false;
      if (rules.conjunctionDist && q1Of(m[0]) && !q1Of(m[1])) return false;
      if (rules.unknownTruthTarget && !(q2Of(m[1]) && !q1Of(m[1]))) return false;
      if (rules.dissenter && !(q2Of(m[1]) === !q2Of(m[0]) && q1Of(m[1]))) return false;
      if (rules.witnessNotQ1 && !m.some((s) => !q1Of(s))) return false;
      if (rules.lob && !allowed.includes("YN") && shape.id === "SA" && !q1Of(m[0])) {
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

  // Witness forcing: for each surviving state s of x, what states of y != x are forced?
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
    domainSize: n,
    survivingModelsCount: survivingModels.length,
    survivingX,
    outcome,
    reflectionFired,
    witnessRequirements,
    models: survivingModels,
  };
}

/**
 * Compare n=1 against n=2 to detect states that require a distinct second item y != x.
 */
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
// 6. Coupling / Refusal criterion checker
// ---------------------------------------------------------------------------

/**
 * Checks whether an assignment restriction is genuinely OP-coupled or
 * trivially settled by an independent single-question property (e.g.,
 * "This sentence is not written in English", where Q1 is directly inspected
 * from syntax before Q2 enters).
 */
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
// 7. Multi-valued fixed-point extension (Millionaire game-show board)
// ---------------------------------------------------------------------------

/**
 * Evaluates a multi-valued self-referential probability board:
 *   "If you pick an option at random, what is the chance you will be correct?"
 *
 * Separates:
 *   - onBoardFixedPoints: fixed points p ∈ optionsPercent (assuming hidden rule "an option must be right")
 *   - allFixedPoints:     fixed points p ∈ [0, 100], including off-board p = 0% ("none of the options")
 */
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
// 8. CLI report generator
// ---------------------------------------------------------------------------

function runCliReport() {
  console.log("=== 1. ORBIT CLASSIFICATION OF ALL 16 BINARY ROW MASKS (D4) ===");
  for (const o of computeOrbits(D4_TRANSFORMS)) {
    console.log(
      `  |B|=${o.size} | count=${String(o.cardinality).padEnd(2)} | ${o.label}`
    );
    console.log(
      `         members: ${o.members.map(formatStates).join("  ")}`
    );
  }

  console.log("\n=== 2. BASE PERIODIC TABLE (domainSize = 2, no extra rules) ===");
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

  const header =
    "Shape".padEnd(14) + regimes.map((r) => r.id.padEnd(18)).join("");
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

  console.log("\n=== 3. MULTI-VALUED GAME-SHOW BOARDS ===");
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
      )}] (${r.onBoardVerdict}) | global: [${fmt(r.allFixedPoints)}] (${
        r.globalVerdict
      })`
    );
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCliReport();
}
