import { useEffect, useState } from 'react';
import { Box, Paper, Typography, CircularProgress, Card, CardContent, Chip } from '@mui/material';
import { School, CalendarMonth } from '@mui/icons-material';
import { useAuth } from '../../auth/AuthProvider';
import pb from '../../api/pb';

interface Course {
  id: string;
  title: string;
  description: string;
  students: string[];
}

interface Schedule {
  id: string;
  startTime: string;
  endTime: string;
  location: string;
  expand?: {
    course?: {
      title: string;
    };
  };
}

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [upcomingClasses, setUpcomingClasses] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const teacherCourses = await pb.collection('courses').getFullList({
          filter: `teacher="${user?.id}"`,
        });

        const courseIds = teacherCourses.map((c) => c.id);
        const now = new Date().toISOString();

        let schedules: any[] = [];
        if (courseIds.length > 0) {
          const filterParts = courseIds.map((id) => `course="${id}"`);
          schedules = await pb.collection('schedule').getFullList({
            filter: `(${filterParts.join(' || ')}) && startTime >= "${now}"`,
            expand: 'course',
            sort: 'startTime',
          });
        }

        setCourses(teacherCourses as unknown as Course[]);
        setUpcomingClasses(schedules.slice(0, 5) as unknown as Schedule[]);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

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
        Welcome, {user?.fullName}
      </Typography>

      <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
        <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <School color="primary" />
              <Typography variant="h6">My Courses</Typography>
            </Box>

            {courses.length === 0 ? (
              <Typography color="text.secondary">You are not assigned to any courses yet.</Typography>
            ) : (
              <Box display="flex" flexDirection="column" gap={2}>
                {courses.map((course) => (
                  <Card key={course.id} variant="outlined">
                    <CardContent>
                      <Typography variant="h6">{course.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {course.students?.length || 0} students enrolled
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Paper>

        <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <CalendarMonth color="primary" />
              <Typography variant="h6">Upcoming Schedule</Typography>
            </Box>

            {upcomingClasses.length === 0 ? (
              <Typography color="text.secondary">No upcoming classes scheduled.</Typography>
            ) : (
              <Box display="flex" flexDirection="column" gap={2}>
                {upcomingClasses.map((schedule) => (
                  <Card key={schedule.id} variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1">
                        {schedule.expand?.course?.title || 'Course'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(schedule.startTime).toLocaleString()}
                      </Typography>
                      {schedule.location && (
                        <Chip label={schedule.location} size="small" sx={{ mt: 1 }} />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Paper>
      </Box>
    </Box>
  );
}
