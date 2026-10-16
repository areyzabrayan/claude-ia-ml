// Zona de peor caso: en Santiago el cambio de hora ocurre a medianoche (6-sep-2026),
// así que ese día no tiene 00:00. Debe fijarse antes de crear cualquier Date.
process.env.TZ = "America/Santiago";

const { describe, test } = require("node:test");
const assert = require("node:assert");
const {
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
} = require("../logic.js");

// Atajo para crear sesiones, como en las tablas de la spec.
function s(date, minutes = 30) {
  return { date, topic: "Tema", minutes };
}

// Ejecuta una prueba en otra zona horaria y vuelve siempre a Santiago.
function inZone(zone, fn) {
  process.env.TZ = zone;
  try {
    fn();
  } finally {
    process.env.TZ = "America/Santiago";
  }
}

test("Guarda: la zona America/Santiago está aplicada", () => {
  assert.strictEqual(new Date(2026, 8, 6).getHours(), 1);
});

describe("Utilidades de fecha", () => {
  test("U1: toDateKey rellena con ceros", () => {
    assert.strictEqual(toDateKey(new Date(2026, 0, 5)), "2026-01-05");
  });

  test("U2: parseDateKey no se va al día anterior en el cambio de hora", () => {
    const date = parseDateKey("2026-09-06");
    assert.deepStrictEqual([date.getFullYear(), date.getMonth(), date.getDate()], [2026, 8, 6]);
  });

  test("U3: addDays cruza el cambio de hora a medianoche (Santiago)", () => {
    assert.strictEqual(addDays("2026-09-05", 1), "2026-09-06");
    assert.strictEqual(addDays("2026-09-07", -1), "2026-09-06");
  });

  test("U4: addDays cruza el cambio de hora de octubre (Madrid)", () => {
    inZone("Europe/Madrid", () => {
      assert.strictEqual(addDays("2026-10-25", 1), "2026-10-26");
    });
  });

  test("U5: addDays retrocede a febrero", () => {
    assert.strictEqual(addDays("2026-03-01", -1), "2026-02-28");
  });

  test("U6: addDays llega al 29 de febrero en año bisiesto", () => {
    assert.strictEqual(addDays("2028-02-28", 1), "2028-02-29");
  });

  test("U7: addDays cruza el cambio de año", () => {
    assert.strictEqual(addDays("2026-12-31", 1), "2027-01-01");
  });

  test("U8: isNextDay", () => {
    assert.strictEqual(isNextDay("2026-12-31", "2027-01-01"), true);
    assert.strictEqual(isNextDay("2026-10-12", "2026-10-14"), false);
  });

  test("U9: getWeekStart devuelve el lunes", () => {
    assert.strictEqual(getWeekStart("2026-10-18"), "2026-10-12");
    assert.strictEqual(getWeekStart("2026-10-12"), "2026-10-12");
    assert.strictEqual(getWeekStart("2027-01-01"), "2026-12-28");
  });

  test("U10: getMonthStart devuelve el día 1", () => {
    assert.strictEqual(getMonthStart("2026-10-14"), "2026-10-01");
  });
});

describe("Datos y orden", () => {
  test("U11: getStudyDays no repite días", () => {
    const days = getStudyDays([s("2026-10-14"), s("2026-10-14"), s("2026-10-15")]);
    assert.deepStrictEqual([...days].sort(), ["2026-10-14", "2026-10-15"]);
  });

  test("U12: migrateSession convierte el formato antiguo", () => {
    const old = { fecha: "2026-10-14", tema: "Álgebra", minutos: 30, creada: 1 };
    assert.deepStrictEqual(migrateSession(old), {
      date: "2026-10-14",
      topic: "Álgebra",
      minutes: 30,
    });
  });

  test("U13: migrateSession deja igual el formato nuevo", () => {
    const current = { date: "2026-10-14", topic: "Álgebra", minutes: 30 };
    assert.deepStrictEqual(migrateSession(current), current);
  });

  test("U14: sortSessionsForList, de más reciente a más antigua y sin tocar el original", () => {
    const a = { date: "2026-10-12", topic: "A", minutes: 10 };
    const b = { date: "2026-10-14", topic: "B", minutes: 10 };
    const c = { date: "2026-10-12", topic: "C", minutes: 10 };
    const sessions = [a, b, c];
    assert.deepStrictEqual(sortSessionsForList(sessions), [b, c, a]);
    assert.deepStrictEqual(sessions, [a, b, c]);
  });
});

