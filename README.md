# poseidon-trade-ops

An Electron desktop tool for the Poseidon trading desk. Generates pre-filled emails for FX orders, Call/FTD deposits, and one-off / SI loans across UBS, Nomura, UOBKH, JB, LGT, CAI, and BOS counterparties.

Account list is pulled from Airtable; counterparty routing (which RM gets the email per bank/desk) lives in `counterparty.json`.

---

## Features

- **5 tabs**: FX Order, Call Deposit, FTD Deposit, One-off Loan, SI Loan
- **Airtable-driven accounts**: Search by short number or name; routing auto-resolves per bank/desk
- **UBS HK/SG FX DAC routing**: 4 listed accounts auto-route to FX DAC with per-account client codes
- **Pre-checks**: Call Deposit Place < 50K USD warning; currency-precision rounding (JPY/KRW/TWD/HKD)
- **Charts**: USDJPY-style spot reference for FX limit orders (Yahoo Finance, 60s cache)
- **Rich email formatting**: mailto opens with plain text + Calibri 12 + bold a/c line copied to clipboard for ⌘V paste

---

## Prerequisites

- **Node.js**: Version 14.x or later (recommended)
- **npm**: Included with Node.js installation
- **Internet Connection**: Required for fetching real-time FX data and the Airtable account list
- **Airtable PAT**: Read access on the `Poseidon DB` base (see "First-time setup" below)

---

## First-time setup (Airtable credentials)

The app fetches the account list from Airtable. Each user needs their own Personal Access Token.

1. In Airtable → **Builder Hub → Personal access tokens**, create a token with at minimum:
   - Scope: `data.records:read`
   - Access: the `Poseidon DB` base
2. Drop a `.env` file with that token in the location for your environment:

   | Mode             | Path                                                                 |
   | ---------------- | -------------------------------------------------------------------- |
   | Dev (`npm start`)| `<repo>/.env`                                                        |
   | Installed (Mac)  | `~/Library/Application Support/Poseidon Trade Ops/.env`              |
   | Installed (Win)  | `%APPDATA%\Poseidon Trade Ops\.env`                                  |

3. Use `.env.example` in this repo as the template:

   ```
   AIRTABLE_PAT=patXXXXXXXXXXXXXX.YYYYYYYYYYYYY...
   AIRTABLE_BASE_ID=app2U49wa2ylprOBP
   AIRTABLE_ACCOUNTS_TABLE_ID=tblVOMFxcFEBZSRMU
   ```

The app reads `userData/.env` first; if `AIRTABLE_PAT` is missing there, it falls back to `<repo>/.env` (dev convenience).

`counterparty.json` (in the repo root) maps each bank's custodian code to the RM and backup CC. Update it as relationships change — it ships with the app.

---

## Installation

```bash
# Clone the repository
git clone https://github.com/markqian1998/poseidon-trade-ops.git

# Navigate to the project directory
cd poseidon-trade-ops

# Install the required dependencies
npm install
````

---

## Usage

```bash
# Start the server
node server.js
```

1. Open a web browser and navigate to [http://localhost:3000](http://localhost:3000) (or the port specified in `server.js`)
2. Use the interface to:

   * Input FX order details
   * View spot references and historical trading data (last 3 days, updated at 30-minute intervals)
   * Submit orders via email with a subject line like: `FX Orders - YYYYMMDD`
3. Monitor the terminal/console for server logs or errors

---

## Project Structure

```
poseidon-trade-ops/
├── main.js                    # Electron main process
├── server.js                  # Express backend (Airtable proxy + price feed)
├── index.html                 # Renderer (5-tab UI)
├── counterparty.json          # Bank → RM routing
├── renderer/
│   ├── common.js              # Shared helpers (formatNotional, toast, ...)
│   ├── account-picker.js      # Airtable-driven account search component
│   ├── counterparty.js        # Counterparty resolution + cache
│   ├── templates.js           # Per-tab email body templates
│   └── tab-factory.js         # Factory used by Call/FTD/Loan tabs
├── assets/                    # App icons, user guide
├── .env.example               # Template for the per-user .env
├── package.json
└── README.md
```

---

## Configuration

* Modify `server.js` to:

  * Adjust the server **port** (default: `3000`)
  * Set **email credentials** and SMTP config
* Ensure your API provider (e.g., Yahoo Finance) permits your request frequency
* Optionally adjust the historical data interval (default: 30 minutes)

---

## Contributing

We welcome contributions to improve the system! Here’s how you can contribute:

1. **Fork** the repository
2. Create a feature branch

   ```bash
   git checkout -b feature-branch
   ```
3. **Make changes** and commit

   ```bash
   git commit -m "Add new feature"
   ```
4. **Push** your changes

   ```bash
   git push origin feature-branch
   ```
5. Open a **pull request** with a clear summary

---

## License

This project is licensed under the **MIT License**.
See the `LICENSE` file for details.

---

## Troubleshooting

| Issue               | Suggested Action                                                             |
| ------------------- | ---------------------------------------------------------------------------- |
| Server Not Starting | Ensure Node.js and npm are properly installed. Check the console for errors. |
| Data Not Loading    | Verify internet connection and API availability. Adjust interval settings.   |
| Email Issues        | Check SMTP credentials and configuration in `server.js`                      |

---

## Acknowledgments

* Built to optimize FX order workflows for PPFGO traders
* Inspired by operational needs and powered by open-source Node.js technologies

```
