# Plan 002 — Objetivo semanal de estudio

Estado: **aprobado** — 2026-10-19 (aprobación transmitida por el coordinador, incluidas D1–D13)

Plan técnico de `spec.md` (en esta misma carpeta, aprobada el 2026-10-19). No añade
requisitos: si algo de aquí contradice la spec, manda la spec. Cada sección indica entre
corchetes los RF que cubre.

## 0. Comprobación con la constitución

| Principio | Cómo lo cumple el plan |
|---|---|
| 1. Simplicidad | Solo se amplían los archivos que ya existen. Sin dependencias, sin build, sin módulos ES; sigue funcionando con doble clic (`file://`). |
| 2. La spec manda | Todo sale de `spec.md`. Las decisiones que la spec no fija están en §7 "Decisiones técnicas a revisar". |
| 3. Lógica separada | Las dos funciones nuevas de `logic.js` no usan DOM, `localStorage` ni reloj. No dependen de "hoy": X ya llega calculado por `getWeekMinutes(sessions, today)` (RF13). |
| 4. Tests como puerta | Tests nuevos primero (en rojo), después la lógica (en verde). No se toca la interfaz hasta tener todo en verde. |
| 5. Datos sagrados | Clave nueva `diario-estudio-objetivo-semanal`; `diario-estudio-sesiones` no se lee de otra forma ni se escribe. Copia de seguridad antes de probar en el navegador. |
| 6. Idioma | Identificadores en inglés; comentarios, nombres de tests, textos de la interfaz y documentación en español. |

## 1. Archivos y responsabilidades

| Archivo | Acción | Responsabilidad | RF |
|---|---|---|---|
| `logic.js` | modificar (añadir) | Dos funciones puras nuevas (`parseWeeklyGoal`, `getGoalProgress`), dos constantes de rango y sus exportaciones. **No se toca** `getWeekMinutes` ni ninguna función existente. | RF3, RF13, RF16, RF17, RF18 |
| `tests/logic.test.js` | modificar (ampliar) | Dos `describe` nuevos al final del archivo existente. No se crea ningún archivo de tests nuevo (D11). | RF13 |
| `index.html` | modificar | Tarjeta "Objetivo semanal" justo después de la tarjeta "minutos esta semana", con su propio `<form>`. | RF7, RNF2, RNF4, RNF5 |
| `styles.css` | modificar (añadir) | Reglas para la tarjeta del objetivo: textos, barra y mensaje de error. Solo variables de `:root`. | RNF3, RNF4 |
| `app.js` | modificar | Leer y guardar la clave nueva, pintar el progreso en cada repintado, gestionar el formulario del objetivo. | RF1–RF12, RF14, RF15, RF18, RF19 |
| `MEMORY.md` | modificar | Estado y decisiones al terminar. | — |

No cambian: la clave ni la forma de las sesiones, `loadSessions`, `saveSessions`, el
formulario de sesiones, la lista, las demás tarjetas ni sus IDs y textos. [RF6]

## 2. Funciones puras nuevas de `logic.js` [RF13]

| Función / constante | Entrada → salida | ¿Recibe `today`? | RF |
|---|---|---|---|
| `MIN_WEEKLY_GOAL = 1`, `MAX_WEEKLY_GOAL = 10080` | constantes | — | RF3, RF16 |
| `parseWeeklyGoal(text)` | cualquier valor (texto del campo o de `localStorage`, que puede ser `null`) → entero Y entre 1 y 10080, o `null` ("sin objetivo") | no | RF3, RF5, RF8, RF18 |
| `getGoalProgress(weekMinutes, goal)` | X (lo que devuelva `getWeekMinutes`), Y → `{ percent, remaining, done }` o `null` ("sin objetivo") | **no** (RF13 b: recibe solo X e Y) | RF9, RF10, RF16, RF17 |

`percent`: entero 0–100 (porcentaje de progreso). `remaining`: Z (≥ 0, puede ser decimal
si X es decimal, L21). `done`: booleano "objetivo cumplido". Ninguna función modifica sus
argumentos.

