# ClickSense: Motivating Research

**Andy Edmonds** · **Leif Azzopardi**

*March 2026*

---

## The question

Does mousedown→mouseup duration — the time a finger holds a button during a click — carry a cognitive signal?

Andy collected data on politically-charged factual questions via CrowdFlower (n=291, 2015). Leif collected data on perceptual speed tests via Prolific using the treconomics platform (n=227, 2022). Both datasets measured click hold duration alongside task variables.

## What the data shows

There is signal. It's small in normal interactions — a 7ms task effect between baseline clicking and word search, a 4ms expertise × question-type interaction — but it's real and it replicates across independent samples.

It may be too small to matter in practice, given the confounds that dwarf it:

- **Input device**: trackpad vs. mouse produces a 16ms gap — biomechanically grounded, larger than most cognitive effects.
- **Age**: a clear gradient from 87ms (25–34) to 137ms (65+), reflecting motor slowing.
- **Individual motor habits**: within-person SD of 30–50ms swamps between-condition differences.

## Why it might still matter

Click duration is correlated with the harder-to-measure pre-click behavior — approach dynamics, dwell time, cursor trajectory — that *does* carry strong signal. Pre-click dwell discriminates correct from incorrect selections by 91ms (p < 10⁻²⁵). Click duration alone doesn't. But the two are measuring adjacent phases of the same decision pipeline: evaluation (pre-click) → commitment (during click). Maybe the combination gets us somewhere that neither achieves alone.

The most interesting finding is what click duration is *independent from*:

- **NASA-TLX**: Self-reported cognitive load doesn't correlate with click duration. Whatever the click is measuring, people can't introspect on it.
- **Correctness**: Click duration doesn't predict whether a lexical decision was right or wrong — but pre-click dwell does. These are different signals at different stages.

This independence is actually encouraging. It means click duration isn't just a noisy proxy for something we already measure well. It's accessing a different layer — pre-reflective motor hesitation at the moment of commitment, not deliberation beforehand or evaluation afterward.

## Where it gets interesting

The strongest effects come from identity-relevant content, not task difficulty. Non-voters hold 19ms longer on "I will vote in the next election" than on "I voted in the last election." Self-reported political experts differentiate facts from opinions in their click latency; non-experts don't. These are small-N observations (n=19–42 per cell), but the direction is consistent and the theoretical framing — commitment uncertainty, not cognitive load — makes sense of when the signal appears and when it doesn't.

## The instrumentation problem

Pre-click dwell time is where the strong cognitive signal lives (91ms correct/incorrect discrimination). But dwell time is hard to instrument reliably: you need to define "arrived at target" from continuous cursor movement, handle hover-without-intent, distinguish reading from aiming, and deal with variable target sizes. It's a post-hoc analysis metric, not something you can cheaply capture in production.

Click hold duration — mousedown to mouseup — is the opposite. Trivial to instrument (two event listeners), sub-millisecond precision via `performance.now()`, works on every element, no heuristics needed. The signal is small but real, and critically, it's stable enough to serve as a within-subject baseline.

The approach dynamics extension is the bridge. By capturing cursor velocity in a ring buffer during normal `mousemove` events, we get a practical approximation of the pre-click approach phase: deceleration profile, course corrections, pause-before-commit. This isn't dwell time exactly, but it's instrumenting the same motor phase that dwell time measures — and it's just as easy to deploy as click duration itself. The hope is that click hold + approach velocity together recover enough of the pre-click decision signal to be useful, without the instrumentation burden of true dwell time measurement.

## Current status

The core library ships at 2KB and is deployed in production (Scrutinizer). The question is whether click duration + approach dynamics, combined, produce a practical signal that neither achieves alone — and whether within-subject baselines and identity-relevant contexts strengthen it enough for a contribution.

Full analysis, study details, and data exploration are in the [i2lab/clicksense](https://github.com/i2lab/clicksense) repository.

## Gaze-cursor coordination as complementary signal

Recent work shows that gaze and mouse cursor aren't redundant — the *relationship* between them carries cognitive signal that neither captures alone:

- **Stone & Chapman (2023)** — "Unconscious Frustration: Dynamically Assessing User Experience using Eye and Mouse Tracking." *Proc. ACM Human-Computer Interaction* (ETRA). Eye-mouse coordination breakdown reveals UX friction points that neither signal detects independently. Webcam eye tracking sufficient. "Quantified coordination of unconscious behaviors" successfully identified friction with "minimal cost." [doi:10.1145/3591137](https://doi.org/10.1145/3591137)

- **Zhu, Shi, Song & Cai (2023)** — "Integrating Gaze and Mouse Via Joint Cross-Attention Fusion Net for Students' Activity Recognition in E-learning." *Proc. ACM IMWUT*, 7(3). Cross-attention fusion of gaze + mouse achieves 94.87% F1 on 8-class activity recognition, 7.44% improvement over either signal alone. The attention mechanism learns *when* to trust which modality. [doi:10.1145/3610876](https://doi.org/10.1145/3610876)

- **Huang, White & Buscher (2012)** — "User See, User Point: Gaze and Cursor Alignment in Web Search." *CHI '12*. Cursor and gaze diverge during reading and scanning — the cursor trails, leads, or parks while the eyes continue. [doi:10.1145/2207676.2208591](https://doi.org/10.1145/2207676.2208591)

- **Chen, Anderson & Sohn (2001)** — "What Can a Mouse Cursor Tell Us More? Correlation of Eye/Mouse Movements on Web Browsing." *CHI '01 Extended Abstracts*. Mouse position correlates with gaze during browsing (CMU). [doi:10.1145/634067.634234](https://doi.org/10.1145/634067.634234)

**Connection to ClickSense:** These papers characterize the gaze-cursor delta during the *evaluation* phase (scanning, reading, foraging). ClickSense captures the *commitment* phase (click dynamics, approach deceleration). Together they cover the full decision arc: evaluate (gaze leads cursor) → decide (gaze-cursor converge) → commit (click hold + approach dynamics). The combination — pre-click gaze-cursor coordination + click-moment motor behavior — may recover more of the decision signal than either approach alone.

---

*Data: Edmonds (CrowdFlower, 2015), Azzopardi & Edmonds (Prolific/treconomics, 2022). Library: [github.com/andyed/clicksense](https://github.com/andyed/clicksense)*
