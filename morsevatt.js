let img;
let input, translateButton, pauseButton, exportButton, stopRecordingButton, renameButton, filenameInput, confirmRenameButton;
let speedSlider;
let morseCode = '';
let morseEnProgreso = [];
let osc;
let recorder, soundFile;
let indiceActual = 0;
let reproduciendo = false;
let pausado = false;
let grabando = false;
let tiempoBase = 100;
let WPM = 20;

const diccionarioMorse = {
  'a': '.-', 'b': '-...', 'c': '-.-.', 'd': '-..',
  'e': '.', 'f': '..-.', 'g': '--.', 'h': '....',
  'i': '..', 'j': '.---', 'k': '-.-', 'l': '.-..',
  'm': '--', 'n': '-.', 'o': '---', 'p': '.--.',
  'q': '--.-', 'r': '.-.', 's': '...', 't': '-',
  'u': '..-', 'v': '...-', 'w': '.--', 'x': '-..-',
  'y': '-.--', 'z': '--..', '0': '-----', '1': '.----',
  '2': '..---', '3': '...--', '4': '....-', '5': '.....',
  '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  ' ': ' '
};

function preload() {
  img = loadImage('asset/vattlogo.png.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  osc = new p5.Oscillator('sine');
  osc.freq(500);
  osc.amp(0);
  osc.start();

  soundFile = new p5.SoundFile();
  recorder = new p5.SoundRecorder();
  recorder.setInput(osc);

  input = createInput('poweredbyvatt');
  translateButton = createButton('Traducir y Reproducir');
  pauseButton = createButton('Pausa');
  exportButton = createButton('Exportar WAV');
  stopRecordingButton = createButton('Detener Grabación');
  renameButton = createButton('✏️');
  filenameInput = createInput(`morse-${Date.now()}`);
  confirmRenameButton = createButton('Confirmar');
  speedSlider = createSlider(20, 120, 20, 1);

  translateButton.mousePressed(traducir);
  pauseButton.mousePressed(pausarReanudar);
  exportButton.mousePressed(exportarAudio);
  stopRecordingButton.mousePressed(detenerGrabacion);
  renameButton.mousePressed(() => {
    renameButton.hide();
    exportButton.hide();
    filenameInput.show();
    confirmRenameButton.show();
    positionElements();
  });
  confirmRenameButton.mousePressed(() => {
    renameButton.show();
    exportButton.show();
    filenameInput.hide();
    confirmRenameButton.hide();
    positionElements();
  });
  speedSlider.input(() => {
    WPM = speedSlider.value();
    tiempoBase = 1200 / WPM;
  });

  input.style('border-radius', '8px');
  input.style('border', 'none');
  input.style('padding', '5px');
  input.style('font-family', 'sans-serif');
  input.style('text-align', 'center');

  translateButton.style('border-radius', '8px');
  translateButton.style('border', 'none');
  translateButton.style('background-color', '#4CAF50');
  translateButton.style('color', 'white');
  translateButton.style('font-family', 'sans-serif');

  pauseButton.style('border-radius', '8px');
  pauseButton.style('border', 'none');
  pauseButton.style('background-color', '#FF9800');
  pauseButton.style('color', 'white');
  pauseButton.style('font-family', 'sans-serif');
  pauseButton.attribute('disabled', '');

  exportButton.style('border-radius', '8px');
  exportButton.style('border', 'none');
  exportButton.style('background-color', '#2196F3');
  exportButton.style('color', 'white');
  exportButton.style('font-family', 'sans-serif');
  exportButton.attribute('disabled', '');
  
  stopRecordingButton.style('border-radius', '8px');
  stopRecordingButton.style('border', 'none');
  stopRecordingButton.style('background-color', '#F44336');
  stopRecordingButton.style('color', 'white');
  stopRecordingButton.style('font-family', 'sans-serif');
  stopRecordingButton.hide();

  renameButton.style('border-radius', '8px');
  renameButton.style('border', 'none');
  renameButton.style('background-color', '#ddd');

  filenameInput.style('border-radius', '8px');
  filenameInput.style('border', 'none');
  filenameInput.style('padding', '5px');
  filenameInput.style('font-family', 'sans-serif');
  filenameInput.hide();

  confirmRenameButton.style('border-radius', '8px');
  confirmRenameButton.style('border', 'none');
  confirmRenameButton.style('background-color', '#4CAF50');
  confirmRenameButton.style('color', 'white');
  confirmRenameButton.style('font-family', 'sans-serif');
  confirmRenameButton.hide();

  positionElements();
  
  textSize(22);
  textAlign(LEFT, TOP);
}

function draw() {
  imageMode(CORNER);
  image(img, 0, 0, width, height);

  const boxWidth = width * 0.6;
  const boxHeight = height * 0.3;
  const boxX = (width - boxWidth) / 2;
  const boxY = height / 2 + 30;

  fill(255);
  noStroke();
  rect(boxX, boxY, boxWidth, boxHeight, 8);
  
  fill(0);
  let x = boxX + 10;
  let y = boxY + 10;

  for (let i = 0; i < morseEnProgreso.length; i++) {
    const item = morseEnProgreso[i];
    if (item.tipo === 'caracter') {
      fill(i === indiceActual && (reproduciendo || grabando) && !pausado ? color(255, 0, 0) : 0);
      text(item.simbolo, x, y);
      x += textWidth(item.simbolo + ' ');
      if (x > boxX + boxWidth - 10) {
        x = boxX + 10;
        y += 30;
      }
    }
  }

  let sliderX = speedSlider.x + speedSlider.width + 10;
  let sliderY = speedSlider.y + speedSlider.height / 2 + 5;
  fill(0);
  textSize(16);
  textAlign(LEFT, CENTER);
  text(`${WPM} WPM`, sliderX, sliderY);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  positionElements();
}

function positionElements() {
  let anchoElementos = width * 0.6;
  let posX = (width - anchoElementos) / 2;
  let yBotones = height / 2 - 50;
  let ySlider = yBotones + 40;

  input.position(posX, height / 2 - 100);
  input.size(anchoElementos, 30);

  translateButton.position(posX, yBotones);
  translateButton.size(anchoElementos / 2.5, 30);

  pauseButton.position(translateButton.x + translateButton.width + 5, yBotones);
  pauseButton.size(anchoElementos / 5, 30);

  exportButton.position(pauseButton.x + pauseButton.width + 5, yBotones);
  exportButton.size(anchoElementos / 3.5 - 20, 30);

  stopRecordingButton.position(posX, yBotones);
  stopRecordingButton.size(anchoElementos, 30);

  renameButton.position(exportButton.x + exportButton.width + 5, yBotones);
  renameButton.size(30, 30);

  if(filenameInput.visible()){
    filenameInput.position(exportButton.x, yBotones + exportButton.height + 5);
    filenameInput.size(exportButton.width + 15, 30);
    confirmRenameButton.position(filenameInput.x + filenameInput.width + 5, filenameInput.y);
    confirmRenameButton.size(80, 30);
  }

  speedSlider.position(posX, ySlider);
  speedSlider.size(anchoElementos);
}

function traducir() {
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
  if (grabando) return;
  if (input.value() === '') return;
  
  detenerReproduccion();
  traducirTexto(limpiarTexto(input.value().toLowerCase()));
  
  stopRecordingButton.show();
  translateButton.hide();
  pauseButton.hide();
  exportButton.hide();
  renameButton.hide();
  filenameInput.hide();
  confirmRenameButton.hide();

  grabando = true;
  indiceActual = 0;

  recorder.record(soundFile, obtenerDuracionTotal(), detenerGrabacion);

  reproducirSiguienteSimbolo();
}

function detenerGrabacion() {
  if (!grabando) return;

  recorder.stop();
  grabando = false;
  
  stopRecordingButton.hide();
  translateButton.show();
  pauseButton.show();
  exportButton.show();
  renameButton.show();

  let filename = filenameInput.value();
  if (!filename) filename = `morse-${Date.now()}`;
  saveSound(soundFile, `${filename}.wav`);
}

function reproducirSiguienteSimbolo() {
  if (!reproduciendo && !grabando || pausado) return;

  if (indiceActual >= morseEnProgreso.length) {
    if (reproduciendo) {
      detenerReproduccion();
    }
    return;
  }

  const actual = morseEnProgreso[indiceActual];
  
  if (actual.tipo === 'sonido') {
    osc.amp(0.5, 0.05);
    setTimeout(() => {
      osc.amp(0, 0.05);
      indiceActual++;
      setTimeout(reproducirSiguienteSimbolo, tiempoBase);
    }, actual.duracion);
  } else if (actual.tipo === 'silencio') {
    osc.amp(0, 0.05);
    setTimeout(() => {
      indiceActual++;
      reproducirSiguienteSimbolo();
    }, actual.duracion);
  } else {
    indiceActual++;
    reproducirSiguienteSimbolo();
  }
}

function traducirTexto(texto) {
  morseCode = '';
  for (const char of texto) {
    if (diccionarioMorse.hasOwnProperty(char)) {
      morseCode += diccionarioMorse[char] + ' ';
    }
  }

  morseEnProgreso = [];
  for (let i = 0; i < morseCode.length; i++) {
    const simbolo = morseCode[i];
    if (simbolo === '.') {
      morseEnProgreso.push({ tipo: 'sonido', duracion: tiempoBase });
      morseEnProgreso.push({ tipo: 'silencio', duracion: tiempoBase });
    } else if (simbolo === '-') {
      morseEnProgreso.push({ tipo: 'sonido', duracion: tiempoBase * 3 });
      morseEnProgreso.push({ tipo: 'silencio', duracion: tiempoBase });
    } else if (simbolo === ' ') {
      morseEnProgreso.push({ tipo: 'silencio', duracion: tiempoBase * 7 });
    }
    
    if (simbolo !== ' ') {
      morseEnProgreso.push({ tipo: 'caracter', simbolo: simbolo });
    } else {
      morseEnProgreso.push({ tipo: 'caracter', simbolo: ' ' });
    }
  }
}

function detenerReproduccion() {
  osc.amp(0, 0.1);
  reproduciendo = false;
  pausado = false;
  translateButton.html('Traducir y Reproducir');
  pauseButton.html('Pausa');
  pauseButton.attribute('disabled', '');
  exportButton.attribute('disabled', '');
  renameButton.attribute('disabled', '');
  indiceActual = 0;
}

function limpiarTexto(txt) {
  return txt.replace(/[^a-zA-Z0-9 ]/g, '');
}

function obtenerDuracionTotal() {
  let duracion = 0;
  for (const item of morseEnProgreso) {
    duracion += item.duracion;
  }
  return duracion / 1000;
}
