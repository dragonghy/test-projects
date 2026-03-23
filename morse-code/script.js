const MORSE_MAP = {
    'A': '.-',    'B': '-...',  'C': '-.-.',  'D': '-..',
    'E': '.',     'F': '..-.',  'G': '--.',   'H': '....',
    'I': '..',    'J': '.---',  'K': '-.-',   'L': '.-..',
    'M': '--',    'N': '-.',    'O': '---',   'P': '.--.',
    'Q': '--.-',  'R': '.-.',   'S': '...',   'T': '-',
    'U': '..-',   'V': '...-',  'W': '.--',   'X': '-..-',
    'Y': '-.--',  'Z': '--..',
    '0': '-----', '1': '.----', '2': '..---', '3': '...--',
    '4': '....-', '5': '.....', '6': '-....', '7': '--...',
    '8': '---..', '9': '----.',
    '.': '.-.-.-',  ',': '--..--',  '?': '..--..',
    "'": '.----.', '!': '-.-.--',  '/': '-..-.',
    '(': '-.--.',  ')': '-.--.-',  '&': '.-...',
    ':': '---...', ';': '-.-.-.', '=': '-...-',
    '+': '.-.-.',  '-': '-....-',  '_': '..--.-',
    '"': '.-..-.', '@': '.--.-.'
};

const REVERSE_MAP = {};
for (const [char, code] of Object.entries(MORSE_MAP)) {
    REVERSE_MAP[code] = char;
}

const textInput = document.getElementById('text-input');
const morseInput = document.getElementById('morse-input');
const playBtn = document.getElementById('play-btn');
const stopBtn = document.getElementById('stop-btn');
const wpmSelect = document.getElementById('wpm-select');
const textCount = document.getElementById('text-count');
const morseCount = document.getElementById('morse-count');
const animContainer = document.getElementById('animation-container');
const animSymbols = document.getElementById('animation-symbols');

let isPlaying = false;
let audioTimeout = null;
let oscillator = null;
let audioCtx = null;
let playQueue = [];

// --- Translation ---

function textToMorse(text) {
    return text.toUpperCase().split(' ').map(word =>
        word.split('').map(ch => MORSE_MAP[ch] || '').filter(Boolean).join(' ')
    ).filter(Boolean).join(' / ');
}

function morseToText(morse) {
    return morse.split(' / ').map(word =>
        word.trim().split(/\s+/).map(code => REVERSE_MAP[code] || '').join('')
    ).join(' ');
}

function updateCharCounts() {
    textCount.textContent = textInput.value.length + ' chars';
    morseCount.textContent = morseInput.value.length + ' chars';
}

let updating = false;

textInput.addEventListener('input', () => {
    if (updating) return;
    updating = true;
    morseInput.value = textToMorse(textInput.value);
    updateCharCounts();
    updating = false;
});

morseInput.addEventListener('input', () => {
    if (updating) return;
    updating = true;
    textInput.value = morseToText(morseInput.value);
    updateCharCounts();
    updating = false;
});

// --- Swap ---

document.getElementById('swap-btn').addEventListener('click', () => {
    const textVal = textInput.value;
    const morseVal = morseInput.value;
    textInput.value = morseVal;
    morseInput.value = textVal;
    updateCharCounts();
});

// --- Copy / Clear ---

function copyToClipboard(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
        const orig = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.textContent = orig; }, 1500);
    });
}

document.getElementById('copy-text').addEventListener('click', function() {
    copyToClipboard(textInput.value, this);
});

document.getElementById('copy-morse').addEventListener('click', function() {
    copyToClipboard(morseInput.value, this);
});

document.getElementById('clear-text').addEventListener('click', () => {
    textInput.value = '';
    morseInput.value = '';
    updateCharCounts();
});

document.getElementById('clear-morse').addEventListener('click', () => {
    morseInput.value = '';
    textInput.value = '';
    updateCharCounts();
});

// --- Animation ---

