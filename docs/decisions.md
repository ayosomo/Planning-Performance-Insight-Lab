# Implementation decisions

1. **Preserve workbook provenance.** Extract actual fictional rows and retain source-row IDs. Do not tune refined rules to force the original 208/32 result.
2. **Three independent signals.** Integrity failures affect trust; known missing prerequisites affect readiness; schedule signals affect performance. An accurate record of a missing approval can pass integrity.
3. **No invented delivery outcomes.** Actual completion dates are absent. Publish unavailable actual on-time performance and a separately labelled forecast-adherence metric.
4. **Trusted-row reporting.** Exclude critical rows from readiness, forecast and overdue headlines; retain all rows and findings, and disclose the excluded count beside the KPIs.
5. **All supplier matches visible.** The original workbook’s first-match semantics are only used in its labelled baseline. Ambiguous matches are critical under refined rules.
6. **Local reviewer demonstration.** Persistent localStorage avoids accounts, shared visitor state and a backend. Identities are explicitly simulated. No unauthenticated person is presented as an authorised business approver.
7. **Verified closure.** Review status does not override live rules. Resolution requires Ready for Validation, root cause, action, evidence and a cleared underlying rule. Accepted Exception remains in backlog. Recurrence reopens a resolved rule.
8. **Minimal audit deltas.** Corrections record changed source rows rather than copying entire datasets into every event. Export includes current sources, review history and source-change history. Browser quotas and tamperability are disclosed.
9. **Simple accessible visuals.** Labelled HTML bars retain text counts, semantic headings/tables and no chart-only meaning. Native dialogs handle modality and keyboard focus. No external fonts, images, analytics or trackers.
10. **Static Vercel delivery.** New project rather than changes to existing portfolio projects. Browser data never reaches a backend. Static security headers restrict scripts and connections to the app’s origin.
11. **Toolchain compatibility.** Vite 8’s native development optimizer repeatedly failed allocations on the low-memory test workstation. Vite 7 builds and production previews work with bounded compiler concurrency. The default `npm run dev` builds and previews that same application; `npm run dev:vite` retains conventional hot reload when memory permits. This avoids promising a reliable hot-reload session under the observed workstation memory pressure.
12. **n8n deferred.** An automated notification or scheduled refresh would add no necessary capability to this fixed, synthetic, browser-local example. No external accounts are connected.
