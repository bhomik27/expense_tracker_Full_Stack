const express = require('express');
const premiumController = require('../controllers/premium');
const userauthentication = require('../middleware/auth');
const router = express.Router();

router.get('/showLeaderboard', userauthentication.authenticate, premiumController.getLeaderboard);

module.exports = router;
