import test from "node:test";
import assert from "node:assert/strict";
import {
  D4_TRANSFORMS,
  V4_TRANSFORMS,
  REGIMES,
  SHAPES,
  computeOrbits,
  transformMask,
  evaluateCell,
  evaluateCriterionCell,
  analyzeWitnessForcing,
  checkCoupling,
  evaluateRevenge,
  evaluateGameShowBoard,
} from "./op_model_checker.mjs";

test("1. Orbit classification: 16 binary masks collapse into 3 non-degenerate regimes under D4 and V4", () => {
  const d4 = computeOrbits(D4_TRANSFORMS);
  const v4 = computeOrbits(V4_TRANSFORMS);

  assert.equal(d4.reduce((sum, o) => sum + o.cardinality, 0), 16);
  assert.equal(v4.reduce((sum, o) => sum + o.cardinality, 0), 16);

  assert.equal(d4.length, 6);
  assert.equal(v4.length, 7);

  // Non-degenerate orbits: |B|=4 (Free, 1), |B|=3 (Nested, 4), |B|=2 parity (Locked, 2)
  const nonDegenerate = d4.filter(
    (o) => o.size === 4 || o.size === 3 || o.label.startsWith("Locked Parity")
  );
  assert.equal(nonDegenerate.length, 3);
  assert.deepEqual(
    nonDegenerate.map((o) => o.cardinality).sort((a, b) => a - b),
    [1, 2, 4]
  );

  // Polarity-flip duality: Claimed Mirror <-> Built Opposite via flipQ2
  const flipQ2 = V4_TRANSFORMS.find((t) => t.name === "flipQ2");
  assert.deepEqual(transformMask(REGIMES.MIRROR.mask, flipQ2), REGIMES.OPPOSITE.mask);

  // Polarity-flip isomorphism: Doubt (false => doubtable, i.e., YN not banned, NN banned? Wait:
  // Q1 = can be doubted, Q2 = true -> "false => doubtable" bans NN = (not doubtable, false)!)
  // Flipping Q1 (can be doubted <-> indubitable) maps {YY, YN, NY} -> {NY, NN, YY} = NESTED!
  const flipQ1 = V4_TRANSFORMS.find((t) => t.name === "flipQ1");
  const doubtWithRule3Mask = ["YY", "YN", "NY"]; // bans NN (false and not doubtable)
  assert.deepEqual(transformMask(doubtWithRule3Mask, flipQ1), REGIMES.NESTED.mask);
});

test("2. Domain-size stability: base periodic table stabilizes by n = 2 (identical at n = 2, 3, 4)", () => {
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
  const regimes = Object.values(REGIMES);

  for (const shape of baseShapes) {
    for (const regime of regimes) {
      const n2 = evaluateCell({ mask: regime.mask, shape, domainSize: 2 }).survivingX;
      const n3 = evaluateCell({ mask: regime.mask, shape, domainSize: 3 }).survivingX;
      const n4 = evaluateCell({ mask: regime.mask, shape, domainSize: 4 }).survivingX;
      assert.deepEqual(n3, n2, `${shape.id} x ${regime.id} changed between n=2 and n=3`);
      assert.deepEqual(n4, n2, `${shape.id} x ${regime.id} changed between n=2 and n=4`);
    }
  }
});

test("3. Self-Denying (SD) across regimes: Buridan, Gödel I, Knower, and Tarski/Turing/Liar", () => {
  // Buridan / Burge (believed / true, Free)
  const buridan = evaluateCell({ mask: REGIMES.FREE.mask, shape: SHAPES.SD });
  assert.deepEqual(buridan.survivingX, ["YN", "NY"]);
  assert.equal(buridan.outcome.code, "FORCED_DISAGREEMENT");

  // Gödel I (provable / true, Nested)
  const godel = evaluateCell({ mask: REGIMES.NESTED.mask, shape: SHAPES.SD });
  assert.deepEqual(godel.survivingX, ["NY"]);
  assert.equal(godel.outcome.code, "PINNED_BOTH");

  // Kaplan-Montague Knower (known / true, Nested + Reflection)
  const knower = evaluateCell({
    mask: REGIMES.NESTED.mask,
    shape: SHAPES.SD,
    rules: { reflection: true },
  });
  assert.equal(knower.reflectionFired, true);
  assert.deepEqual(knower.survivingX, []);
  assert.equal(knower.outcome.code, "COLLAPSE");

  // Reflection does NOT collapse Buridan (Q2=Y is not forced on pass 1)
  const buridanRefl = evaluateCell({
    mask: REGIMES.FREE.mask,
    shape: SHAPES.SD,
    rules: { reflection: true },
  });
  assert.equal(buridanRefl.reflectionFired, false);
  assert.deepEqual(buridanRefl.survivingX, ["YN", "NY"]);

  // Tarski / Turing / Liar-question (Claimed Mirror)
  const tarski = evaluateCell({ mask: REGIMES.MIRROR.mask, shape: SHAPES.SD });
  assert.deepEqual(tarski.survivingX, []);
  assert.equal(tarski.outcome.code, "COLLAPSE");
});

