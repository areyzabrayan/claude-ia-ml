// ---------- Configuración ----------

const CLAVE_ALMACENAMIENTO = "diario-estudio-sesiones";

// ---------- Referencias al HTML ----------

const formSesion = document.getElementById("formSesion");
const campoFecha = document.getElementById("fecha");
const campoTema = document.getElementById("tema");
const campoMinutos = document.getElementById("minutos");

const rachaNumero = document.getElementById("rachaNumero");
const rachaTexto = document.getElementById("rachaTexto");
const mejorRachaNumero = document.getElementById("mejorRachaNumero");
const minutosSemanaNumero = document.getElementById("minutosSemanaNumero");
const diasEstudiadosMesNumero = document.getElementById("diasEstudiadosMesNumero");

const listaSesiones = document.getElementById("listaSesiones");
const mensajeVacio = document.getElementById("mensajeVacio");

// ---------- Utilidades de fechas (siempre en hora local) ----------

// Devuelve un Date a medianoche local, sin horas, para poder comparar días.
function hoyLocal() {
  const ahora = new Date();
  return new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
}

// Convierte un Date a texto "AAAA-MM-DD" usando la fecha local (no UTC).
function formatearFechaLocal(fecha) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

// Convierte un texto "AAAA-MM-DD" (el que guarda el input type="date") a un Date local.
function textoAFechaLocal(texto) {
  const [anio, mes, dia] = texto.split("-").map(Number);
  return new Date(anio, mes - 1, dia);
}

// Devuelve un nuevo Date sumando (o restando) días a una fecha local.
function sumarDias(fecha, dias) {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + dias);
}

// ---------- Almacenamiento ----------

// Convierte una sesión guardada con el formato antiguo (fecha/tema/minutos/creada)
// al formato actual (date/topic/minutes), para no perder sesiones ya guardadas
// de antes de este cambio.
function migrarSesion(sesion) {
  return {
    date: sesion.date ?? sesion.fecha,
    topic: sesion.topic ?? sesion.tema,
    minutes: sesion.minutes ?? sesion.minutos,
  };
}

function cargarSesiones() {
  const datosGuardados = localStorage.getItem(CLAVE_ALMACENAMIENTO);
  if (!datosGuardados) {
    return [];
  }
  return JSON.parse(datosGuardados).map(migrarSesion);
}

function guardarSesiones(sesiones) {
  localStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(sesiones));
}

// ---------- Cálculo de la racha ----------

// Devuelve el conjunto de fechas (texto "AAAA-MM-DD") que tienen al menos una sesión,
// sin repetidos. Lo usan tanto calcularRacha como calcularMejorRacha.
function obtenerDiasConSesion(sesiones) {
  return new Set(sesiones.map((sesion) => sesion.date));
}

// La racha son los días consecutivos con al menos una sesión, terminando hoy.
// Si hoy no hay sesión pero ayer sí, la racha sigue contando desde ayer
// (todavía no se rompe porque el día de hoy no ha terminado).
function calcularRacha(sesiones) {
  const diasConSesion = obtenerDiasConSesion(sesiones);

  const hoy = hoyLocal();
  const ayer = sumarDias(hoy, -1);

  let diaInicio;
  if (diasConSesion.has(formatearFechaLocal(hoy))) {
    diaInicio = hoy;
  } else if (diasConSesion.has(formatearFechaLocal(ayer))) {
    diaInicio = ayer;
  } else {
    return 0;
  }

  let racha = 0;
  let diaActual = diaInicio;
  while (diasConSesion.has(formatearFechaLocal(diaActual))) {
    racha++;
    diaActual = sumarDias(diaActual, -1);
  }

  return racha;
}

// true si "siguienteTexto" es exactamente el día después de "fechaTexto".
function esDiaSiguiente(fechaTexto, siguienteTexto) {
  const diaDespues = formatearFechaLocal(sumarDias(textoAFechaLocal(fechaTexto), 1));
  return diaDespues === siguienteTexto;
}

// La racha más larga de días consecutivos con sesión conseguida alguna vez, sea o no
// la que sigue viva hoy. A diferencia de calcularRacha, aquí no se aplica la regla de
// "hoy todavía no ha terminado": cada tramo del historial se mide por su longitud real.
function calcularMejorRacha(sesiones) {
  const diasOrdenados = [...obtenerDiasConSesion(sesiones)].sort();

  let mejorRacha = 0;
  let rachaEnCurso = 0;
  let diaAnterior = null;

  for (const dia of diasOrdenados) {
    rachaEnCurso = diaAnterior !== null && esDiaSiguiente(diaAnterior, dia) ? rachaEnCurso + 1 : 1;
    if (rachaEnCurso > mejorRacha) {
      mejorRacha = rachaEnCurso;
    }
    diaAnterior = dia;
  }

  return mejorRacha;
}

// ---------- Cálculo de minutos estudiados esta semana ----------

// Devuelve el lunes (local) de la semana que contiene "fecha".
function obtenerInicioSemana(fecha) {
  const diasDesdeLunes = (fecha.getDay() + 6) % 7; // getDay(): 0=domingo..6=sábado
  return sumarDias(fecha, -diasDesdeLunes);
}

