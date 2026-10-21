# Plan 001 — Separar la lógica pura y probarla con `node --test`

Plan técnico de `spec.md` (en esta misma carpeta). No añade requisitos: si algo de aquí
contradice la spec, manda la spec. Cada sección indica entre corchetes los RF que cubre.

> **Sobre el "mapa":** la spec 001 es una refactorización sin cambios visibles y no tiene
> ningún mapa (ni de calor ni de calendario). Por el principio 2 de la constitución, este
> plan no lo incluye. En su lugar, la sección 3 da el pseudocódigo de los algoritmos que
> sí existen: racha, mejor racha, semana, mes y orden de la lista. Si se quiere un mapa,
> será una spec nueva (002).

## 0. Comprobación con la constitución

| Principio | Cómo lo cumple el plan |
|---|---|
| 1. Simplicidad | Solo JS clásico. `logic.js` se carga con `<script>` y no hay `package.json`, dependencias ni build. Sigue funcionando con doble clic. |
| 2. La spec manda | Todo lo que hay aquí sale de `spec.md`; el "mapa" se excluye a propósito (ver arriba). |
| 3. Lógica separada | `logic.js` no usa DOM, `localStorage` ni reloj. Las funciones que dependen del día reciben `today`. |
| 4. Tests como puerta | Se escriben primero los tests (en rojo) y después la lógica (en verde). No se toca `app.js` hasta tenerlos en verde. |
| 5. Datos sagrados | La clave y la forma de los datos no cambian, la migración se mantiene y se verifica con datos de prueba tras hacer una copia de seguridad. |
| 6. Idioma | Identificadores en inglés; comentarios, nombres de tests, interfaz y documentación en español. |

## 1. Archivos y responsabilidades

| Archivo | Acción | Responsabilidad | RF |
|---|---|---|---|
| `logic.js` | crear | Única fuente de los cálculos de fechas, rachas, estadísticas, migración y orden. Sin efectos secundarios. Al final, exporta todo para Node. | RF1–RF9 |
| `tests/logic.test.js` | crear | Fija la zona horaria, comprueba con una guarda que se aplicó y prueba cada caso de la spec (R1–R13, B1–B8, W1–W5, M1–M4, U1–U14). | RF12 |
| `app.js` | modificar | Solo interfaz: referencias al DOM, leer y guardar en `localStorage`, leer el reloj (`getTodayKey`), pintar y gestionar el formulario. Los nombres pasan a inglés. | RF2, RF8, RF10, RF11 |
| `index.html` | modificar | Una línea: `<script src="logic.js">` antes de `app.js`. | RF1, RF10 |
| `CLAUDE.md` | modificar | § Verificación: la lógica se prueba con `node --test` y la interfaz con Chrome DevTools. | RF13 |
| `.claude/skills/local-dates/SKILL.md` | modificar | Las funciones de fechas ahora se reutilizan desde `logic.js`. | RF13 |
| `MEMORY.md` | modificar | Estado final y decisiones. | RF13 |

No se tocan `styles.css`, los textos, los IDs ni las clases del HTML. [RF11]

## 2. Funciones puras de `logic.js`

"Clave" = texto `"AAAA-MM-DD"` en hora local. Ninguna función modifica sus argumentos.

| Función | Entrada → salida | ¿Recibe `today`? | RF |
|---|---|---|---|
| `toDateKey(date)` | `Date` → clave | no (convierte) | RF7 |
| `parseDateKey(key)` | clave → `Date` local de ese día | no | RF7 |
| `addDays(key, days)` | clave, entero → clave | no | RF7 |
| `isNextDay(key, nextKey)` | dos claves → booleano | no | RF7 |
| `getWeekStart(today)` | clave → clave del lunes | **sí** | RF5, RF7 |
| `getMonthStart(today)` | clave → clave del día 1 | **sí** | RF6, RF7 |
| `getStudyDays(sessions)` | sesiones → `Set` de claves | no | RF3, RF4, RF6 |
| `getStreak(sessions, today)` | → entero ≥ 0 | **sí** | RF3 |
| `getBestStreak(sessions, today)` | → entero ≥ 0 | **sí** (revisión 3, ver D5) | RF4 |
| `getWeekMinutes(sessions, today)` | → entero ≥ 0 | **sí** | RF5 |
| `getMonthStudyDays(sessions, today)` | → entero ≥ 0 | **sí** | RF6 |
| `migrateSession(session)` | sesión antigua o nueva → `{ date, topic, minutes }` | no | RF8 |
| `sortSessionsForList(sessions)` | → array nuevo ordenado | no | RF9 |

