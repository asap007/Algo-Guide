const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.getHomePage = (req, res) => {
    res.render('index', { title: 'Algo Guide' });
};

exports.startSession = async (req, res) => {
    const { question } = req.body;
    console.log('Received question:', question);
    
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        
        const prompt = `Given the LeetCode question "${question}", generate 3 multiple-choice questions to assess the user's understanding of the core concepts needed to solve this problem. Each question should have 4 options: Absolutely, Somewhat, Not sure, and No. The questions should cover fundamental concepts related to the problem without directly solving it.`;
        
        console.log('Sending prompt to Gemini AI');
        const result = await model.generateContent(prompt);
        const assessmentQuestions = result.response.text();
        console.log('Received assessment questions:', assessmentQuestions);
        
        res.json({ assessmentQuestions });
    } catch (error) {
        console.error('Error generating assessment questions:', error);
        res.status(500).json({ error: 'Failed to generate assessment questions' });
    }
};