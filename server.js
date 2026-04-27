const express = require('express');
const yahooFinance = require('yahoo-finance2').default;
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

let httpServer = null;

const ACCOUNTS_CACHE_TTL_MS = 10 * 60 * 1000;
let cachedAccounts = null;
let cacheLoadedAt = 0;
let cachedBankers = null;

const FIELDS = {
    accountNo: 'Account No',
    acName: 'A/C Name',
    copy: 'Copy',
    custodian: 'Custodian',
    book: 'Book',
    status: 'Status',
    loanInstruction: 'Loan Instruction',
    pc: 'PC',
    sc: 'SC',
};

function airtableHeaders() {
    const pat = process.env.AIRTABLE_PAT;
    if (!pat) throw new Error('AIRTABLE_PAT is not set. See .env.example.');
    return { Authorization: `Bearer ${pat}` };
}

function emailFromUserField(value) {
    if (!value) return '';
    if (Array.isArray(value)) return value[0] && value[0].email ? value[0].email : '';
    if (typeof value === 'object' && value.email) return value.email;
    return '';
}

function normalizeAccount(record) {
    const f = record.fields || {};
    return {
        id: record.id,
        accountNo: f[FIELDS.accountNo] || '',
        acName: f[FIELDS.acName] || '',
        copy: f[FIELDS.copy] || '',
        custodian: f[FIELDS.custodian] || '',
        book: f[FIELDS.book] || '',
        status: f[FIELDS.status] || '',
        loanInstruction: f[FIELDS.loanInstruction] || '',
        pcEmail: emailFromUserField(f[FIELDS.pc]),
        scEmail: emailFromUserField(f[FIELDS.sc]),
    };
}

async function loadAccountsFromAirtable() {
    const baseId = process.env.AIRTABLE_BASE_ID;
    const tableId = process.env.AIRTABLE_ACCOUNTS_TABLE_ID;
    if (!baseId || !tableId) throw new Error('AIRTABLE_BASE_ID / AIRTABLE_ACCOUNTS_TABLE_ID not set.');

    const fields = Object.values(FIELDS).map(n => `fields%5B%5D=${encodeURIComponent(n)}`).join('&');
    const filter = `filterByFormula=${encodeURIComponent("{Status}='Opened'")}`;
    const baseUrl = `https://api.airtable.com/v0/${baseId}/${tableId}?pageSize=100&${fields}&${filter}`;

    const all = [];
    let offset;
    do {
        const url = offset ? `${baseUrl}&offset=${encodeURIComponent(offset)}` : baseUrl;
        const res = await fetch(url, { headers: airtableHeaders() });
        if (!res.ok) {
            const body = await res.text();
            throw new Error(`Airtable ${res.status}: ${body}`);
        }
        const json = await res.json();
        for (const r of json.records) all.push(normalizeAccount(r));
        offset = json.offset;
    } while (offset);

    return all;
}

async function getAccounts(forceRefresh = false) {
    const now = Date.now();
    if (forceRefresh || !cachedAccounts || now - cacheLoadedAt > ACCOUNTS_CACHE_TTL_MS) {
        cachedAccounts = await loadAccountsFromAirtable();
        cacheLoadedAt = now;
    }
    return cachedAccounts;
}

function searchAccounts(accounts, q) {
    if (!q) return accounts.slice(0, 10);
    const needle = String(q).toLowerCase();
    const scored = [];
    for (const a of accounts) {
        const copy = (a.copy || '').toLowerCase();
        const acno = (a.accountNo || '').toLowerCase();
        const name = (a.acName || '').toLowerCase();
        let score = -1;
        if (copy === needle || acno === needle) score = 0;
        else if (copy.startsWith(needle) || acno.startsWith(needle)) score = 1;
        else if (copy.includes(needle) || acno.includes(needle)) score = 2;
        else if (name.includes(needle)) score = 3;
        if (score >= 0) scored.push({ score, a });
    }
    scored.sort((x, y) => x.score - y.score);
    return scored.slice(0, 10).map(s => s.a);
}

function loadBankers() {
    if (cachedBankers) return cachedBankers;
    const candidates = [
        path.join(__dirname, 'bankers.json'),
        path.join(process.resourcesPath || __dirname, 'bankers.json'),
    ];
    for (const p of candidates) {
        if (fs.existsSync(p)) {
            cachedBankers = JSON.parse(fs.readFileSync(p, 'utf8'));
            return cachedBankers;
        }
    }
    cachedBankers = {};
    return cachedBankers;
}

function createServer() {
    const app = express();
    app.use(express.json());
    app.use(express.static(path.join(__dirname)));

    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'index.html'));
    });

    app.get('/api/price/:pair', async (req, res) => {
        const pair = req.params.pair + '=X';
        try {
            const endDate = new Date();
            const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
            const result = await yahooFinance.chart(pair, {
                period1: startDate,
                period2: endDate,
                interval: '30m'
            });
            const formattedData = result.quotes
                .filter(q => q.close != null)
                .map(q => ({
                    date: new Date(q.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    close: Number(q.close.toFixed(4))
                }));
            res.json(formattedData);
        } catch (error) {
            console.error('API Error:', error);
            res.status(500).json({ error: error.message || 'Failed to fetch price data' });
        }
    });

    app.get('/api/accounts', async (req, res) => {
        try {
            const accounts = await getAccounts();
            res.json(searchAccounts(accounts, req.query.q));
        } catch (e) {
            console.error('GET /api/accounts:', e.message);
            res.status(500).json({ error: e.message });
        }
    });

    app.get('/api/accounts/:copy', async (req, res) => {
        try {
            const accounts = await getAccounts();
            const hit = accounts.find(a => a.copy === req.params.copy);
            if (!hit) return res.status(404).json({ error: 'Not found' });
            res.json(hit);
        } catch (e) {
            console.error('GET /api/accounts/:copy:', e.message);
            res.status(500).json({ error: e.message });
        }
    });

    app.post('/api/accounts/refresh', async (req, res) => {
        try {
            const accounts = await getAccounts(true);
            res.json({ count: accounts.length, refreshedAt: new Date().toISOString() });
        } catch (e) {
            console.error('POST /api/accounts/refresh:', e.message);
            res.status(500).json({ error: e.message });
        }
    });

    app.get('/api/bankers/:custodian', (req, res) => {
        const all = loadBankers();
        const entry = all[req.params.custodian] || { to: [], ccBackup: [] };
        res.json(entry);
    });

    httpServer = app.listen(3000);
    return httpServer;
}

function closeServer() {
    if (httpServer) {
        httpServer.close(() => {
            console.log('HTTP server closed');
            httpServer = null;
        });
    }
}

module.exports = { createServer, closeServer };

if (require.main === module) {
    createServer().on('listening', () => {
        console.log(`Server running on http://localhost:3000`);
    });
}
