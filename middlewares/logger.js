const fs = require('fs');
const path = require('path');

// Ruta absoluta del archivo de log plano
const LOG_FILE_PATH = path.join(__dirname, '..', 'logs', 'log.txt');

/**
 * Middleware de logging.
 * Registra en logs/log.txt cada request con: fecha, hora, método y ruta accedida.
 * Se elige registrar TODAS las peticiones (no solo errores o inicio del servidor)
 * porque para una app de gestión de usuarios es más útil tener trazabilidad
 * completa de accesos desde el día 1, incluso antes de tener autenticación.
 */
function requestLogger(req, res, next) {
  const now = new Date();
  const fecha = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const hora = now.toTimeString().split(' ')[0]; // HH:MM:SS

  const linea = `[${fecha} ${hora}] ${req.method} ${req.originalUrl}\n`;

  // fs.appendFile es asíncrono y no bloqueante: no retrasa la respuesta al cliente
  fs.appendFile(LOG_FILE_PATH, linea, (err) => {
    if (err) {
      // Si falla el log, no debe romper la app: solo se informa por consola
      console.error('No se pudo escribir en el log:', err.message);
    }
  });

  next();
}

module.exports = requestLogger;
