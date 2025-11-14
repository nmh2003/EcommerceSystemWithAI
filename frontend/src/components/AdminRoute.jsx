import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "./Loader";

function AdminRoute() {

  const { user, loading, isAdmin } = useAuth();

  if (loading || user === null) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <Loader size="large" message="Đang kiểm tra quyền truy cập..." />
      </div>
    );
  }

  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default AdminRoute;
