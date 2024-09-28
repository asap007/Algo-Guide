// routes/index.js
const express = require('express');
const router = express.Router();
const indexController = require('../controllers/indexController');
const { ensureAuthenticated } = require('../middleware/auth');

router.get('/', ensureAuthenticated, indexController.getHomePage);
router.post('/start-session', ensureAuthenticated, indexController.startSession);

module.exports = router;
