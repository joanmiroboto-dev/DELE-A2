"use strict";

const course = window.COURSE;
const main = document.querySelector("main");
const storageKey = "aula-dele-a2-v1";
let state = { done: [], drafts: {}, last: "1.1", scores: {} };
let saveError = false;

try {
  const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
  if (saved && typeof saved === "object") {
    state.done = Array.isArray(saved.done) ? saved.done.filter(x => typeof x === "string") : [];
    state.drafts = saved.drafts && typeof saved.drafts === "object" ? saved.drafts : {};
    state.scores = saved.scores && typeof saved.scores === "object" ? saved.scores : {};
    state.last = typeof saved.last === "string" ? saved.last : "1.1";
  }
} catch {
  saveError = true;
}

let clock = null;
let remaining = 180;
let deadline = 0;
let voicesLoaded = false;
let availableVoices = [];

function loadVoices() {
  if ("speechSynthesis" in window) {
    availableVoices = window.speechSynthesis.getVoices();
    if (availableVoices.length > 0) voicesLoaded = true;
  }
}
loadVoices();
if ("speechSynthesis" in window && window.speechSynthesis.onvoiceschanged !== undefined) {
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const tasks = course.topics.flatMap(topic => topic.items.map(task => ({ ...task, topic })));
const taskById = id => tasks.find(task => task.id === id);
const pageImage = page => "paginas/p-" + String(page).padStart(3, "0") + ".jpg";
const link = (href, label, secondary = false) => '<a class="button' + (secondary ? ' secondary' : '') + '" href="' + href + '">' + escapeHtml(label) + '</a>';
const intro = (eyebrow, title, subtitle = "") => '<div class="intro"><span class="eyebrow">' + escapeHtml(eyebrow) + '</span><h1>' + escapeHtml(title) + '</h1><p>' + escapeHtml(subtitle) + '</p></div>';

function preloadNeighbors(page, min = 1, max = 122) {
  [page - 1, page + 1].forEach(p => {
    if (p >= min && p <= max) {
      const img = new Image();
      img.src = pageImage(p);
    }
  });
}

function persist() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
    saveError = false;
  } catch {
    saveError = true;
  }
  document.querySelectorAll("[data-save-status]").forEach(el => {
    el.textContent = saveError ? "El navegador no ha podido guardar. Descarga tu trabajo antes de salir." : "Guardado en este navegador.";
  });
}

function cards() {
  return '<div class="grid">' + course.topics.map((topic, index) => 
    '<article class="card"><span class="symbol" aria-hidden="true">' + 
    ["Aa", "♪", "✎", "…"][index] + '</span><h3>' + 
    escapeHtml(topic.short) + '</h3><p>' + 
    escapeHtml(topic.summary) + '</p><a href="#area/' + 
    encodeURIComponent(topic.id) + '">Empezar a ' + 
    escapeHtml(topic.short.toLowerCase()) + '</a></article>'
  ).join("") + '</div>';
}

function home() {
  const completed = tasks.filter(task => state.done.includes(task.id)).length;
  return '<section class="hero"><div><span class="eyebrow">Tu curso de español · Nivel A2</span><h1>Un poco cada día.<br>Un paso más cerca.</h1><p>Lee, escucha, escribe y habla. Repasa lo que trabajas en clase, con el manual siempre a mano.</p><div class="actions">' + link("#tarea/" + (taskById(state.last)?.id || "1.1"), completed ? "Continuar practicando →" : "Empezar a practicar →") + link("#manual/1", "Abrir el manual", true) + '</div></div><div class="progress-box"><strong>Tu camino, a tu ritmo</strong><p>Marca cada tarea cuando la hayas practicado.</p><progress value="' + completed + '" max="13" aria-label="Tareas practicadas"></progress><b>' + completed + ' de 13 tareas practicadas</b><p>Tu progreso se guarda en este navegador.</p></div></section><section class="section"><h2>¿Qué quieres practicar hoy?</h2><p class="lead">Elige una destreza. Puedes repetir las actividades las veces que quieras.</p>' + cards() + '</section><section class="panel row"><div><h2>El mismo manual que en clase</h2><p>122 páginas con sus textos, fotografías y ejercicios originales.</p></div>' + link("#manual/1", "Consultar el manual", true) + '</section>';
}

