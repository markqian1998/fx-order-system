function _accountTagWithBookAndBrackets({ book, copy, sub, acName }) {
    const left = [book, copy].filter(Boolean).join('-');
    const withSub = sub ? `${left}-${sub}` : left;
    return acName ? `${withSub} <${acName}>` : withSub;
}

function _accountTagWithBookNoBrackets({ book, copy, sub, acName }) {
    const left = [book, copy].filter(Boolean).join('-');
    const withSub = sub ? `${left}-${sub}` : left;
    return acName ? `${withSub} ${acName}` : withSub;
}

function _accountTagNoBook({ copy, sub, acName }) {
    const left = sub ? `${copy}-${sub}` : copy;
    return acName ? `${left} ${acName}` : left;
}

function callDepositPlace(ctx) {
    const subject = `Call Deposit Order - ${PoseidonCommon.formatDateForSubject()}`;
    const body =
        `Dear ${ctx.salutation || 'Team'},\n\n` +
        `For a/c ${_accountTagWithBookAndBrackets(ctx)},\n\n` +
        `Please help place ${ctx.ccy} Call Deposit, amount: ${ctx.ccy} ${ctx.amount}. Value ${ctx.valueLabel || 'Today'}.`;
    return { subject, body };
}

function callDepositUnwind(ctx) {
    const subject = `Unwind Call Deposit Order - ${PoseidonCommon.formatDateForSubject()}`;
    const body =
        `Dear ${ctx.salutation || 'Team'},\n\n` +
        `For a/c ${_accountTagWithBookAndBrackets(ctx)},\n\n` +
        `Please help unwind the ${ctx.ccy} Call Deposit, amount: ${ctx.ccy} ${ctx.amount}. Value ${ctx.valueLabel || 'Today'}. Thanks.`;
    return { subject, body };
}

function ftdDeposit(ctx) {
    const subject = `Deposit Order - ${PoseidonCommon.formatDateForSubject()}`;
    const at = ctx.bookingEntity ? ` at ${ctx.bookingEntity}` : '';
    const lines = [
        `Dear ${ctx.salutation || 'Team'},`,
        '',
        `For a/c ${_accountTagWithBookNoBrackets(ctx)}`,
        '',
        `Please help us with ${ctx.ccy} deposit order${at} below:`,
        `Tenor: ${ctx.tenor}`,
        `Amount: ${ctx.ccy} ${ctx.amount}`,
    ];
    if (ctx.rate) lines.push(`Rate to client: ${ctx.rate}%`);
    lines.push(`Value ${ctx.valueLabel || 'Today'}`);
    lines.push('');
    lines.push('Many thanks.');
    return { subject, body: lines.join('\n') };
}

function oneOffLoan(ctx) {
    const subject = `Loan Instruction Order - ${PoseidonCommon.formatDateForSubject()}`;
    const body =
        `Hi ${ctx.salutation || 'Team'},\n\n` +
        `For a/c ${_accountTagNoBook(ctx)},\n\n` +
        `Please help draw one-off ${ctx.ccy} loan ${ctx.ccy} ${ctx.amount} ${ctx.purpose || 'to cover OD'}, til ${ctx.endDate}, starting from ${ctx.startLabel || 'today'}. Many thanks`;
    return { subject, body };
}

function siLoan(ctx) {
    const subject = `SI Loan Instruction Order - ${PoseidonCommon.formatDateForSubject()}`;
    const rolling = ctx.rolling || 'weekly';
    const instr = ctx.loanInstruction || '';
    const tail = instr ? `${instr}, ` : '';
    const body =
        `Hi ${ctx.salutation || 'Team'},\n\n` +
        `For a/c ${_accountTagNoBook(ctx)},\n\n` +
        `Please help draw ${ctx.ccy} loan ${ctx.ccy} ${ctx.amount} ${ctx.purpose || 'to cover OD'}, rolling on a ${rolling} basis, ${tail}starting from ${ctx.startLabel || 'today'}. Many thanks`;
    return { subject, body };
}

window.PoseidonTemplates = { callDepositPlace, callDepositUnwind, ftdDeposit, oneOffLoan, siLoan };
