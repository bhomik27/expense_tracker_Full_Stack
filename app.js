
const path = require('path');
const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');
// const sequelize = require('./Backend/util/database');
const mongoose = require('mongoose');
//const helmet = require('helmet');
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


//here flag 'a' means append to the end of the existing file if exists
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors()); // Enable CORS for all routes
//app.use(helmet());
app.use(morgan('combined', { stream: accessLogStream }));

// Routes
app.use('/user', userRoutes);
app.use('/expense', expenseRoutes);
app.use('/purchase', purchaseRoutes);
app.use('/premium', premiumRoutes);
app.use('/password', passwordRoutes);

app.use((req, res) => {
    console.log("url", req.url);
    res.sendFile(path.join(__dirname + `/Frontend/${req.url}`));
})

//app.use(express.static(path.join(__dirname, 'Frontend')));


// // Relationship between user and expense table
// User.hasMany(Expense);
// Expense.belongsTo(User);

// // Relationship between user and order table
// User.hasMany(Order);
// Order.belongsTo(User);

// // Relationship between user and downloaded file
// User.hasMany(downloadedFiles);
// downloadedFiles.belongsTo(User);

// // Relationship between forgotPasswordRequests and User table
// User.hasMany(ForgotPasswordRequests);
// ForgotPasswordRequests.belongsTo(User);

// sequelize.sync()
//     .then(() => {
//         app.listen(3000, () => {
//             console.log('Server is running on port 3000');
//         });
//     })
//     .catch(err => console.log(err));


mongoose.connect(process.env.MONGODB_URI)
    .then(result => {
        console.log("connected")
        app.listen(3000)
        // console.log(result);
    })
    .catch(err => {
        console.log(err)
    })

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});






