function formatNotional(value) {
    const cleanValue = String(value).replace(/[^0-9.]/g, '');
    if (!cleanValue) return '';
    const parts = cleanValue.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.length > 1 ? `${parts[0]}.${parts[1]}` : parts[0];
}

function parseNotional(value) {
    return Number(String(value).replace(/,/g, ''));
}

// 0-decimal currencies (no fractional units in market convention).
const CCY_DECIMALS = { JPY: 0, KRW: 0, TWD: 0, HKD: 0 };
function decimalsFor(ccy) { return ccy in CCY_DECIMALS ? CCY_DECIMALS[ccy] : 2; }

// Round a notional string to the currency's allowed precision.
// Returns { rounded: string, changed: bool }. Empty/invalid input → no change.
function roundAmountForCcy(amountStr, ccy) {
    const trimmed = String(amountStr || '').trim();
    if (!trimmed) return { rounded: trimmed, changed: false };
    const n = parseNotional(trimmed);
    if (!isFinite(n)) return { rounded: trimmed, changed: false };
    const dec = decimalsFor(ccy);
    const factor = Math.pow(10, dec);
    const r = Math.round(n * factor) / factor;
    const formatted = r.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
    return { rounded: formatted, changed: r !== n };
}

function formatDateForSubject(date) {
    const d = date || new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

// "8 Apr 2026" — used in loan body "til {date}"
function formatDateShort(date) {
    const d = date instanceof Date ? date : new Date(date);
    return flatpickr.formatDate(d, 'j M Y');
}

// "26 March 2026" — used in SI loan body "starting from today {date}"
function formatDateLong(date) {
    const d = date instanceof Date ? date : new Date(date);
    return flatpickr.formatDate(d, 'j F Y');
}

// "today" / "tomorrow" / "8 May 2026" — used in loan bodies for "starting from {label}"
function startDateLabel(date) {
    const d = date instanceof Date ? date : new Date(date);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const target = new Date(d); target.setHours(0, 0, 0, 0);
    const diffDays = Math.round((target - today) / 86400000);
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'tomorrow';
    return formatDateShort(d);
}

// "Today" / "Tomorrow" / "8 May 2026" — used in deposit bodies for "Value {label}"
function valueDateLabel(date) {
    const s = startDateLabel(date);
    return s.charAt(0).toUpperCase() + s.slice(1);
}

function _escapeHtml(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// Convert plain-text body to Calibri 12 HTML, bolding any line that starts with "For a/c ",
// and appending 3 blank lines so the recipient's Outlook signature doesn't snug against the body.
function _bodyToCalibriHtml(plainBody) {
    const lines = plainBody.split('\n');
    const htmlLines = lines.map(line => {
        const esc = _escapeHtml(line);
        const styled = /^For a\/c /.test(line) ? `<strong>${esc}</strong>` : esc;
        return `<div>${styled || '<br>'}</div>`;
    });
    // 3 trailing blank lines between body and signature
    htmlLines.push('<div><br></div>', '<div><br></div>', '<div><br></div>');
    return `<div style="font-family: Calibri, sans-serif; font-size: 12pt;">${htmlLines.join('')}</div>`;
}

function openMailto(to, cc, subject, body) {
    try {
        // Plain body for the mailto: URL — append 4 newlines = 3 blank visible lines for signature spacing.
        const plainBody = body + '\n\n\n\n';
        // Rich HTML version on clipboard, so user can ⌘V to apply Calibri 12 + bold.
        const htmlBody = _bodyToCalibriHtml(body);

        if (typeof require !== 'undefined') {
            try {
                const { clipboard } = require('electron');
                clipboard.write({ text: plainBody, html: htmlBody });
            } catch (e) {
                console.warn('Clipboard write failed (non-fatal):', e);
            }
        }

        const toStr = Array.isArray(to) ? to.map(r => r.email || r).join(',') : (to || '');
        const ccStr = Array.isArray(cc) ? cc.map(r => r.email || r).join(',') : (cc || '');
        const url = `mailto:${encodeURIComponent(toStr)}?cc=${encodeURIComponent(ccStr)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(plainBody)}`;
        console.log('[openMailto] opening URL (length:', url.length, '):', url.substring(0, 150) + '...');

        if (typeof require !== 'undefined') {
            const { shell } = require('electron');
            shell.openExternal(url).catch(err => {
                console.error('[openMailto] shell.openExternal failed:', err);
                showToast(`Failed to open email client: ${err.message}`, 'danger');
            });
        } else {
            window.location.href = url;
        }
    } catch (e) {
        console.error('[openMailto] error:', e);
        showToast(`openMailto error: ${e.message}`, 'danger');
    }
}

// One-shot toast (auto-dismiss 3s). kind: 'success' | 'danger' | 'warning' | 'info'.
function showToast(message, kind = 'info') {
    const root = document.getElementById('appToast');
    const body = document.getElementById('appToastBody');
    if (!root || !body) { console.log(`[toast:${kind}]`, message); return; }
    body.textContent = message;
    // Reset Bootstrap text-bg-* classes
    root.className = `toast text-bg-${kind} border-0`;
    bootstrap.Toast.getOrCreateInstance(root, { delay: 3000 }).show();
}

const _CUSTODIAN_COLOR = {
    UBS: 'primary', Nomura: 'success', UOBKH: 'warning',
    JB: 'info', LGT: 'secondary', CAI: 'dark', BOS: 'danger',
    IBKR: 'light', MS: 'light',
};
function custodianColor(custodian) {
    return _CUSTODIAN_COLOR[custodian] || 'light';
}

function showWarningModal({ title, body, continueLabel = 'Continue anyway', cancelLabel = 'Cancel', onContinue }) {
    const existing = document.getElementById('sharedWarningModal');
    if (existing) existing.remove();

    const modalEl = document.createElement('div');
    modalEl.id = 'sharedWarningModal';
    modalEl.className = 'modal fade';
    modalEl.tabIndex = -1;
    modalEl.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">${title}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">${body}</div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${cancelLabel}</button>
                    <button type="button" class="btn btn-warning" id="sharedWarningContinue">${continueLabel}</button>
                </div>
            </div>
        </div>`;
    document.body.appendChild(modalEl);

    const modal = new bootstrap.Modal(modalEl);
    modalEl.querySelector('#sharedWarningContinue').addEventListener('click', () => {
        modal.hide();
        if (onContinue) onContinue();
    });
    modalEl.addEventListener('hidden.bs.modal', () => modalEl.remove());
    modal.show();
}

// Sender email — every generated email auto-CCs this so the sender keeps a copy in their inbox.
let _myEmail = '';
async function loadMyEmail() {
    try {
        const res = await fetch('/api/me');
        const j = await res.json();
        _myEmail = j.email || '';
    } catch (_) {
        _myEmail = '';
    }
    return _myEmail;
}
function myEmail() { return _myEmail; }

// Kick off the load immediately; fetch is fast enough that it'll complete
// before the user can fill out a form.
loadMyEmail();

window.PoseidonCommon = { formatNotional, parseNotional, decimalsFor, roundAmountForCcy, formatDateForSubject, formatDateShort, formatDateLong, startDateLabel, valueDateLabel, openMailto, showWarningModal, showToast, custodianColor, loadMyEmail, myEmail };
