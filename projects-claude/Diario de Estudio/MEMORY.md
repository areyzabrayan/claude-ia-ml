# MEMORY.md — Diario de Estudio
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no
aporte.
## Estado actual
- v1 funcionando: registrar sesiones (fecha, tema, minutos), racha actual, mejor racha
histórica, minutos estudiados esta semana y lista de sesiones.
- Datos en localStorage.
## Decisiones (y por qué)
- Sin backend ni dependencias: cualquiera debe poder abrirlo con doble clic.
- Fecha editable en el formulario: permite registrar días pasados y ver la racha crecer.
- Mejor racha calculada siempre a partir de las sesiones (sin guardar un "high score" aparte
en localStorage): evita que se desincronice si algún día se añade editar/borrar sesiones.
- Sesiones guardadas como { date, topic, minutes } (antes { fecha, tema, minutos, creada }),
para que coincida con CLAUDE.md. Se quitó "creada": el orden del mismo día ahora sale de
invertir el array guardado + sort estable por fecha.
- Minutos de la semana: lunes-domingo (local), no ventana móvil de 7 días — es la lectura
natural de "esta semana" en español. Fechas futuras no suman, extendiendo la misma regla ya
usada en la racha. Se muestra en tarjeta propia, no junto a racha/mejor racha, para no
apretar el layout en móvil con 3 números grandes en una fila.
## Aprendizajes y errores a evitar
- Al cambiar la forma de los datos guardados, migrar con un fallback (ej. `?? sesion.fecha`)
en vez de descartar lo viejo: así nadie pierde sesiones ya guardadas.
## Próximos pasos
- (vacío por ahora)