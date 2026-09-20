const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const protegerRuta = require('../middlewares/auth');
const esPropietario = require('../middlewares/esPropietario');
const upload = require('../middlewares/upload');
const {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  uploadAvatar,
} = require('../controllers/userController');

router.post('/', asyncHandler(createUser));
router.get('/', asyncHandler(getUsers));
router.get('/:id', asyncHandler(getUserById));
router.put('/:id', protegerRuta, esPropietario, asyncHandler(updateUser));
router.delete('/:id', protegerRuta, esPropietario, asyncHandler(deleteUser));

// Subida de avatar: autentica -> verifica que sea el dueño -> recién
// entonces multer valida tipo/tamaño y guarda el archivo en disco
router.post(
  '/:id/avatar',
  protegerRuta,
  esPropietario,
  upload.single('avatar'),
  asyncHandler(uploadAvatar)
);

module.exports = router;
