import { Navigate } from 'react-router-dom';
import { useAuth, ROLE_ROUTES } from '../context/AuthContext';

export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, token, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Đang tải phiên làm việc...</div>;
  }

  // 1. Chưa đăng nhập -> chuyển về trang /auth
  if (!token || !user) {
    return <Navigate to="/auth" replace />;
  }

  // 2. Đăng nhập rồi nhưng sai Role -> đẩy về đúng trang Dashboard của Role đó
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const correctPath = ROLE_ROUTES[user.role] || '/client';
    return <Navigate to={correctPath} replace />;
  }

  // 3. Hợp lệ -> cho phép hiển thị giao diện
  return children;
}