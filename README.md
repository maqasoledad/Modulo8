# Gestión de Usuarios — Backend (Node.js + Express)

Proyecto integrador de los módulos 6, 7 y 8.

- ✅ **Parte 1 – Módulo 6**: estructura inicial del servidor, rutas, vistas y persistencia básica.
- ✅ **Parte 2 – Módulo 7**: conexión a MongoDB, modelado con Mongoose, relaciones y CRUD completo.
- ✅ **Parte 3 – Módulo 8**: autenticación JWT, rutas protegidas y subida de archivos.

## 📌 Requisitos del sistema

- Node.js **v18 o superior**
- npm (incluido con Node.js)
- Una instancia de **MongoDB** corriendo (local o en la nube, ej. MongoDB Atlas)

## ⚙️ Instalación

```bash
# 1. Clonar el repositorio
git clone <URL-del-repositorio>
cd gestion-usuarios-backend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# (opcional: editar PORT en .env si 3000 está ocupado)
```

## ▶️ Ejecución

```bash
# Modo desarrollo (con recarga automática via nodemon)
npm run dev

# Modo producción / ejecución simple
npm start
```

El servidor queda disponible en `http://localhost:3000` (o el puerto definido en `.env`).

## 🧪 Ejemplos de uso

| Método | Ruta       | Tipo de respuesta | Descripción                                  |
|--------|------------|--------------------|-----------------------------------------------|
| GET    | `/`        | HTML (estático)    | Página de inicio servida desde `/public`      |
| GET    | `/status`  | JSON               | Estado del servidor (uptime, entorno, fecha)  |
| GET    | `/*`       | JSON               | Cualquier ruta no definida devuelve 404       |

```bash
curl http://localhost:3000/status
# {"status":"success","message":"Servidor operativo","data":{...}}
```

Cada request queda registrado automáticamente en `logs/log.txt` con el formato:
```
[YYYY-MM-DD HH:MM:SS] MÉTODO /ruta
```

## 🗂️ Estructura del proyecto

```
├── config/
│   └── db.js                 # Conexión a MongoDB (Mongoose)
├── models/                   # Esquemas de Mongoose y sus relaciones
│   ├── User.js
│   ├── Profile.js
│   ├── Post.js
│   └── Tag.js
├── controllers/               # Lógica de negocio de cada ruta
│   ├── mainController.js
│   ├── authController.js       # Registro y login (JWT)
│   ├── userController.js
│   └── postController.js
├── middlewares/                # Middlewares propios
│   ├── logger.js               # Logging en archivo plano
│   ├── errorHandler.js         # Manejo centralizado de errores
│   ├── auth.js                 # Verificación de JWT (rutas protegidas)
│   ├── esPropietario.js        # Verifica que el :id de la URL sea el del usuario del token
│   └── upload.js                # Configuración de multer (subida de archivos)
├── routes/                     # Definición de rutas, montadas en index.js
│   ├── mainRoutes.js
│   ├── authRoutes.js
│   ├── userRoutes.js
│   └── postRoutes.js
├── public/                     # Contenido estático servido con express.static()
│   ├── index.html
│   └── style.css
├── uploads/
│   └── avatars/                 # Imágenes de perfil subidas por los usuarios
├── logs/                        # Persistencia en archivo plano de accesos
│   └── log.txt
├── services/                    # Lógica reutilizable, independiente de Express
│   ├── tokenService.js          # Firma y verificación de JWT
│   ├── tagService.js            # Resolución/creación de tags (N:M)
│   └── fileService.js           # Borrado seguro de avatares en disco
├── utils/
│   ├── asyncHandler.js          # Wrapper para controladores async
│   ├── AppError.js              # Error con código HTTP (400, 404, ...)
│   ├── escapeRegex.js           # Búsquedas de texto seguras
│   └── paginacion.js            # Normaliza ?page= y ?limit=
├── index.js                     # Punto de entrada del servidor
├── .env.example                 # Plantilla de variables de entorno
└── package.json
```

