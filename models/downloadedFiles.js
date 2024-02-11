const Sequelize=require('sequelize')
const sequelize = require('../util/database')


const downloadedFiles=sequelize.define('downloadedFiles',{
    id:{
        type:Sequelize.INTEGER,
        autoIncrement:true,
        allowNull:false,
        primaryKey:true
    },
    fileURl:{
        type:Sequelize.STRING
    }
})

module.exports =  downloadedFiles