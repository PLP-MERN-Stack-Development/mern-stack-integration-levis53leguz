const express = require('express');
const { body, validationResult } = require('express-validator');
const Post = require('../models/Post');
const auth = require('../middleware/auth');
const multer = require('multer');
const router = express.Router();

// simple local storage for images (for dev); switch to cloud in production
const upload = multer({ dest: 'uploads/' });

// GET /api/posts?search=...&page=1&limit=10&category=...
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, category } = req.query;
    const q = {};
    if (search) q.$or = [{ title: new RegExp(search,'i') }, { content: new RegExp(search,'i') }];
    if (category) q.categories = category;
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Post.find(q).populate('author','name').populate('categories').sort({ createdAt: -1 }).skip(+skip).limit(+limit),
      Post.countDocuments(q)
    ]);
    res.json({ items, total, page: +page, pages: Math.ceil(total/limit) });
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate('author','name').populate('categories');
    if (!post) return res.status(404).json({ message: 'Not found' });
    res.json(post);
  } catch (err) { next(err); }
});

router.post('/', auth, upload.single('featuredImage'), [
  body('title').notEmpty(),
  body('content').notEmpty()
], async (req, res, next) => {
  try {
    const errors = validationResult(req); if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { title, content, categories } = req.body;
    const slug = title.toLowerCase().replace(/\s+/g,'-').slice(0,200);
    const featuredImage = req.file ? `/uploads/${req.file.filename}` : undefined;
    const post = new Post({
      title, slug, content, excerpt: content.slice(0,200), author: req.user._id,
      categories: categories ? (Array.isArray(categories)?categories:[categories]) : [],
      featuredImage
    });
    await post.save();
    res.status(201).json(post);
  } catch (err) { next(err); }
});

router.put('/:id', auth, upload.single('featuredImage'), async (req, res, next) => {
  try {
    const updates = req.body;
    if (req.file) updates.featuredImage = `/uploads/${req.file.filename}`;
    const post = await Post.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!post) return res.status(404).json({ message: 'Not found' });
    res.json(post);
  } catch (err) { next(err); }
});

router.delete('/:id', auth, async (req, res, next) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
