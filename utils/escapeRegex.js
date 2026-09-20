/**
 * Escapa los caracteres especiales de una expresión regular para que el
 * texto de búsqueda del usuario se trate como texto literal (evita
 * regex injection / ReDoS en las búsquedas con $regex).
 */
function escapeRegex(texto = '') {
  return String(texto).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = escapeRegex;
