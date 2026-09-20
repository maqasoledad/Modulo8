const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const protegerRuta = require('../middlewares/auth');
const {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
} = require('../controllers/postController');

// Rutas públicas: cualquiera puede leer posts
router.get('/', asyncHandler(getPosts));
router.get('/:id', asyncHandler(getPostById));

// Rutas privadas: requieren estar autenticado con JWT
router.post('/', protegerRuta, asyncHandler(createPost));
router.put('/:id', protegerRuta, asyncHandler(updatePost));
router.delete('/:id', protegerRuta, asyncHandler(deletePost));

module.exports = router;
