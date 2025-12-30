import { InterviewQuestion, JobRole, Difficulty, RoundType, TIME_LIMITS } from '@/types/interview';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
  }>;
}

async function callGemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Gemini API error:', error);
    throw new Error('Failed to generate content from Gemini');
  }

  const data: GeminiResponse = await response.json();
  return data.candidates[0]?.content?.parts[0]?.text || '';
}

function parseJsonFromResponse(text: string): any {
  // Extract JSON from markdown code blocks if present
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonString = jsonMatch ? jsonMatch[1].trim() : text.trim();
  return JSON.parse(jsonString);
}

export async function generateInterviewQuestions(
  jobRole: JobRole,
  difficulty: Difficulty,
  roundType: RoundType,
  questionCount: number,
  resumeContent?: string
): Promise<InterviewQuestion[]> {
  const roleLabels: Record<JobRole, string> = {
    'software-engineer': 'Software Engineer',
    'data-analyst': 'Data Analyst',
    'product-manager': 'Product Manager',
    'hr-manager': 'HR Manager',
    'marketing-manager': 'Marketing Manager',
    'sales-representative': 'Sales Representative',
    'ux-designer': 'UX Designer',
    'devops-engineer': 'DevOps Engineer',
  };

  const difficultyDescriptions: Record<Difficulty, string> = {
    beginner: 'entry-level, basic concepts, simple scenarios',
    intermediate: 'mid-level, moderate complexity, some experience expected',
    advanced: 'senior-level, complex problems, deep technical knowledge required',
  };

  const roundTypeDescriptions: Record<RoundType, string> = {
    technical: 'Technical questions about coding, algorithms, system design, tools, and technologies',
    behavioral: 'STAR format behavioral questions about past experiences, teamwork, leadership',
    situational: 'Hypothetical scenario-based questions about problem-solving and decision-making',
    mixed: 'A balanced mix of technical, behavioral, and situational questions',
  };

  let prompt: string;

  if (resumeContent) {
    prompt = `You are an expert technical interviewer. Based on the following resume, generate ${questionCount} personalized interview questions for a ${roleLabels[jobRole]} position.

RESUME CONTENT:
${resumeContent}

REQUIREMENTS:
- Difficulty: ${difficulty} (${difficultyDescriptions[difficulty]})
- Question type: ${roundType} (${roundTypeDescriptions[roundType]})
- Generate questions SPECIFICALLY based on:
  * Projects mentioned in the resume
  * Technologies and skills listed
  * Work experience described
  * Any gaps or interesting points worth exploring

Generate EXACTLY ${questionCount} questions that probe deeper into the candidate's actual experience.

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "questions": [
    {
      "question": "The interview question text",
      "type": "technical" | "behavioral" | "situational",
      "expectedTopics": ["topic1", "topic2"],
      "answerMode": "text" | "voice"
    }
  ]
}`;
  } else {
    prompt = `You are an expert technical interviewer. Generate ${questionCount} unique interview questions for a ${roleLabels[jobRole]} position.

REQUIREMENTS:
- Difficulty: ${difficulty} (${difficultyDescriptions[difficulty]})
- Question type: ${roundType} (${roundTypeDescriptions[roundType]})
- Questions must be specific to the ${roleLabels[jobRole]} role
- Include a mix of different sub-topics within the role
- Avoid generic questions - be specific and practical
- Vary the difficulty slightly within the ${difficulty} range

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "questions": [
    {
      "question": "The interview question text",
      "type": "technical" | "behavioral" | "situational",
      "expectedTopics": ["topic1", "topic2"],
      "answerMode": "text" | "voice"
    }
  ]
}`;
  }

  try {
    const response = await callGemini(prompt);
    const parsed = parseJsonFromResponse(response);
    const timeLimit = TIME_LIMITS[difficulty];
    
    return parsed.questions.map((q: any, index: number) => ({
      id: `q-${Date.now()}-${index}`,
      question: q.question,
      type: q.type || roundType,
      expectedTopics: q.expectedTopics || [],
      answerMode: q.answerMode || 'text',
      timeLimit, // Add time limit based on difficulty
    }));
  } catch (error) {
    console.error('Error generating questions:', error);
    throw new Error('Failed to generate interview questions');
  }
}

