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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
} from '@mui/material';
import { School } from '@mui/icons-material';
import pb from '../api/pb';

interface Student {
  id: string;
  email: string;
  fullName: string;
}

interface Course {
  id: string;
  title: string;
  students: string[];
}

export default function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentRecords, courseRecords] = await Promise.all([
        pb.collection('users').getFullList({ filter: 'role="student"' }),
        pb.collection('courses').getFullList(),
      ]);

      setStudents(studentRecords as any);
      setCourses(courseRecords as any);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEnrollDialog = (student: Student) => {
    setSelectedStudent(student);
    const enrolledCourseIds = courses
      .filter((course) => course.students?.includes(student.id))
      .map((course) => course.id);
    setSelectedCourses(enrolledCourseIds);
    setEnrollDialogOpen(true);
  };

  const handleCloseEnrollDialog = () => {
    setEnrollDialogOpen(false);
    setSelectedStudent(null);
    setSelectedCourses([]);
  };

  const handleSaveEnrollment = async () => {
    if (!selectedStudent) return;

    try {
      for (const course of courses) {
        const isCurrentlyEnrolled = course.students?.includes(selectedStudent.id);
        const shouldBeEnrolled = selectedCourses.includes(course.id);

        if (shouldBeEnrolled && !isCurrentlyEnrolled) {
          const updatedStudents = [...(course.students || []), selectedStudent.id];
          await pb.collection('courses').update(course.id, { students: updatedStudents });
        } else if (!shouldBeEnrolled && isCurrentlyEnrolled) {
          const updatedStudents = course.students.filter((id) => id !== selectedStudent.id);
          await pb.collection('courses').update(course.id, { students: updatedStudents });
        }
      }

      handleCloseEnrollDialog();
      fetchData();
    } catch (error: any) {
      console.error('Failed to update enrollment:', error);
      alert(error.message || 'Failed to update enrollment');
    }
  };

  const getEnrolledCourses = (studentId: string) => {
    return courses.filter((course) => course.students?.includes(studentId));
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
        Students
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Enrolled Courses</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No students found
                </TableCell>
              </TableRow>
            ) : (
              students.map((student) => {
                const enrolledCourses = getEnrolledCourses(student.id);
                return (
                  <TableRow key={student.id}>
                    <TableCell>{student.fullName}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>
                      <Chip label={enrolledCourses.length} size="small" />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleOpenEnrollDialog(student)}>
                        <School fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={enrollDialogOpen} onClose={handleCloseEnrollDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Manage Enrollment - {selectedStudent?.fullName}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Enrolled Courses</InputLabel>
            <Select
              multiple
              value={selectedCourses}
              onChange={(e) => setSelectedCourses(e.target.value as string[])}
              input={<OutlinedInput label="Enrolled Courses" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const course = courses.find((c) => c.id === value);
                    return <Chip key={value} label={course?.title || value} size="small" />;
                  })}
                </Box>
              )}
            >
              {courses.map((course) => (
                <MenuItem key={course.id} value={course.id}>
                  {course.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEnrollDialog}>Cancel</Button>
          <Button onClick={handleSaveEnrollment} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
