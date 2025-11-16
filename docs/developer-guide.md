# x402.gives Developer Guide

Unified reference for maintainers of the `x402.gives` application. This guide replaces the ad-hoc docs that previously lived under `docs/` and reflects the current implementation inside `apps/gives`.

- **Repository (recommended):** [`x402-gives/x402.gives`](https://github.com/x402-gives/x402.gives)
- **Production domain:** [`https://x402.gives`](https://x402.gives)
- **Protocol dependencies:** [`https://x402.org`](https://x402.org) · [`https://x402x.dev`](https://x402x.dev)

---

## 1. Architecture Overview

```
Route (Welcome / Give / Builder)
        │
        ▼
useRecipient hook ──→ RecipientCard (display layer)
        │                   │
        │                   ├─ Builder preview + link outputs
        │                   └─ AmountSelector + GiveButton
        ▼
DonateDialog → useX402Payment → facilitator.x402x.dev → SettlementRouter (x402.x)
```

- **Framework:** React 19 + Vite + Tailwind (Shadcn UI). Entry point: `src/main.tsx`.
- **Routing:** `src/Router.tsx` handles Welcome (`/`), Docs (`/docs`), donation pages (`/github.com/:user/:repo?` or `/:address`), builder redirects, and placeholder badge route.
- **State resolution:** `src/hooks/useRecipient.ts` inspects the URL, loads GitHub configs or quick-link payloads, and returns a `RecipientPageData` object consumed by `pages/Give.tsx`.
- **Builder experience:** `BuilderSelector` → `BuilderRedirect` → `Give` + `BuilderPanel`. Preview never mutates the URL; shared links encode the config (`#...`) or point to GitHub configs.
- **Payments:** `hooks/useX402Payment.ts` wraps `@x402x/client`, sending signed EIP-3009 transfers through `https://facilitator.x402x.dev`. Network metadata (SettlementRouter, TransferHook, USDC) is mirrored from `@x402x/core`.

---

## 2. Routing Modes

| Route | Example | Source | Verification | Notes |
|-------|---------|--------|--------------|-------|
| GitHub user | `/github.com/jolestar` | `https://raw.githubusercontent.com/jolestar/jolestar/main/.x402/donation.json` | ✅ if file exists | Auto-fills profile info via GitHub REST API (profile repository). |
| GitHub repo | `/github.com/jolestar/x402-exec` | `https://raw.githubusercontent.com/jolestar/x402-exec/main/.x402/donation.json` | ✅ if file exists | Falls back to user config if repo file missing. |
| QuickLink | `/0x742d…?builder=true` or `/0x742d…#BASE64` | Hash payload (`encodeConfigToHash`) | ⚠️ Unverified | Minimal default config created when hash is absent. |
| Builder entry | `/builder/...` | Redirects to donation route with `?builder=true` | n/a | Forces builder sidebar + preview state. |

If a GitHub route lacks `payTo`, the UI renders `GitHubRepoPage`, guiding maintainers to create `.x402/donation.json`.

---

## 3. Donation Configuration Schema

### Location

| Scenario | Path |
|----------|------|
| GitHub user (profile repo) | `https://raw.githubusercontent.com/<username>/<username>/main/.x402/donation.json` |
| GitHub repo | `https://raw.githubusercontent.com/<username>/<repo>/main/.x402/donation.json` |
| QuickLink | Base64-encoded JSON in the URL hash (`/<address>#<payload>`) |

> **Profile repository requirement:** User-level links look for `.x402/donation.json` inside the GitHub profile repository (`<username>/<username>`). Create that repository (GitHub already uses it for profile README) before adding the config file.

### TypeScript definition (`src/types/donation-config.ts`)

```ts
interface X402DonationConfig {
  payTo: Address;                   // Required primary recipient
  recipients?: { address: Address; bips: number; }[];
  title?: string;
  description?: string;
  creator?: { handle: string; avatar?: string; };
  defaultAmount?: string;           // e.g. "5" or "$5"
  network?: string | string[];      // Supported networks (optional)
  links?: { url: string; label?: string; }[];
}
```

### Network Field

The `network` field specifies which blockchain networks accept donations for this recipient:

- **If specified**: Only the listed network(s) will be available for donations. Use this for contract addresses that differ across networks to prevent cross-network errors.
- **If omitted**: All supported networks will be available (suitable for EOA addresses that are the same across networks).

**Format:**
- Single network: `"base"` or `["base"]`
- Multiple networks: `["base", "base-sepolia"]`
- All networks: `undefined` or omit the field

**Network identifiers** must match the network names from `@x402x/core`:
- `"base"` - Base Mainnet
- `"base-sepolia"` - Base Sepolia (Testnet)
- `"x-layer"` - X Layer Mainnet
- `"x-layer-testnet"` - X Layer Testnet

**Environment behavior:**
- In **development**: All networks (including testnets) are available
- In **production**: Testnet networks are automatically filtered out, only mainnet networks are shown to users

**Best practices:**
- For **contract addresses**: Always specify `network` to prevent users from accidentally donating to the wrong network
- For **EOA addresses**: You can omit `network` to allow donations on all networks

### Validation rules

1. `payTo` is mandatory; donations revert without it.
2. `recipients` is optional. When present, its `bips` sum must be `≤ 10000`. Remainder flows to `payTo`.
3. Additional recipients must use checksum-compatible Ethereum addresses.
4. QuickLink hash payloads are rehydrated via `decodeConfigFromHash`; malformed payloads are ignored and default to `{ payTo: <route address> }`.

### Examples

**Single network (contract address):**
```json
{
  "payTo": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "title": "Support x402.gives",
  "description": "Transparent x402-powered donations for our community tools.",
  "defaultAmount": "5",
  "network": "base"
}
```

**Multiple networks:**
```json
{
  "payTo": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "title": "Support x402.gives",
  "network": ["base", "x-layer"]
}
```

**All networks (EOA address, network field omitted):**
```json
{
  "payTo": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "title": "Support x402.gives",
  "description": "Transparent x402-powered donations for our community tools.",
  "creator": {
    "handle": "x402-team",
    "avatar": "https://avatars.githubusercontent.com/u/000000?v=4"
  },
  "defaultAmount": "5",
  "recipients": [
    { "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", "bips": 7000 },
    { "address": "0x036CbD53842c5426634e7929541eC2318f3dCF7e", "bips": 3000 }
  ],
  "links": [
    { "url": "https://github.com/x402-gives/x402.gives", "label": "Repository" },
    { "url": "https://x402.gives/docs", "label": "Docs" }
  ]
}
```

---

## 4. QuickLink Encoding & Preview

- Builder hashes are generated with `encodeConfigToHash` (`src/lib/quicklinkConfig.ts`) and appended after `#`.
- When visiting `/0xABC...#HASH`, `useRecipient` decodes the payload, enforces `payTo` to match the route address, and sets `metadata.source.type = "quicklink"`.
- Builder preview (`?builder=true`) never mutates the URL. Clicking **Preview Changes** stores the config in local state so the left panel rerenders immediately, while the share URL button copies the persisted hash-based link.

---

## 5. Builder Experience

### Components

- `pages/BuilderSelector.tsx`: entry screen that routes to `/builder/github.com/...` or `/builder/<address>`.
- `pages/BuilderRedirect.tsx`: rewrites builder URLs to the donation route + `?builder=true`.
- `components/BuilderPanel.tsx`: sidebar host that renders `BuilderPanelGitHub` or `BuilderPanelQuickLink`.
- `components/BuilderOutputTabs.tsx`: surfaces donation URL + Markdown/HTML badge snippets.

### GitHub Builder (`BuilderPanelGitHub`)

- Loads `.x402/donation.json` (if present) via `fetchGitHubConfig`.
- Auto-populates title/description/creator/links from the repository REST API when a config file is missing.
- Actions:
  - **Preview Changes** → send config to the Give page without touching URL.
  - **Refresh config** → bypasses cache for `.x402/donation.json`.
  - **Open GitHub editor** → opens `/edit` (existing file, content copied to clipboard) or `/new` (pre-filled `value=`) for quick commits.
  - **Download / Copy config JSON** for offline editing.

### QuickLink Builder (`BuilderPanelQuickLink`)

- Reads the current hash payload (if any) to pre-fill form values.
- Lets creators add optional metadata, additional recipients, and related links.
- Generates shareable URL + badges and enforces `payTo` + `recipients` validation before enabling preview/copy.

---

## 6. Payment Flow

1. `GiveButton` opens `DonateDialog`, which invokes `useX402Payment`.
2. `useX402Payment`:
   - Validates recipients (`validateRecipientConfig`).
   - Builds an `X402Client` via `createX402Client` (facilitator URL `https://facilitator.x402x.dev`).
   - Converts UI amount into USDC atomic units (`parseDefaultAssetAmount`).
   - Encodes split recipients for `TransferHook`.
   - Executes an authorization + facilitator submission without waiting for on-chain confirmation.
3. Supported networks and token metadata are pulled from `@x402x/core` (`constants/networks.ts`), mirroring live SettlementRouter deployments published on [`https://x402x.dev`](https://x402x.dev).

Wallet connectivity is handled by Reown AppKit + Wagmi. Configure `VITE_WALLETCONNECT_PROJECT_ID` before running the app locally.

---

## 7. Development Workflow

| Task | Command |
|------|---------|
| Install deps | `pnpm install` (root) |
| Dev server | `cd apps/gives && pnpm dev` (builds local `@x402x/*` workspaces first) |
| Production build | `cd apps/gives && pnpm build` |
| GitHub Pages build (hash routing) | `pnpm build:gh` |

### Environment variables

Create `apps/gives/.env`:

```
VITE_WALLETCONNECT_PROJECT_ID=your_reown_project_id
VITE_BASE_URL=/          # override when hosting under a sub-path
VITE_USE_HASH_ROUTE=false # set true for static hosts without SPA rewrites
```

### Directory map

```
apps/gives/
├── src/
│   ├── pages/           # Welcome, Give, Docs, Badge, Builder
│   ├── components/      # UI primitives + Builder panels
│   ├── hooks/           # useRecipient, useX402Payment, etc.
│   ├── lib/             # GitHub + QuickLink helpers, x402 integration
│   └── types/           # Donation config & display utilities
└── docs/                # This guide
```

---

## 8. Deployment Notes

- **Canonical domain:** `x402.gives`. Configure DNS → Vercel/Netlify (or static hosting) and keep `VITE_BASE_URL=/`.
- **Repository name:** matching domain (`x402-gives/x402.gives`) keeps URLs predictable; fork-friendly alternatives include `x402-gives/app` if you plan to host multiple surfaces.
- **Static hosts:** use `pnpm build:gh` to enable hash routing + `/x402-gives/` base path, or set `VITE_USE_HASH_ROUTE=true`.
- **External dependencies:** ensure facilitator availability (`https://facilitator.x402x.dev`) or override `FACILITATOR_URL` in `src/lib/x402.ts` for self-hosted facilitators.

---

## 9. Helpful Links

- x402 protocol: [`https://x402.org`](https://x402.org)
- x402 settlement framework (x402x): [`https://x402x.dev`](https://x402x.dev)
- Reference facilitator UI: [`https://facilitator.x402x.dev`](https://facilitator.x402x.dev)
- Primary repo (proposed): [`https://github.com/x402-gives/x402.gives`](https://github.com/x402-gives/x402.gives)

Keep this guide up to date whenever routing rules, schema fields, or builder behaviors change.

