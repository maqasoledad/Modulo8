const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'El nombre de usuario es obligatorio'],
      unique: true,
      trim: true,
      minlength: [3, 'El username debe tener al menos 3 caracteres'],
    },
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'El email no tiene un formato válido'],
    },
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
      select: false, // nunca se devuelve por defecto en las consultas
    },
    // Relación 1:1 -> cada usuario referencia a su único perfil
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile',
      default: null,
    },
  },
  { timestamps: true }
);

// Hashea la contraseña antes de guardar. Se hace acá (y no en el
// controlador) para que quede garantizado sin importar desde dónde se cree
// o actualice el usuario.
// Nota (Mongoose 9): los hooks async ya NO reciben ni usan el callback
// next(); alcanza con devolver la promesa (async/await). Usar next()
// lanza "next is not a function" y rompe el registro de usuarios.
userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', userSchema);
