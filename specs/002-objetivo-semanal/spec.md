# Spec 002 — Objetivo semanal de estudio

Estado: **validada** (2026-10-21: todos los RF, RNF y criterios de finalización
cumplidos; implementada el 2026-10-19). Aprobada el
2026-10-19 (aprobación transmitida por el coordinador: "Apruebo la spec tal cual",
incluidas DR1–DR17)

## Contexto y objetivo

El diario ya muestra los minutos estudiados esta semana, pero no hay ninguna meta con la
que compararlos. El usuario pide:

> "Quiero añadir un objetivo semanal de estudio: poder fijar cuántos minutos quiero
> estudiar cada semana y ver cuánto llevo, para motivarme a cumplirlo."

**Objetivo:** que el usuario pueda fijar un objetivo de minutos por semana y vea en todo
momento cuánto lleva respecto a ese objetivo ("llevo X de Y min"), para motivarse a
cumplirlo. Las sesiones guardadas y el resto de estadísticas no cambian.

## Usuarios

Una sola persona que usa el diario en su navegador (escritorio o móvil) para registrar
sus sesiones de estudio. No hay cuentas ni varios usuarios.

## Historias de usuario

- HU-1. Como estudiante, quiero fijar cuántos minutos quiero estudiar cada semana para
tener una meta concreta.
- HU-2. Como estudiante, quiero ver cuántos minutos llevo esta semana respecto a mi
objetivo (y cuántos me faltan) para saber si voy bien.
- HU-3. Como estudiante, quiero cambiar mi objetivo cuando lo necesite para ajustarlo a
mi ritmo real.
- HU-4. Como estudiante, quiero que el objetivo se recuerde al volver a abrir la página
para no tener que fijarlo cada vez.

## Definiciones

- **Semana:** de lunes a domingo, en la fecha local del usuario (la misma definición que
ya usa "minutos esta semana").
- **Minutos llevados (X):** exactamente el número que ya se muestra como "minutos esta
semana" para el "hoy" del repintado: suma de los minutos de **todas** las sesiones con
fecha entre el lunes de esta semana y hoy, ambos incluidos. Varias sesiones del mismo día
suman todas; las fechas futuras no suman. Este cálculo **no cambia** con esta spec.
- **Texto de objetivo válido:** un texto que, tras quitar los espacios en blanco del
principio y del final, está formado **solo por dígitos 0–9** (al menos uno) y cuyo valor
está entre **1 y 10080** (los minutos de una semana), ambos incluidos. Los ceros a la
izquierda se permiten (`0300` vale 300). Cualquier otro texto es no válido: vacío o solo
espacios, signos (`+300`, `-5`), decimales con punto o coma (`300.0`, `300,0`), notación
científica (`3e2`), hexadecimal (`0x12C`), espacios en medio (`3 00`), letras, o un valor
fuera de rango (`0`, `00`, `10081`).
- **Objetivo (Y):** el valor entero de un texto de objetivo válido. Es uno solo y vale
para todas las semanas hasta que el usuario lo cambie.
- **X utilizable:** X cuando es un número finito; en cualquier otro caso (p. ej. un texto
por datos heredados o editados a mano) los derivados se calculan como si X fuera 0.
- **Faltan (Z):** `Y − X utilizable` si es mayor que 0; 0 en caso contrario (nunca
negativo).
- **Objetivo cumplido:** X utilizable ≥ Y.
- **Porcentaje de progreso:** `X utilizable / Y × 100`, redondeado **hacia abajo** a
entero y limitado al rango 0–100. Se redondea hacia abajo para que nunca se vea "100 %"
sin haber cumplido el objetivo.

## Requisitos funcionales

