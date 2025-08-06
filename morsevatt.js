// Variable para la imagen de fondo

let img;



// Variables para los elementos de la interfaz de usuario (UI)

let input, translateButton, pauseButton, exportButton, stopRecordingButton, renameButton, filenameInput;



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

  



fill(theme.surface);

stroke(255, 255, 255, 50);

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



if (!translateButton) {

translateButton = createButton('Reproducir');

translateButton.mousePressed(traducir);

}

translateButton.position(posX, yBotones);

translateButton.size(anchoElementos / 5, 40);

buttonStyles(translateButton, theme.primary);



if (!pauseButton) {

pauseButton = createButton('Pausa');

pauseButton.mousePressed(pausarReanudar);

pauseButton.attribute('disabled', '');

}

pauseButton.position(translateButton.x + translateButton.width + 10, yBotones);

pauseButton.size(anchoElementos / 5, 40);

buttonStyles(pauseButton, theme.secondary);



if (!decodeButton) {

decodeButton = createButton('Decodificar');

decodeButton.mousePressed(alternarDecodificador);

}

decodeButton.position(pauseButton.x + pauseButton.width + 10, yBotones);

decodeButton.size(anchoElementos / 4, 40);

buttonStyles(decodeButton, '#FF9800');



if (!exportButton) {

exportButton = createButton('Exportar');

exportButton.mousePressed(exportarAudio);

exportButton.attribute('disabled', '');

}

exportButton.position(decodeButton.x + decodeButton.width + 10, yBotones);

exportButton.size(anchoElementos / 4, 40);

buttonStyles(exportButton, theme.secondary);



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

filenameInput.size(exportButton.width + 15, 30);

}

});

}

renameButton.position(exportButton.x + exportButton.width + 10, yBotones);

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

speedSlider.input(() => { WPM = speedSlider.value(); tiempoBase = 1200 / WPM; });

}

speedSlider.position(posX, yBotones + 55);

speedSlider.size(anchoElementos * 0.85);

speedSlider.style('cursor', 'pointer');

}



function windowResized() { resizeCanvas(windowWidth, windowHeight); positionElements(); }



// --- FUNCIONES DEL DECODIFICADOR ---



function alternarDecodificador() {

if (!audioIniciado) { userStartAudio(); audioIniciado = true; }

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



function reproducirSiguienteSimbolo() {

if ((!reproduciendo && !grabando) || pausado) {

return;

}


if (grabando) {

const totalDuracion = morseEnProgreso.reduce((acc, item) => acc + item.duracion, 0);

const duracionActual = morseEnProgreso.slice(0, indiceActual).reduce((acc, item) => acc + item.duracion, 0);

progreso = map(duracionActual, 0, totalDuracion, 0, 100);

}


if (indiceActual >= morseEnProgreso.length) {

if (grabando) detenerGrabacion();

if (reproduciendo) detenerReproduccion();

return;

}


const actual = morseEnProgreso[indiceActual];

if (actual.tipo === 'sonido') {

osc.amp(0.5, 0.05);

} else {

osc.amp(0, 0.05);

}


setTimeout(() => {

indiceActual++;

reproducirSiguienteSimbolo();

}, actual.duracion);

}



function traducirTexto(texto) {

morseEnProgreso = [];

for (const char of texto) {

if (diccionarioMorse.hasOwnProperty(char)) {

const codigo = diccionarioMorse[char];

if (codigo === '/') {

morseEnProgreso.push({ tipo: 'silencio', duracion: tiempoBase * 7 });

morseEnProgreso.push({ tipo: 'caracter', simbolo: ' / ', duracion: tiempoBase * 7 });

} else {

for (let i = 0; i < codigo.length; i++) {

const simbolo = codigo[i];

if (simbolo === '.') morseEnProgreso.push({ tipo: 'sonido', duracion: tiempoBase });

else if (simbolo === '-') morseEnProgreso.push({ tipo: 'sonido', duracion: tiempoBase * 3 });


morseEnProgreso.push({ tipo: 'caracter', simbolo: simbolo, duracion: morseEnProgreso[morseEnProgreso.length - 1].duracion });

if (i < codigo.length - 1) morseEnProgreso.push({ tipo: 'silencio', duracion: tiempoBase });

}

morseEnProgreso.push({ tipo: 'silencio', duracion: tiempoBase * 3 });

}

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



function limpiarTexto(txt) { return txt.replace(/[^a-zA-Z0-9 ]/g, ''); }



function mousePressed() { if (!audioIniciado) { userStartAudio(); audioIniciado = true; } }
