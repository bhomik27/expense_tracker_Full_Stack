const express = require('express');

const router = express.Router();
const expenseController = require('../controllers/expense');
const Expense = require('../models/expense');

router.get('/expenses', expenseController.getExpenses);

router.get('/add-expense', expenseController.getAddExpense);

router.post('/add-expense', expenseController.postAddExpense);

router.delete('/delete-expense/:id', expenseController.deleteExpense);

router.put('/edit-expense/:id', expenseController.editExpense);


module.exports = router;

