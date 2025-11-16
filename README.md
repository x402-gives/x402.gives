# x402.gives

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Powered by x402](https://img.shields.io/badge/powered%20by-x402-blue)](https://x402.org)
[![Built on x402x](https://img.shields.io/badge/built%20with-x402x.dev-purple)](https://x402x.dev)
[![Support x402.gives](https://img.shields.io/badge/donate-x402.gives-blue?logo=githubsponsors&logoColor=white)](https://x402.gives/github.com/x402-gives/x402.gives)

`x402.gives` is a zero-backend donation app powered by the x402 protocol and the x402x settlement framework. Maintainers host it as a static site (recommended repo: [`x402-gives/x402.gives`](https://github.com/x402-gives/x402.gives)), while creators use it to publish verifiable GitHub donation pages or quick wallet links under the canonical domain [`https://x402.gives`](https://x402.gives).

> Everyone can give, nothing is held.

---

## Live Resources

- **App:** [`https://x402.gives`](https://x402.gives)
- **Developer guide:** [`docs/developer-guide.md`](./docs/developer-guide.md)
- **Facilitator:** [`https://facilitator.x402x.dev`](https://facilitator.x402x.dev) (default backend used by the app)

---

## Why x402.gives

- **Verified donation links** – GitHub repos/users can host `.x402/donation.json` and automatically receive a “Verified” badge, including creator metadata and repository links.
- **QuickLink builder** – any EVM address (or ENS, once resolved) can encode a donation config in the URL hash, no backend or repo needed.
- **Split-friendly payouts** – recipients are defined in basis points and automatically displayed inside `RecipientCard`.
- **x402-native payments** – collections are executed through `@x402x/client`, Reown AppKit, and the open facilitator at `x402x.dev`, inheriting all x402 protocol guarantees.
- **Static-first deployment** – built with React 19 + Vite, so it can be deployed to Vercel, Netlify, Pages, or any CDN.

---

## Architecture at a Glance

```
Welcome / Builder selector
        ↓
Route (/:address | /github.com/:owner/:repo)
        ↓ useRecipient hook
 Give page + Builder preview
        ├─ RecipientCard (metadata + splits)
        ├─ AmountSelector / GiveButton
        └─ BuilderPanel (GitHub or QuickLink)
                ↳ BuilderOutputTabs (URL + badge snippets)
        ↓
 DonateDialog → useX402Payment → facilitator.x402x.dev
```

Key files:

- `src/hooks/useRecipient.ts` – resolves GitHub configs or QuickLink hash payloads into `RecipientPageData`.
- `src/pages/Give.tsx` – renders donation UI, handles Builder preview (`?builder=true`).
- `src/components/BuilderPanel*` – forms for GitHub + QuickLink flows (preview, copy, GitHub editor deep-links).
- `src/hooks/useX402Payment.ts` & `src/lib/x402.ts` – integrate `@x402x/client`, `@x402x/core`, and `https://x402x.dev`.

For a full breakdown see [`docs/developer-guide.md`](./docs/developer-guide.md).

---

## Getting Started

### Prerequisites

- Node.js ≥ 20
- pnpm ≥ 9 (monorepo uses pnpm workspaces)
- Reown (WalletConnect) project ID for wallet connections

### Setup

```bash
# install workspace dependencies
pnpm install

# go to the app
cd apps/gives

# run dev server (also builds local @x402x/* packages)
pnpm dev

# build for production
pnpm build

# GitHub Pages / hash-routing build
pnpm build:gh
```

Create `apps/gives/.env` (ignored by git):

```env
VITE_WALLETCONNECT_PROJECT_ID=your_reown_project_id
VITE_BASE_URL=/        # override when hosting under a sub-path
VITE_USE_HASH_ROUTE=false
```

---

## Donation Configuration (TL;DR)

Full schema + examples live in [`docs/developer-guide.md`](./docs/developer-guide.md). Essentials:

- **File location (GitHub verified mode):**
  - User (profile repo): `https://raw.githubusercontent.com/<user>/<user>/main/.x402/donation.json`
  - Repo: `https://raw.githubusercontent.com/<user>/<repo>/main/.x402/donation.json`
- GitHub user-level links leverage the profile repository (`<username>/<username>`). Create it (GitHub already uses it for profile README) and add `.x402/donation.json` under the repo root.
- **Required field:** `payTo` (primary recipient).
- **Optional:** `recipients` (bips ≤ 10000), `title`, `description`, `creator`, `defaultAmount`, `network`, `links`.
- **QuickLink mode:** configuration is base64-encoded in the URL hash; the path address is always enforced as `payTo`.

Builder previews never mutate the browser URL. The **Copy URL** button is the source of truth for the final share link.

---

## Deployment Notes

- **Domain:** `x402.gives`. Keep `VITE_BASE_URL=/` and configure the DNS record at your hosting provider.
- **Repository name:** matching the domain (`x402-gives/x402.gives`) keeps marketing copy and GitHub URLs consistent. If you plan to host multiple properties, consider `x402-gives/app`.
- **Static hosting:** for hosts without SPA rewrites, set `VITE_USE_HASH_ROUTE=true` or run `pnpm build:gh` (which preconfigures `/x402-gives/` as the base path).
- **Facilitator:** default is `https://facilitator.x402x.dev`. Override `FACILITATOR_URL` in `src/lib/x402.ts` if you run a private facilitator.

---

## External Dependencies

- [`https://x402.org`](https://x402.org) – core protocol specification.
- [`https://x402x.dev`](https://x402x.dev) – settlement router + facilitator docs used by this project.
- [`https://facilitator.x402x.dev`](https://facilitator.x402x.dev) – default facilitator backend.

---

## Contributing

1. Follow the Git workflow rules defined in [`.github/WORKFLOW.md`](../../.github/WORKFLOW.md).
2. Use TypeScript everywhere, keep code style aligned with existing patterns, and update [`docs/developer-guide.md`](./docs/developer-guide.md) when altering behavior.
3. Open PRs instead of pushing directly; never push to `main` without review.

Issues and PRs are welcome!

---

## License

MIT – see [`LICENSE`](./LICENSE) for details.
