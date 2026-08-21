/**
 * ============================================================
 * RESERVAS — Matilde Pizarro Toro, Fonoaudióloga
 * ============================================================
 * Este script convierte una Google Sheet en una mini "base de datos"
 * gratuita para el calendario del sitio web (que es estático, sin
 * backend propio, alojado en GitHub Pages).
 *
 * Qué hace:
 *  - doGet()  → responde en JSON con la lista de fecha+hora ya reservadas.
 *               El sitio web lo consulta para saber qué horarios ocultar
 *               o mostrar como "Reservado".
 *  - doPost() → recibe una nueva reserva y la agrega como fila(s) nueva(s)
 *               en la Sheet. Ahora se puede recibir más de una sesión a
 *               la vez (por ejemplo, un plan de 5, 10 o 30 sesiones que
 *               la persona agendó todas juntas): cada sesión queda en su
 *               propia fila, agrupada con un "grupo" en común para que
 *               puedas identificar que pertenecen a la misma solicitud.
 *
 * No necesitas tocar nada de este código para que funcione: solo debes
 * pegarlo en el editor de Apps Script de tu Google Sheet y publicarlo
 * como Web App. Sigue las instrucciones paso a paso que te compartió
 * Claude junto con este archivo.
 * ============================================================
 */

// Nombre de la pestaña (hoja) dentro de tu Google Sheet donde se
// guardan las reservas. Si prefieres otro nombre, cámbialo aquí Y
// cambia también el nombre de la pestaña en la Sheet.
var SHEET_NAME = 'Reservas';

// Devuelve la pestaña de reservas, creándola (con encabezados) si
// todavía no existe.
function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['fecha', 'hora', 'nombre', 'modalidad', 'timestamp', 'sesion', 'grupo']);
  }
  // Fuerza a que las columnas "fecha" (A) y "hora" (B) se guarden siempre
  // como texto plano, para que Google Sheets no las "autoformatee" como
  // fecha/hora y así evitar que el sitio web deje de reconocer los
  // horarios ya reservados. Se aplica cada vez por si alguien cambió el
  // formato sin querer.
  sheet.getRange('A:B').setNumberFormat('@');
  return sheet;
}

/**
 * GET → usado por el sitio web para saber qué horarios ya están ocupados.
 * Responde: {"reservados":[{"fecha":"2026-07-10","hora":"09:00"}, ...]}
 * Funciona igual que antes: no importa si una fila viene de una reserva
 * de 1 sesión o de un plan de varias sesiones, cada fila bloquea su
 * propio horario.
 */
function doGet(e) {
  var sheet = getSheet_();
  var data = sheet.getDataRange().getValues(); // puede incluir la fila de encabezado
  var tz = Session.getScriptTimeZone();
  var reservados = [];

  // Solo saltamos la primera fila si de verdad es el encabezado (si la
  // primera celda dice "fecha"). Así, si alguna vez falta el encabezado
  // en la Sheet, no perdemos la primera reserva por accidente.
  var startRow = 0;
  if (data.length > 0 && String(data[0][0]).trim().toLowerCase() === 'fecha') {
    startRow = 1;
  }

  for (var i = startRow; i < data.length; i++) {
    var fecha = data[i][0];
    var hora = data[i][1];
    if (!fecha || !hora) continue;

    // Si Google Sheets guardó la fecha como un objeto Date (puede pasar
    // según el formato de la columna), la convertimos a texto 'YYYY-MM-DD'.
    if (Object.prototype.toString.call(fecha) === '[object Date]') {
      fecha = Utilities.formatDate(fecha, tz, 'yyyy-MM-dd');
    } else {
      fecha = String(fecha).trim();
    }

    // Lo mismo puede pasarle a la hora: si Sheets la "autoformateó" como
    // un valor de hora (en vez de dejarla como texto "09:00"), llega aquí
    // como objeto Date. La convertimos a texto 'HH:mm' para que coincida
    // con el formato que espera el sitio web.
    if (Object.prototype.toString.call(hora) === '[object Date]') {
      hora = Utilities.formatDate(hora, tz, 'HH:mm');
    } else {
      hora = String(hora).trim();
    }

    reservados.push({ fecha: fecha, hora: hora });
  }

  return ContentService
    .createTextOutput(JSON.stringify({ reservados: reservados }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * POST → usado por el sitio web para guardar una nueva reserva.
 *
 * Ahora acepta dos formatos de body JSON:
 *
 * 1) Varias sesiones a la vez (plan de N sesiones agendadas juntas):
 *    {
 *      "nombre": "Juanita Pérez",
 *      "modalidad": "Online",
 *      "sesiones": [
 *        {"fecha":"2026-08-25","hora":"09:00","indice":1,"total":5},
 *        {"fecha":"2026-09-01","hora":"09:00","indice":2,"total":5},
 *        ...
 *      ]
 *    }
 *    Cada sesión se guarda en su propia fila, todas con el mismo "grupo"
 *    (un identificador único) para que sepas que pertenecen a la misma
 *    solicitud.
 *
 * 2) Formato antiguo, una sola sesión (compatibilidad hacia atrás):
 *    {"fecha":"2026-07-10","hora":"09:00","nombre":"Juanita Pérez","modalidad":"Online"}
 *
 * Responde: {"ok":true} o {"ok":false,"error":"..."}
 */
function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var nombre = String(body.nombre || '').trim();
    var modalidad = String(body.modalidad || '').trim();

    var sesiones = [];
    if (body.sesiones && body.sesiones.length) {
      sesiones = body.sesiones;
    } else if (body.fecha && body.hora) {
      // Compatibilidad con envíos antiguos de una sola sesión.
      sesiones = [{ fecha: body.fecha, hora: body.hora, indice: 1, total: 1 }];
    }

    if (!sesiones.length) {
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: 'Falta información de sesiones (fecha/hora)' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var grupo = Utilities.getUuid();
    var sheet = getSheet_();
    var guardadas = 0;

    sesiones.forEach(function (s) {
      var fecha = String((s && s.fecha) || '').trim();
      var hora = String((s && s.hora) || '').trim();
      if (!fecha || !hora) return; // salta sesiones incompletas, sin cortar las demás
      var indice = (s && s.indice) || 1;
      var total = (s && s.total) || sesiones.length;
      sheet.appendRow([fecha, hora, nombre, modalidad, new Date(), indice + '/' + total, grupo]);
      guardadas++;
    });

    if (guardadas === 0) {
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: 'Ninguna sesión tenía fecha y hora válidas' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, guardadas: guardadas }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
