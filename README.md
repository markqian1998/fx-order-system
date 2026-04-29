# poseidon-trade-ops

> **🌐 Web app (recommended)**: `https://poseidon-trade-ops.azurewebsites.net` — log in with your PPG Microsoft account.
>
> The desktop Electron app below still works for legacy users but is no longer the canonical path.

A tool for the Poseidon trading desk that turns recurring trade-instruction emails (FX orders, Call/FTD deposits, one-off loans, SI loans) into a few clicks. Pulls the live account list from Airtable, resolves the right counterparty (RM + CC list) per bank/desk, and opens a pre-filled draft in the user's default mail client.

The same codebase runs in two modes:
- **Web** (Azure App Service + Microsoft 365 SSO) — for the team
- **Electron desktop** (`npm start`) — for local dev or legacy users

---

## Tabs

| Tab | What it generates |
|---|---|
| 💱 **FX Order** | Multi-order FX request (Market / Limit, with chart for limit). UBS HK/SG accounts auto-route to GFIM; 4 named accounts route to FX DAC with their per-account client codes. |
| 💰 **Call Deposit** | Place / Unwind a USD/EUR/HKD/etc. call deposit. Pre-check warns if Place < 50,000 USD. |
| 💰 **FTD Deposit** | Fixed-term deposit with tenor (1w → 3y) and optional rate. UBS HK/SG accounts get an extra Spread field (default 25 bps); UBS CH books at UBS Jersey. |
| 🏦 **One-off Loan** | One-off draw to cover OD with start/end dates; "starting from today/tomorrow/{date}" auto-phrasing. |
| 🏦 **SI Loan** | Standing-instruction loan with weekly/monthly rolling, loan instruction auto-filled from the account record (default `P+I+-Balance`). |

Every generated email:
- Auto-CCs `fa@ppgfo.com` + the account's PC + the sender (`USER_EMAIL`).
- Plain body opens via `mailto:`. A Calibri-12 HTML version with the `For a/c …` line **bolded** and 3 trailing blank lines is copied to clipboard — paste (⌘V) into the body to apply formatting.

---

## Counterparty routing

`counterparty.json` is the single source of truth for who receives each email. Schema:

```json
{
  "recipients": {
    "ubs-hksg":   { "to": [...], "ccBackup": [...] },
    "ubs-ch":     { ... },
    "nomura-stan":    { ... },
    "nomura-cheery":  { ... },
    /* … one entry per desk: uobkh-hksg, jb-sg, lgt-hk, lgt-sg, cai-sg, bos-sg,
       ubs-hksg-fx-gfim, ubs-hksg-fx-dac, … */
  },
  "byKey": {
    "UBS-HK":    "ubs-hksg",
    "UBS-SG":    "ubs-hksg",
    "Nomura-SG": "nomura-cheery",
    /* … keyed by `${Custodian}-${Book}` */
  },
  "byAccount": {
    "22607898": "nomura-stan",
    /* per-account override of byKey for the deposit/loan tabs */
  },
  "fxByKey":     { "UBS-HK": "ubs-hksg-fx-gfim", "UBS-SG": "ubs-hksg-fx-gfim" },
  "fxByAccount": { "130381": "ubs-hksg-fx-dac", "375298": "ubs-hksg-fx-dac", … },
  "fxClientCodes": { "130381": "WMPOSEHK3", "375298": "WMPOSEHK2", "229613": "WMPOSESG1" }
}
```

Resolution order at submit time:
1. **FX tab** → `fxByAccount[accountNo]` → `fxByKey["${custodian}-${book}"]` → fall through to deposit logic.
2. **Deposit/loan tabs** → `byAccount[accountNo]` → `byKey["${custodian}-${book}"]`.
3. If nothing matches → routing display warns + submit disabled.

To add a new bank/desk: add it under `recipients`, add a `byKey` entry for the relevant `Custodian-Book` combo, commit. No code change.

---

## Architecture

```
┌──────────────────────────────────────────┐
│  Electron main process (main.js)         │
│   • Loads .env (userData → repo root)    │
│   • Boots Express server (server.js)     │
│   • Opens BrowserWindow → localhost:3000 │
└──────────────────────────────────────────┘
                    │
┌──────────────────────────────────────────┐
│  Express server on :3000 (server.js)     │
│   • Serves static index.html + renderer/ │
│   • /api/accounts        ← Airtable      │
│   • /api/counterparty    ← counterparty.json │
│   • /api/price/:pair     ← Yahoo Finance │
│   • /api/me              ← USER_EMAIL    │
│   • /api/accounts/refresh (manual reload)│
└──────────────────────────────────────────┘
                    │
┌──────────────────────────────────────────┐
│  Renderer (index.html + renderer/*.js)   │
│   • Bootstrap 5 nav-tabs                 │
│   • Tab factory mounts 4 deposit/loan    │
│     tabs from a config object            │
│   • FX Order tab is bespoke              │
│     (multi-order block + chart)          │
└──────────────────────────────────────────┘
```