Se agregaron `services/` y `utils/` además de las carpetas mínimas pedidas
(`routes`, `controllers`, `middlewares`, `public`, `logs`) para dejar preparada
la arquitectura modular. En el Módulo 8 `services/` pasó de estar reservada a
contener lógica real (tokens, tags, archivos), separada de los controladores.

## 🧠 Decisiones técnicas y justificación

- **Archivo principal `index.js` (no `app.js`):** coincide con el campo `main`
  de `package.json` y es el nombre que Node reconoce por convención al usar
  `node .`, evitando configuración extra.
- **`express.static()` sobre `/public`:** se optó por servir un archivo HTML
  estático en `/` en lugar de un motor de plantillas, ya que en esta etapa no
  hay datos dinámicos que renderizar; la vista con motor de plantillas (EJS)
  queda como posible mejora para cuando se integren datos reales en el
  módulo 7.
- **Logging con `fs.appendFile()` en cada request:** se decidió registrar
  *todas* las peticiones (no solo errores) porque en una app de gestión de
  usuarios interesa tener trazabilidad de accesos desde el primer día, y es
  la base sobre la que luego se podrá filtrar por tipo de evento.
- **`router.js` externo (`routes/mainRoutes.js`):** las rutas se agrupan en
  un router de Express y se conectan con `app.use('/', mainRoutes)`, en vez
  de definirlas todas directamente en `index.js`, para mantener el archivo
  principal limpio y escalable a medida que se agreguen más recursos (users,
  auth, uploads, etc. en los módulos siguientes).
- **`dotenv` para el puerto:** el puerto se lee desde `.env` (con fallback a
  `3000`) para no hardcodear configuración de entorno en el código.

## ✅ Estado de cumplimiento (Parte 1 – Módulo 6)

- [x] Servidor Node.js (v18+) con Express
- [x] `package.json` completo con scripts `start` y `dev`
- [x] Dependencias: `express`, `dotenv`, `nodemon` (dev)
- [x] Al menos 2 rutas públicas (`/` y `/status`) con HTML y JSON
- [x] Contenido estático servido desde `/public`
- [x] Persistencia en archivo plano (`logs/log.txt`) con `fs.appendFile()`
- [x] Estructura modular en carpetas (routes, controllers, middlewares, public, logs)
- [x] Router externo conectado con `app.use()` (tarea PLUS)
- [ ] Variables de entorno con `dotenv` para el puerto (tarea PLUS) — ✅ implementado
- [ ] Vista dinámica con motor de plantillas (tarea PLUS opcional) — pendiente, no requerido en esta etapa

---

## 🗄️ Parte 2 – Módulo 7: Base de datos, ORM y CRUD

### Configuración

Además de instalar dependencias y copiar `.env.example` a `.env` (ver arriba),
tenés que definir `MONGO_URI`:

```bash
# Local (necesitás MongoDB instalado y corriendo en tu PC)
MONGO_URI=mongodb://localhost:27017/gestion-usuarios

# O en la nube con MongoDB Atlas (capa gratuita)
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/gestion-usuarios
```