function buildAnimationSymbols(morseStr) {
    animSymbols.innerHTML = '';
    const symbolElements = [];

    for (let i = 0; i < morseStr.length; i++) {
        const ch = morseStr[i];
        if (ch === '.') {
            const el = document.createElement('span');
            el.className = 'anim-symbol anim-dot';
            el.textContent = '\u00B7';
            animSymbols.appendChild(el);
            symbolElements.push(el);
        } else if (ch === '-') {
            const el = document.createElement('span');
            el.className = 'anim-symbol anim-dash';
            el.textContent = '\u2014';
            animSymbols.appendChild(el);
            symbolElements.push(el);
        } else if (ch === '/') {
            const el = document.createElement('span');
            el.className = 'anim-symbol anim-word-space';
            el.textContent = '/';
            animSymbols.appendChild(el);
            // no push — not a playable symbol
        } else if (ch === ' ') {
            if (morseStr[i - 1] !== '/' && morseStr[i + 1] !== '/') {
                const el = document.createElement('span');
                el.className = 'anim-symbol anim-space';
                animSymbols.appendChild(el);
            }
        }
    }

    return symbolElements;
}

// --- Audio Playback ---

function getUnitDuration() {
    const wpm = parseInt(wpmSelect.value);
    return 1200 / wpm;
}

let animElements = [];
let currentAnimIndex = 0;

function playMorse(morseStr) {
    if (isPlaying) return;
    if (!morseStr.trim()) return;

    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    isPlaying = true;
    playBtn.disabled = true;
    stopBtn.disabled = false;
    playQueue = [];

    // Build animation
    animElements = buildAnimationSymbols(morseStr);
    currentAnimIndex = 0;
    animContainer.hidden = false;

    const unit = getUnitDuration();

    for (let i = 0; i < morseStr.length; i++) {
        const ch = morseStr[i];
        if (ch === '.') {
            playQueue.push({ type: 'tone', duration: unit, isSymbol: true });
            playQueue.push({ type: 'silence', duration: unit });
        } else if (ch === '-') {
            playQueue.push({ type: 'tone', duration: unit * 3, isSymbol: true });
            playQueue.push({ type: 'silence', duration: unit });
        } else if (ch === '/') {
            playQueue.push({ type: 'silence', duration: unit * 7 });
        } else if (ch === ' ') {
            if (morseStr[i - 1] !== '/' && morseStr[i + 1] !== '/') {
                playQueue.push({ type: 'silence', duration: unit * 2 });
            }
        }
    }

    processQueue();
}

function processQueue() {
    if (!isPlaying || playQueue.length === 0) {
        stopPlayback();
        return;
    }

    const item = playQueue.shift();

    if (item.type === 'tone') {
        // Highlight current animation element
        if (item.isSymbol && currentAnimIndex < animElements.length) {
            const el = animElements[currentAnimIndex];
            el.classList.add('active');
            currentAnimIndex++;
        }

        oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start();
        audioTimeout = setTimeout(() => {
            oscillator.stop();
            oscillator = null;
            // Mark as played (remove active, add played)
            animElements.forEach(el => {
                if (el.classList.contains('active')) {
                    el.classList.remove('active');
                    el.classList.add('played');
                }
            });
            processQueue();
        }, item.duration);
    } else {
        audioTimeout = setTimeout(() => {
            processQueue();
        }, item.duration);
    }
}

function stopPlayback() {
    isPlaying = false;
    playQueue = [];
    if (audioTimeout) {
        clearTimeout(audioTimeout);
        audioTimeout = null;
    }
    if (oscillator) {
        try { oscillator.stop(); } catch(e) {}
        oscillator = null;
    }
    if (audioCtx) {
        audioCtx.close();
        audioCtx = null;
    }
    playBtn.disabled = false;
    stopBtn.disabled = true;
    animElements = [];
    currentAnimIndex = 0;
}

playBtn.addEventListener('click', () => {
    const morse = morseInput.value || textToMorse(textInput.value);
    playMorse(morse);
});

stopBtn.addEventListener('click', stopPlayback);

// --- Reference Table ---

function buildReferenceTable() {
    const grid = document.getElementById('ref-grid');
    const entries = [
        ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
        ...'0123456789'.split('')
    ];
    for (const ch of entries) {
        const div = document.createElement('div');
        div.className = 'ref-item';
        div.innerHTML = `<div class="char">${ch}</div><div class="code">${MORSE_MAP[ch]}</div>`;
        grid.appendChild(div);
    }
}

buildReferenceTable();
