const User = require('../models/user.model');

module.exports = async function (req, res, next) {
    try {
        const user = await User.findById(req.user.id);
        if (user.role !== 'admin') {
            return res.status(403).json({ msg: 'Access denied. Admins only.' });
        }
        next();
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
};
