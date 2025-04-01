import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const isAuthenticated = localStorage.getItem("token");

  if (!isAuthenticated) {
    return <Navigate to="/" replace />; // Chuyển về trang login nếu chưa đăng nhập
  }

  return <Outlet />;
};

export default ProtectedRoute;
