import { Outlet, ScrollRestoration } from "react-router-dom";

/**
 * Customer-facing shell. Intentionally thin for now: existing pages render
 * their own Header/Footer, so this only provides the routed <Outlet /> and
 * scroll restoration. A shared Header/Footer can be lifted here in a later
 * pass without changing the route tree.
 */
const CustomerLayout = () => {
  return (
    <>
      <Outlet />
      <ScrollRestoration />
    </>
  );
};

export default CustomerLayout;
