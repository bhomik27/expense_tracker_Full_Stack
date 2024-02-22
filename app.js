const path = require('path');
const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors'); 
const sequelize = require('./Backend/util/database');
const axios = require('axios');
const env = require('dotenv').config();
const helmet = require('helmet');
const morgan = require('morgan');

const userRoutes = require('./Backend/routes/user');
const expenseRoutes = require('./Backend/routes/expense');
const purchaseRoutes = require('./Backend/routes/purchase');
const premiumRoutes = require('./Backend/routes/premium');
const passwordRoutes = require('./Backend/routes/password');

const Expense = require('./Backend/models/expense');
const User = require('./Backend/models/user');
const Order = require('./Backend/models/order');
const ForgotPasswordRequests = require('./Backend/models/ForgotPasswordRequests');
const downloadedFiles = require('./Backend/models/downloadedFiles');

const app = express();

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors()); // Enable CORS for all routes
app.use(helmet());
app.use(morgan('combined',{ stream: accessLogStream }));

// Routes
app.use('/user', userRoutes);
app.use('/expense', expenseRoutes);
app.use('/purchase', purchaseRoutes);
app.use('/premium', premiumRoutes);
app.use('/password', passwordRoutes);

// Relationship between user and expense table
User.hasMany(Expense);
Expense.belongsTo(User);

// Relationship between user and order table
User.hasMany(Order);
Order.belongsTo(User);

// Relationship between user and downloaded file
User.hasMany(downloadedFiles);
downloadedFiles.belongsTo(User);

// Relationship between forgotPasswordRequests and User table
User.hasMany(ForgotPasswordRequests);
ForgotPasswordRequests.belongsTo(User);

sequelize.sync()
    .then(() => {
        app.listen(3000, () => {
            console.log('Server is running on port 3000');
        });
    })
    .catch(err => console.log(err));

// Catch-all route handler for 404 errors
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Error handling middleware to render 404 page
app.use((err, req, res, next) => {
    if (err.status === 404) {
        res.status(404).sendFile(path.join(__dirname, 'Frontend', '404.html'));
    } else {
        next(err);
    }
});

// General error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});