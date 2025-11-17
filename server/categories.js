const express = require('express');
const { body, validationResult } = require('express-validator');
const Category = require('../models/Category');
const router = express.Router();

router.get('/', async (req, res, next) => {
  try { const cats = await Category.find().sort('name'); res.json(cats); } catch (err) { next(err); }
});

router.post('/', [
  body('name').notEmpty()
], async (req, res, next) => {
  try {
    const errors = validationResult(req); if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { name } = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const cat = new Category({ name, slug });
    await cat.save();
    res.status(201).json(cat);
  } catch (err) { next(err); }
});

module.exports = router;
