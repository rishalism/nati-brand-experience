import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@nati/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/features/auth/auth.api";
import AuthShell from "@/features/auth/AuthShell";

const ForgotPassword = () => {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  // Backend always responds success (no account enumeration); show the same
  // confirmation regardless.
  const onSubmit = async (values: ForgotPasswordInput) => {
    try {
      await authApi.forgotPassword(values.email);
    } finally {
      setSent(true);
    }
  };

  return (
    <AuthShell
      title="RESET PASSWORD"
      subtitle={sent ? undefined : "Enter your email and we'll send a reset link."}
      footer={
        <Link to="/login" className="text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      {sent ? (
        <p className="text-center text-muted-foreground">
          If an account exists for that email, a reset link is on its way.
        </p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...register("email")} />
            {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 font-heading tracking-wider rounded-none"
          >
            {isSubmitting ? "SENDING..." : "SEND RESET LINK"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
};

export default ForgotPassword;
