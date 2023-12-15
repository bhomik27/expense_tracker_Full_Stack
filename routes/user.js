const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user');

// Define routes for user signup
router.post('/signup', UserController.signup);

module.exports = router;
