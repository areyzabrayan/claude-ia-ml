# Tareas 001 — Separar la lógica pura y probarla con `node --test`

Sale de `spec.md` y `plan.md` (en esta misma carpeta). Las tareas se hacen en orden: cada
una depende de las anteriores. Cada una dura como mucho 20–30 minutos.

**Puerta (principio 4):** desde T10, si `node --test` sale en rojo en algo que ya estaba
en verde, se para y se arregla antes de seguir.

## Fase 0 — Arranque

- [x] **T01 — Aprobar spec y plan.** El usuario aprueba `spec.md` y `plan.md` en el chat.
Se cambia la línea "Estado" de `spec.md` a "aprobada (fecha)".
  - RF: todos (puerta de entrada, principio 2).
  - Hecho cuando: `spec.md` dice "Estado: aprobada (AAAA-MM-DD)".

## Fase 1 — Tests en rojo

- [x] **T02 — Esqueleto de `logic.js`.** Crear el archivo con las 13 funciones del plan §2
vacías (sin lógica) y el bloque `module.exports` condicional al final.
  - RF: RF1.
  - Hecho cuando: `node -e "console.log(Object.keys(require('./logic.js')).length)"`
  imprime `13`, y abrir `index.html` sigue funcionando igual (todavía no carga `logic.js`).

- [x] **T03 — Esqueleto de `tests/logic.test.js`.** Primera línea
`process.env.TZ = "America/Santiago"`, los `require` (`node:test`, `node:assert`,
`../logic.js`), el atajo `s(date, minutes = 30)` y el test de **guarda**
(`new Date(2026, 8, 6).getHours() === 1`).
  - RF: RF12.
  - Hecho cuando: `node --test` se ejecuta sin errores de carga y muestra 1 test, la
  guarda, en verde.

- [x] **T04 — Tests de utilidades de fecha (U1–U10).** Un `describe` con un `test` por
caso. U4 cambia a `Europe/Madrid` y restaura en un `finally`.
  - RF: RF7, RF12.
  - Hecho cuando: `node --test` muestra U1–U10 en rojo y la guarda en verde.

- [x] **T05 — Tests de datos y orden (U11–U14).** U14 comprueba también que el array
original no cambia.
  - RF: RF8, RF9, RF12.
  - Hecho cuando: `node --test` muestra U11–U14 en rojo.

- [x] **T06 — Tests de racha actual (R1–R13).** R13 en `Europe/Madrid`, con restauración.
  - RF: RF3, RF12.
  - Hecho cuando: `node --test` muestra R1–R13 en rojo.

- [x] **T07 — Tests de mejor racha (B1–B8).** B7 en `Europe/Madrid`, con restauración.
  - RF: RF4, RF12.
  - Hecho cuando: `node --test` muestra B1–B8 en rojo.

- [x] **T08 — Tests de semana y mes (W1–W5, M1–M4).**
  - RF: RF5, RF6, RF12.
  - Hecho cuando: `node --test` muestra W1–W5 y M1–M4 en rojo.

- [x] **T09 — Comprobar el rojo.** Revisar que cada caso de las tablas de la spec tiene su
test, con el ID en el nombre y el valor esperado exacto.
  - RF: RF12.
  - Hecho cuando: `node --test` informa de **45 tests: 1 en verde (guarda) y 44 en rojo**,
  y cada ID de la spec (R1–R13, B1–B8, W1–W5, M1–M4, U1–U14) aparece una sola vez.

## Fase 2 — Lógica en verde

- [x] **T10 — Utilidades de fecha.** Implementar `toDateKey`, `parseDateKey`, `addDays`,
`isNextDay`, `getWeekStart` y `getMonthStart` según el plan §3.1.
  - RF: RF7, RF2.
  - Hecho cuando: U1–U10 en verde y la guarda en verde.

