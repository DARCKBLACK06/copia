/**
 * gmail.gs 
 * obtenerCorreosDePago
 * 
 * Busca en Gmail los correos enviados por el inquilino en un rango de ±5 días
 * de la fecha de pago, filtrando por palabras clave comunes de comprobantes.
 * 
 * @param {string} nombre - Nombre del inquilino (solo para el log)
 * @param {string} correo - Correo del inquilino (para el filtro de Gmail)
 * @param {string} fechaPago - Fecha esperada de pago (YYYY-MM-DD)
 * @returns {Object[]} Arreglo de correos encontrados con from, date, subject
 */
function obtenerCorreosDePago(nombre, correo, fechaPago) {
  const resultados = [];
  const diasMargen = 5;
  const fechaBase = new Date(`${fechaPago}T00:00:00`);

  // Rango de búsqueda: desde 5 días antes hasta 5 días después
  const inicio = new Date(fechaBase);
  const fin    = new Date(fechaBase);
  inicio.setDate(inicio.getDate() - diasMargen);
  fin.setDate(fin.getDate() + diasMargen + 1); // Gmail 'before' es no-inclusivo

  const fIni = `${inicio.getFullYear()}/${inicio.getMonth() + 1}/${inicio.getDate()}`;
  const fFin = `${fin.getFullYear()}/${fin.getMonth() + 1}/${fin.getDate()}`;
  const query = `after:${fIni} before:${fFin} from:(${correo})`;

  const hilos = GmailApp.search(query);
  const palabrasClave = ["pago", "renta", "comprobante", "depósito", "transferencia"];

  for (let hilo of hilos) {
    const mensajes = hilo.getMessages();
    for (let msg of mensajes) {
      const asunto = msg.getSubject().toLowerCase();
      const cuerpo = msg.getPlainBody().toLowerCase();
      const contieneClave = palabrasClave.some(palabra =>
        asunto.includes(palabra) || cuerpo.includes(palabra)
      );

      if (contieneClave) {
        resultados.push({
          from: msg.getFrom(),
          date: msg.getDate(),
          subject: msg.getSubject()
        });
      }
    }
  }
  return resultados;
}
