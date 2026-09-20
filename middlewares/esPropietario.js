/**
 * Verifica que el :id de la URL sea el del usuario autenticado.
 * Debe ir DESPUÉS de protegerRuta y ANTES de multer: así una request
 * ajena se rechaza con 403 sin haber guardado nada en disco.
 */
function esPropietario(req, res, next) {
  if (req.user._id.toString() !== req.params.id) {
    return res.status(403).json({
      status: 'error',
      message: 'No tenés permiso para realizar esta acción sobre este usuario',
      data: null,
    });
  }
  next();
}

module.exports = esPropietario;
