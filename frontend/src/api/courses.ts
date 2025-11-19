import pb from './pb';

export const createCourse = async (payload: { title:string, description?:string, teacher?:string }) => {
  return pb.collection('courses').create(payload);
};

export const getCourses = async (query = '') => {
  return pb.collection('courses').getFullList(200 /*max*/, { sort: '-created' });
};

export const updateCourse = async (id:string, payload:any) => {
  return pb.collection('courses').update(id, payload);
};
