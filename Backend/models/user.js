
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the User schema
const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    isPremiumUser: {
        type: Boolean,
        default: false
    },
    totalExpenses: {
        type: Number,
        default: 0
    }
},
{
    timestamps: true // Optional: Adds createdAt and updatedAt fields
});


module.exports = mongoose.model('User', userSchema);


// const Sequelize = require('sequelize');

// const sequelize = require('../util/database');

// const User = sequelize.define('user', {
//     id: {
//         type: Sequelize.INTEGER,
//         autoIncrement: true,
//         allowNull: false,
//         primaryKey: true
//     },
//     name: {
//         type: Sequelize.STRING,
//         allowNull: false
//     },
//     email: {
//         type: Sequelize.STRING,
//         allowNull: false,
//         unique: true
//     },
//     password: {
//         type: Sequelize.STRING,
//         allowNull: false
//     },
//     ispremiumuser: {
//         type: Sequelize.BOOLEAN, 
//         defaultValue: false,
//     },
//     totalExpenses: {
//         type: Sequelize.INTEGER,
//         defaultValue: 0,
//     }
// });

// module.exports = User;