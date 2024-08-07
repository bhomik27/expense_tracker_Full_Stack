
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const generateAccessToken = (_id, name) => {
    return jwt.sign({ userId: _id, name: name }, process.env.TOKEN_SECRET);
};

const signup = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required.' });
        }

        const existingUser = await User.findOne({ email }).session(session);
        if (existingUser) {
            await session.abortTransaction();
            session.endSession();
            return res.status(409).json({ message: 'Email already exists. Please use a different email.' });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        await User.create([{ name, email, password: hashedPassword }], { session });

        await session.commitTransaction();
        session.endSession();

        return res.status(201).json({
            message: 'User signed up successfully!',
            user: { name, email }
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Error during signup:', error);
        return res.status(500).json({ message: 'Error during signup process. Please try again later.' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Compare hashed password
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Incorrect Password.' });
        }

        return res.status(200).json({
            success: true,
            message: 'User login successful!',
            token: generateAccessToken(user._id, user.name)
        });
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ message: 'Error during login process. Please try again later.' });
    }
};

const checkPremiumStatus = async (req, res) => {
    try {
        const token = req.header('Authorization');

        if (!token) {
            return res.status(401).json({ error: 'Token is required' });
        }

        const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
        // console.log(decodedToken)

        const userId = decodedToken.userId;

        const user = await User.findById(userId);

        if (user) {
            res.status(200).json({ isPremiumUser: user.isPremiumUser });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { signup, login, checkPremiumStatus };



// const bcrypt = require('bcryptjs');
// const User = require('../models/user');
// const jwt = require('jsonwebtoken');
// const  sequelize = require('../util/database');

// const generateAccessToken = (id, name) => {
//     return jwt.sign({ userId: id, name: name }, process.env.TOKEN_SECRET);
// };


// const signup = async (req, res) => {
//     const t = await sequelize.transaction();
    
//     try {
//         const { name, email, password } = req.body;

//         if (!name || !email || !password) {
//             return res.status(400).json({ message: 'Name, email, and password are required.' });
//         }

//         const existingUser = await User.findOne({ where: { email }, transaction: t });
//         if (existingUser) {
//             await t.rollback();
//             return res.status(409).json({ message: 'Email already exists. Please use a different email.' });
//         }

//         const saltRounds = 10;
//         const hashedPassword = await bcrypt.hash(password, saltRounds);

//         await User.create({ name, email, password: hashedPassword }, { transaction: t });

//         await t.commit();

//         return res.status(201).json({
//             message: 'User signed up successfully!',
//             user: { name, email }
//         });
//     } catch (error) {
//         console.error('Error during signup:', error);
//         await t.rollback();
//         return res.status(500).json({ message: 'Error during signup process. Please try again later.' });
//     }
// };



// const login = async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         const user = await User.findOne({ where: { email } });

//         if (!user) {
//             return res.status(404).json({ message: 'User not found.' });
//         }

//         // Compare hashed password
//         const passwordMatch = await bcrypt.compare(password, user.password);

//         if (!passwordMatch) {
//             return res.status(401).json({ message: 'Incorrect Password.' });
//         }

//         return res.status(200).json({
//             success: true,
//             message: 'User login successful!',
//             token: generateAccessToken(user._id, user.name)
//         });
//     } catch (error) {
//         console.error('Error during login:', error);
//         return res.status(500).json({ message: 'Error during login process. Please try again later.' });
//     }
// };

// const checkPremiumStatus = async (req, res) => {
//     try {
//         const token = req.headers.authorization;
//         const decodedToken = jwt.verify(token, 'irawhseham'); 

//         const userId = decodedToken.userId;

//         const user = await User.findByPk(userId);

//         if (user) {
//             res.status(200).json({ isPremiumUser: user.ispremiumuser });
//         } else {
//             res.status(404).json({ error: 'User not found' });
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };

// module.exports = { signup, login, checkPremiumStatus };