// Diccionario de Código Morse
const MORSE_CODE_DICT = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
    'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
    'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
    'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
    'Y': '-.--', 'Z': '--..', '1': '.----', '2': '..---', '3': '...--',
    '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..',
    '9': '----.', '0': '-----', ',': '--..--', '.': '.-.-.-', '?': '..--..',
    '/': '-..-.', '-': '-....-', '(': '-.--.', ')': '-.--.-'
};

let osc;
let tiempoBase = 120;
let morseEnProgreso = [];
let visualMorseArray = [];
let indiceActual = 0;
let timerID;
let logoImg;
let oscStarted = false;

// HTML references
let inputElement;
let buttonElement;
let canvasContainer;

function preload() {
    logoImg = loadImage('https://storage.googleapis.com/gemini-prod-us-west1-409903-assets/995116743901/Logopit_1753454734703.jpg',
        () => console.log("Logo cargado desde URL"),
        () => console.error("No se pudo cargar el logo desde la URL.")
    );
}

function setup() {
    canvasContainer = select('#canvas-holder');
    const canvas = createCanvas(canvasContainer.width, canvasContainer.width / 2);
    canvas.parent('canvas-holder');

    osc = new p5.Oscillator('sine');
    osc.freq(440);
    osc.amp(0);

    // Referencias HTML y eventos
    inputElement = select('#text-input');
    buttonElement = select('#translate-button');
    buttonElement.mousePressed(iniciarTraduccion);
}

function draw() {
    background(240);

    if (logoImg && logoImg.width > 0) {
        push();
        imageMode(CENTER);
        let escala = Math.min(width / logoImg.width, height / logoImg.height) * 0.8;
        tint(200, 150);
        image(logoImg, width / 2, height / 2, logoImg.width * escala, logoImg.height * escala);
        pop();
    }

    fill(0);
    noStroke();
    textSize(width * 0.035);
    textAlign(LEFT, TOP);
    text('Código Morse:', 20, 20);

    // Visualización del código Morse
    let x = 20;
    let y = 50;
    textSize(width * 0.05);
    for (let i = 0; i < visualMorseArray.length; i++) {
        const item = visualMorseArray[i];
        if (item.activo) {
            fill(220, 50, 50);
        } else {
            fill(0);
        }
        text(item.char, x, y);
        x += textWidth(item.char) + 2;
        if (x > width - 40 && item.char === ' ') {
            x = 20;
            y += width * 0.06;
        }
    }
}

function touchStarted() {
    if (getAudioContext().state !== 'running') {
        getAudioContext().resume();
        if (!oscStarted) {
            osc.start();
            oscStarted = true;
        }
        console.log("Audio context iniciado!");
    }
}

function iniciarTraduccion() {
    touchStarted();

    if (timerID) clearTimeout(timerID);
    osc.amp(0, 0.05);

    let textoLimpio = limpiarTexto(inputElement.value()).toUpperCase();

    morseEnProgreso = [];
    visualMorseArray = [];

    for (const char of textoLimpio) {
        if (char === ' ') {
            morseEnProgreso.push({ tipo: 'pausa', duracion: tiempoBase * 7 });
            visualMorseArray.push({ char: ' ', activo: false });
        } else if (MORSE_CODE_DICT[char]) {
            const morse = MORSE_CODE_DICT[char];
            for (let i = 0; i < morse.length; i++) {
                morseEnProgreso.push({ tipo: 'sonido', duracion: morse[i] === '.' ? tiempoBase : tiempoBase * 3 });
                visualMorseArray.push({ char: morse[i], activo: false });
                if (i < morse.length - 1) morseEnProgreso.push({ tipo: 'pausa', duracion: tiempoBase });
            }
            morseEnProgreso.push({ tipo: 'pausa', duracion: tiempoBase * 3 });
            visualMorseArray.push({ char: ' ', activo: false });
        }
    }

    indiceActual = 0;
    reproducirSiguienteSimbolo();
}

function reproducirSiguienteSimbolo() {
    if (indiceActual >= morseEnProgreso.length) {
        osc.amp(0, 0.1);
        visualMorseArray.forEach(item => item.activo = false);
        timerID = setTimeout(() => {
            // Opcional: vuelve a activar la traducción después de un tiempo
        }, 2000);
        return;
    }

    const simbolo = morseEnProgreso[indiceActual];

    // Resalta el símbolo actual
    let morseCount = 0;
    for (let i = 0; i < visualMorseArray.length; i++) {
        if (morseCount === indiceActual && visualMorseArray[i].char !== ' ') {
            visualMorseArray[i].activo = true;
        } else {
            visualMorseArray[i].activo = false;
        }
        if (visualMorseArray[i].char !== ' ') {
            morseCount++;
        }
    }

    if (simbolo.tipo === 'sonido') osc.amp(0.5, 0.05);
    else osc.amp(0, 0.05);

    timerID = setTimeout(() => {
        indiceActual++;
        reproducirSiguienteSimbolo();
    }, simbolo.duracion);
}

function limpiarTexto(str) {
    let normalizado = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return normalizado.replace(/[^a-zA-Z0-9\s.,?/\-()]/g, "");
}

function windowResized() {
    resizeCanvas(canvasContainer.width, canvasContainer.width / 2);
}