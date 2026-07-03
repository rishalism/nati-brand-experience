import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useAuthStore } from "./auth.store";

/**
 * Guest-friendly action gate. Browsing is public; anything that touches a
 * user-owned resource (cart, wishlist, checkout) goes through this. If the
 * visitor is authenticated the action runs; otherwise they're sent to /login
 * with the current path preserved so login bounces them straight back.
 */
export const useRequireAuth = () => {
  const authed = useAuthStore((s) => s.status === "authenticated");
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(
    (action: () => void) => {
      if (authed) {
        action();
        return;
      }
      toast({
        title: "Sign in to continue",
        description: "You need an account to do that. Browsing stays free.",
      });
      navigate("/login", { state: { from: location.pathname } });
    },
    [authed, navigate, location.pathname],
  );
};
