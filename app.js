const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import cors
const sequelize = require('./util/database');
const axios = require('axios');

const userRoutes = require('./routes/user');
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors()); // Enable CORS for all routes

// Routes
app.use('/user', userRoutes);

sequelize.sync()
    .then(() => {
        app.listen(3000, () => {
            console.log('Server is running on port 3000');
        });
    })
    .catch(err => console.log(err));

