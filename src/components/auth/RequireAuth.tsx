import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

interface RequireAuthProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

const RequireAuth = ({ children, requireAdmin = false }: RequireAuthProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.user_metadata?.role === 'admin';

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
    
    if (!loading && requireAdmin && !isAdmin) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate, requireAdmin, isAdmin]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  if (requireAdmin && !isAdmin) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
};

export default RequireAuth;
