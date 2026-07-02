import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { authApi } from "@/features/auth/auth.api";
import { getErrorMessage } from "@/services/api-client";
import AuthShell from "@/features/auth/AuthShell";

// Only the password is entered here; the token comes from the URL.
const formSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[a-z]/, "Must contain a lowercase letter")
    .regex(/[0-9]/, "Must contain a number"),
});
type FormValues = z.infer<typeof formSchema>;

const ResetPassword = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(formSchema) });

  const onSubmit = async (values: FormValues) => {
    try {
      await authApi.resetPassword(token, values.password);
      toast({ title: "Password reset", description: "You can now sign in." });
      navigate("/login", { replace: true });
    } catch (error) {
      toast({
        title: "Reset failed",
        description: getErrorMessage(error, "This link is invalid or expired."),
        variant: "destructive",
      });
    }
  };

  if (!token) {
    return (
      <AuthShell
        title="RESET PASSWORD"
        footer={
          <Link to="/forgot-password" className="text-primary hover:underline">
            Request a new link
          </Link>
        }
      >
        <p className="text-center text-muted-foreground">This reset link is missing or invalid.</p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="SET NEW PASSWORD" subtitle="Choose a strong password.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-destructive text-xs">{errors.password.message}</p>
          )}
        </div>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 font-heading tracking-wider rounded-none"
        >
          {isSubmitting ? "RESETTING..." : "RESET PASSWORD"}
        </Button>
      </form>
    </AuthShell>
  );
};

export default ResetPassword;
