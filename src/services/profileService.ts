export interface TeacherProfile {
  schoolName: string;
  schoolType: 'Escola' | 'Colégio';
  teacherName: string;
  subjects: string;
  grades: string;
}

const PROFILE_KEY = 'teacher_profile';

export const getProfile = (): TeacherProfile | null => {
  try {
    const saved = localStorage.getItem(PROFILE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading profile', e);
  }
  return null;
};

export const saveProfile = (profile: TeacherProfile): void => {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    window.dispatchEvent(new Event('profileUpdated'));
  } catch (e) {
    console.error('Error saving profile', e);
  }
};