test("4. Self-Affirming (SA) across regimes: Smullyan, Truth-Teller, and Löb/Henkin", () => {
  const smullyan = evaluateCell({ mask: REGIMES.FREE.mask, shape: SHAPES.SA });
  assert.deepEqual(smullyan.survivingX, ["YY", "NN"]);
  assert.equal(smullyan.outcome.code, "FORCED_AGREEMENT");

  const nestedSA = evaluateCell({ mask: REGIMES.NESTED.mask, shape: SHAPES.SA });
  assert.deepEqual(nestedSA.survivingX, ["YY", "NN"]);

  const lob = evaluateCell({
    mask: REGIMES.NESTED.mask,
    shape: SHAPES.SA,
    rules: { lobModalAxiom: true },
  });
  assert.deepEqual(lob.survivingX, ["YY"]);
  assert.equal(lob.outcome.code, "PINNED_BOTH");
  assert.deepEqual(lob.importedModalRules, ["GL:Lob"]);

  const oppSA = evaluateCell({ mask: REGIMES.OPPOSITE.mask, shape: SHAPES.SA });
  assert.deepEqual(oppSA.survivingX, []);
});

test("5. Blanket No (BN): Mackie pragmatic, Sextus/Can's doubt A, Mackie Kind 2, and Mirror witness", () => {
  // Mackie pragmatic ("Nobody believes anything", Free)
  const pragmatic = evaluateCell({ mask: REGIMES.FREE.mask, shape: SHAPES.BN });
  assert.deepEqual(pragmatic.survivingX, ["YN", "NY", "NN"]);

  // Sextus ("Nothing is known") & Can's statement A (via flipQ1: "Nothing is indubitable")
  const sextus = evaluateCell({ mask: REGIMES.NESTED.mask, shape: SHAPES.BN });
  assert.deepEqual(sextus.survivingX, ["NY", "NN"]);
  assert.equal(sextus.outcome.code, "FORCED_Q1");

  // Witness forcing for Sextus / Can's statement A:
  // If A is false (NN), there MUST exist another statement y != A that IS known / indubitable!
  const sextusWitness = analyzeWitnessForcing({ mask: REGIMES.NESTED.mask, shape: SHAPES.BN });
  assert.deepEqual(sextusWitness.atN1, ["NY"]);
  assert.deepEqual(sextusWitness.atN2, ["NY", "NN"]);
  assert.deepEqual(sextusWitness.requiresSecondItem, ["NN"]);
  assert.equal(sextusWitness.witnessRequirements.NN.forcedOtherQ1Y, true);

  // Mackie Absolute Kind 2 ("There are no truths", Reverse-Nested)
  const mackie2 = evaluateCell({ mask: REGIMES.REVERSE_NESTED.mask, shape: SHAPES.BN });
  assert.deepEqual(mackie2.survivingX, ["YN", "NN"]);
  assert.equal(mackie2.outcome.code, "FORCED_Q2");

  // Mirror ("Nothing is true"): pins NN and forces another statement y != x in state YY
  const mirrorBN = analyzeWitnessForcing({ mask: REGIMES.MIRROR.mask, shape: SHAPES.BN });
  assert.deepEqual(mirrorBN.atN1, []);
  assert.deepEqual(mirrorBN.atN2, ["NN"]);
  assert.deepEqual(mirrorBN.witnessRequirements.NN.forcedOtherStates, ["YY"]);
});

