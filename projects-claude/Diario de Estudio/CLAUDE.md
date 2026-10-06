# CLAUDE.md — Diario de Estudio
Web estática para registrar sesiones de estudio y motivarse viendo la racha de días
seguidos. Proyecto didáctico: el código debe poder entenderlo alguien que empieza a
programar.
## Stack y estructura
- HTML, CSS y JavaScript puros: sin frameworks, librerías, npm, bundler ni build.
- `index.html` (estructura), `styles.css` (estilos), `app.js` (lógica y datos).
- Debe funcionar abriendo `index.html` con doble clic (`file://`): nada de módulos ES
(`type="module"`), `fetch` a archivos locales ni nada que requiera servidor.
## Convenciones
- Textos de la interfaz en español.
- Código simple, nombres descriptivos y comentarios solo donde aporten.
- Diseño limpio y responsive; cualquier pantalla nueva debe verse bien en el móvil.
## Identidad visual
- Concepto: "ficha de biblioteca" — papel kraft, ficha de tarjeta, sello de tinta roja.
Nada de tarjetas blancas con sombra gris ni acento naranja genérico.
- Colores (variables en `:root` de `styles.css`): `--papel`, `--ficha`, `--tinta`,
`--tinta-suave`, `--sello`, `--sello-oscuro`, `--sello-suave`, `--linea`. Usa estas
variables en vez de hex sueltos en nuevas reglas.
- Tipografía: `--serif` (Georgia) para títulos/encabezados, `--mono` (Courier New) para
números grandes de estadísticas, `--sans` (sistema) para cuerpo y formulario. Sin fuentes
externas (Google Fonts, etc.): todo de sistema.
- El rojo-sello (`--sello`) se usa con moderación: la racha actual (el número
protagonista), botones y acentos puntuales. Las demás estadísticas van en `--tinta`.
- `.tarjeta` usa borde fino + regla superior roja, nunca `box-shadow` ni esquinas muy
redondeadas (radio pequeño, 3px).
## Datos
- localStorage, clave `diario-estudio-sesiones`: array de `{ date: "AAAA-MM-DD", topic,
minutes }`.
- Si cambias la forma de los datos, mantén compatibilidad con lo ya guardado o el usuario
perderá sus sesiones.
## Fechas y racha (fácil equivocarse)
- Trabaja siempre con la fecha local del usuario. Nunca uses `toISOString()` ni `new
Date("AAAA-MM-DD")`: se interpretan en UTC y desplazan el día.
- Racha = días consecutivos con al menos 1 sesión que terminan hoy. Si hoy no hay sesión
pero ayer sí, la racha sigue viva y se cuenta desde ayer.
- Varias sesiones el mismo día cuentan como un solo día. Las fechas futuras no suman.
- Semana = lunes a domingo (local), no una ventana móvil de 7 días. El total de minutos de
la semana suma de "lunes de esta semana" a "hoy" (fechas futuras no suman, igual que en la
racha). A diferencia de la racha, aquí SÍ suman todas las sesiones de un mismo día, no solo
cuenta si hubo estudio ese día.
- Mes = del día 1 del mes actual (local) a hoy. Los días estudiados este mes cuentan días
únicos con sesión (como la racha, no como los minutos de la semana), y las fechas futuras
tampoco suman aquí.
## Forma de trabajar
- Haz solo lo que se pide: no añadas funcionalidades por tu cuenta.
- Cambios pequeños y enfocados; no reescribas lo que ya funciona.
- Al terminar, resume qué has cambiado y cualquier decisión que deba revisar.
## Límites
- ✅ Siempre: respetar las reglas de fechas y racha, mantener los textos en español.
- ✅ Siempre: actualizar `MEMORY.md` al terminar cada tarea.
- ⚠️ Pregunta antes: crear archivos nuevos, cambiar el formato de los datos guardados.
- 🚫 Nunca: añadir dependencias, frameworks o un paso de build.
## Verificación
- No hay tests ni lint. Probar abriendo `index.html` en el navegador.
- Para empezar de cero: DevTools → Application → Local Storage → borrar la clave
`diario-estudio-sesiones`.

## Memoria
- Al empezar, lee `MEMORY.md` para conocer el estado del proyecto y las decisiones
tomadas.
- Al terminar una tarea, actualízalo: estado actual, decisiones importantes (con su
porqué) y errores a evitar.
- Mantenlo breve (máximo ~50 líneas): resume o elimina lo que ya no aporte.
- Si algo se convierte en una regla permanente, propón moverlo a `CLAUDE.md` en lugar de
dejarlo en la memoria.
- No guardes nunca datos sensibles (claves, tokens, datos personales). 
