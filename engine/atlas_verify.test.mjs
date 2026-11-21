import test from "node:test";
import assert from "node:assert/strict";
import {
  REGIMES,
  SHAPES,
  V4_TRANSFORMS,
  transformMask,
  evaluateCell,
  evaluateCriterionCell,
  checkCoupling,
  evaluateRevenge,
} from "./op_model_checker.mjs";

test("Atlas Row 6 & 7: Verificationism collapses (4 exits) while Popperian Falsificationism survives at {NN}", () => {
  // Ayer (1936/1946): meaningful => verifiable (REVERSE_NESTED), must be meaningful, fails verifiable
  const verificationism = evaluateCriterionCell({
    name: "Verification Principle",
    proposedMask: REGIMES.REVERSE_NESTED.mask,
    selfApplies: true,
    itemConstraints: { requiresQ2Y: true, requiresQ1N: true },
  });
  assert.deepEqual(verificationism.survivingX, []);
  assert.equal(verificationism.exitMenu.length, 4);
  const exitTargets = Object.fromEntries(
    verificationism.exitMenu.map((e) => [e.droppedRule, e.survivingIfDropped])
  );
  assert.deepEqual(exitTargets.selfApplies, ["NY"]); // Carnap meta-level rule
  assert.deepEqual(exitTargets.proposedMask, ["NY"]); // Reject verificationism
  assert.deepEqual(exitTargets.requiresQ1N, ["YY"]); // Ayer 1946: treat as analytic/stipulation
  assert.deepEqual(exitTargets.requiresQ2Y, ["NN"]); // Wittgenstein ladder: nonsensical

  // Popper (1934/1959): scientific => falsifiable (REVERSE_NESTED), methodological convention (requiresQ2Y=false)
  const falsificationism = evaluateCriterionCell({
    name: "Falsifiability Demarcation",
    proposedMask: REGIMES.REVERSE_NESTED.mask,
    selfApplies: true,
    itemConstraints: { requiresQ2Y: false, requiresQ1N: true },
  });
  assert.deepEqual(falsificationism.survivingX, ["NN"]);
  assert.equal(falsificationism.exitMenu.length, 0);
});

test("Atlas Row 9 (Unrun VD Pair #2): Question / Truth Value under Disjointness is polarity-dual to Nested and peaceful", () => {
  // Disjointness: ¬(Q1 ∧ Q2) -> bans YY -> mask {YN, NY, NN}
  const disjointMask = ["YN", "NY", "NN"];
  const flipQ2 = V4_TRANSFORMS.find((t) => t.name === "flipQ2");
  // Flipping Q2 ("has truth value" <-> "lacks truth value") maps Disjoint directly onto NESTED!
  assert.deepEqual(transformMask(disjointMask, flipQ2), REGIMES.NESTED.mask);

  // Under Disjointness:
  // A declarative stating the rule ("No question has a truth value", Q1=N) can carry a truth value -> {NY, NN}
  const declarativeRule = evaluateCriterionCell({
    name: "Declarative statement of disjointness",
    proposedMask: disjointMask,
    selfApplies: true,
    itemConstraints: { requiresQ1N: true, requiresQ2Y: true },
  });
  assert.deepEqual(declarativeRule.survivingX, ["NY"]);

  // Asked as a question ("Does any question have a truth value?", Q1=Y) -> forced to lack a truth value ({YN})
  const interrogativeRule = evaluateCriterionCell({
    name: "Interrogative form of disjointness",
    proposedMask: disjointMask,
    selfApplies: true,
    itemConstraints: { requiresQ1Y: true },
  });
  assert.deepEqual(interrogativeRule.survivingX, ["YN"]);
});