test("6. Existence & Bridge shapes: Cogito, Existence-No, BR_REV surprise, Prior (1961), Protagoras", () => {
  // Cogito / "Some statement can be doubted" / "Are there any questions?" (Performative + EY)
  const cogito = evaluateCell({
    mask: REGIMES.FREE.mask,
    shape: SHAPES.EY,
    rules: { performative: true },
  });
  assert.deepEqual(cogito.survivingX, ["YY"]);

  // Existence-No under Nested ("Something is unknown / unprovable"): forces Q2 = Y!
  const exNoNested = evaluateCell({ mask: REGIMES.NESTED.mask, shape: SHAPES.EN });
  assert.deepEqual(exNoNested.survivingX, ["YY", "NY"]);
  assert.equal(exNoNested.outcome.code, "FORCED_Q2");

  // Existence-No under Mirror: pins YY and forces another statement y != x in state NN!
  const exNoMirror = analyzeWitnessForcing({ mask: REGIMES.MIRROR.mask, shape: SHAPES.EN });
  assert.deepEqual(exNoMirror.atN1, []);
  assert.deepEqual(exNoMirror.atN2, ["YY"]);
  assert.deepEqual(exNoMirror.witnessRequirements.YY.forcedOtherStates, ["NN"]);

  // BR_REV under Nested ("Every truth is known"): cannot be an unknown truth (NY banned)!
  const brRevNested = evaluateCell({ mask: REGIMES.NESTED.mask, shape: SHAPES.BR_REV });
  assert.deepEqual(brRevNested.survivingX, ["YY", "NN"]);
  assert.equal(brRevNested.outcome.code, "FORCED_AGREEMENT");

  // Prior's Theorem (1961): "Every belief is false" believed (FREE + performative + BR_CONTRA)
  // Unsatisfiable at n=1; at n>=2 forces x=YN and a distinct true belief y != x in state YY!
  const prior = analyzeWitnessForcing({
    mask: REGIMES.FREE.mask,
    shape: SHAPES.BR_CONTRA,
    rules: { performative: true },
  });
  assert.deepEqual(prior.atN1, []);
  assert.deepEqual(prior.atN2, ["YN"]);
  assert.deepEqual(prior.witnessRequirements.YN.forcedOtherStates, ["YY"]);

  // Protagoras ("Every belief is true"): all 4 states survive without a dissenter
  const protagorasNoDissenter = evaluateCell({ mask: REGIMES.FREE.mask, shape: SHAPES.BR_IMP });
  assert.deepEqual(protagorasNoDissenter.survivingX, ["YY", "YN", "NY", "NN"]);

  // Protagoras WITH a dissenter who believes ¬x:
  // At n=2 ({x, ¬x} only): NN is dead because ¬x is true and nobody believes x, so every belief would be true!
  // Thus at n=2, ONLY YN survives (x itself must be the false belief).
  const protagorasN2 = evaluateCell({
    mask: REGIMES.FREE.mask,
    shape: SHAPES.BR_IMP,
    domainSize: 2,
    rules: { dissenter: true },
  });
  assert.deepEqual(protagorasN2.survivingX, ["YN"]);

  // At n=3 ({x, ¬x, w}): both YN and NN survive (Q2 forced to N), and NN forces the third item w to be YN!
  const protagorasN3 = evaluateCell({
    mask: REGIMES.FREE.mask,
    shape: SHAPES.BR_IMP,
    domainSize: 3,
    rules: { dissenter: true },
  });
  assert.deepEqual(protagorasN3.survivingX, ["YN", "NN"]);
  assert.equal(protagorasN3.outcome.code, "FORCED_Q2");
  assert.deepEqual(protagorasN3.witnessRequirements.NN.forcedOtherStates, ["YY", "YN"]);
});

test("7. Conjunction Blindspot (Moore & Fitch) and Diagonal Opposite (Cantor & Russell)", () => {
  // Moore's sentence ("p and I don't believe p"): YY banned under conjunction distribution
  const moore = evaluateCell({
    mask: REGIMES.FREE.mask,
    shape: SHAPES.CONJ,
    rules: { conjunctionDist: true },
  });
  assert.deepEqual(moore.survivingX, ["YN", "NY", "NN"]);

  // Fitch ("p is true and nobody knows p"): Q1 forced to N; with unknown truth p, pins NY
  const fitchGeneral = evaluateCell({
    mask: REGIMES.NESTED.mask,
    shape: SHAPES.CONJ,
    rules: { conjunctionDist: true },
  });
  assert.deepEqual(fitchGeneral.survivingX, ["NY", "NN"]);

  const fitchOnUnknownTruth = evaluateCell({
    mask: REGIMES.NESTED.mask,
    shape: SHAPES.CONJ,
    rules: { conjunctionDist: true, unknownTruthTarget: true },
  });
  assert.deepEqual(fitchOnUnknownTruth.survivingX, ["NY"]);

  // Add claimed mirror ("every truth is known"): Fitch collapses to ∅
  const fitchCollapse = evaluateCell({
    mask: REGIMES.MIRROR.mask,
    shape: SHAPES.CONJ,
    rules: { conjunctionDist: true, unknownTruthTarget: true },
  });
  assert.deepEqual(fitchCollapse.survivingX, []);

  // Cantor / Russell: Built Opposite globally + diagonal equality at the constructed item -> ∅
  const diagonalCollapse = evaluateCell({
    mask: REGIMES.OPPOSITE.mask,
    shape: SHAPES.SA, // diagonal item where Q1(x) = Q2(x)
    rules: { diagonalEquality: true },
  });
  assert.deepEqual(diagonalCollapse.survivingX, []);
});

