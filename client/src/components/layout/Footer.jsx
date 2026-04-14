import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LogoMark } from "@/components/shared/Logo";

const FOOTER_LINKS = {
  product: [
    { to: "/features", key: "footer.features" },
    { to: "/pricing", key: "footer.pricing" },
    { to: "/blog", key: "footer.blog" },
  ],
  company: [
    { to: "/about", key: "footer.about" },
    { to: "/contact", key: "footer.contact" },
  ],
  legal: [
    { to: "/terms", key: "footer.terms" },
    { to: "/privacy", key: "footer.privacy" },
  ],
};

const SECTION_KEYS = {
  product: "footer.product",
  company: "footer.company",
  legal: "footer.legal",
};

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-[var(--color-border-default)] bg-[var(--color-bg-card)]">
      <div className="mx-auto max-w-[1200px] px-[var(--space-4)] py-[var(--space-12)] md:px-[var(--space-6)]">
        <div className="grid grid-cols-2 gap-[var(--space-8)] md:grid-cols-4">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-[var(--space-3)] mb-[var(--space-4)]">
              <LogoMark size={28} />
              <span
                className="text-[var(--color-text-primary)] tracking-tight select-none"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 300,
                  fontSize: 16,
                }}
              >
                StoryTub
              </span>
            </div>
            <p className="text-[12px] text-[var(--color-text-secondary)] leading-[1.6] max-w-[240px]">
              {t("footer.tagline")}
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h3 className="text-[12px] font-bold text-[var(--color-text-primary)] mb-[var(--space-4)]">
                {t(SECTION_KEYS[section])}
              </h3>
              <ul className="flex flex-col gap-[var(--space-3)]">
                {links.map(({ to, key }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="text-[12px] text-[var(--color-text-secondary)] transition-colors duration-150 hover:text-[var(--color-text-primary)]"
                    >
                      {t(key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-[var(--space-12)] pt-[var(--space-6)] border-t border-[var(--color-border-default)] flex flex-col items-center gap-[var(--space-2)] md:flex-row md:justify-between">
          <p className="text-[11px] text-[var(--color-text-tertiary)]">
            &copy; {new Date().getFullYear()} StoryTub. {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
