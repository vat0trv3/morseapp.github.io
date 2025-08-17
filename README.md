Morse Translator Interactivo con Audio y MIDI

Descripción del Proyecto

        Este proyecto es un traductor de texto a código Morse en tiempo real, desarrollado en p5.js, 
        con una interfaz gráfica moderna y visualización dinámica. Incluye funcionalidades avanzadas de 
        audio y grabación, permitiendo tanto la reproducción audible del Morse como su exportación en formato WAV o MIDI.

El proyecto combina varias características únicas:
	•	Traducción de texto a Morse: Convierte letras y 
        números en puntos y rayas según el estándar internacional.
	•	Reproducción de audio en tiempo real:
	•	Genera sonido audible mediante un oscilador p5.js.
	•	Posibilidad de emitir una señal ultrasónica inaudible para comunicación encubierta.
	•	Grabación de audio: Permite registrar la secuencia Morse en WAV.
	•	Exportación MIDI: Convierte la secuencia Morse en un archivo MIDI, donde los puntos y rayas se transforman en 
        notas musicales.
	•	Decodificación de Morse desde micrófono: Analiza el audio entrante y reconstruye el dibujo. Características Destacadas
	•	Interfaz gráfica moderna y responsiva:
	•	Caja central con efecto de vidrio esmerilado para mostrar la secuencia Morse.
	•	Logo de fondo como marca de agua.
	•	Paleta de colores centralizada y coherente para facilidad visual.
	•	Controles interactivos:
	•	Input de texto para traducir.
	•	Botones de Reproducir, Pausa, Decodificar, Exportar y Exportar MIDI.
	•	Slider de velocidad (WPM) ajustable en tiempo real.
	•	Opción para renombrar archivos exportados.
	•	Grabación y progreso:
	•	Barra de progreso para la grabación de audio.
	•	Cancelación de grabación en cualquier momento.

Cómo Usarlo
	1.	Abrir el proyecto: Cargar el archivo HTML en un navegador compatible con Web Audio API.
	2.	Escribir texto: Introducir el mensaje que deseas traducir en Morse.
	3.	Reproducir Morse:
	•	Presionar Reproducir para escuchar la secuencia.
	•	Usar Pausa para detener temporalmente la reproducción.
	4.	Exportar audio:
	•	Pulsar Exportar para grabar la señal Morse en WAV.
	•	Renombrar el archivo si se desea.
	5.	Exportar MIDI:
	•	Presionar Exportar MIDI para generar un archivo MIDI con la secuencia Morse.
	6.	Decodificar desde audio:
	•	Activar Decodificar para que el micrófono lea Morse entrante y reconstruya el texto en tiempo real.

Requisitos
	•	Navegador moderno con soporte para Web Audio API (Chrome, Firefox, Edge).
	•	Librerías:
	•	p5.js
	•	p5.sound
