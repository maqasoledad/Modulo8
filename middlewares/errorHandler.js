/**
 * Middleware centralizado de errores. Traduce errores comunes de Mongoose,
 * Multer (subida de archivos) y JWT a respuestas HTTP claras, manteniendo
 * siempre el formato { status, message, data }.
 */
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Error interno del servidor';

  // Validaciones de Mongoose (campos requeridos, minlength, match, etc.)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }

  // ID con formato inválido (no es un ObjectId válido)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Valor inválido para "${err.path}": ${err.value}`;
  }

  // Clave duplicada (unique: true) — username, email o tag repetidos
  if (err.code === 11000) {
    statusCode = 409;
    const campo = Object.keys(err.keyValue || {})[0] || 'campo';
    message = `Ya existe un registro con ese valor de "${campo}"`;
  }

  // Errores de Multer
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413; // Payload Too Large
    message = 'El archivo supera el tamaño máximo permitido (2 MB)';
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    message = 'Campo de archivo inesperado. Enviá la imagen en el campo "avatar"';
  }

  // JWT inválido o expirado (por si algún verify no está en un try/catch propio)
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'El token expiró, iniciá sesión nuevamente';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token inválido';
  }

  console.error(`[ERROR] ${req.method} ${req.originalUrl} ->`, err.message);

  // En producción no se filtran detalles internos de errores inesperados
  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    message = 'Error interno del servidor';
  }

  res.status(statusCode).json({
    status: 'error',
    message,
    data: null,
  });
}

module.exports = errorHandler;
