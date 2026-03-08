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
  objectives: string;
  didacticFunctions: DidacticFunction[];
  contentSummary: string;
  exercisesList: string[];
  homeworkList: string[];
  id?: string;
  createdAt?: string;
}
