const express = require('express');
const expenseController = require('../controllers/expense');
const userauthentication = require('../middleware/auth');

const router = express.Router();

router.get('/add-expense',  expenseController.getAddExpense);

router.get('/expenses', userauthentication.authenticate , expenseController.getExpenses);

router.post('/add-expense', userauthentication.authenticate, expenseController.postAddExpense);

router.delete('/delete-expense/:_id', userauthentication.authenticate, expenseController.deleteExpense);

router.put('/edit-expense/:_id', userauthentication.authenticate, expenseController.editExpense);


module.exports = router;

    