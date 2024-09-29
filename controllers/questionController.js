const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.getQuestion = async (req, res) => {
  const { id } = req.params;
  const question = { id, title: 'Sample LeetCode Question', description: 'This is a sample question description.' };
  res.render('question', { question });
};

exports.executeCode = async (req, res) => {
  const { code, language } = req.body;

  const languageVersions = {
    python: '3.10.0',
    java: '15.0.2',
    cpp: '10.2.0',
    javascript: '18.15.0'
  };

  try {
    const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
      language,
      version: languageVersions[language],
      files: [
        {
          name: 'main',
          content: code
        }
      ]
    });

    res.json({ output: response.data.run.output });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to execute code',
      details: error.response?.data || error.message
    });
  }
};

exports.analyzeCode = async (req, res) => {
  const { code, questionId } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
    Hey there! I hear you're tackling LeetCode's Three Sum problem. Let's start with the basics. Can you describe the problem in your own words?
    
    After user summarizes the problem:
    Great! Let's brainstorm some data structures. What data structure might help? 
    (a) Array (b) Hash Map (c) Linked List

    After the user chooses an approach:
    Awesome choice! Now, how would we use that structure to solve the problem? 

    *(Visualize a sample array:)* 
    \[
    \text{Input: } [-1, 0, 1, 2, -1, -4]
    \]

    How might we find three numbers that sum to zero in this array? Can you think of a method?
    
    If the user suggests a method:
    Nice idea! Now, if you were to implement that in code, how would it look? 

    *(Consider the two-pointer technique or a hash map approach.)*

    If the user struggles:
    No worries! Let’s break it down. If we use a hash map, how would we store the numbers we’ve seen so far?

    Finally, how would you return the unique triplets from the array?
    `;

    const result = await model.generateContent(prompt);
    const analysis = result.response.text();

    res.json({ analysis });
  } catch (error) {
    res.status(500).json({ error: 'Failed to analyze code' });
  }
};
