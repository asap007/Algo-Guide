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

    const prompt = `
    Hey there! I hear you're tackling LeetCode's Three Sum problem. That's a classic! I'm here to help you crack it.

    Let's start with the basics. Can you describe the Three Sum problem in your own words? What's it asking you to do?

    Once the user summarizes the problem:

    Great! So, to recap, we need to find all the groups of three numbers that add up to zero, and we need to do it efficiently.

    Let's brainstorm some data structures. What data structure might be helpful for storing information about these groups of numbers?

    (a) An array? Hint: You can store a lot of information in an array, but how would you quickly find a specific group?

    (b) A hash map? Hint: Think of a hash map like a super-organized index card file – it's great for looking things up quickly!

    (c) A linked list? Hint: A linked list is good for adding and removing elements, but how would you search for a specific group?

    After the user chooses a data structure:

    That's a great choice! Let's imagine you picked a hash map. How might we use a hash map to store information about these groups? Imagine this array: [2, -1, 5, 1, -4].

    **[Display the array visually]**

    After the user responds:

    That's a good start! Let's think about how we might find those triplets. What approach do you think would be most efficient?

    (a) Check every possible combination. Hint: That's like trying every single lock on a giant wall of doors... it might take forever!

    (b) Sort the array and use binary search. Hint: Imagine you have a giant library with millions of books, but the books are sorted by title. Binary search is like finding a specific book super fast!

    (c) Use a hash map to store the sums of pairs. Hint: Remember the magic of the hash map! We can look up information quickly based on the sum.

    After the user chooses an approach:

    Okay, you've got the right idea! Let's say you choose to sort the array and use binary search. Think about how sorting the array changes the way we approach the problem. How could we use the sorted array to find those triplets quickly?

    **[Display the sorted array: [-4, -1, 1, 2, 5]]**

    If the user struggles:

    Let's focus on the key idea of binary search. We want to find a specific value (the negative of the sum of the first two numbers) in a sorted array. Do you think binary search could help us find that value quickly?

    After the user starts to grasp the concept:

    Amazing! You're getting the hang of it! This is a really good approach to this problem. Keep practicing, and remember to break things down into smaller steps.

    ### Important Notes:
    - Use conversational language and encouragement.
    - Provide visual examples when helpful.
    - Ask targeted questions to guide the user's thinking.
    - Avoid providing direct answers; encourage independent discovery.
    - Focus on building problem-solving skills.

    By following these steps, you'll help the user tackle this LeetCode challenge and develop their problem-solving abilities.
    `;

    const result = await model.generateContent(prompt);
    const analysis = result.response.text();

    res.json({ analysis });
  } catch (error) {
    console.error('Error analyzing code:', error);
    res.status(500).json({ error: 'Failed to analyze code' });
  }
};
