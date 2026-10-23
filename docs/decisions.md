# Implementation decisions

1. **Preserve workbook provenance.** Extract actual fictional rows and retain source-row IDs. Do not tune refined rules to force the original 208/32 result.
2. **Three independent signals.** Integrity failures affect trust; known missing prerequisites affect readiness; schedule signals affect performance. An accurate record of a missing approval can pass integrity.
3. **No invented delivery outcomes.** Actual completion dates are absent. Publish unavailable actual on-time performance and a separately labelled forecast-adherence metric.
4. **Trusted-row reporting.** Exclude critical rows from readiness, forecast and overdue headlines; retain all rows and findings, and disclose the excluded count beside the KPIs.
5. **All supplier matches visible.** The original workbook’s first-match semantics are only used in its labelled baseline. Ambiguous matches are critical under refined rules.
6. **Local reviewer demonstration.** Persistent localStorage keeps reviewer changes separate from server-side snapshot QA and avoids shared visitor review state. Identities are explicitly simulated. No unauthenticated person is presented as an authorised business approver.
7. **Verified closure.** Review status does not override live rules. Resolution requires Ready for Validation, root cause, action, evidence and a cleared underlying rule. Accepted Exception remains in backlog. Recurrence reopens a resolved rule.
8. **Minimal audit deltas.** Corrections record changed source rows rather than copying entire datasets into every event. Export includes current sources, review history and source-change history. Browser quotas and tamperability are disclosed.
9. **Simple accessible visuals.** Labelled HTML bars retain text counts, semantic headings/tables and no chart-only meaning. Native dialogs handle modality and keyboard focus. No external fonts, images, analytics or trackers.
10. **Vercel delivery.** This project serves the client and the requested read-only synthetic snapshot workflow. Reviewer data remains browser-local. Security headers restrict scripts and connections to the app’s origin.
11. **Toolchain compatibility.** The initial static release used Vite 7 after development-optimizer allocations failed on the test workstation. The requested Workflow SDK integration requires Nitro’s Vite 8 builder. This revision uses Vite 8 with bounded compiler concurrency and a build-once full-stack local server; hot reload remains optional.
12. **n8n deferred.** An automated notification or scheduled refresh would add no necessary capability to this fixed, synthetic, browser-local example. No external accounts are connected.

13. **Durable fixture QA.** The first Workflow SDK workflow loads the fixed synthetic fixture, assesses its controls and produces a summary in three steps. Matching the expected baseline does not erase its 12 integrity failures. API routes accept no source uploads; workflow results can be downloaded. CI verifies compiled execution and restart persistence.
