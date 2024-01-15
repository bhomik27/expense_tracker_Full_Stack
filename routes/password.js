const express = require('express');
const router = express.Router();
const passwordController = require('../controllers/password');

// Define routes for user signup
router.post('/forgotpassword', passwordController.getresetPassword);



module.exports = router;
