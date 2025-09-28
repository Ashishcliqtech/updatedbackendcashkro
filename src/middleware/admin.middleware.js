const User = require('../models/user.model');
const logger = require('../utils/logger');

module.exports = async function (req, res, next) {
    try {
        const user = await User.findById(req.user.id);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ msg: 'Access denied. Admins only.' });
        }
        next();
    } catch (err) {
        logger.error('Error in admin middleware:', { error: err.message, stack: err.stack });
        res.status(500).json({ msg: 'Server error' });
    }
};

