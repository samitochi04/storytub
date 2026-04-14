import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Sparkles,
  Film,
  CreditCard,
  Mic,
  Bell,
  HelpCircle,
  Settings,
  User,
} from "lucide-react";
import { LogoIcon } from "@/components/shared/Logo";

const NAV_ITEMS = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/generate", icon: Sparkles, label: "Generate" },
  { to: "/videos", icon: Film, label: "Videos" },
  { to: "/billing", icon: CreditCard, label: "Billing" },
  { to: "/voices", icon: Mic, label: "Voices" },
  { to: "/notifications", icon: Bell, label: "Notifications" },
  { to: "/support", icon: HelpCircle, label: "Support" },
];

const BOTTOM_ITEMS = [
  { to: "/settings", icon: Settings, label: "Settings" },
  { to: "/profile", icon: User, label: "Profile" },
];

function SidebarLink({ to, icon, label }) {
  const Icon = icon;
  return (
    <NavLink
      to={to}
      title={label}
      className={({ isActive }) =>
        `flex items-center justify-center w-[32px] h-[32px] rounded-[var(--radius-md)] transition-all duration-150 ${
          isActive
            ? "bg-[var(--color-text-primary)] text-[var(--color-bg-page)]"
            : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]"
        }`
      }
    >
      <Icon size={18} strokeWidth={1.5} strokeLinecap="round" />
    </NavLink>
  );
}

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <aside className="hidden md:flex flex-col items-center w-[48px] min-h-screen border-r border-[var(--color-border-default)] bg-[var(--color-bg-card)] py-[var(--space-4)] gap-[var(--space-4)]">
      {/* Logo */}
      <button
        onClick={() => navigate("/dashboard")}
        className="mb-[var(--space-4)]"
        aria-label="Go to dashboard"
      >
        <LogoIcon size={28} />
      </button>

      {/* Main nav */}
      <nav className="flex flex-1 flex-col items-center gap-[var(--space-4)]">
        {NAV_ITEMS.map((item) => (
          <SidebarLink key={item.to} {...item} />
        ))}
      </nav>

      {/* Bottom nav */}
      <div className="flex flex-col items-center gap-[var(--space-4)]">
        {BOTTOM_ITEMS.map((item) => (
          <SidebarLink key={item.to} {...item} />
        ))}
      </div>
    </aside>
  );
}
