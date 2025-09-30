const Category = require('../models/category.model');
const Offer = require('../models/offer.model');
const Store = require('../models/store.model');
const logger = require('../utils/logger');

// @route   GET /api/categories
// @desc    Get all categories with store and offer counts
// @access  Public
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate('storeCount offerCount');
    res.json(categories);
  } catch (err) {
    logger.error('Error in getAllCategories:', { error: err.message, stack: err.stack });
    res.status(500).send('Server Error');
  }
};

// @route   GET /api/categories/:id
// @desc    Get a single category by ID
// @access  Public
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ msg: 'Category not found' });
    }

    const stores = await Store.find({ category: req.params.id });
    const offers = await Offer.find({ category: req.params.id }).populate('store');

    res.json({
      category,
      stores,
      offers
    });
  } catch (err) {
    logger.error('Error in getCategoryById:', { error: err.message, stack: err.stack });
    res.status(500).send('Server Error');
  }
};

// @route   GET /api/categories/:id/offers
// @desc    Get all offers for a specific category
// @access  Public
exports.getOffersByCategory = async (req, res) => {
    try {
        const offers = await Offer.find({ category: req.params.id }).populate('store', 'name logo');
        res.json(offers);
    } catch (err) {
        logger.error('Error in getOffersByCategory:', { error: err.message, stack: err.stack });
        res.status(500).send('Server Error');
    }
};

// @route   GET /api/categories/:id/stores
// @desc    Get all stores for a specific category
// @access  Public
exports.getStoresByCategory = async (req, res) => {
    try {
        const stores = await Store.find({ category: req.params.id });
        res.json(stores);
    } catch (err) {
        logger.error('Error in getStoresByCategory:', { error: err.message, stack: err.stack });
        res.status(500).send('Server Error');
    }
};

// @route   POST /api/categories
// @desc    Create a new category
// @access  Admin
exports.createCategory = async (req, res) => {
    const { name, description, icon } = req.body;
    try {
        let category = await Category.findOne({ name });
        if (category) {
            return res.status(400).json({ msg: 'Category with this name already exists' });
        }
        const newCategory = new Category({ name, description, icon });
        category = await newCategory.save();
        res.status(201).json(category);
    } catch (err) {
        logger.error('Error in createCategory:', { error: err.message, stack: err.stack });
        res.status(500).send('Server Error');
    }
};

// @route   PUT /api/categories/:id
// @desc    Update a category
// @access  Admin
exports.updateCategory = async (req, res) => {
    const { name, description, icon } = req.body;
    try {
        let category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ msg: 'Category not found' });
        }
        
        category.name = name || category.name;
        category.description = description || category.description;
        category.icon = icon || category.icon;

        await category.save();
        res.json(category);
    } catch (err) {
        logger.error('Error in updateCategory:', { error: err.message, stack: err.stack });
        res.status(500).send('Server Error');
    }
};

// @route   DELETE /api/categories/:id
// @desc    Delete a category
// @access  Admin
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ msg: 'Category not found' });
        }
        
        // Optional: Check if any stores or offers are using this category before deleting
        // const offers = await Offer.countDocuments({ category: req.params.id });
        // if (offers > 0) { ... return error ... }

        await category.deleteOne();
        res.json({ msg: 'Category removed' });
    } catch (err) {
        logger.error('Error in deleteCategory:', { error: err.message, stack: err.stack });
        res.status(500).send('Server Error');
    }
};