const Store = require('../models/store.model');

exports.getStores = async (req, res) => {
  try {
    const stores = await Store.find().populate('category');
    res.json({ stores });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getStore = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id).populate('category');
    if (!store) {
      return res.status(404).json({ msg: 'Store not found' });
    }
    res.json(store);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.createStore = async (req, res) => {
  try {
    const { name, description, cashbackRate, category, isPopular, website } = req.body;
    const newStore = new Store({
      name,
      description,
      cashbackRate,
      category,
      isPopular,
      website,
      logo: req.files.logo[0].path,
      banner: req.files.banner ? req.files.banner[0].path : '',
    });

    const store = await newStore.save();
    res.json(store);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};