- **RF1 — Fijar el objetivo:** CUANDO el usuario escribe un texto de objetivo válido en el
campo "Minutos por semana" y confirma (botón "Guardar objetivo" o tecla Enter en el
campo), EL SISTEMA guarda Y como objetivo semanal y repinta toda la pantalla (RF14).
- **RF2 — Cambiar el objetivo:** CUANDO ya hay un objetivo y el usuario confirma un texto
de objetivo válido nuevo, EL SISTEMA sustituye el anterior por el nuevo y repinta toda la
pantalla con el nuevo valor.
- **RF3 — Validación de la entrada:** SI el usuario confirma un texto que no es un texto
de objetivo válido, ENTONCES EL SISTEMA no guarda nada, conserva el objetivo anterior (si
lo había), deja el texto escrito en el campo y muestra debajo del campo el mensaje
exacto "Escribe un número entero de minutos entre 1 y 10080." El navegador no bloquea la
confirmación ni muestra avisos propios: la única validación es la de esta spec.
- **RF4 — Mensaje de error:** MIENTRAS se muestra el mensaje de RF3, EL SISTEMA lo
mantiene hasta que el usuario confirma un texto válido; entonces lo oculta. Guardar bien
no muestra ningún mensaje adicional: la confirmación es el progreso actualizado.
- **RF5 — Persistencia:** EL SISTEMA guarda el objetivo en el almacenamiento del
navegador bajo la clave nueva `diario-estudio-objetivo-semanal`, como texto plano con
los dígitos de Y sin ceros a la izquierda ni espacios (p. ej. `300`, no JSON ni `0300`).
Al reabrir la página (también con `file://`) se muestra el mismo objetivo y su progreso.
- **RF6 — Datos de sesiones intactos:** EL SISTEMA no lee de otra forma, no reescribe ni
cambia la clave `diario-estudio-sesiones` ni la forma de sus datos al cargar la página,
fijar o cambiar el objetivo. Un usuario con sesiones previas y sin objetivo ve todas sus
sesiones y las estadísticas existentes igual que antes.
- **RF7 — Tarjeta propia y campo siempre visible:** EL SISTEMA muestra el objetivo en una
tarjeta propia titulada "Objetivo semanal", situada justo después de la tarjeta de
"minutos esta semana" (que no cambia, incluido su número grande). La tarjeta contiene
siempre el campo "Minutos por semana" y el botón "Guardar objetivo", haya objetivo o no.
- **RF8 — Contenido del campo:** CUANDO la página carga o se guarda un objetivo válido, EL
SISTEMA rellena el campo con Y (sin ceros a la izquierda); si no hay objetivo o el
guardado no es válido, el campo queda vacío (nunca muestra el valor dañado). Los demás
repintados (p. ej. al guardar una sesión) no cambian lo que haya escrito en el campo.
- **RF9 — Progreso visible:** MIENTRAS haya un objetivo válido, EL SISTEMA muestra el
texto "Llevas X de Y min esta semana", una barra de progreso proporcional al porcentaje
de progreso y, mientras no esté cumplido, "Te faltan Z min" (o "Te falta 1 min" si Z es
exactamente 1). "min" es una abreviatura invariable.
- **RF10 — Objetivo cumplido:** MIENTRAS el objetivo esté cumplido, EL SISTEMA muestra la
barra llena (100 %), sigue mostrando el valor real de X (aunque supere a Y) y sustituye
"Te faltan Z min" por "¡Objetivo cumplido!".
- **RF11 — Sin objetivo:** MIENTRAS no haya un objetivo válido (no hay clave, está vacía o
su valor no es un texto de objetivo válido), EL SISTEMA no muestra barra, ni "Llevas X de
Y", ni "Te faltan", y muestra el texto "Aún no tienes objetivo semanal" junto al campo
vacío.
- **RF12 — Mismos minutos que la estadística semanal:** EL SISTEMA muestra en "Llevas X"
exactamente el mismo valor que en "minutos esta semana" en el mismo repintado, obtenido
del cálculo semanal existente, sin duplicarlo ni modificarlo.
- **RF13 — Lógica pura comprobable:** EL SISTEMA realiza como lógica pura, sin página ni
almacenamiento y comprobable con tests automáticos: (a) la interpretación de un texto
como objetivo (devuelve Y o "sin objetivo"), usada **tanto** para lo que escribe el
usuario **como** para el valor leído del almacenamiento; y (b) el cálculo de porcentaje,
Z y cumplido, que recibe **solo X e Y** (no "hoy": X ya depende de "hoy" a través del
cálculo semanal, que recibe las sesiones y "hoy").
- **RF14 — Repintado completo:** CUANDO se guarda un objetivo válido o una sesión, EL
SISTEMA repinta toda la pantalla, recalculando "hoy" y X, de modo que "Llevas X" y
"minutos esta semana" coinciden siempre (RF12).
- **RF15 — Cambio de semana:** CUANDO empieza una semana nueva (lunes, hora local), EL
SISTEMA calcula el progreso en el siguiente repintado solo con las sesiones de la semana
nueva y mantiene el mismo Y. No hay temporizador.
- **RF16 — Y no válida en la lógica:** SI el cálculo de progreso recibe un Y que no es un
entero entre 1 y 10080 (0, vacío, texto, ausente), ENTONCES devuelve "sin objetivo" sin
dividir (nunca división por cero) y la pantalla se comporta como en RF11.
- **RF17 — X anómalo:** SI X no es un número entero no negativo (decimal, negativo o
texto por datos heredados o editados a mano), ENTONCES EL SISTEMA muestra en "Llevas X"
lo mismo que "minutos esta semana" y calcula los derivados con X utilizable: porcentaje
limitado a 0–100, Z nunca negativa, sin errores en la consola.
- **RF18 — Valor guardado no válido:** SI el valor guardado del objetivo no es un texto de
objetivo válido, ENTONCES EL SISTEMA se comporta como en RF11, no muestra errores en la
consola, no lo borra ni lo corrige por su cuenta (solo se sobrescribe cuando el usuario
guarda uno válido) y no afecta a las sesiones ni a las demás estadísticas.
- **RF19 — Fallo al guardar:** SI el navegador no permite guardar el objetivo, ENTONCES
EL SISTEMA lo trata igual que hoy el guardado de sesiones (sin aviso especial): el
objetivo no cambia y la pantalla sigue mostrando el anterior.

