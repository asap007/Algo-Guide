const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.getQuestion = async (req, res) => {
  const { id } = req.params;
  // Fetch question details from LeetCode API or database
  // For now, we'll use a placeholder
  const question = { id, title: 'Sample LeetCode Question', description: 'This is a sample question description.' };
  res.render('question', { question });
};

exports.executeCode = async (req, res) => {
  const { code, language } = req.body;

  const languageVersions = {
    python: '3.10.0',
    javascript: '18.15.0',
    java: '15.0.2',
    // Add more languages and their versions as needed
  };

  try {
    const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
      language,
      version: languageVersions[language],
      files: [
        {
          name: 'main',
          content: code,
        },
      ],
    });

    console.log('Piston API response:', response.data);

    // Send the output back to the frontend
    res.json({ output: response.data.run.output });
  } catch (error) {
    console.error('Error executing code:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to execute code',
      details: error.response?.data || error.message,
    });
  }
};

exports.analyzeCode = async (req, res) => {
  const { code, questionId } = req.body;
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Analyze the following code for LeetCode question ${questionId}:

${code}

Provide feedback in a Socratic manner, asking thought-provoking questions that guide the user towards the correct solution without directly giving the answer. Generate 3 multiple-choice questions about the code, each with 4 options. For each question, provide a detailed explanation for why each option is correct or incorrect. The goal is to help the user improve their code incrementally.`;
    
    const result = await model.generateContent(prompt);
    const analysis = result.response.text();
    
    res.json({ analysis });
  } catch (error) {
    console.error('Error analyzing code:', error);
    res.status(500).json({ error: 'Failed to analyze code' });
  }
};