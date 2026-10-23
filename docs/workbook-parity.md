# Workbook parity

The fixture was extracted from the supplied synthetic workbook rather than generated as a replacement. All 240 CRM rows, 236 supplier rows and 35 fictional account groups are preserved. The original files are not published with this repository.

| Measure | Workbook baseline | Refined model |
| --- | --- | --- |
| Original combined controls | 208 PASS / 32 REVIEW | Immutable comparison retained |
| Integrity-only classification | Not separately defined | 228 PASS / 12 FAIL |
| Open overdue rows | 69 raw rows | 66 trusted rows |
| Escalation population | 92 distinct rows | Separate multi-finding backlog |

The workbook combines duplicates, missing supplier records, approvals, permits and ETA drift. The lab distinguishes critical data-integrity failures from known operational blockers and schedule warnings. It does not tune the refined rules to force the old 208/32 result.

Duplicate CRM identifiers affect eight rows in four pairs. Missing supplier matches affect four rows. Duplicate supplier matches and completion conflicts overlap with these populations, so summing findings would overstate affected rows. All supplier matches remain inspectable, and ambiguous joins are excluded from trusted delivery KPIs.

The original first-match join semantics are used only in the labelled workbook comparison. The lab retains stable source-row IDs and every CRM record. Known approval No or permit No can be accurately recorded information while still blocking work.

Actual completion dates were not supplied. Actual on-time performance is therefore unavailable. Forecast adherence uses supplier ETAs and is separately labelled. Every calculation uses the fixed 23 October 2026 snapshot.

See `fixture-validation.json`, `metrics.md` and `source-lineage.md` for reproducible counts, denominators and source mappings.
