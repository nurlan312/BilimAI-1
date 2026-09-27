export type TargetLanguage = 'kyrgyz' | 'english';
export type UILanguage = 'ky' | 'ru' | 'en';

export type UserLevel =
  | 'С нуля'
  | 'Башталгыч (A1)'
  | 'Орто (A2-B1)'
  | 'Жогорку (B2+)'
  | 'A1 Beginner'
  | 'A2 Elementary'
  | 'B1 Intermediate'
  | 'B2 Upper-Intermediate'
  | 'C1 Advanced';

export type GoalCategory =
  | 'general'
  | 'work'
  | 'travel'
  | 'exam'
  | 'civil_service'
  | 'family';

export interface CompletedLessonRecord {
  lessonId: string;
  completedAt: string;
  score: number;
  xpEarned: number;
}

export interface UserProfile {
  id?: string;
  email?: string;
  name: string;
  targetLanguage: TargetLanguage;
  uiLang: UILanguage;
  level: string;
  goalCategory: GoalCategory;
  dailyGoalMinutes: number;
  streakDays: number;
  lastActiveDate: string;
  xp: number;
  completedLessons: string[];
  completedLessonRecords?: CompletedLessonRecord[];
  diagnosticTaken: boolean;
  avatarSeed: string;
  registeredAt?: string;
}

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  password?: string;
  createdAt: string;
  profile: UserProfile;
}

export type ExerciseType =
  | 'multiple_choice'
  | 'fill_blank'
  | 'reorder'
  | 'matching'
  | 'speaking';

export interface Exercise {
  id: string;
  type: ExerciseType;
  prompt: string;
  instruction: string;
  options?: string[]; // for multiple choice
  correctAnswer: string | string[]; // string or array for reorder/matching
  pairs?: { left: string; right: string }[]; // for matching
  sentenceTemplate?: string; // for fill_blank: "Саламатсыз____, сиздин атыңыз ким?"
  hint?: string;
  targetAudioText?: string;
  explanation: string;
}

export interface LessonContent {
  id: string;
  moduleId: string;
  title: string;
  titleTranslation: string;
  durationMinutes: number;
  difficulty: string;
  grammarFocus: string;
  summary: string;
  introduction: string;
  examples: {
    phrase: string;
    translation: string;
    transcription?: string;
    note?: string;
  }[];
  exercises: Exercise[];
  keyVocabulary: {
    word: string;
    translation: string;
    transcription?: string;
  }[];
}

export interface LessonModule {
  id: string;
  language: TargetLanguage;
  title: string;
  titleTranslation: string;
  description: string;
  iconName: string;
  level: string;
  lessons: LessonContent[];
}

export interface VocabularyWord {
  id: string;
  language: TargetLanguage;
  word: string;
  translation: string;
  transcription?: string;
  contextSentence?: string;
  contextTranslation?: string;
  status: 'new' | 'learning' | 'mastered';
  reviewCount: number;
  lastReviewed?: string;
  category: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'tutor';
  content: string;
  translation?: string;
  corrections?: string | null;
  vocabularyTip?: string;
  suggestedResponses?: string[];
  timestamp: string;
  audioPlaying?: boolean;
}

export interface DiagnosticQuestion {
  id: string;
  category: 'grammar' | 'vocabulary' | 'listening' | 'reading' | 'phonetics';
  question: string;
  audioPrompt?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  levelIndicator: string;
}

export interface DiagnosticResult {
  determinedLevel: string;
  overallScore: number;
  analysis: string;
  strengths: string[];
  weaknesses: string[];
  recommendedPlan: {
    title: string;
    desc: string;
    weeks: number;
  }[];
}

export interface PronunciationEvaluation {
  score: number;
  accuracy: 'High' | 'Medium' | 'Needs Practice';
  transcribed: string;
  feedback: string;
  phoneticTips: string[];
  mispronouncedWords: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}
