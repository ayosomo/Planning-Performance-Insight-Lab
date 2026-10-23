# Metric definitions

All metrics use 23 October 2026 and the currently selected CRM-row population. Source corrections recalculate indicators without advancing the snapshot. A zero denominator yields N/A. Workflow status never substitutes for a source-data validation result.

| Metric | Calculation | Initial full-population result |
| --- | --- | --- |
| Workbook combined-control pass rate | Original first-match rules, no duplicate / missing supplier / approval No / permit No / ETA drift greater than 14 days | 208 / 240 = 86.7%; 32 REVIEW |
| Integrity-only pass rate | Rows with no critical integrity finding / all CRM rows | 228 / 240 = 95.0%; 12 fail |
| Delivery readiness | Ready trusted open rows / trusted open rows | 107 / 155 = 69.0% |
| Forecast schedule adherence | Trusted open rows with ETA on/before target / trusted open rows with valid ETA and target | 103 / 155 = 66.5% |
| Actual on-time performance | Verified completion on/before target / eligible completed orders | Unavailable; actual completion dates absent |
| Trusted open overdue | Trusted open rows with target strictly before snapshot | 66 |
| Raw open overdue | All CRM open rows with target strictly before snapshot | 69; kept in rule findings |
| Exception backlog | Findings not Resolved, including Accepted Exception | 149 findings initially; 26 critical, 120 high, 3 medium |

## Integrity

Critical findings: duplicate CRM IDs, missing supplier join, ambiguous duplicate supplier match, missing/invalid essential source fields, invalid calendar dates and conflicting completion semantics. Completion conflict means exactly one side says Completed. Non-completion stage names are not equated without a defined mapping.

Both rows of a duplicate fail integrity and remain separate. Every supplier match is retained. First-match preview values are never trusted for ambiguous joins. Overall validation fails if any critical row exists; the app continues rendering findings so the errors can be investigated.

## Readiness

For open orders, explicit approval No, permit No or CRM status Blocked create operational blockers. Demo assumption: every open order requires a permit. A generic constraint label alone is not enough to infer a live blocker. Completed rows are not assessed for current readiness. Missing prerequisites with unknown data cannot be assumed Ready.

The source does not contain separate wayleave or technical sign-off fields. The lab uses the source’s status and constraint category rather than inventing field-level evidence.

## Performance

Open target before snapshot is Overdue and takes precedence. Otherwise a known blocker or ETA after target is At risk. Invalid target or unresolved completion conflict is Unknown. A record without an ETA and no stronger warning is Unknown. Completed records are Not assessed because actual dates are absent.

ETA drift finding threshold: strictly more than 14 calendar days after target. This is an illustrative portfolio threshold, not a TalkTalk Business or Co-op SLA. Any positive forecast slippage may be At risk even before the 14-day warning threshold.

Forecast adherence can include an overdue record with a stale ETA on/before target. The dashboard explains why forecast adherence and overdue counts must be read together. No trend, actual completion date or financial saving is inferred.

## Workflow counts and cadence

Queue counts findings, not distinct records. Multiple rules may affect one row. Review status, assignee and evidence are local workflow fields. A rule-cleared finding stays in backlog until explicitly revalidated and resolved. A recurrence automatically reopens it. Accepted Exception does not change source-derived indicators and remains backlog.

Illustrative ownership: source Owner 1, with optional local investigation assignees. Recompute after each correction; no scheduled refresh. The in-product metric dictionary adds source, stakeholder decision, control and limitations for each KPI.
