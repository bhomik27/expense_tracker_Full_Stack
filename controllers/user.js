// Import necessary modules
const axios = require('axios');
const User = require('../models/user');


// Controller function for handling signup form submission
async function signup(req, res) {
    try {
        const { name, email, password } = req.body; // Assuming request body contains these fields

        // Validate the inputs (You might want to add more robust validation here)
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required.' });
        }

        // Check if the email already exists in the database
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already exists. Please use a different email.' });
        }

        // Create a new user in the database using Sequelize model
        const newUser = await User.create({ name, email, password });

        // Post the data to the server using Axios
        const response = await axios.post('http://your-api-endpoint/signup', {
            name: newUser.name,
            email: newUser.email,
            // Exclude sending the password in response for security reasons
        });

        // Handle the response from the server as needed
        console.log('Server response:', response.data);

        // Send a success response to the client
        return res.status(201).json({ message: 'User signed up successfully!' });
    } catch (error) {
        console.error('Error during signup:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
}

module.exports = { signup };
