# ClickSense: Mousedown→Mouseup Latency as a Passive Measure of Commitment Uncertainty

**Andy Edmonds** · **Leif Azzopardi**

*Draft — March 2026*

---

## Abstract

We propose that mousedown-to-mouseup click duration — the time a finger holds a mouse button during a click — captures a distinct cognitive signal: **commitment uncertainty**. This "click confidence" metric occupies a unique position in the decision pipeline between pre-click evaluation (measurable via dwell time) and post-click behavior (measurable via bounce rate or dwell on target). While pre-click dwell time is a stronger signal per event, it requires target-level instrumentation and inference about when evaluation began. Click duration requires only two DOM events — mousedown and mouseup — making it deployable at planetary scale via a 2KB JavaScript library.

We present evidence from two studies: (1) a CrowdFlower-based experiment (n=291) measuring click latency on politically-charged factual and opinion questions, showing that self-reported domain expertise modulates click duration on domain-relevant facts, and that identity-relevant questions produce within-subject latency increases consistent with identity threat; and (2) a Prolific-based replication (n=227) using Perceptual Speed Tests, showing that click duration is dissociated from self-reported cognitive load (NASA-TLX), stable across independent samples, and confounded by input device type (mouse vs. trackpad).

We situate these findings within a theoretical framework bridging Information Foraging Theory (Pirolli & Card, 1999) and the microeconomics of attention (Simon, 1971; Azzopardi et al., 2013), proposing that click duration measures the **cost of commitment** at the moment of "prey capture" — a construct that neither framework currently operationalizes.

---

## 1. Introduction

### 1.1 The Unmeasured Moment

Every click on the web involves a decision pipeline with at least three temporal phases:

1. **Evaluation** — the user assesses the target (link, button, result). Measurable via eye tracking, mouse hover time, or scroll-to-click interval. Well-studied in information retrieval and HCI.

