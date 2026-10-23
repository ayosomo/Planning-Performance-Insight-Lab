# Source lineage

## Extraction

The supplied synthetic XLSX was read from its OOXML worksheet cells. No random replacement dataset was generated.

- `CRM SOURCE!A4:I243` → 240 `Order` objects.
- `SUPPLIER SOURCE!A4:F239` → 236 `Supplier` objects.
- Excel serial dates use the workbook’s standard 1900 date system and are converted using the 1899-12-30 origin.
- `record_id=CRM-<worksheet row>` and `source_id=SUP-<worksheet row>` keep physical-row identity independent of duplicated order keys.
- `src/data/fixture.json` SHA-256: `5b4db03fc0569c3005cf17b6eec6925d028dace1420f43017f8abb184e19d2ba`.

## Mapping

| Source | Fields |
| --- | --- |
| CRM A:I | order_id, account_id, region, service, planned_date, crm_status, approval, owner, constraint |
| Supplier A:F | order_id, supplier_status, supplier_eta, permit, supplier, last_updated |

Join on exact order_id strings. Keep every CRM row, all matching supplier rows and supplier-only rows. Missing joins become critical findings, ambiguous joins are not silently resolved, and supplier-only rows remain available in source export and the lineage diagnostic.

## Processing and outputs

Zod validates essential record fields. Calendar validation rejects impossible ISO dates. Pure functions in `src/engine.ts` classify findings and aggregate trusted metrics. `src/workflow.ts` records review actions, preserves source deltas, reruns all rules and reopens recurrent failures. Browser storage is schema/version checked before restoration.

No automatic feed refresh occurs. Source last_updated is not a refresh timestamp. Browser audit timestamps record the reviewer-action time; the metric snapshot remains fixed. Dashboard population filters apply before metric numerators and denominators are computed.

The immutable workbook baseline is recalculated from the original extracts. Current source corrections do not rewrite it. The inspection view shows each selected source row’s original PASS / REVIEW classification.
