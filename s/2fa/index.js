let aegisFile = [];
let globalCounter = 0;

async function timerFunc() {
    const counter = calcCounter();
    document.getElementById('counter').innerText = counter.n.toString();
    if (counter.c !== globalCounter) {
        globalCounter = counter.c;
        for (const [i, entry] of aegisFile.entries()) {
            six = await hmac(entry.secret, counter.c);
            codeDiv = document.getElementById("code-" + i);
            codeDiv.innerText = six
            container.appendChild(boxDiv)
        }
    }
}

async function drawBox() {
    const counterInit = calcCounter();
    globalCounter = counterInit.c;
    const counter = calcCounter();
    document.body.innerHTML = '';
    container = document.createElement("div");
    container.id = "container"

    counterDiv = document.createElement("div");
    counterDiv.id = "counter";
    counterText = document.createTextNode(counter.n.toString());
    counterDiv.appendChild(counterText);
    document.body.appendChild(counterDiv);
    document.body.appendChild(container)

    for (const [i, entry] of aegisFile.entries()) {
        six = await hmac(entry.secret, counter.c);

        boxDiv = document.createElement("div");
        boxDiv.className = "box";

        issuerDiv = document.createElement("div");
        issuerDiv.className = "issuer";
        issuerNode = document.createTextNode(entry.issuer);
        issuerDiv.appendChild(issuerNode);
        boxDiv.appendChild(issuerDiv);

        codeDiv = document.createElement("div");
        codeDiv.className = "code";
        codeDiv.id = "code-" + i;
        codeNode = document.createTextNode(six);
        codeDiv.appendChild(codeNode);
        boxDiv.appendChild(codeDiv);

        container.appendChild(boxDiv)
    }
}

async function dostuff() {
    window.setInterval(timerFunc, 1000);
    const a = document.getElementById('input');
    const b = JSON.parse(a.value)
    const counter = calcCounter()
    var six;
    for (const entry of b['db']['entries']) {
        aegisFile.push({
            secret: entry['info']['secret'],
            issuer: entry['issuer'],
            name: entry['name'],
        });
        six = await hmac(entry['info']['secret'], counter.c);
    }
}

async function hmac(key, counter) {
    k = base32Decode(key)
    m = numToUint8Array(counter)
    args = { name: 'HMAC', hash: 'SHA-1' };
    c = await crypto.subtle.importKey('raw', k, args, true, ['sign']);
    s = await crypto.subtle.sign('HMAC', c, m);
    const hmacRes = new Uint8Array(s);
    const six = twenty(hmacRes)
    return six.toString().padStart(6, '0')
}

function twenty(hmacResult) {
    const offset = hmacResult[19] & 0xf;
    const four = hmacResult.slice(offset, offset + 4);
    return (
        (four[0] & 0x7f) << 24 |
        (four[1] & 0xff) << 16 |
        (four[2] & 0xff) << 8 |
        (four[3] & 0xff)
    ) % 1000000
}

function calcCounter() {
    const unixTime = Math.floor(Date.now() / 1000);
    return {
        c: Math.floor(unixTime / 30),
        n: 30 - (unixTime - (globalCounter * 30)),
    }
}

function numToUint8Array(num) {
    let arr = new Uint8Array(8);
    for (let i = 0; i < 8; i++) {
        arr[7 - i] = num % 256;
        num = Math.floor(num / 256);
    }
    return arr;
}

function base32Decode(str) {
    const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
    const bin = [...str].map(x =>
        ALPHABET.indexOf(x).toString(2).padStart(5, '0')
    ).join('');
    const b = [...new Array(Math.ceil(bin.length / 8)).keys()].map(x =>
        parseInt(bin.substr(x * 8, 8), 2)
    );
    return new Uint8Array(b);
}

function uploadClick() {
    document.getElementById("fileElem").click();
}

async function handleFile(event) {
    const [file] = event.target.files;
    const t = JSON.parse(await file.text());
    for (const entry of t['db']['entries']) {
        aegisFile.push({
            secret: entry['info']['secret'],
            issuer: entry['issuer'],
            name: entry['name'],
        });
    }
    drawBox();
    window.setInterval(timerFunc, 1000);
}

