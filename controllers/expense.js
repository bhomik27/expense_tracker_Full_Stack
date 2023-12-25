const Expense = require('../models/expense');
const path = require('path');

// Get all expenses
exports.getExpenses = async (req, res, next) => {
    try {
        const expenses = await Expense.findAll();
        res.json(expenses);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get add expense form
exports.getAddExpense = (req, res, next) => {
    const filePath = path.join(__dirname, '../index.html');
    res.sendFile(filePath);
};

// Add a new expense
exports.postAddExpense = async (req, res, next) => {
    try {
        const { amount, description, category } = req.body;
        const newExpense = await Expense.create({
            amount: amount,
            description: description,
            category: category
        });
        res.status(201).json(newExpense);
        console.log('Expense added:', newExpense);
    } catch (error) {
        console.error('Error adding expense:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Edit an expense
exports.editExpense = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { amount, description, category } = req.body;

        const expense = await Expense.findByPk(id);
        if (!expense) {
            return res.status(404).json({ error: 'Expense not found' });
        }

        expense.amount = amount;
        expense.description = description;
        expense.category = category;
        await expense.save();

        console.log('Expense updated:', expense);
        res.json(expense);
    } catch (error) {
        console.error('Error updating expense:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Delete an expense
exports.deleteExpense = async (req, res, next) => {
    try {
        const { id } = req.params;
        const expense = await Expense.findByPk(id);

        if (!expense) {
            return res.status(404).json({ error: 'Expense not found' });
        }

        await expense.destroy();
        console.log('Expense deleted');
        res.status(204).end();
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
