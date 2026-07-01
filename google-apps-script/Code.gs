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
 *  - doPost() → recibe una nueva reserva (fecha, hora, nombre, modalidad)
 *               y la agrega como fila nueva en la Sheet.
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
    sheet.appendRow(['fecha', 'hora', 'nombre', 'modalidad', 'timestamp']);
  }
  return sheet;
}

/**
 * GET → usado por el sitio web para saber qué horarios ya están ocupados.
 * Responde: {"reservados":[{"fecha":"2026-07-10","hora":"09:00"}, ...]}
 */
function doGet(e) {
  var sheet = getSheet_();
  var data = sheet.getDataRange().getValues(); // incluye la fila de encabezado
  var tz = Session.getScriptTimeZone();
  var reservados = [];

  for (var i = 1; i < data.length; i++) {
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

    reservados.push({ fecha: fecha, hora: String(hora).trim() });
  }

  return ContentService
    .createTextOutput(JSON.stringify({ reservados: reservados }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * POST → usado por el sitio web para guardar una nueva reserva.
 * Espera un body JSON como:
 * {"fecha":"2026-07-10","hora":"09:00","nombre":"Juanita Pérez","modalidad":"Online"}
 * Responde: {"ok":true} o {"ok":false,"error":"..."}
 */
function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var fecha = String(body.fecha || '').trim();
    var hora = String(body.hora || '').trim();
    var nombre = String(body.nombre || '').trim();
    var modalidad = String(body.modalidad || '').trim();

    if (!fecha || !hora) {
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: 'Falta fecha u hora' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var sheet = getSheet_();
    sheet.appendRow([fecha, hora, nombre, modalidad, new Date()]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
