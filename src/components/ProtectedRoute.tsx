import { useAuth } from "@/hooks/useAuth";
import { useLocalAuth } from "@/hooks/useLocalAuth";
import { useDatabase } from "@/hooks/useDatabase";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const { session, loading } = useAuth();
  const { user: localUser } = useLocalAuth();
  const { isLocal } = useDatabase();

  if (loading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  // Allow when using Local DB and local user exists
  if (isLocal && localUser) {
    return <Outlet />;
  }

  // Otherwise require Supabase session
  if (!session) {
    return <Navigate to="/auth/signin" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;