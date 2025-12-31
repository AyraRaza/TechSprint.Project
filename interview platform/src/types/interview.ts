export type JobRole = 
  | 'software-engineer'
  | 'data-analyst'
  | 'product-manager'
  | 'hr-manager'
  | 'marketing-manager'
  | 'sales-representative'
  | 'ux-designer'
  | 'devops-engineer';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export type RoundType = 'technical' | 'behavioral' | 'situational' | 'mixed';

export type AnswerMode = 'text' | 'voice';

export interface InterviewQuestion {
  id: string;
  question: string;
  type: RoundType;
  expectedTopics?: string[];
  answerMode: AnswerMode;
  timeLimit: number; // in seconds - varies by difficulty
}

export interface QuestionFeedback {
  questionId: string;
  score: number;
  clarity: number;
  relevance: number;
  technicalAccuracy?: number;
  communication: number;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  timeTaken: number; // seconds taken to answer
  timeBonus: number; // bonus/penalty based on time
  adjustedScore: number; // score after time adjustment
}

// Time limits based on difficulty (in seconds)
export const TIME_LIMITS: Record<Difficulty, number> = {
  beginner: 180, // 3 minutes
  intermediate: 150, // 2.5 minutes
  advanced: 120, // 2 minutes
};

export interface InterviewSession {
  id: string;
  userId: string;
  jobRole: JobRole;
  difficulty: Difficulty;
  roundType: RoundType;
  questions: InterviewQuestion[];
  answers: Record<string, string>;
  feedback: QuestionFeedback[];
  totalScore: number;
  createdAt: Date;
  completedAt?: Date;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role?: string;
  about?: string;
  description?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  skills?: string;
  // HR-specific fields
  companyName?: string;
  companySize?: string;
  hrRole?: string;
  companyWebsite?: string;
  totalInterviews: number;
  averageScore: number;
  streakDays: number;
  badges: string[];
  createdAt: Date;
}

export interface HiringPost {
  id: string;
  hrId: string;
  companyName: string;
  title: string;
  description: string;
  location: string;
  jobType: string;
  salaryRange?: string;
  requirements: string[];
  responsibilities: string[];
  status: 'active' | 'closed';
  createdAt: Date;
}

export interface AnalyticsData {
  totalSessions: number;
  averageScore: number;
  scoreHistory: { date: string; score: number }[];
  skillBreakdown: { skill: string; score: number }[];
  rolePerformance: { role: JobRole; sessions: number; avgScore: number }[];
  improvementAreas: string[];
}

export const JOB_ROLES: { value: JobRole; label: string; icon: string; description: string }[] = [
  {
    value: 'software-engineer',
    label: 'Software Engineer',
    icon: '💻',
    description: 'Design, develop, and maintain software applications using various programming languages and frameworks. Focus on writing clean, efficient code and solving complex technical problems.'
  },
  {
    value: 'data-analyst',
    label: 'Data Analyst',
    icon: '📊',
    description: 'Analyze complex datasets to extract insights and support business decisions. Use statistical methods, data visualization tools, and SQL to interpret data trends and patterns.'
  },
  {
    value: 'product-manager',
    label: 'Product Manager',
    icon: '📋',
    description: 'Define product strategy, manage product lifecycle, and work with cross-functional teams to deliver successful products. Bridge the gap between business needs and technical implementation.'
  },
  {
    value: 'hr-manager',
    label: 'HR Manager',
    icon: '👥',
    description: 'Oversee human resources functions including recruitment, employee relations, performance management, and organizational development. Ensure compliance with labor laws and company policies.'
  },
  {
    value: 'marketing-manager',
    label: 'Marketing Manager',
    icon: '📢',
    description: 'Develop and execute marketing strategies to promote products and services. Manage campaigns, analyze market trends, and coordinate with sales teams to drive business growth.'
  },
  {
    value: 'sales-representative',
    label: 'Sales Representative',
    icon: '💼',
    description: 'Generate leads, build customer relationships, and close sales deals. Present product benefits, negotiate terms, and maintain client satisfaction to achieve sales targets.'
  },
  {
    value: 'ux-designer',
    label: 'UX Designer',
    icon: '🎨',
    description: 'Create intuitive and engaging user experiences through research, wireframing, prototyping, and usability testing. Focus on user-centered design principles and accessibility standards.'
  },
  {
    value: 'devops-engineer',
    label: 'DevOps Engineer',
    icon: '⚙️',
    description: 'Implement and maintain CI/CD pipelines, automate deployment processes, and ensure system reliability. Bridge development and operations teams to improve software delivery efficiency.'
  },
];

export const DIFFICULTIES: { value: Difficulty; label: string; description: string }[] = [
  { value: 'beginner', label: 'Beginner', description: 'Entry-level questions' },
  { value: 'intermediate', label: 'Intermediate', description: 'Mid-level challenges' },
  { value: 'advanced', label: 'Advanced', description: 'Senior-level questions' },
];

export const ROUND_TYPES: { value: RoundType; label: string; description: string }[] = [
  { value: 'technical', label: 'Technical', description: 'Role-specific technical questions' },
  { value: 'behavioral', label: 'Behavioral', description: 'STAR format questions' },
  { value: 'situational', label: 'Situational', description: 'Scenario-based questions' },
  { value: 'mixed', label: 'Mixed', description: 'Combination of all types' },
];
