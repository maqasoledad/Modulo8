const mongoose = require('mongoose');

/**
 * Tag representa una etiqueta reutilizable. La relación con Post es N:M:
 * un post puede tener varias etiquetas, y una etiqueta puede estar en
 * varios posts.
 */
const tagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre de la etiqueta es obligatorio'],
      unique: true,
      trim: true,
      lowercase: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Tag', tagSchema);