---

## First-time setup

1. **Get an Airtable PAT** with `data.records:read` on the `Poseidon DB` base
2. **Create your `.env`** from `.env.example`:

   ```
   AIRTABLE_PAT=pat...
   AIRTABLE_BASE_ID=app2U49wa2ylprOBP
   AIRTABLE_ACCOUNTS_TABLE_ID=tblVOMFxcFEBZSRMU
   USER_EMAIL=you@ppgfo.com
   ```

   | Mode             | Where to put the file                                            |
   | ---------------- | ---------------------------------------------------------------- |
   | Dev (`npm start`)| `<repo>/.env`                                                    |
   | Installed (Mac)  | `~/Library/Application Support/Poseidon Trade Ops/.env`          |
   | Installed (Win)  | `%APPDATA%\Poseidon Trade Ops\.env`                              |

   The app reads `userData/.env` first; if `AIRTABLE_PAT` is missing there, it falls back to `<repo>/.env` (dev convenience).

3. **Install + run**:

   ```bash
   git clone https://github.com/markqian1998/poseidon-trade-ops.git
   cd poseidon-trade-ops
   npm install
   npm start
   ```

   Electron opens. No browser involved (the Express server runs internally).

---

## Common operations

### Account list out of date
Click the 🔄 **Refresh** button in the top-right (next to the tab nav). Hits `/api/accounts/refresh` and clears the renderer counterparty cache. Otherwise, the server cache TTL is **10 minutes**.

### Adding a new account
1. Add it in Airtable (Status = `Opened`, fill Custodian + Book + PC at minimum).
2. Click 🔄 Refresh.
3. If it's an FX DAC account, also add it to `fxByAccount` + `fxClientCodes` in `counterparty.json` and commit.
4. If it's a Nomura SG account that should route to Stan instead of Cheery, add it to `byAccount`.

### Adding a new tab
The 4 deposit/loan tabs use `renderer/tab-factory.js`. To add a 5th similar one:
1. Add the tab nav button + form pane in `index.html`.
2. Add the email template function in `renderer/templates.js`.
3. Call `PoseidonTabFactory.mountDepositLoanTab({ tabId, mode, dates, validate, buildCtx, template, … })` once with your config.

The FX Order tab is hand-rolled (multi-order, charts) and not driven by the factory.

---

## Building installers

```bash
npm run build:mac        # → dist/ Poseidon Trade Ops.dmg
npm run build:win        # → dist/ Poseidon Trade Ops Setup.exe
npm run dist             # both Mac + Win in one go
```

---

## Project structure

```
poseidon-trade-ops/
├── main.js                    # Electron main process
├── server.js                  # Express backend (Airtable proxy + price feed + counterparty)
├── index.html                 # Renderer (5-tab UI)
├── counterparty.json          # Bank → RM routing config
├── renderer/
│   ├── common.js              # Shared helpers (formatNotional, toast, currency precision, …)
│   ├── account-picker.js      # Airtable-driven account search component
│   ├── counterparty.js        # /api/counterparty client + cache
│   ├── templates.js           # Per-tab email body templates
│   └── tab-factory.js         # Factory used by Call/FTD/Loan tabs
├── assets/
│   ├── poseidon-logo.png      # Header logo
│   ├── mac-icon.png           # macOS app icon
│   └── win-icon.ico           # Windows app icon
├── .env.example               # Template for the per-user .env (real .env is gitignored)
├── package.json
└── README.md
```

---

## Troubleshooting

| Symptom | First thing to try |
|---|---|
| Account search returns no results | `.env` missing or wrong PAT — see DevTools console (⌘+Opt+I) for `AIRTABLE_PAT not set` errors |
| Account list looks stale | Click 🔄 Refresh in the tab nav |
| Routing display says "No counterparty configured for X/Y" | Add `X-Y` under `byKey` (or `fxByKey` for FX) in `counterparty.json` |
| Chart shows "Chart unavailable: Too Many Requests" | Yahoo rate-limit; auto-retries built in, otherwise wait a few minutes |
| Custodian badge / routing still shows the previous account after re-selecting | Should be fixed; if not, ⌘+Shift+R hard reload and report |
| Email opens in plain text without Calibri / bold | Click into the body and ⌘V — the rich version is in your clipboard |

---

## License

Internal tool. Not for public distribution.