test("8. Coupling / Refusal criterion excludes trivial 1-question cases and inert cells", () => {
  // "This sentence is not written in English": Q1 pinned by syntax before Q2 enters
  const trivialEnglish = checkCoupling({
    mask: REGIMES.FREE.mask,
    shape: SHAPES.SD,
    independentQ1Pinned: true,
  });
  assert.equal(trivialEnglish.coupled, false);
  assert.equal(trivialEnglish.verdict, "REFUSED_TRIVIAL_1Q");

  // Genuine OP where both row and shape do work (Gödel, Sextus)
  const godelCoupling = checkCoupling({ mask: REGIMES.NESTED.mask, shape: SHAPES.SD });
  assert.equal(godelCoupling.coupled, true);
  assert.equal(godelCoupling.verdict, "GENUINE_OP_BOTH_LOAD_BEARING");

  // Genuine OP on a Free row (Buridan / Mackie pragmatic)
  const buridanCoupling = checkCoupling({ mask: REGIMES.FREE.mask, shape: SHAPES.SD });
  assert.equal(buridanCoupling.coupled, true);
  assert.equal(buridanCoupling.verdict, "GENUINE_OP_PURE_SHAPE");

  // Inert cell: MIRROR x SA (SA adds no restriction beyond MIRROR = {YY, NN})
  const inert = checkCoupling({ mask: REGIMES.MIRROR.mask, shape: SHAPES.SA });
  assert.equal(inert.coupled, false);
  assert.equal(inert.verdict, "ROW_ONLY_NO_SHAPE_WORK");

  // Unforced cell: Protagoras without dissenter
  const unforced = checkCoupling({ mask: REGIMES.FREE.mask, shape: SHAPES.BR_IMP });
  assert.equal(unforced.coupled, false);
  assert.equal(unforced.verdict, "UNFORCED");
});

test("9. Multi-valued Game-Show Board: distinguishes on-board vs global fixed points (exposes off-board 0%)", () => {
  // Classic Millionaire paradox board: 0 fixed points on-board AND globally
  const classic = evaluateGameShowBoard([25, 0, 50, 25]);
  assert.deepEqual(classic.onBoardFixedPoints, []);
  assert.deepEqual(classic.allFixedPoints, []);

  // [25, 50, 60, 75]: unique on-board (25%), BUT 0% survives off-board unless "answer must be on board"!
  const subtle = evaluateGameShowBoard([25, 50, 60, 75]);
  assert.deepEqual(subtle.onBoardFixedPoints, [25]);
  assert.deepEqual(subtle.allFixedPoints, [0, 25]);
  assert.equal(subtle.offBoardZeroSurvives, true);

  // [0, 25, 60, 75]: putting 0% on the board kills off-board 0%, leaving 25% truly unique globally!
  const trulyUnique = evaluateGameShowBoard([0, 25, 60, 75]);
  assert.deepEqual(trulyUnique.onBoardFixedPoints, [25]);
  assert.deepEqual(trulyUnique.allFixedPoints, [25]);
  assert.equal(trulyUnique.offBoardZeroSurvives, false);

  // [25, 50, 50, 60]: two on-board fixed points (25%, 50%) plus off-board 0%
  const ambiguous = evaluateGameShowBoard([25, 50, 50, 60]);
  assert.deepEqual(ambiguous.onBoardFixedPoints, [25, 50]);
  assert.deepEqual(ambiguous.allFixedPoints, [0, 25, 50]);

  // Revenge analog: [10, 20, 30, 40] has off-board 0%; adding 0% kills it -> collapse!
  const outsideWorks = evaluateGameShowBoard([10, 20, 30, 40]);
  assert.deepEqual(outsideWorks.onBoardFixedPoints, []);
  assert.deepEqual(outsideWorks.allFixedPoints, [0]);

  const revengeAdded = evaluateGameShowBoard([0, 20, 30, 40]);
  assert.deepEqual(revengeAdded.onBoardFixedPoints, []);
  assert.deepEqual(revengeAdded.allFixedPoints, []);
});

