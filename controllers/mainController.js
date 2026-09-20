/**
 * GET /
 * Ruta pública que sirve la página de inicio (HTML) desde /public.
 * No necesita lógica propia: Express la resuelve vía express.static(),
 * pero se deja también una respuesta de respaldo por si /public no está disponible.
 */
function home(req, res) {
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="es">
      <head><meta charset="UTF-8" /><title>Inicio</title></head>
      <body>
        <h1>Servidor funcionando correctamente 🚀</h1>
        <p>Visitá <a href="/status">/status</a> para ver el estado en formato JSON.</p>
      </body>
    </html>
  `);
}

/**
 * GET /status
 * Ruta pública que devuelve el estado del servidor en formato JSON.
 * Cumple con el formato de respuesta consistente que luego se usará en toda la API.
 */
function status(req, res) {
  res.status(200).json({
    status: 'success',
    message: 'Servidor operativo',
    data: {
      uptimeSegundos: process.uptime().toFixed(2),
      entorno: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    },
  });
}

module.exports = { home, status };
