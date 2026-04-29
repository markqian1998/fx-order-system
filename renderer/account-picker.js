function mountAccountPicker(rootEl, onSelect) {
    rootEl.innerHTML = `
        <div class="mb-3 position-relative">
            <label class="form-label">Account <span class="text-muted small">(type account number <em>or</em> name — both work)</span></label>
            <div class="input-group">
                <input type="text" class="form-control account-search" autocomplete="off" placeholder="e.g. 130381  /  Next Merchant">
                <span class="input-group-text d-none account-spinner">
                    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                </span>
            </div>
            <div class="list-group account-results position-absolute w-100" style="z-index:10; max-height:240px; overflow-y:auto; display:none;"></div>
        </div>
        <div class="mb-3">
            <label class="form-label">Sub-account (optional)</label>
            <input type="text" class="form-control account-sub" placeholder="e.g. 01" maxlength="6">
        </div>
        <div class="account-display border rounded p-2 mb-3 bg-light position-relative" style="display:none;">
            <button type="button" class="btn btn-sm btn-link text-muted position-absolute top-0 end-0 m-1 account-change-btn" style="text-decoration:none;">✕ Change</button>
            <div><strong>Account No:</strong> <span class="d-acno"></span></div>
            <div><strong>A/C Name:</strong> <span class="d-name"></span></div>
            <div><strong>Book:</strong> <span class="d-book"></span> &nbsp; <strong>Custodian:</strong> <span class="d-custodian-badge"></span></div>
        </div>
    `;

    const search = rootEl.querySelector('.account-search');
    const spinner = rootEl.querySelector('.account-spinner');
    const results = rootEl.querySelector('.account-results');
    const sub = rootEl.querySelector('.account-sub');
    const display = rootEl.querySelector('.account-display');

    let selected = null;
    let debounceTimer = null;

    function _resetDisplayContent() {
        const acno = rootEl.querySelector('.d-acno');
        const name = rootEl.querySelector('.d-name');
        const book = rootEl.querySelector('.d-book');
        const badge = rootEl.querySelector('.d-custodian-badge');
        if (acno) acno.textContent = '';
        if (name) name.textContent = '';
        if (book) book.textContent = '';
        if (badge) { badge.textContent = ''; badge.className = 'd-custodian-badge badge text-bg-light'; }
    }

    const api = {
        getSelected: () => selected,
        getSubAccount: () => sub.value.trim(),
        clear: () => {
            selected = null;
            search.value = '';
            sub.value = '';
            display.style.display = 'none';
            _resetDisplayContent();
            results.style.display = 'none';
        },
    };

    function renderResults(list) {
        results.innerHTML = '';
        if (!list.length) {
            results.innerHTML = '<div class="list-group-item text-muted">No accounts found</div>';
            results.style.display = 'block';
            return;
        }
        for (const a of list) {
            const item = document.createElement('button');
            item.type = 'button';
            item.className = 'list-group-item list-group-item-action';
            item.textContent = `${a.accountNo} ${a.acName} (${a.book || '-'} / ${a.custodian || '-'})`;
            item.addEventListener('click', () => selectAccount(a));
            results.appendChild(item);
        }
        results.style.display = 'block';
    }

    function selectAccount(a) {
        console.log('[picker] selectAccount:', a);
        try {
            selected = a;
            search.value = `${a.accountNo} ${a.acName}`;
            results.style.display = 'none';
            display.style.display = 'block';
            rootEl.querySelector('.d-acno').textContent = a.accountNo;
            rootEl.querySelector('.d-name').textContent = a.acName;
            rootEl.querySelector('.d-book').textContent = a.book || '-';
            const badge = rootEl.querySelector('.d-custodian-badge');
            const color = (window.PoseidonCommon && window.PoseidonCommon.custodianColor) ? window.PoseidonCommon.custodianColor(a.custodian) : 'light';
            badge.className = `d-custodian-badge badge text-bg-${color}`;
            badge.textContent = a.custodian || '-';
        } catch (err) {
            console.error('[picker] selectAccount DOM update failed:', err);
        }
        try {
            if (onSelect) onSelect(a);
        } catch (err) {
            console.error('[picker] onSelect callback threw:', err);
        }
    }

    async function fetchAndRender(q) {
        spinner.classList.remove('d-none');
        try {
            const res = await fetch(`/api/accounts?q=${encodeURIComponent(q)}`, { cache: 'no-store' });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                results.innerHTML = `<div class="list-group-item text-danger">Error: ${err.error || res.status}</div>`;
                results.style.display = 'block';
                return;
            }
            renderResults(await res.json());
        } catch (e) {
            results.innerHTML = `<div class="list-group-item text-danger">${e.message}</div>`;
            results.style.display = 'block';
        } finally {
            spinner.classList.add('d-none');
        }
    }

    search.addEventListener('input', () => {
        const q = search.value.trim();
        selected = null;
        display.style.display = 'none';
        clearTimeout(debounceTimer);
        if (!q) {
            results.style.display = 'none';
            return;
        }
        debounceTimer = setTimeout(() => fetchAndRender(q), 150);
    });

    search.addEventListener('focus', () => {
        if (search.value.trim() && !selected) results.style.display = 'block';
    });

    document.addEventListener('click', (e) => {
        if (!rootEl.contains(e.target)) results.style.display = 'none';
    });

    // "Change" link in the account-display block: clear + focus search
    const changeBtn = rootEl.querySelector('.account-change-btn');
    if (changeBtn) {
        changeBtn.addEventListener('click', () => {
            api.clear();
            search.focus();
        });
    }

    return api;
}

window.PoseidonAccountPicker = { mountAccountPicker };
