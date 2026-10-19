# Tareas 002 — Objetivo semanal de estudio

Estado: **aprobado** — 2026-10-19 (aprobación transmitida por el coordinador, incluidas D1–D13)

Sale de `spec.md` (aprobada el 2026-10-19) y `plan.md` (en esta misma carpeta). Las tareas
se hacen en orden: cada una depende de las anteriores. Cada una dura como mucho 20–30
minutos.

**Puerta (principio 4):** en cada tarea, `node --test` debe terminar con los 45 tests
existentes en verde. Desde T4, si algo que ya estaba en verde pasa a rojo, se para y se
arregla antes de seguir.

**Verificación de interfaz (T6–T9):** abrir `index.html` con `file://` en Chrome DevTools,
revisar la consola (sin errores ni avisos nuevos) y la vista móvil (375 px).

## Fase 1 — Tests en rojo

- [x] **T1 — Esqueleto y tests de `parseWeeklyGoal`.** En `logic.js`: constantes
`MIN_WEEKLY_GOAL`/`MAX_WEEKLY_GOAL` y `parseWeeklyGoal` y `getGoalProgress` vacías (sin
lógica), añadidas a `module.exports`. En `tests/logic.test.js`: ampliar el `require` y
añadir el `describe` de `parseWeeklyGoal` con L13–L18 (plan §4).
  - Archivos: `logic.js`, `tests/logic.test.js`.
  - RF: RF3, RF5, RF13, RF18.
  - Hecho cuando: `node --test` se ejecuta sin errores de carga, los 45 tests existentes
  siguen en verde y todos los de L13–L18 salen en rojo (la función vacía devuelve
  `undefined` y se compara con `assert.strictEqual(…, null)`, así que también fallan los
  que esperan `null`).

- [x] **T2 — Tests de `getGoalProgress`.** Añadir el `describe` de progreso con L2–L7,
L21–L24, el caso de redondeo (57, 100) y los dos tests de integración con
`getWeekMinutes` (L8–L12, plan §4).
  - Archivos: `tests/logic.test.js`.
  - RF: RF9, RF10, RF12, RF13, RF15, RF16, RF17.
  - Hecho cuando: `node --test` muestra en rojo los tests nuevos de progreso y en verde
  los 45 existentes; cada ID de la spec citado en el plan §4 aparece en el nombre de algún
  test.

## Fase 2 — Lógica en verde

- [x] **T3 — Implementar `parseWeeklyGoal`** según el plan §2.1.
  - Archivos: `logic.js`.
  - RF: RF3, RF5, RF13, RF18.
  - Hecho cuando: L13–L18 en verde y los 45 existentes siguen en verde.

- [x] **T4 — Implementar `getGoalProgress`** según el plan §2.2 (multiplicar antes de
dividir) y revisar `logic.js`.
  - Archivos: `logic.js`.
  - RF: RF9, RF10, RF13, RF16, RF17.
  - Hecho cuando: `node --test` sale **todo en verde**; `getWeekMinutes` no ha cambiado
  (`git diff` de esa función vacío); una búsqueda de
  `document|window|localStorage|toISOString|new Date\(` en las líneas nuevas de `logic.js`
  no encuentra nada.

## Fase 3 — Interfaz

- [x] **T5 — Copia de seguridad y referencia "antes".** Sobre la versión actual sin tocar,
con Chrome DevTools: copiar el valor de `diario-estudio-sesiones` del usuario a un archivo
del scratchpad (nunca en el repo); cargar datos de prueba con sesiones de esta semana,
del domingo pasado, de mañana, dos del mismo día y una en formato antiguo; anotar las 4
estadísticas y guardar el valor exacto de `diario-estudio-sesiones` de prueba.
  - Archivos: ninguno del repo.
  - RF: RF6 (criterio 5), RNF6.
  - Hecho cuando: existen la copia de seguridad, el valor de prueba guardado y los 4
  números anotados; `node --test` sigue en verde.

- [x] **T6 — Tarjeta en `index.html` y estilos en `styles.css`.** Añadir la sección del
plan §3.1 entre la tarjeta semanal y la mensual, y las reglas del plan §3.2 (solo
variables de `:root`, sin `box-shadow`, radio 3 px, sin `display` en elementos con
`hidden`). Aún sin JS nuevo.
  - Archivos: `index.html`, `styles.css`.
  - RF: RF7, RF11 (estado inicial), RNF2, RNF3, RNF4, RNF5.
  - Hecho cuando: en DevTools la tarjeta "Objetivo semanal" aparece justo después de
  "minutos esta semana" con "Aún no tienes objetivo semanal", el campo "Minutos por
  semana" y el botón "Guardar objetivo"; la tarjeta semanal no ha cambiado; a 375 px no
  hay desbordamiento horizontal; la consola está limpia; `node --test` sigue en verde.

