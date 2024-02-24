const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization');

        if (!token) {
            return res.status(401).json({ success: false, message: 'Token not provided' });
        }

        const user = jwt.verify(token, process.env.TOKEN_SECRET);
        // console.log("USERID <<<<<<<<", user.userId);

        const foundUser = await User.findByPk(user.userId);

        if (!foundUser) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        req.user = foundUser;
        next();
    } catch (err) {
        console.error(err);
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

module.exports = {
    authenticate
};


