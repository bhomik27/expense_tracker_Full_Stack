const mongoose = require('mongoose');
const Expense = require('../models/expense');
const User = require('../models/user');
const DownloadedFiles = require('../models/downloadedFiles');
const path = require('path');
const UserServices = require('../services/userservices');
const S3services = require('../services/S3services');

// Download expense
const downloadExpense = async (req, res) => {
    try {
        const expenses = await UserServices.getExpenses(req);
        const stringifiedExpenses = JSON.stringify(expenses);

        const userId = req.user._id;
        const filename = `Expense${userId}/${new Date().toISOString()}.txt`;
        const fileUrl = await S3services.uploadToS3(stringifiedExpenses, filename);

        await DownloadedFiles.create({ userId, fileUrl });

        res.status(200).json({ fileUrl, success: true });
    } catch (err) {
        console.error('Error downloading expense:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// Get all expenses with pagination
const getExpenses = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 5;
        const skip = (page - 1) * limit;

        const expenses = await Expense.find({ userId: req.user._id })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const totalExpenses = await Expense.countDocuments({ userId: req.user._id });
        const totalPages = Math.ceil(totalExpenses / limit);

        res.status(200).json({ expenses, totalPages });
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Serve the add expense form
const getAddExpense = (req, res) => {
    const filePath = path.join(__dirname, '../expense.html');
    res.sendFile(filePath);
};

// Add a new expense
const postAddExpense = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { amount, description, category } = req.body;

        // Validate input
        if (isNaN(amount) || !description || !category) {
            throw new Error('Invalid input data');
        }

        const newExpense = await Expense.create([{
            amount,
            description,
            category,
            userId: req.user._id
        }], { session });

        const user = await User.findById(req.user._id).session(session);
        user.totalExpenses += Number(newExpense[0].amount);
        await user.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json(newExpense[0]);
        console.log('Expense added:', newExpense);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Error adding expense:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Edit an expense
const editExpense = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { _id } = req.params;
        const { amount, description, category } = req.body;

        const expense = await Expense.findById(_id).session(session);
        if (!expense) {
            throw new Error('Expense not found');
        }

        const oldAmount = expense.amount;

        expense.amount = amount;
        expense.description = description;
        expense.category = category;
        await expense.save({ session });

        const user = await User.findById(req.user._id).session(session);
        user.totalExpenses += Number(expense.amount) - Number(oldAmount);
        await user.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(200).json(expense);
        console.log('Expense updated:', expense);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Error updating expense:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Delete an expense
const deleteExpense = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { _id } = req.params;
        console.log("ID", _id);

        const expense = await Expense.findById(_id).session(session);
        if (!expense) {
            throw new Error('Expense not found');
        }

        const deletedAmount = expense.amount;

        await Expense.deleteOne({ _id, userId: req.user._id }).session(session);

        const user = await User.findById(req.user._id).session(session);
        user.totalExpenses -= Number(deletedAmount);
        await user.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ success: true, message: 'Deleted successfully' });
        console.log('Expense deleted');
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Error deleting expense:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get all downloaded files
const getAllFiles = async (req, res) => {
    try {
        const files = await DownloadedFiles.find({ userId: req.user._id })
            .select('fileUrl createdAt')
            .exec();

        res.status(200).json(files);
    } catch (error) {
        console.error('Error fetching downloaded files:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    getExpenses,
    getAddExpense,
    postAddExpense,
    editExpense,    
    deleteExpense,
    downloadExpense,
    getAllFiles
};


// const Expense = require('../models/expense');
// const User = require('../models/user');
// const sequelize = require('../util/database');
// const path = require('path');
// const UserServices = require('../services/userservices');
// const S3services = require('../services/S3services');
// const downloadedFiles = require('../models/downloadedFiles');



// //download expense
// const downloadExpense = async (req, res) => {
//     try {
//         const expenses = await UserServices.getExpenses(req);
//         console.log(expenses);

//         const stringifiedExpenses = JSON.stringify(expenses);

//         const userId = req.user.id;

//         const filename = `Expense${userId}/${new Date()}.txt`;
//         const fileURl = await S3services.uploadToS3(stringifiedExpenses, filename);
//         console.log(fileURl);
//         await downloadedFiles.create({
//             userId: userId,
//             fileURl: fileURl
//         });
//         res.status(200).json({ fileURl, success: true })
//     }
//     catch (err) {
//         console.log(err);
//         res.status(500).json({ fileURl, success: true, err: err });

//     }
// }



// // Get all expenses
// // const getExpenses = async (req, res, next) => {
// //     try {
// //         const expenses = await Expense.findAll({ where: { userId: req.user.id } });
// //         res.json(expenses);
// //     } catch (error) {
// //         console.error('Error fetching expenses:', error);
// //         res.status(500).json({ error: 'Internal Server Error' });
// //     }
// // };

// // Modify the getExpenses controller to handle pagination
// const getExpenses = async (req, res, next) => {
//     try {
//         const page = parseInt(req.query.page) || 1; // Get the page parameter from query string, default to 1 if not provided
//         const limit = parseInt(req.query.limit) || 5; // Get the limit parameter from query string, default to 5 if not provided

//         const offset = (page - 1) * limit;

//         const expenses = await Expense.findAndCountAll({
//             where: { userId: req.user.id },
//             limit: limit,
//             offset: offset,
//             order: [['createdAt', 'DESC']]
//         });

//         const totalPages = Math.ceil(expenses.count / limit);

//         res.json({ expenses: expenses.rows, totalPages });
//     } catch (error) {
//         console.error('Error fetching expenses:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };




// // Get add expense form
// const getAddExpense = (req, res, next) => {
//     const filePath = path.join(__dirname, '../expense.html');
//     res.sendFile(filePath);
// };

// // Add a new expense
// const postAddExpense = async (req, res, next) => {
//     const t = await sequelize.transaction();

//     try {
//         const { amount, description, category } = req.body;
//         const newExpense = await Expense.create({
//             amount: amount,
//             description: description,
//             category: category,
//             userId: req.user.id
//         }, { transaction: t });

//         const totalExpense = Number(req.user.totalExpenses) + Number(newExpense.amount);

//         await User.update(
//             { totalExpenses: totalExpense },
//             { where: { id: req.user.id }, transaction: t }
//         );

//         await t.commit();

//         res.status(201).json(newExpense);
//         console.log('Expense added:', newExpense);
//     } catch (error) {
//         await t.rollback();
//         console.error('Error adding expense:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };


// // Edit an expense
// const editExpense = async (req, res, next) => {
//     const t = await sequelize.transaction();

//     try {
//         const { id } = req.params;
//         const { amount, description, category } = req.body;

//         const expense = await Expense.findByPk(id, { transaction: t });
//         if (!expense) {
//             await t.rollback();
//             return res.status(404).json({ error: 'Expense not found' });
//         }

//         const oldAmount = expense.amount;

//         expense.amount = amount;
//         expense.description = description;
//         expense.category = category;
//         await expense.save({ transaction: t });

//         const totalExpense = Number(req.user.totalExpenses) - Number(oldAmount) + Number(expense.amount);

//         await User.update(
//             { totalExpenses: totalExpense },
//             { where: { id: req.user.id }, transaction: t }
//         );

//         await t.commit();

//         console.log('Expense updated:', expense);
//         res.json(expense);
//     } catch (error) {
//         await t.rollback();
//         console.error('Error updating expense:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };





// // Delete an expense
// const deleteExpense = async (req, res, next) => {
//     const t = await sequelize.transaction();

//     try {
//         const { id } = req.params;

//         const expense = await Expense.findByPk(id, { transaction: t });

//         if (!expense) {
//             await t.rollback();
//             return res.status(404).json({ error: 'Expense not found' });
//         }

//         const deletedAmount = expense.amount;

//         await Expense.destroy({ where: { id: id, userId: req.user.id }, transaction: t })
//             .then(async (noOfRows) => {
//                 if (noOfRows === 0) {
//                     return res.status(404).json({ success: true, message: 'Expense does not belong to the user' });
//                 }

//                 const totalExpense = Number(req.user.totalExpenses) - Number(deletedAmount);

//                 await User.update(
//                     { totalExpenses: totalExpense },
//                     { where: { id: req.user.id }, transaction: t }
//                 );

//                 console.log('Expense deleted');
//                 res.status(200).json({ success: true, message: 'Deleted successfully' });
//             })
//             .catch(err => {
//                 console.error('Error deleting expense:', err);
//                 res.status(500).json({ error: 'Internal Server Error' });
//             });

//         await t.commit();
//     } catch (error) {
//         await t.rollback();
//         console.error('Error deleting expense:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };




// const GetAllFiles = async (req, res) => {
//     try {
//         const files = await downloadedFiles.findAll({
//             attributes: ['fileUrl', 'createdAt'], // Specify the attributes to retrieve
//             where: { userId: req.user.id }
//         });

//         res.status(200).json(files);
//     } catch (error) {
//         console.error('Error fetching downloaded files:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };



// module.exports = {
//     getExpenses,
//     getAddExpense,
//     postAddExpense,
//     editExpense,
//     deleteExpense,
//     downloadExpense,
//     GetAllFiles
// }