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



// ESTÉTICA: Paleta de colores centralizada para un look coherente de tema oscuro

const theme = {

background: '#121212', // Negro casi puro para el fondo

surface: 'rgba(40, 40, 40, 0.8)', // Superficie semitransparente para la caja

primary: '#BB86FC', // Púrpura/Lavanda como color de acento principal

secondary: '#03DAC6', // Verde azulado como color secundario

text: '#EAEAEA', // Blanco roto para texto legible

textHighlight: '#FFFFFF', // Blanco puro para texto sobre fondos de color

red: '#CF6679' // Rojo para el texto resaltado de morse

};



// Diccionario para la traducción de caracteres a código morse

const diccionarioMorse = {

'a': '.-', 'b': '-...', 'c': '-.-.', 'd': '-..', 'e': '.', 'f': '..-.', 'g': '--.', 'h': '....', 'i': '..', 'j': '.---', 'k': '-.-', 'l': '.-..', 'm': '--', 'n': '-.', 'o': '---', 'p': '.--.', 'q': '--.-', 'r': '.-.', 's': '...', 't': '-', 'u': '..-', 'v': '...-', 'w': '.--', 'x': '-..-', 'y': '-.--', 'z': '--..', '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.', ' ': '/'

};



// Se ejecuta antes de setup para cargar recursos externos

function preload() {

img = loadImage('asset/vattlogo.png.png');

}

function detenerGrabacion() {
  if (!grabando) return;

  // Detiene la grabación
  recorder.stop();
  grabando = false;

  // Comprobar si hay datos de audio grabados antes de intentar guardar.
  // Esto evita el error si la grabación termina sin audio.
  if (soundFile.buffer && soundFile.buffer.getChannelData(0).length > 0) {
    let filename = filenameInput.value();
    if (!filename) {
      filename = `morse-${Date.now()}`;
    }
    saveSound(soundFile, `${filename}.wav`);
  } else {
    console.warn("No se pudo guardar el archivo. El búfer de audio está vacío.");
    // Opcional: mostrar un mensaje de error al usuario
    alert("No se pudo grabar audio. Intente con un texto más largo.");
  }

  // Restaura la interfaz de usuario
  stopRecordingButton.hide();
  translateButton.show();
  pauseButton.show();
  exportButton.show();
  renameButton.show();
}

// Función de configuración inicial, se ejecuta una sola vez

function setup() {

createCanvas(windowWidth, windowHeight);


// Configuración del generador de sonido (oscilador)

osc = new p5.Oscillator('sine');

osc.freq(500);

osc.amp(0);

osc.start();


// Configuración del grabador de audio

soundFile = new p5.SoundFile();

recorder = new p5.SoundRecorder();

recorder.setInput(osc);


// Llama a la función que crea y posiciona todos los elementos de la UI

positionElements();


// Oculta botones que no son necesarios al inicio

stopRecordingButton.hide();

filenameInput.hide();


// ESTÉTICA: Aplica la fuente principal a todo el cuerpo del documento

document.body.style.fontFamily = "'Roboto', sans-serif";

// ESTÉTICA: Cambia el color de fondo del HTML para que coincida con el tema

document.body.style.backgroundColor = theme.background;

}



// Bucle de dibujo principal, se ejecuta continuamente

function draw() {

// Pinta el fondo del lienzo

background(theme.background);


// Dibuja el logo de fondo como una marca de agua sutil

tint(255, 30);

image(img, 0, 0, width, height);

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


// Lógica para dibujar el texto Morse dentro de la caja

noStroke();

fill(theme.text);

textSize(24);

let x = boxX + 20;

let y = boxY + 20;

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



// Muestra el valor de Palabras Por Minuto (WPM) junto al slider

let sliderX = speedSlider.x + speedSlider.width + 15;

let sliderY = speedSlider.y;

fill(theme.text);

textSize(16);

textAlign(LEFT, TOP);

text(`${WPM} WPM`, sliderX, sliderY);

}



// Función para crear y posicionar todos los elementos de la UI

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

translateButton.size(anchoElementos / 4, 40);

buttonStyles(translateButton, theme.primary);



if (!pauseButton) {

pauseButton = createButton('Pausa');

pauseButton.mousePressed(pausarReanudar);

pauseButton.attribute('disabled', '');

}

pauseButton.position(translateButton.x + translateButton.width + 10, yBotones);

pauseButton.size(anchoElementos / 5, 40);

buttonStyles(pauseButton, theme.secondary);



