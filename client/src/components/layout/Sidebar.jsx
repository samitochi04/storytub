import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Sparkles,
  Film,
  CreditCard,
  Mic,
  HelpCircle,
  Settings,
  User,
} from "lucide-react";
import { LogoIcon } from "@/components/shared/Logo";
import CreditDisplay from "@/components/shared/CreditDisplay";
import NotificationBell from "@/components/shared/NotificationBell";
import { ThemeToggle } from "@/components/ui";

const NAV_ITEMS = [
  { to: "/dashboard", icon: LayoutDashboard, key: "sidebar.dashboard" },
  { to: "/generate", icon: Sparkles, key: "sidebar.generate" },
  { to: "/videos", icon: Film, key: "sidebar.videos" },
  { to: "/billing", icon: CreditCard, key: "sidebar.billing" },
  { to: "/voices", icon: Mic, key: "sidebar.voices" },
  { to: "/support", icon: HelpCircle, key: "sidebar.support" },
];

const BOTTOM_ITEMS = [
  { to: "/settings", icon: Settings, key: "sidebar.settings" },
  { to: "/profile", icon: User, key: "sidebar.profile" },
];

function SidebarLink({ to, icon, labelKey }) {
  const Icon = icon;
  const { t } = useTranslation();
  return (
    <NavLink
      to={to}
      title={t(labelKey)}
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
          <SidebarLink
            key={item.to}
            to={item.to}
            icon={item.icon}
            labelKey={item.key}
          />
        ))}
        <NotificationBell />
      </nav>

      {/* Bottom nav */}
      <div className="flex flex-col items-center gap-[var(--space-4)]">
        <CreditDisplay />
        <ThemeToggle />
        {BOTTOM_ITEMS.map((item) => (
          <SidebarLink
            key={item.to}
            to={item.to}
            icon={item.icon}
            labelKey={item.key}
          />
        ))}
      </div>
    </aside>
  );
}
