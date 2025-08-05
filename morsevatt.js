// Diccionario de Código Morse
const MORSE_CODE_DICT = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
    'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
    'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
    'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
    'Y': '-.--', 'Z': '--..',
    '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....',
    '6': '-....', '7': '--...', '8': '---..', '9': '----.', '0': '-----',
    ',': '--..--', '.': '.-.-.-', '?': '..--..', '/': '-..-.', '-': '-....-',
    '(': '-.--.', ')': '-.--.-'
};

// Variables de la interfaz y sonido
let osc;
let input;
let button;
let tiempoBase = 100;

// Variables de control de la reproducción
let morseEnProgreso = [];
let indiceActual = 0;
let timerID;
let morseString = ""; // Cadena completa de Morse para la visualización

// Variable para la imagen del logo
let logoImg;

function preload() {
    // Carga la imagen del logo (ajusta la ruta y el nombre si es necesario)
    logoImg = loadImage('asset/vattlogo.png.png');
}

function setup() {
    createCanvas(600, 300);
    background(220);

    osc = new p5.Oscillator('sine');
    osc.freq(440);
    osc.amp(0);
    osc.start();

    // Interfaz de usuario
    input = createInput('Hola Mundo');
    input.position(20, 20);
    input.size(400);

    button = createButton('Traducir y Reproducir');
    button.position(input.x, input.y + input.height + 10);
    button.mousePressed(traducir);
}


function draw() {
    background(220);

    // Dibuja el logo ajustado exactamente al canvas, manteniendo proporción y centrado
    if (logoImg) {
        push();
        imageMode(CENTER);

        // Calcula la escala máxima que cabe en el canvas sin deformar la imagen
        let escala = Math.min(width / logoImg.width, height / logoImg.height);

        let logoW = logoImg.width * escala;
        let logoH = logoImg.height * escala;

        // Baja la saturación y la transparencia (tint: grisáceo y más transparente)
        tint(180, 180, 180, 90); // gris claro y muy transparente

        image(logoImg, width / 2, height / 2, logoW, logoH);
        pop();
    }

    // --- El resto de tu código draw, igual ---
    textSize(20);
    textAlign(LEFT);
    fill(0);

    text('Texto original: ' + input.value(), 20, 100);
    text('Código Morse:', 20, 150);

    let morseVisual = "";
    for (let i = 0; i < morseString.length; i++) {
        if (i === indiceActual) {
            fill(255, 0, 0); // Rojo para el símbolo actual
        } else {
            fill(0); // Negro para el resto
        }
        morseVisual += morseString[i];
    }
    text(morseVisual, 20, 180);
}
// Función principal de traducción
function traducir() {
    if (timerID) {
        clearTimeout(timerID);
    }
    osc.amp(0, 0.05);

    // Limpia el texto para manejar acentos y caracteres desconocidos
    let textoLimpio = limpiarTexto(input.value());
    let textoMayusculas = textoLimpio.toUpperCase();

    morseEnProgreso = [];
    morseString = "";

    for (let i = 0; i < textoMayusculas.length; i++) {
        let char = textoMayusculas[i];

        if (char === ' ') {
            morseEnProgreso.push({ tipo: 'pausa', duracion: tiempoBase * 7 });
            morseString += ' '; // Agrega un espacio para la visualización
        } else if (MORSE_CODE_DICT[char]) {
            let morse = MORSE_CODE_DICT[char];
            morseString += morse;
            for (let j = 0; j < morse.length; j++) {
                let simbolo = morse[j];
                let duracion = simbolo === '.' ? tiempoBase : tiempoBase * 3;
                morseEnProgreso.push({ tipo: 'sonido', duracion: duracion });
                if (j < morse.length - 1) {
                    morseEnProgreso.push({ tipo: 'pausa', duracion: tiempoBase });
                    morseString += ' '; // Pausa visual entre símbolos
                }
            }

            if (i < textoMayusculas.length - 1 && textoMayusculas[i + 1] !== ' ') {
                morseEnProgreso.push({ tipo: 'pausa', duracion: tiempoBase * 3 });
                morseString += '   '; // Pausa visual entre letras
            }
        }
    }

    indiceActual = 0;
    reproducirSiguienteSimbolo();
}

// Función recursiva que reproduce cada símbolo
function reproducirSiguienteSimbolo() {
    if (indiceActual >= morseEnProgreso.length) {
        osc.amp(0, 0.1);
        indiceActual = morseString.length; // Coloca el índice al final
        return;
    }

    let simbolo = morseEnProgreso[indiceActual];

    if (simbolo.tipo === 'sonido') {
        osc.amp(0.8, 0.05);
    } else {
        osc.amp(0, 0.05);
    }

    timerID = setTimeout(reproducirSiguienteSimbolo, simbolo.duracion);
    indiceActual++;
}

// Limpia acentos y caracteres no soportados
function limpiarTexto(str) {
    let normalizado = str.normalize("NFD");
    let sinAcento = normalizado.replace(/[\u0300-\u036f]/g, "");
    let limpio = "";
    for (let i = 0; i < sinAcento.length; i++) {
        let char = sinAcento[i].toUpperCase();
        if (MORSE_CODE_DICT[char] || char === ' ') {
            limpio += char;
        }
    }
    return limpio;
}

// Auxiliar para obtener el símbolo de Morse de la cadena de visualización
function getMorseSymbol(str, index) {
    let count = 0;
    for (let i = 0; i < str.length; i++) {
        if (str[i] === '.' || str[i] === '-') {
            if (count === index) {
                return str[i];
            }
            count++;
        }
    }
    return '';
}
