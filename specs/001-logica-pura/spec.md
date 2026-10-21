# Spec 001 — Separar la lógica pura y probarla con `node --test`

Estado: **completada (2026-10-16)** (revisión 2). Aprobada por el usuario en el chat al pedir
implementar T01; plan.md queda aprobado con ella.

**Revisión 3 — implementada y verificada (2026-10-21):** la mejor racha deja de
contar las fechas futuras (RF4). Es el único cambio de comportamiento de esta spec; ver
"Cambio de la revisión 3".

## Por qué

Ahora mismo `app.js` no cumple la constitución:

- **Principio 3:** los cálculos (`calcularRacha`, `calcularMinutosSemana`,
`calcularDiasEstudiadosMes`) llaman a `hoyLocal()` por dentro. Por eso no se pueden probar
con un "hoy" fijo. Además, todo vive en el mismo archivo que el DOM y `localStorage`.
- **Principio 4:** no hay tests, y `node --test` no tiene nada que importar.
- **Principio 6:** los nombres del código están en español.

## Objetivo

Que la lógica de fechas y estadísticas sean funciones puras, en su propio archivo, que
reciban "hoy" como parámetro cuando dependan de él y estén cubiertas por tests que se
ejecutan con `node --test`, sin instalar nada.

**Comportamiento idéntico:** el usuario no debe notar ningún cambio. Esto incluye los
comportamientos discutibles que ya existen (ver "Fuera de alcance"): esta spec es una
refactorización, no arregla bugs. Lo que se detecte se apunta para otra spec.

## Requisitos funcionales

Resumen numerado de lo que se describe en el resto de la spec. No añade nada nuevo; sirve
para que el plan y las tareas indiquen qué cubren.

- **RF1 — Lógica pura en `logic.js`:** sin DOM, `localStorage` ni reloj. La carga el
navegador con `<script>` (sin módulos) y Node con `require`, y exporta todas sus funciones.
- **RF2 — "Hoy" como parámetro:** texto `"AAAA-MM-DD"`, solo en las funciones que dependen
de él. `app.js` es el único que lee el reloj, y lo recalcula en cada repintado.
- **RF3 — Racha actual:** días consecutivos con sesión que terminan hoy, o ayer si hoy
todavía no hay sesión. Varias sesiones el mismo día cuentan una vez y las fechas futuras no
suman.
- **RF4 — Mejor racha (revisión 3):** EL SISTEMA muestra como mejor racha el tramo más
largo de días consecutivos con al menos una sesión, contando solo los días hasta hoy
(incluido). Varias sesiones el mismo día cuentan una vez. SI hay sesiones con fecha
posterior a hoy, ENTONCES EL SISTEMA las ignora para la mejor racha, como ya hace con la
racha actual, la semana y el mes. CUANDO llega el día de una sesión que era futura, esa
sesión empieza a contar en el siguiente repintado. Por tanto, la mejor racha nunca es
menor que la racha actual.
- **RF5 — Minutos de la semana:** de lunes a hoy, ambos incluidos. Suman todas las
sesiones de cada día y las fechas futuras no suman.
- **RF6 — Días estudiados del mes:** días únicos con sesión del día 1 a hoy, sin contar
las fechas futuras.
- **RF7 — Utilidades de fecha locales:** claves `"AAAA-MM-DD"`, sumar días, día siguiente,
lunes de la semana, día 1 del mes. Correctas aunque haya cambio de hora, también a
medianoche.
- **RF8 — Compatibilidad de datos:** misma clave y forma en `localStorage`, y migración
del formato antiguo.
- **RF9 — Orden de la lista:** de la sesión más reciente a la más antigua. En el mismo
día, primero la añadida más tarde. No se modifica el array original.
- **RF10 — `app.js` solo interfaz:** usa `logic.js`, no repite sus funciones y tiene los
nombres en inglés. `index.html` carga `logic.js` antes.
- **RF11 — Comportamiento idéntico:** mismas estadísticas, lista, textos, estilos y vista
móvil, sin errores en la consola. Única excepción, desde la revisión 3: la mejor racha
con sesiones futuras (RF4).
- **RF12 — Tests:** con `node --test`, sin instalar nada. La zona horaria se fija dentro
del proceso y una guarda comprueba que se aplicó. Cubren todos los casos de la sección
Tests, y se escriben primero en rojo y luego se ponen en verde.
- **RF13 — Documentación:** actualizar `CLAUDE.md` § Verificación, la skill `local-dates`
y `MEMORY.md`.

