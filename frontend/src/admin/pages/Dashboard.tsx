/**
 * Admin dashboard placeholder. Real analytics (Recharts), KPI tiles, and
 * reports arrive in Phase 6; this establishes the guarded route + AdminLayout.
 */
const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl tracking-wider text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your store.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {["Revenue", "Orders", "Customers", "Products"].map((label) => (
          <div key={label} className="rounded-lg border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 font-heading text-2xl text-foreground">—</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