## Requisitos no funcionales

- **RNF1 — Sin dependencias:** funciona abriendo la página con doble clic, sin
servidor, sin instalar nada y sin conexión.
- **RNF2 — Idioma:** todos los textos nuevos de la interfaz en español, con los textos
exactos de esta spec.
- **RNF3 — Identidad visual:** coherente con la "ficha de biblioteca", usando solo las
variables de color existentes: la tarjeta nueva es como las demás (borde fino, regla
superior roja, sin sombra, radio 3 px). Rojo-sello solo en la parte rellena de la barra
y en el botón. Los textos "Llevas…", "Te faltan…" y "¡Objetivo cumplido!" van en color
tinta. La parte vacía de la barra va en color papel con borde fino de color línea; al
0 % solo se ve esa parte vacía con su borde (sin franja roja).
- **RNF4 — Móvil:** con un ancho de 375 px toda la tarjeta del objetivo (textos, barra,
campo, botón y mensaje de error) se ve completa, sin desbordamiento horizontal ni texto
cortado; en móvil el campo muestra el teclado numérico.
- **RNF5 — Accesibilidad básica:** el campo tiene la etiqueta visible "Minutos por
semana". La barra se anuncia a los lectores de pantalla como barra de progreso con el
nombre "Progreso del objetivo semanal" y su porcentaje (0–100).
- **RNF6 — Fechas locales:** ningún cálculo usa conversiones a UTC; la semana se
determina con la fecha local, también en semanas con cambio de hora y que cruzan el año.

## Casos límite

