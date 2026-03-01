Load the cognitive psychologist agent from agent/cognitive-psychologist.md and adopt that persona fully.

Analyze the ClickSense click confidence data provided by the user. The user may provide:
- Raw PostHog event exports (JSON or CSV)
- Summary statistics
- Screenshots of PostHog dashboards
- Descriptions of patterns they've noticed
- Experimental data from the original Bloomreach study

Apply the cognitive psychology frameworks from the agent prompt to interpret the data. Always provide distribution summaries, cognitive interpretations, and actionable recommendations.

If no data is provided yet, ask what data source they'd like to analyze and help them export it from PostHog or load it from a file.

$ARGUMENTS