`getTodayKey()` **no** está aquí: lee el reloj, así que vive en `app.js`. [RF2]

## 3. Algoritmos (pseudocódigo)

### 3.1 Utilidades de fecha [RF7]

```
toDateKey(date):
    devolver año(date) + "-" + rellenar2(mes(date) + 1) + "-" + rellenar2(día(date))
    // métodos locales (getFullYear/getMonth/getDate), nunca toISOString

parseDateKey(key):
    (a, m, d) ← partir key por "-" y convertir a números
    devolver new Date(a, m - 1, d)          // constructor local, nunca new Date(key)

addDays(key, n):
    fecha ← parseDateKey(key)
    devolver toDateKey(new Date(año(fecha), mes(fecha), día(fecha) + n))
    // el calendario lo ajusta el motor; si el día empieza a la 01:00 (Santiago),
    // la hora cambia pero el día no. Nunca se suman milisegundos.

isNextDay(key, nextKey):
    devolver addDays(key, 1) == nextKey

getWeekStart(today):
    diasDesdeLunes ← (díaSemana(parseDateKey(today)) + 6) mod 7   // 0 = lunes
    devolver addDays(today, -diasDesdeLunes)

getMonthStart(today):
    devolver primeros 8 caracteres de today + "01"   // "AAAA-MM-" + "01"
```

### 3.2 Racha actual [RF3]

```
getStreak(sessions, today):
    dias ← getStudyDays(sessions)             // sin repetidos
    si today ∈ dias:                   inicio ← today
    si no, si addDays(today, -1) ∈ dias: inicio ← addDays(today, -1)
    si no:                             devolver 0
    racha ← 0; dia ← inicio
    mientras dia ∈ dias:
        racha ← racha + 1
        dia ← addDays(dia, -1)
    devolver racha
```

Como se cuenta hacia atrás desde hoy o desde ayer, las fechas futuras nunca entran.

### 3.3 Mejor racha [RF4]

```
getBestStreak(sessions, today):
    dias ← getStudyDays(sessions) con dia ≤ today, ordenados de menor a mayor
    mejor ← 0; enCurso ← 0; anterior ← nada
    para cada dia en dias:
        si anterior existe y isNextDay(anterior, dia): enCurso ← enCurso + 1
        si no:                                        enCurso ← 1
        mejor ← máximo(mejor, enCurso)
        anterior ← dia
    devolver mejor
```

Ordenar claves `"AAAA-MM-DD"` como texto equivale a ordenarlas por fecha, porque llevan
ceros. Por lo mismo, `dia <= today` compara bien como texto: es la misma comparación que
ya usan `getWeekMinutes` y `getMonthStudyDays` para dejar fuera las fechas futuras
(revisión 3).

### 3.4 Minutos de la semana [RF5]

```
getWeekMinutes(sessions, today):
    desde ← getWeekStart(today)
    total ← 0
    para cada s en sessions:
        si desde ≤ s.date ≤ today: total ← total + s.minutes   // todas las del día suman
    devolver total
```

### 3.5 Días estudiados del mes [RF6]

```
getMonthStudyDays(sessions, today):
    desde ← getMonthStart(today)
    devolver cuántas claves de getStudyDays(sessions) cumplen desde ≤ clave ≤ today
```

### 3.6 Migración y orden de la lista [RF8, RF9]

