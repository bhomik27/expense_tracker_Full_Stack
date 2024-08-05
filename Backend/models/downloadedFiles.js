const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Define the DownloadedFiles schema
const downloadedFilesSchema = new mongoose.Schema({
    fileURL: {
        type: String,
        required: true
    },
    userId:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    }
}, {
    timestamps: true // Optional: Adds createdAt and updatedAt fields
});


module.exports =  mongoose.model('DownloadedFiles', downloadedFilesSchema);



// const Sequelize=require('sequelize')
// const sequelize = require('../util/database')


// const downloadedFiles=sequelize.define('downloadedFiles',{
//     id:{
//         type:Sequelize.INTEGER,
//         autoIncrement:true,
//         allowNull:false,
//         primaryKey:true
//     },
//     fileURl:{
//         type:Sequelize.STRING
//     }
// })

// module.exports =  downloadedFiles