describe("Racha actual (getStreak)", () => {
  const today = "2026-10-14";

  test("R1: sin sesiones es 0", () => {
    assert.strictEqual(getStreak([], today), 0);
  });

  test("R2: solo hoy es 1", () => {
    assert.strictEqual(getStreak([s("2026-10-14")], today), 1);
  });

  test("R3: hoy y los dos días anteriores es 3", () => {
    const sessions = [s("2026-10-12"), s("2026-10-13"), s("2026-10-14")];
    assert.strictEqual(getStreak(sessions, today), 3);
  });

  test("R4: sin sesión hoy pero sí ayer, la racha sigue viva", () => {
    assert.strictEqual(getStreak([s("2026-10-12"), s("2026-10-13")], today), 2);
  });

  test("R5: última sesión anteayer es 0", () => {
    assert.strictEqual(getStreak([s("2026-10-12")], today), 0);
  });

  test("R6: varias sesiones el mismo día cuentan como un día", () => {
    const sessions = [s("2026-10-14"), s("2026-10-14"), s("2026-10-14")];
    assert.strictEqual(getStreak(sessions, today), 1);
  });

  test("R7: un hueco corta la racha", () => {
    assert.strictEqual(getStreak([s("2026-10-12"), s("2026-10-14")], today), 1);
  });

  test("R8: una sesión futura no suma", () => {
    const sessions = [s("2026-10-13"), s("2026-10-14"), s("2026-10-15")];
    assert.strictEqual(getStreak(sessions, today), 2);
  });

  test("R9: solo sesiones futuras es 0", () => {
    assert.strictEqual(getStreak([s("2026-10-15")], today), 0);
  });

  test("R10: cruza el cambio de año", () => {
    const sessions = [s("2026-12-30"), s("2026-12-31"), s("2027-01-01")];
    assert.strictEqual(getStreak(sessions, "2027-01-01"), 3);
  });

  test("R11: cruza el 29 de febrero en año bisiesto", () => {
    const sessions = [s("2028-02-28"), s("2028-02-29"), s("2028-03-01")];
    assert.strictEqual(getStreak(sessions, "2028-03-01"), 3);
  });

  test("R12: cruza el cambio de hora a medianoche (Santiago)", () => {
    const sessions = [s("2026-09-05"), s("2026-09-06"), s("2026-09-07")];
    assert.strictEqual(getStreak(sessions, "2026-09-07"), 3);
  });

  test("R13: cruza el cambio de hora de octubre (Madrid)", () => {
    inZone("Europe/Madrid", () => {
      const sessions = [s("2026-10-24"), s("2026-10-25"), s("2026-10-26")];
      assert.strictEqual(getStreak(sessions, "2026-10-26"), 3);
    });
  });
});

