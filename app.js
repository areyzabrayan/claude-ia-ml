// Interfaz del Diario de Estudio. Los cálculos (fechas, rachas, estadísticas) están en
// logic.js, que index.html carga antes que este archivo.

// ---------- Configuración ----------

const STORAGE_KEY = "diario-estudio-sesiones";
// El objetivo semanal se guarda como texto plano, por ejemplo "300".
const GOAL_STORAGE_KEY = "diario-estudio-objetivo-semanal";

// ---------- Referencias al HTML ----------

const sessionForm = document.getElementById("formSesion");
const dateInput = document.getElementById("fecha");
const topicInput = document.getElementById("tema");
const minutesInput = document.getElementById("minutos");

const streakNumber = document.getElementById("rachaNumero");
const streakText = document.getElementById("rachaTexto");
const bestStreakNumber = document.getElementById("mejorRachaNumero");
const weekMinutesNumber = document.getElementById("minutosSemanaNumero");
const monthStudyDaysNumber = document.getElementById("diasEstudiadosMesNumero");

const goalForm = document.getElementById("formObjetivo");
const goalInput = document.getElementById("objetivoMinutos");
const goalErrorText = document.getElementById("objetivoError");
const goalEmptyText = document.getElementById("objetivoVacio");
const goalProgressBlock = document.getElementById("objetivoProgreso");
const goalSoFarText = document.getElementById("objetivoLlevas");
const goalBar = document.getElementById("objetivoBarra");
const goalBarFill = document.getElementById("objetivoBarraRelleno");
const goalRemainingText = document.getElementById("objetivoFaltan");

const sessionList = document.getElementById("listaSesiones");
const emptyMessage = document.getElementById("mensajeVacio");

// ---------- Hoy ----------

// El único sitio que lee el reloj. Devuelve "AAAA-MM-DD" en hora local.
function getTodayKey() {
  return toDateKey(new Date());
}

// ---------- Almacenamiento ----------

function loadSessions() {
  const savedData = localStorage.getItem(STORAGE_KEY);
  if (!savedData) {
    return [];
  }
  return JSON.parse(savedData).map(migrateSession);
}

function saveSessions(sessions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

// Devuelve el objetivo (1–10080) o null si no hay o el valor guardado está dañado.
// Nunca borra la clave: un valor dañado se trata como "sin objetivo".
function loadWeeklyGoal() {
  return parseWeeklyGoal(localStorage.getItem(GOAL_STORAGE_KEY));
}

// Guarda solo los dígitos ("300"). Sin try/catch, igual que saveSessions: si el navegador
// no deja guardar, el error corta el guardado y la pantalla sigue como estaba.
function saveWeeklyGoal(goal) {
  localStorage.setItem(GOAL_STORAGE_KEY, String(goal));
}

// ---------- Mostrar las estadísticas ----------

function renderStreak(sessions, today) {
  const streak = getStreak(sessions, today);
  streakNumber.textContent = streak;
  streakText.textContent = streak === 1 ? "día de racha" : "días de racha";
}

function renderBestStreak(sessions, today) {
  bestStreakNumber.textContent = getBestStreak(sessions, today);
}

// Recibe los minutos ya calculados para que esta tarjeta y la del objetivo
// muestren exactamente el mismo número.
function renderWeekMinutes(weekMinutes) {
  weekMinutesNumber.textContent = weekMinutes;
}

function renderWeeklyGoal(weekMinutes) {
  const goal = loadWeeklyGoal();
  const progress = getGoalProgress(weekMinutes, goal);

  if (progress === null) {
    goalEmptyText.hidden = false;
    goalProgressBlock.hidden = true;
    return;
  }

  goalEmptyText.hidden = true;
  goalProgressBlock.hidden = false;
  goalSoFarText.textContent = `Llevas ${weekMinutes} de ${goal} min esta semana`;
  goalBarFill.style.width = progress.percent + "%";
  goalBar.setAttribute("aria-valuenow", progress.percent);

  if (progress.done) {
    goalRemainingText.textContent = "¡Objetivo cumplido!";
  } else if (progress.remaining === 1) {
    goalRemainingText.textContent = "Te falta 1 min";
  } else {
    goalRemainingText.textContent = `Te faltan ${progress.remaining} min`;
  }
}

function renderMonthStudyDays(sessions, today) {
  monthStudyDaysNumber.textContent = getMonthStudyDays(sessions, today);
}

// ---------- Mostrar la lista de sesiones ----------

function formatDateForDisplay(dateKey) {
  return parseDateKey(dateKey).toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function renderList(sessions) {
  sessionList.innerHTML = "";

  if (sessions.length === 0) {
    emptyMessage.style.display = "block";
    return;
  }
  emptyMessage.style.display = "none";

  for (const session of sortSessionsForList(sessions)) {
    const item = document.createElement("li");
    item.className = "sesion";
    item.innerHTML = `
      <div class="sesion-info">
        <span class="sesion-tema">${escapeHTML(session.topic)}</span>
        <span class="sesion-fecha">${formatDateForDisplay(session.date)}</span>
      </div>
      <span class="sesion-minutos">${session.minutes} min</span>
    `;
    sessionList.appendChild(item);
  }
}

// Evita que un tema con símbolos como "<" rompa el HTML de la lista.
function escapeHTML(text) {
  const element = document.createElement("div");
  element.textContent = text;
  return element.innerHTML;
}

// ---------- Volver a pintar toda la pantalla ----------

function renderScreen() {
  const sessions = loadSessions();
  const today = getTodayKey(); // se recalcula en cada repintado
  const weekMinutes = getWeekMinutes(sessions, today); // una sola vez para las dos tarjetas
  renderStreak(sessions, today);
  renderBestStreak(sessions, today);
  renderWeekMinutes(weekMinutes);
  renderWeeklyGoal(weekMinutes);
  renderMonthStudyDays(sessions, today);
  renderList(sessions);
}

// ---------- Guardar una nueva sesión ----------

function handleFormSubmit(event) {
  event.preventDefault();

  const date = dateInput.value;
  const topic = topicInput.value.trim();
  const minutes = Number(minutesInput.value);

  if (!date || !topic || !(minutes > 0)) {
    return;
  }

  const sessions = loadSessions();
  sessions.push({ date, topic, minutes });
  saveSessions(sessions);

  sessionForm.reset();
  dateInput.value = getTodayKey();

  renderScreen();
}

// ---------- Guardar el objetivo semanal ----------

// Se ejecuta con el botón y también al pulsar Enter en el campo.
function handleGoalSubmit(event) {
  event.preventDefault();

  const goal = parseWeeklyGoal(goalInput.value);
  if (goal === null) {
    // No se guarda nada y el texto escrito se queda en el campo para corregirlo.
    goalErrorText.hidden = false;
    return;
  }

  saveWeeklyGoal(goal);
  goalErrorText.hidden = true;
  goalInput.value = String(goal); // sin ceros a la izquierda ni espacios
  renderScreen();
}

// ---------- Inicio ----------

dateInput.value = getTodayKey();
// Solo al cargar: el objetivo guardado o vacío (nunca el valor dañado).
// renderScreen no toca este campo, así guardar una sesión no borra lo que se esté escribiendo.
goalInput.value = loadWeeklyGoal() ?? "";
sessionForm.addEventListener("submit", handleFormSubmit);
goalForm.addEventListener("submit", handleGoalSubmit);
renderScreen();
