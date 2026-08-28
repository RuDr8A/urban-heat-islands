import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) return <div className="h-screen w-screen bg-black flex items-center justify-center text-emerald-500">Verifying...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
}