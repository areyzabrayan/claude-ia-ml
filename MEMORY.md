# MEMORY.md — Diario de Estudio
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no
aporte.
## Estado actual
- v1: sesiones (fecha, tema, minutos), racha actual, mejor racha, minutos de esta semana,
días estudiados este mes y lista. Datos en localStorage. Trabajo guiado por specs
(`docs/constitution.md` + `specs/NNN-*/`: spec, plan, tasks).
- Spec 001 (lógica pura en `logic.js`, interfaz en `app.js`, tests con `node --test`)
completada y publicada (commit 83422ce, 2026-10-16).
- Spec 002 (objetivo semanal) **validada** (2026-10-21, todos los RF/RNF y criterios OK)
y publicada en main. `logic.js`:
`MIN/MAX_WEEKLY_GOAL`, `parseWeeklyGoal(text)`, `getGoalProgress(weekMinutes, goal)`;
tarjeta "Objetivo semanal" tras "minutos esta semana". 92 tests en verde.
- Clave nueva `diario-estudio-objetivo-semanal`: texto plano con solo dígitos (`300`, no
JSON). Un valor dañado se ignora (sin objetivo), no se borra ni se corrige.
- Agentes SDD en `.claude/agents/` (coordinator → planner, implementer, reviewer); el
coordinator es el principal (`claude --agent coordinator`). Las restricciones de rutas y
comandos van como instrucción (la cabecera no las impone). `.claude/settings.json` permite
sin preguntar `node --test`, `git diff` y `git status`.
## Decisiones (y por qué)
- Sin backend ni dependencias: cualquiera debe poder abrirlo con doble clic.
- Mejor racha calculada siempre desde las sesiones (sin "high score" guardado).
- Sesiones `{ date, topic, minutes }`; el formato antiguo `{ fecha, tema, minutos, creada }`
se migra al cargar (`migrateSession`).
- `logic.js` es script clásico con `module.exports` condicional: funciona con `file://` y
con `require`. "Hoy" se pasa como "AAAA-MM-DD" (`getTodayKey` en `app.js`).
- Cada estadística en su propia tarjeta para no apretar el móvil.
- Progreso: `Math.floor(usable * 100 / goal)` (multiplicar antes de dividir; con
`/ goal * 100`, 57/100 da 56) (D2).
- `renderScreen` calcula `weekMinutes` una vez y lo pasa a las dos tarjetas: "Llevas X" y
"minutos esta semana" coinciden por construcción (D5).
- `saveWeeklyGoal` sin try/catch, igual que `saveSessions`: si `setItem` falla, nada cambia
(D10; la spec descarta un tratamiento especial).
## Pendiente (para otras specs; decidir con el usuario)
- La mejor racha cuenta fechas futuras (heredado, se mantuvo a propósito).
- Un JSON corrupto en localStorage rompe la página. No devolver `[]`: el siguiente
guardado borraría los datos.
- Ajustar el principio 3 de la constitución a "reciben hoy las funciones que dependen de él".
## Errores a evitar
- Al cambiar la forma de los datos guardados, migrar con fallback (`??`), nunca descartar.
- En Windows, `TZ=... node` NO cambia la zona: fijar `process.env.TZ` dentro del proceso.
`America/Santiago` es la zona de peor caso.
- `logic.js` y `app.js` comparten ámbito global: no repetir nombres.
- Ocultar con `hidden` exige no poner `display` en el CSS de ese elemento.
- `.objetivo-barra-relleno` necesita `width: 0` en CSS (si no, se ve roja al cargar).
- El Chrome del MCP usa perfil propio (localStorage vacío) y a veces se cuelga con capturas
completas en móvil: `select_page` y capturar solo el viewport. Para validar sin tocar datos
reales: `new_page` con `isolatedContext`.
- En la spec 002 el coordinator usó un worktree y no validó; desde el 2026-10-21
`coordinator.md` exige trabajar en main sin worktrees y no cerrar sin @reviewer.
