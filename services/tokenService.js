const jwt = require('jsonwebtoken');

/**
 * Firma un JWT con el id del usuario como payload.
 * Expira según JWT_EXPIRES_IN (por defecto 1 día).
 */
function generarToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
}

/**
 * Verifica firma y expiración. Lanza TokenExpiredError o JsonWebTokenError
 * si el token no es válido. Se fija el algoritmo para evitar que un token
 * firmado con otro algoritmo sea aceptado.
 */
function verificarToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
}

module.exports = { generarToken, verificarToken };
