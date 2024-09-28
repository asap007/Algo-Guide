// controllers/indexController.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const User = require('../models/User');
const fs = require('fs').promises;
const path = require('path');

exports.getHomePage = (req, res) => {
    res.render('index', { title: 'AlgoGuide' });
};

exports.startSession = async (req, res) => {
  const { question, language } = req.body; // User-selected language
  console.log('Received question:', question);
  console.log('Selected language:', language);
  
  try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      // Determine the language to generate code snippets
      const languageMap = {
        "C++": "C++",
        "cpp": "C++",   // Handle lowercase input from dropdown
        "JavaScript": "JavaScript",
        "javascript": "JavaScript",
        "Python": "Python",
        "python": "Python",
        "Java": "Java",
        "java": "Java"
      };
      
      const selectedLanguage = languageMap[language] || "Java"; // Default to Python if language is not provided
      
      const prompt = `Make sure to return json data, Given the LeetCode question "${question}", generate a series of 3-4 interactive questions to assess and teach the user about the core concepts needed to solve this specific problem in the most effecient way. For each question, provide:

    1. A yes/no question about a key concept.
    2. If the user answers yes, a multiple-choice question to test their understanding, with 4 options (a, b, c, d) and the correct answer.
    3. If the user answers no or incorrectly, a brief explanation of the concept and how it relates to the problem.
    4. A short code snippet demonstrating the concept in ${selectedLanguage}.

    Format the response as a JSON array of objects. Do not include any markdown formatting or code block syntax in your response. Here's an example structure:

    [
    {
      "conceptQuestion": "Are you familiar with reversing an array?",
      "multipleChoice": {
        "question": "What is the time complexity of reversing an array in-place?",
        "options": {
          "a": "O(1)",
          "b": "O(n)",
          "c": "O(n log n)",
          "d": "O(n^2)"
        },
        "correctAnswer": "b"
      },
      "explanation": "Reversing an array involves swapping elements from the start and end, moving towards the center. This process touches each element once, resulting in a time complexity of O(n), where n is the number of elements in the array.",
      "codeSnippet": "def reverse_array(arr):\\n    left, right = 0, len(arr) - 1\\n    while left < right:\\n        arr[left], arr[right] = arr[right], arr[left]\\n        left += 1\\n        right -= 1\\n    return arr"
    }
    ]`;

          console.log('Sending prompt to Gemini AI');
          const result = await model.generateContent(prompt);
          let assessmentQuestions = result.response.text();
          console.log('Received assessment questions:', assessmentQuestions);
          
          // Remove any potential markdown code block
          assessmentQuestions = assessmentQuestions.replace(/```json\n|\n```/g, '');
          assessmentQuestions = assessmentQuestions.replace(/[\r\n]+/g, ''); 

          // Ensure the response is valid JSON
          try {
              const parsedQuestions = JSON.parse(assessmentQuestions);
              res.json({ assessmentQuestions: JSON.stringify(parsedQuestions) });
          } catch (parseError) {
              console.error('Error parsing assessment questions:', parseError);
              
              // Optional: Log the problematic response for debugging
              console.error('Problematic response:', assessmentQuestions);
              
              res.status(500).json({ error: 'Invalid response from AI model. Please try again later.' });
          }        
      } catch (error) {
          console.error('Error generating assessment questions:', error);
          res.status(500).json({ error: 'Failed to generate assessment questions' });
      }
    };

exports.saveResponse = async (req, res) => {
    const { question, response } = req.body;
    const userId = req.user._id;

    try {
        // Save to database
        const user = await User.findById(userId);
        user.assessments.push({ question, response });
        await user.save();

        // Save to file
        const fileName = `user_${userId}_responses.txt`;
        const filePath = path.join(__dirname, '..', 'user_responses', fileName);
        const content = `${new Date().toISOString()} - Question: ${question}, Response: ${response}\n`;
        
        await fs.appendFile(filePath, content);

        res.json({ success: true });
    } catch (error) {
        console.error('Error saving response:', error);
        res.status(500).json({ error: 'Failed to save response' });
    }
};
