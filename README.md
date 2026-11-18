# Aula DELE A2 · Español paso a paso

Plataforma educativa web interactiva de apoyo al curso presencial de preparación para el examen **DELE A2** (Diploma de Español como Lengua Extranjera), impulsada para el alumnado de **La Casa Grande · Asociación Solidaria**.

---

## 🏛️ Filosofía y Arquitectura

El proyecto está diseñado bajo principios de **arquitectura limpia, robustez y máxima accesibilidad**:

- **Cero dependencias externas**: Implementación en JavaScript estándar (Vanilla ES6+), HTML5 semántico y CSS moderno con Custom Properties. Sin bundlers obligatorios ni librerías pesadas, garantizando una carga instantánea y funcionamiento offline o en entornos con conectividad limitada.
- **Privacidad y Persistencia Local**: Todo el progreso del estudiante, borradores de texto y calificaciones se almacenan en el propio navegador (`localStorage`), sin recolección de datos personales ni necesidad de backend.
- **Navegación Declarativa por Hash**: Rutas limpias (`#inicio`, `#practicar`, `#area/:id`, `#tarea/:id`, `#manual/:page`, `#ayuda`) que permiten volver atrás o guardar marcadores sin recargar la página.
- **Optimización de Experiencia de Usuario (UX)**:
  - **Precarga inteligente**: Precarga asíncrona de páginas contiguas (`p-XXX.jpg`) para hojear el manual sin parpadeos.
  - **Navegación por teclado**: Flechas `←` y `→` para pasar páginas de forma ágil sin interrumpir cuando se redacta texto.
  - **Web Speech API**: Síntesis de voz en español para ejercitar la comprensión auditiva adaptada a la velocidad del alumno.
  - **Exportación de trabajo**: Descarga de notas y borradores en texto plano (`.txt`) para llevar a las clases presenciales.

---

## 📂 Estructura del Proyecto

```text
├── index.html            # Entrada principal semántica y accesible (WCAG 2.1 AA)
├── app.js                # Router, gestión de estado, renderizado y controladores
├── curso.js              # Modelo de datos del examen (13 tareas, ejercicios, audios y textos)
├── estilos.css           # Sistema de diseño responsive (variables CSS, flexbox/grid)
├── manual.pdf            # Manual de estudio completo en formato PDF
├── marca/                # Logotipos e identidad gráfica institucional
│   ├── la-casa-grande-cuadrado.png
│   ├── la-casa-grande-horizontal.png
│   └── la-casa-grande-sello.png
└── paginas/              # 122 páginas digitalizadas del manual original (p-001.jpg a p-122.jpg)
```

---

## 🎯 Estructura de las Destrezas DELE A2

El curso cubre las cuatro pruebas oficiales del examen:

1. **Comprensión de lectura** (4 tareas, páginas 7–50)
   - 1.1 Cartas y mensajes
   - 1.2 Anuncios y avisos
   - 1.3 Relacionar textos
   - 1.4 Textos largos
2. **Comprensión auditiva** (4 tareas, páginas 52–60)
   - 2.1 Conversaciones cortas (con voz sintética integrada y transcripciones)
   - 2.2 Textos breves
   - 2.3 Una conversación
   - 2.4 Relacionar mensajes + Audios de refuerzo enlazados
3. **Expresión e interacción escritas** (2 tareas, páginas 63–74)
   - 3.1 Responder a un mensaje (con selector de temas del manual)
   - 3.2 Redacción extensa con guía y contador de palabras en tiempo real
4. **Expresión e interacción orales** (3 tareas, páginas 75–92)
   - 4.1 Monólogo con temporizador de examen
   - 4.2 Descripción de fotografía
   - 4.3 Diálogo guiado con apoyos de conversación

---

## 🚀 Cómo ejecutar el proyecto en local

Al ser una aplicación web estática pura, podés abrirla con cualquier servidor HTTP local:

### Con Python:
```bash
python -m http.server 8080
```
Luego abrir `http://localhost:8080` en tu navegador.

### Con Node.js / npx:
```bash
npx serve .
```

### Con VS Code / Cursor:
Abrir el archivo `index.html` con la extensión **Live Server**.

---

## 📄 Licencia y Reconocimientos

Desarrollado como material didáctico de apoyo para el curso presencial de preparación para el DELE A2 de **La Casa Grande · Asociación Solidaria**.
Material de examen basado en las directrices oficiales del **Instituto Cervantes**.