- [x] **T11 — Datos y orden.** Implementar `getStudyDays`, `migrateSession` y
`sortSessionsForList` según el plan §3.6.
  - RF: RF8, RF9.
  - Hecho cuando: U11–U14 en verde y siguen en verde U1–U10.

- [x] **T12 — Racha actual.** Implementar `getStreak` según el plan §3.2.
  - RF: RF3.
  - Hecho cuando: R1–R13 en verde y todo lo anterior sigue en verde.

- [x] **T13 — Mejor racha.** Implementar `getBestStreak` según el plan §3.3.
  - RF: RF4.
  - Hecho cuando: B1–B8 en verde y todo lo anterior sigue en verde.

- [x] **T14 — Semana y mes.** Implementar `getWeekMinutes` y `getMonthStudyDays` según el
plan §3.4 y §3.5.
  - RF: RF5, RF6.
  - Hecho cuando: `node --test` informa de **45/45 en verde**.

- [x] **T15 — Revisar `logic.js`.** Buscar nombres o palabras prohibidos y pasar el
checklist de la skill `local-dates`. Comprobar que los comentarios están en español y los
identificadores en inglés.
  - RF: RF1, RF7.
  - Hecho cuando: una búsqueda de `document|window|localStorage|toISOString|new Date\(\)|86400000`
  en `logic.js` no encuentra nada, el checklist queda anotado y `node --test` sigue
  45/45.

## Fase 3 — Interfaz

- [x] **T16 — Guardar la referencia "antes".** Con Chrome DevTools, sobre la versión
actual sin tocar:
  1. Copiar el valor de `diario-estudio-sesiones` del usuario (copia de seguridad) en un
  archivo del scratchpad, nunca en el repo.
  2. Cargar los datos de prueba de la spec, que incluyen 2 sesiones en formato antiguo.
  3. Anotar las 4 estadísticas y el texto de la lista, en orden.
  4. Hacer capturas a 1280×800 y 375×667.
  - RF: RF8, RF11.
  - Hecho cuando: existen la copia de seguridad, la anotación de los 4 números y la lista,
  y las 2 capturas.

- [x] **T17 — Conectar `logic.js`.** En `index.html`, añadir `<script src="logic.js">`
antes de `app.js`. En `app.js`, cambiar cada cálculo por su función de `logic.js` y
**borrar el duplicado en la misma edición**. Añadir `getTodayKey()` y pasar `today` desde
el repintado, que lo recalcula en cada llamada.
  - RF: RF1, RF2, RF10.
  - Hecho cuando: `app.js` no contiene ninguna de las funciones de cálculo antiguas
  (`calcularRacha`, `sumarDias`, `migrarSesion`…), `getTodayKey` es el único `new Date()`
  sin argumentos, la página carga sin errores en la consola y los 4 números coinciden con
  la referencia de T16.

- [x] **T18 — Traducir los nombres de `app.js`.** Aplicar la tabla "`app.js` después del
cambio" de la spec. No cambian los IDs del HTML, los textos, el valor de `STORAGE_KEY` ni
los comentarios en español.
  - RF: RF10.
  - Hecho cuando: ningún identificador de `app.js` está en español (revisado contra la
  tabla), `STORAGE_KEY === "diario-estudio-sesiones"`, `node --test` sigue 45/45 y la
  página carga sin errores.

## Fase 4 — Verificación y cierre

- [x] **T19 — Verificar igual que antes.** Con los mismos datos de prueba que en T16,
abriendo `index.html` con `file://`:
  1. Comparar las 4 estadísticas, la lista y su orden con la referencia.
  2. Comparar las capturas de escritorio y móvil.
  3. Revisar la consola.
  4. Añadir una sesión desde el formulario.
  - RF: RF8, RF11 (criterios 3–6 de la spec).
  - Hecho cuando: números y lista idénticos a T16, capturas sin diferencias visibles,
  consola sin errores ni avisos nuevos, las 2 sesiones antiguas aparecen, y tras añadir la
  sesión todo se actualiza y la fecha del formulario vuelve a hoy.