## Decisiones tomadas

- **D1 — Idioma de los nombres:** todo el código, `app.js` incluido, pasa a nombres en
inglés (funciones, variables, constantes). **No cambian:** los IDs y clases del HTML, el
CSS, los textos de la interfaz ni el valor de la clave `"diario-estudio-sesiones"`.
- **D2 — Formato de "hoy":** texto `"AAAA-MM-DD"`, el mismo formato que las fechas de las
sesiones. Así no se puede colar un `new Date("…")` interpretado en UTC.
- **D3 — Comentarios y nombres de los tests en español.** Son documentación (principio 6)
y el proyecto es didáctico. Solo los identificadores van en inglés.
- **"Pura"** significa aquí: no usa el DOM, `localStorage`, el reloj (`new Date()` sin
argumentos) ni nada aleatorio, y no modifica sus argumentos. Se admite
`new Date(año, mes, día)` para hacer cuentas de calendario. Depende de la zona horaria
del proceso, y por eso los tests la fijan y la prueban en dos zonas.
- **Principio 3:** se interpreta así: reciben "hoy" las funciones cuyo resultado depende
de qué día es hoy. Las que no dependen de él (`getStudyDays`, `sortSessionsForList`…) no
lo reciben. Desde la revisión 3, la mejor racha sí depende de hoy (RF4) y lo recibe.

## Fuera de alcance (comportamiento actual que se mantiene tal cual)

- Cualquier cambio visible: textos, estilos, HTML (salvo añadir una etiqueta `<script>`).
- El formato de los datos guardados. La clave y la forma `{ date, topic, minutes }` no se
tocan. La migración del formato antiguo (`fecha/tema/minutos/creada`) se mantiene igual,
también el detalle de que, al guardar una sesión nueva, se reescribe todo el array en el
formato nuevo.
- **JSON corrupto en `localStorage`:** hoy la página falla al cargar, y así se queda. No
se debe "arreglar" devolviendo `[]`: el siguiente guardado borraría los datos corruptos y
el usuario perdería sus sesiones para siempre (principio 5).
- **Datos raros:** `null` dentro del array, sesiones sin `date` o sin `topic`, `minutes`
guardado como texto, o fechas sin ceros (`"2026-1-5"`). No se validan. Se asume que todas
las fechas tienen la forma `"AAAA-MM-DD"` con ceros, que es lo que genera
`<input type="date">`.
- **Página abierta pasada la medianoche:** "hoy" se recalcula en cada repintado (como
ahora), no con un temporizador.
- Funcionalidades nuevas, como editar o borrar sesiones.

## Diseño

### Archivos

| Archivo | Cambio |
|---|---|
| `logic.js` (**nuevo**) | Funciones puras. No contiene `document`, `window`, `localStorage` ni `new Date()` sin argumentos. |
| `tests/logic.test.js` (**nuevo**) | Tests con `node:test` y `node:assert`, que vienen con Node: no se instala nada. |
| `app.js` | Solo interfaz. Usa las funciones de `logic.js`, borra sus duplicados y traduce los nombres (D1). |
| `index.html` | Añade `<script src="logic.js"></script>` **antes** de `<script src="app.js">`. |
| `CLAUDE.md` | § Verificación: la lógica se prueba con `node --test`; la interfaz, con Chrome DevTools. |
| `.claude/skills/local-dates/SKILL.md` | "Reutiliza las funciones de fechas de `app.js`" → de `logic.js`. |
| `MEMORY.md` | Estado y decisiones al terminar. |

### Cómo se comparte `logic.js` entre el navegador y Node sin módulos

`logic.js` es un script clásico. El navegador lo carga con `<script>` y sus funciones
quedan globales para `app.js`, así que la página sigue funcionando con `file://`. Al final
del archivo se añade una línea para Node, que exporta **todas** las funciones del archivo
(también las auxiliares, para poder probarlas):

