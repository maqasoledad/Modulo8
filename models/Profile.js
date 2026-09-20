const mongoose = require('mongoose');

/**
 * Profile guarda datos extendidos del usuario, separados del modelo User
 * para no sobrecargarlo. Relación 1:1 con User: cada perfil pertenece a
 * un único usuario, y cada usuario tiene un único perfil.
 */
const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // garantiza la relación 1:1 a nivel de base de datos
    },
    bio: {
      type: String,
      maxlength: [300, 'La biografía no puede superar los 300 caracteres'],
      default: '',
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    ubicacion: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Profile', profileSchema);