export interface AnswerFeedback {
  score: number;
  clarity: number;
  relevance: number;
  technicalAccuracy: number;
  communication: number;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  detailedFeedback: string;
}

export async function evaluateAnswer(
  question: string,
  answer: string,
  jobRole: JobRole,
  expectedTopics: string[]
): Promise<AnswerFeedback> {
  const prompt = `You are an expert interviewer evaluating a candidate's response for a ${jobRole.replace('-', ' ')} position.

QUESTION: ${question}

CANDIDATE'S ANSWER: ${answer}

EXPECTED TOPICS TO COVER: ${expectedTopics.join(', ') || 'General relevance to the question'}

Evaluate the answer and return ONLY valid JSON (no markdown, no explanation):
{
  "score": <1-10 overall score>,
  "clarity": <1-10 how clear and well-structured>,
  "relevance": <1-10 how relevant to the question>,
  "technicalAccuracy": <1-10 technical correctness>,
  "communication": <1-10 communication quality>,
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2"],
  "improvements": ["specific improvement suggestion 1", "specific improvement suggestion 2"],
  "detailedFeedback": "2-3 sentences of overall feedback"
}`;

  try {
    const response = await callGemini(prompt);
    const feedback = parseJsonFromResponse(response);
    
    return {
      score: Math.min(10, Math.max(1, feedback.score || 5)),
      clarity: Math.min(10, Math.max(1, feedback.clarity || 5)),
      relevance: Math.min(10, Math.max(1, feedback.relevance || 5)),
      technicalAccuracy: Math.min(10, Math.max(1, feedback.technicalAccuracy || 5)),
      communication: Math.min(10, Math.max(1, feedback.communication || 5)),
      strengths: feedback.strengths || [],
      weaknesses: feedback.weaknesses || [],
      improvements: feedback.improvements || [],
      detailedFeedback: feedback.detailedFeedback || '',
    };
  } catch (error) {
    console.error('Error evaluating answer:', error);
    throw new Error('Failed to evaluate answer');
  }
}

export async function parseResume(resumeBase64: string, mimeType: string): Promise<string> {
  const prompt = `Extract and summarize the key information from this resume. Focus on:
1. Name and contact information
2. Skills and technologies
3. Work experience (company, role, duration, responsibilities)
4. Projects (name, description, technologies used)
5. Education
6. Certifications

Format the output as a clear, structured text that can be used to generate personalized interview questions.`;

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: mimeType,
              data: resumeBase64,
            },
          },
        ],
      }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2048,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Resume parsing error:', error);
    throw new Error('Failed to parse resume');
  }

  const data: GeminiResponse = await response.json();
  return data.candidates[0]?.content?.parts[0]?.text || '';
}

export async function generateImprovementSuggestions(
  sessions: Array<{ feedback: AnswerFeedback[]; jobRole: JobRole }>
): Promise<string[]> {
  if (sessions.length === 0) return [];

  const feedbackSummary = sessions.map(s => ({
    role: s.jobRole,
    avgScore: s.feedback.reduce((acc, f) => acc + f.score, 0) / s.feedback.length,
    commonWeaknesses: s.feedback.flatMap(f => f.weaknesses),
  }));

  const prompt = `Based on the following interview performance data, provide 5 specific, actionable improvement suggestions:

${JSON.stringify(feedbackSummary, null, 2)}

Return ONLY a JSON array of 5 strings (no explanation):
["suggestion1", "suggestion2", "suggestion3", "suggestion4", "suggestion5"]`;

  try {
    const response = await callGemini(prompt);
    return parseJsonFromResponse(response);
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return [
      'Practice more technical questions',
      'Work on providing structured answers',
      'Include more specific examples',
      'Improve time management during responses',
      'Research common interview patterns',
    ];
  }
}
