const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const User = require('../models/User');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.getQuestion = async (req, res) => {
  const { id } = req.params;
  const question = { id, title: 'Sample LeetCode Question', description: 'This is a sample question description.' };
  const user = req.user || null;

  res.render('question', { question, user });
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


exports.getUserResponses = async (req, res) => {
  const userId = req.user._id;

  try {
      const user = await User.findById(userId);
      const responses = user.assessments;
      console.log(responses);
      res.json({ success: true, responses });
  } catch (error) {
      console.error('Error retrieving responses:', error);
      res.status(500).json({ success: false, error: 'Failed to retrieve responses' });
  }
};


exports.analyzeCode = async (req, res) => {
  const { 
    code, 
    questionId, 
    error, 
    testInput, 
    expectedOutput, 
    actualOutput ,
    userContext
  } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    You are an experienced, friendly, and patient computer science tutor named Alex. 
    Your goal is to guide users through LeetCode problems using a Socratic teaching method, 
    adapting your language and explanations to their level of understanding.
    
    Please analyze the following code submission and provide feedback:
    
    Question ID: ${questionId}

    some information we got about the person who is solving this question, about the topics that might be realted to the leetcode question ${userContext}
    
    Code:
    ${code}
    
    Test Input: ${testInput || 'Not provided'}
    Expected Output: ${expectedOutput || 'Not provided'}
    Actual Output: ${actualOutput || 'Not provided'}
    Error (if any): ${error || 'None'}
    
    Please provide your analysis in the following JSON format:
    {
      "greeting": {
        "message": "A friendly greeting",
        "empathy": "Show understanding of their progress or struggles"
      },
      "codeAnalysis": {
        "correctParts": ["List good aspects of the code"],
        "improvementAreas": ["List areas that could be improved"],
        "complexityAnalysis": "Brief analysis of time and space complexity",
        "suggestedOptimizations": ["List of potential optimizations"]
      },
      "testCaseAnalysis": {
        "inputAnalysis": "Analysis of the test input",
        "outputComparison": "Comparison between expected and actual output",
        "edgeCases": ["Suggest additional test cases to consider"]
      },
      "errorAnalysis": {
        "explanation": "If there's an error, explain it in simple terms",
        "possibleFixes": ["List of potential fixes for the error"]
      },
      "nextSteps": {
        "immediateActions": ["Specific, actionable suggestions"],
        "conceptsToReview": ["Related concepts to study"],
        "followUpQuestions": ["Questions to guide further learning"]
      },
      "encouragement": {
        "progressAcknowledgment": "Recognize their effort",
        "motivationalMessage": "A brief motivational message"
      }
    }`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    console.log('Raw response:', responseText);
    
    // Parse the response to ensure it's valid JSON
    let analysis;
    try {
      // Try to extract JSON from the response using regex
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No valid JSON found in the response");
      }
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      return res.json({
        error: 'Failed to parse analysis results',
        rawAnalysis: responseText
      });
    }

    res.json({ analysis });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze code',
      details: error.message
    });
  }
};
