import { NavLink } from "react-router-dom";
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

const MOBILE_ITEMS = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { to: "/generate", icon: Sparkles, label: "Create" },
  { to: "/videos", icon: Film, label: "Videos" },
  { to: "/billing", icon: CreditCard, label: "Billing" },
  { to: "/profile", icon: User, label: "Profile" },
];

export default function MobileTabBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-[var(--color-border-default)] bg-[var(--color-bg-card)] px-[var(--space-2)] py-[var(--space-2)] md:hidden">
      {MOBILE_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-[2px] text-[10px] transition-colors duration-150 ${
                isActive
                  ? "text-[var(--color-brand-blue)]"
                  : "text-[var(--color-text-tertiary)]"
              }`
            }
          >
            <Icon size={18} strokeWidth={1.5} strokeLinecap="round" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
