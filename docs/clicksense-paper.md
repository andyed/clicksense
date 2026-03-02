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

## Current status

We're evaluating whether there's a paper to be written. The core library ships at 2KB and is deployed on production sites (Scrutinizer, Psychodeli+). The approach dynamics extension (mouse velocity harvesting before click) adds a richer signal that may strengthen the case. The data exists; the question is whether the combined evidence — click duration + approach dynamics, within-subject baselines, identity-relevant contexts — clears the bar for a contribution.

Full analysis, study details, and data exploration are in the [i2lab/clicksense](https://github.com/i2lab/clicksense) repository.

---

*Data: Edmonds (CrowdFlower, 2015), Azzopardi & Edmonds (Prolific/treconomics, 2022). Library: [github.com/andyed/clicksense](https://github.com/andyed/clicksense)*
