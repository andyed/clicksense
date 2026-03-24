# ClickSense: Related Paradigms and Prior Art

Research survey covering published work related to the ClickSense paradigm — mousedown-to-mouseup hold duration as a cognitive/motor signal, approach dynamics, and their combination as a decision confidence measure.

Generated: 2026-03-21

---

## 1. Motor Hesitation and Commitment Dynamics

### Response Vigor Literature

The strongest theoretical connection to ClickSense comes from the **response vigor** framework, which treats movement parameters (speed, force, duration) as implicit readouts of subjective value and decision confidence.

**Shadmehr & Ahmed (2020).** *Vigor: Neuroeconomics of Movement Control.* MIT Press.
- Core thesis: "The way we move unmasks how much we value the thing we are moving toward." Movement speed, force, and duration encode subjective economic utility. Dopamine modulates vigor through basal ganglia circuits.
- **ClickSense connection:** Click hold duration is a vigor signal. Shorter, crisper clicks = higher vigor = higher decision confidence. The 50-160ms range ClickSense measures is a micro-vigor variable on button press.

**Thura, Haith, Derosiere & Duque (2025).** "The integrated control of decision and movement vigor." *Trends in Cognitive Sciences*, 29(12), 1146-1157.
- Decisions and movements are co-regulated in vigor by default, even when this is suboptimal. Co-regulation occurs through global modulation of signal-to-noise ratio in sensorimotor pathways, mediated by locus coeruleus and basal ganglia. Decoupling requires inhibitory control via frontal areas.
- **ClickSense connection:** This explains why click hold duration and approach dynamics co-vary — they are co-regulated by the same vigor system. ClickSense's combination signal (hold + approach) may be capturing the default coupled state.

**Yoon, Geary, Ahmed & Shadmehr (2018).** "Control of movement vigor and decision making during foraging." *PNAS*, 115, E10476-E10485.
- Grip force on a transducer during option selection reflected subjective value differences between options. Motor vigor served as an implicit measure of utility independent of explicit choice.
- **ClickSense connection:** Direct precedent for using motor output magnitude (force/duration) as an implicit value/confidence signal during choice tasks.

### Point of No Return

**Schultze-Kraft et al. (2016).** "The point of no return in vetoing self-initiated movements." *PNAS*, 113(4), 1080-1085.
- Subjects could veto movements up to ~200ms before movement onset (measured via readiness potential in a brain-computer interface game). After that point, movement became ballistic and uncancellable.
- **ClickSense connection:** The 50-160ms click hold duration window sits at or below this ~200ms threshold — suggesting that once mousedown fires, the click commitment is largely ballistic. Variations in hold duration may reflect how close to the "edge" of commitment the motor system was at initiation.

### Neuromechanics of Button Press

**Oulasvirta, Kim & Lee (2018).** "Neuromechanics of a Button Press." *CHI 2018*, 4099-4112. (Best Paper Honorable Mention)
- Computational model of finger mechanics during button pressing, incorporating neural noise and degraded sensory feedback. The motor system learns appropriate muscle activations over repeated strokes. Led to "Impact Activation" — triggering at max impact force rather than first contact, yielding 94% improvement in rapid tapping.
- **ClickSense connection:** Directly models the biomechanics underlying ClickSense's primary signal. Hold duration variation is partly explained by the neuromechanical model — finger deceleration profile, button resistance, and learned motor programs all contribute to the mousedown-mouseup interval.

### Grip Force as Cognitive Window

**Nashed, Diamond, Gallivan, Wolpert & Flanagan (2017).** "Grip force when reaching with target uncertainty provides evidence for motor optimization over averaging." *Scientific Reports*, 7, 11703. doi:10.1038/s41598-017-10996-6
- Under target uncertainty, initial grip force was minimal (appropriate for midline), not the average of forces needed for each target. Motor system optimizes rather than averages under uncertainty.
- **ClickSense connection:** Analogous to click hold duration under decision uncertainty — the motor system may produce a "minimal commitment" signal (longer, softer hold) when uncertain, rather than averaging between confident and unconfident motor programs.