```
migrateSession(s):
    devolver { date: s.date ?? s.fecha, topic: s.topic ?? s.tema, minutes: s.minutes ?? s.minutos }

sortSessionsForList(sessions):
    copia ← sessions invertido (copia nueva)          // la añadida más tarde, primero
    ordenar copia por date descendente, con un sort ESTABLE
    // los empates del mismo día conservan el orden invertido
    devolver copia
```

## 4. Cómo se pinta en la interfaz [RF2, RF10, RF11]

El flujo es el mismo que ahora; solo cambia de dónde salen los números.

```
al cargar la página:
    dateInput.value ← getTodayKey()
    escuchar "submit" del formulario → handleFormSubmit
    renderScreen()

renderScreen():
    sessions ← loadSessions()          // localStorage → JSON.parse → migrateSession a cada una
    today    ← getTodayKey()           // se recalcula en CADA repintado
    renderStreak(sessions, today)      // número = getStreak; texto "día"/"días de racha"
    renderBestStreak(sessions, today)  // número = getBestStreak (revisión 3: recibe today)
    renderWeekMinutes(sessions, today) // número = getWeekMinutes
    renderMonthStudyDays(sessions, today)
    renderList(sessions)               // usa sortSessionsForList; vacío → mensaje vacío

handleFormSubmit(evento):
    evitar el envío; leer fecha, tema (sin espacios a los lados) y minutos
    si falta algo o minutos ≤ 0: salir                   // igual que ahora
    sessions ← loadSessions(); añadir { date, topic, minutes }; saveSessions(sessions)
    reiniciar el formulario; dateInput.value ← getTodayKey()
    renderScreen()
```

Las funciones `render*` solo asignan `textContent` y crean los `<li>`, con el mismo HTML
y las mismas clases que hoy. `escapeHTML` y `formatDateForDisplay` (que usa
`toLocaleDateString("es-ES")`) se quedan en `app.js` porque dependen del navegador.

## 5. Decisiones técnicas

| # | Decisión | Por qué | Alternativa descartada |
|---|---|---|---|
| D1 | Script clásico y, al final, `if (typeof module !== "undefined") module.exports = …` | Lo mismo funciona con `file://` en el navegador y con `require` en Node, sin build. [RF1] | **Módulos ES** (`type="module"` / `import`): el navegador los bloquea con `file://` (CORS), y está prohibido en `CLAUDE.md`. **Copiar la lógica** en los tests: probarían una copia y no el código real. |
| D2 | "Hoy" como clave `"AAAA-MM-DD"` | Mismo formato que las sesiones, comparaciones de texto directas y tests legibles. Además impide un `new Date("…")` en UTC. [RF2] | **`Date`:** obliga a convertir en cada comparación y facilita mezclar horas y zonas. |
| D3 | Cuentas de calendario con `new Date(a, m, d ± n)` | El motor resuelve fin de mes, bisiestos y cambios de hora. [RF7] | **Sumar 86 400 000 ms:** falla los días de 23 o 25 h. **Calcular el calendario a mano:** más código y más bugs. |
| D4 | `getMonthStart` cortando el texto | `"AAAA-MM-01"` siempre es válido, así que no hace falta pasar por `Date`. [RF6] | Pasar por `Date` y volver: funciona, pero añade una conversión sin motivo. |
| D5 | `getBestStreak(sessions, today)` descarta los días posteriores a `today` antes de buscar el tramo (revisión 3; antes no recibía `today`) | RF4 revisión 3: la misma regla de fechas futuras que la racha actual, la semana y el mes. Filtrar antes de ordenar deja el bucle igual. | **Seguir sin `today`** (revisión 2): una sesión futura inflaba la mejor racha. **Filtrar dentro del bucle** (`break` al pasar de hoy): funciona por estar ordenado, pero es menos evidente para quien empieza. |
| D6 | Todas las funciones de `logic.js` exportadas | Las auxiliares (`addDays`, `isNextDay`…) son justo donde suelen estar los bugs de fechas, así que se prueban directamente. [RF12] | **Exportar solo las públicas:** un fallo en `addDays` se vería solo de forma indirecta y costaría encontrarlo. |
| D7 | Zona horaria fijada con `process.env.TZ` dentro del test | Es lo que funciona en Windows (verificado). Santiago es el peor caso, porque cambia la hora a medianoche. [RF12] | **`TZ=… node --test`:** en Windows no tiene efecto, y los tests pasarían sin probar nada. |
| D8 | Un único archivo de tests, cambiando a Madrid dentro de los tests [Madrid] y restaurando después | Un solo archivo nuevo (`CLAUDE.md` pide preguntar antes de crear archivos) y todo junto para leerlo. | **Un archivo por zona:** más archivos para 4 tests. |
| D9 | Mantener los nombres actuales en `app.js` solo hasta el paso de traducción, que se hace en una sola edición junto con el borrado de duplicados | Evita que convivan dos declaraciones de una misma función, que darían `SyntaxError` en el ámbito global compartido. [RF10] | **Traducir poco a poco:** hay estados intermedios en los que la página no carga. |

