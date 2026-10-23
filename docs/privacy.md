# Privacy and public-demo boundary

Operational fixture data is fictional, including account, order, supplier and owner labels. The public product contains only that fixture, application code and a concise historical professional case study. The original application PDF, Excel file, private Notion hub link, interview notes and local extraction files are not public assets.

The optional snapshot QA workflow uses Nitro API routes and Vercel Workflow SDK. Its stored run state contains only the committed fictional dataset, derived control results and generated run metadata. The trigger accepts no uploaded records. Browser reviewer names, notes and source corrections are not uploaded. Vercel also processes ordinary hosting request logs. There are no application accounts, analytics, email or live CRM integrations. No custom credentials are required; deployed workflow infrastructure uses Vercel-managed identity. Local development stores run data in the ignored `.workflow-data/` directory.

Review changes and simulated reviewer identities persist in localStorage within one browser profile and site origin. Other visitors using separate browser profiles or devices cannot alter that state. Shared devices/profiles share local state; this is not a multi-user isolation or authentication system. Concurrent tabs are not synchronised into an authoritative workflow and the latest save may overwrite a previous tab’s state.

Use only fictional reviewer names and synthetic evidence. Export is an explicit local JSON download. Reset restores the original fixture and clears browser workflow state. Storage failures display a warning, retain the current in-memory state and allow export. Corrupt saved state falls back to the original fixture with a visible warning; it is not silently declared valid.

Audit events record simulated reviewer identity, real action timestamp, reason, evidence and source deltas. These logs are illustrative, not tamper-proof. A visitor can edit local storage or reset it. They do not establish production-grade access control, evidence retention or separation of duties.

The UI renders user-entered notes as React text, without HTML injection. Vercel headers restrict scripts and network connections, disallow embedding, remove MIME sniffing and disable unused device permissions. This is a practical security review for a synthetic demonstration, not a penetration-test certification.