**Newell & Vaillancourt (2001).** "Dimensional change in motor learning." *Human Movement Science*.
- Cognitive-motor interference during grasping: dual-task conditions increased preload phase duration and grip force during hold phase. Temporal coupling between grip and load forces was unaffected by cognitive load.
- **ClickSense connection:** Cognitive load may increase hold duration without changing the temporal structure of the click, paralleling grip force findings. This could explain why ClickSense found no NASA-TLX correlation — the signal may be orthogonal to subjective workload.

---

## 2. Fitts' Law Extensions and Submovement Analysis

### Movement Phase Decomposition

**Meyer, Abrams, Kornblum, Wright & Smith (1988).** "Optimality in human motor performance: Ideal control of rapid aimed movements." *Psychological Review*, 95(3), 340-370.
- Seminal submovement model: aimed movements decompose into an initial ballistic phase (fast, imprecise) and a corrective phase (slow, precise). Submovements' duration, accuracy, and frequency systematically relate to Fitts' Law parameters.
- **ClickSense connection:** ClickSense's "approach dynamics" (velocity, deceleration, corrections, pause-before-commit) are the submovement structure of cursor approach. The deceleration profile encodes target difficulty/uncertainty in exactly the way Meyer et al. predicted.

### Information-Theoretic Movement Analysis

**Gori & Rioul (2020).** "A feedback information-theoretic transmission scheme (FITTS) for modeling trajectory variability in aimed movements." *Biological Cybernetics*, 114, 621-641.
- Treats aiming as a Shannon communication problem: limb position variance increases rapidly in the initial phase, then decreases exponentially during correction at a rate equal to channel capacity. Positional variance profile is the information signal.
- **ClickSense connection:** The approach phase variance profile is an information-theoretic signal. High-confidence clicks should show lower positional variance in the deceleration phase — the "channel capacity" of the motor system during approach encodes decision quality.

### Recent Kinematic Analysis

**Direction-dependent effects of gravity on speed-accuracy trade-off (2025).** *Experimental Brain Research.*
- Gravity influences acceleration and deceleration phase asymmetry in vertical pointing movements depending on direction. Temporal kinematic differences during deceleration encode biomechanical constraints.
- **ClickSense connection:** Reminder that cursor approach deceleration profiles on a 2D screen are relatively free from gravitational confounds, making them cleaner cognitive signals than physical reaching movements.

---

## 3. Click Behavior Analytics — Direct Prior Art

### Click Speed as Anxiety Measure

**Macaulay (2004).** "The speed of mouse-click as a measure of anxiety during human-computer interaction." *Behaviour & Information Technology*, 23(6), 427-433.
- Mouse click frequency (clicks per second) was used as an indicator of user anxiety state during HCI tasks. Higher anxiety correlated with altered click speed patterns.
- **ClickSense connection:** This is the closest direct prior art to ClickSense's hold duration measure, though it measured click *frequency* rather than individual click *hold duration*. ClickSense's per-click measurement is more granular and captures the motor dynamics of each individual commitment event.

### Mouse Dynamics Biometrics Survey

**Khan, Devlen, Manno & Hou (2024).** "Mouse Dynamics Behavioral Biometrics: A Survey." *ACM Computing Surveys*, 56(6). doi:10.1145/3640311.
- Comprehensive survey (1897-2023) covering mouse dynamics features: movement speed, acceleration, curvature, click patterns, dwell times. Feature taxonomy includes click-level features (button type, click duration, double-click interval) and movement-level features (velocity, acceleration, curvature, angle).
- **ClickSense connection:** The survey confirms that click duration (mousedown-to-mouseup interval) is a recognized feature in the biometrics literature, but used for *identity authentication*, not cognitive state measurement. ClickSense repurposes this same signal for decision confidence — a novel application.

### Keystroke Dynamics Parallel