// Suma los minutos de las sesiones entre el lunes de esta semana y hoy (inclusive).
// A diferencia de la racha, aquí SÍ suman todas las sesiones de un mismo día (no solo
// cuenta si hubo estudio ese día). Las fechas futuras no suman, igual que en la racha:
// son estudio que todavía no ha pasado.
function calcularMinutosSemana(sesiones) {
  const hoy = hoyLocal();
  const inicioTexto = formatearFechaLocal(obtenerInicioSemana(hoy));
  const hoyTexto = formatearFechaLocal(hoy);

  return sesiones
    .filter((sesion) => sesion.date >= inicioTexto && sesion.date <= hoyTexto)
    .reduce((total, sesion) => total + sesion.minutes, 0);
}

// ---------- Cálculo de días estudiados este mes ----------

// Devuelve el día 1 (local) del mes que contiene "fecha".
function obtenerInicioMes(fecha) {
  return new Date(fecha.getFullYear(), fecha.getMonth(), 1);
}

// Cuenta los días distintos con al menos una sesión entre el día 1 de este mes y hoy
// (inclusive). Igual que la racha, varias sesiones el mismo día cuentan como un solo
// día; igual que la semana, las fechas futuras no suman.
function calcularDiasEstudiadosMes(sesiones) {
  const diasConSesion = obtenerDiasConSesion(sesiones);
  const hoy = hoyLocal();
  const inicioTexto = formatearFechaLocal(obtenerInicioMes(hoy));
  const hoyTexto = formatearFechaLocal(hoy);

  let dias = 0;
  for (const dia of diasConSesion) {
    if (dia >= inicioTexto && dia <= hoyTexto) {
      dias++;
    }
  }
  return dias;
}

// ---------- Mostrar la racha en pantalla ----------

function pintarRacha(sesiones) {
  const racha = calcularRacha(sesiones);
  rachaNumero.textContent = racha;
  rachaTexto.textContent = racha === 1 ? "día de racha" : "días de racha";
}

function pintarMejorRacha(sesiones) {
  mejorRachaNumero.textContent = calcularMejorRacha(sesiones);
}

function pintarMinutosSemana(sesiones) {
  minutosSemanaNumero.textContent = calcularMinutosSemana(sesiones);
}

function pintarDiasEstudiadosMes(sesiones) {
  diasEstudiadosMesNumero.textContent = calcularDiasEstudiadosMes(sesiones);
}

// ---------- Mostrar la lista de sesiones ----------

function formatearFechaParaMostrar(textoFecha) {
  const fecha = textoAFechaLocal(textoFecha);
  return fecha.toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function pintarLista(sesiones) {
  listaSesiones.innerHTML = "";

  if (sesiones.length === 0) {
    mensajeVacio.style.display = "block";
    return;
  }
  mensajeVacio.style.display = "none";

  // De la más reciente a la más antigua. Si dos sesiones son del mismo día, se
  // muestra primero la que se añadió más tarde: empezamos invirtiendo el orden
  // de guardado y luego usamos un sort estable (mantiene ese orden en los
  // empates) por fecha descendente.
  const sesionesOrdenadas = [...sesiones].reverse().sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  for (const sesion of sesionesOrdenadas) {
    const elemento = document.createElement("li");
    elemento.className = "sesion";
    elemento.innerHTML = `
      <div class="sesion-info">
        <span class="sesion-tema">${escaparHTML(sesion.topic)}</span>
        <span class="sesion-fecha">${formatearFechaParaMostrar(sesion.date)}</span>
      </div>
      <span class="sesion-minutos">${sesion.minutes} min</span>
    `;
    listaSesiones.appendChild(elemento);
  }
}

// Evita que un tema con símbolos como "<" rompa el HTML de la lista.
function escaparHTML(texto) {
  const elemento = document.createElement("div");
  elemento.textContent = texto;
  return elemento.innerHTML;
}

// ---------- Volver a pintar toda la pantalla ----------

function actualizarPantalla() {
  const sesiones = cargarSesiones();
  pintarRacha(sesiones);
  pintarMejorRacha(sesiones);
  pintarMinutosSemana(sesiones);
  pintarDiasEstudiadosMes(sesiones);
  pintarLista(sesiones);
}

// ---------- Guardar una nueva sesión ----------

function manejarEnvioFormulario(evento) {
  evento.preventDefault();

  const fecha = campoFecha.value;
  const tema = campoTema.value.trim();
  const minutos = Number(campoMinutos.value);

  if (!fecha || !tema || !(minutos > 0)) {
    return;
  }

  const nuevaSesion = {
    date: fecha,
    topic: tema,
    minutes: minutos,
  };

  const sesiones = cargarSesiones();
  sesiones.push(nuevaSesion);
  guardarSesiones(sesiones);

  formSesion.reset();
  campoFecha.value = formatearFechaLocal(hoyLocal());

  actualizarPantalla();
}

// ---------- Inicio ----------

campoFecha.value = formatearFechaLocal(hoyLocal());
formSesion.addEventListener("submit", manejarEnvioFormulario);
actualizarPantalla();