## 6. Estrategia de tests con `node --test` [RF12]

**Estructura de `tests/logic.test.js`:**

1. Primera línea: `process.env.TZ = "America/Santiago"`, antes de crear cualquier `Date`.
2. `require("node:test")`, `require("node:assert")` y `require("../logic.js")`.
3. **Guarda:** un test que comprueba `new Date(2026, 8, 6).getHours() === 1`. Si falla, la
zona no se aplicó y los tests de cambio de hora no significarían nada.
4. Un `describe` por función: `getStreak` (R1–R13), `getBestStreak` (B1–B14; revisión 3:
todos con `today`),
`getWeekMinutes` (W1–W5), `getMonthStudyDays` (M1–M4), utilidades y datos (U1–U14).
Cada `test` lleva el ID de la spec en su nombre, en español. Ejemplo: "R4: sin sesión hoy
pero sí ayer, la racha sigue viva".
5. Los casos [Madrid] (R13, B7, U4) cambian `process.env.TZ` al empezar y lo restauran
en un `finally`, para no contaminar los demás tests.
6. Una función `s(date, minutes = 30)` para construir sesiones y que los casos se lean
como las tablas de la spec.
7. Se compara con `assert.strictEqual`, y con `assert.deepStrictEqual` para objetos y
arrays. En U14 también se comprueba que el array original no cambió.

**Orden (puerta de tests):**

1. Tests escritos y `logic.js` con funciones vacías que solo exporta → `node --test`
**en rojo** (demuestra que los tests detectan fallos).
2. Implementar `logic.js` → **en verde**. Si algo falla, no se avanza.
3. Tocar `app.js` e `index.html` → `node --test` otra vez en verde. Después se verifica
la interfaz con Chrome DevTools (criterios 2–6 de la spec), porque los tests no cubren el
DOM.

**Lo que los tests no cubren** (y cómo se cubre): pintar, `localStorage` y
`formatDateForDisplay` → verificación manual con Chrome DevTools y comparación con la
referencia guardada antes del cambio. [RF8, RF11]

## 7. Cobertura de los RF

| RF | Dónde se cubre en el plan | Cómo se comprueba |
|---|---|---|
| RF1 | §1 `logic.js`, D1 | criterio 7 (búsqueda en el archivo); los tests lo importan |
| RF2 | §2, §4, D2 | lectura del código: `getTodayKey` es el único sitio que lee el reloj; criterio 4 |
| RF3 | §3.2 | R1–R13 |
| RF4 | §3.3, D5 | B1–B8 |
| RF5 | §3.4 | W1–W5, U9 |
| RF6 | §3.5, D4 | M1–M4, U10 |
| RF7 | §3.1, D3 | U1–U10, guarda de zona horaria |
| RF8 | §3.6, §4 | U12, U13; criterio 6 en el navegador |
| RF9 | §3.6 | U14 |
| RF10 | §1, §4, D9 | criterio 8; consola sin errores |
| RF11 | §4 | criterios 2–5 (referencia antes y después, escritorio y móvil) |
| RF12 | §6, D6–D8 | `node --test`: rojo → verde |
| RF13 | §1 | revisión de los tres archivos al terminar |
