const fs = require('fs/promises');
const path = require('path');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'avatars');

/**
 * Elimina un avatar del disco a partir de su URL pública
 * (ej: /uploads/avatars/abc.jpg). Se usa al reemplazar un avatar o al
 * fallar una operación, para no dejar archivos huérfanos.
 *
 * Seguridad: solo borra archivos dentro de uploads/avatars. Se resuelve la
 * ruta absoluta para bloquear intentos de path traversal (../../).
 */
async function eliminarArchivoSubido(urlPublica) {
  if (!urlPublica || !urlPublica.startsWith('/uploads/avatars/')) return;

  const absoluta = path.resolve(__dirname, '..', urlPublica.replace(/^\//, ''));
  if (!absoluta.startsWith(UPLOAD_DIR + path.sep)) return;

  try {
    await fs.unlink(absoluta);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('No se pudo eliminar el archivo:', error.message);
    }
  }
}

module.exports = { eliminarArchivoSubido };
