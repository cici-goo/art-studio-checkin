import { db } from './database';

// 保存学生数据
export const saveStudents = async (students) => {
  try {
    const Students = db.Object.extend('Students');
    // 先删除所有现有数据
    const query = new db.Query('Students');
    const oldData = await query.find();
    await db.Object.destroyAll(oldData);
    
    // 创建新记录
    const studentObj = new Students();
    console.log('Saving students:', students);
    studentObj.set('data', students);
    await studentObj.save();
    console.log('Students saved successfully');
  } catch (error) {
    console.error('Error saving students:', error);
    throw error;
  }
};

// 获取学生数据
export const getStudents = async () => {
  try {
    const query = new db.Query('Students');
    const results = await query.find();
    const latestData = results[0];
    console.log('Retrieved students:', latestData ? latestData.get('data') : []);
    return latestData ? latestData.get('data') : [];
  } catch (error) {
    console.error('Error getting students:', error);
    return [];
  }
};

// 保存班级类型
export const saveClassTypes = async (types) => {
  try {
    const ClassTypes = db.Object.extend('ClassTypes');
    // 先删除所有现有数据
    const query = new db.Query('ClassTypes');
    const oldData = await query.find();
    await db.Object.destroyAll(oldData);
    
    // 创建新记录
    const classTypesObj = new ClassTypes();
    console.log('Saving class types:', types);
    classTypesObj.set('types', types);
    await classTypesObj.save();
    console.log('Class types saved successfully');
  } catch (error) {
    console.error('Error saving class types:', error);
    throw error;
  }
};

// 获取班级类型
export const getClassTypes = async () => {
  try {
    const query = new db.Query('ClassTypes');
    const results = await query.find();
    const latestData = results[0];
    console.log('Retrieved class types:', latestData ? latestData.get('types') : ['A', 'B', 'C', 'D']);
    return latestData ? latestData.get('types') : ['A', 'B', 'C', 'D'];
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