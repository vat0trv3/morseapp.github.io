// Variable para la imagen de fondo
let img;

// Variables para los elementos de la interfaz de usuario (UI)
let input, translateButton, pauseButton, exportButton, stopRecordingButton, renameButton, filenameInput;
let exportMidiButton; // <-- Botón para exportar MIDI

// Variable para el slider de velocidad
let speedSlider;

// Array que contiene la secuencia de sonidos, silencios y caracteres para reproducir y visualizar
let morseEnProgreso = [];

// Variable para el oscilador de sonido de p5.js
let osc;
let oscUltrasonico; // Oscilador para la señal portadora inaudible

// Variables para la grabación de audio
let recorder, soundFile;

// Índice para rastrear la posición actual en la secuencia morseEnProgreso
let indiceActual = 0;

// Banderas (flags) para controlar el estado de la aplicación
let reproduciendo = false, pausado = false, grabando = false;

// Variable para la unidad de tiempo del morse (basada en WPM)
let tiempoBase = 60;

// Palabras Por Minuto (Words Per Minute), valor inicial
let WPM = 20;

// Bandera para la activación del audio en móviles
let audioIniciado = false;

// Variable para la barra de progreso de la grabación
let progreso = 0;

// --- VARIABLES PARA EL DECODIFICADOR DE AUDIO ---
let decodeButton; // Nuevo botón para activar el decodificador
let mic; // Objeto para la entrada de audio (micrófono)
let decodificando = false; // Flag para saber si estamos en modo decodificación
let estadoSonido = 'silencio'; // Estado actual: 'sonido' o 'silencio'
let contadorFrames = 0; // Contador de frames para medir duraciones
const UMBRAL_SONIDO = 0.01; // Umbral de volumen para detectar un sonido (ajustable)
let tiempoBaseDecodificador = 100; // Unidad de tiempo en ms (se autocalibrará)
let calibrado = false; // Flag para saber si ya calibramos el tiempo base
let simbolosActuales = ''; // Almacena la secuencia actual de puntos y rayas (ej: '.-')
let textoDecodificado = ''; // El texto final que se va mostrando
let morseInverso = {}; // Diccionario inverso (Morse -> Texto)

// ESTÉTICA: Paleta de colores centralizada
const theme = {
    background: '#121212',
    surface: 'rgba(40, 40, 40, 0.8)',
    primary: '#BB86FC',
    secondary: '#03DAC6',
    text: '#EAEAEA',
    textHighlight: '#FFFFFF',
    red: '#CF6679'
};

// Diccionario para la traducción de caracteres a código morse
const diccionarioMorse = {
    'a': '.-', 'b': '-...', 'c': '-.-.', 'd': '-..', 'e': '.', 'f': '..-.', 'g': '--.', 'h': '....', 'i': '..', 'j': '.---', 'k': '-.-', 'l': '.-..', 'm': '--', 'n': '-.', 'o': '---', 'p': '.--.', 'q': '--.-', 'r': '.-.', 's': '...', 't': '-', 'u': '..-', 'v': '...-', 'w': '.--', 'x': '-..-', 'y': '-.--', 'z': '--..', '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.', ' ': '/'
};

function preload() {
    img = loadImage('asset/vattlogo.png.png');
}

function setup() {
    createCanvas(windowWidth, windowHeight);

    // Configuración del oscilador audible
    osc = new p5.Oscillator('sine');
    osc.freq(500);
    osc.amp(0);
    osc.start();

    // Configuración del oscilador ultrasónico
    oscUltrasonico = new p5.Oscillator('sine');
    oscUltrasonico.freq(21000); // Frecuencia de 21kHz
    oscUltrasonico.amp(0);
    oscUltrasonico.start();

    // Configuración del grabador de audio
    soundFile = new p5.SoundFile();
    recorder = new p5.SoundRecorder();
    // No usamos setInput() para que el grabador escuche la salida maestra (ambos osciladores)

    // Creación del diccionario inverso (Morse -> Texto)
    for (const key in diccionarioMorse) {
        const value = diccionarioMorse[key];
        morseInverso[value] = key;
    }

    // Configura la entrada de audio del micrófono
    mic = new p5.AudioIn();

    positionElements();

    stopRecordingButton.hide();
    filenameInput.hide();

    document.body.style.fontFamily = "'Roboto', sans-serif";
    document.body.style.backgroundColor = theme.background;
}