2. **Commitment** — the user initiates the motor act (mousedown) and must decide whether to complete it (mouseup). This phase is typically treated as instantaneous — a binary event (clicked / didn't click). It is not.

3. **Outcome** — the user experiences the consequence (page load, purchase confirmation, search result). Measurable via dwell time on target, bounce rate, or satisfaction surveys.

The evaluation phase is the focus of Information Foraging Theory (Pirolli & Card, 1999): users follow "information scent" — visual and textual cues that estimate the likelihood of finding valuable information. The outcome phase is the focus of search result quality metrics: precision, nDCG, satisfaction. But the commitment phase — the 50-250ms window between mousedown and mouseup — has received almost no attention.

This paper argues that click duration is not noise. It is a measurable cognitive signal that reflects the **unresolved cost-benefit analysis** at the moment of action commitment.

### 1.2 What Click Duration Is Not

Click duration (mousedown→mouseup) is distinct from several commonly studied metrics:

- **Reaction time** (stimulus→response): measures perception + decision + motor initiation. Click duration measures only the motor completion phase, *after* the decision to act.
- **Dwell time** (hover→click or arrival→click): measures evaluation duration. Click duration measures commitment duration.
- **Click-through rate**: measures whether the user clicked. Click duration measures *how* they clicked — with what degree of motor confidence.

The distinction matters because these signals respond to different variables. We show that click duration is insensitive to factors that strongly affect dwell time (e.g., correctness of lexical decisions) but sensitive to factors that don't affect dwell time or self-report (e.g., identity-relevant content, domain expertise).

### 1.3 The Biomechanics of a Click

A mouse click is a ballistic motor act with two phases (Woodworth, 1899):

- **Ballistic phase**: The motor cortex issues a pre-programmed flexion command. The finger descends and contacts the switch. If no correction is needed, the extension command follows immediately, producing a click of 50-80ms.
- **Corrective phase**: If the brain detects conflict — uncertainty about the target, ambiguity about the action's consequences, or emotional arousal — the extension command is delayed. The finger remains pressed while conflict resolution proceeds. This produces clicks of 100-250ms.

The ballistic-corrective framework (Fitts, 1954; Woodworth, 1899) has been extensively studied for *targeting* (moving the cursor to a target), but not for *committing* (pressing and releasing the button once the cursor is on target). Fitts's Law predicts movement time to the target. ClickSense measures what happens after arrival.

---

## 2. Theoretical Framework

### 2.1 Information Foraging and the Commitment Gap

Information Foraging Theory (IFT; Pirolli & Card, 1999) models web users as cognitive foragers navigating an information ecology. The core constructs:

- **Information scent**: Cues (link text, thumbnails, snippets) that signal the probability of finding valuable information.
- **Patches**: Concentrated information sources (websites, search result pages, feeds).
- **Diet selection**: Choosing which information types to pursue based on expected return rate.
- **Patch-leaving**: Abandoning the current patch when the instantaneous rate of return drops below the environmental average (Charnov, 1976).

IFT provides powerful predictions about navigation behavior — which links users follow, when they leave a page, how they reformulate queries. But it treats the click itself as instantaneous: the forager either captures the prey or moves on. The *duration* of the capture is not modeled.

We propose that click duration fills this gap. In ecological terms, it measures the **handling time** at the moment of capture — specifically, the component of handling time that reflects uncertainty about whether the prey is worth consuming. A confident forager captures quickly (ballistic click). An uncertain forager hesitates mid-capture (extended hold).

### 2.2 Attention Economics and Commitment Cost

Microeconomic theories of attention (Simon, 1971; Goldhaber, 1997; Azzopardi et al., 2013) model information consumption as economic exchange. Attention is a scarce resource; every click is a transaction where the user "pays" time and cognitive effort for information or outcomes.

In this framework, the click is not just a navigational act — it is an **investment decision** with associated costs:

- **Direct cost**: The time to load the target page and evaluate it.
- **Opportunity cost**: The other links not clicked, the other queries not issued.
- **Setback cost**: If the target is irrelevant, the user must back-navigate and resume scanning, losing accumulated context (Azzopardi et al., 2013).

Click duration, we propose, reflects the user's real-time computation of these costs. When the expected cost is low and certain (familiar navigation link), the motor program fires ballistically. When the expected cost is uncertain or high (unfamiliar CTA, ambiguous search result, high-stakes purchase), the corrective phase engages, extending the hold.

### 2.3 The Ski Jump: Commitment Cost at Patch Boundaries

A concrete example of commitment cost in search behavior is the "ski jump" — the empirical finding that click-through rate at the final rank on a search results page is higher than at the penultimate rank (Edmonds, observed at MSN Search, eBay, Redbubble, Adobe.com; personal communications suggest Google observed this as well).

Standard cascade models of search behavior (Craswell et al., 2008) predict monotonically decreasing click probability with rank. The ski jump violates this prediction. Azzopardi et al. (2013) proposed an economic explanation: at the final rank, the user faces a cost discontinuity. The alternative to clicking rank 10 is not "evaluate rank 11" (cheap, within-patch) but "load page 2" (expensive, between-patch) or "reformulate query" (very expensive, new foraging trail). This inflated cost of *not* clicking makes rank 10 relatively more attractive, producing the uptick.

If click duration captures commitment cost, it should also reflect this discontinuity. We predict that click duration at the final visible rank should be *longer* than at preceding ranks — not because the result is worse, but because the commitment decision is more consequential. The forager pauses mid-capture to evaluate the cost of this specific prey against the cost of traveling to the next patch.

This prediction is testable with ClickSense deployed on any search results page and has not yet been empirically tested.

### 2.4 The Three-Layer Model

Synthesizing IFT and attention economics, we propose a three-layer model of the click decision:

| Layer | Phase | Temporal window | What it measures | Primary signal |
|-------|-------|----------------|-----------------|----------------|
| **Evaluation** | Pre-click | 500ms-seconds | Scent assessment, information foraging | Dwell time, eye fixation |
| **Commitment** | During click | 50-250ms | Cost-benefit resolution, identity processing | **Click duration (ClickSense)** |
| **Outcome** | Post-click | Seconds-minutes | Satisfaction, patch quality | Bounce rate, dwell on target |

Each layer measures a different cognitive process and responds to different variables. The commitment layer is the only one that:
- Requires no target-level instrumentation (just two DOM events)
- Captures pre-reflective motor hesitation (dissociated from self-report)
- Operates at the moment of action, not before or after

---

## 3. Study 1: Political Fact Questions (Edmonds, 2015)

### 3.1 Method

**Participants**: 291 workers recruited via CrowdFlower (now Appen) crowdsourcing platform, October 2015. Workers with trust scores below 0.85 were excluded (per filename convention). 191 workers had valid latency measurements (latency capture was incomplete in early CrowdFlower implementation).

**Stimuli**: 10 statements presented one at a time. Participants clicked "Agree" or "Disagree" for each statement. Click latency (mousedown→mouseup) was captured via JavaScript.

The statements fell into three categories:

**Factual** (verifiable true/false):
- "Barrack Obama is the current president." (True; low obscurity)
- "The DC in Washington DC stands for District of Columbia." (True; low obscurity)
- "John Biden ran for president in 1988." (True; moderate obscurity)
- "Hilary Clinton was a senator for the state of Maryland." (False — New York; moderate obscurity)

**Opinion/Prediction** (no objectively correct answer):
- "Donald Trump would be an effective US President."
- "Hilary Clinton will win the next presidential election."
- "The environment is one of the top 3 issues which will drive the presidential election outcome."

**Self-Report** (used as between-subject moderators):
- "I am well-informed on current national US politics." (expertise self-report)
- "I voted in the last presidential election." (behavioral marker)
- "I will vote in the next presidential election." (future intent / commitment)

### 3.2 Overall Distribution

Across all valid latencies (N=1,520), the distribution was:
- Median: 118ms
- IQR: 64-167ms (15th-85th percentile)
- Range: 1-628ms

Per-question medians clustered tightly between 116-126ms across all 10 questions, falling at the boundary between the Normal (80-120ms) and Deliberative (120-160ms) bands.

### 3.3 Expertise × Question Type Interaction

Participants who agreed with "I am well-informed on current national US politics" (n=214) were classified as self-reported experts; those who disagreed (n=77) as non-experts.

**Between-group comparison**: Self-reported experts were faster than non-experts across all question types (~8ms on average). This main effect likely reflects a confound: engaged, politically interested workers may also be more experienced with crowdsourcing interfaces, producing generally faster motor execution.

**Within-group differentiation** (the interaction): Self-reported experts showed differential latencies across question types — slightly slower on factual questions than on opinion questions (median Δ ≈ +4ms, filtered 50-180ms). Non-experts showed no such differentiation, clicking at approximately equal speed on facts and opinions.

*Interpretation*: Experts engage their knowledge schemas on fact questions — the click involves retrieval verification ("do I actually know this?"), which is an informational process, not guessing. On opinion questions, experts fire System 1: they already know what they think. Non-experts treat all questions similarly because they lack the knowledge structures that would differentiate fact-retrieval from opinion-expression.

This effect is small (4ms) and should be treated as suggestive pending replication with larger samples and more complete latency capture.

### 3.4 Non-Voter Identity Effect

Participants who disagreed with "I voted in the last presidential election" (n=63) were classified as non-voters.

**Within non-voter comparison**:
- "I voted in the last presidential election": median 103-108ms (factual recall — they know the answer, no conflict)
- "I will vote in the next presidential election": median 122-125ms (**+19ms**, identity commitment)

This +19ms within-subject delta was consistent across all filtering strategies (50-200ms, 50-180ms, 50-160ms). The population-level gap between these two questions (for all respondents) is approximately 8-10ms, suggesting that non-voters show a disproportionately large increase on the future voting question.

*Interpretation*: "I voted last election" is backward-looking factual recall with no identity cost — clicking "No" costs nothing, the past is fixed. "I will vote next election" is forward-looking commitment that confronts the non-voter's civic identity. Clicking "Yes" is an aspirational commitment that conflicts with past behavior (cognitive dissonance). Clicking "No" is an admission of continued disengagement (identity threat). Both options carry identity cost, extending the hold phase.

*Limitations*: Cell sizes are small (n=19-28 for non-voters with valid latency), and the comparison is across different questions, introducing item-level confounds. The effect direction is consistent but statistical significance has not been formally tested.

### 3.5 Study 1 Summary

The CrowdFlower data provides suggestive evidence for two interaction effects:
1. **Expertise × question type**: Experts differentiate facts from opinions in click latency; non-experts do not.
2. **Voting history × future intent**: Non-voters show elevated latency on future voting commitment, consistent with identity threat.

Both effects are small and underpowered in this dataset. The original study was designed as a proof-of-concept for the ClickSense measurement methodology, not as a fully-powered experimental test of these interactions. Complete latency capture was available for only ~52% of responses, reducing statistical power. **The full CrowdFlower source data should be retrieved for a more complete analysis.**

---

## 4. Study 2: Perceptual Speed Tests (Azzopardi & Edmonds, 2022)

### 4.1 Method

**Participants**: 259 participants recruited via Prolific, April 2022. After excluding touchscreen users (n=11) and participants with all-zero latency data, 227 participants were retained for the click test analysis and 208 for the word search analysis.

**Platform**: treconomics experimental platform (Azzopardi, University of Strathclyde, i2lab).

**Tasks**:

*Click Test* (baseline): Participants clicked a button 30 times. No cognitive demand — this measures pure motor execution variability. Each click's mousedown→mouseup duration was recorded in milliseconds.

*Word Search* (cognitive load): Participants viewed a grid of real English words and pseudo-words (e.g., "contrivial", "horozone", "stimulcrate"). They clicked on items they identified as real words. For each click, the following were recorded:
- `click_times`: mousedown→mouseup duration
- `enter_click_times`: time from mouse entering the word's bounding box to mousedown (pre-click dwell)
- `leave_click_times`: time from mouseup to mouse leaving the bounding box (post-click dwell)
- `word_times`: word identity, correctness, and click duration per selection

**Additional measures**:
- *NASA Task Load Index* (NASA-TLX): Self-reported mental demand, physical demand, temporal demand, performance, effort, and frustration after each task.
- *Cognitive Demographics Survey*: Age, sex, education, language, device type, input device (mouse/trackpad/touchscreen).

### 4.2 Overall Distribution

**Click test** (N=6,691 clicks from 227 participants):
- Median: 95ms
- Mean: 128ms (right-skewed, pulled by tail)
- IQR: 78-121ms
- 95th percentile: 222ms

Band distribution:
| Band | Range | % of clicks |
|------|-------|-------------|
| Sub-ballistic | <50ms | 3.4% |
| Ballistic | 50-80ms | 23.8% |
| Normal | 80-120ms | **46.6%** |
| Deliberative | 120-160ms | 16.0% |
| Conflicted | 160-250ms | 6.5% |
| Unusual | >250ms | 3.2% |

The plurality of clicks fall in the Normal band. The right-skewed shape (skew=16.1) is characteristic of a process where most executions are ballistic but a minority involve deliberation or distraction.

### 4.3 Task Effect: Click Test vs. Word Search

Paired within-subject comparison (participants who completed both tasks):
- Click test median of participant medians: 94ms
- Word search median of participant medians: 101ms
- Wilcoxon signed-rank: W=6,726, **p=0.0007**
- 56.1% of participants clicked slower during word search

The word search produces statistically significantly longer click durations (+7ms). However, the effect size is small relative to other sources of variance (device type, age, individual differences).

### 4.4 The Pre-Click Dwell Dissociation

The word search task provides a critical comparison between click duration and pre-click dwell time:

| Measure | Correct selections | Incorrect selections | Δ | p |
|---------|-------------------|---------------------|---|---|
| Pre-click dwell (enter_click_time) | 532ms | 623ms | **+91ms** | 2.7e-25 |
| Click duration (mousedown→mouseup) | 97ms | 98ms | +1ms | 0.38 (n.s.) |

Pre-click dwell strongly discriminates between correct and incorrect selections. Click duration does not.

*Interpretation*: In the word search, the cognitive work — lexical decision, visual search, candidate evaluation — happens before the click. By the time the user presses the mouse button, they have already resolved the question "is this a real word?" The click is a motor execution of a completed decision, not an ongoing deliberation.

This null result does not invalidate the click duration signal. It establishes a **boundary condition**: click duration captures commitment uncertainty, not cognitive load in general. When the commitment itself is costless (clicking a word in a grid carries no penalty for error), the hold phase does not extend. When the commitment carries cost — financial (purchase), navigational (page load), or identity-relevant (political self-disclosure) — the hold phase should extend proportionally to the unresolved cost.

### 4.5 NASA-TLX Dissociation

Self-reported cognitive load (NASA-TLX) showed no meaningful correlation with click duration:

| TLX Dimension | Spearman r | p |
|---------------|-----------|---|
| Mental demand | -0.078 | 0.243 |
| Physical demand | -0.142 | 0.033 |
| Temporal demand | +0.077 | 0.250 |
| **Performance** | **-0.213** | **0.001** |
| Effort | -0.061 | 0.365 |
| Frustration | +0.045 | 0.500 |

Only performance self-assessment correlated with click duration: participants who rated their performance higher clicked faster. This likely reflects a general motor confidence factor rather than a direct relationship between perceived load and click mechanics.

*Interpretation*: NASA-TLX and click duration measure different constructs. The TLX captures conscious, retrospective evaluation of task difficulty. Click duration captures pre-reflective motor hesitation. The dissociation confirms that click duration accesses a level of processing that self-report cannot reach — the same level where the Bloomreach identity effects operate.

### 4.6 Input Device Confound

| Device | n | Median | Mean | IQR |
|--------|---|--------|------|-----|
| Mouse | 148 | 88.5ms | 94ms | 80-110ms |
| Trackpad | 84 | 104.5ms | 144ms | 83-136ms |

Mann-Whitney: U=4,634, **p=0.001**, rank-biserial r=0.255.

The 16ms device gap exceeds the 7ms task effect. This is biomechanically grounded: mouse clicks involve isolated finger flexion against a spring-loaded switch; trackpad clicks involve whole-hand pressure against a rigid surface (or Force Touch haptic). The motor programs differ in release dynamics.

*Implication*: Any deployment of click confidence sensing must either (a) normalize per device type, (b) restrict to single device type, or (c) use device-specific baselines. ClickSense currently does not detect device type; this should be added.

*Polling rate note*: Device differences extend beyond biomechanics to sampling rate. Standard USB mice report at 125Hz (8ms intervals), while trackpads report via USB HID or Bluetooth at comparable or lower rates. This means the 16ms device gap includes both biomechanical differences (spring-loaded switch vs. rigid surface) and measurement quantization differences. ClickSense uses `performance.now()` for timestamps, but the temporal resolution of the *input events themselves* is bounded by the device polling rate, not the timer.

### 4.7 Demographic Effects

**Age** (Kruskal-Wallis H=20.83, p=0.0009): Clear gradient from 25-34 (87ms) to 65+ (137ms), reflecting age-related motor slowing.

**Sex** (Mann-Whitney p=0.004): Male 88.5ms, Female 103ms. Likely confounded with device choice.

**Education**: No significant effect.

### 4.8 Replication Across Samples

The 2021 pilot (n=13, median 89ms) and 2022 replication (n=227, median 95ms) showed no significant difference (Mann-Whitney p=0.34), confirming distributional stability across independent samples.

---

## 5. ClickSense: Implementation

ClickSense is implemented as a 2KB JavaScript library that captures mousedown→mouseup and touchstart→touchend latency on every click.

### 5.1 Design Principles

- **Two events, any page**: Only mousedown/mouseup (or touch equivalents). No target instrumentation required.
- **Vendor-agnostic**: Core library has no analytics dependency. Adapters for PostHog, Adobe Analytics, or custom callbacks.
- **Capture phase**: Event listeners use capture phase to see events before stopPropagation.
- **Sub-millisecond timing**: Uses `performance.now()`, not `Date.now()`.
- **Drag filtering**: Movements >10px between mousedown and mouseup are classified as drags and excluded.
- **Target inference**: DOM walk to nearest meaningful element (link, button, role="button", input, select, or any element with `data-clicksense` attribute).
- **Build**: esbuild → IIFE (script tag), ESM (import), CJS (test/SSR).

### 5.2 Enrichment: Mouse Velocity Harvesting

A planned extension records mouse velocity continuously in a ring buffer and "harvests" the recent velocity profile when a click occurs. This adds pre-click approach dynamics to the event:

- **Approach velocity**: Fitts's Law predicts the deceleration curve. Deviations from predicted deceleration may indicate target uncertainty.
- **Corrective submovements**: Jittery corrections before mousedown suggest uncertain targeting.
- **Final velocity at mousedown**: High approach velocity + long hold = "I found it quickly but I'm not sure." Low velocity + fast click = "I was careful getting here and I know what I want."

This turns each click event from a single number (hold duration) into a compact velocity profile (~4 summary statistics), enriching the signal without significantly increasing event payload.

### 5.3 Deployment

ClickSense is currently deployed on:
- scrutinizer-www (8 pages, PostHog adapter)
- psychodeli-webgl-port (3 pages, PostHog adapter, deferred init)

With `data-clicksense` labels on key CTAs: `hero-get-started`, `hero-learn-science`, `download-macos`, `view-source`, `get-figma-plugin`, `launch-calibrator`, `download-mac-app`.

Source: https://github.com/andyed/clicksense

---

## 6. Click Confidence as a Within-Subject Longitudinal Signal

The findings from Study 2 emphasize that between-person variability (device type ±16ms, age ±50ms, individual motor habits) far exceeds between-task variability (±7ms). This might seem to undermine click duration as a useful metric. It does the opposite — it defines the appropriate use case.

Click confidence works best as a **personalized, within-subject signal**. A user's baseline click duration (established over their first 30-50 clicks on a site) provides a reference against which subsequent clicks can be compared. A 15ms increase from User X's personal baseline is diagnostic even though it falls within the population's Normal range.

This is analogous to heart rate monitoring: a resting HR of 72 bpm means nothing in isolation, but a spike to 95 bpm while reading an email tells you something about that email's emotional content.

### 6.1 Applications of the Within-Subject Approach

**Checkout flow monitoring**: Track a user's click confidence across the steps of a purchase flow. Monotonically increasing hold times indicate accumulating friction — the user is becoming less sure with each step.

**A/B testing**: Same CTA, different copy. Compare the distribution of click durations, not just click-through rate. A variant with higher CTR but longer hold times may be producing less confident conversions (higher return/refund risk).

**Content engagement**: On editorial sites, click confidence on navigation links indicates whether the information architecture matches user expectations. Fast clicks = clear mental model. Slow clicks = confusion.

**Session-level fatigue**: Click confidence over a session reveals the learning curve (decreasing latency as orientation load decays) and fatigue onset (increasing latency as cognitive resources deplete).

---

## 7. Discussion

### 7.1 What Click Duration Measures

The evidence across both studies points to a specific construct: **commitment uncertainty** — the unresolved cost-benefit analysis that persists after the decision to act but before the action is finalized.

Click duration does not measure:
- Task difficulty (the word search null result on correctness)
- Cognitive load in general (the NASA-TLX dissociation)
- Decision speed (that's reaction time, stimulus→mousedown)

Click duration does measure:
- Motor confidence in the action being taken (the task effect in Study 2)
- Identity-relevant processing that extends the motor hold phase (the expertise and voting effects in Study 1)
- The biomechanical residue of cost computation at the moment of commitment

### 7.2 Relationship to Information Foraging Theory

IFT models the evaluation phase comprehensively but treats the click as binary. ClickSense adds a continuous variable to the moment of capture. In foraging terms, click duration is the **capture latency** — analogous to the handling time at the moment a predator's jaws close on prey.

The prediction that click duration should increase at patch boundaries (the ski jump hypothesis, §2.3) is a direct consequence of this framing: the cost of capture is computed relative to the cost of continued foraging, and patch boundaries introduce cost discontinuities that should manifest as motor hesitation.

### 7.3 Relationship to Attention Economics

Attention economics models the click as a transaction. ClickSense measures the **transaction latency** — how long the buyer hesitates before completing the purchase. This latency is proportional to the perceived risk of the transaction: low risk (navigating a familiar menu) → ballistic. High risk (committing to a purchase, disclosing political identity) → extended hold.

### 7.4 Limitations

1. **CrowdFlower latency capture was incomplete** (~52% of responses). Study 1 should be replicated with full latency capture (the source data on CrowdFlower/Appen should be retrieved for a more complete analysis).
2. **Input device confound** (16ms) exceeds the task effect (7ms). Device detection and normalization are needed.
3. **Touch events are incompatible** — touchstart→touchend measures a physically different gesture. Mobile deployment requires separate baseline calibration.
4. **The word search is a low-commitment task** — the null correctness result establishes a boundary condition but does not test click duration in high-commitment contexts (purchases, navigation with cost). Live deployment data from Scrutinizer and Psychodeli will address this.
5. **The expertise and voting effects are suggestive but underpowered**. Cell sizes of 19-42 are insufficient for reliable effect estimation. These interactions need replication in a properly powered design.

### 7.5 Measurement Precision and Polling Rates

A fundamental constraint on click duration measurement is that input events are temporally quantized by the device's USB polling rate. This quantization sets a floor on the precision of any single click measurement, regardless of timer resolution.

**Polling rate quantization.** Standard USB mice poll at 125Hz, meaning the host receives position and button-state updates every 8ms. Budget mice may poll at 62.5Hz (16ms intervals). Gaming mice typically poll at 250-1000Hz (4ms-1ms). A "true" 90ms click on a 125Hz mouse might register as 88ms or 96ms depending on where the mousedown and mouseup transitions fall within the polling cycle. The worst-case quantization error per event is ±1 polling interval, so a single click duration measurement on a standard mouse has an inherent uncertainty of roughly ±8ms.

**Browser timer resolution.** ClickSense uses `performance.now()`, which offers approximately 5µs resolution on most browsers (post-Spectre mitigations reduced this from sub-microsecond to ~5µs or ~100µs depending on browser and context). This is more than adequate — the bottleneck is not the clock but the input event stream. The browser can timestamp the mousedown and mouseup events with sub-millisecond precision, but it cannot observe button transitions that occur between polling updates. The measured duration is the interval between the polling frames that first reported the button-down and button-up states.

**Implications for reported effect sizes.** This quantization has direct consequences for interpreting the effects reported in this paper:

- The 4ms expertise differentiation in Study 1 (§3.3) and the 7ms task effect in Study 2 (§4.3) are *below* the single-click measurement floor for standard 125Hz mice. These effects are only detectable as **distributional shifts across many clicks**, where quantization errors average out across observations. A 4ms effect measured over n=200 clicks has a standard error from quantization noise alone of roughly 8ms/√200 ≈ 0.57ms, making it statistically recoverable despite being smaller than any single measurement's precision.

- The 16ms device confound (§4.6), the 19ms non-voter identity effect (§3.4), and the large demographic effects (age: ±50ms) all exceed the 8ms quantization floor and are detectable even in moderately-sized samples.

The general principle: effects below the polling interval require large N to emerge from quantization noise; effects above the polling interval are robust to it.

**Minimum sample sizes to overcome quantization noise.** With 8ms quantization (125Hz polling), detecting a true 10ms effect at p<0.05 (two-tailed) with 80% power requires approximately N≥50 clicks per condition, where quantization contributes roughly 8ms/√N standard error. For a 5ms effect, the requirement rises to N≥200 per condition. These estimates assume quantization is the dominant noise source, which it is not — motor variability within a person (SD typically 30-50ms) contributes more noise than polling quantization. But quantization adds an irreducible floor to measurement precision that no amount of software optimization can eliminate.

**The `getCoalescedEvents()` opportunity.** For the mouse velocity harvesting extension (§5.2), `MouseEvent.getCoalescedEvents()` provides access to intermediate mouse movement events that were coalesced into a single frame's event delivery. This can partially overcome polling limitations for velocity computation by exposing sub-frame position updates that the browser batched for efficiency. However, `getCoalescedEvents()` applies only to mousemove events, not to mousedown/mouseup transitions — it does not improve click duration precision, only approach dynamics measurement.

**CrowdFlower timer caveat.** The 2015 CrowdFlower data (Study 1) was collected using `Date.now()`, which has a nominal resolution of 1ms but is subject to operating system clock quantization. On Windows systems — which likely constituted a majority of CrowdFlower workers — the system clock resolution defaults to 15.625ms (64Hz), meaning `Date.now()` advances in steps of approximately 15-16ms. This may partly explain the tight clustering of per-question medians observed in §3.2 (116-126ms across all 10 questions): if measurements are quantized to ~16ms steps, apparent distributional differences are compressed. The Study 2 data (Prolific, 2022) used `performance.now()` and is not affected by this limitation.

### 7.6 Future Work

1. **Ski jump validation**: Deploy ClickSense on search result pages (Adobe.com, Stock.Adobe.com) and test whether click duration at the final visible rank exceeds that at preceding ranks.
2. **Mouse velocity harvesting**: Enrich the click event with pre-click approach dynamics (§5.2).
3. **Cross-site comparison**: Analyze click duration distributions across editorial (Scrutinizer blog), transactional (Scrutinizer download), and creative (Psychodeli) contexts to test the commitment-cost theory.
4. **Powered replication of interaction effects**: Design an experiment specifically testing expertise × domain relevance and identity threat × commitment cost, with full latency capture and adequate cell sizes (n≥50 per condition).
5. **Device normalization**: Develop and validate per-device-type baseline calibration for ClickSense.

---

## References

Azzopardi, L., Thomas, P., & Craswell, N. (2013). Measuring the utility of search engine result pages. In *Proceedings of the 36th International ACM SIGIR Conference on Research and Development in Information Retrieval*.

Charnov, E. L. (1976). Optimal foraging, the marginal value theorem. *Theoretical Population Biology*, 9(2), 129-136.

Craswell, N., Zoeter, O., Taylor, M., & Ramsey, B. (2008). An experimental comparison of click position-bias models. In *Proceedings of WSDM '08*.

Fitts, P. M. (1954). The information capacity of the human motor system in controlling the amplitude of movement. *Journal of Experimental Psychology*, 47(6), 381-391.

Goldhaber, M. H. (1997). The attention economy and the net. *First Monday*, 2(4).

Kahneman, D. (2011). *Thinking, Fast and Slow*. Farrar, Straus and Giroux.

Klein, G. A. (1998). *Sources of Power: How People Make Decisions*. MIT Press.

Pirolli, P., & Card, S. (1999). Information foraging. *Psychological Review*, 106(4), 643-675.

Simon, H. A. (1971). Designing organizations for an information-rich world. In M. Greenberger (Ed.), *Computers, Communications, and the Public Interest*. Johns Hopkins University Press.

Woodworth, R. S. (1899). The accuracy of voluntary movement. *The Psychological Review: Monograph Supplements*, 3(3), i-114.

---

*Draft prepared March 2026. Data from Edmonds (CrowdFlower, 2015) and Azzopardi & Edmonds (Prolific/treconomics, 2022). ClickSense library: https://github.com/andyed/clicksense*
