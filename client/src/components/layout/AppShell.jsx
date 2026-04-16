import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import MobileTabBar from "./MobileTabBar";
import SEOHead from "./SEOHead";

export default function AppShell() {
  return (
    <>
      <SEOHead noindex />
      <div className="min-h-screen bg-[var(--color-bg-page)]">
        <Sidebar />
        <main className="md:ml-[60px] flex-1 overflow-y-auto pb-[72px] md:pb-0">
          <Outlet />
        </main>
        <MobileTabBar />
      </div>
    </>
  );
}