**Keystroke dynamics research** provides a close analog. Key dwell time (press-to-release duration) has been used to detect:
- Emotional states including confidence, hesitance, nervousness, with 77-88% accuracy (Epp, Lippold & Mandryk, 2011, CHI)
- Depressive tendency via typing patterns on smartphones (2024, *Scientific Reports*)
- Stress and alertness as digital biomarkers (Dublin City University, 2023)

- **ClickSense connection:** Click hold duration is the mouse equivalent of key dwell time. The keystroke literature validates that press-to-release intervals carry cognitive/affective information. ClickSense extends this from typing to clicking, with the additional dimension of approach dynamics.

### Mouse Behavioral Patterns and Personality

**Salmeron-Majadas, Santos & Boticario (2018).** "Mouse behavioral patterns and keystroke dynamics in End-User Development." *Computers in Human Behavior*, 83, 288-298.
- Extraverts exhibited higher motor activity and click frequency. Mouse clicking behaviors correlated significantly with Big Five personality traits.
- **ClickSense connection:** If personality traits modulate click behavior, they may also modulate click hold duration — suggesting individual calibration is needed, which ClickSense already does via per-user baseline.

---

## 4. Implicit Behavioral Measures

### Mouse Tracking as Process Tracing

**Freeman & Ambady (2010).** "MouseTracker: Software for studying real-time mental processing using a computer mouse-tracking method." *Behavior Research Methods*, 42(1), 226-241.
- Foundational tool for using continuous cursor trajectory as a window into cognitive processing. 60-75 Hz sampling of x,y coordinates during two-alternative forced choice reveals real-time competition between response alternatives. Trajectory curvature toward the unchosen option indexes response conflict.
- **ClickSense connection:** Freeman's paradigm focuses on the *during-movement* trajectory. ClickSense complements this with *at-commitment* signals (hold duration) and *pre-commitment* signals (approach dynamics). Together they span the full motor timeline.

**Spivey, Grosjean & Knoblich (2005).** "Continuous attraction toward phonological competitors." *PNAS*, 102(29), 10393-10398.
- When clicking "candy," cursor trajectories curved toward a picture of "candle" — demonstrating continuous attraction toward competitors during lexical processing. Real-time cognition as continuous trajectory through state space.
- **ClickSense connection:** This seminal paper established that motor output during mouse movement is a continuous readout of cognitive processing. ClickSense's approach dynamics (velocity changes, corrections) are the same signal applied to UI decision-making.

### Approach-Avoidance Conflict in Motor Dynamics

**Garcia-Guerrero, O'Hora, Zgonnikov & Scherbaum (2023).** "The action dynamics of approach-avoidance conflict during decision-making." *Quarterly Journal of Experimental Psychology*, 76(1), 160-179.
- Mouse-tracked approach-avoidance decisions where avoiding threat conflicted with gaining reward. Approach trajectories were simpler (faster, less deflected) than avoidance trajectories. At equipotentiality (equal approach/avoidance motivation), trajectories showed maximum deflection and complexity.
- **ClickSense connection:** ClickSense's "pause-before-commit" signal may capture approach-avoidance conflict at the moment of click. A longer pause before mousedown, combined with more corrections in approach, could index the same equipotentiality state this paper describes.

### Concealed Memory Detection via Mouse Tracking

**Xu et al. (2025).** "The trajectory of crime: Integrating mouse-tracking into concealed memory detection." *Behavior Research Methods*.
- Combined mouse-tracking with the autobiographical implicit association test (aIAT). Mouse metrics showed IAT effects that correlated with reaction time IAT effects, with different trajectory patterns for autobiographical vs. irrelevant events.
- **ClickSense connection:** Demonstrates that mouse motor signals can detect cognitive states that subjects cannot self-report — the same implicit quality ClickSense claims (no NASA-TLX correlation). The motor signal bypasses introspective access.

### Drift Diffusion Model Applied to Mouse Trajectories