test("Atlas Row 10 (Unrun VD Pair #3): Meno's Paradox (Inquiry / Already Knowing) collapses with 3 canonical exits", () => {
  // Horn 1 (Redundancy): cannot genuinely inquire into what you already know -> ¬(Q1 ∧ Q2) = {YN, NY, NN}
  // Horn 2 (Recognition): genuine inquiry requires knowing what you seek -> Q1 ⇒ Q2 = {YY, NY, NN}
  const horn1Disjoint = ["YN", "NY", "NN"];
  const horn2Nested = REGIMES.NESTED.mask; // ["YY", "NY", "NN"]

  // Without Meno's own question (no requiresQ1Y), Horn 1 ∩ Horn 2 forces Q1 ≡ N ({NY, NN}): no inquiry possible!
  const menoNoWitness = evaluateCriterionCell({
    name: "Meno's Two Horns (before witness)",
    envMask: horn1Disjoint,
    proposedMask: horn2Nested,
    selfApplies: true,
    itemConstraints: {},
  });
  assert.deepEqual(menoNoWitness.survivingX, ["NY", "NN"]);
  assert.equal(menoNoWitness.outcome.code, "FORCED_Q1");

  // Add Meno's performative witness (asking a genuine question: requiresQ1Y) -> COLLAPSE (∅)!
  const menoCollapse = evaluateCriterionCell({
    name: "Meno's Paradox (with witness question)",
    envMask: horn1Disjoint,
    proposedMask: horn2Nested,
    selfApplies: true,
    itemConstraints: { requiresQ1Y: true },
    labels: {
      envMask: "Horn 1: cannot inquire into what you already know (¬(Q1 ∧ Q2))",
      proposedMask: "Horn 2: inquiry requires knowing the answer (Q1 ⇒ Q2)",
      requiresQ1Y: "Witness: genuine inquiry occurs (Q1(x) = Y)",
    },
  });
  assert.deepEqual(menoCollapse.survivingX, []);

  const exits = Object.fromEntries(
    menoCollapse.exitMenu.map((e) => [e.droppedRule, e.survivingIfDropped])
  );
  // Exit 1 (Eristic Sophist): drop witness -> {NY, NN} (no genuine inquiry)
  assert.deepEqual(exits.requiresQ1Y, ["NY", "NN"]);
  // Exit 2 (Plato's Anamnesis): drop/split Horn 1 -> {YY} (inquire into what you implicitly already know)
  assert.deepEqual(exits.envMask, ["YY"]);
  // Exit 3 (VD / Verifier-vs-Solver): drop Horn 2 -> {YN} (inquire without knowing answer, via verification procedure)
  assert.deepEqual(exits.proposedMask, ["YN"]);
});

test("Atlas Row 11: VD Defined / Meaningful & The Chain's Two-Arrow response to Priest's Revenge", () => {
  const rev = evaluateRevenge();
  // Flat 1-level collapses
  assert.deepEqual(rev.revengeFlat, []);
  // Sound disciplined interpreter avoids dialetheism by non-convergence (⊥)
  assert.deepEqual(rev.twoArrowSound, [{ I: "⊥", A: "Y" }]);
  // Sound + total interpreter collapses (Turing/Gödel boundary)
  assert.deepEqual(rev.twoArrowSoundAndTotal, []);
});

test("Atlas Row 12: Deontic Logic (Obligatory / Permissible) under Axiom D", () => {
  // Axiom D: obligatory => permissible (NESTED)
  // Totalitarian rule ("everything permissible is obligatory", REVERSE_NESTED) collapses system to MIRROR
  const totalitarian = evaluateCriterionCell({
    name: "Deontic Totalitarian Norm",
    envMask: REGIMES.NESTED.mask,
    proposedMask: REGIMES.REVERSE_NESTED.mask,
    selfApplies: true,
  });
  assert.deepEqual(totalitarian.survivingX, ["YY", "NN"]); // no merely permissible acts

  // Nihilist prohibition ("nothing is permissible", Q2=N) forces nothing is obligatory ({NN})
  const nihilist = evaluateCriterionCell({
    name: "Nothing Permissible",
    envMask: REGIMES.NESTED.mask,
    itemConstraints: { requiresQ2N: true },
  });
  assert.deepEqual(nihilist.survivingX, ["NN"]);

  // Self-forbidding norm ("obeying this obligatory rule is forbidden") -> COLLAPSE
  const selfForbidding = evaluateCriterionCell({
    name: "Self-Forbidding Norm",
    envMask: REGIMES.NESTED.mask,
    itemConstraints: { requiresQ1Y: true, requiresQ2N: true },
  });
  assert.deepEqual(selfForbidding.survivingX, []);
});