### 2.1 `parseWeeklyGoal(text)` [RF3, RF5, RF18; L13–L18]

```
parseWeeklyGoal(text):
    si text no es un string: devolver null           // null de getItem, undefined… (L18)
    limpio ← text.trim()                             // solo quita los extremos
    si limpio no cumple /^[0-9]+$/: devolver null    // vacío, signos, punto, coma, e, x, espacios en medio, letras
    valor ← Number(limpio)                           // "0300" → 300
    si valor < MIN_WEEKLY_GOAL o valor > MAX_WEEKLY_GOAL: devolver null   // "0", "00", "10081"
    devolver valor
```

La misma función sirve para lo que escribe el usuario y para el valor guardado (RF13 a,
DR8): así `" 0300 "` editado a mano vale 300 (L17) y `"\"300\""` (JSON) no vale (L16).

### 2.2 `getGoalProgress(weekMinutes, goal)` [RF9, RF10, RF16, RF17; L2–L7, L21–L24]

```
getGoalProgress(weekMinutes, goal):
    si goal no es entero (Number.isInteger) o goal < MIN o goal > MAX: devolver null   // RF16, sin dividir
    usable ← (typeof weekMinutes == "number" y Number.isFinite(weekMinutes)) ? weekMinutes : 0   // "X utilizable"
    percent ← Math.floor(usable * 100 / goal)        // multiplicar ANTES de dividir (D2)
    percent ← mínimo(100, máximo(0, percent))         // L6 no desborda, L22 no baja de 0
    remaining ← máximo(0, goal − usable)              // nunca negativa; con X negativo puede superar a Y (L22)
    done ← usable ≥ goal
    devolver { percent, remaining, done }
```

Comprobaciones a mano: L4 → `floor(29900/300) = 99`; L7 → `floor(200/7) = 28`;
L21 → `floor(15050/300) = 50`, Z = 149.5; L22 → `floor(−1000/300) = −4 → 0`, Z = 310;
L23 (`"030"`) → usable 0 → 0 %, Z = Y.

## 3. Interfaz

### 3.1 `index.html` [RF7, RNF2, RNF4, RNF5]

Nueva `<section class="tarjeta objetivo">` entre la tarjeta `semana` y la tarjeta `mes`:

```
<section class="tarjeta objetivo">
  <h2>Objetivo semanal</h2>

  <p class="objetivo-texto" id="objetivoVacio">Aún no tienes objetivo semanal</p>

  <div id="objetivoProgreso" hidden>
    <p class="objetivo-texto" id="objetivoLlevas"></p>
    <div class="objetivo-barra" id="objetivoBarra" role="progressbar"
         aria-label="Progreso del objetivo semanal"
         aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
      <div class="objetivo-barra-relleno" id="objetivoBarraRelleno"></div>
    </div>
    <p class="objetivo-texto" id="objetivoFaltan"></p>
  </div>

  <form id="formObjetivo" novalidate>
    <div class="campo">
      <label for="objetivoMinutos">Minutos por semana</label>
      <input type="text" id="objetivoMinutos" name="objetivoMinutos" inputmode="numeric">
      <p class="objetivo-error" id="objetivoError" hidden>Escribe un número entero de minutos entre 1 y 10080.</p>
    </div>
    <button type="submit" class="boton">Guardar objetivo</button>
  </form>
</section>
```

- `type="text"` + `inputmode="numeric"`: teclado numérico en el móvil sin validación del
navegador (DR11). Sin `required`, `pattern`, `min`, `max` ni `maxlength`; además
`novalidate` en el form (D8). Sin `placeholder` (D9).
- Form propio: Enter en el campo envía solo este form (RF1).
- Estado inicial del HTML = "sin objetivo" (bloque de progreso con `hidden`), así la
página no parpadea con una barra vacía antes de que corra `app.js`.

