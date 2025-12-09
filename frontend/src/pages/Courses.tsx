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
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
} from '@mui/material';
import { Add, Edit, Delete, PersonAdd } from '@mui/icons-material';
import { useAuth } from '../auth/AuthProvider';
import pb from '../api/pb';

interface Course {
  id: string;
  title: string;
  description: string;
  teacher: string;
  students: string[];
  expand?: {
    teacher?: {
      id: string;
      fullName: string;
    };
    students?: Array<{
      id: string;
      fullName: string;
    }>;
  };
}

interface User {
  id: string;
  fullName: string;
}

interface Student {
  id: string;
  fullName: string;
  email: string;
}

export default function Courses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [enrollingCourse, setEnrollingCourse] = useState<Course | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [formData, setFormData] = useState({ title: '', description: '', teacher: '' });

  const canEdit = user?.role === 'admin' || user?.role === 'teacher';

  useEffect(() => {
    fetchCourses();
    if (canEdit) {
      fetchTeachers();
      fetchStudents();
    }
  }, [canEdit]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      let filter = '';

      if (user?.role === 'student') {
        filter = `students.id ?= "${user.id}"`;
      } else if (user?.role === 'teacher') {
        filter = `teacher="${user.id}"`;
      }

      const records = await pb.collection('courses').getFullList({
        filter,
        expand: 'teacher,students',
        sort: '-created',
      });

      setCourses(records as any);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const records = await pb.collection('users').getFullList({
        filter: 'role="teacher"',
      });
      setTeachers(records as any);
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const records = await pb.collection('users').getFullList({
        filter: 'role="student"',
      });
      setStudents(records as any);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    }
  };

  const handleOpenEnrollDialog = (course: Course) => {
    setEnrollingCourse(course);
    setSelectedStudents(course.students || []);
    setEnrollDialogOpen(true);
  };

  const handleCloseEnrollDialog = () => {
    setEnrollDialogOpen(false);
    setEnrollingCourse(null);
    setSelectedStudents([]);
  };

  const handleSaveEnrollment = async () => {
    if (!enrollingCourse) return;

    try {
      await pb.collection('courses').update(enrollingCourse.id, {
        students: selectedStudents,
      });
      handleCloseEnrollDialog();
      fetchCourses();
    } catch (error: any) {
      console.error('Failed to update enrollment:', error);
      const errorMsg = error?.response?.message || error?.message || 'Failed to update enrollment';
      alert('Error: ' + errorMsg);
    }
  };

  const handleOpenDialog = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      setFormData({
        title: course.title,
        description: course.description,
        teacher: course.teacher,
      });
    } else {
      setEditingCourse(null);
      setFormData({ title: '', description: '', teacher: user?.role === 'teacher' ? (user?.id || '') : '' });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCourse(null);
    setFormData({ title: '', description: '', teacher: '' });
  };

  const handleSave = async () => {
    try {
      if (editingCourse) {
        await pb.collection('courses').update(editingCourse.id, formData);
      } else {
        await pb.collection('courses').create(formData);
      }
      handleCloseDialog();
      fetchCourses();
    } catch (error: any) {
      console.error('Failed to save course:', error);
      alert(error.message || 'Failed to save course');
    }
  };

  const handleOpenDeleteDialog = (course: Course) => {
    setDeletingCourse(course);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeletingCourse(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingCourse) return;

    try {
      await pb.collection('courses').delete(deletingCourse.id);
      handleCloseDeleteDialog();
      fetchCourses();
    } catch (error: any) {
      console.error('Failed to delete course:', error);
      const errorMsg = error?.response?.message || error?.message || 'Failed to delete course';
      alert('Error: ' + errorMsg);
    }
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
        <Typography variant="h4">Courses</Typography>
        {canEdit && (
          <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
            Add Course
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Teacher</TableCell>
              <TableCell>Students</TableCell>
              {canEdit && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {courses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canEdit ? 4 : 3} align="center">
                  No courses found
                </TableCell>
              </TableRow>
            ) : (
              courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>{course.title}</TableCell>
                  <TableCell>{course.expand?.teacher?.fullName || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip label={course.students?.length || 0} size="small" />
                  </TableCell>
                  {canEdit && (
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenEnrollDialog(course)}
                        title="Manage students"
                      >
                        <PersonAdd fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleOpenDialog(course)}>
                        <Edit fontSize="small" />
                      </IconButton>
                      {user?.role === 'admin' && (
                        <IconButton size="small" onClick={() => handleOpenDeleteDialog(course)} color="error">
                          <Delete fontSize="small" />
                        </IconButton>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingCourse ? 'Edit Course' : 'Add Course'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Title"
            fullWidth
            margin="normal"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <TextField
            label="Description"
            fullWidth
            margin="normal"
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          {user?.role === 'admin' && (
            <TextField
              label="Teacher"
              select
              fullWidth
              margin="normal"
              value={formData.teacher}
              onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
              required
            >
              {teachers.map((teacher) => (
                <MenuItem key={teacher.id} value={teacher.id}>
                  {teacher.fullName}
                </MenuItem>
              ))}
            </TextField>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={!formData.title || !formData.teacher}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={enrollDialogOpen} onClose={handleCloseEnrollDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Manage Students - {enrollingCourse?.title}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Enrolled Students</InputLabel>
            <Select
              multiple
              value={selectedStudents}
              onChange={(e) => setSelectedStudents(e.target.value as string[])}
              input={<OutlinedInput label="Enrolled Students" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const student = students.find((s) => s.id === value);
                    return <Chip key={value} label={student?.fullName || value} size="small" />;
                  })}
                </Box>
              )}
            >
              {students.map((student) => (
                <MenuItem key={student.id} value={student.id}>
                  {student.fullName} ({student.email})
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

      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Course</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the course <strong>"{deletingCourse?.title}"</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            This action cannot be undone. All related schedules and grades will remain but will no longer be associated with this course.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
