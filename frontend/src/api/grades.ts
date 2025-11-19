import pb from './pb';

export const assignGrade = async ({
  studentId,
  courseId,
  value,
  note
}: {
  studentId: string;
  courseId: string;
  value: number | string;
  note?: string;
}) => {
  return pb.collection('grades').create({
    student: studentId,
    course: courseId,
    value,
    note,
    assignedBy: pb.authStore.model?.id,
  });
};

// get all grades with expanded relations
export const getGrades = async () => {
  return await pb.collection('grades').getList(1, 50, {
    expand: 'student,course',
  });
};
