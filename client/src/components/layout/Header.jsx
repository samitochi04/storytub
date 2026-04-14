import { Link, useLocation } from "react-router-dom";
import Logo from "@/components/shared/Logo";
import { Button } from "@/components/ui";

const NAV_LINKS = [
  { to: "/features", label: "Features" },
  { to: "/pricing", label: "Pricing" },
  { to: "/blog", label: "Blog" },
  { to: "/about", label: "About" },
];

export default function Header() {
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border-default)] bg-[var(--color-bg-card)]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-[56px] max-w-[1200px] items-center justify-between px-[var(--space-4)] md:px-[var(--space-6)]">
        {/* Logo */}
        <Link to="/" aria-label="StoryTub home">
          <Logo size={28} />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-[var(--space-6)] md:flex">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`text-[13px] font-normal transition-colors duration-150 ${
                pathname === to
                  ? "text-[var(--color-brand-blue)]"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Auth buttons */}
        <div className="flex items-center gap-[var(--space-3)]">
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Log in
            </Button>
          </Link>
          <Link to="/signup">
            <Button variant="primary" size="sm">
              Sign up
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
