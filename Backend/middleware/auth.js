const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authenticate = async (req, res, next) => {
    try {
        // Extract token from Authorization header
        const token = req.header('Authorization');
        // console.log("token", token);

        if (!token) {
            return res.status(401).json({ success: false, message: 'Token not provided' });
        }

        // Verify token and decode it
        const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
        // console.log("decodedToken", decodedToken);

        const userId = decodedToken.userId; 
        
        // console.log("userId", userId);

        // Find user by ID
        const foundUser = await User.findById(userId);

        // console.log("", foundUser);


        if (!foundUser) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        // Attach user to request object
        req.user = foundUser;
        next();
    } catch (err) {
        console.error('Authentication error:', err);
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

module.exports = {
    authenticate
};



// const jwt = require('jsonwebtoken');
// const User = require('../models/user');

// const authenticate = async (req, res, next) => {
//     try {
//         const token = req.header('Authorization');

//         if (!token) {
//             return res.status(401).json({ success: false, message: 'Token not provided' });
//         }

//         const user = jwt.verify(token, process.env.TOKEN_SECRET);
//         console.log("USERID <<<<<<<<", user._id);

//         const foundUser = await User.findByPk(user._id);

//         if (!foundUser) {
//             return res.status(401).json({ success: false, message: 'User not found' });
//         }

//         req.user = foundUser;
//         next();
//     } catch (err) {
//         console.error(err);
//         return res.status(401).json({ success: false, message: 'Invalid token' });
//     }
// };

// module.exports = {
//     authenticate
// };