**Leontyev & Yamauchi (2021).** "Discerning Mouse Trajectory Features With the Drift Diffusion Model." *Cognitive Science*, 45(10), e13046.
- Applied hierarchical drift diffusion modeling to mouse-tracking data from delay discounting and stop-signal tasks. Mouse-tracking design produced different parameter estimates than keypress design, indicating the motor dynamics carry additional information beyond reaction time.
- **ClickSense connection:** Computational modeling framework for extracting cognitive parameters from motor trajectories. Could be applied to ClickSense's approach dynamics to decompose the signal into drift rate (evidence accumulation), boundary separation (response caution), and non-decision time.

### Press vs. Tap as Implicit Motivational Signal

**Shen, Arroyo & Zitek (2023).** "Pushing Yourself Harder: The Effects of Mobile Touch Modes on Users' Self-Regulation." *Information Systems Research*, 34(3).
- Pressing (force-based) vs. tapping (binary contact) on touchscreens differentially affected self-regulation. Pressing enhanced goal pursuit because the action of pressing embodies resolute approach motivation. The motor mode implicitly influenced downstream behavior.
- **ClickSense connection:** This is the closest published work to ClickSense's thesis that click force/duration carries cognitive meaning. If pressing harder = more approach motivation, then ClickSense's shorter hold duration (crisper, more vigorous click) = higher decision confidence follows the same logic.

---

## 5. Cursor Dynamics as UX Signal

### Unconscious Frustration Detection

**Stone & Chapman (2023).** "Unconscious Frustration: Dynamically Assessing User Experience using Eye and Mouse Tracking." *Proceedings of the ACM on Human-Computer Interaction*, 7(ETRA).
- Combined eye-tracking and mouse tracking to detect UX friction points that users themselves were unaware of. Both hardware and webcam-based eye trackers identified a previously undetected friction point in a menu navigation task.
- **ClickSense connection:** Already cited in ClickSense paper. Validates the principle that motor signals (mouse movement patterns) can detect UX problems that self-report misses — the same implicit quality ClickSense's hold duration exploits.

### Cursor Movement and Engagement Prediction

**Arapakis & Leiva (2016).** "Predicting User Engagement with Direct Displays Using Mouse Cursor Information." *SIGIR 2016*, 599-608.
- Mouse cursor movements predicted user engagement with search results. Used movement velocity, acceleration, and spatial distribution as features for engagement classification.
- **ClickSense connection:** ClickSense's approach dynamics (velocity, deceleration) overlap with the features used here, but ClickSense focuses on the *moment of commitment* rather than overall browsing patterns.

**Arapakis & Leiva (2020).** "Learning Efficient Representations of Mouse Movements to Predict User Attention." *SIGIR 2020*.
- Neural network models on mouse cursor time series, heatmaps, and trajectory images for predicting user attention. Concluded that learned representations outperform hand-crafted features for attention prediction.
- **ClickSense connection:** ClickSense's approach dynamics could benefit from learned representations rather than hand-crafted features (velocity, deceleration, corrections). Deep learning on raw cursor trajectories pre-click may capture patterns not anticipated by manual feature engineering.

### Stress Detection via Mouse Tracking

**Freihaut, Göritz, Rockstroh & Blum (2021).** "Tracking stress via the computer mouse? Promises and challenges of a potential behavioral stress marker." *Behavior Research Methods*, 53, 2281-2301. doi:10.3758/s13428-021-01568-8.
- Systematic investigation of mouse tracking for stress measurement using both frequentist and ML approaches. Results did NOT reveal a clear, systematic relationship between mouse usage and stress.
- **ClickSense connection:** Important null result. Mouse *movement* patterns alone may not reliably index stress — but ClickSense's *click hold duration* is a different signal (motor commitment, not movement) that may succeed where movement tracking failed. The distinction between during-movement and at-commitment signals matters.

### Mind Over Mouse

**Rheem, Mansouri & Huang (2017).** "Mind Over Mouse: The Effect of Cognitive Load on Mouse Movement Behavior." *International Conference on Information Systems.*
- Cognitive load affected mouse movement patterns: increased task duration, longer movements, slower speed, more direction changes under high load.
- **ClickSense connection:** Establishes that cognitive load modulates cursor movement parameters. ClickSense's approach dynamics should show these same effects. The interesting finding is that ClickSense's hold duration may be *independent* of these cognitive load effects (no NASA-TLX correlation), making it a distinct signal.

