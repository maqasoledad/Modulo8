const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const protegerRuta = require('../middlewares/auth');
const { register, login, me } = require('../controllers/authController');

router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));

// Ruta protegida: devuelve el usuario dueño del token
router.get('/me', protegerRuta, asyncHandler(me));

module.exports = router;
