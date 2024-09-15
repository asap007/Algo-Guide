const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');

router.get('/:id', questionController.getQuestion);
router.post('/:id/execute', questionController.executeCode);
router.post('/:id/analyze', questionController.analyzeCode);

module.exports = router;