# Flower Paradise

A premium, Latvian-first floral boutique demonstration for Daugavpils, Latvia. React 19, TypeScript, Vite, Tailwind CSS, React Router, Lucide and Motion. Original implementation; no template code copied.

## Run and validate

Node 22 or later. `npm ci`, then `npm run dev`. Production: `npm run build`. Quality checks: `npm run lint`, `npm run typecheck`, `npm test`. Route chunks load on demand.

## Experience

36 translated products across 12 collections; search, category/price/occasion/colour filtering and sorting; quick view; product galleries; quantities, gift messages and cards; cart, wishlist, BLOOM10 demo promotion and validated checkout. A bespoke bouquet configurator updates its price dynamically. The four-compartment vending simulator supports reservations, simulated payments, one-use codes and unlocking. Future reservations reject matching local time slots. Important dates support create/edit/delete, annual recurrence, notification previews, snoozing and dismissal. Gifts include scheduled recipient previews and one-use demo certificate redemption. Weekly, fortnightly and monthly subscriptions have duration, preference and collection options.

Customer and administrative dashboards share browser-local state. Product edits update catalog names, prices and stock locally. Admin analytics are explicitly illustrative; order/reservation/subscription views reflect the actual demo activity in this browser. Marketing configuration is a preview; BLOOM10 is the supported checkout code. No authentication, backend, card fields, real transactions, real messages or real hardware. Use fictional form values. Newsletter and corporate forms are local simulations. Privacy controls can clear personal demo records.

All interface copy, product names and descriptions are available in Latvian, Russian and English. Latvian/light mode default; language and theme persist. Keyboard focus indicators, native focus-trapping dialogs, responsive layouts and reduced-motion support are included.

## GitHub Pages

Repository identity is **a-zcare/FlowerParadise**, so the case-sensitive Pages URL is **https://a-zcare.github.io/FlowerParadise/**. It is not the requested lowercase, hyphenated path. No root `a-zcare.github.io` repository is modified. `vite.config.ts` sets `/FlowerParadise/`. Hash routing (`/#/shop`, `/#/product/fp-1`) ensures direct entry and refresh work on static Pages without rewrite infrastructure. This deliberately favours reliable refreshes over server-style route paths. The sitemap contains the canonical index; search engines do not independently index hash routes.

`.github/workflows/pages.yml` runs install, ESLint, TypeScript, tests and production build before uploading the Pages artifact. On main, it deploys to Pages using a restricted OIDC deployment job. Owner setup, if needed:

1. Open repository **Settings → Pages**. Set **Build and deployment → Source → GitHub Actions**.
2. A private repository requires a plan with private-repository Pages support. If unavailable, choose an eligible plan or explicitly decide whether to make this repository public; the implementation does not change visibility.
3. Open **Actions → Quality checks and GitHub Pages → Run workflow → main** after Pages is enabled. If an environment approval is required, approve the `github-pages` deployment.
4. Confirm the green deployment and open its returned URL. No live deployment should be assumed until verified.

The connected GitHub tool does not expose repository rename or Pages settings mutations. If the owner later renames the repository to `flower-paradise`, update the Vite base, favicon path in index.html, robots, sitemap and this README to the new path before deploying.

## Photography and references

Photographs are illustrative style references, not promises of identical commercial inventory. Sources are Unsplash free-license photographs (https://unsplash.com/license), served as optimized WebP assets. Source IDs are preserved in asset filenames; see `src/data.ts`. Third-party fonts: Cormorant Garamond and Manrope via Google Fonts (SIL Open Font License). Lucide icons use the ISC license. Dependency licenses remain with their authors.

Reference review: [Themixly floral template](https://github.com/themixlyweb/react-flower-shop-website-template) for editorial sections (repository describes MIT/free restrictions inconsistently; nothing copied), [snmada flower-shop](https://github.com/snmada/flower-shop) for filter/admin interaction concepts (no code/assets reused), [Epic Design Labs ecommerce starter](https://github.com/Epic-Design-Labs/nextjs-ecommerce-starter) for cart/wishlist/checkout patterns (MIT; no code/assets reused). The app uses a small Context store rather than a backend or complex state library.

Future integration points: replace local order/reservation writes with verified server requests; validate stock and slot allocation server-side; use provider-generated pickup codes and transactional notifications; integrate a payment provider only with a secure backend. The current frontend is a complete demonstration, not a production transaction system.