- [x] **T7 — Leer y pintar el objetivo en `app.js`.** `GOAL_STORAGE_KEY`, referencias al
DOM, `loadWeeklyGoal`, `renderWeeklyGoal`, `renderScreen` con `weekMinutes` calculado una
vez y `renderWeekMinutes(weekMinutes)`, y relleno inicial del campo (plan §3.3). Todavía
sin guardar desde el formulario.
  - Archivos: `app.js`.
  - RF: RF7, RF8 (al cargar), RF9, RF10, RF11, RF12, RF14, RF15, RF17, RF18.
  - Hecho cuando: poniendo a mano la clave en DevTools y recargando: sin clave → L1;
  `300` con los datos de prueba → "Llevas X de 300 min esta semana" con el mismo X que la
  tarjeta semanal, barra y "Te faltan Z min"; L4 muestra "Te falta 1 min"; L6 barra llena
  y "¡Objetivo cumplido!"; `abc`, `"300"` (JSON) → como L1 con campo vacío y la clave
  intacta; `" 0300 "` → Y = 300 y no se reescribe; al 0 % no se ve rojo; `aria-valuenow`
  coincide con el ancho; consola limpia; `node --test` en verde.

- [x] **T8 — Guardar el objetivo desde el formulario.** `saveWeeklyGoal`,
`handleGoalSubmit` y su `addEventListener` (plan §3.3).
  - Archivos: `app.js`.
  - RF: RF1, RF2, RF3, RF4, RF5, RF8, RF14, RF19.
  - Hecho cuando: en DevTools fijar con el botón y con Enter guarda exactamente `300`
  (también desde `0300`); cambiar a 450 sustituye el valor; `abc`, `0`, `3e2` y vacío
  muestran el mensaje exacto, sin aviso del navegador, el texto sigue en el campo y la
  clave no cambia; un valor válido después oculta el mensaje; recargar conserva el
  objetivo; escribir sin confirmar y guardar una sesión deja el texto en el campo (L25);
  forzando en la consola que `localStorage.setItem` lance, el objetivo y la pantalla no
  cambian (RF19); `node --test` en verde.

## Fase 4 — Verificación y cierre

- [x] **T9 — Verificación completa y restauración.** Recorrer los criterios 2–7 de la
spec con los datos de T5: "Llevas X" = "minutos esta semana" en L8–L12 y tras fijar el
objetivo; `diario-estudio-sesiones` idéntico byte a byte al valor de T5 en los momentos
(a)–(f) del criterio 5; escritorio y 375 px; árbol de accesibilidad de la barra (nombre
"Progreso del objetivo semanal" y porcentaje). Al final, restaurar la copia de seguridad
del usuario, borrar la clave de objetivo de prueba y borrar la copia del scratchpad.
  - Archivos: ninguno del repo.
  - RF: RF6, RF12, RF14, RNF1, RNF3, RNF4, RNF5 (criterios 2–7).
  - Hecho cuando: todos los criterios 2–7 anotados como cumplidos, consola sin errores ni
  avisos nuevos, `diario-estudio-sesiones` idéntico a la copia de T5 y `node --test` en
  verde.

- [x] **T10 — Cierre: `MEMORY.md` y estado de la spec.** Actualizar `MEMORY.md` (spec 002
implementada, clave nueva `diario-estudio-objetivo-semanal` en texto plano, decisiones D2,
D5 y D10 del plan con su porqué, y errores a evitar), manteniéndolo en ~50 líneas.
Cambiar la línea "Estado" de `spec.md` a "implementada (fecha)" y marcar estas tareas.
  - Archivos: `MEMORY.md`, `specs/002-objetivo-semanal/spec.md`, `tasks.md`.
  - RF: todos (criterio 1 de la spec: `node --test` en verde).
  - Hecho cuando: `MEMORY.md` refleja el estado y sigue por debajo de ~50 líneas,
  `spec.md` dice "implementada", cada casilla está marcada o explica por qué no, y
  `node --test` sale todo en verde.
