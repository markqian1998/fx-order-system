function _accountTag({ book, copy, sub, acName }) {
    const left = [book, copy].filter(Boolean).join('-');
    const withSub = sub ? `${left}-${sub}` : left;
    return acName ? `${withSub} <${acName}>` : withSub;
}

function callDepositPlace(ctx) {
    const { salutation, book, copy, sub, acName, ccy, amount } = ctx;
    const subject = `Call Deposit Order - ${PoseidonCommon.formatDateForSubject()}`;
    const body =
        `Dear ${salutation || 'Team'},\n\n` +
        `For a/c ${_accountTag({ book, copy, sub, acName })},\n\n` +
        `Please help place ${ccy} Call Deposit, amount: ${ccy} ${amount}. Value Today.`;
    return { subject, body };
}

function callDepositUnwind(ctx) {
    const { salutation, book, copy, sub, acName, ccy, amount } = ctx;
    const subject = `Unwind Call Deposit Order - ${PoseidonCommon.formatDateForSubject()}`;
    const body =
        `Dear ${salutation || 'Team'},\n\n` +
        `For a/c ${_accountTag({ book, copy, sub, acName })},\n\n` +
        `Please help unwind the ${ccy} Call Deposit, amount: ${ccy} ${amount}. Value Today. Thanks.`;
    return { subject, body };
}

window.PoseidonTemplates = { callDepositPlace, callDepositUnwind };