describe("Mejor racha (getBestStreak)", () => {
  const oldRunAndCurrent = [
    s("2026-09-01"),
    s("2026-09-02"),
    s("2026-09-03"),
    s("2026-09-04"),
    s("2026-09-05"),
    s("2026-10-13"),
    s("2026-10-14"),
  ];

  test("B1: sin sesiones es 0", () => {
    assert.strictEqual(getBestStreak([]), 0);
  });

  test("B2: una sola sesión es 1", () => {
    assert.strictEqual(getBestStreak([s("2026-10-14")]), 1);
  });

  test("B3: un tramo antiguo de 5 gana a la racha actual de 2", () => {
    assert.strictEqual(getBestStreak(oldRunAndCurrent), 5);
  });

  test("B4: el orden del array no importa", () => {
    const shuffled = [4, 0, 6, 2, 5, 1, 3].map((i) => oldRunAndCurrent[i]);
    assert.strictEqual(getBestStreak(shuffled), 5);
  });

  test("B5: empate entre dos tramos de 3", () => {
    const sessions = [
      s("2026-09-01"),
      s("2026-09-02"),
      s("2026-09-03"),
      s("2026-10-01"),
      s("2026-10-02"),
      s("2026-10-03"),
    ];
    assert.strictEqual(getBestStreak(sessions), 3);
  });

  test("B6: varias sesiones el mismo día cuentan como un día", () => {
    const sessions = [s("2026-10-14"), s("2026-10-14"), s("2026-10-15")];
    assert.strictEqual(getBestStreak(sessions), 2);
  });

  test("B7: cruza el cambio de hora de marzo (Madrid)", () => {
    inZone("Europe/Madrid", () => {
      const sessions = [s("2026-03-28"), s("2026-03-29"), s("2026-03-30")];
      assert.strictEqual(getBestStreak(sessions), 3);
    });
  });

  test("B8: cruza el cambio de hora a medianoche (Santiago)", () => {
    const sessions = [s("2026-09-05"), s("2026-09-06"), s("2026-09-07")];
    assert.strictEqual(getBestStreak(sessions), 3);
  });
});

describe("Minutos de la semana (getWeekMinutes)", () => {
  test("W1: sin sesiones es 0", () => {
    assert.strictEqual(getWeekMinutes([], "2026-10-14"), 0);
  });

  test("W2: en lunes solo cuenta hoy, no el domingo anterior", () => {
    const sessions = [s("2026-10-11", 20), s("2026-10-12", 30)];
    assert.strictEqual(getWeekMinutes(sessions, "2026-10-12"), 30);
  });

  test("W3: en domingo suma de lunes a domingo", () => {
    const sessions = [
      s("2026-10-11", 99),
      s("2026-10-12", 10),
      s("2026-10-15", 20),
      s("2026-10-18", 30),
    ];
    assert.strictEqual(getWeekMinutes(sessions, "2026-10-18"), 60);
  });

  test("W4: el mismo día suma todo; lo futuro no suma", () => {
    const sessions = [
      s("2026-10-13", 30),
      s("2026-10-13", 15),
      s("2026-10-14", 10),
      s("2026-10-15", 50),
    ];
    assert.strictEqual(getWeekMinutes(sessions, "2026-10-14"), 55);
  });

  test("W5: semana que cruza el cambio de año", () => {
    const sessions = [s("2026-12-27", 99), s("2026-12-28", 40), s("2027-01-01", 20)];
    assert.strictEqual(getWeekMinutes(sessions, "2027-01-01"), 60);
  });
});

describe("Días estudiados del mes (getMonthStudyDays)", () => {
  test("M1: sin sesiones es 0", () => {
    assert.strictEqual(getMonthStudyDays([], "2026-10-14"), 0);
  });

  test("M2: el día 1 solo cuenta hoy", () => {
    const sessions = [s("2026-09-30"), s("2026-10-01")];
    assert.strictEqual(getMonthStudyDays(sessions, "2026-10-01"), 1);
  });

  test("M3: días únicos, sin el mes anterior ni el futuro", () => {
    const sessions = [
      s("2026-09-30"),
      s("2026-10-01"),
      s("2026-10-05"),
      s("2026-10-05"),
      s("2026-10-14"),
      s("2026-10-20"),
    ];
    assert.strictEqual(getMonthStudyDays(sessions, "2026-10-14"), 3);
  });

  test("M4: febrero de año bisiesto", () => {
    const sessions = [s("2028-01-31"), s("2028-02-01"), s("2028-02-29")];
    assert.strictEqual(getMonthStudyDays(sessions, "2028-02-29"), 2);
  });
});