> 💡 Si no tenés MongoDB instalado localmente, la forma más rápida es crear un
> cluster gratuito en [MongoDB Atlas](https://www.mongodb.com/atlas) y copiar
> la connection string que te da ahí.

### Modelo de datos y relaciones

| Entidad   | Relación                        | Tipo |
|-----------|----------------------------------|------|
| User ↔ Profile | Cada usuario tiene un único perfil | **1:1** |
| User ↔ Post    | Un usuario puede tener muchos posts | **1:N** |
| Post ↔ Tag     | Un post puede tener varias etiquetas, y una etiqueta puede estar en varios posts | **N:M** |

### Endpoints disponibles

**Usuarios** (`/api/users`)

| Método | Ruta            | Descripción                                  |
|--------|-----------------|-----------------------------------------------|
| POST   | `/api/users`    | Crea un usuario (y su perfil 1:1 asociado)    |
| GET    | `/api/users`    | Lista usuarios (`?search=&page=&limit=`)      |
| GET    | `/api/users/:id`| Trae un usuario con su perfil                 |
| PUT    | `/api/users/:id`| Actualiza usuario y/o su perfil               |
| DELETE | `/api/users/:id`| Elimina usuario y su perfil en cascada        |

**Posts** (`/api/posts`)

| Método | Ruta            | Descripción                                            |
|--------|-----------------|----------------------------------------------------------|
| POST   | `/api/posts`    | Crea un post (autor + tags, crea tags nuevas si no existen) |
| GET    | `/api/posts`    | Lista posts (`?search=&author=&tag=&page=&limit=`)        |
| GET    | `/api/posts/:id`| Trae un post con autor y tags poblados                    |
| PUT    | `/api/posts/:id`| Actualiza un post                                          |
| DELETE | `/api/posts/:id`| Elimina un post                                            |

### Ejemplo de uso (con `curl`)

```bash
# 1. Crear un usuario
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"maqui","email":"maqui@test.com","password":"123456","bio":"Backend dev"}'

# 2. Crear un post (usar el _id del usuario creado arriba)
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"Mi primer post","content":"Contenido de prueba","author":"<ID_DEL_USUARIO>","tags":["nodejs","mongodb"]}'

# 3. Buscar posts por etiqueta
curl "http://localhost:3000/api/posts?tag=nodejs"

# 4. Buscar posts por texto
curl "http://localhost:3000/api/posts?search=primer"
```

### 🧠 Decisiones técnicas y justificación (Módulo 7)

- **MongoDB + Mongoose** en lugar de PostgreSQL/Sequelize: se adapta mejor a
  un modelo con documentos flexibles (perfiles con campos opcionales) y
  simplifica el uso de `populate()` para simular relaciones tipo JOIN.
- **Relaciones con `ObjectId` + `populate()`**: aunque MongoDB es una base
  documental sin relaciones nativas como SQL, Mongoose permite modelar 1:1,
  1:N y N:M mediante referencias, cumpliendo el requisito sin forzar un
  modelo relacional que no es natural en Mongo.
- **Hash de contraseña con `bcryptjs` en un hook `pre('save')`**: se protege
  la contraseña desde el modelo, sin depender de que cada controlador se
  acuerde de hashearla. La verificación (login) se integrará en el módulo 8
  junto con JWT.
- **`asyncHandler` + middleware de errores centralizado**: evita repetir
  `try/catch` en cada controlador y traduce errores típicos de Mongoose
  (`ValidationError`, `CastError`, clave duplicada `11000`) a respuestas HTTP
  claras, manteniendo siempre el formato `{ status, message, data }`.
- **Búsqueda de texto con índice `text`**: se usa `$text` sobre título y
  contenido de `Post` para las búsquedas dinámicas (`?search=`), más
  eficiente que un `$regex` sobre grandes volúmenes de datos.
- **Creación automática de tags inexistentes**: al crear/editar un post, si
  una etiqueta no existe todavía se crea sola (`findOne` + `create`), para
  que el front no tenga que gestionar un CRUD de tags aparte en esta etapa.

### ✅ Estado de cumplimiento (Parte 2 – Módulo 7)

- [x] Conexión a base de datos real (MongoDB)
- [x] Modelado y relación de entidades con ORM (1:1, 1:N y N:M)
- [x] CRUD completo sobre dos entidades clave (User y Post)
- [x] Consultas filtradas y búsquedas dinámicas (`search`, `author`, `tag`)
- [x] Manejo de errores y validaciones centralizado

## 🔜 Próximos pasos

- **Módulo 8:** autenticación con JWT (login/registro), rutas protegidas,
  subida de archivos (imágenes de usuario) con validación de tipo/tamaño, y
  formalización de la API RESTful completa.

---

## 🔐 Parte 3 – Módulo 8: Autenticación JWT, rutas protegidas y subida de archivos

### Configuración adicional

Sumá estas dos variables a tu `.env` (ya están en `.env.example`):

```bash
JWT_SECRET=una-clave-secreta-larga-y-aleatoria
JWT_EXPIRES_IN=1d
```

> ⚠️ `JWT_SECRET` debería ser una cadena larga y difícil de adivinar,
> distinta en cada entorno. Nunca se sube al repositorio (por eso `.env`
> está en `.gitignore`).

### Endpoints nuevos

**Autenticación** (`/api/auth`) — públicos

| Método | Ruta                  | Descripción                                  |
|--------|-----------------------|-----------------------------------------------|
| POST   | `/api/auth/register`  | Crea un usuario + perfil y devuelve un JWT    |
| POST   | `/api/auth/login`     | Valida credenciales y devuelve un JWT         |
| GET    | `/api/auth/me`        | 🔒 Devuelve el usuario dueño del token (sirve para comprobar que el token sigue vigente) |

**Avatar** (dentro de `/api/users`)

| Método | Ruta                        | Protección | Descripción                          |
|--------|-----------------------------|------------|----------------------------------------|
| POST   | `/api/users/:id/avatar`     | 🔒 JWT + dueño | Sube una imagen de perfil (`multipart/form-data`, campo `avatar`) |

### Qué rutas quedaron protegidas

| Ruta                     | Antes (Módulo 7) | Ahora (Módulo 8)                          |
|---------------------------|------------------|---------------------------------------------|
| `POST /api/posts`         | Pública          | 🔒 Requiere JWT (el autor sale del token)    |
| `PUT /api/posts/:id`      | Pública          | 🔒 Requiere JWT + ser el autor del post      |
| `DELETE /api/posts/:id`   | Pública          | 🔒 Requiere JWT + ser el autor del post      |
| `PUT /api/users/:id`      | Pública          | 🔒 Requiere JWT + ser el propio usuario      |
| `DELETE /api/users/:id`   | Pública          | 🔒 Requiere JWT + ser el propio usuario      |
| `GET /api/posts`, `GET /api/posts/:id`, `GET /api/users`, `GET /api/users/:id` | Pública | Se mantienen públicas (lectura) |

### Ejemplo de uso (con `curl`)

```bash
# 1. Registrarse (devuelve el token)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"maqui","email":"maqui@test.com","password":"123456"}'

# Respuesta: { "data": { "token": "eyJhbGciOi...", "user": {...} } }

# 2. Login (si ya existe el usuario)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"maqui@test.com","password":"123456"}'

# 3. Crear un post usando el token del paso 1 o 2
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <PEGAR_TOKEN_ACA>" \
  -d '{"title":"Mi post autenticado","content":"contenido","tags":["nodejs"]}'

# 4. Intentar crear un post SIN token (debe devolver 401)
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"Sin token","content":"esto debería fallar"}'

# 5. Subir un avatar (usando el id del usuario y su propio token)
curl -X POST http://localhost:3000/api/users/<ID_DEL_USUARIO>/avatar \
  -H "Authorization: Bearer <PEGAR_TOKEN_ACA>" \
  -F "avatar=@/ruta/a/mi/foto.jpg"
```

### 🧠 Decisiones técnicas y justificación (Módulo 8)

- **El autor de un post sale del token, nunca del body**: si se confiara en
  un campo `author` enviado por el cliente, cualquiera podría publicar un
  post a nombre de otro usuario. Al tomarlo de `req.user._id` (puesto por el
  middleware de autenticación), queda garantizado que el autor real es quien
  se autenticó.
- **Ownership check en `update`/`delete`**: no alcanza con "estar logueado"
  para editar cualquier post o usuario — se verifica explícitamente que el
  recurso pertenezca a quien hace la request (`403 Forbidden` si no).
- **Mensaje de error genérico en login** (`"Credenciales inválidas"` tanto si
  el email no existe como si la contraseña es incorrecta): evita que alguien
  pueda usar el login para averiguar qué emails están registrados
  (user enumeration).
- **`select: false` en el campo `password` del modelo `User`**: la contraseña
  nunca se devuelve por accidente en un `GET /api/users`; solo se trae
  explícitamente con `.select('+password')` en el login, donde sí hace falta.
- **Multer con `diskStorage` y `fileFilter`**: se valida el tipo de archivo
  (`image/jpeg`, `image/png`, `image/webp`) y el tamaño (máximo 2 MB) *antes*
  de guardarlo en disco, evitando que se suban archivos ejecutables o
  demasiado pesados.
- **Nombre de archivo único (`userId-timestamp.ext`)**: evita que dos
  usuarios pisen el avatar del otro por casualidad, o que se puedan adivinar
  fácilmente los nombres de archivo de otra persona.
- **`/uploads` servido como estático**: una vez subida la imagen, se accede
  directamente vía URL (`/uploads/avatars/archivo.jpg`), igual que el resto
  del contenido estático de `/public`.

### ✅ Estado de cumplimiento (Parte 3 – Módulo 8)

- [x] API RESTful con rutas protegidas mediante JWT
- [x] Registro y login de usuarios
- [x] Subida de archivos (avatar de usuario)
- [x] Validación de tipo y tamaño de archivo en el endpoint de subida
- [x] Respuestas de la API con formato consistente (`status`, `message`, `data`)
- [x] Estructura `controllers/`, `routes/`, `middlewares/` y `services/`

### 🔑 Cómo autenticarse (paso a paso)

1. `POST /api/auth/register` (o `/api/auth/login` si ya existe la cuenta) → la respuesta trae `data.token`.
2. Enviar ese token en **cada** request a una ruta protegida, en el header
   `Authorization: Bearer <token>`.
3. Si el token falta → `401 "falta el token de acceso"`; si expiró →
   `401 "el token expiró, iniciá sesión nuevamente"`; si está alterado →
   `401 "token inválido"`; si es válido pero el recurso es de otro usuario → `403`.

### 📮 Códigos de respuesta usados

| Código | Cuándo |
|--------|--------|
| 200 / 201 | Operación exitosa / recurso creado |
| 400 | Datos inválidos (validaciones de Mongoose, tipos incorrectos, ID mal formado, tipo de archivo no permitido) |
| 401 | Sin token, token inválido o expirado, credenciales incorrectas |
| 403 | Autenticado, pero el recurso pertenece a otro usuario |
| 404 | Recurso o ruta inexistente |
| 409 | Valor duplicado (`username`, `email`, `tag`) |
| 413 | Archivo mayor a 2 MB |

### 🔁 Iteraciones y mejoras sobre las partes anteriores

Al consolidar el backend se revisó lo construido en los Módulos 6 y 7 y se ajustó:

| Cambio | Motivo |
|--------|--------|
| `User.js`: el hook `pre('save')` ya no usa `next()` | Con Mongoose 9 los hooks `async` no reciben `next`; con él el registro fallaba con `next is not a function`. |
| Nuevo middleware `esPropietario`, ubicado **antes** de multer | Antes el archivo se guardaba en disco y recién después se comprobaba que fuera del dueño: un usuario autenticado podía llenar el disco subiendo archivos "a nombre" de otro. |
| Error de tipo de archivo con `AppError(…, 400)`; `LIMIT_FILE_SIZE` → 413 | Un `Error` común caía en el `errorHandler` como `500`; es un error del cliente, no del servidor. |
| Extensión del archivo según el tipo MIME validado | El nombre original lo controla el cliente (`foto.php`). |
| Al reemplazar o eliminar, se borra el avatar anterior (`fileService`) | Evita archivos huérfanos. El borrado solo actúa dentro de `uploads/avatars` (anti *path traversal*). |
| `services/` con `tokenService`, `tagService`, `fileService` | La consigna pide separar rutas, controladores, middlewares **y servicios**; la lógica reutilizable salió de los controladores y `utils/`. |
| Validación de tipos en login/registro y `String()` en filtros | Evita inyección NoSQL (`{"email": {"$gt": ""}}`) y errores 500 por tipos inesperados. |
| `escapeRegex` y `parsePaginacion` | Las búsquedas usaban `$regex` con texto del usuario sin escapar y `?limit=` sin tope. |
| Mensajes JWT distintos (expirado / inválido) y algoritmo fijado a HS256 | Consigna: "verificar expiración y validez del token"; que el cliente sepa si debe volver a loguearse. |
| Se agregó `cors` | Para poder consumir la API desde un front-end en otro origen. |
| `GET /api/auth/me` | Permite comprobar un token sin tocar datos. |
| `JWT_SECRET` obligatorio al iniciar | Falla al arrancar en vez de devolver 500 en cada ruta protegida. |
| `npm audit fix` | Dependencias sin vulnerabilidades conocidas. |

### 🧩 Justificación técnica adicional (Módulo 8)

- **¿Cómo separé rutas y controladores?** Las rutas solo declaran método, path y
  middlewares (autenticación → propiedad → subida); los controladores resuelven
  cada request; los servicios concentran lógica reutilizable. Así se puede
  probar y modificar cada capa sin tocar las demás.
- **¿Qué valido antes de insertar/modificar?** Tipos y campos obligatorios en
  registro/login; reglas del esquema de Mongoose (`required`, `minlength`,
  `match`, `unique`) con `runValidators: true` en las actualizaciones; ID válido
  (`CastError` → 400); que `tags` sea un array de textos; y tipo/tamaño del archivo.
- **¿Por qué protegí esas rutas?** Las que **modifican datos** (`POST/PUT/DELETE`
  de posts y `PUT/DELETE` de usuarios) y la **subida de archivos** exigen JWT
  porque necesitan saber *quién* actúa y evitar que se edite lo ajeno. La lectura
  (`GET`) queda pública para que la API pueda alimentar un sitio abierto.
- **¿Dónde y cómo almacena el token?** El servidor **no lo almacena**: el JWT es
  *stateless* y se valida con la firma (`JWT_SECRET`) y la expiración
  (`JWT_EXPIRES_IN`). El cliente lo guarda tras el login y lo envía en el header
  `Authorization: Bearer`. En un front web es preferible memoria o cookie
  `httpOnly` antes que `localStorage`, que es accesible desde JavaScript ante un XSS.
- **¿Por qué el avatar se asocia al `Profile`?** Es la relación 1:1 del Módulo 7:
  en la base solo se guarda la URL pública, no el binario, y el archivo vive en
  `uploads/avatars/`.

### 🧠 Reflexión: cómo se integraron los 3 módulos

- **Módulo 6** dio la base: servidor Express, rutas públicas, contenido estático
  y logs en archivo plano. Ese `logger` sigue registrando cada request de la API.
- **Módulo 7** aportó los modelos y relaciones (1:1 User–Profile, 1:N User–Post,
  N:M Post–Tag), el CRUD y las búsquedas filtradas.
- **Módulo 8** expuso todo eso como API REST segura: JWT, propiedad de recursos,
  subida de archivos y errores con formato uniforme. Al integrarlo aparecieron
  problemas que no se veían en cada módulo por separado (el hook de Mongoose 9,
  el orden entre autorización y multer), y corregirlos obligó a volver sobre las
  partes anteriores. Esa es la principal enseñanza: cada capa depende de las demás.

## 🔜 Próximos pasos (mejoras posibles)

- Refresh tokens para no forzar un nuevo login tan seguido.
- Roles de usuario (admin vs usuario común) para permisos más finos.
- Tests automatizados (Jest + Supertest) para los endpoints principales.
- Documentar la API con Swagger/OpenAPI (tarea PLUS de la consigna).
