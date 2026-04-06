import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRol?: "admin" | "ciudadano";
}

export function ProtectedRoute({ children, requiredRol }: ProtectedRouteProps) {
  const { isAuthenticated, usuario, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRol && usuario?.rol !== requiredRol) {
    return <Navigate to={usuario?.rol === "admin" ? "/" : "/portal"} replace />;
  }

  return <>{children}</>;
}
