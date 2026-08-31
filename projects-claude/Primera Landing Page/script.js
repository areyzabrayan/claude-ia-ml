// TODO: reemplaza este número por el WhatsApp real de la clínica
// Formato: código de país + número, sin "+", espacios ni guiones (ej. 573001234567)
const WHATSAPP_NUMBER = "573000000000";

document.getElementById("year").textContent = new Date().getFullYear();

const form = document.getElementById("appointment-form");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const nombre = form.nombre.value.trim();
  const telefono = form.telefono.value.trim();
  const fecha = form.fecha.value;
  const mensaje = form.mensaje.value.trim();

  const lines = [
    "Hola, quiero agendar una cita en Sonrisa Imperial.",
    `Nombre: ${nombre}`,
    `Teléfono: ${telefono}`,
    `Fecha preferida: ${fecha}`,
  ];

  if (mensaje) {
    lines.push(`Mensaje: ${mensaje}`);
  }

  const text = encodeURIComponent(lines.join("\n"));
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank");
});