| # | Situación | Resultado esperado |
|---|---|---|
| L1 | Sin objetivo, con o sin sesiones | RF11: "Aún no tienes objetivo semanal", sin barra, campo vacío. |
| L2 | Y = 300, X = 0 (lunes, sin sesiones) | "Llevas 0 de 300 min esta semana", barra 0 % (solo parte vacía), "Te faltan 300 min". |
| L3 | Y = 300, X = 150 | 50 %, "Te faltan 150 min". |
| L4 | Y = 300, X = 299 | 99 % (no 100), "Te falta 1 min". |
| L5 | Y = 300, X = 300 | 100 %, "¡Objetivo cumplido!". |
| L6 | Y = 300, X = 450 | "Llevas 450 de 300 min esta semana", barra 100 % (no desborda), "¡Objetivo cumplido!". |
| L7 | Y = 7, X = 2 | 28 % (2/7 = 28,57 → 28). |
| L8 | Sesión futura (mañana) de 100 min | No suma a X. |
| L9 | Sesión del domingo pasado | No suma a X de esta semana. |
| L10 | Hoy es domingo | X suma de lunes a domingo. |
| L11 | Semana que cruza el año (lunes 28-dic a domingo 3-ene) | X suma las sesiones de ambos años dentro de esa semana. |
| L12 | Varias sesiones el mismo día | Suman todas a X. |
| L13 | Entrada: `""`, `"   "`, `0`, `00`, `-5`, `+300`, `abc`, `90.5`, `300.0`, `300,0`, `3e2`, `0x12C`, `3 00`, `10081` | RF3: rechazado con el mensaje exacto; el objetivo anterior y lo guardado no cambian; el texto queda en el campo. |
| L14 | Entrada: `1` y `10080` | Aceptados (límites incluidos). |
| L15 | Entrada: `" 0300 "` y `0001` | Aceptados como 300 y 1; se guarda `300` / `1` y el campo muestra `300` / `1`. |
| L16 | Valor guardado: `abc`, `0`, `-3`, `""`, `300.0`, `"300"` con comillas (JSON) | RF18: como si no hubiera objetivo; campo vacío; sin errores en consola; no se borra. |
| L17 | Valor guardado: `" 0300 "` (editado a mano) | Mismas reglas que la entrada: Y = 300; no se reescribe. |
| L18 | Sin clave guardada | RF11. |
| L19 | Página abierta del domingo al lunes sin recargar | Al siguiente repintado X ya es el de la semana nueva. |
| L20 | Sesiones en formato antiguo | Cuentan en X igual que en "minutos esta semana". |
| L21 | X decimal (Y = 300, X = 150.5) | "Llevas" muestra lo mismo que "minutos esta semana"; 50 %; Z = 149.5. |
| L22 | X negativo (Y = 300, X = −10) | Porcentaje 0; Z = 310; no cumplido. |
| L23 | X texto por concatenación (p. ej. `"030"`) | "Llevas" muestra lo mismo que "minutos esta semana"; derivados con X = 0: 0 %, Z = Y, no cumplido; sin errores. |
| L24 | Lógica con Y = 0, vacío, texto o ausente | "Sin objetivo", sin división por cero. |
| L25 | El usuario escribe en el campo del objetivo y, sin confirmarlo, guarda una sesión | El texto escrito sigue en el campo (RF8). |
| L26 | El navegador no permite guardar | RF19: el objetivo anterior sigue vigente y visible. |

## Fuera de alcance

- Notificaciones, avisos, sonidos o recordatorios.
- Histórico de semanas anteriores, objetivos cumplidos en el pasado o "racha de semanas".
- Objetivos distintos por semana, por día, por tema o por mes.
- Quitar/borrar el objetivo una vez fijado (solo se puede cambiar).
- Mostrar el porcentaje como texto visible o el exceso por encima de Y por separado.
- Cambiar el formato o la clave de las sesiones guardadas, o el cálculo de "minutos esta
semana" (incluido cómo trata datos anómalos).
- Arreglar los comportamientos pendientes de la spec 001 (mejor racha con fechas
futuras, JSON de sesiones corrupto) o tratar los fallos de guardado de forma especial.
- Cambios en las demás estadísticas, el formulario de sesiones o la lista.

## Criterios de finalización

1. `node --test` (sin instalar nada) pasa en verde e incluye tests de la lógica pura de
RF13: interpretación de textos (L13–L17, L18 como texto ausente) y cálculo de progreso
(L2–L7, L21–L24). Los tests existentes siguen en verde.
2. Con la página abierta con doble clic y datos de prueba, "Llevas X" coincide siempre
con "minutos esta semana" (RF12, RF14), incluidos L8–L12 y tras fijar el objetivo.
3. Fijar (con botón y con Enter), cambiar y recargar la página conserva el objetivo; la
clave `diario-estudio-objetivo-semanal` contiene solo los dígitos de Y (RF1, RF2, RF5,
RF8).
4. En el navegador, una muestra de L13 (`abc`, `0`, `3e2`, vacío) se rechaza con el
mensaje exacto, sin avisos propios del navegador, y el objetivo no cambia; al guardar uno
válido el mensaje desaparece (RF3, RF4). El resto de L13/L15 se cubre en el criterio 1.
5. El valor de `diario-estudio-sesiones` es idéntico byte a byte en estos momentos,
comparado con el valor previo a abrir la versión nueva: (a) tras cargar la página, (b)
tras fijar un objetivo, (c) tras cambiarlo, (d) tras un intento rechazado, (e) tras
recargar con objetivo, y (f) tras cargar con un valor de objetivo dañado (RF6). Un
usuario sin objetivo ve las mismas estadísticas que antes.
6. Con un valor guardado dañado (L16) la página carga sin errores en consola y el campo
está vacío (RF18).
7. La vista móvil (375 px) y la de escritorio se ven bien y respetan la identidad visual
(RNF3, RNF4); la barra expone nombre y porcentaje (RNF5). La consola no muestra errores
ni avisos nuevos.