function area(topic) {
  return intro("Practicar español", topic.title, topic.summary) + navigation(topic.id) + 
    '<section class="panel"><h2>Las tareas de esta destreza</h2>' + 
    topic.items.map(task => 
      '<article class="task row"><div><h3>' + escapeHtml(task.title) + '</h3><p>' + 
      escapeHtml(task.help) + '</p><span class="meta">Tarea ' + escapeHtml(task.id) + ' · Páginas ' + 
      task.start + '–' + task.end + (state.done.includes(task.id) ? ' · Practicada ✓' : '') + 
      '</span></div>' + link("#tarea/" + task.id, "Practicar →") + '</article>'
    ).join("") + '</section>' + 
    (topic.id === "escuchar" ? audioLinks() : "") + 
    '<p class="meta">Puedes consultar las instrucciones y la estructura del examen en la guía del Instituto Cervantes al pie de la página.</p>';
}

function navigation(active) {
  return '<nav class="module-nav" aria-label="Destrezas">' + course.topics.map(topic => 
    '<a href="#area/' + encodeURIComponent(topic.id) + '"' + (active === topic.id ? ' aria-current="page"' : '') + '>' + 
    escapeHtml(topic.short) + '</a>'
  ).join("") + '</nav>';
}

function viewer(page, start = 1, end = 122, route = "manual") {
  return '<section class="panel"><div class="toolbar">' + link("#" + route + "/" + Math.max(start, page - 1), "← Anterior", true) + '<form data-page-form data-route="' + route + '" data-start="' + start + '" data-end="' + end + '"><label>Página <input class="field" aria-label="Número de página" name="page" type="number" required min="' + start + '" max="' + end + '" value="' + page + '"></label> <button class="button secondary">Ir</button></form><span class="meta">de ' + end + '</span>' + link("#" + route + "/" + Math.min(end, page + 1), "Siguiente →", true) + '<button class="button secondary" data-action="zoom" aria-pressed="false">Ampliar imagen</button></div><div class="viewer"><img src="' + pageImage(page) + '" alt="Página ' + page + ' del manual original DELE A2. Textos y fotografías en su disposición original."></div><div class="row"><a href="manual.pdf#page=' + page + '" target="_blank" rel="noopener">Abrir esta página en el PDF ↗</a><a href="manual.pdf" download="Manual-DELE-A2.pdf">Descargar manual PDF</a></div><details><summary>Texto de apoyo · página ' + page + '</summary><p class="meta">La extracción puede omitir tablas o texto dentro de imágenes. Consulta la página original para el ejercicio completo.</p><div class="prose">' + escapeHtml(course.pages[page]?.replace(/^#{1,4}\s*/gm, "") || "Esta página contiene material visual. Consulta la imagen o el PDF.") + '</div></details></section>';
}

function manual(page) {
  return intro("Tu material de clase", "Manual del curso", "Consulta cualquier página o entra directamente en una tarea.") + 
    '<div class="manual-layout"><aside class="panel"><h2>Índice del manual</h2><a href="#manual/1">Presentación</a>' + 
    course.topics.map(topic => 
      '<h3>' + escapeHtml(topic.short) + '</h3>' + 
      topic.items.map(task => '<a href="#manual/' + task.start + '">' + escapeHtml(task.id) + ' · ' + escapeHtml(task.title) + '</a>').join("")
    ).join("") + 
    '<a href="#manual/93">Refuerzo</a></aside><div>' + viewer(page) + '</div></div>';
}

function quizForm(quiz) {
  return '<section class="panel"><h2>' + escapeHtml(quiz.title) + '</h2><p class="meta">' + (quiz.page ? 'Práctica basada en el texto de la página ' + quiz.page + '. Las preguntas y explicaciones se han adaptado para esta aplicación.' : 'Práctica complementaria · voz sintética del navegador.') + '</p>' + (quiz.audio ? '<div class="actions"><button class="button" data-action="speak">Escuchar el mensaje</button><button class="button secondary" data-action="stop-speech">Parar</button><label>Velocidad <select id="speed"><option value="0.8">Lenta</option><option value="1" selected>Normal</option></select></label></div><p id="speech-status" role="status"></p><details><summary>Leer la transcripción</summary><p>' + escapeHtml(quiz.audio) + '</p></details>' : '<details open><summary>Leer el correo</summary><p class="prose reading">' + escapeHtml(quiz.text) + '</p></details>') + '<form data-quiz="' + quiz.id + '"><div class="questions">' + quiz.questions.map((question, index) => '<fieldset><legend>' + (index + 1) + '. ' + escapeHtml(question.question) + '</legend>' + question.options.map((option, optionIndex) => '<label class="option"><input type="radio" name="q' + index + '" value="' + optionIndex + '" required><span>' + escapeHtml(option) + '</span></label>').join("") + '<div data-feedback="' + index + '"></div></fieldset>').join("") + '</div><div class="actions spaced"><button class="button">Comprobar respuestas</button><button class="button secondary" type="reset">Volver a intentarlo</button></div><p data-result role="status" aria-live="polite"></p></form></section>';
}

function editor(id, title, min = 0, max = 0) {
  return '<section class="panel"><h2>' + escapeHtml(title) + '</h2><label for="draft">Escribe aquí tu respuesta o tus notas</label><textarea class="spaced" id="draft" data-draft="' + id + '" data-min="' + min + '" data-max="' + max + '" placeholder="Empieza a escribir…">' + escapeHtml(typeof state.drafts[id] === "string" ? state.drafts[id] : "") + '</textarea><p class="word-count" id="word-count" role="status"></p><div class="actions"><button class="button secondary" data-action="download-draft">Descargar mi trabajo</button></div><p class="meta" data-save-status>Guardado en este navegador.</p></section>';
}

function timer(seconds = 180) {
  remaining = seconds;
  return '<section class="panel"><h2>Practica con tiempo</h2><label>Duración <select id="duration"><option value="120">2 minutos</option><option value="180" selected>3 minutos</option><option value="240">4 minutos</option><option value="720">12 minutos</option></select></label><div class="timer" id="timer" role="timer">03:00</div><div class="actions"><button class="button" data-action="timer-start">Iniciar</button><button class="button secondary" data-action="timer-pause">Pausar</button><button class="button secondary" data-action="timer-reset">Reiniciar</button></div><p id="timer-status" role="status">Organiza tus ideas y habla en voz alta.</p></section>';
}

function audioLinks() {
  return '<section class="panel"><h2>Audios de refuerzo del manual</h2><p>Abre el vídeo y consulta su página para responder a las preguntas.</p><div class="stack">' + course.audio.map(audio => '<div class="row"><div><strong>' + escapeHtml(audio.title) + '</strong><span class="meta"> · página ' + audio.page + '</span></div><div class="actions"><a class="button secondary" href="' + escapeHtml(audio.url) + '" target="_blank" rel="noopener">Escuchar en YouTube ↗</a>' + link("#manual/" + audio.page, "Ver ejercicio", true) + '</div></div>').join("") + '</div><p class="meta">Los enlaces de YouTube se han tomado del manual. Las tareas de escucha de las páginas 52–60 pueden requerir los audios que facilite la persona docente.</p></section>';
}

function taskView(task, requestedPage) {
  const page = Math.max(task.start, Math.min(task.end, Math.trunc(Number(requestedPage)) || task.start));
  state.last = task.id;
  persist();
  let practice = "";
  if (task.id === "1.1") practice += quizForm(course.quiz[0]);
  if (task.id === "2.1") practice += quizForm(course.quiz[1]);
  if (task.topic.id === "escribir") {
    const choice = task.id === "3.1" ? '<section class="panel"><h2>Elige un mensaje</h2><label for="writing-choice">Ejercicio del manual</label><select id="writing-choice" class="wide">' + course.writes.map(write => '<option value="' + write.id + '">' + escapeHtml(write.title) + '</option>').join("") + '</select><div id="writing-prompt" class="prose"></div></section>' : '<p class="meta">Elige una de las opciones de la página del manual y copia la consigna en tus notas si lo necesitas.</p>';
    practice += choice + editor(task.id === "3.1" ? course.writes[0].id : "3.2-p" + page, "Tu borrador", task.id === "3.1" ? 60 : 70, task.id === "3.1" ? 70 : 80);
    practice += '<section class="panel"><h2>Antes de terminar</h2>' + ["He respondido a todos los puntos de la consigna.", "He conectado mis ideas y revisado los verbos.", "He revisado las palabras y la ortografía."].map(text => '<label class="option"><input type="checkbox"> ' + text + '</label>').join("") + '<p class="meta">La persona docente puede ayudarte a revisar tu texto.</p></section>';
  } else {
    if (task.topic.id === "hablar") {
      practice += timer() + '<section class="panel"><h2>Una ayuda para empezar</h2><p>' + (task.id === "4.2" ? 'En la imagen veo… · Están en… · Una persona está… · Creo que se siente…' : task.id === "4.3" ? '¿Te gustaría…? · Podemos quedar… · ¿Qué te parece…? · Prefiero… porque…' : 'Voy a hablar de… · Primero… · Después… · Lo que más me gustó fue…') + '</p></section>';
    }
    practice += editor("notas-" + task.id + "-p" + page, task.topic.id === "hablar" ? "Prepara tus ideas" : "Tus respuestas y notas");
  }
  return intro("Tarea " + task.id, task.title, task.help) + navigation(task.topic.id) + '<div class="practice-layout"><div>' + viewer(page, task.start, task.end, "tarea/" + task.id) + '</div><div>' + practice + '</div></div><section class="panel row"><div><h2>¿Has practicado esta tarea?</h2><p>Esta marca registra tu práctica personal.</p></div><button class="button" data-action="complete" data-task="' + task.id + '">' + (state.done.includes(task.id) ? "Practicada ✓ · Desmarcar" : "Marcar como practicada") + '</button></section>' + (task.topic.id === "escuchar" ? audioLinks() : "");
}

function help() {
  return intro("Te acompañamos", "Cómo usar el aula", "Puedes avanzar a tu ritmo y repetir lo que necesites.") + '<section class="panel"><h2>Empieza con tres pasos</h2><ol><li>Elige Leer, Escuchar, Escribir o Hablar.</li><li>Abre una tarea. Consulta el ejercicio original y usa la práctica que aparece a su lado.</li><li>Guarda tu respuesta o marca la tarea como practicada.</li></ol><h2>Guardar tu trabajo</h2><p>Las notas y el progreso se guardan en este navegador y dispositivo. Descarga tus respuestas para llevarlas a clase. Al borrar los datos del navegador se pierde el progreso local.</p><button class="button secondary" data-action="export">Descargar todas mis notas</button><p class="meta" data-save-status></p><h2>Escuchar y hablar</h2><p>Usa los audios enlazados del manual y las grabaciones de clase que te facilite tu docente. La actividad «Cambiar una cita» utiliza la voz sintética disponible en tu dispositivo. Puedes abrir su transcripción.</p><h2>Leer en otro idioma</h2><p>Para ayudarte con las instrucciones puedes utilizar la función de traducción de tu navegador. El curso se ofrece en español. Las traducciones integradas a otros idiomas se podrán añadir en una siguiente fase.</p><h2>Revisar tus respuestas</h2><p>La práctica de preguntas ofrece corrección explicada. Para las actividades abiertas, guarda el borrador y revísalo con tu docente. El contador de palabras y el temporizador te ayudan a practicar.</p><a href="manual.pdf" download>Descargar el manual completo</a></section>';
}

function wordCount() {
  const field = document.querySelector("[data-draft]");
  if (!field) return;
  const count = field.value.trim() ? field.value.trim().split(/\s+/u).length : 0;
  const min = Number(field.dataset.min);
  const max = Number(field.dataset.max);
  const output = document.querySelector("#word-count");
  output.textContent = count + " palabras" + (min ? " · Objetivo de esta tarea: " + min + "–" + max + " · " + (count < min ? "Escribe un poco más." : count > max ? "Revisa la extensión." : "Dentro de la extensión indicada.") : "");
}

function writingChoice(alignManual = false) {
  const select = document.querySelector("#writing-choice");
  if (!select) return;
  const write = course.writes.find(write => write.id === select.value);
  document.querySelector("#writing-prompt").textContent = write.text;
  const field = document.querySelector("[data-draft]");
  field.dataset.draft = write.id;
  field.value = typeof state.drafts[write.id] === "string" ? state.drafts[write.id] : "";
  if (alignManual) {
    const image = main.querySelector(".viewer img");
    const panel = image.closest(".panel");
    panel.outerHTML = viewer(write.page, 63, 69, "tarea/3.1");
  }
  wordCount();
}

function render() {
  clearInterval(clock);
  clock = null;
  window.speechSynthesis?.cancel();
  const [route = "inicio", id, page] = location.hash.slice(1).split("/");
  if (route === "contenido") { main.focus({ preventScroll: false }); return; }
  const task = taskById(id);
  const topic = course.topics.find(topic => topic.id === id);
  if (route === "manual") {
    const pageNum = Math.max(1, Math.min(122, Math.trunc(Number(id)) || 1));
    main.innerHTML = manual(pageNum);
    preloadNeighbors(pageNum, 1, 122);
  } else if (route === "area" && topic) {
    main.innerHTML = area(topic);
  } else if (route === "tarea" && task) {
    const taskPage = Math.max(task.start, Math.min(task.end, Math.trunc(Number(page)) || task.start));
    main.innerHTML = taskView(task, page);
    preloadNeighbors(taskPage, task.start, task.end);
  } else if (route === "practicar") {
    main.innerHTML = intro("Practicar español", "Cuatro formas de avanzar", "Elige una destreza para ver sus tareas.") + cards();
  } else if (route === "ayuda") {
    main.innerHTML = help();
  } else {
    main.innerHTML = home();
  }
  document.querySelectorAll(".bar nav a").forEach(a => {
    a.removeAttribute("aria-current");
    const match = a.hash.slice(1).split("/")[0];
    if (match === route || (match === "practicar" && ["area", "tarea"].includes(route))) a.setAttribute("aria-current", "page");
  });
  writingChoice();
  wordCount();
  persist();
  window.scrollTo(0, 0);
  main.focus({ preventScroll: true });
}

function download(filename, text) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function updateClock() {
  document.querySelector("#timer").textContent = String(Math.floor(remaining / 60)).padStart(2, "0") + ":" + String(remaining % 60).padStart(2, "0");
}

main.addEventListener("input", event => {
  if (!event.target.matches("[data-draft]")) return;
  state.drafts[event.target.dataset.draft] = event.target.value;
  persist();
  wordCount();
});
main.addEventListener("change", event => {
  if (event.target.id === "writing-choice") writingChoice(true);
  if (event.target.id === "duration") {
    clearInterval(clock);
    clock = null;
    remaining = Number(event.target.value);
    updateClock();
    document.querySelector("#timer-status").textContent = "Tiempo preparado.";
  }
});
main.addEventListener("reset", event => {
  event.target.querySelectorAll("[data-feedback], [data-result]").forEach(el => { el.textContent = ""; });
});
main.addEventListener("submit", event => {
  event.preventDefault();
  const form = event.target;
  if (form.matches("[data-page-form]")) {
    location.hash = form.dataset.route + "/" + Math.max(Number(form.dataset.start), Math.min(Number(form.dataset.end), Number(new FormData(form).get("page"))));
    return;
  }
  const quiz = course.quiz.find(quiz => quiz.id === form.dataset.quiz);
  if (!quiz) return;
  const data = new FormData(form);
  let correct = 0;
  quiz.questions.forEach((question, index) => {
    const right = Number(data.get("q" + index)) === question.answer;
    if (right) correct++;
    const feedback = form.querySelector('[data-feedback="' + index + '"]');
    feedback.className = "outcome " + (right ? "ok" : "bad");
    feedback.textContent = (right ? "Correcto. " : "Respuesta correcta: " + question.options[question.answer] + " ") + question.why;
  });
  state.scores[quiz.id] = correct;
  persist();
  form.querySelector("[data-result]").textContent = correct + " de " + quiz.questions.length + " respuestas correctas. Puedes revisar las explicaciones y volver a intentarlo.";
});

main.addEventListener("click", event => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const action = button.dataset.action;
  if (action === "zoom") {
    const viewer = button.closest(".panel").querySelector(".viewer");
    viewer.classList.toggle("zoom");
    button.setAttribute("aria-pressed", String(viewer.classList.contains("zoom")));
    button.textContent = viewer.classList.contains("zoom") ? "Ajustar a la pantalla" : "Ampliar imagen";
  }
  if (action === "complete") {
    const id = button.dataset.task;
    state.done = state.done.includes(id) ? state.done.filter(done => done !== id) : [...state.done, id];
    persist();
    button.textContent = state.done.includes(id) ? "Practicada ✓ · Desmarcar" : "Marcar como practicada";
  }
  if (action === "download-draft") {
    const field = document.querySelector("[data-draft]");
    if (!field) return;
    const taskTitle = main.querySelector("h1")?.textContent || "DELE A2";
    const content = "Aula DELE A2 · Apoyo al curso\n" + taskTitle + "\nEjercicio: " + field.dataset.draft + "\nFecha: " + new Date().toLocaleDateString("es-ES") + "\n\n" + (field.value || "(Sin texto escrito aún)");
    download("Aula-A2-" + field.dataset.draft + ".txt", content);
  }
  if (action === "export") {
    const dateStr = new Date().toLocaleDateString("es-ES");
    const notes = Object.entries(state.drafts).filter(([, text]) => text && text.trim().length > 0);
    const notesContent = notes.length 
      ? notes.map(([id, text]) => "=== Ejercicio / Borrador: " + id + " ===\n" + text).join("\n\n")
      : "No tienes notas guardadas todavía.";
    const report = "Aula DELE A2 · Resumen de notas y progreso\nFecha: " + dateStr + "\n\n" +
      "Progreso: " + state.done.length + " de 13 tareas practicadas (" + (state.done.join(", ") || "ninguna") + ")\n\n" +
      "--- TUS NOTAS Y BORRADORES ---\n\n" + notesContent;
    download("Aula-A2-mis-notas.txt", report);
  }
  if (action === "speak") {
    const status = document.querySelector("#speech-status");
    if (!("speechSynthesis" in window)) { status.textContent = "Tu navegador no ofrece lectura en voz alta. Puedes usar la transcripción."; return; }
    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(course.quiz[1].audio);
    speech.lang = "es-ES";
    speech.rate = Number(document.querySelector("#speed")?.value || 1);
    const voices = availableVoices.length ? availableVoices : window.speechSynthesis.getVoices();
    const spanishVoice = voices.find(v => v.lang.startsWith("es-ES")) || voices.find(v => v.lang.startsWith("es")) || voices[0];
    if (spanishVoice) speech.voice = spanishVoice;
    speech.onend = () => { status.textContent = "Mensaje terminado. Puedes escucharlo otra vez."; };
    speech.onerror = () => { status.textContent = "No se ha podido reproducir la voz. Abre la transcripción o prueba otro navegador."; };
    status.textContent = "Reproduciendo el mensaje...";
    window.speechSynthesis.speak(speech);
  }
  if (action === "stop-speech") { window.speechSynthesis?.cancel(); document.querySelector("#speech-status").textContent = "Reproducción detenida."; }
  if (action === "timer-start" && !clock && remaining > 0) {
    deadline = Date.now() + remaining * 1000;
    document.querySelector("#timer-status").textContent = "Tiempo en marcha.";
    clock = setInterval(() => {
      remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      updateClock();
      if (!remaining) { clearInterval(clock); clock = null; document.querySelector("#timer-status").textContent = "Tiempo terminado. Puedes volver a practicar."; }
    }, 250);
  }
  if (action === "timer-pause") { clearInterval(clock); clock = null; document.querySelector("#timer-status").textContent = "Tiempo en pausa."; }
  if (action === "timer-reset") { clearInterval(clock); clock = null; remaining = Number(document.querySelector("#duration").value); updateClock(); document.querySelector("#timer-status").textContent = "Tiempo preparado."; }
});
window.addEventListener("hashchange", render);
window.addEventListener("pagehide", () => { window.speechSynthesis?.cancel(); clearInterval(clock); });
window.addEventListener("keydown", event => {
  if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) return;
  if (event.key === "ArrowLeft") {
    const prevLink = document.querySelector('.toolbar a[href*="Anterior"], .toolbar a:first-child');
    if (prevLink) prevLink.click();
  } else if (event.key === "ArrowRight") {
    const nextLink = document.querySelector('.toolbar a[href*="Siguiente"], .toolbar a:nth-of-type(2)');
    if (nextLink) nextLink.click();
  }
});
render();
