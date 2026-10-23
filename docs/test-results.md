# Verification record

Verified on 23 October 2026 using the supplied synthetic workbook fixture. No real employer records or accounts were connected.

## Automated results

- **45 / 45 Vitest tests passed**, across data rules, metric denominators, source retention, review state transitions, correction evidence, audit, recurrence, browser-storage isolation/recovery and rendered UI interactions. Machine-readable report: `test-results.json`.
- Fixture QA reproduced 240 CRM rows, 236 supplier rows, 35 groups, 208 PASS / 32 REVIEW, 69 raw overdue rows and 92 escalation rows. Refined metrics are recorded in `fixture-validation.json`.
- **Production build passed**, including TypeScript checks. The Vite 7 build transforms 153 modules; direct icon imports avoid loading the complete icon library during builds.
- Dependency installation reported **zero known vulnerabilities**. This is a package-audit observation, not a security guarantee.

## Real-browser checks

Playwright used the production build in Chromium after the built-in browser connection failed. The user explicitly authorised this fallback.

**10 / 10 end-to-end checks passed:** mobile overview and queue have no page-level horizontal overflow at 390px; active critical issues cannot be closed; corrected source values revalidate and resolve; native dialog contains keyboard focus; Escape closes the dialog; resolved state survives refresh; exported JSON includes source changes and closure evidence; a new browser context retains the original fixture; reset restores the original fixture.

**Zero axe violations across eight audited states:** all five desktop views, mobile overview, mobile queue and the investigation dialog. This includes actual rendered colour-contrast checks, unlike the jsdom structural tests. Desktop screenshots use 1280px; mobile screenshots use 390px. Results: `browser-qa.json`.

The browser run recorded no application runtime errors. Screenshots were inspected for legibility, clipping and responsive layout. The horizontally scrollable findings table keeps its source columns on small screens.

## Issues found and corrected

- Missing disclosure landmark: added a named region.
- Low-contrast muted labels: darkened text; reran the rendered contrast audit.
- Mobile document overflow: constrained the table’s hidden accessible label within its scroll container.
- Ambiguous select accessible labels: added explicit labels.
- Audit propagation: source changes affecting duplicate peers are recorded in their histories as well as the global source audit.
- Development StrictMode: removed a redundant native-dialog close listener to avoid cleanup-driven closure.
- Workstation memory limits: Vite 8 native optimizer repeatedly failed allocations. Vite 7, direct icon imports, one test worker and bounded native compiler concurrency provide a working build and preview setup.

## Limits

No native Excel recalculation was performed; workbook cached results were inspected and independently reproduced in TypeScript. The PDF was text-extracted and its four rendered pages reviewed; the supplied PDF and workbook were left unchanged.

This is not a complete WCAG certification, assistive-technology matrix, penetration test, multi-user access-control test or professional third-party attestation. Actual delivery outcomes cannot be measured without actual completion dates. Local browser logs are illustrative and tamperable.

The workstation's conventional hot-reload server exhausted available virtual memory during browser startup, including with Vite 7. `npm run dev` therefore builds and serves the production bundle locally, with optional hot reload under `npm run dev:vite`. The complete local production flow passed; the optional hot-reload session is not claimed as verified under this memory pressure.

The final default `npm run dev` command was verified in a browser: it built successfully, rendered the dashboard, and opened and closed the native investigation dialog.

## Public release

Vercel production deployment `dpl_ECZvMoi7zWUFmCU71qktc7okCgxQ` reached READY at https://planning-performance-insight-lab.vercel.app/. Unauthenticated HTTP 200 and the configured CSP, nosniff, referrer and device-permission headers were verified. The same 10 browser checks passed on the public URL, with zero axe violations in eight states and no runtime errors. See `browser-qa-production.json`.

The user explicitly approved removing SSO protection from this new synthetic-demo project. Existing Vercel projects and the private Notion hub’s sharing were not changed.
