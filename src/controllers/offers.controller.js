const Offer = require('../models/offer.model');

exports.getOffers = async (req, res) => {
  try {
    const offers = await Offer.find().populate('store').populate('category');
    res.json({ offers });
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