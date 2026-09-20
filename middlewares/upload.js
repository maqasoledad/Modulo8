const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AppError = require('../utils/AppError');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'avatars');

// Asegura que la carpeta de destino exista
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Solo se permiten imágenes. La extensión se deriva del tipo MIME validado
// y NO del nombre original (que controla el cliente y podría ser "foto.php").
const EXTENSIONES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    // Nombre único: userId + timestamp + extensión según el tipo MIME
    cb(null, `${req.user._id}-${Date.now()}${EXTENSIONES[file.mimetype]}`);
  },
});

function fileFilter(req, file, cb) {
  if (EXTENSIONES[file.mimetype]) {
    cb(null, true);
  } else {
    // AppError con 400: antes era un Error común y respondía 500
    cb(new AppError('Tipo de archivo no permitido. Solo se aceptan JPG, PNG o WEBP.', 400));
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024, files: 1 }, // máximo 2 MB, un archivo
});

module.exports = upload;
