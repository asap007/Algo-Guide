// routes/index.js
const express = require('express');
const router = express.Router();
const indexController = require('../controllers/indexController');
const questionController = require('../controllers/questionController');
const { ensureAuthenticated } = require('../middleware/auth');

router.get('/', ensureAuthenticated, indexController.getHomePage);
router.post('/start-session', ensureAuthenticated, indexController.startSession);
router.post('/save-response', ensureAuthenticated, indexController.saveResponse);
router.get('/handle-output', (req,res)=>{
res.render("handleoutput")
})
router.get('/user-context/:userId', questionController.getUserResponses);
module.exports = router;