```js
// Solo en Node (tests): exporta las funciones. En el navegador "module" no existe.
if (typeof module !== "undefined") {
  module.exports = { toDateKey, parseDateKey, addDays, /* …todas… */ };
}
```

Los tests las importan con `require("../logic.js")`. No hace falta `package.json`.
Verificado con Node v20.19.0:

- `node --test` sin argumentos encuentra `tests/*.test.js`.
- Cambiar `process.env.TZ` **dentro** del proceso cambia la zona horaria, también en
Windows.
- Poner `TZ=...` delante del comando **no** cambia la zona en Windows, así que la zona se
fija desde el propio test.

`logic.js` y `app.js` comparten el ámbito global del navegador. Por eso, en cuanto una
función existe en `logic.js`, se borra de `app.js` en la misma edición: una declaración
duplicada da `SyntaxError` y la página no carga.

### Funciones de `logic.js`

Todas las fechas son texto `"AAAA-MM-DD"` ("clave de día"), salvo donde se indica.

| Antes (`app.js`) | Después (`logic.js`) | Recibe → devuelve |
|---|---|---|
| `formatearFechaLocal` | `toDateKey(date)` | `Date` → clave |
| `textoAFechaLocal` | `parseDateKey(key)` | clave → `Date` local a las 00:00 |
| `sumarDias` | `addDays(key, days)` | clave, número → clave |
| `migrarSesion` | `migrateSession(session)` | sesión → sesión nueva `{ date, topic, minutes }` |
| `obtenerDiasConSesion` | `getStudyDays(sessions)` | sesiones → `Set` de claves |
| `calcularRacha` | `getStreak(sessions, today)` | → número |
| `esDiaSiguiente` | `isNextDay(key, nextKey)` | → booleano |
| `calcularMejorRacha` | `getBestStreak(sessions, today)` (revisión 3: recibe hoy) | → número |
| `obtenerInicioSemana` | `getWeekStart(today)` | clave → clave del lunes |
| `calcularMinutosSemana` | `getWeekMinutes(sessions, today)` | → número |
| `obtenerInicioMes` | `getMonthStart(today)` | clave → clave del día 1 |
| `calcularDiasEstudiadosMes` | `getMonthStudyDays(sessions, today)` | → número |
| orden dentro de `pintarLista` | `sortSessionsForList(sessions)` | → array nuevo, sin tocar el original |

Para sumar días se sigue usando `new Date(año, mes, día + n)`, nunca milisegundos. Nunca
se usa `toISOString()` ni `new Date("AAAA-MM-DD")`.

### `app.js` después del cambio

| Antes | Después |
|---|---|
| `CLAVE_ALMACENAMIENTO` | `STORAGE_KEY` (mismo valor) |
| `formSesion`, `campoFecha`, `campoTema`, `campoMinutos` | `sessionForm`, `dateInput`, `topicInput`, `minutesInput` |
| `rachaNumero`, `rachaTexto`, `mejorRachaNumero` | `streakNumber`, `streakText`, `bestStreakNumber` |
| `minutosSemanaNumero`, `diasEstudiadosMesNumero` | `weekMinutesNumber`, `monthStudyDaysNumber` |
| `listaSesiones`, `mensajeVacio` | `sessionList`, `emptyMessage` |
| `hoyLocal` | `getTodayKey()` → `toDateKey(new Date())`, el único sitio que lee el reloj |
| `cargarSesiones`, `guardarSesiones` | `loadSessions`, `saveSessions` |
| `pintarRacha`, `pintarMejorRacha` | `renderStreak(sessions, today)`, `renderBestStreak(sessions, today)` (revisión 3) |
| `pintarMinutosSemana`, `pintarDiasEstudiadosMes` | `renderWeekMinutes(sessions, today)`, `renderMonthStudyDays(sessions, today)` |
| `formatearFechaParaMostrar`, `pintarLista`, `escaparHTML` | `formatDateForDisplay`, `renderList`, `escapeHTML` |
| `actualizarPantalla` | `renderScreen()`: calcula `today` con `getTodayKey()` **en cada llamada** y lo pasa |
| `manejarEnvioFormulario` | `handleFormSubmit`: la fecha por defecto del formulario sale de `getTodayKey()` |

