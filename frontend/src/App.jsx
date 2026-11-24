import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AuthPage from './pages/AuthPage';

import { AdminDashboard } from './pages/AdminDashboard';
import { ManagerDashboard } from './pages/ManagerDashboard';
import { MemberDashboard } from './pages/MemberDashboard';
import { ClientDashboard } from './pages/ClientDashboard';
import './App.css';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Trang Đăng nhập / Đăng ký */}
          <Route path="/auth" element={<AuthPage />} />

          {/* Route dành riêng cho Admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Route dành riêng cho Manager */}
          <Route
            path="/manager"
            element={
              <ProtectedRoute allowedRoles={['Manager']}>
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Route dành riêng cho Member */}
          <Route
            path="/member"
            element={
              <ProtectedRoute allowedRoles={['Member']}>
                <MemberDashboard />
              </ProtectedRoute>
            }
          />

          {/* Route dành riêng cho Client */}
          <Route
            path="/client"
            element={
              <ProtectedRoute allowedRoles={['Client']}>
                <ClientDashboard />
              </ProtectedRoute>
            }
          />

          {/* Mặc định chuyển hướng về /auth */}
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}