import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useState, useEffect } from "react";

function ProtectedRoute() {

  const { user } = useAuth();

  const location = useLocation();

  const [hasCheckedUser, setHasCheckedUser] = useState(false);

  useEffect(() => {

    setHasCheckedUser(true);
  }, [user]);

  if (!hasCheckedUser) {
    return null;
  }

  if (!user) {

    const redirectPath = encodeURIComponent(
      location.pathname + (location.search || "")
    );
    return <Navigate to={`/login?redirect=${redirectPath}`} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
