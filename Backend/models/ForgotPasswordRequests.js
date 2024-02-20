const Sequelize = require('sequelize');
const { v4: uuidv4 } = require('uuid'); // Import the uuid library

const sequelize = require('../util/database');

const ForgotPassword = sequelize.define('ForgotPasswordRequests', {
    id: {
        type: Sequelize.UUID,
        defaultValue: () => uuidv4(), // Use uuid to generate a unique identifier
        allowNull: false,
        primaryKey: true,
    },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    isactive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true, 
    },
});

module.exports = ForgotPassword;
