export const saveStudents = (students) => {
  // 确保每个学生都有 records 数组
  const studentsWithRecords = students.map(student => ({
    ...student,
    records: student.records || []
  }));
  localStorage.setItem('students', JSON.stringify(studentsWithRecords));
};

export const getStudents = () => {
  const students = localStorage.getItem('students');
  return students ? JSON.parse(students) : [];
};

export const saveClassTypes = (types) => {
  localStorage.setItem('classTypes', JSON.stringify(types));
};

export const getClassTypes = () => {
  const types = localStorage.getItem('classTypes');
  return types ? JSON.parse(types) : ['A', 'B', 'C', 'D'];
};

// 添加新的函数来处理课时变动
export const addLessonRecord = (student, change, note) => {
  const currentLessons = student.lessons || 0;
  const newLessons = currentLessons + change;
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
    lastCheckin: change < 0 ? now : student.lastCheckin, // 只在打卡（减少课时）时更新最后打卡时间
    records: [...(student.records || []), newRecord]
  };
}; 