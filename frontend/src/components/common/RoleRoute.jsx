import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Loader from "./Loader";

const RoleRoute = ({ children, allowedRole }) => {
  const { role, loading } = useAuth();

  // 🔥 Wait until auth finishes loading
  if (loading) {
    return <Loader />;
  }

  if (!role) {
    return <Navigate to="/login" replace />;
  }

  if (role !== allowedRole) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default RoleRoute;