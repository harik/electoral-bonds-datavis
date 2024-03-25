
const fs = require('fs');
const dateRe = "\\d+\\/[A-Z][a-z]{2}\/\\d+";
const numRe = "[0-9]+";
const dateTxm = x => new Date(x + " 09:00:00 GMT+0530");
const fromFlds = [
    ["serial_no", numRe],
    ["ref_no", numRe],
    ["journal_date", dateRe, dateTxm],
    ["purchase_date", dateRe, dateTxm],
    ["expiry_date", dateRe, dateTxm],
    ["donor", ".*?"],
    ["prefix", "[A-Z]{2}"],
    ["uid", numRe],
    ["amount", "[0-9,]+", x => parseInt(x.replace(/,/g, ''))],
    ["branch_code", numRe],
    ["teller", numRe],
    ["status", "Paid|Expired"],
];
const toFlds = [
    ["serial_no", numRe],
    ["redeem_date", dateRe, dateTxm],
    ["recipient", ".*?"],
    ["account", '[*]*[0-9]+'],
    ["prefix", "[A-Z]{2}"],
    ["uid", numRe],
    ["amount", "[0-9,]+", x => parseInt(x.replace(/,/g, ''))],
    ["branch_code", numRe],
    ["teller", numRe],
];
function slurp(file, fldsRe) {
    const re = new RegExp("^"+fldsRe.map(x => `(${x[1]})`).join('\\s*')+"$");
    const data = fs.readFileSync(file, 'utf8');
    console.log({re})
    return data.split('\n').map(ln => {
        const flds = ln.match(re);
        //console.log(flds.length, fldsRe.length+1);
        if (!flds || flds.length != fldsRe.length+1) return;
        return fldsRe.reduce((m, f, i) => { 
            if (f[2])
                m[f[0]] = f[2](flds[i+1]);
            else
                m[f[0]] = flds[i+1]; 
            return m; 
        }, {match: -1});
    })
    .filter(x => x)
    //.filter(x => x.amount >= 10000000)
    ;
}

const from = slurp('data/donors.txt', fromFlds);
const to = slurp('data/recipients.txt', toFlds);
match(from, to);
match(to, from);
checkExpired(from);
satisfy(from, to);
satisfy(to, from);

const donors = summarizeDonors(from, to);
const recipients = summarizeRecipients(from, to);

dumpState();
process.exit(0);

function checkExpired(from) {
    from.forEach(f => {
        if (f.status === 'Expired' && f.matched >= 0) {
            console.log("Expired bond encashed", f);
        }
    });
}

function satisfy(from, to) {
    from.forEach((f, i) => {
        if (f.match >= 0) return;
        to.push({
            match: i, 
            amount: f.amount, 
            uid: f.uid, 
            [f.donor?"recipient":"donor"]: "Unknown"
        });
        f.match = to.length-1;
    });
}
function summarizeDonors(from, to) {
    return from.reduce((m, f) => {
        if (!m[f.donor]) m[f.donor] = {count: 0, total: 0, recipients: {}};
        m[f.donor].count++;
        m[f.donor].total += f.amount;
        const match = to[f.match];
        if (!m[f.donor].recipients[match.recipient]) 
            m[f.donor].recipients[match.recipient] = {count: 0, total: 0};
        m[f.donor].recipients[match.recipient].count++;
        m[f.donor].recipients[match.recipient].total += f.amount;
        return m;
    }, {});
}
function summarizeRecipients(from, to) {
    return to.reduce((m, t) => {
        if (!m[t.recipient]) m[t.recipient] = {count: 0, total: 0, donors: {}};
        m[t.recipient].count++;
        m[t.recipient].total += t.amount;
        const match = from[t.match];
        if (!m[t.recipient].donors[match.donor]) 
            m[t.recipient].donors[match.donor] = {count: 0, total: 0};
        m[t.recipient].donors[match.donor].count++;
        m[t.recipient].donors[match.donor].total += t.amount;
        return m;
    }, {});
}
function match(what, against) {
    what.forEach(w => {
        w.match = against.findIndex(a => a.uid === w.uid && a.amount === w.amount);
    });
}
function dumpState() {
    fs.writeFileSync('public/donors.json', JSON.stringify(from, null, 2));
    fs.writeFileSync('public/recipients.json', JSON.stringify(to, null, 2));
    fs.writeFileSync('public/summary.json', JSON.stringify({donors, recipients}, null, 2));
}
function samedonor(from, matches) {
    //const donors = matches.map(m => from.find(f => f.id === m).desc);
    const donors = matches.map(m => fmap[m].desc);
    return donors.every(d => d === donors[0]);
}
function markmatched(from, to) {
    const f = fmap[to.matches[0]];//from.find(f => f.id === to.matches[0]);
    f.matched = true;
    f.match = to.id;
    to.matched = true;
    to.match = f.id;
}
function expired(purchased, encashed) {
    return purchased.getTime() <= encashed.getTime() - 16*24*60*60*1000;
}
