// Lógica pura del Diario de Estudio: fechas, rachas y estadísticas.
// Sin tocar la página ni el almacenamiento del navegador, y sin leer el reloj: "hoy" llega
// siempre como parámetro.
// Todas las fechas son texto "AAAA-MM-DD" en hora local (la "clave" de un día).

// ---------- Utilidades de fechas (siempre en hora local) ----------

// Convierte un Date a "AAAA-MM-DD" usando la fecha local (nunca la conversión ISO, que es UTC).
function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Convierte "AAAA-MM-DD" a un Date local. Nunca new Date("AAAA-MM-DD"): se lee en UTC.
function parseDateKey(key) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

// Suma (o resta) días. Se hace con el calendario, no con milisegundos: por los cambios
// de hora, un día no siempre dura 24 horas.
function addDays(key, days) {
  const date = parseDateKey(key);
  return toDateKey(new Date(date.getFullYear(), date.getMonth(), date.getDate() + days));
}

// true si "nextKey" es exactamente el día después de "key".
function isNextDay(key, nextKey) {
  return addDays(key, 1) === nextKey;
}

// Devuelve el lunes de la semana de "today".
function getWeekStart(today) {
  const daysSinceMonday = (parseDateKey(today).getDay() + 6) % 7; // getDay(): 0=domingo..6=sábado
  return addDays(today, -daysSinceMonday);
}

// Devuelve el día 1 del mes de "today": "AAAA-MM-" + "01".
function getMonthStart(today) {
  return today.slice(0, 8) + "01";
}

// ---------- Rachas y estadísticas ----------

// Conjunto de días con al menos una sesión, sin repetidos.
function getStudyDays(sessions) {
  return new Set(sessions.map((session) => session.date));
}

// Días consecutivos con al menos una sesión, terminando hoy. Si hoy no hay sesión pero
// ayer sí, la racha sigue contando desde ayer (el día de hoy todavía no ha terminado).
// Como se cuenta hacia atrás, las fechas futuras nunca suman.
function getStreak(sessions, today) {
  const studyDays = getStudyDays(sessions);
  const yesterday = addDays(today, -1);

  let day;
  if (studyDays.has(today)) {
    day = today;
  } else if (studyDays.has(yesterday)) {
    day = yesterday;
  } else {
    return 0;
  }

  let streak = 0;
  while (studyDays.has(day)) {
    streak++;
    day = addDays(day, -1);
  }
  return streak;
}

// La racha más larga conseguida alguna vez, siga viva o no. Cada tramo se mide por su
// longitud real (sin la regla de "hoy todavía no ha terminado").
function getBestStreak(sessions) {
  // Las claves llevan ceros, así que ordenarlas como texto es ordenarlas por fecha.
  const sortedDays = [...getStudyDays(sessions)].sort();

  let best = 0;
  let current = 0;
  let previousDay = null;

  for (const day of sortedDays) {
    current = previousDay !== null && isNextDay(previousDay, day) ? current + 1 : 1;
    if (current > best) {
      best = current;
    }
    previousDay = day;
  }
  return best;
}

// Minutos entre el lunes de esta semana y hoy (ambos incluidos). Aquí SÍ suman todas las
// sesiones de un mismo día, y las fechas futuras no suman.
function getWeekMinutes(sessions, today) {
  const weekStart = getWeekStart(today);
  return sessions
    .filter((session) => session.date >= weekStart && session.date <= today)
    .reduce((total, session) => total + session.minutes, 0);
}

// Días distintos con sesión entre el día 1 de este mes y hoy (ambos incluidos). Como en la
// racha, varias sesiones el mismo día cuentan una vez; las fechas futuras no suman.
function getMonthStudyDays(sessions, today) {
  const monthStart = getMonthStart(today);
  let days = 0;
  for (const day of getStudyDays(sessions)) {
    if (day >= monthStart && day <= today) {
      days++;
    }
  }
  return days;
}

// ---------- Datos guardados ----------

// Convierte una sesión del formato antiguo (fecha/tema/minutos/creada) al actual
// (date/topic/minutes), para no perder sesiones guardadas antes de ese cambio.
function migrateSession(session) {
  return {
    date: session.date ?? session.fecha,
    topic: session.topic ?? session.tema,
    minutes: session.minutes ?? session.minutos,
  };
}

// De la más reciente a la más antigua. Si dos sesiones son del mismo día, primero la que
// se añadió más tarde: se invierte el orden de guardado y luego un sort estable (mantiene
// ese orden en los empates) por fecha descendente. Devuelve un array nuevo.
function sortSessionsForList(sessions) {
  return [...sessions].reverse().sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

// Solo en Node (tests): exporta las funciones. En el navegador "module" no existe.
if (typeof module !== "undefined") {
  module.exports = {
    toDateKey,
    parseDateKey,
    addDays,
    isNextDay,
    getWeekStart,
    getMonthStart,
    getStudyDays,
    getStreak,
    getBestStreak,
    getWeekMinutes,
    getMonthStudyDays,
    migrateSession,
    sortSessionsForList,
  };
}