function draw() {
    // Pinta el fondo del lienzo
    background(theme.background);

    // Dibuja el logo de fondo como una marca de agua sutil
    tint(255, 30);

    // Calcula las nuevas dimensiones para que el logo sea rectangular y no se distorsione
    const logoAspectRatio = img.width / img.height; // Calcula la proporción original del logo
    const newWidth = width;
    const newHeight = newWidth / logoAspectRatio; // Usa la proporción para calcular la altura
    const yPosition = (height - newHeight) / 2; // Centra la imagen verticalmente

    image(img, 0, yPosition, newWidth, newHeight);
    noTint();

    // Dibuja la caja de visualización con efecto de "vidrio esmerilado"
    const boxWidth = width * 0.6;
    const boxHeight = height * 0.3;
    const boxX = (width - boxWidth) / 2;
    const boxY = height / 2 + 40;
    fill(theme.surface);
    stroke(255, 255, 255, 50);
    strokeWeight(1);
    rect(boxX, boxY, boxWidth, boxHeight, 12);

    noStroke();
    fill(theme.text);
    textSize(24);
    let x = boxX + 20;
    let y = boxY + 40;

    if (decodificando) {
        fill(theme.primary);
        textAlign(CENTER);
        text('Escuchando... Texto Decodificado:', boxX + boxWidth / 2, boxY + 30);
        fill(theme.text);
        textAlign(LEFT);
        text(textoDecodificado + simbolosActuales, x, y + 20);
    } else {
        textAlign(LEFT, TOP);
        for (let i = 0; i < morseEnProgreso.length; i++) {
            const item = morseEnProgreso[i];
            if (item.tipo === 'caracter') {
                fill(i === indiceActual && (reproduciendo || grabando) && !pausado ? color(theme.red) : color(theme.text));
                text(item.simbolo, x, y);
                x += textWidth(item.simbolo);
                if (x > boxX + boxWidth - 50) {
                    x = boxX + 20;
                    y += 40;
                }
            }
        }
    }

    let sliderX = speedSlider.x + speedSlider.width + 15;
    let sliderY = speedSlider.y;
    fill(theme.text);
    textSize(16);
    textAlign(LEFT, TOP);
    text(`${WPM} WPM`, sliderX, sliderY);

    if (grabando) {
        drawProgressBar();
    }

    if (decodificando) {
        analizarAudioEntrante();
    }
}

function drawProgressBar() {
    let barWidth = width * 0.6;
    let barHeight = 20;
    let barX = (width - barWidth) / 2;
    let barY = height / 2 - 100;
    fill(theme.surface);
    noStroke();
    rect(barX, barY, barWidth, barHeight, 10);
    let progresoAncho = map(progreso, 0, 100, 0, barWidth);
    fill(theme.primary);
    rect(barX, barY, progresoAncho, barHeight, 10);
    fill(theme.textHighlight);
    textAlign(CENTER, CENTER);
    textSize(14);
    text(`${floor(progreso)}%`, barX + barWidth / 2, barY + barHeight / 2);
}

