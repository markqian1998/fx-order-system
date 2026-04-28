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
    const first = cp && cp.to && cp.to[0];
    if (!first || !first.name) return 'Team';
    const m = first.name.match(/,\s*(\S+)/);
    return m ? m[1] : first.name.split(/\s+/)[0];
}

window.PoseidonCounterparty = { getCounterparty, counterpartySalutation };
