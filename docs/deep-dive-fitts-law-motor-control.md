# Deep Dive: Fitts's Law & Motor Control as a Related Domain for ClickSense

*March 2026*

---

## The Core Insight: Fitts Ends Where ClickSense Begins

Fitts's Law models the **arrival phase** — how long it takes to move a cursor to a target. ClickSense models the **commitment phase** — what happens *after* the finger lands on the button. These are adjacent stages of the same decision-to-action pipeline, and the literature reveals a clean theoretical boundary between them.

The movement to a target decomposes into two phases (Woodworth, 1899; Meyer et al., 1988):

| Phase | Control Mode | What It Measures |
|-------|-------------|-----------------|
| **Ballistic** (open-loop) | Pre-programmed, no visual feedback | Motor confidence in target location |
| **Corrective** (closed-loop) | Feedback-driven, slow adjustments | Targeting precision under uncertainty |
| **Hold** (ClickSense) | Post-arrival, pre-release | *Commitment confidence* — "should I follow through?" |

Fitts's Law's `MT = a + b × log₂(2D/W)` accounts for phases 1 and 2. The constant `a` in most Fitts regressions absorbs the button-press time as a fixed overhead — it's treated as noise, not signal. ClickSense's contribution is recognizing that this "noise" is actually the richest part of the signal for cognitive state.

---

## What the Motor Control Literature Tells Us

### 1. The "Point of No Return" maps to mousedown

Motor control research identifies a ballistic stage (~44ms) after which a movement cannot be inhibited. In clicking, `mousedown` *is* this point of no return — the finger has committed to pressing. But the hold duration before `mouseup` reveals whether the *cognitive* commitment matches the *motor* commitment. A short hold (50-80ms) = cognitive and motor systems are aligned. A long hold (120ms+) = the motor system fired but the cognitive system is still deliberating.

This is a dissociation that Fitts's Law can't capture because it treats the click as instantaneous.

### 2. Approach dynamics are the corrective phase, made visible

The `enableApproachDynamics` feature in `clicksense.js` is essentially instrumenting the corrective sub-movement phase that Fitts modeled theoretically. The optimized dual-submovement model (Meyer et al., 1988) predicts that error in a submovement is proportional to velocity. The `approach_deceleration` and `approach_corrections` metrics directly operationalize this — more corrections = more uncertainty in targeting, steeper deceleration = more careful final approach.

### 3. Cursor kinematics literature validates the pre-click hesitation signal

The Attentive Cursor Dataset (Frontiers, 2020) and mouse-tracking cognition research (PMC, 2021) show that cursor trajectory deviations toward competing targets reflect the relative activation of response options during cognitive processing. Zimmermann et al. found that velocity changes during cursor movement correlate with arousal — the same arousal signal that produces longer ClickSense hold times on identity-relevant content.

The motivating research paper's finding that pre-click dwell discriminates correct/incorrect by 91ms (p < 10⁻²⁵) while click duration doesn't — this is exactly what Fitts-informed motor control theory predicts. The evaluation happens during approach (corrective phase); the commitment happens during hold. Different stages, different signals.

### 4. Input device confounds are biomechanical, not cognitive

The 2024 study on input devices (PMC) confirms what the ClickSense data shows: trackpad vs. mouse produces a ~16ms gap that's purely biomechanical. Fitts's Law research handles this by treating input device as a parameter of the movement model. ClickSense should do the same — normalize by device, then the cognitive signal emerges.

---

## The Three-Phase Model: Extending Fitts for ClickSense

```
STIMULUS → DECISION → APPROACH → ARRIVAL → COMMITMENT → RELEASE
           ←─ RT ──→  ←─ Fitts ──→          ←─ ClickSense ─→
                       ↑                      ↑
                       approach_velocity       duration_ms
                       approach_corrections
                       approach_deceleration
```

Each phase has distinct cognitive correlates:

| Phase | Duration | Cognitive Process | Measurable By |
|-------|----------|-------------------|---------------|
| Decision (RT) | 200-600ms | Option evaluation, Hick's Law | stimulus → mousedown (traditional RT) |
| Approach (Fitts) | 100-1000ms | Targeting, spatial planning | Movement time, cursor kinematics |
| Commitment (ClickSense) | 50-250ms | Identity processing, emotional load, commitment uncertainty | mousedown → mouseup |

