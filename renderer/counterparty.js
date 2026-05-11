const _cpCache = new Map();

async function getCounterparty(account, mode = 'deposit') {
    if (!account) return { to: [], ccBackup: [], resolvedAs: null, clientCode: '' };
    const key = `${mode}|${account.accountNo}|${account.custodian}|${account.book}`;
    if (_cpCache.has(key)) return _cpCache.get(key);
    const params = new URLSearchParams({
        accountNo: account.accountNo || '',
        custodian: account.custodian || '',
        book: account.book || '',
        mode,
    });
    const res = await fetch(`/api/counterparty?${params}`);
    const json = res.ok ? await res.json() : { to: [], ccBackup: [], resolvedAs: null, clientCode: '' };
    _cpCache.set(key, json);
    return json;
}

function counterpartySalutation(cp) {
    if (!cp || !cp.to || cp.to.length === 0) return 'Team';
    // Extract first name from each To recipient — handle "LastName, FirstName"
    // ("Cheng, Heidi" → "Heidi") and "FirstName LastName" ("Harry Bao" → "Harry").
    const firstNames = cp.to
        .map(r => r.name)
        .filter(Boolean)
        .map(name => {
            const m = name.match(/,\s*(\S+)/);
            return m ? m[1] : name.split(/\s+/)[0];
        });
    if (firstNames.length === 0) return 'Team';
    if (firstNames.length === 1) return firstNames[0];
    if (firstNames.length === 2) return `${firstNames[0]} and ${firstNames[1]}`;
    // 3+ recipients: "A, B and C"
    return firstNames.slice(0, -1).join(', ') + ' and ' + firstNames[firstNames.length - 1];
}

function _clearCache() { _cpCache.clear(); }

window.PoseidonCounterparty = { getCounterparty, counterpartySalutation, _clearCache };
