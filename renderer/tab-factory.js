// Factory for the 4 deposit/loan tabs (Call Deposit, FTD, One-off Loan, SI Loan).
// Each tab supplies a config; the factory wires up account picker, currency,
// amount, dates, routing display, validation, pre-check, submit, and the
// currency-precision blur handler — eliminating ~60% of the per-tab boilerplate.
//
// FX Order tab is intentionally NOT included; its multi-order/chart shape is
// distinct enough that forcing it into this factory adds complexity without
// shared surface.
//
// Required DOM IDs per tab (where ID = config.tabId):
//   ${ID}AccountPicker, ${ID}RoutingDisplay, ${ID}Ccy, ${ID}Amount, ${ID}Generate
// Optional date IDs: ${ID}ValueDate, ${ID}StartDate, ${ID}EndDate
//
// Returns: { picker, refs, clear() } — refs exposes elements + accessors so
// per-tab code can extend (extras callback) or read state.

const _ALL_CCY = ['USD','EUR','JPY','GBP','CAD','AUD','NZD','CHF','HKD','CNH','KRW','TWD','SGD'];
const _registry = new Map(); // tabId → { clear, picker, refs }

function _fillCurrencySelect(select, defaultCcy) {
    select.innerHTML = '';
    _ALL_CCY.forEach(c => select.add(new Option(c, c)));
    select.value = defaultCcy || 'USD';
}

function _setupDate(elId, dayOffset = 0) {
    const el = document.getElementById(elId);
    if (!el) return null;
    const base = new Date();
    base.setDate(base.getDate() + dayOffset);
    const opts = { defaultDate: base, dateFormat: 'j M Y' };
    if (elId.endsWith('EndDate')) Object.assign(opts, { position: 'auto right', appendTo: document.body });
    flatpickr(el, opts);
    el.value = flatpickr.formatDate(base, 'j M Y');
    return el;
}

async function _routingFor(tabId, account, mode) {
    const el = document.getElementById(`${tabId}RoutingDisplay`);
    if (!el) return;
    if (!account) { el.style.display = 'none'; return; }
    const cp = await PoseidonCounterparty.getCounterparty(account, mode || 'deposit');
    el.style.display = 'block';
    if (!cp || !cp.resolvedAs || !cp.to || cp.to.length === 0) {
        el.className = 'alert alert-warning mb-3';
        el.textContent = `No counterparty configured for ${account.custodian || '?'}/${account.book || '?'} — submit may fail.`;
        return;
    }
    el.className = 'alert alert-info mb-3';
    el.innerHTML = `Routing to: <strong>${cp.resolvedAs}</strong> &middot; To: ${cp.to.map(r => r.email).join(', ')}`;
}

function _buildCcList(cp, account) {
    const me = PoseidonCommon.myEmail();
    return [
        ...(cp.ccBackup || []),
        'fa@ppgfo.com',
        ...(account.pcEmail ? [account.pcEmail] : []),
        ...(me ? [me] : []),
    ];
}

function mountDepositLoanTab(config) {
    const id = config.tabId;
    const mode = config.mode || 'deposit';

    const ccySelect    = document.getElementById(`${id}Ccy`);
    const amountInput  = document.getElementById(`${id}Amount`);
    const generateBtn  = document.getElementById(`${id}Generate`);
    const pickerHost   = document.getElementById(`${id}AccountPicker`);

    _fillCurrencySelect(ccySelect, config.currencyDefault);
    amountInput.addEventListener('input', () => { amountInput.value = PoseidonCommon.formatNotional(amountInput.value); });

    // Currency-precision check on blur (warns + auto-rounds for JPY/KRW/TWD/HKD)
    amountInput.addEventListener('blur', () => {
        const ccy = ccySelect.value;
        const { rounded, changed } = PoseidonCommon.roundAmountForCcy(amountInput.value, ccy);
        if (changed) {
            amountInput.value = rounded;
            PoseidonCommon.showToast(`${ccy} takes ${PoseidonCommon.decimalsFor(ccy)} decimals — auto-rounded.`, 'warning');
        }
    });

    // Init any date inputs the tab has
    const dates = {};
    if (config.dates) {
        for (const [name, spec] of Object.entries(config.dates)) {
            const elId = spec.elId;
            const offset = spec.dayOffset || 0;
            dates[name] = _setupDate(elId, offset);
        }
    }

    const refs = {
        tabId: id,
        ccySelect, amountInput, generateBtn, dates,
        picker: null,
        getAccount: () => refs.picker && refs.picker.getSelected(),
        getSub: () => refs.picker ? refs.picker.getSubAccount() : '',
        getCcy: () => ccySelect.value,
        getAmountStr: () => amountInput.value.trim(),
        getAmount: () => PoseidonCommon.parseNotional(amountInput.value),
    };

    refs.picker = PoseidonAccountPicker.mountAccountPicker(pickerHost, (account) => {
        generateBtn.disabled = false;
        _routingFor(id, account, mode);
        if (config.onAccountSelected) config.onAccountSelected(account, refs);
    });

    if (config.extras) config.extras(refs);

    async function buildAndSend() {
        const account = refs.getAccount();
        if (!account) return;
        const cp = await PoseidonCounterparty.getCounterparty(account, mode);
        if (!cp || !cp.to || cp.to.length === 0) {
            PoseidonCommon.showToast(`No counterparty configured for ${account.custodian || '?'}/${account.book || '?'}.`, 'danger');
            return;
        }
        const salutation = PoseidonCounterparty.counterpartySalutation(cp);
        const state = { account, cp, salutation, refs };
        const ctx = config.buildCtx(state);
        const tplFn = typeof config.template === 'function'
            ? config.template(state)
            : PoseidonTemplates[config.template];
        const tpl = tplFn(ctx);
        PoseidonCommon.openMailto(cp.to, _buildCcList(cp, account), tpl.subject, tpl.body);
        PoseidonCommon.showToast('Email opened. Paste (⌘V / Ctrl+V) in the body for Calibri 12 + bold formatting.', 'success');
    }

    generateBtn.addEventListener('click', async () => {
        const account = refs.getAccount();
        if (!account) return;

        const err = config.validate ? config.validate(refs) : null;
        if (err) { PoseidonCommon.showToast(err, 'danger'); return; }

        if (config.preCheck) {
            // preCheck returns true if validation passed and we should send;
            // false if it showed a warning modal (modal will call send() on confirm).
            const shouldSend = config.preCheck(refs, buildAndSend);
            if (!shouldSend) return;
        }
        await buildAndSend();
    });

    function clear() {
        refs.picker.clear();
        ccySelect.value = config.currencyDefault || 'USD';
        amountInput.value = '';
        generateBtn.disabled = true;
        for (const [name, el] of Object.entries(dates)) {
            if (!el) continue;
            const fp = el._flatpickr;
            const offset = (config.dates[name] && config.dates[name].dayOffset) || 0;
            const base = new Date();
            base.setDate(base.getDate() + offset);
            if (fp) fp.setDate(base, false);
            el.value = flatpickr.formatDate(base, 'j M Y');
        }
        const routing = document.getElementById(`${id}RoutingDisplay`);
        if (routing) routing.style.display = 'none';
        if (config.onClear) config.onClear(refs);
    }

    const handle = { picker: refs.picker, refs, clear };
    _registry.set(id, handle);
    return handle;
}

function clearTab(tabId) {
    const h = _registry.get(tabId);
    if (h) h.clear();
}

window.PoseidonTabFactory = { mountDepositLoanTab, clearTab };