`formatDateForDisplay` se queda en `app.js` y no se prueba: usa `toLocaleDateString`, que
en Node puede dar un texto distinto según los idiomas instalados.

## Tests

Archivo `tests/logic.test.js`. Notación: `s("2026-10-14", 30)` es una sesión de ese día con
30 minutos. Si no se indican los minutos, son 30.

**Zona horaria.** La primera línea del archivo fija `process.env.TZ = "America/Santiago"`.
Es el peor caso: allí el cambio de hora ocurre **a medianoche** (6-sep-2026, de 00:00 a
01:00), así que el día 6 no tiene 00:00. Los tests marcados con **[Madrid]** cambian a
`"Europe/Madrid"` dentro del test y restauran Santiago al terminar.

**Guarda:** antes que nada, un test comprueba que en Santiago
`new Date(2026, 8, 6).getHours() === 1`. Si falla, la zona no se ha aplicado y los demás
tests de cambio de hora no probarían nada.

Calendario de referencia: 12-oct-2026 es lunes y 18-oct-2026 es domingo; 28-dic-2026 es
lunes; 2028 es bisiesto.

### Racha — `getStreak(sessions, today)`

| # | Hoy | Sesiones | Esperado |
|---|---|---|---|
| R1 | 2026-10-14 | ninguna | 0 |
| R2 | 2026-10-14 | 10-14 | 1 |
| R3 | 2026-10-14 | 10-12, 10-13, 10-14 | 3 |
| R4 | 2026-10-14 | 10-12, 10-13 (hoy no) | 2 (sigue viva desde ayer) |
| R5 | 2026-10-14 | 10-12 | 0 |
| R6 | 2026-10-14 | 10-14, 10-14, 10-14 | 1 |
| R7 | 2026-10-14 | 10-12, 10-14 (hueco el 13) | 1 |
| R8 | 2026-10-14 | 10-13, 10-14, 10-15 (futuro) | 2 |
| R9 | 2026-10-14 | 10-15 (solo futuro) | 0 |
| R10 | 2027-01-01 | 2026-12-30, 2026-12-31, 2027-01-01 | 3 (cambio de año) |
| R11 | 2028-03-01 | 2028-02-28, 2028-02-29, 2028-03-01 | 3 (bisiesto) |
| R12 | 2026-09-07 | 09-05, 09-06, 09-07 | 3 (cambio de hora a medianoche, Santiago) |
| R13 [Madrid] | 2026-10-26 | 10-24, 10-25, 10-26 | 3 (cambio de hora de octubre) |

### Mejor racha — `getBestStreak(sessions, today)`

En B1–B8 hoy es 2026-10-15: ninguna sesión es futura y el resultado no cambia respecto a
la revisión 2. B9–B14 son de la revisión 3.

| # | Hoy | Sesiones | Esperado |
|---|---|---|---|
| B1 | 2026-10-15 | ninguna | 0 |
| B2 | 2026-10-15 | 2026-10-14 | 1 |
| B3 | 2026-10-15 | 2026-09-01 … 2026-09-05 (5 días) + 2026-10-13, 2026-10-14 | 5 |
| B4 | 2026-10-15 | las mismas de B3, desordenadas | 5 |
| B5 | 2026-10-15 | dos tramos de 3 días (09-01…09-03 y 10-01…10-03) | 3 (empate) |
| B6 | 2026-10-15 | 2026-10-14, 2026-10-14, 2026-10-15 | 2 (varias el mismo día cuentan 1) |
| B7 [Madrid] | 2026-10-15 | 2026-03-28, 2026-03-29, 2026-03-30 | 3 (cambio de hora de marzo) |
| B8 | 2026-10-15 | 2026-09-05, 2026-09-06, 2026-09-07 | 3 (Santiago) |
| B9 | 2026-10-14 | 10-12, 10-13, 10-14, 10-15, 10-16 (futuras) | 3 (el tramo se corta en hoy) |
| B10 | 2026-10-14 | 10-15, 10-16, 10-17 (solo futuras) | 0 |
| B11 | 2026-10-14 | 09-01, 09-02 + 10-20 … 10-24 (5 días futuros) | 2 (el tramo futuro, más largo, no cuenta) |
| B12 | 2026-10-14 | 10-13, 10-14 | 2 (hoy cuenta) |
| B13 | 2026-10-14 | 10-12, 10-13 (hoy no) | 2 (igual que la racha actual R4) |
| B14 | 2026-10-15 | las mismas de B9 (el 10-15 ya es hoy) | 4 (al llegar el día, cuenta) |