test("10. Mode B (Reflexive Criterion Self-Application): Verificationism vs Popper, VD Question Fork, Deontic", () => {
  // Logical positivism / verificationism (verifiable / meaningful): COLLAPSE + 4 historical exits
  const ayer = evaluateCriterionCell({
    name: "Verificationism",
    proposedMask: REGIMES.REVERSE_NESTED.mask, // meaningful => verifiable
    selfApplies: true,
    itemConstraints: { requiresQ2Y: true, requiresQ1N: true },
  });
  assert.deepEqual(ayer.survivingX, []);
  assert.equal(ayer.outcome.code, "COLLAPSE");
  assert.deepEqual(
    ayer.exitMenu.map((e) => e.droppedRule).sort(),
    ["proposedMask", "requiresQ1N", "requiresQ2Y", "selfApplies"]
  );

  // Popper's falsificationism (falsifiable / scientific): same mask & Q1=N, but requiresQ2Y=false -> {NN} survives!
  const popper = evaluateCriterionCell({
    name: "Falsificationism",
    proposedMask: REGIMES.REVERSE_NESTED.mask, // scientific => falsifiable
    selfApplies: true,
    itemConstraints: { requiresQ2Y: false, requiresQ1N: true },
  });
  assert.deepEqual(popper.survivingX, ["NN"]);
  assert.equal(popper.outcome.code, "PINNED_BOTH");
  assert.equal(popper.exitMenu.length, 0);

  // VD Question Fork (question / has an answer): "every question has an answer" vs Liar-question
  const vdFork = evaluateCriterionCell({
    name: "VD Question Fork",
    proposedMask: REGIMES.NESTED.mask, // question => has an answer
    selfApplies: true,
    itemConstraints: { requiresQ1Y: true, requiresQ2N: true },
  });
  assert.deepEqual(vdFork.survivingX, []);
  const dropIsQuestion = vdFork.exitMenu.find((e) => e.droppedRule === "requiresQ1Y");
  const dropEveryHasAnswer = vdFork.exitMenu.find((e) => e.droppedRule === "proposedMask");
  assert.deepEqual(dropIsQuestion.survivingIfDropped, ["NN"]); // Can's VD branch: not a question
  assert.deepEqual(dropEveryHasAnswer.survivingIfDropped, ["YN"]); // Alternative: question with no answer

  // Deontic self-forbidding norm (obligatory / permissible, Axiom D = NESTED)
  const deontic = evaluateCriterionCell({
    name: "Deontic Self-Forbidding Norm",
    envMask: REGIMES.NESTED.mask, // obligatory => permissible
    itemConstraints: { requiresQ1Y: true, requiresQ2N: true },
  });
  assert.deepEqual(deontic.survivingX, []);
});

test("11. Three-Valued Revenge {Y, N, G} vs. Two-Arrow Disciplined-Interpreter Model", () => {
  const rev = evaluateRevenge();

  // Plain Liar-question in 3-valued logic
  assert.deepEqual(rev.plainLiarExclusion, []);
  assert.deepEqual(rev.plainLiarInfectiousGap, ["G"]);

  // Flat single-level Revenge ("Is the answer No, or is this gibberish?"): Priest's collapse
  assert.deepEqual(rev.revengeFlat, []);

  // Two-Arrow model (Meaning I ∈ {Y, N, ⊥}, Accuracy A ∈ {Y, N}):
  // Unconstrained allows unsound convergence or sound non-convergence
  assert.deepEqual(rev.twoArrowUnconstrained, [
    { I: "Y", A: "N" },
    { I: "N", A: "Y" },
    { I: "⊥", A: "Y" },
  ]);

  // Requiring Soundness uniquely pins (I = ⊥, A = Y) — Turing incompleteness, NO dialetheism!
  assert.deepEqual(rev.twoArrowSound, [{ I: "⊥", A: "Y" }]);

  // Adding Totality (I ≠ ⊥) yields ∅ — Sound + Total interpreter cannot exist
  assert.deepEqual(rev.twoArrowSoundAndTotal, []);
});
