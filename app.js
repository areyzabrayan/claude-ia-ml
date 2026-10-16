// Interfaz del Diario de Estudio. Los cálculos (fechas, rachas, estadísticas) están en
// logic.js, que index.html carga antes que este archivo.

// ---------- Configuración ----------

const STORAGE_KEY = "diario-estudio-sesiones";

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

// ---------- Mostrar las estadísticas ----------

function renderStreak(sessions, today) {
  const streak = getStreak(sessions, today);
  streakNumber.textContent = streak;
  streakText.textContent = streak === 1 ? "día de racha" : "días de racha";
}

function renderBestStreak(sessions) {
  bestStreakNumber.textContent = getBestStreak(sessions);
}

function renderWeekMinutes(sessions, today) {
  weekMinutesNumber.textContent = getWeekMinutes(sessions, today);
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
  renderStreak(sessions, today);
  renderBestStreak(sessions);
  renderWeekMinutes(sessions, today);
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

// ---------- Inicio ----------

dateInput.value = getTodayKey();
sessionForm.addEventListener("submit", handleFormSubmit);
renderScreen();
