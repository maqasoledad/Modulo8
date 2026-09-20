const Tag = require('../models/Tag');
const AppError = require('../utils/AppError');

/**
 * Convierte un array de nombres de tags en sus ObjectId, creando la tag
 * si todavía no existe (evita duplicados por nombre). Valida que el
 * input sea un array de textos para no romper con un 500.
 */
async function resolveTagIds(tagNames = []) {
  if (!Array.isArray(tagNames) || tagNames.some((t) => typeof t !== 'string')) {
    throw new AppError('"tags" debe ser un array de textos', 400);
  }

  const ids = [];
  for (const nombre of tagNames) {
    const nombreNormalizado = nombre.trim().toLowerCase();
    if (!nombreNormalizado) continue;
    let tag = await Tag.findOne({ name: nombreNormalizado });
    if (!tag) {
      tag = await Tag.create({ name: nombreNormalizado });
    }
    ids.push(tag._id);
  }
  return ids;
}

module.exports = { resolveTagIds };
