import { useEffect, useState } from 'react';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import { People, School, Payment, Person } from '@mui/icons-material';
import pb from '../../api/pb';

interface Stats {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  pendingPayments: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [users, courses, payments] = await Promise.all([
          pb.collection('users').getFullList(),
          pb.collection('courses').getFullList(),
          pb.collection('payments').getFullList({ filter: 'status="pending"' }),
        ]);

        const students = users.filter((u) => u.role === 'student');
        const teachers = users.filter((u) => u.role === 'teacher');

        setStats({
          totalUsers: users.length,
          totalStudents: students.length,
          totalTeachers: teachers.length,
          totalCourses: courses.length,
          pendingPayments: payments.length,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers, icon: <People fontSize="large" />, color: '#1976d2' },
    { label: 'Students', value: stats?.totalStudents, icon: <People fontSize="large" />, color: '#2e7d32' },
    { label: 'Teachers', value: stats?.totalTeachers, icon: <Person fontSize="large" />, color: '#ed6c02' },
    { label: 'Courses', value: stats?.totalCourses, icon: <School fontSize="large" />, color: '#9c27b0' },
    { label: 'Pending Payments', value: stats?.pendingPayments, icon: <Payment fontSize="large" />, color: '#d32f2f' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Overview of system statistics
      </Typography>

      <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
        {statCards.map((card) => (
          <Paper
            key={card.label}
            sx={{
              p: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              borderLeft: `4px solid ${card.color}`,
            }}
          >
            <Box sx={{ color: card.color }}>{card.icon}</Box>
            <Box>
              <Typography variant="h4">{card.value || 0}</Typography>
              <Typography variant="body2" color="text.secondary">
                {card.label}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}
