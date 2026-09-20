const Post = require('../models/Post');
const Tag = require('../models/Tag');
const { resolveTagIds } = require('../services/tagService');
const parsePaginacion = require('../utils/paginacion');

/**
 * POST /api/posts
 * Crea un post asociado al usuario autenticado (author sale del token,
 * nunca del body: así nadie puede publicar posts a nombre de otro usuario).
 */
async function createPost(req, res) {
  const { title, content, tags, publicado } = req.body;

  const tagIds = await resolveTagIds(tags);

  const post = await Post.create({
    title,
    content,
    author: req.user._id,
    tags: tagIds,
    publicado,
  });

  const postCompleto = await Post.findById(post._id)
    .populate('author', 'username email')
    .populate('tags', 'name');

  res.status(201).json({
    status: 'success',
    message: 'Post creado correctamente',
    data: { post: postCompleto },
  });
}

/**
 * GET /api/posts
 * Lista posts con filtros dinámicos combinables:
 *  - ?search=palabra   -> búsqueda de texto en título/contenido
 *  - ?author=<id>      -> posts de un autor puntual
 *  - ?tag=nombre       -> posts que tengan esa etiqueta
 *  - ?page= &limit=    -> paginación
 */
async function getPosts(req, res) {
  const { search, author, tag } = req.query;
  const { page, limit, skip } = parsePaginacion(req.query);

  const filtro = {};

  // String(...): si llega ?search[$ne]=x (objeto) se convierte en texto
  // inofensivo en vez de usarse como operador de MongoDB
  if (search) {
    filtro.$text = { $search: String(search) };
  }
  if (author) {
    filtro.author = String(author);
  }
  if (tag) {
    const tagDoc = await Tag.findOne({ name: String(tag).toLowerCase() });
    // Si la tag no existe, se fuerza un filtro que no matchea nada
    filtro.tags = tagDoc ? tagDoc._id : null;
  }

  const posts = await Post.find(filtro)
    .populate('author', 'username email')
    .populate('tags', 'name')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Post.countDocuments(filtro);

  res.status(200).json({
    status: 'success',
    message: 'Posts obtenidos correctamente',
    data: { posts, total, page, limit },
  });
}

/**
 * GET /api/posts/:id
 */
async function getPostById(req, res) {
  const post = await Post.findById(req.params.id)
    .populate('author', 'username email')
    .populate('tags', 'name');

  if (!post) {
    return res.status(404).json({
      status: 'error',
      message: 'Post no encontrado',
      data: null,
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Post encontrado',
    data: { post },
  });
}

/**
 * PUT /api/posts/:id
 * Solo el autor del post puede editarlo.
 */
async function updatePost(req, res) {
  const { title, content, tags, publicado } = req.body;

  const postExistente = await Post.findById(req.params.id);

  if (!postExistente) {
    return res.status(404).json({
      status: 'error',
      message: 'Post no encontrado',
      data: null,
    });
  }

  if (postExistente.author.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      status: 'error',
      message: 'No tenés permiso para editar este post',
      data: null,
    });
  }

  const camposActualizar = { title, content, publicado };

  if (tags) {
    camposActualizar.tags = await resolveTagIds(tags);
  }

  const post = await Post.findByIdAndUpdate(req.params.id, camposActualizar, {
    new: true,
    runValidators: true,
  })
    .populate('author', 'username email')
    .populate('tags', 'name');

  res.status(200).json({
    status: 'success',
    message: 'Post actualizado correctamente',
    data: { post },
  });
}

/**
 * DELETE /api/posts/:id
 * Solo el autor del post puede eliminarlo.
 */
async function deletePost(req, res) {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({
      status: 'error',
      message: 'Post no encontrado',
      data: null,
    });
  }

  if (post.author.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      status: 'error',
      message: 'No tenés permiso para eliminar este post',
      data: null,
    });
  }

  await post.deleteOne();

  res.status(200).json({
    status: 'success',
    message: 'Post eliminado correctamente',
    data: null,
  });
}

module.exports = { createPost, getPosts, getPostById, updatePost, deletePost };
