const Offer = require('../models/offer.model');

exports.getOffers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const { store, category, type } = req.query;

    const query = {};
    if (store) query.store = store;
    if (category) query.category = category;
    if (type) query.offerType = type;

    const offers = await Offer.find(query)
      .populate('store')
      .populate('category')
      .skip((page - 1) * limit)
      .limit(limit);
      
    const totalOffers = await Offer.countDocuments(query);

    res.json({
        offers,
        totalPages: Math.ceil(totalOffers / limit),
        currentPage: page
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate('store').populate('category');
    if (!offer) {
      return res.status(404).json({ msg: 'Offer not found' });
    }
    res.json(offer);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.createOffer = async (req, res) => {
  try {
    const {
      title,
      description,
      store,
      cashbackRate,
      offerType,
      category,
      expiryDate,
    } = req.body;

    const newOffer = new Offer({
      title,
      description,
      store,
      cashbackRate,
      offerType,
      category,
      expiryDate,
      imageUrl: req.file.path,
    });

    const offer = await newOffer.save();
    res.json(offer);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
