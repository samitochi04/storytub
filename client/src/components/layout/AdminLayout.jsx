import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import SEOHead from "./SEOHead";

export default function AdminLayout() {
  return (
    <>
      <SEOHead title="Admin" noindex />
      <div className="flex min-h-screen bg-[var(--color-bg-page)]">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto p-[var(--space-6)]">
          <Outlet />
        </main>
      </div>
    </>
  );
}
