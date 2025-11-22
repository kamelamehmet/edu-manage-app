import { useAuth } from '../auth/AuthProvider';
import AdminDashboard from '../features/dashboard/AdminDashboard';
import TeacherDashboard from '../features/dashboard/TeacherDashboard';
import StudentDashboard from '../features/dashboard/StudentDashboard';

export default function Dashboard() {
  const { user } = useAuth();

  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  if (user?.role === 'teacher') {
    return <TeacherDashboard />;
  }

  if (user?.role === 'student') {
    return <StudentDashboard />;
  }

  return <div>Invalid role</div>;
}
