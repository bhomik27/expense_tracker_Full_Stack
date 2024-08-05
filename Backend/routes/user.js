const express = require('express');
const UserController = require('../controllers/user'); 
const userauthentication = require('../middleware/auth');
const expenseController = require('../controllers/expense');

const router = express.Router();

// Define routes for user signup
router.post('/signup',  UserController.signup);

// Define routes for user login
router.post('/login',  UserController.login);

// Define route for checking premium status
router.get('/premium-status', userauthentication.authenticate,UserController.checkPremiumStatus);

router.get('/download', userauthentication.authenticate, expenseController.downloadExpense);

router.get('/getallfiles', userauthentication.authenticate, expenseController.getAllFiles);

module.exports = router;