if (!exportButton) {

exportButton = createButton('Exportar');

exportButton.mousePressed(exportarAudio);

exportButton.attribute('disabled', '');

}

exportButton.position(pauseButton.x + pauseButton.width + 10, yBotones);

exportButton.size(anchoElementos / 4, 40);

buttonStyles(exportButton, theme.secondary);



if (!stopRecordingButton) {

stopRecordingButton = createButton('Detener Grabación');

stopRecordingButton.mousePressed(detenerGrabacion);

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



// ------ LÓGICA FUNCIONAL PRINCIPAL (SIN CAMBIOS) ------



function windowResized() { resizeCanvas(windowWidth, windowHeight); positionElements(); }



function traducir() { if (reproduciendo) { detenerReproduccion(); return; } const texto = limpiarTexto(input.value().toLowerCase()); if (texto === '') return; traducirTexto(texto); indiceActual = 0; reproduciendo = true; pausado = false; translateButton.html('Detener'); pauseButton.removeAttribute('disabled'); exportButton.removeAttribute('disabled'); renameButton.removeAttribute('disabled'); reproducirSiguienteSimbolo(); }



function pausarReanudar() { if (!reproduciendo) return; pausado = !pausado; if (pausado) { osc.amp(0, 0.1); pauseButton.html('Reanudar'); } else { pauseButton.html('Pausa'); reproducirSiguienteSimbolo(); } }



function exportarAudio() { if (grabando) return; if (input.value() === '') return; detenerReproduccion(); traducirTexto(limpiarTexto(input.value().toLowerCase())); stopRecordingButton.show(); translateButton.hide(); pauseButton.hide(); exportButton.hide(); renameButton.hide(); filenameInput.hide(); grabando = true; indiceActual = 0; recorder.record(soundFile); reproducirSiguienteSimbolo(); }



function detenerGrabacion() { if (!grabando) return; recorder.stop(); grabando = false; stopRecordingButton.hide(); translateButton.show(); pauseButton.show(); exportButton.show(); renameButton.show(); let filename = filenameInput.value(); if (!filename) filename = `morse-${Date.now()}`; saveSound(soundFile, `${filename}.wav`); }



function reproducirSiguienteSimbolo() { if ((!reproduciendo && !grabando) || pausado) return; if (indiceActual >= morseEnProgreso.length) { if (grabando) { detenerGrabacion(); } if (reproduciendo) { detenerReproduccion(); } return; } const actual = morseEnProgreso[indiceActual]; if (actual.tipo === 'sonido') { osc.amp(0.5, 0.05); } else { osc.amp(0, 0.05); } setTimeout(() => { indiceActual++; reproducirSiguienteSimbolo(); }, actual.duracion); }



function traducirTexto(texto) { morseEnProgreso = []; for (const char of texto) { if (diccionarioMorse.hasOwnProperty(char)) { const codigo = diccionarioMorse[char]; if (codigo === '/') { morseEnProgreso.push({ tipo: 'silencio', duracion: tiempoBase * 7 }); morseEnProgreso.push({ tipo: 'caracter', simbolo: ' / ', duracion: tiempoBase * 7 }); } else { for(let i = 0; i < codigo.length; i++) { const simbolo = codigo[i]; if (simbolo === '.') { morseEnProgreso.push({ tipo: 'sonido', duracion: tiempoBase }); } else if (simbolo === '-') { morseEnProgreso.push({ tipo: 'sonido', duracion: tiempoBase * 3 }); } morseEnProgreso.push({ tipo: 'caracter', simbolo: simbolo, duracion: morseEnProgreso[morseEnProgreso.length - 1].duracion }); if(i < codigo.length - 1) { morseEnProgreso.push({ tipo: 'silencio', duracion: tiempoBase }); } } morseEnProgreso.push({ tipo: 'silencio', duracion: tiempoBase * 3 }); } } } }



function detenerReproduccion() { osc.amp(0, 0.1); reproduciendo = false; pausado = false; translateButton.html('Reproducir'); pauseButton.html('Pausa'); pauseButton.attribute('disabled', ''); exportButton.attribute('disabled', ''); renameButton.attribute('disabled', ''); indiceActual = 0; }



function limpiarTexto(txt) { return txt.replace(/[^a-zA-Z0-9 ]/g, ''); }



// SOLUCIÓN CLAVE: Activa el audio en móviles con el primer toque

function mousePressed() { if (!audioIniciado) { userStartAudio(); audioIniciado = true; } }
