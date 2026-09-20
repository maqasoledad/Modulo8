const express = require('express');
const router = express.Router();
const { home, status } = require('../controllers/mainController');

// Ruta pública HTML
router.get('/', home);

// Ruta pública JSON
router.get('/status', status);

module.exports = router;