function positionElements() {
    let anchoElementos = width * 0.6;
    let posX = (width - anchoElementos) / 2;
    let yBotones = height / 2 - 60;

    if (!input) input = createInput('powered by vatt');
    input.position(posX, height / 2 - 120);
    input.size(anchoElementos, 40);
    input.style('background-color', theme.surface);
    input.style('border', '1px solid rgba(255, 255, 255, 0.1)');
    input.style('color', theme.text);
    input.style('font-size', '18px');
    input.style('border-radius', '8px');
    input.style('padding', '5px 15px');
    input.style('text-align', 'center');

    const buttonStyles = (button, bgColor) => {
        button.style('background-color', bgColor);
        button.style('border', 'none');
        button.style('color', theme.textHighlight);
        button.style('font-family', "'Roboto', sans-serif");
        button.style('font-weight', 'bold');
        button.style('border-radius', '8px');
        button.style('cursor', 'pointer');
        button.style('transition', 'box-shadow 0.2s ease');
        button.mouseOver(() => button.style('box-shadow', `0 0 15px ${bgColor}`));
        button.mouseOut(() => button.style('box-shadow', 'none'));
    };

    // Ajuste de tamaño de botones para hacer espacio
    const numBotones = 5;
    const gap = 10;
    const anchoBoton = (anchoElementos - (numBotones - 1) * gap) / numBotones;

    if (!translateButton) {
        translateButton = createButton('Reproducir');
        translateButton.mousePressed(traducir);
    }
    translateButton.position(posX, yBotones);
    translateButton.size(anchoBoton, 40);
    buttonStyles(translateButton, theme.primary);

    if (!pauseButton) {
        pauseButton = createButton('Pausa');
        pauseButton.mousePressed(pausarReanudar);
        pauseButton.attribute('disabled', '');
    }
    pauseButton.position(translateButton.x + translateButton.width + gap, yBotones);
    pauseButton.size(anchoBoton, 40);
    buttonStyles(pauseButton, theme.secondary);

    if (!decodeButton) {
        decodeButton = createButton('Decodificar');
        decodeButton.mousePressed(alternarDecodificador);
    }
    decodeButton.position(pauseButton.x + pauseButton.width + gap, yBotones);
    decodeButton.size(anchoBoton, 40);
    buttonStyles(decodeButton, '#FF9800');

    if (!exportButton) {
        exportButton = createButton('Exportar');
        exportButton.mousePressed(exportarAudio);
        exportButton.attribute('disabled', '');
    }
    exportButton.position(decodeButton.x + decodeButton.width + gap, yBotones);
    exportButton.size(anchoBoton, 40);
    buttonStyles(exportButton, theme.secondary);

    // --- NUEVO BOTÓN MIDI ---
    if (!exportMidiButton) {
        exportMidiButton = createButton('Exportar MIDI');
        exportMidiButton.mousePressed(exportarMIDI);
    }
    exportMidiButton.position(exportButton.x + exportButton.width + gap, yBotones);
    exportMidiButton.size(anchoBoton, 40);
    buttonStyles(exportMidiButton, '#4CAF50'); // Un color verde para diferenciarlo
    // --- FIN NUEVO BOTÓN ---

    if (!stopRecordingButton) {
        stopRecordingButton = createButton('Cancelar Grabación');
        stopRecordingButton.mousePressed(cancelarGrabacion);
    }
    stopRecordingButton.position(posX, yBotones);
    stopRecordingButton.size(anchoElementos, 40);
    buttonStyles(stopRecordingButton, theme.red);

    if (!renameButton) {
        renameButton = createButton('✏️');
        renameButton.mousePressed(() => {
            filenameInput.elt.style.display = filenameInput.elt.style.display === 'none' ? 'block' : 'none';
            filenameInput.value(`morse-${Date.now()}`);
            if (filenameInput.elt.style.display !== 'none') {
                filenameInput.position(exportButton.x, yBotones + exportButton.height + 5);
                filenameInput.size(exportButton.width + exportMidiButton.width + gap + 15, 30);
            }
        });
    }
    // Posiciona el botón de renombrar al final de la fila de botones
    renameButton.position(exportMidiButton.x + exportMidiButton.width + gap, yBotones);
    renameButton.size(40, 40);
    buttonStyles(renameButton, '#444');


    if (!filenameInput) {
        filenameInput = createInput(`morse-${Date.now()}`);
        filenameInput.style('background-color', theme.surface);
        filenameInput.style('border', '1px solid rgba(255, 255, 255, 0.1)');
        filenameInput.style('color', theme.text);
        filenameInput.style('font-size', '14px');
        filenameInput.style('border-radius', '8px');
        filenameInput.style('padding', '5px 10px');
    }
    filenameInput.hide();

    if (!speedSlider) {
        speedSlider = createSlider(5, 40, 20, 1);
        speedSlider.input(() => {
            WPM = speedSlider.value();
            tiempoBase = 1200 / WPM;
        });
    }
    speedSlider.position(posX, yBotones + 55);
    speedSlider.size(anchoElementos * 0.85);
    speedSlider.style('cursor', 'pointer');
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    positionElements();
}

// --- FUNCIONES DEL DECODIFICADOR ---

function alternarDecodificador() {
    if (!audioIniciado) {
        userStartAudio();
        audioIniciado = true;
    }
    decodificando = !decodificando;

    if (decodificando) {
        mic.start();
        decodeButton.html('Detener');
        translateButton.attribute('disabled', '');
        pauseButton.attribute('disabled', '');
        exportButton.attribute('disabled', '');
        textoDecodificado = '';
        simbolosActuales = '';
        calibrado = false;
    } else {
        mic.stop();
        decodeButton.html('Decodificar');
        translateButton.removeAttribute('disabled');
    }
}

