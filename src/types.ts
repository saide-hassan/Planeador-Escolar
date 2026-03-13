export interface LessonPlanInput {
  school: string;
  subject: string;
  date: string;
  unit: string;
  grade: string;
  topic: string;
  duration: '45' | '90';
  teacher: string;
  materials: string;
  otherDetails?: string;
  attachments?: {
    name: string;
    type: string;
    data: string; // Base64 or text content
    isText: boolean; // true if it's extracted text (like from docx), false if it's base64 (image/pdf)
  }[];
  includeExercises: boolean;
  includeHomework: boolean;
}

export interface DidacticFunction {
  name: string; // e.g., "Introdução e Motivação"
  time: string;
  content: string;
  activities: {
    teacher: string;
    student: string;
  };
  method: string;
  obs: string;
}

export interface LessonPlan extends LessonPlanInput {
  type?: 'lesson';
  objectives: string;
  didacticFunctions: DidacticFunction[];
  contentSummary: string;
  exercisesList: string[];
  homeworkList: string[];
  id?: string;
  createdAt?: string;
}

export interface EvaluationInput {
  evaluationType: string; // ex: ACS 1, ACS 2, ACS 3, AP
  questionType: 'Escolha Múltipla' | 'Perguntas Abertas' | 'Preenchimento de Lacunas' | 'Ambos';
  numQuestions: number;
  otherDetails?: string;
  schoolType: 'Escola' | 'Colégio';
  schoolName: string;
  topics: string;
  grade: string;
  term: string;
  subject: string;
  duration: string;
  date: string;
  classes: string;
  teacher: string;
  attachments?: {
    name: string;
    type: string;
    data: string;
    isText: boolean;
  }[];
}

export interface EvaluationQuestion {
  number: number;
  knowledgeLevel: string;
  content: string;
  objective: string;
  question: string;
  possibleAnswer: string;
  partialScore: number;
  totalScore: number;
}

export interface Evaluation extends EvaluationInput {
  type?: 'evaluation';
  questions: EvaluationQuestion[];
  id?: string;
  createdAt?: string;
}

export type HistoryItem = LessonPlan | Evaluation;

