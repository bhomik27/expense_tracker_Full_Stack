const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Order schema
const orderSchema = new Schema({
    paymentId: {
        type: String,
        required: true
    },
    orderId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    userId: {
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    }
},  {
    timestamps: true // Optional: Adds createdAt and updatedAt fields
});


module.exports = mongoose.model('Order', orderSchema);


// const Sequelize = require('sequelize');
// const sequelize = require('../util/database');

// const Order = sequelize.define('order', {
//     id: {
//         type: Sequelize.INTEGER,
//         autoIncrement: true,
//         allowNull: false,
//         primaryKey: true
//     },
//     paymentid: Sequelize.STRING,
//     orderid: Sequelize.STRING,
//     status: Sequelize.STRING
// })

// module.exports = Order;