// =============================
// FUNCIONES PARA GMAI
// gmail.gs
// =============================

/**
 * Devuelve un array de los mensajes que coinciden como comprobante de pago.
 * Cada elemento es { from: string, date: Date }.
 */
function obtenerCorreosDePago(nombre, correo, fechaPago) {
  const resultados = [];
  const rangoDias  = 5;
  const pagoDate   = new Date(fechaPago + "T00:00:00");
  const inicio     = new Date(pagoDate); inicio.setDate(inicio.getDate() - rangoDias);
  const fin        = new Date(pagoDate); fin   .setDate(fin.getDate() + rangoDias);

  const fIni = `${inicio.getFullYear()}/${inicio.getMonth()+1}/${inicio.getDate()}`;
  const fFin = `${fin.getFullYear()}/${fin.getMonth()+1}/${fin.getDate()+1}`;
  const query = `after:${fIni} before:${fFin} from:(${correo})`;

  const threads  = GmailApp.search(query);
  const keywords = ['pago','renta','comprobante','depósito','transferencia'];

  for (let th of threads) {
    for (let msg of th.getMessages()) {
      const subj = msg.getSubject().toLowerCase();
      const body = msg.getPlainBody().toLowerCase();
      if (keywords.some(k => subj.includes(k) || body.includes(k))) {
        resultados.push({
          from: msg.getFrom(),
          date: msg.getDate()
        });
      }
    }
  }
  return resultados;
}
