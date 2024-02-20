const Sequelize = require('sequelize');

const sequelize = new Sequelize('expense', 'root', 'Bhomik@27', {
    dialect: 'mysql',
    host: 'localhost'
});

module.exports = sequelize;
