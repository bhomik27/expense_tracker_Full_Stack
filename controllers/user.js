const User = require('../models/user');

const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required.' });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already exists. Please use a different email.' });
        }

        const newUser = await User.create({ name, email, password });

        return res.status(201).json({ message: 'User signed up successfully!', user: { name: newUser.name, email: newUser.email } });
    } catch (error) {
        console.error('Error during signup:', error);
        return res.status(500).json({ message: 'Error during signup process. Please try again later.' });
    }
};
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (password !== user.password) {
            return res.status(401).json({ message: 'Incorrect Password.' });
        }

        return res.status(200).json({ message: 'User login successful!', user: { name: user.name, email: user.email } });
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ message: 'Error during login process. Please try again later.' });
    }
};


module.exports = { signup, login };
