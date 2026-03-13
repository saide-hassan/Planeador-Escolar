import { HistoryItem, LessonPlan, Evaluation } from '../types';

const HISTORY_KEY = 'lesson_plan_history';

export const saveItem = (item: HistoryItem) => {
  const history = getHistory();
  
  // Fallback for crypto.randomUUID in non-secure contexts
  const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'id-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
  };

  const newItem = {
    ...item,
    id: item.id || generateId(),
    createdAt: item.createdAt || new Date().toISOString(),
  };
  
  const existingIndex = history.findIndex(p => p.id === newItem.id);

  if (existingIndex >= 0) {
    // Update existing item
    const updatedHistory = [...history];
    updatedHistory[existingIndex] = newItem;
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  } else {
    // Check for duplicates
    const isDuplicate = history.some(p => {
      if (p.type === 'evaluation' && newItem.type === 'evaluation') {
        const pEval = p as Evaluation;
        const nEval = newItem as Evaluation;
        return pEval.topics === nEval.topics && pEval.subject === nEval.subject && pEval.date === nEval.date;
      } else if (p.type !== 'evaluation' && newItem.type !== 'evaluation') {
        const pLesson = p as LessonPlan;
        const nLesson = newItem as LessonPlan;
        return pLesson.topic === nLesson.topic && pLesson.subject === nLesson.subject && pLesson.date === nLesson.date && pLesson.contentSummary === nLesson.contentSummary;
      }
      return false;
    });

    if (!isDuplicate) {
      const updatedHistory = [newItem, ...history];
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    }
  }
};

// Keep savePlan for backward compatibility
export const savePlan = (plan: LessonPlan) => {
  saveItem({ ...plan, type: 'lesson' });
};

export const getHistory = (): HistoryItem[] => {
  const stored = localStorage.getItem(HISTORY_KEY);
  if (!stored) return [];
  const parsed = JSON.parse(stored);
  // Ensure old items have correct type
  return parsed.map((item: any) => {
    let inferredType = item.type;
    if (!inferredType) {
      if (item.evaluationType || item.questions) {
        inferredType = 'evaluation';
      } else {
        inferredType = 'lesson';
      }
    }
    return {
      ...item,
      type: inferredType
    };
  });
};

export const deleteItem = (id: string) => {
  const history = getHistory();
  const updatedHistory = history.filter(item => item.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
};

// Keep deletePlan for backward compatibility
export const deletePlan = deleteItem;

export const clearHistory = () => {
  localStorage.removeItem(HISTORY_KEY);
};