### Cambio de la revisión 3 (mejor racha sin fechas futuras)

**Por qué:** la mejor racha era la única estadística que contaba sesiones con fecha
futura. Una sesión registrada por error en una fecha posterior podía inflarla (por
ejemplo, "mejor racha 5" con una racha actual de 4). Ahora sigue la misma regla que la
racha actual, la semana y el mes.

**Casos límite:** B9–B14. Además:
- Una sesión futura sigue apareciendo en la lista y guardada tal cual; solo deja de
contar en la mejor racha (en las demás estadísticas ya no contaba).
- Página abierta pasada la medianoche: la sesión de "mañana" empieza a contar en el
siguiente repintado (como las demás estadísticas, sin temporizador).

**Fuera de alcance de la revisión 3:**
- Impedir o avisar al registrar una sesión con fecha futura en el formulario.
- Borrar, mover o modificar las sesiones futuras ya guardadas.
- Guardar la mejor racha como "récord" en `localStorage`: se sigue calculando siempre a
partir de las sesiones.
- Cambios en las demás estadísticas, la lista, los textos, los estilos o el formato de
los datos guardados.
- Los otros pendientes (JSON corrupto, texto del principio 3 de la constitución).

**Criterios de finalización de la revisión 3:**
1. `node --test` en verde con B1–B14 y todos los demás tests existentes sin cambios.
2. En el navegador (`file://`, datos de prueba en un contexto aislado) con una sesión de
mañana que alargaría el tramo de hoy: la mejor racha no la cuenta y no es menor que la
racha actual; la racha actual, la semana, el mes, el objetivo semanal y la lista no
cambian respecto a antes del cambio.
3. `diario-estudio-sesiones` idéntico byte a byte antes y después de cargar la página.
4. Consola sin errores ni avisos; la vista móvil (375 px) se ve igual.

### Semana — `getWeekMinutes(sessions, today)`

| # | Hoy | Sesiones | Esperado |
|---|---|---|---|
| W1 | 2026-10-14 | ninguna | 0 |
| W2 | 2026-10-12 (lunes) | s(10-11, 20) domingo anterior, s(10-12, 30) | 30 |
| W3 | 2026-10-18 (domingo) | s(10-11, 99), s(10-12, 10), s(10-15, 20), s(10-18, 30) | 60 |
| W4 | 2026-10-14 | s(10-13, 30), s(10-13, 15), s(10-14, 10), s(10-15, 50) futuro | 55 (mismo día suma todo; futuro no) |
| W5 | 2027-01-01 (viernes) | s(2026-12-27, 99), s(2026-12-28, 40), s(2027-01-01, 20) | 60 (semana que cruza el año) |

### Mes — `getMonthStudyDays(sessions, today)`

| # | Hoy | Sesiones | Esperado |
|---|---|---|---|
| M1 | 2026-10-14 | ninguna | 0 |
| M2 | 2026-10-01 | 09-30, 10-01 | 1 |
| M3 | 2026-10-14 | 09-30, 10-01, 10-05, 10-05, 10-14, 10-20 (futuro) | 3 |
| M4 | 2028-02-29 | 2028-01-31, 2028-02-01, 2028-02-29 | 2 (bisiesto) |

### Utilidades y datos

