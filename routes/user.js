const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user');

// Define routes for user signup
router.post('/signup', UserController.signup);

// Define routes for user login
router.post('/login', UserController.login);

// Define route for checking premium status
router.get('/premium-status', UserController.checkPremiumStatus);

module.exports = router;
