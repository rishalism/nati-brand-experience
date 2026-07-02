import { lazy, Suspense, type ReactElement, type ReactNode } from "react";
import { createBrowserRouter } from "react-router-dom";
import { ROLES } from "@nati/shared";
import CustomerLayout from "@/layouts/CustomerLayout";
import AdminLayout from "@/layouts/AdminLayout";
import RoleGuard from "@/routes/RoleGuard";

// Route-level code splitting: each page is its own chunk, loaded on demand.
const Index = lazy(() => import("@/customer/pages/Index"));
const Login = lazy(() => import("@/customer/pages/Login"));
const Shop = lazy(() => import("@/customer/pages/Shop"));
const ProductDetail = lazy(() => import("@/customer/pages/ProductDetail"));
const NotFound = lazy(() => import("@/customer/pages/NotFound"));
const AdminDashboard = lazy(() => import("@/admin/pages/Dashboard"));

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
    // Customer site. Public for now; auth wiring lands in Phase 2.
    element: <CustomerLayout />,
    children: [
      { path: "/", element: withSuspense(<Index />) },
      { path: "/login", element: withSuspense(<Login />) },
      { path: "/shop", element: withSuspense(<Shop />) },
      { path: "/product/:productId", element: withSuspense(<ProductDetail />) },
    ],
  },
  {
    // Admin area: role-gated, separate layout, same React app.
    path: "/admin",
    element: <RoleGuard allow={[ROLES.ADMIN, ROLES.SUPER_ADMIN]} />,
    children: [
      {
        element: <AdminLayout />,
        children: [{ index: true, element: withSuspense(<AdminDashboard />) }],
      },
    ],
  },
  { path: "*", element: withSuspense(<NotFound />) },
]);
