const User = require('../models/User');
const { verificarToken } = require('../services/tokenService');

/**
 * Middleware de autenticación. Espera el header:
 *   Authorization: Bearer <token>
 * Si el token es válido, adjunta el usuario autenticado en req.user
 * (sin la contraseña) y continúa. Si no, corta con 401 indicando si el
 * token expiró o es inválido (así el cliente sabe si debe volver a loguearse).
 */
async function protegerRuta(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'error',
      message: 'No autorizado: falta el token de acceso',
      data: null,
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verificarToken(token);
    const user = await User.findById(payload.id);

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'No autorizado: el usuario del token ya no existe',
        data: null,
      });
    }

    req.user = user; // disponible en los controladores siguientes
    next();
  } catch (error) {
    // Errores del JWT -> 401. Cualquier otro error (ej: caída de la BD) -> errorHandler
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'No autorizado: el token expiró, iniciá sesión nuevamente',
        data: null,
      });
    }
    if (error.name === 'JsonWebTokenError' || error.name === 'NotBeforeError') {
      return res.status(401).json({
        status: 'error',
        message: 'No autorizado: token inválido',
        data: null,
      });
    }
    next(error);
  }
}

module.exports = protegerRuta;
