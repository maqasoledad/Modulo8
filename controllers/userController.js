const User = require('../models/User');
const Profile = require('../models/Profile');
const AppError = require('../utils/AppError');
const escapeRegex = require('../utils/escapeRegex');
const parsePaginacion = require('../utils/paginacion');
const { eliminarArchivoSubido } = require('../services/fileService');

/**
 * POST /api/users
 * Crea un usuario y, junto con él, su perfil vacío asociado (relación 1:1).
 */
async function createUser(req, res) {
  const { username, email, password, bio, avatarUrl } = req.body;

  const user = await User.create({ username, email, password });

  // Se crea el perfil vacío/inicial y se enlaza en ambos sentidos
  const profile = await Profile.create({
    user: user._id,
    bio: bio || '',
    avatarUrl: avatarUrl || '',
  });

  user.profile = profile._id;
  await user.save();

  res.status(201).json({
    status: 'success',
    message: 'Usuario creado correctamente',
    data: { user, profile },
  });
}

/**
 * GET /api/users
 * Lista usuarios con búsqueda dinámica opcional por username (?search=)
 * y paginación simple (?page=&limit=).
 */
async function getUsers(req, res) {
  const { search } = req.query;
  const { page, limit, skip } = parsePaginacion(req.query);

  // escapeRegex: el texto buscado se trata como literal (no como regex)
  const filtro =
    typeof search === 'string' && search
      ? { username: { $regex: escapeRegex(search), $options: 'i' } }
      : {};

  const users = await User.find(filtro)
    .populate('profile')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await User.countDocuments(filtro);

  res.status(200).json({
    status: 'success',
    message: 'Usuarios obtenidos correctamente',
    data: { users, total, page, limit },
  });
}

/**
 * GET /api/users/:id
 * Trae un usuario puntual junto con su perfil (populate de la relación 1:1).
 */
async function getUserById(req, res) {
  const user = await User.findById(req.params.id).populate('profile');

  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: 'Usuario no encontrado',
      data: null,
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Usuario encontrado',
    data: { user },
  });
}

/**
 * PUT /api/users/:id
 * Actualiza datos del usuario y, opcionalmente, de su perfil asociado.
 * Solo el propio usuario puede editar su cuenta (lo garantiza el
 * middleware esPropietario en la ruta).
 */
async function updateUser(req, res) {
  const { username, email, bio, avatarUrl, ubicacion } = req.body;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { username, email },
    { new: true, runValidators: true }
  );

  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: 'Usuario no encontrado',
      data: null,
    });
  }

  if (user.profile && (bio !== undefined || avatarUrl !== undefined || ubicacion !== undefined)) {
    await Profile.findByIdAndUpdate(
      user.profile,
      { bio, avatarUrl, ubicacion },
      { new: true, runValidators: true }
    );
  }

  const userActualizado = await User.findById(user._id).populate('profile');

  res.status(200).json({
    status: 'success',
    message: 'Usuario actualizado correctamente',
    data: { user: userActualizado },
  });
}

/**
 * DELETE /api/users/:id
 * Elimina el usuario y, en cascada, su perfil asociado.
 * Solo el propio usuario puede borrar su cuenta (esPropietario).
 * También borra su avatar del disco para no dejar archivos huérfanos.
 */
async function deleteUser(req, res) {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: 'Usuario no encontrado',
      data: null,
    });
  }

  if (user.profile) {
    const perfil = await Profile.findByIdAndDelete(user.profile);
    if (perfil) await eliminarArchivoSubido(perfil.avatarUrl);
  }

  res.status(200).json({
    status: 'success',
    message: 'Usuario eliminado correctamente',
    data: null,
  });
}

/**
 * POST /api/users/:id/avatar
 * Sube una imagen de avatar y actualiza el perfil del usuario (1:1).
 * Orden en la ruta: protegerRuta -> esPropietario -> multer -> controlador.
 * Así el archivo solo se guarda si el usuario está autenticado, es el dueño
 * y el tipo/tamaño son válidos. Si la BD falla, se borra el archivo recién
 * subido; si se reemplaza un avatar, se borra el anterior.
 */
async function uploadAvatar(req, res) {
  if (!req.file) {
    return res.status(400).json({
      status: 'error',
      message: 'No se recibió ningún archivo. Enviá el campo "avatar".',
      data: null,
    });
  }

  const nuevaUrl = `/uploads/avatars/${req.file.filename}`;

  try {
    const perfil = await Profile.findOne({ user: req.user._id });
    if (!perfil) {
      throw new AppError('El usuario no tiene un perfil asociado', 404);
    }

    const urlAnterior = perfil.avatarUrl;
    perfil.avatarUrl = nuevaUrl;
    await perfil.save();
    await eliminarArchivoSubido(urlAnterior);

    res.status(200).json({
      status: 'success',
      message: 'Avatar actualizado correctamente',
      data: { avatarUrl: nuevaUrl },
    });
  } catch (error) {
    await eliminarArchivoSubido(nuevaUrl); // no dejar el archivo huérfano
    throw error;
  }
}

module.exports = { createUser, getUsers, getUserById, updateUser, deleteUser, uploadAvatar };