### 3.2 `styles.css` [RNF3, RNF4]

Solo variables de `:root`, sin `box-shadow`, radios de 3 px. La tarjeta reutiliza
`.tarjeta` (borde fino + regla roja); el campo y el botón reutilizan `.campo` y `.boton`.

| Regla | Contenido |
|---|---|
| `.objetivo-texto` | `color: var(--tinta)`; márgenes pequeños; `overflow-wrap: anywhere` para no desbordar a 375 px. |
| `.objetivo-barra` | `height` ~14 px; `background: var(--papel)`; `border: 1px solid var(--linea)`; `border-radius: 3px`; `overflow: hidden`; margen vertical. |
| `.objetivo-barra-relleno` | `height: 100%`; `background: var(--sello)`; sin borde ni `min-width` (al 0 % no se ve franja roja). El ancho lo pone `app.js`. |
| `.objetivo-error` | `color: var(--tinta)`, tamaño algo menor, margen superior (debajo del campo). No en rojo: RNF3 reserva el sello para barra y botón (D9). |
| `#formObjetivo` | margen superior para separarlo del progreso. |

Ninguna de estas reglas pone `display` en elementos que se ocultan con `hidden`
(`#objetivoVacio`, `#objetivoProgreso`, `#objetivoError`), porque lo anularía (riesgo R3).

### 3.3 `app.js` [RF1–RF12, RF14, RF15, RF18, RF19]

Nuevos: constante `GOAL_STORAGE_KEY = "diario-estudio-objetivo-semanal"`, referencias a
los IDs de §3.1 y estas funciones:

```
loadWeeklyGoal():
    devolver parseWeeklyGoal(localStorage.getItem(GOAL_STORAGE_KEY))   // null si falta o está dañado (RF11, RF18); nunca lo borra

saveWeeklyGoal(goal):
    localStorage.setItem(GOAL_STORAGE_KEY, String(goal))   // texto plano "300" (RF5); sin try/catch (D10, RF19)

renderWeeklyGoal(weekMinutes):
    goal ← loadWeeklyGoal()
    progress ← getGoalProgress(weekMinutes, goal)
    si progress es null:                                   // RF11, RF16, RF18
        objetivoVacio.hidden ← false; objetivoProgreso.hidden ← true
        salir
    objetivoVacio.hidden ← true; objetivoProgreso.hidden ← false
    objetivoLlevas.textContent ← `Llevas ${weekMinutes} de ${goal} min esta semana`   // mismo valor que la tarjeta semanal (RF12, RF17)
    objetivoBarraRelleno.style.width ← progress.percent + "%"
    objetivoBarra.setAttribute("aria-valuenow", progress.percent)                  // RNF5
    objetivoFaltan.textContent ←
        progress.done ? "¡Objetivo cumplido!"                                      // RF10
        : progress.remaining === 1 ? "Te falta 1 min"                              // DR15
        : `Te faltan ${progress.remaining} min`                                    // RF9

handleGoalSubmit(evento):                                  // botón y Enter (RF1)
    evitar el envío
    goal ← parseWeeklyGoal(goalInput.value)
    si goal es null:                                       // RF3
        objetivoError.hidden ← false; salir               // no guarda, deja el texto en el campo
    saveWeeklyGoal(goal)                                   // si lanza, se corta aquí (RF19)
    objetivoError.hidden ← true                            // RF4
    goalInput.value ← String(goal)                         // sin ceros ni espacios (RF8, L15)
    renderScreen()                                         // RF2, RF14
```

Cambio mínimo en `renderScreen` (D5): X se calcula una sola vez y se pasa a las dos
tarjetas.

```
renderScreen():
    sessions ← loadSessions(); today ← getTodayKey()        // "hoy" recalculado en cada repintado (RF14, RF15)
    weekMinutes ← getWeekMinutes(sessions, today)          // cálculo existente, sin cambios (RF12)
    renderStreak(…); renderBestStreak(…)
    renderWeekMinutes(weekMinutes)                         // ahora recibe el número ya calculado
    renderWeeklyGoal(weekMinutes)
    renderMonthStudyDays(…); renderList(…)
```

