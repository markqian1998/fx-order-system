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

function openMailto(to, cc, subject, body) {
    const toStr = Array.isArray(to) ? to.map(r => r.email || r).join(',') : (to || '');
    const ccStr = Array.isArray(cc) ? cc.map(r => r.email || r).join(',') : (cc || '');
    const url = `mailto:${encodeURIComponent(toStr)}?cc=${encodeURIComponent(ccStr)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    if (typeof require !== 'undefined') {
        const { shell } = require('electron');
        shell.openExternal(url);
    } else {
        window.location.href = url;
    }
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

window.PoseidonCommon = { formatNotional, parseNotional, formatDateForSubject, formatDateShort, formatDateLong, startDateLabel, valueDateLabel, openMailto, showWarningModal, loadMyEmail, myEmail };
