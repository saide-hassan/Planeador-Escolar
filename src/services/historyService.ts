import { HistoryItem, LessonPlan, Evaluation } from '../types';
import { auth, db, isFirebaseConfigured } from '../lib/firebase';
import { collection, doc, query, where, getDocs, setDoc, deleteDoc, orderBy } from 'firebase/firestore';

const HISTORY_KEY = 'lesson_plan_history';

export const getHistorySync = (): HistoryItem[] => {
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

export const getHistory = async (): Promise<HistoryItem[]> => {
  if (isFirebaseConfigured() && auth.currentUser) {
    try {
      const historyRef = collection(db, 'history');
      const q = query(
        historyRef,
        where('userId', '==', auth.currentUser.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const history: HistoryItem[] = [];
      
      querySnapshot.forEach((doc) => {
        history.push(doc.data().data as HistoryItem);
      });
      
      history.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
      return history;
    } catch (e) {
      console.error('Error fetching history from Firebase', e);
    }
  }
  return getHistorySync();
};

export const saveItem = async (item: HistoryItem) => {
  const history = getHistorySync();
  
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

  let updatedHistory = [...history];
  if (existingIndex >= 0) {
    // Update existing item
    updatedHistory[existingIndex] = newItem;
  } else {
    // For new items, we no longer do aggressive deduplication 
    // because each generation is unique and should be saved if the user generated it.
    updatedHistory = [newItem, ...history];
  }
  
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));

  if (isFirebaseConfigured() && auth.currentUser) {
    try {
      const docRef = doc(db, 'history', newItem.id);
      
      // Firebase throws an error if the object contains undefined values. 
      // We stringify and parse to seamlessly drop all undefined properties.
      const cleanedItem = JSON.parse(JSON.stringify(newItem));
      
      await setDoc(docRef, {
        userId: auth.currentUser.uid,
        type: cleanedItem.type || 'lesson',
        data: cleanedItem,
        createdAt: cleanedItem.createdAt
      });
    } catch (e) {
      console.error('Error saving item to Firebase', e);
    }
  }
};

// Keep savePlan for backward compatibility
export const savePlan = async (plan: LessonPlan) => {
  await saveItem({ ...plan, type: 'lesson' });
};

export const deleteItem = async (id: string) => {
  const history = getHistorySync();
  const updatedHistory = history.filter(item => item.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));

  if (isFirebaseConfigured() && auth.currentUser) {
    try {
      // NOTE: For better security, ensure only items belonging to the user are deleted,
      // but firestore rules should cover this.
      await deleteDoc(doc(db, 'history', id));
    } catch (e) {
       console.error('Error deleting item from Firebase', e);
    }
  }
};

// Keep deletePlan for backward compatibility
export const deletePlan = deleteItem;

export const clearHistory = async () => {
  localStorage.removeItem(HISTORY_KEY);

  if (isFirebaseConfigured() && auth.currentUser) {
    try {
      // Deleting all docs requires querying them first
      const historyRef = collection(db, 'history');
      const q = query(historyRef, where('userId', '==', auth.currentUser.uid));
      const querySnapshot = await getDocs(q);
      
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    } catch (e) {
      console.error('Error clearing history on Firebase', e);
    }
  }
};
