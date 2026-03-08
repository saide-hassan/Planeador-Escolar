import { LessonPlan } from '../types';
import { db, auth, isFirebaseInitialized } from './firebase';
import { collection, addDoc, getDocs, query, where, orderBy, doc, deleteDoc, updateDoc, Timestamp } from 'firebase/firestore';

const LOCAL_STORAGE_KEY = 'lesson_plans';

export const savePlan = async (plan: LessonPlan): Promise<void> => {
  const user = isFirebaseInitialized && auth ? auth.currentUser : null;
  
  if (user && db) {
    // Save to Firestore
    try {
      const planData = {
        ...plan,
        userId: user.uid,
        createdAt: Timestamp.now(),
      };
      
      if (plan.id && !plan.id.startsWith('local_')) {
        // Update existing plan in Firestore
        const planRef = doc(db, 'plans', plan.id);
        await updateDoc(planRef, planData);
      } else {
        // Create new plan in Firestore
        // Remove local ID if exists
        const { id, ...newPlanData } = planData;
        await addDoc(collection(db, 'plans'), newPlanData);
      }
    } catch (error) {
      console.error("Error saving plan to Firestore:", error);
      throw error;
    }
  } else {
    // Save to LocalStorage
    const existingPlans = getPlansFromLocalStorage();
    const updatedPlans = plan.id 
      ? existingPlans.map(p => p.id === plan.id ? plan : p)
      : [plan, ...existingPlans];
    
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedPlans));
  }
};

export const getPlans = async (): Promise<LessonPlan[]> => {
  const user = isFirebaseInitialized && auth ? auth.currentUser : null;
  
  if (user && db) {
    // Get from Firestore
    try {
      const q = query(
        collection(db, 'plans'), 
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString() // Convert Timestamp to string
      })) as LessonPlan[];
    } catch (error) {
      console.error("Error getting plans from Firestore:", error);
      return [];
    }
  } else {
    // Get from LocalStorage
    return getPlansFromLocalStorage();
  }
};

export const deletePlan = async (id: string): Promise<void> => {
  const user = isFirebaseInitialized && auth ? auth.currentUser : null;
  
  if (user && db && !id.startsWith('local_')) {
    // Delete from Firestore
    try {
      await deleteDoc(doc(db, 'plans', id));
    } catch (error) {
      console.error("Error deleting plan from Firestore:", error);
      throw error;
    }
  } else {
    // Delete from LocalStorage
    const existingPlans = getPlansFromLocalStorage();
    const updatedPlans = existingPlans.filter(p => p.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedPlans));
  }
};

export const deleteAllPlans = async (): Promise<void> => {
  const user = isFirebaseInitialized && auth ? auth.currentUser : null;
  
  if (user && db) {
    // Delete all from Firestore
    try {
      const plans = await getPlans();
      const deletePromises = plans.map(plan => 
        plan.id && !plan.id.startsWith('local_') ? deleteDoc(doc(db!, 'plans', plan.id)) : Promise.resolve()
      );
      await Promise.all(deletePromises);
    } catch (error) {
      console.error("Error deleting all plans from Firestore:", error);
      throw error;
    }
  } else {
    // Delete from LocalStorage
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }
};

const getPlansFromLocalStorage = (): LessonPlan[] => {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};
