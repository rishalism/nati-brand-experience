import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { authApi } from "@/features/auth/auth.api";
import AuthShell from "@/features/auth/AuthShell";

type Status = "verifying" | "success" | "error";

const VerifyEmail = () => {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [status, setStatus] = useState<Status>(token ? "verifying" : "error");
  const ran = useRef(false);

  useEffect(() => {
    if (!token || ran.current) return;
    ran.current = true; // guard against React 18 StrictMode double-invoke
    authApi
      .verifyEmail(token)
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [token]);

  const copy: Record<Status, { title: string; body: string }> = {
    verifying: { title: "VERIFYING", body: "Confirming your email…" },
    success: { title: "EMAIL VERIFIED", body: "Your account is now active." },
    error: { title: "VERIFICATION FAILED", body: "This link is invalid or has expired." },
  };

  return (
    <AuthShell
      title={copy[status].title}
      footer={
        <Link to="/login" className="text-primary hover:underline">
          Continue to sign in
        </Link>
      }
    >
      <p className="text-center text-muted-foreground">{copy[status].body}</p>
    </AuthShell>
  );
};

export default VerifyEmail;
