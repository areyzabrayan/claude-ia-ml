# MEMORY.md — Diario de Estudio
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no
aporte.
## Estado actual
- v1 funcionando: registrar sesiones (fecha, tema, minutos), racha actual, mejor racha,
minutos de esta semana, días estudiados este mes y lista de sesiones. Datos en localStorage.
- Trabajo guiado por specs: `docs/constitution.md` + `specs/NNN-*/` (spec, plan, tasks).
- Spec 001 (`specs/001-logica-pura/`) **completada** (2026-10-16): cálculos en `logic.js`
(funciones puras, "hoy" como parámetro), interfaz en `app.js`, 45 tests en
`tests/logic.test.js` con `node --test`. Identificadores en inglés; comentarios en español.
- Commit 83422ce en main (2026-10-16), ya en GitHub (Pages publica desde main).
- Agentes en `.claude/agents/` (2026-10-19): `coordinator.md` creado (flujo SDD; delega en
planner, implementer y reviewer, ya con su contenido). El coordinator es agente principal:
`claude --agent coordinator`. La cabecera de un agente no limita rutas ni comandos: la
restricción "solo specs/" del planner y "solo node --test / git diff / git status" del
reviewer van como instrucción. `.claude/settings.json` permite sin preguntar `node --test`,
`git diff` y `git status` (para toda la sesión, no solo el reviewer).
El usuario trae los agentes en formato OpenCode; se adaptan a Claude Code (`name`,
`description`, `tools`; `permissions` se traduce a `tools`, `mode` no existe).
## Decisiones (y por qué)
- Sin backend ni dependencias: cualquiera debe poder abrirlo con doble clic.
- Fecha editable en el formulario: permite registrar días pasados.
- Mejor racha calculada siempre a partir de las sesiones (sin "high score" guardado): no se
desincroniza si algún día se pueden editar/borrar sesiones.
- Sesiones `{ date, topic, minutes }`; el formato antiguo `{ fecha, tema, minutos, creada }`
se migra al cargar (`migrateSession`). El orden del mismo día sale de invertir el array
guardado + sort estable.
- Semana = lunes a domingo local; mes = día 1 a hoy. Cada estadística en su propia tarjeta
para no apretar el móvil.
- Identidad "ficha de biblioteca" (kraft, tinta, sello rojo): ver CLAUDE.md § Identidad.
- `logic.js` es un script clásico con `module.exports` condicional al final: el navegador lo
carga con `<script>` (funciona con `file://`) y Node con `require`. Módulos ES descartados
(bloqueados en `file://`).
- "Hoy" se pasa como texto "AAAA-MM-DD" (mismo formato que las sesiones; evita `new Date`
en UTC). `app.js` lo lee del reloj en un solo sitio (`getTodayKey`) en cada repintado.
- Principio 3 interpretado como "reciben hoy las funciones que dependen de él".
## Pendiente (para otras specs; decidir con el usuario)
- La mejor racha cuenta fechas futuras (comportamiento heredado, se mantuvo a propósito).
- Un JSON corrupto en localStorage rompe la página. No "arreglar" devolviendo `[]`: el
siguiente guardado borraría los datos.
- Ajustar el texto del principio 3 de la constitución a la interpretación de arriba.
## Errores a evitar
- Al cambiar la forma de los datos guardados, migrar con un fallback (`??`), nunca
descartar lo viejo.
- En Windows/Git Bash, `TZ=... node` NO cambia la zona: fijar `process.env.TZ` dentro del
proceso. `America/Santiago` (cambio de hora a medianoche) es la zona de peor caso.
- `logic.js` y `app.js` comparten el ámbito global: no declarar dos veces el mismo nombre.
- El MCP de Chrome a veces se cuelga con capturas de página completa en móvil: traer la
pestaña al frente (`select_page`) y capturar solo el viewport.
