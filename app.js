const path = require('path');
const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors'); 
const sequelize = require('./util/database');
const axios = require('axios');
const env = require('dotenv').config();
const helmet = require('helmet');
// const compression = require('compression');
const morgan = require('morgan');




const userRoutes = require('./routes/user');
const expenseRoutes = require('./routes/expense');
const purchaseRoutes = require('./routes/purchase');
const premiumRoutes = require('./routes/premium');
const passwordRoutes = require('./routes/password');



const Expense = require('./models/expense');
const User = require('./models/user');
const Order = require('./models/order');
const ForgotPasswordRequests = require('./models/ForgotPasswordRequests');
const downloadedFiles = require('./models/downloadedFiles');

const app = express();


const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'),
    { flags: 'a' }
);

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors()); // Enable CORS for all routes



app.use(helmet());
// app.use(compression());
app.use(morgan('combined',{stream : accessLogStream}));

// Routes
app.use('/user', userRoutes);
app.use('/expense', expenseRoutes);
app.use('/purchase', purchaseRoutes);
app.use('/premium', premiumRoutes);
app.use('/password', passwordRoutes);


//realation between user and expense table
User.hasMany(Expense);
Expense.belongsTo(User);

//realation between user and order table
User.hasMany(Order);
Order.belongsTo(User);

//relation betwwen user and downloaded file
User.hasMany(downloadedFiles)
downloadedFiles.belongsTo(User)

//relation between forgotPasswordRequests and User tabel
User.hasMany(ForgotPasswordRequests);
ForgotPasswordRequests.belongsTo(User);


sequelize.sync()
    .then(() => {
        app.listen(3000, () => {
            console.log('Server is running on port 3000');
        });
    })
    .catch(err => console.log(err));

