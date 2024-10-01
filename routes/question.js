const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');

router.get('/:id', questionController.getQuestion);
router.post('/:id/execute', questionController.executeCode);
router.post('/:id/analyze', questionController.analyzeCode);
router.get('/user-context/:userId', async (req, res) => {
    const userId = req.params.userId;
    const filePath = path.join(__dirname, 'user_responses', `user_${userId}_responses.txt`);
    
    try {
        const data = await fs.readFile(filePath, 'utf8');
        res.send(data);
    } catch (error) {
        console.error('Error reading user context file:', error);
        res.status(500).send('Error reading user context');
    }
});

router.get('/api/current-user', (req, res) => {
    // Assuming you're using some kind of session middleware
    if (req.session && req.session.user) {
        let id = req.session.user.id;
        console.log("id is " + id);
        res.json({
            id: req.session.user.id,
            // Include other user data as needed
        });
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});


module.exports = router;
