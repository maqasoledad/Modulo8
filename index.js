// Se elige "index.js" como archivo principal (en vez de "app.js") porque es
// el punto de entrada por convención en el campo "main" de package.json y
// npm/node lo reconocen automáticamente al ejecutar "node ." — mantiene
// coherencia con la configuración del proyecto sin pasos adicionales.

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const connectDB = require('./config/db');
const requestLogger = require('./middlewares/logger');
const errorHandler = require('./middlewares/errorHandler');
const mainRoutes = require('./routes/mainRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');

// Sin JWT_SECRET no se puede firmar ni verificar tokens: mejor fallar al
// arrancar que devolver errores 500 en cada request protegida.
if (!process.env.JWT_SECRET) {
  console.error('❌ Falta la variable JWT_SECRET en el archivo .env');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middlewares globales ---
app.use(cors()); // permite que un front-end en otro origen consuma la API
app.use(express.json()); // parseo de JSON en el body de los requests
app.use(requestLogger); // registro de cada visita en logs/log.txt

// Servir contenido estático desde /public (CSS, imágenes, HTML simples)
app.use(express.static(path.join(__dirname, 'public')));
// Servir los avatares subidos por los usuarios
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Rutas ---
app.use('/', mainRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

// --- Manejo de rutas no encontradas ---
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Ruta no encontrada',
    data: null,
  });
});

// --- Manejo centralizado de errores (siempre al final) ---
app.use(errorHandler);

// Primero se conecta a la base de datos y recién después se levanta el
// servidor, para evitar aceptar requests sin tener acceso a los datos.
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log('Servidor iniciado');
    console.log(`Escuchando en http://localhost:${PORT}`);
  });
});
