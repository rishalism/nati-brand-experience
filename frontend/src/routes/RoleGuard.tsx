import { Navigate, Outlet } from "react-router-dom";
import type { Role } from "@nati/shared";
import { useAuthStore } from "@/features/auth/auth.store";

interface RoleGuardProps {
  allow: Role[];
}

/**
 * Restricts a route subtree to the given roles. Layers on top of
 * ProtectedRoute: unauthenticated users go to /login; authenticated users
 * lacking a required role are sent home (a dedicated 403 page can replace this
 * later).
 */
const RoleGuard = ({ allow }: RoleGuardProps) => {
  const status = useAuthStore((s) => s.status);
  const hasRole = useAuthStore((s) => s.hasRole);

  if (status === "idle" || status === "loading") {
    return null;
  }

  if (status !== "authenticated") {
    return <Navigate to="/login" replace />;
  }

  if (!hasRole(allow)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default RoleGuard;