### Mouse Tracking Methodology Reviews

**Kieslich, Henninger, Wulff, Haslbeck & Schulte-Mecklenbeck (2019).** "Mouse-tracking: A practical guide to implementation and analysis." In *A Handbook of Process Tracing Methods*, 111-130.
- Comprehensive methodology guide. Identifies trajectory prototypes: straight lines, curved responses, single and double change-of-mind trajectories. Cursor deflection indicates relative activation of response options.

**Stillman, Shen & Ferguson (2018).** "How Mouse-tracking Can Advance Social Cognitive Theory." *Trends in Cognitive Sciences*, 22(6), 531-543.
- Review of mouse-tracking in social cognition: stereotyping, attitudes, moral judgment. Real-time trajectory reveals parallel evaluation of competing social categories.

**Hehman, Stolier & Freeman (2015).** "Advanced mouse-tracking analytic techniques for enhancing psychological science." *Group Processes & Intergroup Relations*, 18(3), 319-336.
- Analytic techniques for continuous movement data: area under the curve, maximum deviation, x-position flips, velocity profiles, bimodality analysis.

- **ClickSense connection (for all three reviews):** These reviews establish mouse tracking as a mature methodology, but they focus almost exclusively on *trajectory* measures during two-alternative forced choice tasks. ClickSense's hold duration is a distinct, under-studied variable that these reviews do not cover. This is both a gap and an opportunity.

### Touchscreen Response as Cognitive Signal

**Touchscreen response precision and explore/exploit (2025).** *eNeuro*.
- During exploit states, successive touch responses were closer together than in explore states, reflecting increased motor stereotypy. Touchscreen interaction patterns reveal hidden cognitive states (exploration vs. exploitation).
- **ClickSense connection:** Parallels ClickSense's finding that motor parameters at the moment of commitment encode cognitive state. The explore/exploit distinction maps onto ClickSense's confidence dimension — exploit = confident = crisper click.

---

## Summary: Where ClickSense Sits

| Paradigm | What It Measures | Temporal Focus | ClickSense Overlap |
|----------|-----------------|----------------|-------------------|
| Response vigor (Shadmehr) | Movement speed/force as value signal | During movement | Hold duration = micro-vigor |
| Mouse tracking (Freeman) | Trajectory curvature as response conflict | During movement to target | Approach dynamics |
| Fitts' law submovements | Deceleration profile as target difficulty | Approach phase | Deceleration, corrections |
| Keystroke dynamics | Key dwell time as affect signal | At keypress | Hold duration analog |
| Grip force cognition | Force magnitude as uncertainty signal | During grasp | Hold duration = force analog |
| Approach-avoidance (Garcia-Guerrero) | Trajectory complexity as motivational conflict | Full trajectory | Pause-before-commit |
| Click biometrics | Click timing for identity | At click | Same signal, different purpose |
| Cursor UX analytics | Movement patterns as engagement/frustration | Browsing session | Approach velocity, corrections |

### ClickSense's Novel Contribution

The literature reveals that:

1. **Hold duration is recognized but underused.** The biometrics survey catalogs click duration as a feature but only for authentication. Keystroke dwell time is used for emotion detection but nobody has systematically studied mouse click hold duration as a cognitive signal.

2. **The approach+commitment combination is novel.** Prior work measures either trajectory (mouse tracking) or reaction time (IAT). ClickSense combines approach dynamics with at-commitment motor signal, spanning the full decision-to-action timeline.

3. **The response vigor framework provides theoretical grounding.** Shadmehr & Ahmed's work (and the 2025 Trends paper on co-regulation) provides a neuroscience foundation for why click hold duration should encode decision confidence. It is a vigor variable, not a reaction time variable.

