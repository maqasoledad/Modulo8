/**
 * Normaliza ?page= y ?limit= : evita valores negativos, NaN o límites
 * enormes que permitirían volcar toda la colección en una sola respuesta.
 */
function parsePaginacion(query, maxLimit = 50) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), maxLimit);
  return { page, limit, skip: (page - 1) * limit };
}

module.exports = parsePaginacion;
