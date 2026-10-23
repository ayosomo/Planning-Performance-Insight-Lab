# Release record

- Live app: https://planning-performance-insight-lab.vercel.app/
- Source repository: https://github.com/ayosomo/Planning-Performance-Insight-Lab
- Release date: 23 October 2026.
- Vercel production deployment: `dpl_ECZvMoi7zWUFmCU71qktc7okCgxQ`, READY.
- Publication: reviewed static build artifacts and synthetic screenshots; source published separately in this repository.
- Verification: 45 automated tests, 10 local production-browser checks, 10 repeated public-browser checks, eight accessibility states with no axe violations, no browser runtime errors.
- Security headers: CSP, nosniff, strict-origin referrer policy and disabled camera/microphone/geolocation verified on the public URL.

The public app and repository contain synthetic operational data and clearly labelled historical professional context. Original application documents, private review observations, private interview preparation and the private evidence hub are excluded from the repository.

`npm run dev` builds and serves the validated production app locally to avoid the conventional hot-reload optimizer’s peak memory use on the test workstation. `npm run dev:vite` retains optional hot reload. This local-launcher choice does not alter the public browser bundle.

The final default local command passed its build, dashboard and investigation-dialog browser check. The source package includes reproducible tests and the recorded local/public verification reports.
