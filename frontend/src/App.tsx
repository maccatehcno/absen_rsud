import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { PublicLayout } from './components/layout/PublicLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { LandingPage } from './pages/public/LandingPage';
import { Dashboard } from './pages/admin/Dashboard';
import { Users } from './pages/admin/Users';
import { AdminAttendance } from './pages/admin/AdminAttendance';
import { Attendance } from './pages/Attendance';
import { AttendanceHistory } from './pages/AttendanceHistory';
import { LoginPage } from './pages/auth/LoginPage';
import { useAuth } from './lib/auth';
import './App.css';

function App() {
  const { authenticated, admin, defaultRoute } = useAuth();

  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors closeButton />
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/login"
            element={authenticated ? <Navigate to={defaultRoute} replace /> : <LoginPage />}
          />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/history" element={<AttendanceHistory />} />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            !authenticated
              ? <Navigate to="/login" replace />
              : !admin
                ? <Navigate to="/attendance" replace />
                : <AdminLayout />
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="attendance" element={<AdminAttendance />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