test("Atlas Row 13: Constitutional Entrenchment vs. Omnipotent Amendment Clause (Ross 1969 / Suber 1990)", () => {
  // Static entrenchment conflict:
  //   Rule A (Omnipotent amendment clause): every valid constitutional rule is amendable (Q2 ⇒ Q1 = REVERSE_NESTED)
  //   Clause x (Entrenched clause): x is valid (Q2=Y) AND irrevocable/unamendable (Q1=N)
  const entrenchmentConflict = evaluateCriterionCell({
    name: "Omnipotent Amendment vs. Entrenched Clause",
    proposedMask: REGIMES.REVERSE_NESTED.mask, // valid => amendable
    selfApplies: true,
    itemConstraints: { requiresQ2Y: true, requiresQ1N: true },
  });
  assert.deepEqual(entrenchmentConflict.survivingX, []);
  // Exits: deny clause validity (NN), deny omnipotence/self-application (NY), or deny irrevocability (YY)
  assert.deepEqual(
    entrenchmentConflict.exitMenu.map((e) => e.droppedRule).sort(),
    ["proposedMask", "requiresQ1N", "requiresQ2Y", "selfApplies"]
  );
});

test("Atlas Row 14: Scriven's Prediction Paradox (Publicly Predicted / Executed) mirrors Turing's D", () => {
  // Infallible public predictor: MIRROR (Q1 ⇔ Q2 = {YY, NN})
  // Contrarian Avoider: OPPOSITE (Q2 ⇔ ¬Q1 = {YN, NY})
  const scriven = evaluateCriterionCell({
    name: "Scriven's Prediction Paradox",
    envMask: REGIMES.MIRROR.mask,
    proposedMask: REGIMES.OPPOSITE.mask,
    selfApplies: true,
    labels: {
      envMask: "Infallible public predictor (Q1 ⇔ Q2)",
      proposedMask: "Contrarian Avoider defies any communicated prediction (Q2 ⇔ ¬Q1)",
    },
  });
  assert.deepEqual(scriven.survivingX, []);
  const exits = Object.fromEntries(
    scriven.exitMenu.map((e) => [e.droppedRule, e.survivingIfDropped])
  );
  // Drop predictor infallibility/publicity -> {YN, NY} (Avoider falsifies prediction)
  assert.deepEqual(exits.envMask, ["YN", "NY"]);
  // Drop Avoider's defiance or communication (selfApplies) -> {YY, NN} (Predictor succeeds)
  assert.deepEqual(exits.selfApplies, ["YY", "NN"]);
  assert.deepEqual(exits.proposedMask, ["YY", "NN"]);
});

test("Atlas Honest Non-Fits: Euthyphro is extensionally consistent; Hume is unconstrained FREE; syntax fails coupling", () => {
  // 1. Euthyphro (commanded by gods / pious): extensional MIRROR {YY, NN} has zero binary collapse!
  const euthyphro = evaluateCriterionCell({
    name: "Euthyphro Extensional Biconditional",
    proposedMask: REGIMES.MIRROR.mask,
    selfApplies: true,
  });
  assert.deepEqual(euthyphro.survivingX, ["YY", "NN"]);
  assert.equal(euthyphro.outcome.code, "FORCED_AGREEMENT"); // consistent — tension is explanatory ("because"), not extensional

  // 2. Hume's Is-Ought: FREE regime with no self-referential bridge -> all 4 cells open
  const hume = evaluateCriterionCell({
    name: "Hume Is-Ought (no bridge rule)",
    envMask: REGIMES.FREE.mask,
    proposedMask: REGIMES.FREE.mask,
  });
  assert.deepEqual(hume.survivingX, ["YY", "YN", "NY", "NN"]);
  assert.equal(hume.outcome.code, "FREE");

  // 3. Trivial syntactic self-reference ("This sentence is not written in English") refused by coupling gate
  const syntaxTrivial = checkCoupling({
    mask: REGIMES.FREE.mask,
    shape: SHAPES.SD,
    independentQ1Pinned: true,
  });
  assert.equal(syntaxTrivial.coupled, false);
  assert.equal(syntaxTrivial.verdict, "REFUSED_TRIVIAL_1Q");
});
