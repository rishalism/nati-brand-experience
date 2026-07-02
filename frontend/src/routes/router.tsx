import { lazy, Suspense, type ReactElement, type ReactNode } from "react";
import { createBrowserRouter } from "react-router-dom";
import { ROLES } from "@nati/shared";
import CustomerLayout from "@/layouts/CustomerLayout";
import AdminLayout from "@/layouts/AdminLayout";
import RoleGuard from "@/routes/RoleGuard";
import ProtectedRoute from "@/routes/ProtectedRoute";

// Route-level code splitting: each page is its own chunk, loaded on demand.
const Index = lazy(() => import("@/customer/pages/Index"));
const Login = lazy(() => import("@/customer/pages/Login"));
const Register = lazy(() => import("@/customer/pages/Register"));
const VerifyEmail = lazy(() => import("@/customer/pages/VerifyEmail"));
const ForgotPassword = lazy(() => import("@/customer/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/customer/pages/ResetPassword"));
const Shop = lazy(() => import("@/customer/pages/Shop"));
const ProductDetail = lazy(() => import("@/customer/pages/ProductDetail"));
const NotFound = lazy(() => import("@/customer/pages/NotFound"));
const AdminDashboard = lazy(() => import("@/admin/pages/Dashboard"));
const AdminProducts = lazy(() => import("@/admin/pages/AdminProducts"));
const AdminCategories = lazy(() => import("@/admin/pages/AdminCategories"));
const AdminBrands = lazy(() => import("@/admin/pages/AdminBrands"));

const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
);

const withSuspense = (node: ReactNode): ReactElement => (
  <Suspense fallback={<PageLoader />}>{node}</Suspense>
);

export const router = createBrowserRouter([
  {
    element: <CustomerLayout />,
    children: [
      // Public marketing + auth pages.
      { path: "/", element: withSuspense(<Index />) },
      { path: "/login", element: withSuspense(<Login />) },
      { path: "/register", element: withSuspense(<Register />) },
      { path: "/verify-email", element: withSuspense(<VerifyEmail />) },
      { path: "/forgot-password", element: withSuspense(<ForgotPassword />) },
      { path: "/reset-password", element: withSuspense(<ResetPassword />) },
      // The drop is gated behind a real account (replaces the old password gate).
      {
        element: <ProtectedRoute />,
        children: [
          { path: "/shop", element: withSuspense(<Shop />) },
          { path: "/product/:productId", element: withSuspense(<ProductDetail />) },
        ],
      },
    ],
  },
  {
    // Admin area: role-gated, separate layout, same React app.
    path: "/admin",
    element: <RoleGuard allow={[ROLES.ADMIN, ROLES.SUPER_ADMIN]} />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: withSuspense(<AdminDashboard />) },
          { path: "products", element: withSuspense(<AdminProducts />) },
          { path: "categories", element: withSuspense(<AdminCategories />) },
          { path: "brands", element: withSuspense(<AdminBrands />) },
        ],
      },
    ],
  },
  { path: "*", element: withSuspense(<NotFound />) },
]);
