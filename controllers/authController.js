const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Profile = require('../models/Profile');
const { generarToken } = require('../services/tokenService');

/**
 * POST /api/auth/register
 * Crea un usuario (+ su perfil 1:1) y devuelve un token JWT ya logueado,
 * para no obligar a un login extra justo después de registrarse.
 */
async function register(req, res) {
  const { username, email, password } = req.body;

  // Se exige texto en los tres campos (evita que lleguen objetos/arrays
  // al modelo y da un mensaje claro antes de tocar la base de datos)
  if (![username, email, password].every((v) => typeof v === 'string' && v.trim() !== '')) {
    return res.status(400).json({
      status: 'error',
      message: 'username, email y password son obligatorios y deben ser texto',
      data: null,
    });
  }

  const user = await User.create({ username, email, password });

  const profile = await Profile.create({ user: user._id });
  user.profile = profile._id;
  await user.save();

  const token = generarToken(user._id);

  res.status(201).json({
    status: 'success',
    message: 'Usuario registrado correctamente',
    data: {
      token,
      user: { id: user._id, username: user.username, email: user.email },
    },
  });
}

/**
 * POST /api/auth/login
 * Valida credenciales y devuelve un JWT si son correctas.
 */
async function login(req, res) {
  const { email, password } = req.body;

  // typeof string: evita inyección NoSQL (ej: {"email": {"$gt": ""}}) y
  // que bcrypt.compare reciba algo que no sea texto
  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    return res.status(400).json({
      status: 'error',
      message: 'Email y contraseña son obligatorios y deben ser texto',
      data: null,
    });
  }

  // select('+password') porque en el modelo la contraseña tiene select: false
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');

  if (!user) {
    return res.status(401).json({
      status: 'error',
      message: 'Credenciales inválidas',
      data: null,
    });
  }

  const passwordCorrecta = await bcrypt.compare(password, user.password);

  if (!passwordCorrecta) {
    return res.status(401).json({
      status: 'error',
      message: 'Credenciales inválidas',
      data: null,
    });
  }

  const token = generarToken(user._id);

  res.status(200).json({
    status: 'success',
    message: 'Login exitoso',
    data: {
      token,
      user: { id: user._id, username: user.username, email: user.email },
    },
  });
}

/**
 * GET /api/auth/me   (ruta protegida)
 * Devuelve el usuario dueño del token con su perfil. Útil para que un
 * cliente compruebe si su token sigue siendo válido.
 */
async function me(req, res) {
  const user = await User.findById(req.user._id).populate('profile');

  res.status(200).json({
    status: 'success',
    message: 'Usuario autenticado',
    data: { user },
  });
}

module.exports = { register, login, me };