function analizarAudioEntrante() {
    let nivel = mic.getLevel();
    let nuevoEstado = (nivel > UMBRAL_SONIDO) ? 'sonido' : 'silencio';

    if (nuevoEstado !== estadoSonido) {
        let duracionMs = (contadorFrames * 1000) / frameRate();
        if (duracionMs > 20) { // Ignorar cambios muy rápidos/ruido
            procesarDuracion(estadoSonido, duracionMs);
        }
        estadoSonido = nuevoEstado;
        contadorFrames = 0;
    }
    contadorFrames++;
}

function procesarDuracion(tipo, duracionMs) {
    if (tipo === 'sonido') {
        if (!calibrado && duracionMs > 50) {
            tiempoBaseDecodificador = duracionMs;
            calibrado = true;
        }
        if (calibrado) {
            simbolosActuales += (duracionMs < tiempoBaseDecodificador * 2) ? '.' : '-';
        }
    } else if (tipo === 'silencio' && calibrado) {
        if (duracionMs > tiempoBaseDecodificador * 5) {
            let letra = morseInverso[simbolosActuales];
            if (letra) textoDecodificado += letra;
            textoDecodificado += ' ';
            simbolosActuales = '';
        } else if (duracionMs > tiempoBaseDecodificador * 2) {
            let letra = morseInverso[simbolosActuales];
            if (letra) textoDecodificado += letra;
            simbolosActuales = '';
        }
    }
}

// --- FUNCIONES ORIGINALES (GENERADOR Y EXPORTADOR) ---

function traducir() {
    if (decodificando) return;
    if (reproduciendo) {
        detenerReproduccion();
        return;
    }
    const texto = limpiarTexto(input.value().toLowerCase());
    if (texto === '') return;
    traducirTexto(texto);
    indiceActual = 0;
    reproduciendo = true;
    pausado = false;
    translateButton.html('Detener');
    pauseButton.removeAttribute('disabled');
    exportButton.removeAttribute('disabled');
    renameButton.removeAttribute('disabled');
    reproducirSiguienteSimbolo();
}

function pausarReanudar() {
    if (!reproduciendo) return;
    pausado = !pausado;
    if (pausado) {
        osc.amp(0, 0.1);
        pauseButton.html('Reanudar');
    } else {
        pauseButton.html('Pausa');
        reproducirSiguienteSimbolo();
    }
}

function exportarAudio() {
    if (input.value() === '' || decodificando) return;
    detenerReproduccion();
    traducirTexto(limpiarTexto(input.value().toLowerCase()));

    translateButton.hide();
    pauseButton.hide();
    exportButton.hide();
    renameButton.hide();
    decodeButton.hide();
    stopRecordingButton.show();
    filenameInput.hide();

    grabando = true;
    indiceActual = 0;
    progreso = 0;

    soundFile = new p5.SoundFile();
    recorder = new p5.SoundRecorder();
    recorder.record(soundFile);

    oscUltrasonico.amp(0.5, 0.05);
    reproducirSiguienteSimbolo();
}

function detenerGrabacion() {
    if (!grabando) return;
    recorder.stop();
    grabando = false;
    oscUltrasonico.amp(0, 0.1);

    setTimeout(() => {
        if (soundFile.buffer && soundFile.buffer.getChannelData(0).length > 0) {
            let filename = filenameInput.value();
            if (!filename) filename = `morse-${Date.now()}`;
            saveSound(soundFile, `${filename}.wav`);
        } else {
            console.warn("No se pudo guardar el archivo. El búfer de audio está vacío.");
            alert("No se pudo grabar audio. Intente con un texto más largo o revise los permisos del micrófono.");
        }
    }, 500);

    stopRecordingButton.hide();
    translateButton.show();
    pauseButton.show();
    exportButton.show();
    renameButton.show();
    decodeButton.show();
    progreso = 0;
}

function cancelarGrabacion() {
    if (!grabando) return;
    recorder.stop();
    grabando = false;
    osc.amp(0, 0.1);
    oscUltrasonico.amp(0, 0.1);
    detenerReproduccion();

    stopRecordingButton.hide();
    translateButton.show();
    pauseButton.show();
    exportButton.show();
    renameButton.show();
    decodeButton.show();
    progreso = 0;

    soundFile = new p5.SoundFile();
    recorder = new p5.SoundRecorder();
}

