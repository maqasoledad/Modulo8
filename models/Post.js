const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'El título es obligatorio'],
      trim: true,
      minlength: [3, 'El título debe tener al menos 3 caracteres'],
    },
    content: {
      type: String,
      required: [true, 'El contenido es obligatorio'],
    },
    // Relación 1:N -> muchos posts pertenecen a un mismo usuario (autor)
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El post debe tener un autor'],
    },
    // Relación N:M -> un post puede tener varias etiquetas
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag',
      },
    ],
    publicado: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Índice de texto para permitir búsquedas dinámicas por título/contenido
postSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('Post', postSchema);
