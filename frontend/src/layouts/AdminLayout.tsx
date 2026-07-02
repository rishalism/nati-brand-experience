import { Link, NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingCart, Users, Tag, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

// Admin navigation. Destinations are added as their features land (Phases 3-6);
// links point at the target routes now so the shell is stable.
const NAV_ITEMS = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/coupons", label: "Coupons", icon: Tag },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

/** Admin dashboard shell: persistent sidebar + routed content. Rendered only
 * behind RoleGuard(ADMIN/SUPER_ADMIN). */
const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <aside className="fixed inset-y-0 left-0 w-64 border-r border-border bg-card p-4">
          <Link to="/admin" className="mb-8 block px-2 font-heading text-xl tracking-wider">
            NATI <span className="text-primary">ADMIN</span>
          </Link>
          <nav className="space-y-1">
            {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="ml-64 flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
