const Category = require('../models/category.model');

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, icon, description } = req.body;
    const newCategory = new Category({
      name,
      icon,
      description,
    });
    const category = await newCategory.save();
    res.json(category);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};