- [x] **T20 — Restaurar los datos del usuario.** Volver a poner en `localStorage` la copia
de seguridad de T16 y borrar la copia del scratchpad.
  - RF: RF8 (principio 5).
  - Hecho cuando: el valor de `diario-estudio-sesiones` es idéntico al copiado en T16 y la
  página muestra las sesiones reales del usuario.

- [x] **T21 — Actualizar la documentación.** Cambiar `CLAUDE.md` § Verificación (lógica
con `node --test`, interfaz con Chrome DevTools) y la skill `local-dates` (las funciones
están en `logic.js`). Actualizar `MEMORY.md` (estado y decisiones) y poner la línea
"Estado" de `spec.md` a "completada (fecha)".
  - RF: RF13.
  - Hecho cuando: ninguno de los tres documentos dice ya "No hay tests automáticos" ni
  "funciones de fechas en `app.js`", `MEMORY.md` sigue por debajo de unas 50 líneas y
  `spec.md` dice "completada".

- [x] **T22 — Resumen final al usuario.** Qué se ha cambiado, el checklist de
`local-dates` con cómo se comprobó cada punto, y lo que queda para otras specs (la mejor
racha con fechas futuras, el JSON corrupto, el texto del principio 3).
  - RF: RF13 (criterio 9 de la spec).
  - Hecho cuando: el resumen está en el chat y cada casilla de este archivo está marcada o
  tiene escrito por qué no.

## Revisión 3 — Mejor racha sin fechas futuras (RF4)

Estado: **implementada y verificada** (2026-10-21). Sale del RF4 revisión 3 de `spec.md` y
del plan §3.3 y D5. Las T01–T22 ya hechas no se tocan. Todo en `main`, sin worktrees.

- [x] **R3-T1 — Tests en rojo.** En `tests/logic.test.js`: B1–B8 pasan a llamar a
`getBestStreak(sessions, "2026-10-15")`, y se añaden B9–B14 de la spec. Sin tocar
`logic.js`.
  - RF: RF4, RF12.
  - Hecho cuando: `node --test` muestra en verde todos los tests anteriores (B1–B8
  incluidos: con `today` de más el resultado no cambia) y en rojo B9, B10, B11 y B14. B12
  y B13 ya pasan con el código actual porque no tienen fechas futuras: son casos de
  control y se anota así.

- [x] **R3-T2 — Lógica y llamada.** `getBestStreak(sessions, today)` en `logic.js` según
el plan §3.3 (filtrar `day <= today` antes de ordenar) y actualizar su comentario.
`renderBestStreak(sessions, today)` en `app.js` y su llamada en `renderScreen`.
  - RF: RF2, RF4.
  - Hecho cuando: `node --test` sale **todo en verde**; ningún `getBestStreak(` se llama
  sin `today` (búsqueda en `app.js` y en los tests); las líneas nuevas de `logic.js` no
  contienen `toISOString`, `new Date(` ni `document`.

- [x] **R3-T3 — Verificación en el navegador y cierre.** Con Chrome DevTools en un
contexto aislado (`new_page` con `isolatedContext`; los datos reales no se tocan),
comprobar los criterios 2–4 de la revisión 3 con datos de prueba: sesiones de anteayer,
ayer y hoy, y una de mañana. Antes del cambio la mejor racha daba 4; ahora debe dar 3,
igual que la racha actual, y la semana, el mes, el objetivo y la lista no cambian. Hacer
lo mismo a 375 px. Después actualizar `MEMORY.md` (quitar este pendiente), poner
"implementada" en la línea de la revisión 3 de `spec.md` y marcar estas casillas.
  - RF: RF4, RF11.
  - Hecho cuando: los criterios 2–4 están anotados como cumplidos, la consola está limpia y
  `node --test` está en verde.
