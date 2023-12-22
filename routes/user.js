const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user');

// Define routes for user signup
router.post('/signup', UserController.signup);

// Define routes for user login
router.post('/login', UserController.login);

module.exports = router;
