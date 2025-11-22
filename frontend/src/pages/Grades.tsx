import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
} from '@mui/material';
import { Add, Edit } from '@mui/icons-material';
import { useAuth } from '../auth/AuthProvider';
import pb from '../api/pb';

interface Grade {
  id: string;
  student: string;
  course: string;
  value: number;
  note: string;
  expand?: {
    student?: {
      fullName: string;
    };
    course?: {
      title: string;
    };
  };
}

interface Course {
  id: string;
  title: string;
  students: string[];
}

interface Student {
  id: string;
  fullName: string;
}

export default function Grades() {
  const { user } = useAuth();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [formData, setFormData] = useState({ student: '', course: '', value: '', note: '' });

  const canEdit = user?.role === 'admin' || user?.role === 'teacher';

  useEffect(() => {
    fetchData();
  }, [user?.id, user?.role]);

  const fetchData = async () => {
    try {
      setLoading(true);
      let gradeFilter = '';

      if (user?.role === 'student') {
        gradeFilter = `student="${user.id}"`;
      } else if (user?.role === 'teacher') {
        const teacherCourses = await pb.collection('courses').getFullList({
          filter: `teacher="${user.id}"`,
        });
        const courseIds = teacherCourses.map((c) => c.id);
        if (courseIds.length > 0) {
          gradeFilter = courseIds.map((id) => `course="${id}"`).join(' || ');
        }
      }

      const gradeRecords = await pb.collection('grades').getFullList({
        filter: gradeFilter,
        expand: 'student,course',
        sort: '-created',
      });

      setGrades(gradeRecords as any);

      if (canEdit) {
        const [courseRecords, studentRecords] = await Promise.all([
          pb.collection('courses').getFullList({
            filter: user?.role === 'teacher' ? `teacher="${user.id}"` : '',
          }),
          pb.collection('users').getFullList({ filter: 'role="student"' }),
        ]);
        setCourses(courseRecords as any);
        setStudents(studentRecords as any);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (grade?: Grade) => {
    if (grade) {
      setEditingGrade(grade);
      setFormData({
        student: grade.student,
        course: grade.course,
        value: grade.value.toString(),
        note: grade.note || '',
      });
    } else {
      setEditingGrade(null);
      setFormData({ student: '', course: '', value: '', note: '' });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingGrade(null);
    setFormData({ student: '', course: '', value: '', note: '' });
  };

  const handleSave = async () => {
    try {
      const data = {
        ...formData,
        value: parseFloat(formData.value),
      };

      if (editingGrade) {
        await pb.collection('grades').update(editingGrade.id, data);
      } else {
        await pb.collection('grades').create(data);
      }

      handleCloseDialog();
      fetchData();
    } catch (error: any) {
      console.error('Failed to save grade:', error);
      alert(error.message || 'Failed to save grade');
    }
  };

  const getAvailableStudents = () => {
    if (!formData.course) return students;
    const course = courses.find((c) => c.id === formData.course);
    return students.filter((s) => course?.students?.includes(s.id));
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Grades</Typography>
        {canEdit && (
          <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
            Add Grade
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {user?.role !== 'student' && <TableCell>Student</TableCell>}
              <TableCell>Course</TableCell>
              <TableCell>Grade</TableCell>
              <TableCell>Note</TableCell>
              {canEdit && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {grades.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canEdit ? 5 : 4} align="center">
                  No grades found
                </TableCell>
              </TableRow>
            ) : (
              grades.map((grade) => (
                <TableRow key={grade.id}>
                  {user?.role !== 'student' && (
                    <TableCell>{grade.expand?.student?.fullName || 'N/A'}</TableCell>
                  )}
                  <TableCell>{grade.expand?.course?.title || 'N/A'}</TableCell>
                  <TableCell>{grade.value}</TableCell>
                  <TableCell>{grade.note || '-'}</TableCell>
                  {canEdit && (
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleOpenDialog(grade)}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingGrade ? 'Edit Grade' : 'Add Grade'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Course"
            select
            fullWidth
            margin="normal"
            value={formData.course}
            onChange={(e) => setFormData({ ...formData, course: e.target.value, student: '' })}
            required
          >
            {courses.map((course) => (
              <MenuItem key={course.id} value={course.id}>
                {course.title}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Student"
            select
            fullWidth
            margin="normal"
            value={formData.student}
            onChange={(e) => setFormData({ ...formData, student: e.target.value })}
            required
            disabled={!formData.course}
          >
            {getAvailableStudents().map((student) => (
              <MenuItem key={student.id} value={student.id}>
                {student.fullName}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Grade"
            type="number"
            fullWidth
            margin="normal"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            required
            inputProps={{ min: 0, max: 100, step: 0.1 }}
          />
          <TextField
            label="Note"
            fullWidth
            margin="normal"
            multiline
            rows={2}
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={!formData.student || !formData.course || !formData.value}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
