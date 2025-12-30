import { useState, useCallback } from 'react';
import { 
  InterviewSession, 
  InterviewQuestion, 
  QuestionFeedback,
  JobRole, 
  Difficulty, 
  RoundType,
  TIME_LIMITS
} from '@/types/interview';
import { generateInterviewQuestions, evaluateAnswer } from '@/lib/gemini';
import { createInterviewSession, completeInterviewSession, updateUserStats } from '@/services/firebaseService';
import { useAuth } from '@/contexts/AuthContext';

interface UseInterviewReturn {
  session: InterviewSession | null;
  currentQuestionIndex: number;
  isLoading: boolean;
  isGenerating: boolean;
  startInterview: (config: InterviewConfig) => Promise<void>;
  submitAnswer: (answer: string, timeTaken: number) => Promise<QuestionFeedback>;
  nextQuestion: () => void;
  endInterview: () => Promise<InterviewSession>;
  currentQuestion: InterviewQuestion | null;
  progress: number;
  error: string | null;
  timeLimit: number;
}

export interface InterviewConfig {
  jobRole: JobRole;
  difficulty: Difficulty;
  roundType: RoundType;
  questionCount: number;
  resumeContent?: string;
}

export function useInterview(): UseInterviewReturn {
  const { firebaseUser } = useAuth();
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startInterview = useCallback(async (config: InterviewConfig) => {
    if (!firebaseUser) {
      setError('Please login to start an interview');
      return;
    }

    setIsGenerating(true);
    setError(null);
    
    try {
      // Generate questions using Gemini AI
      const questions = await generateInterviewQuestions(
        config.jobRole,
        config.difficulty,
        config.roundType,
        config.questionCount,
        config.resumeContent
      );
      // alert(JSON.stringify(questions))
      // Save to Firebase
      const firestoreSession = await createInterviewSession(
        firebaseUser.uid,
        config.jobRole,
        config.difficulty,
        config.roundType,
        questions,
        config.resumeContent
      );
      
      const newSession: InterviewSession = {
        id: firestoreSession.id,
        userId: firebaseUser.uid,
        jobRole: config.jobRole,
        difficulty: config.difficulty,
        roundType: config.roundType,
        questions,
        answers: {},
        feedback: [],
        totalScore: 0,
        createdAt: new Date(),
      };
      
      setSession(newSession);
      setCurrentQuestionIndex(0);
    } catch (err) {
      console.error('Failed to start interview:', err);
      setError('Failed to generate interview questions. Please try again akshad.');
    } finally {
      setIsGenerating(false);
    }
  }, [firebaseUser]);

  const submitAnswer = useCallback(async (answer: string, timeTaken: number): Promise<QuestionFeedback> => {
    if (!session) throw new Error('No active session');
    if (!firebaseUser) throw new Error('Not authenticated');
    
    setIsLoading(true);
    setError(null);
    
    try {
      const currentQuestion = session.questions[currentQuestionIndex];
      const timeLimit = currentQuestion.timeLimit;
      
      // Calculate time bonus/penalty
      const percentUsed = timeTaken / timeLimit;
      let timeBonus = 0;
      if (percentUsed <= 0.3) timeBonus = 2;
      else if (percentUsed <= 0.5) timeBonus = 1.5;
      else if (percentUsed <= 0.7) timeBonus = 1;
      else if (percentUsed <= 0.9) timeBonus = 0.5;
      else if (percentUsed >= 1) timeBonus = -1;
      
      // Evaluate answer using Gemini AI
      const feedback = await evaluateAnswer(
        currentQuestion.question,
        answer,
        session.jobRole,
        currentQuestion.expectedTopics || []
      );
      
      // Calculate adjusted score (capped at 10)
      const adjustedScore = Math.min(10, Math.max(0, feedback.score + timeBonus));
      
      const questionFeedback: QuestionFeedback = {
        questionId: currentQuestion.id,
        score: feedback.score,
        clarity: feedback.clarity,
        relevance: feedback.relevance,
        technicalAccuracy: feedback.technicalAccuracy,
        communication: feedback.communication,
        strengths: feedback.strengths,
        weaknesses: feedback.weaknesses,
        improvements: feedback.improvements,
        timeTaken,
        timeBonus,
        adjustedScore,
      };
      
      // Update session state
      setSession(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          answers: { ...prev.answers, [currentQuestion.id]: answer },
          feedback: [...prev.feedback, questionFeedback],
        };
      });
      
      return questionFeedback;
    } catch (err) {
      console.error('Failed to evaluate answer:', err);
      setError('Failed to evaluate your answer. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [session, currentQuestionIndex, firebaseUser]);

  const nextQuestion = useCallback(() => {
    if (session && currentQuestionIndex < session.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  }, [session, currentQuestionIndex]);

  const endInterview = useCallback(async (): Promise<InterviewSession> => {
    if (!session) throw new Error('No active session');
    if (!firebaseUser) throw new Error('Not authenticated');
    
    // Use adjusted scores for final total
    const totalScore = session.feedback.length > 0
      ? Math.round(session.feedback.reduce((acc, f) => acc + f.adjustedScore, 0) / session.feedback.length)
      : 0;
    
    const completedSession: InterviewSession = {
      ...session,
      totalScore,
      completedAt: new Date(),
    };
    
    try {
      // Save to Firebase
      await completeInterviewSession(
        session.id,
        completedSession.answers,
        completedSession.feedback,
        completedSession.totalScore
      );
      
      // Update user stats
      await updateUserStats(firebaseUser.uid, totalScore);
    } catch (err) {
      console.error('Failed to save interview session:', err);
    }
    
    return completedSession;
  }, [session, firebaseUser]);

  const currentQuestion = session?.questions[currentQuestionIndex] || null;
  const progress = session ? ((currentQuestionIndex + 1) / session.questions.length) * 100 : 0;
  const timeLimit = session ? TIME_LIMITS[session.difficulty] : 120;

  return {
    session,
    currentQuestionIndex,
    isLoading,
    isGenerating,
    startInterview,
    submitAnswer,
    nextQuestion,
    endInterview,
    currentQuestion,
    progress,
    error,
    timeLimit,
  };
}
