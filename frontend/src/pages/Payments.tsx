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
} from '@mui/material';
import { Add, Edit } from '@mui/icons-material';
import { useAuth } from '../auth/AuthProvider';
import pb from '../api/pb';

interface Payment {
  id: string;
  student: string;
  course: string;
  amount: number;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  date: string;
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
}

interface Student {
  id: string;
  fullName: string;
}

const statusColors = {
  pending: 'warning',
  paid: 'success',
  failed: 'error',
  refunded: 'info',
} as const;

export default function Payments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [formData, setFormData] = useState({
    student: '',
    course: '',
    amount: '',
    status: 'pending' as 'pending' | 'paid' | 'failed' | 'refunded',
    date: new Date().toISOString().split('T')[0],
  });

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchData();
  }, [user?.id, user?.role]);

  const fetchData = async () => {
    try {
      setLoading(true);
      let filter = '';

      if (user?.role === 'student') {
        filter = `student="${user.id}"`;
      }

      const paymentRecords = await pb.collection('payments').getFullList({
        filter,
        expand: 'student,course',
        sort: '-date',
      });

      setPayments(paymentRecords as any);

      if (isAdmin) {
        const [courseRecords, studentRecords] = await Promise.all([
          pb.collection('courses').getFullList(),
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

  const handleOpenDialog = (payment?: Payment) => {
    if (payment) {
      setEditingPayment(payment);
      setFormData({
        student: payment.student,
        course: payment.course,
        amount: payment.amount.toString(),
        status: payment.status,
        date: payment.date,
      });
    } else {
      setEditingPayment(null);
      setFormData({
        student: '',
        course: '',
        amount: '',
        status: 'pending',
        date: new Date().toISOString().split('T')[0],
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingPayment(null);
  };

  const handleSave = async () => {
    try {
      const data = {
        ...formData,
        amount: parseFloat(formData.amount),
      };

      if (editingPayment) {
        await pb.collection('payments').update(editingPayment.id, data);
      } else {
        await pb.collection('payments').create(data);
      }

      handleCloseDialog();
      fetchData();
    } catch (error: any) {
      console.error('Failed to save payment:', error);
      alert(error.message || 'Failed to save payment');
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
        <Typography variant="h4">Payments</Typography>
        {isAdmin && (
          <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
            Add Payment
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {user?.role !== 'student' && <TableCell>Student</TableCell>}
              <TableCell>Course</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              {isAdmin && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 6 : 5} align="center">
                  No payments found
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => (
                <TableRow key={payment.id}>
                  {user?.role !== 'student' && (
                    <TableCell>{payment.expand?.student?.fullName || 'N/A'}</TableCell>
                  )}
                  <TableCell>{payment.expand?.course?.title || 'N/A'}</TableCell>
                  <TableCell>${payment.amount.toFixed(2)}</TableCell>
                  <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Chip
                      label={payment.status}
                      color={statusColors[payment.status]}
                      size="small"
                    />
                  </TableCell>
                  {isAdmin && (
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleOpenDialog(payment)}>
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
        <DialogTitle>{editingPayment ? 'Edit Payment' : 'Add Payment'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Student"
            select
            fullWidth
            margin="normal"
            value={formData.student}
            onChange={(e) => setFormData({ ...formData, student: e.target.value })}
            required
          >
            {students.map((student) => (
              <MenuItem key={student.id} value={student.id}>
                {student.fullName}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Course"
            select
            fullWidth
            margin="normal"
            value={formData.course}
            onChange={(e) => setFormData({ ...formData, course: e.target.value })}
            required
          >
            {courses.map((course) => (
              <MenuItem key={course.id} value={course.id}>
                {course.title}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Amount"
            type="number"
            fullWidth
            margin="normal"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
            inputProps={{ min: 0, step: 0.01 }}
          />
          <TextField
            label="Date"
            type="date"
            fullWidth
            margin="normal"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Status"
            select
            fullWidth
            margin="normal"
            value={formData.status}
            onChange={(e) =>
              setFormData({
                ...formData,
                status: e.target.value as 'pending' | 'paid' | 'failed' | 'refunded',
              })
            }
            required
          >
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="paid">Paid</MenuItem>
            <MenuItem value="failed">Failed</MenuItem>
            <MenuItem value="refunded">Refunded</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={!formData.student || !formData.course || !formData.amount || !formData.date}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
