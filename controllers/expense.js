const Expense = require('../models/expense');
const User = require('../models/user');
const sequelize = require('../util/database');
const path = require('path');

// Get all expenses
exports.getExpenses = async (req, res, next) => {
    try {
        const expenses = await Expense.findAll({ where: { userId: req.user.id } });
        res.json(expenses);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get add expense form
exports.getAddExpense = (req, res, next) => {
    const filePath = path.join(__dirname, '../expense.html');
    res.sendFile(filePath);
};

// Add a new expense
exports.postAddExpense = async (req, res, next) => {
    const t = await sequelize.transaction();
    
    try {
        const { amount, description, category } = req.body;
        const newExpense = await Expense.create({
            amount: amount,
            description: description,
            category: category,
            userId: req.user.id
        }, { transaction: t });

        const totalExpense = Number(req.user.totalExpenses) + Number(newExpense.amount);

        await User.update(
            { totalExpenses: totalExpense },
            { where: { id: req.user.id }, transaction: t }
        );

        await t.commit();

        res.status(201).json(newExpense);
        console.log('Expense added:', newExpense);
    } catch (error) {
        await t.rollback();
        console.error('Error adding expense:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
// Edit an expense
exports.editExpense = async (req, res, next) => {
    const t = await sequelize.transaction();

    try {
        const { id } = req.params;
        const { amount, description, category } = req.body;

        const expense = await Expense.findByPk(id, { transaction: t });
        if (!expense) {
            await t.rollback();
            return res.status(404).json({ error: 'Expense not found' });
        }

        const oldAmount = expense.amount;

        expense.amount = amount;
        expense.description = description;
        expense.category = category;
        await expense.save({ transaction: t });

        const totalExpense = Number(req.user.totalExpenses) - Number(oldAmount) + Number(expense.amount);

        await User.update(
            { totalExpenses: totalExpense },
            { where: { id: req.user.id }, transaction: t }
        );

        await t.commit();

        console.log('Expense updated:', expense);
        res.json(expense);
    } catch (error) {
        await t.rollback();
        console.error('Error updating expense:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Delete an expense
exports.deleteExpense = async (req, res, next) => {
    const t = await sequelize.transaction();

    try {
        const { id } = req.params;

        const expense = await Expense.findByPk(id, { transaction: t });

        if (!expense) {
            await t.rollback();
            return res.status(404).json({ error: 'Expense not found' });
        }

        const deletedAmount = expense.amount;

        await Expense.destroy({ where: { id: id, userId: req.user.id }, transaction: t })
            .then(async (noOfRows) => {
                if (noOfRows === 0) {
                    return res.status(404).json({ success: true, message: 'Expense does not belong to the user' });
                }

                const totalExpense = Number(req.user.totalExpenses) - Number(deletedAmount);

                await User.update(
                    { totalExpenses: totalExpense },
                    { where: { id: req.user.id }, transaction: t }
                );

                console.log('Expense deleted');
                res.status(200).json({ success: true, message: 'Deleted successfully' });
            })
            .catch(err => {
                console.error('Error deleting expense:', err);
                res.status(500).json({ error: 'Internal Server Error' });
            });

        await t.commit();
    } catch (error) {
        await t.rollback();
        console.error('Error deleting expense:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