Inicio (una sola vez, al cargar): `goalInput.value ← loadWeeklyGoal() ?? ""` (RF8: Y o
vacío, nunca el valor dañado), escuchar `submit` de `formObjetivo` → `handleGoalSubmit`,
y después el `renderScreen()` que ya existe. `renderScreen` **no** toca `goalInput`, así
que guardar una sesión no borra lo escrito (L25). No hay temporizador (RF15).

Fechas [RNF6]: no se añade ningún cálculo de fechas. El único "hoy" sigue siendo
`getTodayKey()`; nada de `toISOString()` ni `new Date("AAAA-MM-DD")`.

## 4. Estrategia de tests con `node --test` [RF13]

Se amplía `tests/logic.test.js` (D11), que ya fija `process.env.TZ = "America/Santiago"`
y tiene el atajo `s(date, minutes)`. Se añaden `parseWeeklyGoal` y `getGoalProgress` al
`require` de `../logic.js`.

**`describe("Objetivo semanal: interpretar el texto (parseWeeklyGoal)")`** — un `test`
por entrada, con el ID de la spec en el nombre (se pueden generar con un bucle sobre una
tabla `[entrada, esperado]`):

- L13: `""`, `"   "`, `"0"`, `"00"`, `"-5"`, `"+300"`, `"abc"`, `"90.5"`, `"300.0"`,
`"300,0"`, `"3e2"`, `"0x12C"`, `"3 00"`, `"10081"` → `null`.
- L14: `"1"` → 1, `"10080"` → 10080.
- L15: `" 0300 "` → 300, `"0001"` → 1.
- L16: `"abc"`, `"0"`, `"-3"`, `""`, `"300.0"`, `"\"300\""` → `null`.
- L17: `" 0300 "` como valor guardado → 300.
- L18: `null` y `undefined` → `null`.

**`describe("Objetivo semanal: progreso (getGoalProgress)")`** — `assert.deepStrictEqual`
con el objeto completo:

- L2: (0, 300) → `{ percent: 0, remaining: 300, done: false }`.
- L3: (150, 300) → `{ 50, 150, false }`. L4: (299, 300) → `{ 99, 1, false }`.
- L5: (300, 300) → `{ 100, 0, true }`. L6: (450, 300) → `{ 100, 0, true }`.
- L7: (2, 7) → `{ 28, 5, false }`.
- L21: (150.5, 300) → `{ 50, 149.5, false }`. L22: (−10, 300) → `{ 0, 310, false }`.
- L23: ("030", 300) → `{ 0, 300, false }`; también `NaN` → igual.
- L24: Y = 0, `""`, `"300"` (texto), `undefined`, `null`, `300.5`, `10081` → `null`.
- Definición (redondeo, D2): (57, 100) → `percent: 57` (con `57 / 100 * 100` saldría 56).
- RF12/RF15 (integración con la función existente, sin modificarla): Y = 300 y X =
`getWeekMinutes(sesiones, hoy)` con una sesión del domingo pasado, otra de mañana y dos
de hoy → solo suman las de hoy (L8, L9, L12); con hoy = 2021-01-03 (domingo) y sesiones
el 2020-12-28 (lunes) y el 2021-01-02 → suman ambas (L10, L11).

**Orden (puerta):** tests + esqueleto vacío de las dos funciones (exportadas) → `node
--test` en rojo solo en los nuevos, los 45 existentes en verde → implementar → todo en
verde. Después, interfaz.

**Lo que los tests no cubren** (DOM, `localStorage`, textos, singular/plural, barra,
móvil, consola) se verifica con Chrome DevTools abriendo `index.html` por `file://`
(criterios 2–7 de la spec).

## 5. Cobertura de los RF

