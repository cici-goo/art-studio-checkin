import { db } from './firebase';
import { getDoc, setDoc, doc } from 'firebase/firestore';

// 保存学生数据
export const saveStudents = async (students) => {
  try {
    const studentsRef = doc(db, 'data', 'students');
    await setDoc(studentsRef, { students });
  } catch (error) {
    console.error('Error saving students:', error);
  }
};

// 获取学生数据
export const getStudents = async () => {
  try {
    const studentsRef = doc(db, 'data', 'students');
    const docSnap = await getDoc(studentsRef);
    return docSnap.exists() ? docSnap.data().students : [];
  } catch (error) {
    console.error('Error getting students:', error);
    return [];
  }
};

// 保存班级类型
export const saveClassTypes = async (types) => {
  try {
    const classTypesRef = doc(db, 'data', 'classTypes');
    await setDoc(classTypesRef, { types });
  } catch (error) {
    console.error('Error saving class types:', error);
  }
};

// 获取班级类型
export const getClassTypes = async () => {
  try {
    const classTypesRef = doc(db, 'data', 'classTypes');
    const docSnap = await getDoc(classTypesRef);
    return docSnap.exists() ? docSnap.data().types : ['A', 'B', 'C', 'D'];
  } catch (error) {
    console.error('Error getting class types:', error);
    return ['A', 'B', 'C', 'D'];
  }
};

// 添加课时记录
export const addLessonRecord = (student, change, note) => {
  const currentLessons = student.lessons || 0;
  const newLessons = Math.max(0, currentLessons + change);
  const now = new Date().toISOString();
  
  const newRecord = {
    time: now,
    change,
    remaining: newLessons,
    note,
    id: Date.now().toString()
  };

  return {
    ...student,
    lessons: newLessons,
    lastCheckin: change < 0 ? now : student.lastCheckin,
    records: [...(student.records || []), newRecord]
  };
}; 