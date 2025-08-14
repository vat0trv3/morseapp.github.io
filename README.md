Generador de Archivos MIDI de Código Morse
Este proyecto es un script de P5JS que convierte una cadena de texto en un archivo MIDI de audio. El audio generado sigue las reglas de tiempo del código Morse, representando cada carácter con la combinación sonora de puntos y rayas.

1. Objetivo del Proyecto 🎯
El objetivo principal es proporcionar una herramienta simple y eficaz para traducir texto a una representación musical del código Morse. Esto puede ser útil para fines educativos, creativos o de comunicación. Al generar un archivo MIDI, la salida puede ser reproducida por cualquier software o hardware de música compatible, permitiendo la integración en proyectos más grandes o la simple escucha del mensaje codificado.

2. Funcionalidad 🎶
La funcionalidad del script se centra en los siguientes pasos:

Configuración del MIDI: Se inicializa un archivo MIDI (.mid) con una resolución de 480 ticks por pulso. Esta configuración establece la base para la sincronización y el tempo.

Definición de Unidades de Tiempo: Se establece una unidad de tiempo base, el "punto" (.), y a partir de ahí se calculan las duraciones para:

Punto: 1 unidad de tiempo.

Raya: 3 unidades de tiempo.

Pausa entre símbolos: 1 unidad de tiempo.

Pausa entre letras: 3 unidades de tiempo.

Pausa entre palabras: 7 unidades de tiempo.

Conversión de Texto: El script itera sobre cada carácter de la cadena de entrada. Para cada carácter, busca su equivalente en el diccionario de código Morse y genera los eventos MIDI correspondientes (note_on y note_off) con las duraciones correctas.

Generación del Archivo: Finalmente, todos los eventos MIDI se guardan en un archivo con el nombre especificado, listo para ser reproducido.

3. Requisitos de Lenguaje y Diccionario 📖
El programa utiliza un diccionario para mapear caracteres a su código Morse. Solo los caracteres incluidos en este diccionario pueden ser convertidos.

Lenguaje de Programación: Python 3.x

Biblioteca Requerida: mido

Diccionario de Caracteres: El programa soporta los siguientes caracteres:

Letras: A-Z (el script convierte automáticamente el texto a mayúsculas).

Números: 0-9

Signos de Puntuación: . (punto), ,  (coma), ? (interrogación), / (barra), - (guion), ( (paréntesis de apertura), ) (paréntesis de cierre).

El diccionario MORSE_CODE_DICT es el siguiente:

Python

MORSE_CODE_DICT = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
    'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
    'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
    'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
    'Y': '-.--', 'Z': '--..',
    '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....',
    '6': '-....', '7': '--...', '8': '---..', '9': '----.', '0': '-----',
    ', ': '--..--', '.': '.-.-.-', '?': '..--..', '/': '-..-.', '-': '-....-',
    '(': '-.--.', ')': '-.--.-'
}
