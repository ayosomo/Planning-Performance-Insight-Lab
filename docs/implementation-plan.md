# Implementation plan and requirement coverage

The user’s subsequent decisions supersede the original handoff where they refine metric definitions, add a complete review workflow and require reviewed public delivery. The source PDF and workbook are reference evidence. Their embedded submission instructions are not actions to execute on the user’s behalf.

| Order | Deliverable | Dependency | Acceptance evidence |
| --- | --- | --- | --- |
| 0 | Inspect the four-page PDF and workbook, separate history from synthesis | Supplied source files | Reference review, exact source extraction, private files excluded from public bundle |
| 1 | Preserve source rows and original combined-control classification | Intake | 240 CRM / 236 supplier / 35 accounts; 208 PASS / 32 REVIEW; 69 overdue / 92 escalation checks |
| 2 | Implement independent data-integrity, readiness and performance rules | Fixture | Boundary tests, no silent row drops, documented denominators, unavailable actual outcome disclosed |
| 3 | Build dashboard, queue, lineage, dictionary and evidence views | Rule outputs | Interactive population filters, search/sort, every source match inspectable, all controls connected |
| 4 | Implement reviewer accountability and persistent correction workflow | Rule engine + views | Assignment, notes, statuses, source correction, revalidation, verified resolution, reopen and audit |
| 5 | Verify local functionality and accessibility | Working application | Unit/integration tests, axe structural smoke checks, browser/keyboard/responsive review, production build |
| 6 | Publish static synthetic app to a new Vercel project | Passing release checks | READY deployment, public URL and public browser review; do not alter existing projects |
| 7 | Update private Notion evidence hub and package source/screenshots | Verified work | Evidence record, screenshots, architecture, walkthrough, limitations and local source archive |

## Acceptance constraints

- The application deadline is 27 October 2026. The existing PDF and workbook must not wait for app development. Submission remains the applicant’s action.
- Original workbook figures remain visible as the immutable baseline, including per-record PASS / REVIEW inspection.
- A known pending approval or permit is a readiness blocker, not automatically an integrity failure.
- A critical rule continues to affect quality even if a reviewer accepts the exception or begins investigation.
- Trusted delivery KPIs disclose excluded critical rows. The queue retains all findings and records.
- Actual on-time performance remains unavailable until actual completion dates are supplied.
- Audit identity is simulated, with real browser-action timestamps. Metric dates remain fixed.
- State is isolated across browser profiles; no shared production database or employer data.
- Accessibility smoke checks are evidence, not a claim of certification or a complete assistive-technology audit.

## Refined handoff decisions

The four core statuses are Open, In Review, Ready for Validation and Resolved. Accepted Exception is an optional documented limitation which does not pass a failing rule. No authentication was added, so no claim of authorised real-world approval is made. n8n remains out of the critical path and is omitted from the first release.

See `test-results.md` for observed verification outcomes rather than treating this plan as completion evidence.
