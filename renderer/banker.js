const _bankerCache = new Map();

async function getBanker(custodian) {
    if (!custodian) return { to: [], ccBackup: [] };
    if (_bankerCache.has(custodian)) return _bankerCache.get(custodian);
    const res = await fetch(`/api/bankers/${encodeURIComponent(custodian)}`);
    const json = res.ok ? await res.json() : { to: [], ccBackup: [] };
    _bankerCache.set(custodian, json);
    return json;
}

function bankerSalutation(banker) {
    const first = banker && banker.to && banker.to[0];
    if (!first || !first.name) return 'Team';
    const m = first.name.match(/,\s*(\S+)/);
    return m ? m[1] : first.name.split(/\s+/)[0];
}

window.PoseidonBanker = { getBanker, bankerSalutation };
