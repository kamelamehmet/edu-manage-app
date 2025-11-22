import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip,
} from '@mui/material';
import pb from '../api/pb';

interface Teacher {
  id: string;
  email: string;
  fullName: string;
}

interface Course {
  id: string;
  title: string;
  teacher: string;
}

export default function Teachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [teacherRecords, courseRecords] = await Promise.all([
        pb.collection('users').getFullList({ filter: 'role="teacher"' }),
        pb.collection('courses').getFullList(),
      ]);

      setTeachers(teacherRecords as any);
      setCourses(courseRecords as any);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTeacherCourses = (teacherId: string) => {
    return courses.filter((course) => course.teacher === teacherId);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Teachers
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Courses Teaching</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {teachers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  No teachers found
                </TableCell>
              </TableRow>
            ) : (
              teachers.map((teacher) => {
                const teacherCourses = getTeacherCourses(teacher.id);
                return (
                  <TableRow key={teacher.id}>
                    <TableCell>{teacher.fullName}</TableCell>
                    <TableCell>{teacher.email}</TableCell>
                    <TableCell>
                      {teacherCourses.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          No courses assigned
                        </Typography>
                      ) : (
                        <Box display="flex" gap={0.5} flexWrap="wrap">
                          {teacherCourses.map((course) => (
                            <Chip key={course.id} label={course.title} size="small" />
                          ))}
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
