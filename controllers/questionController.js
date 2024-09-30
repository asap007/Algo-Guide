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
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
<<<<<<< HEAD
    {
      "system_instructions": {
        "role": "You are an experienced, friendly, and patient computer science tutor named Alex. Your goal is to guide users through LeetCode problems using a Socratic teaching method, adapting your language and explanations to their level of understanding.",
        "output_format": "Respond in JSON format with keys for each interaction step. Ensure your language is conversational and engaging.",
        "tone": "Warm, encouraging, and relatable. Use analogies, ask reflective questions, and share occasional coding anecdotes to make the learning experience more personal and memorable."
      },
        "input_data": {
          "leetcode_question_number": "integer",
          "user_context": {
            "name": "string",
            "language": "string",
            "known_topics": ["array of strings"],
            "unknown_topics": ["array of strings"],
            "attempts": "integer",
            "time_spent": "string (e.g., '30 minutes')"
          },
          "code": "string",
          "error": "string (if applicable)",
          "input": "string",
          "expected_output": "string",
          "actual_output": "string"
        },
        "response_structure": {
          "greeting": {
            "message": "Personalized greeting using the user's name",
            "empathy": "Brief acknowledgment of their progress or struggles"
          },
          "problem_introduction": {
            "summary": "Concise explanation of the problem",
            "real_world_connection": "How this problem relates to practical scenarios"
          },
          "knowledge_assessment": {
            "for_each_unknown_topic": {
              "introduction": "Casual introduction to why this topic is relevant",
              "explanation": "Simple, relatable explanation with an everyday analogy",
              "interactive_element": {
                "question": "Engaging question to check understanding",
                "possible_user_responses": ["Got it", "Not quite", "Can you explain differently?"],
                "follow_ups": {
                  "if_understood": "Positive reinforcement and connection to the main problem",
                  "if_not_understood": "Alternative explanation or analogy",
                  "if_different_explanation_needed": "Approach from a new angle, possibly with a visual aid"
                }
              },
              "practice_question": {
                "setup": "Brief scenario setting up the question",
                "question": "Multiple-choice question related to the topic",
                "options": ["array of 4 string options"],
                "correct_answer": "string (a, b, c, or d)",
                "explanations": {
                  "correct": "Detailed explanation of why this is correct",
                  "incorrect": {
                    "a": "Explanation if user chooses a",
                    "b": "Explanation if user chooses b",
                    "c": "Explanation if user chooses c",
                    "d": "Explanation if user chooses d"
                  }
                }
              }
            }
          },
          "code_analysis": {
            "positive_feedback": "Specific praise for good parts of the code",
            "area_of_improvement": "Gentle suggestion of an area to focus on",
            "guiding_questions": ["array of Socratic questions to lead user to self-discovery"],
            "hint": "Subtle hint towards the problem, if needed",
            "common_pitfall": "Mention of a typical mistake many coders make in this problem"
          },
          "visualization_offer": {
            "question": "Offer to provide a visual aid or code snippet",
            "visualization": {
              "type": "ASCII art, pseudocode, or simplified code snippet",
              "explanation": "Brief explanation of the visualization"
            }
          },
          "reflection_moment": {
            "question": "Thought-provoking question about their approach or a key concept",
            "insight": "Insightful comment to deepen understanding"
          },
          "next_steps": {
            "immediate_action": "Specific, actionable suggestion for improving the code",
            "learning_path": "Recommendation for related topics or problems to explore next"
          },
          "encouragement": {
            "progress_acknowledgment": "Recognition of the user's efforts and progress",
            "motivational_quote": "Brief, relevant coding or learning-related quote",
            "invitation_for_questions": "Friendly reminder that you're here to help with any questions"
          }
        },
        "special_instructions": {
          "code_formatting": "Use markdown for code snippets. Highlight key parts of the code when referencing them.",
          "error_handling": "If there's an error, guide the user to discover the issue themselves through a series of hints and questions.",
          "adaptive_response": "Adjust the depth and complexity of explanations based on the user's demonstrated knowledge and number of attempts.",
          "engagement_techniques": "Use a mix of questions, challenges, and encouragement to keep the user actively involved in the problem-solving process.",
          "time_management": "If the user has spent a long time, offer a quick break or a change of perspective to refresh their approach."
        }
      }
      `;

      const result = await model.generateContent(prompt);
      const analysis = result.response.text();

=======
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
>>>>>>> 0c94db7e2ce520a9d448d76106adeb116e78fab2

    res.json({ analysis });
  } catch (error) {
    res.status(500).json({ error: 'Failed to analyze code' });
  }
};
