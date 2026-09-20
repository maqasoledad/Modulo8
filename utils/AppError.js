/**
 * Error controlado con código HTTP. El errorHandler central lo usa
 * (err.statusCode) para responder con el status correcto en vez de 500.
 */
class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = AppError;