4. **The implicit quality is validated by analogy.** Mouse tracking (Garcia-Guerrero), concealed memory detection (Xu et al.), and grip force (Davarpanah Jazi) all demonstrate motor signals that bypass introspective access. ClickSense's lack of NASA-TLX correlation is consistent with this pattern.

5. **The null stress result matters.** Freihaut & Goritz (2022) found mouse movement alone does not reliably index stress. ClickSense's hold duration is a different class of signal (commitment dynamics, not movement dynamics) and may succeed where movement tracking failed.

---

## Sources

- [Shadmehr & Ahmed, Vigor (MIT Press)](https://direct.mit.edu/books/monograph/4845/VigorNeuroeconomics-of-Movement-Control)
- [Thura et al. 2025, Integrated control of decision and movement vigor](https://www.cell.com/trends/cognitive-sciences/abstract/S1364-6613(25)00185-8)
- [Oulasvirta et al. 2018, Neuromechanics of a Button Press](https://dl.acm.org/doi/10.1145/3173574.3174082)
- [Schultze-Kraft et al. 2016, Point of no return](https://www.pnas.org/doi/10.1073/pnas.1513569112)
- [Garcia-Guerrero et al. 2023, Action dynamics of approach-avoidance](https://journals.sagepub.com/doi/10.1177/17470218221087625)
- [Freeman & Ambady 2010, MouseTracker](https://link.springer.com/article/10.3758/BRM.42.1.226)
- [Spivey et al. 2005, Continuous attraction](https://www.pnas.org/doi/10.1073/pnas.0503903102)
- [Leontyev & Yamauchi 2021, Drift diffusion + mouse tracking](https://onlinelibrary.wiley.com/doi/10.1111/cogs.13046)
- [Xu et al. 2025, Mouse tracking + concealed memory](https://link.springer.com/article/10.3758/s13428-024-02594-y)
- [Shen et al. 2023, Pushing Yourself Harder](https://pubsonline.informs.org/doi/10.1287/isre.2022.1155)
- [Stone & Chapman 2023, Unconscious Frustration](https://dl.acm.org/doi/10.1145/3591137)
- [Khan et al. 2024, Mouse Dynamics Biometrics Survey](https://dl.acm.org/doi/10.1145/3640311)
- [Macaulay 2004, Click speed and anxiety](https://www.tandfonline.com/doi/abs/10.1080/01449290412331294651)
- [Freihaut, Göritz, Rockstroh & Blum 2021, Mouse tracking and stress](https://link.springer.com/article/10.3758/s13428-021-01568-8)
- [Arapakis & Leiva 2016, Cursor and engagement](https://dl.acm.org/doi/10.1145/2911451.2911505)
- [Arapakis & Leiva 2020, Learning mouse movement representations](https://dl.acm.org/doi/10.1145/3397271.3401031)
- [Gori & Rioul 2020, FITTS information-theoretic model](https://link.springer.com/article/10.1007/s00422-020-00853-7)
- [Davarpanah Jazi & Heath 2017, Grip force and target uncertainty](https://www.nature.com/articles/s41598-017-10996-6)
- [Stillman et al. 2018, Mouse tracking in social cognition](https://www.sciencedirect.com/science/article/abs/pii/S1364661318300731)
- [Kieslich et al. 2019, Mouse-tracking practical guide](https://www.researchgate.net/publication/328644377_Mouse-tracking_A_practical_guide_to_implementation_and_analysis)
- [Hehman et al. 2015, Advanced mouse-tracking analytics](https://journals.sagepub.com/doi/10.1177/1368430214538325)
- [Rheem et al. 2017, Mind Over Mouse](https://www.researchgate.net/publication/320471876_Mind_Over_Mouse_The_Effect_of_Cognitive_Load_on_Mouse_Movement_Behavior)
- [Yoon et al. 2018, Control of movement vigor and decision making during foraging](https://pmc.ncbi.nlm.nih.gov/articles/PMC9187114/)
- [Grip force as cognitive window (Frontiers 2022)](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2022.1026439/full)