| RF | Dónde se cumple | Cómo se comprueba |
|---|---|---|
| RF1 | §3.1 form propio, §3.3 `handleGoalSubmit` | DevTools: botón y Enter |
| RF2 | §3.3 `saveWeeklyGoal` sobrescribe + `renderScreen` | DevTools: cambiar 300 → 450 |
| RF3 | §2.1, §3.3 rama `null` | tests L13; DevTools `abc`, `0`, `3e2`, vacío |
| RF4 | §3.3 `objetivoError.hidden` | DevTools: error y luego valor válido |
| RF5 | §3.3 `GOAL_STORAGE_KEY`, `String(goal)` | DevTools: Application → valor `300`; recargar |
| RF6 | §1 (sin cambios en sesiones) | DevTools: comparación byte a byte (criterio 5) |
| RF7 | §3.1 posición y contenido de la tarjeta | DevTools: vista con y sin objetivo |
| RF8 | §3.3 inicio y `handleGoalSubmit`; `renderScreen` no toca el campo | DevTools: L15, L16, L25 |
| RF9 | §2.2, §3.3 `renderWeeklyGoal` | tests L2–L4, L7; DevTools textos |
| RF10 | §2.2 `done`, §3.3 | tests L5, L6; DevTools |
| RF11 | §3.1 estado inicial, §3.3 rama `null` | DevTools L1, L18 |
| RF12 | §3.3 `weekMinutes` único en `renderScreen` | test de integración; DevTools criterio 2 |
| RF13 | §2, §4 | `node --test` |
| RF14 | §3.3 `renderScreen` tras guardar objetivo y sesión | DevTools |
| RF15 | §3.3 "hoy" por repintado, sin temporizador | test de integración (L9) |
| RF16 | §2.2 guarda de Y | tests L24 |
| RF17 | §2.2 X utilizable; §3.3 muestra `weekMinutes` tal cual | tests L21–L23; DevTools con sesión de minutos texto |
| RF18 | §2.1 + §3.3 `loadWeeklyGoal` (no borra) | tests L16–L18; DevTools criterio 6 |
| RF19 | §3.3 sin try/catch, D10 | DevTools: forzar fallo de `setItem` |
| RNF1 | §0 | abrir con doble clic |
| RNF2 | §3.1, §3.3 textos exactos | revisión contra la spec |
| RNF3 | §3.2 | DevTools: estilos computados, 0 % sin franja roja |
| RNF4 | §3.1 `inputmode`, §3.2 | DevTools a 375 px |
| RNF5 | §3.1 `label`, `role`/`aria-*` | DevTools: árbol de accesibilidad |
| RNF6 | §3.3 Fechas | búsqueda de `toISOString` y `new Date("` |

## 6. Riesgos

- **R1 — Redondeo en coma flotante:** `57 / 100 * 100` da `56.99…` y `floor` daría 56.
Se evita multiplicando antes de dividir (D2) y hay un test para ello.
- **R2 — Nombres globales repetidos:** `logic.js` y `app.js` comparten ámbito. Los
nombres nuevos (`MIN_WEEKLY_GOAL`, `MAX_WEEKLY_GOAL`, `GOAL_STORAGE_KEY`, `goalInput`…)
no deben existir ya en el otro archivo.
- **R3 — `hidden` anulado por CSS:** si una regla pone `display` en un elemento con
`hidden`, se vería siempre. §3.2 lo evita.
- **R4 — Pérdida de sesiones al probar:** se copia `diario-estudio-sesiones` al
scratchpad antes de cargar datos de prueba y se restaura al final (nunca en el repo).
- **R5 — "Llevas X" distinto de "minutos esta semana":** se evita usando la misma
variable `weekMinutes` en las dos tarjetas (D5).
- **R6 — Fallo de `setItem`:** la excepción sale en la consola, igual que hoy con las
sesiones (D10). Choca en apariencia con "consola sin errores" del criterio 7, que se
comprueba en el uso normal, no en el fallo forzado.

