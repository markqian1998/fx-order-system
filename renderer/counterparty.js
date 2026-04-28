const _cpCache = new Map();

async function getCounterparty(account) {
    if (!account) return { to: [], ccBackup: [], resolvedAs: null };
    const key = `${account.accountNo}|${account.custodian}|${account.book}`;
    if (_cpCache.has(key)) return _cpCache.get(key);
    const params = new URLSearchParams({
        accountNo: account.accountNo || '',
        custodian: account.custodian || '',
        book: account.book || '',
    });
    const res = await fetch(`/api/counterparty?${params}`);
    const json = res.ok ? await res.json() : { to: [], ccBackup: [], resolvedAs: null };
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