## Decisiones a revisar

Propuestas tomadas con el criterio más simple y conservador. **No están confirmadas:** el
usuario debe aceptarlas o cambiarlas al aprobar la spec.

- **DR1 — Sin objetivo fijado:** no hay objetivo por defecto ni barra; solo "Aún no tienes
objetivo semanal" y el campo vacío.
- **DR2 — Qué es válido:** solo dígitos 0–9 tras quitar espacios de los extremos, rango
1–10080; se rechazan signos, decimales, `3e2`, hexadecimal y espacios intermedios; se
aceptan ceros a la izquierda.
- **DR3 — Cambiar sí, quitar no:** no hay forma de quitar el objetivo; confirmar el campo
vacío da el error de RF3.
- **DR4 — Al superarlo:** valor real de X, barra llena y "¡Objetivo cumplido!"; no se
muestra el exceso.
- **DR5 — Porcentaje hacia abajo y no visible como texto:** solo para la barra y su valor
accesible.
- **DR6 — Un único objetivo para todas las semanas**, sin histórico.
- **DR7 — Tarjeta propia** "Objetivo semanal" después de "minutos esta semana" (siguiendo
MEMORY.md: cada estadística en su tarjeta para no apretar el móvil). La tarjeta semanal
no cambia. Sustituye a la propuesta anterior de meterlo dentro de esa tarjeta.
- **DR8 — Valor guardado dañado:** se ignora, no se borra ni se corrige; se lee con las
mismas reglas que la entrada (así `" 0300 "` editado a mano vale 300).
- **DR9 — Lógica pura (RF13):** la interpretación del texto (entrada y valor guardado) y
el cálculo de progreso son lógica pura con tests; el cálculo de progreso recibe solo X e
Y, no "hoy".
- **DR10 — Clave y formato nuevos:** se añade la clave `diario-estudio-objetivo-semanal`
con texto plano de dígitos (`300`). CLAUDE.md pide preguntar antes de cambiar datos
guardados: es una clave nueva que no toca las sesiones, pero requiere el visto bueno.
- **DR11 — Campo de texto con teclado numérico** en lugar de campo numérico del navegador
(distinto del campo "Minutos" de sesiones): así el navegador no bloquea ni muestra
avisos en su idioma, y la validación es solo la de la spec y comprobable.
- **DR12 — Confirmación:** botón "Guardar objetivo" y Enter; sin mensaje de éxito; el
error se mantiene hasta un guardado válido y el texto inválido queda en el campo.
- **DR13 — Contenido del campo:** pre-relleno con Y al cargar y al guardar; vacío sin
objetivo o con valor dañado; los demás repintados no lo tocan.
- **DR14 — X anómalo:** no se cambia el cálculo semanal; "Llevas X" muestra lo mismo que
"minutos esta semana"; los derivados usan X = 0 si X no es un número, porcentaje
limitado a 0–100 y Z nunca negativa (con X negativo, Z puede superar a Y).
- **DR15 — Singular:** "Te falta 1 min" / "Te faltan Z min"; "min" invariable.
- **DR16 — Colores:** mensajes en tinta; relleno de la barra en sello; parte vacía en
papel con borde de línea; sin franja roja al 0 %.
- **DR17 — Fallo al guardar:** sin tratamiento especial, igual que el guardado de
sesiones hoy.

## Notas para el plan (informativas, no son requisitos)

- X debe salir de `getWeekMinutes(sessions, today)` existente, sin modificarlo (RF12).
- DR11 sugiere un campo `type="text"` con `inputmode="numeric"`, en un formulario propio
separado del de sesiones (para que Enter confirme solo el objetivo).

## Dudas abiertas

- No hay dudas que bloqueen la redacción, pero **todas las DR1–DR17 son propuestas
pendientes de confirmación** del usuario en la aprobación de esta spec. Hasta entonces
la spec sigue en borrador y no se puede pasar al plan.
