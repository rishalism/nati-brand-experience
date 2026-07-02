import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/features/auth/auth.store";

/**
 * Gate for authenticated-only routes. Unauthenticated users are redirected to
 * /login with the attempted path preserved in state so login can bounce them
 * back. While auth status is still resolving (Phase 2 rehydration), render
 * nothing to avoid a redirect flash.
 */
const ProtectedRoute = () => {
  const status = useAuthStore((s) => s.status);
  const location = useLocation();

  if (status === "idle" || status === "loading") {
    return null;
  }

  if (status !== "authenticated") {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