| # | Llamada | Esperado |
|---|---|---|
| U1 | `toDateKey(new Date(2026, 0, 5))` | `"2026-01-05"` (con ceros) |
| U2 | `parseDateKey("2026-09-06")` (Santiago) | año 2026, mes 8, día 6 (no se va al día 5) |
| U3 | `addDays("2026-09-05", 1)` y `addDays("2026-09-07", -1)` (Santiago) | `"2026-09-06"` las dos |
| U4 [Madrid] | `addDays("2026-10-25", 1)` | `"2026-10-26"` |
| U5 | `addDays("2026-03-01", -1)` | `"2026-02-28"` |
| U6 | `addDays("2028-02-28", 1)` | `"2028-02-29"` |
| U7 | `addDays("2026-12-31", 1)` | `"2027-01-01"` |
| U8 | `isNextDay("2026-12-31", "2027-01-01")` / `isNextDay("2026-10-12", "2026-10-14")` | `true` / `false` |
| U9 | `getWeekStart` de `"2026-10-18"`, `"2026-10-12"` y `"2027-01-01"` | `"2026-10-12"`, `"2026-10-12"`, `"2026-12-28"` |
| U10 | `getMonthStart("2026-10-14")` | `"2026-10-01"` |
| U11 | `getStudyDays` con 10-14, 10-14, 10-15 | `Set` con 2 claves |
| U12 | `migrateSession({ fecha: "2026-10-14", tema: "Álgebra", minutos: 30, creada: 1 })` | `{ date: "2026-10-14", topic: "Álgebra", minutes: 30 }` |
| U13 | `migrateSession` con una sesión ya en formato nuevo | igual que la entrada |
| U14 | `sortSessionsForList([A(10-12, añadida 1ª), B(10-14), C(10-12, añadida 3ª)])` | `[B, C, A]`, y el array original no cambia |

## Criterios de aceptación

1. `node --test` pasa en verde todos los tests de arriba (guarda incluida), sin
`npm install`, tanto después del paso 2 como al terminar el paso 3.
2. **Antes de tocar `app.js`**, se guarda una referencia con Chrome DevTools: el valor de
`localStorage` del usuario (copia de seguridad), las 4 estadísticas, el texto de la lista
y capturas en escritorio (1280×800) y móvil (375×667). La verificación se hace con los
**datos de prueba** de abajo, no con los del usuario; al final se restaura la copia de
seguridad.
3. Con `index.html` abierto con doble clic (`file://`) y los mismos datos de prueba, las 4
estadísticas, la lista y su orden coinciden **exactamente** con la referencia. Las
capturas de escritorio y móvil se ven igual.
4. Después de añadir una sesión desde el formulario, todo se actualiza y la fecha del
formulario vuelve a hoy.
5. La consola no muestra errores ni avisos nuevos.
6. Las sesiones del formato antiguo de los datos de prueba aparecen en la lista y cuentan
en las estadísticas.
7. `logic.js` no contiene `document`, `window`, `localStorage` ni `new Date()` sin
argumentos. Una búsqueda en el archivo lo comprueba.
8. `app.js` no repite ninguna función de `logic.js` y no queda ningún identificador en
español (los textos de la interfaz sí siguen en español).
9. Checklist de la skill `local-dates` revisado y anotado en el resumen final.

**Datos de prueba** (se meten en `localStorage` desde DevTools, relativos a la fecha del
día en que se verifica): sesiones de hoy, ayer y anteayer (dos de ellas el mismo día); un
tramo antiguo de 4 días seguidos; una sesión del domingo pasado; una sesión futura; y dos
sesiones en formato antiguo `{ fecha, tema, minutos, creada }`.

## Pasos (sin avanzar con tests en rojo)

1. Escribir `tests/logic.test.js` y crear un `logic.js` vacío que solo exporta. Ejecutar
`node --test`: tiene que salir **en rojo**, lo que demuestra que los tests prueban algo.
2. Escribir `logic.js` hasta que `node --test` salga en verde.
3. Guardar la referencia del criterio 2. Después: cargar `logic.js` en `index.html`, hacer
que `app.js` lo use, borrar los duplicados y traducir los nombres. Volver a ejecutar
`node --test`.
4. Verificar con Chrome DevTools (criterios 3–6) y restaurar el `localStorage` del usuario.
5. Actualizar `CLAUDE.md` § Verificación, la skill `local-dates` y `MEMORY.md`.
