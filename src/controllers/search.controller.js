
const Store = require('../models/store.model');
const Category = require('../models/category.model');
const Offer = require('../models/offer.model');

exports.search = async (req, res) => {
  try {
    const { query } = req.query;

    const stores = await Store.find({ $text: { $search: query } });
    const categories = await Category.find({ $text: { $search: query } });
    const offers = await Offer.find({ $text: { $search: query } });

    res.json({ stores, categories, offers });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
