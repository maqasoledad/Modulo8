const mongoose = require('mongoose');

/**
 * Conecta la aplicación a MongoDB usando la URI definida en .env.
 * Si la conexión falla, se corta el proceso: sin base de datos la API
 * no tiene sentido que siga levantada.
 */
async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('❌ Falta la variable MONGO_URI en el archivo .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error.message);
    process.exit(1);
  }
}

module.exports = connectDB;
