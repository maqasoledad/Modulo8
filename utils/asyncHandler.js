/**
 * Envuelve un controlador async y reenvía cualquier error a next(),
 * para que lo procese el middleware de manejo de errores centralizado
 * en vez de repetir try/catch en cada función.
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
