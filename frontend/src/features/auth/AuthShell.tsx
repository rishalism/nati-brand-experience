import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import NatiLogo from "@/components/NatiLogo";

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

/** Shared centered layout for the auth pages, preserving NATI branding. */
const AuthShell = ({ title, subtitle, children, footer }: AuthShellProps) => (
  <main className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-16">
    <Link to="/" className="mb-12 animate-fade-in">
      <NatiLogo className="h-20 md:h-24" />
    </Link>

    <div className="w-full max-w-md space-y-8 animate-fade-in" style={{ animationDelay: "150ms" }}>
      <div className="text-center space-y-2">
        <h1 className="font-heading text-2xl md:text-3xl tracking-wider text-foreground">{title}</h1>
        {subtitle && <p className="text-muted-foreground text-sm">{subtitle}</p>}
      </div>

      {children}

      {footer && <div className="text-center text-sm text-muted-foreground">{footer}</div>}
    </div>
  </main>
);

export default AuthShell;