## 7. Decisiones técnicas a revisar

| # | Decisión | Por qué | Alternativa descartada |
|---|---|---|---|
| D1 | Nombres `parseWeeklyGoal(text)` y `getGoalProgress(weekMinutes, goal)`; "sin objetivo" = `null` | Nombres en inglés y descriptivos; `null` es fácil de comprobar en la interfaz y en los tests. | Devolver un objeto `{ hasGoal: false }`: más código para lo mismo. |
| D2 | `Math.floor(usable * 100 / goal)` | Con enteros el resultado es exacto cuando debe serlo (R1). | `usable / goal * 100`: falla en casos como 57/100. |
| D3 | `getGoalProgress` vuelve a comprobar Y (entero 1–10080) con las mismas constantes | RF16 pide que la lógica no divida nunca con un Y no válido, venga de donde venga. | Confiar en que Y siempre llega de `parseWeeklyGoal`: el test de L24 no tendría sentido. |
| D4 | Los textos ("Llevas…", "Te falta 1 min", "¡Objetivo cumplido!") se montan en `app.js`, no en `logic.js` | La spec pide como lógica pura solo la interpretación y el cálculo (RF13); los textos son interfaz. Se verifican en DevTools. | Una función pura `formatGoalRemaining(remaining)` con tests: más cobertura, pero añade algo que la spec no pide. |
| D5 | `renderScreen` calcula `weekMinutes` una vez y lo pasa a `renderWeekMinutes(weekMinutes)` y a `renderWeeklyGoal(weekMinutes)`; cambia la firma de `renderWeekMinutes` | Garantiza RF12 por construcción. El número de la tarjeta semanal no cambia. | Llamar a `getWeekMinutes` dos veces: da lo mismo (es pura), pero duplica el cálculo que RF12 pide no duplicar. |
| D6 | Barra con dos `<div>` y `role="progressbar"` + `aria-*` | Se pinta igual en todos los navegadores con las variables de color y radio 3 px. | `<progress>`: su estilo cambia por navegador y necesita pseudo-elementos con prefijos. |
| D7 | Mostrar/ocultar con el atributo `hidden` | Claro y semántico; el estado inicial queda en el HTML. | `style.display` (como `mensajeVacio`): funciona, pero el estado inicial habría que fijarlo desde JS. |
| D8 | `novalidate` en `formObjetivo` y sin `required`/`pattern` en el campo | RF3: la única validación es la de la spec, sin avisos del navegador. | Solo quitar atributos: bastaría hoy, pero `novalidate` evita sorpresas si alguien añade uno. |
| D9 | Sin `placeholder`; mensaje de error en color tinta y sin `role="alert"`/`aria-live` | RNF2 pide los textos exactos de la spec y RNF3 reserva el rojo para barra y botón; anunciar el error no se pide. | Placeholder "Ej: 300" y error en rojo: textos y colores fuera de la spec. |
| D10 | `saveWeeklyGoal` sin `try/catch` | RF19/DR17: igual que `saveSessions`. Si `setItem` lanza, el handler se corta antes de repintar: el objetivo y la pantalla siguen como estaban. | Capturar el error y avisar: es el "tratamiento especial" que la spec deja fuera. |
| D11 | Tests en el `tests/logic.test.js` existente | `CLAUDE.md` pide preguntar antes de crear archivos; reutiliza la zona horaria fijada y el atajo `s()`. | `tests/goal.test.js` nuevo: separación más limpia, pero un archivo más. |
| D12 | `parseWeeklyGoal` usa `String.prototype.trim()` | Es la forma simple de "quitar espacios de los extremos"; también quita tabuladores y espacios no separables. | Quitar solo `" "`: más código y un `"\t300"` editado a mano fallaría sin motivo claro. |
| D13 | El ancho de la barra se pone con `style.width` desde `app.js` | Lo más simple de leer para alguien que empieza. | Variable CSS `--progreso`: un concepto más sin beneficio aquí. |