// CÓDIGO CORREGIDO Y LISTO PARA USAR
function reproducirSiguienteSimbolo() {
    if ((!reproduciendo && !grabando) || pausado) {
        return;
    }

    if (grabando) {
        // Tu lógica de la barra de progreso (está bien como está)
        const totalDuracion = morseEnProgreso.filter(item => item.tipo !== 'caracter').reduce((acc, item) => acc + item.duracion, 0);
        const duracionActual = morseEnProgreso.slice(0, indiceActual).filter(item => item.tipo !== 'caracter').reduce((acc, item) => acc + item.duracion, 0);
        progreso = map(duracionActual, 0, totalDuracion, 0, 100);
    }

    // ----- INICIO DE LA CORRECCIÓN CLAVE -----
    // Avanza el índice hasta encontrar el próximo evento de AUDIO (sonido o silencio)
    // Saltándose los elementos que son solo para la visualización ('caracter')
    while (indiceActual < morseEnProgreso.length && morseEnProgreso[indiceActual].tipo === 'caracter') {
        indiceActual++;
    }
    // ----- FIN DE LA CORRECCIÓN CLAVE -----

    if (indiceActual >= morseEnProgreso.length) {
        if (grabando) detenerGrabacion();
        if (reproduciendo) detenerReproduccion();
        return;
    }

    const actual = morseEnProgreso[indiceActual];
    if (actual.tipo === 'sonido') {
        osc.amp(0.5, 0.05);
    } else { // Ahora, 'else' solo se aplicará a los de tipo 'silencio'
        osc.amp(0, 0.05);
    }

    setTimeout(() => {
        indiceActual++;
        reproducirSiguienteSimbolo();
    }, actual.duracion);
}

// CÓDIGO CORREGIDO, OPTIMIZADO Y LISTO PARA USAR
function traducirTexto(texto) {
    morseEnProgreso = [];
    const palabras = texto.split(' '); // Divide el texto en palabras

    for (let p = 0; p < palabras.length; p++) {
        const palabra = palabras[p];

        // 1. Traduce cada letra de la palabra
        for (let c = 0; c < palabra.length; c++) {
            const char = palabra[c];
            if (diccionarioMorse.hasOwnProperty(char)) {
                const codigo = diccionarioMorse[char];

                // Procesa los puntos y rayas del código Morse
                for (let i = 0; i < codigo.length; i++) {
                    const simbolo = codigo[i];
                    let duracionSimbolo;

                    if (simbolo === '.') {
                        duracionSimbolo = tiempoBase; // Duración de un punto: 1 unidad
                    } else if (simbolo === '-') {
                        duracionSimbolo = tiempoBase * 3; // Duración de una raya: 3 unidades
                    }
                    
                    morseEnProgreso.push({ tipo: 'sonido', duracion: duracionSimbolo });
                    morseEnProgreso.push({ tipo: 'caracter', simbolo: simbolo, duracion: duracionSimbolo });

                    // Silencio entre símbolos de una misma letra (1 unidad)
                    if (i < codigo.length - 1) {
                        morseEnProgreso.push({ tipo: 'silencio', duracion: tiempoBase });
                    }
                }

                // Silencio entre letras de una misma palabra (3 unidades)
                if (c < palabra.length - 1) {
                    morseEnProgreso.push({ tipo: 'silencio', duracion: tiempoBase * 3 });
                }
            }
        }

        // 2. Agrega el silencio entre palabras (7 unidades)
        // Se agrega solo si no es la última palabra del texto.
        if (p < palabras.length - 1) {
            morseEnProgreso.push({ tipo: 'silencio', duracion: tiempoBase * 7 });
            morseEnProgreso.push({ tipo: 'caracter', simbolo: ' / ', duracion: tiempoBase * 7 });
        }
    }
}
function detenerReproduccion() {
    osc.amp(0, 0.1);
    reproduciendo = false;
    pausado = false;
    translateButton.html('Reproducir');
    pauseButton.html('Pausa');
    pauseButton.attribute('disabled', '');
    exportButton.attribute('disabled', '');
    renameButton.attribute('disabled', '');
    indiceActual = 0;
}

function limpiarTexto(txt) {
    return txt.replace(/[^a-zA-Z0-9 ]/g, '');
}

