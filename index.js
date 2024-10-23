const substitutionTable = [
    [6,12,7,1,5,15,13,8,4,10,9,14,0,3,11,2],
    [14,11,4,12,6,13,15,10,2,3,8,1,0,7,5,9],
    [13,11,4,1,3,15,5,9,0,10,14,7,6,8,2,12],
    [7,13,10,1,0,8,9,15,14,4,6,12,11,2,5,3],
    [1,15,13,0,5,7,10,4,9,2,3,14,6,11,8,12],
    [4,10,9,2,13,8,0,14,6,11,1,12,7,15,5,3],
    [4,11,10,0,7,2,1,13,3,6,8,5,9,12,15,14],
    [5,8,1,13,10,3,4,2,14,15,12,7,6,0,9,11]
];

const keysTable = [
    BigInt("0xFFFFFFFF"),
    BigInt("0x12345678"),
    BigInt("0x00120477"),
    BigInt("0x77AE441F"),
    BigInt("0x81C63123"),
    BigInt("0x99DEEEEE"),
    BigInt("0x09502978"),
    BigInt("0x68FA3105")
];

const text = document.querySelector(".text");

const encryptBtn = document.querySelector(".encrypt-button");
const decryptBtn = document.querySelector(".decrypt-button");
const clearBtn = document.querySelector(".clear-button");
const resultText = document.querySelector(".result-text");

encryptBtn.addEventListener("click", getEncryptedText);
decryptBtn.addEventListener("click", getDecryptedText);
clearBtn.addEventListener("click", clear);

function getEncryptedText(){
    resultText.innerHTML = "";

    const inputText = text.value;
    const blocks = textToBlocks(inputText);
    const encryptedBlocks = blocks.map(block => stepsEncrypt(block));

    let encryptedText = '';
    for (let i = 0; i < encryptedBlocks.length; i++) {
        let block = encryptedBlocks[i].toString(16).padStart(16, '0');
        encryptedText += block + ' ';
    }

    encryptedText = encryptedText.trim();

    clearBtn.style.display = "block";
    resultText.style.opacity = "1";
    resultText.innerHTML = resultText.innerHTML + encryptedText;
}

function getDecryptedText(){
    resultText.innerHTML = "";

    const encryptedText = text.value;

    let encryptedBlocks = [];
    let encArray = encryptedText.split(' ');
    for (let i = 0; i < encArray.length; i++) {
        encryptedBlocks.push(BigInt('0x' + encArray[i]));
    }

    let decryptedBlocks = [];
    for (let i = 0; i < encryptedBlocks.length; i++) {
        decryptedBlocks.push(stepsDecrypt(encryptedBlocks[i]));
    }

    const decryptedText = blocksToText(decryptedBlocks);

    clearBtn.style.display = "block";
    resultText.style.opacity = "1";
    resultText.innerHTML = resultText.innerHTML + decryptedText;
}

function textToBlocks(text) {
    const blocks = [];
    const bytes = new TextEncoder().encode(text);

    for (let i = 0; i < bytes.length; i += 8) {
        let block = BigInt(0);
        for (let j = 0; j < 8; j++) {
            if (i + j < bytes.length) {
                block |= BigInt(bytes[i + j]) << (8n * BigInt(j));
            }
        }
        blocks.push(block);
    }

    return blocks;
}

function blocksToText(blocks) {
    const bytes = [];

    for (const block of blocks) {
        for (let j = 0; j < 8; j++) {
            bytes.push(Number((block >> (8n * BigInt(j))) & 0xFFn));
        }
    }

    return new TextDecoder().decode(new Uint8Array(bytes));
}

function stepsEncrypt (block) {
    let L = Number(block >> 32n) >>> 0;
    let R = Number(block & 0xFFFFFFFFn) >>> 0;

    for (let i = 0; i < 32; i++) {
        const indexKey = (i < 24) ? Number(keysTable[i % 8]) : Number(keysTable[7 - (i % 8)]);
        [L, R] = encryptRound(L, R, indexKey);
    }

    return (BigInt(L) << 32n) | BigInt(R);
}

function stepsDecrypt (block) {
    let L = Number(block >> 32n) >>> 0;
    let R = Number(block & 0xFFFFFFFFn) >>> 0;

    for (let i = 0; i < 32; i++) {
        const indexKey = (i < 8) ? Number(keysTable[i]) : Number(keysTable[7 - (i % 8)]);
        [L, R] = decryptRound(L, R, indexKey);
    }

    return (BigInt(L) << 32n) | BigInt(R);
}

function encryptRound(inputL, inputR, indexKey) {
    const outputL = inputR;
    const outputR = (inputL ^ transformationsInRound(inputR, indexKey)) >>> 0;

    return [outputL, outputR];
}

function decryptRound(inputL, inputR, indexKey) {
    const outputR = inputL;
    const outputL = (inputR ^ transformationsInRound(inputL, indexKey)) >>> 0;

    return [outputL, outputR];
}

function transformationsInRound(right, keyIndex) {
    right = (right + keyIndex) >>> 0;
    right = substitutionOnTableValues(right);

    return ((right << 11) | (right >>> 21)) >>> 0;
}

function substitutionOnTableValues(right) {
    let result = 0;
    for (let i = 0; i < 8; i++) {
        result |= (substitutionTable[i][(right >> (4 * i)) & 0xf] << (4 * i));
    }

    return result >>> 0;
}

function clear() {
    resultText.innerHTML = "";
    resultText.style.opacity = "0";
    clearBtn.style.display = "none";
}