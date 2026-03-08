import { LessonPlan } from '../types';

const HISTORY_KEY = 'lesson_plan_history';

export const savePlan = (plan: LessonPlan) => {
  const history = getHistory();
  const newPlan = {
    ...plan,
    id: plan.id || crypto.randomUUID(),
    createdAt: plan.createdAt || new Date().toISOString(),
  };
  
  const existingIndex = history.findIndex(p => p.id === newPlan.id);

  if (existingIndex >= 0) {
    // Update existing plan
    const updatedHistory = [...history];
    updatedHistory[existingIndex] = newPlan;
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  } else {
    // Check for duplicates (same content summary and topic) to avoid spamming
    const isDuplicate = history.some(p => 
      p.topic === newPlan.topic && 
      p.subject === newPlan.subject && 
      p.date === newPlan.date &&
      p.contentSummary === newPlan.contentSummary
    );

    if (!isDuplicate) {
      const updatedHistory = [newPlan, ...history];
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    }
  }
};

export const getHistory = (): LessonPlan[] => {
  const stored = localStorage.getItem(HISTORY_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const deletePlan = (id: string) => {
  const history = getHistory();
  const updatedHistory = history.filter(plan => plan.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
};

export const clearHistory = () => {
  localStorage.removeItem(HISTORY_KEY);
};
