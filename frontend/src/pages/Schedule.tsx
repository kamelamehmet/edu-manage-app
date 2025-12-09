import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { Calendar, dayjsLocalizer } from 'react-big-calendar';
import type { Event, View } from 'react-big-calendar';
import dayjs from 'dayjs';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useAuth } from '../auth/AuthProvider';
import pb from '../api/pb';

const localizer = dayjsLocalizer(dayjs);

interface ScheduleRecord {
  id: string;
  course: string;
  startTime: string;
  endTime: string;
  location: string;
  expand?: {
    course?: {
      title: string;
    };
  };
}

interface Course {
  id: string;
  title: string;
}

interface CalendarEvent extends Event {
  id: string;
  location: string;
}

export default function Schedule() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<ScheduleRecord[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentView, setCurrentView] = useState<View>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [formData, setFormData] = useState({
    course: '',
    startTime: '',
    endTime: '',
    location: '',
  });

  const canEdit = user?.role === 'admin' || user?.role === 'teacher';

  useEffect(() => {
    fetchData();
  }, [user?.id, user?.role]);

  const fetchData = async () => {
    try {
      setLoading(true);
      let scheduleFilter = '';
      let courseFilter = '';

      if (user?.role === 'student') {
        const enrolledCourses = await pb.collection('courses').getFullList({
          filter: `students.id ?= "${user.id}"`,
        });
        const courseIds = enrolledCourses.map((c) => c.id);
        if (courseIds.length > 0) {
          scheduleFilter = courseIds.map((id) => `course="${id}"`).join(' || ');
        }
      } else if (user?.role === 'teacher') {
        courseFilter = `teacher="${user.id}"`;
        const teacherCourses = await pb.collection('courses').getFullList({ filter: courseFilter });
        const courseIds = teacherCourses.map((c) => c.id);
        if (courseIds.length > 0) {
          scheduleFilter = courseIds.map((id) => `course="${id}"`).join(' || ');
        }
      }

      const scheduleRecords = await pb.collection('schedule').getFullList({
        filter: scheduleFilter,
        expand: 'course',
      });

      setSchedules(scheduleRecords as any);

      if (canEdit) {
        const courseRecords = await pb.collection('courses').getFullList({
          filter: courseFilter,
        });
        setCourses(courseRecords as any);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    if (!canEdit) return;

    setFormData({
      course: '',
      startTime: dayjs(start).format('YYYY-MM-DDTHH:mm'),
      endTime: dayjs(end).format('YYYY-MM-DDTHH:mm'),
      location: '',
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setFormData({ course: '', startTime: '', endTime: '', location: '' });
  };

  const handleSave = async () => {
    try {
      // Convert datetime-local format to ISO 8601 format
      const dataToSave = {
        ...formData,
        startTime: dayjs(formData.startTime).toISOString(),
        endTime: dayjs(formData.endTime).toISOString(),
      };
      await pb.collection('schedule').create(dataToSave);
      handleCloseDialog();
      fetchData();
    } catch (error: any) {
      console.error('Failed to save schedule:', error);
      alert(error.message || 'Failed to save schedule');
    }
  };

  const events: CalendarEvent[] = schedules
    .filter((schedule) => {
      // Filter out schedules with invalid or empty date/time values
      return schedule.startTime && schedule.endTime &&
             !isNaN(new Date(schedule.startTime).getTime()) &&
             !isNaN(new Date(schedule.endTime).getTime());
    })
    .map((schedule) => ({
      id: schedule.id,
      title: schedule.expand?.course?.title || 'Course',
      start: new Date(schedule.startTime),
      end: new Date(schedule.endTime),
      location: schedule.location,
    }));

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
        <Typography variant="h4">Schedule</Typography>
      </Box>

      <Box
        sx={{
          height: 600,
          bgcolor: 'background.paper',
          p: 2,
          borderRadius: 1,
          '& .rbc-toolbar': {
            flexWrap: 'wrap',
            gap: 1,
            mb: 2,
          },
          '& .rbc-toolbar button': {
            color: 'primary.main',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            padding: '6px 12px',
            transition: 'all 0.2s',
            '&:hover': {
              backgroundColor: 'primary.main',
              color: 'white',
              borderColor: 'primary.main',
            },
            '&.rbc-active': {
              backgroundColor: 'primary.main',
              color: 'white',
              borderColor: 'primary.main',
            },
          },
          '& .rbc-event': {
            backgroundColor: 'primary.main',
          },
        }}
      >
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          selectable={canEdit}
          onSelectSlot={handleSelectSlot}
          style={{ height: '100%' }}
          views={['month', 'week', 'day']}
          view={currentView}
          date={currentDate}
          onView={(view) => setCurrentView(view)}
          onNavigate={(date) => setCurrentDate(date)}
        />
      </Box>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add Schedule</DialogTitle>
        <DialogContent>
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
            label="Start Time"
            type="datetime-local"
            fullWidth
            margin="normal"
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            required
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="End Time"
            type="datetime-local"
            fullWidth
            margin="normal"
            value={formData.endTime}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            required
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Location"
            fullWidth
            margin="normal"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={!formData.course || !formData.startTime || !formData.endTime}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