The key insight: **these three signals are independent**. The motivating research notes that NASA-TLX doesn't correlate with click duration, and click duration doesn't predict correctness. That's because each phase taps a different layer:
- RT = deliberative evaluation (System 2)
- Approach kinematics = motor planning uncertainty
- Hold duration = pre-reflective motor hesitation at commitment

---

## Actionable Implications for ClickSense

### 1. Combine approach + hold for a richer "click confidence score"

Fitts's Law research shows that the corrective phase velocity profile is diagnostic of motor uncertainty. Approach dynamics + hold duration together capture the full commitment arc. A composite metric — something like `uncertainty_index = f(approach_corrections, approach_deceleration, duration_ms)` — would be more robust than either alone.

### 2. Control for Fitts difficulty to isolate the cognitive signal

If you know target size and approximate distance (which you could estimate from `approach_distance`), you can compute the expected Fitts movement time and subtract it. The residual = cognitive component. This is how you turn the 7ms task effect into something publishable — by showing it survives after Fitts-predicted variance is removed.

### 3. The `approach_pause_ms` metric is theoretically significant

A pause before clicking (hover-then-click) is the clearest signal of deliberation — the corrective phase is *over*, the user has acquired the target, and they're waiting to commit. This is distinct from a slow approach (still targeting) and from a long hold (committed but hesitating). The code already captures this. It may be the strongest single predictor.

### 4. Age confounds are Fitts confounds

The 87ms→137ms age gradient mirrors the well-documented age effect in Fitts's Law research (Zhang et al., 2024). Older adults have longer corrective phases and need more submovements. If you normalize by Fitts-predicted movement time (accounting for age-related motor slowing), the cognitive signal in hold duration may be *more* age-invariant than the raw latency suggests.

---

## Assessment: Is This a Paper?

From a Fitts's Law perspective, yes — there's a clear theoretical contribution. The HCI literature treats the button press as a constant absorbed into the intercept term. Nobody has systematically modeled what happens *between* mousedown and mouseup as a cognitive signal. The approach dynamics + hold duration combination gives a complete instrument for the full point-click pipeline that goes beyond what Fitts modeled.

The framing would be: **"Fitts's Law models the cost of getting there. ClickSense models the cost of following through."**

---

## Sources

- [Fitts's Law - Wikipedia](https://en.wikipedia.org/wiki/Fitts's_law)
- [Fitts's Law and Its Applications in UX - NN/g](https://www.nngroup.com/articles/fitts-law/)
- [Fitts' Law as a Research and Design Tool in HCI - MacKenzie (1992)](https://www.yorku.ca/mack/hci1992.html)
- [Issues Related to HCI Application of Fitts's Law - Taylor & Francis (2013)](https://www.tandfonline.com/doi/full/10.1080/07370024.2013.803873)
- [The Attentive Cursor Dataset - Frontiers (2020)](https://www.frontiersin.org/journals/human-neuroscience/articles/10.3389/fnhum.2020.565664/full)
- [Mouse cursor tracking to investigate online cognition - PMC (2021)](https://pmc.ncbi.nlm.nih.gov/articles/PMC8219569/)
- [Input device matters for behaviour in online experiments - PMC (2024)](https://pmc.ncbi.nlm.nih.gov/articles/PMC11604694/)
- [Age-related changes in motor planning - Zhang et al. (2024)](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2024.1323798/full)
- [Ballistic stage in coordinated eye-hand movements - PMC (2016)](https://pmc.ncbi.nlm.nih.gov/articles/PMC4922467/)
- [Mouse movements & user experience - Zimmermann et al.](https://www.researchgate.net/publication/254005206_Mouse_tracking_Measuring_and_predicting_users'_experience_of_web-based_content)
- [Fitts' Law with two or fewer submoves - PubMed (2016)](https://pubmed.ncbi.nlm.nih.gov/26731344/)
- [Mouse movements reflect personality traits - PMC (2023)](https://pmc.ncbi.nlm.nih.gov/articles/PMC10084322/)
