import { auth, db, isFirebaseConfigured } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface TeacherProfile {
  schoolName: string;
  schoolType: 'Escola' | 'Colégio';
  teacherName: string;
  subjects: string;
  grades: string;
}

const PROFILE_KEY = 'teacher_profile';

export const getProfileSync = (): TeacherProfile | null => {
  try {
    const saved = localStorage.getItem(PROFILE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading profile sync', e);
  }
  return null;
};

export const getProfile = async (): Promise<TeacherProfile | null> => {
  try {
    if (isFirebaseConfigured() && auth.currentUser) {
      const docRef = doc(db, 'profiles', auth.currentUser.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const profile: TeacherProfile = {
          schoolName: data.schoolName || '',
          schoolType: data.schoolType || 'Escola',
          teacherName: data.teacherName || '',
          subjects: data.subjects || '',
          grades: data.grades || ''
        };
        // Sync local storage
        localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
        return profile;
      }
    }
    
    // Fallback to local storage
    return getProfileSync();
  } catch (e) {
    console.error('Error loading profile', e);
  }
  return null;
};

export const saveProfile = async (profile: TeacherProfile): Promise<void> => {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    
    if (isFirebaseConfigured() && auth.currentUser) {
      const docRef = doc(db, 'profiles', auth.currentUser.uid);
      await setDoc(docRef, {
        schoolName: profile.schoolName,
        schoolType: profile.schoolType,
        teacherName: profile.teacherName,
        subjects: profile.subjects,
        grades: profile.grades,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }
    
    window.dispatchEvent(new Event('profileUpdated'));
  } catch (e) {
    console.error('Error saving profile', e);
  }
};