// --- NUEVAS FUNCIONES PARA EXPORTAR MIDI ---

/**
 * Codifica un número en formato de Cantidad de Longitud Variable (VLQ) para MIDI.
 * @param {number} value El número a codificar.
 * @returns {number[]} Un array de bytes que representa el número en VLQ.
 */
function toVariableLengthQuantity(value) {
    let buffer = [value & 0x7F];
    value >>= 7;
    while (value > 0) {
        buffer.unshift((value & 0x7F) | 0x80);
        value >>= 7;
    }
    return buffer;
}

/**
 * Función principal para generar y descargar el archivo MIDI.
 */
function exportarMIDI() {
    const texto = limpiarTexto(input.value().toLowerCase());
    if (texto === '' || decodificando) {
        alert("Por favor, ingrese texto para convertir a Morse o detenga el modo decodificador.");
        return;
    }

    // 1. Traducir texto a la estructura morseEnProgreso localmente
    traducirTexto(texto);

    // 2. Definir parámetros del MIDI
    const PITCH = 60; // Nota C4 (Do central)
    const VELOCITY = 100; // Volumen de la nota (0-127)
    const TICKS_PER_QUARTER_NOTE = 120;
    // La duración de un "dot" (tiempoBase) se mapeará a una semicorchea (16th note).
    // Una negra (quarter note) = 4 semicorcheas = 4 * tiempoBase.
    const MICROSECONDS_PER_QUARTER_NOTE = (4 * tiempoBase) * 1000;

    // 3. Crear la lista de eventos MIDI (Note On / Note Off) con sus tiempos absolutos
    let events = [];
    let currentTimeMs = 0;

    for (const item of morseEnProgreso) {
        if (item.tipo === 'caracter') continue; // Ignorar los elementos visuales

        if (item.tipo === 'sonido') {
            events.push({ timeMs: currentTimeMs, type: 'on' });
            events.push({ timeMs: currentTimeMs + item.duracion, type: 'off' });
        }
        currentTimeMs += item.duracion;
    }
    events.sort((a, b) => a.timeMs - b.timeMs);

    // 4. Construir los bytes del track MIDI
    let trackData = [];
    let lastTimeTicks = 0;
    const ticksPerMs = TICKS_PER_QUARTER_NOTE / (MICROSECONDS_PER_QUARTER_NOTE / 1000);

    for (const event of events) {
        const eventTimeTicks = Math.round(event.timeMs * ticksPerMs);
        const deltaTime = eventTimeTicks - lastTimeTicks;

        trackData.push(...toVariableLengthQuantity(deltaTime)); // Delta-time
        if (event.type === 'on') {
            trackData.push(0x90, PITCH, VELOCITY); // Note On, Canal 0
        } else {
            trackData.push(0x80, PITCH, 0); // Note Off, Canal 0
        }
        lastTimeTicks = eventTimeTicks;
    }
    
    // Añadir evento de fin de pista
    trackData.push(...toVariableLengthQuantity(0));
    trackData.push(0xFF, 0x2F, 0x00); // Meta-evento: End of Track

    // 5. Construir el archivo MIDI completo
    const uInt8 = (val) => val & 0xFF;
    const toFourBytes = (val) => [uInt8(val >> 24), uInt8(val >> 16), uInt8(val >> 8), uInt8(val)];

    // Header Chunk
    const header = [
        0x4D, 0x54, 0x68, 0x64, // 'MThd'
        0x00, 0x00, 0x00, 0x06, // Chunk length (6 bytes)
        0x00, 0x00,             // Format 0 (single track)
        0x00, 0x01,             // Number of tracks (1)
        uInt8(TICKS_PER_QUARTER_NOTE >> 8), uInt8(TICKS_PER_QUARTER_NOTE) // Division
    ];
    
    // Track Chunk
    const track = [
        0x4D, 0x54, 0x72, 0x6B, // 'MTrk'
        ...toFourBytes(trackData.length), // Track length
        ...trackData
    ];

    // 6. Crear Blob y descargar
    const midiBytes = new Uint8Array([...header, ...track]);
    const blob = new Blob([midiBytes], { type: 'audio/midi' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `morse-output-${Date.now()}.mid`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function mousePressed() {
    if (!audioIniciado) {
        userStartAudio();
        audioIniciado = true;
    }
}
