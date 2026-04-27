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

window.PoseidonCommon = { formatNotional, parseNotional, formatDateForSubject, openMailto, showWarningModal };
