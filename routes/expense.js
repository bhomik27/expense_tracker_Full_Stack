const express = require('express');
const expenseController = require('../controllers/expense');
const Expense = require('../models/expense');
const userauthentication = require('../midddleware/auth');

const router = express.Router();

router.get('/add-expense',  expenseController.getAddExpense);

router.get('/expenses', userauthentication.authenticate , expenseController.getExpenses);

router.post('/add-expense', userauthentication.authenticate, expenseController.postAddExpense);

router.delete('/delete-expense/:id', userauthentication.authenticate, expenseController.deleteExpense);

router.put('/edit-expense/:id', expenseController.editExpense);


module.exports = router;

