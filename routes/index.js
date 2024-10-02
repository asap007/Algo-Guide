// routes/index.js
const express = require('express');
const router = express.Router();
const indexController = require('../controllers/indexController');
const questionController = require('../controllers/questionController');
const { ensureAuthenticated } = require('../middleware/auth');

router.get('/', ensureAuthenticated, indexController.getHomePage);
router.post('/start-session', ensureAuthenticated, indexController.startSession);
router.post('/save-response', ensureAuthenticated, indexController.saveResponse);
router.get('/handle-output', (req, res) => {
    res.render("handleoutput");
});

router.post('/handle-output', (req, res) => {
    // Store the analysis data in the session
    req.session.analysisData = req.body;
    console.log('Analysis data stored in session:', req.session.analysisData);
    res.sendStatus(200);
});
router.get('/get-analysis-data', (req, res) => {
    const analysisData = req.session.analysisData;
    console.log('Fetched analysis data:', analysisData);
    if (!analysisData) {
        return res.status(404).json({ error: 'Analysis data not found' });
    }
    res.json(analysisData);
});


router.get('/user-context/:userId', questionController.getUserResponses);
module.exports = router;
